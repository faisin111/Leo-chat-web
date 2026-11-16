import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAppearanceStore, applyThemeVariables } from './theme-store';

export function ThemeSync() {
  const { resolvedTheme } = useTheme();
  const accentColor = useAppearanceStore((s) => s.accentColor);
  const darkSurface = useAppearanceStore((s) => s.darkSurface);
  const bubbleStyle = useAppearanceStore((s) => s.bubbleStyle);
  const textSize = useAppearanceStore((s) => s.textSize);
  const glassmorphism = useAppearanceStore((s) => s.glassmorphism);
  const soundEnabled = useAppearanceStore((s) => s.soundEnabled);
  const animations = useAppearanceStore((s) => s.animations);

  useEffect(() => {
    const isDark = resolvedTheme === 'dark';
    applyThemeVariables(isDark, {
      accentColor,
      darkSurface,
      bubbleStyle,
      textSize,
      glassmorphism,
      soundEnabled,
      animations,
    });
  }, [
    resolvedTheme,
    accentColor,
    darkSurface,
    bubbleStyle,
    textSize,
    glassmorphism,
    soundEnabled,
    animations,
  ]);

  return null;
}
