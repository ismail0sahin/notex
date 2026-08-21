import { OptionSheet, type SheetOption } from '@/components/option-sheet';
import { Strings } from '@/constants/strings';
import type { ThemePreference } from '@/constants/theme';
import { useThemePreference } from '@/hooks/use-theme';

const OPTIONS: readonly SheetOption<ThemePreference>[] = [
  {
    value: 'system',
    title: Strings.appearance.system,
    description: Strings.appearance.systemDescription,
  },
  {
    value: 'light',
    title: Strings.appearance.light,
    description: Strings.appearance.lightDescription,
  },
  {
    value: 'dark',
    title: Strings.appearance.dark,
    description: Strings.appearance.darkDescription,
  },
];

/** Tema tercihi. Seçim anında uygulanıyor ve cihazda saklanıyor. */
export function AppearanceSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { preference, setPreference } = useThemePreference();

  return (
    <OptionSheet
      visible={visible}
      title={Strings.appearance.title}
      options={OPTIONS}
      selected={preference}
      onCancel={onClose}
      onPick={(value) => {
        setPreference(value);
        onClose();
      }}
    />
  );
}

/** Menüde tercihin yanında gösterilen etiket. */
export function appearanceLabel(preference: ThemePreference) {
  return OPTIONS.find((option) => option.value === preference)?.title ?? Strings.appearance.system;
}
