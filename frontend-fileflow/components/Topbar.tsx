'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Settings,
  Moon,
  Sun,
  Filter,
} from 'lucide-react';
import { useFileStore } from '../store/fileStore';
import { NotificationsDropdown } from './NotificationsDropdown';
import { useAuthStore } from '@/store/authStore';
import { connectWebSocket, disconnectWebSocket, stompClient } from '@/utils/WebSocket';

const Topbar = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { searchQuery, setSearchQuery, viewMode, setViewMode } = useFileStore();
  const searchRef = useRef<HTMLDivElement>(null);
  const topbarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user,isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (topbarRef.current) {
      gsap.fromTo(
        topbarRef.current,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  // useEffect(()=>{
  //   if(isAuthenticated){
  //     connectWebSocket((msg: any) => {
  //       console.log('[Message Received]:', msg);
  //     });
  //   }
  //   else{
  //     disconnectWebSocket();
  //   }
  // },[isAuthenticated])

  
  useEffect(() => {
    if (searchRef.current) {
      const scale = searchFocused ? 1.02 : 1;
      gsap.to(searchRef.current, {
        scale,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [searchFocused]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  return (
    <motion.div
      ref={topbarRef}
      className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex items-center flex-1 max-w-2xl">
          <div
            ref={searchRef}
            className={`relative flex items-center w-full transition-all duration-300 ${searchFocused ? 'shadow-lg' : 'shadow-sm'
              }`}
          >
            <Search className={`absolute left-4 w-5 h-5 transition-colors duration-300 ${searchFocused ? 'text-blue-500' : 'text-slate-400'
              }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Rechercher des fichiers..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ×
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-4 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors duration-300"
          >
            <Filter className="w-5 h-5 text-slate-600" />
          </motion.button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors duration-300"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </motion.button>

          {/* Notifications */}
          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors duration-300"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </motion.button> */}
          <NotificationsDropdown userId={Number(user?.id)}/>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSettingsClick}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors duration-300"
          >
            <Settings className="w-5 h-5 text-slate-600" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Topbar;