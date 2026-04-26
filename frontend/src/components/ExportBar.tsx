import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { exportAll, triggerDownload } from '../lib/export';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

interface PreparedUpload {
  blob: Blob;
  fileName: string;
}

async function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode jpeg'));
      },
      'image/jpeg',
      quality,
    );
  });
}

async function prepareImageForUpload(
  bitmap: ImageBitmap,
  originalFileName: string,
  maxBytes = 10 * 1024 * 1024,
): Promise<PreparedUpload> {
  const canvas = document.createElement('canvas');
  let width = bitmap.width;
  let height = bitmap.height;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to create canvas context');

  const stem = originalFileName.replace(/\.[^.]+$/, '');
  const uploadName = `${stem}.jpg`;

  for (let scaleStep = 0; scaleStep < 6; scaleStep += 1) {
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5, 0.4]) {
      const blob = await canvasToJpegBlob(canvas, quality);
      if (blob.size <= maxBytes) {
        return { blob, fileName: uploadName };
      }
    }

    width *= 0.85;
    height *= 0.85;
  }

  const fallbackBlob = await canvasToJpegBlob(canvas, 0.35);
  return { blob: fallbackBlob, fileName: uploadName };
}

interface CloudinaryUploadResult {
  imageUrl: string;
  cloudinaryPublicId: string;
  cloudinary: {
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
}

async function uploadPreparedImageViaBackend(
  prepared: PreparedUpload,
  publicId: string,
): Promise<CloudinaryUploadResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Missing auth session');

  const formData = new FormData();
  formData.append('file', prepared.blob, prepared.fileName);
  formData.append('public_id', publicId);

  const response = await fetch(`${apiBaseUrl}/photos/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Backend upload failed (${response.status}): ${body}`);
  }

  return (await response.json()) as CloudinaryUploadResult;
}

async function resetUserFolderViaBackend(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Missing auth session');

  const response = await fetch(`${apiBaseUrl}/photos/reset-folder`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Folder reset failed (${response.status}): ${body}`);
  }
}

async function saveSessionViaBackend(payload: unknown): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Missing auth session');

  const response = await fetch(`${apiBaseUrl}/photos/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Session save failed (${response.status}): ${body}`);
  }
}

export function ExportBar() {
  const photos = useStore((s) => s.photos);
  const addFiles = useStore((s) => s.addFiles);
  const clearAll = useStore((s) => s.clearAll);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
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

  async function onSave() {
    if (photos.length === 0) return;
    if (!apiBaseUrl) {
      alert('Backend API is not configured. Add VITE_API_BASE_URL to frontend/.env');
      return;
    }
    setIsSaving(true);
    try {
      setSaveStatus('Clearing previous saved photos...');
      await resetUserFolderViaBackend();

      const savedPhotos = [];
      for (let i = 0; i < photos.length; i += 1) {
        const photo = photos[i];
        setSaveStatus(`Compressing photo ${i + 1}/${photos.length}...`);
        const prepared = await prepareImageForUpload(photo.bitmap, photo.fileName);
        setSaveStatus(`Saving photo ${i + 1}/${photos.length}...`);
        const publicId = `${photo.id}_${Date.now()}_${i + 1}`;
        const uploaded = await uploadPreparedImageViaBackend(prepared, publicId);
        savedPhotos.push({
          id: photo.id,
          fileName: photo.fileName,
          naturalW: photo.naturalW,
          naturalH: photo.naturalH,
          preset: photo.preset,
          border: photo.border,
          offsetX: photo.offsetX,
          offsetY: photo.offsetY,
          scale: photo.scale,
          crop: photo.crop,
          splitOf: photo.splitOf ?? null,
          imageUrl: uploaded.imageUrl,
          cloudinaryPublicId: uploaded.cloudinaryPublicId,
          cloudinary: uploaded.cloudinary,
        });
      }

      const payload = {
        version: 1,
        savedAt: new Date().toISOString(),
        imageStorage: 'cloudinary-via-backend',
        photos: savedPhotos,
      };
      console.log('Saved session payload:', payload);
      setSaveStatus('Persisting session...');
      await saveSessionViaBackend(payload);
    } catch (error) {
      console.error(error);
      alert('Failed to save session. Check backend auth/Cloudinary config and try again.');
    } finally {
      setSaveStatus(null);
      setIsSaving(false);
    }
  }

  async function onExport() {
    setIsExporting(true);
    try {
      const blob = await exportAll(photos);
      triggerDownload(blob, 'borderify-export.zip');
    } finally {
      setIsExporting(false);
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
            onClick={() => navigate('/')}
            className="flex items-center rounded-md px-2 py-1 transition-colors hover:bg-neutral-700/50"
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
            onClick={onSave}
            disabled={isSaving || isExporting || photos.length === 0}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm outline-none hover:bg-neutral-800 focus:outline-none focus-visible:outline-none active:outline-none"
          >
            {isSaving ? saveStatus ?? 'Saving...' : 'Save'}
          </button>
        )}

        <button
          onClick={onExport}
          disabled={isExporting || isSaving || photos.length === 0}
          className="rounded-md bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? 'Exporting…' : 'Download all (.zip)'}
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
