import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import '../styles/globals.css';

const publicRoutes = ['/', '/login', '/register', '/404', '/forget-password', '/reset-password'];

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const handleRouteChange = () => {
      const isPublicRoute = publicRoutes.includes(router.pathname);
      
      if (!isLoading) {
        if (!isAuthenticated && !isPublicRoute) {
          router.push('/login');
        } else if (isAuthenticated && (router.pathname === '/' || router.pathname === '/login' || router.pathname === '/register')) {
          router.push('/dashboard');
        }
      }
    };

    handleRouteChange();
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Layout>
        <AnimatePresence mode="wait">
          <Component key={router.asPath} {...pageProps} />
        </AnimatePresence>
      </Layout>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default MyApp;