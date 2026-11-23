import { useRef, useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

function computeContrast(hex1: string, hex2: string): number {
  const toL = (raw: string) => {
    const h = raw.replace('#', '');
    if (h.length !== 6) return 0;
    const ch = [0, 2, 4].map((i) => {
      const s = parseInt(h.slice(i, i + 2), 16) / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  };
  const l1 = toL(hex1);
  const l2 = toL(hex2);
  return Number(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2));
}

const TOOLBAR_LABELS = ['Bold', 'Italic', 'Code', 'Link', 'List'];

export default function A11yLabVisualizer() {
  const { locale } = useApp();
  const [fg, setFg] = useState('#38bdf8');
  const [bg, setBg] = useState('#090c12');
  const [activeIdx, setActiveIdx] = useState(0);
  const [announcements, setAnnouncements] = useState<string[]>([
    'toolbar loaded: Bold button active (press ArrowLeft / ArrowRight)',
  ]);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const ratio = computeContrast(fg, bg);
  const aaNormal = ratio >= 4.5;
  const aaLarge = ratio >= 3.0;
  const aaaNormal = ratio >= 7.0;

  const focusBtn = (idx: number, reason: string) => {
    setActiveIdx(idx);
    btnRefs.current[idx]?.focus();
    setAnnouncements((prev) => [`${reason}: Focused "${TOOLBAR_LABELS[idx]}" (tabIndex=0)`, ...prev].slice(0, 5));
  };

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    const len = TOOLBAR_LABELS.length;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusBtn((i + 1) % len, 'ArrowRight');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusBtn((i - 1 + len) % len, 'ArrowLeft');
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusBtn(0, 'Home');
    } else if (e.key === 'End') {
      e.preventDefault();
      focusBtn(len - 1, 'End');
    }
  };

  return (
    <VisualizerFrame
      title={{ vi: 'Accessibility Lab: WCAG Contrast + Roving Tabindex + aria-live', en: 'Accessibility Lab: WCAG Contrast + Roving Tabindex' }}
      description={{
        vi: 'Kiểm tra tỷ lệ tương phản WCAG AA/AAA theo thời gian thực và điều hướng bàn phím bằng phím Mũi tên / Home / End trên Toolbar.',
        en: 'Inspect live WCAG 2.1 contrast ratios and test roving tabindex keyboard navigation with screen-reader logs.',
      }}
      onReset={() => {
        setFg('#38bdf8');
        setBg('#090c12');
        setActiveIdx(0);
      }}
    >
      <div className="space-y-4">
        {/* Contrast Checker */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2.5 rounded-md border border-border bg-muted/20 p-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="font-medium">Foreground Text</span>
                <div className="flex gap-1.5">
                  <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5" aria-label="Foreground color picker" />
                  <Input value={fg} onChange={(e) => setFg(e.target.value)} className="h-8 font-mono text-xs" />
                </div>
              </label>
              <label className="space-y-1">
                <span className="font-medium">Background Surface</span>
                <div className="flex gap-1.5">
                  <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5" aria-label="Background color picker" />
                  <Input value={bg} onChange={(e) => setBg(e.target.value)} className="h-8 font-mono text-xs" />
                </div>
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant="outline" className="font-mono text-xs tabular-nums">{ratio}:1</Badge>
              <Badge variant={aaNormal ? 'default' : 'destructive'}>AA Normal (4.5:1): {aaNormal ? 'PASS' : 'FAIL'}</Badge>
              <Badge variant={aaLarge ? 'default' : 'destructive'}>AA Large (3:1): {aaLarge ? 'PASS' : 'FAIL'}</Badge>
              <Badge variant={aaaNormal ? 'default' : 'secondary'}>AAA (7:1): {aaaNormal ? 'PASS' : 'FAIL'}</Badge>
            </div>
          </div>

          <div
            style={{ background: bg, color: fg }}
            className="flex flex-col justify-center rounded-md border border-border p-4"
          >
            <div className="text-lg font-bold">Large Heading Sample (18px+ Bold)</div>
            <p className="mt-1 text-sm">
              {locale === 'vi'
                ? 'Đoạn văn bản kích thước chuẩn kiểm chứng độ dễ đọc thực tế ở tỷ lệ '
                : 'Normal body copy checking real legibility at ratio '}
              <span className="font-mono font-bold">{ratio}:1</span>.
            </p>
          </div>
        </div>

        {/* Roving Tabindex Toolbar */}
        <div className="space-y-2 rounded-md border border-border bg-muted/20 p-3">
          <div className="text-xs font-medium">
            {locale === 'vi' ? 'Thử bấm vào toolbar rồi nhấn ArrowLeft / ArrowRight / Home / End:' : 'Click toolbar then navigate via ArrowLeft / ArrowRight / Home / End:'}
          </div>
          <div role="toolbar" aria-label="Interactive editor toolbar" className="flex flex-wrap gap-1.5">
            {TOOLBAR_LABELS.map((label, i) => (
              <Button
                key={label}
                ref={(el) => { btnRefs.current[i] = el; }}
                type="button"
                size="sm"
                variant={activeIdx === i ? 'default' : 'outline'}
                tabIndex={activeIdx === i ? 0 : -1}
                aria-pressed={activeIdx === i}
                onClick={() => focusBtn(i, 'Click')}
                onKeyDown={(e) => handleKeyDown(e, i)}
              >
                {label} <span className="font-mono text-[10px] opacity-70">[{activeIdx === i ? '0' : '-1'}]</span>
              </Button>
            ))}
          </div>
          <div role="status" aria-live="polite" className="rounded border border-border bg-card p-2 font-mono text-[11px] text-muted-foreground">
            {announcements.map((a, idx) => (
              <div key={idx}>{a}</div>
            ))}
          </div>
        </div>
      </div>
    </VisualizerFrame>
  );
}
