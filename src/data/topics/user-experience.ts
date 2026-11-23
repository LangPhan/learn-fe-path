import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const userExperienceTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['ui-states'],
    mentalModel: {
      vi: 'Một màn hình chuyên nghiệp không bao giờ chỉ thiết kế mỗi trạng thái "Success đầy đủ dữ liệu"! Hãy coi mọi view là một State Machine gồm đủ 5 trạng thái: **Loading** (Skeleton không giật layout), **Empty** (hướng dẫn hành động tiếp), **Error** (nói rõ nguyên nhân + nút Retry), **Success**, và **Offline**.',
      en: 'Design every async view as a complete 5-state machine: **Loading** (layout-matched skeletons), **Empty** (actionable next step), **Error** (clear cause + retry), **Success**, and **Offline** (local cache status).',
    },
    keyPoints: [
      { vi: 'Loading State: dùng Skeleton Screen khớp kích thước thật của dữ liệu để giữ CLS = 0, và chỉ hiện spinner/skeleton sau ~150–200ms nếu có cache (tránh chớp nháy khó chịu khi tải quá nhanh!).', en: 'Use layout-matched skeletons for CLS-free loading; delay spinner flashes (~150ms) when local cache hits quickly.' },
      { vi: 'Empty State: phân biệt rạch ròi "Chưa từng tạo dữ liệu nào" (hiện nút CTA tạo mới) vs "Tìm kiếm/Lọc không ra kết quả" (hiện nút Clear Filters).', en: 'Distinguish First-Time Empty ("Create your first project") from Zero-Search Results ("Clear filters to see items").' },
      { vi: 'Offline Banner: không xóa dữ liệu đang đọc trong cache nếu rớt mạng — hiện banner tinh tế cho biết đang xem bản cached và khóa/xếp hàng các hành động cần mạng.', en: 'Preserve cached read content during offline drops while clearly flagging offline state and queuing mutations.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: '100% màn hình có async fetching, form submission, tìm kiếm và danh sách.', en: 'All async data-driven routes, search views, and interactive workspaces.' },
      ],
      whenToAvoid: [
        { vi: 'Không lạm dụng Spinner toàn màn hình che mất khung điều hướng (App Shell/Sidebar) khi chỉ đang tải lại một thẻ widget nhỏ.', en: 'Avoid full-page blocking spinners when only a single nested widget is loading.' },
      ],
    },
    pitfalls: [
      { vi: 'Dùng nhiều biến boolean rời rạc `isLoading`, `isError`, `isEmpty`, `isSuccess` dễ rơi vào trạng thái bất khả thi (`isLoading === true && isError === true` cùng lúc) — hãy dùng discriminated union `status: "loading" | "error" | "empty" | "success" | "offline"`!', en: 'Separate booleans (`isLoading && isError`) allow impossible UI states; model them with an explicit union state machine.' },
    ],
    interviewTips: [
      { vi: 'Bắt đầu câu trả lời UX System Design bằng việc vẽ 5 trạng thái và nhấn mạnh Discriminated Union State Machine thay cho cờ boolean rời rạc!', en: 'Open UX architecture answers by modeling all 5 UI states as a discriminated union rather than conflicting booleans.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Máy trạng thái 5 UI States (Loading / Empty / Error / Success / Offline)', en: '5-State UI State Machine Playground' },
      description: { vi: 'Chuyển đổi qua lại giữa cả 5 trạng thái trên cùng một card danh sách để quan sát bố cục ổn định không nhảy giật.', en: 'Toggle across Loading, Empty, Error, Success, and Offline states inside a unified container.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

type UiState = 'loading' | 'empty' | 'error' | 'success' | 'offline';

export default function App() {
  const [state, setState] = useState<UiState>('loading');

  return (
    <div className="col">
      <div className="row">
        {(['loading', 'success', 'empty', 'error', 'offline'] as UiState[]).map((s) => (
          <button key={s} className={state === s ? 'primary' : ''} onClick={() => setState(s)}>
            {s.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="card" style={{ minHeight: 110, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {state === 'loading' && (
          <div className="col">
            <div style={{ height: 14, width: '60%', borderRadius: 4, background: 'var(--border)' }} />
            <div style={{ height: 12, width: '85%', borderRadius: 4, background: 'var(--border)' }} />
            <span className="muted" style={{ fontSize: 12 }}>Skeleton matching exact card geometry (CLS = 0)</span>
          </div>
        )}
        {state === 'success' && (
          <div><strong>3 Active Deployments</strong><p className="muted" style={{ marginBottom: 0 }}>api-edge-vn · 18ms p95 · Healthy</p></div>
        )}
        {state === 'empty' && (
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="muted">No deployments match "edge-eu".</span>
            <button onClick={() => setState('success')}>Clear Filters</button>
          </div>
        )}
        {state === 'error' && (
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span style={{ color: '#ef4444' }}>503 Timeout fetching cluster status.</span>
            <button className="primary" onClick={() => setState('loading')}>Retry</button>
          </div>
        )}
        {state === 'offline' && (
          <div><strong>Offline Mode — Viewing Cached Snapshot</strong><p className="muted" style={{ marginBottom: 0 }}>New changes will sync once connection resumes.</p></div>
        )}
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Mở tab Interactive Lab ("UI States") để kiểm tra thêm Long String Overflow và khung mô phỏng màn hình Mobile 375px!', en: 'Check the UI States Interactive Lab tab for Long String wrapping and a 375px mobile stress tester!' },
    },
    quiz: [
      {
        id: 'q-uist-1',
        topicId: 'ui-states',
        categoryId: 'user-experience',
        question: { vi: 'Vì sao nên mô hình hóa trạng thái tải dữ liệu bằng discriminated union `status: "loading" | "error" | "success"` thay vì 3 biến boolean `isLoading`, `isError`, `isSuccess`?', en: 'Why model async views using a union `status` field instead of independent `isLoading`, `isError`, and `isSuccess` booleans?' },
        options: [
          { vi: 'Loại bỏ hoàn toàn các trạng thái mâu thuẫn bất khả thi (ví dụ vừa `isLoading: true` vừa `isError: true`).', en: 'Eliminates impossible conflicting boolean combinations like `isLoading && isError`.' },
          { vi: 'Giảm dung lượng PNG.', en: 'Shrinks PNG files.' },
          { vi: 'Bỏ qua kiểm tra TypeScript.', en: 'Disables TypeScript checks.' },
          { vi: 'Tự động tạo CSS animations.', en: 'Generates CSS animations.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Discriminated union ép mỗi thời điểm UI chỉ ở đúng một trạng thái hợp lệ duy nhất.',
          en: 'Explicit state machines prevent half-updated booleans from rendering contradictory banners.',
        },
      },
      {
        id: 'q-uist-2',
        topicId: 'ui-states',
        categoryId: 'user-experience',
        question: { vi: 'Khi user rớt mạng nhưng màn hình đang hiển thị danh sách đã lưu trong cache, cách xử lý UX tốt nhất là gì?', en: 'When connectivity drops while cached items are already visible on screen, what is the best UX?' },
        options: [
          { vi: 'Giữ nguyên dữ liệu cached cho user tiếp tục đọc và hiển thị banner/trạng thái Offline rõ ràng thay vì xóa trắng cả màn hình.', en: 'Keep cached content visible for reading and show a non-destructive Offline banner instead of wiping the view.' },
          { vi: 'Xóa sạch màn hình và hiện trang lỗi trắng xóa.', en: 'Wipe the screen with a full-page blank error.' },
          { vi: 'Tự động đăng xuất người dùng.', en: 'Log the user out automatically.' },
          { vi: 'Chuyển hướng sang Google.com.', en: 'Redirect externally.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Giữ nội dung có sẵn + thông báo tinh tế tôn trọng ngữ cảnh người dùng và tránh mất dữ liệu đang đọc.',
          en: 'Non-destructive offline indicators preserve reader context instead of destroying cached UI.',
        },
      },
    ],
    relatedTopicIds: ['error-handling', 'net-offline-usage', 'core-web-vitals'],
  },

  {
    ...TOPIC_META_MAP['error-handling'],
    mentalModel: {
      vi: 'Không phải lỗi nào cũng xứng đáng bật popup đỏ chói! Phân loại rõ theo ma trận 3 hướng: **Ignore** (telemetry phụ, prefetch, `AbortError` do người dùng đổi ý), **Retry ngầm** (lỗi mạng tạm thời 503 khi tải feed), hoặc **Display** (lỗi xác thực, form input, thanh toán thất bại cần user hành động).',
      en: 'Triage errors intentionally instead of tossing red alerts everywhere: **Ignore** silent background analytics/aborts, **Retry** transient 5xx/network blips transparently, or **Display** actionable inline/banner errors when user input or recovery is required.',
    },
    keyPoints: [
      { vi: 'Ignore (Im lặng / chỉ log nội bộ): `AbortError` khi chuyển trang/gõ tiếp search, failure từ tracking pixel/analytics hoặc speculative hover prefetch.', en: 'Ignore visibly (log internally only): intentional `AbortError`, hover prefetch misses, and non-critical telemetry failures.' },
      { vi: 'Retry ngầm (Automatic Backoff): lỗi GET 502/503/504 tạm thời -> thử lại 1–2 lần trước khi làm phiền người dùng bằng màn hình lỗi.', en: 'Background Retry: absorb transient 5xx/network hiccups on idempotent reads silently before surfacing failure UI.' },
      { vi: 'Display (Thông báo rõ & có lối thoát): Validation 422 dưới từng field, 401 chuyển đăng nhập giữ lại redirect URL, 5xx kéo dài hoặc React Error Boundary kèm nút Retry / Reload cục bộ (không làm sập toàn trang!).', en: 'Display clearly: inline field validation errors, 401 auth prompts preserving return URL, and scoped Error Boundaries with Reset/Retry actions.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi ứng dụng web thực tế: bọc các widget độc lập bằng Error Boundary riêng để 1 biểu đồ lỗi không làm sập thanh điều hướng hay nút Save!', en: 'Wrap independent page panels in granular Error Boundaries so one crashed chart never takes down the entire workspace.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng im lặng nuốt lỗi (`catch {}` rỗng) trên các thao tác ghi dữ liệu người dùng (Save, Publish, Delete, Checkout)!', en: 'Never swallow failures silently on user-initiated write mutations like Save, Delete, or Checkout.' },
      ],
    },
    pitfalls: [
      { vi: 'Hiện nguyên thông báo kỹ thuật thô `TypeError: Cannot read properties of undefined (reading "id")` cho người dùng cuối thay vì lời nhắn dễ hiểu.', en: 'Exposing raw stack traces or database errors directly to end users.' },
    ],
    interviewTips: [
      { vi: 'Dẫn ngay bảng phân loại **Ignore vs Retry vs Display** kèm Granular React Error Boundaries — đúng trọng tâm câu hỏi trong Cheatsheet!', en: 'Organize error architecture explicitly into Ignore / Auto-Retry / User-Facing Display + Scoped Error Boundaries.' },
    ],
    example: {
      title: { vi: 'Ma trận Phân loại Lỗi (Ignore / Retry / Display)', en: 'Error Strategy Triage Classifier Demo' },
      description: { vi: 'Chạy thử bộ phân loại tự động qua 5 kịch bản lỗi Front End thường gặp.', en: 'Inspect how an error policy engine classifies aborts, telemetry, 503 reads, 422 inputs, and 401 sessions.' },
      mode: 'ts',
      code: `interface AppError {
  kind: 'abort' | 'analytics' | 'network_read' | 'form_validation' | 'auth_expired' | 'payment';
  status?: number;
}

function triageError(err: AppError): 'IGNORE' | 'RETRY_SILENT' | 'DISPLAY_INLINE' | 'REDIRECT_AUTH' {
  if (err.kind === 'abort' || err.kind === 'analytics') return 'IGNORE';
  if (err.kind === 'network_read' && (err.status === 503 || err.status === 502 || !err.status)) {
    return 'RETRY_SILENT';
  }
  if (err.kind === 'auth_expired' || err.status === 401) return 'REDIRECT_AUTH';
  return 'DISPLAY_INLINE';
}

console.log('Cancelled search:', triageError({ kind: 'abort' }));
console.log('503 on GET /feed:', triageError({ kind: 'network_read', status: 503 }));
console.log('401 Expired:', triageError({ kind: 'auth_expired', status: 401 }));
console.log('Checkout failed:', triageError({ kind: 'payment', status: 402 }));`,
      tryItPrompt: { vi: 'Thử thêm trường hợp `kind: "prefetch"` vào nhóm `IGNORE` để hệ thống không báo lỗi khi hover link rớt mạng.', en: 'Extend the classifier to map speculative `prefetch` errors cleanly to `IGNORE`.' },
    },
    challenge: {
      id: 'challenge-classify-error',
      topicId: 'error-handling',
      categoryId: 'user-experience',
      title: { vi: 'Cài đặt classifyErrorAction cho Ma trận Lỗi UX', en: 'Implement classifyErrorAction' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm `classifyErrorAction(err: { name?: string; status?: number; isCritical?: boolean; method?: "GET" | "POST" }): "ignore" | "retry" | "display"`. Quy tắc: 1) Nếu `name === "AbortError"` hoặc (`!isCritical && method === "POST"` không quan trọng như analytics? Không, dùng quy tắc tường minh!): nếu `name === "AbortError"` hoặc `isCritical === false` và status không phải lỗi form (400/422) -> `"ignore"`. Cụ thể: `name === "AbortError"` -> `"ignore"`; `!isCritical` (explicit `isCritical === false`) -> `"ignore"`; nếu `method === "GET"` và (`status === undefined` hoặc `status >= 500` hoặc `status === 429`) -> `"retry"`; mọi trường hợp còn lại -> `"display"`.',
        en: 'Implement `classifyErrorAction({ name?, status?, isCritical = true, method = "GET" }): "ignore" | "retry" | "display"`. Rules: if `name === "AbortError"` or `isCritical === false` -> `"ignore"`; else if `method === "GET"` and (`status === undefined || status >= 500 || status === 429`) -> `"retry"`; else -> `"display"`.',
      },
      starterCode: `export function classifyErrorAction(err: {
  name?: string;
  status?: number;
  isCritical?: boolean;
  method?: 'GET' | 'POST';
}): 'ignore' | 'retry' | 'display' {
  // TODO: apply AbortError/non-critical -> ignore, transient GET -> retry, else display
  return 'display';
}`,
      solutionCode: `export function classifyErrorAction(err: {
  name?: string;
  status?: number;
  isCritical?: boolean;
  method?: 'GET' | 'POST';
}): 'ignore' | 'retry' | 'display' {
  const { name, status, isCritical = true, method = 'GET' } = err;
  if (name === 'AbortError' || isCritical === false) {
    return 'ignore';
  }
  if (method === 'GET' && (status === undefined || status >= 500 || status === 429)) {
    return 'retry';
  }
  return 'display';
}`,
      testCode: `test('triages aborts, non-critical telemetry, transient GETs, and mutations', () => {
  expect(classifyErrorAction({ name: 'AbortError', status: 0 })).toBe('ignore');
  expect(classifyErrorAction({ isCritical: false, status: 500, method: 'POST' })).toBe('ignore');
  expect(classifyErrorAction({ method: 'GET', status: 503 })).toBe('retry');
  expect(classifyErrorAction({ method: 'GET', status: 429 })).toBe('retry');
  expect(classifyErrorAction({ method: 'GET', status: 404 })).toBe('display');
  expect(classifyErrorAction({ method: 'POST', status: 500 })).toBe('display');
});`,
      hints: [
        { vi: 'Kiểm tra `name === "AbortError" || isCritical === false` trước tiên (nhớ đặt mặc định `isCritical = true`, `method = "GET"`).', en: 'Default `isCritical = true` and `method = "GET"`, then evaluate `ignore` conditions first.' },
        { vi: 'Chỉ tự retry cho `method === "GET"` khi mất mạng (`status === undefined`), 429, hoặc >= 500; lỗi POST 500 mặc định trả `"display"` để user tự xử lý an toàn!', en: 'Only auto-retry GET reads on transient/429/5xx codes; surface POST failures via `"display"`.' },
      ],
    },
    quiz: [
      {
        id: 'q-errh-1',
        topicId: 'error-handling',
        categoryId: 'user-experience',
        question: { vi: 'Khi một sự kiện gửi tracking analytics (như ghi nhận lượt xem) bị lỗi mạng 500, cách xử lý UX chuẩn nhất là gì?', en: 'When a background analytics tracking request returns 500, what is the right UX action?' },
        options: [
          { vi: 'Ignore (không làm phiền người dùng bằng toast đỏ hay chặn giao diện).', en: 'Ignore visibly (log telemetry quietly without showing error banners to the user).' },
          { vi: 'Chặn toàn bộ trang web bằng Error Boundary.', en: 'Crash the whole page with a full-screen Error Boundary.' },
          { vi: 'Đăng xuất người dùng ngay lập tức.', en: 'Sign the user out.' },
          { vi: 'Bắt người dùng tải lại trang.', en: 'Prompt a hard page refresh.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Lỗi trên các tác vụ phụ không ảnh hưởng mục tiêu của người dùng nên được nuốt/log êm ái ở tầng observability.',
          en: 'Non-critical background telemetry failures should never disrupt the user’s primary workflow.',
        },
      },
      {
        id: 'q-errh-2',
        topicId: 'error-handling',
        categoryId: 'user-experience',
        question: { vi: 'Lợi ích của việc đặt nhiều React Error Boundary nhỏ ở từng vùng (Sidebar, Chart, Feed) thay vì chỉ 1 cái ở Root App là gì?', en: 'Why place granular React Error Boundaries around independent panels instead of only one at the root?' },
        options: [
          { vi: 'Nếu một widget phụ bị lỗi render, các phần còn lại (menu điều hướng, thanh công cụ, bài viết) vẫn tiếp tục hoạt động bình thường kèm nút Retry cục bộ.', en: 'Isolates crashes to the broken panel while keeping navigation, sibling panels, and save controls usable with a scoped Retry button.' },
          { vi: 'Để tắt toàn bộ console error.', en: 'To hide console errors.' },
          { vi: 'Để React chạy không cần DOM.', en: 'To skip DOM rendering.' },
          { vi: 'Để giảm số lượng HTTP headers.', en: 'To reduce HTTP headers.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Error Isolation (cô lập lỗi) giúp giảm tối đa blast radius khi một thành phần gặp sự cố bất ngờ.',
          en: 'Granular boundaries shrink blast radius so isolated rendering bugs never nuke the whole app.',
        },
      },
    ],
    relatedTopicIds: ['ui-states', 'retries-backoff-jitter', 'timeout'],
  },

  {
    ...TOPIC_META_MAP['ux-infinite-scrolling'],
    mentalModel: {
      vi: 'Tự động tải tiếp trang mới khi phần tử canh gác (`sentinel`) ở gần đáy lọt vào màn hình qua `IntersectionObserver`. Luôn cân nhắc trade-off UX: người dùng sẽ không bao giờ bấm tới được `<footer>` và dễ mất vị trí cuộn nếu không có Scroll Restoration!',
      en: 'Trigger next-page cursor fetches seamlessly via an `IntersectionObserver` sentinel near the bottom, while accounting for UX pitfalls: unreachable footers, deep scroll memory growth, and Back-button scroll loss.',
    },
    keyPoints: [
      { vi: 'Dùng `IntersectionObserver` với `rootMargin: "300px"` trên một sentinel div ở đáy danh sách (hiệu năng cao hơn lắng nghe `window.onscroll`!).', en: 'Observe a bottom sentinel with `IntersectionObserver` + `rootMargin: "300px"` to prefetch smoothly before users hit bottom.' },
      { vi: 'Nhớ giữ Scroll Restoration khi click xem chi tiết rồi bấm Back (hoặc mở detail trong drawer/modal song song!).', en: 'Preserve scroll position and loaded page slices on Back navigation (or open details in a modal/drawer).' },
      { vi: 'Luôn cung cấp nút fallback "Load more" (tốt cho Accessibility / người dùng muốn chạm được tới footer!).', en: 'Offer a keyboard-accessible "Load more" fallback or virtualized recycling when footers or jump-to-page matter.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Khám phá nội dung giải trí không cần trang cụ thể (Social Feed, Pinterest grid, video shorts).', en: 'Serendipitous discovery feeds (social timelines, photo grids, short-form video).' },
      ],
      whenToAvoid: [
        { vi: 'Tìm kiếm sản phẩm e-commerce, tra cứu bảng admin hay trang cần Footer quan trọng (FAQ/Liên hệ) -> nên dùng Pagination hoặc nút "Load More" tường minh!', en: 'Goal-oriented search/shopping or sites needing reachable footers—prefer numbered pages or explicit "Load More".' },
      ],
    },
    pitfalls: [
      { vi: 'Không chặn `isFetching` đang chạy khi sentinel vẫn nằm trong viewport -> bắn lặp 10 request cho cùng một cursor!', en: 'Failing to guard with `isFetching` / `hasMore` fires duplicate cursor requests while the sentinel remains visible.' },
    ],
    interviewTips: [
      { vi: 'Trình bày 3 điểm tinh tế khi phỏng vấn Feed UX: 1) `IntersectionObserver` với `rootMargin`, 2) Cursor Pagination tránh lệch trang, 3) Tái chế DOM bằng Virtualization + giữ Footer/Scroll Restoration.', en: 'Cover the full UX triad: `IntersectionObserver` rootMargin prefetch, cursor stability, and scroll restoration / footer accessibility.' },
    ],
    example: {
      title: { vi: 'Infinite Scroll Sentinel với IntersectionObserver & In-Flight Lock', en: 'IntersectionObserver Infinite Scroll Demo' },
      description: { vi: 'Cuộn xuống đáy danh sách để tự động tải thêm trang mới qua sentinel không trùng lặp request.', en: 'Scroll to the bottom sentinel inside the box to watch automatic cursor-locked page loading.' },
      mode: 'react',
      code: `import React, { useEffect, useRef, useState } from 'react';

export default function App() {
  const [items, setItems] = useState(() => Array.from({ length: 10 }, (_, i) => \`Feed Item #\${i + 1}\`));
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    const root = rootRef.current;
    if (!el || !root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading && items.length < 40) {
          setLoading(true);
          setTimeout(() => {
            setItems((prev) => [
              ...prev,
              ...Array.from({ length: 8 }, (_, i) => \`Feed Item #\${prev.length + i + 1}\`),
            ]);
            setLoading(false);
          }, 350);
        }
      },
      { root, rootMargin: '60px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loading, items.length]);

  return (
    <div className="col">
      <div className="badge">Loaded: {items.length} / 40 items</div>
      <div ref={rootRef} style={{ height: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
        {items.map((item) => (
          <div key={item} style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>{item}</div>
        ))}
        <div ref={sentinelRef} className="muted" style={{ padding: 10, textAlign: 'center', fontSize: 12 }}>
          {items.length >= 40 ? 'End of feed' : loading ? 'Loading more...' : 'Scroll near bottom sentinel'}
        </div>
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử cuộn xuống cuối khung — trang mới tự động nối tiếp khi sentinel tiến vào vùng `rootMargin: 60px`!', en: 'Scroll to the bottom and notice how `rootMargin: "60px"` triggers loading slightly before the very end.' },
    },
    quiz: [
      {
        id: 'q-uxinf-1',
        topicId: 'ux-infinite-scrolling',
        categoryId: 'user-experience',
        question: { vi: 'Một nhược điểm UX kinh điển của Infinite Scrolling khi đặt trên trang thương mại điện tử có footer chứa thông tin bảo hành/liên hệ là gì?', en: 'What classic UX drawback occurs with Infinite Scrolling on sites that place important links in the `<footer>`?' },
        options: [
          { vi: 'Footer liên tục bị đẩy tuột xuống sâu hơn mỗi lần cuộn tới đáy khiến người dùng rất khó hoặc không thể bấm tới.', en: 'New loaded batches constantly push the footer downward, making footer links frustrating or unreachable.' },
          { vi: 'Infinite Scroll không hỗ trợ hình ảnh WebP.', en: 'Infinite Scroll breaks WebP images.' },
          { vi: 'CSS không hoạt động sau 100 dòng.', en: 'CSS breaks past 100 rows.' },
          { vi: 'Gây lỗi CORS ở header.', en: 'Triggers CORS errors.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Nếu footer quan trọng, hãy dùng nút "Load more" tường minh hoặc phân trang theo số trang thay vì tự tải vô hạn.',
          en: 'Explicit "Load more" buttons or traditional pagination keep footers accessible.',
        },
      },
      {
        id: 'q-uxinf-2',
        topicId: 'ux-infinite-scrolling',
        categoryId: 'user-experience',
        question: { vi: 'Đặt `rootMargin: "300px"` khi dùng `IntersectionObserver` cho sentinel Infinite Scroll giúp ích gì?', en: 'Why configure `rootMargin: "300px"` on an infinite-scroll `IntersectionObserver`?' },
        options: [
          { vi: 'Kích hoạt tải trang tiếp theo sớm trước 300px khi người dùng sắp chạm đáy để trải nghiệm cuộn liền mạch không chờ spinner.', en: 'Prefetches the next batch 300px ahead of the bottom edge so scrolling feels seamless without waiting.' },
          { vi: 'Làm tăng chiều cao mỗi dòng thêm 300px.', en: 'Adds 300px padding to every row.' },
          { vi: 'Xóa 300 phần tử đầu danh sách.', en: 'Deletes 300 top items.' },
          { vi: 'Giới hạn tối đa 300 item.', en: 'Caps lists at 300 items.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Tải trước khi chạm đáy vài trăm px che giấu độ trễ mạng tự nhiên trong lúc người dùng đọc các bài cuối.',
          en: 'Pre-triggering the fetch hides network roundtrip time before the user reaches the end.',
        },
      },
    ],
    relatedTopicIds: ['pattern-infinite-scrolling', 'pagination', 'list-virtualization'],
  },

  {
    ...TOPIC_META_MAP['long-strings'],
    mentalModel: {
      vi: 'Một tên file siêu dài `report_final_v99_approved_no_spaces_2026.pdf` hay URL 120 ký tự không có dấu cách có thể làm vỡ bung Flex/Grid container và ép cả trang cuộn ngang trên mobile! Luôn thiết kế quy tắc cắt/xuống dòng ngay từ đầu.',
      en: 'An unbroken 120-character filename, URL, or German compound noun can blow out Flex/Grid tracks and force horizontal overflow unless constrained with `min-width: 0`, `overflow-wrap: anywhere`, and intentional truncation.',
    },
    keyPoints: [
      { vi: 'Quy tắc vàng Flexbox/Grid: thêm `min-width: 0` (hoặc `min-w-0` trong Tailwind) trên phần tử con Flex/Grid — nếu thiếu, `text-overflow: ellipsis` sẽ KHÔNG hoạt động vì `min-width: auto`!', en: 'Flex/Grid gotcha: `text-overflow: ellipsis` fails unless the flex/grid child also sets `min-width: 0` (`min-w-0`).' },
      { vi: '1 dòng gọn: `truncate` (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`). Nhiều dòng: `line-clamp-2`. URL/token dài: `overflow-wrap: anywhere` (bắt buộc xuống dòng kể cả không có khoảng trắng!).', en: 'Pick per need: single-line `truncate`, multi-line `line-clamp-*`, or `overflow-wrap: anywhere` for unbroken hashes/URLs.' },
      { vi: 'Middle Truncation cho tên file/mã ví/hash (`contract_2026...signed.pdf`) giữ nguyên phần đuôi quan trọng (`.pdf`, 4 ký tự cuối), và hiện tooltip đầy đủ khi hover/focus!', en: 'Middle truncation preserves file extensions or trailing IDs (`archive_2026...v4.pdf`), paired with hover/focus full text access.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Tên người dùng đa ngôn ngữ, tên file tải lên, URL dài, địa chỉ ví/hash, tiêu đề card trong grid.', en: 'Usernames, uploaded filenames, URLs, transaction hashes, and multi-column card titles.' },
      ],
      whenToAvoid: [
        { vi: 'Không bao giờ dùng `truncate` cắt mất chữ trên các **nút hành động chính**, **cảnh báo lỗi** hay **giá tiền** — văn bản quan trọng cần được xuống dòng đầy đủ!', en: 'Never truncate critical warnings, button labels, or prices—let essential copy wrap visibly.' },
      ],
    },
    pitfalls: [
      { vi: 'Quên `min-w-0` bên trong `display: flex` khiến cả đoạn chữ dài đẩy cột bên cạnh bay ra khỏi màn hình!', en: 'Forgetting `min-w-0` on flex items pushes sibling action buttons completely off-screen.' },
    ],
    interviewTips: [
      { vi: 'Nhắc ngay bộ 3 CSS thực chiến: `min-width: 0` cho Flex/Grid child + `overflow-wrap: anywhere` cho token không dấu cách + Middle Truncation cho filename!', en: 'Mention `min-width: 0` on flex/grid children, `overflow-wrap: anywhere`, and middle-truncation for file extensions.' },
    ],
    example: {
      title: { vi: 'Demo Sửa lỗi Flex Overflow + Truncate + Line-Clamp + Middle Ellipsis', en: 'Flex `min-width: 0`, Wrap & Truncation Playground' },
      description: { vi: 'Xem cách chuỗi URL không dấu cách phá vỡ flex row nếu thiếu `min-width: 0` và cách xử lý đúng.', en: 'Compare a broken unconstrained flex row against proper `min-width: 0`, `overflow-wrap`, and `text-overflow: ellipsis`.' },
      mode: 'html',
      code: `<div class="col" style="max-width:340px;">
  <div class="card">
    <div style="font-size:12px;margin-bottom:4px;color:#22c55e;">✅ Flex child WITH min-width: 0 + ellipsis:</div>
    <div style="display:flex;gap:8px;align-items:center;">
      <span style="min-width:0;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        super_long_unbroken_enterprise_deployment_manifest_v2026_final_signed.json
      </span>
      <button class="primary" style="flex-shrink:0;">Open</button>
    </div>
  </div>
  <div class="card">
    <div style="font-size:12px;margin-bottom:4px;color:#38bdf8;">✅ Unbroken URL with overflow-wrap: anywhere:</div>
    <div style="overflow-wrap:anywhere;">
      https://cdn.example.com/assets/tokens/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_long_token
    </div>
  </div>
</div>`,
      tryItPrompt: { vi: 'Thử xóa `min-width:0;` ở card đầu tiên để thấy nút Open bị đẩy tuột ra khỏi card ngay lập tức!', en: 'Remove `min-width:0;` from the first span to watch the Open button blow past the 340px container.' },
    },
    challenge: {
      id: 'challenge-truncate-middle',
      topicId: 'long-strings',
      categoryId: 'user-experience',
      title: { vi: 'Cài đặt truncateMiddleString bảo toàn đuôi file/hash', en: 'Implement truncateMiddleString' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm `truncateMiddleString(str: string, maxLength: number, ellipsis = "..."): string`. Nếu `str.length <= maxLength` trả nguyên `str`. Nếu `maxLength <= ellipsis.length` trả về `str.slice(0, maxLength)`. Ngược lại chia phần chữ giữ lại cho đầu (`startLen = Math.ceil(keep / 2)`) và cuối (`endLen = Math.floor(keep / 2)`) trong đó `keep = maxLength - ellipsis.length`, ghép lại `str.slice(0, startLen) + ellipsis + str.slice(str.length - endLen)`.',
        en: 'Implement `truncateMiddleString(str, maxLength, ellipsis = "...")`. Return `str` unchanged when `str.length <= maxLength`. When `maxLength <= ellipsis.length`, return `str.slice(0, maxLength)`. Otherwise compute `keep = maxLength - ellipsis.length`, `startLen = Math.ceil(keep / 2)`, `endLen = Math.floor(keep / 2)`, and combine head + ellipsis + tail.',
      },
      starterCode: `export function truncateMiddleString(
  str: string,
  maxLength: number,
  ellipsis = '...'
): string {
  // TODO: preserve start and end segments around ellipsis within maxLength
  return str;
}`,
      solutionCode: `export function truncateMiddleString(
  str: string,
  maxLength: number,
  ellipsis = '...'
): string {
  if (str.length <= maxLength) return str;
  if (maxLength <= ellipsis.length) return str.slice(0, Math.max(0, maxLength));

  const keep = maxLength - ellipsis.length;
  const startLen = Math.ceil(keep / 2);
  const endLen = Math.floor(keep / 2);
  const tail = endLen > 0 ? str.slice(str.length - endLen) : '';
  return str.slice(0, startLen) + ellipsis + tail;
}`,
      testCode: `test('truncates long strings in the middle preserving start, end, and exact maxLength', () => {
  expect(truncateMiddleString('short.pdf', 20)).toBe('short.pdf');
  const out = truncateMiddleString('quarterly_financial_report_2026_final.pdf', 18);
  expect(out).toHaveLength(18);
  expect(out).toBe('quarterl...nal.pdf');
  expect(truncateMiddleString('abcdef', 2)).toBe('ab');
});`,
      hints: [
        { vi: 'Chú ý trường hợp `endLen === 0` khi `keep === 1` -> `str.slice(str.length - 0)` là nguyên chuỗi nên cần kiểm tra `endLen > 0 ? ... : ""`.', en: 'Guard `endLen > 0` before calling `str.slice(str.length - endLen)` because `str.slice(str.length)` returns `""` while `str.slice(-0)` returns the whole string!' },
      ],
    },
    quiz: [
      {
        id: 'q-lstr-1',
        topicId: 'long-strings',
        categoryId: 'user-experience',
        question: { vi: 'Vì sao thuộc tính `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;` thường KHÔNG có tác dụng khi đặt lên một phần tử con nằm trực tiếp trong `display: flex`?', en: 'Why does `text-overflow: ellipsis` often fail on a direct child inside a `display: flex` container?' },
        options: [
          { vi: 'Vì Flex item mặc định có `min-width: auto`, khiến nó giãn theo chiều dài chữ thay vì co lại; phải thêm `min-width: 0` (hoặc `overflow: hidden`).', en: 'Flex items default to `min-width: auto`, refusing to shrink below text content width unless `min-width: 0` is set.' },
          { vi: 'Flexbox không hỗ trợ `white-space`.', en: 'Flexbox disables `white-space`.' },
          { vi: 'Ellipsis chỉ dùng được trong thẻ `<table>`.', en: 'Ellipsis only works in tables.' },
          { vi: 'Phải dùng `z-index: 999`.', en: 'Requires `z-index: 999`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`min-width: 0` (Tailwind: `min-w-0`) cho phép flex/grid item thu nhỏ dưới kích thước nội dung vốn có để kích hoạt ellipsis.',
          en: 'Setting `min-width: 0` lets flex/grid children shrink so overflow truncation actually engages.',
        },
      },
      {
        id: 'q-lstr-2',
        topicId: 'long-strings',
        categoryId: 'user-experience',
        question: { vi: 'Khi hiển thị danh sách tên file đính kèm siêu dài trong khung hẹp, kiểu cắt nào hữu ích hơn cả?', en: 'When displaying long uploaded filenames in narrow cells, which truncation style preserves critical context best?' },
        options: [
          { vi: 'Middle truncation (`budget_2026...final.xlsx`) để giữ lại cả đầu tên lẫn phần đuôi mở rộng `.xlsx`, kèm tooltip xem tên đầy đủ.', en: 'Middle truncation (`budget_2026...final.xlsx`) to keep both prefix and file extension visible, with full name on hover/focus.' },
          { vi: 'Cắt mất toàn bộ phần đuôi giữ 3 chữ đầu.', en: 'Slice to just the first 3 characters.' },
          { vi: 'Cho chữ tràn đè lên nút Xóa bên cạnh.', en: 'Let text overlap adjacent action buttons.' },
          { vi: 'Ẩn hoàn toàn tên file.', en: 'Hide the filename completely.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Cắt ở giữa giúp người dùng phân biệt các file cùng tiền tố nhưng khác phiên bản hoặc đuôi `.pdf`/`.csv`.',
          en: 'Middle truncation preserves distinguishing suffixes and extensions when prefixes repeat.',
        },
      },
    ],
    relatedTopicIds: ['mobile-friendliness', 'ui-states', 'rtl'],
  },

  {
    ...TOPIC_META_MAP['mobile-friendliness'],
    mentalModel: {
      vi: 'Ngón tay cái to hơn con trỏ chuột nhiều! Mobile-friendly không chỉ là co layout về 1 cột không cuộn ngang, mà còn là kích thước vùng bấm >= 44x44px, khoảng cách giữa các nút >= 8px, chữ input >= 16px (để iOS Safari không tự zoom màn hình!), và hỗ trợ `100dvh` + `env(safe-area-inset-bottom)`.',
      en: 'Fingers are larger than mouse pointers: craft responsive 1-column mobile stacks with zero horizontal scroll, >=44px touch targets, >=16px input fonts (avoiding iOS auto-zoom), and `100dvh` + safe-area insets.',
    },
    keyPoints: [
      { vi: 'Touch Targets tối thiểu **44×44px** (chuẩn Apple HIG / WCAG 2.5.5) và cách nhau >= 8px để không bấm nhầm.', en: 'Keep interactive touch targets at least **44×44px** with >=8px spacing between neighbors.' },
      { vi: 'Đặt `font-size: 16px` (1rem) cho `<input>` / `<select>` / `<textarea>` trên mobile để iOS Safari không tự động phóng to đột ngột khi chạm vào ô nhập.', en: 'Keep mobile input font-size >= 16px so iOS Safari never auto-zooms on focus.' },
      { vi: 'Dùng `100dvh` / `100svh` thay cho `100vh` cũ (bị thanh địa chỉ di động che mất đáy!) và `env(safe-area-inset-bottom)` cho thanh action dưới tai thỏ/home bar.', en: 'Use dynamic viewport height (`dvh`/`svh`) and `env(safe-area-inset-*)` so mobile browser chrome and notches never clip actions.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Thiết kế Mobile-First (`@media (min-width: 768px)` mở rộng dần lên tablet/desktop) cho mọi sản phẩm web.', en: 'Adopt mobile-first responsive grids and ergonomics across all consumer and B2B interfaces.' },
      ],
      whenToAvoid: [
        { vi: 'Tránh phụ thuộc hiệu ứng `:hover` để lộ nút Xóa/Sửa quan trọng (trên màn hình cảm ứng không có hover -> nút sẽ biến mất hoàn toàn nếu không hiển thị rõ!).', en: 'Never hide critical edit/delete buttons strictly behind `:hover`, which touchscreens cannot trigger reliably.' },
      ],
    },
    pitfalls: [
      { vi: 'Một thẻ bảng dữ liệu hoặc khối `<pre>` code thiếu `overflow-x: auto` làm toàn bộ trang 390px bị hở lề và cuộn ngang!', en: 'Unconstrained wide tables or `<pre>` blocks missing `overflow-x: auto` trigger full-page horizontal scroll at 390px.' },
    ],
    interviewTips: [
      { vi: 'Nêu những chi tiết thực chiến ít người nhớ nhưng cực ấn tượng: iOS `16px` input auto-zoom prevention, `100dvh` vs `100vh`, `hover: hover` media query, và `44px` tap targets!', en: 'Cite real mobile engineering details: 16px input anti-zoom rule, `100dvh`/`svh` over `100vh`, `@media (hover: hover)`, and 44px tap targets.' },
    ],
    example: {
      title: { vi: 'Kiểm tra Mobile Touch Target & Responsive Form (HTML/CSS)', en: 'Mobile Ergonomics & Touch Target Demo' },
      description: { vi: 'So sánh nút nhỏ 24px khó bấm vs nút chuẩn 44px cùng ô input 16px không gây auto-zoom iOS.', en: 'Compare cramped 24px controls against 44px accessible touch targets and 16px zoom-safe inputs.' },
      mode: 'html',
      code: `<div class="col" style="max-width:360px;">
  <div class="card col">
    <label for="m-email" style="font-weight:600;">Email (16px font prevents iOS Safari zoom)</label>
    <input id="m-email" type="email" placeholder="alex@domain.example" style="font-size:16px;min-height:44px;width:100%;" />
    <div class="row" style="gap:10px;margin-top:4px;">
      <button style="min-height:44px;min-width:44px;flex:1;">Cancel (44px)</button>
      <button class="primary" style="min-height:44px;min-width:44px;flex:1;">Continue (44px)</button>
    </div>
  </div>
</div>`,
      tryItPrompt: { vi: 'Mở tab Interactive Lab ("UI States") và bật chế độ 375px Mobile Frame Preview để kiểm thử giao diện di động!', en: 'Open the UI States Interactive Lab tab and toggle the 375px mobile viewport frame!' },
    },
    quiz: [
      {
        id: 'q-mob-1',
        topicId: 'mobile-friendliness',
        categoryId: 'user-experience',
        question: { vi: 'Vì sao đặt `font-size: 16px` trở lên cho `<input>` lại quan trọng trên thiết bị di động (đặc biệt iOS Safari)?', en: 'Why keep `<input>` and `<textarea>` font sizes at >= 16px on mobile screens?' },
        options: [
          { vi: 'Ngăn iOS Safari tự động phóng to (auto-zoom) toàn bộ trang web mỗi khi người dùng chạm vào ô nhập liệu.', en: 'Prevents iOS Safari from automatically zooming the viewport whenever a user taps into an input.' },
          { vi: 'Tăng tốc độ gõ phím cơ.', en: 'Accelerates typing speed.' },
          { vi: 'Kích hoạt bàn phím emoji mặc định.', en: 'Opens the emoji keyboard.' },
          { vi: 'Tự động gửi form khi đủ 16 ký tự.', en: 'Submits forms automatically.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'iOS Safari mặc định zoom vào ô input nào có `font-size < 16px`, làm xộc xệch bố cục ngay khi gõ.',
          en: 'Safari auto-zooms inputs smaller than 16px, breaking layout orientation mid-form.',
        },
      },
      {
        id: 'q-mob-2',
        topicId: 'mobile-friendliness',
        categoryId: 'user-experience',
        question: { vi: 'Đơn vị CSS nào khắc phục tình trạng thanh địa chỉ trình duyệt mobile che khuất đáy trang khi dùng `height: 100vh`?', en: 'Which modern CSS viewport unit fixes `100vh` getting clipped underneath mobile browser address bars?' },
        options: [
          { vi: '`100dvh` (Dynamic) hoặc `100svh` (Small Viewport Height).', en: '`100dvh` (dynamic viewport height) or `100svh`.' },
          { vi: '`100vw`.', en: '`100vw`.' },
          { vi: '`100pt`.', en: '`100pt`.' },
          { vi: '`100rem`.', en: '`100rem`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`100vh` trên mobile thường tính theo lúc thanh URL đã thu gọn nên lúc đầu bị che nút bấm ở đáy; `100dvh`/`100svh` phản ánh chính xác vùng nhìn thực tế.',
          en: '`dvh` and `svh` track dynamic mobile browser UI toolbars accurately.',
        },
      },
    ],
    relatedTopicIds: ['long-strings', 'visual-a11y', 'ui-states'],
  },
];
