'use client';

import { useState } from 'react';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const { sendResetLink, isLoading } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendResetLink(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-full max-w-md border border-blue-100"
      >
        {/* Logo mail en haut */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Mail className="text-white w-6 h-6" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Mot de passe oublié
        </h2>

        <div className="relative mb-4">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300"
        >
          {isLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
