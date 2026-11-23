import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const imagesTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['image-cdn'],
    mentalModel: {
      vi: 'Thay vì tạo thủ công 6 phiên bản kích thước (400px, 800px, 1600px) x 3 định dạng (AVIF, WebP, JPG) lúc upload, dùng Image CDN biến đổi URL tức thì (`/photo.jpg?w=800&fmt=auto&q=80`) và cache ngay tại node gần người dùng!',
      en: 'An Image CDN serves edge-cached assets with on-the-fly URL transformations (`?w=800&f=auto&q=80`), negotiating AVIF/WebP automatically via `Accept` headers.',
    },
    keyPoints: [
      { vi: 'Auto-format negotiation (`f=auto`): kiểm tra HTTP request header `Accept: image/avif,image/webp` để trả về định dạng nén nhẹ nhất trình duyệt hỗ trợ.', en: 'Automatic format negotiation checks the browser `Accept` header to deliver AVIF/WebP transparently.' },
      { vi: 'On-the-fly resizing (`w=640`, `dpr=2`, `fit=cover`): không bao giờ gửi ảnh gốc 4000px xuống thẻ avatar 48px!', en: 'Dynamic resizing ensures a 48px avatar never downloads a raw 4000px camera original.' },
      { vi: 'Cache tại Edge CDN kèm `Vary: Accept` và header cache dài hạn (`max-age=31536000, immutable`).', en: 'Edge caching combined with `Vary: Accept` and long immutable TTLs cuts origin hits and latency.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Thương mại điện tử, mạng xã hội, blog ảnh nhiều kích thước viewport khác nhau.', en: 'E-commerce catalogs, UGC media platforms, and responsive content sites.' },
      ],
      whenToAvoid: [
        { vi: 'Vài icon SVG nhỏ hoặc logo tĩnh dưới 5KB — giữ trực tiếp trong static assets cùng domain để đỡ tốn TLS handshake domain mới.', en: 'Small inline SVG icons or tiny static logos—host same-origin to avoid extra DNS/TLS overhead.' },
      ],
    },
    pitfalls: [
      { vi: 'Cho phép client tự truyền `?w=99999` không ký chữ ký URL (HMAC) hoặc whitelist kích thước -> kẻ xấu spam resize làm sập chi phí Image CDN!', en: 'Unrestricted resize query parameters let attackers cache-bust and spike CDN billing; whitelist allowed widths or sign URLs.' },
    ],
    interviewTips: [
      { vi: 'Nhắc tới cả bảo mật chi phí Image CDN: dùng `allowedWidths = [320, 640, 960, 1280]` hoặc URL signature thay vì cho phép arbitrary width!', en: 'Mention protecting Image CDN endpoints with width step allowlists (`[320, 640, 1280]`) or HMAC URL signatures.' },
    ],
    example: {
      title: { vi: 'Trình tạo URL Image CDN chuẩn Width Allowlist & Auto Format', en: 'Image CDN URL Builder w/ Width Quantization' },
      description: { vi: 'Làm tròn kích thước theo nấc cố định để tối đa tỷ lệ Cache Hit trên CDN và tự chọn format theo trình duyệt.', en: 'Snap arbitrary requested widths to CDN bucket steps to maximize edge cache hit ratios.' },
      mode: 'ts',
      code: `const ALLOWED_WIDTHS = [320, 640, 960, 1280, 1920];

function buildImageCdnUrl(
  path: string,
  requestedWidth: number,
  options: { dpr?: number; quality?: number; format?: 'auto' | 'avif' | 'webp' } = {}
) {
  const { dpr = 1, quality = 80, format = 'auto' } = options;
  const target = requestedWidth * dpr;
  // Quantize up to nearest allowed width bucket to boost CDN cache hits
  const bucketWidth = ALLOWED_WIDTHS.find((w) => w >= target) ?? ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
  return \`https://cdn.example/img\${path}?w=\${bucketWidth}&q=\${quality}&f=\${format}\`;
}

console.log('Mobile 375px 2x:', buildImageCdnUrl('/shoes/air.jpg', 375, { dpr: 2 }));
console.log('Desktop 1200px 1x:', buildImageCdnUrl('/shoes/air.jpg', 1200, { dpr: 1, quality: 75 }));`,
      tryItPrompt: { vi: 'Thử truyền `requestedWidth = 390` và `dpr = 3` để xem bucket tự khớp lên 1280px bảo vệ cache CDN.', en: 'Test `requestedWidth = 390, dpr = 3` to watch width snapping to the 1280 bucket.' },
    },
    quiz: [
      {
        id: 'q-imgcdn-1',
        topicId: 'image-cdn',
        categoryId: 'images',
        question: { vi: 'Vì sao Image CDN thường giới hạn danh sách chiều rộng (vd 320, 640, 960, 1280) thay vì cho phép bất kỳ số px lẻ nào?', en: 'Why do production Image CDNs snap widths to discrete buckets (320, 640, 960, 1280) instead of arbitrary integers?' },
        options: [
          { vi: 'Tăng tỷ lệ Edge Cache Hit và ngăn kẻ tấn công spam URL khác nhau gây tràn bộ nhớ/chi phí transform.', en: 'Improves edge cache hit rates and prevents cache-busting DoS/billing spikes across arbitrary dimensions.' },
          { vi: 'Vì CSS không hiểu số lẻ.', en: 'CSS cannot render odd pixel sizes.' },
          { vi: 'Vì trình duyệt chỉ đọc được bội số của 10.', en: 'Browsers require multiples of 10.' },
          { vi: 'Để giảm độ sắc nét ảnh.', en: 'To blur photos.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Khống chế các nấc cố định giúp hàng ngàn kích thước màn hình dùng chung một bản ảnh đã cache sẵn ở Edge.',
          en: 'Bucketed widths collapse millions of device widths onto a handful of highly cached variants.',
        },
      },
      {
        id: 'q-imgcdn-2',
        topicId: 'image-cdn',
        categoryId: 'images',
        question: { vi: 'Header nào trình duyệt gửi kèm yêu cầu ảnh giúp Image CDN biết có thể trả về định dạng AVIF hay WebP?', en: 'Which HTTP request header informs an Image CDN that the client supports AVIF or WebP?' },
        options: [
          { vi: 'Accept (vd `Accept: image/avif,image/webp,*/*`)', en: 'Accept (e.g. `Accept: image/avif,image/webp,*/*`)' },
          { vi: 'User-Agent-OS', en: 'User-Agent-OS' },
          { vi: 'Referer', en: 'Referer' },
          { vi: 'Content-Length', en: 'Content-Length' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'CDN đọc header `Accept` (và cấu hình `Vary: Accept`) để trả đúng định dạng tối ưu nhất.',
          en: 'CDNs inspect `Accept` content negotiation headers and store variants keyed with `Vary: Accept`.',
        },
      },
    ],
    relatedTopicIds: ['image-formats', 'responsive-images', 'edge-computing'],
  },

  {
    ...TOPIC_META_MAP['image-formats'],
    mentalModel: {
      vi: 'Dùng đúng vũ khí cho từng loại đồ họa: **SVG** cho icon/logo vector nét căng ở mọi zoom, **WebP / AVIF** cho ảnh chụp & minh họa phức tạp (nhẹ hơn PNG/JPEG 30–55%).',
      en: 'Pick formats by content type: crisp scalable **SVG** for icons, logos, and diagrams; **AVIF / WebP** for photographs (30-55% smaller than JPEG/PNG).',
    },
    keyPoints: [
      { vi: 'SVG: định dạng vector XML giữ nguyên độ sắc nét ở 1x, 2x, 4x, có thể style màu bằng CSS `currentColor` và nén cực nhỏ qua Brotli.', en: 'SVG: resolution-independent XML vectors supporting CSS `currentColor` theming and steep Brotli compression.' },
      { vi: 'WebP: hỗ trợ rộng khắp ~98%+ trình duyệt, có cả lossy lẫn kênh trong suốt alpha (thay thế cả JPEG và PNG nặng nề).', en: 'WebP: ~98%+ browser support offering both lossy compression and alpha transparency.' },
      { vi: 'AVIF: thế hệ nén mới nhẹ hơn JPEG ~50% và nhẹ hơn WebP ~20–30%, dùng `<picture>` đặt `<source type="image/avif">` trước `<source type="image/webp">` và `<img>` JPEG dự phòng.', en: 'AVIF achieves ~50% savings vs JPEG; layer `<source type="image/avif">` -> `webp` -> fallback `<img>` in `<picture>`.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'SVG cho toàn bộ UI icons, brand logos, sơ đồ kỹ thuật; AVIF/WebP cho ảnh chụp sản phẩm, avatar, hero banner.', en: 'SVG for icons/logos/diagrams; AVIF/WebP for photography and rich raster art.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng xuất một bức ảnh chụp phong cảnh thành SVG (tạo hàng triệu path XML nặng gấp 20 lần WebP) và đừng dùng PNG 3MB cho ảnh chụp không cần nền trong suốt!', en: 'Never convert photographs into traced SVGs or ship multi-megabyte lossless PNGs for camera photos.' },
      ],
    },
    pitfalls: [
      { vi: 'Nhúng hàng trăm icon SVG inline trực tiếp lặp lại trong vòng lặp danh sách lớn làm phình kích thước DOM (dùng `<svg><use href="#icon-id"/></svg>` SVG sprite hoặc tái sử dụng hiệu quả).', en: 'Inlining huge SVG paths repeatedly across 500 table rows bloats DOM node counts; use SVG sprites or reusable components.' },
    ],
    interviewTips: [
      { vi: 'Ghi điểm thêm với kiến thức thực tế: ảnh GIF động cực kỳ nặng (có thể 5MB) -> thay bằng `<video autoplay muted loop playsinline>` MP4/WebM hoặc animated WebP để giảm 80–90% dung lượng!', en: 'Always mention replacing legacy animated GIFs with muted looping `<video>` (MP4/WebM) or animated WebP for 80-90% byte savings.' },
    ],
    example: {
      title: { vi: 'Demo HTML `<picture>` Stack (AVIF -> WebP -> JPEG) & SVG Icon', en: 'Progressive `<picture>` Stack & Scalable SVG Demo' },
      description: { vi: 'Minh họa cấu trúc thẻ `<picture>` fallback chuẩn quốc tế cùng icon SVG ăn màu CSS `currentColor`.', en: 'Inspect canonical `<picture>` format fallback markup alongside a `currentColor`-themed vector SVG icon.' },
      mode: 'html',
      code: `<div class="col">
  <div class="card">
    <div style="font-weight:600;margin-bottom:6px;">1. Vector SVG Icon (currentColor + infinite zoom crispness)</div>
    <div class="row" style="color:#38bdf8;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      <span>Inherits CSS color with zero blurry upscaling at 3x DPR!</span>
    </div>
  </div>
  <div class="card">
    <div style="font-weight:600;margin-bottom:6px;">2. Progressive Format Selection via &lt;picture&gt;</div>
    <pre style="margin:0;white-space:pre-wrap;">&lt;picture&gt;
  &lt;source srcset="hero.avif" type="image/avif" /&gt;
  &lt;source srcset="hero.webp" type="image/webp" /&gt;
  &lt;img src="hero.jpg" width="800" height="450" alt="Product architecture" /&gt;
&lt;/picture&gt;</pre>
  </div>
</div>`,
      tryItPrompt: { vi: 'Thử đổi `color:#38bdf8` ở div SVG thành `#22c55e` để thấy vector tự đổi màu ngay lập tức.', en: 'Change the wrapper color from `#38bdf8` to `#22c55e` to see `currentColor` styling.' },
    },
    quiz: [
      {
        id: 'q-imgfmt-1',
        topicId: 'image-formats',
        categoryId: 'images',
        question: { vi: 'Thứ tự đúng của các thẻ `<source>` bên trong `<picture>` để trình duyệt chọn định dạng tối ưu nhất trước là gì?', en: 'In what order should `<source>` elements appear inside `<picture>` for progressive format negotiation?' },
        options: [
          { vi: 'Định dạng nén tốt nhất lên đầu (`avif`, sau đó `webp`) và thẻ `<img>` fallback (`jpg/png`) ở cuối cùng.', en: 'Most efficient formats first (`avif`, then `webp`), ending with the fallback `<img>` element.' },
          { vi: '`<img>` đặt lên đầu, `<source>` đặt phía dưới.', en: '`<img>` first, followed by `<source>`.' },
          { vi: 'Đặt `gif` lên đầu tiên.', en: 'Put `gif` first.' },
          { vi: 'Thứ tự không quan trọng.', en: 'Order makes no difference.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Trình duyệt chọn `<source>` đầu tiên hợp lệ từ trên xuống dưới.',
          en: 'Browsers pick the first matching `<source>` top-to-bottom.',
        },
      },
      {
        id: 'q-imgfmt-2',
        topicId: 'image-formats',
        categoryId: 'images',
        question: { vi: 'Tại sao nên ưu tiên SVG thay cho PNG/WebP cho các icon hệ thống và logo phẳng?', en: 'Why prefer SVG over raster PNG/WebP for UI icons and vector logos?' },
        options: [
          { vi: 'Kích thước rất nhỏ, nét căng ở mọi tỷ lệ zoom/DPR, và đổi được màu sắc linh hoạt theo CSS Dark/Light mode.', en: 'Tiny compressed size, infinite sharpness across DPRs, and CSS color theming via `currentColor`.' },
          { vi: 'SVG là ảnh bitmap 8K.', en: 'SVG stores 8K bitmaps.' },
          { vi: 'Trình duyệt không giải mã được PNG.', en: 'Browsers fail to decode PNG.' },
          { vi: 'SVG tự chạy SQL.', en: 'SVG executes SQL.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Vector dựa trên tọa độ toán học nên không bao giờ bị răng cưa ở màn Retina 3x và dễ tái tô màu qua CSS.',
          en: 'Mathematical vector paths stay crisp at any scale factor and respect CSS theme variables.',
        },
      },
    ],
    relatedTopicIds: ['image-cdn', 'responsive-images', 'compression'],
  },

  {
    ...TOPIC_META_MAP['image-lazy-loading'],
    mentalModel: {
      vi: 'Ảnh nằm tít ở cuối trang dài 5.000px thì khoan hãy tải lúc vừa mở web! Gắn `loading="lazy"` cho ảnh dưới màn hình đầu để trình duyệt chỉ tải khi người dùng cuộn gần tới, nhưng giữ `loading="eager"` + `fetchpriority="high"` cho ảnh đầu trang.',
      en: 'Defer off-screen below-the-fold images with native `loading="lazy"` so initial page load focuses bandwidth on the hero (`loading="eager"` + `fetchpriority="high"`).',
    },
    keyPoints: [
      { vi: 'Native browser lazy loading (`<img loading="lazy">`) tự tính khoảng cách đệm (~1250–2500px tùy tốc độ mạng) mà không cần bundle thêm thư viện JS!', en: 'Native `loading="lazy"` handles network-aware viewport margins natively with zero JS library overhead.' },
      { vi: 'Kết hợp `decoding="async"` cho ảnh phụ để bước giải mã ảnh không chặn main thread.', en: 'Add `decoding="async"` on off-screen photos so image decode stays off the critical UI path.' },
      { vi: 'Luôn đi kèm `width` và `height` trên `<img>` dù là `loading="lazy"` để giữ nguyên khung hình không bị CLS.', en: 'Always specify `width` and `height` on lazy images so late arrivals cause zero layout shift (CLS).' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Danh sách bài viết, gallery sản phẩm dài, avatar bình luận ở phần cuối trang.', en: 'Long e-commerce grids, image galleries, comment avatars, and footer media.' },
      ],
      whenToAvoid: [
        { vi: 'Ảnh Hero, Logo đầu trang, banner trong 100vh đầu tiên (gắn lazy lên ảnh LCP sẽ làm tụt điểm Web Vitals!).', en: 'Never apply `loading="lazy"` to above-the-fold LCP/hero images or navigation logos.' },
      ],
    },
    pitfalls: [
      { vi: 'Ẩn ảnh với `display: none` hay đặt lazy cho toàn bộ danh sách ảnh đầu trang mà không phân biệt vị trí trên hay dưới màn hình đầu.', en: 'Blindly applying `loading="lazy"` to every `<Image>` component hurts above-the-fold LCP.' },
    ],
    interviewTips: [
      { vi: 'Nêu rõ quy tắc phân tầng đơn giản: `index < 2` (hoặc hero) -> `loading="eager" fetchpriority="high"`; phần còn lại -> `loading="lazy" decoding="async"`.', en: 'State a clean rule of thumb: `priority` hero / first 1-2 visible cards get `eager` + `fetchpriority="high"`; everything below gets `lazy`.' },
    ],
    example: {
      title: { vi: 'Thư viện ảnh với Priority Rules & Placeholder Sizing', en: 'Priority-Aware Image Gallery Demo' },
      description: { vi: 'Minh họa sự khác biệt cấu hình thẻ ảnh đầu tiên (eager + high priority) vs các ảnh sau (lazy + async decode).', en: 'Inspect live priority markup separating the hero frame from below-the-fold lazy frames.' },
      mode: 'html',
      code: `<div class="col">
  <div class="card">
    <div class="row" style="justify-content:space-between;margin-bottom:6px;">
      <strong>Hero Slot #0 (Above the fold)</strong>
      <span class="badge" style="color:#22c55e;">loading="eager" fetchpriority="high"</span>
    </div>
    <div style="aspect-ratio:16/6;background:linear-gradient(120deg,#0f172a,#1e3a5f);border-radius:6px;display:flex;align-items:center;justify-content:center;color:#e2e8f0;">
      Preloaded Hero Frame (Reserved 16:6 Aspect Ratio -> CLS = 0)
    </div>
  </div>
  <div class="card">
    <div class="row" style="justify-content:space-between;margin-bottom:6px;">
      <strong>Gallery Slots #1..N (Below the fold)</strong>
      <span class="badge">loading="lazy" decoding="async"</span>
    </div>
    <p class="muted" style="margin:0;">Native browser intersection observer skips downloading bytes until user scrolls near the threshold.</p>
  </div>
</div>`,
      tryItPrompt: { vi: 'Thử mở tab Interactive Lab ("Responsive Images") để xem mô phỏng ngưỡng lazy load trên mạng 4G vs 3G!', en: 'Open the Responsive Images Interactive Lab tab to simulate lazy-loading thresholds on 4G vs 3G.' },
    },
    quiz: [
      {
        id: 'q-ilazy-1',
        topicId: 'image-lazy-loading',
        categoryId: 'images',
        question: { vi: 'Vì sao thẻ `<img>` dùng `loading="lazy"` vẫn BẮT BUỘC phải có `width` và `height` (hoặc `aspect-ratio`)?', en: 'Why must lazy-loaded `<img>` elements still declare explicit `width` and `height` attributes?' },
        options: [
          { vi: 'Để trình duyệt giữ đúng chỗ trống layout trước khi tải ảnh, ngăn nhảy trang (CLS) khi người dùng cuộn tới.', en: 'So the browser reserves exact box geometry before pixels arrive, preventing Cumulative Layout Shift (CLS).' },
          { vi: 'Để trình duyệt tự cắt ảnh hình tròn.', en: 'To auto-crop images into circles.' },
          { vi: 'Vì trình duyệt từ chối lazy-load nếu thiếu width.', en: 'Browsers refuse lazy loading without width.' },
          { vi: 'Để tăng kích thước file PNG.', en: 'To enlarge PNG files.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Thiếu kích thước khiến khung ảnh cao 0px rồi phình to đột ngột khi tải xong khi user đang cuộn, gây nhảy layout.',
          en: 'Missing dimensions leave a 0px box that pops open mid-scroll once bytes arrive.',
        },
      },
      {
        id: 'q-ilazy-2',
        topicId: 'image-lazy-loading',
        categoryId: 'images',
        question: { vi: 'Thuộc tính `decoding="async"` trên thẻ `<img>` có tác dụng gì?', en: 'What does `decoding="async"` do on an `<img>` element?' },
        options: [
          { vi: 'Cho phép trình duyệt giải mã pixel ảnh ngoài luồng chính (off-main-thread / non-blocking) để không khựng khi đang vẽ DOM/cuộn trang.', en: 'Allows the browser to decode image pixels off the critical rendering path so scrolling and UI stays smooth.' },
          { vi: 'Tự động tải ảnh qua WebSocket.', en: 'Fetches the image via WebSockets.' },
          { vi: 'Bỏ qua thuộc tính alt.', en: 'Ignores alt text.' },
          { vi: 'Nén ảnh thành SVG.', en: 'Converts raster images to SVG.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Giải mã ảnh JPEG/WebP lớn tốn hàng chục ms CPU; `decoding="async"` giữ mượt Main Thread cho tương tác.',
          en: 'Asynchronous decode prevents large photo decompression from blocking main-thread paint.',
        },
      },
    ],
    relatedTopicIds: ['above-the-fold', 'core-web-vitals', 'responsive-images'],
  },

  {
    ...TOPIC_META_MAP['image-alt-text'],
    mentalModel: {
      vi: 'Alt text là giọng đọc kể lại BỨC ẢNH ĐANG NÓI GÌ TRONG NGỮ CẢNH BÀI VIẾT cho người khiếm thị dùng screen reader (và hiện thay thế nếu link ảnh bị gãy). Ảnh chỉ để trang trí thì đặt `alt=""` rỗng để trình đọc bỏ qua im lặng!',
      en: '`alt` communicates an image’s contextual meaning to screen readers and acts as fallback text on broken loads—while purely decorative graphics take an empty `alt=""` so assistive tech skips them cleanly.',
    },
    keyPoints: [
      { vi: 'Ảnh mang thông tin: mô tả súc tích mục đích trong ngữ cảnh (không viết thừa "Hình ảnh của..." hay "Ảnh chụp..." vì trình đọc tự thông báo "Image").', en: 'Informative images: describe purpose concisely without redundant prefixes like "Image of" or "Photo of".' },
      { vi: 'Ảnh trang trí thuần túy (họa tiết nền, đường kẻ, icon cạnh label đã có chữ): BẮT BUỘC đặt `alt=""` (chuỗi rỗng, KHÔNG PHẢI xóa bỏ thuộc tính `alt`!).', en: 'Decorative images: set `alt=""` explicitly—omitting `alt` altogether causes screen readers to read out the raw filename!' },
      { vi: 'Ảnh nút bấm (Icon-only `<button><img .../></button>`): `alt` phải mô tả HÀNH ĐỘNG của nút ("Close dialog", "Search") chứ không mô tả hình dáng icon ("magnifying glass").', en: 'Actionable icon images inside links/buttons describe the ACTION ("Close dialog") rather than appearance ("grey cross").' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: '100% thẻ `<img>` và `<svg role="img">` trong ứng dụng đều phải quyết định rõ `alt="..."` hoặc `alt=""` / `aria-hidden="true"`.', en: 'Every `<img>` needs an intentional `alt` (descriptive text or explicit `alt=""`).' },
      ],
      whenToAvoid: [
        { vi: 'Tránh nhồi nhét hàng loạt từ khóa SEO vào thuộc tính `alt` (keyword stuffing) gây phản cảm cho người dùng khiếm thị và bị công cụ tìm kiếm phạt.', en: 'Never stuff SEO keywords into `alt` text; write natural contextual descriptions.' },
      ],
    },
    pitfalls: [
      { vi: 'Quên luôn thuộc tính `alt` thay vì đặt `alt=""` cho ảnh trang trí -> VoiceOver/NVDA đọc to nguyên đường dẫn `photo_final_v2_88392.jpg`!', en: 'Omitting `alt` instead of setting `alt=""` forces screen readers to announce messy filenames like `hero-8f42a.webp`.' },
    ],
    interviewTips: [
      { vi: 'Phân biệt chính xác 3 trường hợp `alt`: `alt="concise contextual info"`, `alt="action label"` (khi bọc trong link/button), và `alt=""` (decorative — khác hoàn toàn với việc thiếu `alt`!).', en: 'Clearly separate informative `alt`, functional button `alt`, and decorative `alt=""` (never omit `alt`).' },
    ],
    example: {
      title: { vi: 'Kiểm chứng 3 Mẫu Alt Text Chuẩn WCAG (Informative / Action / Decorative)', en: 'WCAG Alt Text Decision Showcase' },
      description: { vi: 'Xem cách trình đọc màn hình (Screen Reader) đọc từng kiểu `alt` khác nhau trên 3 tình huống thực tế.', en: 'Inspect live screen-reader output across informative, functional icon, and decorative `alt=""` examples.' },
      mode: 'html',
      code: `<div class="col">
  <div class="card">
    <strong>1. Informative Image:</strong>
    <pre style="margin:4px 0 0;">&lt;img src="chart.webp" alt="Q3 checkout latency dropped from 420ms to 140ms" /&gt;</pre>
    <div class="muted" style="font-size:12px;">Screen reader announces the key takeaway of the chart.</div>
  </div>
  <div class="card">
    <strong>2. Functional Icon Button:</strong>
    <pre style="margin:4px 0 0;">&lt;button&gt;&lt;img src="trash.svg" alt="Delete comment" /&gt;&lt;/button&gt;</pre>
    <div class="muted" style="font-size:12px;">Describes the action ("Delete comment"), not "red trash can".</div>
  </div>
  <div class="card">
    <strong>3. Decorative Graphic / Adjacent Text:</strong>
    <pre style="margin:4px 0 0;">&lt;button&gt;&lt;img src="save.svg" alt="" /&gt; Save Draft&lt;/button&gt;</pre>
    <div class="muted" style="font-size:12px;">Empty alt="" prevents reading "save icon Save Draft" twice!</div>
  </div>
</div>`,
      tryItPrompt: { vi: 'Thử suy nghĩ với avatar nằm ngay cạnh tên tác giả "Minh Nguyen": ta nên đặt `alt=""` hay `alt="Minh Nguyen avatar"` để không bị lặp chữ?', en: 'Consider an avatar beside the visible text "Minh Nguyen"—using `alt=""` prevents duplicate announcements.' },
    },
    quiz: [
      {
        id: 'q-alt-1',
        topicId: 'image-alt-text',
        categoryId: 'images',
        question: { vi: 'Với một hình ảnh hoàn toàn chỉ để trang trí (decorative border/icon cạnh chữ đã có nhãn rõ), cách đánh dấu nào chuẩn Accessibility?', en: 'How should a purely decorative `<img>` element be marked for Accessibility?' },
        options: [
          { vi: 'Đặt thuộc tính `alt=""` (chuỗi rỗng) để Screen Reader bỏ qua.', en: 'Set an empty `alt=""` attribute so screen readers skip it.' },
          { vi: 'Xóa bỏ hoàn toàn thuộc tính `alt` khỏi thẻ `<img>`.', en: 'Remove the `alt` attribute completely.' },
          { vi: 'Đặt `alt="image decorative graphic"`.', en: 'Set `alt="decorative graphic"`.' },
          { vi: 'Đặt `alt="undefined"`.', en: 'Set `alt="undefined"`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Thiếu `alt` khiến Screen Reader đọc URL tên file ảnh; `alt=""` chủ động đánh dấu ảnh là decorative (presentation).',
          en: 'Omitting `alt` makes AT read the raw image URL; `alt=""` cleanly hides decorative graphics.',
        },
      },
      {
        id: 'q-alt-2',
        topicId: 'image-alt-text',
        categoryId: 'images',
        question: { vi: 'Bên trong một nút bấm chỉ có icon kính lúp (`<button><img src="glass.svg" ... /></button>`), thuộc tính `alt` nên ghi gì?', en: 'Inside an icon-only search button (`<button><img src="glass.svg" ... /></button>`), what should `alt` say?' },
        options: [
          { vi: 'Mô tả hành động của nút (vd `alt="Search"`).', en: 'Describe the button action (e.g., `alt="Search"`).' },
          { vi: 'Mô tả ngoại hình icon (`alt="Blue magnifying glass circle"`).', en: 'Describe the icon appearance (`alt="Blue magnifying glass"`).' },
          { vi: 'Để `alt=""`.', en: 'Leave `alt=""`.' },
          { vi: 'Để tên file `alt="icon_search_24.svg"`.', en: 'Use the filename.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Người dùng cần biết nút này LÀM GÌ ("Search") chứ không cần nghe mô tả màu sắc kính lúp khi không có nhãn text nào khác.',
          en: 'Functional icons convey their action ("Search") since no adjacent visible text provides an accessible name.',
        },
      },
    ],
    relatedTopicIds: ['wai-aria', 'avoid-text-in-images', 'visual-a11y'],
  },

  {
    ...TOPIC_META_MAP['responsive-images'],
    mentalModel: {
      vi: 'Cung cấp thực đơn nhiều cỡ ảnh qua `srcset` + `sizes` để trình duyệt tự tính `width * DPR` và tải đúng file vừa khít màn hình — không lãng phí gửi ảnh desktop 1920px cho điện thoại 390px! Dùng `<picture>` khi cần đổi tỷ lệ cắt ảnh hoàn toàn (Art Direction) giữa mobile và desktop.',
      en: 'Give the browser a menu of image widths (`srcset` + `sizes`) so it downloads exact resolution matches for the user viewport and DPR, and use `<picture>` when mobile vs desktop require different crops (Art Direction).',
    },
    keyPoints: [
      { vi: 'Resolution Switching (`srcset="a-400.webp 400w, a-800.webp 800w, a-1600.webp 1600w"` + `sizes="(max-width: 768px) 100vw, 50vw"`): trình duyệt tự nhân `renderedWidth * window.devicePixelRatio` rồi chọn ứng viên đủ nét mà nhẹ nhất.', en: 'Width descriptors (`400w`, `800w`) + `sizes` let the browser multiply rendered width by DPR and pick the leanest crisp candidate.' },
      { vi: 'Art Direction (`<picture><source media="(max-width: 640px)" srcset="portrait.webp" />...</picture>`): đổi hẳn khung hình ngang (16:9) trên desktop sang khung hình dọc (4:5) tập trung chủ thể trên mobile.', en: 'Art Direction swaps distinct crops or aspect ratios across media queries inside `<picture>`.' },
      { vi: 'Thiếu `sizes`, trình duyệt mặc định giả sử ảnh chiếm `100vw` và tải nhầm ảnh quá khổ cho thumbnail nhỏ!', en: 'Omitting `sizes` defaults to `100vw`, causing browsers to over-fetch huge files for small grid cards.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi ảnh nội dung (hero, product card, blog banner) hiển thị trên nhiều kích thước thiết bị.', en: 'All multi-breakpoint content photography: hero banners, product cards, and editorial media.' },
      ],
      whenToAvoid: [
        { vi: 'Icon SVG vector vốn tự co giãn vô hạn không cần nhiều file kích thước.', en: 'Vector SVG graphics that scale cleanly at any resolution with one single file.' },
      ],
    },
    pitfalls: [
      { vi: 'Viết `sizes="100vw"` cho ảnh nằm trong grid 3 cột desktop -> tải file 2560px cho một ô card chỉ rộng 400px!', en: 'Leaving `sizes="100vw"` on a 3-column card grid over-downloads desktop-wide files for narrow cards.' },
    ],
    interviewTips: [
      { vi: 'Phân biệt chính xác khi nào dùng `<img srcset sizes>` (cùng ảnh, khác độ phân giải) vs khi nào phải dùng `<picture>` (khác tỷ lệ crop/Art Direction hoặc khác định dạng AVIF/WebP).', en: 'Clearly distinguish `<img srcset sizes>` (resolution switching) from `<picture>` (art direction crops or MIME format fallbacks).' },
    ],
    example: {
      title: { vi: 'Thuật toán chọn Candidate của Trình duyệt cho `srcset` + DPR', en: 'Browser `srcset` Candidate Selection Simulator' },
      description: { vi: 'Thử nghiệm công thức tính `requiredPx = slotWidth * dpr` để chọn đúng file ảnh vừa khít nhất.', en: 'Compute `requiredPx = slotWidth * dpr` and watch candidate selection pick the optimal image width.' },
      mode: 'ts',
      code: `interface Candidate { url: string; width: number }

const candidates: Candidate[] = [
  { url: 'card-320.webp', width: 320 },
  { url: 'card-640.webp', width: 640 },
  { url: 'card-960.webp', width: 960 },
  { url: 'card-1440.webp', width: 1440 },
];

function pickCandidate(slotCssPx: number, dpr: number): Candidate {
  const needed = slotCssPx * dpr;
  return candidates.find((c) => c.width >= needed) ?? candidates[candidates.length - 1];
}

console.log('Phone 1x (360px):', pickCandidate(360, 1));
console.log('Phone Retina 2x (360px):', pickCandidate(360, 2));
console.log('Desktop 3-col card 2x (400px):', pickCandidate(400, 2));`,
      tryItPrompt: { vi: 'Mở tab Interactive Lab ("Responsive Images") để kéo thanh trượt Viewport + DPR + Tốc độ mạng và xem số KB tiết kiệm trực quan!', en: 'Switch to the Responsive Images Interactive Lab tab to adjust Viewport, DPR, and network speed interactively.' },
    },
    challenge: {
      id: 'challenge-select-image',
      topicId: 'responsive-images',
      categoryId: 'images',
      title: { vi: 'Cài đặt selectBestImageCandidate (DPR + Network Aware)', en: 'Implement selectBestImageCandidate' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm `selectBestImageCandidate(candidates: Array<{ url: string; width: number }>, context: { slotWidth: number; dpr: number; saveData?: boolean })`. Khi `saveData` = true, chỉ chọn candidate nhỏ nhất >= `slotWidth` (hạ DPR hiệu dụng xuống 1). Khi `saveData` falsy, cần `target = slotWidth * dpr`. Chọn phần tử có `width` nhỏ nhất thỏa mãn `width >= target`; nếu không có cái nào >= target thì trả về candidate lớn nhất (dù mảng đầu vào chưa sắp xếp thứ tự!).',
        en: 'Implement `selectBestImageCandidate(candidates, { slotWidth, dpr, saveData? })`. Target pixel width is `slotWidth * (saveData ? 1 : dpr)`. Return the smallest candidate with `width >= target`, or the largest available candidate if none reach `target` (input array may be unsorted; return null if empty).',
      },
      starterCode: `export interface ImageCandidate {
  url: string;
  width: number;
}

export function selectBestImageCandidate(
  candidates: ImageCandidate[],
  context: { slotWidth: number; dpr: number; saveData?: boolean }
): ImageCandidate | null {
  // TODO: sort candidates by width, compute target pixels, pick smallest >= target else largest
  return null;
}`,
      solutionCode: `export interface ImageCandidate {
  url: string;
  width: number;
}

export function selectBestImageCandidate(
  candidates: ImageCandidate[],
  context: { slotWidth: number; dpr: number; saveData?: boolean }
): ImageCandidate | null {
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) => a.width - b.width);
  const effectiveDpr = context.saveData ? 1 : context.dpr;
  const targetWidth = context.slotWidth * effectiveDpr;

  return sorted.find((c) => c.width >= targetWidth) ?? sorted[sorted.length - 1];
}`,
      testCode: `test('picks smallest candidate meeting DPR target or largest fallback', () => {
  const pool = [
    { url: 'lg.webp', width: 1280 },
    { url: 'sm.webp', width: 400 },
    { url: 'md.webp', width: 800 },
  ];
  expect(selectBestImageCandidate(pool, { slotWidth: 380, dpr: 1 })?.url).toBe('sm.webp');
  expect(selectBestImageCandidate(pool, { slotWidth: 380, dpr: 2 })?.url).toBe('md.webp');
  expect(selectBestImageCandidate(pool, { slotWidth: 380, dpr: 3, saveData: true })?.url).toBe('sm.webp');
  expect(selectBestImageCandidate(pool, { slotWidth: 1000, dpr: 2 })?.url).toBe('lg.webp');
  expect(selectBestImageCandidate([], { slotWidth: 400, dpr: 1 })).toBeNull();
});`,
      hints: [
        { vi: 'Luôn copy và sắp xếp `candidates` tăng dần theo `width` trước khi tìm kiếm.', en: 'Clone and sort candidates ascending by `width` before selecting.' },
        { vi: 'Khi `saveData` là true, đặt `effectiveDpr = 1` rồi tìm phần tử đầu tiên `c.width >= slotWidth * effectiveDpr`.', en: 'Clamp `effectiveDpr = saveData ? 1 : dpr`, then `find` the first candidate meeting `targetWidth`, falling back to `sorted.at(-1)`.' },
      ],
    },
    quiz: [
      {
        id: 'q-rimg-1',
        topicId: 'responsive-images',
        categoryId: 'images',
        question: { vi: 'Khi nào BẮT BUỘC dùng thẻ `<picture>` thay vì chỉ `<img srcset sizes>`?', en: 'When is `<picture>` strictly required instead of plain `<img srcset sizes>`?' },
        options: [
          { vi: 'Khi cần Art Direction (cắt khung hình tỷ lệ khác nhau theo media query) hoặc cung cấp fallback theo MIME type (`image/avif` -> `image/webp`).', en: 'For Art Direction (different crops/aspect ratios per breakpoint) or MIME format fallback (`image/avif` -> `image/webp`).' },
          { vi: 'Khi ảnh là file SVG vector.', en: 'When rendering vector SVGs.' },
          { vi: 'Khi ảnh chỉ có 1 kích thước cố định.', en: 'When only one fixed dimension exists.' },
          { vi: 'Để bật lazy loading.', en: 'To enable lazy loading.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`srcset` chỉ chọn độ phân giải khác nhau của CÙNG một ảnh; `<picture>` bắt buộc trình duyệt dùng đúng `<source>` theo điều kiện `media` hoặc `type`.',
          en: '`srcset` leaves choice to the browser for resolution switching; `<picture>` deterministically switches crops and formats.',
        },
      },
      {
        id: 'q-rimg-2',
        topicId: 'responsive-images',
        categoryId: 'images',
        question: { vi: 'Vai trò của thuộc tính `sizes` đi kèm `srcset="... 400w, ... 800w"` là gì?', en: 'What role does `sizes` play alongside `srcset` width descriptors (`400w`, `800w`)?' },
        options: [
          { vi: 'Báo trước cho HTML Preload Scanner biết ảnh sẽ chiếm rộng bao nhiêu trên layout trước khi CSS kịp tải xong.', en: 'Informs the HTML preload scanner how wide the image renders in layout before CSS completes parsing.' },
          { vi: 'Đặt màu nền cho ảnh.', en: 'Sets image background color.' },
          { vi: 'Nén ảnh trên client.', en: 'Compresses images client-side.' },
          { vi: 'Thay thế thẻ `<title>`.', en: 'Replaces `<title>`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'HTML parser tải ảnh trước khi CSSOM dựng xong, nên nó cần `sizes` để đoán chính xác độ rộng khe ảnh.',
          en: 'Preload scanners run before CSSOM finishes, relying on `sizes` to pick the matching `w` candidate early.',
        },
      },
    ],
    relatedTopicIds: ['image-cdn', 'image-formats', 'image-adaptive-loading'],
  },

  {
    ...TOPIC_META_MAP['image-preload'],
    mentalModel: {
      vi: 'Một số ảnh LCP quan trọng bị giấu sâu trong CSS `background-image: url(...)` hoặc render muộn bởi JS; thêm `<link rel="preload" as="image" imagesrcset="..." imagesizes="..." fetchpriority="high">` vào `<head>` để kéo thẳng lên tải đầu tiên!',
      en: 'Images referenced only in CSS `background-image` or injected late by JS load after CSS/JS finish; `<link rel="preload" as="image" imagesrcset="..." fetchpriority="high">` exposes them immediately to the browser preload scanner.',
    },
    keyPoints: [
      { vi: 'Sử dụng `imagesrcset` và `imagesizes` ngay trên `<link rel="preload" as="image">` để preload ĐÚNG biến thể responsive thay vì tải thừa file sai kích thước!', en: 'Include `imagesrcset` and `imagesizes` on `<link rel="preload" as="image">` so responsive browsers preload only the matching width.' },
      { vi: 'Chỉ preload ảnh LCP trên màn hình đầu tiên — preload 10 ảnh sẽ gây tắc nghẽn băng thông.', en: 'Scope image preloads strictly to the primary above-the-fold LCP hero image.' },
      { vi: 'Đặt `as="image"` chính xác để trình duyệt áp dụng đúng request priority, header `Accept`, và khớp cache khi thẻ `<img>` thực sự gắn vào DOM.', en: 'Always specify `as="image"` so fetch priority, headers, and cache buckets align cleanly.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Ảnh Hero đặt trong CSS `background-image`, trang CSR SPA cần tải ảnh hero song song với JS bundle, hoặc slider slide #1.', en: 'CSS background heroes, CSR SPAs fetching hero art alongside JS, or carousel slide #1.' },
      ],
      whenToAvoid: [
        { vi: 'Ảnh `<img src>` nằm sẵn trong SSR HTML thì chỉ cần `fetchpriority="high"` — tránh lặp vô ích trừ khi cần đẩy sớm hơn CSS.', en: 'SSR-rendered `<img>` tags already visible to the HTML parser often only need `fetchpriority="high"` without extra preload tags.' },
      ],
    },
    pitfalls: [
      { vi: 'Preload file `hero-1920.jpg` nhưng thẻ `<img>` trên mobile lại dùng `hero-640.webp` -> trình duyệt tải cả HAI file và báo lỗi console "preloaded resource was not used within a few seconds"!', en: 'Preloading a mismatched URL without `imagesrcset` wastes bandwidth downloads twice and emits unused-preload warnings.' },
    ],
    interviewTips: [
      { vi: 'Chỉ ra bộ thuộc tính `imagesrcset` + `imagesizes` trong `<link rel="preload" as="image">` — chi tiết chứng tỏ bạn thực sự tối ưu Core Web Vitals ở production!', en: 'Highlighting `imagesrcset` and `imagesizes` on `<link rel="preload" as="image">` signals authentic LCP optimization experience.' },
    ],
    example: {
      title: { vi: 'Demo HTML `<link rel="preload">` kèm `imagesrcset` + `imagesizes`', en: 'Responsive Hero Image Preload Snippet' },
      description: { vi: 'Kiểm tra cấu trúc chuẩn `<head>` cho ảnh LCP responsive để tránh tải sai kích thước hay double download.', en: 'Verify canonical responsive image preload syntax with `imagesrcset`, `imagesizes`, and `fetchpriority="high"`.' },
      mode: 'html',
      code: `<div class="card">
  <strong>Correct Responsive Preload in &lt;head&gt;:</strong>
  <pre style="margin-top:8px;white-space:pre-wrap;">&lt;link
  rel="preload"
  as="image"
  href="/hero-800.webp"
  imagesrcset="/hero-480.webp 480w, /hero-800.webp 800w, /hero-1600.webp 1600w"
  imagesizes="(max-width: 768px) 100vw, 1200px"
  fetchpriority="high"
/&gt;</pre>
  <p class="muted" style="margin:6px 0 0;font-size:12.5px;">
    Notice how omitting <code>imagesrcset</code> would force mobile users to preload the fallback 800px file AND also fetch 480w!
  </p>
</div>`,
      tryItPrompt: { vi: 'Kiểm tra xem nếu bỏ thuộc tính `as="image"` thì trình duyệt sẽ không biết đây là ảnh nên sai priority và cache key!', en: 'Remember: omitting `as="image"` breaks priority assignment and cache key matching.' },
    },
    quiz: [
      {
        id: 'q-ipre-1',
        topicId: 'image-preload',
        categoryId: 'images',
        question: { vi: 'Làm thế nào thẻ `<link rel="preload" as="image">` tải đúng file responsive giống thẻ `<img srcset sizes>` bên dưới trang?', en: 'How do you keep `<link rel="preload" as="image">` aligned with a responsive `<img srcset sizes>` element?' },
        options: [
          { vi: 'Thêm thuộc tính `imagesrcset` và `imagesizes` giống hệt lên thẻ `<link>`.', en: 'Provide matching `imagesrcset` and `imagesizes` attributes on the `<link>` tag.' },
          { vi: 'Tải trước cả 5 file kích thước bằng 5 thẻ `<link>`.', en: 'Add 5 separate preload tags for all sizes.' },
          { vi: 'Bỏ `as="image"`.', en: 'Omit `as="image"`.' },
          { vi: 'Đặt thẻ `<link>` ở cuối `<footer>`.', en: 'Place `<link>` inside `<footer>`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`imagesrcset` + `imagesizes` giúp HTML parser chọn đúng 1 candidate khớp DPR và viewport.',
          en: '`imagesrcset` and `imagesizes` ensure the preloaded candidate matches what `<img>` actually requests.',
        },
      },
      {
        id: 'q-ipre-2',
        topicId: 'image-preload',
        categoryId: 'images',
        question: { vi: 'Điều gì xảy ra nếu bạn gắn `<link rel="preload">` cho một tài nguyên không được sử dụng trong vài giây đầu sau khi load trang?', en: 'What happens if a `<link rel="preload">` resource is never used shortly after page load?' },
        options: [
          { vi: 'Trình duyệt tốn băng thông vô ích cho mạng người dùng, cản trở tài nguyên cần thiết và phát cảnh báo DevTools.', en: 'Wasted bandwidth delays critical resources and triggers browser unused-preload console warnings.' },
          { vi: 'Tài nguyên được tự động nén nhỏ đi.', en: 'The asset auto-compresses.' },
          { vi: 'Tự chuyển thành `prefetch`.', en: 'Auto-converts to `prefetch`.' },
          { vi: 'Không tải về máy.', en: 'Nothing downloads.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`preload` tải ngay ở mức ưu tiên cao; nếu không dùng tới trang hiện tại nghĩa là đang cướp băng thông của LCP thật.',
          en: '`preload` consumes high-priority network budget immediately; unused preloads actively slow down real visible assets.',
        },
      },
    ],
    relatedTopicIds: ['preloading-prefetching', 'above-the-fold', 'responsive-images'],
  },

  {
    ...TOPIC_META_MAP['image-adaptive-loading'],
    mentalModel: {
      vi: 'Một tấm ảnh 100KB hoàn toàn ổn trên Wi-Fi/5G, nhưng trên mạng 2G/3G hay khi người dùng bật Save-Data thì nó tốn tới 3 giây! Hãy tự động hạ chất lượng (`q=50`), giảm kích thước DPR hoặc tắt tải trước carousel tùy theo tốc độ mạng & màn hình.',
      en: 'Adapt image resolution, compression quality, and prefetch aggression dynamically to real-time network speed (`effectiveType`), `Save-Data`, and screen width.',
    },
    keyPoints: [
      { vi: 'Kiểm tra `navigator.connection?.saveData` và `navigator.connection?.effectiveType` (`slow-2g`, `2g`, `3g`, `4g`).', en: 'Inspect `navigator.connection?.saveData` and `effectiveType` (`slow-2g`, `2g`, `3g`, `4g`).' },
      { vi: 'Gợi ý server hỗ trợ HTTP Client Hints (`Save-Data`, `ECT`, `DPR`, `Width`) để CDN tự chọn biến thể ngay trên tầng HTML đầu tiên.', en: 'Optionally opt into HTTP Client Hints (`Save-Data`, `ECT`, `DPR`) so CDNs adapt even before JS runs.' },
      { vi: 'Trên mạng chậm (`2g`/`3g`), có thể hiển thị BlurHash / LQIP (Low-Quality Image Placeholder) rồi cho bấm "Load HD" hoặc hạ quality JPEG/WebP từ 85 xuống 50.', en: 'Use lightweight BlurHash/LQIP placeholders on 2G/3G or scale quality down (q=50 vs q=85) and cap effective DPR at 1x.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Thư viện ảnh lớn, mạng xã hội, trang báo chí có người dùng di động trên các đường truyền yếu.', en: 'Photo-heavy feeds, marketplaces, and news apps serving mixed mobile networks.' },
      ],
      whenToAvoid: [
        { vi: 'Ứng dụng thiết kế đồ họa/chỉnh ảnh chuyên nghiệp nơi người dùng bắt buộc xem từng pixel gốc (nhưng vẫn nên báo kích thước tải!).', en: 'Pro photo/design editors where full fidelity is mandatory (show explicit download sizes instead).' },
      ],
    },
    pitfalls: [
      { vi: 'Thay đổi liên tục URL `src` của ảnh khi mạng vừa đổi nhẹ từ 4g sang 3g làm trình duyệt tải lại toàn bộ ảnh trên trang!', en: 'Re-computing image URLs dynamically on live connection fluctuations triggers double downloads for already-loaded images.' },
    ],
    interviewTips: [
      { vi: 'Nhấn mạnh việc khóa lựa chọn chất lượng lúc mount/tạo `srcSet` ban đầu (không đổi URL ảnh đã tải xong) và kết hợp LQIP/BlurHash làm nền chống giật.', en: 'Lock chosen adaptive quality once per image mount to prevent double-downloading when effectiveType fluctuates mid-session.' },
    ],
    example: {
      title: { vi: 'Tạo Adaptive `srcset` theo Mạng & Kích thước Màn hình', en: 'Network-Adaptive `srcset` Generator' },
      description: { vi: 'Xem URL CDN ảnh thay đổi tham số `q` (quality) và dải kích thước tùy theo mạng 4G vs 2G/Save-Data.', en: 'Generate tailored `srcset` strings scaling quality and max width based on network conditions.' },
      mode: 'ts',
      code: `function buildAdaptiveImage(
  basePath: string,
  opts: { effectiveType: '4g' | '3g' | '2g'; saveData: boolean; maxScreenWidth: number }
) {
  const quality = opts.saveData || opts.effectiveType === '2g' ? 45 : opts.effectiveType === '3g' ? 65 : 85;
  const widthCap = opts.saveData || opts.effectiveType === '2g' ? 640 : Math.min(1920, opts.maxScreenWidth * 2);
  const steps = [320, 480, 640, 960, 1280, 1920].filter((w) => w <= widthCap);

  const srcSet = steps
    .map((w) => \`https://cdn.example\${basePath}?w=\${w}&q=\${quality}&f=webp \${w}w\`)
    .join(', ');

  return { quality, widthCap, srcSet };
}

console.log('4G Desktop:', buildAdaptiveImage('/cover.jpg', { effectiveType: '4g', saveData: false, maxScreenWidth: 1440 }));
console.log('2G Save-Data:', buildAdaptiveImage('/cover.jpg', { effectiveType: '2g', saveData: true, maxScreenWidth: 390 }));`,
      tryItPrompt: { vi: 'Thử chạy hàm với `3g` + `maxScreenWidth: 768` để kiểm tra ngưỡng dải kích thước.', en: 'Test `effectiveType: "3g"` with `maxScreenWidth: 768` and inspect the generated `srcSet`.' },
    },
    challenge: {
      id: 'challenge-generate-srcset',
      topicId: 'image-adaptive-loading',
      categoryId: 'images',
      title: { vi: 'Cài đặt generateSrcSet thích ứng mạng & Save-Data', en: 'Implement Adaptive generateSrcSet' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm `generateSrcSet(path: string, widths: number[], options: { saveData?: boolean; effectiveType?: "4g" | "3g" | "2g" | "slow-2g" })`: sắp xếp `widths` tăng dần; nếu `saveData` = true hoặc `effectiveType` là `"2g"`/`"slow-2g"` -> quality = 50 và loại bỏ các width > 640; nếu `"3g"` -> quality = 70; còn lại quality = 85. Trả về chuỗi `"<path>?w=<w>&q=<q> <w>w"` nối bằng `", "`. (Nếu lọc hết width > 640 mà mảng rỗng, giữ lại width nhỏ nhất ban đầu!).',
        en: 'Implement `generateSrcSet(path, widths, { saveData?, effectiveType? })`: sort `widths` ascending. When `saveData` or `effectiveType` is `"2g"`/`"slow-2g"`, use `q=50` and filter `w <= 640` (fallback to smallest width if all > 640). For `"3g"`, `q=70`; else `q=85`. Join entries as `"<path>?w=<w>&q=<q> <w>w"` separated by `", "`.',
      },
      starterCode: `export function generateSrcSet(
  path: string,
  widths: number[],
  options: { saveData?: boolean; effectiveType?: '4g' | '3g' | '2g' | 'slow-2g' } = {}
): string {
  // TODO: determine quality & capped widths, sort ascending, format srcset string
  return '';
}`,
      solutionCode: `export function generateSrcSet(
  path: string,
  widths: number[],
  options: { saveData?: boolean; effectiveType?: '4g' | '3g' | '2g' | 'slow-2g' } = {}
): string {
  if (widths.length === 0) return '';
  const sorted = [...widths].sort((a, b) => a - b);
  const isSlow = Boolean(options.saveData) || options.effectiveType === '2g' || options.effectiveType === 'slow-2g';
  const quality = isSlow ? 50 : options.effectiveType === '3g' ? 70 : 85;

  let active = isSlow ? sorted.filter((w) => w <= 640) : sorted;
  if (active.length === 0) {
    active = [sorted[0]];
  }

  return active.map((w) => \`\${path}?w=\${w}&q=\${quality} \${w}w\`).join(', ');
}`,
      testCode: `test('generates adaptive srcset strings across network tiers', () => {
  expect(generateSrcSet('/hero.webp', [1280, 400, 800], { effectiveType: '4g' })).toBe(
    '/hero.webp?w=400&q=85 400w, /hero.webp?w=800&q=85 800w, /hero.webp?w=1280&q=85 1280w'
  );
  expect(generateSrcSet('/hero.webp', [400, 800, 1280], { saveData: true })).toBe(
    '/hero.webp?w=400&q=50 400w'
  );
  expect(generateSrcSet('/hero.webp', [900, 1600], { effectiveType: '2g' })).toBe(
    '/hero.webp?w=900&q=50 900w'
  );
  expect(generateSrcSet('/hero.webp', [400, 800], { effectiveType: '3g' })).toBe(
    '/hero.webp?w=400&q=70 400w, /hero.webp?w=800&q=70 800w'
  );
});`,
      hints: [
        { vi: 'Nhớ sắp xếp bản sao `[...widths].sort((a, b) => a - b)` để không làm thay đổi mảng đầu vào.', en: 'Sort a cloned copy `[...widths].sort((a, b) => a - b)`.' },
        { vi: 'Kiểm tra fallback `if (active.length === 0) active = [sorted[0]];` khi mọi kích thước đều vượt 640.', en: 'Guard `active.length === 0` by falling back to `[sorted[0]]`.' },
      ],
    },
    quiz: [
      {
        id: 'q-iadapt-1',
        topicId: 'image-adaptive-loading',
        categoryId: 'images',
        question: { vi: 'Tại sao không nên tự động nâng lại chất lượng các tấm ảnh ĐÃ tải xong giữa phiên khi kết nối nhảy từ 3G lên 4G?', en: 'Why avoid upgrading image `src` URLs of already-loaded images if `effectiveType` switches mid-session from 3G to 4G?' },
        options: [
          { vi: 'Gây tải lại toàn bộ ảnh tốn gấp đôi băng thông và có thể gây chớp nháy hình ảnh trước mắt người dùng.', en: 'It triggers redundant re-downloads of already-rendered images and causes visual flashes.' },
          { vi: 'Vì HTML cấm sửa thuộc tính `src`.', en: 'HTML forbids mutating `src`.' },
          { vi: 'Vì ảnh 4G không hiển thị được trên Safari.', en: 'Safari blocks 4G images.' },
          { vi: 'Để trình duyệt khóa Cache.', en: 'To lock browser cache.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Chỉ nên áp dụng adaptive tier cho các ảnh tải mới hoặc chốt một mức ban đầu ổn định.',
          en: 'Re-fetching already-displayed media wastes the bandwidth adaptive loading tried to save.',
        },
      },
      {
        id: 'q-iadapt-2',
        topicId: 'image-adaptive-loading',
        categoryId: 'images',
        question: { vi: 'Kỹ thuật LQIP / BlurHash giải quyết bài toán UX gì trên kết nối ảnh chậm?', en: 'What UX issue do BlurHash or LQIP placeholders solve on slow networks?' },
        options: [
          { vi: 'Hiển thị tức thì mảng màu mờ nhẹ (<1KB) đúng tỷ lệ ảnh thay vì khung trắng trống trơn trong lúc chờ tải byte ảnh thật.', en: 'Displays a tiny (<1KB) blurred preview inside the reserved box immediately instead of blank empty squares.' },
          { vi: 'Biến ảnh chụp thành file PDF.', en: 'Converts photos to PDF.' },
          { vi: 'Tăng gấp đôi độ phân giải màn hình.', en: 'Doubles screen resolution.' },
          { vi: 'Xóa bỏ cần thiết thẻ alt.', en: 'Eliminates alt text.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Chuỗi BlurHash dài ~25 ký tự giải mã nhanh thành preview mượt ngay lúc HTML render, cải thiện cảm nhận tải trang.',
          en: 'Compact BlurHash strings render warm previews instantly while full assets stream in.',
        },
      },
    ],
    relatedTopicIds: ['perf-adaptive-loading', 'responsive-images', 'image-cdn'],
  },
];
