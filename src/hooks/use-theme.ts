import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

/** Cihazın açık/koyu tercihine göre renk kümesi. RN 0.81'de null dönebilir. */
export function useTheme() {
  const scheme = useColorScheme();

  return Colors[scheme ?? 'light'];
}
