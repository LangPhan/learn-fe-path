import { useRef, useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';

export default function I18nPlaygroundVisualizer() {
  const { locale } = useApp();
  const [rtl, setRtl] = useState(false);
  const [fmtLocale, setFmtLocale] = useState('vi-VN');
  const [currency, setCurrency] = useState('VND');
  const [imeValue, setImeValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [imeLogs, setImeLogs] = useState<string[]>([]);
  const composingRef = useRef(false);

  const amount = currency === 'VND' ? 1250000 : 1299.5;
  const formattedPrice = new Intl.NumberFormat(fmtLocale, { style: 'currency', currency }).format(amount);
  const formattedDate = new Intl.DateTimeFormat(fmtLocale, { dateStyle: 'full' }).format(new Date('2026-11-23T09:00:00Z'));
  const formattedRel = new Intl.RelativeTimeFormat(fmtLocale, { numeric: 'auto' }).format(-1, 'day');

  return (
    <VisualizerFrame
      title={{ vi: 'i18n Lab: RTL Logical CSS + Intl API + IME Inspector', en: 'i18n Lab: LTR/RTL Logical CSS + Intl Formatting + IME' }}
      description={{
        vi: 'Trải nghiệm lật giao diện RTL tức thì với Logical CSS, định dạng `Intl` bản địa hóa và theo dõi trạng thái gõ tổ hợp IME.',
        en: 'Mirror layouts dynamically with CSS Logical Properties, inspect native `Intl` output, and trace live IME composition events.',
      }}
      onReset={() => {
        setRtl(false);
        setFmtLocale('vi-VN');
        setCurrency('VND');
        setImeValue('');
        setImeLogs([]);
      }}
    >
      <Tabs defaultValue="rtl">
        <TabsList>
          <TabsTrigger value="rtl">LTR / RTL Mirroring</TabsTrigger>
          <TabsTrigger value="intl">Intl Formatters</TabsTrigger>
          <TabsTrigger value="ime">IME Guard</TabsTrigger>
        </TabsList>

        <TabsContent value="rtl" className="mt-3 space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <Switch checked={rtl} onCheckedChange={setRtl} aria-label="Toggle RTL direction" />
            <span className="font-medium">dir="{rtl ? 'rtl' : 'ltr'}"</span>
          </div>
          <div dir={rtl ? 'rtl' : 'ltr'} className="grid gap-3 sm:grid-cols-2">
            <div
              className="rounded-md border border-emerald-500/40 bg-card p-3"
              style={{ borderInlineStartWidth: 4, borderInlineStartColor: '#22c55e', textAlign: 'start' }}
            >
              <div className="font-semibold">✅ Logical (`border-inline-start` + `text-start`)</div>
              <p className="mt-1 text-muted-foreground">
                {rtl ? 'يتم عكس الهامش والحدود تلقائيًا في الاتجاه من اليمين إلى اليسار.' : 'Adapts border, padding, and text alignment automatically on RTL flip.'}
              </p>
            </div>
            <div
              className="rounded-md border border-rose-500/40 bg-card p-3"
              style={{ borderLeftWidth: 4, borderLeftColor: '#ef4444', textAlign: 'left' }}
            >
              <div className="font-semibold">❌ Physical (`border-left` + `text-left`)</div>
              <p className="mt-1 text-muted-foreground">
                {rtl ? 'يبقى النص والحد ملتصقين باليسار بشكل خاطئ!' : 'Stays pinned on the physical left edge when RTL turns on.'}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="intl" className="mt-3 space-y-3 text-xs">
          <div className="flex flex-wrap gap-2">
            <Select value={fmtLocale} onValueChange={(v) => { if (v) setFmtLocale(v); }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vi-VN">vi-VN (Tiếng Việt)</SelectItem>
                <SelectItem value="en-US">en-US (US English)</SelectItem>
                <SelectItem value="de-DE">de-DE (Deutsch)</SelectItem>
                <SelectItem value="ar-SA">ar-SA (العربية)</SelectItem>
                <SelectItem value="ja-JP">ja-JP (日本語)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={currency} onValueChange={(v) => { if (v) setCurrency(v); }}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VND">VND</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 font-mono">
            <div className="rounded-md border border-border p-2.5">
              <div className="text-[10px] text-muted-foreground">Intl.NumberFormat</div>
              <div className="mt-1 text-sm font-semibold">{formattedPrice}</div>
            </div>
            <div className="rounded-md border border-border p-2.5">
              <div className="text-[10px] text-muted-foreground">Intl.DateTimeFormat</div>
              <div className="mt-1 text-xs font-semibold">{formattedDate}</div>
            </div>
            <div className="rounded-md border border-border p-2.5">
              <div className="text-[10px] text-muted-foreground">Intl.RelativeTimeFormat</div>
              <div className="mt-1 text-sm font-semibold">{formattedRel}</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ime" className="mt-3 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span>{locale === 'vi' ? 'Gõ bộ gõ Telex/CJK và bấm Enter:' : 'Type with an IME and press Enter:'}</span>
            <Badge variant={isComposing ? 'default' : 'outline'}>
              {isComposing ? 'isComposing = TRUE' : 'isComposing = FALSE'}
            </Badge>
          </div>
          <Input
            value={imeValue}
            onChange={(e) => setImeValue(e.target.value)}
            onCompositionStart={() => {
              composingRef.current = true;
              setIsComposing(true);
              setImeLogs((l) => ['compositionstart', ...l].slice(0, 6));
            }}
            onCompositionUpdate={(e) => {
              setImeLogs((l) => [`compositionupdate("${e.data}")`, ...l].slice(0, 6));
            }}
            onCompositionEnd={(e) => {
              composingRef.current = false;
              setIsComposing(false);
              setImeLogs((l) => [`compositionend("${e.data}")`, ...l].slice(0, 6));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.nativeEvent.isComposing || composingRef.current || e.keyCode === 229) {
                  setImeLogs((l) => ['BLOCKED premature Enter while composing!', ...l].slice(0, 6));
                  return;
                }
                setImeLogs((l) => [`SUBMITTED cleanly: "${imeValue}"`, ...l].slice(0, 6));
                setImeValue('');
              }
            }}
            placeholder="Try Vietnamese / Japanese / Chinese IME..."
          />
          <div className="rounded border border-border bg-muted/20 p-2 font-mono text-[11px] text-muted-foreground">
            {imeLogs.length === 0 ? 'Waiting for composition events...' : imeLogs.map((item, i) => <div key={i}>{item}</div>)}
          </div>
        </TabsContent>
      </Tabs>
    </VisualizerFrame>
  );
}
