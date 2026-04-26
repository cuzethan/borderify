import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import type { PhotoConfig } from '../types';
import { useStore } from '../store';
import { renderPhotoToCanvas } from '../lib/render';
import { CANVAS_PRESETS } from '../lib/presets';
import {
  clampTransform,
  computeBaseDestRect,
  computeDestRect,
  isVisiblyCentered,
  normalizeCrop,
  snapTransformToVisibleCenter,
  SNAP_THRESHOLD,
} from '../lib/geometry';

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
  const updateCrop = useStore((s) => s.updateCrop);
  const editorMode = useStore((s) => s.editorMode);
  const gridlinesHidden = useStore((s) => s.gridlinesHidden);
  const symmetricCrop = useStore((s) => s.symmetricCrop);
  const ref = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [snapping, setSnapping] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const resizeRef = useRef<{
    handle: HandleId;
    startCursorX: number;
    startCursorY: number;
    startScale: number;
    centerScreenX: number;
    centerScreenY: number;
  } | null>(null);
  const cropMoveRef = useRef<{
    startX: number;
    startY: number;
    crop: { x: number; y: number; w: number; h: number };
    baseW: number;
    baseH: number;
  } | null>(null);
  const cropResizeRef = useRef<{
    handle: HandleId;
    startX: number;
    startY: number;
    cropRectPx: { x: number; y: number; w: number; h: number };
    baseRect: { x: number; y: number; w: number; h: number };
  } | null>(null);

  // Render the canvas whenever photo state changes
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    renderPhotoToCanvas(photo, ctx, c, { showCropUnderlay: editorMode === 'crop' });
  }, [photo, editorMode]);

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
    if (editorMode !== 'move') return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: photo.offsetX,
      baseY: photo.offsetY,
    };
  }

  function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (editorMode !== 'move') return;
    const drag = dragRef.current;
    if (!drag) return;
    const dx = (e.clientX - drag.startX) / displayScale;
    const dy = (e.clientY - drag.startY) / displayScale;
    const rawX = drag.baseX + dx;
    const rawY = drag.baseY + dy;
    const snapped = snapTransformToVisibleCenter(photo, rawX, rawY);
    const clamped = clampTransform(photo, snapped.offsetX, snapped.offsetY, photo.scale);
    setSnapping(snapped.snappedX || snapped.snappedY);
    updateTransform(photo.id, { offsetX: clamped.offsetX, offsetY: clamped.offsetY });
  }

  function onPointerUp(e: PointerEvent<HTMLCanvasElement>) {
    if (editorMode !== 'move') return;
    (e.target as Element).releasePointerCapture(e.pointerId);
    dragRef.current = null;
    setSnapping(false);
  }

  function onWheel(e: WheelEvent<HTMLCanvasElement>) {
    if (editorMode !== 'move') return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    const { scale, offsetX, offsetY } = clampTransform(photo, photo.offsetX, photo.offsetY, photo.scale * factor);
    updateTransform(photo.id, { scale, offsetX, offsetY });
  }

  // Aspect-locked resize via handles ------------------------------------
  function onHandleDown(e: PointerEvent<HTMLDivElement>, handle: HandleId) {
    if (editorMode !== 'move') return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const stageBox = containerRef.current?.getBoundingClientRect();
    if (!stageBox) return;
    // Image visual center on screen
    const dest = computeDestRect(photo);
    const canvasBox = ref.current?.getBoundingClientRect();
    if (!canvasBox) return;
    const crop = normalizeCrop(photo.crop);
    const visibleLeft = (dest.dx + dest.dw * crop.x) * displayScale;
    const visibleTop = (dest.dy + dest.dh * crop.y) * displayScale;
    const visibleW = dest.dw * crop.w * displayScale;
    const visibleH = dest.dh * crop.h * displayScale;
    const centerScreenX = canvasBox.left + visibleLeft + visibleW / 2;
    const centerScreenY = canvasBox.top + visibleTop + visibleH / 2;
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
    if (editorMode !== 'move') return;
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
    if (editorMode !== 'move') return;
    (e.target as Element).releasePointerCapture(e.pointerId);
    resizeRef.current = null;
  }

  // Where to draw the handles (in screen pixels relative to the canvas wrapper)
  const dest = computeDestRect(photo);
  const cropForFrame = normalizeCrop(photo.crop);
  const visibleLeft = (dest.dx + dest.dw * cropForFrame.x) * displayScale;
  const visibleTop = (dest.dy + dest.dh * cropForFrame.y) * displayScale;
  const visibleW = dest.dw * cropForFrame.w * displayScale;
  const visibleH = dest.dh * cropForFrame.h * displayScale;

  const showSnapGuides = snapping && isVisiblyCentered(photo);
  const showGrid = !gridlinesHidden;
  const isSymmetricCropEnabled = symmetricCrop;
  const splitHalf = photo.splitOf?.half;
  const lockedReflectedSideHandle = splitHalf === 'left' ? 'e' : splitHalf === 'right' ? 'w' : null;
  const baseDest = computeBaseDestRect(photo);
  const crop = cropForFrame;
  const cropLeft = (baseDest.dx + baseDest.dw * crop.x) * displayScale;
  const cropTop = (baseDest.dy + baseDest.dh * crop.y) * displayScale;
  const cropW = baseDest.dw * crop.w * displayScale;
  const cropH = baseDest.dh * crop.h * displayScale;

  function onCropMoveDown(e: PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    cropMoveRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      crop,
      baseW: baseDest.dw,
      baseH: baseDest.dh,
    };
  }

  function onCropMove(e: PointerEvent<HTMLDivElement>) {
    const drag = cropMoveRef.current;
    if (!drag) return;
    const dx = (e.clientX - drag.startX) / displayScale;
    const dy = (e.clientY - drag.startY) / displayScale;
    const allowHorizontalMove = !photo.splitOf;
    const next = normalizeCrop({
      x: allowHorizontalMove ? drag.crop.x + dx / drag.baseW : drag.crop.x,
      y: drag.crop.y + dy / drag.baseH,
      w: drag.crop.w,
      h: drag.crop.h,
    });
    updateCrop(photo.id, next);
  }

  function onCropMoveUp(e: PointerEvent<HTMLDivElement>) {
    (e.target as Element).releasePointerCapture(e.pointerId);
    cropMoveRef.current = null;
  }

  function onCropHandleDown(e: PointerEvent<HTMLDivElement>, handle: HandleId) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    cropResizeRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      cropRectPx: { x: cropLeft, y: cropTop, w: cropW, h: cropH },
      baseRect: {
        x: baseDest.dx * displayScale,
        y: baseDest.dy * displayScale,
        w: baseDest.dw * displayScale,
        h: baseDest.dh * displayScale,
      },
    };
  }

  function onCropHandleMove(e: PointerEvent<HTMLDivElement>) {
    const state = cropResizeRef.current;
    if (!state) return;
    const minPx = 12;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    let { x, y, w, h } = state.cropRectPx;
    const right = x + w;
    const bottom = y + h;
    const isSplit = Boolean(splitHalf);
    const canResizeWest = !isSplit || splitHalf === 'left';
    const canResizeEast = !isSplit || splitHalf === 'right';
    const allowHorizontalSymmetric = isSymmetricCropEnabled && !isSplit;
    const allowVerticalSymmetric = isSymmetricCropEnabled;
    if (state.handle.includes('w')) {
      if (!canResizeWest) {
        // Keep reflected side locked for split crops.
      } else if (allowHorizontalSymmetric) {
        x = x + dx;
        w = w - 2 * dx;
      } else {
        const nextX = Math.min(right - minPx, x + dx);
        x = nextX;
        w = right - nextX;
      }
    }
    if (state.handle.includes('e')) {
      if (!canResizeEast) {
        // Keep reflected side locked for split crops.
      } else if (allowHorizontalSymmetric) {
        x = x - dx;
        w = w + 2 * dx;
      } else {
        w = Math.max(minPx, w + dx);
      }
    }
    if (state.handle.includes('n')) {
      if (allowVerticalSymmetric) {
        y = y + dy;
        h = h - 2 * dy;
      } else {
        const nextY = Math.min(bottom - minPx, y + dy);
        y = nextY;
        h = bottom - nextY;
      }
    }
    if (state.handle.includes('s')) {
      if (allowVerticalSymmetric) {
        y = y - dy;
        h = h + 2 * dy;
      } else {
        h = Math.max(minPx, h + dy);
      }
    }
    const bx = state.baseRect.x;
    const by = state.baseRect.y;
    const bw = state.baseRect.w;
    const bh = state.baseRect.h;
    const clampedX = Math.max(bx, Math.min(bx + bw - minPx, x));
    const clampedY = Math.max(by, Math.min(by + bh - minPx, y));
    const clampedW = Math.max(minPx, Math.min(bx + bw - clampedX, w));
    const clampedH = Math.max(minPx, Math.min(by + bh - clampedY, h));
    const next = normalizeCrop({
      x: (clampedX - bx) / bw,
      y: (clampedY - by) / bh,
      w: clampedW / bw,
      h: clampedH / bh,
    });
    updateCrop(photo.id, next);
  }

  function onCropHandleUp(e: PointerEvent<HTMLDivElement>) {
    (e.target as Element).releasePointerCapture(e.pointerId);
    cropResizeRef.current = null;
  }

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative shadow-2xl"
        style={{ width: cw * displayScale, height: ch * displayScale }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <canvas
          ref={ref}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
          style={{ width: cw * displayScale, height: ch * displayScale, touchAction: 'none' }}
          className={['block', editorMode === 'move' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'].join(' ')}
        />

        {editorMode === 'move' && hovered ? (
          <>
            <div
              className="pointer-events-none absolute border border-emerald-400/60"
              style={{ left: visibleLeft, top: visibleTop, width: visibleW, height: visibleH }}
            />
            {HANDLES.map((h) => {
              const x = visibleLeft + visibleW * h.xFrac;
              const y = visibleTop + visibleH * h.yFrac;
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
          </>
        ) : (
          <>
            <div
              onPointerDown={onCropMoveDown}
              onPointerMove={onCropMove}
              onPointerUp={onCropMoveUp}
              className={`absolute ${hovered ? 'border border-sky-400/90 bg-sky-500/10' : 'border-0'}`}
              style={{
                left: cropLeft,
                top: cropTop,
                width: cropW,
                height: cropH,
                cursor: 'move',
                touchAction: 'none',
              }}
            />
            {hovered &&
              HANDLES.filter((h) => {
                if (!lockedReflectedSideHandle) return true;
                return !h.id.includes(lockedReflectedSideHandle);
              }).map((h) => {
                const x = cropLeft + cropW * h.xFrac;
                const y = cropTop + cropH * h.yFrac;
                return (
                  <div
                    key={h.id}
                    onPointerDown={(e) => onCropHandleDown(e, h.id)}
                    onPointerMove={onCropHandleMove}
                    onPointerUp={onCropHandleUp}
                    className="absolute h-3 w-3 rounded-sm border border-sky-300 bg-sky-400 shadow"
                    style={{
                      left: x - 6,
                      top: y - 6,
                      cursor: h.cursor,
                      touchAction: 'none',
                    }}
                  />
                );
              })}
          </>
        )}

        {/* 4×4 grid: always shown when gridlines are enabled */}
        {showGrid && (
          <div className="pointer-events-none absolute inset-0">
            {[25, 50, 75].map((pct) => (
              <div key={`v${pct}`} className="absolute top-0 h-full w-[1.5px] bg-black/40" style={{ left: `${pct}%` }} />
            ))}
            {[25, 50, 75].map((pct) => (
              <div key={`h${pct}`} className="absolute left-0 h-[1.5px] w-full bg-black/40" style={{ top: `${pct}%` }} />
            ))}
          </div>
        )}
        {/* Center snap guides: shown only while dragging and snapping to center */}
        {showSnapGuides && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-emerald-400/70" />
            <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-emerald-400/70" />
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-black/60 px-2 py-1 text-xs text-neutral-300">
        {editorMode === 'move'
          ? `${cw} × ${ch} · drag to pan · drag handles to resize · scroll to zoom · snaps within ${SNAP_THRESHOLD}px`
          : `${cw} × ${ch} · drag crop box to move · drag handles to crop`}
      </div>
    </div>
  );
}
