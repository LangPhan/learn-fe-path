import { useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';

const CANDIDATES = [
  { width: 320, webpKB: 18, jpegKB: 34 },
  { width: 640, webpKB: 44, jpegKB: 82 },
  { width: 960, webpKB: 86, jpegKB: 165 },
  { width: 1280, webpKB: 138, jpegKB: 268 },
  { width: 1920, webpKB: 260, jpegKB: 510 },
];

export default function ResponsiveImageVisualizer() {
  const { locale } = useApp();
  const [slotWidth, setSlotWidth] = useState(390);
  const [dpr, setDpr] = useState(2);
  const [network, setNetwork] = useState<'4g' | '3g' | '2g'>('4g');
  const [saveData, setSaveData] = useState(false);

  const effectiveDpr = saveData || network === '2g' ? 1 : dpr;
  const targetPx = slotWidth * effectiveDpr;
  const pool = saveData || network === '2g' ? CANDIDATES.filter((c) => c.width <= 640) : CANDIDATES;
  const chosen = pool.find((c) => c.width >= targetPx) ?? pool[pool.length - 1];
  const naiveOriginKB = 510;
  const savedPct = Math.round(((naiveOriginKB - chosen.webpKB) / naiveOriginKB) * 100);

  return (
    <VisualizerFrame
      title={{ vi: 'Responsive `srcset` + Adaptive Network Image Selector', en: 'Responsive `srcset` & Adaptive Image Picker' }}
      description={{
        vi: 'Thay đổi độ rộng khung ảnh, màn hình Retina DPR và tốc độ mạng để xem trình duyệt tự chọn candidate WebP nào.',
        en: 'Adjust rendered CSS width, device pixel ratio (DPR), and connection speed to inspect candidate selection and KB savings.',
      }}
      onReset={() => {
        setSlotWidth(390);
        setDpr(2);
        setNetwork('4g');
        setSaveData(false);
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-4 rounded-md border border-border bg-muted/20 p-3 sm:grid-cols-2 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span>{locale === 'vi' ? 'Độ rộng slot CSS (`sizes`)' : 'CSS Slot Width (`sizes`)'}</span>
              <span className="font-mono tabular-nums">{slotWidth}px</span>
            </div>
            <Slider min={240} max={1440} step={30} value={[slotWidth]} onValueChange={(v) => setSlotWidth(Array.isArray(v) ? v[0] : v)} />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span>Device Pixel Ratio (DPR)</span>
              <span className="font-mono tabular-nums">{dpr}x</span>
            </div>
            <Slider min={1} max={3} step={1} value={[dpr]} onValueChange={(v) => setDpr(Array.isArray(v) ? v[0] : v)} />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span>{locale === 'vi' ? 'Mạng (`effectiveType`)' : 'Network (`effectiveType`)'}</span>
            <Select value={network} onValueChange={(v) => { if (v) setNetwork(v as '4g' | '3g' | '2g'); }}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="4g">4G / Wi-Fi</SelectItem>
                <SelectItem value="3g">3G Fast</SelectItem>
                <SelectItem value="2g">2G Slow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span>`Save-Data` Header</span>
            <Switch checked={saveData} onCheckedChange={setSaveData} aria-label="Toggle Save-Data header" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">Target Pixels</div>
            <div className="font-mono text-sm font-semibold tabular-nums">{targetPx}px ({effectiveDpr}x)</div>
          </div>
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-2.5">
            <div className="text-[11px] text-muted-foreground">Chosen Variant</div>
            <div className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">
              {chosen.width}w ({chosen.webpKB} KB WebP)
            </div>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">Bytes Saved vs 1920 JPEG</div>
            <div className="font-mono text-sm font-semibold text-sky-400 tabular-nums">{savedPct}% saved</div>
          </div>
        </div>

        <div className="space-y-1.5">
          {CANDIDATES.map((c) => {
            const isSelected = c.width === chosen.width;
            return (
              <div
                key={c.width}
                className={`flex items-center justify-between rounded border px-3 py-1.5 font-mono text-xs ${
                  isSelected ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-border/60 opacity-65'
                }`}
              >
                <span>hero-{c.width}.webp ({c.width}w)</span>
                <div className="flex items-center gap-2">
                  <span>{c.webpKB} KB</span>
                  {isSelected && <Badge className="text-[10px]">SELECTED</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerFrame>
  );
}
