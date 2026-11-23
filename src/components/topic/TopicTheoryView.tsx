import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Code2, Lightbulb, MessageSquareQuote, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TOPIC_META_MAP } from '@/data/topicIndex';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';
import type { TopicContent } from '@/types/curriculum';

export interface TopicTheoryViewProps {
  topic: TopicContent;
  onOpenChallenge?: () => void;
}

export function TopicTheoryView({ topic, onOpenChallenge }: TopicTheoryViewProps) {
  const { locale } = useApp();

  return (
    <div data-slot="topic-theory" className="space-y-5">
      {/* Mental Model */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Lightbulb className="size-3.5" />
          {t(UI_STRINGS.topic.sections.mentalModel, locale)}
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          {t(topic.mentalModel, locale)}
        </p>
      </div>

      {topic.challenge && onOpenChallenge && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Code2 className="size-4 text-primary" />
            <span>{t(topic.challenge.title, locale)}</span>
          </div>
          <Button type="button" size="xs" onClick={onOpenChallenge}>
            {t(UI_STRINGS.topic.sections.topicChallengeCta, locale)}
          </Button>
        </div>
      )}

      {/* Key Mechanics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{t(UI_STRINGS.topic.sections.keyPoints, locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
            {topic.keyPoints.map((kp, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{t(kp, locale)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Trade-offs Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="size-4" />
              {t(UI_STRINGS.topic.sections.whenToUse, locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
              {topic.tradeoffs.whenToUse.map((item, i) => (
                <li key={i}>• {t(item, locale)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-rose-500/30 bg-rose-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-rose-400">
              <XCircle className="size-4" />
              {t(UI_STRINGS.topic.sections.whenToAvoid, locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
              {topic.tradeoffs.whenToAvoid.map((item, i) => (
                <li key={i}>• {t(item, locale)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Pitfalls & Interview Tips */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-amber-400">
              <AlertTriangle className="size-4" />
              {t(UI_STRINGS.topic.sections.pitfalls, locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
              {topic.pitfalls.map((item, i) => (
                <li key={i}>• {t(item, locale)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-sky-400">
              <MessageSquareQuote className="size-4" />
              {t(UI_STRINGS.topic.sections.interviewTips, locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
              {topic.interviewTips.map((item, i) => (
                <li key={i}>• {t(item, locale)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Related Skills */}
      {topic.relatedTopicIds.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-muted-foreground">
            {t(UI_STRINGS.topic.sections.relatedTopics, locale)}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topic.relatedTopicIds.map((relId) => {
              const meta = TOPIC_META_MAP[relId];
              if (!meta) return null;
              return (
                <Badge
                  key={relId}
                  variant="outline"
                  render={<Link to={`/topic/${meta.categoryId}/${meta.id}`} />}
                  className="cursor-pointer hover:border-primary hover:text-primary"
                >
                  {meta.shortTitle}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
