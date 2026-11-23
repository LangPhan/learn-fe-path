import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Code2,
  FlaskConical,
  ListChecks,
  NotebookPen,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TopicSidebar } from '@/components/topic/TopicSidebar';
import { TopicTheoryView } from '@/components/topic/TopicTheoryView';
import { TopicQuizView } from '@/components/topic/TopicQuizView';
import { TopicNotesView } from '@/components/topic/TopicNotesView';
import { CodePlayground } from '@/components/playground/CodePlayground';
import { VisualizerRenderer } from '@/components/visualizers/VisualizerRegistry';
import { CATEGORY_MAP } from '@/data/categories';
import { TOPIC_INDEX } from '@/data/topicIndex';
import { loadTopic } from '@/data/loader';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';
import type { CategoryId, MasteryStatus, TopicContent } from '@/types/curriculum';

export default function TopicPage() {
  const { categoryId = 'architecture', topicId = 'ssr' } = useParams();
  const [searchParams] = useSearchParams();
  const { locale, progress, setTopicStatus, markTopicVisited, toggleBookmark } = useApp();

  const [topic, setTopic] = useState<TopicContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('learn');
  const [playgroundMode, setPlaygroundMode] = useState<'example' | 'challenge'>(
    searchParams.get('tab') === 'challenge' ? 'challenge' : 'example',
  );

  useEffect(() => {
    setLoading(true);
    setPlaygroundMode(searchParams.get('tab') === 'challenge' ? 'challenge' : 'example');
    let cancelled = false;
    void loadTopic(categoryId as CategoryId, topicId).then((loaded) => {
      if (cancelled) return;
      setTopic(loaded ?? null);
      setLoading(false);
      if (loaded) {
        markTopicVisited(loaded.id);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [categoryId, topicId, markTopicVisited, searchParams]);

  const currentIdx = TOPIC_INDEX.findIndex((item) => item.id === topicId);
  const prevTopic = currentIdx > 0 ? TOPIC_INDEX[currentIdx - 1] : null;
  const nextTopic = currentIdx >= 0 && currentIdx < TOPIC_INDEX.length - 1 ? TOPIC_INDEX[currentIdx + 1] : null;

  const category = CATEGORY_MAP[categoryId as CategoryId];
  const currentStatus: MasteryStatus = progress.topicStatus[topicId] ?? 'not_started';
  const isBookmarked = progress.bookmarks.includes(topicId);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-12 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        Loading skill studio...
      </div>
    );
  }

  if (!topic || !category) {
    return (
      <div className="mx-auto max-w-[1440px] space-y-4 px-4 py-12 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">Skill not found.</p>
        <Button render={<Link to="/" />}>Back to Cheatsheet</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1440px] gap-5 px-4 py-5 sm:px-6 lg:px-8">
      {/* Desktop collapsible sidebar */}
      {sidebarOpen && (
        <aside className="hidden w-64 shrink-0 rounded-xl border border-border bg-card p-3 lg:block lg:h-[calc(100vh-5.5rem)] lg:sticky lg:top-18">
          <div className="mb-2 flex items-center justify-between border-b border-border pb-2 text-xs font-semibold">
            <span>{t(UI_STRINGS.topic.allTopics, locale)}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse sidebar"
            >
              <PanelLeft className="size-3.5" />
            </Button>
          </div>
          <TopicSidebar
            activeCategoryId={category.id}
            activeTopicId={topic.id}
            className="h-[calc(100%-2.5rem)]"
          />
        </aside>
      )}

      {/* Main Content */}
      <div className="min-w-0 flex-1 space-y-4">
        {/* Topic Header Bar */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {!sidebarOpen && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  className="hidden lg:inline-flex"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Expand sidebar"
                >
                  <PanelLeft className="size-3.5" />
                </Button>
              )}

              {/* Mobile sidebar drawer */}
              <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetTrigger
                  render={
                    <Button type="button" variant="outline" size="xs" className="lg:hidden gap-1.5" />
                  }
                >
                  <PanelLeft className="size-3.5" />
                  <span>{t(UI_STRINGS.topic.allTopics, locale)}</span>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>{t(UI_STRINGS.topic.allTopics, locale)}</SheetTitle>
                  </SheetHeader>
                  <TopicSidebar
                    activeCategoryId={category.id}
                    activeTopicId={topic.id}
                    onNavigate={() => setMobileSidebarOpen(false)}
                    className="h-[calc(100vh-5rem)] px-3"
                  />
                </SheetContent>
              </Sheet>

              <Link
                to="/"
                className="rounded px-2 py-0.5 text-xs font-bold"
                style={{ backgroundColor: category.color, color: category.badgeTextColor }}
              >
                {t(category.title, locale)}
              </Link>

              <Badge variant="outline" className="text-[11px]">
                {t(UI_STRINGS.difficulty[topic.difficulty], locale)}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={currentStatus}
                onValueChange={(v) => {
                  if (v === 'not_started' || v === 'in_progress' || v === 'mastered') {
                    setTopicStatus(topic.id, v);
                  }
                }}
              >
                <SelectTrigger size="sm" className="w-36 text-xs">
                  <CheckCircle2
                    className={
                      currentStatus === 'mastered'
                        ? 'size-3.5 text-emerald-500'
                        : 'size-3.5 text-muted-foreground'
                    }
                  />
                  <SelectValue>{t(UI_STRINGS.topic.status[currentStatus], locale)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">{t(UI_STRINGS.topic.status.not_started, locale)}</SelectItem>
                  <SelectItem value="in_progress">{t(UI_STRINGS.topic.status.in_progress, locale)}</SelectItem>
                  <SelectItem value="mastered">{t(UI_STRINGS.topic.status.mastered, locale)}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant={isBookmarked ? 'secondary' : 'outline'}
                size="icon-sm"
                onClick={() => toggleBookmark(topic.id)}
                aria-label={isBookmarked ? t(UI_STRINGS.topic.bookmarkRemove, locale) : t(UI_STRINGS.topic.bookmarkAdd, locale)}
              >
                <Bookmark className={isBookmarked ? 'size-4 fill-amber-400 text-amber-400' : 'size-4'} />
              </Button>
            </div>
          </div>

          <h1 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
            {t(topic.title, locale)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t(topic.summary, locale)}</p>
        </div>

        {/* Split-Screen Workspace on Desktop / Unified on Mobile */}
        <div className="grid gap-5 xl:grid-cols-12">
          {/* Left Pane: Theory / Lab / Quiz / Notes (+ Mobile Live Code tab) */}
          <div className="min-w-0 xl:col-span-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
                <TabsTrigger value="learn" className="gap-1.5 text-xs">
                  <BookOpen className="size-3.5" />
                  {t(UI_STRINGS.topic.tabs.learn, locale)}
                </TabsTrigger>
                {topic.visualizerId && (
                  <TabsTrigger value="lab" className="gap-1.5 text-xs">
                    <FlaskConical className="size-3.5" />
                    {t(UI_STRINGS.topic.tabs.lab, locale)}
                  </TabsTrigger>
                )}
                <TabsTrigger value="practice" className="gap-1.5 text-xs">
                  <ListChecks className="size-3.5" />
                  {t(UI_STRINGS.topic.tabs.practice, locale)}
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-1.5 text-xs">
                  <NotebookPen className="size-3.5" />
                  {t(UI_STRINGS.topic.tabs.notes, locale)}
                </TabsTrigger>
                <TabsTrigger value="mobile-code" className="gap-1.5 text-xs xl:hidden">
                  <Code2 className="size-3.5" />
                  {t(UI_STRINGS.topic.tabs.code, locale)}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="learn" className="m-0">
                <TopicTheoryView
                  topic={topic}
                  onOpenChallenge={
                    topic.challenge
                      ? () => {
                          setPlaygroundMode('challenge');
                          if (window.innerWidth < 1280) setActiveTab('mobile-code');
                        }
                      : undefined
                  }
                />
              </TabsContent>

              {topic.visualizerId && (
                <TabsContent value="lab" className="m-0">
                  <VisualizerRenderer visualizerId={topic.visualizerId} />
                </TabsContent>
              )}

              <TabsContent value="practice" className="m-0">
                <TopicQuizView questions={topic.quiz} />
              </TabsContent>

              <TabsContent value="notes" className="m-0">
                <TopicNotesView topicId={topic.id} />
              </TabsContent>

              <TabsContent value="mobile-code" className="m-0 xl:hidden">
                <CodePlayground
                  example={topic.example}
                  challenge={topic.challenge}
                  initialMode={playgroundMode}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Pane: Persistent Live Code Playground on Desktop */}
          <div className="hidden min-w-0 xl:col-span-6 xl:block">
            <div className="sticky top-18">
              <CodePlayground
                example={topic.example}
                challenge={topic.challenge}
                initialMode={playgroundMode}
                editorHeight="300px"
                previewHeight="250px"
              />
            </div>
          </div>
        </div>

        {/* Bottom Prev / Next Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          {prevTopic ? (
            <Button
              variant="outline"
              size="sm"
              render={<Link to={`/topic/${prevTopic.categoryId}/${prevTopic.id}`} />}
              className="gap-1.5 text-xs"
            >
              <ArrowLeft className="size-3.5" />
              <span>{t(UI_STRINGS.topic.prevTopic, locale)}: {prevTopic.shortTitle}</span>
            </Button>
          ) : (
            <div />
          )}

          {nextTopic && (
            <Button
              variant="outline"
              size="sm"
              render={<Link to={`/topic/${nextTopic.categoryId}/${nextTopic.id}`} />}
              className="gap-1.5 text-xs"
            >
              <span>{t(UI_STRINGS.topic.nextTopic, locale)}: {nextTopic.shortTitle}</span>
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
