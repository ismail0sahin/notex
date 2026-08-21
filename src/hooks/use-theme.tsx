import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { Colors, type ThemeColors, type ThemePreference } from '@/constants/theme';
import { getSetting, setSetting } from '@/db';

const SETTING_KEY = 'theme';

type ThemeState = {
  /** Kullanıcının seçimi: system | light | dark. */
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  /** Tercih çözüldükten sonraki gerçek tema. */
  scheme: 'light' | 'dark';
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeState>({
  preference: 'system',
  setPreference: () => {},
  scheme: 'light',
  colors: Colors.light,
});

function isPreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

/**
 * Tema tercihini SQLite'ta tutar ve uygulamaya dağıtır.
 *
 * SQLiteProvider'ın içinde olmak zorunda: tercih veriyle aynı dosyada,
 * ayrı bir depolama paketi yok.
 */
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const system = useColorScheme();
  const [preference, setStored] = useState<ThemePreference>('system');

  useEffect(() => {
    (async () => {
      const saved = await getSetting(db, SETTING_KEY);
      if (isPreference(saved)) setStored(saved);
    })();
  }, [db]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      // Ekran hemen dönsün; yazma arkada tamamlanır.
      setStored(next);
      setSetting(db, SETTING_KEY, next);
    },
    [db]
  );

  const scheme = preference === 'system' ? (system ?? 'light') : preference;

  const value = useMemo(
    () => ({ preference, setPreference, scheme, colors: Colors[scheme] }),
    [preference, setPreference, scheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Renk kümesi. Bileşenlerin çoğunun ihtiyacı bu. */
export function useTheme() {
  return useContext(ThemeContext).colors;
}

/** Tema tercihini okumak ve değiştirmek için. */
export function useThemePreference() {
  const { preference, setPreference, scheme } = useContext(ThemeContext);

  return { preference, setPreference, scheme };
}
