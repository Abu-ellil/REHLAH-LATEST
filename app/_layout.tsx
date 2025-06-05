import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { LoadingScreen } from '@/components/LoadingScreen';
import { useColorScheme } from '@/hooks/useColorScheme';
import { persistor, store } from '@/store';

// تفعيل الكتابة من اليمين لليسار
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'Almarai-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Almarai-Bold': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Almarai-Light': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return <LoadingScreen />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
