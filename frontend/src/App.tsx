import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store';
import { UploadScreen } from './components/UploadScreen';
import { EditorScreen } from './components/EditorScreen';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { SignupPage } from './pages/SignupPage';

function Editor() {
  const photos = useStore((s) => s.photos);
  return (
    <div className="h-full w-full">
      {photos.length === 0 ? <UploadScreen /> : <EditorScreen />}
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Editor />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}