import { useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';

type UiState = 'loading' | 'success' | 'empty' | 'error' | 'offline';

export default function UiStatesVisualizer() {
  const { locale } = useApp();
  const [state, setState] = useState<UiState>('loading');
  const [longText, setLongText] = useState('https://cdn.example.com/deployments/production/very_long_unbroken_deployment_hash_98f3a1204c7e912a_manifest.json');
  const [fixOverflow, setFixOverflow] = useState(true);
  const [mobileFrame, setMobileFrame] = useState(true);

  return (
    <VisualizerFrame
      title={{ vi: '5 UI States, Error Recovery & Long String Stress Tester', en: '5-State UI Machine, Long String & Mobile Frame Lab' }}
      description={{
        vi: 'Chuyển đổi giữa 5 trạng thái UI (Loading/Success/Empty/Error/Offline) và kiểm tra chống vỡ layout cho chuỗi siêu dài trên khung mobile.',
        en: 'Inspect all 5 async UI states and test CSS overflow wrapping and truncation inside a constrained mobile viewport.',
      }}
      onReset={() => {
        setState('loading');
        setFixOverflow(true);
        setMobileFrame(true);
      }}
    >
      <Tabs defaultValue="states">
        <TabsList>
          <TabsTrigger value="states">5 UI States</TabsTrigger>
          <TabsTrigger value="overflow">Long Strings & Mobile 375px</TabsTrigger>
        </TabsList>

        <TabsContent value="states" className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {(['loading', 'success', 'empty', 'error', 'offline'] as UiState[]).map((s) => (
              <Button key={s} type="button" size="xs" variant={state === s ? 'default' : 'outline'} onClick={() => setState(s)}>
                {s.toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="min-h-32 rounded-md border border-border bg-muted/20 p-4">
            {state === 'loading' && (
              <div className="space-y-2.5 animate-pulse">
                <div className="h-4 w-48 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            )}
            {state === 'success' && (
              <div className="flex items-center justify-between gap-2 text-xs">
                <div>
                  <div className="text-sm font-semibold">24 Active Edge Nodes</div>
                  <div className="text-muted-foreground">Median TTFB: 19ms · Zero active incidents</div>
                </div>
                <Badge>Healthy</Badge>
              </div>
            )}
            {state === 'empty' && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-semibold">{locale === 'vi' ? 'Không có bản ghi khớp bộ lọc' : 'No deployments match your filters'}</div>
                  <div className="text-muted-foreground">{locale === 'vi' ? 'Hãy thử xóa bộ lọc hoặc tạo deployment đầu tiên.' : 'Clear active filters or trigger a new deploy.'}</div>
                </div>
                <Button type="button" size="xs" variant="outline" onClick={() => setState('success')}>
                  {locale === 'vi' ? 'Xóa bộ lọc' : 'Clear filters'}
                </Button>
              </div>
            )}
            {state === 'error' && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-semibold text-destructive">503 Upstream Service Timeout</div>
                  <div className="text-muted-foreground">{locale === 'vi' ? 'Dữ liệu hiện chưa tải được; nhấn Thử lại.' : 'Transient gateway timeout occurred.'}</div>
                </div>
                <Button type="button" size="xs" onClick={() => setState('loading')}>
                  {locale === 'vi' ? 'Thử lại' : 'Retry'}
                </Button>
              </div>
            )}
            {state === 'offline' && (
              <div className="flex items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-semibold text-amber-400">Offline — Showing Cached Snapshot</div>
                  <div className="text-muted-foreground">Pending edits will sync automatically once connection returns.</div>
                </div>
                <Badge variant="outline">Cached</Badge>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="overflow" className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Switch checked={fixOverflow} onCheckedChange={setFixOverflow} aria-label="Toggle min-w-0 and overflow-wrap fix" />
              <span>{locale === 'vi' ? 'Áp dụng `min-w-0` + `truncate` / `anywhere`' : 'Apply `min-w-0` + `truncate` / `anywhere`'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={mobileFrame} onCheckedChange={setMobileFrame} aria-label="Toggle 375px mobile frame" />
              <span>{locale === 'vi' ? 'Khung 375px Mobile' : '375px Mobile Width'}</span>
            </div>
          </div>

          <Input value={longText} onChange={(e) => setLongText(e.target.value)} className="font-mono text-xs" />

          <div
            className="mx-auto rounded-md border border-border bg-background/80 p-3 text-xs transition-all"
            style={{ maxWidth: mobileFrame ? 340 : '100%', overflow: 'hidden' }}
          >
            <div className="mb-2 flex items-center gap-2 rounded border border-border p-2">
              <span className={fixOverflow ? 'min-w-0 flex-1 truncate font-mono' : 'flex-1 whitespace-nowrap font-mono'}>
                {longText}
              </span>
              <Button type="button" size="xs" className="shrink-0">Open</Button>
            </div>
            <div
              className="rounded border border-border p-2 font-mono text-[11px] text-muted-foreground"
              style={{ overflowWrap: fixOverflow ? 'anywhere' : 'normal' }}
            >
              {longText}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </VisualizerFrame>
  );
}
