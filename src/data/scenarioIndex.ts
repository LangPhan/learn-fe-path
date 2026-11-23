import type { BilingualText, ChallengeDifficulty } from '@/types/curriculum';

export interface ScenarioMeta {
  id: string;
  title: BilingualText;
  subtitle: BilingualText;
  difficulty: ChallengeDifficulty;
  tags: string[];
}

export const SCENARIO_INDEX: ScenarioMeta[] = [
  {
    id: 'news-feed',
    title: { vi: 'News Feed (Facebook / X)', en: 'News Feed (Facebook / X)' },
    subtitle: { vi: 'Cursor pagination, normalized cache, virtualization & optimistic interactions', en: 'Cursor pagination, normalized store, virtualization & optimistic interactions' },
    difficulty: 'medium',
    tags: ['feed', 'cursor', 'virtualization', 'normalized', 'optimistic'],
  },
  {
    id: 'autocomplete-search',
    title: { vi: 'Autocomplete / Typeahead Search', en: 'Autocomplete / Typeahead Search' },
    subtitle: { vi: 'Debouncing, prefix cache, race-condition guards, keyboard ARIA combobox & IME', en: 'Debouncing, prefix cache, race guards, ARIA combobox & IME composition' },
    difficulty: 'easy',
    tags: ['search', 'autocomplete', 'debounce', 'race-condition', 'ime', 'aria'],
  },
  {
    id: 'realtime-chat',
    title: { vi: 'Real-Time Chat (Slack / Messenger)', en: 'Real-Time Chat (Slack / Messenger)' },
    subtitle: { vi: 'WebSockets, heartbeat, offline outbox queue, scroll anchoring & conflict handling', en: 'WebSockets, heartbeats, offline queue, bi-directional scroll anchoring & presence' },
    difficulty: 'hard',
    tags: ['chat', 'websockets', 'offline', 'scroll-anchoring', 'ime'],
  },
  {
    id: 'collaborative-editor',
    title: { vi: 'Collaborative Rich-Text Editor (Notion / Docs)', en: 'Collaborative Editor (Notion / Google Docs)' },
    subtitle: { vi: 'CRDT / OT conflict resolution, undo/redo history stacks & event sourcing', en: 'CRDT / OT conflict resolution, command undo/redo stacks & event sourcing' },
    difficulty: 'hard',
    tags: ['collab', 'crdt', 'undo-redo', 'event-sourcing', 'offline-first'],
  },
  {
    id: 'ecommerce-storefront',
    title: { vi: 'High-Traffic E-Commerce Storefront', en: 'High-Traffic E-Commerce Storefront' },
    subtitle: { vi: 'ISR/SSR SEO, JSON-LD, Image CDN responsive srcset, Core Web Vitals & checkout idempotency', en: 'ISR/SSR SEO, JSON-LD, responsive CDN images, Core Web Vitals & idempotency' },
    difficulty: 'medium',
    tags: ['ecommerce', 'isr', 'seo', 'json-ld', 'cwv', 'images'],
  },
  {
    id: 'video-streaming',
    title: { vi: 'Adaptive Video Streaming (YouTube / Netflix)', en: 'Adaptive Video Streaming (YouTube / Netflix)' },
    subtitle: { vi: 'HLS/DASH MSE ABR ladder, buffer management, adaptive loading & keyboard theater controls', en: 'HLS/DASH MSE ABR ladder, buffer eviction, adaptive loading & accessible player' },
    difficulty: 'hard',
    tags: ['video', 'hls', 'abr', 'mse', 'streaming', 'a11y'],
  },
];
