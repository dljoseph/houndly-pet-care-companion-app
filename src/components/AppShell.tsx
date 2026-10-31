import type { ReactNode } from 'react';
import { Dog as DogIcon, LogOut } from 'lucide-react';
import DogSwitcher from '@/components/DogSwitcher';
import { BottomNav, SideNav } from '@/components/AppNav';
import type { Dog } from '@/types/dog';
import type { ScreenId } from '@/types/navigation';

type AppShellProps = {
  screen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  dogs: Dog[];
  activeDogId: string;
  onSelectDog: (dogId: string) => void;
  onAddDog: () => void;
  onSignOut: () => void;
  children: ReactNode;
};

export default function AppShell({
  screen,
  onNavigate,
  dogs,
  activeDogId,
  onSelectDog,
  onAddDog,
  onSignOut,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-cream-100">
      <SideNav screen={screen} onNavigate={onNavigate} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-cream-300 bg-cream-100/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-cream-50">
                <DogIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold text-brand-800">Houndly</span>
            </div>
            <div className="flex items-center gap-2">
              <DogSwitcher dogs={dogs} activeDogId={activeDogId} onSelectDog={onSelectDog} onAddDog={onAddDog} />
              <button
                type="button"
                onClick={onSignOut}
                aria-label="Sign out"
                className="tap-target flex items-center justify-center rounded-full border border-cream-300 bg-white text-ink-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 lg:px-8 lg:pb-12 lg:pt-8">{children}</main>
      </div>

      <BottomNav screen={screen} onNavigate={onNavigate} />
    </div>
  );
}
