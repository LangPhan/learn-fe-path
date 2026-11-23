import { useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

type Strategy = 'CSR' | 'SSR' | 'ISR' | 'EDGE_SSR' | 'RSC';

interface StageMetric {
  label: string;
  start: number;
  duration: number;
  color: string;
}

export default function RenderingStrategyVisualizer() {
  const { locale } = useApp();
  const [strategy, setStrategy] = useState<Strategy>('SSR');
  const [networkLatency, setNetworkLatency] = useState(120);
  const [dbLatency, setDbLatency] = useState(180);
  const [bundleSizeKB, setBundleSizeKB] = useState(280);
  const [isrStale, setIsrStale] = useState(false);

  const jsTime = Math.round((bundleSizeKB / 140) * 120);

  const computeWaterfall = (): {
    stages: StageMetric[];
    ttfb: number;
    fcp: number;
    tti: number;
    seoReady: boolean;
    clientJsKB: number;
  } => {
    const net = networkLatency;
    const db = dbLatency;

    if (strategy === 'CSR') {
      const ttfb = Math.round(net * 0.6 + 20);
      const jsEnd = ttfb + net + jsTime;
      const apiEnd = jsEnd + net + db;
      return {
        ttfb,
        fcp: jsEnd,
        tti: apiEnd + 40,
        seoReady: false,
        clientJsKB: bundleSizeKB,
        stages: [
          { label: 'HTML Shell', start: 0, duration: ttfb, color: 'bg-sky-500' },
          { label: 'JS Download + Parse', start: ttfb, duration: net + jsTime, color: 'bg-amber-500' },
          { label: 'Client Data Fetch', start: jsEnd, duration: net + db, color: 'bg-rose-500' },
          { label: 'Interactive Render', start: apiEnd, duration: 40, color: 'bg-emerald-500' },
        ],
      };
    }

    if (strategy === 'SSR') {
      const ttfb = net + db + 40;
      const htmlPaint = ttfb + 40;
      const hydrateEnd = htmlPaint + net + jsTime;
      return {
        ttfb,
        fcp: htmlPaint,
        tti: hydrateEnd,
        seoReady: true,
        clientJsKB: bundleSizeKB,
        stages: [
          { label: 'Origin Server DB + HTML', start: 0, duration: ttfb, color: 'bg-orange-500' },
          { label: 'First Paint (HTML)', start: ttfb, duration: 40, color: 'bg-sky-500' },
          { label: 'JS Download + Hydration', start: htmlPaint, duration: net + jsTime, color: 'bg-emerald-500' },
        ],
      };
    }

    if (strategy === 'ISR') {
      const edgeTtfb = Math.round(net * 0.3 + 15);
      const htmlPaint = edgeTtfb + 25;
      const hydrateEnd = htmlPaint + net + jsTime;
      const stages: StageMetric[] = [
        { label: isrStale ? 'CDN Stale HTML Hit' : 'CDN Cached HTML Hit', start: 0, duration: edgeTtfb, color: 'bg-cyan-500' },
        { label: 'First Paint', start: edgeTtfb, duration: 25, color: 'bg-sky-500' },
        { label: 'JS Hydration', start: htmlPaint, duration: net + jsTime, color: 'bg-emerald-500' },
      ];
      if (isrStale) {
        stages.push({ label: 'Async Background Rebuild', start: edgeTtfb, duration: db + 60, color: 'bg-amber-500/70' });
      }
      return {
        ttfb: edgeTtfb,
        fcp: htmlPaint,
        tti: hydrateEnd,
        seoReady: true,
        clientJsKB: bundleSizeKB,
        stages,
      };
    }

    if (strategy === 'EDGE_SSR') {
      const edgeNet = Math.round(net * 0.3);
      const ttfb = edgeNet + db + 20;
      const htmlPaint = ttfb + 30;
      const hydrateEnd = htmlPaint + edgeNet + jsTime;
      return {
        ttfb,
        fcp: htmlPaint,
        tti: hydrateEnd,
        seoReady: true,
        clientJsKB: bundleSizeKB,
        stages: [
          { label: 'Edge PoP SSR + DB', start: 0, duration: ttfb, color: 'bg-teal-500' },
          { label: 'First Paint', start: ttfb, duration: 30, color: 'bg-sky-500' },
          { label: 'JS Hydration', start: htmlPaint, duration: edgeNet + jsTime, color: 'bg-emerald-500' },
        ],
      };
    }

    // RSC: Server components eliminate non-interactive JS payload (~55% lighter client JS)
    const rscJsKB = Math.round(bundleSizeKB * 0.42);
    const rscJsTime = Math.round((rscJsKB / 140) * 120);
    const ttfb = Math.round(net * 0.7 + 45);
    const streamEnd = ttfb + db;
    const islandHydrate = streamEnd + Math.round(net * 0.6) + rscJsTime;
    return {
      ttfb,
      fcp: ttfb + 25,
      tti: islandHydrate,
      seoReady: true,
      clientJsKB: rscJsKB,
      stages: [
        { label: 'Streaming Shell', start: 0, duration: ttfb, color: 'bg-sky-500' },
        { label: 'Streamed RSC Payload', start: ttfb, duration: db, color: 'bg-cyan-500' },
        { label: 'Client Islands Hydration', start: ttfb + 25, duration: Math.round(net * 0.6) + rscJsTime, color: 'bg-emerald-500' },
      ],
    };
  };

  const sim = computeWaterfall();
  const maxAxis = Math.max(800, sim.tti + 60, ...sim.stages.map((s) => s.start + s.duration));

  return (
    <VisualizerFrame
      title={{ vi: 'Mô phỏng Waterfall: CSR vs SSR vs ISR vs Edge vs RSC', en: 'Rendering Waterfall: CSR vs SSR vs ISR vs Edge vs RSC' }}
      description={{
        vi: 'Thay đổi độ trễ mạng, tốc độ DB và kích thước JS bundle để quan sát TTFB, FCP, TTI và luồng thực thi khác nhau ra sao.',
        en: 'Adjust network RTT, database latency, and JS bundle size to inspect TTFB, FCP, TTI, and waterfall stages.',
      }}
      onReset={() => {
        setStrategy('SSR');
        setNetworkLatency(120);
        setDbLatency(180);
        setBundleSizeKB(280);
        setIsrStale(false);
      }}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs value={strategy} onValueChange={(v) => setStrategy(v as Strategy)}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="CSR">CSR</TabsTrigger>
              <TabsTrigger value="SSR">SSR</TabsTrigger>
              <TabsTrigger value="ISR">ISR</TabsTrigger>
              <TabsTrigger value="EDGE_SSR">Edge SSR</TabsTrigger>
              <TabsTrigger value="RSC">RSC Streaming</TabsTrigger>
            </TabsList>
          </Tabs>
          {strategy === 'ISR' && (
            <Button type="button" size="xs" variant={isrStale ? 'default' : 'outline'} onClick={() => setIsrStale((s) => !s)}>
              {isrStale
                ? locale === 'vi' ? 'Trạng thái: Hết hạn TTL (Stale)' : 'TTL Expired (Stale Hit)'
                : locale === 'vi' ? 'Trạng thái: Còn hạn (Cache Hit)' : 'Fresh CDN Hit'}
            </Button>
          )}
        </div>

        {/* Sliders */}
        <div className="grid gap-4 rounded-md border border-border/80 bg-muted/20 p-3 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>{locale === 'vi' ? 'Mạng RTT' : 'Network RTT'}</span>
              <span className="font-mono tabular-nums">{networkLatency} ms</span>
            </div>
            <Slider min={30} max={350} step={10} value={[networkLatency]} onValueChange={(v) => setNetworkLatency(Array.isArray(v) ? v[0] : v)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>{locale === 'vi' ? 'Query DB / API' : 'DB / API Latency'}</span>
              <span className="font-mono tabular-nums">{dbLatency} ms</span>
            </div>
            <Slider min={30} max={450} step={10} value={[dbLatency]} onValueChange={(v) => setDbLatency(Array.isArray(v) ? v[0] : v)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>{locale === 'vi' ? 'JS Bundle' : 'App JS Size'}</span>
              <span className="font-mono tabular-nums">{bundleSizeKB} KB</span>
            </div>
            <Slider min={80} max={700} step={20} value={[bundleSizeKB]} onValueChange={(v) => setBundleSizeKB(Array.isArray(v) ? v[0] : v)} />
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">TTFB</div>
            <div className="font-mono text-sm font-semibold tabular-nums">{sim.ttfb} ms</div>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">FCP</div>
            <div className="font-mono text-sm font-semibold text-sky-400 tabular-nums">{sim.fcp} ms</div>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">TTI</div>
            <div className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">{sim.tti} ms</div>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">{locale === 'vi' ? 'JS gửi Client' : 'Client JS'}</div>
            <div className="font-mono text-sm font-semibold tabular-nums">{sim.clientJsKB} KB</div>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">Wave-1 SEO</div>
            <Badge variant={sim.seoReady ? 'default' : 'destructive'} className="mt-0.5 text-[10px]">
              {sim.seoReady ? 'HTML Ready' : 'Empty Shell'}
            </Badge>
          </div>
        </div>

        {/* Waterfall chart */}
        <div className="space-y-2 rounded-md border border-border bg-background/60 p-3">
          {sim.stages.map((st, idx) => {
            const leftPct = (st.start / maxAxis) * 100;
            const widthPct = Math.max(2, (st.duration / maxAxis) * 100);
            return (
              <div key={`${st.label}-${idx}`} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{st.label}</span>
                  <span className="font-mono text-muted-foreground tabular-nums">
                    {st.start}ms → {st.start + st.duration}ms ({st.duration}ms)
                  </span>
                </div>
                <div className="relative h-4 w-full overflow-hidden rounded bg-muted/50">
                  <div
                    className={`absolute top-0 bottom-0 rounded ${st.color} transition-all duration-200`}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerFrame>
  );
}
