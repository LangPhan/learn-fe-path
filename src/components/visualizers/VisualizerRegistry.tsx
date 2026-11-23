import React, { Suspense } from 'react';
import type { VisualizerId } from '@/types/curriculum';

const registry: Record<VisualizerId, React.LazyExoticComponent<React.ComponentType>> = {
  'rendering-strategy': React.lazy(() => import('@/components/visualizers/RenderingStrategyVisualizer')),
  'flux-normalized': React.lazy(() => import('@/components/visualizers/FluxNormalizedStoreVisualizer')),
  'pagination-api': React.lazy(() => import('@/components/visualizers/PaginationAndApiVisualizer')),
  'realtime-protocols': React.lazy(() => import('@/components/visualizers/RealtimeProtocolVisualizer')),
  'component-composition': React.lazy(() => import('@/components/visualizers/ComponentCompositionVisualizer')),
  'retry-backoff': React.lazy(() => import('@/components/visualizers/RetryBackoffVisualizer')),
  'race-conditions': React.lazy(() => import('@/components/visualizers/RaceConditionVisualizer')),
  'debounce-throttle': React.lazy(() => import('@/components/visualizers/DebounceThrottleVisualizer')),
  'virtual-list': React.lazy(() => import('@/components/visualizers/VirtualListVisualizer')),
  'core-web-vitals': React.lazy(() => import('@/components/visualizers/CoreWebVitalsVisualizer')),
  'responsive-images': React.lazy(() => import('@/components/visualizers/ResponsiveImageVisualizer')),
  'a11y-lab': React.lazy(() => import('@/components/visualizers/A11yLabVisualizer')),
  'seo-preview': React.lazy(() => import('@/components/visualizers/SeoPreviewVisualizer')),
  'ui-states': React.lazy(() => import('@/components/visualizers/UiStatesVisualizer')),
  'security-sandbox': React.lazy(() => import('@/components/visualizers/SecuritySandboxVisualizer')),
  'i18n-playground': React.lazy(() => import('@/components/visualizers/I18nPlaygroundVisualizer')),
  'undo-redo-events': React.lazy(() => import('@/components/visualizers/UndoRedoEventSourcingVisualizer')),
};

export const VALID_VISUALIZER_IDS = Object.keys(registry) as VisualizerId[];

export function VisualizerRenderer({ visualizerId }: { visualizerId: VisualizerId }) {
  const Component = registry[visualizerId];
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card text-xs text-muted-foreground">
          Loading interactive lab...
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}
