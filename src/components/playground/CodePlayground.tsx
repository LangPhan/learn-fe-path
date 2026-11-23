import { useCallback, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Eye,
  Lightbulb,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Sparkles,
  FlaskConical,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeEditor } from '@/components/playground/CodeEditor';
import { SandboxPreview } from '@/components/playground/SandboxPreview';
import { compileCode } from '@/sandbox/compiler';
import { buildSrcDoc } from '@/sandbox/buildSrcDoc';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';
import { cn } from '@/lib/utils';
import type { CodingChallenge, SandboxMode, TestCaseResult, TopicExample } from '@/types/curriculum';

export interface CodePlaygroundProps {
  topicId?: string;
  example?: TopicExample;
  challenge?: CodingChallenge;
  initialMode?: 'example' | 'challenge';
  editorHeight?: string;
  previewHeight?: string;
  className?: string;
}

export function CodePlayground({
  topicId,
  example,
  challenge,
  initialMode = 'example',
  editorHeight = '320px',
  previewHeight = '260px',
  className,
}: CodePlaygroundProps) {
  const { locale, theme, progress, markChallengeSolved } = useApp();

  const effectiveMode: 'example' | 'challenge' =
    initialMode === 'challenge' && challenge ? 'challenge' : example ? 'example' : 'challenge';

  const modeSyncKey = `${topicId ?? ''}:${example?.title.en ?? ''}:${challenge?.id ?? ''}:${effectiveMode}`;
  const [prevModeSyncKey, setPrevModeSyncKey] = useState(modeSyncKey);
  const [playgroundTab, setPlaygroundTab] = useState<'example' | 'challenge'>(effectiveMode);

  const activePlaygroundTab = prevModeSyncKey !== modeSyncKey ? effectiveMode : playgroundTab;
  if (prevModeSyncKey !== modeSyncKey) {
    setPrevModeSyncKey(modeSyncKey);
    setPlaygroundTab(effectiveMode);
  }

  const activeSource = useMemo(() => {
    if (activePlaygroundTab === 'challenge' && challenge) {
      return {
        key: `challenge-${topicId ?? ''}-${challenge.id}`,
        code: challenge.starterCode,
        css: '',
        mode: 'ts' as SandboxMode,
        testCode: challenge.testCode,
        isChallenge: true,
      };
    }
    return {
      key: `example-${topicId ?? ''}-${example?.title.en ?? 'default'}`,
      code: example?.code ?? '',
      css: example?.css ?? '',
      mode: example?.mode ?? ('ts' as SandboxMode),
      testCode: undefined,
      isChallenge: false,
    };
  }, [activePlaygroundTab, topicId, challenge, example]);

  const initialPreviewTab: 'preview' | 'console' | 'tests' = activeSource.isChallenge
    ? 'tests'
    : activeSource.mode === 'js' || activeSource.mode === 'ts'
      ? 'console'
      : 'preview';

  const [prevSourceKey, setPrevSourceKey] = useState(activeSource.key);
  const [code, setCode] = useState(activeSource.code);
  const [cssCode, setCssCode] = useState(activeSource.css);
  const [codeLayerTab, setCodeLayerTab] = useState<'main' | 'css'>('main');
  const [runCounter, setRunCounter] = useState(1);
  const [executedPayload, setExecutedPayload] = useState<{
    runId: string;
    code: string;
    css: string;
    mode: SandboxMode;
    testCode?: string;
  }>(() => ({
    runId: `run-${Date.now()}-1`,
    code: activeSource.code,
    css: activeSource.css,
    mode: activeSource.mode,
    testCode: activeSource.isChallenge ? activeSource.testCode : undefined,
  }));

  const [previewTab, setPreviewTab] = useState<'preview' | 'console' | 'tests'>(initialPreviewTab);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [confirmSolutionOpen, setConfirmSolutionOpen] = useState(false);

  if (prevSourceKey !== activeSource.key) {
    setPrevSourceKey(activeSource.key);
    setCode(activeSource.code);
    setCssCode(activeSource.css);
    setCodeLayerTab('main');
    const nextRun = runCounter + 1;
    setRunCounter(nextRun);
    setExecutedPayload({
      runId: `run-${Date.now()}-${nextRun}`,
      code: activeSource.code,
      css: activeSource.css,
      mode: activeSource.mode,
      testCode: activeSource.isChallenge ? activeSource.testCode : undefined,
    });
    setPreviewTab(initialPreviewTab);
  }

  const handleRun = useCallback(() => {
    const nextCount = runCounter + 1;
    setRunCounter(nextCount);
    const nextRunId = `run-${Date.now()}-${nextCount}`;
    setExecutedPayload({
      runId: nextRunId,
      code,
      css: cssCode,
      mode: activeSource.mode,
      testCode: activeSource.testCode,
    });
    if (activeSource.isChallenge) {
      setPreviewTab('tests');
    }
  }, [runCounter, code, cssCode, activeSource]);

  const handleReset = useCallback(() => {
    setCode(activeSource.code);
    setCssCode(activeSource.css);
    const nextCount = runCounter + 1;
    setRunCounter(nextCount);
    setExecutedPayload({
      runId: `run-${Date.now()}-${nextCount}`,
      code: activeSource.code,
      css: activeSource.css,
      mode: activeSource.mode,
      testCode: activeSource.testCode,
    });
  }, [activeSource, runCounter]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeLayerTab === 'css' ? cssCode : code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard restrictions
    }
  }, [code, cssCode, codeLayerTab]);

  const handleLoadSolution = useCallback(() => {
    if (!challenge) return;
    setCode(challenge.solutionCode);
    setConfirmSolutionOpen(false);
    const nextCount = runCounter + 1;
    setRunCounter(nextCount);
    setExecutedPayload({
      runId: `run-${Date.now()}-${nextCount}`,
      code: challenge.solutionCode,
      css: '',
      mode: 'ts',
      testCode: challenge.testCode,
    });
    setPreviewTab('tests');
  }, [challenge, runCounter]);

  const handleTestsCompleted = useCallback(
    (results: TestCaseResult[]) => {
      if (!challenge || !activeSource.isChallenge || results.length === 0) return;
      const allPassed = results.every((r) => r.passed);
      if (allPassed) {
        const alreadySolved = progress.solvedChallenges.includes(challenge.id);
        markChallengeSolved(challenge.id);
        if (!alreadySolved) {
          toast.success(t(UI_STRINGS.playground.challengeSolvedToast, locale));
        }
      }
    },
    [challenge, activeSource.isChallenge, markChallengeSolved, progress.solvedChallenges, locale],
  );

  const compiled = useMemo(() => {
    const userCompiled = compileCode(executedPayload.code, executedPayload.mode);
    if (userCompiled.error) {
      return { userCode: '', testCode: '', error: userCompiled.error };
    }
    if (executedPayload.testCode) {
      const testCompiled = compileCode(executedPayload.testCode, 'ts');
      if (testCompiled.error) {
        return { userCode: '', testCode: '', error: `Test suite error: ${testCompiled.error}` };
      }
      return { userCode: userCompiled.code, testCode: testCompiled.code, error: null };
    }
    return { userCode: userCompiled.code, testCode: undefined, error: null };
  }, [executedPayload]);

  const srcDoc = useMemo(() => {
    if (compiled.error) return '';
    return buildSrcDoc({
      runId: executedPayload.runId,
      mode: executedPayload.mode,
      compiledCode: compiled.userCode,
      compiledTestCode: compiled.testCode,
      css: executedPayload.css,
      theme,
    });
  }, [compiled, executedPayload, theme]);

  const isChallengeSolved = challenge ? progress.solvedChallenges.includes(challenge.id) : false;

  return (
    <div
      data-slot="code-playground"
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border bg-card p-3',
        expanded && 'fixed inset-4 z-50 overflow-y-auto shadow-2xl',
        className,
      )}
    >
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {example && challenge ? (
            <Tabs
              value={activePlaygroundTab}
              onValueChange={(v) => {
                if (v === 'example' || v === 'challenge') setPlaygroundTab(v);
              }}
            >
              <TabsList className="h-8">
                <TabsTrigger value="example" className="gap-1.5 text-xs">
                  <Sparkles className="size-3.5" />
                  {t(UI_STRINGS.playground.exampleMode, locale)}
                </TabsTrigger>
                <TabsTrigger value="challenge" className="gap-1.5 text-xs">
                  <FlaskConical className="size-3.5" />
                  {t(UI_STRINGS.playground.challengeMode, locale)}
                  {isChallengeSolved && <Check className="size-3 text-emerald-500" />}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[11px] uppercase">
                {activeSource.mode}
              </Badge>
              <span className="text-sm font-medium">
                {activeSource.isChallenge && challenge
                  ? t(challenge.title, locale)
                  : example
                    ? t(example.title, locale)
                    : ''}
              </span>
              {isChallengeSolved && activeSource.isChallenge && (
                <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20">
                  <Check className="mr-1 size-3" />
                  {t(UI_STRINGS.challenges.solvedBadge, locale)}
                </Badge>
              )}
            </div>
          )}

          {example?.css && activePlaygroundTab === 'example' && (
            <Tabs value={codeLayerTab} onValueChange={(v) => setCodeLayerTab(v === 'css' ? 'css' : 'main')}>
              <TabsList className="h-7">
                <TabsTrigger value="main" className="font-mono text-[11px] uppercase">
                  {activeSource.mode}
                </TabsTrigger>
                <TabsTrigger value="css" className="font-mono text-[11px] uppercase">
                  CSS
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button type="button" variant="ghost" size="xs" onClick={handleCopy}>
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            {copied ? t(UI_STRINGS.playground.copied, locale) : t(UI_STRINGS.playground.copyCode, locale)}
          </Button>
          <Button type="button" variant="ghost" size="xs" onClick={handleReset}>
            <RotateCcw className="size-3.5" />
            {t(UI_STRINGS.playground.resetCode, locale)}
          </Button>
          {activeSource.isChallenge && challenge && (
            <Button type="button" variant="outline" size="xs" onClick={() => setConfirmSolutionOpen(true)}>
              <Eye className="size-3.5" />
              {t(UI_STRINGS.playground.showSolution, locale)}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={expanded ? t(UI_STRINGS.playground.collapse, locale) : t(UI_STRINGS.playground.expand, locale)}
          >
            {expanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </Button>
          <Button type="button" size="sm" onClick={handleRun} className="gap-1.5">
            <Play className="size-3.5" />
            {activeSource.isChallenge
              ? t(UI_STRINGS.playground.runTests, locale)
              : t(UI_STRINGS.playground.runCode, locale)}
            <kbd className="hidden rounded bg-primary-foreground/15 px-1 font-mono text-[10px] sm:inline">
              Ctrl+↵
            </kbd>
          </Button>
        </div>
      </div>

      {/* Contextual guidance */}
      {activePlaygroundTab === 'example' && example && (
        <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs">
          <p className="text-foreground/90">{t(example.description, locale)}</p>
          <p className="mt-1 text-muted-foreground">
            <span className="font-medium text-primary">{t(UI_STRINGS.playground.tryItLabel, locale)} </span>
            {t(example.tryItPrompt, locale)}
          </p>
        </div>
      )}

      {activePlaygroundTab === 'challenge' && challenge && (
        <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs">
          <p className="leading-relaxed text-foreground/95">{t(challenge.prompt, locale)}</p>
        </div>
      )}

      {/* Editor */}
      <CodeEditor
        value={codeLayerTab === 'css' ? cssCode : code}
        onChange={codeLayerTab === 'css' ? setCssCode : setCode}
        mode={codeLayerTab === 'css' ? 'css' : activeSource.mode}
        theme={theme}
        onRunShortcut={handleRun}
        height={expanded ? '38vh' : editorHeight}
        ariaLabel={activeSource.isChallenge ? 'Challenge code editor' : 'Live example code editor'}
      />

      {/* Progressive Hints for Challenges */}
      {activeSource.isChallenge && challenge && challenge.hints.length > 0 && (
        <Accordion className="rounded-md border border-border/70 bg-muted/20 px-3">
          <AccordionItem value="hints" className="border-b-0">
            <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
              <span className="inline-flex items-center gap-1.5">
                <Lightbulb className="size-3.5 text-amber-500" />
                {t(UI_STRINGS.playground.hintsTitle, locale)} ({challenge.hints.length})
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-2.5">
              <ol className="list-decimal space-y-1.5 pl-4 text-xs text-muted-foreground">
                {challenge.hints.map((hint, idx) => (
                  <li key={idx}>{t(hint, locale)}</li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Live Preview / Console / Tests */}
      <SandboxPreview
        runId={executedPayload.runId}
        srcDoc={srcDoc}
        mode={executedPayload.mode}
        compileError={compiled.error}
        hasTests={Boolean(executedPayload.testCode)}
        activeTab={previewTab}
        onTabChange={setPreviewTab}
        onTestsCompleted={handleTestsCompleted}
        iframeHeight={expanded ? '34vh' : previewHeight}
      />

      {/* Solution confirmation dialog */}
      <Dialog open={confirmSolutionOpen} onOpenChange={setConfirmSolutionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(UI_STRINGS.playground.confirmSolutionTitle, locale)}</DialogTitle>
            <DialogDescription>{t(UI_STRINGS.playground.confirmSolutionDesc, locale)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmSolutionOpen(false)}>
              {t(UI_STRINGS.playground.cancel, locale)}
            </Button>
            <Button type="button" onClick={handleLoadSolution}>
              {t(UI_STRINGS.playground.confirm, locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
