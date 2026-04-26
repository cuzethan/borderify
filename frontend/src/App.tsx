import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { SignupPage } from './pages/SignupPage';
import { AppPage } from './pages/AppPage';
import { supabase } from './lib/supabase';
import { useStore } from './store';

export function App() {
  const login = useStore((s) => s.login);
  const logout = useStore((s) => s.logout);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) login(session.user.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        login(session.user.email);
      } else {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}