import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  HelpCircle,
  Play,
  RotateCcw,
  Trophy,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CATEGORIES, CATEGORY_MAP } from '@/data/categories';
import { TOPIC_META_MAP } from '@/data/topicIndex';
import { loadAllQuizzes } from '@/data/loader';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';
import { cn } from '@/lib/utils';
import type { CategoryId, QuizQuestion } from '@/types/curriculum';

type Phase = 'setup' | 'active' | 'results';
type ScopeMode = 'all' | 'unmastered';
type QuestionLimit = 10 | 20 | 30 | 999;

function shuffleQuestions(items: QuizQuestion[]): QuizQuestion[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function QuizArenaPage() {
  const { locale, progress, recordQuizAnswer } = useApp();

  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [phase, setPhase] = useState<Phase>('setup');
  const [scope, setScope] = useState<ScopeMode>('all');
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([]);
  const [questionLimit, setQuestionLimit] = useState<QuestionLimit>(10);

  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    void loadAllQuizzes().then((items) => {
      setAllQuestions(items);
      setLoading(false);
    });
  }, []);

  const filteredPool = useMemo(() => {
    return allQuestions.filter((q) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(q.categoryId)) {
        return false;
      }
      if (scope === 'unmastered' && progress.topicStatus[q.topicId] === 'mastered') {
        return false;
      }
      return true;
    });
  }, [allQuestions, progress.topicStatus, scope, selectedCategories]);

  const toggleCategory = (catId: CategoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    );
  };

  const startSession = () => {
    if (filteredPool.length === 0) return;
    const count = Math.min(questionLimit, filteredPool.length);
    const chosen = shuffleQuestions(filteredPool).slice(0, count);
    setSessionQuestions(chosen);
    setCurrentIndex(0);
    setSessionAnswers({});
    setPhase('active');
  };

  const handleSelectOption = (q: QuizQuestion, optionIdx: number) => {
    if (sessionAnswers[q.id] !== undefined) return;
    setSessionAnswers((prev) => ({ ...prev, [q.id]: optionIdx }));
    recordQuizAnswer(q.id, {
      selectedIndex: optionIdx,
      isCorrect: optionIdx === q.correctIndex,
      answeredAt: Date.now(),
    });
  };

  const resetToSetup = () => {
    setPhase('setup');
    setSessionQuestions([]);
    setSessionAnswers({});
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-12 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        {locale === 'vi' ? 'Đang tải ngân hàng câu hỏi...' : 'Loading question bank...'}
      </div>
    );
  }

  if (phase === 'active' && sessionQuestions.length > 0) {
    const q = sessionQuestions[currentIndex];
    const cat = CATEGORY_MAP[q.categoryId];
    const topicMeta = TOPIC_META_MAP[q.topicId];
    const picked = sessionAnswers[q.id];
    const hasAnswered = picked !== undefined;
    const answeredCount = Object.keys(sessionAnswers).length;
    const progressPercent = Math.round((answeredCount / sessionQuestions.length) * 100);
    const isLast = currentIndex === sessionQuestions.length - 1;

    return (
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs tabular-nums">
              {currentIndex + 1} / {sessionQuestions.length}
            </Badge>
            <span
              className="rounded px-2 py-0.5 text-[11px] font-bold"
              style={{ backgroundColor: cat.color, color: cat.badgeTextColor }}
            >
              {t(cat.title, locale)}
            </span>
            {topicMeta && (
              <span className="text-xs text-muted-foreground">{t(topicMeta.title, locale)}</span>
            )}
          </div>
          <Button type="button" variant="ghost" size="xs" onClick={resetToSetup} className="gap-1.5 text-xs">
            <RotateCcw className="size-3.5" />
            {locale === 'vi' ? 'Đổi cấu hình' : 'New setup'}
          </Button>
        </div>

        <Progress value={progressPercent} aria-label="Quiz progress" />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold leading-relaxed sm:text-lg">
              {t(q.question, locale)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {q.options.map((opt, idx) => {
              const isPicked = picked === idx;
              const isCorrect = idx === q.correctIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(q, idx)}
                  className={cn(
                    'flex min-h-[44px] w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-sm leading-relaxed transition-colors',
                    !hasAnswered && 'border-border hover:border-primary/50 hover:bg-muted/50',
                    hasAnswered && isCorrect && 'border-emerald-500/50 bg-emerald-500/10 text-foreground',
                    hasAnswered && isPicked && !isCorrect && 'border-destructive/50 bg-destructive/10 text-foreground',
                    hasAnswered && !isPicked && !isCorrect && 'border-border/60 opacity-60',
                  )}
                >
                  <span className="mt-0.5 shrink-0 font-mono text-xs font-semibold text-muted-foreground">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="flex-1">{t(opt, locale)}</span>
                  {hasAnswered && isCorrect && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />}
                  {hasAnswered && isPicked && !isCorrect && <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />}
                </button>
              );
            })}

            {hasAnswered && (
              <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3.5 text-xs leading-relaxed sm:text-sm">
                <span className="font-semibold text-foreground">
                  {picked === q.correctIndex ? t(UI_STRINGS.quiz.correct, locale) : t(UI_STRINGS.quiz.incorrect, locale)}:{' '}
                </span>
                <span className="text-muted-foreground">{t(q.explanation, locale)}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3">
              {topicMeta ? (
                <Button
                  variant="link"
                  size="sm"
                  render={<Link to={`/topic/${q.categoryId}/${q.topicId}`} />}
                  className="px-0 text-xs"
                >
                  {locale === 'vi' ? 'Mở bài học gốc' : 'Open topic'}
                </Button>
              ) : (
                <span />
              )}

              <Button
                type="button"
                disabled={!hasAnswered}
                onClick={() => {
                  if (isLast) {
                    setPhase('results');
                  } else {
                    setCurrentIndex((prev) => prev + 1);
                  }
                }}
                className="gap-1.5"
              >
                {isLast ? t(UI_STRINGS.quiz.finishQuiz, locale) : t(UI_STRINGS.quiz.nextQuestion, locale)}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === 'results') {
    const total = sessionQuestions.length;
    const correctCount = sessionQuestions.filter((q) => sessionAnswers[q.id] === q.correctIndex).length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const weakTopicMap = new Map<string, { categoryId: CategoryId; topicId: string; misses: number }>();
    const categoryStats = new Map<CategoryId, { total: number; correct: number }>();

    for (const q of sessionQuestions) {
      const prevCat = categoryStats.get(q.categoryId) ?? { total: 0, correct: 0 };
      const isRight = sessionAnswers[q.id] === q.correctIndex;
      categoryStats.set(q.categoryId, {
        total: prevCat.total + 1,
        correct: prevCat.correct + (isRight ? 1 : 0),
      });

      if (!isRight) {
        const existing = weakTopicMap.get(q.topicId);
        weakTopicMap.set(q.topicId, {
          categoryId: q.categoryId,
          topicId: q.topicId,
          misses: (existing?.misses ?? 0) + 1,
        });
      }
    }

    const weakTopics = Array.from(weakTopicMap.values());

    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-primary/10 text-primary">
                  <Trophy className="size-5" />
                </span>
                <div>
                  <CardTitle className="text-xl">{t(UI_STRINGS.quiz.scoreHeading, locale)}</CardTitle>
                  <CardDescription>
                    {locale === 'vi'
                      ? 'Kết quả đã được lưu vào tiến độ Quiz của bạn.'
                      : 'Results have been saved to your quiz history.'}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="px-3 py-1 font-mono text-base font-bold tabular-nums">
                {correctCount} / {total} ({accuracy}%)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={accuracy} aria-label="Final quiz score" />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={resetToSetup} className="gap-1.5">
                <RotateCcw className="size-4" />
                {t(UI_STRINGS.quiz.restartQuiz, locale)}
              </Button>
              <Button variant="outline" render={<Link to="/" />}>
                {t(UI_STRINGS.nav.cheatsheet, locale)}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t(UI_STRINGS.quiz.reviewWeakTopics, locale)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weakTopics.length === 0 ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {locale === 'vi'
                    ? 'Tuyệt vời — bạn trả lời đúng 100% câu hỏi trong phiên này!'
                    : 'Perfect run — you answered every question correctly!'}
                </p>
              ) : (
                weakTopics.map((item) => {
                  const meta = TOPIC_META_MAP[item.topicId];
                  const cat = CATEGORY_MAP[item.categoryId];
                  return (
                    <Link
                      key={item.topicId}
                      to={`/topic/${item.categoryId}/${item.topicId}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:border-primary/40 hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">
                          {meta ? t(meta.title, locale) : item.topicId}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{t(cat.title, locale)}</div>
                      </div>
                      <Badge variant="outline" className="shrink-0 font-mono text-[10px] text-destructive">
                        {item.misses}x
                      </Badge>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {locale === 'vi' ? 'Chi tiết theo nhóm kỹ năng' : 'Category Breakdown'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {Array.from(categoryStats.entries()).map(([catId, stats]) => {
                const cat = CATEGORY_MAP[catId];
                const pct = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={catId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{t(cat.title, locale)}</span>
                      <span className="font-mono text-muted-foreground tabular-nums">
                        {stats.correct}/{stats.total} ({pct}%)
                      </span>
                    </div>
                    <Progress value={pct} aria-label={t(cat.title, locale)} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const limitOptions: { value: QuestionLimit; label: string }[] = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 30, label: '30' },
    { value: 999, label: locale === 'vi' ? `Tất cả (${filteredPool.length})` : `All (${filteredPool.length})` },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <HelpCircle className="size-6 text-primary" />
              {t(UI_STRINGS.quiz.heading, locale)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t(UI_STRINGS.quiz.subheading, locale)}</p>
          </div>
          <Badge variant="outline" className="w-fit px-3 py-1 font-mono text-xs tabular-nums">
            {allQuestions.length} {locale === 'vi' ? 'câu hỏi sẵn sàng' : 'questions in bank'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="size-4 text-primary" />
              {locale === 'vi' ? 'Chọn phạm vi & nhóm kỹ năng' : 'Select Scope & Categories'}
            </CardTitle>
            <CardDescription>
              {locale === 'vi'
                ? 'Không chọn nhóm nào đồng nghĩa luyện toàn bộ 14 nhóm kiến thức.'
                : 'Leave categories unselected to draw from all 14 core groups.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={scope === 'all' ? 'default' : 'outline'}
                onClick={() => setScope('all')}
              >
                {t(UI_STRINGS.quiz.scopeAll, locale)}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={scope === 'unmastered' ? 'default' : 'outline'}
                onClick={() => setScope('unmastered')}
              >
                {t(UI_STRINGS.quiz.scopeUnmastered, locale)}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {locale === 'vi' ? 'Lọc theo danh mục' : 'Filter by category'} (
                  {selectedCategories.length === 0 ? (locale === 'vi' ? 'Tất cả' : 'All') : selectedCategories.length})
                </span>
                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="font-medium text-primary hover:underline"
                  >
                    {locale === 'vi' ? 'Bỏ chọn tất cả' : 'Clear selection'}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      aria-pressed={active}
                      className={cn(
                        'inline-flex min-h-[36px] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                        active
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{t(cat.title, locale)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t(UI_STRINGS.quiz.questionCount, locale)}</CardTitle>
            <CardDescription>
              {locale === 'vi'
                ? 'Câu hỏi được xáo trộn ngẫu nhiên và chấm kèm giải thích tức thì.'
                : 'Questions are randomized per run with immediate explanations.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {limitOptions.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={questionLimit === opt.value ? 'default' : 'outline'}
                  onClick={() => setQuestionLimit(opt.value)}
                  className="font-mono tabular-nums"
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {locale === 'vi' ? 'Câu hỏi khớp bộ lọc' : 'Matching question pool'}
                </span>
                <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                  {filteredPool.length}
                </span>
              </div>
              {filteredPool.length === 0 && (
                <p className="mt-2 text-amber-600 dark:text-amber-400">
                  {locale === 'vi'
                    ? 'Không còn câu hỏi nào khớp bộ lọc (có thể bạn đã thành thạo hết nhóm này).'
                    : 'No questions match the current scope and category filters.'}
                </p>
              )}
            </div>

            <Button
              type="button"
              size="lg"
              disabled={filteredPool.length === 0}
              onClick={startSession}
              className="w-full gap-2"
            >
              <Play className="size-4" />
              {t(UI_STRINGS.quiz.startSession, locale)}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
