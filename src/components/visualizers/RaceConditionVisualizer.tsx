import { useRef, useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';

type GuardMode = 'unprotected' | 'abort-controller' | 'sequence-id';

interface FlightLog {
  id: number;
  query: string;
  delay: number;
  status: 'pending' | 'rendered' | 'aborted' | 'ignored-stale';
}

export default function RaceConditionVisualizer() {
  const { locale } = useApp();
  const [mode, setMode] = useState<GuardMode>('unprotected');
  const [query, setQuery] = useState('');
  const [displayedResult, setDisplayedResult] = useState('');
  const [flights, setFlights] = useState<FlightLog[]>([]);

  const seqRef = useRef(0);
  const ctrlRef = useRef<AbortController | null>(null);

  const fireQuery = (nextQuery: string, customDelay?: number) => {
    setQuery(nextQuery);
    if (!nextQuery.trim()) {
      ctrlRef.current?.abort();
      setDisplayedResult('');
      return;
    }

    if (mode === 'abort-controller') {
      ctrlRef.current?.abort();
    }
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    const reqId = ++seqRef.current;

    // Make shorter queries artificially slower so typing "r" -> "re" reproduces out-of-order responses!
    const delay = customDelay ?? Math.max(150, 950 - nextQuery.length * 180);

    setFlights((prev) => [{ id: reqId, query: nextQuery, delay, status: 'pending' as const }, ...prev].slice(0, 7));

    const timer = setTimeout(() => {
      if (mode === 'sequence-id' && reqId !== seqRef.current) {
        setFlights((prev) => prev.map((f) => (f.id === reqId ? { ...f, status: 'ignored-stale' } : f)));
        return;
      }
      if (ctrl.signal.aborted && mode === 'abort-controller') {
        return;
      }
      setDisplayedResult(nextQuery);
      setFlights((prev) => prev.map((f) => (f.id === reqId ? { ...f, status: 'rendered' } : f)));
    }, delay);

    ctrl.signal.addEventListener('abort', () => {
      clearTimeout(timer);
      if (mode === 'abort-controller') {
        setFlights((prev) => prev.map((f) => (f.id === reqId ? { ...f, status: 'aborted' } : f)));
      }
    });
  };

  const runBurstDemo = () => {
    setFlights([]);
    fireQuery('r', 850);
    setTimeout(() => fireQuery('re', 550), 60);
    setTimeout(() => fireQuery('react', 180), 120);
  };

  const reset = () => {
    ctrlRef.current?.abort();
    setQuery('');
    setDisplayedResult('');
    setFlights([]);
  };

  const isOutOfSync = Boolean(query && displayedResult && query !== displayedResult);

  return (
    <VisualizerFrame
      title={{ vi: 'Out-of-Order Race Condition Search Simulator', en: 'Out-of-Order Search Race Condition Simulator' }}
      description={{
        vi: 'Các từ khóa ngắn cố tình phản hồi chậm hơn (850ms) so với từ khóa đầy đủ (180ms). Chạy thử ở Unprotected để thấy kết quả cũ đè lên UI!',
        en: 'Shorter prefixes take longer (850ms) than full words (180ms). Run Burst Demo in Unprotected mode to witness stale overwrites.',
      }}
      onReset={reset}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as GuardMode)}>
            <TabsList>
              <TabsTrigger value="unprotected">Unprotected</TabsTrigger>
              <TabsTrigger value="abort-controller">AbortController</TabsTrigger>
              <TabsTrigger value="sequence-id">Sequence ID</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button type="button" size="sm" onClick={runBurstDemo}>
            {locale === 'vi' ? 'Chạy chuỗi "r" -> "re" -> "react"' : 'Simulate "r" -> "re" -> "react"'}
          </Button>
        </div>

        <Input
          value={query}
          onChange={(e) => fireQuery(e.target.value)}
          placeholder={locale === 'vi' ? 'Hoặc tự gõ nhanh vào đây...' : 'Or type rapidly here...'}
          aria-label="Race condition search input"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border p-3 text-xs">
            <div className="text-muted-foreground">{locale === 'vi' ? 'Input hiện tại:' : 'Current Input:'}</div>
            <div className="mt-1 font-mono text-sm font-semibold">{query || '—'}</div>
          </div>
          <div
            className={`rounded-md border p-3 text-xs ${
              isOutOfSync ? 'border-rose-500/50 bg-rose-500/10' : 'border-emerald-500/30 bg-emerald-500/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{locale === 'vi' ? 'Kết quả đang hiển thị:' : 'Displayed Results:'}</span>
              {isOutOfSync && <Badge variant="destructive" className="text-[10px]">STALE OVERWRITE!</Badge>}
            </div>
            <div className="mt-1 font-mono text-sm font-semibold">
              {displayedResult ? `Results for "${displayedResult}"` : '—'}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 rounded-md border border-border bg-muted/20 p-2.5 font-mono text-xs">
          {flights.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              {locale === 'vi' ? 'Chưa có request nào.' : 'No requests fired yet.'}
            </div>
          ) : (
            flights.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded border border-border/60 bg-card px-2.5 py-1">
                <span>
                  #{f.id} query=<strong>"{f.query}"</strong> ({f.delay}ms)
                </span>
                <Badge
                  variant={
                    f.status === 'rendered'
                      ? 'default'
                      : f.status === 'pending'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="text-[10px]"
                >
                  {f.status.toUpperCase()}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </VisualizerFrame>
  );
}
