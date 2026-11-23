import { useCallback, useEffect, useRef, useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface TrackTick {
  id: number;
  offsetPct: number;
}

const WINDOW_MS = 4500;

export default function DebounceThrottleVisualizer() {
  const { locale } = useApp();
  const [waitMs, setWaitMs] = useState(350);
  const [rawTicks, setRawTicks] = useState<TrackTick[]>([]);
  const [debounceTicks, setDebounceTicks] = useState<TrackTick[]>([]);
  const [throttleTicks, setThrottleTicks] = useState<TrackTick[]>([]);

  const startRef = useRef<number>(Date.now());
  const debTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastThrottleRef = useRef<number>(0);

  const getOffsetPct = () => {
    const now = Date.now();
    if (now - startRef.current > WINDOW_MS) {
      startRef.current = now;
      setRawTicks([]);
      setDebounceTicks([]);
      setThrottleTicks([]);
      return 2;
    }
    return Math.min(98, ((now - startRef.current) / WINDOW_MS) * 100);
  };

  useEffect(() => {
    return () => {
      if (debTimerRef.current) clearTimeout(debTimerRef.current);
    };
  }, []);

  const triggerEvent = useCallback(() => {
    const pct = getOffsetPct();
    setRawTicks((prev) => [...prev, { id: Date.now() + Math.random(), offsetPct: pct }]);

    // Debounce trailing
    if (debTimerRef.current) clearTimeout(debTimerRef.current);
    debTimerRef.current = setTimeout(() => {
      const debPct = Math.min(98, ((Date.now() - startRef.current) / WINDOW_MS) * 100);
      setDebounceTicks((prev) => [...prev, { id: Date.now() + Math.random(), offsetPct: debPct }]);
    }, waitMs);

    // Throttle leading
    const now = Date.now();
    if (now - lastThrottleRef.current >= waitMs) {
      lastThrottleRef.current = now;
      setThrottleTicks((prev) => [...prev, { id: Date.now() + Math.random(), offsetPct: pct }]);
    }
  }, [waitMs]);

  const reset = () => {
    if (debTimerRef.current) clearTimeout(debTimerRef.current);
    lastThrottleRef.current = 0;
    startRef.current = Date.now();
    setRawTicks([]);
    setDebounceTicks([]);
    setThrottleTicks([]);
  };

  const renderTrack = (label: string, ticks: TrackTick[], barClass: string) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <Badge variant="outline" className="font-mono text-[10px] tabular-nums">
          {ticks.length} calls
        </Badge>
      </div>
      <div className="relative h-7 w-full overflow-hidden rounded border border-border/70 bg-muted/30">
        {ticks.map((tick) => (
          <div
            key={tick.id}
            className={`absolute top-1 bottom-1 w-1 rounded-full ${barClass}`}
            style={{ left: `${tick.offsetPct}%` }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <VisualizerFrame
      title={{ vi: 'Biểu đồ Timeline: Raw vs Debounce vs Throttle', en: 'Live Event Plotter: Raw vs Debounce vs Throttle' }}
      description={{
        vi: 'Di chuột nhanh qua khung cảm biến bên dưới hoặc bấm liên tục để thấy 3 làn sự kiện vẽ theo thời gian thực.',
        en: 'Move your pointer across the sensor box or click rapidly to plot Raw, Debounced, and Throttled streams live.',
      }}
      onReset={reset}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3 text-xs">
            <span className="shrink-0 text-muted-foreground">Delay (wait):</span>
            <div className="max-w-52 flex-1">
              <Slider min={100} max={900} step={50} value={[waitMs]} onValueChange={(v) => setWaitMs(Array.isArray(v) ? v[0] : v)} />
            </div>
            <span className="font-mono tabular-nums">{waitMs}ms</span>
          </div>
          <Button type="button" size="sm" onClick={triggerEvent}>
            {locale === 'vi' ? 'Bấm nhanh (Click Burst)' : 'Click Burst'}
          </Button>
        </div>

        <div
          onMouseMove={triggerEvent}
          onTouchMove={triggerEvent}
          className="flex h-20 cursor-crosshair items-center justify-center rounded-md border border-dashed border-primary/50 bg-primary/5 px-4 text-center text-xs text-muted-foreground select-none"
        >
          {locale === 'vi'
            ? 'Di chuột hoặc lướt tay qua vùng này liên tục rồi dừng lại để xem kết quả trên 3 làn...'
            : 'Sweep your pointer continuously across this sensor area, then pause to watch the 3 lanes...'}
        </div>

        <div className="space-y-2.5">
          {renderTrack('1. Raw Pointer / Input Stream', rawTicks, 'bg-slate-400')}
          {renderTrack(`2. Debounced (${waitMs}ms trailing)`, debounceTicks, 'bg-sky-400')}
          {renderTrack(`3. Throttled (${waitMs}ms cadence)`, throttleTicks, 'bg-emerald-400')}
        </div>
      </div>
    </VisualizerFrame>
  );
}
