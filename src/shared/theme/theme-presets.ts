import type { AccentColorPreset, DarkSurfacePreset, AccentColorId, DarkSurfaceId } from './types';

export const ACCENT_PRESETS: Record<AccentColorId, AccentColorPreset> = {
  sunset: {
    id: 'sunset',
    name: 'Sunset Coral',
    tagline: 'Warm, energetic & vibrant',
    lightHsl: '15 90% 55%',
    darkHsl: '16 95% 58%',
    foregroundHsl: '0 0% 100%',
    gradient: 'linear-gradient(135deg, #f97316 0%, #f43f5e 100%)',
    gradientTo: '345 88% 58%',
    glow: 'rgba(249, 115, 22, 0.4)',
    previewBg: '#f97316',
    previewGradient: 'from-orange-500 to-rose-500',
  },
  violet: {
    id: 'violet',
    name: 'Cyber Violet',
    tagline: 'Futuristic, neon & electric',
    lightHsl: '262 83% 58%',
    darkHsl: '265 89% 66%',
    foregroundHsl: '0 0% 100%',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
    gradientTo: '292 84% 60%',
    glow: 'rgba(139, 92, 246, 0.4)',
    previewBg: '#8b5cf6',
    previewGradient: 'from-violet-500 to-fuchsia-500',
  },
  ocean: {
    id: 'ocean',
    name: 'Electric Ocean',
    tagline: 'Cool, crystal & deep azure',
    lightHsl: '199 89% 48%',
    darkHsl: '200 95% 52%',
    foregroundHsl: '0 0% 100%',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
    gradientTo: '188 90% 45%',
    glow: 'rgba(14, 165, 233, 0.4)',
    previewBg: '#0ea5e9',
    previewGradient: 'from-sky-500 to-cyan-500',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Matrix',
    tagline: 'Crisp, modern & tranquil',
    lightHsl: '158 75% 42%',
    darkHsl: '160 84% 45%',
    foregroundHsl: '0 0% 100%',
    gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    gradientTo: '173 80% 40%',
    glow: 'rgba(16, 185, 129, 0.4)',
    previewBg: '#10b981',
    previewGradient: 'from-emerald-500 to-teal-500',
  },
  rose: {
    id: 'rose',
    name: 'Rose Radiance',
    tagline: 'Bold, passionate & vivid',
    lightHsl: '346 87% 57%',
    darkHsl: '348 90% 63%',
    foregroundHsl: '0 0% 100%',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
    gradientTo: '330 81% 60%',
    glow: 'rgba(244, 63, 94, 0.4)',
    previewBg: '#f43f5e',
    previewGradient: 'from-rose-500 to-pink-500',
  },
  amber: {
    id: 'amber',
    name: 'Solar Amber',
    tagline: 'Prestigious, radiant & sun-kissed',
    lightHsl: '38 92% 50%',
    darkHsl: '40 96% 54%',
    foregroundHsl: '0 0% 100%',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    gradientTo: '21 90% 48%',
    glow: 'rgba(245, 158, 11, 0.4)',
    previewBg: '#f59e0b',
    previewGradient: 'from-amber-500 to-orange-600',
  },
};

export const DARK_SURFACE_PRESETS: Record<DarkSurfaceId, DarkSurfacePreset> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Navy',
    description: 'Ultra-modern deep dark with slate-blue undertones',
    backgroundHsl: '224 71% 4%', // #080c14
    cardHsl: '222 47% 9%', // #0f172a
    borderHsl: '217 33% 16%', // #1e293b
    secondaryHsl: '217 33% 14%',
    mutedHsl: '217 33% 11%',
    previewBg: '#080c14',
  },
  oled: {
    id: 'oled',
    name: 'Pure OLED',
    description: 'True pitch black background with vibrant contrast',
    backgroundHsl: '0 0% 0%', // #000000
    cardHsl: '0 0% 5%', // #0d0d0d
    borderHsl: '0 0% 14%', // #242424
    secondaryHsl: '0 0% 10%',
    mutedHsl: '0 0% 7%',
    previewBg: '#000000',
  },
  charcoal: {
    id: 'charcoal',
    name: 'Obsidian Charcoal',
    description: 'Sophisticated warm graphite for a soft night view',
    backgroundHsl: '240 10% 6%', // #0f0f12
    cardHsl: '240 10% 11%', // #19191e
    borderHsl: '240 7% 18%', // #2c2c31
    secondaryHsl: '240 8% 15%',
    mutedHsl: '240 8% 12%',
    previewBg: '#0f0f12',
  },
};
