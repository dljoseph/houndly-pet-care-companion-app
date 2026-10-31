import { useEffect, useId } from 'react';

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  isWorking: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  isWorking,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isWorking) onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isWorking, onCancel]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-soft"
      >
        <h2 id={titleId} className="text-xl font-bold text-ink">
          {title}
        </h2>
        <p className="mt-2 text-base text-ink-muted">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isWorking}
            className="tap-target rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-cream-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isWorking}
            className="tap-target rounded-full bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          >
            {isWorking ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
