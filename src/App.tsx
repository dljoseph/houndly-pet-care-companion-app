import FullPageMessage from '@/components/FullPageMessage';
import SignedInApp from '@/components/SignedInApp';
import AuthScreen from '@/screens/AuthScreen';
import { describeAuthError, signOutOfHoundly } from '@/lib/auth';
import { useAuthSession } from '@/hooks/useAuthSession';

function App() {
  const auth = useAuthSession();

  if (auth.status === 'loading') {
    return <FullPageMessage message="Loading Houndly" />;
  }

  if (auth.status === 'signed-out') {
    return <AuthScreen />;
  }

  const handleSignOut = async () => {
    try {
      await signOutOfHoundly();
    } catch (error) {
      window.alert(describeAuthError(error));
    }
  };

  return <SignedInApp userId={auth.session.user.id} onSignOut={handleSignOut} />;
}

export default App;
