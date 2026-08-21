import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Strings } from '@/constants/strings';
import { Colors } from '@/constants/theme';

/**
 * Sekme ikonları iki durumlu: NativeTabs boyama yapmıyor, renk PNG'nin içinde.
 * Bu yüzden seçili ve seçili olmayan hâller ayrı dosya (scripts/make-icons.py).
 */
export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundSelected}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <Label>{Strings.tabs.notes}</Label>
        <Icon
          src={{
            default: require('@/assets/images/tabIcons/notes.png'),
            selected: require('@/assets/images/tabIcons/notes-on.png'),
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="plans">
        <Label>{Strings.tabs.plans}</Label>
        <Icon
          src={{
            default: require('@/assets/images/tabIcons/plans.png'),
            selected: require('@/assets/images/tabIcons/plans-on.png'),
          }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
