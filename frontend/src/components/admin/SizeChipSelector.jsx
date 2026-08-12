import { useState } from 'react';
import { PRESET_SIZES, normalizeSize } from '../../constants/sizes.js';

/**
 * Multi-select size chips for admin product create/edit.
 * Presets + optional custom sizes.
 */
export default function SizeChipSelector({ selected = [], onChange, label = 'Available sizes' }) {
  const [custom, setCustom] = useState('');
  const selectedNorm = selected.map(normalizeSize).filter(Boolean);

  function toggle(size) {
    const s = normalizeSize(size);
    if (!s) return;
    if (selectedNorm.includes(s)) {
      onChange(selectedNorm.filter((x) => x !== s));
    } else {
      onChange([...selectedNorm, s]);
    }
  }

  function addCustom(e) {
    e.preventDefault();
    const s = normalizeSize(custom);
    if (!s) return;
    if (!selectedNorm.includes(s)) {
      onChange([...selectedNorm, s]);
    }
    setCustom('');
  }

  const extras = selectedNorm.filter((s) => !PRESET_SIZES.includes(s));

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {PRESET_SIZES.map((sz) => {
          const active = selectedNorm.includes(sz);
          return (
            <button
              key={sz}
              type="button"
              onClick={() => toggle(sz)}
              aria-pressed={active}
              className={`min-w-[2.75rem] rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                  : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              {sz}
            </button>
          );
        })}
        {extras.map((sz) => (
          <button
            key={sz}
            type="button"
            onClick={() => toggle(sz)}
            aria-pressed
            className="min-w-[2.75rem] rounded-lg border border-amber-500 bg-amber-500/20 px-3 py-2 text-sm font-semibold text-amber-300"
            title="Click to remove custom size"
          >
            {sz}
          </button>
        ))}
      </div>
      <div className="flex max-w-xs gap-2">
        <input
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          placeholder="Custom size"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom(e);
            }
          }}
        />
        <button
          type="button"
          onClick={addCustom}
          className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
        >
          Add
        </button>
      </div>
      {selectedNorm.length === 0 && (
        <p className="text-xs text-rose-400">Select at least one size for this product.</p>
      )}
    </div>
  );
}
