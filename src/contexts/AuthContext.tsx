import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/types/supabase';

// Define a type for our custom user profile data
export type UserProfile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  profile: UserProfile | null; // User's profile from 'profiles' table
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, profileData: Database['public']['Tables']['profiles']['Insert']) => Promise<{ error: Error | null; session: Session | null }>;
  isTrainer: () => boolean;
  isStudent: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setData = async (currentSession: Session | null) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        if (currentSession.user) {
          // Fetch profile from 'profiles' table
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            toast({ title: "Erro ao buscar perfil", description: error.message, variant: "destructive" });
            // Potentially log out user if profile is critical and not found
            // await supabase.auth.signOut();
          } else {
            setProfile(userProfile as UserProfile);
          }
        } else {
          setProfile(null);
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      await setData(initialSession);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, currentSession: Session | null) => {
        await setData(currentSession);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Erro no login", description: error.message, variant: "destructive" });
    } else if (data.session) {
      toast({ title: "Login realizado com sucesso!", description: `Bem-vindo(a)!` });
    }
    setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, profileData: Database['public']['Tables']['profiles']['Insert']) => {
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      toast({ title: "Erro no registro", description: authError.message, variant: "destructive" });
      setLoading(false);
      return { error: authError, session: null };
    }

    if (!authData.user) {
        toast({ title: "Erro no registro", description: "Usuário não foi criado.", variant: "destructive" });
        setLoading(false);
        return { error: new Error("Usuário não foi criado."), session: null };
    }

    // Insert profile data, linking to the auth.users.id
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ ...profileData, id: authData.user.id, email: authData.user.email });

    if (profileError) {
      // This is a tricky situation. User is created in auth, but profile creation failed.
      // For simplicity now, just show error. In a real app, might need to handle this more robustly
      // (e.g., delete the auth user, or prompt user to complete profile later).
      toast({ title: "Erro ao salvar perfil", description: profileError.message, variant: "destructive" });
      // Potentially sign out the user if profile is critical
      // await supabase.auth.signOut();
      // setSession(null); setUser(null); setProfile(null);
      setLoading(false);
      return { error: profileError, session: authData.session };
    }

    // Manually set session and user here as onAuthStateChange might not fire immediately or as expected in some signUp flows
    // especially if email confirmation is required. For now, assume direct login after signup.
    setSession(authData.session);
    setUser(authData.user);
    // Fetch the newly created profile
    const { data: newProfile, error: newProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (newProfileError || !newProfile) {
        toast({ title: "Erro ao buscar perfil após registro", description: newProfileError?.message || "Perfil não encontrado.", variant: "destructive" });
    } else {
        setProfile(newProfile as UserProfile);
    }

    toast({ title: "Registro realizado com sucesso!", description: "Bem-vindo(a)!" });
    setLoading(false);
    return { error: null, session: authData.session };
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // state will be cleared by onAuthStateChange
    toast({ title: "Logout realizado", description: "Você foi desconectado com sucesso." });
    setLoading(false);
  };

  const isTrainer = () => profile?.user_type === 'trainer';
  const isStudent = () => profile?.user_type === 'student';

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
      login,
      logout,
      signUp,
      isTrainer,
      isStudent
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};