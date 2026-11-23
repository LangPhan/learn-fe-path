import { useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useApp } from '@/contexts/AppContext';

type RetryPolicy = 'fixed' | 'exponential' | 'full-jitter';

function generateWaves(policy: RetryPolicy, clients: number, baseMs: number): number[][] {
  const waves: number[][] = [];
  for (let c = 0; c < clients; c++) {
    const timestamps: number[] = [0];
    let t = 0;
    for (let attempt = 0; attempt < 4; attempt++) {
      let wait = baseMs;
      if (policy === 'exponential') {
        wait = baseMs * Math.pow(2, attempt);
      } else if (policy === 'full-jitter') {
        wait = Math.round(Math.random() * baseMs * Math.pow(2, attempt));
      }
      t += Math.max(40, wait);
      timestamps.push(t);
    }
    waves.push(timestamps);
  }
  return waves;
}

export default function RetryBackoffVisualizer() {
  const { locale } = useApp();
  const [policy, setPolicy] = useState<RetryPolicy>('full-jitter');
  const [clients, setClients] = useState(12);
  const [seed, setSeed] = useState(1);

  const waves = (() => {
    void seed;
    return generateWaves(policy, clients, 200);
  })();

  const maxMs = Math.max(3200, ...waves.flat());
  // Compute peak concurrent collisions within 100ms buckets
  const buckets = new Map<number, number>();
  waves.forEach((clientTimes) => {
    clientTimes.slice(1).forEach((ms) => {
      const b = Math.floor(ms / 100);
      buckets.set(b, (buckets.get(b) ?? 0) + 1);
    });
  });
  const peakSpike = Math.max(0, ...Array.from(buckets.values()));

  return (
    <VisualizerFrame
      title={{ vi: 'Mô phỏng Retry: Fixed vs Exponential vs Full Jitter', en: 'Thundering Herd Simulator: Fixed vs Exponential vs Jitter' }}
      description={{
        vi: 'Quan sát 12+ client đồng loạt gặp lỗi lúc 0ms tái kết nối. Thiếu Jitter khiến mọi client dội lại đúng cùng một tích tắc!',
        en: 'Watch concurrent clients failing at t=0 retry across time. Without jitter, retries hit the server in synchronized spikes.',
      }}
      onReset={() => {
        setPolicy('full-jitter');
        setClients(12);
        setSeed((s) => s + 1);
      }}
      actions={
        <Button type="button" size="xs" variant="outline" onClick={() => setSeed((s) => s + 1)}>
          {locale === 'vi' ? 'Random lại' : 'Re-sample'}
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={policy} onValueChange={(v) => setPolicy(v as RetryPolicy)}>
            <TabsList>
              <TabsTrigger value="fixed">Fixed (200ms)</TabsTrigger>
              <TabsTrigger value="exponential">Exp Backoff</TabsTrigger>
              <TabsTrigger value="full-jitter">Exp + Full Jitter</TabsTrigger>
            </TabsList>
          </Tabs>
          <Badge variant={peakSpike >= clients ? 'destructive' : peakSpike <= 4 ? 'default' : 'secondary'} className="font-mono text-xs tabular-nums">
            Peak 100ms Spike: {peakSpike} reqs
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">{locale === 'vi' ? 'Số Clients đồng thời:' : 'Concurrent Clients:'}</span>
          <div className="w-40">
            <Slider min={4} max={20} step={2} value={[clients]} onValueChange={(v) => setClients(Array.isArray(v) ? v[0] : v)} />
          </div>
          <span className="font-mono tabular-nums">{clients}</span>
        </div>

        <div className="space-y-1.5 rounded-md border border-border bg-background/70 p-3">
          {waves.map((times, clientIdx) => (
            <div key={clientIdx} className="flex items-center gap-2">
              <span className="w-14 shrink-0 font-mono text-[10px] text-muted-foreground">C#{clientIdx + 1}</span>
              <div className="relative h-3 flex-1 rounded bg-muted/40">
                {times.map((ms, attemptIdx) => (
                  <span
                    key={attemptIdx}
                    title={`Attempt ${attemptIdx}: ${ms}ms`}
                    className={`absolute top-0.5 size-2 -translate-x-1/2 rounded-full ${
                      attemptIdx === 0 ? 'bg-rose-500' : policy === 'full-jitter' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ left: `${Math.min(98, (ms / maxMs) * 100)}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-between pt-1 font-mono text-[10px] text-muted-foreground">
            <span>0ms (Outage)</span>
            <span>{Math.round(maxMs / 2)}ms</span>
            <span>{maxMs}ms</span>
          </div>
        </div>
      </div>
    </VisualizerFrame>
  );
}
