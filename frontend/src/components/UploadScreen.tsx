import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

const ACCEPTED = ['image/png', 'image/jpeg'];

export function UploadScreen() {
  const addFiles = useStore((s) => s.addFiles);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).filter((f) => ACCEPTED.includes(f.type));
    if (files.length === 0) return;
    setBusy(true);
    try {
      await addFiles(files);
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setHover(false);
    void handleFiles(e.dataTransfer.files);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    void handleFiles(e.target.files);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-8">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          'flex w-full max-w-2xl cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center transition',
          hover ? 'border-emerald-400 bg-emerald-400/5' : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-500',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={() => window.location.href = '/'}
          className="mb-2 flex items-center text-4xl font-bold tracking-tight rounded-md px-2 py-1 hover:bg-neutral-700/40"
          aria-label="Return to homepage"
        >
            <img src="/logo.png" alt="Borderify logo" style={{ width: 34, height: 34, marginRight: 10 }} />
          <span>Borderify</span>
        </button>
        <p className="mb-8 max-w-md text-neutral-400">
          Drop your photos here to add Instagram-safe borders. No cropping, mixed orientations welcome.
        </p>
        <div className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-black">
          {busy ? 'Loading…' : 'Choose photos or drop here'}
        </div>
        <p className="mt-6 text-xs text-neutral-500">PNG or JPG, multiple files</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={onChange}
        />
      </div>
      <div className="mt-6 w-full flex justify-center">
        <div className="w-full max-w-2xl flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-neutral-800 px-6 py-3 text-sm font-normal text-white hover:bg-neutral-700"
            aria-label="Return to homepage"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
