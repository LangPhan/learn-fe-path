import { useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';

export default function PaginationAndApiVisualizer() {
  const { locale } = useApp();
  const [items, setItems] = useState([10, 9, 8, 7, 6, 5, 4]);
  const [nextId, setNextId] = useState(11);
  const [page1Snapshot] = useState([10, 9, 8]);
  const [fetchedPage2, setFetchedPage2] = useState<{ offset: number[]; cursor: number[] } | null>(null);
  const [gqlFields, setGqlFields] = useState({ title: true, authorName: true, body: false, auditLogs: false });

  const insertTop = () => {
    setItems((prev) => [nextId, ...prev]);
    setNextId((n) => n + 1);
    setFetchedPage2(null);
  };

  const loadPage2 = () => {
    const offsetSlice = items.slice(3, 6);
    const anchorIdx = items.indexOf(page1Snapshot[page1Snapshot.length - 1]);
    const cursorSlice = anchorIdx >= 0 ? items.slice(anchorIdx + 1, anchorIdx + 4) : [];
    setFetchedPage2({ offset: offsetSlice, cursor: cursorSlice });
  };

  const reset = () => {
    setItems([10, 9, 8, 7, 6, 5, 4]);
    setNextId(11);
    setFetchedPage2(null);
  };

  const restPayload = {
    id: 'post_1',
    title: 'System Design Guide',
    author: { id: 'u1', name: 'An', email: 'internal@example.com', bio: 'Staff Engineer' },
    body: 'Full 8KB markdown article body '.repeat(6),
    auditLogs: ['edit_1', 'edit_2', 'publish_3'],
  };

  const gqlPayload: Record<string, unknown> = { id: 'post_1' };
  if (gqlFields.title) gqlPayload.title = restPayload.title;
  if (gqlFields.authorName) gqlPayload.author = { name: restPayload.author.name };
  if (gqlFields.body) gqlPayload.body = restPayload.body;
  if (gqlFields.auditLogs) gqlPayload.auditLogs = restPayload.auditLogs;

  const restBytes = JSON.stringify(restPayload).length;
  const gqlBytes = JSON.stringify(gqlPayload).length;

  return (
    <VisualizerFrame
      title={{ vi: 'Pagination Drift & REST vs GraphQL Payload Explorer', en: 'Offset vs Cursor Pagination & GraphQL Payload Lab' }}
      description={{
        vi: 'Chèn bài mới vào đầu feed để quan sát lỗi lặp item của Offset so với Cursor, và chọn trường GraphQL để đo tiết kiệm bytes.',
        en: 'Insert new feed rows to witness Offset duplication vs Cursor accuracy, and toggle GraphQL field projection.',
      }}
      onReset={reset}
    >
      <Tabs defaultValue="pagination">
        <TabsList>
          <TabsTrigger value="pagination">Offset vs Cursor</TabsTrigger>
          <TabsTrigger value="gql">REST vs GraphQL</TabsTrigger>
        </TabsList>

        <TabsContent value="pagination" className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={insertTop}>
              + {locale === 'vi' ? 'Chèn Post mới lên đầu' : 'Insert New Post at Top'} (#{nextId})
            </Button>
            <Button type="button" size="sm" onClick={loadPage2}>
              {locale === 'vi' ? 'Tải Page 2 (limit = 3)' : 'Fetch Page 2 (limit = 3)'}
            </Button>
          </div>

          <div className="rounded-md border border-border bg-muted/20 p-3 text-xs">
            <div className="mb-1.5 font-medium">
              {locale === 'vi' ? 'Dữ liệu Server hiện tại (Mới -> Cũ):' : 'Current Server Feed (Newest -> Oldest):'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {items.map((id) => {
                const wasSeen = page1Snapshot.includes(id);
                return (
                  <Badge key={id} variant={id > 10 ? 'default' : wasSeen ? 'secondary' : 'outline'} className="font-mono">
                    #{id} {id > 10 ? 'NEW' : wasSeen ? '(P1)' : ''}
                  </Badge>
                );
              })}
            </div>
          </div>

          {fetchedPage2 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-rose-500/40 bg-rose-500/5 p-3 text-xs">
                <div className="font-semibold text-rose-400">Offset (`offset=3&limit=3`)</div>
                <div className="mt-2 flex gap-1.5 font-mono">
                  {fetchedPage2.offset.map((id) => (
                    <Badge key={id} variant={page1Snapshot.includes(id) ? 'destructive' : 'outline'}>
                      #{id} {page1Snapshot.includes(id) ? 'DUP!' : ''}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 text-xs">
                <div className="font-semibold text-emerald-400">Cursor (`after=8&limit=3`)</div>
                <div className="mt-2 flex gap-1.5 font-mono">
                  {fetchedPage2.cursor.map((id) => (
                    <Badge key={id} variant="outline" className="border-emerald-500/40">#{id}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="gql" className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(gqlFields) as Array<keyof typeof gqlFields>).map((field) => (
              <Button
                key={field}
                type="button"
                size="xs"
                variant={gqlFields[field] ? 'default' : 'outline'}
                onClick={() => setGqlFields((prev) => ({ ...prev, [field]: !prev[field] }))}
              >
                {field}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-md border border-border p-3">
              <div className="mb-1 flex justify-between font-semibold">
                <span>REST Response (Fixed)</span>
                <span className="font-mono text-amber-400 tabular-nums">{restBytes} B</span>
              </div>
              <pre className="max-h-40 overflow-auto font-mono text-[11px] text-muted-foreground">
                {JSON.stringify(restPayload, null, 2)}
              </pre>
            </div>
            <div className="rounded-md border border-sky-500/40 bg-sky-500/5 p-3">
              <div className="mb-1 flex justify-between font-semibold">
                <span>GraphQL Projection</span>
                <span className="font-mono text-emerald-400 tabular-nums">
                  {gqlBytes} B ({Math.round((1 - gqlBytes / restBytes) * 100)}% smaller)
                </span>
              </div>
              <pre className="max-h-40 overflow-auto font-mono text-[11px]">
                {JSON.stringify(gqlPayload, null, 2)}
              </pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </VisualizerFrame>
  );
}
