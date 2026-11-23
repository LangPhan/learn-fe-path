import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const architectureTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['ssr'],
    mentalModel: {
      vi: 'Thay vì giao cho trình duyệt một tờ giấy trắng rồi chờ tải JS về tự vẽ, server tự nấu xong bát phở nóng hổi (HTML hoàn chỉnh) giao ra ngay, sau đó trình duyệt mới gắn thêm đũa thìa tương tác (hydration).',
      en: 'Instead of shipping an empty HTML shell and waiting for JS to build the page, the server renders complete HTML per request and the browser hydrates event listeners on top.',
    },
    keyPoints: [
      { vi: 'Server thực thi component + fetch data rồi xuất chuỗi HTML đầy đủ (hoặc stream qua HTTP chunked transfer).', en: 'Server executes components and data fetches, returning populated HTML (optionally streamed in chunks).' },
      { vi: 'Trình duyệt hiển thị nội dung đầu tiên (FCP/LCP) nhanh hơn hẳn trên mạng yếu hoặc máy cấu hình thấp.', en: 'Delivers faster First Contentful Paint (FCP) and LCP on slow networks and low-end CPUs.' },
      { vi: 'Hydration gắn event handler lên DOM có sẵn — nếu HTML server và client render lệch nhau sẽ gây hydration mismatch.', en: 'Hydration attaches event listeners to existing DOM; server/client markup mismatches trigger hydration errors.' },
      { vi: 'TTFB (Time to First Byte) có thể cao hơn file tĩnh vì server phải chờ query DB/API trước khi gửi byte đầu tiên.', en: 'TTFB rises compared to static CDN files unless streaming SSR flushes the shell early.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Trang nội dung cần SEO tốt và dữ liệu thay đổi liên tục theo từng request (tin tức, kết quả tìm kiếm, trang chi tiết sản phẩm có tồn kho realtime).', en: 'SEO-critical pages with dynamic per-request or personalized data (news, search results, live inventory).' },
        { vi: 'Cần giảm thời gian chờ màn hình trắng trên thiết bị di động yếu.', en: 'Need fast meaningful paint for users on mobile devices or slower connections.' },
      ],
      whenToAvoid: [
        { vi: 'Dashboard nội bộ sau màn hình đăng nhập không cần SEO — CSR + caching đơn giản và rẻ hơn.', en: 'Authenticated internal dashboards where SEO is irrelevant and client caching dominates.' },
        { vi: 'Tài nguyên compute hạn hẹp khi traffic đột biến lớn mà dữ liệu ít thay đổi (nên ưu tiên SSG/ISR).', en: 'High-traffic read-heavy pages with infrequent updates where CDN-cached SSG/ISR wins.' },
      ],
    },
    pitfalls: [
      { vi: 'Truy cập window, document hoặc localStorage trực tiếp lúc render sẽ làm crash server Node.js.', en: 'Reading window, document, or localStorage during initial render crashes the Node.js server pass.' },
      { vi: 'Gọi API nối tiếp không song song trên server làm TTFB tăng vọt, kéo tụt LCP.', en: 'Sequential backend API waterfalls block TTFB and delay everything downstream.' },
      { vi: 'Quên serialize trạng thái server sang client dẫn tới double-fetching khi vừa hydrate xong.', en: 'Failing to dehydrate initial server query state causes redundant client refetches on mount.' },
    ],
    interviewTips: [
      { vi: 'Phân biệt rõ FCP vs TTI: SSR rút ngắn FCP nhưng trình duyệt vẫn có thể bị "uncanny valley" (thấy nút nhưng bấm chưa ăn) nếu JS bundle hydrate quá nặng.', en: 'Contrast FCP vs TTI: SSR improves FCP, yet heavy hydration creates an uncanny valley where UI looks ready before clicks respond.' },
      { vi: 'Đề xuất Streaming SSR + Selective Hydration (React Suspense) để đẩy shell và phần quan trọng xuống trước.', en: 'Propose Streaming SSR + Selective Hydration (Suspense boundaries) so slow data never blocks the header/above-the-fold shell.' },
    ],
    example: {
      title: { vi: 'Mô phỏng SSR Render + Hydration State Dehydration', en: 'Simulated SSR HTML + Hydration Payload' },
      description: { vi: 'Xem cách server kết xuất HTML kèm __INITIAL_DATA__ nhúng sẵn và escaped an toàn.', en: 'Inspect how an SSR engine renders HTML and safely serializes __INITIAL_DATA__ for client hydration.' },
      mode: 'ts',
      code: `interface Product { id: string; name: string; price: number }

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderProductPageSSR(product: Product): string {
  // Escape '</script' inside JSON to prevent script-tag breakout XSS
  const safeJson = JSON.stringify(product).replace(/</g, '\\\\u003c');
  return [
    '<!doctype html>',
    '<html><body>',
    '  <main id="app">',
    \`    <h1>\${escapeHtml(product.name)}</h1>\`,
    \`    <p>Price: $\${product.price.toFixed(2)}</p>\`,
    '  </main>',
    \`  <script>window.__INITIAL_DATA__ = \${safeJson};</script>\`,
    '</body></html>',
  ].join('\\n');
}

const html = renderProductPageSSR({
  id: 'sku-42',
  name: 'Mechanical Keyboard <Pro>',
  price: 149.5,
});

console.log(html);`,
      tryItPrompt: { vi: 'Thử thêm ký tự </script><script>alert(1)</script> vào product.name để kiểm tra cơ chế escape.', en: 'Try injecting </script><script>alert(1)</script> into product.name to verify XSS-safe serialization.' },
    },
    challenge: {
      id: 'challenge-ssr-template',
      topicId: 'ssr',
      categoryId: 'architecture',
      title: { vi: 'Viết hàm renderTemplateSSR an toàn XSS', en: 'Build XSS-Safe renderTemplateSSR' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm renderTemplateSSR(title: string, state: Record<string, unknown>): string trả về HTML gồm thẻ <h1> chứa title đã escape HTML (&, <, >, ", \') và thẻ <script id="__STATE__" type="application/json"> chứa JSON của state đã thay thế "<" bằng "\\u003c".',
        en: 'Implement renderTemplateSSR(title: string, state: Record<string, unknown>): string returning HTML with an escaped <h1> (escaping &, <, >, ", \') and <script id="__STATE__" type="application/json"> containing serialized state with "<" replaced by "\\u003c".',
      },
      starterCode: `export function renderTemplateSSR(
  title: string,
  state: Record<string, unknown>
): string {
  // TODO: escape HTML entities in title and serialize state safely against </script> injection
  return '';
}`,
      solutionCode: `export function renderTemplateSSR(
  title: string,
  state: Record<string, unknown>
): string {
  const escapedTitle = title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const safeState = JSON.stringify(state).replace(/</g, '\\\\u003c');
  return \`<h1>\${escapedTitle}</h1><script id="__STATE__" type="application/json">\${safeState}</script>\`;
}`,
      testCode: `test('escapes HTML characters in heading', () => {
  const out = renderTemplateSSR('A & B <script> "quote" \\'hi\\'', { ok: true });
  expect(out).toContain('<h1>A &amp; B &lt;script&gt; &quot;quote&quot; &#39;hi&#39;</h1>');
});

test('neutralizes </script> breakout inside dehydrated JSON state', () => {
  const out = renderTemplateSSR('Home', { bio: '</script><img onerror=alert(1)>' });
  expect(out).not.toContain('</script><img');
  expect(out).toContain('\\\\u003c/script>');
  expect(out).toContain('<script id="__STATE__" type="application/json">');
});`,
      hints: [
        { vi: 'Escape ký tự & trước các ký tự khác để không escape nhầm chuỗi &lt;.', en: 'Escape & first so subsequent entity replacements like &lt; are not double-escaped.' },
        { vi: 'Sau khi JSON.stringify(state), thay thế toàn bộ "<" thành "\\u003c".', en: 'After JSON.stringify(state), replace all "<" with "\\u003c".' },
      ],
    },
    quiz: [
      {
        id: 'q-ssr-1',
        topicId: 'ssr',
        categoryId: 'architecture',
        question: { vi: 'Hiện tượng "uncanny valley" trong SSR xảy ra khi nào?', en: 'When does the SSR "uncanny valley" occur?' },
        options: [
          { vi: 'HTML đã hiển thị trên màn hình nhưng JS bundle chưa tải/hydrate xong nên người dùng bấm nút chưa có tác dụng.', en: 'HTML is visible on screen, but JS has not finished hydrating yet so interactions appear frozen.' },
          { vi: 'Server không có cache DNS.', en: 'The server lacks DNS caching.' },
          { vi: 'CSS bị chặn bởi thẻ <meta>.', en: 'CSS is blocked by a <meta> tag.' },
          { vi: 'Trình duyệt tắt hoàn toàn Cookies.', en: 'The browser disables cookies completely.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'SSR giúp FCP nhanh, nhưng nếu JS bundle quá lớn khiến Main Thread bận hydrate, người dùng thấy giao diện nhưng chưa tương tác được.',
          en: 'SSR speeds up first paint, yet a large JS bundle keeping the main thread busy hydrating leaves visible controls unresponsive.',
        },
      },
      {
        id: 'q-ssr-2',
        topicId: 'ssr',
        categoryId: 'architecture',
        question: { vi: 'Cách an toàn nhất để nhúng JSON state vào HTML khi SSR là gì?', en: 'What is the safest way to embed serialized JSON state into SSR HTML?' },
        options: [
          { vi: 'Dùng JSON.stringify trực tiếp không xử lý gì thêm.', en: 'Raw JSON.stringify without escaping.' },
          { vi: 'Escape ký tự "<" thành "\\u003c" để chặn chuỗi "</script>" đóng thẻ script sớm.', en: 'Escape "<" as "\\u003c" so "</script>" inside data cannot break out of the script tag.' },
          { vi: 'Lưu toàn bộ state vào URL query string.', en: 'Put all state into the URL query string.' },
          { vi: 'Mã hóa Base64 và chạy eval() ở client.', en: 'Base64-encode and call eval() on the client.' },
        ],
        correctIndex: 1,
        explanation: {
          vi: 'Trình phân tích HTML đóng thẻ <script> ngay khi gặp "</script>", nên bắt buộc escape "<" thành "\\u003c".',
          en: 'The HTML parser terminates a <script> block as soon as it sees "</script>", making "<" -> "\\u003c" escaping essential.',
        },
      },
    ],
    relatedTopicIds: ['csr', 'isr', 'server-components', 'ssr-ssg-seo'],
  },

  {
    ...TOPIC_META_MAP['csr'],
    mentalModel: {
      vi: 'Server chỉ giao bộ khung HTML trống (<div id="root"></div>) kèm file JS; trình duyệt tự tải JS, gọi API và dựng toàn bộ giao diện ngay tại máy người dùng.',
      en: 'The server ships a tiny empty HTML shell plus a JS bundle; the browser downloads, parses, fetches JSON APIs, and mounts every DOM node client-side.',
    },
    keyPoints: [
      { vi: 'Chuyển trang trong SPA cực mượt (soft navigation) vì chỉ cần đổi state & fetch JSON thay vì tải lại cả HTML document.', en: 'Instant client-side route transitions since only JSON deltas are fetched instead of full HTML reloads.' },
      { vi: 'Đẩy chi phí render từ server sang CPU của người dùng — server tĩnh có thể host rẻ trên CDN/S3.', en: 'Offloads rendering compute to the client CPU, allowing cheap static CDN hosting.' },
      { vi: 'Tạo request waterfall điển hình: HTML -> JS bundle -> render spinner -> fetch API -> render thật.', en: 'Classic waterfall latency: HTML -> JS download/parse -> spinner -> API fetch -> content.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Ứng dụng tương tác dày đặc sau đăng nhập (Figma, Notion, IDE web, admin dashboard) không cần Google index bên trong.', en: 'Rich interactive web apps behind login (Figma, Notion, web IDEs, dashboards) where SEO is unnecessary.' },
        { vi: 'Đội ngũ nhỏ muốn deploy tĩnh đơn giản mà không vận hành Node server.', en: 'Teams preferring simple static CDN hosting without server runtime maintenance.' },
      ],
      whenToAvoid: [
        { vi: 'Landing page, blog, thương mại điện tử cần SEO và thời gian hiển thị đầu tiên < 1.5s trên mạng 3G.', en: 'Public marketing, blogs, and e-commerce sites requiring strong SEO and fast initial load on 3G.' },
      ],
    },
    pitfalls: [
      { vi: 'Không chia nhỏ bundle (code splitting) làm user phải tải 2MB JS trước khi thấy bất kỳ pixel nào.', en: 'Shipping a single multi-megabyte bundle delays first paint on mobile CPUs.' },
      { vi: 'Fetch data bên trong useEffect lồng nhau tạo waterfall nhiều tầng giữa component cha và con.', en: 'Nested component-level fetches in useEffect create cascading network waterfalls.' },
    ],
    interviewTips: [
      { vi: 'Chỉ ra cách khắc phục nhược điểm CSR: route-based code splitting + prefetching data song song ở router loader thay vì chờ component mount.', en: 'Explain how to fix CSR waterfalls: route-level code splitting plus router loaders fetching data in parallel with chunk loads.' },
    ],
    example: {
      title: { vi: 'Mô phỏng CSR Boot Lifecycle & Waterfall', en: 'Interactive CSR Boot Waterfall Demo' },
      description: { vi: 'Quan sát các pha CSR từ tải JS, mount skeleton cho đến lúc render xong dữ liệu.', en: 'Step through CSR phases from JS boot and loading shell to hydrated data view.' },
      mode: 'react',
      code: `import React, { useEffect, useState } from 'react';

export default function App() {
  const [phase, setPhase] = useState<'booting' | 'fetching' | 'ready'>('booting');
  const [items, setItems] = useState<string[]>([]);

  const replayCSR = () => {
    setPhase('booting');
    setItems([]);
  };

  useEffect(() => {
    if (phase === 'booting') {
      const t = setTimeout(() => setPhase('fetching'), 450);
      return () => clearTimeout(t);
    }
    if (phase === 'fetching') {
      const t = setTimeout(() => {
        setItems(['Dashboard KPIs', 'Realtime Chart Widget', 'Recent Activity Log']);
        setPhase('ready');
      }, 600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div className="col">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>CSR Phase: <span className="badge">{phase.toUpperCase()}</span></strong>
        <button className="primary" onClick={replayCSR}>Replay CSR Boot</button>
      </div>
      <div className="card">
        {phase === 'booting' && <p className="muted">1. Parsing JS bundle & mounting empty #root shell...</p>}
        {phase === 'fetching' && <p className="muted">2. Mounted spinner — fetching /api/dashboard JSON...</p>}
        {phase === 'ready' && (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử giảm delay xuống 100ms hoặc thêm bước error state nếu API thất bại.', en: 'Try adjusting phase delays or adding a simulated API failure state.' },
    },
    quiz: [
      {
        id: 'q-csr-1',
        topicId: 'csr',
        categoryId: 'architecture',
        question: { vi: 'Nguyên nhân chính khiến FCP của ứng dụng CSR lớn thường chậm hơn SSR/SSG là gì?', en: 'Why is First Contentful Paint typically slower in large CSR apps than SSR/SSG?' },
        options: [
          { vi: 'HTML ban đầu gần như rỗng; trình duyệt phải tải, parse và chạy JS xong mới dựng DOM hiển thị.', en: 'The initial HTML is empty; the browser must download, parse, and execute JS before rendering content.' },
          { vi: 'CSR không sử dụng được HTTP cache.', en: 'CSR cannot use HTTP caching.' },
          { vi: 'Trình duyệt chặn CSS khi chạy React.', en: 'Browsers block CSS when React runs.' },
          { vi: 'CSR bắt buộc mở WebSocket.', en: 'CSR requires WebSockets.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Với CSR thuần, trình duyệt không có nội dung HTML sẵn để vẽ ngay mà phải chờ chuỗi HTML -> JS -> render hoàn tất.',
          en: 'Pure CSR ships an empty root container, forcing the critical rendering path to wait on JS download and execution.',
        },
      },
      {
        id: 'q-csr-2',
        topicId: 'csr',
        categoryId: 'architecture',
        question: { vi: 'Kỹ thuật nào hiệu quả nhất để giảm waterfall trong CSR SPA?', en: 'Which technique best mitigates data waterfalls in a CSR SPA?' },
        options: [
          { vi: 'Gọi fetch trong useEffect của từng component con lồng nhau.', en: 'Fetching inside deeply nested child useEffects.' },
          { vi: 'Render-as-you-fetch: kích hoạt load chunk JS và API data song song ở cấp Router trước khi component mount.', en: 'Render-as-you-fetch: prefetch route data and code chunks in parallel at the router layer before mount.' },
          { vi: 'Tăng kích thước main bundle để khỏi tách file.', en: 'Disable code splitting to keep one huge bundle.' },
          { vi: 'Chuyển hết API sang short polling 100ms.', en: 'Switch APIs to 100ms short polling.' },
        ],
        correctIndex: 1,
        explanation: {
          vi: 'Tải song song code chunk và dữ liệu ở route loader giúp loại bỏ chờ nối tiếp từng component con.',
          en: 'Triggering route data loaders concurrently with code chunk downloads eliminates sequential mount-then-fetch delays.',
        },
      },
    ],
    relatedTopicIds: ['ssr', 'code-splitting', 'loading-sequences'],
  },

  {
    ...TOPIC_META_MAP['isr'],
    mentalModel: {
      vi: 'Giống quầy bánh mì đóng gói sẵn trên kệ CDN (tốc độ tức thì): trong khoảng thời gian tươi ngon (TTL), khách lấy ngay bánh cũ; vừa hết hạn, người khách đầu tiên vẫn nhận bánh đang có ngay lập tức còn lò nướng phía sau âm thầm nướng mẻ mới thay thế.',
      en: 'Serve pre-built CDN pages instantaneously; once the revalidate TTL expires, the next visitor still gets the cached stale page with zero wait while the server regenerates fresh HTML in the background.',
    },
    keyPoints: [
      { vi: 'Kết hợp tốc độ đọc từ CDN edge của SSG với khả năng cập nhật dữ liệu mới mà không phải rebuild toàn bộ site.', en: 'Combines SSG edge latency with fresh content updates without full-site rebuilds.' },
      { vi: 'Dựa trên nguyên lý Stale-While-Revalidate (SWR): người dùng không bao giờ bị chặn chờ tái tạo HTML.', en: 'Follows Stale-While-Revalidate: visitors never block waiting for background regeneration.' },
      { vi: 'Hỗ trợ On-Demand Revalidation qua webhook khi CMS/kho hàng vừa chỉnh sửa dữ liệu.', en: 'Supports On-Demand Revalidation webhooks triggered directly when CMS or inventory records change.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Website có hàng chục nghìn đến hàng triệu trang (trang sản phẩm e-commerce, tin tức, trang tài liệu) không thể build lại toàn bộ mỗi lần sửa 1 bài.', en: 'Large catalogs (thousands of product, news, or doc pages) too big for full static rebuilds on every edit.' },
        { vi: 'Chấp nhận độ trễ cập nhật dữ liệu vài chục giây đến vài phút (eventual consistency).', en: 'Brief eventual consistency (seconds to minutes) is acceptable between background updates.' },
      ],
      whenToAvoid: [
        { vi: 'Trang cá nhân hóa riêng theo từng user đang đăng nhập (giỏ hàng, profile riêng tư).', en: 'User-specific private pages that cannot be shared across CDN cache keys.' },
        { vi: 'Giá chứng khoán hoặc tồn kho bắt buộc chính xác từng mili-giây.', en: 'Strict real-time financial or seat-booking inventory requiring zero stale reads.' },
      ],
    },
    pitfalls: [
      { vi: 'Quên dùng lock/deduplication khi hết hạn TTL khiến 100 request đồng thời kích hoạt rebuild cùng một trang (cache stampede).', en: 'Missing in-flight deduplication lets concurrent requests after TTL expiry trigger duplicate rebuilds (stampede).' },
      { vi: 'Cache nhầm cookie/session cá nhân vào trang ISR dùng chung làm lộ thông tin user này cho user khác.', en: 'Accidentally reading session cookies inside an ISR page leaks personalized HTML to other visitors.' },
    ],
    interviewTips: [
      { vi: 'Giải thích rõ hai loại ISR: Time-based (revalidate: 60s) và On-demand (revalidateTag / revalidatePath qua CMS webhook).', en: 'Distinguish Time-based ISR (TTL window) from On-demand ISR (CMS webhook invalidation by cache tag).' },
    ],
    example: {
      title: { vi: 'Mô phỏng Engine ISR với In-Flight Deduplication', en: 'ISR Stale-While-Revalidate Cache Simulation' },
      description: { vi: 'Chạy thử engine ISR: lần đọc hết hạn TTL vẫn trả về dữ liệu cũ ngay lập tức trong khi rebuild ngầm.', en: 'See how ISR serves stale content immediately upon TTL expiry while deduplicating the background rebuild.' },
      mode: 'ts',
      code: `interface CacheEntry { html: string; builtAt: number }
const cache = new Map<string, CacheEntry>();
const rebuilding = new Set<string>();
let version = 1;

async function rebuildPage(slug: string) {
  if (rebuilding.has(slug)) return;
  rebuilding.add(slug);
  console.log('[Background] Rebuilding ' + slug + '...');
  await sleep(120);
  version += 1;
  cache.set(slug, { html: '<h1>' + slug + ' v' + version + '</h1>', builtAt: Date.now() });
  rebuilding.delete(slug);
  console.log('[Background] Updated ' + slug + ' -> v' + version);
}

async function getISRPage(slug: string, ttlMs = 150): Promise<string> {
  const entry = cache.get(slug);
  if (!entry) {
    await rebuildPage(slug);
    return cache.get(slug)!.html;
  }
  const age = Date.now() - entry.builtAt;
  if (age > ttlMs) {
    void rebuildPage(slug); // Non-blocking background refresh
    return entry.html + ' (served STALE)';
  }
  return entry.html + ' (CACHE HIT)';
}

console.log('Req 1:', await getISRPage('/pricing'));
console.log('Req 2:', await getISRPage('/pricing'));
await sleep(180);
console.log('Req 3 (expired):', await getISRPage('/pricing'));
await sleep(150);
console.log('Req 4 (fresh):', await getISRPage('/pricing'));`,
      tryItPrompt: { vi: 'Thử gửi 2 request song song ngay sau khi hết TTL để xem Set rebuilding chặn double-rebuild.', en: 'Try firing two concurrent requests right after TTL expiry to see how rebuilding deduplicates work.' },
    },
    challenge: {
      id: 'challenge-isr-cache',
      topicId: 'isr',
      categoryId: 'architecture',
      title: { vi: 'Cài đặt implementISRCache (SWR + Deduplication)', en: 'Implement implementISRCache (SWR + Deduplication)' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm createISRCache(fetcher: (key: string) => Promise<string>, ttlMs: number, now?: () => number) trả về { get(key: string): Promise<{ value: string; status: "MISS" | "HIT" | "STALE" }> }. Khi chưa có cache trả "MISS" sau khi await fetcher. Khi còn hạn trả "HIT". Khi quá hạn (> ttlMs) trả giá trị cũ ngay với "STALE" đồng thời chỉ chạy tối đa 1 background refresh mỗi key.',
        en: 'Implement createISRCache(fetcher, ttlMs, now?) returning { get(key) => Promise<{ value, status: "MISS" | "HIT" | "STALE" }> }. Cold key awaits fetcher and returns "MISS". Fresh returns "HIT". Expired returns cached value immediately as "STALE" and triggers at most one deduplicated background refresh.',
      },
      starterCode: `export function createISRCache(
  fetcher: (key: string) => Promise<string>,
  ttlMs: number,
  now: () => number = () => Date.now()
) {
  // TODO: implement cache map + inFlight deduplication
  return {
    async get(_key: string): Promise<{ value: string; status: 'MISS' | 'HIT' | 'STALE' }> {
      return { value: '', status: 'MISS' };
    },
  };
}`,
      solutionCode: `export function createISRCache(
  fetcher: (key: string) => Promise<string>,
  ttlMs: number,
  now: () => number = () => Date.now()
) {
  const store = new Map<string, { value: string; updatedAt: number }>();
  const inFlight = new Map<string, Promise<void>>();

  const refresh = (key: string) => {
    const existing = inFlight.get(key);
    if (existing) return existing;
    const p = fetcher(key)
      .then((value) => {
        store.set(key, { value, updatedAt: now() });
      })
      .finally(() => {
        inFlight.delete(key);
      });
    inFlight.set(key, p);
    return p;
  };

  return {
    async get(key: string): Promise<{ value: string; status: 'MISS' | 'HIT' | 'STALE' }> {
      const entry = store.get(key);
      if (!entry) {
        await refresh(key);
        const fresh = store.get(key)!;
        return { value: fresh.value, status: 'MISS' };
      }
      if (now() - entry.updatedAt <= ttlMs) {
        return { value: entry.value, status: 'HIT' };
      }
      void refresh(key);
      return { value: entry.value, status: 'STALE' };
    },
  };
}`,
      testCode: `test('serves MISS -> HIT -> STALE -> fresh HIT and deduplicates background rebuild', async () => {
  let clock = 1000;
  let calls = 0;
  const cache = createISRCache(async (k) => {
    calls += 1;
    await sleep(20);
    return k + ':v' + calls;
  }, 500, () => clock);

  const r1 = await cache.get('/blog');
  expect(r1).toEqual({ value: '/blog:v1', status: 'MISS' });

  clock = 1200;
  const r2 = await cache.get('/blog');
  expect(r2).toEqual({ value: '/blog:v1', status: 'HIT' });
  expect(calls).toBe(1);

  clock = 2000;
  const [r3, r4] = await Promise.all([cache.get('/blog'), cache.get('/blog')]);
  expect(r3).toEqual({ value: '/blog:v1', status: 'STALE' });
  expect(r4).toEqual({ value: '/blog:v1', status: 'STALE' });
  expect(calls).toBe(2); // Deduplicated!

  await sleep(35);
  const r5 = await cache.get('/blog');
  expect(r5).toEqual({ value: '/blog:v2', status: 'HIT' });
});`,
      hints: [
        { vi: 'Dùng 2 Map: store lưu { value, updatedAt } và inFlight lưu Promise đang rebuild.', en: 'Keep two Maps: store for { value, updatedAt } and inFlight for active background refreshes.' },
        { vi: 'Khi entry quá hạn (now() - entry.updatedAt > ttlMs), gọi refresh(key) không await rồi trả ngay entry.value với status "STALE".', en: 'When expired, kick off refresh(key) without awaiting it and immediately return entry.value with status "STALE".' },
      ],
    },
    quiz: [
      {
        id: 'q-isr-1',
        topicId: 'isr',
        categoryId: 'architecture',
        question: { vi: 'Khi một trang ISR hết hạn revalidate TTL, người dùng kế tiếp truy cập sẽ nhận được gì?', en: 'When an ISR page passes its revalidate TTL, what does the very next visitor receive?' },
        options: [
          { vi: 'Bị chặn đứng màn hình chờ server build xong trang mới.', en: 'They block until the server finishes rebuilding the fresh HTML.' },
          { vi: 'Nhận ngay bản cache cũ từ CDN (STALE) đồng thời server tái tạo ngầm bản mới cho lượt sau.', en: 'They immediately receive the stale cached HTML while the server rebuilds the next version asynchronously.' },
          { vi: 'Nhận lỗi 404 Not Found.', en: 'They get a 404 Not Found response.' },
          { vi: 'Tự động chuyển sang CSR.', en: 'It permanently downgrades to CSR.' },
        ],
        correctIndex: 1,
        explanation: {
          vi: 'ISR áp dụng mô hình stale-while-revalidate nên độ trễ đọc luôn nhanh như CDN tĩnh.',
          en: 'ISR uses stale-while-revalidate semantics so visitor latency stays fast even when triggering background regeneration.',
        },
      },
      {
        id: 'q-isr-2',
        topicId: 'isr',
        categoryId: 'architecture',
        question: { vi: 'Làm thế nào cập nhật ngay trang ISR khi editor vừa bấm Publish trên CMS?', en: 'How do you update an ISR page immediately when an editor hits Publish in a CMS?' },
        options: [
          { vi: 'Đợi hết TTL 24 giờ.', en: 'Wait 24 hours for the TTL to expire.' },
          { vi: 'Gọi On-Demand Revalidation webhook (revalidatePath/revalidateTag) từ CMS.', en: 'Trigger an On-Demand Revalidation webhook (revalidatePath/revalidateTag) from the CMS.' },
          { vi: 'Xóa LocalStorage của mọi user.', en: 'Clear every user LocalStorage.' },
          { vi: 'Tắt CDN caching toàn cục.', en: 'Disable CDN caching globally.' },
        ],
        correctIndex: 1,
        explanation: {
          vi: 'On-Demand Revalidation cho phép vô hiệu hóa đúng tag/route vừa sửa trong vài giây.',
          en: 'On-Demand Revalidation purges specific route or tag cache keys immediately upon CMS webhooks.',
        },
      },
    ],
    relatedTopicIds: ['ssr', 'caching-expiry', 'ssr-ssg-seo'],
  },

  {
    ...TOPIC_META_MAP['serverless'],
    mentalModel: {
      vi: 'Thay vì thuê nguyên chiếc xe chạy không tải 24/7, bạn gọi taxi tự động theo từng cuốc (request) — Frontend thường dùng Serverless làm lớp BFF (Backend-for-Frontend) hoặc render SSR theo nhu cầu.',
      en: 'Instead of keeping idle servers warm 24/7, compute spins up per HTTP request or event—ideal for Frontend BFF APIs, auth callbacks, and dynamic SSR endpoints.',
    },
    keyPoints: [
      { vi: 'Tự động scale từ 0 lên hàng nghìn instance song song và chỉ tính tiền theo thời gian thực thi (ms).', en: 'Scales automatically from zero to thousands of concurrent invocations, billed per execution millisecond.' },
      { vi: 'Stateless theo bản chất: không lưu session hay cache quan trọng trong RAM cục bộ giữa các request.', en: 'Ephemeral and stateless: never rely on in-memory globals for cross-request persistence.' },
      { vi: 'Cold Start xảy ra khi container mới khởi động sau thời gian rảnh — phụ thuộc kích thước dependencies.', en: 'Cold starts occur when provisioning a new isolate/container; bundle size directly affects startup latency.' },
      { vi: 'Giới hạn timeout thực thi (thường 10–60s hoặc tối đa vài phút), không giữ kết nối WebSocket dài hạn trực tiếp.', en: 'Execution duration caps make standard serverless unsuitable for long-lived WebSocket state.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'BFF API gom nhiều microservices, xử lý webhook thanh toán, ký URL upload ảnh S3/Blob và SSR theo request.', en: 'Backend-for-Frontend aggregation, webhooks, signed upload URLs, and on-demand SSR.' },
        { vi: 'Traffic biến động mạnh theo giờ cao điểm hoặc chiến dịch marketing.', en: 'Bursty traffic patterns with quiet off-peak periods.' },
      ],
      whenToAvoid: [
        { vi: 'Cần kết nối stateful WebSocket hàng triệu user đồng thời (nên dùng Edge/Stateful server hoặc Pusher/Ably).', en: 'Long-lived stateful WebSocket hubs or heavy background video transcoding jobs.' },
      ],
    },
    pitfalls: [
      { vi: 'Mỗi invocation mở connection database mới mà không dùng connection pooler (PgBouncer/HTTP proxy) làm cạn DB connections.', en: 'Opening unpooled TCP database connections per invocation quickly exhausts DB connection limits.' },
      { vi: 'Đóng gói cả thư viện nặng (AWS SDK v2, moment locales) vào function làm tăng cold start lên hàng giây.', en: 'Bundling heavy dependencies inflates cold-start latency.' },
    ],
    interviewTips: [
      { vi: 'Nhắc đến mô hình BFF (Backend for Frontend) chạy Serverless để giấu API key bên thứ 3 và gom nhiều request cho mobile.', en: 'Highlight Serverless as an ideal BFF layer to hide third-party secrets and reshape payloads per UI screen.' },
    ],
    example: {
      title: { vi: 'Mô phỏng BFF Serverless Aggregation & Cold/Warm Start', en: 'Serverless BFF Aggregation & Cold Start Simulator' },
      description: { vi: 'Chạy giả lập serverless function ở trạng thái cold start vs warm reuse khi làm BFF gom dữ liệu.', en: 'Simulate cold-start vs warm-instance latency and parallel downstream fetching in a Serverless BFF.' },
      mode: 'ts',
      code: `let isWarm = false;

async function handleBffRequest(userId: string) {
  const t0 = performance.now();
  if (!isWarm) {
    console.log('[Container] Cold start: initializing runtime...');
    await sleep(180);
    isWarm = true;
  } else {
    console.log('[Container] Warm reuse: 0ms init overhead');
  }

  // Parallel fan-out inside BFF instead of 3 client roundtrips
  const [profile, orders, notifications] = await Promise.all([
    mockFetch('/svc/users/' + userId, { delay: 50, response: { name: 'An Nguyen' } }).then((r) => r.json()),
    mockFetch('/svc/orders/' + userId, { delay: 75, response: [{ id: 101 }] }).then((r) => r.json()),
    mockFetch('/svc/notif/' + userId, { delay: 40, response: { unread: 3 } }).then((r) => r.json()),
  ]);

  const elapsed = (performance.now() - t0).toFixed(1);
  return { elapsedMs: elapsed, payload: { profile, orderCount: orders.length, unread: notifications.unread } };
}

console.log('Invocation 1:', await handleBffRequest('u1'));
console.log('Invocation 2:', await handleBffRequest('u1'));`,
      tryItPrompt: { vi: 'Thử đổi Promise.all thành await tuần tự để thấy tổng thời gian tăng gấp đôi như thế nào.', en: 'Change Promise.all to sequential awaits and observe the latency penalty.' },
    },
    quiz: [
      {
        id: 'q-serverless-1',
        topicId: 'serverless',
        categoryId: 'architecture',
        question: { vi: 'Yếu tố nào trực tiếp làm tăng thời gian Cold Start của một Serverless Function?', en: 'What directly increases Cold Start latency in a Serverless Function?' },
        options: [
          { vi: 'Kích thước bundle & dependencies lớn cùng code khởi tạo nặng ở top-level.', en: 'Large dependency bundle sizes and heavy top-level initialization code.' },
          { vi: 'Dùng HTTP GET thay vì POST.', en: 'Using HTTP GET instead of POST.' },
          { vi: 'Bật HTTP/2 trên trình duyệt.', en: 'Enabling HTTP/2 in browsers.' },
          { vi: 'Dùng JSON.parse cho body.', en: 'Using JSON.parse on request bodies.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Runtime phải tải code package và thực thi module top-level trước khi xử lý request đầu tiên.',
          en: 'Cold starts load the deployment package and execute top-level imports before invoking the handler.',
        },
      },
      {
        id: 'q-serverless-2',
        topicId: 'serverless',
        categoryId: 'architecture',
        question: { vi: 'Vì sao không nên dùng biến global trong RAM Serverless để lưu session đăng nhập người dùng?', en: 'Why must Serverless functions avoid storing user login sessions only in local RAM variables?' },
        options: [
          { vi: 'Các request liên tiếp có thể rơi vào các container/instance khác nhau hoặc bị thu hồi khi idle.', en: 'Subsequent requests may hit different instances or recycled containers, losing local memory.' },
          { vi: 'JavaScript không hỗ trợ biến Map trên server.', en: 'JavaScript lacks Map on servers.' },
          { vi: 'RAM server chỉ đọc được từ CSS.', en: 'Server RAM is read-only.' },
          { vi: 'CORS chặn truy cập RAM.', en: 'CORS blocks server RAM access.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Serverless function là stateless và ephemeral; state chia sẻ phải đặt ở Redis, DB hoặc cookie đã ký.',
          en: 'Serverless functions scale out across ephemeral instances, requiring external stores or signed cookies for state.',
        },
      },
    ],
    relatedTopicIds: ['edge-computing', 'ssr', 'restful'],
  },

  {
    ...TOPIC_META_MAP['edge-computing'],
    mentalModel: {
      vi: 'Thay vì bắt mọi yêu cầu từ Hà Nội bay sang server ở Virginia chỉ để kiểm tra cookie hay A/B test, đặt trạm xử lý ngay tại PoP gần nhà người dùng để phản hồi trong vài chục mili-giây.',
      en: 'Execute routing, auth verification, localization, and lightweight SSR at globally distributed CDN edge nodes meters from the user instead of a single origin region.',
    },
    keyPoints: [
      { vi: 'Chạy trên V8 Isolates (khởi động < 5ms, không cold start nặng như container truyền thống).', en: 'Typically runs on V8 Isolates with sub-5ms startup and minimal cold-start penalty.' },
      { vi: 'Lý tưởng cho Middleware: kiểm tra JWT cookie, chuyển hướng theo quốc gia/ngôn ngữ, gán A/B variant trước khi chạm cache.', en: 'Ideal for Middleware: auth token checks, geo/Accept-Language redirects, and A/B test bucketing.' },
      { vi: 'Không có đầy đủ Node.js APIs (fs, native C++ bindings) và bị giới hạn bộ nhớ/CPU nghiêm ngặt.', en: 'Uses Web Standard APIs rather than full Node.js native modules, with strict memory/CPU budgets.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Middleware xác thực, geo-routing, A/B testing không nháy layout (flicker-free), hoặc streaming SSR gần người dùng khi database đã replicated ở edge.', en: 'Auth gating, geo-routing, flicker-free A/B tests, or edge SSR backed by globally replicated data.' },
      ],
      whenToAvoid: [
        { vi: 'Logic cần truy vấn database tập trung ở một region duy nhất (10 roundtrips từ edge về origin DB sẽ còn chậm hơn chạy cạnh DB!).', en: 'Chatty origin DB queries across the globe—edge-to-origin roundtrips can be slower than running near the DB.' },
      ],
    },
    pitfalls: [
      { vi: 'Đặt SSR tại Edge nhưng Database đặt ở US-East khiến người dùng Châu Á chịu nhiều roundtrips vượt đại dương.', en: 'Running SSR at the Edge while querying a single-region US database creates slow cross-ocean waterfalls.' },
    ],
    interviewTips: [
      { vi: 'Luôn đề cập đến vị trí của dữ liệu (Data Gravity): code ở Edge chỉ nhanh khi dữ liệu cũng ở gần Edge (cached, KV, replica) hoặc tính toán thuần Web API.', en: 'Always mention Data Gravity: Edge compute only beats origin when state is cached/replicated nearby.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Edge Middleware: Geo + A/B + Auth Check', en: 'Edge Middleware Router Simulation' },
      description: { vi: 'Chạy thử logic Web Standard Request/Response middleware phân tuyến tại CDN Edge.', en: 'Simulate an Edge middleware handler evaluating geo-locale, A/B cookie, and auth gates.' },
      mode: 'ts',
      code: `interface EdgeRequest {
  path: string;
  country: 'VN' | 'US' | 'JP';
  hasAuthCookie: boolean;
  abBucket?: 'A' | 'B';
}

function edgeMiddleware(req: EdgeRequest) {
  // 1. Auth guard at the edge before hitting origin compute
  if (req.path.startsWith('/app') && !req.hasAuthCookie) {
    return { action: 'REDIRECT', location: '/login?from=' + req.path, edgeLatencyMs: 8 };
  }

  // 2. Geo-based locale rewrite
  const locale = req.country === 'VN' ? 'vi' : req.country === 'JP' ? 'ja' : 'en';

  // 3. Deterministic A/B bucket assignment without client flicker
  const bucket = req.abBucket ?? (Math.random() < 0.5 ? 'A' : 'B');

  return {
    action: 'REWRITE',
    target: \`/\${locale}\${req.path}?variant=\${bucket}\`,
    setCookie: 'ab_bucket=' + bucket,
    edgeLatencyMs: 11,
  };
}

console.log('Guest to /app:', edgeMiddleware({ path: '/app/settings', country: 'VN', hasAuthCookie: false }));
console.log('Visitor to /pricing:', edgeMiddleware({ path: '/pricing', country: 'VN', hasAuthCookie: true }));`,
      tryItPrompt: { vi: 'Thử thêm quốc gia mới hoặc chặn bot theo path /admin.', en: 'Try adding another country code or blocking unauthorized /admin paths.' },
    },
    quiz: [
      {
        id: 'q-edge-1',
        topicId: 'edge-computing',
        categoryId: 'architecture',
        question: { vi: 'Trường hợp nào chạy SSR tại Edge có thể CHẬM hơn chạy tại Origin Server?', en: 'When can Edge SSR actually be SLOWER than running SSR in a single Origin region?' },
        options: [
          { vi: 'Khi function Edge phải gọi tuần tự nhiều query về một database đặt ở region xa.', en: 'When the Edge function makes multiple sequential DB calls back to a distant single-region database.' },
          { vi: 'Khi dùng Web Fetch API thay cho axios.', en: 'When using Web Fetch API instead of axios.' },
          { vi: 'Khi response trả về nén Brotli.', en: 'When responses use Brotli compression.' },
          { vi: 'Khi CDN PoP nằm gần người dùng.', en: 'When the CDN PoP is close to the user.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Độ trễ mạng giữa Edge và DB gốc có thể nhân lên nhiều lần nếu thực hiện nhiều query nối tiếp.',
          en: 'Multiple roundtrips between a distant Edge PoP and a centralized origin DB amplify latency.',
        },
      },
      {
        id: 'q-edge-2',
        topicId: 'edge-computing',
        categoryId: 'architecture',
        question: { vi: 'Vì sao Edge Middleware rất hiệu quả cho A/B testing giao diện?', en: 'Why is Edge Middleware ideal for UI A/B testing?' },
        options: [
          { vi: 'Gán biến thể và rewrite route trước khi trả HTML nên người dùng không bị chớp giật layout (anti-flicker).', en: 'It assigns variants and rewrites responses before HTML arrives, avoiding client-side layout flicker.' },
          { vi: 'Nó xóa bỏ hoàn toàn CSS.', en: 'It eliminates the need for CSS.' },
          { vi: 'Nó chạy trực tiếp trên GPU trình duyệt.', en: 'It runs inside the browser GPU.' },
          { vi: 'Nó tăng dung lượng JS bundle lên.', en: 'It enlarges the JS bundle.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'A/B testing trên client thường làm nháy màn hình khi JS đổi biến thể; xử lý ở Edge trả thẳng HTML đúng biến thể.',
          en: 'Client-side A/B scripts flash original content before swapping; Edge rewrites deliver the exact variant on first paint.',
        },
      },
    ],
    relatedTopicIds: ['serverless', 'ssr', 'image-cdn'],
  },

  {
    ...TOPIC_META_MAP['server-components'],
    mentalModel: {
      vi: 'Tách ứng dụng thành hai tầng rõ rệt: phần tĩnh/đọc dữ liệu chạy 100% ở Server Component (0 KB JS gửi xuống client), còn các nút bấm tương tác là Client Island nhỏ gọn.',
      en: 'Split UI into zero-bundle Server Components that read data/render markup on the server, interleaved with lean interactive Client Component islands.',
    },
    keyPoints: [
      { vi: 'Mã nguồn của Server Component (cùng các thư viện nặng như markdown parser, date formatter) không bao giờ lọt vào client JS bundle.', en: 'Server Component code and heavy dependencies (markdown parsers, syntax highlighters) never ship in the client bundle.' },
      { vi: 'Có thể truy cập trực tiếp DB/filesystem và truyền props serializable xuống Client Components.', en: 'Access databases or secrets directly and pass serializable props down to Client Components.' },
      { vi: 'Khác với SSR truyền thống: RSC có thể re-fetch theo từng nhánh cây mà vẫn giữ nguyên state bên trong các Client Components anh em.', en: 'Unlike full-page SSR, RSC payloads can refresh subtrees while preserving local client state in sibling islands.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Trang giàu nội dung kết hợp nhiều thư viện nặng phía hiển thị (blog kỹ thuật, tài liệu, e-commerce PDP, feed có phần comment tương tác).', en: 'Content-dense apps with heavy formatting dependencies alongside pockets of rich interactivity.' },
      ],
      whenToAvoid: [
        { vi: 'Mọi phần tử trên màn hình đều cần state tức thì và thao tác chuột/phím liên tục (canvas vẽ, trình soạn thảo Figma).', en: 'Canvas editors or apps where virtually every node needs continuous client event handlers and local state.' },
      ],
    },
    pitfalls: [
      { vi: 'Import nhầm Client module vào file server mà quên "use client" hoặc truyền hàm/class instance không serialize được qua ranh giới Server -> Client.', en: 'Passing non-serializable functions or class instances across the Server-to-Client boundary throws serialization errors.' },
      { vi: 'Đánh dấu "use client" quá cao ở layout gốc khiến toàn bộ cây con bên dưới bị kéo vào client bundle.', en: 'Placing "use client" too high in the tree opts every child module into the client JS bundle.' },
    ],
    interviewTips: [
      { vi: 'Vẽ rõ biểu đồ ranh giới: giữ "use client" ở các lá (leaf nodes) và truyền Server Component vào làm props.children của Client wrapper!', en: 'Explain keeping "use client" at leaf islands and passing Server Components through a Client wrapper via children props.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Kiến trúc Server Component + Client Island', en: 'Server Component + Client Island Composition' },
      description: { vi: 'Trải nghiệm cách Server Component giữ 0 KB JS phần render danh sách nặng và chỉ hydrate nút Like tương tác.', en: 'Compare zero-JS server-rendered markup against tiny hydrated interactive client islands.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

// Server Component (0 KB client JS - heavy markdown parser stays on server)
function ArticleMarkdownServer({ title, words }: { title: string; words: string }) {
  return (
    <div className="card" style={{ borderLeft: '3px solid #38bdf8' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>{title}</strong>
        <span className="badge">Server (0 KB JS)</span>
      </div>
      <p className="muted" style={{ marginBottom: 0 }}>{words}</p>
    </div>
  );
}

// Client Island (hydrated on browser)
function LikeButtonClient({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  return (
    <button className="primary" onClick={() => setLikes((n) => n + 1)}>
      Client Island: Like ({likes})
    </button>
  );
}

export default function App() {
  return (
    <div className="col">
      <ArticleMarkdownServer
        title="Streaming Architecture Guide"
        words="Markdown AST parsed & sanitized purely on the server; zero parser library shipped to browser."
      />
      <div className="row">
        <LikeButtonClient initialLikes={41} />
        <span className="muted" style={{ fontSize: 12 }}>Only this button ships interactive JS!</span>
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử thêm một Client Island bình luận bên dưới mà vẫn giữ ArticleMarkdownServer là pure server markup.', en: 'Try adding a CommentComposer client island below while keeping the article card static.' },
    },
    quiz: [
      {
        id: 'q-rsc-1',
        topicId: 'server-components',
        categoryId: 'architecture',
        question: { vi: 'Lợi ích lớn nhất của React Server Components đối với JS Bundle Size là gì?', en: 'What is the primary bundle-size benefit of React Server Components?' },
        options: [
          { vi: 'Code của Server Component và các thư viện chỉ dùng trên server không bao giờ được gửi xuống trình duyệt.', en: 'Server Component code and server-only dependencies are never shipped in the client JavaScript bundle.' },
          { vi: 'Tự động nén ảnh sang định dạng WebP.', en: 'Automatically converts images to WebP.' },
          { vi: 'Biến mọi CSS thành inline style.', en: 'Inlines all stylesheets.' },
          { vi: 'Thay thế hoàn toàn HTML bằng JSON.', en: 'Replaces HTML entirely with JSON.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Các thư viện nặng như marked, prismjs, zod chạy xong trên server và chỉ gửi kết quả UI về client.',
          en: 'Heavy server-only libraries execute purely on the server, excluding their bytes from client bundles.',
        },
      },
      {
        id: 'q-rsc-2',
        topicId: 'server-components',
        categoryId: 'architecture',
        question: { vi: 'Làm thế nào lồng một Server Component bên trong một Client Component (ví dụ Drawer/Modal tương tác)?', en: 'How can you nest a Server Component inside an interactive Client Component?' },
        options: [
          { vi: 'Import trực tiếp Server Component vào file có "use client".', en: 'Directly import the Server Component inside a "use client" module.' },
          { vi: 'Truyền Server Component từ một Server Component cha qua prop children hoặc slot prop.', en: 'Pass the Server Component as children (or slot prop) from a parent Server Component.' },
          { vi: 'Chuyển Server Component sang chuỗi eval.', en: 'Serialize the component with eval().' },
          { vi: 'Không thể kết hợp hai loại này.', en: 'They cannot compose together.' },
        ],
        correctIndex: 1,
        explanation: {
          vi: 'Truyền qua props.children giúp React render phần Server Component trên server rồi nhét slot kết quả vào Client wrapper.',
          en: 'Passing Server Components as children lets the server render the slot without pulling it into the client bundle.',
        },
      },
    ],
    relatedTopicIds: ['ssr', 'code-splitting', 'composition'],
  },
];
