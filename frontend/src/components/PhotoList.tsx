import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import type { PhotoConfig } from '../types';
import { renderPhotoToCanvas } from '../lib/render';

export function PhotoList() {
  const photos = useStore((s) => s.photos);
  const selectedId = useStore((s) => s.selectedId);
  const selectPhoto = useStore((s) => s.selectPhoto);
  const removePhoto = useStore((s) => s.removePhoto);
  const reorder = useStore((s) => s.reorder);

  const [dragIdx, setDragIdx] = useState<number | null>(null);

  return (
    <aside className="flex w-48 shrink-0 flex-col gap-2 overflow-y-auto border-r border-neutral-800 bg-neutral-950 p-3">
      {photos.map((photo, i) => (
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
              className="rounded p-0.5 text-neutral-500 opacity-0 hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
              title="Remove"
            >
              ×
            </button>
          </div>
        </div>
      ))}
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
