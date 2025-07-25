'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Sun,
  Globe,
  HardDrive,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-toastify';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      fileUploaded: true,
      fileShared: true,
      storageAlert: true,
    },
    appearance: {
      darkMode: false,
      language: 'fr',
      theme: 'blue',
    },
    privacy: {
      publicProfile: false,
      dataCollection: true,
      analyticsOptIn: false,
    },
    storage: {
      autoDelete: false,
      compressUploads: true,
      syncEnabled: true,
    },
  });

  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settingsRef.current) {
      gsap.fromTo(
        settingsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, []);

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));
    toast.success('Paramètre mis à jour');
  };

  const exportData = async () => {
    try {
      // Here you would typically make an API call to export user data
      toast.success('Export des données démarré');
    } catch (error) {
      toast.error('Erreur lors de l\'export des données');
    }
  };

  const deleteAccount = async () => {
    const confirmed = confirm(
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.'
    );
    
    if (confirmed) {
      try {
        // Here you would typically make an API call to delete the account
        toast.success('Demande de suppression de compte envoyée');
      } catch (error) {
        toast.error('Erreur lors de la suppression du compte');
      }
    }
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-slate-300'
      }`}
    >
      <motion.span
        animate={{ x: checked ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
      />
    </motion.button>
  );

  const settingSections = [
    {
      title: 'Notifications',
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      settings: [
        { 
          key: 'email', 
          label: 'Notifications par email', 
          description: 'Recevoir des notifications par email',
          value: settings.notifications.email 
        },
        { 
          key: 'push', 
          label: 'Notifications push', 
          description: 'Recevoir des notifications dans le navigateur',
          value: settings.notifications.push 
        },
        { 
          key: 'fileUploaded', 
          label: 'Fichier téléversé', 
          description: 'Notification quand un fichier est téléversé',
          value: settings.notifications.fileUploaded 
        },
        { 
          key: 'fileShared', 
          label: 'Fichier partagé', 
          description: 'Notification quand un fichier est partagé',
          value: settings.notifications.fileShared 
        },
        { 
          key: 'storageAlert', 
          label: 'Alerte de stockage', 
          description: 'Notification quand l\'espace de stockage est plein',
          value: settings.notifications.storageAlert 
        },
      ]
    },
    {
      title: 'Apparence',
      icon: settings.appearance.darkMode ? Moon : Sun,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      settings: [
        { 
          key: 'darkMode', 
          label: 'Mode sombre', 
          description: 'Utiliser le thème sombre',
          value: settings.appearance.darkMode 
        },
      ]
    },
    {
      title: 'Confidentialité',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      settings: [
        { 
          key: 'publicProfile', 
          label: 'Profil public', 
          description: 'Rendre votre profil visible publiquement',
          value: settings.privacy.publicProfile 
        },
        { 
          key: 'dataCollection', 
          label: 'Collecte de données', 
          description: 'Autoriser la collecte de données d\'utilisation',
          value: settings.privacy.dataCollection 
        },
        { 
          key: 'analyticsOptIn', 
          label: 'Analyses', 
          description: 'Participer aux analyses d\'amélioration du service',
          value: settings.privacy.analyticsOptIn 
        },
      ]
    },
    {
      title: 'Stockage',
      icon: HardDrive,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      settings: [
        { 
          key: 'autoDelete', 
          label: 'Suppression automatique', 
          description: 'Supprimer les anciens fichiers automatiquement',
          value: settings.storage.autoDelete 
        },
        { 
          key: 'compressUploads', 
          label: 'Compression', 
          description: 'Compresser les fichiers lors du téléversement',
          value: settings.storage.compressUploads 
        },
        { 
          key: 'syncEnabled', 
          label: 'Synchronisation', 
          description: 'Synchroniser les fichiers sur tous les appareils',
          value: settings.storage.syncEnabled 
        },
      ]
    },
  ];

  return (
    <motion.div
      ref={settingsRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-slate-50 rounded-xl">
          <SettingsIcon className="w-8 h-8 text-slate-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
          <p className="text-slate-600 mt-1">Configurez vos préférences et paramètres</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {settingSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${section.bgColor}`}>
                    <Icon className={`w-5 h-5 ${section.color}`} />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {section.settings.map((setting, settingIndex) => (
                  <motion.div
                    key={setting.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sectionIndex * 0.1) + (settingIndex * 0.05) }}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{setting.label}</h3>
                      <p className="text-sm text-slate-500 mt-1">{setting.description}</p>
                    </div>
                    
                    <ToggleSwitch
                      checked={setting.value}
                      onChange={() => handleSettingChange(
                        section.title.toLowerCase(), 
                        setting.key, 
                        !setting.value
                      )}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Language & Region */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Globe className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Langue & Région</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Langue
              </label>
              <select
                value={settings.appearance.language}
                onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Thème de couleur
              </label>
              <select
                value={settings.appearance.theme}
                onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="blue">Bleu</option>
                <option value="indigo">Indigo</option>
                <option value="purple">Violet</option>
                <option value="green">Vert</option>
                <option value="red">Rouge</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Download className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Gestion des données</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium text-slate-900">Exporter mes données</h3>
              <p className="text-sm text-slate-500 mt-1">
                Télécharger une archive de toutes vos données
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportData}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Exporter
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden"
      >
        <div className="p-6 border-b border-red-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-900">Zone de danger</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium text-red-900">Supprimer mon compte</h3>
              <p className="text-sm text-red-600 mt-1">
                Supprimer définitivement votre compte et toutes vos données. Cette action est irréversible.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={deleteAccount}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;