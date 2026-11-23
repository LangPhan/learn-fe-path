import { useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';

interface TaskEvent {
  id: number;
  type: 'ADD' | 'TOGGLE' | 'REMOVE';
  title: string;
}

interface TaskItem {
  title: string;
  done: boolean;
}

function projectEvents(events: TaskEvent[]): TaskItem[] {
  let list: TaskItem[] = [];
  for (const ev of events) {
    if (ev.type === 'ADD') {
      list = [...list, { title: ev.title, done: false }];
    } else if (ev.type === 'TOGGLE') {
      list = list.map((t) => (t.title === ev.title ? { ...t, done: !t.done } : t));
    } else if (ev.type === 'REMOVE') {
      list = list.filter((t) => t.title !== ev.title);
    }
  }
  return list;
}

export default function UndoRedoEventSourcingVisualizer() {
  const { locale } = useApp();
  const [events, setEvents] = useState<TaskEvent[]>([
    { id: 1, type: 'ADD', title: 'Setup Service Worker' },
    { id: 2, type: 'ADD', title: 'Add IndexedDB Queue' },
    { id: 3, type: 'TOGGLE', title: 'Setup Service Worker' },
  ]);
  const [cursor, setCursor] = useState<number>(3);
  const [draft, setDraft] = useState('Resolve LWW Conflicts');

  const activeSlice = events.slice(0, cursor);
  const tasks = projectEvents(activeSlice);

  const appendEvent = (type: TaskEvent['type'], title: string) => {
    const clean = title.trim();
    if (!clean) return;
    // Truncate future branch if user makes a new action after undoing!
    const nextEvents = [...events.slice(0, cursor), { id: Date.now(), type, title: clean }];
    setEvents(nextEvents);
    setCursor(nextEvents.length);
  };

  return (
    <VisualizerFrame
      title={{ vi: 'Event Sourcing Time-Travel + Undo / Redo Studio', en: 'Event Sourcing Time-Travel & Undo/Redo Stack' }}
      description={{
        vi: 'Mọi thao tác ghi vào Event Log bất biến. Kéo thanh Time-Travel hoặc bấm Undo/Redo để du hành qua từng trạng thái lịch sử!',
        en: 'Every mutation appends an immutable domain event. Scrub the timeline or hit Undo/Redo to project any historical state.',
      }}
      onReset={() => {
        setEvents([
          { id: 1, type: 'ADD', title: 'Setup Service Worker' },
          { id: 2, type: 'ADD', title: 'Add IndexedDB Queue' },
          { id: 3, type: 'TOGGLE', title: 'Setup Service Worker' },
        ]);
        setCursor(3);
      }}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="max-w-56 text-xs"
            aria-label="New task title"
          />
          <Button type="button" size="sm" onClick={() => appendEvent('ADD', draft)}>
            + Add Task
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={cursor <= 0} onClick={() => setCursor((c) => Math.max(0, c - 1))}>
            ↶ Undo
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={cursor >= events.length} onClick={() => setCursor((c) => Math.min(events.length, c + 1))}>
            ↷ Redo
          </Button>
        </div>

        <div className="space-y-1.5 rounded-md border border-border bg-muted/20 p-3 text-xs">
          <div className="flex justify-between">
            <span className="font-medium">{locale === 'vi' ? 'Thanh Du hành Thời gian (Event Replay Cursor):' : 'Time-Travel Scrubber:'}</span>
            <span className="font-mono tabular-nums">Event {cursor} / {events.length}</span>
          </div>
          <Slider min={0} max={events.length} step={1} value={[cursor]} onValueChange={(v) => setCursor(Array.isArray(v) ? v[0] : v)} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 rounded-md border border-border p-3 text-xs">
            <div className="font-semibold">Projected UI State</div>
            {tasks.length === 0 ? (
              <div className="py-4 text-muted-foreground">No tasks at cursor {cursor}.</div>
            ) : (
              tasks.map((task) => (
                <div key={task.title} className="flex items-center justify-between gap-2 rounded border border-border/70 bg-muted/20 px-2.5 py-1.5">
                  <button
                    type="button"
                    className={`text-left ${task.done ? 'line-through text-muted-foreground' : 'font-medium'}`}
                    onClick={() => appendEvent('TOGGLE', task.title)}
                  >
                    {task.done ? '☑ ' : '☐ '}
                    {task.title}
                  </button>
                  <Button type="button" size="xs" variant="ghost" onClick={() => appendEvent('REMOVE', task.title)}>
                    ×
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-1.5 rounded-md border border-border bg-muted/20 p-3 text-xs">
            <div className="font-semibold">Append-Only Event Ledger</div>
            {events.map((ev, idx) => {
              const applied = idx < cursor;
              return (
                <div
                  key={ev.id}
                  className={`flex items-center justify-between rounded border px-2 py-1 font-mono text-[11px] ${
                    applied ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/50 opacity-45'
                  }`}
                >
                  <span>#{idx + 1} {ev.type}: "{ev.title}"</span>
                  <Badge variant={applied ? 'default' : 'outline'} className="text-[9px]">
                    {applied ? 'APPLIED' : 'FUTURE'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </VisualizerFrame>
  );
}
