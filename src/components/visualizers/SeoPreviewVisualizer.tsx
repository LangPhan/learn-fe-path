import { useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

export default function SeoPreviewVisualizer() {
  const { locale } = useApp();
  const [title, setTitle] = useState('Front End System Design Studio — Interactive Guide');
  const [description, setDescription] = useState(
    'Master 86 front end system design concepts with live code sandboxes, interactive labs, and interview scenarios.',
  );
  const [canonicalUrl, setCanonicalUrl] = useState('https://fesd.example/guides/system-design');
  const [headingsInput, setHeadingsInput] = useState('1, 2, 3, 2, 3');

  const levels = headingsInput
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));

  const headingErrors: string[] = [];
  if (levels.filter((l) => l === 1).length !== 1) headingErrors.push('Need exactly one <h1>');
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      headingErrors.push(`Skip h${levels[i - 1]} -> h${levels[i]}`);
    }
  }

  const titleOk = title.length >= 25 && title.length <= 60;
  const descOk = description.length >= 80 && description.length <= 160;

  return (
    <VisualizerFrame
      title={{ vi: 'Google SERP + Open Graph Card & Heading Outline Auditor', en: 'Live Google SERP, Open Graph Card & Heading Outline Auditor' }}
      description={{
        vi: 'Chỉnh sửa `<title>`, `<meta description>`, URL và dàn ý heading để xem trước kết quả hiển thị trên Google và Social card.',
        en: 'Edit `<title>`, `<meta description>`, canonical URL, and heading outline to preview Google SERP and social unfurls live.',
      }}
      onReset={() => {
        setTitle('Front End System Design Studio — Interactive Guide');
        setDescription('Master 86 front end system design concepts with live code sandboxes, interactive labs, and interview scenarios.');
        setCanonicalUrl('https://fesd.example/guides/system-design');
        setHeadingsInput('1, 2, 3, 2, 3');
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">&lt;title&gt;</span>
              <Badge variant={titleOk ? 'default' : 'secondary'} className="font-mono text-[10px]">
                {title.length}/60 chars
              </Badge>
            </div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">&lt;meta name="description"&gt;</span>
              <Badge variant={descOk ? 'default' : 'secondary'} className="font-mono text-[10px]">
                {description.length}/160 chars
              </Badge>
            </div>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="space-y-1">
            <span className="font-medium">&lt;link rel="canonical"&gt;</span>
            <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} className="font-mono text-xs" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">{locale === 'vi' ? 'Cấp độ Heading (cách dấu phẩy)' : 'Heading Levels (comma-separated)'}</span>
              <Button type="button" size="xs" variant="ghost" onClick={() => setHeadingsInput('1, 3, 2')}>
                {locale === 'vi' ? 'Thử lỗi nhảy cấp' : 'Test Skip Bug'}
              </Button>
            </div>
            <Input value={headingsInput} onChange={(e) => setHeadingsInput(e.target.value)} className="font-mono text-xs" />
            <Badge variant={headingErrors.length === 0 ? 'default' : 'destructive'} className="text-[10px]">
              {headingErrors.length === 0 ? 'Outline Valid (No Skips)' : headingErrors.join(' · ')}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          {/* Google SERP Mock */}
          <div className="rounded-md border border-border bg-background/80 p-3.5">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Google SERP Snippet</div>
            <div className="truncate font-mono text-[11px] text-emerald-500">{canonicalUrl}</div>
            <div className="mt-0.5 line-clamp-1 text-base font-medium text-sky-400">{title || 'Untitled Page'}</div>
            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{description}</div>
          </div>

          {/* Open Graph Social Card */}
          <div className="overflow-hidden rounded-md border border-border bg-muted/20">
            <div className="flex h-20 items-center justify-between border-b border-border bg-card px-4">
              <div>
                <div className="font-mono text-[10px] uppercase text-primary">og:image (1200×630)</div>
                <div className="text-xs font-semibold">Social Unfurl Thumbnail Preview</div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">Rich Card</Badge>
            </div>
            <div className="p-3">
              <div className="truncate font-mono text-[10px] uppercase text-muted-foreground">
                {canonicalUrl.replace(/^https?:\/\//, '').split('/')[0]}
              </div>
              <div className="truncate text-sm font-semibold">{title}</div>
              <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{description}</div>
            </div>
          </div>
        </div>
      </div>
    </VisualizerFrame>
  );
}
