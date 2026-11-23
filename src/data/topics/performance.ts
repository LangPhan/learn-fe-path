import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const performanceTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['code-splitting'],
    mentalModel: {
      vi: 'Đừng bắt người dùng vừa bước vào cửa hàng phải vác cả kho hàng 3MB JS trên vai! Chỉ giao đúng mã JS của trang hiện tại (Route-based), chỉ tải Modal/Biểu đồ khi bấm mở (Interaction-based), hoặc tải bình luận khi cuộn gần tới (Visibility-based).',
      en: 'Ship only the JS needed for the initial view: split chunks along Route boundaries, load heavy modals/charts on Interaction, and hydrate below-the-fold widgets on Viewport Visibility.',
    },
    keyPoints: [
      { vi: 'Route-based splitting (`React.lazy(() => import("./Settings"))` + `<Suspense>`): giảm kích thước initial bundle đáng kể.', en: 'Route-based splitting keeps landing/entry bundles tiny by loading secondary pages lazily.' },
      { vi: 'Interaction-based splitting: chỉ `import("chart-lib")` khi user bấm nút mở biểu đồ hoặc trình soạn thảo.', en: 'Interaction-based splitting defers heavy editors, PDF exporters, or chart libs until click/hover.' },
      { vi: 'Visibility-based splitting (`IntersectionObserver`): trì hoãn load & hydrate widget nặng ở cuối trang.', en: 'Visibility-based splitting defers below-the-fold widgets via IntersectionObserver.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi SPA nhiều màn hình hoặc tính năng có thư viện nặng (>30KB gzipped) không xuất hiện trong màn hình đầu tiên.', en: 'Multi-route SPAs and pages containing heavy off-screen widgets (charts, rich editors, maps).' },
      ],
      whenToAvoid: [
        { vi: 'Tách quá vụn hàng trăm chunk siêu nhỏ <2KB làm tăng số HTTP handshake và gây nháy spinner liên tục.', en: 'Over-splitting tiny <2KB components into dozens of micro-chunks that introduce loading flashes.' },
      ],
    },
    pitfalls: [
      { vi: 'Đặt static `import HeavyChart` ở đầu file rồi mới `lazy()` làm bundler gom chung vào main chunk!', en: 'Leaving a static top-level import alongside a dynamic import pulls the module right back into the main bundle.' },
    ],
    interviewTips: [
      { vi: 'Luôn phân loại đủ cả 3 chiến lược theo đúng Cheatsheet: Route-based, Interaction-based, và Visibility-based, kết hợp intent-prefetching khi hover!', en: 'Structure your answer around all 3 tiers: Route-based, Interaction-based, and Visibility-based splitting, enhanced with hover prefetching.' },
    ],
    example: {
      title: { vi: 'Mô phỏng 3 Chiến lược Code Splitting (Route / Interaction / Visibility)', en: '3-Tier Code Splitting Interactive Simulator' },
      description: { vi: 'Theo dõi JS chunk được nạp theo nhu cầu khi đổi Route hoặc bấm mở Heavy Modal thay vì tải 100% lúc boot.', en: 'Watch on-demand dynamic chunk loading across Route, Interaction, and Visibility triggers.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

const CHUNK_SIZES = { core: 42, settingsRoute: 68, chartModal: 145, commentsSection: 54 };

export default function App() {
  const [loaded, setLoaded] = useState<Array<keyof typeof CHUNK_SIZES>>(['core']);
  const [loading, setLoading] = useState<string | null>(null);

  const loadChunk = (name: keyof typeof CHUNK_SIZES) => {
    if (loaded.includes(name)) return;
    setLoading(name);
    setTimeout(() => {
      setLoaded((prev) => [...prev, name]);
      setLoading(null);
    }, 350);
  };

  const totalKB = loaded.reduce((sum, key) => sum + CHUNK_SIZES[key], 0);
  const fullMonolithKB = Object.values(CHUNK_SIZES).reduce((a, b) => a + b, 0);

  return (
    <div className="col">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>Loaded JS: {totalKB} KB / {fullMonolithKB} KB</strong>
        <span className="badge">{Math.round((1 - totalKB / fullMonolithKB) * 100)}% saved on boot</span>
      </div>
      <div className="row">
        <button onClick={() => loadChunk('settingsRoute')}>Route: Open /settings (+68KB)</button>
        <button onClick={() => loadChunk('chartModal')}>Interaction: Export Chart (+145KB)</button>
        <button onClick={() => loadChunk('commentsSection')}>Visibility: Scroll to Comments (+54KB)</button>
      </div>
      <div className="card">
        <div>Active chunks: {loaded.join(', ')}</div>
        {loading && <div className="muted" style={{ marginTop: 6 }}>Fetching async chunk: {loading}...</div>}
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử bấm lần lượt 3 nút để thấy tổng KB chỉ tăng đúng khi người dùng thực sự cần tính năng đó.', en: 'Trigger each splitting boundary to watch total downloaded JS stay minimal at initial load.' },
    },
    quiz: [
      {
        id: 'q-split-1',
        topicId: 'code-splitting',
        categoryId: 'performance',
        question: { vi: 'Khi một tính năng như "Trình chỉnh sửa PDF 200KB" chỉ được 5% user bấm vào trên trang chi tiết, chiến lược split nào hợp lý nhất?', en: 'Which code-splitting trigger best fits a 200KB PDF editor dialog clicked by only 5% of visitors?' },
        options: [
          { vi: 'Interaction-based splitting (`import(...)` khi user bấm nút hoặc hover mở dialog).', en: 'Interaction-based splitting (dynamically import on click or hover intent).' },
          { vi: 'Gom thẳng vào `main.js` tải lúc boot.', en: 'Keep it inside the initial `main.js` bundle.' },
          { vi: 'Chuyển sang CSS inline.', en: 'Convert it to inline CSS.' },
          { vi: 'Tải bằng `<img>`.', en: 'Load it via `<img>`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '95% người dùng không bao giờ mở dialog này sẽ tiết kiệm hoàn toàn 200KB tải và parse JS.',
          en: 'Interaction-based splitting spares 95% of visitors from downloading or parsing unused editor code.',
        },
      },
      {
        id: 'q-split-2',
        topicId: 'code-splitting',
        categoryId: 'performance',
        question: { vi: 'Kỹ thuật nào giúp loại bỏ độ trễ chờ tải chunk khi dùng Interaction/Route splitting?', en: 'How can you eliminate the perceived loading pause after clicking a code-split route or modal?' },
        options: [
          { vi: 'Prefetch chunk động ngay khi người dùng hover chuột hoặc focus vào nút/link mở tính năng đó.', en: 'Prefetch the dynamic import chunk on pointer hover or keyboard focus intent.' },
          { vi: 'Tắt hoàn toàn code splitting.', en: 'Turn off code splitting.' },
          { vi: 'Tăng kích thước hình ảnh lên 4K.', en: 'Use 4K images.' },
          { vi: 'Dùng `localStorage.clear()`.', en: 'Call `localStorage.clear()`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Người dùng mất ~150–300ms từ lúc hover đến khi nhả click — đủ thời gian prefetch xong chunk trước khi render!',
          en: 'Hover-to-click takes ~200ms, giving the browser time to prefetch the chunk before navigation fires.',
        },
      },
    ],
    relatedTopicIds: ['tree-shaking', 'preloading-prefetching', 'state-lazy-loading'],
  },

  {
    ...TOPIC_META_MAP['tree-shaking'],
    mentalModel: {
      vi: 'Hãy tưởng tượng rung mạnh cây cối để lá úa rơi xuống: bundler phân tích đồ thị `import/export` tĩnh của ES Modules để chặt bỏ toàn bộ hàm/biến chưa bao giờ được gọi trước khi đóng gói bundle cuối cùng.',
      en: 'Static ES Module dependency analysis lets bundlers shake out unreferenced exports as dead code before shipping the production bundle.',
    },
    keyPoints: [
      { vi: 'Chỉ hoạt động tin cậy với cú pháp ES Modules (`import` / `export`) tĩnh, không hiệu quả với `require()` động kiểu CommonJS.', en: 'Requires static ES Module `import`/`export` syntax; dynamic CommonJS `require()` defeats static pruning.' },
      { vi: 'Đánh dấu `"sideEffects": false` (hoặc mảng CSS exceptions) trong `package.json` giúp bundler tự tin xóa file không dùng export.', en: 'Setting `"sideEffects": false` (except CSS imports) in `package.json` lets bundlers prune untouched modules safely.' },
      { vi: 'Tránh barrel files (`index.ts` re-export 50 component) hoặc import namespace kiểu `import _ from "lodash"` (hãy dùng `lodash-es` hoặc named import).', en: 'Beware deep barrel files or CommonJS monolithic imports; prefer targeted ESM imports (`lodash-es`).' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi thư viện utility, icon pack (`lucide-react`), component library và app bundle production.', en: 'Every utility package, icon pack, UI library, and production app build.' },
      ],
      whenToAvoid: [
        { vi: 'File chứa side-effect bắt buộc ở top-level (polyfils, global CSS) cần liệt kê rõ trong `"sideEffects": ["*.css"]` để không bị cắt mất!', en: 'Global CSS or polyfills must be listed in `"sideEffects"` so bundlers never strip them.' },
      ],
    },
    pitfalls: [
      { vi: 'Cài thư viện xuất bản dưới dạng CommonJS thuần khiến cả 800KB lọt vào bundle dù chỉ gọi 1 hàm nhỏ.', en: 'Importing a CommonJS-only package pulls the entire library into the bundle even for one function.' },
    ],
    interviewTips: [
      { vi: 'Nêu rõ điều kiện đủ để Tree Shaking hoạt động tối đa: ESM static imports + `"sideEffects": false` + tránh top-level impure function calls + tránh barrel re-exports khổng lồ.', en: 'Cite the three pillars of effective tree shaking: static ESM, `sideEffects: false`, and avoiding impure top-level evaluation.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Bộ phân tích Dead-Code / Tree-Shaker (Static Reachability)', en: 'Static Reachability Tree-Shaking Simulator' },
      description: { vi: 'Xem bundler tìm kiếm từ entry point `main` theo đồ thị export để giữ lại module sống và loại bỏ lá chết.', en: 'Trace static ESM reachability from entry imports to see used symbols retained and unused exports pruned.' },
      mode: 'ts',
      code: `interface ModuleExport { sizeKB: number; deps: string[]; pure: boolean }

const moduleGraph: Record<string, ModuleExport> = {
  'app:entry': { sizeKB: 4, deps: ['ui:Button', 'utils:formatCurrency'], pure: true },
  'ui:Button': { sizeKB: 8, deps: ['utils:cn'], pure: true },
  'ui:HeavyDataGrid': { sizeKB: 120, deps: ['utils:csvExport'], pure: true },
  'utils:cn': { sizeKB: 2, deps: [], pure: true },
  'utils:formatCurrency': { sizeKB: 3, deps: [], pure: true },
  'utils:csvExport': { sizeKB: 25, deps: [], pure: true },
  'polyfill:cssReset': { sizeKB: 2, deps: [], pure: false }, // sideEffects!
};

function shakeTree(roots: string[]) {
  const kept = new Set<string>();
  const visit = (id: string) => {
    if (kept.has(id)) return;
    kept.add(id);
    for (const dep of moduleGraph[id]?.deps ?? []) visit(dep);
  };
  roots.forEach(visit);
  // Keep impure side-effect modules
  for (const [id, meta] of Object.entries(moduleGraph)) {
    if (!meta.pure) kept.add(id);
  }
  const dropped = Object.keys(moduleGraph).filter((id) => !kept.has(id));
  const finalKB = [...kept].reduce((s, id) => s + moduleGraph[id].sizeKB, 0);
  return { kept: [...kept], dropped, finalKB };
}

console.log('Tree shaking output:', shakeTree(['app:entry']));`,
      tryItPrompt: { vi: 'Thử thêm `ui:HeavyDataGrid` vào mảng `deps` của `app:entry` để xem bundle tăng vọt từ 19KB lên 164KB.', en: 'Add `ui:HeavyDataGrid` to `app:entry` deps to watch the bundle jump from 19KB to 164KB.' },
    },
    quiz: [
      {
        id: 'q-tree-1',
        topicId: 'tree-shaking',
        categoryId: 'performance',
        question: { vi: 'Vì sao bundler thường KHÔNG thể tree-shake hiệu quả một thư viện viết bằng `module.exports = ...` (CommonJS)?', en: 'Why do bundlers fail to tree-shake CommonJS (`module.exports` / `require`) packages effectively?' },
        options: [
          { vi: 'CommonJS cho phép xuất/nhập động lúc runtime nên bundler không phân tích tĩnh chính xác nhánh nào không bao giờ chạy.', en: 'CommonJS bindings are dynamic at runtime, preventing reliable static dead-code reachability analysis.' },
          { vi: 'CommonJS chỉ chạy trên Safari.', en: 'CommonJS runs only on Safari.' },
          { vi: 'CommonJS mã hóa mã nguồn bằng AES.', en: 'CommonJS encrypts source code.' },
          { vi: 'CommonJS không hỗ trợ số thập phân.', en: 'CommonJS lacks decimals.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'ES Modules có cấu trúc import/export tĩnh ở top-level nên bundler biết chính xác symbol nào được tham chiếu trước khi chạy code.',
          en: 'ESM static top-level syntax guarantees deterministic dependency graphs at compile time.',
        },
      },
      {
        id: 'q-tree-2',
        topicId: 'tree-shaking',
        categoryId: 'performance',
        question: { vi: 'Nếu package của bạn có `"sideEffects": false` nhưng chứa dòng `import "./styles.css"` trong code, rủi ro gì xảy ra nếu không liệt kê exception?', en: 'What risk occurs if `"sideEffects": false` is declared while importing `"./styles.css"` without listing CSS exceptions?' },
        options: [
          { vi: 'Bundler có thể cắt bỏ luôn file CSS đó vì nghĩ import không gán biến là dead code không side-effect.', en: 'The bundler may strip the CSS import as dead code since no JS binding is referenced from it.' },
          { vi: 'File CSS tự chuyển thành TypeScript.', en: 'CSS converts to TypeScript.' },
          { vi: 'Tăng dung lượng ảnh JPEG.', en: 'JPEGs grow larger.' },
          { vi: 'Không có ảnh hưởng gì.', en: 'No effect at all.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Import không gán tên như `import "./theme.css"` mang side-effect toàn cục nên cần cấu hình `"sideEffects": ["*.css"]`.',
          en: 'Side-effect-only imports such as global CSS require explicit `"sideEffects": ["*.css"]` exemptions.',
        },
      },
    ],
    relatedTopicIds: ['code-splitting', 'compression', 'loading-sequences'],
  },

  {
    ...TOPIC_META_MAP['preloading-prefetching'],
    mentalModel: {
      vi: 'Preload = "Tải ngay lập tức ở mức ưu tiên cao cho TRANG HIỆN TẠI" (font tiêu đề, ảnh LCP, CSS quan trọng). Prefetch = "Rảnh rỗi ở mức ưu tiên thấp hãy tải ngầm sẵn cho TRANG TIẾP THEO" (chunk route kế, dữ liệu hover).',
      en: 'Preload fetches critical resources needed for the CURRENT navigation at high priority; Prefetch speculatively fetches assets and data likely needed for the NEXT navigation at idle priority.',
    },
    keyPoints: [
      { vi: '`<link rel="preload" as="image|font|script">`: giải cứu các tài nguyên ẩn sâu trong CSS/JS khỏi bị phát hiện muộn.', en: '`<link rel="preload" as="...">` discovers late-discovered fonts, hero images, or critical chunks immediately.' },
      { vi: '`<link rel="prefetch">`: tải khi trình duyệt rảnh (`idle`) ở độ ưu tiên Lowest, không cản trở render trang hiện tại.', en: '`<link rel="prefetch">` hints next-route resources at Lowest network priority without hurting current LCP.' },
      { vi: 'Intent-based Data & Chunk Prefetching: gọi `queryClient.prefetchQuery` + `import(...)` khi người dùng hover/focus link.', en: 'Intent prefetching warms both code chunks and query caches on link hover or viewport entry.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Preload cho ảnh LCP hero, font chữ đầu trang; Prefetch cho các bước chuyển trang xác suất cao (Next step wizard, hover item).', en: 'Preload for current-page LCP/fonts; Prefetch for high-confidence next routes and hover previews.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng prefetch tràn lan toàn bộ 20 link trên trang chủ khi người dùng đang bật `Save-Data` hoặc mạng 2G!', en: 'Never shotgun-prefetch 20 links aggressively—respect `navigator.connection.saveData` and slow networks.' },
      ],
    },
    pitfalls: [
      { vi: 'Preload quá nhiều tài nguyên (>3–4 file) làm tranh giành băng thông với chính CSS/JS chính khiến trang chậm đi thay vì nhanh lên!', en: 'Over-using `rel="preload"` floods the high-priority queue and steals bandwidth from critical CSS/LCP.' },
      { vi: 'Dùng `<link rel="preload" as="font">` mà thiếu `crossorigin` khiến trình duyệt tải font hai lần!', en: 'Omitting `crossorigin` on font preloads causes browsers to fetch the font twice.' },
    ],
    interviewTips: [
      { vi: 'Nêu rõ đủ 4 Resource Hints: `dns-prefetch`, `preconnect` (cho domain API/CDN khác origin), `preload` (trang hiện tại), và `prefetch` (trang tương lai).', en: 'Contrast all four resource hints cleanly: `dns-prefetch`, `preconnect`, `preload` (current nav), and `prefetch` (future nav).' },
    ],
    example: {
      title: { vi: 'Intent Prefetch Cache trên Hover / Focus', en: 'Intent-Based Hover Prefetch Simulator' },
      description: { vi: 'Di chuột (hover) hoặc focus vào link bài viết để xem cache được nạp ngầm trước khi bấm mở chi tiết!', en: 'Hover over any row to warm its data cache in the background so clicking opens in 0ms.' },
      mode: 'react',
      code: `import React, { useRef, useState } from 'react';

const ARTICLES: Record<string, string> = {
  'a1': 'Deep dive into Browser Resource Hints (preload vs prefetch vs preconnect).',
  'a2': 'Breaking JS + API waterfalls with parallel route loaders.',
};

export default function App() {
  const cache = useRef<Record<string, string>>({});
  const [cachedIds, setCachedIds] = useState<string[]>([]);
  const [opened, setOpened] = useState<{ id: string; text: string; ms: number } | null>(null);

  const prefetch = (id: string) => {
    if (cache.current[id]) return;
    setTimeout(() => {
      cache.current[id] = ARTICLES[id];
      setCachedIds(Object.keys(cache.current));
    }, 180);
  };

  const openArticle = (id: string) => {
    if (cache.current[id]) {
      setOpened({ id, text: cache.current[id], ms: 0 });
      return;
    }
    setTimeout(() => {
      cache.current[id] = ARTICLES[id];
      setCachedIds(Object.keys(cache.current));
      setOpened({ id, text: ARTICLES[id], ms: 180 });
    }, 180);
  };

  return (
    <div className="col">
      <div className="muted">Hover one item briefly before clicking vs click directly to see 0ms vs 180ms load!</div>
      <div className="row">
        {Object.keys(ARTICLES).map((id) => (
          <button
            key={id}
            onMouseEnter={() => prefetch(id)}
            onFocus={() => prefetch(id)}
            onClick={() => openArticle(id)}
          >
            Article {id.toUpperCase()} {cachedIds.includes(id) ? '(Prefetched)' : ''}
          </button>
        ))}
      </div>
      {opened && (
        <div className="card">
          <strong>Opened {opened.id.toUpperCase()} in {opened.ms}ms</strong>
          <p className="muted" style={{ marginBottom: 0 }}>{opened.text}</p>
        </div>
      )}
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử bấm thẳng Article A2 không hover trước (mất 180ms), sau đó hover vào A1 0.2s rồi mới bấm (0ms)!', en: 'Click A2 directly (180ms wait), then hover over A1 briefly before clicking (0ms instant).' },
    },
    quiz: [
      {
        id: 'q-pre-1',
        topicId: 'preloading-prefetching',
        categoryId: 'performance',
        question: { vi: 'Sự khác biệt cốt lõi giữa `<link rel="preload">` và `<link rel="prefetch">` là gì?', en: 'What is the core difference between `<link rel="preload">` and `<link rel="prefetch">`?' },
        options: [
          { vi: '`preload` tải ưu tiên cao cho trang HIỆN TẠI; `prefetch` tải ưu tiên thấp khi rảnh cho trang KẾ TIẾP.', en: '`preload` fetches high-priority assets for the CURRENT route; `prefetch` fetches low-priority assets for a LIKELY NEXT route.' },
          { vi: '`prefetch` chỉ chạy cho CSS còn `preload` chỉ chạy cho ảnh.', en: '`prefetch` only supports CSS and `preload` only supports images.' },
          { vi: '`preload` luôn tải sau khi sự kiện onload kết thúc.', en: '`preload` runs after window onload.' },
          { vi: 'Hai thẻ giống hệt nhau hoàn toàn.', en: 'Both behave identically.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Đặt sai `preload` cho trang sau sẽ làm chậm trang hiện tại; đặt sai `prefetch` cho ảnh hero sẽ khiến LCP bị trễ.',
          en: 'Mixing them up either starves current-page LCP or wastes priority on future assets.',
        },
      },
      {
        id: 'q-pre-2',
        topicId: 'preloading-prefetching',
        categoryId: 'performance',
        question: { vi: 'Vì sao khi preload một font file cùng origin vẫn nên thêm thuộc tính `crossorigin`?', en: 'Why must font preloads (`<link rel="preload" as="font">`) include the `crossorigin` attribute?' },
        options: [
          { vi: 'Đặc tả Fetch buộc tải font ở chế độ CORS anonymous; thiếu `crossorigin` làm khóa cache lệch nhau khiến font bị tải tận 2 lần.', en: 'Font requests always use CORS mode; omitting `crossorigin` mismatches cache keys and triggers a double download.' },
          { vi: 'Để trình duyệt bỏ qua font WOFF2.', en: 'To skip WOFF2.' },
          { vi: 'Để đổi font sang Comic Sans.', en: 'To swap fallback fonts.' },
          { vi: 'Không cần thiết nếu font nằm dưới 50KB.', en: 'Unnecessary under 50KB.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Lỗi double-fetch font do quên `crossorigin` trên `<link rel="preload" as="font" type="font/woff2" crossorigin>` cực kỳ phổ biến.',
          en: 'Fonts load anonymously via CORS even on the same origin, so preload must match that CORS mode.',
        },
      },
    ],
    relatedTopicIds: ['image-preload', 'loading-sequences', 'above-the-fold'],
  },

  {
    ...TOPIC_META_MAP['list-virtualization'],
    mentalModel: {
      vi: 'Thay vì trải cả cuộn thảm 100.000 phần tử DOM làm trình duyệt nghẹt thở, giữ một vùng cuộn ảo đúng chiều cao tổng (`totalHeight`), rồi chỉ đặt đúng ~15–20 phần tử nằm trong khung nhìn + đệm `overscan` tại vị trí `translateY(...)`!',
      en: 'Keep total scroll container height accurate while only mounting the ~15-20 DOM rows visible inside the scroll viewport plus a small overscan buffer positioned with `translateY`.',
    },
    keyPoints: [
      { vi: 'Số lượng DOM nodes giữ ở mức O(viewportHeight / rowHeight) bất kể danh sách dài 1.000 hay 1.000.000 phần tử.', en: 'DOM node count stays constant O(1) relative to viewport size whether rendering 500 or 500,000 items.' },
      { vi: 'Định vị bằng `transform: translateY(offset)` thay vì `top` để tận dụng GPU compositing không gây reflow.', en: 'Position visible slices using `transform: translateY(...)` to avoid layout reflows on scroll.' },
      { vi: 'Chiều cao động (Variable Height): dùng mảng vị trí ước lượng ban đầu + ResizeObserver cập nhật mảng prefix sum + binary search tìm `startIndex`.', en: 'Variable row heights combine estimated offsets, ResizeObserver measurements, prefix sums, and binary search.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Bảng dữ liệu lớn (>100–500 dòng nặng), danh sách tin nhắn Chat hàng nghìn tin, dropdown select 10.000 mục, log viewer.', en: 'Large data tables, infinite social feeds, long chat logs, and huge combobox dropdowns.' },
      ],
      whenToAvoid: [
        { vi: 'Danh sách ngắn (<50–100 dòng nhẹ) cần chức năng tìm kiếm trình duyệt Ctrl+F gốc hoặc SEO toàn bộ nội dung trên DOM.', en: 'Short lists (<100 lightweight items) where native browser Ctrl+F find-in-page or full-DOM SEO matters.' },
      ],
    },
    pitfalls: [
      { vi: 'Dùng Ctrl+F của trình duyệt không tìm thấy các dòng đang không có trong DOM (cần thanh search riêng hoặc `content-visibility: auto`).', en: 'Browser Ctrl+F cannot match off-screen unmounted rows; provide app-level search or `content-visibility: auto` for medium lists.' },
      { vi: 'Không set `overscan` (>0) làm thấy khoảng trắng nhấp nháy khi vuốt cuộn nhanh trên màn hình 120Hz.', en: 'Zero overscan reveals blank white flashes during fast flick scrolling.' },
    ],
    interviewTips: [
      { vi: 'Thuộc lòng công thức tính cửa sổ Fixed Height (`startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)`, `endIndex = Math.min(total - 1, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan)`) và biết cách nâng cấp lên Variable Height bằng Prefix Sum + Binary Search!', en: 'Know the fixed-height window math cold and explain how to scale to variable heights with a measured prefix-sum array + binary search.' },
    ],
    example: {
      title: { vi: 'Danh sách ảo 100.000 dòng tự code (0 thư viện ngoài)', en: 'Zero-Dependency 100,000-Row Virtual List' },
      description: { vi: 'Cuộn mượt danh sách 100.000 phần tử trong khi DOM chỉ render đúng ~12 node cùng lúc!', en: 'Scroll smoothly across 100,000 rows while keeping live DOM nodes capped around 12 items.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

const TOTAL = 100_000;
const ROW_H = 32;
const VIEWPORT_H = 224;
const OVERSCAN = 3;

export default function App() {
  const [scrollTop, setScrollTop] = useState(0);

  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const end = Math.min(TOTAL - 1, Math.ceil((scrollTop + VIEWPORT_H) / ROW_H) + OVERSCAN);
  const visible = [];
  for (let i = start; i <= end; i++) visible.push(i);

  return (
    <div className="col">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="badge">Rendered DOM nodes: {visible.length} / {TOTAL.toLocaleString()}</span>
        <span className="badge">Window: #{start} – #{end}</span>
      </div>
      <div
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{ height: VIEWPORT_H, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, position: 'relative' }}
      >
        <div style={{ height: TOTAL * ROW_H, position: 'relative' }}>
          <div style={{ transform: \`translateY(\${start * ROW_H}px)\` }}>
            {visible.map((idx) => (
              <div
                key={idx}
                style={{
                  height: ROW_H,
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 13,
                }}
              >
                <span>Row #{idx.toLocaleString()}</span>
                <span className="muted">offset {(idx * ROW_H).toLocaleString()}px</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử kéo thanh cuộn xuống giữa danh sách (~50.000) và mở tab Interactive Lab để chỉnh động `rowHeight` và `overscan`.', en: 'Drag the scrollbar halfway down (~50,000) and check the Interactive Lab tab for dynamic controls.' },
    },
    challenge: {
      id: 'challenge-virtual-window',
      topicId: 'list-virtualization',
      categoryId: 'performance',
      title: { vi: 'Cài đặt computeVirtualWindow cho Virtual List', en: 'Implement computeVirtualWindow' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm computeVirtualWindow(params: { totalItems: number; itemHeight: number; viewportHeight: number; scrollTop: number; overscan?: number }) trả về { startIndex, endIndex, offsetY, totalHeight, visibleCount }. Nếu totalItems <= 0 trả { startIndex: 0, endIndex: -1, offsetY: 0, totalHeight: 0, visibleCount: 0 }. Chặn startIndex >= 0 và endIndex <= totalItems - 1.',
        en: 'Implement computeVirtualWindow({ totalItems, itemHeight, viewportHeight, scrollTop, overscan = 2 }) returning { startIndex, endIndex, offsetY, totalHeight, visibleCount }. Handle empty lists gracefully (endIndex = -1, visibleCount = 0) and clamp indices within [0, totalItems - 1].',
      },
      starterCode: `export function computeVirtualWindow(params: {
  totalItems: number;
  itemHeight: number;
  viewportHeight: number;
  scrollTop: number;
  overscan?: number;
}) {
  // TODO: compute clamped startIndex, endIndex, offsetY, totalHeight, visibleCount
  return { startIndex: 0, endIndex: -1, offsetY: 0, totalHeight: 0, visibleCount: 0 };
}`,
      solutionCode: `export function computeVirtualWindow(params: {
  totalItems: number;
  itemHeight: number;
  viewportHeight: number;
  scrollTop: number;
  overscan?: number;
}) {
  const { totalItems, itemHeight, viewportHeight, scrollTop, overscan = 2 } = params;
  if (totalItems <= 0 || itemHeight <= 0) {
    return { startIndex: 0, endIndex: -1, offsetY: 0, totalHeight: 0, visibleCount: 0 };
  }

  const rawStart = Math.floor(Math.max(0, scrollTop) / itemHeight);
  const rawEnd = Math.ceil((Math.max(0, scrollTop) + viewportHeight) / itemHeight) - 1;

  const startIndex = Math.max(0, rawStart - overscan);
  const endIndex = Math.min(totalItems - 1, Math.max(startIndex, rawEnd + overscan));
  const offsetY = startIndex * itemHeight;
  const totalHeight = totalItems * itemHeight;
  const visibleCount = endIndex >= startIndex ? endIndex - startIndex + 1 : 0;

  return { startIndex, endIndex, offsetY, totalHeight, visibleCount };
}`,
      testCode: `test('computes visible window with overscan and bounds clamping', () => {
  const top = computeVirtualWindow({ totalItems: 1000, itemHeight: 40, viewportHeight: 200, scrollTop: 0, overscan: 2 });
  expect(top).toEqual({ startIndex: 0, endIndex: 6, offsetY: 0, totalHeight: 40000, visibleCount: 7 });

  const mid = computeVirtualWindow({ totalItems: 1000, itemHeight: 40, viewportHeight: 200, scrollTop: 400, overscan: 2 });
  expect(mid).toEqual({ startIndex: 8, endIndex: 16, offsetY: 320, totalHeight: 40000, visibleCount: 9 });

  const empty = computeVirtualWindow({ totalItems: 0, itemHeight: 40, viewportHeight: 200, scrollTop: 0 });
  expect(empty).toEqual({ startIndex: 0, endIndex: -1, offsetY: 0, totalHeight: 0, visibleCount: 0 });
});`,
      hints: [
        { vi: 'Tính `rawStart = Math.floor(scrollTop / itemHeight)` và `rawEnd = Math.ceil((scrollTop + viewportHeight) / itemHeight) - 1`.', en: 'Compute unbuffered `rawStart = Math.floor(scrollTop / itemHeight)` and `rawEnd = Math.ceil((scrollTop + viewportHeight) / itemHeight) - 1`.' },
        { vi: 'Áp dụng overscan bằng `Math.max(0, rawStart - overscan)` và `Math.min(totalItems - 1, rawEnd + overscan)`.', en: 'Apply overscan clamped between `0` and `totalItems - 1`, then derive `offsetY = startIndex * itemHeight`.' },
      ],
    },
    quiz: [
      {
        id: 'q-virt-1',
        topicId: 'list-virtualization',
        categoryId: 'performance',
        question: { vi: 'Thuộc tính CSS nào tốt nhất để dịch chuyển khối phần tử ảo trong Virtual List khi cuộn mà không gây Layout Reflow?', en: 'Which CSS property should position the active window of items inside a virtualized scroller to avoid Layout Reflow?' },
        options: [
          { vi: '`transform: translateY(...)`', en: '`transform: translateY(...)`' },
          { vi: '`margin-top: ...`', en: '`margin-top: ...`' },
          { vi: '`height: ...` thay đổi mỗi frame', en: 'Mutating `height` every frame' },
          { vi: '`border-top-width: ...`', en: '`border-top-width`' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`transform` chỉ chạy ở bước Compositor trên GPU mà bỏ qua Layout và Paint, giúp giữ 60/120fps khi cuộn.',
          en: '`transform` moves pixels purely on the GPU compositor layer without recalculating layout.',
        },
      },
      {
        id: 'q-virt-2',
        topicId: 'list-virtualization',
        categoryId: 'performance',
        question: { vi: 'Mục đích của tham số `overscan` trong List Virtualization là gì?', en: 'What is the purpose of the `overscan` count in List Virtualization?' },
        options: [
          { vi: 'Render dư thêm vài dòng phía trên và phía dưới khung nhìn để tránh chớp trắng khi user cuộn nhanh.', en: 'Pre-render a small buffer of off-screen rows above and below the viewport to prevent blank flicker during rapid scrolling.' },
          { vi: 'Xóa toàn bộ ảnh khỏi danh sách.', en: 'Strip images from rows.' },
          { vi: 'Tự động gửi thêm request API.', en: 'Trigger extra API calls.' },
          { vi: 'Tăng kích thước font chữ.', en: 'Increase font size.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Overscan tạo vùng đệm mượt mà trong khi GPU cuộn nhanh hơn chu kỳ JS cập nhật scroll event.',
          en: 'Overscan hides scroll-event frame latency during fast flick scrolling.',
        },
      },
    ],
    relatedTopicIds: ['ux-infinite-scrolling', 'reflows-repaints', 'memory-leaks'],
  },

  {
    ...TOPIC_META_MAP['compression'],
    mentalModel: {
      vi: 'Thay vì chuyển cả kiện hàng cồng kềnh qua mạng, ép chân không (Brotli/Gzip) các file text JS/CSS/HTML trước khi gửi rồi giải nén tức thì tại trình duyệt, kết hợp codec ảnh/video hiện đại cho media.',
      en: 'Shrink text wire bytes 70-85% with Brotli (`br`) or Gzip over HTTP Content-Encoding, and ship AVIF/WebP/H.265/Opus for already-compressed binary media.',
    },
    keyPoints: [
      { vi: 'Brotli (`Content-Encoding: br`) nén JS/CSS/HTML nhỏ hơn Gzip khoảng 15–25% nhờ từ điển dựng sẵn cho web assets.', en: 'Brotli beats Gzip by ~15-25% on JS, CSS, and HTML bundles using its built-in web dictionary.' },
      { vi: 'Pre-compress file tĩnh ở bước build (Brotli level 11) thay vì nén nóng (level 11 quá chậm) trên server runtime.', en: 'Pre-compress static assets at build time (Brotli-11) rather than burning runtime server CPU.' },
      { vi: 'Không bật Gzip/Brotli lại lên JPEG/PNG/WebP/MP4 vì ảnh/video đã nén sẵn — nén thêm vừa tốn CPU vừa có thể phình to thêm!', en: 'Never double-compress JPEG, WebP, or MP4 media with Gzip/Brotli; use lossy/lossless media codecs instead.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Bật Brotli/Gzip cho mọi text MIME types: `text/html`, `application/javascript`, `text/css`, `application/json`, `image/svg+xml`.', en: 'All text-based MIME types including HTML, JS, CSS, JSON, WOFF/SVG.' },
      ],
      whenToAvoid: [
        { vi: 'Tránh Brotli mức tối đa (level 11) cho phản hồi API động JSON trên server thời gian thực (nên dùng level 4–5 hoặc Gzip).', en: 'Avoid Brotli-11 for dynamic real-time JSON responses—use level 4-5 or fast Gzip to keep TTFB low.' },
      ],
    },
    pitfalls: [
      { vi: 'Quên đặt header `Vary: Accept-Encoding` ở proxy/CDN làm trình duyệt cũ nhận nhầm file đã nén Brotli không đọc được.', en: 'Missing `Vary: Accept-Encoding` causes CDNs to serve Brotli bytes to non-supporting clients.' },
    ],
    interviewTips: [
      { vi: 'Phân biệt nhanh: Code/Text dùng Brotli/Gzip (`Accept-Encoding`), Media dùng codec riêng (`WebP/AVIF`, `HLS/H.265`) và SVG chính là text XML nên vẫn cần Brotli!', en: 'Remember SVG is XML text so it compresses massively with Brotli, unlike raster PNG/WebP.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Tiết kiệm Băng thông Text Compression (Raw vs Gzip vs Brotli)', en: 'Payload Savings Calculator (Raw vs Gzip vs Brotli)' },
      description: { vi: 'Tính toán thời gian tải thực tế trên mạng 3G chậm (1.5 Mbps) trước và sau khi bật nén Brotli.', en: 'Compute 3G wire transfer time before and after Gzip/Brotli compression.' },
      mode: 'ts',
      code: `interface Asset { name: string; rawKB: number; gzipRatio: number; brotliRatio: number }

const assets: Asset[] = [
  { name: 'app.bundle.js', rawKB: 480, gzipRatio: 0.32, brotliRatio: 0.25 },
  { name: 'styles.css', rawKB: 84, gzipRatio: 0.22, brotliRatio: 0.17 },
  { name: 'icons.sprite.svg', rawKB: 42, gzipRatio: 0.34, brotliRatio: 0.26 },
  { name: 'hero.webp (already compressed)', rawKB: 95, gzipRatio: 1.0, brotliRatio: 1.0 },
];

const speedKBps = 180; // ~1.5 Mbps Slow 3G

for (const a of assets) {
  const brKB = +(a.rawKB * a.brotliRatio).toFixed(1);
  const rawMs = Math.round((a.rawKB / speedKBps) * 1000);
  const brMs = Math.round((brKB / speedKBps) * 1000);
  console.log(\`\${a.name}: \${a.rawKB}KB (\${rawMs}ms) -> Brotli \${brKB}KB (\${brMs}ms)\`);
}`,
      tryItPrompt: { vi: 'Thử cộng tổng thời gian tải tiết kiệm được trên mạng 3G chậm cho cả 3 file text!', en: 'Sum total milliseconds saved across the three compressible text assets on Slow 3G.' },
    },
    quiz: [
      {
        id: 'q-compres-1',
        topicId: 'compression',
        categoryId: 'performance',
        question: { vi: 'Loại tài nguyên hình ảnh nào NÊN bật nén Brotli/Gzip trên HTTP server?', en: 'Which image asset type benefits significantly from HTTP Brotli/Gzip compression?' },
        options: [
          { vi: 'SVG (`image/svg+xml`) vì bản chất là văn bản XML.', en: 'SVG (`image/svg+xml`), because it is text-based XML.' },
          { vi: 'WebP đã nén lossy.', en: 'Lossy WebP.' },
          { vi: 'JPEG chất lượng 80%.', en: 'JPEG at 80% quality.' },
          { vi: 'AVIF.', en: 'AVIF.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'SVG là markup XML thuần text nên nén Brotli thường giảm được 60–75% dung lượng.',
          en: 'SVG is XML text and shrinks dramatically under Brotli/Gzip, whereas raster formats are already compressed.',
        },
      },
      {
        id: 'q-compres-2',
        topicId: 'compression',
        categoryId: 'performance',
        question: { vi: 'Header HTTP nào giúp CDN/Proxy phân biệt cache giữa client hỗ trợ `br` (Brotli) và client chỉ hỗ trợ `gzip`?', en: 'Which HTTP response header tells CDNs to cache Brotli and Gzip variants separately?' },
        options: [
          { vi: 'Vary: Accept-Encoding', en: 'Vary: Accept-Encoding' },
          { vi: 'Accept: text/html', en: 'Accept: text/html' },
          { vi: 'Content-Security-Policy', en: 'Content-Security-Policy' },
          { vi: 'X-Powered-By', en: 'X-Powered-By' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`Vary: Accept-Encoding` đảm bảo CDN tách biệt cache key theo chuẩn nén mà client hỗ trợ.',
          en: '`Vary: Accept-Encoding` keys CDN responses by the client compression capability.',
        },
      },
    ],
    relatedTopicIds: ['tree-shaking', 'image-formats', 'caching-expiry'],
  },

  {
    ...TOPIC_META_MAP['loading-sequences'],
    mentalModel: {
      vi: 'Thay vì chạy tiếp sức từng chặng (HTML xong mới thấy JS -> JS chạy mới fetch User -> có User mới fetch Feed), hãy sắp xếp mọi thứ chạy song song ngay từ đầu (preconnect + parallel fetch + HTTP streaming)!',
      en: 'Eliminate sequential network waterfalls—HTML -> CSS -> JS -> User -> Feed—by running preconnect, modulepreload, and data fetching in parallel along the critical path.',
    },
    keyPoints: [
      { vi: 'Nhận diện Critical Rendering Path: HTML -> Critical CSS -> Fonts/LCP Image -> Hydration JS.', en: 'Map the Critical Rendering Path carefully: HTML -> Critical CSS -> LCP Hero/Fonts -> Hydration JS.' },
      { vi: 'Tránh render-blocking `<script>` trong `<head>` (dùng `type="module"` hoặc `defer`), tránh `@import` bên trong CSS vì gây chuỗi tuần tự ẩn.', en: 'Never block HTML parsing with sync `<script>` tags or nested CSS `@import` chains.' },
      { vi: 'Sử dụng `<link rel="preconnect">` cho origin API/CDN quan trọng để hoàn tất DNS + TCP + TLS sớm.', en: 'Use `<link rel="preconnect">` for key third-party CDN/API origins to overlap TLS handshakes.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi trang web hướng người dùng: kiểm tra DevTools Waterfall tab để dẹp các "bậc thang nối tiếp" (staircase waterfalls).', en: 'Every public page: inspect browser Network waterfalls to flatten staircase request chains.' },
      ],
      whenToAvoid: [
        { vi: 'Tránh `preconnect` quá nhiều domain (>3 domain) vì tốn tài nguyên socket không sử dụng.', en: 'Limit `preconnect` to your top 2-3 critical origins to avoid wasted socket handshakes.' },
      ],
    },
    pitfalls: [
      { vi: 'Đặt CSS `@import url("fonts.css");` bên trong `main.css` làm trình duyệt không tải font được cho tới khi `main.css` tải và parse xong!', en: 'CSS `@import` hides stylesheets from the HTML preload scanner until the parent stylesheet parses.' },
    ],
    interviewTips: [
      { vi: 'Chỉ ra HTML Preload Scanner: giữ `<img src>` và `<link>` trong HTML ban đầu thay vì chèn động bằng JS để trình duyệt tải ngay từ byte đầu tiên!', en: 'Highlight the browser HTML Preload Scanner—declarative tags in SSR HTML start fetching far earlier than JS-injected tags.' },
    ],
    example: {
      title: { vi: 'So sánh Sequential Waterfall vs Parallel Loading Sequence', en: 'Sequential Waterfall vs Parallel Preload Sequence' },
      description: { vi: 'Chạy giả lập tính tổng thời gian hiển thị đầy đủ khi phá vỡ chuỗi waterfall tuần tự bằng tải song song.', en: 'Compare chained sequential roundtrips against flattened parallel loading sequences.' },
      mode: 'ts',
      code: `async function step(name: string, ms: number) {
  await sleep(ms);
  return name + ' (' + ms + 'ms)';
}

// 1. Bad: Sequential waterfall (HTML -> Config -> User -> Feed)
const t1 = performance.now();
await step('HTML', 60);
await step('Config', 80);
await step('User', 90);
await step('Feed', 110);
const seqTotal = Math.round(performance.now() - t1);

// 2. Good: Preloaded / Parallel sequence (Config + User + Feed kicked off concurrently!)
const t2 = performance.now();
await step('HTML shell + preload hints', 60);
await Promise.all([step('Config', 80), step('User', 90), step('Feed', 110)]);
const parTotal = Math.round(performance.now() - t2);

console.log('Sequential waterfall total:', seqTotal + 'ms');
console.log('Parallel loading sequence total:', parTotal + 'ms');
console.log('Time saved:', (seqTotal - parTotal) + 'ms');`,
      tryItPrompt: { vi: 'Thử thêm bước tải ảnh LCP vào trong `Promise.all` để thấy thời gian tổng chỉ bằng nhánh chậm nhất.', en: 'Add an LCP image download into `Promise.all` to see how critical path collapses to the slowest parallel branch.' },
    },
    quiz: [
      {
        id: 'q-seq-1',
        topicId: 'loading-sequences',
        categoryId: 'performance',
        question: { vi: 'Vì sao dùng `@import` bên trong file CSS lại có hại cho loading sequence?', en: 'Why does CSS `@import` inside a stylesheet degrade loading sequences?' },
        options: [
          { vi: 'Ẩn file CSS con khỏi HTML Preload Scanner, buộc trình duyệt phải tải và parse file cha xong mới biết để tải file con.', en: 'It hides child stylesheets from the HTML preload scanner, creating an extra sequential waterfall hop.' },
          { vi: 'Trình duyệt không hỗ trợ CSS @import.', en: 'Browsers reject CSS @import.' },
          { vi: 'CSS @import chạy JavaScript.', en: 'CSS @import runs JavaScript.' },
          { vi: 'Tăng lỗi XSS.', en: 'Increases XSS risk.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Thay `@import` bằng thẻ `<link rel="stylesheet">` song song trong `<head>` hoặc gộp CSS lúc build.',
          en: 'Replace CSS `@import` with parallel `<link rel="stylesheet">` tags or build-time CSS bundling.',
        },
      },
      {
        id: 'q-seq-2',
        topicId: 'loading-sequences',
        categoryId: 'performance',
        question: { vi: 'Thẻ nào giúp trình duyệt hoàn tất DNS + TCP + TLS handshake sớm với một domain CDN khác origin trước khi cần tải tài nguyên?', en: 'Which hint triggers early DNS + TCP + TLS handshake for a third-party API or CDN domain?' },
        options: [
          { vi: '`<link rel="preconnect" href="https://cdn.example.com" crossorigin>`', en: '`<link rel="preconnect" href="https://cdn.example.com" crossorigin>`' },
          { vi: '`<meta name="viewport">`', en: '`<meta name="viewport">`' },
          { vi: '`<script async>`', en: '`<script async>`' },
          { vi: '`<img loading="lazy">`', en: '`<img loading="lazy">`' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`preconnect` mở sẵn kết nối TLS trước khi parser tìm thấy URL ảnh/API trên domain đó.',
          en: '`preconnect` eliminates 100-300ms of TCP+TLS negotiation before actual resource URLs are parsed.',
        },
      },
    ],
    relatedTopicIds: ['preloading-prefetching', 'above-the-fold', 'ssr'],
  },

  {
    ...TOPIC_META_MAP['above-the-fold'],
    mentalModel: {
      vi: 'Khách bước vào cửa hàng chỉ nhìn thấy tủ trưng bày mặt tiền đầu tiên (Above-the-fold: 100vh đầu). Hãy bày món chính ra ngay (inline Critical CSS + `fetchpriority="high"` cho ảnh Hero) còn đồ dưới hầm thì để tải sau!',
      en: 'Prioritize every byte needed for the initial 100vh viewport—inline critical styles, boost hero media with `fetchpriority="high"`, and defer off-screen JS/images.',
    },
    keyPoints: [
      { vi: 'Tuyệt đối KHÔNG gắn `loading="lazy"` lên ảnh Hero/LCP nằm trong màn hình đầu tiên!', en: 'NEVER place `loading="lazy"` on above-the-fold hero/LCP images.' },
      { vi: 'Thêm `fetchpriority="high"` cho thẻ `<img>` LCP chính để trình duyệt xếp trên các script/ảnh phụ.', en: 'Add `fetchpriority="high"` to the primary LCP `<img>` so the browser elevates it above low-priority assets.' },
      { vi: 'Đặt sẵn kích thước `width`/`height` (hoặc `aspect-ratio`) + `font-display: swap` để màn hình đầu không bị nhảy CLS.', en: 'Reserve explicit `width`/`height` or `aspect-ratio` and use `font-display: swap` to eliminate initial CLS jumps.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Trang chủ, trang sản phẩm e-commerce, bài viết tin tức nơi LCP ảnh hưởng trực tiếp tỷ lệ chuyển đổi và thứ hạng SEO.', en: 'Landing pages, product detail pages, and editorial pages where initial visual speed drives conversion and SEO.' },
      ],
      whenToAvoid: [
        { vi: 'Không lạm dụng inline quá nhiều CSS (>14KB) hoặc gắn `fetchpriority="high"` cho 10 ảnh cùng lúc — mọi thứ đều ưu tiên cao thì không có gì ưu tiên cả!', en: 'Do not mark 10 images `fetchpriority="high"`; priority boosts only work when scoped to the single true hero asset.' },
      ],
    },
    pitfalls: [
      { vi: 'Quên xóa `loading="lazy"` mặc định của component `<Image>` trên ảnh banner đầu trang làm LCP chậm thêm hàng trăm ms!', en: 'Applying a generic `<Image loading="lazy">` wrapper to the hero banner delays LCP significantly.' },
    ],
    interviewTips: [
      { vi: 'Kết hợp 3 kỹ thuật cụ thể cho ảnh Hero: `loading="eager"` + `fetchpriority="high"` + explicit `width/height` (và `<link rel="preload" as="image">` nếu ảnh ẩn trong CSS).', en: 'List the exact hero combo: `loading="eager"`, `fetchpriority="high"`, explicit dimensions, and `rel="preload"` if CSS-driven.' },
    ],
    example: {
      title: { vi: 'Demo HTML chuẩn ưu tiên Above-the-fold (Hero vs Offscreen)', en: 'Above-the-Fold Priority Markup Demo' },
      description: { vi: 'Kiểm tra HTML thực tế phân tầng ưu tiên giữa ảnh Hero LCP (`fetchpriority="high"`) và nội dung dưới màn hình (`loading="lazy"`).', en: 'Inspect live HTML showcasing eager high-priority hero markup vs below-the-fold lazy assets.' },
      mode: 'html',
      code: `<section style="padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:16px;">
  <span class="badge">Above the fold (LCP Hero)</span>
  <h2 style="margin:8px 0 4px;">Priority-First Hero Section</h2>
  <p class="muted" style="margin:0 0 10px;">
    Uses <code>loading="eager"</code>, <code>fetchpriority="high"</code>, and explicit aspect-ratio box to keep CLS = 0.
  </p>
  <svg role="img" aria-label="Hero product preview" width="320" height="110" viewBox="0 0 320 110"
       style="display:block;width:100%;max-width:320px;height:auto;border-radius:6px;background:#0f172a;border:1px solid #38bdf8;">
    <rect x="14" y="16" width="120" height="14" rx="4" fill="#38bdf8"/>
    <rect x="14" y="40" width="240" height="10" rx="3" fill="#475569"/>
    <rect x="14" y="58" width="190" height="10" rx="3" fill="#334155"/>
    <rect x="14" y="78" width="84" height="20" rx="5" fill="#22c55e"/>
  </svg>
</section>

<section style="padding:12px;border:1px dashed var(--border);border-radius:8px;">
  <span class="badge">Below the fold</span>
  <p class="muted" style="margin:6px 0 0;">
    Secondary images use <code>loading="lazy" decoding="async"</code> so they never compete with the hero LCP element.
  </p>
</section>`,
      tryItPrompt: { vi: 'Thử bỏ thuộc tính width/height ở khối preview để thấy vì sao trình duyệt không thể giữ chỗ trước khi ảnh tải xong.', en: 'Observe how reserving explicit SVG/image aspect dimensions prevents layout shift.' },
    },
    quiz: [
      {
        id: 'q-atf-1',
        topicId: 'above-the-fold',
        categoryId: 'performance',
        question: { vi: 'Điều gì xảy ra nếu bạn gắn `loading="lazy"` cho ảnh Hero nằm ngay trên màn hình đầu tiên?', en: 'What happens if you put `loading="lazy"` on your above-the-fold Hero LCP image?' },
        options: [
          { vi: 'Làm tệ chỉ số LCP vì trình duyệt chờ chạy layout/intersection check xong mới bắt đầu tải ảnh thay vì preload ngay từ HTML.', en: 'Degrades LCP because the browser delays fetching until layout calculates viewport intersection instead of preloading immediately.' },
          { vi: 'Ảnh sắc nét hơn gấp đôi.', en: 'Doubles image sharpness.' },
          { vi: 'Tiết kiệm được 100% RAM.', en: 'Saves 100% RAM.' },
          { vi: 'Tự động tạo alt text.', en: 'Auto-generates alt text.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Lighthouse cảnh báo lỗi "Largest Contentful Paint image was lazily loaded" khi ảnh LCP bị gán lazy.',
          en: 'Lazy-loading LCP images slows initial paint and triggers Lighthouse LCP warnings.',
        },
      },
      {
        id: 'q-atf-2',
        topicId: 'above-the-fold',
        categoryId: 'performance',
        question: { vi: 'Thuộc tính HTML nào báo cho trình duyệt tăng mức ưu tiên mạng cho đúng ảnh Hero LCP?', en: 'Which HTML attribute signals the browser to boost network fetch priority for the main LCP hero image?' },
        options: [
          { vi: 'fetchpriority="high"', en: 'fetchpriority="high"' },
          { vi: 'defer="true"', en: 'defer="true"' },
          { vi: 'decoding="sync"', en: 'decoding="sync"' },
          { vi: 'aria-hidden="true"', en: 'aria-hidden="true"' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`fetchpriority="high"` đẩy ảnh LCP lên trước các tài nguyên ít quan trọng hơn trong hàng đợi HTTP/2.',
          en: '`fetchpriority="high"` promotes the LCP resource ahead of competing scripts and below-the-fold images.',
        },
      },
    ],
    relatedTopicIds: ['core-web-vitals', 'image-lazy-loading', 'image-preload'],
  },

  {
    ...TOPIC_META_MAP['perf-debounce-throttle'],
    mentalModel: {
      vi: 'Ở tầng UI & CPU: `debounce` gộp chuỗi sự kiện liên tiếp (như `window.resize`) thành 1 lần tính toán duy nhất sau khi dừng; `throttle` (hoặc `requestAnimationFrame` throttle) giới hạn hàm nặng chạy tối đa 1 lần mỗi khung hình (~16.6ms) hoặc mỗi `wait` ms khi cuộn/kéo.',
      en: 'On the main thread: `debounce` waits for burst activity (`resize`) to quiet down before running once, while `throttle` / `rAF` caps expensive handlers (`scroll`, `mousemove`) to at most once per `wait` window.',
    },
    keyPoints: [
      { vi: 'Trailing Debounce: hủy timer cũ mỗi lần gọi lại và chỉ chạy sau `wait` ms yên tĩnh.', en: 'Trailing debounce clears pending timers on every call and runs after `wait` ms of silence.' },
      { vi: 'Leading + Trailing Throttle: chạy ngay lần đầu hoặc tối đa 1 lần mỗi `wait` ms đều đặn.', en: 'Throttle caps execution rate to at most once per `wait` ms window (optionally running a trailing final update).' },
      { vi: 'Với thao tác đo/vẽ DOM liên quan đến cuộn chuột, dùng `requestAnimationFrame` throttle để khớp đúng tần số quét màn hình.', en: 'For visual scroll/drag updates, throttle with `requestAnimationFrame` so work aligns with vsync frames.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Debounce cho tính lại layout nặng khi kéo cửa sổ trình duyệt, validate form phức tạp.', en: 'Debounce for resize recalculations and validation after typing pauses.' },
        { vi: 'Throttle cho scroll progress bar, drag-and-drop position sync, chuột di chuyển vẽ canvas.', en: 'Throttle for scroll progress tracking, drag coordinates, and pointer telemetry.' },
      ],
      whenToAvoid: [
        { vi: 'Không đặt debounce lên nút mở menu hay nút phản hồi click tức thì vì gây cảm giác lag!', en: 'Never add trailing debounce to direct button clicks where users expect sub-50ms reaction.' },
      ],
    },
    pitfalls: [
      { vi: 'Quên cung cấp phương thức `.cancel()` trên hàm debounce/throttle để dọn dẹp khi component unmount.', en: 'Forgetting a `.cancel()` method prevents cleanup timers when unmounting React views.' },
    ],
    interviewTips: [
      { vi: 'Phỏng vấn coding front-end RẤT HAY bắt tự code `debounce` và `throttle` (có `this`/args forwarding, leading/trailing hoặc `.cancel()`) — làm ngay 2 bài Challenge bên phải!', en: 'Hand-coding `debounce` and `throttle` cleanly with `cancel()` and trailing edge accuracy is a top FE coding question.' },
    ],
    example: {
      title: { vi: 'Thước đo Event Stream: Raw vs Debounce vs Throttle', en: 'Live Pointer Pad: Raw vs Debounce vs Throttle' },
      description: { vi: 'Di chuyển chuột liên tục trên khung bên dưới để thấy rõ số lần gọi giữa Raw, Debounce (250ms) và Throttle (250ms).', en: 'Move your pointer across the pad to watch Raw, Debounce (250ms), and Throttle (250ms) execution counts.' },
      mode: 'ts',
      code: `function debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function throttle<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let last = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
    }
  };
}

let raw = 0, deb = 0, thr = 0;
const onDeb = debounce(() => { deb += 1; }, 80);
const onThr = throttle(() => { thr += 1; }, 80);

// Simulate 10 rapid scroll events every 25ms (total 250ms)
for (let i = 0; i < 10; i++) {
  raw += 1;
  onDeb();
  onThr();
  await sleep(25);
}
await sleep(100);
console.log({ rawEvents: raw, throttledRuns: thr, debouncedRuns: deb });`,
      tryItPrompt: { vi: 'Mở thêm tab Interactive Lab để vẽ biểu đồ trực tiếp theo thao tác di chuột của bạn!', en: 'Check the Interactive Lab tab to plot live Raw vs Debounced vs Throttled timelines with your cursor!' },
    },
    challenge: {
      id: 'challenge-debounce-throttle',
      topicId: 'perf-debounce-throttle',
      categoryId: 'performance',
      title: { vi: 'Cài đặt cặp hàm debounce (kèm .cancel) & throttle', en: 'Implement debounce (w/ cancel) & throttle' },
      difficulty: 'medium',
      prompt: {
        vi: 'Hoàn thiện cả 2 hàm `debounce(fn, wait)` và `throttle(fn, wait)`. Với `debounce`: gom các lời gọi trong `wait` ms, chỉ thực thi với tham số của lần gọi cuối cùng và hỗ trợ `debounced.cancel()`. Với `throttle`: cho phép chạy ngay ở lần đầu (leading), sau đó bỏ qua các lần trong cửa sổ `wait` ms, nhưng nếu có gọi trong lúc bị chặn thì đảm bảo chạy thêm 1 lần trailing khi hết cửa sổ `wait` ms với args mới nhất!',
        en: 'Implement both `debounce(fn, wait)` (trailing execution with latest args plus `.cancel()`) and `throttle(fn, wait)` (leading execution immediately, suppressing burst calls during `wait` ms, and firing one trailing call with the latest args if called while throttled).',
      },
      starterCode: `export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
  // TODO: implement trailing debounce with .cancel()
  const wrapped = (..._args: Parameters<T>) => {};
  wrapped.cancel = () => {};
  return wrapped;
}

export function throttle<T extends (...args: any[]) => void>(fn: T, wait: number) {
  // TODO: implement leading + trailing throttle
  return (..._args: Parameters<T>) => {};
}`,
      solutionCode: `export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const wrapped = (...args: Parameters<T>) => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, wait);
  };

  wrapped.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  return wrapped;
}

export function throttle<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let lastRun = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pendingArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - lastRun);

    if (remaining <= 0) {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      pendingArgs = null;
      lastRun = now;
      fn(...args);
    } else {
      pendingArgs = args;
      if (timer === undefined) {
        timer = setTimeout(() => {
          timer = undefined;
          lastRun = Date.now();
          if (pendingArgs) {
            const next = pendingArgs;
            pendingArgs = null;
            fn(...next);
          }
        }, remaining);
      }
    }
  };
}`,
      testCode: `test('debounce delays execution with latest args and supports cancel', async () => {
  const seen: string[] = [];
  const d = debounce((v: string) => seen.push(v), 40);
  d('a');
  d('ab');
  d('abc');
  expect(seen).toEqual([]);
  await sleep(60);
  expect(seen).toEqual(['abc']);

  d('cancelled');
  d.cancel();
  await sleep(60);
  expect(seen).toEqual(['abc']);
});

test('throttle runs leading immediately and flushes latest trailing call', async () => {
  const seen: number[] = [];
  const t = throttle((n: number) => seen.push(n), 50);
  t(1);
  t(2);
  t(3);
  expect(seen).toEqual([1]); // leading fired synchronously!
  await sleep(70);
  expect(seen).toEqual([1, 3]); // trailing flushed latest arg (3), skipping 2!
});`,
      hints: [
        { vi: 'Ở `debounce`, `clearTimeout(timer)` trước rồi mới `setTimeout`, và `cancel()` cũng clear rồi đặt `timer = undefined`.', en: 'In `debounce`, clear previous timer on every call and inside `.cancel()`.' },
        { vi: 'Ở `throttle`, tính `remaining = wait - (now - lastRun)`. Nếu `remaining <= 0` chạy ngay; ngược lại lưu `pendingArgs = args` và lên lịch timer sau `remaining` ms nếu chưa có timer.', en: 'In `throttle`, compute `remaining = wait - (now - lastRun)`. Fire immediately when `remaining <= 0`; else store `pendingArgs` and schedule one timer for `remaining` ms.' },
      ],
    },
    quiz: [
      {
        id: 'q-pdeb-1',
        topicId: 'perf-debounce-throttle',
        categoryId: 'performance',
        question: { vi: 'Điểm khác biệt trực tiếp giữa Debounce và Throttle khi sự kiện scroll bắn liên tục trong 3 giây với wait = 200ms là gì?', en: 'During 3 seconds of continuous scrolling with a 200ms wait, how do Debounce and Throttle differ?' },
        options: [
          { vi: 'Throttle chạy đều đặn khoảng 15 lần (mỗi 200ms một lần), còn Debounce chỉ chạy 1 lần sau khi ngừng cuộn 200ms.', en: 'Throttle fires periodically (~15 times, once per 200ms), while trailing Debounce fires only once 200ms after scrolling stops.' },
          { vi: 'Debounce chạy 15 lần còn Throttle chỉ chạy 1 lần.', en: 'Debounce runs 15 times and Throttle runs once.' },
          { vi: 'Cả hai đều chạy 0 lần.', en: 'Both run 0 times.' },
          { vi: 'Cả hai chạy đồng bộ mỗi 1ms.', en: 'Both run every 1ms.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Debounce trì hoãn đến khi hết chuỗi sự kiện liên tiếp; Throttle giới hạn tốc độ thực thi định kỳ.',
          en: 'Debounce waits for idle quiet periods; throttle enforces a steady max invocation cadence.',
        },
      },
      {
        id: 'q-pdeb-2',
        topicId: 'perf-debounce-throttle',
        categoryId: 'performance',
        question: { vi: 'Khi viết throttle cần cập nhật UI mượt theo cuộn chuột/kéo thả, công cụ nào của trình duyệt khớp chuẩn nhịp vẽ màn hình?', en: 'Which browser scheduling API makes an ideal animation/scroll throttle aligned to monitor refresh rates?' },
        options: [
          { vi: 'requestAnimationFrame (rAF)', en: 'requestAnimationFrame (rAF)' },
          { vi: 'setInterval(fn, 1)', en: 'setInterval(fn, 1)' },
          { vi: 'document.write()', en: 'document.write()' },
          { vi: 'alert()', en: 'alert()' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`requestAnimationFrame` tự động chạy ngay trước pha Layout/Paint của mỗi frame (~16.6ms ở 60Hz, ~8.3ms ở 120Hz).',
          en: '`requestAnimationFrame` coalesces updates cleanly once per display vsync frame before paint.',
        },
      },
    ],
    relatedTopicIds: ['net-debounce-throttle', 'reflows-repaints', 'core-web-vitals'],
  },

  {
    ...TOPIC_META_MAP['perf-optimistic-updates'],
    mentalModel: {
      vi: 'Tốc độ cảm nhận (Perceived Performance) quan trọng không kém tốc độ thực: dù mất 400ms đi mạng, giao diện chuyển trạng thái ngay trong <16ms khiến não người dùng cảm giác ứng dụng "nhanh tức thì".',
      en: 'Perceived performance matters as much as raw wire speed: immediate <16ms local feedback makes a 400ms roundtrip feel instantaneous to users.',
    },
    keyPoints: [
      { vi: 'Ngưỡng cảm nhận của con người (RAIL): <100ms thấy tức thì; 100–300ms bắt đầu thấy khựng; >1000ms mất tập trung.', en: 'Human RAIL perception thresholds: <100ms feels instantaneous; >300ms feels sluggish without immediate UI response.' },
      { vi: 'Kết hợp Optimistic UI với React `useOptimistic` / `useTransition` để giữ luồng nhập liệu không bị block.', en: 'Pair optimistic local projections with React transitions so typing or scrolling never stutters during sync.' },
      { vi: 'Luôn hiển thị tiến trình tinh tế khi mutation chưa settle xong nếu user sắp đóng tab (`beforeunload` guard).', en: 'Indicate subtle pending sync state if the user tries to close the tab before background saves finish.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Tạo cảm giác phản hồi tức thời cho tác vụ tương tác lặp đi lặp lại (checkbox, star, comment draft, reorder list).', en: 'Frequent interactive actions such as checkboxes, reactions, reorder handles, and quick notes.' },
      ],
      whenToAvoid: [
        { vi: 'Hành động cần kết quả tính toán phức tạp từ server mà client không thể đoán trước (vd báo giá thuế, kiểm tra coupon).', en: 'Flows depending on authoritative server calculations the client cannot predict accurately (tax, coupon validation).' },
      ],
    },
    pitfalls: [
      { vi: 'Optimistic update thành công giả nhưng quên xử lý lỗi rollback âm thầm làm user tưởng đã lưu rồi mất sạch dữ liệu.', en: 'Applying optimistic state without visible error rollback tricks users into thinking failed saves persisted.' },
    ],
    interviewTips: [
      { vi: 'Liên kết khái niệm Optimistic Updates với chỉ số INP (Interaction to Next Paint <= 200ms) và RAIL model trong câu trả lời Performance!', en: 'Tie optimistic feedback directly to sub-100ms perceived speed and keeping INP well below 200ms.' },
    ],
    example: {
      title: { vi: 'Optimistic Todo List với Pending Indicator & Undo Rollback', en: 'Optimistic Task Creator w/ Instant Feedback' },
      description: { vi: 'Thêm công việc mới: item xuất hiện ngay tại 0ms ở trạng thái syncing rồi xác nhận ID thật từ server.', en: 'Add a task to see immediate 0ms insertion with pending status, then confirmed server ID reconciliation.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

interface Task { id: string; text: string; pending?: boolean }

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([{ id: 'srv-1', text: 'Measure Core Web Vitals' }]);
  const [input, setInput] = useState('');

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = input.trim();
    if (!label) return;
    setInput('');
    const tempId = 'temp-' + Date.now();
    // Instant <16ms optimistic insert
    setTasks((prev) => [...prev, { id: tempId, text: label, pending: true }]);

    await new Promise((r) => setTimeout(r, 550));
    const serverId = 'srv-' + Math.floor(Math.random() * 900 + 100);
    setTasks((prev) => prev.map((t) => (t.id === tempId ? { id: serverId, text: label, pending: false } : t)));
  };

  return (
    <form onSubmit={addTask} className="col">
      <div className="row">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add task (0ms UI response)..." style={{ flex: 1 }} />
        <button type="submit" className="primary">Add</button>
      </div>
      <div className="col">
        {tasks.map((task) => (
          <div key={task.id} className="card row" style={{ justifyContent: 'space-between', opacity: task.pending ? 0.65 : 1 }}>
            <span>{task.text}</span>
            <span className="badge">{task.pending ? 'Syncing...' : task.id}</span>
          </div>
        ))}
      </div>
    </form>
  );
}`,
      tryItPrompt: { vi: 'Thử thêm liên tiếp 2–3 task nhanh trong lúc đang syncing để quan sát từng task chuyển dần từ tempId sang serverId.', en: 'Submit 2-3 tasks rapidly and watch each reconcile independently from tempId to serverId.' },
    },
    quiz: [
      {
        id: 'q-popt-1',
        topicId: 'perf-optimistic-updates',
        categoryId: 'performance',
        question: { vi: 'Theo mô hình RAIL của Google, phản hồi giao diện dưới ngưỡng nào mang lại cảm giác "tức thì" (instantaneous)?', en: 'Under the Google RAIL model, what interaction response time feels instantaneous to humans?' },
        options: [
          { vi: 'Dưới 100ms (và khung hình dưới 16ms).', en: 'Under 100ms.' },
          { vi: 'Dưới 2 giây.', en: 'Under 2 seconds.' },
          { vi: 'Từ 3–5 giây.', en: '3 to 5 seconds.' },
          { vi: '10 giây.', en: '10 seconds.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Phản hồi <100ms kết nối trực tiếp hành động người dùng với thay đổi trên màn hình không cần spinner trung gian.',
          en: 'Responses under 100ms feel directly caused by the user interaction without waiting.',
        },
      },
      {
        id: 'q-popt-2',
        topicId: 'perf-optimistic-updates',
        categoryId: 'performance',
        question: { vi: 'Optimistic Update cải thiện trực tiếp chỉ số nào về mặt cảm nhận?', en: 'Which Core Web Vital / UX dimension does Optimistic Update primarily improve?' },
        options: [
          { vi: 'Interaction responsiveness (INP & perceived latency sau khi tương tác).', en: 'Interaction responsiveness (INP and perceived UI latency).' },
          { vi: 'Dung lượng file ảnh JPEG trên CDN.', en: 'CDN JPEG file compression.' },
          { vi: 'Thời gian DNS lookup.', en: 'DNS resolution speed.' },
          { vi: 'Số lượng thẻ heading SEO.', en: 'SEO heading count.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Cập nhật UI ngay thay vì khóa giao diện chờ API 400ms giúp giữ phản hồi mượt mà và INP thấp.',
          en: 'Immediate DOM state updates avoid stalling next-paint responsiveness on network latencies.',
        },
      },
    ],
    relatedTopicIds: ['net-optimistic-updates', 'core-web-vitals', 'ui-states'],
  },

  {
    ...TOPIC_META_MAP['caching-memoizing'],
    mentalModel: {
      vi: 'Không bao giờ tính lại một phép toán đắt đỏ khi đầu vào y hệt lần trước — ghi kết quả vào sổ tay (Memoization Map), và đặt giới hạn trang sổ theo nguyên lý LRU (Least Recently Used) để không tràn RAM.',
      en: 'Cache expensive deterministic computations by input key, and bound cache capacity using an LRU (Least Recently Used) eviction policy so heap memory stays predictable.',
    },
    keyPoints: [
      { vi: 'JavaScript `Map` giữ nguyên thứ tự chèn (`insertion order`) nên cài đặt **LRU Cache O(1)** cực kỳ gọn bằng `delete` rồi `set` khi truy cập hit!', en: 'JavaScript `Map` preserves insertion order, enabling an O(1) LRU cache via `delete(key)` + `set(key, val)` on hits.' },
      { vi: 'Selector Memoization (Reselect / `useMemo`): tránh `array.filter().map()` tạo tham chiếu mảng mới mỗi lần render khiến component con tốn công re-render.', en: 'Memoized selectors preserve referential equality for derived lists so downstream memoized children skip re-renders.' },
      { vi: 'Đừng bọc `useMemo`/`React.memo` một cách mù quáng cho mọi phép cộng đơn giản — chi phí so sánh props/memory đôi khi lớn hơn render lại trực tiếp!', en: 'Do not wrap trivial primitives in `useMemo` blindly; profile costly transforms or unstable object references first.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Filter/Sort/Search tập dữ liệu lớn ở client, parse Markdown/AST, tính layout bảng phức tạp, giữ ổn định reference truyền cho `React.memo`.', en: 'Heavy filtering/sorting, markdown/AST parsing, expensive layout math, and stabilizing props for heavy subtrees.' },
      ],
      whenToAvoid: [
        { vi: 'Memoization không giới hạn kích thước (unbounded `new Map()`) trong session chạy dài -> chính nó trở thành Memory Leak!', en: 'Unbounded memoization maps in long-lived sessions silently leak heap memory; always bound size with LRU or WeakMap.' },
      ],
    },
    pitfalls: [
      { vi: 'Truyền inline object `{ filter: true }` hoặc `() => {}` vào component đã bọc `React.memo` làm `memo` mất hoàn toàn tác dụng.', en: 'Passing fresh inline objects or arrow callbacks defeats `React.memo` shallow prop comparisons.' },
    ],
    interviewTips: [
      { vi: 'Nhớ mẹo cài LRU O(1) chỉ bằng JavaScript `Map` (`cache.keys().next().value` lấy ngay phần tử cũ nhất để xóa) — thường xuyên xuất hiện trong phỏng vấn Frontend!', en: 'Remember ES6 `Map` preserves insertion order, making O(1) LRU eviction (`map.keys().next().value`) clean without writing a manual doubly-linked list.' },
    ],
    example: {
      title: { vi: 'Cài đặt O(1) LRU Memoization bằng JavaScript Map', en: 'O(1) LRU Cache & Memoization Timing Demo' },
      description: { vi: 'Đo tốc độ tính toán trước và sau khi memoize kết hợp quan sát cơ chế đuổi phần tử ít dùng nhất (LRU).', en: 'Compare uncached vs memoized timings and watch Map-based LRU eviction in action.' },
      mode: 'ts',
      code: `function createLRU<K, V>(capacity: number) {
  const map = new Map<K, V>();
  return {
    get(key: K): V | undefined {
      if (!map.has(key)) return undefined;
      const val = map.get(key)!;
      // Refresh recency to tail of Map
      map.delete(key);
      map.set(key, val);
      return val;
    },
    set(key: K, val: V) {
      if (map.has(key)) map.delete(key);
      else if (map.size >= capacity) {
        const oldest = map.keys().next().value!;
        map.delete(oldest);
        console.log('[LRU Evicted]:', oldest);
      }
      map.set(key, val);
    },
    keys: () => Array.from(map.keys()),
  };
}

const lru = createLRU<string, number>(3);
lru.set('A', 1);
lru.set('B', 2);
lru.set('C', 3);
lru.get('A'); // A becomes most-recently-used -> B is now oldest!
lru.set('D', 4); // Should evict B
console.log('Active cache keys (oldest -> newest):', lru.keys());`,
      tryItPrompt: { vi: 'Thử bỏ dòng `lru.get("A")` để thấy phần tử bị đuổi chuyển thành `"A"` thay vì `"B"`.', en: 'Comment out `lru.get("A")` to verify `"A"` becomes the evicted oldest key instead of `"B"`.' },
    },
    challenge: {
      id: 'challenge-memoize-lru',
      topicId: 'caching-memoizing',
      categoryId: 'performance',
      title: { vi: 'Cài đặt hàm memoizeWithLRU (O(1) Eviction)', en: 'Implement memoizeWithLRU' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm `memoizeWithLRU<A extends unknown[], R>(fn: (...args: A) => R, options: { maxSize: number; keyResolver?: (...args: A) => string })` trả về hàm đã được memoize. Cache hits phải cập nhật vị trí mới nhất (most recently used) trong LRU cache kích thước tối đa `maxSize` (>=1), không tính lại `fn`.',
        en: 'Implement `memoizeWithLRU<A extends unknown[], R>(fn, { maxSize, keyResolver? })`. Cache results up to `maxSize` using LRU eviction: cache hits return the cached value without calling `fn` and promote the key to most-recently-used.',
      },
      starterCode: `export function memoizeWithLRU<A extends unknown[], R>(
  fn: (...args: A) => R,
  options: { maxSize: number; keyResolver?: (...args: A) => string }
): (...args: A) => R {
  // TODO: implement Map-based LRU cache memoization
  return (...args: A) => fn(...args);
}`,
      solutionCode: `export function memoizeWithLRU<A extends unknown[], R>(
  fn: (...args: A) => R,
  options: { maxSize: number; keyResolver?: (...args: A) => string }
): (...args: A) => R {
  const { maxSize, keyResolver = (...args: A) => JSON.stringify(args) } = options;
  const cache = new Map<string, R>();

  return (...args: A): R => {
    const key = keyResolver(...args);
    if (cache.has(key)) {
      const value = cache.get(key)!;
      cache.delete(key);
      cache.set(key, value);
      return value;
    }

    const result = fn(...args);
    if (maxSize > 0) {
      if (cache.size >= maxSize) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) cache.delete(oldestKey);
      }
      cache.set(key, result);
    }
    return result;
  };
}`,
      testCode: `test('caches results and evicts least-recently-used entry when full', () => {
  let runs = 0;
  const square = memoizeWithLRU((n: number) => {
    runs += 1;
    return n * n;
  }, { maxSize: 2 });

  expect(square(2)).toBe(4);
  expect(square(3)).toBe(9);
  expect(square(2)).toBe(4); // hit! promotes key 2; key 3 is now oldest
  expect(runs).toBe(2);

  expect(square(4)).toBe(16); // evicts 3, keeps 2 and 4
  expect(runs).toBe(3);

  expect(square(2)).toBe(4); // still cached!
  expect(runs).toBe(3);

  expect(square(3)).toBe(9); // recomputed because 3 was evicted
  expect(runs).toBe(4);
});`,
      hints: [
        { vi: 'Mặc định `keyResolver` có thể dùng `JSON.stringify(args)`.', en: 'Default `keyResolver` to `(...args) => JSON.stringify(args)`.' },
        { vi: 'Khi cache hit, nhớ gọi `cache.delete(key); cache.set(key, value);` để đẩy phần tử lên cuối (mới nhất), vì `cache.keys().next().value` luôn lấy phần tử đầu (cũ nhất).', en: 'Promote hits by deleting and re-inserting into `Map`; `cache.keys().next().value` yields the least-recently-used key.' },
      ],
    },
    quiz: [
      {
        id: 'q-memo-1',
        topicId: 'caching-memoizing',
        categoryId: 'performance',
        question: { vi: 'Vì sao cấu trúc `Map` chuẩn của JavaScript giúp cài đặt LRU Cache đạt O(1) rất gọn nhẹ?', en: 'Why does standard JavaScript `Map` enable an O(1) LRU cache without a custom doubly linked list?' },
        options: [
          { vi: '`Map` bảo toàn thứ tự chèn; chỉ cần `delete(k)` rồi `set(k, v)` khi hit và `map.keys().next().value` để lấy key cũ nhất.', en: '`Map` preserves insertion order; `delete` + `set` promotes on hit, and `map.keys().next().value` gives the oldest key in O(1).' },
          { vi: '`Map` tự động lưu vào localStorage.', en: 'Map persists automatically to localStorage.' },
          { vi: '`Map` tự xóa mỗi 5 giây.', en: 'Map clears itself every 5 seconds.' },
          { vi: '`Map` chỉ lưu được số nguyên.', en: 'Map only accepts integers.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Đặc tả ECMAScript đảm bảo `Map` duy trì đúng thứ tự chèn của các khóa.',
          en: 'ES6 Map iteration order directly reflects insertion/re-insertion recency.',
        },
      },
      {
        id: 'q-memo-2',
        topicId: 'caching-memoizing',
        categoryId: 'performance',
        question: { vi: 'Điều gì khiến `useMemo` hoặc `memoize` không giới hạn dung lượng (unbounded cache) trở thành rủi ro trong SPA chạy lâu?', en: 'What risk arises from unbounded memoization caches in long-lived Single Page Applications?' },
        options: [
          { vi: 'Cache phình to mãi theo thời gian không bao giờ giải phóng tạo thành Memory Leak.', en: 'Unbounded cache entries accumulate indefinitely in heap memory, causing a memory leak.' },
          { vi: 'Trình duyệt tự chuyển sang HTTP/1.0.', en: 'Browser downgrades to HTTP/1.0.' },
          { vi: 'Gây lỗi CORS.', en: 'Causes CORS errors.' },
          { vi: 'Làm mất alt text của ảnh.', en: 'Strips image alt text.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Luôn giới hạn số lượng phần tử bằng LRU (`maxSize`) hoặc dùng `WeakMap` khi key là object.',
          en: 'Always cap cache capacity via LRU eviction or use `WeakMap` keyed by object identity.',
        },
      },
    ],
    relatedTopicIds: ['caching-expiry', 'memory-leaks', 'state-lazy-loading'],
  },

  {
    ...TOPIC_META_MAP['memory-leaks'],
    mentalModel: {
      vi: 'Bộ thu gom rác (Garbage Collector) dọn dẹp mọi đối tượng không còn đường nào trỏ tới từ Root. Memory leak xảy ra khi bạn quên cắt dây neo (timer, global listener, subscription, detached DOM ref) làm GC tưởng object chết vẫn đang được dùng!',
      en: 'Memory leaks occur when forgotten references—uncleared intervals, global event listeners, closures, or detached DOM nodes—keep dead components reachable from GC roots.',
    },
    keyPoints: [
      { vi: '4 thủ phạm kinh điển ở Front End: 1) Forgotten `setInterval`/`setTimeout`, 2) `window.addEventListener` thiếu `removeEventListener` (hoặc `{ signal }`), 3) Detached DOM nodes lưu trong cache/closure, 4) Unbounded global caches/stores.', en: 'Top 4 FE leak sources: forgotten intervals, unremoved global event listeners, detached DOM references, and unbounded caches.' },
      { vi: 'Dùng `AbortController` truyền `{ signal }` vào `addEventListener` giúp dọn nhiều listener chỉ bằng một lệnh `controller.abort()` trong `useEffect` cleanup!', en: 'Pass an `AbortController.signal` to `addEventListener` so one `abort()` cleans up multiple listeners at once.' },
      { vi: 'Dùng `WeakMap` / `WeakSet` để gắn metadata lên DOM node hoặc object tạm mà không cản trở Garbage Collector thu hồi.', en: 'Use `WeakMap` / `WeakSet` to associate metadata with DOM/object instances without blocking GC.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi component đăng ký WebSocket, ResizeObserver, IntersectionObserver, timer, hoặc global keyboard shortcuts.', en: 'Every component managing timers, global listeners, sockets, or DOM observers.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng săn tối ưu vi mô vài KB trước khi kiểm chứng bằng Chrome DevTools Memory Heap Snapshot (3-snapshot technique).', en: 'Always confirm real retained heap growth via DevTools Heap Snapshots rather than guessing.' },
      ],
    },
    pitfalls: [
      { vi: 'Gọi `window.removeEventListener("resize", () => handle())` truyền một arrow function mới tinh — nó KHÔNG BAO GIỜ gỡ được listener cũ!', en: 'Passing a new inline arrow function to `removeEventListener` never removes the originally registered listener.' },
    ],
    interviewTips: [
      { vi: 'Chỉ ra cách debug Memory Leak thực tế trong phỏng vấn: "Tôi dùng Chrome DevTools Memory tab -> chụp Heap Snapshot trước/sau khi mở đóng modal 5 lần -> lọc `Detached HTMLDivElement` và kiểm tra Retainers tree!"', en: 'Describe the 3-Heap-Snapshot workflow in Chrome DevTools and filtering for `Detached` DOM nodes in Retainers.' },
    ],
    example: {
      title: { vi: 'So sánh Rò rỉ Listener vs Cleanup chuẩn bằng AbortController', en: 'Listener Leak vs AbortController Cleanup Demo' },
      description: { vi: 'Bật tắt widget liên tục và quan sát bộ đếm listener toàn cục để thấy sự khác biệt giữa có cleanup và quên cleanup.', en: 'Mount and unmount a widget repeatedly to compare leaking global handlers vs `AbortController` cleanup.' },
      mode: 'react',
      code: `import React, { useEffect, useState } from 'react';

let activeGlobalHandlers = 0;

function LeakyOrCleanWidget({ cleanMode }: { cleanMode: boolean }) {
  useEffect(() => {
    activeGlobalHandlers += 1;
    const controller = new AbortController();
    const onResize = () => {};
    window.addEventListener('resize', onResize, { signal: controller.signal });

    return () => {
      if (cleanMode) {
        controller.abort(); // Removes listener cleanly!
        activeGlobalHandlers -= 1;
      }
      // Leaky mode forgets to remove & decrement!
    };
  }, [cleanMode]);

  return <div className="badge">Widget mounted</div>;
}

export default function App() {
  const [mounted, setMounted] = useState(true);
  const [cleanMode, setCleanMode] = useState(true);
  const [, force] = useState(0);

  return (
    <div className="col">
      <div className="row">
        <label className="row" style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={cleanMode} onChange={(e) => setCleanMode(e.target.checked)} />
          <span>Proper AbortController Cleanup</span>
        </label>
        <button className="primary" onClick={() => { setMounted((m) => !m); setTimeout(() => force((n) => n + 1), 20); }}>
          {mounted ? 'Unmount Widget' : 'Mount Widget'}
        </button>
      </div>
      {mounted && <LeakyOrCleanWidget cleanMode={cleanMode} />}
      <div className="card">
        <strong>Active Global Listeners: </strong>
        <span style={{ color: activeGlobalHandlers > 1 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
          {activeGlobalHandlers}
        </span>
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Bỏ tích "Proper AbortController Cleanup" rồi bấm Mount/Unmount vài lần để xem số listener rò rỉ tăng dần!', en: 'Uncheck cleanup and toggle Mount/Unmount several times to watch leaked global listeners pile up.' },
    },
    quiz: [
      {
        id: 'q-leak-1',
        topicId: 'memory-leaks',
        categoryId: 'performance',
        question: { vi: 'Vì sao sử dụng `WeakMap` thay cho `Map` giúp phòng tránh rò rỉ bộ nhớ khi gắn cache metadata theo từng DOM Element?', en: 'How does `WeakMap` prevent memory leaks when caching metadata keyed by DOM elements?' },
        options: [
          { vi: 'Key trong `WeakMap` giữ tham chiếu yếu (weak reference), nên khi DOM element bị xóa khỏi trang và không còn chỗ nào giữ, Garbage Collector tự thu hồi nó.', en: 'WeakMap holds weak key references, allowing GC to reclaim removed DOM nodes and their entries automatically.' },
          { vi: '`WeakMap` lưu toàn bộ dữ liệu sang đĩa cứng.', en: 'WeakMap writes to disk.' },
          { vi: '`WeakMap` nén string ngắn đi.', en: 'WeakMap compresses strings.' },
          { vi: '`WeakMap` chặn DOM bị xóa.', en: 'WeakMap stops DOM removal.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Map thường giữ strong reference khiến DOM node đã gỡ khỏi màn hình (detached DOM) vẫn kẹt mãi trong RAM.',
          en: 'A standard Map strongly retains deleted DOM objects forever, whereas WeakMap lets GC collect them.',
        },
      },
      {
        id: 'q-leak-2',
        topicId: 'memory-leaks',
        categoryId: 'performance',
        question: { vi: 'Trong Chrome DevTools Memory Heap Snapshot, từ khóa nào thường chỉ ra rò rỉ DOM nghiêm trọng sau khi đóng modal hoặc chuyển trang?', en: 'In a Chrome DevTools Heap Snapshot after closing a modal or changing routes, what label flags leaked UI elements?' },
        options: [
          { vi: '`Detached` (ví dụ `Detached HTMLDivElement` — node đã rời document nhưng vẫn bị closure/listener giữ).', en: '`Detached` (e.g. `Detached HTMLDivElement` still retained by closures or listeners).' },
          { vi: '`Preloaded`.', en: '`Preloaded`.' },
          { vi: '`TreeShaken`.', en: '`TreeShaken`.' },
          { vi: '`Immutable`.', en: '`Immutable`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Detached DOM tree kéo theo toàn bộ cây phần tử con và dữ liệu liên kết nằm lại trong heap.',
          en: 'Detached elements indicate references are holding onto unmounted DOM subtrees.',
        },
      },
    ],
    relatedTopicIds: ['caching-memoizing', 'short-polling', 'list-virtualization'],
  },

  {
    ...TOPIC_META_MAP['dom-batching'],
    mentalModel: {
      vi: 'Thay vì gõ cửa sửa DOM 1.000 lần liên tiếp cho 1.000 dòng dữ liệu, hãy chuẩn bị sẵn toàn bộ cây phần tử ngoài bộ nhớ bằng `DocumentFragment` (hoặc Virtual DOM / `requestAnimationFrame`) rồi gắn vào DOM thật CHỈ MỘT LẦN!',
      en: 'Build a subtree off-screen inside a `DocumentFragment` (or buffer writes into a single `requestAnimationFrame` pass) so attaching 1,000 nodes triggers only ONE DOM mutation instead of 1,000.',
    },
    keyPoints: [
      { vi: '`document.createDocumentFragment()`: container nhẹ nằm ngoài live DOM tree; khi gọi `parent.appendChild(frag)`, toàn bộ node con chuyển sang live DOM trong 1 thao tác duy nhất.', en: '`DocumentFragment` builds nodes off-document and flushes them in a single live DOM append.' },
      { vi: 'Tách pha Đọc (`getBoundingClientRect`, `offsetHeight`) và pha Ghi (`style.width = ...`) thành 2 batch riêng biệt thay vì xen kẽ.', en: 'Group DOM reads before DOM writes (FastDOM pattern) instead of interleaving them in loops.' },
      { vi: 'Với CSS thuần không cần tạo nhiều thẻ thừa, `content-visibility: auto` giúp trình duyệt bỏ qua layout/paint các phần tử ngoài viewport.', en: 'CSS `content-visibility: auto` skips layout/paint work for off-screen blocks automatically.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Thao tác DOM vanilla tốc độ cao (canvas UI overlay, bảng dữ liệu vanilla, tooltip positioning, custom editor).', en: 'Vanilla DOM manipulation, custom rich-text editors, dynamic SVG/table rendering, and tooltip positioning.' },
      ],
      whenToAvoid: [
        { vi: 'Khi danh sách lên tới hàng chục nghìn dòng mà chỉ dùng DocumentFragment — vẫn tạo 50.000 DOM nodes; lúc đó hãy dùng **List Virtualization**!', en: 'Do not rely on `DocumentFragment` alone for 50,000 items—switch to **List Virtualization** so off-screen nodes never exist.' },
      ],
    },
    pitfalls: [
      { vi: 'Gọi `innerHTML += "<li>...</li>"` trong vòng lặp for 500 lần -> trình duyệt re-parse và phá hủy/tạo lại toàn bộ DOM con tới 500 lần!', en: 'Appending via `el.innerHTML += ...` inside a loop forces full subtree teardown and HTML re-parsing on every iteration.' },
    ],
    interviewTips: [
      { vi: 'Giải thích React đã tự động batch nhiều `setState` từ React 18 (Automatic Batching) và cập nhật DOM qua commit phase một lần — nhưng khi chạm trực tiếp DOM API vẫn phải dùng `DocumentFragment` & rAF!', en: 'Connect React 18 Automatic State Batching with low-level `DocumentFragment` and `requestAnimationFrame` read/write batching.' },
    ],
    example: {
      title: { vi: 'So sánh Naive `innerHTML +=` vs Batched `DocumentFragment`', en: 'DOM Mutation Benchmark: Loop Append vs DocumentFragment' },
      description: { vi: 'Đo trực tiếp thời gian chèn 800 dòng danh sách vào `#root` theo hai cách để thấy chênh lệch hiệu năng.', en: 'Benchmark appending 800 items individually vs batching via DocumentFragment inside the sandbox.' },
      mode: 'ts',
      code: `const host = document.getElementById('root')!;

// 1. Slow naive per-item DOM insertion
const slowBox = document.createElement('div');
host.appendChild(slowBox);
const t1 = performance.now();
for (let i = 0; i < 800; i++) {
  const row = document.createElement('span');
  row.textContent = i + ' ';
  slowBox.appendChild(row);
}
const slowMs = (performance.now() - t1).toFixed(2);
slowBox.innerHTML = '';

// 2. Batched DocumentFragment
const fastBox = document.createElement('div');
host.appendChild(fastBox);
const t2 = performance.now();
const frag = document.createDocumentFragment();
for (let i = 0; i < 800; i++) {
  const row = document.createElement('span');
  row.textContent = i + ' ';
  frag.appendChild(row);
}
fastBox.appendChild(frag);
const fastMs = (performance.now() - t2).toFixed(2);
fastBox.innerHTML = \`<div class="card"><strong>800 DOM nodes:</strong> Direct append: \${slowMs}ms vs DocumentFragment batch: \${fastMs}ms</div>\`;
console.log({ slowMs, fastMs });`,
      tryItPrompt: { vi: 'Thử nâng số dòng lên 4000 và thêm đo `offsetHeight` trong vòng lặp đầu để xem Layout Thrashing làm thời gian vọt lên gấp chục lần!', en: 'Bump the count to 4000 and read `offsetHeight` inside the first loop to observe layout thrashing.' },
    },
    challenge: {
      id: 'challenge-batch-dom',
      topicId: 'dom-batching',
      categoryId: 'performance',
      title: { vi: 'Cài đặt Read/Write DOM Batch Scheduler', en: 'Implement FastDOM-Style Batch Scheduler' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm `createDomBatcher(schedule?: (cb: () => void) => void)` gom các thao tác `measure(fn)` (pha đọc layout) và `mutate(fn)` (pha ghi DOM). Khi flush chạy (qua `schedule` mặc định `queueMicrotask`), TẤT CẢ các hàm `measure` PHẢI chạy hết trước, sau đó mới chạy TẤT CẢ các hàm `mutate`, rồi làm rỗng hàng đợi để tránh layout thrashing read-write xen kẽ!',
        en: 'Implement `createDomBatcher(schedule?)` supporting `measure(fn)` and `mutate(fn)`. When the scheduled flush runs (defaulting to `queueMicrotask`), execute ALL pending `measure` callbacks first, then ALL pending `mutate` callbacks, clearing both queues before running.',
      },
      starterCode: `export function createDomBatcher(
  schedule: (cb: () => void) => void = (cb) => queueMicrotask(cb)
) {
  // TODO: queue reads and writes separately, schedule single flush running reads then writes
  return {
    measure: (_fn: () => void): void => {},
    mutate: (_fn: () => void): void => {},
  };
}`,
      solutionCode: `export function createDomBatcher(
  schedule: (cb: () => void) => void = (cb) => queueMicrotask(cb)
) {
  let reads: Array<() => void> = [];
  let writes: Array<() => void> = [];
  let scheduled = false;

  const flush = () => {
    const readBatch = reads;
    const writeBatch = writes;
    reads = [];
    writes = [];
    scheduled = false;

    for (const r of readBatch) r();
    for (const w of writeBatch) w();
  };

  const ensureScheduled = () => {
    if (!scheduled) {
      scheduled = true;
      schedule(flush);
    }
  };

  return {
    measure(fn: () => void) {
      reads.push(fn);
      ensureScheduled();
    },
    mutate(fn: () => void) {
      writes.push(fn);
      ensureScheduled();
    },
  };
}`,
      testCode: `test('batches all reads strictly before writes in single flush', async () => {
  const order: string[] = [];
  const batch = createDomBatcher();

  batch.mutate(() => order.push('write-1'));
  batch.measure(() => order.push('read-1'));
  batch.mutate(() => order.push('write-2'));
  batch.measure(() => order.push('read-2'));

  await sleep(10);
  expect(order).toEqual(['read-1', 'read-2', 'write-1', 'write-2']);
});`,
      hints: [
        { vi: 'Tách 2 mảng `reads` và `writes`, lên lịch flush một lần duy nhất bằng cờ `scheduled`.', en: 'Maintain separate `reads` and `writes` arrays guarded by a single `scheduled` boolean.' },
        { vi: 'Trong `flush`, lặp toàn bộ `readBatch` xong rồi mới lặp `writeBatch` — dù user gọi `mutate` trước `measure`!', en: 'Drain all `reads` completely before running any `writes`, regardless of registration order.' },
      ],
    },
    quiz: [
      {
        id: 'q-domb-1',
        topicId: 'dom-batching',
        categoryId: 'performance',
        question: { vi: 'Ưu điểm của `DocumentFragment` khi cần thêm 500 phần tử mới vào danh sách DOM bằng JavaScript thuần là gì?', en: 'Why use `DocumentFragment` when inserting 500 new vanilla DOM nodes?' },
        options: [
          { vi: 'Xây dựng toàn bộ 500 nodes ngoài cây DOM hiển thị và chèn vào live DOM trong đúng 1 thao tác gắn kết.', en: 'Constructs the 500 nodes off-screen and attaches them to the live document in a single DOM mutation.' },
          { vi: 'Tự động biên dịch TypeScript.', en: 'Compiles TypeScript automatically.' },
          { vi: 'Nén hình ảnh WebP.', en: 'Compresses WebP images.' },
          { vi: 'Tắt hoàn toàn event bubbling.', en: 'Disables event bubbling.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Gắn 1 lần thay cho 500 lần chạm live DOM giảm hẳn chi phí cập nhật cây DOM và style calculation.',
          en: 'Building off-document avoids 499 redundant live DOM insertions.',
        },
      },
      {
        id: 'q-domb-2',
        topicId: 'dom-batching',
        categoryId: 'performance',
        question: { vi: 'Tại sao mẫu FastDOM luôn chạy hết mọi `measure` (đọc layout) trước khi chạy `mutate` (ghi style)?', en: 'Why do FastDOM schedulers batch all `measure` layout reads before `mutate` DOM writes?' },
        options: [
          { vi: 'Để ngăn trình duyệt bị ép tính lại Layout nhiều lần giữa chừng (tránh Layout Thrashing).', en: 'To prevent forced synchronous layouts (Layout Thrashing) caused by alternating reads and writes.' },
          { vi: 'Vì trình duyệt cấm đọc CSS sau khi sửa style.', en: 'Browsers prohibit reading styles after writing.' },
          { vi: 'Để làm code chạy chậm hơn 50ms.', en: 'To add a 50ms delay.' },
          { vi: 'Để kích hoạt CSP.', en: 'To trigger CSP.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Ghi rồi đọc ngay lập tức ép trình duyệt tính layout đồng bộ; gom đọc trước rồi ghi sau chỉ tốn tối đa 1 lượt layout.',
          en: 'Separating reads from writes collapses N forced layouts down to a single frame layout pass.',
        },
      },
    ],
    relatedTopicIds: ['reflows-repaints', 'list-virtualization', 'core-web-vitals'],
  },

  {
    ...TOPIC_META_MAP['reflows-repaints'],
    mentalModel: {
      vi: 'Pipeline vẽ pixel của trình duyệt gồm: Style -> Layout (Reflow: tính tọa độ/kích thước) -> Paint (Repaint: tô màu/viền/chữ) -> Composite (GPU ghép lớp). Chỉ chạm vào `transform` và `opacity` giúp nhảy thẳng tới bước cuối cùng Composite trên GPU!',
      en: 'Browser pixel pipeline: Style -> Layout (Reflow) -> Paint (Repaint) -> Composite. Animating only `transform` and `opacity` skips Layout & Paint entirely and runs smoothly on the GPU compositor.',
    },
    keyPoints: [
      { vi: 'Layout Thrashing (Forced Synchronous Layout): vòng lặp `for` vừa ghi `box.style.width` vừa đọc `box.offsetWidth` ép trình duyệt tính lại Layout N lần trong cùng một frame!', en: 'Layout Thrashing occurs when loops alternate DOM writes and geometric reads (`offsetHeight`, `getBoundingClientRect`), forcing N synchronous layouts per frame.' },
      { vi: 'Animate `transform: translateX(...) scale(...)` và `opacity` thay vì `left`, `top`, `width`, `height`, `margin`.', en: 'Animate compositor-only properties (`transform`, `opacity`) instead of layout-triggering `top`/`left`/`width`.' },
      { vi: 'Dùng `will-change: transform` thật tiết kiệm cho phần tử thực sự đang animate liên tục (tránh lạm dụng gây tràn VRAM GPU).', en: 'Apply `will-change: transform` sparingly to actively animating layers so GPU memory stays bounded.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi animation chuyển động, mở drawer/sheet, card hover lift, sticky headers và drag-and-drop 60/120fps.', en: 'Smooth 60/120fps drawer slides, hover lifts, sticky panels, and drag-and-drop handles.' },
      ],
      whenToAvoid: [
        { vi: 'Không gắn `will-change: transform` lên `*` hoặc hàng trăm card cùng lúc -> tạo hàng trăm compositor layer làm sập GPU mobile.', en: 'Never apply `will-change` globally or across hundreds of elements; GPU layer explosion crashes mobile memory.' },
      ],
    },
    pitfalls: [
      { vi: 'Đọc `element.getBoundingClientRect()`, `scrollTop`, `offsetWidth`, `getComputedStyle()` ngay sau khi sửa class/style là nguyên nhân #1 gây tụt FPS và INP cao.', en: 'Reading layout metrics right after mutating classes or inline styles forces immediate layout recalculation.' },
    ],
    interviewTips: [
      { vi: 'Kể vanh vách thứ tự Pixel Pipeline (`JS -> Style -> Layout -> Paint -> Composite`) và liệt kê được tối thiểu 4 thuộc tính gây Reflow (`offsetHeight`, `clientWidth`, `scrollTop`, `getBoundingClientRect`).', en: 'Recite the Pixel Pipeline (`JS -> Style -> Layout -> Paint -> Composite`) and name geometric getters that force synchronous layout.' },
    ],
    example: {
      title: { vi: 'So sánh CSS Layout `left` vs GPU Composite `transform`', en: 'Reflow (`left`) vs GPU Composite (`transform`) Demo' },
      description: { vi: 'Thử chạy animation hai thanh song song bằng HTML/CSS thuần và xem giải thích pipeline từng thanh.', en: 'Inspect live CSS comparing layout-triggering `left` animation vs compositor-only `transform` animation.' },
      mode: 'html',
      code: `<div class="col">
  <div class="card">
    <div style="font-size:12px;margin-bottom:6px;">❌ Triggers Layout + Paint every frame (<code>left</code>)</div>
    <div class="track"><div class="box bad"></div></div>
  </div>
  <div class="card">
    <div style="font-size:12px;margin-bottom:6px;">✅ GPU Compositor only (<code>transform: translateX</code>)</div>
    <div class="track"><div class="box good"></div></div>
  </div>
</div>`,
      css: `
.track { position: relative; height: 32px; background: rgba(148,163,184,.12); border-radius: 6px; overflow: hidden; }
.box { position: absolute; top: 4px; width: 44px; height: 24px; border-radius: 4px; }
.bad { left: 4px; background: #ef4444; animation: move-left 1.8s ease-in-out infinite alternate; }
.good { left: 4px; background: #22c55e; will-change: transform; animation: move-transform 1.8s ease-in-out infinite alternate; }
@keyframes move-left { from { left: 4px; } to { left: calc(100% - 48px); } }
@keyframes move-transform { from { transform: translateX(0); } to { transform: translateX(220px); } }
`,
      tryItPrompt: { vi: 'Thử mở tab Interactive Lab ("Core Web Vitals") để đo thời gian Layout Thrashing (ms) trực tiếp bằng JS!', en: 'Switch to the Core Web Vitals Interactive Lab tab to benchmark Layout Thrashing vs Batched DOM reads!' },
    },
    quiz: [
      {
        id: 'q-reflow-1',
        topicId: 'reflows-repaints',
        categoryId: 'performance',
        question: { vi: 'Cặp thuộc tính CSS nào sau đây KHÔNG kích hoạt Layout (Reflow) lẫn Paint mà chạy thẳng trên bước Composite?', en: 'Which CSS properties skip both Layout (Reflow) and Paint to animate purely on the GPU Compositor?' },
        options: [
          { vi: '`transform` và `opacity`', en: '`transform` and `opacity`' },
          { vi: '`width` và `height`', en: '`width` and `height`' },
          { vi: '`top` và `left`', en: '`top` and `left`' },
          { vi: '`padding` và `margin`', en: '`padding` and `margin`' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Thay đổi `transform` và `opacity` trên phần tử đã có layer chỉ đòi hỏi GPU di chuyển/pha trộn texture sẵn có.',
          en: 'Compositor layers transform and alpha-blend existing textures directly on the GPU.',
        },
      },
      {
        id: 'q-reflow-2',
        topicId: 'reflows-repaints',
        categoryId: 'performance',
        question: { vi: 'Đoạn code JS nào gây ra hiện tượng "Layout Thrashing" nghiêm trọng nhất?', en: 'Which JS loop pattern triggers severe Layout Thrashing?' },
        options: [
          { vi: 'Trong vòng lặp `for`, vừa đọc `el.offsetWidth` vừa gán `el.style.width = ...` liên tiếp cho 100 phần tử.', en: 'Reading `el.offsetWidth` immediately after mutating `el.style.width` across a 100-item loop.' },
          { vi: 'Đọc hết `offsetWidth` của 100 phần tử vào mảng, sau đó mới chạy vòng lặp thứ 2 để gán `style.width`.', en: 'Reading all 100 widths in loop 1, then writing all 100 styles in loop 2.' },
          { vi: 'Dùng `Array.prototype.map` trên dữ liệu JSON.', en: 'Mapping over pure JSON arrays.' },
          { vi: 'Dùng `console.log`.', en: 'Calling `console.log`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Ghi làm layout bị đánh dấu dirty; đọc ngay sau đó ép trình duyệt tính lại toàn bộ layout đồng bộ 100 lần thay vì 1 lần.',
          en: 'Interleaved writes invalidate layout and immediate geometric reads force synchronous recalculations on every iteration.',
        },
      },
    ],
    relatedTopicIds: ['dom-batching', 'core-web-vitals', 'list-virtualization'],
  },

  {
    ...TOPIC_META_MAP['perf-adaptive-loading'],
    mentalModel: {
      vi: 'Cung cấp trải nghiệm cơ bản nhanh mượt cho máy RAM 2GB mạng 3G, và tự động nâng cấp lên phiên bản giàu tính năng (video auto-play, mô hình 3D, prefetch mạnh tay) cho máy mạnh mạng Wi-Fi/5G!',
      en: 'Deliver a lean, fast baseline experience everywhere, then progressively enhance rich media, 3D viewers, or aggressive prefetching only on capable devices and fast connections.',
    },
    keyPoints: [
      { vi: 'Dựa vào các tín hiệu trình duyệt: `navigator.connection.effectiveType` (4g/3g/2g), `navigator.connection.saveData`, `navigator.hardwareConcurrency` (CPU cores), `navigator.deviceMemory` (RAM GB).', en: 'Read browser hardware/network signals: `effectiveType`, `saveData`, `hardwareConcurrency`, and `deviceMemory`.' },
      { vi: 'Tôn trọng tuyệt đối `saveData === true` và `prefers-reduced-motion: reduce`: tắt video tự phát, giảm chất lượng ảnh và không tải trước thừa.', en: 'Always honor `saveData === true` and `prefers-reduced-motion`: disable auto-play videos and speculative prefetches.' },
      { vi: 'Luôn có giá trị fallback an toàn khi trình duyệt (như Safari/Firefox) không hỗ trợ `navigator.connection` hoặc `deviceMemory`.', en: 'Provide graceful defaults because Safari/Firefox omit `navigator.connection` or `deviceMemory`.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Thương mại điện tử có 3D viewer / video review, mạng xã hội phục vụ thị trường mới nổi mạng yếu, streaming player.', en: 'Global consumer apps, e-commerce 3D previews, and video platforms spanning high-end desktops and budget 3G phones.' },
      ],
      whenToAvoid: [
        { vi: 'Không khóa các chức năng nghiệp vụ cốt lõi (mua hàng, xem chi tiết) dựa trên deviceMemory — chỉ hạ cấp phần nặng không thiết yếu (video -> ảnh tĩnh).', en: 'Never block core functionality on weak devices; downgrade heavy enhancements (3D/autoplay) while preserving core utility.' },
      ],
    },
    pitfalls: [
      { vi: 'Truy cập `navigator.connection.saveData` không optional chaining `?.` làm crash TypeError trên Safari/iOS!', en: 'Accessing `navigator.connection.saveData` without optional chaining throws TypeError on Safari/Firefox.' },
    ],
    interviewTips: [
      { vi: 'Nêu rõ sự kết hợp với Dynamic `import()`: chỉ `import("./Heavy3DViewer")` khi `effectiveType === "4g" && !saveData && deviceMemory >= 4`!', en: 'Pair Adaptive Loading with dynamic `import()`: load heavy WebGL/video modules only when network and RAM budgets permit.' },
    ],
    example: {
      title: { vi: 'Bộ quyết định Adaptive Tier Engine', en: 'Adaptive Loading Policy Evaluator' },
      description: { vi: 'Kiểm thử hàm phân tầng trải nghiệm (Lite / Standard / Rich) theo thông số mạng và phần cứng thiết bị.', en: 'Evaluate device RAM, CPU cores, effectiveType, and Save-Data into Lite, Standard, or Rich tiers.' },
      mode: 'ts',
      code: `interface DeviceSignals {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  saveData?: boolean;
  deviceMemoryGB?: number;
  cores?: number;
}

function getExperienceTier(sig: DeviceSignals) {
  if (sig.saveData || sig.effectiveType === '2g' || sig.effectiveType === 'slow-2g') {
    return { tier: 'LITE', videoAutoplay: false, imageQuality: 55, prefetch: false };
  }
  if (sig.effectiveType === '3g' || (sig.deviceMemoryGB ?? 4) <= 2) {
    return { tier: 'STANDARD', videoAutoplay: false, imageQuality: 75, prefetch: false };
  }
  return { tier: 'RICH', videoAutoplay: true, imageQuality: 90, prefetch: true };
}

console.log('Budget phone 3G:', getExperienceTier({ effectiveType: '3g', deviceMemoryGB: 2 }));
console.log('Save-Data ON:', getExperienceTier({ effectiveType: '4g', saveData: true }));
console.log('Desktop 4G/8GB:', getExperienceTier({ effectiveType: '4g', deviceMemoryGB: 8, cores: 8 }));`,
      tryItPrompt: { vi: 'Thử mở console kiểm tra xem tín hiệu trình duyệt hiện tại của bạn đang báo `navigator.hardwareConcurrency` bao nhiêu.', en: 'Log your current browser `navigator.hardwareConcurrency` and test a custom condition.' },
    },
    quiz: [
      {
        id: 'q-adapt-1',
        topicId: 'perf-adaptive-loading',
        categoryId: 'performance',
        question: { vi: 'Điều gì bắt buộc phải làm khi đọc `navigator.connection` hoặc `navigator.deviceMemory`?', en: 'What defensive check is mandatory when reading `navigator.connection` or `navigator.deviceMemory`?' },
        options: [
          { vi: 'Kiểm tra tồn tại (`?.`) và có giá trị mặc định vì Safari và Firefox không hỗ trợ đầy đủ API này.', en: 'Use optional chaining (`?.`) and graceful fallbacks because Safari and Firefox omit these APIs.' },
          { vi: 'Chặn không cho Safari vào trang web.', en: 'Block Safari visitors entirely.' },
          { vi: 'Lưu thẳng vào CSS.', en: 'Store them in CSS.' },
          { vi: 'Ép user bật 5G bằng JS.', en: 'Force 5G via JS.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Network Information API và Device Memory API không có mặt trên mọi trình duyệt (đặc biệt Safari vì privacy fingerprinting).',
          en: 'Privacy-conscious browsers omit fingerprinting signals, so feature detection + fallbacks are essential.',
        },
      },
      {
        id: 'q-adapt-2',
        topicId: 'perf-adaptive-loading',
        categoryId: 'performance',
        question: { vi: 'Khi `navigator.connection?.saveData === true`, ứng dụng NÊN hành xử thế nào?', en: 'How should an app respond when `navigator.connection?.saveData === true`?' },
        options: [
          { vi: 'Tắt tự phát video, ngừng prefetch ngầm và phục vụ ảnh độ phân giải nhẹ hơn.', en: 'Disable video autoplay, suppress background prefetching, and request lighter image variants.' },
          { vi: 'Tăng chất lượng video lên 4K.', en: 'Upgrade video to 4K.' },
          { vi: 'Tải trước toàn bộ 20 trang khác.', en: 'Prefetch 20 future routes.' },
          { vi: 'Reload trang mỗi 5 giây.', en: 'Reload every 5 seconds.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`Save-Data` biểu thị chủ đích rõ ràng của người dùng muốn tiết kiệm dung lượng dữ liệu di động.',
          en: '`Save-Data` explicitly opts into minimal bandwidth usage.',
        },
      },
    ],
    relatedTopicIds: ['image-adaptive-loading', 'preloading-prefetching', 'compression'],
  },

  {
    ...TOPIC_META_MAP['core-web-vitals'],
    mentalModel: {
      vi: '3 thước đo trải nghiệm thực tế của Google: **LCP** (Tải nội dung chính có nhanh không? <= 2.5s), **INP** (Bấm vào nút màn hình có phản hồi liền không? <= 200ms), và **CLS** (Trang có bị nhảy giật lung tung lúc đang đọc không? <= 0.1).',
      en: 'Google’s 3 field UX metrics: **LCP** (loading speed <= 2.5s), **INP** (interaction responsiveness across the session <= 200ms), and **CLS** (visual layout stability <= 0.1).',
    },
    keyPoints: [
      { vi: 'LCP (Largest Contentful Paint <= 2.5s): tối ưu TTFB (SSR/CDN), bỏ render-blocking CSS/JS, gắn `fetchpriority="high"` & `loading="eager"` cho ảnh Hero.', en: 'LCP <= 2.5s: cut TTFB via CDN/SSR, clear render-blocking scripts, and set `fetchpriority="high"` on the hero asset.' },
      { vi: 'INP (Interaction to Next Paint <= 200ms — đã thay thế FID): chia nhỏ Long Tasks >50ms trên Main Thread (`scheduler.yield()` / Web Workers), tối ưu event handlers và tránh layout thrashing.', en: 'INP <= 200ms (replaced FID): break up >50ms long tasks, offload heavy compute to Web Workers, and keep event handlers snappy.' },
      { vi: 'CLS (Cumulative Layout Shift <= 0.1): luôn đặt `width`/`height` (hoặc `aspect-ratio`) cho ảnh/video/quảng cáo/skeleton, tránh chèn banner phía trên nội dung đang đọc.', en: 'CLS <= 0.1: reserve dimensions for media, embeds, ads, and skeletons, and animate solely via `transform`.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Giám sát thực tế (RUM - Real User Monitoring qua thư viện `web-vitals` ở p75 người dùng thật) chứ không chỉ chấm Lighthouse trên máy dev khỏe!', en: 'Monitor 75th-percentile Real User Monitoring (RUM) metrics in production via `web-vitals`, not just local lab scores.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng chạy theo 100 điểm Lighthouse lab rồi làm hỏng trải nghiệm thực tế (vd trì hoãn hydrate quá lâu khiến INP thực tế tệ hại).', en: 'Do not game synthetic Lighthouse runs at the expense of real-user INP responsiveness.' },
      ],
    },
    pitfalls: [
      { vi: 'Chỉ đo Lighthouse trên MacBook M3 Wi-Fi cáp quang (Lab Data) mà bỏ qua dữ liệu p75 thiết bị Android tầm trung mạng 4G chập chờn (CrUX Field Data).', en: 'Relying purely on fast laptop Lab tests instead of p75 CrUX Field Data hides mobile INP and LCP regressions.' },
    ],
    interviewTips: [
      { vi: 'Nắm chắc cả 3 con số p75 ngưỡng Good (`LCP <= 2.5s`, `INP <= 200ms`, `CLS <= 0.1`) và nhớ nhấn mạnh INP đo **tất cả tương tác suốt phiên** (khác FID ngày xưa chỉ đo cú click đầu tiên)!', en: 'State exact p75 thresholds (LCP <= 2.5s, INP <= 200ms, CLS <= 0.1) and explain why INP replaced FID (full-session responsiveness including paint, not just first input delay).' },
    ],
    example: {
      title: { vi: 'Đánh giá Ngưỡng Core Web Vitals & Bộ chia Long Task', en: 'CWV Scorer & Long-Task Yielding Demo' },
      description: { vi: 'Chạy giả lập chấm điểm p75 LCP/INP/CLS và thử nghiệm chia nhỏ công việc nặng khỏi Main Thread.', en: 'Score telemetry metrics against Google Good/Needs-Improvement/Poor thresholds interactively.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

function grade(val: number, good: number, poor: number) {
  if (val <= good) return { label: 'GOOD', color: '#22c55e' };
  if (val <= poor) return { label: 'NEEDS WORK', color: '#eab308' };
  return { label: 'POOR', color: '#ef4444' };
}

export default function App() {
  const [lcp, setLcp] = useState(1.9);
  const [inp, setInp] = useState(140);
  const [cls, setCls] = useState(0.04);

  const lcpGrade = grade(lcp, 2.5, 4.0);
  const inpGrade = grade(inp, 200, 500);
  const clsGrade = grade(cls, 0.1, 0.25);

  return (
    <div className="col">
      <div className="card col">
        <label>LCP (Loading): <strong>{lcp}s</strong> <span style={{ color: lcpGrade.color }}>({lcpGrade.label})</span>
          <input type="range" min="0.5" max="5" step="0.1" value={lcp} onChange={(e) => setLcp(+e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>INP (Responsiveness): <strong>{inp}ms</strong> <span style={{ color: inpGrade.color }}>({inpGrade.label})</span>
          <input type="range" min="30" max="600" step="10" value={inp} onChange={(e) => setInp(+e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>CLS (Visual Stability): <strong>{cls}</strong> <span style={{ color: clsGrade.color }}>({clsGrade.label})</span>
          <input type="range" min="0" max="0.4" step="0.01" value={cls} onChange={(e) => setCls(+e.target.value)} style={{ width: '100%' }} />
        </label>
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Mở tab Interactive Lab bên cạnh để trải nghiệm mô phỏng lỗi CLS thực tế (ảnh thiếu height), Main-Thread Block (INP), và Layout Thrashing!', en: 'Open the Interactive Lab tab to trigger live CLS layout shifts, Main-Thread INP blocks, and thrashing!' },
    },
    quiz: [
      {
        id: 'q-cwv-1',
        topicId: 'core-web-vitals',
        categoryId: 'performance',
        question: { vi: 'Bộ 3 ngưỡng đạt chuẩn "Good" (p75) của Core Web Vitals hiện hành là gì?', en: 'What are Google’s "Good" thresholds (at p75) for the three Core Web Vitals?' },
        options: [
          { vi: 'LCP <= 2.5s, INP <= 200ms, CLS <= 0.1', en: 'LCP <= 2.5s, INP <= 200ms, CLS <= 0.1' },
          { vi: 'LCP <= 5.0s, INP <= 1000ms, CLS <= 0.5', en: 'LCP <= 5.0s, INP <= 1000ms, CLS <= 0.5' },
          { vi: 'FCP <= 10s, TTI <= 8s, CLS <= 1.0', en: 'FCP <= 10s, TTI <= 8s, CLS <= 1.0' },
          { vi: 'TTFB <= 4s, FID <= 500ms, CLS <= 0.4', en: 'TTFB <= 4s, FID <= 500ms, CLS <= 0.4' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Google đánh dấu đạt chuẩn khi 75% lượt truy cập thực tế đạt LCP <= 2.5s, INP <= 200ms và CLS <= 0.1.',
          en: 'Pages pass Core Web Vitals when p75 field traffic meets LCP <= 2.5s, INP <= 200ms, and CLS <= 0.1.',
        },
      },
      {
        id: 'q-cwv-2',
        topicId: 'core-web-vitals',
        categoryId: 'performance',
        question: { vi: 'Biện pháp hiệu quả nhất để ngăn hình ảnh hoặc banner quảng cáo tải muộn gây tăng điểm CLS là gì?', en: 'What is the most reliable fix for late-loading images or embeds spiking CLS?' },
        options: [
          { vi: 'Khai báo sẵn `width`/`height` hoặc CSS `aspect-ratio` (và kích thước placeholder cố định) ngay từ lúc đầu.', en: 'Reserve explicit `width`/`height` attributes or CSS `aspect-ratio` boxes up front.' },
          { vi: 'Đặt `opacity: 0` rồi sau 5 giây mới hiện.', en: 'Keep elements invisible for 5 seconds.' },
          { vi: 'Xóa sạch mọi hình ảnh.', en: 'Remove all images.' },
          { vi: 'Chuyển hết ảnh sang Base64 inline 10MB.', en: 'Inline multi-megabyte Base64 images.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Trình duyệt tự suy ra `aspect-ratio` từ `width`/`height` để giữ đúng khung trống trước khi byte ảnh tải xong.',
          en: 'Explicit dimensions allow the layout engine to allocate exact vertical space prior to image decode.',
        },
      },
    ],
    relatedTopicIds: ['above-the-fold', 'reflows-repaints', 'responsive-images'],
  },
];
