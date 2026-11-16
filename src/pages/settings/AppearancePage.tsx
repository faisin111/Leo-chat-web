import { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Monitor,
  Sun,
  Moon,
  Sparkles,
  Check,
  RotateCcw,
  Palette,
  MessageSquare,
  Send,
  Volume2,
  Sliders,
  Layers,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAppearanceStore,
  ACCENT_PRESETS,
  DARK_SURFACE_PRESETS,
  type AccentColorId,
  type DarkSurfaceId,
  type BubbleStyleId,
  type MessageTextSize,
  type AnimationLevel,
} from '@/shared/theme';
import { Button } from '@/shared/ui/button';

export const AppearancePage = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const accentColor = useAppearanceStore((s) => s.accentColor);
  const setAccentColor = useAppearanceStore((s) => s.setAccentColor);

  const darkSurface = useAppearanceStore((s) => s.darkSurface);
  const setDarkSurface = useAppearanceStore((s) => s.setDarkSurface);

  const bubbleStyle = useAppearanceStore((s) => s.bubbleStyle);
  const setBubbleStyle = useAppearanceStore((s) => s.setBubbleStyle);

  const textSize = useAppearanceStore((s) => s.textSize);
  const setTextSize = useAppearanceStore((s) => s.setTextSize);

  const glassmorphism = useAppearanceStore((s) => s.glassmorphism);
  const setGlassmorphism = useAppearanceStore((s) => s.setGlassmorphism);

  const soundEnabled = useAppearanceStore((s) => s.soundEnabled);
  const setSoundEnabled = useAppearanceStore((s) => s.setSoundEnabled);

  const animations = useAppearanceStore((s) => s.animations);
  const setAnimations = useAppearanceStore((s) => s.setAnimations);

  const resetToDefaults = useAppearanceStore((s) => s.resetToDefaults);

  // Interactive live preview reaction counts
  const [reactionCounts, setReactionCounts] = useState<{ [key: string]: number }>({
    '🔥': 5,
    '❤️': 3,
    '✨': 2,
  });

  const handleReactionClick = (emoji: string) => {
    setReactionCounts((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
  };

  const handleReset = () => {
    resetToDefaults();
    setTheme('system');
    toast.success('Appearance reset to default settings', {
      description: 'System theme and Sunset Coral accent restored.',
    });
  };

  const isDarkMode = resolvedTheme === 'dark';
  const currentAccent = ACCENT_PRESETS[accentColor] || ACCENT_PRESETS.sunset;

  return (
    <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Aesthetics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Appearance
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Customize color gradients, dark surfaces, glassmorphic effects, and fluid animations for
            your workspace.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="self-start sm:self-center gap-2 text-xs rounded-xl"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </Button>
      </div>

      {/* 1. Interface Theme Mode */}
      <section className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs transition-all">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Interface Theme</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select how LeoChat adapts between bright workspaces and dark environments.
            </p>
          </div>
          <span className="hidden sm:inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            Active: <span className="capitalize text-foreground font-semibold">{theme}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* System */}
          <button
            type="button"
            onClick={() => {
              setTheme('system');
              toast.info('System theme active', {
                description: 'Adapting to your operating system preference.',
              });
            }}
            className={`group relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
              theme === 'system'
                ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs'
                : 'border-border/80 bg-background/50 hover:bg-muted/60 hover:border-border'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div
                className={`p-2.5 rounded-xl transition-colors ${
                  theme === 'system'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <Monitor className="w-5 h-5" />
              </div>
              {theme === 'system' && (
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <div className="font-semibold text-sm text-foreground">System</div>
            <div className="text-xs text-muted-foreground mt-1">
              Follows your OS setting ({resolvedTheme === 'dark' ? 'Dark' : 'Light'})
            </div>
          </button>

          {/* Light */}
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              toast.success('Switched to Light theme', {
                description: 'Crisp, high-contrast daylight mode.',
              });
            }}
            className={`group relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
              theme === 'light'
                ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs'
                : 'border-border/80 bg-background/50 hover:bg-muted/60 hover:border-border'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div
                className={`p-2.5 rounded-xl transition-colors ${
                  theme === 'light'
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                    : 'bg-muted text-foreground'
                }`}
              >
                <Sun className="w-5 h-5" />
              </div>
              {theme === 'light' && (
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <div className="font-semibold text-sm text-foreground">Light</div>
            <div className="text-xs text-muted-foreground mt-1">
              Crisp daylight mode with high clarity
            </div>
          </button>

          {/* Dark */}
          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              toast.success('Switched to Dark theme', {
                description: 'Sleek, deep contrast easy on the eyes.',
              });
            }}
            className={`group relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
              theme === 'dark'
                ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs'
                : 'border-border/80 bg-background/50 hover:bg-muted/60 hover:border-border'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div
                className={`p-2.5 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'bg-muted text-foreground'
                }`}
              >
                <Moon className="w-5 h-5" />
              </div>
              {theme === 'dark' && (
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <div className="font-semibold text-sm text-foreground">Dark</div>
            <div className="text-xs text-muted-foreground mt-1">
              Deep, modern contrast for evening focus
            </div>
          </button>
        </div>
      </section>

      {/* 2. Dark Surface Depth (Visible in Dark Mode) */}
      {isDarkMode && (
        <section className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Dark Surface Style</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose the depth and tone of your dark mode surfaces.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {Object.values(DARK_SURFACE_PRESETS).map((surface) => {
              const isActive = darkSurface === surface.id;
              return (
                <button
                  key={surface.id}
                  type="button"
                  onClick={() => {
                    setDarkSurface(surface.id as DarkSurfaceId);
                    toast.success(`Surface updated: ${surface.name}`);
                  }}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs'
                      : 'border-border/80 bg-background/50 hover:bg-muted/60 hover:border-border'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div
                      className="w-7 h-7 rounded-lg border border-slate-700 shadow-inner"
                      style={{ backgroundColor: surface.previewBg }}
                    />
                    {isActive && (
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-sm text-foreground">{surface.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{surface.description}</div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Accent Color & Gradient Theme */}
      <section className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <span>Accent Gradients & Colors</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Applied across buttons, active indicators, notification glows, and message bubbles.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {currentAccent.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.values(ACCENT_PRESETS).map((preset) => {
            const isSelected = accentColor === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setAccentColor(preset.id as AccentColorId);
                  toast.success(`Accent color changed: ${preset.name}`);
                }}
                className={`flex flex-col items-center p-3.5 rounded-xl border text-center transition-all duration-200 cursor-pointer group ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-md'
                    : 'border-border/80 bg-background/50 hover:bg-muted/60 hover:border-border'
                }`}
              >
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 shadow-sm bg-gradient-to-br ${preset.previewGradient}`}
                >
                  {isSelected && <Check className="w-5 h-5 text-white stroke-[3] drop-shadow-sm" />}
                </div>

                <div className="font-semibold text-xs text-foreground truncate w-full">
                  {preset.name}
                </div>
                <div className="text-[10px] text-muted-foreground truncate w-full mt-0.5">
                  {preset.tagline.split('&')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Live Interactive UI Preview Sandbox */}
      <section className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Live UI Preview Sandbox</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time interactive preview of your selected theme, gradients, and bubble styling.
            </p>
          </div>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full self-start">
            ● Live Synchronized
          </span>
        </div>

        {/* Mini Chat Card Container */}
        <div className="rounded-2xl border border-border/90 bg-background/80 overflow-hidden shadow-inner p-4 space-y-4">
          {/* Mini Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-gradient-to))] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                LC
              </div>
              <div>
                <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <span>LeoChat Studio</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[10px] text-muted-foreground">Active in real-time</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-gradient-to))] text-primary-foreground shadow-xs">
                3 Unread
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3 py-1">
            {/* Incoming Bubble */}
            <div className="flex items-start gap-2.5 max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                AI
              </div>
              <div>
                <div className="p-3 rounded-2xl rounded-tl-xs bg-muted text-foreground text-xs leading-relaxed border border-border/50 shadow-xs">
                  How do you like the new interface gradients and dark mode styling? ✨
                </div>
                <span className="text-[10px] text-muted-foreground ml-1 mt-1 inline-block">
                  12:42 PM
                </span>
              </div>
            </div>

            {/* Outgoing Bubble (Styled with Selected Theme & Bubble Option) */}
            <div className="flex flex-col items-end max-w-[85%] ml-auto">
              <div
                className={`p-3.5 rounded-2xl rounded-tr-xs text-xs leading-relaxed text-white shadow-md transition-all ${
                  bubbleStyle === 'gradient'
                    ? 'bg-gradient-to-br from-primary to-[hsl(var(--primary-gradient-to))] shadow-primary/20'
                    : bubbleStyle === 'solid'
                      ? 'bg-primary text-primary-foreground shadow-primary/25'
                      : 'bg-primary/20 text-foreground border border-primary/40 font-medium'
                }`}
              >
                The matching dark theme with glowing accents looks incredible! Highly professional
                and ultra-modern 🚀
              </div>

              {/* Interactive Reaction Pills */}
              <div className="flex items-center gap-1.5 mt-2">
                {Object.entries(reactionCounts).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleReactionClick(emoji)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-muted hover:bg-muted/80 border border-border/80 transition-transform active:scale-90 cursor-pointer shadow-xs"
                    title={`React ${emoji}`}
                  >
                    <span>{emoji}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mini Input Box */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/60">
            <div className="flex-1 px-3 py-2 rounded-xl bg-muted/60 border border-border/60 text-xs text-muted-foreground">
              Type your message here...
            </div>
            <button
              type="button"
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--primary-gradient-to))] text-white flex items-center justify-center shadow-md shadow-primary/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Send test message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Customization Options (Bubble Style, Font Size, Animations) */}
      <section className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <span>Chat & Display Preferences</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fine-tune bubble formats, font scaling, and animation speeds.
          </p>
        </div>

        {/* Bubble Style */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-2">
            Message Bubble Aesthetic
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'gradient',
                name: 'Gradient Flare',
                desc: 'Lush gradient matching the active accent color',
              },
              {
                id: 'solid',
                name: 'Solid Vibrant',
                desc: 'Vivid solid primary with clean punchy contrast',
              },
              {
                id: 'modern',
                name: 'Soft Translucent',
                desc: 'Modern subtle tint with colored border highlight',
              },
            ].map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  setBubbleStyle(style.id as BubbleStyleId);
                  toast.success(`Bubble style set to: ${style.name}`);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  bubbleStyle === style.id
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/5 font-semibold shadow-xs'
                    : 'border-border/80 bg-background/50 hover:bg-muted/60'
                }`}
              >
                <div className="text-xs font-semibold text-foreground">{style.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{style.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Scaling */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-2">
            Conversation Text Size
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'compact', label: 'Compact', size: '13px' },
              { id: 'normal', label: 'Standard', size: '14px' },
              { id: 'spacious', label: 'Spacious', size: '16px' },
            ].map((scale) => (
              <button
                key={scale.id}
                type="button"
                onClick={() => {
                  setTextSize(scale.id as MessageTextSize);
                  toast.success(`Text scaling set to: ${scale.label}`);
                }}
                className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                  textSize === scale.id
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/5 font-semibold text-primary shadow-xs'
                    : 'border-border/80 bg-background/50 hover:bg-muted/60 text-muted-foreground'
                }`}
              >
                <div className="text-xs font-semibold text-foreground">{scale.label}</div>
                <div className="text-[10px] text-muted-foreground">{scale.size}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Toggles: Glassmorphism, Sounds, Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">
          {/* Glassmorphism */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-border/80">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground">Glassmorphism</div>
              <div className="text-[11px] text-muted-foreground">Frosted backdrop blur</div>
            </div>
            <input
              type="checkbox"
              checked={glassmorphism}
              onChange={(e) => {
                setGlassmorphism(e.target.checked);
                toast.info(`Glassmorphism ${e.target.checked ? 'enabled' : 'disabled'}`);
              }}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-border/80">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-primary" />
                <span>Audio Cues</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Notification chimes</div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => {
                setSoundEnabled(e.target.checked);
                toast.info(`Sound effects ${e.target.checked ? 'enabled' : 'muted'}`);
              }}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          {/* Fluid Animations */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-border/80">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span>Motion & Speed</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {animations === 'full'
                  ? '60fps Smooth'
                  : animations === 'smooth'
                    ? 'Snappy'
                    : 'Reduced'}
              </div>
            </div>
            <select
              value={animations}
              onChange={(e) => {
                const val = e.target.value as AnimationLevel;
                setAnimations(val);
                toast.info(`Animation level set to ${val}`);
              }}
              className="text-xs rounded-lg border border-border bg-background px-2 py-1 text-foreground cursor-pointer focus:ring-primary"
            >
              <option value="full">Smooth 60fps</option>
              <option value="smooth">Snappy</option>
              <option value="reduced">Reduced</option>
            </select>
          </div>
        </div>
      </section>

      {/* 6. Snackbar & Toast Notification Showcase */}
      <section className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Snackbar & Toast System</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Test the redesigned glassmorphic snackbars with vibrant gradient badges and status
            glows.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={() =>
              toast.success('Settings saved successfully!', {
                description: 'All color themes and preferences applied across your session.',
              })
            }
            className="flex items-center gap-2 text-xs border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span>Preview Success</span>
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              toast.error('Network request failed', {
                description: 'Failed to synchronize with server. Retrying in 5 seconds...',
              })
            }
            className="flex items-center gap-2 text-xs border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span>Preview Error</span>
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              toast.warning('Storage reaching capacity', {
                description: 'You have used 85% of your available attachment media storage.',
              })
            }
            className="flex items-center gap-2 text-xs border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
          >
            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span>Preview Warning</span>
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              toast.info('New feature unlocked', {
                description: 'You can now select custom dark surface depth under Appearance.',
              })
            }
            className="flex items-center gap-2 text-xs border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400"
          >
            <div className="w-2 h-2 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
            <span>Preview Info</span>
          </Button>
        </div>
      </section>
    </div>
  );
};
