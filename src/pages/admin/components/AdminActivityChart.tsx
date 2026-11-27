import { useEffect, useMemo, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import type { AdminStatsSeriesKey, AdminStatsSeriesResponse } from '@/features/admin';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

type ChartMode = 'line' | 'bar';

interface SeriesMeta {
  key: AdminStatsSeriesKey;
  label: string;
  stroke: string;
  dotClass: string;
  pillActiveClass: string;
}

const SERIES_CONFIG: SeriesMeta[] = [
  {
    key: 'messages',
    label: 'Messages',
    stroke: '#3b82f6',
    dotClass: 'bg-blue-500',
    pillActiveClass: 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    key: 'users',
    label: 'New Users',
    stroke: '#10b981',
    dotClass: 'bg-emerald-500',
    pillActiveClass:
      'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'conversations',
    label: 'Conversations',
    stroke: '#8b5cf6',
    dotClass: 'bg-violet-500',
    pillActiveClass: 'border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  {
    key: 'reports',
    label: 'Reports',
    stroke: '#f43f5e',
    dotClass: 'bg-rose-500',
    pillActiveClass: 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
];

const RANGE_OPTIONS = [
  { label: '7D', days: 7 },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
] as const;

const CHART_WIDTH = 860;
const CHART_HEIGHT = 270;
const PAD_LEFT = 42;
const PAD_RIGHT = 18;
const PAD_TOP = 18;
const PAD_BOTTOM = 34;

function formatShortDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'MMM d');
  } catch {
    return isoDate;
  }
}

function formatFullDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'MMM d, yyyy');
  } catch {
    return isoDate;
  }
}

function buildLinePath(coords: Array<{ x: number; y: number }>): string {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0]!.x} ${coords[0]!.y}`;
  return coords
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');
}

function buildAreaPath(coords: Array<{ x: number; y: number }>, baselineY: number): string {
  if (coords.length === 0) return '';
  const line = buildLinePath(coords);
  const last = coords[coords.length - 1]!;
  const first = coords[0]!;
  return `${line} L ${last.x.toFixed(1)} ${baselineY.toFixed(1)} L ${first.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;
}

export interface AdminActivityChartProps {
  data?: AdminStatsSeriesResponse;
  isLoading: boolean;
  isError: boolean;
  days: number;
  onDaysChange: (days: number) => void;
  onRetry?: () => void;
}

