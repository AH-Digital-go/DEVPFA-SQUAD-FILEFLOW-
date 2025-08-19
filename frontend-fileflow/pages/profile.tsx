'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import {
  User,
  Mail,
  Save,
  Camera,
  Edit3,
  Shield,
  Key,
  EyeOff,
  Eye,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { userService } from '@/services/userService';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const profileRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profileRef.current) {
      gsap.fromTo(
        profileRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }

    if (avatarRef.current) {
      gsap.fromTo(
        avatarRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, delay: 0.2, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      // Here you would typically make an API call to update the profile
      const updatedUser = await userService.updateUserProfile(formData);
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

    if (!passwordData.newPassword) {
      toast.error("Le mot de passe est requis");
      return;
    } else if (passwordData.newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    } else if (!passwordRegex.test(passwordData.newPassword)) {
      toast.error(
        "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial"
      );
      return;
    }


    try {
      await userService.updateUserProfile({
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword
      });
      // Here you would typically make an API call to change the password
      toast.success('Mot de passe changé avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe');
    }
  };

  const cancelEdit = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={profileRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mon Profil</h1>
        <p className="text-slate-600">Gérez vos informations personnelles et vos paramètres</p>
      </div>

      {/* Profile Card */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Avatar Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white relative">
          <motion.div
            ref={avatarRef}
            className="relative inline-block"
          >
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-2 right-2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <Camera className="w-5 h-5" />
            </motion.button>
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-blue-100">{user?.email}</p>
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-4 left-4 w-20 h-20 bg-indigo-400/20 rounded-full blur-xl" />
        </div>

        {/* Profile Form */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Informations personnelles</h3>
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Modifier</span>
              </motion.button>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cancelEdit}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveProfile}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Sauvegarder</span>
                </motion.button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Prénom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed transition-all duration-300"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Section */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Sécurité</h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Key className="w-4 h-4" />
              <span>{showPasswordForm ? 'Annuler' : 'Changer le mot de passe'}</span>
            </motion.button>
          </div>

          <motion.div
            initial={false}
            animate={{ height: showPasswordForm ? 'auto' : 0, opacity: showPasswordForm ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {showPasswordForm && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords(prev => ({ ...prev, current: !prev.current }))
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords(prev => ({ ...prev, new: !prev.new }))
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>


                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleChangePassword}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Changer le mot de passe
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;