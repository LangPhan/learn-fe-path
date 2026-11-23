import { useEffect, useRef, useState } from 'react';
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
import { TOPIC_INDEX, TOPIC_META_MAP } from '@/data/topicIndex';
import { getCachedTopic, loadTopic, prefetchCategory } from '@/data/loader';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';
import { cn } from '@/lib/utils';
import type { CategoryId, MasteryStatus, TopicContent } from '@/types/curriculum';

export default function TopicPage() {
  const { categoryId = 'architecture', topicId = 'ssr' } = useParams();
  const [searchParams] = useSearchParams();
  const { locale, progress, setTopicStatus, markTopicVisited, toggleBookmark } = useApp();

  const meta = TOPIC_META_MAP[topicId];
  const category = CATEGORY_MAP[categoryId as CategoryId];
  const isValidRoute = Boolean(meta && category && meta.categoryId === categoryId);

  const cachedTopic = isValidRoute ? getCachedTopic(categoryId as CategoryId, topicId) : undefined;
  const [loadedTopic, setLoadedTopic] = useState<TopicContent | null>(cachedTopic ?? null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('learn');

  const requestedPlaygroundMode: 'example' | 'challenge' =
    searchParams.get('tab') === 'challenge' ? 'challenge' : 'example';
  const modeNavKey = `${topicId}:${searchParams.get('tab') ?? ''}`;
  const [prevModeNavKey, setPrevModeNavKey] = useState(modeNavKey);
  const [playgroundMode, setPlaygroundMode] = useState<'example' | 'challenge'>(requestedPlaygroundMode);

  if (prevModeNavKey !== modeNavKey) {
    setPrevModeNavKey(modeNavKey);
    setPlaygroundMode(requestedPlaygroundMode);
  }

  const topic = cachedTopic ?? (loadedTopic?.id === topicId ? loadedTopic : null);
  const displayTopic = topic ?? loadedTopic;
  const isTransitioning = Boolean(isValidRoute && !topic && displayTopic);

  useEffect(() => {
    if (!isValidRoute) return;

    if (cachedTopic) {
      setLoadedTopic(cachedTopic);
      markTopicVisited(cachedTopic.id);
      return;
    }

    let cancelled = false;
    void loadTopic(categoryId as CategoryId, topicId).then((loaded) => {
      if (cancelled) return;
      if (loaded) {
        setLoadedTopic(loaded);
        markTopicVisited(loaded.id);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [categoryId, topicId, isValidRoute, cachedTopic, markTopicVisited]);

  const currentIdx = TOPIC_INDEX.findIndex((item) => item.id === topicId);
  const prevTopic = currentIdx > 0 ? TOPIC_INDEX[currentIdx - 1] : null;
  const nextTopic = currentIdx >= 0 && currentIdx < TOPIC_INDEX.length - 1 ? TOPIC_INDEX[currentIdx + 1] : null;

  useEffect(() => {
    if (prevTopic && prevTopic.categoryId !== categoryId) {
      prefetchCategory(prevTopic.categoryId);
    }
    if (nextTopic && nextTopic.categoryId !== categoryId) {
      prefetchCategory(nextTopic.categoryId);
    }
  }, [categoryId, prevTopic, nextTopic]);

  const prevTopicIdRef = useRef(topicId);
  useEffect(() => {
    if (prevTopicIdRef.current !== topicId) {
      prevTopicIdRef.current = topicId;
      window.scrollTo(0, 0);
    }
  }, [topicId]);

  if (!isValidRoute || !meta || !category) {
    return (
      <div className="mx-auto max-w-[1440px] space-y-4 px-4 py-12 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">Skill not found.</p>
        <Button render={<Link to="/" />}>Back to Cheatsheet</Button>
      </div>
    );
  }

  const currentStatus: MasteryStatus = progress.topicStatus[topicId] ?? 'not_started';
  const isBookmarked = progress.bookmarks.includes(topicId);
  const hasVisualizer = Boolean(meta.visualizerId);
  const resolvedTab = activeTab === 'lab' && !hasVisualizer ? 'learn' : activeTab;

  const prevNextNav = (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
      {prevTopic ? (
        <Button
          variant="outline"
          size="sm"
          render={<Link to={`/topic/${prevTopic.categoryId}/${prevTopic.id}`} />}
          onMouseEnter={() => prefetchCategory(prevTopic.categoryId)}
          onFocus={() => prefetchCategory(prevTopic.categoryId)}
          className="h-auto max-w-full gap-1.5 py-1.5 whitespace-normal text-left text-xs"
        >
          <ArrowLeft className="size-3.5 shrink-0" />
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
          onMouseEnter={() => prefetchCategory(nextTopic.categoryId)}
          onFocus={() => prefetchCategory(nextTopic.categoryId)}
          className="h-auto max-w-full gap-1.5 py-1.5 whitespace-normal text-left text-xs"
        >
          <span>{t(UI_STRINGS.topic.nextTopic, locale)}: {nextTopic.shortTitle}</span>
          <ArrowRight className="size-3.5 shrink-0" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto flex max-w-[1440px] gap-5 px-4 py-4 sm:px-6 lg:px-8">
      {/* Desktop collapsible sidebar */}
      {sidebarOpen && (
        <aside className="hidden w-64 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-3 lg:sticky lg:top-[4.5rem] lg:flex lg:h-[calc(100dvh-5.5rem)] lg:self-start">
          <div className="mb-2 flex shrink-0 items-center justify-between border-b border-border pb-2 text-xs font-semibold">
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
            activeTopicId={meta.id}
            className="min-h-0 flex-1"
          />
        </aside>
      )}

      {/* Main Content */}
      <div className="min-w-0 flex-1 space-y-4">
        {/* Topic Header Bar — updates synchronously from TOPIC_META_MAP */}
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
                    activeTopicId={meta.id}
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
                {t(UI_STRINGS.difficulty[meta.difficulty], locale)}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={currentStatus}
                onValueChange={(v) => {
                  if (v === 'not_started' || v === 'in_progress' || v === 'mastered') {
                    setTopicStatus(meta.id, v);
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
                onClick={() => toggleBookmark(meta.id)}
                aria-label={isBookmarked ? t(UI_STRINGS.topic.bookmarkRemove, locale) : t(UI_STRINGS.topic.bookmarkAdd, locale)}
              >
                <Bookmark className={isBookmarked ? 'size-4 fill-amber-400 text-amber-400' : 'size-4'} />
              </Button>
            </div>
          </div>

          <h1 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
            {t(meta.title, locale)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t(meta.summary, locale)}</p>
        </div>

        {/* Split-Screen Workspace on Desktop / Unified on Mobile */}
        {!displayTopic ? (
          <div className="grid gap-5 xl:grid-cols-12" aria-busy="true" aria-label="Loading skill details">
            <div className="min-w-0 space-y-5 xl:col-span-6">
              <div className="space-y-4">
                <div className="h-9 w-full rounded-lg bg-muted/60" />
                <div className="h-28 rounded-lg border border-border bg-card/70" />
                <div className="h-64 rounded-lg border border-border bg-card/70" />
                <div className="h-44 rounded-lg border border-border bg-card/70" />
              </div>
              {prevNextNav}
            </div>
            <div className="hidden min-w-0 xl:col-span-6 xl:block">
              <div className="sticky top-[4.5rem] h-[640px] max-h-[calc(100dvh-5.5rem)] rounded-lg border border-border bg-card/70" />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-5 transition-opacity duration-150 xl:grid-cols-12',
              isTransitioning ? 'opacity-60' : 'opacity-100',
            )}
          >
            {/* Left Pane: Theory / Lab / Quiz / Notes (+ Mobile Live Code tab) */}
            <div className="min-w-0 space-y-5 xl:col-span-6">
              <Tabs value={resolvedTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
                  <TabsTrigger value="learn" className="gap-1.5 text-xs">
                    <BookOpen className="size-3.5" />
                    {t(UI_STRINGS.topic.tabs.learn, locale)}
                  </TabsTrigger>
                  {hasVisualizer && (
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
                    topic={displayTopic}
                    onOpenChallenge={
                      displayTopic.challenge
                        ? () => {
                            setPlaygroundMode('challenge');
                            if (window.innerWidth < 1280) setActiveTab('mobile-code');
                          }
                        : undefined
                    }
                  />
                </TabsContent>

                {displayTopic.visualizerId && (
                  <TabsContent value="lab" className="m-0">
                    <VisualizerRenderer visualizerId={displayTopic.visualizerId} />
                  </TabsContent>
                )}

                <TabsContent value="practice" className="m-0">
                  <TopicQuizView key={displayTopic.id} questions={displayTopic.quiz} />
                </TabsContent>

                <TabsContent value="notes" className="m-0">
                  <TopicNotesView topicId={displayTopic.id} />
                </TabsContent>

                <TabsContent value="mobile-code" className="m-0 xl:hidden">
                  <CodePlayground
                    topicId={displayTopic.id}
                    example={displayTopic.example}
                    challenge={displayTopic.challenge}
                    initialMode={playgroundMode}
                  />
                </TabsContent>
              </Tabs>

              {prevNextNav}
            </div>

            {/* Right Pane: Persistent Live Code Playground on Desktop */}
            <div className="hidden min-w-0 xl:col-span-6 xl:block">
              <div className="sticky top-[4.5rem] max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain rounded-lg">
                <CodePlayground
                  topicId={displayTopic.id}
                  example={displayTopic.example}
                  challenge={displayTopic.challenge}
                  initialMode={playgroundMode}
                  editorHeight="260px"
                  previewHeight="230px"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
