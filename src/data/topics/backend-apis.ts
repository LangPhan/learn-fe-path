import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const backendApisTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['restful'],
    mentalModel: {
      vi: 'Mỗi dữ liệu là một tài nguyên có URL định danh rõ ràng (/posts/42), tương tác qua đúng động từ HTTP (GET, POST, PUT/PATCH, DELETE) để tận dụng trọn vẹn HTTP cache, proxy và CDN.',
      en: 'Model data as addressable resource URLs (/posts/42) manipulated via standard HTTP methods (GET, POST, PUT, PATCH, DELETE), unlocking built-in browser/CDN caching and ETags.',
    },
    keyPoints: [
      { vi: 'GET an toàn và idempotent, dễ dàng cache tại CDN và trình duyệt qua Cache-Control & ETag / 304 Not Modified.', en: 'Safe idempotent GET endpoints integrate seamlessly with browser/CDN Cache-Control and ETag 304 revalidation.' },
      { vi: 'PUT thay thế toàn bộ bản ghi (idempotent); PATCH cập nhật một phần; POST tạo mới (dùng Idempotency-Key khi thanh toán).', en: 'PUT replaces whole resources idempotently; PATCH updates partially; POST creates (use Idempotency-Key for payments).' },
      { vi: 'HTTP status codes chuẩn hóa luồng xử lý lỗi: 2xx thành công, 304 dùng lại cache, 401/403 auth, 429 rate-limit, 5xx thử lại.', en: 'Semantic HTTP status codes drive predictable client handling: 304 cache reuse, 401/403 auth, 429 backoff, 5xx retry.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Hệ thống công khai cần cache CDN mạnh, đơn giản cho nhiều client/SDK khác nhau tiêu thụ.', en: 'Cache-heavy public APIs, CRUD services, and cross-team integrations valuing simplicity and HTTP caching.' },
      ],
      whenToAvoid: [
        { vi: 'Một màn hình cần ghép 6 bảng liên kết sâu dễ gây over-fetching hoặc N+1 waterfall trên mobile.', en: 'Deeply relational screens suffering severe over-fetching or N+1 REST roundtrips on mobile networks.' },
      ],
    },
    pitfalls: [
      { vi: 'Trả 200 OK kèm { error: true } trong body làm HTTP cache, monitoring và error interceptor hiểu nhầm là thành công.', en: 'Returning 200 OK with { error: true } breaks HTTP retry logic, caches, and observability tools.' },
    ],
    interviewTips: [
      { vi: 'Nêu rõ cơ chế ETag + If-None-Match -> 304 Not Modified giúp tiết kiệm băng thông khi dữ liệu không đổi.', en: 'Mention ETag + If-None-Match -> 304 Not Modified to eliminate redundant payload transfers on unchanged reads.' },
    ],
    example: {
      title: { vi: 'Mô phỏng REST Client hỗ trợ ETag (304) & Idempotency-Key', en: 'REST ETag 304 & Idempotency Simulation' },
      description: { vi: 'Chạy giả lập gọi GET nhận 304 tiết kiệm băng thông và POST kèm Idempotency-Key tránh tạo trùng đơn.', en: 'Simulate conditional GET ETag 304 revalidation and idempotent POST deduplication.' },
      mode: 'ts',
      code: `const serverResource = { etag: '"v1-abc"', data: { id: 1, title: 'Design Docs', stars: 120 } };
const idempotencyStore = new Map<string, any>();

function restGet(ifNoneMatch?: string) {
  if (ifNoneMatch === serverResource.etag) {
    return { status: 304, body: null, savedBytes: 240 };
  }
  return { status: 200, etag: serverResource.etag, body: serverResource.data };
}

function restCreateOrder(idempotencyKey: string, amount: number) {
  if (idempotencyStore.has(idempotencyKey)) {
    return { status: 200, deduplicated: true, order: idempotencyStore.get(idempotencyKey) };
  }
  const order = { orderId: 'ORD-' + Math.floor(Math.random() * 900 + 100), amount };
  idempotencyStore.set(idempotencyKey, order);
  return { status: 201, deduplicated: false, order };
}

const first = restGet();
console.log('1st GET:', first);
console.log('2nd GET w/ ETag:', restGet(first.etag));

const key = 'pay-req-99';
console.log('1st POST:', restCreateOrder(key, 49));
console.log('Retry POST (same key):', restCreateOrder(key, 49));`,
      tryItPrompt: { vi: 'Thử thay đổi serverResource.etag thành "v2-xyz" rồi gọi lại restGet để xem 200 OK mới.', en: 'Change serverResource.etag to "v2-xyz" and re-run restGet to observe a fresh 200 payload.' },
    },
    quiz: [
      {
        id: 'q-rest-1',
        topicId: 'restful',
        categoryId: 'backend-apis',
        question: { vi: 'Header nào giúp trình duyệt hỏi server "dữ liệu có đổi so với bản cache cũ không" để nhận 304?', en: 'Which request/response header pair enables 304 Not Modified conditional validation in REST?' },
        options: [
          { vi: 'ETag (server trả) và If-None-Match (client gửi lên).', en: 'ETag (response) paired with If-None-Match (request).' },
          { vi: 'Origin và Access-Control-Allow-Methods.', en: 'Origin and Access-Control-Allow-Methods.' },
          { vi: 'X-Frame-Options.', en: 'X-Frame-Options.' },
          { vi: 'Accept-Language.', en: 'Accept-Language.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Nếu ETag không đổi, server trả về 304 Not Modified không cần gửi lại body JSON.',
          en: 'Matching ETags let the server respond with an empty-body 304 Not Modified.',
        },
      },
      {
        id: 'q-rest-2',
        topicId: 'restful',
        categoryId: 'backend-apis',
        question: { vi: 'Vì sao dùng Idempotency-Key khi gửi POST thanh toán?', en: 'Why attach an Idempotency-Key header on payment POST requests?' },
        options: [
          { vi: 'Để khi mạng rớt và client retry lại cùng request đó, server không trừ tiền/tạo đơn hai lần.', en: 'So retrying a timed-out request does not double-charge or create duplicate orders.' },
          { vi: 'Để mã hóa mật khẩu thay cho TLS.', en: 'To encrypt passwords instead of TLS.' },
          { vi: 'Để CDN cache vĩnh viễn request POST.', en: 'To cache POST permanently on CDN.' },
          { vi: 'Để tăng kích thước cookie.', en: 'To increase cookie limits.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'POST vốn không idempotent; Idempotency-Key giúp server nhận ra cùng một ý định giao dịch và trả về kết quả cũ.',
          en: 'POST is not naturally idempotent; an Idempotency-Key lets the server deduplicate retries safely.',
        },
      },
    ],
    relatedTopicIds: ['graphql', 'pagination', 'caching-expiry'],
  },

  {
    ...TOPIC_META_MAP['graphql'],
    mentalModel: {
      vi: 'Thay vì đi ăn theo combo cố định (REST), client gọi món theo thực đơn chính xác từng trường dữ liệu mình cần trong MỘT request duy nhất.',
      en: 'Instead of fixed REST endpoints, the client declares an exact shape of fields across related entities and resolves them in a single typed request.',
    },
    keyPoints: [
      { vi: 'Loại bỏ over-fetching (lấy thừa trường không dùng trên mobile) và under-fetching (phải gọi 4 endpoint nối tiếp nhau).', en: 'Eliminates both over-fetching unused columns and under-fetching across chained REST endpoints.' },
      { vi: 'Fragments đặt cạnh component (colocation) giúp mỗi UI component tự khai báo trường dữ liệu nó cần.', en: 'Component-colocated fragments keep UI requirements synchronized with typed schemas.' },
      { vi: 'Client cache chuẩn hóa (Apollo / Relay / urql) dùng cặp (__typename, id) để tự đồng bộ giữa nhiều màn hình.', en: 'Normalized caches key entities by (__typename + id) to update multiple views automatically.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Ứng dụng đa thiết bị (Mobile cần ít byte, Desktop cần đủ chi tiết) trên đồ thị dữ liệu liên kết phức tạp.', en: 'Multi-platform UIs (lean mobile vs rich web) querying deeply interconnected entity graphs.' },
      ],
      whenToAvoid: [
        { vi: 'API cần CDN HTTP caching đơn giản theo URL GET hoặc upload file nhị phân thuần túy.', en: 'Public read APIs relying heavily on simple URL-based CDN HTTP GET caching or binary streaming.' },
      ],
    },
    pitfalls: [
      { vi: 'Query lồng sâu vô hạn (User -> Friends -> Posts -> Author...) làm sập server nếu thiếu query depth/complexity limit.', en: 'Unbounded nested queries can DoS the server without depth/complexity limits.' },
      { vi: 'Hầu hết request GraphQL dùng POST nên mất cơ chế cache HTTP GET mặc định nếu không dùng Persisted Queries (APQ).', en: 'Default POST transport bypasses HTTP CDN caching unless Persisted Queries over GET are enabled.' },
    ],
    interviewTips: [
      { vi: 'Nhắc tới Persisted Queries (gửi query hash qua HTTP GET) + Normalized Cache khi được hỏi nhược điểm caching của GraphQL.', en: 'Highlight Automatic Persisted Queries (APQ over GET) and normalized client caches when asked about GraphQL caching.' },
    ],
    example: {
      title: { vi: 'So sánh Payload GraphQL Field Selection vs REST', en: 'GraphQL Field Projection vs REST Over-fetch' },
      description: { vi: 'Mô phỏng bộ thực thi GraphQL chỉ trả về chính xác những trường client yêu cầu.', en: 'Simulate a GraphQL field selector shrinking mobile payload bytes compared to a full REST dump.' },
      mode: 'ts',
      code: `const dbPost = {
  id: 'p-101',
  title: 'Designing Typeahead Search',
  fullBodyMarkdown: 'Lorem ipsum '.repeat(40),
  internalAuditScore: 0.992,
  tags: ['perf', 'debounce', 'race-conditions'],
  author: { id: 'u-7', name: 'Linh Pham', email: 'private@corp.example', avatarUrl: '/a/7.webp' },
};

function executeGraphQLSelection(source: any, selection: Record<string, any>): any {
  const out: Record<string, any> = {};
  for (const [field, sub] of Object.entries(selection)) {
    if (sub === true) out[field] = source[field];
    else if (typeof sub === 'object' && source[field]) {
      out[field] = executeGraphQLSelection(source[field], sub);
    }
  }
  return out;
}

const restPayload = JSON.stringify(dbPost);
const gqlPayload = JSON.stringify(
  executeGraphQLSelection(dbPost, {
    id: true,
    title: true,
    author: { name: true, avatarUrl: true },
  })
);

console.log('REST bytes:', restPayload.length);
console.log('GraphQL bytes:', gqlPayload.length);
console.log('GraphQL response:', JSON.parse(gqlPayload));`,
      tryItPrompt: { vi: 'Thử thêm trường tags: true vào query selection và xem byte thay đổi.', en: 'Add tags: true to the selection object and compare the byte difference.' },
    },
    quiz: [
      {
        id: 'q-gql-1',
        topicId: 'graphql',
        categoryId: 'backend-apis',
        question: { vi: 'Cơ chế nào giúp GraphQL tận dụng lại CDN HTTP caching gần tương đương REST?', en: 'Which mechanism restores CDN HTTP GET caching for GraphQL queries?' },
        options: [
          { vi: 'Persisted Queries: client gửi queryId (hash) qua HTTP GET thay vì gửi toàn bộ chuỗi query qua POST.', en: 'Persisted Queries: sending a compact query hash over cacheable HTTP GET instead of POST.' },
          { vi: 'Tăng kích thước mutation.', en: 'Enlarging mutation payloads.' },
          { vi: 'Tắt type system trên server.', en: 'Disabling schema typing.' },
          { vi: 'Gọi query qua WebSocket không mã hóa.', en: 'Sending unencrypted WebSocket frames.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Persisted Queries biến query thành GET URL ngắn gọn mang hash ID, giúp CDN và proxy cache được dễ dàng.',
          en: 'Persisted Queries shrink request sizes and enable standard HTTP GET caching at CDNs.',
        },
      },
      {
        id: 'q-gql-2',
        topicId: 'graphql',
        categoryId: 'backend-apis',
        question: { vi: 'Cặp trường nào thường được Apollo/Relay dùng để chuẩn hóa cache một node GraphQL?', en: 'Which two fields identify an entity inside normalized GraphQL client caches?' },
        options: [
          { vi: '__typename và id (hoặc custom keyFields).', en: '__typename and id (or configured keyFields).' },
          { vi: 'status và headers.', en: 'status and headers.' },
          { vi: 'etag và url.', en: 'etag and url.' },
          { vi: 'index và timestamp.', en: 'index and timestamp.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Kết hợp __typename và id tạo khóa toàn cục duy nhất (ví dụ "User:42") để cập nhật đồng bộ mọi view.',
          en: 'Combining __typename and id yields a unique normalized cache key like "User:42".',
        },
      },
    ],
    relatedTopicIds: ['restful', 'normalized-stores', 'batching'],
  },

  {
    ...TOPIC_META_MAP['pagination'],
    mentalModel: {
      vi: 'Offset giống đếm "bỏ qua 10 người đầu lấy 5 người tiếp" — nếu có người mới chen vào đầu hàng, hàng bị đẩy xuống làm bạn thấy lại người vừa xem. Cursor giống đánh dấu "lấy 5 người đứng ngay sau anh X" nên không bao giờ bị lệch!',
      en: 'Offset skips N rows (drifting whenever new items insert at the top), whereas Cursor anchors cleanly to the last seen item token so dynamic feeds never duplicate or skip rows.',
    },
    keyPoints: [
      { vi: 'Offset Pagination (page=2&limit=20): đơn giản, nhảy trang 5 hoặc 10 trực tiếp, nhưng DB chậm ở offset lớn (OFFSET 100000) và bị trùng/sót item trên feed realtime.', en: 'Offset pagination supports arbitrary page jumps, yet degrades at deep offsets and duplicates/skips rows on live feeds.' },
      { vi: 'Cursor Pagination (after=cursor_abc&limit=20): tận dụng index B-Tree trên server O(log N) và ổn định tuyệt đối khi có bài viết mới thêm vào đầu.', en: 'Cursor pagination leverages indexed lookups and remains drift-free when new posts arrive.' },
      { vi: 'Cursor thường được mã hóa opaque Base64 (vd createdAt + id) để làm tie-breaker khi hai item trùng timestamp.', en: 'Opaque cursors typically encode both sort timestamp and unique ID as a deterministic tie-breaker.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Cursor cho News Feed, Chat, Infinite Scroll, Activity Log.', en: 'Cursor for social feeds, chat histories, infinite scroll, and audit logs.' },
        { vi: 'Offset cho bảng quản trị admin ít biến động cần nhảy thẳng tới "Trang 12 / 50".', en: 'Offset for low-churn admin tables requiring random page number jumps ("Page 12 of 50").' },
      ],
      whenToAvoid: [
        { vi: 'Tránh dùng Offset cho infinite scroll tốc độ cao vì chỉ 1 item chèn mới là user thấy item lặp ngay dưới đáy.', en: 'Avoid offset pagination on infinite feeds—any top insertion creates immediate duplicate items on scroll.' },
      ],
    },
    pitfalls: [
      { vi: 'Chỉ lấy timestamp làm cursor khiến mất item nếu có hai bài đăng cùng một mili-giây.', en: 'Using only timestamp as a cursor drops items sharing the exact same timestamp; always include a unique ID tie-breaker.' },
    ],
    interviewTips: [
      { vi: 'Trong thiết kế News Feed, chủ động giải thích lỗi Offset Drift khi vừa kéo xuống vừa có bài mới được đăng.', en: 'In News Feed interviews, proactively demonstrate the Offset Drift duplicate bug vs Cursor stability.' },
    ],
    example: {
      title: { vi: 'Demo trực tiếp lỗi Offset Drift vs Cursor Stability', en: 'Live Offset Drift vs Cursor Pagination Demo' },
      description: { vi: 'Bấm "Insert New Post at Top" rồi chuyển sang Page 2 để thấy Offset bị trùng bài cũ còn Cursor thì chuẩn xác.', en: 'Click "Insert New Post" then load Page 2 to witness Offset duplication vs Cursor accuracy.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

export default function App() {
  const [items, setItems] = useState([
    { id: 10, title: 'Post #10' }, { id: 9, title: 'Post #9' },
    { id: 8, title: 'Post #8' }, { id: 7, title: 'Post #7' },
    { id: 6, title: 'Post #6' }, { id: 5, title: 'Post #5' },
  ]);
  const [nextId, setNextId] = useState(11);
  const [offsetPage2, setOffsetPage2] = useState<string[]>([]);
  const [cursorPage2, setCursorPage2] = useState<string[]>([]);

  const page1 = items.slice(0, 3);
  const lastSeenId = page1[page1.length - 1]?.id;

  const insertTop = () => {
    setItems((prev) => [{ id: nextId, title: 'Post #' + nextId + ' (NEW)' }, ...prev]);
    setNextId((n) => n + 1);
  };

  const fetchNextPages = () => {
    // Offset slices blindly by index 3..6 -> duplicates item if a new row inserted!
    setOffsetPage2(items.slice(3, 6).map((i) => i.title));
    // Cursor finds the exact anchor after lastSeenId
    const idx = items.findIndex((i) => i.id === lastSeenId);
    setCursorPage2(items.slice(idx + 1, idx + 4).map((i) => i.title));
  };

  return (
    <div className="col">
      <div className="row">
        <button onClick={insertTop}>1. Insert New Post at Top</button>
        <button className="primary" onClick={fetchNextPages}>2. Fetch Page 2 (limit=3)</button>
      </div>
      <div className="card">
        <div><strong>Page 1 currently shown:</strong> {page1.map((i) => i.title).join(', ')}</div>
        <div className="muted" style={{ marginTop: 4 }}>Anchor cursor: id &lt; {lastSeenId}</div>
      </div>
      {offsetPage2.length > 0 && (
        <div className="card">
          <div><strong>Offset Page 2 (offset=3):</strong> {offsetPage2.join(', ')}</div>
          <div style={{ marginTop: 4, color: '#22c55e' }}><strong>Cursor Page 2 (after={lastSeenId}):</strong> {cursorPage2.join(', ')}</div>
        </div>
      )}
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử bấm "Insert New Post at Top" 2 lần sau khi đã xem Page 1 rồi mới bấm "Fetch Page 2" để thấy rõ sự khác biệt.', en: 'Click "Insert New Post at Top" twice before fetching Page 2 to observe how Offset duplicates page 1 items.' },
    },
    challenge: {
      id: 'challenge-cursor-paginate',
      topicId: 'pagination',
      categoryId: 'backend-apis',
      title: { vi: 'Cài đặt hàm cursorPaginate', en: 'Implement cursorPaginate' },
      difficulty: 'medium',
      prompt: {
        vi: 'Cho mảng items đã sắp xếp có { id: string }[], viết hàm cursorPaginate<T extends { id: string }>(items: T[], limit: number, afterId?: string) trả về { items: T[]; nextCursor: string | null; hasMore: boolean }. Nếu có afterId, lấy tối đa `limit` phần tử đứng ngay sau afterId (nếu không tìm thấy afterId trả mảng rỗng). nextCursor là id cuối cùng trong slice nếu hasMore = true, ngược lại là null.',
        en: 'Implement cursorPaginate<T extends { id: string }>(items: T[], limit: number, afterId?: string) returning { items: T[]; nextCursor: string | null; hasMore: boolean }. Slice up to `limit` items strictly after `afterId` (return empty if `afterId` is unknown). Set nextCursor to the last returned item id when hasMore is true, else null.',
      },
      starterCode: `export function cursorPaginate<T extends { id: string }>(
  items: T[],
  limit: number,
  afterId?: string
): { items: T[]; nextCursor: string | null; hasMore: boolean } {
  // TODO: compute startIndex from afterId, slice limit items, compute hasMore & nextCursor
  return { items: [], nextCursor: null, hasMore: false };
}`,
      solutionCode: `export function cursorPaginate<T extends { id: string }>(
  items: T[],
  limit: number,
  afterId?: string
): { items: T[]; nextCursor: string | null; hasMore: boolean } {
  let startIndex = 0;
  if (afterId !== undefined) {
    const idx = items.findIndex((item) => item.id === afterId);
    if (idx === -1) {
      return { items: [], nextCursor: null, hasMore: false };
    }
    startIndex = idx + 1;
  }

  const page = items.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + page.length < items.length;
  const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].id : null;

  return { items: page, nextCursor, hasMore };
}`,
      testCode: `test('paginates across multiple pages using afterId cursor', () => {
  const data = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }];
  const p1 = cursorPaginate(data, 2);
  expect(p1).toEqual({ items: [{ id: 'a' }, { id: 'b' }], nextCursor: 'b', hasMore: true });

  const p2 = cursorPaginate(data, 2, p1.nextCursor!);
  expect(p2).toEqual({ items: [{ id: 'c' }, { id: 'd' }], nextCursor: 'd', hasMore: true });

  const p3 = cursorPaginate(data, 2, p2.nextCursor!);
  expect(p3).toEqual({ items: [{ id: 'e' }], nextCursor: null, hasMore: false });
});

test('remains stable when new items insert before anchor', () => {
  const initial = [{ id: '10' }, { id: '9' }, { id: '8' }, { id: '7' }];
  const p1 = cursorPaginate(initial, 2);
  const mutated = [{ id: '12' }, { id: '11' }, ...initial];
  const p2 = cursorPaginate(mutated, 2, p1.nextCursor!);
  expect(p2.items).toEqual([{ id: '8' }, { id: '7' }]);
});`,
      hints: [
        { vi: 'Tìm vị trí afterId với items.findIndex(x => x.id === afterId). Vị trí bắt đầu là idx + 1.', en: 'Find afterId with findIndex; start slicing at idx + 1.' },
        { vi: 'Kiểm tra hasMore = startIndex + page.length < items.length (chú ý khi trang cuối vừa khít hết mảng thì hasMore phải là false).', en: 'hasMore is true only when items remain beyond startIndex + page.length.' },
      ],
    },
    quiz: [
      {
        id: 'q-pag-1',
        topicId: 'pagination',
        categoryId: 'backend-apis',
        question: { vi: 'Ưu điểm lớn nhất của Cursor Pagination so với Offset Pagination trên Social Feed là gì?', en: 'What is the main advantage of Cursor Pagination over Offset Pagination for social feeds?' },
        options: [
          { vi: 'Không bị lặp hoặc sót bài viết khi có bài mới liên tục chèn vào đầu danh sách, đồng thời query DB ở trang sâu vẫn nhanh.', en: 'Prevents duplicate or skipped items during top insertions and maintains fast deep-page database queries.' },
          { vi: 'Cho phép user bấm nhảy thẳng tới trang 999 ngay lập tức.', en: 'Supports direct jumps to page 999.' },
          { vi: 'Không cần index trong database.', en: 'Needs no database index.' },
          { vi: 'Nhỏ hơn HTML 50%.', en: 'Shrinks HTML by 50%.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Cursor neo vào item cụ thể thay vì đếm số dòng bỏ qua, nên hoàn toàn miễn nhiễm với việc chèn bài mới.',
          en: 'Anchoring to a stable item cursor eliminates drift when rows are prepended.',
        },
      },
      {
        id: 'q-pag-2',
        topicId: 'pagination',
        categoryId: 'backend-apis',
        question: { vi: 'Kỹ thuật "fetch limit + 1" trên backend khi dùng Cursor Pagination nhằm mục đích gì?', en: 'Why do backends often query `limit + 1` rows in cursor pagination?' },
        options: [
          { vi: 'Để biết chính xác hasMore = true/false (còn trang sau không) mà không cần chạy lệnh COUNT(*) đắt đỏ.', en: 'To determine hasMore accurately without running an expensive COUNT(*) query.' },
          { vi: 'Để trả dư 1 phần tử dự phòng cho client.', en: 'To give the client a spare item.' },
          { vi: 'Để tránh lỗi chia cho 0.', en: 'To avoid division by zero.' },
          { vi: 'Để vô hiệu hóa CORS.', en: 'To bypass CORS.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Nếu lấy về đủ limit + 1 dòng, cắt bỏ dòng thừa và báo hasMore = true; ngược lại hasMore = false.',
          en: 'Receiving limit + 1 rows proves another page exists without a full table count.',
        },
      },
    ],
    relatedTopicIds: ['ux-infinite-scrolling', 'pattern-infinite-scrolling', 'restful'],
  },

  {
    ...TOPIC_META_MAP['authentication'],
    mentalModel: {
      vi: 'Xác thực (AuthN) trả lời "Bạn là ai?". Ở Front End hiện đại, tránh cất Refresh Token vào localStorage (dễ bị XSS đánh cắp) mà ưu tiên HttpOnly Secure SameSite Cookie kết hợp Access Token ngắn hạn hoặc BFF session.',
      en: 'Authentication answers "Who are you?". Protect browser sessions using HttpOnly Secure SameSite cookies (immune to JS XSS reads) plus short-lived tokens or OAuth2 PKCE.',
    },
    keyPoints: [
      { vi: 'HttpOnly Cookie không thể đọc bằng document.cookie (chống XSS lấy token), kết hợp SameSite=Lax/Strict chống CSRF.', en: 'HttpOnly cookies cannot be read by JavaScript (mitigating XSS token theft), paired with SameSite to deter CSRF.' },
      { vi: 'OAuth 2.0 cho SPA bắt buộc dùng Authorization Code Flow + PKCE (Proof Key for Code Exchange), tuyệt đối không dùng Implicit Flow cũ.', en: 'SPAs use OAuth 2.0 Authorization Code + PKCE instead of the deprecated Implicit flow.' },
      { vi: 'Silent Refresh Rotation: dùng một mutex duy nhất ở client khi nhiều API 401 cùng lúc để chỉ gọi /refresh đúng 1 lần.', en: 'Deduplicate concurrent 401 refresh calls behind a single shared Promise mutex so tokens do not invalidate each other.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'HttpOnly Session Cookie / BFF pattern cho web app cần bảo mật cao (fintech, SaaS doanh nghiệp).', en: 'HttpOnly session cookies or a BFF layer for high-security web applications.' },
      ],
      whenToAvoid: [
        { vi: 'Tuyệt đối không lưu JWT dài hạn hoặc Refresh Token vào localStorage/sessionStorage nếu có nguy cơ XSS từ third-party scripts.', en: 'Avoid keeping long-lived JWTs or refresh tokens in localStorage when third-party scripts or rich HTML exist.' },
      ],
    },
    pitfalls: [
      { vi: '3 request cùng nhận 401 và cả 3 đồng thời gọi /auth/refresh khiến server rotation thu hồi token vừa cấp gây logout oan.', en: 'Three concurrent 401s triggering three parallel refresh calls breaks refresh-token rotation and logs users out.' },
    ],
    interviewTips: [
      { vi: 'Thể hiện trình độ senior bằng mẫu "Single-Flight Refresh Mutex": mọi request 401 đều await chung một Promise refresh đang chạy.', en: 'Demonstrate a single-flight refresh mutex so concurrent 401 responses await one shared refresh request.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Single-Flight Token Refresh Mutex', en: 'Single-Flight Refresh Token Mutex Simulation' },
      description: { vi: '3 API gọi song song cùng gặp 401 Token Expired nhưng hệ thống chỉ gọi /refresh đúng 1 lần duy nhất.', en: 'Fire 3 parallel requests hitting 401 and verify the mutex coalesces them into 1 token refresh call.' },
      mode: 'ts',
      code: `let accessToken = 'expired-token';
let refreshCalls = 0;
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise; // Deduplicate concurrent refreshes!
  refreshPromise = (async () => {
    refreshCalls += 1;
    console.log('[Auth] Calling /auth/refresh (attempt #' + refreshCalls + ')...');
    await sleep(100);
    accessToken = 'fresh-token-v' + refreshCalls;
    return accessToken;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function apiRequest(endpoint: string): Promise<string> {
  if (accessToken === 'expired-token') {
    await refreshAccessToken();
  }
  return endpoint + ' OK using ' + accessToken;
}

const results = await Promise.all([
  apiRequest('/me'),
  apiRequest('/feed'),
  apiRequest('/notifications'),
]);

console.log('Results:', results);
console.log('Total /refresh network calls (expected 1):', refreshCalls);`,
      tryItPrompt: { vi: 'Thử bỏ dòng if (refreshPromise) return refreshPromise để thấy lỗi gọi refresh tới 3 lần!', en: 'Remove the refreshPromise guard temporarily to watch 3 redundant refresh calls fire.' },
    },
    quiz: [
      {
        id: 'q-authn-1',
        topicId: 'authentication',
        categoryId: 'backend-apis',
        question: { vi: 'Vì sao cờ HttpOnly trên Cookie giúp giảm thiểu rủi ro khi trang bị lỗ hổng XSS?', en: 'Why does the HttpOnly cookie flag protect session tokens from XSS theft?' },
        options: [
          { vi: 'JavaScript (kể cả script XSS chèn lậu) không thể đọc được cookie này qua document.cookie.', en: 'Client-side JavaScript cannot read HttpOnly cookies via document.cookie.' },
          { vi: 'Cookie được mã hóa bằng mật khẩu hệ điều hành.', en: 'It encrypts cookies with OS login passwords.' },
          { vi: 'Cookie không bao giờ gửi kèm HTTP request.', en: 'HttpOnly cookies are never sent on HTTP requests.' },
          { vi: 'Nó tự động chặn mọi thẻ <script>.', en: 'It blocks all script tags automatically.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'HttpOnly cách ly token khỏi tầng JS, khiến XSS không thể exfiltrate chuỗi token thô ra ngoài.',
          en: 'HttpOnly hides the cookie from JavaScript access so XSS scripts cannot extract raw credentials.',
        },
      },
      {
        id: 'q-authn-2',
        topicId: 'authentication',
        categoryId: 'backend-apis',
        question: { vi: 'Khi 4 API call song song cùng nhận lỗi 401 hết hạn Access Token, xử lý đúng nhất ở client là gì?', en: 'What is the proper client behavior when 4 parallel requests simultaneously return 401 Expired?' },
        options: [
          { vi: 'Cho cả 4 request dùng chung một Promise /refresh đang chạy rồi mới retry cả 4 với token mới.', en: 'Share a single in-flight refresh Promise mutex, then retry all 4 requests with the new token.' },
          { vi: 'Mỗi request tự gọi /refresh riêng biệt.', en: 'Let each request trigger its own /refresh call.' },
          { vi: 'Xóa sạch database client.', en: 'Wipe client storage immediately.' },
          { vi: 'Thử lại vô hạn lần không delay.', en: 'Retry infinitely without delay.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Mutex giúp tránh race condition làm vô hiệu hóa Refresh Token Rotation trên server.',
          en: 'A shared refresh promise prevents concurrent requests from invalidating rotated refresh tokens.',
        },
      },
    ],
    relatedTopicIds: ['authorization', 'csrf', 'xss'],
  },

  {
    ...TOPIC_META_MAP['authorization'],
    mentalModel: {
      vi: 'Phân quyền (AuthZ) trả lời "Bạn được phép làm gì?". Nhớ nguyên tắc vàng: ẩn nút ở Front End chỉ để UX tốt hơn, còn kiểm soát quyền thật sự BẮT BUỘC nằm ở Back End!',
      en: 'Authorization answers "What are you allowed to do?". UI permission gates improve UX, whereas real enforcement MUST happen server-side on every request.',
    },
    keyPoints: [
      { vi: 'RBAC (Role-Based): quyền gắn theo vai trò (Admin, Editor, Viewer). ABAC (Attribute-Based): quyền phụ thuộc thuộc tính (chỉ sửa bài do mình tạo hoặc trong cùng workspace).', en: 'RBAC maps permissions to roles; ABAC evaluates context like resource ownership or workspace membership.' },
      { vi: 'Tập trung logic kiểm tra quyền vào một helper/hook can(user, action, resource) thay vì rải `user.role === "admin"` khắp UI.', en: 'Centralize checks in a declarative capability helper can(user, action, resource) rather than scattered role comparisons.' },
      { vi: 'Phân biệt trạng thái 401 Unauthorized (chưa đăng nhập) và 403 Forbidden (đã đăng nhập nhưng không đủ quyền).', en: 'Handle 401 (unauthenticated -> login) differently from 403 (authenticated -> insufficient permissions notice).' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi sản phẩm SaaS nhiều vai trò, quản trị workspace, tài liệu chia sẻ View/Comment/Edit.', en: 'Multi-tenant SaaS apps, workspaces, and shared documents with Viewer/Editor/Owner tiers.' },
      ],
      whenToAvoid: [
        { vi: 'Tuyệt đối KHÔNG kiểm tra quyền chỉ bằng việc ẩn menu trên Front End mà bỏ qua check ở API.', en: 'Never rely on hiding UI controls as security; anyone can replay API requests with curl.' },
      ],
    },
    pitfalls: [
      { vi: 'Hardcode danh sách role ở khắp các component JSX làm cực khổ khi bổ sung vai trò mới (ví dụ Moderator).', en: 'Hardcoding role strings across dozens of components breaks when adding new roles.' },
    ],
    interviewTips: [
      { vi: 'Thiết kế hệ thống phân quyền dạng capability permissions (vd `["post:edit:own", "billing:read"]`) trả về từ API /me thay vì chỉ dựa tên role.', en: 'Recommend shipping explicit capability scopes from /me rather than coupling UI components to raw role names.' },
    ],
    example: {
      title: { vi: 'Capability-based RBAC + Ownership (ABAC) Helper', en: 'RBAC + Ownership Policy Evaluator' },
      description: { vi: 'Kiểm thử ma trận phân quyền kết hợp role toàn cục và quyền sở hữu tài nguyên.', en: 'Test combining role capabilities with resource ownership policies cleanly.' },
      mode: 'ts',
      code: `type Role = 'admin' | 'editor' | 'viewer';
interface User { id: string; role: Role }
interface Doc { id: string; ownerId: string; locked?: boolean }

function canEditDoc(user: User, doc: Doc): boolean {
  if (doc.locked && user.role !== 'admin') return false;
  if (user.role === 'admin') return true;
  if (user.role === 'editor') return doc.ownerId === user.id;
  return false;
}

const docA: Doc = { id: 'd1', ownerId: 'u2' };
const docLocked: Doc = { id: 'd2', ownerId: 'u2', locked: true };

console.log('Viewer edit docA:', canEditDoc({ id: 'u1', role: 'viewer' }, docA));
console.log('Editor u2 edit own docA:', canEditDoc({ id: 'u2', role: 'editor' }, docA));
console.log('Editor u3 edit docA:', canEditDoc({ id: 'u3', role: 'editor' }, docA));
console.log('Editor u2 edit locked doc:', canEditDoc({ id: 'u2', role: 'editor' }, docLocked));
console.log('Admin edit locked doc:', canEditDoc({ id: 'u9', role: 'admin' }, docLocked));`,
      tryItPrompt: { vi: 'Thử thêm quyền "moderator" được sửa mọi doc chưa bị locked.', en: 'Add a "moderator" role allowed to edit any unlocked document.' },
    },
    challenge: {
      id: 'challenge-rbac-permission',
      topicId: 'authorization',
      categoryId: 'backend-apis',
      title: { vi: 'Cài đặt checkRBACPermission (RBAC + Ownership)', en: 'Implement checkRBACPermission' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm checkRBACPermission(user: { id: string; roles: string[] }, action: "read" | "edit" | "delete", resource: { ownerId: string; isPublic?: boolean }): boolean. Quy tắc: "admin" làm được mọi action; "read" cho phép nếu isPublic === true hoặc user là ownerId hoặc có role "viewer"/"editor"; "edit" chỉ cho "editor" nếu là ownerId; "delete" chỉ cho ownerId hoặc "admin".',
        en: 'Write checkRBACPermission(user, action, resource): boolean. Rules: "admin" allows everything; "read" allows when resource.isPublic, owner match, or role includes "viewer"/"editor"; "edit" allows "editor" only when ownerId matches; "delete" allows ownerId or "admin".',
      },
      starterCode: `export function checkRBACPermission(
  user: { id: string; roles: string[] },
  action: 'read' | 'edit' | 'delete',
  resource: { ownerId: string; isPublic?: boolean }
): boolean {
  // TODO: implement capability policy check
  return false;
}`,
      solutionCode: `export function checkRBACPermission(
  user: { id: string; roles: string[] },
  action: 'read' | 'edit' | 'delete',
  resource: { ownerId: string; isPublic?: boolean }
): boolean {
  if (user.roles.includes('admin')) return true;
  const isOwner = user.id === resource.ownerId;

  if (action === 'read') {
    return Boolean(resource.isPublic) || isOwner || user.roles.includes('viewer') || user.roles.includes('editor');
  }
  if (action === 'edit') {
    return user.roles.includes('editor') && isOwner;
  }
  if (action === 'delete') {
    return isOwner;
  }
  return false;
}`,
      testCode: `test('admin overrides all restrictions', () => {
  expect(checkRBACPermission({ id: 'a1', roles: ['admin'] }, 'delete', { ownerId: 'u2' })).toBe(true);
  expect(checkRBACPermission({ id: 'a1', roles: ['admin'] }, 'edit', { ownerId: 'u2' })).toBe(true);
});

test('enforces editor ownership and read permissions', () => {
  expect(checkRBACPermission({ id: 'u1', roles: ['editor'] }, 'edit', { ownerId: 'u1' })).toBe(true);
  expect(checkRBACPermission({ id: 'u1', roles: ['editor'] }, 'edit', { ownerId: 'u2' })).toBe(false);
  expect(checkRBACPermission({ id: 'u3', roles: [] }, 'read', { ownerId: 'u2', isPublic: true })).toBe(true);
  expect(checkRBACPermission({ id: 'u3', roles: [] }, 'read', { ownerId: 'u2', isPublic: false })).toBe(false);
});`,
      hints: [
        { vi: 'Kiểm tra user.roles.includes("admin") đầu tiên để trả về true ngay.', en: 'Check admin role first as an early return.' },
        { vi: 'Tách biến isOwner = user.id === resource.ownerId để dùng gọn cho cả 3 nhánh read/edit/delete.', en: 'Compute isOwner once and branch cleanly by action.' },
      ],
    },
    quiz: [
      {
        id: 'q-authz-1',
        topicId: 'authorization',
        categoryId: 'backend-apis',
        question: { vi: 'Vai trò thật sự của việc kiểm tra phân quyền trên giao diện Front End là gì?', en: 'What is the true purpose of authorization checks in Front End UI code?' },
        options: [
          { vi: 'Cải thiện trải nghiệm người dùng (ẩn nút không hợp lệ, dẫn hướng đúng màn hình); bảo mật thật sự vẫn phải do Backend thực thi.', en: 'Improve UX by hiding unavailable actions; real security enforcement must always remain on the backend.' },
          { vi: 'Thay thế hoàn toàn kiểm tra quyền trên server.', en: 'Completely replace backend permission checks.' },
          { vi: 'Giúp CDN nén CSS nhanh hơn.', en: 'Speed up CDN CSS compression.' },
          { vi: 'Chống tấn công DDoS tầng mạng.', en: 'Stop network-layer DDoS attacks.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Code Front End chạy trên máy người dùng nên luôn có thể bị DevTools sửa; Back End mới là nơi gác cổng thực sự.',
          en: 'Client code is user-editable; UI checks prevent accidental UX dead ends while APIs enforce actual access control.',
        },
      },
      {
        id: 'q-authz-2',
        topicId: 'authorization',
        categoryId: 'backend-apis',
        question: { vi: 'HTTP Status Code nào phù hợp khi user ĐÃ đăng nhập hợp lệ nhưng cố tình gọi API xóa bài của người khác?', en: 'Which HTTP status code fits an authenticated user attempting an action they lack permission for?' },
        options: [
          { vi: '403 Forbidden', en: '403 Forbidden' },
          { vi: '200 OK', en: '200 OK' },
          { vi: '301 Moved Permanently', en: '301 Moved Permanently' },
          { vi: '401 Unauthorized (chưa đăng nhập)', en: '401 Unauthorized' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '401 nghĩa là chưa xác thực (unauthenticated), còn 403 nghĩa là đã biết bạn là ai nhưng không có quyền (forbidden).',
          en: '401 signals missing/expired identity (AuthN), whereas 403 signals insufficient privileges (AuthZ).',
        },
      },
    ],
    relatedTopicIds: ['authentication', 'csrf', 'error-handling'],
  },
];
