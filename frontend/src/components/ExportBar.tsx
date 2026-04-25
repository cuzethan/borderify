import { useRef, useState, type ChangeEvent } from 'react';
import { useStore } from '../store';
import { exportAll, triggerDownload } from '../lib/export';

export function ExportBar() {
  const photos = useStore((s) => s.photos);
  const addFiles = useStore((s) => s.addFiles);
  const clearAll = useStore((s) => s.clearAll);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

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

  return (
    <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-bold tracking-tight">Borderify</h1>
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
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
        >
          Clear all
        </button>
        <button
          onClick={onExport}
          disabled={busy || photos.length === 0}
          className="rounded-md bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Exporting…' : 'Download all (.zip)'}
        </button>
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
