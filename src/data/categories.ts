import type { CategoryMeta } from '@/types/curriculum';

export const CATEGORIES: CategoryMeta[] = [
  // Column 1
  {
    id: 'architecture',
    column: 1,
    order: 1,
    color: '#f97316',
    badgeTextColor: '#0f172a',
    title: { vi: 'Architecture', en: 'Architecture' },
    description: {
      vi: 'Chiến lược render và thực thi code giữa Browser, Origin Server, Serverless và Edge.',
      en: 'Rendering strategies and compute placement across Browser, Server, Serverless, and Edge.',
    },
    iconName: 'Layers',
  },
  {
    id: 'state-management',
    column: 1,
    order: 2,
    color: '#ef4444',
    badgeTextColor: '#ffffff',
    title: { vi: 'State management', en: 'State management' },
    description: {
      vi: 'Tổ chức trạng thái client theo luồng một chiều, lazy loading và store chuẩn hóa.',
      en: 'Organizing client state with lazy chunks, unidirectional Flux data flow, and normalized stores.',
    },
    iconName: 'Database',
  },
  {
    id: 'backend-apis',
    column: 1,
    order: 3,
    color: '#c2410c',
    badgeTextColor: '#ffffff',
    title: { vi: 'Back end APIs', en: 'Back end APIs' },
    description: {
      vi: 'Thiết kế giao tiếp API, phân trang quy mô lớn, xác thực và phân quyền an toàn.',
      en: 'API contracts, scalable pagination, authentication flows, and fine-grained authorization.',
    },
    iconName: 'Server',
  },
  {
    id: 'realtime-updates',
    column: 1,
    order: 4,
    color: '#65a30d',
    badgeTextColor: '#0f172a',
    title: { vi: 'Real-time updates', en: 'Real-time updates' },
    description: {
      vi: 'Đẩy dữ liệu tức thời qua Polling, Server-Sent Events và kết nối hai chiều WebSockets.',
      en: 'Real-time client-server delivery via polling patterns, Server-Sent Events, and WebSockets.',
    },
    iconName: 'Radio',
  },
  {
    id: 'component-apis',
    column: 1,
    order: 5,
    color: '#3b82f6',
    badgeTextColor: '#ffffff',
    title: { vi: 'Component APIs', en: 'Component APIs' },
    description: {
      vi: 'Thiết kế API UI linh hoạt: theming tokens, event handlers, render props và composition.',
      en: 'Ergonomic UI APIs using theme tokens, composed event handlers, render props, and composition.',
    },
    iconName: 'Blocks',
  },
  {
    id: 'networking',
    column: 1,
    order: 6,
    color: '#a855f7',
    badgeTextColor: '#ffffff',
    title: { vi: 'Networking techniques', en: 'Networking techniques' },
    description: {
      vi: 'Kỹ thuật tối ưu mạng thực chiến: batching, retry + jitter, race condition, cache và offline.',
      en: 'Production networking patterns: batching, backoff + jitter, race conditions, caching, and offline queues.',
    },
    iconName: 'Network',
  },

  // Column 2
  {
    id: 'performance',
    column: 2,
    order: 1,
    color: '#22c55e',
    badgeTextColor: '#0f172a',
    title: { vi: 'Performance', en: 'Performance' },
    description: {
      vi: 'Tối ưu tốc độ tải, virtual list, batch DOM, tránh memory leak và đạt chuẩn Core Web Vitals.',
      en: 'Load optimization, virtualization, DOM batching, leak prevention, and Core Web Vitals mastery.',
    },
    iconName: 'Gauge',
  },
  {
    id: 'images',
    column: 2,
    order: 2,
    color: '#c084fc',
    badgeTextColor: '#0f172a',
    title: { vi: 'Images', en: 'Images' },
    description: {
      vi: 'Phân phối ảnh tối ưu qua CDN, định dạng hiện đại, responsive srcset và adaptive loading.',
      en: 'Image delivery pipelines using CDN, WebP/SVG, responsive srcset/<picture>, and adaptive loading.',
    },
    iconName: 'Image',
  },
  {
    id: 'accessibility',
    column: 2,
    order: 3,
    color: '#ec4899',
    badgeTextColor: '#ffffff',
    title: { vi: 'Accessibility', en: 'Accessibility' },
    description: {
      vi: 'Thiết kế giao diện cho mọi người dùng: bàn phím, WAI-ARIA, thứ tự heading, focus và tương phản.',
      en: 'Inclusive UI design: keyboard navigation, WAI-ARIA, heading outlines, focus management, and contrast.',
    },
    iconName: 'Accessibility',
  },

  // Column 3
  {
    id: 'seo',
    column: 3,
    order: 1,
    color: '#06b6d4',
    badgeTextColor: '#0f172a',
    title: { vi: 'SEO', en: 'SEO' },
    description: {
      vi: 'Tối ưu công cụ tìm kiếm bằng metadata, sitemap, JSON-LD, semantic HTML và pre-rendering.',
      en: 'Search discoverability with metadata, sitemaps, JSON-LD structured data, semantic HTML, and SSR/SSG.',
    },
    iconName: 'Search',
  },
  {
    id: 'user-experience',
    column: 3,
    order: 2,
    color: '#6366f1',
    badgeTextColor: '#ffffff',
    title: { vi: 'User experience', en: 'User experience' },
    description: {
      vi: 'Xử lý đầy đủ 5 trạng thái UI, chiến lược hiển thị lỗi, chuỗi dài và trải nghiệm mobile.',
      en: 'Complete UI state machines, error recovery UX, infinite feeds, long strings, and mobile craft.',
    },
    iconName: 'Sparkles',
  },
  {
    id: 'security',
    column: 3,
    order: 3,
    color: '#f8fafc',
    badgeTextColor: '#0f172a',
    title: { vi: 'Security', en: 'Security' },
    description: {
      vi: 'Phòng thủ Front End trước XSS, CSRF, cấu hình HTTPS, CORS và Content Security Policy.',
      en: 'Front End defense-in-depth across HTTPS, XSS sanitization, CSRF protection, CORS, and CSP.',
    },
    iconName: 'ShieldCheck',
  },
  {
    id: 'i18n',
    column: 3,
    order: 4,
    color: '#db2777',
    badgeTextColor: '#ffffff',
    title: { vi: 'i18n', en: 'i18n' },
    description: {
      vi: 'Quốc tế hóa chuẩn mực: lang/hreflang, RTL CSS logical properties, Intl API và bộ gõ IME.',
      en: 'Internationalization from hreflang and RTL logical layouts to Intl formatting and IME handling.',
    },
    iconName: 'Globe',
  },
  {
    id: 'common-patterns',
    column: 3,
    order: 5,
    color: '#eab308',
    badgeTextColor: '#0f172a',
    title: { vi: 'Common patterns', en: 'Common patterns' },
    description: {
      vi: 'Các mẫu thiết kế lặp lại nhiều nhất: event sourcing, undo/redo, streaming, conflict và offline-first.',
      en: 'Recurring front end system patterns: event sourcing, undo/redo, streaming, conflict resolution, and offline-first.',
    },
    iconName: 'Workflow',
  },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryMeta['id'],
  CategoryMeta
>;
