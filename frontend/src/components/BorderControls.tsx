import type { PhotoConfig } from '../types';
import { useStore } from '../store';

export function BorderControls({ photo }: { photo: PhotoConfig }) {
  const updateBorder = useStore((s) => s.updateBorder);
  const b = photo.border;

  return (
    <div className="flex flex-col gap-3">
      {b.type === 'solid' ? (
        <Field label="Color">
          <input
            type="color"
            value={b.color}
            onChange={(e) => updateBorder(photo.id, { color: e.target.value })}
            className="h-9 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
          />
        </Field>
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
