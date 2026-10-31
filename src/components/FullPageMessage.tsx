import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type FullPageMessageProps = {
  message: string;
  children?: ReactNode;
};

export default function FullPageMessage({ message, children }: FullPageMessageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center" role="status">
      {!children && <Loader2 className="h-8 w-8 animate-spin text-brand-700" aria-hidden="true" />}
      <p className="max-w-sm text-base text-ink-muted">{message}</p>
      {children}
    </div>
  );
}
