import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { AppShell } from '@/components/layout/AppShell';

const HomePage = lazy(() => import('@/pages/HomePage'));
const TopicPage = lazy(() => import('@/pages/TopicPage'));
const ChallengesPage = lazy(() => import('@/pages/ChallengesPage'));
const ScenariosPage = lazy(() => import('@/pages/ScenariosPage'));
const QuizArenaPage = lazy(() => import('@/pages/QuizArenaPage'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
      Loading studio module...
    </div>
  );
}

function AppRoutes() {
  const { theme } = useApp();

  return (
    <>
      <AppShell>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/topic/:categoryId/:topicId" element={<TopicPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/challenges/:challengeId" element={<ChallengesPage />} />
            <Route path="/scenarios" element={<ScenariosPage />} />
            <Route path="/scenarios/:scenarioId" element={<ScenariosPage />} />
            <Route path="/quiz" element={<QuizArenaPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
      <Toaster theme={theme} position="bottom-right" />
    </>
  );
}

export function App() {
  return (
    <AppProvider>
      <TooltipProvider delay={200}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  );
}

export default App;
