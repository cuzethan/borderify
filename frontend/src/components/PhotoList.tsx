import { useEffect, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { useStore } from '../store';
import type { PhotoConfig } from '../types';
import { renderPhotoToCanvas } from '../lib/render';

const ACCEPTED = ['image/png', 'image/jpeg'];

export function PhotoList() {
  const photos = useStore((s) => s.photos);
  const addFiles = useStore((s) => s.addFiles);
  const selectedId = useStore((s) => s.selectedId);
  const selectPhoto = useStore((s) => s.selectPhoto);
  const removePhoto = useStore((s) => s.removePhoto);
  const reorder = useStore((s) => s.reorder);

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).filter((f) => ACCEPTED.includes(f.type));
    if (files.length === 0) return;
    await addFiles(files);
  }

  function onPaneChange(e: ChangeEvent<HTMLInputElement>) {
    void handleFiles(e.target.files);
    e.target.value = '';
  }

  function isFileDrag(e: DragEvent) {
    return e.dataTransfer.types.includes('Files');
  }

  function onDragEnter(e: DragEvent<HTMLElement>) {
    if (!isFileDrag(e)) return;
    dragCounter.current += 1;
    setIsDragOver(true);
  }

  function onDragLeave(e: DragEvent<HTMLElement>) {
    if (!isFileDrag(e)) return;
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragOver(false);
  }

  function onDragOver(e: DragEvent<HTMLElement>) {
    if (isFileDrag(e)) e.preventDefault();
  }

  function onDrop(e: DragEvent<HTMLElement>) {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    void handleFiles(e.dataTransfer.files);
  }

  return (
    <aside
      className={[
        'relative flex w-48 shrink-0 flex-col border-r bg-neutral-950 transition',
        isDragOver ? 'border-emerald-500 bg-emerald-500/5' : 'border-neutral-800',
      ].join(' ')}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {isDragOver && (
        <div className="pointer-events-none absolute inset-0 z-10 border-2 border-emerald-400 bg-emerald-400/5 transition" />
      )}

      {/* Scrollable photo list */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {photos.length === 0 ? (
          <div
            onClick={() => inputRef.current?.click()}
            className={[
              'flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition',
              isDragOver
                ? 'border-emerald-400 bg-emerald-400/5'
                : 'border-neutral-700 hover:border-neutral-500',
            ].join(' ')}
          >
            <span className="text-lg text-neutral-500">+</span>
            <p className="text-xs text-neutral-500 leading-snug">
              Click or drag<br />photos here
            </p>
          </div>
        ) : (
          photos.map((photo, i) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIdx !== null && dragIdx !== i) reorder(dragIdx, i);
                setDragIdx(null);
              }}
              onClick={() => selectPhoto(photo.id)}
              className={[
                'group relative cursor-pointer rounded-md border-2 p-1 transition',
                selectedId === photo.id ? 'border-emerald-500' : 'border-neutral-800 hover:border-neutral-600',
              ].join(' ')}
            >
              <Thumbnail photo={photo} />
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-neutral-500">#{i + 1}</span>
                {photo.splitOf ? (
                  <span className="rounded bg-amber-500/20 px-1 text-amber-300">{photo.splitOf.half}</span>
                ) : null}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(photo.id);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-sm text-neutral-500 opacity-0 hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sticky footer — never scrolls */}
      {photos.length > 0 && (
        <div className="shrink-0 p-3">
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-md border border-dashed border-neutral-700 px-2 py-2 text-xs text-neutral-400 transition hover:border-neutral-500 hover:text-neutral-200"
          >
            Click to Add<br />or<br />Drag to Side
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={onPaneChange}
      />
    </aside>
  );
}

function Thumbnail({ photo }: { photo: PhotoConfig }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    renderPhotoToCanvas(photo, ctx, c);
  }, [photo]);
  return <canvas ref={ref} className="block w-full rounded" />;
}
