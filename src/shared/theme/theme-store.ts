import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppearancePreferences,
  AccentColorId,
  DarkSurfaceId,
  BubbleStyleId,
  MessageTextSize,
  AnimationLevel,
} from './types';
import { ACCENT_PRESETS, DARK_SURFACE_PRESETS } from './theme-presets';

interface AppearanceStore extends AppearancePreferences {
  setAccentColor: (accent: AccentColorId) => void;
  setDarkSurface: (surface: DarkSurfaceId) => void;
  setBubbleStyle: (style: BubbleStyleId) => void;
  setTextSize: (size: MessageTextSize) => void;
  setGlassmorphism: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAnimations: (level: AnimationLevel) => void;
  resetToDefaults: () => void;
}

const DEFAULT_PREFERENCES: AppearancePreferences = {
  accentColor: 'sunset',
  darkSurface: 'midnight',
  bubbleStyle: 'gradient',
  textSize: 'normal',
  glassmorphism: true,
  soundEnabled: true,
  animations: 'full',
};

export const useAppearanceStore = create<AppearanceStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setAccentColor: (accentColor) => set({ accentColor }),
      setDarkSurface: (darkSurface) => set({ darkSurface }),
      setBubbleStyle: (bubbleStyle) => set({ bubbleStyle }),
      setTextSize: (textSize) => set({ textSize }),
      setGlassmorphism: (glassmorphism) => set({ glassmorphism }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setAnimations: (animations) => set({ animations }),
      resetToDefaults: () => set({ ...DEFAULT_PREFERENCES }),
    }),
    {
      name: 'leochat_appearance_preferences',
    },
  ),
);

/**
 * Applies custom CSS variables to the document root according to
 * the selected accent color, dark surface mode, and whether dark mode is active.
 */
export function applyThemeVariables(isDark: boolean, prefs: AppearancePreferences) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const accent = ACCENT_PRESETS[prefs.accentColor] || ACCENT_PRESETS.sunset;
  const surface = DARK_SURFACE_PRESETS[prefs.darkSurface] || DARK_SURFACE_PRESETS.midnight;

  // Set primary color based on theme
  const primaryHsl = isDark ? accent.darkHsl : accent.lightHsl;
  root.style.setProperty('--primary', primaryHsl);
  root.style.setProperty('--primary-foreground', accent.foregroundHsl);
  root.style.setProperty('--ring', primaryHsl);
  root.style.setProperty('--bubble-own', primaryHsl);
  root.style.setProperty('--primary-glow', accent.glow);
  root.style.setProperty('--primary-gradient', accent.gradient);
  root.style.setProperty('--primary-gradient-to', accent.gradientTo);

  // If dark mode is active, customize surfaces
  if (isDark) {
    root.style.setProperty('--background', surface.backgroundHsl);
    root.style.setProperty('--card', surface.cardHsl);
    root.style.setProperty('--popover', surface.cardHsl);
    root.style.setProperty('--border', surface.borderHsl);
    root.style.setProperty('--input', surface.borderHsl);
    root.style.setProperty('--secondary', surface.secondaryHsl);
    root.style.setProperty('--muted', surface.mutedHsl);
  } else {
    // Reset light mode defaults if needed
    root.style.removeProperty('--background');
    root.style.removeProperty('--card');
    root.style.removeProperty('--popover');
    root.style.removeProperty('--border');
    root.style.removeProperty('--input');
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--muted');
  }

  // Update data attributes for animations and text size
  root.setAttribute('data-bubble-style', prefs.bubbleStyle);
  root.setAttribute('data-text-size', prefs.textSize);
  root.setAttribute('data-animations', prefs.animations);
  root.setAttribute('data-glassmorphism', String(prefs.glassmorphism));
}
