import { useEffect, useId, type ReactNode } from 'react';

type FormDialogProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function FormDialog({ title, onClose, children }: FormDialogProps) {
  const titleId = useId();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center sm:px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-soft sm:max-w-lg sm:rounded-3xl"
      >
        <h2 id={titleId} className="text-xl font-bold text-ink">
          {title}
        </h2>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
