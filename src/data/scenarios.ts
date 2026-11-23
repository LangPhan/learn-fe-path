import type { SystemDesignScenario } from '@/types/curriculum';

export const SCENARIOS: SystemDesignScenario[] = [
  {
    id: 'news-feed',
    title: { vi: '1. News Feed (Facebook / X)', en: '1. News Feed (Facebook / X)' },
    subtitle: {
      vi: 'Thiết kế luồng tin cuộn vô tận cho hàng triệu người dùng: Cursor Pagination, Normalized Cache, Virtualization và Optimistic UI.',
      en: 'Design an infinite social timeline at scale: Cursor pagination, Normalized Store, List Virtualization, and Optimistic mutations.',
    },
    difficulty: 'medium',
    iconName: 'Newspaper',
    relatedTopicIds: [
      'pagination',
      'normalized-stores',
      'list-virtualization',
      'pattern-infinite-scrolling',
      'net-optimistic-updates',
      'responsive-images',
      'ui-states',
    ],
    radio: {
      requirements: {
        heading: { vi: 'R — Yêu cầu chức năng & phi chức năng', en: 'R — Functional & Non-Functional Requirements' },
        bullets: [
          { vi: 'Hiển thị danh sách bài viết hỗn hợp (chữ, ảnh, video) cuộn vô tận mượt ở 60fps trên mobile 3G/4G.', en: 'Infinite scroll feed supporting mixed media (text, image grids, video) at 60fps on mid-tier mobile.' },
          { vi: 'Tương tác Like, Bookmark, Comment phản hồi tức thì <50ms bằng Optimistic Update có rollback khi lỗi.', en: 'Like, Bookmark, and Comment reactions update in <50ms optimistically with rollback on failure.' },
          { vi: 'Hỗ trợ SSR cho lần load đầu tiên (Above-the-fold LCP <= 2.5s) và không trùng lặp bài khi có bài mới đăng.', en: 'Fast above-the-fold SSR initial paint (LCP <= 2.5s) with zero duplicate/skipped items during live inserts.' },
        ],
      },
      architecture: {
        heading: { vi: 'A — Kiến trúc Client & Luồng dữ liệu', en: 'A — High-Level Client Architecture' },
        bullets: [
          { vi: 'Feed Controller + Normalized Entity Store (`posts.byId`, `users.byId`, `feedIds`) + Virtualized Window Renderer.', en: 'Feed Controller backed by Normalized Entity Store (`posts.byId`, `users.byId`, `feedIds`) and Virtualized Renderer.' },
          { vi: 'IntersectionObserver Sentinel (`rootMargin: 300px`) kích hoạt tải trước trang kế tiếp trước khi chạm đáy.', en: 'IntersectionObserver sentinel (`rootMargin: 300px`) prefetches the next cursor page ahead of scroll.' },
          { vi: 'Giao diện giữ nguyên bài viết cached khi offline qua IndexedDB / Service Worker.', en: 'Preserve cached feed snapshot in IndexedDB/SW for instant startup and offline reading.' },
        ],
      },
      dataModel: {
        heading: { vi: 'D — Mô hình dữ liệu chuẩn hóa (Normalized Schema)', en: 'D — Normalized Client Data Model' },
        bullets: [
          { vi: 'Entities tách riêng `usersById` và `postsById` giúp sửa tên/avatar tác giả ở 1 chỗ cập nhật đồng bộ toàn bộ feed.', en: 'Separating `usersById` and `postsById` guarantees single-source updates across all authored posts.' },
          { vi: 'Pagination Cursor state: `{ feedIds: string[], nextCursor: string | null, hasMore: boolean, status }` — tách trạng thái tránh cờ boolean mâu thuẫn.', en: 'Feed slice tracks `{ feedIds, nextCursor, hasMore, status }` using a clear state union.' },
        ],
      },
      interfaceApi: {
        heading: { vi: 'I — Giao tiếp API & Chống Race Condition', en: 'I — API Contracts & Network Resilience' },
        bullets: [
          { vi: '`GET /api/feed?cursor=opaque_token&limit=20` trả `{ items, users, nextCursor, hasMore }` (GraphQL hoặc BFF REST).', en: '`GET /api/feed?cursor=...&limit=20` returns normalized `{ items, users, nextCursor, hasMore }` payloads.' },
          { vi: '`POST /api/posts/:id/like` dùng mutex/in-flight lock hoặc sequence check để click Like/Unlike nhanh không lệch state.', en: 'Serialize or version rapid like/unlike toggles so out-of-order responses never revert newer clicks.' },
        ],
      },
      optimizations: {
        heading: { vi: 'O — Tối ưu hiệu năng & Trải nghiệm', en: 'O — Performance & UX Optimizations' },
        bullets: [
          { vi: 'List Virtualization biến 5.000 bài cuộn liên tục chỉ giữ ~15 DOM nodes + Variable Height ResizeObserver cache.', en: 'List Virtualization keeps active DOM nodes bounded (~15 rows) even after hours of scrolling.' },
          { vi: 'Ảnh đầu tiên gắn `fetchpriority="high"`, các ảnh dưới dùng `srcset` + WebP + `loading="lazy"` + `aspect-ratio` cố định chống CLS.', en: 'First hero media gets `fetchpriority="high"`; remaining images use `srcset` WebP, `loading="lazy"`, and fixed `aspect-ratio` boxes.' },
        ],
      },
    },
    decisions: [
      {
        id: 'nf-d1',
        prompt: {
          vi: 'Nên chọn chiến lược phân trang nào cho API Feed khi người dùng mới đăng bài liên tục vào đầu danh sách?',
          en: 'Which pagination strategy should power the Feed API when new posts continuously insert at the top?',
        },
        options: [
          {
            label: { vi: 'Offset Pagination (`?page=2&limit=20`)', en: 'Offset Pagination (`?page=2&limit=20`)' },
            isOptimal: false,
            tradeoff: {
              vi: 'Chưa tối ưu: Khi có 2 bài mới chèn vào đầu lúc user đang đọc Page 1, Page 2 sẽ trả lại trùng 2 bài cuối của Page 1!',
              en: 'Suboptimal: Any top insertions shift row offsets and duplicate previously viewed posts on Page 2.',
            },
          },
          {
            label: { vi: 'Cursor Pagination (`?after=post_891&limit=20`) kèm tie-breaker ID', en: 'Cursor Pagination (`?after=post_891&limit=20`) with unique ID tie-breaker' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: Neo chắc chắn theo ID/timestamp cuối đã thấy, không trùng/sót bài viết và query DB O(log N) qua index.',
              en: 'Optimal: Anchors cleanly after the last seen item with zero drift and fast indexed DB queries.',
            },
          },
        ],
      },
      {
        id: 'nf-d2',
        prompt: {
          vi: 'Cách lưu trữ State của Post và Author trên client để tránh hiển thị thông tin tác giả lệch nhau giữa các bài viết?',
          en: 'How should Posts and Authors be stored in client state so author profile updates never drift across feed cards?',
        },
        options: [
          {
            label: { vi: 'Normalized Entity Store (`users.byId` + `posts.byId` + `feedIds`)', en: 'Normalized Entity Store (`users.byId` + `posts.byId` + `feedIds`)' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: Mỗi User chỉ tồn tại 1 bản ghi duy nhất, cập nhật avatar/tên đạt O(1) và tự đồng bộ toàn feed.',
              en: 'Optimal: Single source of truth per entity enables O(1) profile updates across every post.',
            },
          },
          {
            label: { vi: 'Lồng thẳng object `author` vào từng phần tử trong mảng `posts[]`', en: 'Embed duplicated `author` objects inside each element of `posts[]`' },
            isOptimal: false,
            tradeoff: {
              vi: 'Dễ lỗi: Sửa thông tin user phải quét và cập nhật lại hàng trăm object trùng lặp trong mảng.',
              en: 'Risky: Mutating one nested post copy leaves stale author data everywhere else.',
            },
          },
        ],
      },
      {
        id: 'nf-d3',
        prompt: {
          vi: 'Khi người dùng đã cuộn qua 2.000 bài viết có ảnh và video, giải pháp nào giữ tab trình duyệt không giật lag hoặc crash RAM?',
          en: 'After scrolling past 2,000 rich media posts, what keeps memory usage and scroll FPS steady?',
        },
        options: [
          {
            label: { vi: 'Giữ toàn bộ 2.000 DOM nodes trong trang với `display: block`', en: 'Keep all 2,000 DOM cards mounted' },
            isOptimal: false,
            tradeoff: {
              vi: 'Gây nghẽn Layout/Memory nặng nề trên thiết bị di động.',
              en: 'Massive DOM layout/memory bloat eventually freezes or crashes mobile tabs.',
            },
          },
          {
            label: { vi: 'Dynamic-height List Virtualization + ResizeObserver offset cache + pause video ngoài viewport', en: 'Dynamic-height List Virtualization + ResizeObserver cache + pause off-screen media' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: Chỉ giữ ~15 bài trong DOM quanh khung nhìn và giải phóng media decoder ngoài màn hình.',
              en: 'Optimal: Bounds live DOM nodes to the viewport window and unloads off-screen video buffers.',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'autocomplete-search',
    title: { vi: '2. Autocomplete / Typeahead Search', en: '2. Autocomplete / Typeahead Search' },
    subtitle: {
      vi: 'Ô tìm kiếm gợi ý tức thì như Google/Command Palette: Debounce, Prefix Cache, Out-of-order Race Guard, ARIA Combobox và IME.',
      en: 'Instant search suggestions: Debouncing, prefix caching, AbortController race guards, ARIA combobox keyboard nav, and IME handling.',
    },
    difficulty: 'easy',
    iconName: 'Search',
    relatedTopicIds: [
      'net-debounce-throttle',
      'race-conditions',
      'caching-expiry',
      'keyboard-interactions',
      'wai-aria',
      'ime',
    ],
    radio: {
      requirements: {
        heading: { vi: 'R — Yêu cầu hệ thống Autocomplete', en: 'R — Search Requirements' },
        bullets: [
          { vi: 'Gợi ý kết quả xuất hiện nhanh (<100ms với cache hit, <300ms khi gọi mạng), không lag khi gõ nhanh.', en: 'Sub-100ms cached suggestions and responsive network lookups without keystroke stutter.' },
          { vi: 'Không bao giờ hiển thị kết quả cũ của từ khóa trước đè lên từ khóa mới gõ.', en: 'Never render stale out-of-order responses over newer queries.' },
          { vi: 'Hỗ trợ đầy đủ phím Mũi tên Lên/Xuống, Enter, Escape (ARIA Combobox) và bộ gõ IME Tiếng Việt/CJK.', en: 'Complete keyboard navigation (`role="combobox"`), screen reader `aria-live`, and CJK/Vietnamese IME safety.' },
        ],
      },
      architecture: {
        heading: { vi: 'A — Kiến trúc Search Engine phía Client', en: 'A — Client Architecture' },
        bullets: [
          { vi: 'Input Controller kiểm tra `isComposing` -> Trailing Debounce (200ms) -> Prefix LRU Cache Lookup -> Fetch Manager (`AbortController` + Seq ID).', en: 'Input checks `isComposing` -> 200ms Debounce -> LRU Prefix Cache -> Fetch Manager (`AbortController` + Seq ID).' },
          { vi: 'Popup Dropdown đặt `role="listbox"` gắn `aria-activedescendant` giữ focus tại `<input>` để vừa bấm Arrow vừa sửa chữ liên tục!', en: 'Manage highlight via `aria-activedescendant` so keyboard focus stays inside `<input>` during Arrow navigation.' },
        ],
      },
      dataModel: {
        heading: { vi: 'D — Cache & Suggestion Model', en: 'D — Cache & State Model' },
        bullets: [
          { vi: 'LRU Cache map `normalizedQuery` (`trim().toLowerCase()`) -> `{ results, expiresAt }` (TTL 60s, maxSize 100 entries).', en: 'Normalized query keys in a bounded LRU + TTL cache (e.g., 100 queries, 60s expiry).' },
          { vi: 'Hỗ trợ làm sạch highlight từ khóa khớp an toàn bằng React text splitting (tuyệt đối không dùng `innerHTML` gây XSS!).', en: 'Highlight matched substrings safely via split React spans—never `dangerouslySetInnerHTML`.' },
        ],
      },
      interfaceApi: {
        heading: { vi: 'I — Giao tiếp API & Tín hiệu hủy', en: 'I — Search API & Cancellation' },
        bullets: [
          { vi: '`GET /api/search?q=encodeURIComponent(query)&limit=8` truyền `signal: abortController.signal`.', en: '`GET /api/search?q=...&limit=8` wired to `AbortController.signal`.' },
          { vi: 'Mỗi response xử lý xong chỉ cập nhật UI nếu `reqId === latestReqId`.', en: 'Discard any response whose sequence token lags `latestReqId`.' },
        ],
      },
      optimizations: {
        heading: { vi: 'O — Tối ưu nâng cao', en: 'O — Edge Cases & Optimizations' },
        bullets: [
          { vi: 'Nếu từ khóa `"reac"` đã trả về rỗng `[]`, không cần gọi mạng thêm cho `"react"` hoặc `"reactjs"` (hoặc lọc cục bộ trên prefix cache!).', en: 'Filter locally from cached superset prefix results when possible, cutting redundant API calls.' },
          { vi: 'Thông báo số lượng kết quả cho trình đọc màn hình bằng vùng `aria-live="polite"` ("8 gợi ý khả dụng").', en: 'Announce result counts to assistive tech using an `aria-live="polite"` status node.' },
        ],
      },
    },
    decisions: [
      {
        id: 'ac-d1',
        prompt: {
          vi: 'Người dùng gõ nhanh `"r"` (server mất 700ms) rồi gõ `"re"` (server mất 120ms). Làm sao ngăn kết quả `"r"` về sau ghi đè mất `"re"`?',
          en: 'The user types `"r"` (700ms response) then `"re"` (120ms response). How do you prevent `"r"` from overwriting `"re"`?',
        },
        options: [
          {
            label: { vi: 'AbortController hủy request cũ + kiểm tra Sequence ID trước khi setState', en: 'Cancel prior request via AbortController + verify Sequence ID before setState' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: Vừa ngắt kết nối cũ tiết kiệm băng thông, vừa bảo vệ tuyệt đối UI state.',
              en: 'Optimal: Cancels stale network flights and guarantees only the latest query updates UI.',
            },
          },
          {
            label: { vi: 'Tăng debounce lên 1.500ms để chờ chắc chắn mạng xong', en: 'Set debounce to 1,500ms' },
            isOptimal: false,
            tradeoff: {
              vi: 'Quá chậm: Người dùng chờ 1.5 giây mới thấy gợi ý là trải nghiệm tệ hại, mà vẫn không giải quyết race condition nếu gõ cách nhau đúng 1.6s!',
              en: 'Sluggish UX (1.5s freeze) and still fails whenever two queries cross in flight.',
            },
          },
        ],
      },
      {
        id: 'ac-d2',
        prompt: {
          vi: 'Với người dùng gõ Tiếng Việt Telex/VNI hoặc tiếng Nhật IME, khi bấm `Enter` để chọn chữ gợi ý từ bộ gõ, sự kiện `onKeyDown` nên xử lý thế nào?',
          en: 'When a Vietnamese or Japanese IME user hits `Enter` to confirm an IME candidate word, how should `onKeyDown` behave?',
        },
        options: [
          {
            label: { vi: 'Submit form tìm kiếm ngay lập tức ở mọi lần bấm Enter', en: 'Submit search immediately on every Enter keydown' },
            isOptimal: false,
            tradeoff: {
              vi: 'Lỗi nặng: Cắt ngang chữ đang gõ dở giữa phiên IME trước khi chữ hoàn chỉnh hình thành.',
              en: 'Bug: Prematurely submits half-composed phonetic characters before IME finishes.',
            },
          },
          {
            label: { vi: 'Kiểm tra `if (e.nativeEvent.isComposing || e.keyCode === 229) return;` trước khi xử lý Enter', en: 'Guard with `if (e.nativeEvent.isComposing || e.keyCode === 229) return;`' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: Cho phép IME chốt từ hoàn chỉnh rồi lần Enter tiếp theo mới thực sự tìm kiếm.',
              en: 'Optimal: Lets the IME commit the composed word cleanly before handling form submission.',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'realtime-chat',
    title: { vi: '3. Real-Time Chat (Slack / Messenger)', en: '3. Real-Time Chat (Slack / Messenger)' },
    subtitle: {
      vi: 'Ứng dụng chat hai chiều: WebSocket Heartbeat + Jitter Backoff, Offline Outbox Queue, Bi-directional Scroll Anchoring và Deduplication.',
      en: 'Full-duplex chat architecture: WebSocket heartbeat + jittered reconnect, offline outbox, scroll anchoring, and message deduplication.',
    },
    difficulty: 'hard',
    iconName: 'MessageSquare',
    relatedTopicIds: [
      'websockets',
      'retries-backoff-jitter',
      'net-offline-usage',
      'pattern-infinite-scrolling',
      'ime',
      'xss',
    ],
    radio: {
      requirements: {
        heading: { vi: 'R — Yêu cầu Chat Client thực chiến', en: 'R — Real-Time Chat Requirements' },
        bullets: [
          { vi: 'Gửi nhận tin nhắn tức thời hai chiều (<100ms), hiển thị trạng thái Đang gõ (typing) và Online/Offline presence.', en: 'Low-latency bidirectional messaging (<100ms), typing indicators, and live presence.' },
          { vi: 'Tin nhắn gửi khi rớt mạng/tàu điện ngầm không bị mất — hiển thị trạng thái "Đang chờ gửi" và tự đồng bộ lại theo đúng thứ tự.', en: 'Offline resilience: preserve unsent drafts in local queue and deliver FIFO on reconnect without duplicates.' },
          { vi: 'Cuộn xem tin cũ ở trên không làm giật nhảy màn hình, và chặn gửi nhầm khi gõ IME.', en: 'Smooth infinite upward history scrolling with scroll anchoring plus IME-safe Enter composer.' },
        ],
      },
      architecture: {
        heading: { vi: 'A — Kiến trúc Socket + Outbox + Store', en: 'A — Socket, Outbox & Store Architecture' },
        bullets: [
          { vi: 'WebSocket Manager chạy tách biệt khỏi UI React (SharedWorker/Singleton): Ping/Pong Heartbeat mỗi 25s, Reconnect bằng Exponential Backoff + Full Jitter.', en: 'Decoupled WebSocket Manager handles 25s heartbeats and jittered exponential backoff reconnects.' },
          { vi: 'IndexedDB Outbox lưu tin nhắn chưa nhận ACK từ server, gắn `clientMessageId` (UUID) để server & client chống trùng lặp (idempotency).', en: 'IndexedDB Outbox stores unacknowledged messages stamped with `clientMessageId` UUIDs for deduplication.' },
        ],
      },
      dataModel: {
        heading: { vi: 'D — Message & Channel Schema', en: 'D — Message & Channel Data Model' },
        bullets: [
          { vi: 'Channel messages chuẩn hóa: `{ id, clientMessageId, channelId, senderId, text, status: "sending" | "sent" | "failed", createdAt }`.', en: 'Normalized messages include `{ id, clientMessageId, channelId, senderId, text, status, createdAt }`.' },
          { vi: 'Tách danh sách thành viên (`usersById`) và map tin nhắn theo `channelId` giúp đổi kênh chat tức thì từ cache.', en: 'Partition cached timelines by `channelId` alongside shared `usersById` records.' },
        ],
      },
      interfaceApi: {
        heading: { vi: 'I — Giao thức WS Frames + REST History Catch-up', en: 'I — WS Frames + REST Catch-Up API' },
        bullets: [
          { vi: 'WS gửi `message.send`, nhận `message.ack` (khớp `clientMessageId` -> `sent`), `message.new`, `typing.update`.', en: 'WebSocket frames: `message.send`, `message.ack` (reconciling `clientMessageId`), `message.new`, and throttled `typing.update`.' },
          { vi: 'Ngay khi WS reconnect sau khi rớt mạng, gọi `GET /channels/:id/messages?after=lastMsgId` để vá các tin nhắn lỡ trong lúc offline!', en: 'Upon WS reconnect, sync missed messages via `GET /messages?after=lastReceivedId`.' },
        ],
      },
      optimizations: {
        heading: { vi: 'O — Scroll Anchoring, Typing Throttle & Security', en: 'O — Anchoring, Throttling & XSS Safety' },
        bullets: [
          { vi: 'Prepend lịch sử tin cũ tính `scrollTop += newScrollHeight - prevScrollHeight` trong `useLayoutEffect`; tin mới ở đáy chỉ auto-scroll xuống nếu user đang ở gần đáy!', en: 'Prepending history preserves scroll delta; incoming bottom messages auto-scroll ONLY when already near the bottom.' },
          { vi: 'Throttle sự kiện gửi `typing` mỗi 2–3 giây và escape sạch Markdown/link tránh Stored XSS trong phòng chat!', en: 'Throttle outbound typing indicators (2-3s) and strictly sanitize rendered chat markdown/links against Stored XSS.' },
        ],
      },
    },
    decisions: [
      {
        id: 'rc-d1',
        prompt: {
          vi: 'Người dùng bấm Gửi 1 tin nhắn đúng lúc mất Wi-Fi (chưa nhận ACK), sau đó mạng tự nối lại. Làm sao không mất tin và không bị gửi trùng thành 2 tin giống nhau?',
          en: 'A message is sent during a brief Wi-Fi drop before ACK returns. How do you ensure zero message loss and zero duplicates on retry?',
        },
        options: [
          {
            label: { vi: 'Gắn `clientMessageId` (UUID) vào tin nhắn nằm trong Outbox Queue -> server deduplicate theo ID này và trả ACK cập nhật `status: "sent"`', en: 'Stamp every outbound draft with a `clientMessageId` UUID in a persistent Outbox -> server deduplicates and returns ACK' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: Idempotent đầu cuối, tin hiển thị ngay với spinner nhỏ và tự khớp không bao giờ nhân đôi.',
              en: 'Optimal: End-to-end idempotency preserves order and seamlessly transitions status without duplicates.',
            },
          },
          {
            label: { vi: 'Xóa tin nhắn khỏi UI và bắt người dùng gõ lại sau khi có mạng', en: 'Discard the draft and ask the user to retype later' },
            isOptimal: false,
            tradeoff: {
              vi: 'Trải nghiệm kém: Người dùng mất dữ liệu vừa gõ.',
              en: 'Hostile UX causing lost user messages.',
            },
          },
        ],
      },
      {
        id: 'rc-d2',
        prompt: {
          vi: 'Khi có tin nhắn mới đến ở cuối phòng chat, có nên luôn ép `scrollToBottom()` trong mọi trường hợp không?',
          en: 'Should incoming messages always force `scrollToBottom()`?',
        },
        options: [
          {
            label: { vi: 'Chỉ auto-scroll nếu user đang ở gần đáy (ví dụ cách đáy <= 100px); nếu đang cuộn lên đọc tin cũ thì hiện pill "New messages ↓"!', en: 'Auto-scroll ONLY when already near the bottom; if reading older history, show a "New messages ↓" jump pill instead' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: Không giật màn hình kéo người dùng xuống đáy khi họ đang đọc lại tin nhắn từ hôm qua.',
              en: 'Optimal: Respects reader focus while keeping new activity one click away.',
            },
          },
          {
            label: { vi: 'Luôn ép cuộn xuống đáy ngay lập tức', en: 'Always force scroll to bottom unconditionally' },
            isOptimal: false,
            tradeoff: {
              vi: 'Gây ức chế cực độ ở nhóm chat đông người vì user không thể đọc nổi tin nhắn cũ phía trên.',
              en: 'Makes reading earlier history impossible in active channels.',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'collaborative-editor',
    title: { vi: '4. Collaborative Rich-Text Editor (Notion / Docs)', en: '4. Collaborative Editor (Notion / Google Docs)' },
    subtitle: {
      vi: 'Cộng tác nhiều người đồng thời + Offline: CRDT/OT, Per-User Undo/Redo Stacks, Event Sourcing và Viewport Rendering.',
      en: 'Multiplayer real-time + offline editing: CRDT/OT convergence, local-only Undo/Redo history, Event Sourcing, and block rendering.',
    },
    difficulty: 'hard',
    iconName: 'FileEdit',
    relatedTopicIds: [
      'conflict-resolution',
      'undo-redo',
      'event-sourcing',
      'offline-first',
      'websockets',
      'keyboard-interactions',
    ],
    radio: {
      requirements: {
        heading: { vi: 'R — Yêu cầu trình soạn thảo cộng tác', en: 'R — Collaborative Editor Requirements' },
        bullets: [
          { vi: 'Nhiều người gõ đồng thời trên cùng đoạn văn, hiện con trỏ màu theo từng user theo thời gian thực (<80ms).', en: 'Concurrent multi-user editing on shared paragraphs with live remote presence cursors.' },
          { vi: 'Chỉnh sửa mượt mà khi offline trên máy bay rồi tự hợp nhất không mất chữ khi nối mạng lại.', en: 'Full offline editing in IndexedDB with conflict-free convergence upon reconnection.' },
          { vi: 'Bấm `Ctrl+Z` (Undo) CHỈ hoàn tác thao tác của chính tôi chứ KHÔNG được hoàn tác nhầm chữ đồng nghiệp vừa gõ!', en: 'Local-user `Ctrl+Z` undoes ONLY my own edits without reverting teammates’ concurrent work.' },
        ],
      },
      architecture: {
        heading: { vi: 'A — Kiến trúc CRDT + Local-First Storage', en: 'A — CRDT + Local-First Architecture' },
        bullets: [
          { vi: 'Lớp Document Engine dựa trên **CRDT** (như Yjs / Automerge) hoặc **OT**: mỗi ký tự mang ID duy nhất `(clientId, logicalClock)` giúp trộn không phụ thuộc thứ tự gói tin đến!', en: 'Document state backed by a **CRDT** (e.g. Yjs) assigning every character/block a unique `(clientId, clock)` ID.' },
          { vi: 'Local Persistence lưu binary delta vào IndexedDB mỗi 500ms; đồng bộ qua WebSocket binary frame hoặc Sync API.', en: 'Persist binary CRDT snapshots/deltas in IndexedDB and stream compact binary updates over WebSockets.' },
        ],
      },
      dataModel: {
        heading: { vi: 'D — Block Tree & Presence State', en: 'D — Document Tree & Ephemeral Presence' },
        bullets: [
          { vi: 'Tách **Persistent Document CRDT** (nội dung block, văn bản, bảng) khỏi **Ephemeral Awareness/Presence** (tọa độ con trỏ, màu, vùng bôi đen — không ghi vào undo stack hay DB!).', en: 'Separate persistent CRDT document ops from ephemeral Awareness state (cursor selections, active user badges).' },
          { vi: 'Scoped UndoManager: theo dõi riêng các transaction origin là `localUser` để `Undo` tạo ra phép đảo ngược cục bộ hợp lệ trên CRDT.', en: 'A scoped UndoManager tracks transactions by local origin so `Ctrl+Z` cleanly inverts only local operations.' },
        ],
      },
      interfaceApi: {
        heading: { vi: 'I — Sync Protocol & Binary Delta Frames', en: 'I — Binary Sync & Awareness Protocol' },
        bullets: [
          { vi: 'Trao đổi State Vector lúc bắt đầu mở file để chỉ truyền đúng phần delta thiếu thay vì tải lại toàn bộ lịch sử.', en: 'Exchange compact State Vectors on connect to transfer strictly missing document deltas.' },
          { vi: 'Batch các phím gõ nhanh hoặc gom `Awareness` cursor updates ở tần suất 50–100ms để không nghẽn WebSocket.', en: 'Batch rapid edit ops and throttle awareness cursor broadcasts to 50-100ms intervals.' },
        ],
      },
      optimizations: {
        heading: { vi: 'O — Hiệu năng tài liệu dài & Snapshot Compaction', en: 'O — Long Document Perf & Compaction' },
        bullets: [
          { vi: 'Block-level Virtualization / `content-visibility: auto` cho tài liệu 10.000+ dòng block.', en: 'Virtualize or isolate blocks via `content-visibility: auto` on multi-thousand-block docs.' },
          { vi: 'Nén lịch sử CRDT định kỳ (Garbage Collection / Snapshot compaction) để tránh kích thước file phình vô hạn.', en: 'Compact historical tombstones via periodic snapshots so document load times stay fast.' },
        ],
      },
    },
    decisions: [
      {
        id: 'ce-d1',
        prompt: {
          vi: 'Khi User A nhấn `Ctrl+Z` (Undo) trong lúc User B vừa gõ thêm 1 câu ở đoạn bên dưới, `Ctrl+Z` nên làm gì?',
          en: 'When User A hits `Ctrl+Z` while User B concurrently added a sentence below, what must `Ctrl+Z` revert?',
        },
        options: [
          {
            label: { vi: 'Đưa toàn bộ tài liệu quay về snapshot 5 giây trước (xóa luôn câu của User B)', en: 'Revert the entire shared document snapshot (erasing User B’s sentence)' },
            isOptimal: false,
            tradeoff: {
              vi: 'Lỗi thảm họa: Bạn bấm Undo lại đi xóa bài của đồng nghiệp đang viết chung!',
              en: 'Broken multiplayer UX: undoing your typo wipes out your teammate’s work.',
            },
          },
          {
            label: { vi: 'Dùng Scoped UndoManager theo dõi riêng origin `local` để sinh inverse operation trên CRDT chỉ hoàn tác đúng thao tác của User A', en: 'Use a scoped local-origin UndoManager emitting an inverse CRDT op strictly for User A’s edits' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: Hành động Undo an toàn tuyệt đối, tôn trọng cộng tác đồng thời kể cả khi các vị trí chữ phía trên đã dịch chuyển!',
              en: 'Optimal: Safely inverts only your own operations even as remote edits shift surrounding offsets.',
            },
          },
        ],
      },
      {
        id: 'ce-d2',
        prompt: {
          vi: 'Vì sao dữ liệu con trỏ đang di chuyển (`awareness/cursor position`) KHÔNG nên lưu chung vào Event Log / Document CRDT?',
          en: 'Why must remote cursor/selection coordinates (`awareness`) be kept separate from the persistent CRDT document log?',
        },
        options: [
          {
            label: { vi: 'Vì cursor thay đổi hàng chục lần/giây và mang tính tạm thời — nhét vào CRDT sẽ làm phình to vĩnh viễn lịch sử tài liệu và ô nhiễm Undo stack!', en: 'Cursors change constantly and are ephemeral—storing them in the document log bloats history and pollutes undo stacks' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: Tách Awareness channel nhẹ gọn gửi qua WS broadcast rồi tự hết hạn khi user rời tab.',
              en: 'Optimal: Dedicated ephemeral awareness state stays fast, zero-bloat, and automatically expires on disconnect.',
            },
          },
          {
            label: { vi: 'Vì WebSockets không gửi được số tọa độ.', en: 'WebSockets cannot send coordinates.' },
            isOptimal: false,
            tradeoff: {
              vi: 'Sai: WebSockets gửi thoải mái, vấn đề nằm ở phình lưu trữ lịch sử và undo.',
              en: 'Incorrect: transport works fine; persistence bloat and undo pollution are the real reasons.',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'ecommerce-storefront',
    title: { vi: '5. High-Traffic E-Commerce Storefront', en: '5. High-Traffic E-Commerce Storefront' },
    subtitle: {
      vi: 'Tối đa chuyển đổi & SEO: ISR cho hàng triệu SKU, Image CDN Responsive, Core Web Vitals, JSON-LD và Checkout Idempotency.',
      en: 'Maximize conversion & organic search: ISR for huge SKU catalogs, Image CDNs, Core Web Vitals, JSON-LD, and idempotent checkout.',
    },
    difficulty: 'medium',
    iconName: 'ShoppingBag',
    relatedTopicIds: [
      'isr',
      'image-cdn',
      'responsive-images',
      'core-web-vitals',
      'json-structured-data',
      'restful',
      'csp',
    ],
    radio: {
      requirements: {
        heading: { vi: 'R — Yêu cầu Thương mại điện tử', en: 'R — Storefront Requirements' },
        bullets: [
          { vi: '100.000+ trang sản phẩm (PDP) đạt LCP < 2.0s, CLS < 0.05 để đứng top Google Shopping và tối đa tỷ lệ thêm giỏ hàng.', en: '100,000+ product detail pages hitting LCP < 2.0s and CLS < 0.05 for SEO rank and checkout conversion.' },
          { vi: 'Rich Snippets hiện rõ Giá + Tình trạng kho + Sao đánh giá ngay trên trang kết quả Google.', en: 'Google Search Rich Snippets displaying price, availability, and ratings.' },
          { vi: 'Nút Thanh toán chống click đúp trừ tiền 2 lần khi mạng giật lag.', en: 'Fault-tolerant checkout preventing duplicate charges on retries or double clicks.' },
        ],
      },
      architecture: {
        heading: { vi: 'A — Kiến trúc Hybrid ISR + Island + Edge', en: 'A — Hybrid ISR + Islands + Edge Architecture' },
        bullets: [
          { vi: 'Trang danh mục & PDP dùng **ISR** kết hợp **On-Demand Revalidation** qua webhook từ hệ thống kho/CMS; Giỏ hàng & Nút mua dùng Client Island tải giá/tồn kho mới nhất sau hydration hoặc via Edge KV.', en: 'Static/ISR edge-cached shell for catalog & PDP info + On-demand webhook revalidation, paired with dynamic Client Islands for live cart/stock.' },
          { vi: 'Sitemap Index phân mảnh (<= 50.000 URL/file) tự cập nhật cho crawler khám phá SKU mới.', en: 'Sharded XML `<sitemapindex>` updating crawlers on new SKUs cleanly.' },
        ],
      },
      dataModel: {
        heading: { vi: 'D — Catalog, Variants & Checkout State', en: 'D — SKU Variants & Cart State' },
        bullets: [
          { vi: 'Lưu Giỏ hàng đồng bộ giữa LocalStorage/Cookie (cho khách vãng lai) và Server Cart khi đăng nhập (merge cart items thông minh!).', en: 'Persist guest cart locally and merge cleanly into server user cart upon authentication.' },
          { vi: 'Đính kèm `Idempotency-Key` UUID duy nhất cho mỗi phiên bấm nút Thanh toán.', en: 'Attach a per-checkout-attempt `Idempotency-Key` UUID to payment mutations.' },
        ],
      },
      interfaceApi: {
        heading: { vi: 'I — SEO Metadata, JSON-LD & Payment Guards', en: 'I — SEO Contracts & Payment APIs' },
        bullets: [
          { vi: 'Nhúng `<script type="application/ld+json">` schema `Product` + `Offer` + `AggregateRating` ngay trong HTML SSR/ISR (escape `<` -> `\\u003c`).', en: 'Server-render Schema.org Product JSON-LD inside initial HTML with `<` safely escaped.' },
          { vi: '`<link rel="canonical">` chuẩn hóa về URL sản phẩm gốc bất chấp query param `?color=red&utm_source=ig`.', en: 'Canonical tags strip tracking/filter query parameters back to authoritative product URLs.' },
        ],
      },
      optimizations: {
        heading: { vi: 'O — Tối ưu Media, CWV & Bảo mật thanh toán', en: 'O — Image Pipeline, CWV & Security' },
        bullets: [
          { vi: 'Ảnh sản phẩm chính đầu tiên: `fetchpriority="high"`, `loading="eager"`, Image CDN AVIF/WebP `srcset`, `width/height` giữ khung 0 CLS; gallery phụ `loading="lazy"`.', en: 'Primary product photo gets `fetchpriority="high"`, responsive AVIF/WebP `srcset`, and locked aspect ratio; carousel thumbnails lazy-load.' },
          { vi: 'Cài đặt CSP + Subresource Integrity (SRI) nếu nhúng cổng thanh toán Stripe/VNPAY chống tấn công Magecart skim thẻ!', en: 'Enforce strict CSP + SRI on payment frames to thwart third-party script skimming (Magecart).' },
        ],
      },
    },
    decisions: [
      {
        id: 'ec-d1',
        prompt: {
          vi: 'Website có 250.000 trang sản phẩm nhưng mỗi ngày chỉ có ~500 sản phẩm đổi mô tả/giá. Nên chọn chiến lược render nào cho phần thông tin tĩnh sản phẩm?',
          en: 'You manage 250,000 product pages where ~500 change price or copy daily. Which rendering architecture fits best?',
        },
        options: [
          {
            label: { vi: 'Static Site Generation (SSG) thuần: build lại toàn bộ 250.000 trang mỗi lần sửa giá 1 đôi giày', en: 'Pure SSG: rebuild all 250,000 pages on every single price update' },
            isOptimal: false,
            tradeoff: {
              vi: 'Quá chậm: Thời gian CI build hàng tiếng đồng hồ làm giá mới không thể cập nhật kịp.',
              en: 'Prohibitively slow CI build queues delay price updates by hours.',
            },
          },
          {
            label: { vi: 'ISR kết hợp On-Demand Revalidation theo SKU tag + tải trạng thái tồn kho nhạy cảm qua island nhỏ', en: 'ISR + On-Demand Revalidation per SKU cache tag + lightweight live stock check' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: Tốc độ CDN Edge <30ms tức thì, chỉ tái tạo đúng 1 trang sản phẩm vừa đổi giá trong 1 giây!',
              en: 'Optimal: Sub-30ms CDN cache speed with instant targeted invalidation per edited SKU.',
            },
          },
        ],
      },
      {
        id: 'ec-d2',
        prompt: {
          vi: 'Người dùng bấm nút "Place Order" trên mạng di động chập chờn và client thực hiện retry sau timeout. Làm sao chắc chắn không tạo 2 đơn hàng?',
          en: 'A user taps "Place Order" on flaky mobile data and a timeout retry triggers. How do you guarantee at-most-once order creation?',
        },
        options: [
          {
            label: { vi: 'Sinh `Idempotency-Key` duy nhất cho phiên thanh toán (kèm khóa nút submit trong lúc in-flight) để server deduplicate', en: 'Attach a per-attempt `Idempotency-Key` header (plus disable button while in-flight) so backend deduplicates' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: An toàn tuyệt đối kể cả khi mất response và phải retry hợp lệ.',
              en: 'Optimal: Guarantees safe retry deduplication even when network responses drop mid-flight.',
            },
          },
          {
            label: { vi: 'Gửi thẳng `POST /orders` bằng HTTP GET để tự cache', en: 'Use HTTP GET instead of POST' },
            isOptimal: false,
            tradeoff: {
              vi: 'Vi phạm HTTP semantics nặng nề và lộ dữ liệu nhạy cảm lên URL logs.',
              en: 'Violates HTTP semantics and leaks order tokens into browser/proxy URL logs.',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'video-streaming',
    title: { vi: '6. Adaptive Video Streaming (YouTube / Netflix)', en: '6. Adaptive Video Streaming (YouTube / Netflix)' },
    subtitle: {
      vi: 'Trình phát video quy mô lớn: HLS/DASH MSE Adaptive Bitrate (ABR), Buffer Eviction, Seek Sprite Thumbnails & Keyboard A11y.',
      en: 'Video platform player design: HLS/DASH MSE ABR ladders, sliding buffer eviction, seek preview sprites, and accessible theater controls.',
    },
    difficulty: 'hard',
    iconName: 'PlayCircle',
    relatedTopicIds: [
      'media-streaming',
      'perf-adaptive-loading',
      'keyboard-interactions',
      'caching-memoizing',
      'above-the-fold',
      'list-virtualization',
    ],
    radio: {
      requirements: {
        heading: { vi: 'R — Yêu cầu Trình phát Video Streaming', en: 'R — Video Streaming Player Requirements' },
        bullets: [
          { vi: 'Khởi phát video nhanh (<1s Time-to-First-Frame), không khựng hình giữa chừng khi băng thông tăng giảm thất thường.', en: 'Fast Time-to-First-Frame (<1s) with stall-free playback across fluctuating cellular/Wi-Fi speeds.' },
          { vi: 'Tua thanh seekbar mượt mà kèm thumbnail xem trước, hỗ trợ phụ đề đa ngôn ngữ (`<track>` WebVTT) và điều khiển đầy đủ bằng bàn phím.', en: 'Smooth scrubbing with preview thumbnails, localized WebVTT captions, and full keyboard accessibility.' },
          { vi: 'Giới hạn RAM cho các phim dài 3 tiếng (không nhồi toàn bộ GB video vào bộ nhớ tab!).', en: 'Bounded tab memory for 3-hour 4K movies without OOM crashes.' },
        ],
      },
      architecture: {
        heading: { vi: 'A — Kiến trúc Player Engine (MSE + ABR + Buffer)', en: 'A — Player Architecture (MSE + ABR + Buffer)' },
        bullets: [
          { vi: 'Manifest Parser (HLS `.m3u8` / DASH `.mpd`) -> Bandwidth Estimator (EWMA) -> ABR Controller chọn Rung (360p/720p/1080p) -> Segment Fetcher (`AbortController`) -> MSE `SourceBuffer`.', en: 'Manifest Parser -> Bandwidth EWMA Estimator -> ABR Selector -> Cancellable Segment Fetcher -> MSE `SourceBuffer`.' },
          { vi: 'Tách riêng video stream và audio tracks để đổi ngôn ngữ thuyết minh hoặc chọn chất lượng không làm mất tiếng.', en: 'Demux video and audio tracks independently so bitrate switches or audio-track toggles stay seamless.' },
        ],
      },
      dataModel: {
        heading: { vi: 'D — Player State & Sliding Buffer Window', en: 'D — Player State & Buffer Management' },
        bullets: [
          { vi: 'Sliding Buffer Policy: tải trước `forwardBuffer = 20–30s` phía trước kim phát, đồng thời gọi `sourceBuffer.remove(0, currentTime - 30)` xóa bớt đoạn đã xem khỏi RAM!', en: 'Maintain a 20-30s forward buffer ahead of playhead while calling `sourceBuffer.remove()` on watched history >30s behind.' },
          { vi: 'Quality Ladder metadata lưu bitrate, codec (`av01`, `vp9`, `avc1`), width/height để tính vừa màn hình (không tải 4K trên khung mini-player 320px!).', en: 'Cap selected bitrate ladder resolution to actual player container size (avoid downloading 4K into a 320px mini-player).' },
        ],
      },
      interfaceApi: {
        heading: { vi: 'I — CDN Segment Delivery & Seek Preview Sprites', en: 'I — CDN Edge Segments & Sprite Maps' },
        bullets: [
          { vi: 'Các segment `.m4s` đánh số cố định bất biến được cache cực tốt tại CDN Edge (`Cache-Control: immutable`).', en: 'Immutable numbered `.m4s` chunks achieve ~99% CDN edge cache hit rates.' },
          { vi: 'Khi di chuột lên seekbar, đọc bảng tọa độ WebVTT chỉ vào 1 ảnh **Sprite Sheet** ghép 100 khung hình nhỏ thay vì gọi 100 request ảnh lẻ!', en: 'Use a single pre-fetched thumbnail **Sprite Sheet** mapped by timestamps instead of firing 100 separate preview image fetches.' },
        ],
      },
      optimizations: {
        heading: { vi: 'O — Accessibility, Preconnect & Hardware Decoding', en: 'O — A11y, Telemetry & Adaptive UX' },
        bullets: [
          { vi: 'Hỗ trợ phím tắt chuẩn YouTube (`Space/K` Play-Pause, `J/L` +/-10s, `M` Mute, `F` Fullscreen, `C` Captions) kèm `aria-valuenow` cho thanh trượt seekbar.', en: 'Keyboard shortcuts (`Space`/`K`, `J`/`L`, `M`, `F`, `C`) and accessible `role="slider"` scrubbers with WebVTT captions.' },
          { vi: 'Khi bật chế độ `Save-Data` hoặc khung player đang thu nhỏ (PiP/Mini-player), tự động khóa trần ở `480p` tiết kiệm băng thông.', en: 'Cap max ABR rung at 480p when `Save-Data` is enabled or while minimized in mini-player mode.' },
        ],
      },
    },
    decisions: [
      {
        id: 'vs-d1',
        prompt: {
          vi: 'Người dùng đang xem phim 4K ở phút thứ 90. Tại sao cần gọi `sourceBuffer.remove()` cho các đoạn video đã xem qua nhiều phút trước?',
          en: 'A viewer is 90 minutes into a 4K film. Why actively call `sourceBuffer.remove()` on earlier watched segments?',
        },
        options: [
          {
            label: { vi: 'Để giải phóng `SourceBuffer` tránh chạm giới hạn bộ nhớ trình duyệt (QuotaExceededError) và crash tab trên mobile', en: 'Frees MSE `SourceBuffer` memory to prevent `QuotaExceededError` stalls and mobile tab OOM crashes' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: Giữ kích thước buffer cửa sổ trượt ổn định vài chục giây quanh vị trí đang xem.',
              en: 'Optimal: Keeps memory usage flat across multi-hour 4K streams.',
            },
          },
          {
            label: { vi: 'Để tăng độ sáng màn hình video', en: 'Increases screen brightness' },
            isOptimal: false,
            tradeoff: {
              vi: 'Không liên quan đến màu sắc; `SourceBuffer` có giới hạn RAM nghiêm ngặt theo trình duyệt.',
              en: 'Unrelated to brightness; MSE buffer quotas are strictly capped by browsers.',
            },
          },
        ],
      },
      {
        id: 'vs-d2',
        prompt: {
          vi: 'Làm thế nào hiển thị ảnh xem trước (thumbnail preview) tức thì khi người dùng rê chuột dọc theo thanh tua video dài 1 giờ mà không làm nghẽn mạng?',
          en: 'How do video players display instant thumbnail previews when hovering across a 1-hour seekbar without firing 300 HTTP requests?',
        },
        options: [
          {
            label: { vi: 'Tải 1 hoặc vài ảnh Sprite Sheet ghép sẵn lưới thumbnail (kèm file WebVTT map mốc thời gian -> tọa độ `x,y,w,h`)', en: 'Fetch composite thumbnail Sprite Sheets paired with WebVTT timestamp coordinates (`xywh`)' },
            isOptimal: true,
            tradeoff: {
              vi: 'Tối ưu: 1 HTTP request duy nhất phục vụ hàng trăm mốc tua với phản hồi 0ms khi hover!',
              en: 'Optimal: One cacheable sprite grid serves hundreds of hover scrub points instantaneously.',
            },
          },
          {
            label: { vi: 'Tạo 360 thẻ `<video>` ẩn để chụp frame theo thời gian thực', en: 'Mount hidden `<video>` tags to decode thumbnails live' },
            isOptimal: false,
            tradeoff: {
              vi: 'Tốn hàng trăm MB RAM và nghẽn bộ giải mã phần cứng GPU.',
              en: 'Exhausts hardware video decoders and crashes browser tabs.',
            },
          },
        ],
      },
    ],
  },
];
