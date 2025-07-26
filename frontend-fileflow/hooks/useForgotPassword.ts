// hooks/useForgotPassword.ts
'use client';

import { useState } from 'react';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendResetLink = async (email: string) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.info("Si l'email existe, un lien de réinitialisation a été envoyé.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi de l'email.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    setIsLoading(true);
    try {
      console.log("inside hook newpassword: ", password);
      console.log("inside hook newpassword: ", confirmPassword);
      await authService.resetPassword(token, password, confirmPassword);
      toast.success("Mot de passe réinitialisé avec succès.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Échec de la réinitialisation.");
    } finally {
      setIsLoading(false);
    }
  };

  return { sendResetLink, resetPassword, isLoading };
};
