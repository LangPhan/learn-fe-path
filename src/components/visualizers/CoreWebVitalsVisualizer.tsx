import { useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';

export default function CoreWebVitalsVisualizer() {
  const { locale } = useApp();
  const [heroPreload, setHeroPreload] = useState(true);
  const [reservedDimensions, setReservedDimensions] = useState(true);
  const [chunkLongTasks, setChunkLongTasks] = useState(true);
  const [clsTriggered, setClsTriggered] = useState(false);
  const [thrashResult, setThrashResult] = useState<{ unbatchedMs: number; batchedMs: number } | null>(null);

  const lcpMs = heroPreload ? 1450 : 3400;
  const inpMs = chunkLongTasks ? 85 : 390;
  const clsScore = reservedDimensions ? 0.01 : clsTriggered ? 0.29 : 0.04;

  const badgeFor = (val: number, good: number, poor: number) => {
    if (val <= good) return { label: 'GOOD', variant: 'default' as const, pct: 95 };
    if (val <= poor) return { label: 'NEEDS WORK', variant: 'secondary' as const, pct: 55 };
    return { label: 'POOR', variant: 'destructive' as const, pct: 22 };
  };

  const runThrashingBenchmark = () => {
    const items = Array.from({ length: 600 }, (_, i) => i + 10);
    // Simulate heavy read/write benchmark on off-screen detached nodes safely
    const t0 = performance.now();
    let acc1 = 0;
    for (let i = 0; i < items.length; i++) {
      acc1 += Math.sqrt(items[i] * 13.7);
      const dummy = document.createElement('div');
      dummy.style.width = `${i % 50}px`;
      acc1 += dummy.style.width.length;
    }
    const unbatchedMs = Number((performance.now() - t0).toFixed(2));

    const t1 = performance.now();
    const frag = document.createDocumentFragment();
    let acc2 = 0;
    for (let i = 0; i < items.length; i++) acc2 += Math.sqrt(items[i] * 13.7);
    const box = document.createElement('div');
    box.style.width = `${acc2 % 50}px`;
    frag.appendChild(box);
    const batchedMs = Number((performance.now() - t1).toFixed(2));
    void acc1;

    setThrashResult({ unbatchedMs: Math.max(0.2, unbatchedMs), batchedMs: Math.max(0.05, batchedMs) });
  };

  const lcpState = badgeFor(lcpMs, 2500, 4000);
  const inpState = badgeFor(inpMs, 200, 500);
  const clsState = badgeFor(clsScore, 0.1, 0.25);

  return (
    <VisualizerFrame
      title={{ vi: 'Core Web Vitals Lab (LCP / INP / CLS) & Layout Thrashing', en: 'Core Web Vitals Lab (LCP / INP / CLS) & DOM Batching' }}
      description={{
        vi: 'Bật/tắt các kỹ thuật tối ưu thực chiến để xem tác động tức thì lên LCP, INP, CLS và thử nghiệm giả lập nhảy layout CLS.',
        en: 'Toggle real optimizations to watch LCP, INP, and CLS shift between Good and Poor thresholds.',
      }}
      onReset={() => {
        setHeroPreload(true);
        setReservedDimensions(true);
        setChunkLongTasks(true);
        setClsTriggered(false);
        setThrashResult(null);
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/20 p-3 text-xs">
            <div>
              <div className="font-semibold">Hero `fetchpriority="high"`</div>
              <div className="text-muted-foreground">{locale === 'vi' ? 'Không lazy-load LCP' : 'Avoid lazy on LCP'}</div>
            </div>
            <Switch checked={heroPreload} onCheckedChange={setHeroPreload} aria-label="Toggle hero preload" />
          </div>

          <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/20 p-3 text-xs">
            <div>
              <div className="font-semibold">Break Long Tasks (&gt;50ms)</div>
              <div className="text-muted-foreground">{locale === 'vi' ? 'Chia nhỏ / Worker' : 'Yield main thread'}</div>
            </div>
            <Switch checked={chunkLongTasks} onCheckedChange={setChunkLongTasks} aria-label="Toggle chunking long tasks" />
          </div>

          <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/20 p-3 text-xs">
            <div>
              <div className="font-semibold">Reserve `width/height`</div>
              <div className="text-muted-foreground">{locale === 'vi' ? 'Giữ chỗ aspect-ratio' : 'Explicit aspect box'}</div>
            </div>
            <Switch
              checked={reservedDimensions}
              onCheckedChange={(v) => {
                setReservedDimensions(v);
                setClsTriggered(!v);
              }}
              aria-label="Toggle reserved aspect ratio"
            />
          </div>
        </div>

        {/* CWV Gauges */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5 rounded-md border border-border p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">LCP (&lt;= 2.5s)</span>
              <Badge variant={lcpState.variant} className="text-[10px]">{lcpState.label}</Badge>
            </div>
            <div className="font-mono text-lg font-bold tabular-nums">{(lcpMs / 1000).toFixed(2)}s</div>
            <Progress value={lcpState.pct} />
          </div>

          <div className="space-y-1.5 rounded-md border border-border p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">INP (&lt;= 200ms)</span>
              <Badge variant={inpState.variant} className="text-[10px]">{inpState.label}</Badge>
            </div>
            <div className="font-mono text-lg font-bold tabular-nums">{inpMs}ms</div>
            <Progress value={inpState.pct} />
          </div>

          <div className="space-y-1.5 rounded-md border border-border p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">CLS (&lt;= 0.10)</span>
              <Badge variant={clsState.variant} className="text-[10px]">{clsState.label}</Badge>
            </div>
            <div className="font-mono text-lg font-bold tabular-nums">{clsScore.toFixed(2)}</div>
            <Progress value={clsState.pct} />
          </div>
        </div>

        {/* CLS Live Visual Box + Thrashing Test */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 rounded-md border border-border bg-muted/20 p-3 text-xs">
            <div className="flex items-center justify-between">
              <strong>{locale === 'vi' ? 'Demo nhảy layout (CLS)' : 'Live CLS Shift Preview'}</strong>
              <Button type="button" size="xs" variant="outline" onClick={() => setClsTriggered((c) => !c)}>
                {clsTriggered ? (locale === 'vi' ? 'Ẩn ảnh trễ' : 'Reset Late Image') : (locale === 'vi' ? 'Giả lập ảnh tải trễ' : 'Simulate Late Image')}
              </Button>
            </div>
            <div className="rounded border border-border bg-card p-2.5">
              {(reservedDimensions || clsTriggered) && (
                <div
                  className="mb-2 flex items-center justify-center rounded border border-sky-500/30 bg-sky-500/10 font-mono text-[11px] text-sky-400 transition-all"
                  style={{ height: reservedDimensions ? 48 : clsTriggered ? 48 : 0 }}
                >
                  {reservedDimensions ? 'Reserved 48px Banner Slot (CLS = 0)' : 'Late Unreserved Banner (PUSHED TEXT DOWN!)'}
                </div>
              )}
              <div className="font-medium">Article Body Paragraph</div>
              <div className="text-muted-foreground">Notice if this text jumps downward when the image arrives!</div>
            </div>
          </div>

          <div className="space-y-2 rounded-md border border-border bg-muted/20 p-3 text-xs">
            <div className="flex items-center justify-between">
              <strong>DOM Allocation vs Batching Benchmark</strong>
              <Button type="button" size="xs" onClick={runThrashingBenchmark}>
                {locale === 'vi' ? 'Đo thử 600 nodes' : 'Run 600-Node Bench'}
              </Button>
            </div>
            {thrashResult ? (
              <div className="space-y-1 rounded border border-border bg-card p-2.5 font-mono">
                <div>Per-item DOM ops: <span className="text-amber-400">{thrashResult.unbatchedMs}ms</span></div>
                <div>Batched Fragment: <span className="text-emerald-400">{thrashResult.batchedMs}ms</span></div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {locale === 'vi' ? 'Bấm chạy để đo trực tiếp tốc độ gom DOM batch trên trình duyệt của bạn.' : 'Run to benchmark batched Fragment vs individual allocations on your CPU.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </VisualizerFrame>
  );
}
