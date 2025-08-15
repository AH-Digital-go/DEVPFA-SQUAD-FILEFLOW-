'use client';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import {
  LayoutDashboard,
  Files,
  Upload,
  Heart,
  Settings,
  User,
  Menu,
  X,
  LogOut,
  Share,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/files', icon: Files, label: 'Mes fichiers' },
  { href: '/files/upload', icon: Upload, label: 'Téléverser' },
  { href: '/favourites', icon: Heart, label: 'Favoris' },
  { href: '/share', icon: Share, label: 'Partages' },
  { href: '/profile', icon: User, label: 'Profil' },
  { href: '/settings', icon: Settings, label: 'Paramètres' },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { x: -280, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }

    // Stagger animation for menu items
    gsap.fromTo(
      menuItemsRef.current,
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.3,
        ease: 'power2.out',
      }
    );
  }, []);

  const toggleSidebar = () => {
    if (sidebarRef.current) {
      if (isCollapsed) {
        gsap.to(sidebarRef.current, {
          width: 280,
          duration: 0.4,
          ease: 'power2.out',
        });
      } else {
        gsap.to(sidebarRef.current, {
          width: 80,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    }
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

  return (
    <motion.div
      ref={sidebarRef}
      className="bg-slate-900 text-white w-70 flex flex-col shadow-xl relative"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onClick={handleLogoClick}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Files className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  FileFlow
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Logo collapsed state - clickable icon */}
          <AnimatePresence>
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onClick={handleLogoClick}
              >
                <Files className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors duration-200"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <div
              key={item.href}
              ref={(el) => (menuItemsRef.current[index] = el as HTMLDivElement)}
            >
              <Link
                href={item.href}
                className={`group flex items-center p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:scale-110'} transition-transform duration-200`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-3 font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <AnimatePresence>
          {!isCollapsed && user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={handleLogout}
          className={`group flex items-center w-full p-3 mt-3 rounded-xl hover:bg-red-600 text-slate-300 hover:text-white transition-all duration-300 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 font-medium"
              >
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;