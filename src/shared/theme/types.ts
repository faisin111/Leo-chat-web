export type ThemeMode = 'light' | 'dark' | 'system';

export type AccentColorId = 'sunset' | 'violet' | 'ocean' | 'emerald' | 'rose' | 'amber';

export type DarkSurfaceId = 'midnight' | 'oled' | 'charcoal';

export type BubbleStyleId = 'gradient' | 'solid' | 'modern';

export type MessageTextSize = 'compact' | 'normal' | 'spacious';

export type AnimationLevel = 'full' | 'smooth' | 'reduced';

export interface AccentColorPreset {
  id: AccentColorId;
  name: string;
  tagline: string;
  lightHsl: string;
  darkHsl: string;
  foregroundHsl: string;
  gradient: string;
  gradientTo: string;
  glow: string;
  previewBg: string;
  previewGradient: string;
}

export interface DarkSurfacePreset {
  id: DarkSurfaceId;
  name: string;
  description: string;
  backgroundHsl: string;
  cardHsl: string;
  borderHsl: string;
  secondaryHsl: string;
  mutedHsl: string;
  previewBg: string;
}

export interface AppearancePreferences {
  accentColor: AccentColorId;
  darkSurface: DarkSurfaceId;
  bubbleStyle: BubbleStyleId;
  textSize: MessageTextSize;
  glassmorphism: boolean;
  soundEnabled: boolean;
  animations: AnimationLevel;
}
