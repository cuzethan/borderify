import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { SignupPage } from './pages/SignupPage';
import { AppPage } from './pages/AppPage';

export function App() {
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