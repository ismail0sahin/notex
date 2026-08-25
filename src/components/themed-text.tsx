import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontSize, Fonts, FontWeight, LineHeight, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'small' | 'smallBold' | 'subtitle';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
    fontWeight: FontWeight.regular,
  },
  small: {
    fontSize: FontSize.small,
    lineHeight: LineHeight.small,
    fontWeight: FontWeight.regular,
  },
  smallBold: {
    fontSize: FontSize.small,
    lineHeight: LineHeight.small,
    fontWeight: FontWeight.bold,
  },
  // Serif yalnızca başlıklarda. fontWeight verilmiyor: dosya zaten SemiBold,
  // üstüne ağırlık istemek Android'de sahte kalınlaştırmaya gidiyor.
  subtitle: {
    fontSize: FontSize.screenTitle,
    lineHeight: LineHeight.screenTitle,
    fontFamily: Fonts.heading,
  },
});
