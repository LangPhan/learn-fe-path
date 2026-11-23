import { useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';

export default function FluxNormalizedStoreVisualizer() {
  const { locale } = useApp();
  const [authorName, setAuthorName] = useState('Linh Pham');
  const [nestedPosts, setNestedPosts] = useState([
    { id: 'p1', title: 'Caching Patterns', likes: 12, author: { id: 'u1', name: 'Linh Pham' } },
    { id: 'p2', title: 'Virtual Lists', likes: 8, author: { id: 'u1', name: 'Linh Pham' } },
  ]);
  const [normalized, setNormalized] = useState({
    usersById: { u1: { id: 'u1', name: 'Linh Pham' } },
    postsById: {
      p1: { id: 'p1', title: 'Caching Patterns', likes: 12, authorId: 'u1' },
      p2: { id: 'p2', title: 'Virtual Lists', likes: 8, authorId: 'u1' },
    },
    postIds: ['p1', 'p2'] as Array<'p1' | 'p2'>,
  });
  const [actions, setActions] = useState<string[]>([]);

  const dispatchAction = (type: 'UPDATE_AUTHOR_NAIVE_P1' | 'UPDATE_AUTHOR_NORMALIZED' | 'LIKE_P2') => {
    if (type === 'UPDATE_AUTHOR_NAIVE_P1') {
      // Simulate classic nested-store bug: updates post 1's nested author copy, misses post 2!
      setNestedPosts((prev) =>
        prev.map((p) => (p.id === 'p1' ? { ...p, author: { ...p.author, name: authorName } } : p)),
      );
      setActions((a) => [`DISPATCH { type: 'UPDATE_NESTED_P1', name: '${authorName}' }`, ...a].slice(0, 5));
    } else if (type === 'UPDATE_AUTHOR_NORMALIZED') {
      setNormalized((prev) => ({
        ...prev,
        usersById: { ...prev.usersById, u1: { ...prev.usersById.u1, name: authorName } },
      }));
      setNestedPosts((prev) =>
        prev.map((p) => ({ ...p, author: { ...p.author, name: authorName } })),
      );
      setActions((a) => [`DISPATCH { type: 'UPDATE_USER_O1', id: 'u1', name: '${authorName}' }`, ...a].slice(0, 5));
    } else {
      setNormalized((prev) => ({
        ...prev,
        postsById: { ...prev.postsById, p2: { ...prev.postsById.p2, likes: prev.postsById.p2.likes + 1 } },
      }));
      setNestedPosts((prev) => prev.map((p) => (p.id === 'p2' ? { ...p, likes: p.likes + 1 } : p)));
      setActions((a) => [`DISPATCH { type: 'LIKE_POST', postId: 'p2' }`, ...a].slice(0, 5));
    }
  };

  const reset = () => {
    setAuthorName('Linh Pham');
    setNestedPosts([
      { id: 'p1', title: 'Caching Patterns', likes: 12, author: { id: 'u1', name: 'Linh Pham' } },
      { id: 'p2', title: 'Virtual Lists', likes: 8, author: { id: 'u1', name: 'Linh Pham' } },
    ]);
    setNormalized({
      usersById: { u1: { id: 'u1', name: 'Linh Pham' } },
      postsById: {
        p1: { id: 'p1', title: 'Caching Patterns', likes: 12, authorId: 'u1' },
        p2: { id: 'p2', title: 'Virtual Lists', likes: 8, authorId: 'u1' },
      },
      postIds: ['p1', 'p2'],
    });
    setActions([]);
  };

  const nestedDrift = nestedPosts[0].author.name !== nestedPosts[1].author.name;

  return (
    <VisualizerFrame
      title={{ vi: 'Flux Store & So sánh Nested vs Normalized State', en: 'Flux Action Flow & Nested vs Normalized Store' }}
      description={{
        vi: 'Thử đổi tên tác giả bằng 2 kiểu dispatch để thấy store lồng nhau dễ lệch dữ liệu trong khi Normalized Store cập nhật O(1) đồng nhất 100%.',
        en: 'Compare partial nested-state drift against O(1) single-source-of-truth updates in a normalized entity store.',
      }}
      onReset={reset}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="max-w-48"
            aria-label="Author name input"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => dispatchAction('UPDATE_AUTHOR_NAIVE_P1')}>
            {locale === 'vi' ? 'Sửa copy lồng ở Post #1 (Bug)' : 'Update Nested Copy on #1 (Bug)'}
          </Button>
          <Button type="button" size="sm" onClick={() => dispatchAction('UPDATE_AUTHOR_NORMALIZED')}>
            {locale === 'vi' ? 'Cập nhật Normalized O(1)' : 'Update Normalized usersById[u1]'}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => dispatchAction('LIKE_P2')}>
            +1 Like Post #2
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold">Nested Array Store</span>
              <Badge variant={nestedDrift ? 'destructive' : 'outline'} className="text-[10px]">
                {nestedDrift ? 'STALE DUPLICATE BUG!' : 'Synced'}
              </Badge>
            </div>
            <div className="space-y-2 text-xs">
              {nestedPosts.map((p) => (
                <div key={p.id} className="rounded border border-border/70 bg-muted/30 p-2">
                  <div className="font-medium">{p.title} ({p.likes} likes)</div>
                  <div className="text-muted-foreground">embedded author: <code>{p.author.name}</code></div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold">Normalized Entity Store</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">O(1) Single Source</Badge>
            </div>
            <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-foreground/90">
              {JSON.stringify(normalized, null, 2)}
            </pre>
          </div>
        </div>

        <div className="rounded-md border border-border bg-muted/20 p-2.5">
          <div className="mb-1 text-[11px] font-semibold text-muted-foreground">Flux Action Log</div>
          <div className="space-y-1 font-mono text-[11px]">
            {actions.length === 0
              ? <span className="text-muted-foreground">Dispatch an action above...</span>
              : actions.map((a, i) => <div key={i}>{a}</div>)}
          </div>
        </div>
      </div>
    </VisualizerFrame>
  );
}
