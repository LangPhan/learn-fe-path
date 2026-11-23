import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Locale, MasteryStatus, QuizAttempt, Theme, UserProgress } from '@/types/curriculum';

const STORAGE_KEYS = {
  locale: 'fe-sd-locale-v1',
  theme: 'fe-sd-theme-v1',
  progress: 'fe-sd-progress-v1',
} as const;

const DEFAULT_PROGRESS: UserProgress = {
  topicStatus: {},
  solvedChallenges: [],
  quizAnswers: {},
  bookmarks: [],
  notes: {},
  lastVisitedTopicId: undefined,
  updatedAt: Date.now(),
};

function safeReadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizeProgress(raw: unknown): UserProgress {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PROGRESS, updatedAt: Date.now() };
  const obj = raw as Partial<UserProgress>;
  return {
    topicStatus: obj.topicStatus && typeof obj.topicStatus === 'object' ? obj.topicStatus : {},
    solvedChallenges: Array.isArray(obj.solvedChallenges) ? obj.solvedChallenges.filter((x) => typeof x === 'string') : [],
    quizAnswers: obj.quizAnswers && typeof obj.quizAnswers === 'object' ? obj.quizAnswers : {},
    bookmarks: Array.isArray(obj.bookmarks) ? obj.bookmarks.filter((x) => typeof x === 'string') : [],
    notes: obj.notes && typeof obj.notes === 'object' ? obj.notes : {},
    lastVisitedTopicId: typeof obj.lastVisitedTopicId === 'string' ? obj.lastVisitedTopicId : undefined,
    updatedAt: typeof obj.updatedAt === 'number' ? obj.updatedAt : Date.now(),
  };
}

interface AppContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  progress: UserProgress;
  setTopicStatus: (topicId: string, status: MasteryStatus) => void;
  markTopicVisited: (topicId: string) => void;
  markChallengeSolved: (challengeId: string) => void;
  recordQuizAnswer: (questionId: string, attempt: QuizAttempt) => void;
  toggleBookmark: (topicId: string) => void;
  setTopicNote: (topicId: string, note: string) => void;
  exportProgressJson: () => string;
  importProgressJson: (jsonText: string) => boolean;
  resetProgress: () => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEYS.locale) : null;
    return stored === 'en' ? 'en' : 'vi';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEYS.theme) : null;
    return stored === 'light' ? 'light' : 'dark';
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    if (typeof window === 'undefined') return DEFAULT_PROGRESS;
    return normalizeProgress(safeReadStorage(STORAGE_KEYS.progress, DEFAULT_PROGRESS));
  });

  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(STORAGE_KEYS.locale, locale);
    } catch {
      // ignore storage quota errors
    }
  }, [locale]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch {
      // ignore storage quota errors
    }
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
    } catch {
      // ignore storage quota errors
    }
  }, [progress]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);
  const toggleLocale = useCallback(() => setLocaleState((prev) => (prev === 'vi' ? 'en' : 'vi')), []);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = useCallback(() => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')), []);

  const setTopicStatus = useCallback((topicId: string, status: MasteryStatus) => {
    setProgress((prev) => ({
      ...prev,
      topicStatus: { ...prev.topicStatus, [topicId]: status },
      updatedAt: Date.now(),
    }));
  }, []);

  const markTopicVisited = useCallback((topicId: string) => {
    setProgress((prev) => {
      const current = prev.topicStatus[topicId];
      const nextStatus = !current || current === 'not_started' ? 'in_progress' : current;
      if (prev.lastVisitedTopicId === topicId && prev.topicStatus[topicId] === nextStatus) {
        return prev;
      }
      return {
        ...prev,
        lastVisitedTopicId: topicId,
        topicStatus: { ...prev.topicStatus, [topicId]: nextStatus },
        updatedAt: Date.now(),
      };
    });
  }, []);

  const markChallengeSolved = useCallback((challengeId: string) => {
    setProgress((prev) => {
      if (prev.solvedChallenges.includes(challengeId)) return prev;
      return {
        ...prev,
        solvedChallenges: [...prev.solvedChallenges, challengeId],
        updatedAt: Date.now(),
      };
    });
  }, []);

  const recordQuizAnswer = useCallback((questionId: string, attempt: QuizAttempt) => {
    setProgress((prev) => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, [questionId]: attempt },
      updatedAt: Date.now(),
    }));
  }, []);

  const toggleBookmark = useCallback((topicId: string) => {
    setProgress((prev) => {
      const exists = prev.bookmarks.includes(topicId);
      return {
        ...prev,
        bookmarks: exists ? prev.bookmarks.filter((id) => id !== topicId) : [...prev.bookmarks, topicId],
        updatedAt: Date.now(),
      };
    });
  }, []);

  const setTopicNote = useCallback((topicId: string, note: string) => {
    setProgress((prev) => ({
      ...prev,
      notes: { ...prev.notes, [topicId]: note },
      updatedAt: Date.now(),
    }));
  }, []);

  const exportProgressJson = useCallback(() => {
    return JSON.stringify(progress, null, 2);
  }, [progress]);

  const importProgressJson = useCallback((jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      const normalized = normalizeProgress(parsed);
      setProgress(normalized);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ ...DEFAULT_PROGRESS, updatedAt: Date.now() });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      theme,
      setTheme,
      toggleTheme,
      progress,
      setTopicStatus,
      markTopicVisited,
      markChallengeSolved,
      recordQuizAnswer,
      toggleBookmark,
      setTopicNote,
      exportProgressJson,
      importProgressJson,
      resetProgress,
      commandOpen,
      setCommandOpen,
    }),
    [
      locale,
      setLocale,
      toggleLocale,
      theme,
      setTheme,
      toggleTheme,
      progress,
      setTopicStatus,
      markTopicVisited,
      markChallengeSolved,
      recordQuizAnswer,
      toggleBookmark,
      setTopicNote,
      exportProgressJson,
      importProgressJson,
      resetProgress,
      commandOpen,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
