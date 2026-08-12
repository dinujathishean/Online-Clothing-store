import { useState } from 'react';
import { PRESET_COLORS, normalizeColor } from '../../constants/colors.js';

/**
 * Multi-select colour chips for admin product create/edit.
 * Presets + optional custom colours.
 */
export default function ColorChipSelector({ selected = [], onChange, label = 'Available colours' }) {
  const [custom, setCustom] = useState('');
  const selectedNorm = selected.map(normalizeColor).filter(Boolean);

  function toggle(color) {
    const c = normalizeColor(color);
    if (!c) return;
    if (selectedNorm.includes(c)) {
      onChange(selectedNorm.filter((x) => x !== c));
    } else {
      onChange([...selectedNorm, c]);
    }
  }

  function addCustom(e) {
    e.preventDefault();
    const c = normalizeColor(custom);
    if (!c) return;
    if (!selectedNorm.includes(c)) {
      onChange([...selectedNorm, c]);
    }
    setCustom('');
  }

  const extras = selectedNorm.filter((c) => !PRESET_COLORS.includes(c));

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((col) => {
          const active = selectedNorm.includes(col);
          return (
            <button
              key={col}
              type="button"
              onClick={() => toggle(col)}
              aria-pressed={active}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                  : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              {col}
            </button>
          );
        })}
        {extras.map((col) => (
          <button
            key={col}
            type="button"
            onClick={() => toggle(col)}
            aria-pressed
            className="rounded-lg border border-amber-500 bg-amber-500/20 px-3 py-2 text-sm font-semibold text-amber-300"
            title="Click to remove custom colour"
          >
            {col}
          </button>
        ))}
      </div>
      <div className="flex max-w-xs gap-2">
        <input
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          placeholder="Custom colour"
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
        <p className="text-xs text-rose-400">Select at least one colour for this product.</p>
      )}
    </div>
  );
}
