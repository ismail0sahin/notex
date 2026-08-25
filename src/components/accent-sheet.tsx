import { OptionSheet, type SheetOption } from '@/components/option-sheet';
import { Strings } from '@/constants/strings';
import { Accents, type AccentName } from '@/constants/theme';
import { useAccentPreference } from '@/hooks/use-theme';

/**
 * Seçenekler `Accents`'ten türetiliyor: yeni bir renk eklemek için theme.ts'e
 * bir giriş ve strings.ts'e bir ad yazmak yeterli, burası dokunulmadan büyür.
 */
const NAMES: Record<AccentName, string> = {
  terracotta: Strings.accent.terracotta,
  olive: Strings.accent.olive,
  indigo: Strings.accent.indigo,
  plum: Strings.accent.plum,
  teal: Strings.accent.teal,
};

const ORDER = Object.keys(Accents) as AccentName[];

/** Aksan rengi. Seçim anında uygulanıyor ve cihazda saklanıyor. */
export function AccentSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { accent, setAccent, scheme } = useAccentPreference();

  // Örnek daire yürürlükteki temanın tonunu gösteriyor; koyu temada açık
  // karşılığı seçiliyor, yoksa kart üstünde ne göreceğin belli olmuyor.
  const options: SheetOption<AccentName>[] = ORDER.map((name) => ({
    value: name,
    title: NAMES[name],
    swatch: Accents[name][scheme].accent,
  }));

  return (
    <OptionSheet
      visible={visible}
      title={Strings.accent.title}
      options={options}
      selected={accent}
      onCancel={onClose}
      onPick={(value) => {
        setAccent(value);
        onClose();
      }}
    />
  );
}

/** Menüde tercihin yanında gösterilen etiket. */
export function accentLabel(accent: AccentName) {
  return NAMES[accent];
}
