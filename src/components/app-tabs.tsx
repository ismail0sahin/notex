import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { Strings } from '@/constants/strings';
import { useTheme } from '@/hooks/use-theme';

/**
 * Sekme ikonları iki ayrı yoldan geliyor ve bu bilinçli:
 *
 * - Expo Go'da (`__DEV__`) `src` kullanılıyor; Metro varlığı HTTP'den servis
 *   ediyor ve ikon görünüyor.
 * - Gerçek derlemede `drawable` kullanılıyor. react-native-screens 4.16'nın
 *   native tarafı release'te JS varlıklarını yalnızca kaynak adı `_` ile
 *   başlıyorsa çözüyor; Expo'nun ürettiği ad öyle olmadığı için `src` sessizce
 *   çizilmiyordu. Bu kaynakları `plugins/with-tab-icons.js` kopyalıyor.
 *
 * Renk `iconColor` ile veriliyor, PNG'ye gömülü değil.
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
        {__DEV__ ? (
          <Icon src={require('@/assets/images/tabIcons/notes.png')} />
        ) : (
          <Icon drawable="ic_tab_notes" />
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="plans">
        <Label>{Strings.tabs.plans}</Label>
        {__DEV__ ? (
          <Icon src={require('@/assets/images/tabIcons/plans.png')} />
        ) : (
          <Icon drawable="ic_tab_plans" />
        )}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
