import { useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types/curriculum';

export function TopicQuizView({ questions }: { questions: QuizQuestion[] }) {
  const { locale, progress, recordQuizAnswer } = useApp();
  const [localSelections, setLocalSelections] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const q of questions) {
      const saved = progress.quizAnswers[q.id];
      if (saved) initial[q.id] = saved.selectedIndex;
    }
    return initial;
  });

  const handleSelect = (q: QuizQuestion, optionIdx: number) => {
    setLocalSelections((prev) => ({ ...prev, [q.id]: optionIdx }));
    recordQuizAnswer(q.id, {
      selectedIndex: optionIdx,
      isCorrect: optionIdx === q.correctIndex,
      answeredAt: Date.now(),
    });
  };

  const resetLocal = () => {
    setLocalSelections({});
  };

  const correctCount = questions.filter((q) => localSelections[q.id] === q.correctIndex).length;
  const answeredCount = questions.filter((q) => localSelections[q.id] !== undefined).length;

  return (
    <div data-slot="topic-quiz" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{t(UI_STRINGS.quiz.checkTopicQuiz, locale)}</h3>
          {answeredCount > 0 && (
            <Badge variant={correctCount === questions.length ? 'default' : 'secondary'} className="font-mono text-xs tabular-nums">
              {correctCount}/{questions.length}
            </Badge>
          )}
        </div>
        {answeredCount > 0 && (
          <Button type="button" variant="ghost" size="xs" onClick={resetLocal}>
            <RotateCcw className="size-3" />
            {t(UI_STRINGS.quiz.resetTopicQuiz, locale)}
          </Button>
        )}
      </div>

      {questions.map((q, qIdx) => {
        const picked = localSelections[q.id];
        const hasAnswered = picked !== undefined;
        return (
          <Card key={q.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium leading-snug">
                <span className="mr-2 font-mono text-xs text-muted-foreground">Q{qIdx + 1}.</span>
                {t(q.question, locale)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {q.options.map((opt, oIdx) => {
                const isPicked = picked === oIdx;
                const isCorrect = oIdx === q.correctIndex;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelect(q, oIdx)}
                    className={cn(
                      'flex w-full items-start gap-2.5 rounded-md border p-2.5 text-left text-xs leading-relaxed transition-colors',
                      !hasAnswered && 'border-border hover:border-primary/50 hover:bg-muted/50',
                      hasAnswered && isCorrect && 'border-emerald-500/50 bg-emerald-500/10 text-foreground',
                      hasAnswered && isPicked && !isCorrect && 'border-destructive/50 bg-destructive/10 text-foreground',
                      hasAnswered && !isPicked && !isCorrect && 'border-border/60 opacity-60',
                    )}
                  >
                    <span className="mt-0.5 shrink-0 font-mono text-[11px] font-semibold">
                      {String.fromCharCode(65 + oIdx)}.
                    </span>
                    <span className="flex-1">{t(opt, locale)}</span>
                    {hasAnswered && isCorrect && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />}
                    {hasAnswered && isPicked && !isCorrect && <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />}
                  </button>
                );
              })}

              {hasAnswered && (
                <div className="mt-2 rounded-md border border-border/80 bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">
                    {picked === q.correctIndex ? t(UI_STRINGS.quiz.correct, locale) : t(UI_STRINGS.quiz.incorrect, locale)}:{' '}
                  </strong>
                  {t(q.explanation, locale)}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
