import { supabase } from '@/lib/supabaseClient';
import { AuthError, User } from '@supabase/supabase-js';

const PROFILE_PICTURES_BUCKET = 'profile-pictures';

interface UploadAvatarResponse {
  avatarUrl?: string;
  error?: Error | AuthError | string ;
}

/**
 * Uploads a profile avatar for the given user.
 * @param user - The authenticated Supabase user object.
 * @param file - The image file to upload.
 * @returns An object containing the new avatar URL or an error.
 */
export async function uploadProfileAvatar(user: User, file: File): Promise<UploadAvatarResponse> {
  if (!user) {
    return { error: 'Usuário não autenticado.' };
  }
  if (!file) {
    return { error: 'Nenhum arquivo selecionado.' };
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `avatar.${fileExtension}`; // Consistent file name for the user's avatar
  const filePath = `${user.id}/${fileName}`; // Path like: public/uuid_do_usuario/avatar.png or uuid_do_usuario/avatar.png

  try {
    // 1. Upload do arquivo para o Supabase Storage
    // O { upsert: true } garante que se um avatar já existir, ele será substituído.
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(PROFILE_PICTURES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600', // Cache por 1 hora, ajuste conforme necessário
        upsert: true, // Sobrescreve o arquivo se já existir um com o mesmo nome/caminho
      });

    if (uploadError) {
      console.error('Erro no upload para Supabase Storage:', uploadError);
      return { error: uploadError };
    }

    if (!uploadData?.path) {
        console.error('Upload para Supabase Storage não retornou um caminho.');
        return { error: 'Falha ao obter caminho do arquivo após upload.' };
    }

    console.log('Upload bem-sucedido, caminho:', uploadData.path);

    // 2. Obter a URL pública do arquivo
    // Nota: A URL pública só funciona se o bucket for público ou se houver políticas RLS permitindo SELECT público.
    // Se o bucket for privado, você precisaria gerar uma signed URL.
    // Para avatares, URLs públicas são comuns.
    const { data: publicUrlData } = supabase.storage
      .from(PROFILE_PICTURES_BUCKET)
      .getPublicUrl(uploadData.path);

    if (!publicUrlData?.publicUrl) {
      console.error('Não foi possível obter a URL pública para o avatar.');
      return { error: 'Falha ao obter URL pública do avatar.' };
    }

    const newAvatarUrl = publicUrlData.publicUrl;
    console.log('URL Pública do Avatar:', newAvatarUrl);

    // 3. Atualizar a avatar_url na tabela 'profiles' do usuário
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', user.id);

    if (updateProfileError) {
      console.error('Erro ao atualizar avatar_url no perfil:', updateProfileError);
      // Tentar remover o arquivo recém-upado do storage se a atualização do perfil falhar?
      // await supabase.storage.from(PROFILE_PICTURES_BUCKET).remove([filePath]);
      return { error: updateProfileError };
    }

    return { avatarUrl: newAvatarUrl };

  } catch (error) {
    console.error('Exceção durante o upload do avatar:', error);
    return { error: error instanceof Error ? error.message : 'Erro desconhecido durante o upload.' };
  }
}

/**
 * Remove o avatar do perfil do usuário.
 * @param user - O objeto de usuário autenticado do Supabase.
 * @param currentAvatarPath - O caminho do avatar atual no storage (ex: 'uuid_do_usuario/avatar.png').
 *                            Se não souber o caminho, pode tentar remover e ignorar erro se não existir.
 */
export async function removeProfileAvatar(user: User, currentAvatarPath?: string): Promise<{ error?: Error | AuthError | string }> {
    if (!user) {
        return { error: 'Usuário não autenticado.' };
    }

    const filePath = currentAvatarPath || `${user.id}/avatar.png`; // Assumindo um nome de arquivo padrão se não fornecido

    try {
        // 1. Remover o arquivo do Supabase Storage
        const { error: removeStorageError } = await supabase.storage
            .from(PROFILE_PICTURES_BUCKET)
            .remove([filePath]); // `remove` espera um array de caminhos

        if (removeStorageError && removeStorageError.message !== 'The resource was not found') { // Ignora erro se o arquivo não existia
            console.error('Erro ao remover avatar do Storage:', removeStorageError);
            // Não necessariamente um erro fatal se o objetivo é limpar o perfil
        }

        // 2. Limpar a avatar_url na tabela 'profiles' do usuário
        const { error: updateProfileError } = await supabase
            .from('profiles')
            .update({ avatar_url: null })
            .eq('id', user.id);

        if (updateProfileError) {
            console.error('Erro ao limpar avatar_url no perfil:', updateProfileError);
            return { error: updateProfileError };
        }

        console.log('Avatar removido e perfil atualizado.');
        return {};

    } catch (error) {
        console.error('Exceção durante a remoção do avatar:', error);
        return { error: error instanceof Error ? error.message : 'Erro desconhecido durante a remoção.' };
    }
}
