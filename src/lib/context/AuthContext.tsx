import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  Auth,
  User,
  UserCredential,
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { app } from "@/lib/firebase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth: Auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer login";
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer logout";
      toast.error(errorMessage);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) {
      throw new Error("Usuário não autenticado");
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success("Senha alterada com sucesso!");
    } catch (error) {
      let errorMessage = "Erro ao alterar a senha";
      if (error instanceof Error) {
        if (error.message.includes("auth/wrong-password")) {
          errorMessage = "Senha atual incorreta";
        } else if (error.message.includes("auth/weak-password")) {
          errorMessage = "A nova senha deve ter pelo menos 6 caracteres";
        }
      }
      toast.error(errorMessage);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
