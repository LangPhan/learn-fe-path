import { Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';

export function TopicNotesView({ topicId }: { topicId: string }) {
  const { locale, progress, setTopicNote } = useApp();
  const value = progress.notes[topicId] ?? '';

  return (
    <div data-slot="topic-notes" className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t(UI_STRINGS.topic.tabs.notes, locale)}</span>
        <span className="inline-flex items-center gap-1 text-emerald-400">
          <Check className="size-3.5" />
          {t(UI_STRINGS.topic.notesSaved, locale)}
        </span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => setTopicNote(topicId, e.target.value)}
        placeholder={t(UI_STRINGS.topic.notesPlaceholder, locale)}
        rows={10}
        className="resize-y font-sans text-sm leading-relaxed"
      />
    </div>
  );
}
