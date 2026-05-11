import { Redirect } from 'expo-router';

// Root entry — actual routing decided by RootInner in _layout.tsx, but
// this fallback ensures cold-launch navigates somewhere meaningful.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
