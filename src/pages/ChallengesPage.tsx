import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Code2, ExternalLink, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodePlayground } from '@/components/playground/CodePlayground';
import { CATEGORIES, CATEGORY_MAP } from '@/data/categories';
import { loadAllChallenges } from '@/data/loader';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';
import type { CodingChallenge } from '@/types/curriculum';

export default function ChallengesPage() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { locale, progress } = useApp();

  const [challenges, setChallenges] = useState<CodingChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<string>('all');
  const [diffFilter, setDiffFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    void loadAllChallenges().then((list) => {
      setChallenges(list);
      setLoading(false);
    });
  }, []);

  const selected = challengeId ? challenges.find((c) => c.id === challengeId) : undefined;

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-12 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        Loading automated coding challenges...
      </div>
    );
  }

  if (selected) {
    const cat = CATEGORY_MAP[selected.categoryId];
    const isSolved = progress.solvedChallenges.includes(selected.id);
    return (
      <div className="mx-auto max-w-[1440px] space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" size="sm" render={<Link to="/challenges" />} className="gap-1.5 text-xs">
            <ArrowLeft className="size-3.5" />
            {t(UI_STRINGS.challenges.backToList, locale)}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            render={<Link to={`/topic/${selected.categoryId}/${selected.topicId}`} />}
            className="gap-1.5 text-xs"
          >
            {t(UI_STRINGS.challenges.viewRelatedTopic, locale)}
            <ExternalLink className="size-3.5" />
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded px-2 py-0.5 text-xs font-bold"
              style={{ backgroundColor: cat.color, color: cat.badgeTextColor }}
            >
              {t(cat.title, locale)}
            </span>
            <Badge variant="outline" className="text-[11px]">
              {t(UI_STRINGS.difficulty[selected.difficulty], locale)}
            </Badge>
            {isSolved && (
              <Badge className="gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                {t(UI_STRINGS.challenges.solvedBadge, locale)}
              </Badge>
            )}
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            {t(selected.title, locale)}
          </h1>
        </div>

        <CodePlayground
          challenge={selected}
          initialMode="challenge"
          editorHeight="360px"
          previewHeight="280px"
        />
      </div>
    );
  }

  const filtered = challenges.filter((c) => {
    if (catFilter !== 'all' && c.categoryId !== catFilter) return false;
    if (diffFilter !== 'all' && c.difficulty !== diffFilter) return false;
    const solved = progress.solvedChallenges.includes(c.id);
    if (statusFilter === 'solved' && !solved) return false;
    if (statusFilter === 'unsolved' && solved) return false;
    return true;
  });

  const solvedCount = challenges.filter((c) => progress.solvedChallenges.includes(c.id)).length;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t(UI_STRINGS.challenges.heading, locale)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t(UI_STRINGS.challenges.subheading, locale)}</p>
          </div>
          <Badge variant="outline" className="w-fit px-3 py-1 font-mono text-xs tabular-nums">
            {solvedCount} / {challenges.length} {t(UI_STRINGS.challenges.solvedBadge, locale)}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Filter className="size-3.5 text-muted-foreground" />
          <Select value={catFilter} onValueChange={(v) => { if (v) setCatFilter(v); }}>
            <SelectTrigger size="sm" className="w-48 text-xs">
              <SelectValue>
                {catFilter === 'all' ? t(UI_STRINGS.challenges.allCategories, locale) : t(CATEGORY_MAP[catFilter as keyof typeof CATEGORY_MAP].title, locale)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t(UI_STRINGS.challenges.allCategories, locale)}</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>{t(c.title, locale)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={diffFilter} onValueChange={(v) => { if (v) setDiffFilter(v); }}>
            <SelectTrigger size="sm" className="w-36 text-xs">
              <SelectValue>
                {diffFilter === 'all'
                  ? t(UI_STRINGS.challenges.allDifficulties, locale)
                  : t(UI_STRINGS.difficulty[diffFilter as 'easy' | 'medium' | 'hard'], locale)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t(UI_STRINGS.challenges.allDifficulties, locale)}</SelectItem>
              <SelectItem value="easy">{t(UI_STRINGS.difficulty.easy, locale)}</SelectItem>
              <SelectItem value="medium">{t(UI_STRINGS.difficulty.medium, locale)}</SelectItem>
              <SelectItem value="hard">{t(UI_STRINGS.difficulty.hard, locale)}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v); }}>
            <SelectTrigger size="sm" className="w-36 text-xs">
              <SelectValue>
                {statusFilter === 'all'
                  ? (locale === 'vi' ? 'Mọi trạng thái' : 'All statuses')
                  : statusFilter === 'solved'
                    ? t(UI_STRINGS.challenges.solvedBadge, locale)
                    : t(UI_STRINGS.challenges.unsolvedBadge, locale)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{locale === 'vi' ? 'Mọi trạng thái' : 'All statuses'}</SelectItem>
              <SelectItem value="unsolved">{t(UI_STRINGS.challenges.unsolvedBadge, locale)}</SelectItem>
              <SelectItem value="solved">{t(UI_STRINGS.challenges.solvedBadge, locale)}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((ch) => {
          const cat = CATEGORY_MAP[ch.categoryId];
          const solved = progress.solvedChallenges.includes(ch.id);
          return (
            <Card
              key={ch.id}
              className="flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 hover:border-primary/40"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: cat.color, color: cat.badgeTextColor }}
                  >
                    {t(cat.title, locale)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {t(UI_STRINGS.difficulty[ch.difficulty], locale)}
                    </Badge>
                    {solved && <CheckCircle2 className="size-4 text-emerald-500" />}
                  </div>
                </div>
                <CardTitle className="mt-2 text-base font-semibold leading-snug">
                  {t(ch.title, locale)}
                </CardTitle>
                <CardDescription className="line-clamp-3 text-xs leading-relaxed">
                  {t(ch.prompt, locale)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant={solved ? 'outline' : 'default'}
                  className="w-full gap-1.5"
                  onClick={() => navigate(`/challenges/${ch.id}`)}
                >
                  <Code2 className="size-3.5" />
                  {t(UI_STRINGS.challenges.openChallenge, locale)}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
