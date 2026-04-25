import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import type { PhotoConfig } from '../types';
import { useStore } from '../store';
import { renderPhotoToCanvas } from '../lib/render';
import { CANVAS_PRESETS } from '../lib/presets';
import { clampTransform, computeDestRect, isCentered, snapToCenter, SNAP_THRESHOLD } from '../lib/geometry';

type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLES: { id: HandleId; cursor: string; xFrac: number; yFrac: number }[] = [
  { id: 'nw', cursor: 'nwse-resize', xFrac: 0, yFrac: 0 },
  { id: 'n', cursor: 'ns-resize', xFrac: 0.5, yFrac: 0 },
  { id: 'ne', cursor: 'nesw-resize', xFrac: 1, yFrac: 0 },
  { id: 'e', cursor: 'ew-resize', xFrac: 1, yFrac: 0.5 },
  { id: 'se', cursor: 'nwse-resize', xFrac: 1, yFrac: 1 },
  { id: 's', cursor: 'ns-resize', xFrac: 0.5, yFrac: 1 },
  { id: 'sw', cursor: 'nesw-resize', xFrac: 0, yFrac: 1 },
  { id: 'w', cursor: 'ew-resize', xFrac: 0, yFrac: 0.5 },
];

export function CanvasStage({ photo }: { photo: PhotoConfig }) {
  const updateTransform = useStore((s) => s.updateTransform);
  const gridlinesHidden = useStore((s) => s.gridlinesHidden);
  const ref = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [snapping, setSnapping] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const resizeRef = useRef<{
    handle: HandleId;
    startCursorX: number;
    startCursorY: number;
    startScale: number;
    centerScreenX: number;
    centerScreenY: number;
  } | null>(null);

  // Render the canvas whenever photo state changes
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    renderPhotoToCanvas(photo, ctx, c);
  }, [photo]);

  const { w: cw, h: ch } = CANVAS_PRESETS[photo.preset];

  function getDisplayScale(): number {
    const container = containerRef.current;
    if (!container) return 0.4;
    const padding = 64;
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

  // Drag-to-pan ----------------------------------------------------------
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
    const dx = (e.clientX - drag.startX) / displayScale;
    const dy = (e.clientY - drag.startY) / displayScale;
    const rawX = drag.baseX + dx;
    const rawY = drag.baseY + dy;
    const snappedX = snapToCenter(rawX);
    const snappedY = snapToCenter(rawY);
    const clamped = clampTransform(photo, snappedX, snappedY, photo.scale);
    setSnapping(clamped.offsetX === 0 || clamped.offsetY === 0);
    updateTransform(photo.id, { offsetX: clamped.offsetX, offsetY: clamped.offsetY });
  }

  function onPointerUp(e: PointerEvent<HTMLCanvasElement>) {
    (e.target as Element).releasePointerCapture(e.pointerId);
    dragRef.current = null;
    setSnapping(false);
  }

  function onWheel(e: WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    const { scale, offsetX, offsetY } = clampTransform(photo, photo.offsetX, photo.offsetY, photo.scale * factor);
    updateTransform(photo.id, { scale, offsetX, offsetY });
  }

  // Aspect-locked resize via handles ------------------------------------
  function onHandleDown(e: PointerEvent<HTMLDivElement>, handle: HandleId) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const stageBox = containerRef.current?.getBoundingClientRect();
    if (!stageBox) return;
    // Image visual center on screen
    const dest = computeDestRect(photo);
    const canvasBox = ref.current?.getBoundingClientRect();
    if (!canvasBox) return;
    const centerScreenX = canvasBox.left + (dest.dx + dest.dw / 2) * displayScale;
    const centerScreenY = canvasBox.top + (dest.dy + dest.dh / 2) * displayScale;
    resizeRef.current = {
      handle,
      startCursorX: e.clientX,
      startCursorY: e.clientY,
      startScale: photo.scale,
      centerScreenX,
      centerScreenY,
    };
  }

  function onHandleMove(e: PointerEvent<HTMLDivElement>) {
    const r = resizeRef.current;
    if (!r) return;
    const startDx = r.startCursorX - r.centerScreenX;
    const startDy = r.startCursorY - r.centerScreenY;
    const nowDx = e.clientX - r.centerScreenX;
    const nowDy = e.clientY - r.centerScreenY;
    let factor: number;
    if (r.handle === 'n' || r.handle === 's') {
      factor = Math.abs(startDy) > 1 ? Math.abs(nowDy) / Math.abs(startDy) : 1;
    } else if (r.handle === 'e' || r.handle === 'w') {
      factor = Math.abs(startDx) > 1 ? Math.abs(nowDx) / Math.abs(startDx) : 1;
    } else {
      const startD = Math.hypot(startDx, startDy);
      const nowD = Math.hypot(nowDx, nowDy);
      factor = startD > 1 ? nowD / startD : 1;
    }
    const { scale, offsetX, offsetY } = clampTransform(photo, photo.offsetX, photo.offsetY, r.startScale * factor);
    updateTransform(photo.id, { scale, offsetX, offsetY });
  }

  function onHandleUp(e: PointerEvent<HTMLDivElement>) {
    (e.target as Element).releasePointerCapture(e.pointerId);
    resizeRef.current = null;
  }

  // Where to draw the handles (in screen pixels relative to the canvas wrapper)
  const dest = computeDestRect(photo);
  const handleLeft = dest.dx * displayScale;
  const handleTop = dest.dy * displayScale;
  const handleW = dest.dw * displayScale;
  const handleH = dest.dh * displayScale;

  const showGuides = snapping || (isCentered(photo.offsetX, photo.offsetY) && !gridlinesHidden);

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

        {/* Resize-handle frame around the image's destination rect */}
        <div
          className="pointer-events-none absolute border border-emerald-400/60"
          style={{ left: handleLeft, top: handleTop, width: handleW, height: handleH }}
        />
        {HANDLES.map((h) => {
          const x = handleLeft + handleW * h.xFrac;
          const y = handleTop + handleH * h.yFrac;
          return (
            <div
              key={h.id}
              onPointerDown={(e) => onHandleDown(e, h.id)}
              onPointerMove={onHandleMove}
              onPointerUp={onHandleUp}
              className="absolute h-3 w-3 rounded-sm border border-emerald-300 bg-emerald-400 shadow"
              style={{
                left: x - 6,
                top: y - 6,
                cursor: h.cursor,
                touchAction: 'none',
              }}
            />
          );
        })}

        {/* Center gridlines: shown while snapping during drag, OR persistently when centered */}
        {showGuides ? (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-emerald-400/70" />
            <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-emerald-400/70" />
          </div>
        ) : null}
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-black/60 px-2 py-1 text-xs text-neutral-300">
        {cw} × {ch} · drag to pan · drag handles to resize · scroll to zoom · snaps within {SNAP_THRESHOLD}px
      </div>
    </div>
  );
}
