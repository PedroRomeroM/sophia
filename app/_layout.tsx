import { Stack } from 'expo-router';
import 'react-native-url-polyfill/auto';
import 'react-native-reanimated';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="trail/[trailId]" options={{ title: 'Trilha' }} />
      <Stack.Screen name="block/[blockId]" options={{ title: 'Bloco' }} />
      <Stack.Screen name="phase/[phaseId]" options={{ title: 'Fase' }} />
    </Stack>
  );
}
