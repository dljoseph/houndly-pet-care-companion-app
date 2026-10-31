import { Loader2, Sparkles } from 'lucide-react';

const MAX_LENGTH = 4000;

type InstructionsCardProps = {
  value: string;
  isGenerating: boolean;
  errorMessage: string | null;
  onChange: (value: string) => void;
  onGenerate: () => void;
};

export default function InstructionsCard({
  value,
  isGenerating,
  errorMessage,
  onChange,
  onGenerate,
}: InstructionsCardProps) {
  const canGenerate = value.trim().length > 0 && !isGenerating;

  return (
    <section
      aria-labelledby="instructions-heading"
      className="flex flex-col gap-3 rounded-3xl border border-cream-300 bg-white p-6 shadow-soft"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="care-instructions" id="instructions-heading" className="text-sm font-semibold text-ink">
          Care instructions
        </label>
        <textarea
          id="care-instructions"
          value={value}
          maxLength={MAX_LENGTH}
          disabled={isGenerating}
          onChange={(event) => onChange(event.target.value)}
          rows={8}
          placeholder="Paste the instructions from your vet or the care sheet here."
          className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
        />
        <p className="text-right text-xs text-ink-muted" aria-live="polite">
          {value.length.toLocaleString('en-GB')} / {MAX_LENGTH.toLocaleString('en-GB')} characters
        </p>
      </div>

      {errorMessage && (
        <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="tap-target flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-base font-semibold text-cream-50 shadow-soft transition hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-cream-300 disabled:text-ink-muted disabled:shadow-none"
        >
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          )}
          {isGenerating ? 'Reading your instructions...' : 'Generate checklist'}
        </button>
      </div>
    </section>
  );
}
