import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

export function ModernToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={(resolvedTheme as 'light' | 'dark' | 'system') || 'system'}
      position="top-right"
      closeButton
      richColors={false}
      expand={true}
      className="toaster group font-sans"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group toast flex items-start gap-3 w-full p-4 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-200 pointer-events-auto bg-white/95 text-slate-900 border-slate-200/80 shadow-slate-200/50 dark:bg-slate-900/90 dark:text-slate-100 dark:border-slate-800/80 dark:shadow-black/60',
          title: 'font-semibold text-sm leading-snug tracking-tight',
          description: 'text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed',
          actionButton:
            'inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity',
          cancelButton:
            'inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors',
          closeButton:
            '!bg-slate-100 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 hover:!text-slate-900 dark:hover:!text-slate-100 !border-slate-200 dark:!border-slate-700 !rounded-full !transition-colors',
          success:
            '!border-emerald-500/30 !bg-gradient-to-r !from-emerald-500/10 !via-white/95 !to-white/95 dark:!from-emerald-500/15 dark:!via-slate-900/95 dark:!to-slate-900/95 shadow-emerald-500/5',
          error:
            '!border-rose-500/30 !bg-gradient-to-r !from-rose-500/10 !via-white/95 !to-white/95 dark:!from-rose-500/15 dark:!via-slate-900/95 dark:!to-slate-900/95 shadow-rose-500/5',
          warning:
            '!border-amber-500/30 !bg-gradient-to-r !from-amber-500/10 !via-white/95 !to-white/95 dark:!from-amber-500/15 dark:!via-slate-900/95 dark:!to-slate-900/95 shadow-amber-500/5',
          info: '!border-sky-500/30 !bg-gradient-to-r !from-sky-500/10 !via-white/95 !to-white/95 dark:!from-sky-500/15 dark:!via-slate-900/95 dark:!to-slate-900/95 shadow-sky-500/5',
        },
      }}
      icons={{
        success: (
          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-500/30 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
        ),
        error: (
          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30 shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4 stroke-[2.5]" />
          </div>
        ),
        warning: (
          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          </div>
        ),
        info: (
          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30 shrink-0 mt-0.5">
            <Info className="w-4 h-4 stroke-[2.5]" />
          </div>
        ),
        loading: (
          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-primary/20 text-primary shrink-0 mt-0.5 animate-spin">
            <Loader2 className="w-4 h-4 stroke-[2.5]" />
          </div>
        ),
      }}
    />
  );
}
