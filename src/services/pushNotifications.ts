// src/services/pushNotifications.ts

import { supabase } from '@/lib/supabaseClient'; // Para interagir com a Edge Function depois

// TODO: Armazene sua VAPID Public Key de forma segura, idealmente via variáveis de ambiente
// Exemplo: const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
// Por agora, usaremos um placeholder. Substitua pela sua chave real.
const VAPID_PUBLIC_KEY_PLACEHOLDER = 'REPLACE_WITH_YOUR_ACTUAL_VAPID_PUBLIC_KEY';
// Em um projeto real, você geraria isso com `npx web-push generate-vapid-keys` ou similar

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerForPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported by this browser.');
    alert('Seu navegador não suporta notificações push.');
    return null;
  }

  try {
    const swRegistration = await navigator.serviceWorker.ready;
    console.log('Service Worker pronto para Push:', swRegistration);

    let subscription = await swRegistration.pushManager.getSubscription();
    if (subscription) {
      console.log('Usuário JÁ está inscrito:', subscription);
      // Opcional: verificar se a subscrição ainda é válida ou reenviar para o backend
      // await sendSubscriptionToBackend(subscription); // Pode ser útil para atualizar o 'last_seen' da subscrição
      alert('Você já está inscrito para notificações.');
      return subscription;
    }

    const permissionState = await Notification.requestPermission();
    if (permissionState !== 'granted') {
      console.warn('Permissão para notificações não concedida.');
      alert('Permissão para notificações não foi concedida. Algumas funcionalidades podem estar indisponíveis.');
      return null;
    }

    // Obter a VAPID public key das variáveis de ambiente
    const vapidPublicKeyFromEnv = import.meta.env.VITE_VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY_PLACEHOLDER;
    if (!vapidPublicKeyFromEnv || vapidPublicKeyFromEnv === 'REPLACE_WITH_YOUR_ACTUAL_VAPID_PUBLIC_KEY') {
        console.error('Chave VAPID pública não configurada! Por favor, defina VITE_VAPID_PUBLIC_KEY no seu arquivo .env');
        alert('Erro de configuração do aplicativo: Chave VAPID para notificações não encontrada.');
        return null;
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKeyFromEnv);
    subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true, // Requerido pela maioria dos serviços de push
      applicationServerKey: applicationServerKey,
    });

    console.log('Nova PushSubscription obtida:', subscription);

    // Enviar a subscrição para o backend (Supabase Edge Function)
    await sendSubscriptionToBackend(subscription);
    alert('Inscrito para notificações com sucesso!');
    return subscription;

  } catch (error) {
    console.error('Falha ao se inscrever para notificações push:', error);
    alert(`Falha ao se inscrever para notificações: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function sendSubscriptionToBackend(subscription: PushSubscription) {
  // TODO: Implementar a chamada para a Supabase Edge Function que armazena a subscrição.
  // Esta função deve ser criada no seu projeto Supabase.
  // Exemplo de como poderia ser:
  /*
  const { error } = await supabase.functions.invoke('store-push-subscription', {
    body: { subscription_object: subscription.toJSON() }, // Envie o objeto de subscrição
  });

  if (error) {
    console.error('Erro ao enviar subscrição para o backend:', error);
    // Não lance erro aqui para não quebrar o fluxo de inscrição, mas logue e talvez tente novamente depois.
    // Em um cenário real, pode haver uma lógica de retry ou feedback mais específico ao usuário.
    alert('Houve um problema ao salvar sua inscrição para notificações no servidor. Tente novamente mais tarde.');
    // return; // ou throw new Error('Falha ao salvar subscrição no servidor.');
  } else {
    console.log('Subscrição enviada para o backend com sucesso.');
  }
  */
  console.log('Simulando envio da subscrição para o backend:', JSON.stringify(subscription.toJSON()));
  // Por enquanto, apenas logamos. Em um projeto real, esta função faria uma chamada HTTP.
}

export async function clearAppBadge() {
  if (navigator.clearAppBadge) {
    try {
      await navigator.clearAppBadge();
      console.log('App badge cleared.');
      // Também seria necessário resetar o unreadCount no Service Worker,
      // o que requer comunicação do cliente para o SW (ex: via postMessage),
      // ou o SW resetar ao ser ativado se o app estiver aberto.
      // Para este exemplo, a lógica de reset do unreadCount no SW não está implementada.
    } catch (error) {
      console.error('Failed to clear app badge:', error);
    }
  } else {
    console.warn('navigator.clearAppBadge is not supported by this browser.');
  }
}

export async function unregisterForPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported by this browser.');
        return;
    }
    try {
        const swRegistration = await navigator.serviceWorker.ready;
        const subscription = await swRegistration.pushManager.getSubscription();
        if (subscription) {
            const successful = await subscription.unsubscribe();
            if (successful) {
                console.log('Unsubscribed successfully.');
                // TODO: Notificar o backend para remover a subscrição do banco de dados.
                // Exemplo: await supabase.functions.invoke('remove-push-subscription', { body: { endpoint: subscription.endpoint } });
                alert('Inscrição para notificações removida com sucesso.');
            } else {
                console.error('Failed to unsubscribe.');
                alert('Falha ao tentar remover inscrição para notificações.');
            }
        } else {
            console.log('Nenhuma inscrição ativa encontrada para remover.');
            alert('Você não estava inscrito para notificações.');
        }
    } catch (error) {
        console.error('Error unsubscribing for push notifications:', error);
        alert(`Erro ao remover inscrição para notificações: ${error instanceof Error ? error.message : String(error)}`);
    }
}
