import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import {
  Accents,
  DEFAULT_ACCENT,
  resolveColors,
  type AccentName,
  type ThemeColors,
  type ThemePreference,
} from '@/constants/theme';
import { getSetting, setSetting } from '@/db';

const THEME_KEY = 'theme';
const ACCENT_KEY = 'accent';

type ThemeState = {
  /** Kullanıcının seçimi: system | light | dark. */
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  /** Tercih çözüldükten sonraki gerçek tema. */
  scheme: 'light' | 'dark';
  accent: AccentName;
  setAccent: (next: AccentName) => void;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeState>({
  preference: 'system',
  setPreference: () => {},
  scheme: 'light',
  accent: DEFAULT_ACCENT,
  setAccent: () => {},
  colors: resolveColors('light', DEFAULT_ACCENT),
});

function isPreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function isAccent(value: string | null): value is AccentName {
  return value !== null && value in Accents;
}

/**
 * Tema tercihini ve aksan rengini SQLite'ta tutar, uygulamaya dağıtır.
 *
 * SQLiteProvider'ın içinde olmak zorunda: tercihler veriyle aynı dosyada,
 * ayrı bir depolama paketi yok.
 */
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const system = useColorScheme();
  const [preference, setStored] = useState<ThemePreference>('system');
  const [accent, setStoredAccent] = useState<AccentName>(DEFAULT_ACCENT);

  useEffect(() => {
    (async () => {
      const [savedTheme, savedAccent] = await Promise.all([
        getSetting(db, THEME_KEY),
        getSetting(db, ACCENT_KEY),
      ]);

      if (isPreference(savedTheme)) setStored(savedTheme);
      if (isAccent(savedAccent)) setStoredAccent(savedAccent);
    })();
  }, [db]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      // Ekran hemen dönsün; yazma arkada tamamlanır.
      setStored(next);
      setSetting(db, THEME_KEY, next);
    },
    [db]
  );

  const setAccent = useCallback(
    (next: AccentName) => {
      setStoredAccent(next);
      setSetting(db, ACCENT_KEY, next);
    },
    [db]
  );

  const scheme = preference === 'system' ? (system ?? 'light') : preference;

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      scheme,
      accent,
      setAccent,
      colors: resolveColors(scheme, accent),
    }),
    [preference, setPreference, scheme, accent, setAccent]
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

/** Aksan rengini okumak ve değiştirmek için. */
export function useAccentPreference() {
  const { accent, setAccent, scheme } = useContext(ThemeContext);

  return { accent, setAccent, scheme };
}
