import type React from 'react';
import { RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/i18n/translations';
import { cn } from '@/lib/utils';
import type { BilingualText } from '@/types/curriculum';

export interface VisualizerFrameProps {
  title: BilingualText;
  description: BilingualText;
  badgeText?: BilingualText;
  onReset?: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function VisualizerFrame({
  title,
  description,
  badgeText = { vi: 'Mô phỏng tương tác', en: 'Interactive Lab' },
  onReset,
  actions,
  children,
  className,
}: VisualizerFrameProps) {
  const { locale } = useApp();

  return (
    <Card data-slot="visualizer-frame" className={cn('border-border/90 bg-card', className)}>
      <CardHeader className="gap-2 border-b border-border/80 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/40 font-mono text-[10px] uppercase text-primary">
                {t(badgeText, locale)}
              </Badge>
              <CardTitle className="text-base font-semibold tracking-tight">
                {t(title, locale)}
              </CardTitle>
            </div>
            <CardDescription className="text-xs leading-relaxed">
              {t(description, locale)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            {actions}
            {onReset && (
              <Button type="button" variant="outline" size="xs" onClick={onReset}>
                <RotateCcw className="size-3" />
                {locale === 'vi' ? 'Đặt lại' : 'Reset'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}
