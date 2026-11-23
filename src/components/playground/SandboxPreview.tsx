import { useEffect, useState } from 'react';
import { CheckCircle2, Terminal, Play, Trash2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';
import type { SandboxLogEntry, SandboxMode, TestCaseResult } from '@/types/curriculum';

export interface SandboxPreviewProps {
  runId: string;
  srcDoc: string;
  mode: SandboxMode;
  compileError: string | null;
  hasTests: boolean;
  activeTab?: 'preview' | 'console' | 'tests';
  onTabChange?: (tab: 'preview' | 'console' | 'tests') => void;
  onTestsCompleted?: (results: TestCaseResult[]) => void;
  iframeHeight?: string;
  className?: string;
}

export function SandboxPreview({
  runId,
  srcDoc,
  mode,
  compileError,
  hasTests,
  activeTab: controlledTab,
  onTabChange,
  onTestsCompleted,
  iframeHeight = '280px',
  className,
}: SandboxPreviewProps) {
  const { locale, theme } = useApp();
  const [prevRunId, setPrevRunId] = useState(runId);
  const [internalTab, setInternalTab] = useState<'preview' | 'console' | 'tests'>(
    hasTests ? 'tests' : mode === 'js' || mode === 'ts' ? 'console' : 'preview',
  );
  const [logs, setLogs] = useState<SandboxLogEntry[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);

  if (prevRunId !== runId) {
    setPrevRunId(runId);
    setLogs([]);
    setRuntimeError(null);
    setTestResults(null);
    setDurationMs(null);
  }

  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (next: 'preview' | 'console' | 'tests') => {
    setInternalTab(next);
    onTabChange?.(next);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object' || data.source !== 'fe-sd-sandbox' || data.runId !== runId) {
        return;
      }

      if (data.type === 'sandbox-log') {
        setLogs((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            level: data.level,
            args: Array.isArray(data.args) ? data.args : [String(data.args ?? '')],
            timestamp: Date.now(),
          },
        ]);
      } else if (data.type === 'sandbox-error') {
        setRuntimeError(String(data.message || 'Unknown error'));
      } else if (data.type === 'sandbox-tests') {
        const results = Array.isArray(data.results) ? (data.results as TestCaseResult[]) : [];
        setTestResults(results);
        onTestsCompleted?.(results);
      } else if (data.type === 'sandbox-done') {
        setDurationMs(typeof data.durationMs === 'number' ? data.durationMs : null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [runId, onTestsCompleted]);

  const activeError = compileError || runtimeError;
  const passedCount = testResults ? testResults.filter((r) => r.passed).length : 0;
  const totalCount = testResults ? testResults.length : 0;

  return (
    <div
      data-slot="sandbox-preview"
      className={cn('flex flex-col rounded-md border border-border bg-card', className)}
    >
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val === 'preview' || val === 'console' || val === 'tests') {
            setActiveTab(val);
          }
        }}
        className="flex flex-col gap-0"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-2.5 py-1.5">
          <TabsList className="h-7">
            <TabsTrigger value="preview" className="gap-1.5 text-xs">
              <Play className="size-3" />
              {t(UI_STRINGS.playground.previewTab, locale)}
            </TabsTrigger>
            <TabsTrigger value="console" className="gap-1.5 text-xs">
              <Terminal className="size-3" />
              {t(UI_STRINGS.playground.consoleTab, locale)}
              {logs.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1.5 font-mono text-[10px] tabular-nums">
                  {logs.length}
                </Badge>
              )}
            </TabsTrigger>
            {hasTests && (
              <TabsTrigger value="tests" className="gap-1.5 text-xs">
                {testResults ? (
                  passedCount === totalCount ? (
                    <CheckCircle2 className="size-3 text-emerald-500" />
                  ) : (
                    <XCircle className="size-3 text-destructive" />
                  )
                ) : (
                  <CheckCircle2 className="size-3" />
                )}
                {t(UI_STRINGS.playground.testsTab, locale)}
                {testResults && (
                  <Badge
                    variant={passedCount === totalCount ? 'default' : 'destructive'}
                    className="h-4 px-1.5 font-mono text-[10px] tabular-nums"
                  >
                    {passedCount}/{totalCount}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex items-center gap-2">
            {durationMs !== null && !activeError && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground tabular-nums">
                <Clock className="size-3" />
                {durationMs}ms
              </span>
            )}
            {activeTab === 'console' && logs.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setLogs([])}
                aria-label={t(UI_STRINGS.playground.clearConsole, locale)}
              >
                <Trash2 className="size-3" />
                {t(UI_STRINGS.playground.clearConsole, locale)}
              </Button>
            )}
          </div>
        </div>

        {activeError && (
          <div className="border-b border-border p-2.5">
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>{compileError ? 'Compilation Error' : 'Runtime Error'}</AlertTitle>
              <AlertDescription className="font-mono text-xs whitespace-pre-wrap break-words">
                {activeError}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <TabsContent value="preview" keepMounted className="m-0 [&[hidden]]:hidden">
          {compileError ? (
            <div className="flex items-center justify-center p-6 text-xs text-muted-foreground" style={{ height: iframeHeight }}>
              Fix compilation error above to render preview.
            </div>
          ) : (
            <div
              className="w-full"
              style={{
                height: iframeHeight,
                backgroundColor: theme === 'dark' ? '#0d1118' : '#ffffff',
                colorScheme: theme,
              }}
            >
              <iframe
                title="Live Code Sandbox Preview"
                sandbox="allow-scripts"
                srcDoc={srcDoc}
                className="block h-full w-full border-0"
                style={{
                  backgroundColor: theme === 'dark' ? '#0d1118' : '#ffffff',
                  colorScheme: theme,
                }}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="console" className="m-0">
          <ScrollArea style={{ height: iframeHeight }} className="p-3">
            {logs.length === 0 ? (
              <p className="py-8 text-center font-mono text-xs text-muted-foreground">
                {t(UI_STRINGS.playground.noConsoleLogs, locale)}
              </p>
            ) : (
              <div className="flex flex-col gap-1.5 font-mono text-xs" role="log" aria-live="polite">
                {logs.map((entry) => (
                  <div
                    key={entry.id}
                    data-level={entry.level}
                    className={cn(
                      'rounded border px-2.5 py-1.5 whitespace-pre-wrap break-words',
                      entry.level === 'error'
                        ? 'border-destructive/40 bg-destructive/10 text-destructive'
                          : entry.level === 'warn'
                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            : entry.level === 'info'
                              ? 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400'
                              : 'border-border/60 bg-muted/30 text-foreground',
                    )}
                  >
                    <span className="mr-2 text-[10px] uppercase opacity-60">[{entry.level}]</span>
                    {entry.args.join(' ')}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {hasTests && (
          <TabsContent value="tests" className="m-0">
            <ScrollArea style={{ height: iframeHeight }} className="p-3">
              {!testResults ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  {t(UI_STRINGS.playground.noTestsYet, locale)}
                </p>
              ) : (
                <div className="flex flex-col gap-2" aria-live="polite">
                  <div
                    className={cn(
                      'flex items-center justify-between rounded-md border px-3 py-2 text-xs font-medium',
                      passedCount === totalCount
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'border-destructive/40 bg-destructive/10 text-destructive',
                    )}
                  >
                    <span>
                      {passedCount} / {totalCount} {t(UI_STRINGS.playground.testsPassedSummary, locale)}
                    </span>
                    <span className="font-mono tabular-nums">
                      {Math.round((passedCount / Math.max(1, totalCount)) * 100)}%
                    </span>
                  </div>

                  {testResults.map((tc, idx) => (
                    <div
                      key={`${tc.name}-${idx}`}
                      data-state={tc.passed ? 'passed' : 'failed'}
                      className={cn(
                        'rounded-md border px-3 py-2 text-xs',
                        tc.passed
                          ? 'border-emerald-500/25 bg-emerald-500/5'
                          : 'border-destructive/30 bg-destructive/5',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-medium">
                          {tc.passed ? (
                            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                          ) : (
                            <XCircle className="size-3.5 shrink-0 text-destructive" />
                          )}
                          <span>{tc.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                          {tc.durationMs}ms
                        </span>
                      </div>
                      {tc.error && (
                        <pre className="mt-1.5 overflow-x-auto rounded bg-background/80 p-2 font-mono text-[11px] text-destructive">
                          {tc.error}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
