import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Compass,
  Layers,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SCENARIOS } from '@/data/scenarios';
import { CATEGORY_MAP } from '@/data/categories';
import { TOPIC_META_MAP } from '@/data/topicIndex';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';
import { cn } from '@/lib/utils';

type RadioStepKey = 'requirements' | 'architecture' | 'dataModel' | 'interfaceApi' | 'optimizations';

const RADIO_STEPS: { key: RadioStepKey; letter: string; shortLabel: { vi: string; en: string } }[] = [
  { key: 'requirements', letter: 'R', shortLabel: { vi: 'R · Yêu cầu', en: 'R · Requirements' } },
  { key: 'architecture', letter: 'A', shortLabel: { vi: 'A · Kiến trúc', en: 'A · Architecture' } },
  { key: 'dataModel', letter: 'D', shortLabel: { vi: 'D · Dữ liệu', en: 'D · Data Model' } },
  { key: 'interfaceApi', letter: 'I', shortLabel: { vi: 'I · Interface/API', en: 'I · Interface/API' } },
  { key: 'optimizations', letter: 'O', shortLabel: { vi: 'O · Tối ưu', en: 'O · Optimizations' } },
];

export default function ScenariosPage() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const { locale, progress } = useApp();

  const activeScenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [radioTab, setRadioTab] = useState<'all' | RadioStepKey>('all');

  const getAnswerKey = (decisionId: string) => `${activeScenario.id}:${decisionId}`;

  const handleChooseDecision = (decisionId: string, optionIdx: number) => {
    setSelectedOptions((prev) => ({ ...prev, [getAnswerKey(decisionId)]: optionIdx }));
  };

  const resetScenarioDecisions = () => {
    setSelectedOptions((prev) => {
      const next = { ...prev };
      for (const d of activeScenario.decisions) {
        delete next[getAnswerKey(d.id)];
      }
      return next;
    });
  };

  const optimalCount = activeScenario.decisions.filter((d) => {
    const picked = selectedOptions[getAnswerKey(d.id)];
    return picked !== undefined && d.options[picked]?.isOptimal;
  }).length;

  const answeredCount = activeScenario.decisions.filter(
    (d) => selectedOptions[getAnswerKey(d.id)] !== undefined,
  ).length;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Layers className="size-6 text-primary" />
              {t(UI_STRINGS.scenarios.heading, locale)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t(UI_STRINGS.scenarios.subheading, locale)}</p>
          </div>
          <Badge variant="outline" className="w-fit px-3 py-1 font-mono text-xs tabular-nums">
            {SCENARIOS.length} {locale === 'vi' ? 'hệ thống mẫu' : 'case studies'}
          </Badge>
        </div>

        {/* 6-Scenario Selector Grid */}
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((sc) => {
            const active = sc.id === activeScenario.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => navigate(`/scenarios/${sc.id}`)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'flex flex-col justify-between gap-2 rounded-lg border p-3.5 text-left transition-colors',
                  active
                    ? 'border-primary bg-primary/8 text-foreground'
                    : 'border-border bg-background/60 hover:border-primary/40 hover:bg-muted/40',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold leading-snug">{t(sc.title, locale)}</span>
                  <Badge variant={active ? 'default' : 'outline'} className="shrink-0 text-[10px]">
                    {t(UI_STRINGS.difficulty[sc.difficulty], locale)}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {t(sc.subtitle, locale)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Scenario Header */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {t(UI_STRINGS.difficulty[activeScenario.difficulty], locale)}
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs tabular-nums">
                {activeScenario.relatedTopicIds.length} {locale === 'vi' ? 'kỹ năng liên kết' : 'linked skills'}
              </Badge>
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              {t(activeScenario.title, locale)}
            </h2>
            <p className="text-sm text-muted-foreground">{t(activeScenario.subtitle, locale)}</p>
          </div>
        </div>

        {/* RADIO Framework Breakdown */}
        <Tabs
          value={radioTab}
          onValueChange={(v) => setRadioTab(v as 'all' | RadioStepKey)}
          className="mt-5"
        >
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1 sm:w-fit">
            <TabsTrigger value="all" className="text-xs">
              {locale === 'vi' ? 'Toàn bộ R·A·D·I·O' : 'All R·A·D·I·O'}
            </TabsTrigger>
            {RADIO_STEPS.map((step) => (
              <TabsTrigger key={step.key} value={step.key} className="text-xs">
                {t(step.shortLabel, locale)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4 grid gap-3 md:grid-cols-2">
            {RADIO_STEPS.map((step) => {
              const block = activeScenario.radio[step.key];
              return (
                <Card key={step.key} className={cn(step.key === 'optimizations' && 'md:col-span-2')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded border border-primary/40 bg-primary/10 font-mono text-xs font-bold text-primary">
                        {step.letter}
                      </span>
                      <span>{t(block.heading, locale)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {block.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
                          <span>{t(b, locale)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {RADIO_STEPS.map((step) => {
            const block = activeScenario.radio[step.key];
            return (
              <TabsContent key={step.key} value={step.key} className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded border border-primary/40 bg-primary/10 font-mono text-xs font-bold text-primary">
                        {step.letter}
                      </span>
                      <span>{t(block.heading, locale)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                      {block.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" />
                          <span>{t(b, locale)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Interactive Architecture Decisions + Linked Cheatsheet Skills */}
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                {t(UI_STRINGS.scenarios.decisionsTitle, locale)}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs tabular-nums">
                  {optimalCount}/{activeScenario.decisions.length}{' '}
                  {locale === 'vi' ? 'tối ưu' : 'optimal'}
                </Badge>
                {answeredCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={resetScenarioDecisions}
                    className="gap-1 text-xs"
                  >
                    <RotateCcw className="size-3" />
                    {locale === 'vi' ? 'Thử lại' : 'Reset'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {activeScenario.decisions.map((decision, dIdx) => {
              const pickedIdx = selectedOptions[getAnswerKey(decision.id)];
              const hasPicked = pickedIdx !== undefined;
              const chosenOption = hasPicked ? decision.options[pickedIdx] : undefined;

              return (
                <div key={decision.id} className="space-y-2.5 rounded-lg border border-border p-4">
                  <div className="text-sm font-medium leading-snug">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">D{dIdx + 1}.</span>
                    {t(decision.prompt, locale)}
                  </div>

                  <div className="space-y-2">
                    {decision.options.map((opt, oIdx) => {
                      const isPicked = pickedIdx === oIdx;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleChooseDecision(decision.id, oIdx)}
                          className={cn(
                            'flex min-h-[44px] w-full items-start justify-between gap-2.5 rounded-md border px-3 py-2.5 text-left text-xs leading-relaxed transition-colors sm:text-sm',
                            !isPicked && 'border-border hover:border-primary/40 hover:bg-muted/40',
                            isPicked && opt.isOptimal && 'border-emerald-500/50 bg-emerald-500/10',
                            isPicked && !opt.isOptimal && 'border-amber-500/60 bg-amber-500/10',
                          )}
                        >
                          <span>{t(opt.label, locale)}</span>
                          {isPicked && opt.isOptimal && (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                          )}
                          {isPicked && !opt.isOptimal && (
                            <XCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {chosenOption && (
                    <div
                      className={cn(
                        'rounded-md border px-3 py-2 text-xs leading-relaxed sm:text-sm',
                        chosenOption.isOptimal
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-foreground'
                          : 'border-amber-500/30 bg-amber-500/10 text-foreground',
                      )}
                    >
                      <strong className="mr-1.5">
                        {chosenOption.isOptimal
                          ? t(UI_STRINGS.scenarios.optimalChoice, locale)
                          : t(UI_STRINGS.scenarios.suboptimalChoice, locale)}
                        :
                      </strong>
                      <span className="text-muted-foreground">{t(chosenOption.tradeoff, locale)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Related Cheatsheet Skills */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Compass className="size-4 text-primary" />
              {t(UI_STRINGS.scenarios.relatedSkillsTitle, locale)}
            </CardTitle>
            <CardDescription>
              {locale === 'vi'
                ? 'Nhấn để mở sâu lý thuyết, lab mô phỏng và bài code tương ứng.'
                : 'Jump directly into any linked cheatsheet skill and interactive lab.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeScenario.relatedTopicIds.map((topicId) => {
              const meta = TOPIC_META_MAP[topicId];
              if (!meta) return null;
              const cat = CATEGORY_MAP[meta.categoryId];
              const status = progress.topicStatus[meta.id] ?? 'not_started';
              return (
                <Link
                  key={meta.id}
                  to={`/topic/${meta.categoryId}/${meta.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5 text-xs transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate font-medium text-foreground">{t(meta.title, locale)}</span>
                    </div>
                    <div className="mt-0.5 pl-4 text-[11px] text-muted-foreground">
                      {t(cat.title, locale)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {meta.visualizerId && (
                      <Badge variant="outline" className="font-mono text-[10px]">
                        Lab
                      </Badge>
                    )}
                    {status === 'mastered' ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : status === 'in_progress' ? (
                      <span className="size-2.5 rounded-full bg-amber-400" />
                    ) : (
                      <Circle className="size-3.5 text-muted-foreground/50" />
                    )}
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
