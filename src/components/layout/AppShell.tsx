import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, Compass, HelpCircle, Layers, Menu, Moon, Search, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { TOPIC_INDEX } from '@/data/topicIndex';
import { useApp } from '@/contexts/AppContext';
import { UI_STRINGS, t } from '@/i18n/translations';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, theme, toggleTheme, progress, setCommandOpen } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const masteredCount = TOPIC_INDEX.filter((item) => progress.topicStatus[item.id] === 'mastered').length;

  const navItems = [
    { to: '/', label: t(UI_STRINGS.nav.cheatsheet, locale), icon: Compass, match: (p: string) => p === '/' || p.startsWith('/topic') },
    { to: '/challenges', label: t(UI_STRINGS.nav.challenges, locale), icon: Code2, match: (p: string) => p.startsWith('/challenges') },
    { to: '/scenarios', label: t(UI_STRINGS.nav.scenarios, locale), icon: Layers, match: (p: string) => p.startsWith('/scenarios') },
    { to: '/quiz', label: t(UI_STRINGS.nav.quiz, locale), icon: HelpCircle, match: (p: string) => p.startsWith('/quiz') },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-primary-foreground"
      >
        {locale === 'vi' ? 'Bỏ qua đến nội dung chính' : 'Skip to main content'}
      </a>

      <header
        data-slot="app-header"
        className="sticky top-0 z-40 h-14 border-b border-border bg-background/95 backdrop-blur-xs"
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <Link
              to="/"
              className="flex items-center gap-2.5 font-heading text-sm font-semibold tracking-tight text-foreground"
            >
              <span className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-card font-mono text-xs font-bold text-primary">
                FE
              </span>
              <span className="hidden sm:inline">System Design Studio</span>
            </Link>

            <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const active = item.match(location.pathname);
                const Icon = item.icon;
                return (
                  <Button
                    key={item.to}
                    variant={active ? 'secondary' : 'ghost'}
                    size="sm"
                    aria-current={active ? 'page' : undefined}
                    render={<Link to={item.to} />}
                    className={cn('gap-1.5 text-xs', active && 'font-semibold text-foreground')}
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="gap-2 text-xs text-muted-foreground"
              aria-label={t(UI_STRINGS.nav.searchShortcut, locale)}
            >
              <Search className="size-3.5" />
              <span className="hidden lg:inline">{t(UI_STRINGS.nav.searchShortcut, locale)}</span>
              <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground sm:inline">
                Ctrl+K
              </kbd>
            </Button>

            <Badge variant="outline" className="hidden font-mono text-[11px] tabular-nums sm:inline-flex">
              {masteredCount}/{TOPIC_INDEX.length}
            </Badge>

            {/* Language segmented toggle */}
            <div
              role="group"
              aria-label="Language switch"
              className="inline-flex h-8 items-center rounded-lg border border-border bg-muted/50 p-0.5"
            >
              <button
                type="button"
                onClick={() => setLocale('vi')}
                aria-pressed={locale === 'vi'}
                className={cn(
                  'rounded-md px-2 py-1 font-mono text-[11px] font-semibold transition-colors',
                  locale === 'vi' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                aria-pressed={locale === 'en'}
                className={cn(
                  'rounded-md px-2 py-1 font-mono text-[11px] font-semibold transition-colors',
                  locale === 'en' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                EN
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>

            {/* Mobile nav sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="md:hidden"
                    aria-label="Open navigation menu"
                  />
                }
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>FE System Design Studio</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1.5 px-4">
                  {navItems.map((item) => {
                    const active = item.match(location.pathname);
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.to}
                        variant={active ? 'secondary' : 'ghost'}
                        size="lg"
                        onClick={() => setMobileMenuOpen(false)}
                        render={<Link to={item.to} />}
                        className="justify-start gap-2.5"
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <CommandPalette />
    </div>
  );
}