export function AdminActivityChart({
  data,
  isLoading,
  isError,
  days,
  onDaysChange,
  onRetry,
}: AdminActivityChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('line');
  const [visibleSeries, setVisibleSeries] = useState<Record<AdminStatsSeriesKey, boolean>>({
    messages: true,
    users: true,
    conversations: true,
    reports: true,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [playCycle, setPlayCycle] = useState(1);

  const sectionRef = useRef<HTMLElement | null>(null);
  const wasInViewRef = useRef(true);
  const prefersReducedMotion = useReducedMotion();

  // Replay entrance draw/bar animation every time the chart section scrolls back into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!wasInViewRef.current) {
              wasInViewRef.current = true;
              setPlayCycle((prev) => prev + 1);
            }
          } else {
            wasInViewRef.current = false;
          }
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleSeries = (key: AdminStatsSeriesKey) => {
    setVisibleSeries((prev) => {
      const enabledCount = Object.values(prev).filter(Boolean).length;
      if (prev[key] && enabledCount <= 1) {
        return prev;
      }
      return { ...prev, [key]: !prev[key] };
    });
  };

  const activeSeries = useMemo(
    () => SERIES_CONFIG.filter((s) => visibleSeries[s.key]),
    [visibleSeries],
  );

  const dates = useMemo(() => {
    if (!data?.series) return [];
    const base =
      data.series.messages ??
      data.series.users ??
      data.series.conversations ??
      data.series.reports ??
      [];
    return base.map((p) => p.date);
  }, [data]);

  const seriesTotals = useMemo(() => {
    const totals: Record<AdminStatsSeriesKey, number> = {
      messages: 0,
      users: 0,
      conversations: 0,
      reports: 0,
    };
    if (!data?.series) return totals;
    for (const cfg of SERIES_CONFIG) {
      const points = data.series[cfg.key] ?? [];
      totals[cfg.key] = points.reduce((sum, pt) => sum + (pt.value || 0), 0);
    }
    return totals;
  }, [data]);

  const plotWidth = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const baselineY = PAD_TOP + plotHeight;

  const { yMax, yTicks } = useMemo(() => {
    let peak = 0;
    if (data?.series) {
      for (const cfg of activeSeries) {
        const points = data.series[cfg.key] ?? [];
        for (const pt of points) {
          if (pt.value > peak) peak = pt.value;
        }
      }
    }
    const rawMax = Math.max(4, peak);
    const step = rawMax <= 8 ? 2 : Math.ceil(rawMax / 4);
    const niceMax = step * 4;
    return {
      yMax: niceMax,
      yTicks: [0, step, step * 2, step * 3, niceMax],
    };
  }, [data, activeSeries]);

  const xForIndex = (idx: number, count: number): number => {
    if (count <= 1) return PAD_LEFT + plotWidth / 2;
    return PAD_LEFT + (idx / (count - 1)) * plotWidth;
  };

  const yForValue = (val: number): number => {
    const ratio = yMax === 0 ? 0 : Math.min(1, Math.max(0, val / yMax));
    return baselineY - ratio * plotHeight;
  };

  const xTickIndices = useMemo(() => {
    const n = dates.length;
    if (n === 0) return [];
    if (n <= 7) return dates.map((_, i) => i);
    const desired = 6;
    const indices = new Set<number>();
    for (let i = 0; i < desired; i++) {
      indices.add(Math.round((i / (desired - 1)) * (n - 1)));
    }
    return Array.from(indices).sort((a, b) => a - b);
  }, [dates]);

  const safeHoveredIndex =
    hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < dates.length ? hoveredIndex : null;

  const animKey = `${chartMode}-${days}-${playCycle}`;
  const hoverBandWidth = plotWidth / Math.max(1, dates.length);

  return (
    <motion.section
      ref={sectionRef}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card text-card-foreground rounded-2xl p-5 sm:p-6 border border-border shadow-xs hover:border-primary/25 hover:shadow-md transition-all duration-300 mb-8"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Platform Activity Trend
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data?.from && data?.to
              ? `Daily activity from ${formatFullDate(data.from)} to ${formatFullDate(data.to)} (UTC)`
              : `Daily users, conversations, messages, and reports over the last ${days} days`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Line vs Bar Mode Toggle */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-muted border border-border/60">
            <button
              type="button"
              onClick={() => setChartMode('line')}
              aria-pressed={chartMode === 'line'}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                chartMode === 'line'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('bar')}
              aria-pressed={chartMode === 'bar'}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                chartMode === 'bar'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bars</span>
            </button>
          </div>

          {/* Days Selector */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-muted border border-border/60">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => onDaysChange(opt.days)}
                aria-pressed={days === opt.days}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  days === opt.days
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Series Filter Legend Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {SERIES_CONFIG.map((cfg) => {
          const isVisible = visibleSeries[cfg.key];
          return (
            <motion.button
              key={cfg.key}
              type="button"
              whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              onClick={() => toggleSeries(cfg.key)}
              aria-pressed={isVisible}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isVisible
                  ? cfg.pillActiveClass
                  : 'border-border/70 bg-muted/40 text-muted-foreground opacity-60 hover:opacity-90'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
              <span>{cfg.label}</span>
              <span className="font-mono text-[11px] opacity-85">
                {isLoading ? '…' : seriesTotals[cfg.key].toLocaleString()}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Chart Area */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          <Skeleton className="h-[240px] w-full rounded-xl" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-border text-center">
          <AlertTriangle className="w-7 h-7 text-amber-500 mb-2" />
          <p className="text-sm font-semibold text-foreground">Unable to load chart telemetry</p>
          <p className="text-xs text-muted-foreground mt-1">
            Failed to fetch daily series from `/api/v1/admin/stats/timeseries`.
          </p>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3 rounded-xl text-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Retry
            </Button>
          )}
        </div>
      ) : dates.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          No chart data available for this range.
        </div>
      ) : (
        <div className="relative w-full" onMouseLeave={() => setHoveredIndex(null)}>
          {/* Animated Hover Tooltip */}
          <AnimatePresence>
            {safeHoveredIndex !== null && dates[safeHoveredIndex] && (
              <motion.div
                key={`tooltip-${safeHoveredIndex}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="pointer-events-none absolute top-2 z-20 rounded-xl border border-border/90 bg-card/95 backdrop-blur-md shadow-xl px-3.5 py-2.5 text-xs min-w-[175px]"
                style={{
                  left: safeHoveredIndex > dates.length / 2 ? '16px' : undefined,
                  right: safeHoveredIndex <= dates.length / 2 ? '16px' : undefined,
                }}
              >
                <p className="font-semibold text-foreground mb-1.5 border-b border-border/60 pb-1">
                  {formatFullDate(dates[safeHoveredIndex]!)}
                </p>
                <div className="space-y-1">
                  {activeSeries.map((cfg) => {
                    const val = data?.series[cfg.key]?.[safeHoveredIndex]?.value ?? 0;
                    return (
                      <div key={cfg.key} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                          {cfg.label}
                        </span>
                        <span className="font-mono font-semibold text-foreground">
                          {val.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="w-full h-[250px] sm:h-[280px] overflow-visible select-none"
            role="img"
            aria-label="Admin platform daily activity chart"
          >
            <defs>
              {SERIES_CONFIG.map((cfg) => (
                <linearGradient
                  key={cfg.key}
                  id={`admin-area-${cfg.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={cfg.stroke} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={cfg.stroke} stopOpacity="0.01" />
                </linearGradient>
              ))}
            </defs>

            {/* Horizontal Gridlines & Y Ticks */}
            {yTicks.map((tick) => {
              const y = yForValue(tick);
              return (
                <g key={tick}>
                  <line
                    x1={PAD_LEFT}
                    y1={y}
                    x2={CHART_WIDTH - PAD_RIGHT}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={tick === 0 ? 0.16 : 0.08}
                    strokeDasharray={tick === 0 ? undefined : '4 4'}
                  />
                  <text
                    x={PAD_LEFT - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="fill-muted-foreground text-[10px] font-mono"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* X-axis Labels */}
            {xTickIndices.map((idx) => (
              <text
                key={dates[idx]}
                x={xForIndex(idx, dates.length)}
                y={CHART_HEIGHT - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-medium"
              >
                {formatShortDate(dates[idx]!)}
              </text>
            ))}

            {/* Animated Hover Crosshair & Highlight Band */}
            {safeHoveredIndex !== null && (
              <g>
                <motion.rect
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  x={Math.max(
                    PAD_LEFT,
                    xForIndex(safeHoveredIndex, dates.length) - hoverBandWidth / 2,
                  )}
                  y={PAD_TOP}
                  width={hoverBandWidth}
                  height={plotHeight}
                  rx={6}
                  fill="currentColor"
                  fillOpacity={0.04}
                />
                <motion.line
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  x1={xForIndex(safeHoveredIndex, dates.length)}
                  y1={PAD_TOP}
                  x2={xForIndex(safeHoveredIndex, dates.length)}
                  y2={baselineY}
                  stroke="currentColor"
                  strokeOpacity={0.28}
                  strokeDasharray="3 3"
                />
              </g>
            )}

            {/* Animated Data Paths or Bars */}
            {chartMode === 'line' ? (
              <g key={animKey}>
                {activeSeries.map((cfg, sIdx) => {
                  const points = data?.series[cfg.key] ?? [];
                  const coords = points.map((pt, idx) => ({
                    x: xForIndex(idx, dates.length),
                    y: yForValue(pt.value),
                  }));
                  const linePath = buildLinePath(coords);
                  const areaPath = buildAreaPath(coords, baselineY);
                  return (
                    <g key={cfg.key}>
                      <motion.path
                        d={areaPath}
                        fill={`url(#admin-area-${cfg.key})`}
                        initial={prefersReducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.55,
                          delay: 0.2 + sIdx * 0.08,
                          ease: 'easeOut',
                        }}
                      />
                      <motion.path
                        d={linePath}
                        fill="none"
                        stroke={cfg.stroke}
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0.35 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                          pathLength: {
                            duration: 0.85,
                            delay: sIdx * 0.08,
                            ease: [0.22, 1, 0.36, 1],
                          },
                          opacity: { duration: 0.25 },
                        }}
                      />
                    </g>
                  );
                })}

                {/* Glowing Animated Highlight Dots on Hovered Day */}
                {safeHoveredIndex !== null &&
                  activeSeries.map((cfg) => {
                    const pt = data?.series[cfg.key]?.[safeHoveredIndex];
                    if (!pt) return null;
                    const cx = xForIndex(safeHoveredIndex, dates.length);
                    const cy = yForValue(pt.value);
                    return (
                      <g key={`dot-${cfg.key}`}>
                        <motion.circle
                          cx={cx}
                          cy={cy}
                          r={10}
                          fill={cfg.stroke}
                          initial={prefersReducedMotion ? false : { scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.22 }}
                          transition={{ duration: 0.2 }}
                        />
                        <motion.circle
                          cx={cx}
                          cy={cy}
                          r={4.75}
                          fill={cfg.stroke}
                          stroke="var(--background, #ffffff)"
                          strokeWidth={2}
                          initial={prefersReducedMotion ? false : { scale: 0.6 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                        />
                      </g>
                    );
                  })}
              </g>
            ) : (
              <g key={animKey}>
                {dates.map((dateStr, idx) => {
                  const slotWidth = plotWidth / Math.max(1, dates.length);
                  const groupWidth = Math.min(slotWidth * 0.78, 34);
                  const barWidth = Math.max(
                    2,
                    (groupWidth - (activeSeries.length - 1) * 1.5) /
                      Math.max(1, activeSeries.length),
                  );
                  const centerX = xForIndex(idx, dates.length);
                  const startX = centerX - groupWidth / 2;
                  const isDayHovered = safeHoveredIndex === idx;
                  const delay = Math.min(0.45, (idx / Math.max(1, dates.length)) * 0.35);

                  return (
                    <g key={dateStr}>
                      {activeSeries.map((cfg, sIdx) => {
                        const val = data?.series[cfg.key]?.[idx]?.value ?? 0;
                        const targetY = yForValue(val);
                        const targetHeight = Math.max(val > 0 ? 2 : 0, baselineY - targetY);
                        const barX = startX + sIdx * (barWidth + 1.5);
                        return (
                          <motion.rect
                            key={`${dateStr}-${cfg.key}`}
                            x={barX}
                            width={barWidth}
                            rx={Math.min(3, barWidth / 2)}
                            fill={cfg.stroke}
                            initial={
                              prefersReducedMotion
                                ? { y: targetY, height: targetHeight, opacity: 0.9 }
                                : { y: baselineY, height: 0, opacity: 0.2 }
                            }
                            animate={{
                              y: isDayHovered && val > 0 ? targetY - 2 : targetY,
                              height: isDayHovered && val > 0 ? targetHeight + 2 : targetHeight,
                              opacity: safeHoveredIndex === null || isDayHovered ? 0.94 : 0.4,
                            }}
                            transition={{
                              y: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
                              height: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
                              opacity: { duration: 0.16 },
                            }}
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </g>
            )}

            {/* Invisible Hover Hit Bands for Smooth Tooltip Scrubbing */}
            {dates.map((dateStr, idx) => {
              const x =
                dates.length <= 1 ? PAD_LEFT : xForIndex(idx, dates.length) - hoverBandWidth / 2;
              return (
                <rect
                  key={`hit-${dateStr}`}
                  x={Math.max(PAD_LEFT, x)}
                  y={PAD_TOP}
                  width={hoverBandWidth}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
              );
            })}
          </svg>
        </div>
      )}
    </motion.section>
  );
}
