import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import type { PhotoConfig } from '../types';
import { useStore } from '../store';
import { renderPhotoToCanvas } from '../lib/render';
import { CANVAS_PRESETS } from '../lib/presets';
import { snapToCenter, SNAP_THRESHOLD } from '../lib/geometry';

export function CanvasStage({ photo }: { photo: PhotoConfig }) {
  const updateTransform = useStore((s) => s.updateTransform);
  const ref = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showCenterGuide, setShowCenterGuide] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  // Render whenever photo changes
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    renderPhotoToCanvas(photo, ctx, c);
  }, [photo]);

  const { w: cw, h: ch } = CANVAS_PRESETS[photo.preset];

  // Compute display scale: fit canvas inside container with some padding
  function getDisplayScale(): number {
    const container = containerRef.current;
    if (!container) return 0.4;
    const padding = 48;
    const aw = container.clientWidth - padding * 2;
    const ah = container.clientHeight - padding * 2;
    return Math.min(aw / cw, ah / ch, 1);
  }

  const [displayScale, setDisplayScale] = useState(0.4);
  useEffect(() => {
    const update = () => setDisplayScale(getDisplayScale());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.preset]);

  function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: photo.offsetX,
      baseY: photo.offsetY,
    };
  }

  function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    // Convert screen-pixel delta to canvas-pixel delta
    const dx = (e.clientX - drag.startX) / displayScale;
    const dy = (e.clientY - drag.startY) / displayScale;
    const rawX = drag.baseX + dx;
    const rawY = drag.baseY + dy;
    const snappedX = snapToCenter(rawX);
    const snappedY = snapToCenter(rawY);
    setShowCenterGuide(
      Math.abs(rawX) < SNAP_THRESHOLD * 2 || Math.abs(rawY) < SNAP_THRESHOLD * 2,
    );
    updateTransform(photo.id, { offsetX: snappedX, offsetY: snappedY });
  }

  function onPointerUp(e: PointerEvent<HTMLCanvasElement>) {
    (e.target as Element).releasePointerCapture(e.pointerId);
    dragRef.current = null;
    setShowCenterGuide(false);
  }

  function onWheel(e: WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    const next = Math.max(0.1, Math.min(5, photo.scale * factor));
    updateTransform(photo.id, { scale: next });
  }

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative shadow-2xl"
        style={{ width: cw * displayScale, height: ch * displayScale }}
      >
        <canvas
          ref={ref}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
          style={{ width: cw * displayScale, height: ch * displayScale, touchAction: 'none' }}
          className="block cursor-grab active:cursor-grabbing"
        />
        {showCenterGuide ? (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-emerald-400/60" />
            <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-emerald-400/60" />
          </div>
        ) : null}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-black/60 px-2 py-1 text-xs text-neutral-300">
        {cw} × {ch} · drag to reposition · scroll to zoom
      </div>
    </div>
  );
}
