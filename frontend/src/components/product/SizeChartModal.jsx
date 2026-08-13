import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  SIZE_CHART_COLUMNS,
  SIZE_CHART_NOTE,
  SIZE_CHART_ROWS,
} from '../../constants/sizeChart.js';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function SizeChartModal({ open, onClose }) {
  const titleId = useId();
  const noteId = useId();
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 0);

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = [...dialogRef.current.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (!focusable.length) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
        aria-label="Close size chart"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={noteId}
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-neutral-200 bg-white shadow-2xl shadow-slate-950/20 sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-gradient-to-br from-amber-50 via-white to-slate-50 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
              AURVEXA
            </p>
            <h2 id={titleId} className="mt-1 font-display text-xl font-bold text-neutral-900 sm:text-2xl">
              Size chart
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <p id={noteId} className="text-sm leading-relaxed text-neutral-600">
            {SIZE_CHART_NOTE}
          </p>

          <div className="mt-4 -mx-1 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-slate-50">
                  {SIZE_CHART_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-600 first:pl-4 last:pr-4"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART_ROWS.map((row) => (
                  <tr key={row.size} className="border-b border-neutral-100 last:border-0">
                    <th
                      scope="row"
                      className="whitespace-nowrap px-3 py-3 pl-4 font-semibold text-neutral-900"
                    >
                      {row.size}
                    </th>
                    <td className="whitespace-nowrap px-3 py-3 text-neutral-700">{row.chest}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-neutral-700">{row.waist}</td>
                    <td className="whitespace-nowrap px-3 py-3 pr-4 text-neutral-700">{row.height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-neutral-500">
            Chest and waist: body circumference. Height: recommended wearer height range.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
