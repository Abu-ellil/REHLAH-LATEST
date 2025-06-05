import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'large';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'large' ? styles.large : undefined,
        styles.arabicText,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  arabicText: {
    fontFamily: 'Almarai-Regular',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Almarai-Bold',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Almarai-Bold',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Almarai-Bold',
    lineHeight: 28,
  },
  large: {
    fontSize: 18,
    lineHeight: 26,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Almarai-Light',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
    fontFamily: 'Almarai-Regular',
  },
});
