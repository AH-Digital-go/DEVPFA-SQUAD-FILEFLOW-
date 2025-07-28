import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService, refreshAccessToken } from '../services/authService';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading, login, logout, setLoading, setRedirecting } = useAuthStore();

  useEffect(() => {
    // Check token validity on mount
    if (accessToken && !isAuthenticated) {
      checkTokenValidity();
    }
  }, [accessToken, isAuthenticated]);

  const checkTokenValidity = async () => {
  try {
    setLoading(true);
    if (accessToken) {
      const newToken = await refreshAccessToken();
      const currentUser = useAuthStore.getState().user; // depuis localStorage
      if (currentUser) {
        login(currentUser, newToken);
      } else {
        logout(); // au cas où le user a disparu du localStorage
      }
    }
  } catch (error) {
    console.error('Token validation failed:', error);
    logout();
  } finally {
    setLoading(false);
  }
};

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      login(response.user, response.accessToken);
      toast.success('Connexion réussie !');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur de connexion';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData: {
    email: string;
    password: string;
    confirmPassword: string
    firstName: string;
    lastName: string;
  }) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      login(response.user, response.accessToken);
      toast.success('Inscription réussie !');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur d\'inscription';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (accessToken) {
        setRedirecting(false);
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      toast.success('Déconnexion réussie');
      router.push('/login');
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
};