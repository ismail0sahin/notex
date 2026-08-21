import { useEffect, useState } from 'react';
import { Modal, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Motion } from '@/constants/theme';

/**
 * Tam ekran panel; sağdan kayarak girer, sağa kayarak çıkar.
 *
 * Modal'ın kendi `animationType="slide"`'ı Android'de alttan getiriyor, o yüzden
 * geçiş elle yazıldı. Panel kapanırken de animasyon görünsün diye Modal, çıkış
 * animasyonu bitene kadar `mounted` ile ayakta tutuluyor.
 */
export function SlidePanel({
  visible,
  onRequestClose,
  children,
}: {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration: Motion.panelOpen });
      return;
    }

    progress.value = withTiming(0, { duration: Motion.panelClose }, (finished) => {
      if (finished) runOnJS(setMounted)(false);
    });
  }, [visible, progress]);

  const slide = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - progress.value) * width }],
  }));

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onRequestClose}>
      <Animated.View style={[styles.panel, slide]}>{children}</Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
  },
});
