import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { exportAll, triggerDownload } from '../lib/export';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function ExportBar() {
  const photos = useStore((s) => s.photos);
  const addFiles = useStore((s) => s.addFiles);
  const clearAll = useStore((s) => s.clearAll);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsLoggedIn(Boolean(data.session?.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function onExport() {
    setBusy(true);
    try {
      const blob = await exportAll(photos);
      triggerDownload(blob, 'borderify-export.zip');
    } finally {
      setBusy(false);
    }
  }

  async function onAdd(e: ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list) return;
    await addFiles(Array.from(list).filter((f) => f.type.startsWith('image/')));
    e.target.value = '';
  }

  async function onLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
      return;
    }
    navigate('/login');
  }

  return (
    <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center rounded-md px-2 py-1 hover:bg-neutral-700/40 focus:outline-none"
          aria-label="Return to homepage"
        >
          <img src="/logo.png" alt="Borderify logo" style={{ width: 28, height: 28, marginRight: 10 }} />
          <span className="text-lg font-bold tracking-tight text-neutral-100">Borderify</span>
        </button>
        <span className="text-xs text-neutral-500">
          {photos.length} photo{photos.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
        >
          + Add photos
        </button>

        <button
          onClick={() => {
            if (confirm('Clear all photos?')) clearAll();
          }}
          className="rounded-md bg-red-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-red-400"
        >
          Clear all
        </button>

        {isLoggedIn && (
          <button
            onClick={() => {}}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm outline-none hover:bg-neutral-800 focus:outline-none focus-visible:outline-none active:outline-none"
          >
            Save
          </button>
        )}

        <button
          onClick={onExport}
          disabled={busy || photos.length === 0}
          className="rounded-md bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Exporting…' : 'Download all (.zip)'}
        </button>

        {isLoggedIn && (
          <button
            onClick={onLogout}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm outline-none hover:bg-neutral-800 focus:outline-none focus-visible:outline-none active:outline-none"
          >
            Log out
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={onAdd}
        />
      </div>
    </header>
  );
}
