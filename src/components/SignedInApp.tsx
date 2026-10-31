import { useState } from 'react';
import { Dog as DogIcon, LogOut } from 'lucide-react';
import AppShell from '@/components/AppShell';
import FullPageMessage from '@/components/FullPageMessage';
import ChecklistBuilderScreen from '@/screens/ChecklistBuilderScreen';
import DogProfileScreen from '@/screens/DogProfileScreen';
import HealthScreen from '@/screens/HealthScreen';
import TodayScreen from '@/screens/TodayScreen';
import { useDogs } from '@/hooks/useDogs';
import type { Dog } from '@/types/dog';
import type { ScreenId } from '@/types/navigation';

type SignedInAppProps = {
  userId: string;
  onSignOut: () => void;
};

export default function SignedInApp({ userId, onSignOut }: SignedInAppProps) {
  const { state, reload } = useDogs();
  const [screen, setScreen] = useState<ScreenId>('today');
  const [activeDogId, setActiveDogId] = useState<string | null>(null);
  const [isAddingDog, setIsAddingDog] = useState(false);

  if (state.status === 'loading') {
    return <FullPageMessage message="Loading your dogs" />;
  }

  if (state.status === 'error') {
    return (
      <FullPageMessage message="We couldn't load your dogs. Check your connection and try again.">
        <button
          type="button"
          onClick={reload}
          className="tap-target rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-cream-50 shadow-soft transition hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </FullPageMessage>
    );
  }

  const { dogs } = state;

  const handleSaved = (dog: Dog) => {
    const wasAddingDog = isAddingDog || dogs.length === 0;
    setActiveDogId(dog.id);
    setIsAddingDog(false);
    if (wasAddingDog) setScreen('today');
    void reload();
  };

  const handleDeleted = () => {
    setActiveDogId(null);
    setScreen('today');
    void reload();
  };

  if (dogs.length === 0) {
    return (
      <div className="min-h-screen bg-cream-100">
        <header className="border-b border-cream-300 bg-cream-100">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-cream-50">
                <DogIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold text-brand-800">Houndly</span>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              className="tap-target flex items-center justify-center rounded-full border border-cream-300 bg-white text-ink-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
          <DogProfileScreen
            userId={userId}
            dog={null}
            isFirstDog
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        </main>
      </div>
    );
  }

  const activeDog = dogs.find((dog) => dog.id === activeDogId) ?? dogs[0];

  const handleNavigate = (nextScreen: ScreenId) => {
    setScreen(nextScreen);
    setIsAddingDog(false);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'today':
        return <TodayScreen key={activeDog.id} dog={activeDog} onNavigate={handleNavigate} />;
      case 'dog':
        return (
          <DogProfileScreen
            key={isAddingDog ? 'new-dog' : activeDog.id}
            userId={userId}
            dog={isAddingDog ? null : activeDog}
            isFirstDog={false}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        );
      case 'builder':
        return <ChecklistBuilderScreen key={activeDog.id} dog={activeDog} />;
      case 'health':
        return <HealthScreen dog={activeDog} />;
    }
  };

  return (
    <AppShell
      screen={screen}
      onNavigate={handleNavigate}
      dogs={dogs}
      activeDogId={activeDog.id}
      onSelectDog={(dogId) => {
        setActiveDogId(dogId);
        setIsAddingDog(false);
      }}
      onAddDog={() => {
        setScreen('dog');
        setIsAddingDog(true);
      }}
      onSignOut={onSignOut}
    >
      {renderScreen()}
    </AppShell>
  );
}

