import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppTabs from '@/components/app-tabs';
import { Fonts } from '@/constants/theme';
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
  // Başlık yazı tipi çalışma anında yükleniyor. Yüklenene kadar hiçbir şey
  // render edilmiyor; açılış ekranı zaten duruyor, böylece yazılar önce sistem
  // yazı tipiyle çizilip sonra yerine oturmuyor.
  // Sekme ikonlarındaki gibi `require`: .ttf için tip bildirimi yok, import
  // etmek tsc'yi düşürüyor.
  const [fontsLoaded] = useFonts({
    [Fonts.heading]: require('@/assets/fonts/Lora-SemiBold.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
        <AppThemeProvider>
          <Navigation />
        </AppThemeProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
