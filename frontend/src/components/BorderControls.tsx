import { useEffect, useState } from 'react';
import type { PhotoConfig } from '../types';
import { useStore } from '../store';

function samplePalette(bitmap: ImageBitmap): string[] {
  const canvas = document.createElement('canvas');
  const maxDim = 300;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const cols = 5;
  const rows = 2;
  const colors: string[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = Math.round((col + 0.5) * canvas.width / cols);
      const y = Math.round((row + 0.5) * canvas.height / rows);
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
      colors.push(
        `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      );
    }
  }
  return colors;
}

export function BorderControls({ photo }: { photo: PhotoConfig }) {
  const updateBorder = useStore((s) => s.updateBorder);
  const b = photo.border;
  const [palette, setPalette] = useState<string[]>([]);

  useEffect(() => {
    if (b.type !== 'solid') return;
    setPalette(samplePalette(photo.bitmap));
  }, [photo.bitmap, b.type]);

  return (
    <div className="flex flex-col gap-3">
      {b.type === 'solid' ? (
        <>
          <Field label="Color">
            <input
              type="color"
              value={b.color}
              onChange={(e) => updateBorder(photo.id, { color: e.target.value })}
              className="h-9 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
            />
          </Field>

          {palette.length > 0 && (
            <Field label="Image palette">
              <div className="grid grid-cols-5 gap-1">
                {palette.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => updateBorder(photo.id, { color })}
                    title={color}
                    className={[
                      'h-6 w-full rounded border-2 transition',
                      b.color.toLowerCase() === color
                        ? 'border-emerald-400 scale-110'
                        : 'border-transparent hover:border-neutral-400',
                    ].join(' ')}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </Field>
          )}
        </>
      ) : null}

      {b.type === 'gradient' ? (
        <>
          <Field label="Color A">
            <input
              type="color"
              value={b.color}
              onChange={(e) => updateBorder(photo.id, { color: e.target.value })}
              className="h-9 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
            />
          </Field>
          <Field label="Color B">
            <input
              type="color"
              value={b.color2}
              onChange={(e) => updateBorder(photo.id, { color2: e.target.value })}
              className="h-9 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
            />
          </Field>
          <Field label={`Angle: ${b.gradientAngle}°`}>
            <input
              type="range"
              min={0}
              max={360}
              value={b.gradientAngle}
              onChange={(e) => updateBorder(photo.id, { gradientAngle: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
        </>
      ) : null}

      {b.type === 'blurred' ? (
        <Field label={`Blur: ${b.blurAmount}px`}>
          <input
            type="range"
            min={5}
            max={120}
            value={b.blurAmount}
            onChange={(e) => updateBorder(photo.id, { blurAmount: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs">
      <div className="mb-1 text-neutral-400">{label}</div>
      {children}
    </label>
  );
}
