import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { EditorScreen } from '../components/EditorScreen';
import { UploadScreen } from '../components/UploadScreen';
import { useStore, type SavedPhoto } from '../store';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export function AppPage() {
  const photos = useStore((s) => s.photos);
  const loadSavedSession = useStore((s) => s.loadSavedSession);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  useEffect(() => {
    if (hasCheckedSession) return;
    let cancelled = false;

    async function maybeLoadSession() {
      try {
        if (photos.length > 0) return;
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const response = await fetch(`${apiBaseUrl}/photos/sessions/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          console.error('Failed to check latest session', await response.text());
          return;
        }

        const data = (await response.json()) as {
          session: { photos?: SavedPhoto[] } | null;
        };
        const saved = data.session?.photos ?? [];
        if (saved.length === 0 || cancelled) return;
        await loadSavedSession(saved);
      } catch (error) {
        console.error('Failed to restore saved session', error);
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
          setHasCheckedSession(true);
        }
      }
    }

    void maybeLoadSession();
    return () => {
      cancelled = true;
    };
  }, [hasCheckedSession, photos.length, loadSavedSession]);

  if (checkingSession) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
        Checking for saved session...
      </div>
    );
  }

  return <div className="h-full w-full">{photos.length === 0 ? <UploadScreen /> : <EditorScreen />}</div>;
}