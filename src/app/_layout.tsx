import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/db';

SplashScreen.preventAutoHideAsync();

/**
 * SQLiteProvider çocuklarını ancak veritabanı hazır olduğunda render eder.
 * Açılış ekranını o ana kadar açık tutuyoruz, yoksa arada boş bir kare görünür.
 */
function SplashGate() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return null;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
          <SplashGate />
          <AppTabs />
        </SQLiteProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
