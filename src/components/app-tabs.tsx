import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { Strings } from '@/constants/strings';
import { useTheme } from '@/hooks/use-theme';

/**
 * Sekme ikonları tek renkli maske; rengi `iconColor` veriyor. Böylece ikon da
 * etiket de temanın kendi tonlarını kullanıyor — koyu temada ikisi de açılıyor.
 */
export default function AppTabs() {
  const colors = useTheme();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundSelected}
      iconColor={{ default: colors.textSecondary, selected: colors.accent }}
      labelStyle={{
        default: { color: colors.textSecondary },
        selected: { color: colors.text },
      }}>
      <NativeTabs.Trigger name="index">
        <Label>{Strings.tabs.notes}</Label>
        <Icon src={require('@/assets/images/tabIcons/notes.png')} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="plans">
        <Label>{Strings.tabs.plans}</Label>
        <Icon src={require('@/assets/images/tabIcons/plans.png')} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
