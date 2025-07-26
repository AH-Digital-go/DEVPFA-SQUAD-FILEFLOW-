import { useState } from 'react';
import { toast } from 'react-toastify';
import { authService } from '@/services/authService';

export function useVerificationCode() {
  const [codeSent, setCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState('');

  const sendCode = async (email: string) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Veuillez entrer un email valide.');
      return;
    }
    setIsSendingCode(true);
    try {
      await authService.sendVerificationCode(email);
      setCodeSent(true);
      toast.success('Si l\'adresse est valide, vous recevrez un code de vérification.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l’envoi du code.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyCode = async (email: string, codeToCheck: string) => {
    if (!codeToCheck) {
      toast.error('Veuillez entrer le code de vérification.');
      return false;
    }
    setIsVerifying(true);
    try {
      const valid = await authService.verifyCode(email, codeToCheck);
      if (!valid) {
        toast.error('Code de vérification invalide.');
        return false;
      }
      toast.success('Code vérifié avec succès !');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la vérification du code.');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    codeSent,
    isSendingCode,
    isVerifying,
    code,
    setCode,
    sendCode,
    verifyCode,
  };
}
