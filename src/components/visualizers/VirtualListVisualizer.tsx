import { useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';

const TOTAL_ROWS = 100_000;
const VIEWPORT_HEIGHT = 240;

export default function VirtualListVisualizer() {
  const { locale } = useApp();
  const [rowHeight, setRowHeight] = useState(36);
  const [overscan, setOverscan] = useState(3);
  const [scrollTop, setScrollTop] = useState(0);

  const rawStart = Math.floor(scrollTop / rowHeight);
  const rawEnd = Math.ceil((scrollTop + VIEWPORT_HEIGHT) / rowHeight) - 1;
  const startIndex = Math.max(0, rawStart - overscan);
  const endIndex = Math.min(TOTAL_ROWS - 1, rawEnd + overscan);

  const visibleIndices: number[] = [];
  for (let i = startIndex; i <= endIndex; i++) visibleIndices.push(i);

  const totalHeight = TOTAL_ROWS * rowHeight;
  const offsetY = startIndex * rowHeight;

  return (
    <VisualizerFrame
      title={{ vi: 'Windowing Inspector cho Danh sách 100.000 dòng', en: '100,000-Row List Virtualization Inspector' }}
      description={{
        vi: 'Kéo thanh cuộn dọc cực nhanh qua 100.000 dòng và quan sát số lượng DOM node thực tế giữ nguyên ở mức ~10–18 nodes.',
        en: 'Scroll smoothly through 100,000 items while inspecting real-time `startIndex`, `endIndex`, `translateY`, and DOM node counts.',
      }}
      onReset={() => {
        setRowHeight(36);
        setOverscan(3);
        setScrollTop(0);
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-4 rounded-md border border-border bg-muted/20 p-3 sm:grid-cols-2 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span>{locale === 'vi' ? 'Chiều cao mỗi dòng (rowHeight)' : 'Row Height'}</span>
              <span className="font-mono tabular-nums">{rowHeight}px</span>
            </div>
            <Slider min={28} max={56} step={4} value={[rowHeight]} onValueChange={(v) => setRowHeight(Array.isArray(v) ? v[0] : v)} />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span>Overscan Buffer</span>
              <span className="font-mono tabular-nums">{overscan} rows</span>
            </div>
            <Slider min={0} max={10} step={1} value={[overscan]} onValueChange={(v) => setOverscan(Array.isArray(v) ? v[0] : v)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">Live DOM Nodes</div>
            <div className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">
              {visibleIndices.length} / 100,000
            </div>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">Active Window</div>
            <div className="font-mono text-sm font-semibold tabular-nums">
              #{startIndex.toLocaleString()} – #{endIndex.toLocaleString()}
            </div>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">translateY Offset</div>
            <div className="font-mono text-sm font-semibold text-sky-400 tabular-nums">
              {offsetY.toLocaleString()}px
            </div>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">DOM Memory Saved</div>
            <Badge className="mt-0.5 font-mono text-[10px]">
              {(((TOTAL_ROWS - visibleIndices.length) / TOTAL_ROWS) * 100).toFixed(2)}%
            </Badge>
          </div>
        </div>

        <div
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          style={{ height: VIEWPORT_HEIGHT }}
          className="relative overflow-y-auto rounded-md border border-border bg-background/80"
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {visibleIndices.map((idx) => (
                <div
                  key={idx}
                  style={{ height: rowHeight }}
                  className="flex items-center justify-between border-b border-border/60 px-3 text-xs"
                >
                  <span className="font-medium">
                    <span className="mr-2 font-mono text-muted-foreground">#{idx.toLocaleString()}</span>
                    Telemetry Event Record
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                    y={(idx * rowHeight).toLocaleString()}px
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </VisualizerFrame>
  );
}
