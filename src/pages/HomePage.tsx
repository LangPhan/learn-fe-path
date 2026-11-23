import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Circle,
  Code2,
  Download,
  FlaskConical,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CATEGORIES } from '@/data/categories';
import { TOPIC_INDEX, TOPIC_META_MAP } from '@/data/topicIndex';
import { loadAllChallenges } from '@/data/loader';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';
import type { CategoryMeta, TopicMeta } from '@/types/curriculum';

type FilterMode = 'all' | 'not_started' | 'in_progress' | 'mastered' | 'has_lab' | 'has_challenge' | 'bookmarked';

export default function HomePage() {
  const { locale, progress, exportProgressJson, importProgressJson, resetProgress } = useApp();
  const [filter, setFilter] = useState<FilterMode>('all');
  const [resetOpen, setResetOpen] = useState(false);
  const [challengeTopicMap, setChallengeTopicMap] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadAllChallenges().then((list) => {
      const map: Record<string, string> = {};
      for (const ch of list) map[ch.topicId] = ch.id;
      setChallengeTopicMap(map);
    });
  }, []);

  const totalTopics = TOPIC_INDEX.length;
  const masteredCount = TOPIC_INDEX.filter((item) => progress.topicStatus[item.id] === 'mastered').length;
  const inProgressCount = TOPIC_INDEX.filter((item) => progress.topicStatus[item.id] === 'in_progress').length;
  const totalChallenges = TOPIC_INDEX.filter((item) => item.hasChallenge).length;
  const solvedCount = progress.solvedChallenges.length;
  const quizAttempts = Object.values(progress.quizAnswers);
  const quizCorrect = quizAttempts.filter((a) => a.isCorrect).length;
  const quizAccuracy = quizAttempts.length > 0 ? Math.round((quizCorrect / quizAttempts.length) * 100) : 0;
  const masteryPct = Math.round((masteredCount / totalTopics) * 100);

  const lastTopic = progress.lastVisitedTopicId ? TOPIC_META_MAP[progress.lastVisitedTopicId] : undefined;

  const matchesFilter = (topic: TopicMeta): boolean => {
    const status = progress.topicStatus[topic.id] ?? 'not_started';
    if (filter === 'not_started') return status === 'not_started';
    if (filter === 'in_progress') return status === 'in_progress';
    if (filter === 'mastered') return status === 'mastered';
    if (filter === 'has_lab') return Boolean(topic.visualizerId);
    if (filter === 'has_challenge') return topic.hasChallenge;
    if (filter === 'bookmarked') return progress.bookmarks.includes(topic.id);
    return true;
  };

  const handleExport = () => {
    const data = exportProgressJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fe-system-design-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(locale === 'vi' ? 'Đã xuất file tiến độ JSON' : 'Exported progress JSON');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importProgressJson(String(reader.result ?? ''));
      if (ok) {
        toast.success(locale === 'vi' ? 'Đã khôi phục tiến độ thành công' : 'Imported progress successfully');
      } else {
        toast.error(locale === 'vi' ? 'File JSON không hợp lệ' : 'Invalid progress JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const columns: Array<1 | 2 | 3> = [1, 2, 3];
  const categoriesByCol = (col: 1 | 2 | 3): CategoryMeta[] =>
    CATEGORIES.filter((c) => c.column === col).sort((a, b) => a.order - b.order);

  const filterButtons: Array<{ key: FilterMode; label: string }> = [
    { key: 'all', label: t(UI_STRINGS.home.filters.all, locale) },
    { key: 'not_started', label: t(UI_STRINGS.home.filters.notStarted, locale) },
    { key: 'in_progress', label: t(UI_STRINGS.home.filters.inProgress, locale) },
    { key: 'mastered', label: t(UI_STRINGS.home.filters.mastered, locale) },
    { key: 'has_lab', label: t(UI_STRINGS.home.filters.hasLab, locale) },
    { key: 'has_challenge', label: t(UI_STRINGS.home.filters.hasChallenge, locale) },
    { key: 'bookmarked', label: t(UI_STRINGS.home.filters.bookmarked, locale) },
  ];

  const totalVisible = TOPIC_INDEX.filter(matchesFilter).length;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Compact Header & Progress Overview Strip */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t(UI_STRINGS.home.heading, locale)}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t(UI_STRINGS.home.subheading, locale)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              render={
                <Link
                  to={
                    lastTopic
                      ? `/topic/${lastTopic.categoryId}/${lastTopic.id}`
                      : '/topic/architecture/ssr'
                  }
                />
              }
              className="gap-1.5"
            >
              {lastTopic ? t(UI_STRINGS.home.continueLearning, locale) : t(UI_STRINGS.home.startFirst, locale)}
              <ArrowRight className="size-3.5" />
            </Button>

            <Button type="button" variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
              <Download className="size-3.5" />
              {t(UI_STRINGS.home.exportProgress, locale)}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 text-xs"
            >
              <Upload className="size-3.5" />
              {t(UI_STRINGS.home.importProgress, locale)}
            </Button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setResetOpen(true)}
              aria-label={t(UI_STRINGS.home.resetProgress, locale)}
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* 4 compact stat cards + overall bar */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/60 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t(UI_STRINGS.home.masteredLabel, locale)}</span>
              <span className="font-mono tabular-nums">{masteryPct}%</span>
            </div>
            <div className="mt-1 font-mono text-xl font-bold tabular-nums">
              {masteredCount} <span className="text-sm font-normal text-muted-foreground">/ {totalTopics}</span>
            </div>
            <Progress value={masteryPct} className="mt-2 h-1.5" />
          </div>

          <div className="rounded-lg border border-border/80 bg-background/60 p-3">
            <div className="text-xs text-muted-foreground">{t(UI_STRINGS.home.inProgressLabel, locale)}</div>
            <div className="mt-1 font-mono text-xl font-bold tabular-nums">{inProgressCount}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">14 {locale === 'vi' ? 'nhóm kiến thức' : 'categories'}</div>
          </div>

          <div className="rounded-lg border border-border/80 bg-background/60 p-3">
            <div className="text-xs text-muted-foreground">{t(UI_STRINGS.home.challengesLabel, locale)}</div>
            <div className="mt-1 font-mono text-xl font-bold text-primary tabular-nums">
              {solvedCount} <span className="text-sm font-normal text-muted-foreground">/ {totalChallenges}</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">Unit-tested in browser</div>
          </div>

          <div className="rounded-lg border border-border/80 bg-background/60 p-3">
            <div className="text-xs text-muted-foreground">{t(UI_STRINGS.home.quizAccuracyLabel, locale)}</div>
            <div className="mt-1 font-mono text-xl font-bold text-emerald-400 tabular-nums">
              {quizAttempts.length > 0 ? `${quizAccuracy}%` : '—'}
            </div>
            <div className="mt-1 font-mono text-[11px] text-muted-foreground tabular-nums">
              {quizCorrect}/{quizAttempts.length} {locale === 'vi' ? 'câu đã trả lời' : 'answered'}
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border/80 pt-4">
          {filterButtons.map((fb) => (
            <Button
              key={fb.key}
              type="button"
              size="xs"
              variant={filter === fb.key ? 'default' : 'outline'}
              onClick={() => setFilter(fb.key)}
            >
              {fb.label}
            </Button>
          ))}
        </div>
      </section>

      {/* 3-Column Interactive Cheatsheet Map mirroring reference cheatsheet */}
      {totalVisible === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {t(UI_STRINGS.home.noFilterMatch, locale)}
        </div>
      ) : (
        <section aria-label="Front End System Design Cheatsheet Map" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {columns.map((col) => (
            <div key={col} className="flex flex-col gap-6">
              {categoriesByCol(col).map((cat) => {
                const catTopics = TOPIC_INDEX.filter((item) => item.categoryId === cat.id);
                const visibleTopics = catTopics.filter(matchesFilter);
                if (visibleTopics.length === 0) return null;

                const catMastered = catTopics.filter((item) => progress.topicStatus[item.id] === 'mastered').length;

                return (
                  <article
                    key={cat.id}
                    data-slot="cheatsheet-category"
                    className="rounded-xl border border-border bg-card p-4 transition-colors"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center rounded px-2 py-0.5 font-heading text-xs font-bold tracking-tight"
                        style={{ backgroundColor: cat.color, color: cat.badgeTextColor }}
                      >
                        {t(cat.title, locale)}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                        {catMastered}/{catTopics.length}
                      </span>
                    </div>

                    <ul className="space-y-1">
                      {visibleTopics.map((topic) => {
                        const status = progress.topicStatus[topic.id] ?? 'not_started';
                        const isBookmarked = progress.bookmarks.includes(topic.id);
                        const chId = challengeTopicMap[topic.id];
                        const isSolved = Boolean(chId && progress.solvedChallenges.includes(chId));

                        return (
                          <li key={topic.id}>
                            <Link
                              to={`/topic/${cat.id}/${topic.id}`}
                              className="group flex items-start justify-between gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm transition-all duration-150 hover:-translate-y-px hover:border-border hover:bg-muted/50"
                            >
                              <div className="flex min-w-0 items-start gap-2">
                                {status === 'mastered' ? (
                                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                                ) : status === 'in_progress' ? (
                                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="In progress" />
                                ) : (
                                  <Circle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground" />
                                )}
                                <div className="min-w-0">
                                  <span className="block leading-snug text-foreground group-hover:text-primary">
                                    {topic.shortTitle}
                                  </span>
                                  {locale === 'vi' && t(topic.title, 'vi') !== topic.shortTitle && (
                                    <span className="block text-[11px] leading-tight text-muted-foreground">
                                      {t(topic.title, 'vi')}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-1 pt-0.5">
                                {isBookmarked && <Bookmark className="size-3 fill-amber-400 text-amber-400" />}
                                {topic.visualizerId && (
                                  <Badge variant="outline" className="h-4 gap-0.5 px-1 font-mono text-[9px] text-sky-400">
                                    <FlaskConical className="size-2.5" />
                                    {t(UI_STRINGS.home.labBadge, locale)}
                                  </Badge>
                                )}
                                {topic.hasChallenge && (
                                  <Badge
                                    variant={isSolved ? 'default' : 'outline'}
                                    className="h-4 gap-0.5 px-1 font-mono text-[9px]"
                                  >
                                    <Code2 className="size-2.5" />
                                    {t(UI_STRINGS.home.codeBadge, locale)}
                                  </Badge>
                                )}
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                );
              })}
            </div>
          ))}
        </section>
      )}

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(UI_STRINGS.home.resetProgress, locale)}</DialogTitle>
            <DialogDescription>{t(UI_STRINGS.home.resetConfirm, locale)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetOpen(false)}>
              {t(UI_STRINGS.playground.cancel, locale)}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                resetProgress();
                setResetOpen(false);
                toast.info(locale === 'vi' ? 'Đã đặt lại toàn bộ tiến độ' : 'Progress reset');
              }}
            >
              {t(UI_STRINGS.home.resetProgress, locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
