import { useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const GRID = 3;
const BOARD = 264;
const CELL = BOARD / GRID;
/** Parmağın noktayı yakaladığı sayılan mesafe. Hücrenin üçte biri; yarıçaplar çakışmıyor. */
const HIT = CELL * 0.36;

const center = (index: number) => ({
  x: ((index % GRID) + 0.5) * CELL,
  y: (Math.floor(index / GRID) + 0.5) * CELL,
});

/**
 * 3×3 desen kilidi. Parmakla noktaların üstünden geçiliyor, bırakınca desen
 * tamamlanıyor.
 *
 * Hareket `PanResponder` ile yazıldı, gesture-handler ile değil: bu bileşen bir
 * `Modal` içinde çalışıyor ve PanResponder orada ek bir kök görünüm istemiyor.
 */
export function PatternLock({ onComplete }: { onComplete: (dots: number[]) => void }) {
  const theme = useTheme();
  const [dots, setDots] = useState<number[]>([]);
  // Dokunma geri çağrıları kapanışta eskimesin diye sıra ref'te tutuluyor.
  const dotsRef = useRef<number[]>([]);

  // PanResponder bir kez kuruluyor ve ilk render'ın kapanışını saklıyor.
  // onComplete her render'da yeniden üretildiği için ref üzerinden okunmalı;
  // yoksa çağıran taraf eski durumunu görür ve aşama hiç ilerlemez.
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (event) => {
        dotsRef.current = [];
        setDots([]);
        capture(event.nativeEvent.locationX, event.nativeEvent.locationY);
      },

      onPanResponderMove: (event) => {
        capture(event.nativeEvent.locationX, event.nativeEvent.locationY);
      },

      onPanResponderRelease: finish,
      onPanResponderTerminate: finish,
    })
  ).current;

  function capture(x: number, y: number) {
    for (let index = 0; index < GRID * GRID; index += 1) {
      if (dotsRef.current.includes(index)) continue;

      const point = center(index);
      if (Math.hypot(x - point.x, y - point.y) <= HIT) {
        dotsRef.current = [...dotsRef.current, index];
        setDots(dotsRef.current);
        return;
      }
    }
  }

  function finish() {
    const drawn = dotsRef.current;
    dotsRef.current = [];
    setDots([]);

    if (drawn.length > 0) completeRef.current(drawn);
  }

  return (
    <View style={styles.board} {...responder.panHandlers}>
      {/* Çizim katmanı dokunuşa kapalı: nokta ve çizgiler dokunuşu yakalarsa
          locationX/Y tahtaya değil o küçük görünüme göre hesaplanır ve
          koordinatlar kayar. */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {dots.slice(1).map((index, order) => {
          const from = center(dots[order]);
          const to = center(index);
          const length = Math.hypot(to.x - from.x, to.y - from.y);
          const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;

          return (
            <View
              key={`${dots[order]}-${index}`}
              style={[
                styles.line,
                {
                  backgroundColor: theme.accent,
                  width: length,
                  left: (from.x + to.x) / 2 - length / 2,
                  top: (from.y + to.y) / 2 - Sizes.divider / 2,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}

        {Array.from({ length: GRID * GRID }, (_, index) => {
          const point = center(index);
          const picked = dots.includes(index);

          return (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  left: point.x - Sizes.patternDot / 2,
                  top: point.y - Sizes.patternDot / 2,
                  borderColor: picked ? theme.accent : theme.borderSubtle,
                  backgroundColor: picked ? theme.accent : theme.backgroundElement,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: BOARD,
    height: BOARD,
    alignSelf: 'center',
    marginVertical: Spacing.four,
  },
  dot: {
    position: 'absolute',
    width: Sizes.patternDot,
    height: Sizes.patternDot,
    borderRadius: Sizes.patternDot / 2,
    borderWidth: Sizes.selectionBorder,
  },
  line: {
    position: 'absolute',
    height: Sizes.divider,
    borderRadius: Sizes.divider / 2,
  },
});
