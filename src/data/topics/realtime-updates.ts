import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const realtimeUpdatesTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['short-polling'],
    mentalModel: {
      vi: 'Giống đứa trẻ ngồi ghế sau cứ 5 giây lại hỏi "Tới nơi chưa bố?" — đơn giản nhất quả đất vì chỉ dùng HTTP GET lặp lại theo timer, nhưng tốn nhiều request rỗng khi không có gì thay đổi.',
      en: 'Repeating "Are we there yet?" every N seconds over plain HTTP GET: trivial to deploy behind any CDN/load balancer, at the cost of empty roundtrips and polling delay.',
    },
    keyPoints: [
      { vi: 'Dùng `setTimeout` đệ quy sau khi request trước hoàn tất (tốt hơn `setInterval` vì tránh chồng chéo request khi mạng chậm).', en: 'Prefer recursive `setTimeout` after each response finishes rather than fixed `setInterval` so slow networks never pile up overlapping requests.' },
      { vi: 'Hoạt động mượt trên mọi hạ tầng HTTP/firewall/serverless mà không giữ kết nối mở lâu.', en: 'Works across every firewall, proxy, and serverless endpoint without stateful connection holding.' },
      { vi: 'Kết hợp thêm Page Visibility API (`document.hidden`) để tạm dừng polling khi tab chạy ngầm, và thêm jitter tránh đồng bộ tải.', en: 'Pause or back off polling when `document.hidden` is true and add slight jitter to avoid synchronized spikes.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Theo dõi trạng thái job xử lý bất đồng bộ kéo dài vài giây đến vài phút (xuất PDF, CI build status, thanh toán QR).', en: 'Monitoring async background job status (PDF export, CI build progress, QR payment confirmation).' },
      ],
      whenToAvoid: [
        { vi: 'Chat thời gian thực hoặc cộng tác nhiều người cần độ trễ dưới 100ms và cập nhật dày đặc.', en: 'Sub-100ms chat or collaborative editing with frequent updates from thousands of clients.' },
      ],
    },
    pitfalls: [
      { vi: 'Dùng `setInterval` 1000ms khi API mất 1500ms sẽ chất đống hàng loạt request lỗi thứ tự và làm nghẽn mạng.', en: 'Using `setInterval` without waiting for the previous fetch floods the network when latency exceeds the interval.' },
    ],
    interviewTips: [
      { vi: 'Luôn đề cập 3 tối ưu cho Short Polling: recursive `setTimeout` (không chồng request), exponential backoff khi dữ liệu không đổi, và pause khi `document.hidden`.', en: 'Always mention 3 upgrades: recursive `setTimeout`, adaptive backoff when idle, and pausing on hidden tabs.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Short Polling an toàn (Recursive Timer + Visibility Guard)', en: 'Safe Recursive Short Polling Simulator' },
      description: { vi: 'Theo dõi job export chuyển dần từ pending sang ready mà không bao giờ bắn request chồng chéo.', en: 'Watch recursive short polling check async job status cleanly without overlapping flights.' },
      mode: 'ts',
      code: `let serverStep = 0;

async function pollExportJob(jobId: string, intervalMs = 150) {
  let active = true;
  let attempts = 0;

  async function tick() {
    if (!active) return;
    attempts += 1;
    serverStep += 1;
    const status = serverStep >= 4 ? 'READY' : 'PROCESSING';
    const res = await mockFetch('/api/jobs/' + jobId, {
      delay: 60,
      response: { jobId, status, progress: Math.min(100, serverStep * 25) },
    });
    const data = await res.json();
    console.log('Poll #' + attempts + ':', data);

    if (data.status === 'READY') {
      active = false;
      console.log('Download ready -> stopped polling.');
      return;
    }
    await sleep(intervalMs);
    await tick();
  }

  await tick();
}

await pollExportJob('export-pdf-88');`,
      tryItPrompt: { vi: 'Thử thêm logic tăng intervalMs lên 1.5x sau mỗi lần vẫn là PROCESSING (adaptive backoff).', en: 'Add adaptive backoff so intervalMs multiplies by 1.5 on consecutive PROCESSING responses.' },
    },
    quiz: [
      {
        id: 'q-spoll-1',
        topicId: 'short-polling',
        categoryId: 'realtime-updates',
        question: { vi: 'Vì sao khi cài đặt Short Polling nên dùng `setTimeout` đệ quy sau khi fetch xong thay vì `setInterval` cố định?', en: 'Why is recursive `setTimeout` after fetch settles safer than `setInterval` for short polling?' },
        options: [
          { vi: 'Tránh tạo nhiều request chồng chéo đồng thời nếu server trả lời chậm hơn chu kỳ poll.', en: 'Prevents overlapping in-flight requests when responses take longer than the polling interval.' },
          { vi: 'Vì setInterval không chạy được trong trình duyệt.', en: 'Browsers do not support setInterval.' },
          { vi: 'setTimeout tự động chuyển sang giao thức UDP.', en: 'setTimeout upgrades requests to UDP.' },
          { vi: 'setTimeout bỏ qua CORS.', en: 'setTimeout bypasses CORS.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Chỉ hẹn giờ lần tiếp theo sau khi request trước kết thúc (trong khối finally) đảm bảo tối đa 1 request in-flight.',
          en: 'Scheduling the next timer inside finally guarantees at most one poll request is in flight at any time.',
        },
      },
      {
        id: 'q-spoll-2',
        topicId: 'short-polling',
        categoryId: 'realtime-updates',
        question: { vi: 'Cách đơn giản nhất để tiết kiệm pin và request server khi người dùng chuyển sang tab khác lúc ứng dụng đang Short Polling là gì?', en: 'How can short polling reduce battery and server load when the user switches browser tabs?' },
        options: [
          { vi: 'Lắng nghe sự kiện visibilitychange / kiểm tra document.hidden để tạm dừng hoặc giảm tần suất poll.', en: 'Listen to visibilitychange and pause or throttle polling while document.hidden is true.' },
          { vi: 'Xóa toàn bộ cookie người dùng.', en: 'Clear all user cookies.' },
          { vi: 'Tăng tần suất poll lên 10ms.', en: 'Poll every 10ms while hidden.' },
          { vi: 'Reload lại cả trang web.', en: 'Reload the entire page.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Page Visibility API giúp tạm dừng polling ở tab nền và poll lại ngay khi người dùng quay lại tab.',
          en: 'Pausing hidden tabs via the Page Visibility API cuts unnecessary traffic dramatically.',
        },
      },
    ],
    relatedTopicIds: ['long-polling', 'sse', 'timeout'],
  },

  {
    ...TOPIC_META_MAP['long-polling'],
    mentalModel: {
      vi: 'Client gọi điện hỏi "Có tin mới chưa?", thay vì cúp máy ngay bảo "Chưa", server giữ máy chờ (tới tối đa ~25–30s); hễ có tin server báo liền rồi hai bên gọi lại cuộc mới ngay.',
      en: 'Client opens an HTTP request and the server holds it open until an event occurs or a timeout hits; once delivered, the client immediately opens the next long-poll request.',
    },
    keyPoints: [
      { vi: 'Giảm đáng kể số request rỗng so với Short Polling và nhận thông báo gần như tức thì khi sự kiện xảy ra.', en: 'Cuts empty polling waste significantly while delivering near-instant notifications when events fire.' },
      { vi: 'Vẫn là HTTP thuần túy nên vượt qua được các firewall hoặc proxy cũ hay chặn WebSocket.', en: 'Travels over plain HTTP requests, surviving restrictive corporate proxies that drop WebSocket upgrades.' },
      { vi: 'Vẫn tốn overhead HTTP headers mỗi khi nối lại và dễ gặp vấn đề sticky session hoặc giữ nhiều request mở trên server.', en: 'Incurs HTTP framing overhead on every reconnect and holds open server worker/socket threads until timeout.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Cơ chế fallback dự phòng khi WebSocket hoặc SSE bị tường lửa mạng doanh nghiệp chặn.', en: 'Reliable fallback transport when corporate proxies block WebSockets or SSE streaming.' },
      ],
      whenToAvoid: [
        { vi: 'Serverless function tính phí theo thời gian giữ request (giữ request treo 30s rất tốn tiền và dễ chạm timeout).', en: 'Duration-billed serverless environments where holding idle requests for 30s wastes compute budget.' },
      ],
    },
    pitfalls: [
      { vi: 'Không đặt request timeout ở cả client lẫn server dễ làm kết nối treo chết (zombie request) không bao giờ nối lại.', en: 'Missing timeout guards on client or proxy leaves connections hanging indefinitely without re-establishing.' },
    ],
    interviewTips: [
      { vi: 'Định vị Long Polling như cầu nối chuyển tiếp giữa Short Polling và SSE/WebSocket — rất phù hợp làm lớp fallback trong Socket.IO.', en: 'Position Long Polling as the stepping stone between Short Polling and SSE/WebSockets, often used as fallback transport.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Long Polling Loop với Event Queue & Timeout', en: 'Long Polling Hold & Reconnect Simulation' },
      description: { vi: 'Quan sát server giữ request chờ sự kiện từ queue, trả ngay khi có tin hoặc trả 204 khi timeout.', en: 'Simulate a server holding a request until an event arrives or timeout triggers a clean reconnect.' },
      mode: 'ts',
      code: `const eventQueue: string[] = [];

// Simulate server emitting events asynchronously
setTimeout(() => eventQueue.push('New message: Hello!'), 90);
setTimeout(() => eventQueue.push('Order #42 shipped'), 260);

async function serverLongPoll(timeoutMs = 150): Promise<{ events: string[]; timedOut: boolean }> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (eventQueue.length > 0) {
      return { events: eventQueue.splice(0), timedOut: false };
    }
    await sleep(25);
  }
  return { events: [], timedOut: true };
}

for (let cycle = 1; cycle <= 3; cycle++) {
  const t0 = Date.now();
  const res = await serverLongPoll(140);
  console.log(\`Cycle #\${cycle} (\${Date.now() - t0}ms):\`, res);
}`,
      tryItPrompt: { vi: 'Thử chỉnh thời điểm sự kiện thứ 2 thành 500ms để quan sát một vòng 204 timeout trước khi nhận tin.', en: 'Delay the second event to 500ms to observe an empty timeout cycle before reconnect.' },
    },
    quiz: [
      {
        id: 'q-lpoll-1',
        topicId: 'long-polling',
        categoryId: 'realtime-updates',
        question: { vi: 'Long Polling khắc phục nhược điểm nào của Short Polling?', en: 'Which limitation of Short Polling does Long Polling improve upon?' },
        options: [
          { vi: 'Giảm hàng loạt request rỗng liên tục khi server chưa có dữ liệu mới và giảm độ trễ nhận sự kiện.', en: 'Eliminates rapid empty HTTP polling cycles during idle periods and delivers events with lower latency.' },
          { vi: 'Hỗ trợ truyền dữ liệu nhị phân hai chiều không cần HTTP.', en: 'Eliminates HTTP framing entirely for binary full-duplex frames.' },
          { vi: 'Chạy được offline không cần mạng.', en: 'Works completely offline.' },
          { vi: 'Loại bỏ hoàn toàn cần kết nối lại.', en: 'Never needs to reopen connections.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Server chỉ trả về khi có sự kiện thật hoặc khi hết timeout nên không spam HTTP request vô nghĩa.',
          en: 'Holding the request until an event occurs avoids wasting cycles on empty responses.',
        },
      },
      {
        id: 'q-lpoll-2',
        topicId: 'long-polling',
        categoryId: 'realtime-updates',
        question: { vi: 'Vì sao Long Polling ít phù hợp khi backend chạy trên Serverless Lambda giới hạn timeout ngắn?', en: 'Why is Long Polling a poor fit for standard duration-billed Serverless Functions?' },
        options: [
          { vi: 'Việc giữ request treo 25–30s chờ sự kiện làm tốn chi phí compute/concurrency dù không làm gì cả.', en: 'Keeping serverless invocations idle-blocked for 25-30s burns billed GB-seconds and concurrency limits.' },
          { vi: 'Lambda không trả về JSON được.', en: 'Lambda cannot return JSON.' },
          { vi: 'Trình duyệt chặn Lambda.', en: 'Browsers block Lambda URLs.' },
          { vi: 'Long polling chỉ dùng được với XML.', en: 'Long polling only supports XML.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Serverless tính tiền theo thời gian giữ request; giữ hàng chục nghìn kết nối chờ sự kiện sẽ tốn kém và chạm ngưỡng concurrency.',
          en: 'Holding idle HTTP connections open on duration-billed serverless compute rapidly exhausts concurrency and cost budgets.',
        },
      },
    ],
    relatedTopicIds: ['short-polling', 'sse', 'websockets'],
  },

  {
    ...TOPIC_META_MAP['sse'],
    mentalModel: {
      vi: 'Một ống dẫn HTTP một chiều mở sẵn từ Server -> Client: server cứ có dòng chữ `data: ...\\n\\n` nào là đẩy thẳng xuống ngay, trình duyệt tự động nối lại bằng `Last-Event-ID` nếu rớt mạng!',
      en: 'A single long-lived HTTP response (`text/event-stream`) where the server pushes framed `data:` events to the browser with built-in auto-reconnect and `Last-Event-ID` resumption.',
    },
    keyPoints: [
      { vi: 'Chuẩn trình duyệt `EventSource` tự động reconnect và gửi lại `Last-Event-ID` để nối tiếp các event bị lỡ.', en: 'Native `EventSource` automatically reconnects with `Last-Event-ID` to resume missed events seamlessly.' },
      { vi: 'Cực kỳ tối ưu cho AI token streaming (ChatGPT/LLM), live feed, bảng giá, thông báo vì đi qua HTTP chuẩn (HTTP/2 multiplexing).', en: 'Ideal for LLM token streaming, live feeds, stock tickers, and notifications over standard HTTP/2.' },
      { vi: 'Chỉ truyền từ Server -> Client (1 chiều) và dữ liệu dạng text UTF-8; giới hạn ~6 kết nối nếu chạy HTTP/1.1 cũ.', en: 'Server-to-client UTF-8 text only; shares the 6-connection browser cap under HTTP/1.1 (resolved by HTTP/2).' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'AI streaming text, live sports score, news ticker, dashboard thông báo nơi client chỉ lắng nghe từ server.', en: 'AI LLM token streaming, live scoreboards, dashboards, and notification feeds where updates flow server-to-client.' },
      ],
      whenToAvoid: [
        { vi: 'Cần client gửi frame liên tục tốc độ cao hoặc truyền binary game/audio (dùng WebSockets hoặc WebRTC).', en: 'High-frequency bidirectional messaging, multiplayer gaming, or binary audio/video transport.' },
      ],
    },
    pitfalls: [
      { vi: 'EventSource gốc không hỗ trợ gửi custom header (`Authorization: Bearer ...`) hay method POST — với API AI dùng POST thường phải dùng `fetch` + `ReadableStream` tự parse SSE.', en: 'Native EventSource only supports GET without custom Auth headers—POST AI streaming relies on `fetch` + `ReadableStream` parsing.' },
      { vi: 'Chạy trên HTTP/1.1 và mở 6+ tab cùng trang có EventSource sẽ làm cạn connection pool 6 kết nối/domain.', en: 'HTTP/1.1 6-connection-per-origin limit can starve tabs unless HTTP/2 multiplexing or SharedWorker is used.' },
    ],
    interviewTips: [
      { vi: 'Chỉ ra mẹo thực chiến cực hay: nhắc cả native `EventSource` (cho GET/cookie auth) lẫn `fetch` + `ReadableStream` parser (cho POST AI prompt streaming)!', en: 'Distinguish native `EventSource` (GET + cookie auth + auto-retry) from `fetch` + `ReadableStream` SSE parsing (used for POST AI streams).' },
    ],
    example: {
      title: { vi: 'Bộ phân tích khung SSE (Server-Sent Events Stream Parser)', en: 'SSE Text/Event-Stream Frame Parser' },
      description: { vi: 'Xem cách parse các gói tin SSE phân mảnh qua từng network chunk thành các event hoàn chỉnh.', en: 'Parse chunked `text/event-stream` wire frames handling partial splits across network packets.' },
      mode: 'ts',
      code: `function createSSEParser(onEvent: (ev: { id?: string; event: string; data: string }) => void) {
  let buffer = '';
  return (chunk: string) => {
    buffer += chunk;
    const blocks = buffer.split('\\n\\n');
    buffer = blocks.pop() ?? '';
    for (const block of blocks) {
      let id: string | undefined;
      let event = 'message';
      const dataLines: string[] = [];
      for (const line of block.split('\\n')) {
        if (line.startsWith('id:')) id = line.slice(3).trim();
        else if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
      }
      if (dataLines.length > 0) {
        onEvent({ id, event, data: dataLines.join('\\n') });
      }
    }
  };
}

const feed = createSSEParser((ev) => console.log('Parsed Event:', ev));
// Simulate network splitting one message across two chunks!
feed('id: 101\\nevent: token\\ndata: Hello ');
feed('world!\\n\\nid: 102\\ndata: {"done":true}\\n\\n');`,
      tryItPrompt: { vi: 'Thử gửi chunk chứa nhiều dòng `data:` trong cùng một block sự kiện.', en: 'Feed a multi-line data event with two consecutive `data:` lines before `\\n\\n`.' },
    },
    challenge: {
      id: 'challenge-parse-sse',
      topicId: 'sse',
      categoryId: 'realtime-updates',
      title: { vi: 'Cài đặt hàm parseSSEStream xử lý chunk phân mảnh', en: 'Implement parseSSEStream Chunk Parser' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm parseSSEChunks(chunks: string[]): Array<{ id?: string; event: string; data: string }>. Mỗi event ngăn cách bởi "\\n\\n" (hoặc "\\r\\n\\r\\n" chuẩn hóa thành "\\n"). Các chunk có thể cắt ngang giữa dòng hoặc giữa block! Bỏ qua dòng comment bắt đầu bằng ":". Mặc định event = "message".',
        en: 'Implement parseSSEChunks(chunks: string[]) returning parsed events { id?: string; event: string; data: string }[]. Frames terminate at "\\n\\n" (normalize "\\r\\n" first). Chunks can split mid-line or mid-frame. Ignore ":" comment lines; default event is "message".',
      },
      starterCode: `export interface SSEEvent {
  id?: string;
  event: string;
  data: string;
}

export function parseSSEChunks(chunks: string[]): SSEEvent[] {
  // TODO: accumulate buffer across chunks, split on \\n\\n, parse id/event/data fields
  return [];
}`,
      solutionCode: `export interface SSEEvent {
  id?: string;
  event: string;
  data: string;
}

export function parseSSEChunks(chunks: string[]): SSEEvent[] {
  const events: SSEEvent[] = [];
  let buffer = '';

  for (const rawChunk of chunks) {
    buffer += rawChunk.replace(/\\r\\n/g, '\\n');
    const frames = buffer.split('\\n\\n');
    buffer = frames.pop() ?? '';

    for (const frame of frames) {
      let id: string | undefined;
      let event = 'message';
      const dataParts: string[] = [];

      for (const line of frame.split('\\n')) {
        if (!line || line.startsWith(':')) continue;
        if (line.startsWith('id:')) id = line.slice(3).trim();
        else if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) dataParts.push(line.slice(5).replace(/^ /, ''));
      }

      if (dataParts.length > 0) {
        const parsed: SSEEvent = { event, data: dataParts.join('\\n') };
        if (id !== undefined) parsed.id = id;
        events.push(parsed);
      }
    }
  }
  return events;
}`,
      testCode: `test('handles split chunks, multi-line data, and comments', () => {
  const out = parseSSEChunks([
    ': keep-alive\\n\\nid: 1\\nev',
    'ent: delta\\ndata: first\\ndata: second\\n\\n',
    'data: final\\n\\n',
  ]);
  expect(out).toEqual([
    { id: '1', event: 'delta', data: 'first\\nsecond' },
    { event: 'message', data: 'final' },
  ]);
});`,
      hints: [
        { vi: 'Chuẩn hóa \\r\\n thành \\n rồi cộng dồn vào biến buffer giữa các chunk.', en: 'Normalize CRLF to LF and concatenate chunks into a persistent buffer.' },
        { vi: 'Dùng `const frames = buffer.split("\\n\\n"); buffer = frames.pop() ?? "";` để giữ lại phần chưa hoàn chỉnh cho chunk kế tiếp.', en: 'Use `frames = buffer.split("\\n\\n")` and keep `frames.pop()` in buffer for incomplete trailing frames.' },
      ],
    },
    quiz: [
      {
        id: 'q-sse-1',
        topicId: 'sse',
        categoryId: 'realtime-updates',
        question: { vi: 'Header nào trình duyệt tự gửi lên khi `EventSource` tự động nối lại sau rớt mạng?', en: 'Which header does native `EventSource` automatically include when reconnecting after a drop?' },
        options: [
          { vi: 'Last-Event-ID', en: 'Last-Event-ID' },
          { vi: 'Sec-WebSocket-Key', en: 'Sec-WebSocket-Key' },
          { vi: 'If-Range', en: 'If-Range' },
          { vi: 'X-Retry-After', en: 'X-Retry-After' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'EventSource nhớ id của event cuối cùng nhận được và gửi kèm Last-Event-ID để server phát tiếp những tin bị lỡ.',
          en: 'EventSource tracks the last received event `id:` and sends `Last-Event-ID` on automatic reconnect.',
        },
      },
      {
        id: 'q-sse-2',
        topicId: 'sse',
        categoryId: 'realtime-updates',
        question: { vi: 'Hạn chế chính của native browser `EventSource` API khi gọi API LLM streaming cần token Bearer qua POST là gì?', en: 'What limitation of native `EventSource` forces AI streaming UIs to parse `fetch` + `ReadableStream` manually?' },
        options: [
          { vi: 'EventSource chỉ hỗ trợ HTTP GET và không cho truyền custom Authorization headers hoặc request body.', en: 'Native EventSource only supports GET requests without custom headers or request bodies.' },
          { vi: 'EventSource không hỗ trợ UTF-8.', en: 'EventSource lacks UTF-8 support.' },
          { vi: 'EventSource chỉ hoạt động ở chế độ offline.', en: 'EventSource works only offline.' },
          { vi: 'EventSource chặn render React.', en: 'EventSource blocks React rendering.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Vì các API chat AI thường cần POST JSON prompt và header Authorization, UI dùng fetch ReadableStream + SSE parser.',
          en: 'Chat completions require POST bodies and Bearer headers, so apps decode `fetch().body` streams directly.',
        },
      },
    ],
    relatedTopicIds: ['websockets', 'long-polling', 'media-streaming'],
  },

  {
    ...TOPIC_META_MAP['websockets'],
    mentalModel: {
      vi: 'Nâng cấp từ đường HTTP một chiều lên tuyến cao tốc hai chiều TCP mở xuyên suốt: cả Client lẫn Server đều có thể chủ động bắn frame text hoặc binary bất cứ lúc nào với overhead chỉ vài byte.',
      en: 'Upgrade an HTTP handshake into a persistent full-duplex connection where client and server push lightweight text or binary frames simultaneously with tiny per-frame overhead.',
    },
    keyPoints: [
      { vi: 'Giao tiếp hai chiều thực sự (full-duplex) độ trễ thấp, phù hợp gửi/nhận liên tục (chat, gõ chung tài liệu, game, whiteboards).', en: 'True full-duplex low-latency messaging suited for live chat, collaborative cursors, and trading tickers.' },
      { vi: 'Bắt buộc phải thiết kế Heartbeat (ping/pong) để phát hiện kết nối "chết ngầm" (half-open TCP) khi người dùng rớt Wi-Fi.', en: 'Requires explicit heartbeat pings/pongs to detect half-open silent disconnects across mobile networks.' },
      { vi: 'Reconnection phải dùng Exponential Backoff + Jitter tránh hàng triệu client nối lại cùng một giây làm sập gateway khi server restart.', en: 'Reconnect loops MUST use exponential backoff + jitter so server restarts do not trigger thundering herds.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Chat nhiều người, trạng thái gõ (typing indicator), multiplayer cursor, bảng lệnh chứng khoán/crypto cập nhật mỗi 50ms.', en: 'Chat apps, presence/typing indicators, collaborative cursors, and high-frequency bidirectional streams.' },
      ],
      whenToAvoid: [
        { vi: 'Chỉ cần nhận thông báo một chiều hoặc stream chữ AI — SSE đơn giản hơn, scale HTTP dễ hơn và không cần sticky/stateful WS gateway.', en: 'Pure one-way server-to-client feeds or AI token streams where SSE is simpler and CDN/HTTP-friendly.' },
      ],
    },
    pitfalls: [
      { vi: 'Quên hàng đợi tin nhắn (outbound queue) lúc đang mất mạng/reconnecting làm tin nhắn người dùng vừa bấm gửi biến mất.', en: 'Dropping outbound messages sent while reconnecting instead of buffering them in a pending queue.' },
      { vi: 'Không đóng WebSocket và clear heartbeat timer trong cleanup khi component unmount.', en: 'Forgetting to close sockets and clear heartbeat timers on unmount leaks background connections.' },
    ],
    interviewTips: [
      { vi: 'Khi phỏng vấn Real-time Chat: nêu đủ 4 mảnh ghép WebSocket Client: Heartbeat, Exponential Backoff + Jitter, Outbound Pending Queue + Client Sequence ID, và Deduplication khi nhận lại!', en: 'Cover all 4 production WebSocket pillars: heartbeat detection, jittered backoff reconnect, outbound pending queue, and message deduplication.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Resilient WebSocket Client (Reconnect + Pending Queue)', en: 'Resilient WebSocket Client Simulator' },
      description: { vi: 'Thử ngắt kết nối, gửi tin nhắn lúc offline để xem hàng đợi pending tự flush ngay khi reconnected!', en: 'Drop the connection, enqueue messages offline, and watch them flush automatically upon reconnect.' },
      mode: 'react',
      code: `import React, { useEffect, useState } from 'react';

export default function App() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [queue, setQueue] = useState<string[]>([]);
  const [sent, setSent] = useState<string[]>(['[System] Channel joined']);
  const [counter, setCounter] = useState(1);

  const sendMessage = () => {
    const msg = 'Msg #' + counter + ' @ ' + new Date().toLocaleTimeString();
    setCounter((c) => c + 1);
    if (status === 'connected') {
      setSent((prev) => [...prev, msg]);
    } else {
      setQueue((prev) => [...prev, msg]);
    }
  };

  useEffect(() => {
    if (status !== 'reconnecting') return;
    const t = setTimeout(() => {
      setStatus('connected');
      setSent((prev) => [...prev, ...queue.map((m) => m + ' (flushed)')]);
      setQueue([]);
    }, 900);
    return () => clearTimeout(t);
  }, [status, queue]);

  return (
    <div className="col">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span>Socket: <strong className="badge">{status.toUpperCase()}</strong></span>
        <div className="row">
          <button onClick={() => setStatus((s) => (s === 'connected' ? 'disconnected' : 'connected'))}>
            {status === 'connected' ? 'Simulate Drop' : 'Manual Connect'}
          </button>
          {status === 'disconnected' && (
            <button onClick={() => setStatus('reconnecting')}>Auto Reconnect</button>
          )}
          <button className="primary" onClick={sendMessage}>Send Message</button>
        </div>
      </div>
      <div className="card">
        <div><strong>Queued offline ({queue.length}):</strong> {queue.join(', ') || 'none'}</div>
        <hr style={{ borderColor: 'var(--border)', margin: '8px 0' }} />
        <div><strong>Delivered stream:</strong></div>
        <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
          {sent.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử bấm "Simulate Drop", bấm "Send Message" 2 lần, rồi bấm "Auto Reconnect" để xem tin nhắn tự đồng bộ.', en: 'Click Simulate Drop, send 2 messages into the offline buffer, then trigger Auto Reconnect.' },
    },
    challenge: {
      id: 'challenge-reconnect-socket',
      topicId: 'websockets',
      categoryId: 'realtime-updates',
      title: { vi: 'Cài đặt createReconnectManager (Queue + Exponential Backoff)', en: 'Implement createReconnectManager' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm createReconnectManager(options: { baseDelayMs: number; maxDelayMs: number; maxRetries: number }) quản lý hàng đợi tin nhắn gửi khi offline và tính thời gian chờ thử lại tiếp theo: nextDelay() trả về Math.min(maxDelayMs, baseDelayMs * 2 ** attempt) hoặc null nếu attempt >= maxRetries; enqueue(msg) đẩy vào queue khi disconnected; flush(sender) gửi hết hàng đợi theo thứ tự FIFO và làm rỗng queue.',
        en: 'Implement createReconnectManager({ baseDelayMs, maxDelayMs, maxRetries }) with nextDelay() (returns Math.min(maxDelayMs, baseDelayMs * 2 ** attempt), or null once retries reach maxRetries), resetRetries(), enqueue(msg), and flush(sender) draining messages FIFO.',
      },
      starterCode: `export function createReconnectManager(options: {
  baseDelayMs: number;
  maxDelayMs: number;
  maxRetries: number;
}) {
  // TODO: track retry attempt count and pending outbound queue
  return {
    nextDelay(): number | null {
      return null;
    },
    resetRetries(): void {},
    enqueue(_msg: string): number {
      return 0;
    },
    flush(_sender: (msg: string) => void): string[] {
      return [];
    },
  };
}`,
      solutionCode: `export function createReconnectManager(options: {
  baseDelayMs: number;
  maxDelayMs: number;
  maxRetries: number;
}) {
  let attempt = 0;
  const queue: string[] = [];

  return {
    nextDelay(): number | null {
      if (attempt >= options.maxRetries) return null;
      const delay = Math.min(options.maxDelayMs, options.baseDelayMs * Math.pow(2, attempt));
      attempt += 1;
      return delay;
    },
    resetRetries(): void {
      attempt = 0;
    },
    enqueue(msg: string): number {
      queue.push(msg);
      return queue.length;
    },
    flush(sender: (msg: string) => void): string[] {
      const sent = queue.splice(0, queue.length);
      for (const msg of sent) {
        sender(msg);
      }
      return sent;
    },
  };
}`,
      testCode: `test('computes capped exponential delays and stops at maxRetries', () => {
  const mgr = createReconnectManager({ baseDelayMs: 100, maxDelayMs: 350, maxRetries: 4 });
  expect(mgr.nextDelay()).toBe(100);
  expect(mgr.nextDelay()).toBe(200);
  expect(mgr.nextDelay()).toBe(350);
  expect(mgr.nextDelay()).toBe(350);
  expect(mgr.nextDelay()).toBeNull();

  mgr.resetRetries();
  expect(mgr.nextDelay()).toBe(100);
});

test('queues outbound messages and flushes FIFO', () => {
  const mgr = createReconnectManager({ baseDelayMs: 50, maxDelayMs: 500, maxRetries: 3 });
  expect(mgr.enqueue('hello')).toBe(1);
  expect(mgr.enqueue('world')).toBe(2);
  const delivered: string[] = [];
  mgr.flush((m) => delivered.push(m));
  expect(delivered).toEqual(['hello', 'world']);
  const secondFlush: string[] = [];
  mgr.flush((m) => secondFlush.push(m));
  expect(secondFlush).toEqual([]);
});`,
      hints: [
        { vi: 'Kiểm tra `if (attempt >= options.maxRetries) return null;` trước khi tăng biến attempt.', en: 'Guard `attempt >= options.maxRetries` before computing delay and incrementing attempt.' },
        { vi: 'Dùng `queue.splice(0, queue.length)` trong `flush` để lấy toàn bộ phần tử theo FIFO và làm rỗng queue một lượt.', en: 'Drain FIFO items atomically with `queue.splice(0, queue.length)`.' },
      ],
    },
    quiz: [
      {
        id: 'q-ws-1',
        topicId: 'websockets',
        categoryId: 'realtime-updates',
        question: { vi: 'Vì sao ứng dụng WebSocket cần cơ chế Heartbeat (ping/pong định kỳ)?', en: 'Why do production WebSocket clients implement periodic ping/pong heartbeats?' },
        options: [
          { vi: 'Phát hiện kết nối đã đứt ngầm (half-open TCP) khi client mất mạng đột ngột hoặc proxy cắt idle socket.', en: 'To detect silent half-open TCP drops or proxy idle timeouts and trigger reconnection.' },
          { vi: 'Để nén JSON thành PNG.', en: 'To compress JSON into PNG.' },
          { vi: 'Để bypass HTTPS.', en: 'To bypass HTTPS.' },
          { vi: 'Để trình duyệt lưu cache vào CSS.', en: 'To store data inside CSS.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'TCP không tự báo ngay khi cáp mạng rút hoặc Wi-Fi đổi IP; thiếu pong sau timeout giúp client biết để reconnect.',
          en: 'Silent network switches leave TCP sockets hanging; missed pongs trigger timely reconnects.',
        },
      },
      {
        id: 'q-ws-2',
        topicId: 'websockets',
        categoryId: 'realtime-updates',
        question: { vi: 'Tại sao cần thêm random Jitter khi hàng loạt client WebSocket reconnect sau lúc server vừa khởi động lại?', en: 'Why add randomized Jitter when thousands of WebSocket clients reconnect after a server restart?' },
        options: [
          { vi: 'Trải đều thời điểm nối lại để tránh hiệu ứng Thundering Herd đánh sập gateway ngay lập tức.', en: 'Spreads reconnect attempts over time to prevent a Thundering Herd spike from crashing the gateway.' },
          { vi: 'Để đổi cổng TCP ngẫu nhiên.', en: 'To randomize TCP ports.' },
          { vi: 'Để tắt TLS handshake.', en: 'To skip TLS handshakes.' },
          { vi: 'Để làm tin nhắn đi nhanh hơn tốc độ ánh sáng.', en: 'To exceed speed-of-light latency.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Nếu 100.000 client cùng nhân đôi delay giống hệt nhau (1s, 2s, 4s...), chúng sẽ đồng loạt gõ cửa server tại cùng 1 giây.',
          en: 'Without jitter, synchronized exponential backoff retries hit the restarted server in simultaneous waves.',
        },
      },
    ],
    relatedTopicIds: ['sse', 'retries-backoff-jitter', 'net-offline-usage'],
  },
];
