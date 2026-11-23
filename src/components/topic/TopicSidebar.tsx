import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronDown, ChevronRight, Circle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CATEGORIES } from '@/data/categories';
import { TOPIC_INDEX } from '@/data/topicIndex';
import { prefetchCategory } from '@/data/loader';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/i18n/translations';
import { cn } from '@/lib/utils';

export interface TopicSidebarProps {
  activeCategoryId: string;
  activeTopicId: string;
  onNavigate?: () => void;
  className?: string;
}

export function TopicSidebar({
  activeCategoryId,
  activeTopicId,
  onNavigate,
  className,
}: TopicSidebarProps) {
  const { locale, progress } = useApp();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    [activeCategoryId]: true,
  });

  useEffect(() => {
    setOpenCategories((prev) => (prev[activeCategoryId] ? prev : { ...prev, [activeCategoryId]: true }));
  }, [activeCategoryId]);

  const toggleCat = (id: string) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !(prev[id] ?? id === activeCategoryId) }));
  };

  return (
    <ScrollArea data-slot="topic-sidebar" className={cn('min-h-0 pr-2', className)}>
      <div className="space-y-1.5 py-2">
        {CATEGORIES.map((cat) => {
          const topics = TOPIC_INDEX.filter((item) => item.categoryId === cat.id);
          const mastered = topics.filter((item) => progress.topicStatus[item.id] === 'mastered').length;
          const isOpen = openCategories[cat.id] ?? cat.id === activeCategoryId;

          return (
            <Collapsible key={cat.id} open={isOpen} onOpenChange={() => toggleCat(cat.id)}>
              <CollapsibleTrigger
                onMouseEnter={() => prefetchCategory(cat.id)}
                onFocus={() => prefetchCategory(cat.id)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold hover:bg-muted/60"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{t(cat.title, locale)}</span>
                </span>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">
                  {mastered}/{topics.length}
                </span>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <ul className="mt-1 space-y-0.5 pl-4">
                  {topics.map((topic) => {
                    const isActive = topic.id === activeTopicId;
                    const status = progress.topicStatus[topic.id] ?? 'not_started';
                    return (
                      <li key={topic.id}>
                        <Link
                          to={`/topic/${cat.id}/${topic.id}`}
                          onMouseEnter={() => prefetchCategory(cat.id)}
                          onFocus={() => prefetchCategory(cat.id)}
                          onClick={onNavigate}
                          className={cn(
                            'flex items-start gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                            isActive
                              ? 'bg-primary/15 font-semibold text-primary'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                          )}
                        >
                          {status === 'mastered' ? (
                            <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-500" />
                          ) : status === 'in_progress' ? (
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                          ) : (
                            <Circle className="mt-0.5 size-3 shrink-0 opacity-40" />
                          )}
                          <span className="line-clamp-2 leading-snug">{topic.shortTitle}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </ScrollArea>
  );
}
