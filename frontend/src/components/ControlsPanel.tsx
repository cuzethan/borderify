import type { PhotoConfig, BorderType, CanvasPreset } from '../types';
import { useStore } from '../store';
import { CANVAS_PRESETS, PRESET_ORDER } from '../lib/presets';
import { canSplitForCarousel } from '../lib/autoLayout';
import { isCentered } from '../lib/geometry';
import { BorderControls } from './BorderControls';

const BORDER_TYPES: { id: BorderType; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'blurred', label: 'Blurred' },
  { id: 'gradient', label: 'Gradient' },
];

export function ControlsPanel({ photo }: { photo: PhotoConfig | null }) {
  const updatePreset = useStore((s) => s.updatePreset);
  const applyPresetToAll = useStore((s) => s.applyPresetToAll);
  const updateBorder = useStore((s) => s.updateBorder);
  const splitPhoto = useStore((s) => s.splitPhoto);
  const photoCount = useStore((s) => s.photos.length);
  const gridlinesHidden = useStore((s) => s.gridlinesHidden);
  const toggleGridlines = useStore((s) => s.toggleGridlines);

  if (!photo) {
    return (
      <aside className="w-72 shrink-0 border-l border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-500">
        No photo selected.
      </aside>
    );
  }

  const canSplit = canSplitForCarousel(photo) && !photo.splitOf;

  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-l border-neutral-800 bg-neutral-950 p-4">
      <Section title="Canvas size">
        <div className="grid grid-cols-3 gap-2">
          {PRESET_ORDER.map((p) => (
            <PresetButton key={p} preset={p} active={photo.preset === p} onClick={() => updatePreset(photo.id, p)} />
          ))}
        </div>
        {photoCount > 1 ? (
          <button
            onClick={() => applyPresetToAll(photo.preset)}
            className="mt-2 w-full rounded-md border border-neutral-700 px-2 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
            title="Set every photo to this canvas size"
          >
            Apply {CANVAS_PRESETS[photo.preset].label} to all {photoCount} photos
          </button>
        ) : null}
      </Section>

      <Section title="Border type">
        <div className="grid grid-cols-2 gap-2">
          {BORDER_TYPES.map((bt) => (
            <button
              key={bt.id}
              onClick={() => updateBorder(photo.id, { type: bt.id })}
              className={[
                'rounded-md border px-2 py-1.5 text-xs',
                photo.border.type === bt.id
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-neutral-700 hover:bg-neutral-800',
              ].join(' ')}
            >
              {bt.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Border options">
        <BorderControls photo={photo} />
      </Section>

      {isCentered(photo.offsetX, photo.offsetY) ? (
        <Section title="Center guides">
          <button
            onClick={toggleGridlines}
            className="w-full rounded-md border border-neutral-700 px-2 py-1.5 text-xs hover:bg-neutral-800"
          >
            {gridlinesHidden ? 'Show center gridlines' : 'Hide center gridlines'}
          </button>
        </Section>
      ) : null}

      {canSplit ? (
        <Section title="Carousel split">
          <p className="mb-2 text-xs text-neutral-400">
            This landscape photo doesn't fit the {photo.preset} canvas naturally. Split it into two posts so it reads
            as one image when scrolling.
          </p>
          <button
            onClick={() => splitPhoto(photo.id)}
            className="w-full rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-black hover:bg-amber-400"
          >
            Split into 2 posts (left + right)
          </button>
        </Section>
      ) : null}

      {photo.splitOf ? (
        <Section title="Carousel split">
          <p className="text-xs text-amber-300">This is the {photo.splitOf.half} half of a split photo.</p>
        </Section>
      ) : null}
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</h3>
      {children}
    </section>
  );
}

function PresetButton({
  preset,
  active,
  onClick,
}: {
  preset: CanvasPreset;
  active: boolean;
  onClick: () => void;
}) {
  const p = CANVAS_PRESETS[preset];
  return (
    <button
      onClick={onClick}
      className={[
        'flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs',
        active ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-neutral-700 hover:bg-neutral-800',
      ].join(' ')}
    >
      <span className="font-semibold">{p.label}</span>
      <span className="text-[10px] text-neutral-500">{p.ratio}</span>
    </button>
  );
}
