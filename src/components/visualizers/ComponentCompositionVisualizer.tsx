import { useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';

const ACCENT_PRESETS = [
  { name: 'Sky', value: '#38bdf8', fg: '#081018' },
  { name: 'Emerald', value: '#22c55e', fg: '#052e16' },
  { name: 'Amber', value: '#f59e0b', fg: '#1c1917' },
  { name: 'Rose', value: '#f43f5e', fg: '#ffffff' },
];

export default function ComponentCompositionVisualizer() {
  const { locale } = useApp();
  const [accentIdx, setAccentIdx] = useState(0);
  const [radius, setRadius] = useState(10);
  const [padding, setPadding] = useState(16);

  const accent = ACCENT_PRESETS[accentIdx];

  return (
    <VisualizerFrame
      title={{ vi: 'Token Theming Studio & Composition vs Prop Drilling', en: 'Design Token Studio & Compound Composition Explorer' }}
      description={{
        vi: 'Điều chỉnh Design Tokens trực tiếp qua CSS Custom Properties và so sánh API nhồi Props vs Compound Composition.',
        en: 'Tune semantic CSS tokens live and contrast monolithic prop-heavy APIs against compound slot composition.',
      }}
      onReset={() => {
        setAccentIdx(0);
        setRadius(10);
        setPadding(16);
      }}
    >
      <Tabs defaultValue="tokens">
        <TabsList>
          <TabsTrigger value="tokens">{locale === 'vi' ? 'Theme Tokens trực tiếp' : 'Live Theme Tokens'}</TabsTrigger>
          <TabsTrigger value="composition">{locale === 'vi' ? 'Props vs Composition' : 'Props vs Composition'}</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="space-y-4 rounded-md border border-border bg-muted/20 p-3 text-xs">
            <div className="space-y-1.5">
              <div className="font-medium">--primary Token</div>
              <div className="flex flex-wrap gap-1.5">
                {ACCENT_PRESETS.map((preset, i) => (
                  <Button
                    key={preset.name}
                    type="button"
                    size="xs"
                    variant={accentIdx === i ? 'default' : 'outline'}
                    onClick={() => setAccentIdx(i)}
                  >
                    <span className="size-2.5 rounded-full" style={{ background: preset.value }} />
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>--radius</span>
                <span className="font-mono tabular-nums">{radius}px</span>
              </div>
              <Slider min={0} max={20} step={2} value={[radius]} onValueChange={(v) => setRadius(Array.isArray(v) ? v[0] : v)} />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>--card-padding</span>
                <span className="font-mono tabular-nums">{padding}px</span>
              </div>
              <Slider min={8} max={28} step={2} value={[padding]} onValueChange={(v) => setPadding(Array.isArray(v) ? v[0] : v)} />
            </div>
          </div>

          <div
            style={{
              ['--demo-accent' as string]: accent.value,
              ['--demo-accent-fg' as string]: accent.fg,
              ['--demo-radius' as string]: `${radius}px`,
              ['--demo-pad' as string]: `${padding}px`,
            }}
            className="flex flex-col justify-between border border-border bg-background/80"
          >
            <div style={{ padding: 'var(--demo-pad)' }}>
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm">Token-Driven Preview Card</strong>
                <span
                  className="px-2 py-0.5 font-mono text-[10px] font-semibold"
                  style={{
                    background: 'var(--demo-accent)',
                    color: 'var(--demo-accent-fg)',
                    borderRadius: 'var(--demo-radius)',
                  }}
                >
                  LIVE TOKEN
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                0 JSX lines changed—only root CSS custom properties updated in O(1).
              </p>
              <button
                type="button"
                className="mt-3 w-full px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--demo-accent)',
                  color: 'var(--demo-accent-fg)',
                  borderRadius: 'var(--demo-radius)',
                }}
              >
                Action Button
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="composition" className="mt-3 grid gap-3 md:grid-cols-2 text-xs">
          <div className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3">
            <Badge variant="destructive" className="mb-2 text-[10px]">Monolithic Prop Explosion</Badge>
            <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed">
{`<Card
  title="Deployment"
  titleIcon={<ServerIcon />}
  badgeText="Healthy"
  badgeColor="green"
  footerLeft={<Text />}
  footerPrimaryAction={...}
  onHeaderClick={...}
/>`}
            </pre>
          </div>
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
            <Badge className="mb-2 bg-emerald-500/20 text-emerald-400 text-[10px]">Compound Composition + Slots</Badge>
            <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed">
{`<Card>
  <CardHeader>
    <ServerIcon />
    <CardTitle>Deployment</CardTitle>
    <Badge>Healthy</Badge>
  </CardHeader>
  <CardFooter>...</CardFooter>
</Card>`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </VisualizerFrame>
  );
}
