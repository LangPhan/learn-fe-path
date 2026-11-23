import { useNavigate } from 'react-router-dom';
import { Code2, Compass, FlaskConical, Layers } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { TOPIC_INDEX } from '@/data/topicIndex';
import { CATEGORY_MAP } from '@/data/categories';
import { SCENARIO_INDEX } from '@/data/scenarioIndex';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';

export function CommandPalette() {
  const { locale, commandOpen, setCommandOpen } = useApp();
  const navigate = useNavigate();

  const goTo = (path: string) => {
    setCommandOpen(false);
    navigate(path);
  };

  const challengeTopics = TOPIC_INDEX.filter((item) => item.hasChallenge);

  return (
    <CommandDialog
      open={commandOpen}
      onOpenChange={setCommandOpen}
      title={t(UI_STRINGS.nav.searchShortcut, locale)}
      description={t(UI_STRINGS.command.placeholder, locale)}
      className="sm:max-w-2xl"
    >
      <Command>
        <CommandInput placeholder={t(UI_STRINGS.command.placeholder, locale)} />
        <CommandList className="max-h-96">
          <CommandEmpty>{t(UI_STRINGS.command.empty, locale)}</CommandEmpty>

          <CommandGroup heading={t(UI_STRINGS.command.groups.topics, locale)}>
            {TOPIC_INDEX.map((topic) => {
              const cat = CATEGORY_MAP[topic.categoryId];
              return (
                <CommandItem
                  key={topic.id}
                  value={`${topic.shortTitle} ${topic.title.vi} ${topic.title.en} ${cat.title.en} ${topic.tags.join(' ')}`}
                  onSelect={() => goTo(`/topic/${topic.categoryId}/${topic.id}`)}
                >
                  <Compass className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="truncate font-medium">{t(topic.title, locale)}</span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {topic.visualizerId && (
                        <Badge variant="outline" className="font-mono text-[10px]">
                          Lab
                        </Badge>
                      )}
                      {topic.hasChallenge && (
                        <Badge variant="outline" className="font-mono text-[10px]">
                          Code
                        </Badge>
                      )}
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: cat.color, color: cat.badgeTextColor }}
                      >
                        {cat.title.en}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={t(UI_STRINGS.command.groups.challenges, locale)}>
            {challengeTopics.map((topic) => (
              <CommandItem
                key={`chal-${topic.id}`}
                value={`challenge ${topic.shortTitle} ${topic.title.vi} ${topic.title.en}`}
                onSelect={() => goTo(`/topic/${topic.categoryId}/${topic.id}?tab=challenge`)}
              >
                <Code2 className="size-4 shrink-0 text-primary" />
                <span className="truncate">{t(topic.title, locale)}</span>
                <Badge variant="secondary" className="ml-auto font-mono text-[10px]">
                  Unit Test
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={t(UI_STRINGS.command.groups.scenarios, locale)}>
            {SCENARIO_INDEX.map((sc) => (
              <CommandItem
                key={sc.id}
                value={`scenario ${sc.title.vi} ${sc.title.en} ${sc.tags.join(' ')}`}
                onSelect={() => goTo(`/scenarios/${sc.id}`)}
              >
                <Layers className="size-4 shrink-0 text-amber-400" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{t(sc.title, locale)}</div>
                  <div className="truncate text-xs text-muted-foreground">{t(sc.subtitle, locale)}</div>
                </div>
                <FlaskConical className="size-3.5 shrink-0 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
