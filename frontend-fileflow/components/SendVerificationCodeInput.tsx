'use client';

import { motion } from 'framer-motion';

interface Props {
  email: string;
  codeSent: boolean;
  isSendingCode: boolean;
  code: string;
  setCode: (value: string) => void;
  onSendCode: () => void;
}

export const SendVerificationCodeInput = ({
  email,
  codeSent,
  isSendingCode,
  code,
  setCode,
  onSendCode,
}: Props) => {
  return (
    <>
      <motion.button
        type="button"
        onClick={onSendCode}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSendingCode}
        className="mt-2 w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-2 rounded-xl font-medium hover:from-indigo-600 hover:to-blue-700 transition disabled:opacity-50"
      >
        {isSendingCode ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        ) : (
          'Envoyer le code'
        )}
      </motion.button>

      {codeSent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Code de vérification
          </label>
          <div className="relative">
            <input
              type="text"
              name="verificationCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Entrez le code reçu"
            />
          </div>
        </motion.div>
      )}
    </>
  );
};
