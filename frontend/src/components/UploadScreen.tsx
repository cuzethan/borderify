import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { useStore } from '../store';

const ACCEPTED = ['image/png', 'image/jpeg'];

export function UploadScreen() {
  const addFiles = useStore((s) => s.addFiles);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [busy, setBusy] = useState(false);

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
    <div className="flex h-full w-full items-center justify-center p-8">
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
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Borderify</h1>
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
    </div>
  );
}
