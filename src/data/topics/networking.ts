import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const networkingTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['batching'],
    mentalModel: {
      vi: 'Thay vì giao từng cái bánh một chạy 20 cuốc xe (20 HTTP requests trong 1 frame), gom toàn bộ đơn phát sinh trong một microtask/cửa sổ 16ms lên cùng một chuyến xe (1 HTTP POST batch).',
      en: 'Instead of firing 20 separate HTTP calls in one render pass, buffer incoming lookups over a microtask or short time window and dispatch them together as a single batch request.',
    },
    keyPoints: [
      { vi: 'Giải quyết vấn đề N+1 query ở client khi nhiều card hiển thị user avatar hoặc badge cùng lúc.', en: 'Eliminates client-side N+1 request waterfalls when sibling components request individual entity IDs simultaneously.' },
      { vi: 'Cài đặt theo mô hình DataLoader: `load(id)` trả về một Promise, thu thập `keys` trong `queueMicrotask` hoặc `setTimeout(windowMs)`, rồi chia lại kết quả theo đúng Promise.', en: 'DataLoader pattern: `load(id)` returns a Promise, gathers keys in `queueMicrotask`/`setTimeout`, invokes `batchFn(keys)`, and resolves each caller individually.' },
      { vi: 'Tách biệt lỗi từng item: một item bị lỗi không nên làm hỏng cả 19 item còn lại trong batch.', en: 'Support per-item error mapping so one missing key does not reject the entire batch.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Telemetry/analytics event tracking, avatar/user profile hydration trong feed, GraphQL query batching.', en: 'Analytics event shipping, avatar/user card hydration, and GraphQL query coalescing.' },
      ],
      whenToAvoid: [
        { vi: 'Endpoint cần HTTP GET CDN cache theo từng URL riêng lẻ (vì POST batch rất khó cache trên CDN) hoặc thao tác nhạy cảm độ trễ tức thì.', en: 'Individual public GET resources that benefit from edge CDN caching by URL, or latency-critical solo actions.' },
      ],
    },
    pitfalls: [
      { vi: 'Không đặt giới hạn kích thước tối đa mỗi batch (`maxBatchSize`) khiến payload phình quá giới hạn body hoặc URL.', en: 'Missing `maxBatchSize` lets bursts produce oversized request payloads rejected by gateways.' },
    ],
    interviewTips: [
      { vi: 'Trình bày chính xác cơ chế `queueMicrotask` (gom cùng tick JS, 0ms penalty) vs `setTimeout(..., 16ms)` (gom telemetry/user bursts) kèm `maxBatchSize`.', en: 'Contrast `queueMicrotask` batching (zero added frame delay) vs time-window batching (telemetry) with `maxBatchSize` bounds.' },
    ],
    example: {
      title: { vi: 'Microtask Request Batcher (DataLoader Pattern)', en: 'Microtask Request Batcher Simulation' },
      description: { vi: 'Gọi 4 request userId rời rạc cùng lúc (kể cả trùng ID) và quan sát hệ thống chỉ bắn đúng 1 batch fetch duy nhất.', en: 'Invoke 4 concurrent `loadUser` calls (with duplicates) and verify only 1 deduplicated batch call fires.' },
      mode: 'ts',
      code: `function createBatcher<K, V>(batchFn: (keys: K[]) => Promise<Record<string, V>>) {
  let queue: Array<{ key: K; resolve: (v: V) => void; reject: (e: unknown) => void }> = [];
  let scheduled = false;

  const flush = async () => {
    const batch = queue;
    queue = [];
    scheduled = false;
    const uniqueKeys = Array.from(new Set(batch.map((b) => b.key)));
    console.log('[Network] Dispatching 1 HTTP batch for keys:', uniqueKeys);
    try {
      const map = await batchFn(uniqueKeys);
      for (const item of batch) item.resolve(map[String(item.key)]);
    } catch (err) {
      for (const item of batch) item.reject(err);
    }
  };

  return (key: K) =>
    new Promise<V>((resolve, reject) => {
      queue.push({ key, resolve, reject });
      if (!scheduled) {
        scheduled = true;
        queueMicrotask(flush);
      }
    });
}

const loadUser = createBatcher<string, string>(async (ids) => {
  await sleep(50);
  return Object.fromEntries(ids.map((id) => [id, 'User(' + id + ')']));
});

const users = await Promise.all([loadUser('u1'), loadUser('u2'), loadUser('u1'), loadUser('u3')]);
console.log('Resolved callers:', users);`,
      tryItPrompt: { vi: 'Thử thêm `await sleep(10)` giữa lần gọi u2 và u3 để thấy chúng tách thành 2 batch riêng ở 2 tick khác nhau.', en: 'Insert `await sleep(10)` between calls to observe separate microtask batches.' },
    },
    challenge: {
      id: 'challenge-request-batcher',
      topicId: 'batching',
      categoryId: 'networking',
      title: { vi: 'Cài đặt createRequestBatcher (Deduplicate + Order + MaxSize)', en: 'Implement createRequestBatcher' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm createRequestBatcher<K, V>(batchFn: (keys: K[]) => Promise<V[]>): (key: K) => Promise<V>. Khi nhiều lời gọi xảy ra trong cùng tick đồng bộ, gom hết vào MỘT lần gọi `batchFn(uniqueKeys)` bằng `queueMicrotask` (khử trùng key nếu gọi lặp). `batchFn(keys)` trả mảng kết quả tương ứng theo đúng thứ tự `keys`, từ đó resolve từng Promise caller.',
        en: 'Implement createRequestBatcher<K, V>(batchFn: (keys: K[]) => Promise<V[]>): (key: K) => Promise<V>. Coalesce calls made in the same synchronous turn via `queueMicrotask` into a single deduplicated `batchFn(uniqueKeys)` call, mapping aligned array responses back to each caller.',
      },
      starterCode: `export function createRequestBatcher<K, V>(
  batchFn: (keys: K[]) => Promise<V[]>
): (key: K) => Promise<V> {
  // TODO: collect calls in queue, schedule microtask flush, deduplicate keys, map results back
  return async (_key: K) => undefined as unknown as V;
}`,
      solutionCode: `export function createRequestBatcher<K, V>(
  batchFn: (keys: K[]) => Promise<V[]>
): (key: K) => Promise<V> {
  type Pending = { key: K; resolve: (val: V) => void; reject: (err: unknown) => void };
  let queue: Pending[] = [];
  let scheduled = false;

  const flush = async () => {
    const current = queue;
    queue = [];
    scheduled = false;

    const uniqueKeys: K[] = [];
    const indexByKey = new Map<K, number>();
    for (const item of current) {
      if (!indexByKey.has(item.key)) {
        indexByKey.set(item.key, uniqueKeys.length);
        uniqueKeys.push(item.key);
      }
    }

    try {
      const results = await batchFn(uniqueKeys);
      for (const item of current) {
        const idx = indexByKey.get(item.key)!;
        item.resolve(results[idx]);
      }
    } catch (err) {
      for (const item of current) {
        item.reject(err);
      }
    }
  };

  return (key: K) =>
    new Promise<V>((resolve, reject) => {
      queue.push({ key, resolve, reject });
      if (!scheduled) {
        scheduled = true;
        queueMicrotask(() => {
          void flush();
        });
      }
    });
}`,
      testCode: `test('coalesces same-tick requests and deduplicates keys', async () => {
  const batches: string[][] = [];
  const load = createRequestBatcher<string, string>(async (keys) => {
    batches.push(keys);
    return keys.map((k) => k.toUpperCase());
  });

  const out = await Promise.all([load('a'), load('b'), load('a'), load('c')]);
  expect(out).toEqual(['A', 'B', 'A', 'C']);
  expect(batches).toEqual([['a', 'b', 'c']]);
});`,
      hints: [
        { vi: 'Dùng `Map<K, number>` để vừa khử trùng `uniqueKeys` vừa ghi nhớ vị trí index của từng key trong mảng trả về.', en: 'Use a `Map<K, number>` to both deduplicate `uniqueKeys` and track each key index.' },
        { vi: 'Nhớ reset `queue = []; scheduled = false;` ở đầu hàm flush để các lệnh gọi tiếp theo tạo batch mới sạch sẽ.', en: 'Reset `queue = []; scheduled = false;` immediately when flush begins.' },
      ],
    },
    quiz: [
      {
        id: 'q-batch-1',
        topicId: 'batching',
        categoryId: 'networking',
        question: { vi: 'Ưu điểm của việc dùng `queueMicrotask` thay vì `setTimeout(..., 50)` để gom request cùng render pass là gì?', en: 'Why does DataLoader-style batching use `queueMicrotask` rather than a 50ms timer?' },
        options: [
          { vi: 'Gom toàn bộ các request phát sinh đồng bộ trong cùng tick JS mà không cộng thêm bất kỳ độ trễ nhân tạo nào.', en: 'It coalesces all same-turn calls immediately after the synchronous stack clears with 0ms artificial delay.' },
          { vi: 'Vì `setTimeout` không hoạt động trong Promise.', en: 'Because `setTimeout` fails inside Promises.' },
          { vi: 'Microtask chạy trên luồng GPU.', en: 'Microtasks run on the GPU thread.' },
          { vi: 'Microtask tự động lưu vào localStorage.', en: 'Microtasks persist to localStorage.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Microtask chạy ngay sau khi call stack hiện tại kết thúc nên gom trọn mọi component mount cùng lúc với 0ms chờ thừa.',
          en: 'Microtasks flush right after synchronous execution completes without introducing artificial timer delay.',
        },
      },
      {
        id: 'q-batch-2',
        topicId: 'batching',
        categoryId: 'networking',
        question: { vi: 'Vì sao các batcher gửi log analytics/telemetry lại thích gom theo cửa sổ thời gian (vd 2000ms hoặc tối đa 20 events) kết hợp `navigator.sendBeacon`?', en: 'Why do analytics batchers buffer events over a time/count window and flush with `navigator.sendBeacon`?' },
        options: [
          { vi: 'Giảm số kết nối mạng liên tục trên mobile và đảm bảo dữ liệu vẫn gửi đi an toàn khi user đột ngột đóng tab.', en: 'Cuts mobile radio wakeups during bursts and delivers remaining buffered events reliably on page unload.' },
          { vi: 'Để biến sự kiện thành CSS animation.', en: 'To animate telemetry events.' },
          { vi: 'Vì sendBeacon gửi qua UDP.', en: 'Because sendBeacon uses UDP.' },
          { vi: 'Để vô hiệu hóa Service Worker.', en: 'To disable Service Workers.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`sendBeacon` chạy bất đồng bộ ở tầng trình duyệt kể cả khi tab vừa đóng (`pagehide`), không làm chậm điều hướng.',
          en: '`navigator.sendBeacon` queues small analytics payloads reliably during pagehide/unload without blocking navigation.',
        },
      },
    ],
    relatedTopicIds: ['graphql', 'net-debounce-throttle', 'dom-batching'],
  },

  {
    ...TOPIC_META_MAP['retries-backoff-jitter'],
    mentalModel: {
      vi: 'Khi gọi điện gặp máy bận, đừng bấm gọi lại liên tục 10 lần/giây! Hãy chờ 1s, rồi 2s, rồi 4s (Exponential Backoff) cộng thêm vài trăm mili-giây ngẫu nhiên (Jitter) để hàng vạn người không gọi lại cùng một tích tắc.',
      en: 'Wait exponentially longer after transient failures (1s -> 2s -> 4s) and mix in random jitter so thousands of retrying clients spread out instead of stampeding the recovering server.',
    },
    keyPoints: [
      { vi: 'Chỉ retry các lỗi tạm thời (5xx, 429 Rate Limit, Network Timeout) — KHÔNG BAO GIỜ retry lỗi 400, 401, 403, 404!', en: 'Retry only transient failures (5xx, 429, network drops); never retry deterministic 4xx errors like 400/401/403/404.' },
      { vi: 'Tôn trọng header `Retry-After` nếu server trả về cùng mã 429 hoặc 503.', en: 'Honor server `Retry-After` headers when present on 429 or 503 responses.' },
      { vi: 'Full Jitter: `Math.random() * Math.min(capMs, baseMs * 2 ** attempt)` làm phẳng hoàn toàn đỉnh lưu lượng tái kết nối (Thundering Herd).', en: 'Full Jitter (`random() * min(cap, base * 2 ** attempt)`) flattens synchronized retry waves.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'API GET đọc dữ liệu, mutation có Idempotency-Key, và kết nối lại WebSocket/SSE.', en: 'Idempotent GET fetches, mutations carrying Idempotency-Keys, and WebSocket/SSE reconnect loops.' },
      ],
      whenToAvoid: [
        { vi: 'POST thanh toán/tạo đơn không có Idempotency-Key (nguy cơ tạo 2 đơn hàng!) hoặc user đang bấm nút thủ công có feedback ngay.', en: 'Non-idempotent mutations lacking Idempotency-Keys (risking duplicate charges).' },
      ],
    },
    pitfalls: [
      { vi: 'Retry 3 lần không kiểm tra `signal.aborted`: người dùng đã chuyển trang hoặc bấm Hủy mà fetch ngầm vẫn retry tới tận phút sau!', en: 'Retrying after the caller `AbortSignal` has aborted wastes bandwidth and triggers updates on unmounted views.' },
    ],
    interviewTips: [
      { vi: 'Luôn nhấn mạnh: 1) Chỉ retry lỗi transient/idempotent, 2) Cap `maxDelay` & `maxRetries`, 3) Thêm Full Jitter chống Thundering Herd, 4) Hỗ trợ `AbortSignal`!', en: 'Cover all 4 essentials: transient/idempotent eligibility, capped exponential delay, Full Jitter against thundering herd, and AbortSignal cancellation.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Retry với Exponential Backoff + Full Jitter', en: 'Exponential Backoff + Full Jitter Simulation' },
      description: { vi: 'Quan sát các lần thử lại khi API giả lập lỗi 2 lần đầu rồi thành công ở lần thứ 3.', en: 'Watch transient failures retry with jittered exponential backoff until succeeding on attempt 3.' },
      mode: 'ts',
      code: `async function fetchWithRetry<T>(
  task: (attempt: number) => Promise<T>,
  { maxRetries = 3, baseMs = 80, capMs = 600 } = {}
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await task(attempt);
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      const exp = Math.min(capMs, baseMs * Math.pow(2, attempt));
      const jitterDelay = Math.round(Math.random() * exp); // Full Jitter
      console.log(\`Attempt #\${attempt + 1} failed -> waiting \${jitterDelay}ms (max window \${exp}ms)\`);
      await sleep(jitterDelay);
      attempt += 1;
    }
  }
}

let serverCalls = 0;
const data = await fetchWithRetry(async (attempt) => {
  serverCalls += 1;
  if (attempt < 2) throw new Error('503 Service Unavailable');
  return { ok: true, servedOnAttempt: serverCalls };
});

console.log('Final result:', data);`,
      tryItPrompt: { vi: 'Thử mở tab Interactive Lab để mô phỏng 16 client đồng thời tái kết nối có Jitter vs không có Jitter!', en: 'Open the Interactive Lab tab to compare 16 concurrent retrying clients with and without Jitter!' },
    },
    challenge: {
      id: 'challenge-retry-backoff',
      topicId: 'retries-backoff-jitter',
      categoryId: 'networking',
      title: { vi: 'Cài đặt retryWithBackoff thông minh', en: 'Implement retryWithBackoff' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm async retryWithBackoff<T>(fn: () => Promise<T>, options: { maxRetries: number; baseDelayMs: number; shouldRetry?: (err: unknown) => boolean; sleepFn?: (ms: number) => Promise<void> }): Promise<T>. Thử chạy `fn()`. Nếu lỗi và `shouldRetry(err)` (mặc định true) và còn lượt retry, chờ `baseDelayMs * (2 ** attempt)` (dùng `sleepFn` mặc định `sleep`) rồi thử lại. Vượt quá `maxRetries` hoặc `shouldRetry` trả false thì ném lỗi ngay.',
        en: 'Implement async retryWithBackoff<T>(fn, { maxRetries, baseDelayMs, shouldRetry?, sleepFn? }): Promise<T>. Retry failed calls up to `maxRetries` times while `shouldRetry(err)` returns true, sleeping `baseDelayMs * (2 ** attempt)` via `sleepFn` between tries.',
      },
      starterCode: `export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    baseDelayMs: number;
    shouldRetry?: (err: unknown) => boolean;
    sleepFn?: (ms: number) => Promise<void>;
  }
): Promise<T> {
  // TODO: loop attempts, check shouldRetry, sleep exponential delay
  return fn();
}`,
      solutionCode: `export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    baseDelayMs: number;
    shouldRetry?: (err: unknown) => boolean;
    sleepFn?: (ms: number) => Promise<void>;
  }
): Promise<T> {
  const shouldRetry = options.shouldRetry ?? (() => true);
  const wait = options.sleepFn ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));

  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= options.maxRetries || !shouldRetry(err)) {
        throw err;
      }
      const delay = options.baseDelayMs * Math.pow(2, attempt);
      await wait(delay);
    }
  }
}`,
      testCode: `test('retries with exponential delays and succeeds', async () => {
  const delays: number[] = [];
  let calls = 0;
  const out = await retryWithBackoff(
    async () => {
      calls += 1;
      if (calls < 3) throw new Error('503');
      return 'OK';
    },
    { maxRetries: 3, baseDelayMs: 50, sleepFn: async (ms) => { delays.push(ms); } }
  );
  expect(out).toBe('OK');
  expect(delays).toEqual([50, 100]);
});

test('stops immediately on non-retryable error (e.g. 400)', async () => {
  let calls = 0;
  let threw = false;
  try {
    await retryWithBackoff(
      async () => {
        calls += 1;
        throw new Error('400 Bad Request');
      },
      {
        maxRetries: 5,
        baseDelayMs: 10,
        shouldRetry: (e) => !(e instanceof Error && e.message.includes('400')),
        sleepFn: async () => {},
      }
    );
  } catch {
    threw = true;
  }
  expect(threw).toBe(true);
  expect(calls).toBe(1);
});`,
      hints: [
        { vi: 'Dùng vòng lặp `for (let attempt = 0; ; attempt++)` — nếu `attempt >= options.maxRetries` hoặc `!shouldRetry(err)` thì `throw err`.', en: 'Loop attempt starting at 0; rethrow immediately when `attempt >= maxRetries || !shouldRetry(err)`.' },
        { vi: 'Thời gian chờ ở lần lỗi đầu tiên (attempt = 0) là `baseDelayMs * 2 ** 0 = baseDelayMs`.', en: 'First retry waits `baseDelayMs * 2 ** 0 = baseDelayMs`.' },
      ],
    },
    quiz: [
      {
        id: 'q-retry-1',
        topicId: 'retries-backoff-jitter',
        categoryId: 'networking',
        question: { vi: 'Mã lỗi HTTP nào sau đây KHÔNG NÊN tự động retry ở client?', en: 'Which HTTP status code should NEVER be automatically retried by the client?' },
        options: [
          { vi: '400 Bad Request hoặc 401 Unauthorized / 403 Forbidden (lỗi xác thực/dữ liệu hợp lệ cố định).', en: '400 Bad Request, 401 Unauthorized, or 403 Forbidden.' },
          { vi: '503 Service Unavailable.', en: '503 Service Unavailable.' },
          { vi: '502 Bad Gateway.', en: '502 Bad Gateway.' },
          { vi: '429 Too Many Requests (sau khi chờ Retry-After).', en: '429 Too Many Requests (after Retry-After).' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Gửi lại cùng một payload 400/401/403 vẫn sẽ thất bại y hệt và tốn băng thông vô ích.',
          en: 'Deterministic 4xx client/auth errors will keep failing identically on retries.',
        },
      },
      {
        id: 'q-retry-2',
        topicId: 'retries-backoff-jitter',
        categoryId: 'networking',
        question: { vi: 'Mục đích cốt lõi của Jitter (độ trễ ngẫu nhiên) trong Exponential Backoff là gì?', en: 'What problem does random Jitter solve in Exponential Backoff?' },
        options: [
          { vi: 'Phân tán thời điểm thử lại của nhiều client tránh đồng loạt đánh sập server (Thundering Herd).', en: 'Desynchronizes client retry spikes to prevent Thundering Herd overload on recovering backends.' },
          { vi: 'Tăng tốc độ tải file ảnh JPEG.', en: 'Accelerates JPEG decoding.' },
          { vi: 'Mã hóa dữ liệu cookie.', en: 'Encrypts cookies.' },
          { vi: 'Bỏ qua bước DNS lookup.', en: 'Skips DNS lookup.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Nếu mọi client dùng công thức `2 ** n` giống hệt nhau, tất cả sẽ dội vào server tại cùng một mili-giây.',
          en: 'Without jitter, simultaneous failures retry in synchronized lockstep waves.',
        },
      },
    ],
    relatedTopicIds: ['timeout', 'websockets', 'error-handling'],
  },

  {
    ...TOPIC_META_MAP['net-debounce-throttle'],
    mentalModel: {
      vi: 'Debounce giống thang máy: chờ người cuối cùng bước vào thêm 300ms không có ai bấm nữa mới chạy (hợp cho ô tìm kiếm Typeahead). Throttle giống vòi nước nhỏ giọt đều đặn tối đa 1 lần mỗi 300ms dù bấm liên tục (hợp cho gửi telemetry hoặc load thêm khi cuộn).',
      en: 'Debounce waits until user bursts pause for N ms (search autocomplete); Throttle guarantees at most one execution per N ms interval during continuous activity (scroll fetching, analytics).',
    },
    keyPoints: [
      { vi: 'Debounce giảm 80–95% số request khi gõ phím tìm kiếm nhanh; nên kết hợp thêm AbortController để tránh race condition.', en: 'Debounce cuts autocomplete API calls by 80–95%; pair it with AbortController to avoid stale responses.' },
      { vi: 'Throttle đảm bảo các sự kiện liên tục (gửi heartbeat đọc bài, auto-save khi đang gõ dài) vẫn đồng bộ định kỳ mà không chờ đến khi ngừng gõ.', en: 'Throttle guarantees periodic syncs (auto-save while continuously typing, scroll telemetry) without starving updates.' },
      { vi: 'Không đặt debounce quá dài (>400ms) cho ô search khiến UI cảm giác chậm chạp; ngưỡng đẹp thường là 150–300ms.', en: 'Keep search debounce tuned around 150–300ms so suggestions feel responsive without flooding APIs.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Debounce cho Search Typeahead, kiểm tra trùng username, auto-save sau khi dừng gõ.', en: 'Debounce for typeahead search, username availability checks, and idle auto-save.' },
        { vi: 'Throttle cho theo dõi vị trí đọc bài, scroll-to-load, giới hạn click gửi lệnh lặp.', en: 'Throttle for scroll tracking, continuous drag sync, and rate-limited action clicks.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng debounce khi user bấm nút "Lưu" hoặc "Thanh toán" — thay vào đó disable nút / dùng in-flight lock!', en: 'Do not use a 300ms trailing debounce on explicit Submit buttons; show instant feedback + disable duplicate clicks.' },
      ],
    },
    pitfalls: [
      { vi: 'Tạo hàm `debounce(...)` mới bên trong thân React component mỗi lần render mà quên `useMemo` hoặc `useRef` -> timer cũ không bao giờ bị cancel!', en: 'Recreating a debounced wrapper on every React render creates fresh timers that fail to cancel previous calls.' },
    ],
    interviewTips: [
      { vi: 'Trong bài toán Autocomplete: kết hợp Debounce (200ms) + Cache theo prefix + AbortController/Sequence ID để hoàn hảo cả 3 mặt tốc độ, băng thông và độ đúng!', en: 'Combine 3 techniques in Autocomplete interviews: 200ms debounce + prefix cache + AbortController.' },
    ],
    example: {
      title: { vi: 'So sánh trực tiếp Network Search Debounce vs Raw', en: 'Live Search API: Debounced vs Raw Calls' },
      description: { vi: 'Gõ nhanh vào ô tìm kiếm để đếm số lượng API call tiết kiệm được nhờ debounce 250ms.', en: 'Type rapidly into the search input and compare raw keystrokes vs debounced network calls.' },
      mode: 'react',
      code: `import React, { useEffect, useState } from 'react';

export default function App() {
  const [query, setQuery] = useState('');
  const [rawCount, setRawCount] = useState(0);
  const [apiCount, setApiCount] = useState(0);
  const [lastQuery, setLastQuery] = useState('');

  useEffect(() => {
    if (!query) return;
    const timer = setTimeout(() => {
      setApiCount((c) => c + 1);
      setLastQuery(query);
    }, 280);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="col">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setRawCount((c) => c + 1);
        }}
        placeholder="Type quickly: e.g. system design..."
      />
      <div className="row">
        <span className="badge">Keystrokes (raw): {rawCount}</span>
        <span className="badge" style={{ borderColor: '#22c55e', color: '#22c55e' }}>Network API calls: {apiCount}</span>
      </div>
      <div className="card muted">
        {lastQuery ? 'Fetched suggestions for: "' + lastQuery + '"' : 'Start typing above to see 280ms debounce.'}
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử đổi delay từ 280ms xuống 120ms hoặc 600ms để cảm nhận trade-off giữa độ nhạy và số request.', en: 'Adjust the timeout between 120ms and 600ms to feel the latency vs call-count trade-off.' },
    },
    quiz: [
      {
        id: 'q-netdeb-1',
        topicId: 'net-debounce-throttle',
        categoryId: 'networking',
        question: { vi: 'Tình huống nào NÊN dùng Throttle thay vì Debounce cho network request?', en: 'Which network scenario fits Throttle better than Debounce?' },
        options: [
          { vi: 'Tự động lưu nháp bài viết mỗi 5 giây trong suốt thời gian tác giả đang gõ liên tục không nghỉ.', en: 'Auto-saving a long document periodically every 5s while the author types nonstop.' },
          { vi: 'Chờ người dùng gõ xong từ khóa rồi mới gọi API tìm kiếm.', en: 'Waiting for the user to pause typing before querying search.' },
          { vi: 'Chuyển hướng 301 ở server.', en: 'Server 301 redirect.' },
          { vi: 'Tải ảnh hero đầu trang.', en: 'Preloading hero image.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Nếu dùng Debounce cho người gõ liên tục không ngừng nghỉ 10 phút, bản nháp sẽ không được lưu lần nào; Throttle đảm bảo lưu đều đặn.',
          en: 'Continuous typing would starve a trailing debounce forever, whereas throttle guarantees periodic checkpoints.',
        },
      },
      {
        id: 'q-netdeb-2',
        topicId: 'net-debounce-throttle',
        categoryId: 'networking',
        question: { vi: 'Lỗi phổ biến nhất khi viết debounce trong React functional component là gì?', en: 'What is the most common React bug when debouncing an event handler?' },
        options: [
          { vi: 'Tạo hàm `debounce(fn, 300)` trực tiếp trong render mà không bọc `useMemo`/`useCallback`/`useRef`, làm mỗi lần re-render sinh timer mới.', en: 'Recreating `debounce(fn, 300)` inline every render without `useMemo`/`useRef`, breaking cancellation across renders.' },
          { vi: 'Quên cài đặt CSS Grid.', en: 'Missing CSS Grid.' },
          { vi: 'Dùng `const` thay cho `let`.', en: 'Using `const` instead of `let`.' },
          { vi: 'Không đặt thẻ `<meta>`.', en: 'Omitting `<meta>` tags.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Mỗi lần render lại tạo ra một closure timer mới khiến các lời gọi trước đó không bị `clearTimeout`.',
          en: 'Re-creating the wrapper on render creates independent closures that fail to cancel prior timers.',
        },
      },
    ],
    relatedTopicIds: ['perf-debounce-throttle', 'race-conditions', 'batching'],
  },

  {
    ...TOPIC_META_MAP['net-optimistic-updates'],
    mentalModel: {
      vi: 'Khi bạn bấm Thả tim hoặc Đánh dấu hoàn thành việc, UI tô đỏ/tích xanh NGAY LẬP TỨC (0ms) dựa trên kết quả chắc chắn 99% thành công; nếu 1% API bị lỗi mới hoàn tác (rollback) kèm thông báo.',
      en: 'Apply expected state mutations immediately in UI (0ms feedback) while the network request travels in the background; smoothly roll back to a saved snapshot only if the server rejects.',
    },
    keyPoints: [
      { vi: 'Luôn lưu snapshot trạng thái trước khi sửa (hoặc dùng patch đảo ngược) để rollback chính xác khi server trả lỗi.', en: 'Capture a pre-mutation snapshot (or inverse patch) so failed mutations roll back deterministically.' },
      { vi: 'Thay thế Temporary ID (`temp-123`) bằng Real Server ID trả về từ response khi tạo mới comment/todo.', en: 'Reconcile temporary optimistic IDs (`temp-123`) with server-assigned canonical IDs upon confirmation.' },
      { vi: 'Hủy query đang fetch dở (`cancelQueries`) trước khi áp optimistic update để response cũ không ghi đè mất thay đổi mới.', en: 'Cancel competing in-flight refetches before applying optimistic mutations, and invalidate afterward.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Like/Bookmark, thêm/sửa Todo, gửi tin nhắn chat, đổi trạng thái Kanban có tỷ lệ thành công >99%.', en: 'Likes, bookmarks, todo toggles, chat messages, and Kanban card drags with high success rates.' },
      ],
      whenToAvoid: [
        { vi: 'Chuyển khoản ngân hàng, đặt vé máy bay cuối cùng, xóa tài khoản — nơi người dùng cần xác nhận chắc chắn từ server trước khi coi là xong.', en: 'Financial transfers, last-seat bookings, and destructive actions where false confirmation misleads users.' },
      ],
    },
    pitfalls: [
      { vi: 'Hai thao tác like -> unlike nhanh liên tiếp: request like lỗi chạy rollback đè lên state sau cùng nếu rollback dùng snapshot tĩnh thay vì logic bù trừ hoặc queue tuần tự.', en: 'Rapid toggle mutations rolling back blindly to stale snapshots can clobber newer queued actions.' },
    ],
    interviewTips: [
      { vi: 'Nêu rõ vòng đời 4 bước chuẩn TanStack Query: `cancelQueries` -> `snapshot` -> `setQueryData (optimistic)` -> `onError rollback` + `onSettled invalidate`.', en: 'Walk through the 4-step optimistic lifecycle: cancel in-flight reads -> snapshot -> apply optimistic state -> rollback on error & reconcile on settle.' },
    ],
    example: {
      title: { vi: 'Optimistic Toggle với Snapshot Rollback (Fail Mode)', en: 'Optimistic Like Toggle + Rollback Simulator' },
      description: { vi: 'Thử bấm Like khi chế độ "Simulate Server Failure" tắt vs bật để xem UI phản hồi 0ms và tự hoàn tác khi lỗi.', en: 'Toggle the server failure switch and click Like to watch 0ms optimistic state and automatic rollback.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

export default function App() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(128);
  const [shouldFail, setShouldFail] = useState(false);
  const [status, setStatus] = useState('Idle');

  const toggleLike = async () => {
    const prevLiked = liked;
    const prevCount = count;
    // 1. Optimistic UI update immediately (0ms)
    setLiked(!prevLiked);
    setCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setStatus('Syncing in background...');

    try {
      await new Promise((res, rej) => setTimeout(() => (shouldFail ? rej(new Error('500 Server Error')) : res(true)), 650));
      setStatus('Confirmed by server');
    } catch (err) {
      // 2. Rollback cleanly on failure
      setLiked(prevLiked);
      setCount(prevCount);
      setStatus('Failed -> Rolled back to snapshot');
    }
  };

  return (
    <div className="col">
      <label className="row" style={{ cursor: 'pointer' }}>
        <input type="checkbox" checked={shouldFail} onChange={(e) => setShouldFail(e.target.checked)} />
        <span>Simulate 500 Server Error</span>
      </label>
      <div className="row">
        <button className={liked ? 'primary' : ''} onClick={toggleLike}>
          {liked ? '♥ Liked' : '♡ Like'} ({count})
        </button>
        <span className="badge">{status}</span>
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Bật "Simulate 500 Server Error", bấm nút Like để xem số nhảy lên 129 ngay lập tức rồi hoàn tác về 128 sau 650ms.', en: 'Enable server error simulation and click Like to witness instant UI update followed by clean rollback.' },
    },
    quiz: [
      {
        id: 'q-opt-1',
        topicId: 'net-optimistic-updates',
        categoryId: 'networking',
        question: { vi: 'Hành động nào KHÔNG phù hợp để áp dụng Optimistic Update?', en: 'Which action should NOT use Optimistic Updates?' },
        options: [
          { vi: 'Xác nhận thanh toán thẻ tín dụng / chuyển tiền.', en: 'Confirming a credit card checkout or bank transfer.' },
          { vi: 'Thả tim (Like) một bài viết.', en: 'Liking a social feed post.' },
          { vi: 'Đánh dấu hoàn thành task cá nhân.', en: 'Checking off a personal todo item.' },
          { vi: 'Ghim hoặc bỏ ghim một tin nhắn.', en: 'Bookmarking an article.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Các giao dịch tài chính và hành động bất khả nghịch phải chờ server xác nhận thành công trước khi báo "Đã xong".',
          en: 'Irreversible or high-stakes financial actions require authoritative server confirmation first.',
        },
      },
      {
        id: 'q-opt-2',
        topicId: 'net-optimistic-updates',
        categoryId: 'networking',
        question: { vi: 'Khi tạo mới bình luận bằng Optimistic Update trước khi server trả về ID thật, client xử lý ID như thế nào?', en: 'How should optimistic item creation handle record IDs before the server responds?' },
        options: [
          { vi: 'Gán một Temporary Client ID (vd `temp-uuid`) để render và dùng làm React key, sau đó thay bằng Server ID khi response về.', en: 'Assign a temporary client ID (e.g. `temp-uuid`) for immediate rendering and swap/reconcile it with the server ID on confirmation.' },
          { vi: 'Để id là undefined.', en: 'Leave id undefined.' },
          { vi: 'Dùng luôn Math.random() làm key render mỗi lần.', en: 'Re-generate Math.random() keys per render.' },
          { vi: 'Ẩn bình luận cho đến khi tải lại trang.', en: 'Hide the comment until page reload.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Temporary ID (hoặc client-generated UUID gửi luôn lên server qua idempotency) giúp React không mount lại phần tử và giữ mượt animation.',
          en: 'Temporary or client-generated UUIDs prevent DOM remount glitches when server data resolves.',
        },
      },
    ],
    relatedTopicIds: ['perf-optimistic-updates', 'offline-first', 'ui-states'],
  },

  {
    ...TOPIC_META_MAP['timeout'],
    mentalModel: {
      vi: '`fetch()` mặc định của trình duyệt có thể treo chờ hàng phút khi mạng rớt gói im lặng! Luôn gắn bộ đếm `AbortController` / `AbortSignal.timeout(ms)` để chủ động ngắt và báo lỗi thân thiện thay vì spinner quay mãi mãi.',
      en: 'Native `fetch()` has no short default timeout and can hang indefinitely on stalled sockets; attach `AbortController` / `AbortSignal.timeout` to fail fast and free resources.',
    },
    keyPoints: [
      { vi: 'Dùng `AbortController` kết hợp `setTimeout` (nhớ `clearTimeout` trong `finally`) hoặc `AbortSignal.timeout(ms)` trên trình duyệt mới.', en: 'Wire `AbortController` + `clearTimeout` in `finally` (or `AbortSignal.timeout(ms)`) on every critical fetch.' },
      { vi: 'Hợp nhất nhiều signal (`AbortSignal.any([userSignal, timeoutSignal])`) để vừa hủy khi hết giờ vừa hủy khi component unmount.', en: 'Combine caller cancellation and timeout limits via `AbortSignal.any` or dual listeners.' },
      { vi: 'Phân biệt `AbortError` do hết timeout (nên thử lại hoặc hiện nút Retry) vs `AbortError` do người dùng rời trang (im lặng bỏ qua!).', en: 'Distinguish timeout aborts (retryable/user-visible) from navigation/unmount aborts (ignore silently).' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi API call trong production (search ~3–5s, payment ~15–30s, upload ~60s+).', en: 'All production network requests with budgets tuned per workload (3s search vs 30s checkout).' },
      ],
      whenToAvoid: [
        { vi: 'Không đặt timeout quá ngắn (vd 1s) cho endpoint upload file lớn hoặc streaming SSE dài hạn (nên đặt timeout theo inactivity giữa các chunk!).', en: 'Avoid short overall timeouts on file uploads or long SSE streams; reset inactivity timers per chunk instead.' },
      ],
    },
    pitfalls: [
      { vi: 'Quên `clearTimeout` khi fetch đã xong sớm gây memory leak timer hoặc báo timeout nhầm!', en: 'Forgetting `clearTimeout` after response completion leaves dangling timers in memory.' },
    ],
    interviewTips: [
      { vi: 'Nêu ra cách tách riêng hai trường hợp: Timeout (`TimeoutError`) cho phép Retry/Hiển thị lỗi, còn Unmount Abort (`AbortError`) phải được nuốt im lặng không hiện toast đỏ!', en: 'Highlight distinguishing a TimeoutError (eligible for retry/UI message) from an intentional component-unmount abort (silent ignore).' },
    ],
    example: {
      title: { vi: 'fetchWithTimeout chuẩn với AbortController & Cleanup', en: 'AbortController Timeout Wrapper Simulation' },
      description: { vi: 'Thử chạy hai request với độ trễ 80ms và 400ms dưới ngưỡng timeout 200ms.', en: 'Race an 80ms fast request and a 400ms slow request against a 200ms AbortController timeout.' },
      mode: 'ts',
      code: `async function runWithTimeout(url: string, simulatedDelay: number, timeoutMs = 200) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('Request timed out after ' + timeoutMs + 'ms')), timeoutMs);

  try {
    const res = await mockFetch(url, {
      delay: simulatedDelay,
      signal: controller.signal,
      response: { url, status: 'OK' },
    });
    return await res.json();
  } finally {
    clearTimeout(timer); // Always prevent dangling timer!
  }
}

console.log('Fast API (80ms):', await runWithTimeout('/api/fast', 80, 200));

try {
  await runWithTimeout('/api/slow', 400, 200);
} catch (err) {
  console.warn('Slow API aborted cleanly:', err instanceof Error ? err.message : err);
}`,
      tryItPrompt: { vi: 'Thử nâng `timeoutMs` của `/api/slow` lên 500ms để xem request thành công.', en: 'Raise the timeout for `/api/slow` to 500ms and re-run.' },
    },
    challenge: {
      id: 'challenge-fetch-timeout',
      topicId: 'timeout',
      categoryId: 'networking',
      title: { vi: 'Cài đặt withTimeout kết hợp AbortController', en: 'Implement withTimeout with AbortSignal' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm async withTimeout<T>(task: (signal: AbortSignal) => Promise<T>, timeoutMs: number): Promise<T>. Tạo AbortController nội bộ, đặt timer tự động abort sau timeoutMs và reject với Error("Timeout"). Nhớ clearTimeout trong khối finally khi task hoàn tất trước hạn.',
        en: 'Implement withTimeout<T>(task: (signal: AbortSignal) => Promise<T>, timeoutMs: number): Promise<T>. Pass an AbortController signal to `task`, abort and reject with Error("Timeout") if `timeoutMs` elapses first, and clear the timer in `finally`.',
      },
      starterCode: `export async function withTimeout<T>(
  task: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  // TODO: wire AbortController + setTimeout race + cleanup in finally
  return task(new AbortController().signal);
}`,
      solutionCode: `export async function withTimeout<T>(
  task: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('Timeout'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([task(controller.signal), timeoutPromise]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}`,
      testCode: `test('resolves fast task before timeout and leaves signal un-aborted', async () => {
  let aborted = false;
  const val = await withTimeout(async (signal) => {
    signal.addEventListener('abort', () => { aborted = true; });
    await sleep(15);
    return 'done';
  }, 150);
  expect(val).toBe('done');
  expect(aborted).toBe(false);
});

test('aborts slow task and throws Timeout error', async () => {
  let aborted = false;
  let errMsg = '';
  try {
    await withTimeout(async (signal) => {
      signal.addEventListener('abort', () => { aborted = true; });
      await sleep(150);
      return 'too late';
    }, 30);
  } catch (e) {
    errMsg = e instanceof Error ? e.message : String(e);
  }
  expect(aborted).toBe(true);
  expect(errMsg).toContain('Timeout');
});`,
      hints: [
        { vi: 'Dùng `Promise.race([task(controller.signal), timeoutPromise])` để ngắt ngay khi hết giờ kể cả nếu `task` không lắng nghe `signal`.', en: 'Race `task(controller.signal)` against a timeout Promise while also calling `controller.abort()`.' },
        { vi: 'Luôn gọi `clearTimeout(timer)` trong `finally` để không rò rỉ timer khi task xong sớm.', en: 'Clear the timeout inside `finally` when the task settles early.' },
      ],
    },
    quiz: [
      {
        id: 'q-to-1',
        topicId: 'timeout',
        categoryId: 'networking',
        question: { vi: 'Điều gì xảy ra nếu bạn dùng `Promise.race` để timeout mà KHÔNG truyền `controller.signal` vào `fetch()`?', en: 'What happens if you timeout a `fetch()` with `Promise.race` WITHOUT passing `AbortController.signal`?' },
        options: [
          { vi: 'Promise ngoài reject đúng giờ nhưng trình duyệt vẫn ngầm giữ kết nối mạng chạy tiếp cho tới khi server đóng.', en: 'The race rejects on time, yet the underlying browser socket continues running and consuming bandwidth/connections.' },
          { vi: 'Server tự động tắt ngay lập tức.', en: 'The server shuts down immediately.' },
          { vi: 'Trình duyệt tự động ném SyntaxError.', en: 'The browser throws SyntaxError.' },
          { vi: 'Cache được xóa sạch.', en: 'Browser cache resets.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Promise.race chỉ bỏ qua kết quả chứ không hủy HTTP request; chỉ có `AbortController.signal` mới thực sự abort socket ở trình duyệt.',
          en: '`Promise.race` ignores late results but never aborts the HTTP transport unless paired with `AbortSignal`.',
        },
      },
      {
        id: 'q-to-2',
        topicId: 'timeout',
        categoryId: 'networking',
        question: { vi: 'Vì sao nên đặt `clearTimeout(timer)` trong khối `finally` khi cài đặt fetch timeout?', en: 'Why place `clearTimeout(timer)` in a `finally` block around an aborted fetch?' },
        options: [
          { vi: 'Để giải phóng timer ngay khi request thành công hoặc gặp lỗi sớm, tránh leak timer.', en: 'To clean up timers immediately when fetch settles early (success or error), preventing timer leaks.' },
          { vi: 'Để ép request chạy chậm hơn.', en: 'To slow requests down.' },
          { vi: 'Để lưu kết quả vào sessionStorage.', en: 'To persist responses in sessionStorage.' },
          { vi: 'Vì JS cấm clearTimeout trong khối try.', en: 'JavaScript forbids clearTimeout in try blocks.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Xóa timer trong `finally` đảm bảo không còn callback mồ côi giữ tham chiếu closure/AbortController.',
          en: 'Clearing in `finally` releases closure and AbortController references deterministically.',
        },
      },
    ],
    relatedTopicIds: ['retries-backoff-jitter', 'race-conditions', 'error-handling'],
  },

  {
    ...TOPIC_META_MAP['race-conditions'],
    mentalModel: {
      vi: 'Mạng không bao giờ đảm bảo gửi trước về trước! Khi user gõ "r" (mất 800ms mới về) rồi gõ tiếp "re" (mất 150ms về trước), nếu không hủy request "r" hoặc kiểm tra số thứ tự, kết quả "r" về sau sẽ ghi đè đè nát kết quả "re" đúng!',
      en: 'Network responses arrive out of order: an older slow request can resolve after a newer fast request and overwrite fresh UI state unless canceled with AbortController or guarded by a sequence token.',
    },
    keyPoints: [
      { vi: 'Giải pháp 1 — `AbortController`: hủy ngay request trước đó mỗi khi bắt đầu query mới (tiết kiệm cả CPU server lẫn băng thông).', en: 'Fix 1 — `AbortController`: cancel the prior in-flight request inside `useEffect` cleanup or before dispatching the next search.' },
      { vi: 'Giải pháp 2 — Request Sequence ID / `ignore` boolean flag: mọi callback/setState chỉ được chạy nếu ID của request khớp với `latestRequestId`.', en: 'Fix 2 — Sequence ID / `let ignore = false` cleanup flag: discard any response whose token is no longer latest.' },
      { vi: 'Nên dùng CẢ HAI cùng lúc để vừa ngắt kết nối thật ở tầng mạng vừa bảo vệ tuyệt đối state React.', en: 'Combine both AbortController and a latest-token guard for network savings plus ironclad state safety.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Search Typeahead, lọc bảng nhiều điều kiện, chuyển tab tải chi tiết nhanh liên tiếp.', en: 'Typeahead search, rapid filter switching, tab/detail master-detail navigation.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng abort các mutation ghi dữ liệu quan trọng nếu việc abort client không ngăn được server xử lý xong nửa chừng (dùng queue tuần tự hoặc disable trigger).', en: 'Do not blindly abort critical write mutations mid-flight—serialize or lock writes instead.' },
      ],
    },
    pitfalls: [
      { vi: 'Bắt `catch (err)` khi abort mà quên kiểm tra `if (err.name === "AbortError") return;` khiến màn hình hiện báo lỗi đỏ mỗi lần người dùng gõ chữ tiếp theo!', en: 'Displaying an error toast when `AbortError` fires during normal typing.' },
    ],
    interviewTips: [
      { vi: 'Nhớ viết chuẩn pattern `useEffect(() => { const ctrl = new AbortController(); ... return () => ctrl.abort(); }, [query])` — câu hỏi phỏng vấn React/System Design kinh điển!', en: 'Demonstrate the classic `useEffect` cleanup `ctrl.abort()` + `AbortError` guard; interviewers test this constantly.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Out-of-Order Race Condition (Unsafe vs Protected)', en: 'Out-of-Order Race Condition Live Demo' },
      description: { vi: 'Bấm "Run Fast Query Sequence" ở chế độ Unsafe vs Protected để thấy request cũ trả lời chậm đè hỏng kết quả mới như thế nào!', en: 'Click "Simulate Fast Typing (a -> ab)" in Unsafe vs Protected mode to watch stale responses overwrite fresh UI.' },
      mode: 'react',
      code: `import React, { useRef, useState } from 'react';

export default function App() {
  const [mode, setMode] = useState<'unsafe' | 'protected'>('unsafe');
  const [displayed, setDisplayed] = useState('Click button below to simulate typing "a" then "ab"');
  const [logs, setLogs] = useState<string[]>([]);
  const latestReqId = useRef(0);

  const simulateTyping = () => {
    setLogs([]);
    const runQuery = (q: string, delayMs: number) => {
      const reqId = ++latestReqId.current;
      setLogs((l) => [...l, \`Started query "\${q}" (will take \${delayMs}ms)\`]);
      setTimeout(() => {
        if (mode === 'protected' && reqId !== latestReqId.current) {
          setLogs((l) => [...l, \`IGNORED stale response for "\${q}" (latest is #\${latestReqId.current})\`]);
          return;
        }
        setDisplayed(\`Showing results for: "\${q}"\`);
        setLogs((l) => [...l, \`Rendered "\${q}"\`]);
      }, delayMs);
    };

    // "a" is fired first but slow (700ms); "ab" is fired second and fast (180ms)!
    runQuery('a', 700);
    setTimeout(() => runQuery('ab', 180), 60);
  };

  return (
    <div className="col">
      <div className="row">
        <button className={mode === 'unsafe' ? 'primary' : ''} onClick={() => setMode('unsafe')}>Unsafe Mode</button>
        <button className={mode === 'protected' ? 'primary' : ''} onClick={() => setMode('protected')}>Protected (Seq ID)</button>
        <button onClick={simulateTyping}>Simulate "a" (700ms) -&gt; "ab" (180ms)</button>
      </div>
      <div className="card">
        <strong>UI State: </strong>{displayed}
      </div>
      <pre className="card muted" style={{ margin: 0 }}>{logs.join('\\n') || 'Waiting...'}</pre>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử chạy ở Unsafe Mode trước (sẽ thấy "a" đè lại "ab" sai), rồi chuyển sang Protected để kiểm chứng.', en: 'Run in Unsafe Mode first to witness "a" overwrite "ab", then switch to Protected.' },
    },
    challenge: {
      id: 'challenge-latest-only',
      topicId: 'race-conditions',
      categoryId: 'networking',
      title: { vi: 'Cài đặt createLatestOnly chống Race Condition', en: 'Implement createLatestOnly Race Guard' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm createLatestOnly<T>(): (fn: (signal: AbortSignal) => Promise<T>) => Promise<{ stale: boolean; value?: T }>. Mỗi lần gọi hàm trả về, tăng seqId và abort AbortController của lần gọi trước đó. Nếu sau khi `fn(signal)` hoàn thành mà seqId không còn là mới nhất (hoặc signal bị aborted), trả `{ stale: true }`, ngược lại trả `{ stale: false, value }`.',
        en: 'Implement createLatestOnly<T>() returning a runner `(fn: (signal: AbortSignal) => Promise<T>) => Promise<{ stale: boolean; value?: T }>`. Each call aborts any previous active controller and bumps a sequence token. If a newer call starts before `fn` resolves, return `{ stale: true }`; otherwise `{ stale: false, value }`.',
      },
      starterCode: `export function createLatestOnly<T>() {
  // TODO: track sequence token + active AbortController
  return async (_fn: (signal: AbortSignal) => Promise<T>): Promise<{ stale: boolean; value?: T }> => {
    return { stale: true };
  };
}`,
      solutionCode: `export function createLatestOnly<T>() {
  let latestId = 0;
  let activeController: AbortController | null = null;

  return async (fn: (signal: AbortSignal) => Promise<T>): Promise<{ stale: boolean; value?: T }> => {
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    const myId = ++latestId;

    const value = await fn(controller.signal);
    if (myId !== latestId || controller.signal.aborted) {
      return { stale: true };
    }
    return { stale: false, value };
  };
}`,
      testCode: `test('marks slower older call stale and aborts its signal', async () => {
  const runLatest = createLatestOnly<string>();
  let firstAborted = false;

  const p1 = runLatest(async (signal) => {
    signal.addEventListener('abort', () => { firstAborted = true; });
    await sleep(90);
    return 'old';
  });

  await sleep(10);

  const p2 = runLatest(async () => {
    await sleep(20);
    return 'fresh';
  });

  const [r1, r2] = await Promise.all([p1, p2]);
  expect(firstAborted).toBe(true);
  expect(r1).toEqual({ stale: true });
  expect(r2).toEqual({ stale: false, value: 'fresh' });
});`,
      hints: [
        { vi: 'Gọi `activeController?.abort()` ngay đầu lời gọi mới rồi tạo `new AbortController()`.', en: 'Abort the prior `activeController` at the start of each invocation and assign a new one.' },
        { vi: 'So sánh `myId !== latestId || controller.signal.aborted` sau khi `await fn(controller.signal)` kết thúc.', en: 'Check `myId !== latestId || controller.signal.aborted` after awaiting `fn(controller.signal)`.' },
      ],
    },
    quiz: [
      {
        id: 'q-race-1',
        topicId: 'race-conditions',
        categoryId: 'networking',
        question: { vi: 'Cách xử lý chuẩn xác khi người dùng gõ từ khóa mới trong ô Search khi request trước đó chưa về xong là gì?', en: 'What is the cleanest way to handle an in-flight search fetch when the user types a newer query?' },
        options: [
          { vi: 'Hủy request cũ bằng `AbortController.abort()` trong cleanup và/hoặc kiểm tra sequence token mới nhất trước khi cập nhật state.', en: 'Abort the previous request via `AbortController` and/or verify the response matches the latest request token.' },
          { vi: 'Khóa bàn phím không cho gõ đến khi API trả về.', en: 'Disable keyboard input until the API responds.' },
          { vi: 'Chạy 2 request nhưng giữ lại cái nào về sau cùng.', en: 'Keep whichever response finishes last.' },
          { vi: 'Xóa cache HTTP trình duyệt.', en: 'Purge browser HTTP cache.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Hủy request cũ bằng AbortController + sequence check vừa tránh stale data vừa giảm tải server.',
          en: 'Aborting + token checks guarantee only the latest query updates UI state.',
        },
      },
      {
        id: 'q-race-2',
        topicId: 'race-conditions',
        categoryId: 'networking',
        question: { vi: 'Khi một `fetch` bị hủy chủ động bởi `AbortController` trong quá trình người dùng gõ tiếp, khối `catch` cần làm gì?', en: 'When a search `fetch` throws due to intentional `AbortController.abort()`, what should the `catch` block do?' },
        options: [
          { vi: 'Kiểm tra `err.name === "AbortError"` và bỏ qua im lặng (không hiển thị thông báo lỗi cho user).', en: 'Check `err.name === "AbortError"` and silently ignore it without showing an error alert.' },
          { vi: 'Hiện popup báo mất kết nối internet.', en: 'Show a network-failure modal.' },
          { vi: 'Retry ngay lập tức 10 lần.', en: 'Retry 10 times immediately.' },
          { vi: 'Reload lại trang web.', en: 'Reload the browser window.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'AbortError là hủy có chủ đích theo luồng nghiệp vụ bình thường, không phải lỗi mạng.',
          en: 'Intentional aborts are normal cancellation flow, not failures to report.',
        },
      },
    ],
    relatedTopicIds: ['timeout', 'net-debounce-throttle', 'error-handling'],
  },

  {
    ...TOPIC_META_MAP['net-offline-usage'],
    mentalModel: {
      vi: 'Khi mất mạng trên tàu điện ngầm, thao tác bấm "Gửi bình luận" hay "Lưu ghi chú" được ghi vào hàng đợi cục bộ bền vững (Outbox trong IndexedDB) kèm Idempotency-Key rồi tự phát tuần tự khi `online` trở lại.',
      en: 'When connectivity drops, queue user mutations into a durable local Outbox (IndexedDB) stamped with idempotency keys and replay them deterministically upon reconnection.',
    },
    keyPoints: [
      { vi: 'Phát hiện mạng thông qua `navigator.onLine`, sự kiện `window` `online`/`offline`, và thực tế nhất là kết quả request fetch thất bại (vì Lie-Fi có `onLine = true` nhưng mất gói!).', en: 'Detect true connectivity via failed network fetches alongside `navigator.onLine` events (beware Lie-Fi).' },
      { vi: 'Hàng đợi Outbox phải bảo toàn thứ tự FIFO (ví dụ: Tạo bài viết -> Sửa bài viết đó) và gắn Idempotency-Key phòng trường hợp replay trùng.', en: 'Preserve FIFO ordering for dependent mutations and attach Idempotency-Keys so replays stay safe.' },
      { vi: 'Hiển thị trạng thái rõ ràng cho user: "Đã lưu cục bộ — sẽ đồng bộ khi có mạng (2 thay đổi chờ)".', en: 'Show clear pending sync status ("Saved locally — 2 changes queued for sync") so users trust offline actions.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'App ghi chú, app giao hàng ngoài hiện trường, chat mobile, trình soạn thảo tài liệu.', en: 'Field-ops apps, note-taking tools, messaging clients, and travel apps.' },
      ],
      whenToAvoid: [
        { vi: 'Hệ thống đấu giá thời gian thực hoặc đặt ghế rạp chiếu phim bắt buộc kết nối server tức thời.', en: 'Real-time auctions or live seat-lock checkout flows requiring immediate authoritative locks.' },
      ],
    },
    pitfalls: [
      { vi: 'Chỉ dựa vào `navigator.onLine === true` (Lie-Fi ở Wi-Fi yếu vẫn trả true dù không chạm được internet).', en: 'Trusting `navigator.onLine === true` blindly on captive portals or Lie-Fi connections.' },
      { vi: 'Để queue trong RAM thay vì IndexedDB -> người dùng F5 hoặc tắt tab là mất sạch thao tác chưa đồng bộ.', en: 'Keeping the offline outbox only in memory instead of IndexedDB loses unsynced edits on reload.' },
    ],
    interviewTips: [
      { vi: 'Phân biệt nhanh: "Offline usage" trong Networking chú trọng Queue + Sync + Idempotency + Lie-Fi detection; kết hợp với "Offline-first" (IndexedDB + Service Worker) ở phần Common Patterns.', en: 'Connect Offline Outbox Queues + Idempotency + Lie-Fi detection here with Service Worker + IndexedDB storage in Offline-First patterns.' },
    ],
    example: {
      title: { vi: 'Offline Action Outbox Queue với Replay & Idempotency', en: 'Offline Outbox Queue & Reconnect Replay' },
      description: { vi: 'Xếp hàng các mutation khi offline, mô phỏng online trở lại và kiểm tra chỉ các thao tác thành công được xóa khỏi queue.', en: 'Queue mutations offline, recover network mid-flush, and keep failed tail items queued safely.' },
      mode: 'ts',
      code: `interface ActionItem { id: string; payload: string }

function createOutbox() {
  const queue: ActionItem[] = [];
  return {
    enqueue(payload: string) {
      queue.push({ id: 'idem-' + (queue.length + 1), payload });
    },
    async sync(send: (item: ActionItem) => Promise<void>) {
      while (queue.length > 0) {
        const head = queue[0];
        try {
          await send(head);
          queue.shift(); // Remove only after server confirms!
          console.log('Synced:', head);
        } catch (err) {
          console.warn('Sync paused on', head.id, '-> remaining queued:', queue.length);
          break;
        }
      }
    },
    size: () => queue.length,
  };
}

const outbox = createOutbox();
outbox.enqueue('CREATE_NOTE: Meeting');
outbox.enqueue('EDIT_NOTE: Added action items');
outbox.enqueue('PIN_NOTE: Meeting');

let online = false;
await outbox.sync(async () => { if (!online) throw new Error('Offline'); });
console.log('Queue while offline:', outbox.size());

online = true;
await outbox.sync(async () => { await sleep(20); });
console.log('Queue after online sync:', outbox.size());`,
      tryItPrompt: { vi: 'Thử làm phần tử thứ 2 throw lỗi tạm thời để thấy queue dừng đúng phần tử đó, giữ nguyên thứ tự FIFO cho lần sync sau.', en: 'Fail only the 2nd item during sync and verify FIFO ordering preserves item 2 and 3.' },
    },
    challenge: {
      id: 'challenge-offline-queue',
      topicId: 'net-offline-usage',
      categoryId: 'networking',
      title: { vi: 'Cài đặt offlineActionQueue (FIFO + Durable Flush)', en: 'Implement offlineActionQueue' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm createOfflineQueue<T>() trả về { enqueue(item: T): number; pending(): T[]; flush(sender: (item: T) => Promise<void>): Promise<{ synced: number; remaining: number }> }. Khi flush, gửi tuần tự theo FIFO; chỉ xóa phần tử khỏi queue khi `sender(item)` resolve thành công. Nếu `sender(item)` throw lỗi, dừng flush ngay tại phần tử đó và giữ nguyên nó cùng các phần tử phía sau trong queue.',
        en: 'Implement createOfflineQueue<T>() with enqueue(item), pending(), and async flush(sender). Flush items sequentially FIFO, removing each item only after `sender(item)` resolves. If `sender` rejects, stop flushing immediately and retain the failed and subsequent items in order.',
      },
      starterCode: `export function createOfflineQueue<T>() {
  // TODO: implement FIFO queue, pending snapshot, and sequential fault-tolerant flush
  return {
    enqueue: (_item: T): number => 0,
    pending: (): T[] => [],
    flush: async (_sender: (item: T) => Promise<void>) => ({ synced: 0, remaining: 0 }),
  };
}`,
      solutionCode: `export function createOfflineQueue<T>() {
  const queue: T[] = [];

  return {
    enqueue(item: T): number {
      queue.push(item);
      return queue.length;
    },
    pending(): T[] {
      return [...queue];
    },
    async flush(sender: (item: T) => Promise<void>): Promise<{ synced: number; remaining: number }> {
      let synced = 0;
      while (queue.length > 0) {
        const nextItem = queue[0];
        try {
          await sender(nextItem);
          queue.shift();
          synced += 1;
        } catch {
          break;
        }
      }
      return { synced, remaining: queue.length };
    },
  };
}`,
      testCode: `test('flushes FIFO and stops safely preserving failed tail', async () => {
  const q = createOfflineQueue<string>();
  q.enqueue('m1');
  q.enqueue('m2');
  q.enqueue('m3');

  const delivered: string[] = [];
  const res1 = await q.flush(async (item) => {
    if (item === 'm2') throw new Error('Offline');
    delivered.push(item);
  });

  expect(res1).toEqual({ synced: 1, remaining: 2 });
  expect(q.pending()).toEqual(['m2', 'm3']);

  const res2 = await q.flush(async (item) => {
    delivered.push(item);
  });
  expect(res2).toEqual({ synced: 2, remaining: 0 });
  expect(delivered).toEqual(['m1', 'm2', 'm3']);
});`,
      hints: [
        { vi: 'Dùng `while (queue.length > 0)` đọc `queue[0]`, await `sender(queue[0])` thành công rồi mới gọi `queue.shift()`.', en: 'Peek `queue[0]`, await `sender`, and only `queue.shift()` after resolution.' },
        { vi: 'Trong `catch`, dùng `break` để bảo toàn phần tử lỗi và các phần tử đứng sau theo đúng thứ tự phụ thuộc.', en: 'On error, `break` out of the loop to preserve causal FIFO order.' },
      ],
    },
    quiz: [
      {
        id: 'q-offnet-1',
        topicId: 'net-offline-usage',
        categoryId: 'networking',
        question: { vi: 'Thuật ngữ "Lie-Fi" chỉ hiện tượng nào khi thiết kế mạng Front End?', en: 'What does "Lie-Fi" mean in Front End networking?' },
        options: [
          { vi: 'Trình duyệt báo `navigator.onLine === true` vì có kết nối Wi-Fi nhưng thực chất mạng không truy cập được server hoặc mất gói hoàn toàn.', en: 'The browser reports `navigator.onLine === true` because Wi-Fi is attached, yet packets cannot reach the internet.' },
          { vi: 'Tốc độ Wi-Fi nhanh hơn cáp quang.', en: 'Wi-Fi faster than fiber.' },
          { vi: 'Dữ liệu giả lập trong môi trường unit test.', en: 'Mocked data in tests.' },
          { vi: 'Lỗi chính tả trong thẻ HTML.', en: 'HTML syntax error.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Do Lie-Fi, app phải xử lý timeout/network failure của request thật kết hợp với `navigator.onLine` chứ không chỉ tin một biến boolean.',
          en: 'Because of Lie-Fi, combine actual fetch timeouts/failures with `navigator.onLine` instead of relying on `onLine` alone.',
        },
      },
      {
        id: 'q-offnet-2',
        topicId: 'net-offline-usage',
        categoryId: 'networking',
        question: { vi: 'Khi flush lại hàng đợi Outbox sau khi có mạng, vì sao cần giữ thứ tự FIFO và Idempotency-Key?', en: 'Why preserve FIFO order and Idempotency-Keys when flushing an offline action queue?' },
        options: [
          { vi: 'Để đảm bảo thao tác phụ thuộc chạy đúng thứ tự (tạo trước -> sửa sau) và server không thực hiện trùng nếu phản hồi bị rớt giữa chừng.', en: 'To respect causal dependencies (create before edit) and prevent duplicate execution if acks drop.' },
          { vi: 'Để giảm dung lượng file ảnh PNG.', en: 'To shrink PNG files.' },
          { vi: 'Để trình duyệt bỏ qua CSP.', en: 'To bypass CSP headers.' },
          { vi: 'Để chạy nhanh hơn Web Worker.', en: 'To outperform Web Workers.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Nếu gửi song song hoặc không có idempotency key, hành động Update có thể chạy trước Create hoặc chạy 2 lần khi mạng chập chờn.',
          en: 'Sequential FIFO preserves causal ordering and Idempotency-Keys safely handle intermittent reconnect acks.',
        },
      },
    ],
    relatedTopicIds: ['offline-first', 'conflict-resolution', 'retries-backoff-jitter'],
  },

  {
    ...TOPIC_META_MAP['caching-expiry'],
    mentalModel: {
      vi: 'Dữ liệu cache có hạn sử dụng (TTL): trong thời gian còn tươi (`max-age`), trả về tức thì ở 0ms không chạm mạng; khi hết hạn (`stale-while-revalidate`), có thể đưa bản cũ ra hiển thị ngay trong lúc âm thầm tải bản mới thay thế.',
      en: 'Every cached entry carries an expiry policy: serve fresh entries immediately with zero network cost, evict or revalidate expired ones, and optionally serve stale while refreshing in the background.',
    },
    keyPoints: [
      { vi: 'HTTP Caching: `Cache-Control: public, max-age=31536000, immutable` cho static hashed assets (`app.8a3f.js`); `no-cache` / `max-age=0, must-revalidate` + `ETag` cho HTML.', en: 'HTTP Caching: `immutable` long max-age for content-hashed JS/CSS; `no-cache` + ETag validation for entry HTML.' },
      { vi: 'Client Memory/Query Cache (TanStack Query / SWR): phân biệt `staleTime` (khoảng thời gian coi là tươi) và `gcTime` (thời gian giữ cache trong RAM sau khi unmount).', en: 'Client caches distinguish `staleTime` (freshness window) from `gcTime`/`cacheTime` (unused retention before GC).' },
      { vi: 'Cache Invalidation sau Mutation: khi user sửa dữ liệu (POST/PATCH/DELETE), chủ động invalidate các cache key liên quan.', en: 'Invalidate or optimistically update affected query keys immediately after write mutations.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi tài nguyên tĩnh có content hash (immutable) và dữ liệu API đọc lặp đi lặp lại giữa các tab/route.', en: 'Every content-hashed static asset and repeatedly read API data across routes.' },
      ],
      whenToAvoid: [
        { vi: 'Không đặt `Cache-Control: public, max-age=...` lên dữ liệu cá nhân nhạy cảm (dùng `private, no-store`!).', en: 'Never cache sensitive private PII on shared/CDN caches—use `private, no-store`.' },
      ],
    },
    pitfalls: [
      { vi: 'Đặt `max-age=86400` cho file `index.html` không có hash khiến người dùng bị kẹt ở phiên bản JS cũ đã bị xóa trên server!', en: 'Caching `index.html` long-term serves stale HTML pointing to purged hashed JS chunks after a new deploy.' },
    ],
    interviewTips: [
      { vi: 'Cặp chiến lược chuẩn chỉnh cho Web Deployment: `index.html` -> `no-cache` (hoặc `s-maxage` + purge khi deploy), còn `/assets/*.hash.js` -> `max-age=31536000, immutable`!', en: 'Always state the canonical deployment caching rule: `index.html` gets `no-cache` (revalidates), hashed bundles get `max-age=31536000, immutable`.' },
    ],
    example: {
      title: { vi: 'Client TTL Cache với Invalidation & Capacity Limit', en: 'Client TTL Cache with Expiry Simulation' },
      description: { vi: 'Thử ghi/đọc cache với TTL 120ms và quan sát cache hit vs miss khi hết hạn.', en: 'Read/write entries under a 120ms TTL and watch cache hits transition to expired misses.' },
      mode: 'ts',
      code: `function createTTLCache<V>(ttlMs: number) {
  const store = new Map<string, { value: V; expiresAt: number }>();
  return {
    set(key: string, value: V, customTtl = ttlMs) {
      store.set(key, { value, expiresAt: Date.now() + customTtl });
    },
    get(key: string): V | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    invalidate(prefix: string) {
      for (const k of store.keys()) {
        if (k.startsWith(prefix)) store.delete(k);
      }
    },
  };
}

const apiCache = createTTLCache<any>(120);
apiCache.set('user:1', { name: 'Linh' });
console.log('Immediate hit:', apiCache.get('user:1'));

await sleep(140);
console.log('After 140ms (expired):', apiCache.get('user:1'));`,
      tryItPrompt: { vi: 'Thử gọi `apiCache.invalidate("user:")` ngay sau khi `set` để kiểm tra xóa cache theo prefix.', en: 'Call `apiCache.invalidate("user:")` right after `set` to verify prefix invalidation.' },
    },
    challenge: {
      id: 'challenge-ttl-cache',
      topicId: 'caching-expiry',
      categoryId: 'networking',
      title: { vi: 'Cài đặt createTTLCache với Custom Clock & Stats', en: 'Implement createTTLCache' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm createTTLCache<V>(defaultTtlMs: number, now?: () => number) cung cấp: set(key, value, ttlMs?), get(key): V | undefined (trả undefined và xóa entry nếu `now() >= expiresAt`), delete(key), invalidatePrefix(prefix) (xóa toàn bộ key bắt đầu bằng prefix), và size() (chỉ đếm các entry còn hạn!).',
        en: 'Implement createTTLCache<V>(defaultTtlMs, now?) with set(key, value, ttlMs?), get(key) (deleting and returning undefined when `now() >= expiresAt`), delete(key), invalidatePrefix(prefix), and size() (returning only unexpired entry count).',
      },
      starterCode: `export function createTTLCache<V>(
  defaultTtlMs: number,
  now: () => number = () => Date.now()
) {
  // TODO: manage Map entries with expiresAt and prune expired entries
  return {
    set: (_key: string, _value: V, _ttlMs?: number): void => {},
    get: (_key: string): V | undefined => undefined,
    delete: (_key: string): boolean => false,
    invalidatePrefix: (_prefix: string): number => 0,
    size: (): number => 0,
  };
}`,
      solutionCode: `export function createTTLCache<V>(
  defaultTtlMs: number,
  now: () => number = () => Date.now()
) {
  const store = new Map<string, { value: V; expiresAt: number }>();

  const prune = () => {
    const t = now();
    for (const [k, entry] of store.entries()) {
      if (t >= entry.expiresAt) store.delete(k);
    }
  };

  return {
    set(key: string, value: V, ttlMs = defaultTtlMs): void {
      store.set(key, { value, expiresAt: now() + ttlMs });
    },
    get(key: string): V | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (now() >= entry.expiresAt) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    delete(key: string): boolean {
      return store.delete(key);
    },
    invalidatePrefix(prefix: string): number {
      let count = 0;
      for (const k of Array.from(store.keys())) {
        if (k.startsWith(prefix)) {
          store.delete(k);
          count += 1;
        }
      }
      return count;
    },
    size(): number {
      prune();
      return store.size;
    },
  };
}`,
      testCode: `test('respects TTL expiry and prefix invalidation with injected clock', () => {
  let clock = 1000;
  const cache = createTTLCache<string>(500, () => clock);
  cache.set('posts:1', 'Hello');
  cache.set('posts:2', 'World', 1000);
  cache.set('user:1', 'Admin');

  expect(cache.get('posts:1')).toBe('Hello');
  expect(cache.size()).toBe(3);

  clock = 1500; // posts:1 (1000+500) and user:1 expired!
  expect(cache.get('posts:1')).toBeUndefined();
  expect(cache.get('posts:2')).toBe('World');
  expect(cache.size()).toBe(1);

  cache.set('posts:3', 'New');
  expect(cache.invalidatePrefix('posts:')).toBe(2);
  expect(cache.size()).toBe(0);
});`,
      hints: [
        { vi: 'Kiểm tra `now() >= entry.expiresAt` để xử lý đúng mốc vừa chạm thời điểm hết hạn.', en: 'Treat `now() >= entry.expiresAt` as expired so exact boundary times expire deterministically.' },
        { vi: 'Gọi hàm `prune()` bên trong `size()` để không đếm nhầm entry đã hết hạn chưa được `get()`.', en: 'Prune expired keys inside `size()` so stale un-accessed keys are not counted.' },
      ],
    },
    quiz: [
      {
        id: 'q-cache-1',
        topicId: 'caching-expiry',
        categoryId: 'networking',
        question: { vi: 'Cấu hình `Cache-Control` nào là chuẩn mực cho file JS/CSS có content hash ở tên file (vd `app.9f31c.js`)?', en: 'Which `Cache-Control` header is optimal for content-hashed static bundles like `app.9f31c.js`?' },
        options: [
          { vi: 'Cache-Control: public, max-age=31536000, immutable', en: 'Cache-Control: public, max-age=31536000, immutable' },
          { vi: 'Cache-Control: no-store', en: 'Cache-Control: no-store' },
          { vi: 'Cache-Control: private, max-age=5', en: 'Cache-Control: private, max-age=5' },
          { vi: 'Không gửi header nào.', en: 'No cache headers.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Vì tên file chứa hash nội dung (sửa code là đổi tên file), trình duyệt có thể cache 1 năm `immutable` mà không cần hỏi lại server.',
          en: 'Content hashing guarantees URLs never mutate, making 1-year `immutable` caching completely safe.',
        },
      },
      {
        id: 'q-cache-2',
        topicId: 'caching-expiry',
        categoryId: 'networking',
        question: { vi: 'Vì sao không nên đặt `Cache-Control: max-age=604800` cho file `index.html` của SPA?', en: 'Why should `index.html` NOT receive `max-age=604800` (7 days) in an SPA?' },
        options: [
          { vi: 'Sau khi deploy bản mới, trình duyệt vẫn giữ `index.html` cũ trỏ tới các tên file JS hash cũ có thể đã bị xóa (gây lỗi 404/màn hình trắng).', en: 'Visitors with cached `index.html` keep requesting purged older JS chunk filenames after new deployments.' },
          { vi: 'HTML không thể nén được nếu cache lâu.', en: 'HTML breaks compression.' },
          { vi: 'Google cấm cache HTML.', en: 'Google forbids caching HTML.' },
          { vi: 'Nó làm CSS không nhận biến màu.', en: 'It breaks CSS variables.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`index.html` phải dùng `no-cache` (hoặc revalidation ngắn + ETag) để luôn trỏ tới các file JS/CSS mới nhất.',
          en: 'Keep `index.html` revalidating (`no-cache` + ETag) so users always get fresh chunk references.',
        },
      },
    ],
    relatedTopicIds: ['isr', 'caching-memoizing', 'restful'],
  },
];
