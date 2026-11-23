import { useEffect, useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';

type Protocol = 'short-polling' | 'long-polling' | 'sse' | 'websockets';

interface Packet {
  id: number;
  dir: 'c2s' | 's2c';
  label: string;
  empty?: boolean;
}

export default function RealtimeProtocolVisualizer() {
  const { locale } = useApp();
  const [protocol, setProtocol] = useState<Protocol>('sse');
  const [running, setRunning] = useState(false);
  const [pollIntervalMs, setPollIntervalMs] = useState(800);
  const [httpCount, setHttpCount] = useState(0);
  const [eventsDelivered, setEventsDelivered] = useState(0);
  const [packets, setPackets] = useState<Packet[]>([]);

  const pushPacket = (dir: 'c2s' | 's2c', label: string, empty = false) => {
    setPackets((prev) => [{ id: Date.now() + Math.random(), dir, label, empty }, ...prev].slice(0, 7));
  };

  useEffect(() => {
    if (!running) return;
    let tick = 0;

    if (protocol === 'short-polling') {
      const id = setInterval(() => {
        tick += 1;
        setHttpCount((c) => c + 1);
        const hasEvent = tick % 3 === 0;
        pushPacket('c2s', 'GET /events');
        setTimeout(() => {
          if (hasEvent) {
            setEventsDelivered((e) => e + 1);
            pushPacket('s2c', '200 OK [1 event]');
          } else {
            pushPacket('s2c', '200 OK [] (empty)', true);
          }
        }, 120);
      }, pollIntervalMs);
      return () => clearInterval(id);
    }

    if (protocol === 'long-polling') {
      const id = setInterval(() => {
        setHttpCount((c) => c + 1);
        pushPacket('c2s', 'GET /poll (held open...)');
        setTimeout(() => {
          setEventsDelivered((e) => e + 1);
          pushPacket('s2c', '200 OK [event arrived -> reopen]');
        }, Math.max(400, pollIntervalMs - 150));
      }, pollIntervalMs + 120);
      return () => clearInterval(id);
    }

    if (protocol === 'sse') {
      setHttpCount(1);
      pushPacket('c2s', 'GET /stream (single HTTP open)');
      const id = setInterval(() => {
        setEventsDelivered((e) => e + 1);
        pushPacket('s2c', 'data: {"msg":"tick"} (server push)');
      }, pollIntervalMs);
      return () => clearInterval(id);
    }

    // websockets
    setHttpCount(1);
    pushPacket('c2s', 'HTTP 101 Upgrade -> WS Open');
    const id = setInterval(() => {
      tick += 1;
      if (tick % 2 === 1) {
        pushPacket('c2s', 'WS Frame: typing:true (~6B header)');
      } else {
        setEventsDelivered((e) => e + 1);
        pushPacket('s2c', 'WS Frame: {"chat":"hi"} (bidirectional)');
      }
    }, Math.round(pollIntervalMs * 0.7));
    return () => clearInterval(id);
  }, [running, protocol, pollIntervalMs]);

  const reset = () => {
    setRunning(false);
    setHttpCount(0);
    setEventsDelivered(0);
    setPackets([]);
  };

  return (
    <VisualizerFrame
      title={{ vi: 'Mô phỏng Giao thức Real-time (Polling vs SSE vs WebSockets)', en: 'Real-time Transport Simulator' }}
      description={{
        vi: 'So sánh số lượng HTTP request phát sinh và luồng gói tin Client <-> Server theo từng giao thức theo thời gian thực.',
        en: 'Compare HTTP handshake overhead, empty polls, and packet direction across real-time transports.',
      }}
      onReset={reset}
      actions={
        <Button type="button" size="xs" variant={running ? 'destructive' : 'default'} onClick={() => setRunning((r) => !r)}>
          {running ? (locale === 'vi' ? 'Tạm dừng' : 'Pause') : (locale === 'vi' ? 'Chạy mô phỏng' : 'Start Stream')}
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            value={protocol}
            onValueChange={(v) => {
              setRunning(false);
              setHttpCount(0);
              setEventsDelivered(0);
              setPackets([]);
              setProtocol(v as Protocol);
            }}
          >
            <TabsList className="flex-wrap">
              <TabsTrigger value="short-polling">Short Polling</TabsTrigger>
              <TabsTrigger value="long-polling">Long Polling</TabsTrigger>
              <TabsTrigger value="sse">SSE</TabsTrigger>
              <TabsTrigger value="websockets">WebSockets</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex min-w-44 items-center gap-3 text-xs">
            <span className="text-muted-foreground">{locale === 'vi' ? 'Nhịp:' : 'Cadence:'}</span>
            <Slider min={400} max={1800} step={200} value={[pollIntervalMs]} onValueChange={(v) => setPollIntervalMs(Array.isArray(v) ? v[0] : v)} />
            <span className="font-mono tabular-nums">{pollIntervalMs}ms</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">HTTP Requests Opened</div>
            <div className="font-mono text-base font-semibold tabular-nums">{httpCount}</div>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">Events Delivered</div>
            <div className="font-mono text-base font-semibold text-emerald-400 tabular-nums">{eventsDelivered}</div>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <div className="text-[11px] text-muted-foreground">Direction</div>
            <div className="text-xs font-semibold">
              {protocol === 'websockets' ? 'Full-Duplex (C <-> S)' : protocol === 'sse' ? 'Server -> Client' : 'Client -> Server Pull'}
            </div>
          </div>
        </div>

        <div className="min-h-36 space-y-1.5 rounded-md border border-border bg-muted/20 p-3 font-mono text-xs">
          {packets.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {locale === 'vi' ? 'Nhấn "Chạy mô phỏng" để xem lưu lượng gói tin.' : 'Click "Start Stream" to watch live wire traffic.'}
            </div>
          ) : (
            packets.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded border border-border/60 bg-card px-2.5 py-1.5">
                <Badge variant={p.dir === 'c2s' ? 'secondary' : p.empty ? 'outline' : 'default'} className="text-[10px]">
                  {p.dir === 'c2s' ? 'CLIENT -> SERVER' : 'SERVER -> CLIENT'}
                </Badge>
                <span className={p.empty ? 'text-muted-foreground' : 'text-foreground'}>{p.label}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </VisualizerFrame>
  );
}
