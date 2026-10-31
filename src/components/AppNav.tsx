import { CalendarCheck, ClipboardList, HeartPulse, PawPrint } from 'lucide-react';
import type { ScreenId } from '@/types/navigation';

const NAV_ITEMS: { id: ScreenId; label: string; icon: typeof PawPrint }[] = [
  { id: 'today', label: 'Today', icon: CalendarCheck },
  { id: 'dog', label: 'Dog profile', icon: PawPrint },
  { id: 'builder', label: 'Checklist', icon: ClipboardList },
  { id: 'health', label: 'Health', icon: HeartPulse },
];

type AppNavProps = {
  screen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
};

export function BottomNav({ screen, onNavigate }: AppNavProps) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-cream-300 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === screen;
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`tap-target flex w-full flex-col items-center gap-1 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${
                  isActive ? 'text-brand-700' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition ${
                    isActive ? 'bg-brand-100' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav({ screen, onNavigate }: AppNavProps) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-cream-300 bg-white px-4 py-6 lg:flex"
    >
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === screen;
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`tap-target flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  isActive
                    ? 'bg-brand-100 text-brand-800'
                    : 'text-ink-muted hover:bg-cream-100 hover:text-ink'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
