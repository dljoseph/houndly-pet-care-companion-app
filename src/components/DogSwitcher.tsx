import { useState } from 'react';
import { ChevronDown, Dog as DogIcon, Plus, Check } from 'lucide-react';
import type { Dog } from '@/types/dog';

type DogSwitcherProps = {
  dogs: Dog[];
  activeDogId: string;
  onSelectDog: (dogId: string) => void;
  onAddDog: () => void;
};

export default function DogSwitcher({ dogs, activeDogId, onSelectDog, onAddDog }: DogSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeDog = dogs.find((dog) => dog.id === activeDogId) ?? dogs[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="tap-target flex items-center gap-2 rounded-full border border-cream-300 bg-white px-3 py-1.5 shadow-soft transition hover:border-brand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <DogIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-left">
          <span className="block text-xs text-ink-muted">Viewing</span>
          <span className="block text-sm font-semibold text-ink">{activeDog.name}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-ink-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Choose a dog"
          className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-2xl border border-cream-300 bg-white p-2 shadow-soft"
        >
          {dogs.map((dog) => {
            const isActive = dog.id === activeDogId;
            return (
              <li key={dog.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onSelectDog(dog.id);
                    setIsOpen(false);
                  }}
                  className="tap-target flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink">{dog.name}</span>
                    <span className="block text-xs text-ink-muted">{dog.breed ?? 'Breed not set'}</span>
                  </span>
                  {isActive && <Check className="h-4 w-4 text-brand-700" aria-label="Selected" />}
                </button>
              </li>
            );
          })}
          <li className="mt-1 border-t border-cream-200 pt-1">
            <button
              type="button"
              onClick={() => {
                onAddDog();
                setIsOpen(false);
              }}
              className="tap-target flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add a dog
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
