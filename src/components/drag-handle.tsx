import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Sıralama modunda satırın taşınabilir olduğunu gösteren tırtıl. */
export function DragHandle() {
  const theme = useTheme();

  return (
    <View style={styles.handle}>
      <View style={[styles.bar, { backgroundColor: theme.textSecondary }]} />
      <View style={[styles.bar, { backgroundColor: theme.textSecondary }]} />
      <View style={[styles.bar, { backgroundColor: theme.textSecondary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  handle: {
    gap: 3,
    paddingHorizontal: 2,
  },
  bar: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
});
