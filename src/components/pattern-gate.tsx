import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PatternLock } from '@/components/pattern-lock';
import { ThemedText } from '@/components/themed-text';
import { Strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { getSetting, setSetting } from '@/db';
import { MIN_PATTERN_LENGTH, PATTERN_KEY, hashPattern } from '@/lib/pattern';

type Stage = 'loading' | 'create' | 'confirm' | 'verify';

/**
 * Gizli notların önündeki kapı.
 *
 * Desen kayıtlı değilse önce iki kez çizdirip kaydeder, sonra açar. Kayıtlıysa
 * doğrulama ister. `forceCreate` ile mevcut desen değiştirilirken de kullanılıyor.
 */
export function PatternGate({
  forceCreate = false,
  onUnlock,
}: {
  forceCreate?: boolean;
  onUnlock: () => void;
}) {
  const db = useSQLiteContext();
  const [stage, setStage] = useState<Stage>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const firstDraw = useRef<number[] | null>(null);

  useEffect(() => {
    (async () => {
      if (forceCreate) {
        setStage('create');
        return;
      }

      const saved = await getSetting(db, PATTERN_KEY);
      setStage(saved ? 'verify' : 'create');
    })();
  }, [db, forceCreate]);

  async function handleComplete(dots: number[]) {
    if (dots.length < MIN_PATTERN_LENGTH) {
      setMessage(Strings.pattern.tooShort(MIN_PATTERN_LENGTH));
      return;
    }

    if (stage === 'create') {
      firstDraw.current = dots;
      setMessage(null);
      setStage('confirm');
      return;
    }

    if (stage === 'confirm') {
      if (firstDraw.current?.join('-') !== dots.join('-')) {
        firstDraw.current = null;
        setMessage(Strings.pattern.mismatch);
        setStage('create');
        return;
      }

      await setSetting(db, PATTERN_KEY, await hashPattern(dots));
      onUnlock();
      return;
    }

    const saved = await getSetting(db, PATTERN_KEY);
    if (saved && saved === (await hashPattern(dots))) {
      onUnlock();
      return;
    }

    setMessage(Strings.pattern.wrong);
  }

  if (stage === 'loading') return <View style={styles.container} />;

  const prompt =
    stage === 'create'
      ? Strings.pattern.create
      : stage === 'confirm'
        ? Strings.pattern.confirm
        : Strings.pattern.verify;

  return (
    <View style={styles.container}>
      <ThemedText style={styles.prompt}>{prompt}</ThemedText>

      <PatternLock onComplete={handleComplete} />

      {message ? (
        <ThemedText type="small" themeColor="danger" style={styles.note}>
          {message}
        </ThemedText>
      ) : (
        <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
          {Strings.pattern.notEncrypted}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.six,
  },
  prompt: {
    textAlign: 'center',
  },
  note: {
    textAlign: 'center',
  },
});
