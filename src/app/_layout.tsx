import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppTabs from '@/components/app-tabs';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/db';
import { AppThemeProvider, useThemePreference } from '@/hooks/use-theme';

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

/** Gezinme yığınının teması da kullanıcının tercihini izlemeli. */
function Navigation() {
  const { scheme } = useThemePreference();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SplashGate />
      <AppTabs />
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
        <AppThemeProvider>
          <Navigation />
        </AppThemeProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
