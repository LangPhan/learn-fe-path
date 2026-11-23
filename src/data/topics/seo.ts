import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const seoTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['title-meta'],
    mentalModel: {
      vi: '`<title>` và `<meta name="description">` chính là tấm biển hiệu của cửa hàng trên trang kết quả Google (SERP), còn `og:*` (Open Graph) & `link rel="canonical"` quyết định cách link trông ra sao khi chia sẻ lên Slack/Facebook và tránh bị Google phạt trùng lặp nội dung.',
      en: '`<title>` and `<meta name="description">` serve as your Google SERP storefront, `<link rel="canonical">` consolidates duplicate URL signals, and Open Graph tags power rich Slack/X link cards.',
    },
    keyPoints: [
      { vi: '`<title>` độc nhất mỗi trang (~50–60 ký tự), đặt từ khóa chính lên trước tên thương hiệu.', en: 'Write unique per-route `<title>` (~50-60 chars) putting page subject before brand name.' },
      { vi: '`<meta name="description">` súc tích (~140–160 ký tự) mô tả giá trị trang; không lặp y nguyên `<title>`.', en: 'Keep `<meta name="description">` crisp (~140-160 chars) complementing rather than duplicating `<title>`.' },
      { vi: '`<link rel="canonical" href="...">` chỉ định URL gốc duy nhất khi có tham số `?utm_source=` hoặc `?sort=price`, cộng thêm `<meta name="robots" content="noindex">` cho trang nội bộ/kết quả lọc phụ.', en: 'Set `<link rel="canonical">` to consolidate query-param URLs and `noindex` thin filter/internal views.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi trang công khai cần tìm kiếm trên Google và chia sẻ link đẹp qua mạng xã hội/tin nhắn.', en: 'Every public landing, article, catalog, or documentation route.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng nhồi chung một `<title>` tĩnh trong SPA `index.html` cho 1000 route khác nhau mà quên cập nhật meta trên Server/SSR!', en: 'Avoid serving identical static `index.html` meta tags across all routes; inject route-specific metadata at SSR/build time.' },
      ],
    },
    pitfalls: [
      { vi: 'Quên thẻ `<meta property="og:image">` hoặc dùng đường dẫn tương đối `/share.jpg` thay vì URL tuyệt đối `https://...` làm Facebook/Slack không hiện ảnh xem trước!', en: 'Using relative paths in `og:image` instead of absolute `https://` URLs breaks social share card thumbnails.' },
    ],
    interviewTips: [
      { vi: 'Nhớ nhắc `canonical` URL giải quyết bài toán trùng lặp URL do `?utm_*`, `/product` vs `/product/`, hoặc các biến thể sắp xếp/lọc.', en: 'Highlight `<link rel="canonical">` to unify equity across tracking params (`?utm_*`), trailing slashes, and sort variants.' },
    ],
    example: {
      title: { vi: 'Kiểm tra Bộ Meta Tags Chuẩn SEO + Open Graph + Canonical', en: 'SEO Head Metadata & Open Graph Markup' },
      description: { vi: 'Xem mẫu thẻ `<head>` đầy đủ để tối ưu cả Google SERP lẫn social preview card.', en: 'Inspect complete `<head>` metadata for SERP visibility, canonical deduplication, and OG sharing.' },
      mode: 'html',
      code: `<div class="card">
  <strong>Complete Per-Route &lt;head&gt; Blueprint</strong>
  <pre style="margin-top:8px;white-space:pre-wrap;">&lt;title&gt;Mechanical Keyboards — KeyLab Store&lt;/title&gt;
&lt;meta name="description" content="Compare hot-swap tactile and linear keyboards shipped with 2-year warranty." /&gt;
&lt;link rel="canonical" href="https://keylab.example/keyboards" /&gt;
&lt;meta property="og:type" content="website" /&gt;
&lt;meta property="og:title" content="Mechanical Keyboards — KeyLab Store" /&gt;
&lt;meta property="og:description" content="Compare tactile and linear boards." /&gt;
&lt;meta property="og:image" content="https://keylab.example/og/keyboards.jpg" /&gt;
&lt;meta name="twitter:card" content="summary_large_image" /&gt;</pre>
</div>`,
      tryItPrompt: { vi: 'Mở tab Interactive Lab ("SEO Preview") để gõ thử title/description và xem trực tiếp Google SERP + thẻ Open Graph theo thời gian thực!', en: 'Open the SEO Preview Interactive Lab tab to edit title/description live and watch SERP + OG cards update!' },
    },
    quiz: [
      {
        id: 'q-meta-1',
        topicId: 'title-meta',
        categoryId: 'seo',
        question: { vi: 'Mục đích chính của thẻ `<link rel="canonical" href="https://shop.example/shoes">` khi URL đang có `?utm_source=fb&sort=asc` là gì?', en: 'Why include `<link rel="canonical">` when URLs carry tracking or sort params like `?utm_source=fb&sort=asc`?' },
        options: [
          { vi: 'Báo công cụ tìm kiếm gom toàn bộ điểm xếp hạng SEO về một URL gốc duy nhất thay vì xem là nhiều trang trùng lặp.', en: 'Tells search engines to consolidate ranking signals onto one authoritative URL instead of indexing duplicate variants.' },
          { vi: 'Chặn người dùng không mở được URL có tham số.', en: 'Blocks users from loading parameterized URLs.' },
          { vi: 'Nén ảnh trang web.', en: 'Compresses page images.' },
          { vi: 'Tạo tự động file sitemap.xml.', en: 'Generates sitemap.xml.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Canonical giúp tránh phân mảnh điểm xếp hạng (duplicate content penalty) giữa hàng loạt URL query giống nhau.',
          en: 'Canonical URLs merge crawl signals across parameterized variations cleanly.',
        },
      },
      {
        id: 'q-meta-2',
        topicId: 'title-meta',
        categoryId: 'seo',
        question: { vi: 'Lỗi nào khiến ảnh xem trước `og:image` thường không hiển thị khi dán link lên Facebook, Slack hoặc X?', en: 'Which mistake commonly prevents `og:image` thumbnails from rendering in Slack, X, or Facebook?' },
        options: [
          { vi: 'Dùng đường dẫn tương đối `/og.jpg` thay vì URL tuyệt đối `https://...`, hoặc render meta tag muộn ở client bằng JS.', en: 'Passing a relative path (`/og.jpg`) instead of an absolute `https://` URL, or injecting meta tags client-side via JS.' },
          { vi: 'Đặt `og:image` ở phía trên `<body>`.', en: 'Placing `og:image` inside `<head>`.' },
          { vi: 'Dùng ảnh kích thước 1200×630.', en: 'Using 1200×630 dimensions.' },
          { vi: 'Có thêm `<title>` trong `<head>`.', en: 'Including `<title>`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Social unfurl bot đa số không chạy JS và bắt buộc URL ảnh phải là đường dẫn tuyệt đối `https://`.',
          en: 'Social link scrapers generally ignore client JS and require absolute HTTPS `og:image` URLs.',
        },
      },
    ],
    relatedTopicIds: ['ssr-ssg-seo', 'json-structured-data', 'sitemap'],
  },

  {
    ...TOPIC_META_MAP['sitemap'],
    mentalModel: {
      vi: 'Nếu website của bạn là một thành phố có 500.000 căn nhà sâu trong ngõ hẻm, `sitemap.xml` là tấm bản đồ liệt kê rõ địa chỉ mọi tuyến đường và ngày sửa đổi gần nhất (`<lastmod>`) để bot Google không bỏ sót trang nào!',
      en: 'An XML Sitemap hands search crawlers a structured index of all canonical URLs and `<lastmod>` timestamps so deep dynamic pages get discovered without relying purely on link hopping.',
    },
    keyPoints: [
      { vi: 'Giới hạn chuẩn giao thức Sitemaps: tối đa **50.000 URL** hoặc **50MB uncompressed** mỗi file `sitemap.xml` — vượt quá phải chia thành `<sitemapindex>` trỏ tới `sitemap-1.xml`, `sitemap-2.xml`.', en: 'Protocol cap: max 50,000 URLs or 50MB per sitemap file; larger sites split via `<sitemapindex>`.' },
      { vi: 'Chỉ đưa các URL chuẩn canonical có status 200 OK (không đưa link 404, redirect 301 hay trang bị gắn `noindex`).', en: 'Include only canonical 200-OK indexable URLs—exclude 404s, redirects, and `noindex` pages.' },
      { vi: 'Khai báo vị trí sitemap ngay bên trong `robots.txt` (`Sitemap: https://domain.example/sitemap.xml`).', en: 'Advertise the sitemap location inside `robots.txt` via `Sitemap: https://...`.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Site có >50 trang, e-commerce nhiều sản phẩm mới liên tục, blog/tài liệu thay đổi thường xuyên.', en: 'Sites with many routes, deep catalog pages, or frequently published articles.' },
      ],
      whenToAvoid: [
        { vi: 'Trang nội bộ sau login (không index công khai) hoặc bỏ các trường vô nghĩa như `<priority>`/`<changefreq>` vốn Google đã bỏ qua nhiều năm nay (tập trung vào `<loc>` và `<lastmod>` chính xác!).', en: 'Keep private/authenticated routes out of sitemaps, and maintain accurate `<lastmod>` dates rather than fake `<priority>` scores.' },
      ],
    },
    pitfalls: [
      { vi: 'Cập nhật `<lastmod>` thành thời điểm hiện tại cho cả 50.000 trang mỗi ngày dù trang không hề sửa -> Google bot mất tin cậy và bỏ qua `<lastmod>` của bạn.', en: 'Bumping `<lastmod>` to today on unchanged pages wastes crawl budget and causes crawlers to ignore timestamps.' },
    ],
    interviewTips: [
      { vi: 'Nêu rõ con số **50.000 URLs / 50MB** và cách tách **Sitemap Index** động kết hợp cache/ISR khi thiết kế site quy mô lớn!', en: 'Cite the 50,000-URL / 50MB protocol cap and shard dynamically with `<sitemapindex>` for large catalogs.' },
    ],
    example: {
      title: { vi: 'Trình tạo XML Sitemap & Sharding Sitemap Index', en: 'XML Sitemap Builder w/ Entity Escaping' },
      description: { vi: 'Sinh chuỗi `sitemap.xml` hợp lệ kèm escape ký tự đặc biệt XML (`&`, `<`, `>`, `"`, `\'`).', en: 'Generate valid XML sitemaps with proper XML entity escaping and `<lastmod>` fields.' },
      mode: 'ts',
      code: `function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemap(entries: Array<{ loc: string; lastmod?: string }>) {
  const urls = entries
    .map((e) => {
      const mod = e.lastmod ? \`<lastmod>\${escapeXml(e.lastmod)}</lastmod>\` : '';
      return \`  <url><loc>\${escapeXml(e.loc)}</loc>\${mod}</url>\`;
    })
    .join('\\n');

  return \`<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n\${urls}\\n</urlset>\`;
}

console.log(
  buildSitemap([
    { loc: 'https://shop.example/', lastmod: '2026-11-20' },
    { loc: 'https://shop.example/search?cat=shoes&size=42', lastmod: '2026-11-22' },
  ])
);`,
      tryItPrompt: { vi: 'Chú ý URL thứ hai có dấu `&` được escape chuẩn xác thành `&amp;` trong XML.', en: 'Observe how `&` inside query strings safely escapes to `&amp;` for valid XML.' },
    },
    challenge: {
      id: 'challenge-generate-sitemap',
      topicId: 'sitemap',
      categoryId: 'seo',
      title: { vi: 'Cài đặt generateSitemapXml & Sitemap Sharding', en: 'Implement generateSitemapXml & Sharding' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm `generateSitemapXml(urls: Array<{ loc: string; lastmod?: string }>): string` tạo tài liệu XML Sitemap chuẩn (`<?xml version="1.0" encoding="UTF-8"?>` và `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`), tự động loại bỏ `loc` trùng lặp (giữ bản đầu tiên) và escape XML cho `&`, `<`, `>`, `"`, `\'`. Nếu có `lastmod` thì xuất thẻ `<lastmod>...</lastmod>`.',
        en: 'Implement `generateSitemapXml(urls: Array<{ loc: string; lastmod?: string }>): string` outputting valid Sitemaps 0.9 XML, deduplicating identical `loc` URLs (keeping the first), escaping XML entities (`&`, `<`, `>`, `"`, `\'`), and emitting `<lastmod>` only when provided.',
      },
      starterCode: `export function generateSitemapXml(
  urls: Array<{ loc: string; lastmod?: string }>
): string {
  // TODO: deduplicate by loc, escape XML special characters, format <urlset>
  return '';
}`,
      solutionCode: `export function generateSitemapXml(
  urls: Array<{ loc: string; lastmod?: string }>
): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const seen = new Set<string>();
  const rows: string[] = [];

  for (const item of urls) {
    if (seen.has(item.loc)) continue;
    seen.add(item.loc);
    const mod = item.lastmod ? \`<lastmod>\${esc(item.lastmod)}</lastmod>\` : '';
    rows.push(\`  <url><loc>\${esc(item.loc)}</loc>\${mod}</url>\`);
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...rows,
    '</urlset>',
  ].join('\\n');
}`,
      testCode: `test('generates deduplicated escaped sitemap XML', () => {
  const xml = generateSitemapXml([
    { loc: 'https://a.example/', lastmod: '2026-11-01' },
    { loc: 'https://a.example/', lastmod: '2026-11-02' },
    { loc: 'https://a.example/p?x=1&y=2' },
  ]);
  expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  expect(xml).toContain('<url><loc>https://a.example/</loc><lastmod>2026-11-01</lastmod></url>');
  expect(xml).not.toContain('2026-11-02');
  expect(xml).toContain('<url><loc>https://a.example/p?x=1&amp;y=2</loc></url>');
});`,
      hints: [
        { vi: 'Dùng `Set<string>` ghi nhớ `item.loc` đã thấy để bỏ qua URL trùng.', en: 'Track seen `loc` strings in a `Set` to skip duplicates.' },
        { vi: 'Escape `&` đầu tiên để tránh escape đè `&lt;`.', en: 'Replace `&` with `&amp;` first before escaping `<`, `>`, `"`, `\'`.' },
      ],
    },
    quiz: [
      {
        id: 'q-smap-1',
        topicId: 'sitemap',
        categoryId: 'seo',
        question: { vi: 'Khi một website thương mại điện tử có 300.000 trang sản phẩm, cách tổ chức Sitemap đúng chuẩn là gì?', en: 'How should an e-commerce site with 300,000 product URLs structure its XML Sitemap?' },
        options: [
          { vi: 'Chia nhỏ thành nhiều file sitemap (tối đa 50.000 URL/file) rồi gom lại trong một `<sitemapindex>`.', en: 'Shard into multiple sitemaps (<= 50,000 URLs each) referenced by a root `<sitemapindex>`.' },
          { vi: 'Nhét cả 300.000 URL vào một file `sitemap.xml` dài 90MB.', en: 'Put all 300,000 URLs into one 90MB `sitemap.xml`.' },
          { vi: 'Chỉ khai báo trang chủ.', en: 'List only the homepage.' },
          { vi: 'Chuyển toàn bộ sang PDF.', en: 'Export URLs as PDF.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Đặc tả Sitemap giới hạn 50.000 URL hoặc 50MB mỗi file; `<sitemapindex>` cho phép tham chiếu nhiều file con gọn gàng.',
          en: 'The Sitemaps specification caps individual files at 50,000 URLs / 50MB, requiring a `<sitemapindex>` beyond that.',
        },
      },
      {
        id: 'q-smap-2',
        topicId: 'sitemap',
        categoryId: 'seo',
        question: { vi: 'Loại URL nào KHÔNG BAO GIỜ nên xuất hiện trong `sitemap.xml`?', en: 'Which URLs should NEVER be included inside `sitemap.xml`?' },
        options: [
          { vi: 'Trang 404, URL redirect 301/302 hoặc các trang có thẻ `noindex` và URL không canonical.', en: '404 pages, redirects, `noindex` routes, and non-canonical duplicate URLs.' },
          { vi: 'Trang chủ và trang danh mục chính.', en: 'Homepage and main category pages.' },
          { vi: 'Bài viết blog mới xuất bản.', en: 'Newly published blog posts.' },
          { vi: 'Trang chi tiết sản phẩm có trạng thái 200 OK.', en: '200-OK product detail pages.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Đưa 404 hoặc `noindex` vào sitemap gây lãng phí Crawl Budget và gửi tín hiệu mâu thuẫn tới crawler.',
          en: 'Listing 404 or `noindex` pages wastes crawl budget and contradicts crawler directives.',
        },
      },
    ],
    relatedTopicIds: ['title-meta', 'ssr-ssg-seo', 'json-structured-data'],
  },

  {
    ...TOPIC_META_MAP['json-structured-data'],
    mentalModel: {
      vi: 'Dù HTML đẹp đến đâu, bot tìm kiếm vẫn có thể đoán nhầm đâu là giá sản phẩm, đâu là điểm đánh giá sao. Nhúng `<script type="application/ld+json">` theo chuẩn `schema.org` giống như đưa chứng minh thư có cấu trúc máy đọc trực tiếp để Google bật Rich Results (giá, sao đánh giá, FAQ, Breadcrumb)!',
      en: 'Embed `<script type="application/ld+json">` using `schema.org` vocabulary so crawlers parse exact Product prices, ratings, breadcrumbs, and events cleanly for Google Rich Results.',
    },
    keyPoints: [
      { vi: 'JSON-LD tách biệt dữ liệu cấu trúc khỏi thẻ HTML hiển thị — dễ sinh từ dữ liệu API ở server hơn hẳn Microdata lồng ghép vào HTML.', en: 'JSON-LD keeps structured schema payloads cleanly decoupled from visual HTML tags.' },
      { vi: 'Các loại phổ biến nhất: `Product` (Offer price/availability + AggregateRating), `Article`, `BreadcrumbList`, `FAQPage`, `Organization`.', en: 'High-impact types: `Product`, `Article`, `BreadcrumbList`, `FAQPage`, and `Organization`.' },
      { vi: 'Mọi thông tin trong JSON-LD PHẢI khớp với nội dung thực tế người dùng nhìn thấy trên trang (không giấu sao đánh giá ảo), và nhớ escape `<` -> `\\u003c` để chống XSS!', en: 'JSON-LD values must match visible on-page content accurately and escape `<` as `\\u003c` inside `<script>` tags.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Sản phẩm e-commerce, công thức nấu ăn, khóa học, sự kiện, bài báo, breadcrumb.', en: 'E-commerce products, articles, recipes, events, courses, and breadcrumbs.' },
      ],
      whenToAvoid: [
        { vi: 'Không chèn schema đánh giá sao cho các trang nội dung không hề có hệ thống review hiển thị trên trang — vi phạm Google Spam Policy.', en: 'Never fabricate ratings or FAQ schema absent from visible page content.' },
      ],
    },
    pitfalls: [
      { vi: 'Bỏ quên escape ký tự `<` trong trường `description` khi xuất `<script type="application/ld+json">` -> mở lỗ hổng XSS trực tiếp!', en: 'Injecting raw user descriptions inside `<script type="application/ld+json">` without escaping `<` creates script-breakout XSS.' },
    ],
    interviewTips: [
      { vi: 'Kết hợp 2 chủ đề một lúc: xuất JSON-LD ở Server Render (SSR/SSG) + escape `<` thành `\\u003c` + kiểm tra bằng Google Rich Results Test.', en: 'Tie JSON-LD to SSR rendering and mention `<` -> `\\u003c` script-tag breakout protection.' },
    ],
    example: {
      title: { vi: 'Sinh Schema.org Product JSON-LD An toàn', en: 'Safe Schema.org Product JSON-LD Builder' },
      description: { vi: 'Tạo payload JSON-LD chuẩn Google Rich Snippets có Offers và AggregateRating.', en: 'Build a valid Schema.org Product JSON-LD payload with Offers and AggregateRating.' },
      mode: 'ts',
      code: `function buildProductSchema(input: {
  name: string;
  price: number;
  currency: string;
  inStock: boolean;
  rating?: { value: number; count: number };
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    offers: {
      '@type': 'Offer',
      price: String(input.price),
      priceCurrency: input.currency,
      availability: input.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };
  if (input.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.rating.value,
      reviewCount: input.rating.count,
    };
  }
  return JSON.stringify(schema, null, 2).replace(/</g, '\\\\u003c');
}

console.log(buildProductSchema({
  name: 'Ergonomic Split Keyboard',
  price: 219,
  currency: 'USD',
  inStock: true,
  rating: { value: 4.8, count: 142 },
}));`,
      tryItPrompt: { vi: 'Mở tab Interactive Lab ("SEO Preview") để kiểm tra JSON-LD trực quan cùng xem trước Google Rich Snippet!', en: 'Open the SEO Preview Interactive Lab tab to see Rich Snippets rendered alongside JSON-LD validation!' },
    },
    challenge: {
      id: 'challenge-product-jsonld',
      topicId: 'json-structured-data',
      categoryId: 'seo',
      title: { vi: 'Cài đặt buildProductJsonLd chuẩn Schema.org & XSS-Safe', en: 'Implement Safe buildProductJsonLd' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm `buildProductJsonLd(product: { name: string; description: string; price: number; currency: string; inStock: boolean }): string` trả về chuỗi `<script type="application/ld+json">...</script>` hợp lệ chuẩn `https://schema.org` với `@type: "Product"`, `offers: { "@type": "Offer", price, priceCurrency, availability }` (`https://schema.org/InStock` hoặc `OutOfStock`), và bắt buộc escape mọi `<` trong JSON thành `\\u003c` để an toàn XSS.',
        en: 'Implement `buildProductJsonLd(product)` returning `<script type="application/ld+json">...</script>` containing valid `schema.org` Product + Offer (`InStock` / `OutOfStock`) JSON with all `<` escaped to `\\u003c`.',
      },
      starterCode: `export function buildProductJsonLd(product: {
  name: string;
  description: string;
  price: number;
  currency: string;
  inStock: boolean;
}): string {
  // TODO: build schema.org Product JSON-LD, escape '<' as '\\u003c', wrap in script tag
  return '';
}`,
      solutionCode: `export function buildProductJsonLd(product: {
  name: string;
  description: string;
  price: number;
  currency: string;
  inStock: boolean;
}): string {
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
  const safeJson = JSON.stringify(payload).replace(/</g, '\\\\u003c');
  return \`<script type="application/ld+json">\${safeJson}</script>\`;
}`,
      testCode: `test('generates valid Schema.org Product JSON-LD and escapes script tags', () => {
  const html = buildProductJsonLd({
    name: 'Pro Mouse',
    description: 'Fast sensor </script><script>alert(1)</script>',
    price: 79.99,
    currency: 'USD',
    inStock: true,
  });
  expect(html).toContain('<script type="application/ld+json">');
  expect(html).not.toContain('</script><script>');
  const inner = html
    .replace('<script type="application/ld+json">', '')
    .replace(/<\\/script>$/, '');
  const parsed = JSON.parse(inner);
  expect(parsed['@type']).toBe('Product');
  expect(parsed.offers.availability).toBe('https://schema.org/InStock');
  expect(parsed.offers.price).toBe(79.99);
});`,
      hints: [
        { vi: 'Tạo object JSON-LD thuần rồi gọi `JSON.stringify(payload).replace(/</g, "\\\\u003c")`.', en: 'Build the schema object first, then stringify and replace `<` with `\\u003c`.' },
        { vi: 'Bọc trong `<script type="application/ld+json">...</script>`.', en: 'Wrap the escaped JSON string inside `<script type="application/ld+json">...</script>`.' },
      ],
    },
    quiz: [
      {
        id: 'q-jsonld-1',
        topicId: 'json-structured-data',
        categoryId: 'seo',
        question: { vi: 'Lợi thế chính của JSON-LD so với Microdata (`itemprop`) khi triển khai Structured Data là gì?', en: 'Why is JSON-LD preferred over inline Microdata (`itemprop`) for SEO structured data?' },
        options: [
          { vi: 'Tách biệt hoàn toàn khỏi cây HTML/CSS hiển thị nên dễ sinh, dễ kiểm thử và bảo trì từ dữ liệu API.', en: 'It stays completely decoupled from visual HTML markup, making generation and maintenance clean.' },
          { vi: 'JSON-LD không cần dùng JavaScript object.', en: 'JSON-LD avoids JSON.' },
          { vi: 'Microdata không chạy trên HTTPS.', en: 'Microdata breaks on HTTPS.' },
          { vi: 'JSON-LD giúp giảm kích thước file PNG.', en: 'JSON-LD shrinks PNGs.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Đặt một khối `<script type="application/ld+json">` riêng biệt giúp sửa UI thoải mái mà không vô tình phá hỏng schema SEO.',
          en: 'UI refactors never accidentally strip schema properties when JSON-LD lives in its own script block.',
        },
      },
      {
        id: 'q-jsonld-2',
        topicId: 'json-structured-data',
        categoryId: 'seo',
        question: { vi: 'Biện pháp bảo mật nào bắt buộc khi đưa dữ liệu sản phẩm/bài viết vào bên trong thẻ `<script type="application/ld+json">`?', en: 'What security sanitization is mandatory when interpolating text into `<script type="application/ld+json">`?' },
        options: [
          { vi: 'Escape ký tự `<` thành `\\u003c` sau `JSON.stringify` để ngăn chuỗi `</script>` thoát khỏi thẻ script.', en: 'Escape `<` to `\\u003c` after `JSON.stringify` so `</script>` inside text cannot break out and trigger XSS.' },
          { vi: 'Chỉ dùng thẻ `<div>` thay cho `<script>`.', en: 'Use `<div>` instead of `<script>`.' },
          { vi: 'Chạy `eval()` lên JSON.', en: 'Call `eval()` on the JSON.' },
          { vi: 'Xóa toàn bộ dấu nháy kép.', en: 'Strip all double quotes.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'HTML parser tìm `</script>` ngay cả bên trong nội dung JSON hợp lệ, nên thoát `<` -> `\\u003c` giữ nguyên tính hợp lệ JSON và chặn XSS.',
          en: '`\\u003c` remains valid JSON string syntax while neutralizing `</script>` HTML parser breakouts.',
        },
      },
    ],
    relatedTopicIds: ['title-meta', 'xss', 'ssr-ssg-seo'],
  },

  {
    ...TOPIC_META_MAP['semantic-markup'],
    mentalModel: {
      vi: 'Thay vì xây cả trang web bằng súp thẻ `<div>` ("div soup"), đặt tên từng vùng theo đúng ý nghĩa của nó: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`, `<time>` — giúp cả công cụ tìm kiếm lẫn trình đọc màn hình hiểu đâu là nội dung chính và đâu là thanh điều hướng phụ!',
      en: 'Replace generic "div soup" with meaningful HTML landmarks (`<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`) so search bots and assistive tech separate core content from boilerplate.',
    },
    keyPoints: [
      { vi: '`<main>` xác định vùng nội dung chính duy nhất của trang (giúp crawler trọng số cao hơn nội dung lặp ở `<nav>`/`<footer>`).', en: '`<main>` highlights primary page content so crawlers distinguish core subject matter from repeated nav/footer chrome.' },
      { vi: '`<article>` đại diện cho thực thể độc lập có thể chia sẻ riêng (bài viết, thẻ sản phẩm, bình luận); `<section>` nhóm chuyên đề có heading riêng.', en: '`<article>` denotes self-contained syndicatable content (post, product card); `<section>` groups thematic headings.' },
      { vi: '`<time datetime="2026-11-23">`, `<a>` cho điều hướng (không dùng `<div onClick>` để crawler theo dõi được `href`!), `<button>` cho hành động.', en: 'Use `<a href>` for crawlable navigation links, `<button>` for actions, and `<time datetime>` for machine-readable dates.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: '100% dự án web — HTML ngữ nghĩa miễn phí hoàn toàn về bundle size mà tăng điểm cả SEO lẫn Accessibility.', en: 'Every web project—zero extra JS bytes with instant SEO and accessibility dividends.' },
      ],
      whenToAvoid: [
        { vi: 'Không lạm dụng `<section>` làm wrapper CSS đơn thuần khi khối đó không mang vai trò ngữ nghĩa riêng (dùng `<div>` cho pure styling layout!).', en: 'Use plain `<div>` purely for CSS layout wrappers when no thematic landmark applies.' },
      ],
    },
    pitfalls: [
      { vi: 'Dùng `<span onClick={() => navigate("/product/1")}>` thay cho `<a href="/product/1">` -> bot tìm kiếm không thể phát hiện và crawl các trang con!', en: 'Implementing navigation cards with `<div onClick>` instead of `<a href>` hides internal links from search crawlers.' },
    ],
    interviewTips: [
      { vi: 'Nhấn mạnh giao điểm giữa SEO và A11y: HTML ngữ nghĩa giúp bot Google nhận diện nội dung chính (`<main>`) + link nội bộ (`<a href>`), đồng thời giúp người khiếm thị nhảy Landmark nhanh!', en: 'Connect SEO and Accessibility: `<main>`, `<article>`, `<nav>`, and real `<a href>` links power both Google link discovery and AT landmarks.' },
    ],
    example: {
      title: { vi: 'So sánh Div Soup vs Semantic Landmark Layout', en: 'Div Soup vs Semantic HTML5 Landmarks' },
      description: { vi: 'Xem khung HTML chuẩn ngữ nghĩa giúp crawler và screen reader phân biệt rạch ròi header, nav, bài viết chính và aside.', en: 'Inspect clean semantic landmark structure using `<header>`, `<nav>`, `<main>`, `<article>`, `<time>`, and `<footer>`.' },
      mode: 'html',
      code: `<div class="card col">
  <header class="row" style="justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:8px;">
    <strong>Blog Brand</strong>
    <nav aria-label="Primary navigation" class="row">
      <a href="#articles">Articles</a>
      <a href="#guides">Guides</a>
    </nav>
  </header>
  <main>
    <article>
      <h2 style="margin:6px 0 4px;">Why Crawlers Prefer Real Links & Landmarks</h2>
      <div class="muted" style="font-size:12px;">Published <time datetime="2026-11-23">Nov 23, 2026</time></div>
      <p style="margin:8px 0 0;">Using <code>&lt;article&gt;</code>, <code>&lt;main&gt;</code>, and real <code>&lt;a href&gt;</code> lets bots parse content hierarchy without guessing.</p>
    </article>
  </main>
  <footer class="muted" style="font-size:12px;border-top:1px solid var(--border);padding-top:8px;">
    © 2026 KeyLab Docs
  </footer>
</div>`,
      tryItPrompt: { vi: 'Thử chú ý thẻ `<time datetime="2026-11-23">` — chuẩn ISO giúp cả crawler và browser đọc ngày chính xác!', en: 'Notice `<time datetime="2026-11-23">` exposes an exact machine-readable ISO timestamp alongside friendly text.' },
    },
    quiz: [
      {
        id: 'q-sem-1',
        topicId: 'semantic-markup',
        categoryId: 'seo',
        question: { vi: 'Tại sao việc dùng `<div onClick={goToProduct}>` thay cho `<a href="/product/1">` làm tổn hại nghiêm trọng SEO?', en: 'Why does `<div onClick={navigate}>` instead of `<a href="/product/1">` seriously hurt SEO?' },
        options: [
          { vi: 'Crawler không kích hoạt click JS trên mọi thẻ div; không có `<a href>` chuẩn thì bot không khám phá được liên kết tới trang con và mất ngữ nghĩa anchor text.', en: 'Search crawlers follow `<a href>` links and anchor text; `div onClick` hides internal links from crawl discovery.' },
          { vi: 'Div không thể hiển thị màu nền.', en: 'Divs cannot render backgrounds.' },
          { vi: 'Google cấm dùng sự kiện onClick.', en: 'Google bans onClick.' },
          { vi: 'Thẻ `<a>` tự động dịch ngôn ngữ.', en: 'Anchor tags auto-translate copy.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Link điều hướng luôn phải là `<a href>` thực thụ (có thể chặn default để SPA router pushState mượt mà mà vẫn giữ `href` cho bot và Cmd+Click mở tab mới!).',
          en: 'Always render real `<a href>` tags for navigation so crawlers, Cmd+Click, and screen readers all work natively.',
        },
      },
      {
        id: 'q-sem-2',
        topicId: 'semantic-markup',
        categoryId: 'seo',
        question: { vi: 'Thẻ HTML nào bao bọc phần nội dung độc lập cốt lõi của trang (phân biệt với sidebar, menu, chân trang)?', en: 'Which semantic landmark wraps the dominant primary content of a page (distinct from repeated nav, sidebars, and footer)?' },
        options: [
          { vi: '`<main>`', en: '`<main>`' },
          { vi: '`<div class="container">`', en: '`<div class="container">`' },
          { vi: '`<span>`', en: '`<span>`' },
          { vi: '`<aside>`', en: '`<aside>`' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Mỗi trang chỉ nên có một `<main>` hiển thị duy nhất chứa trọng tâm nội dung của route đó.',
          en: 'Each document uses a single visible `<main>` landmark wrapping the route’s primary subject.',
        },
      },
    ],
    relatedTopicIds: ['wai-aria', 'seo-heading-hierarchy', 'title-meta'],
  },

  {
    ...TOPIC_META_MAP['seo-heading-hierarchy'],
    mentalModel: {
      vi: 'Bot tìm kiếm đọc dàn ý `<h1>` -> `<h2>` -> `<h3>` giống như mục lục tóm tắt của trang để hiểu từ khóa chính nằm ở đâu và các ý phụ hỗ trợ ra sao.',
      en: 'Search engines inspect your `<h1>` -> `<h2>` -> `<h3>` outline like a structured table of contents to understand topical focus and section subtopics.',
    },
    keyPoints: [
      { vi: 'Đặt **1 thẻ `<h1>` mô tả chính xác chủ đề chính** trang (không bọc logo header trang bằng `<h1>` ở mọi trang!).', en: 'Place ONE descriptive `<h1>` for the page topic—never wrap the repeating site navbar logo in `<h1>` on subpages.' },
      { vi: 'Dùng `<h2>` cho các khối chủ đề chính và `<h3>` cho các ý con bên trong từng `<h2>`.', en: 'Organize main topic sections with `<h2>` and nested subsections with `<h3>`.' },
      { vi: 'Tránh nhét hàng loạt từ khóa vô nghĩa vào `<h1>` hoặc dùng `<h1>` dài cả đoạn văn 5 dòng.', en: 'Keep `<h1>` focused and readable rather than stuffing paragraphs or keyword lists.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Trang chủ, bài viết blog, trang danh mục, trang tài liệu, trang giới thiệu sản phẩm.', en: 'Landing pages, articles, category listings, docs, and product pages.' },
      ],
      whenToAvoid: [
        { vi: 'Không đặt tiêu đề widget phụ ("Tin tức mới", "Đăng ký nhận tin") ở footer ngang hàng cấp `<h2>` nếu dễ làm loãng dàn ý bài viết chính.', en: 'Avoid inflating boilerplate footer headings above primary content hierarchy.' },
      ],
    },
    pitfalls: [
      { vi: 'Để logo thương hiệu trên Navbar là `<h1>` khiến mọi trang con có `<h1>` giống hệt nhau hoặc có tới 2 `<h1>` cạnh tranh tín hiệu!', en: 'Making the navbar logo an `<h1>` puts identical or competing `<h1>` tags across every route.' },
    ],
    interviewTips: [
      { vi: 'Nhắc lại điểm khác biệt tinh tế: Logo ở Navbar dùng `<a>` / `<span>`, còn `<h1>` dành trọn cho tiêu đề chính duy nhất nằm trong `<main>`!', en: 'Always specify: navbar brand logo stays a `<span>`/`<a>`, reserving the lone `<h1>` strictly for `<main>`.' },
    ],
    example: {
      title: { vi: 'Cấu trúc Outline SEO Chuẩn cho Trang Sản Phẩm', en: 'SEO Product Page Heading Outline' },
      description: { vi: 'Kiểm tra cây mục lục `h1 -> h2 -> h3` rõ ràng không bị logo navbar tranh chấp cấp `h1`.', en: 'Inspect a clean product page outline keeping navbar logos non-heading and reserving `h1` for the product title.' },
      mode: 'html',
      code: `<div class="card col">
  <header class="row" style="justify-content:space-between;">
    <a href="#top" style="font-weight:700;">KeyLab (Logo is NOT &lt;h1&gt;)</a>
    <span class="badge">Navbar</span>
  </header>
  <main style="border-top:1px solid var(--border);padding-top:10px;">
    <h1 style="font-size:20px;margin:0 0 8px;">h1: KeyLab Tactile Pro Mechanical Keyboard</h1>
    <h2 style="font-size:16px;margin:10px 0 4px;">h2: Key Specifications</h2>
    <h3 style="font-size:14px;margin:4px 0 0;" class="muted">h3: Switch Force & Acoustics</h3>
    <h2 style="font-size:16px;margin:10px 0 4px;">h2: Customer Reviews</h2>
  </main>
</div>`,
      tryItPrompt: { vi: 'Mở tab Interactive Lab ("SEO Preview") để kiểm tra công cụ phát hiện lỗi nhảy cấp heading tự động!', en: 'Check the SEO Preview Interactive Lab tab to test automatic heading-skip detection!' },
    },
    quiz: [
      {
        id: 'q-seoh-1',
        topicId: 'seo-heading-hierarchy',
        categoryId: 'seo',
        question: { vi: 'Trong phần Header thanh điều hướng lặp lại ở mọi trang, tên/logo website nên dùng thẻ nào?', en: 'Which HTML element should wrap the repeating site brand/logo inside `<header>` across interior pages?' },
        options: [
          { vi: 'Thẻ `<a href="/">` (kèm `<span>` hoặc `<img>`), KHÔNG nên dùng `<h1>` ở navbar trên các trang con.', en: 'An `<a href="/">` (with `<span>` or `<img>`), reserving `<h1>` for the main page subject.' },
          { vi: 'Luôn bọc logo bằng `<h1>`.', en: 'Always wrap the navbar logo in `<h1>`.' },
          { vi: 'Bọc bằng `<h6>`.', en: 'Use `<h6>`.' },
          { vi: 'Bọc bằng `<title>`.', en: 'Use `<title>`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Để `<h1>` cho đúng tiêu đề trang trong `<main>` giúp mỗi URL mang một tín hiệu chủ đề độc nhất và rõ ràng.',
          en: 'Reserving `<h1>` for `<main>` keeps each route’s primary topic unmistakable.',
        },
      },
      {
        id: 'q-seoh-2',
        topicId: 'seo-heading-hierarchy',
        categoryId: 'seo',
        question: { vi: 'Thứ tự thẻ heading hợp lý bên trong phần Specs và Reviews dưới `<main>` sau `<h1>` là gì?', en: 'Under a product page `<h1>`, how should major sections like "Specifications" and "Reviews" and sub-sections be tagged?' },
        options: [
          { vi: 'Mỗi mục lớn là `<h2>`, mục con bên trong là `<h3>`.', en: 'Major sections as `<h2>`, nested subsections inside them as `<h3>`.' },
          { vi: 'Mục lớn là `<h4>`, mục con là `<h2>`.', en: 'Major sections `<h4>`, subsections `<h2>`.' },
          { vi: 'Mọi mục đều đặt là `<h1>`.', en: 'Make every section `<h1>`.' },
          { vi: 'Chỉ dùng thẻ `<p>`.', en: 'Use only `<p>` tags.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Phân tầng `h1 -> h2 -> h3` phản ánh đúng cấu trúc phân cấp thông tin của trang.',
          en: 'Sequential `h1 -> h2 -> h3` expresses clear parent-child content hierarchy.',
        },
      },
    ],
    relatedTopicIds: ['a11y-headings-hierarchy', 'semantic-markup', 'title-meta'],
  },

  {
    ...TOPIC_META_MAP['ssr-ssg-seo'],
    mentalModel: {
      vi: 'Một trang CSR gửi cho Googlebot tờ giấy trắng kèm cục JS nặng buộc bot phải xếp hàng chờ Web Rendering Service (chậm hơn hàng giờ tới hàng ngày mới chạy JS). SSR hoặc SSG gửi ngay tờ báo in đầy đủ chữ nghĩa, meta tags và JSON-LD ngay ở byte HTML đầu tiên!',
      en: 'While client-rendered SPAs force search engines into a secondary JS rendering queue, SSR and SSG deliver full HTML content, canonical links, meta tags, and JSON-LD in the very first HTTP response.',
    },
    keyPoints: [
      { vi: 'Two-Wave Indexing ở Google: Wave 1 đọc HTML ngay lập tức; Wave 2 chạy Headless Chromium render JS khi rảnh (trì hoãn nhiều giờ/ngày và tốn crawl budget). Nhiều bot mạng xã hội (Slack, Discord, LinkedIn, OpenAI/AI crawlers) hoàn toàn KHÔNG chạy JS!', en: 'Social unfurlers, several search bots, and AI scrapers skip client JS execution completely; SSR/SSG guarantees Wave-1 instant indexing.' },
      { vi: 'SSG / ISR phù hợp tuyệt đối cho trang tĩnh/bán tĩnh (tốc độ phản hồi Edge <50ms cực tốt cho crawl budget).', en: 'SSG/ISR offers fastest TTFB from edge CDN, maximizing Google crawl budget.' },
      { vi: 'SSR phù hợp khi URL có hàng triệu trang tìm kiếm/chi tiết cập nhật theo từng phút.', en: 'SSR suits dynamic inventories, search pages, and rapidly updating real-time catalogs.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: '100% website cần traffic tự nhiên từ Google hoặc cần link preview đẹp khi chia sẻ (Blog, Docs, E-Commerce, Landing, Marketplace).', en: 'Every organic-search or share-preview dependent app: blogs, docs, storefronts, and marketplaces.' },
      ],
      whenToAvoid: [
        { vi: 'Web app nội bộ yêu cầu đăng nhập (Admin panel, IDE, Workspace cá nhân) gắn `<meta name="robots" content="noindex">` -> CSR hoàn toàn ổn.', en: 'Authenticated behind-login apps marked `noindex` do not need SSR/SSG for SEO.' },
      ],
    },
    pitfalls: [
      { vi: 'Render HTML từ SSR nhưng lại trả về mã `200 OK` cho trang "Không tìm thấy sản phẩm" (Soft 404) thay vì status `404` thật làm bot tưởng trang rác và index cả triệu URL lỗi!', en: 'Returning HTTP `200 OK` with a "Product Not Found" message creates Soft 404s that waste crawl budget—always emit real `404` status.' },
    ],
    interviewTips: [
      { vi: 'Đề cập "Wave 1 HTML vs Wave 2 JS rendering queue", social/AI bots không chạy JS, và xử lý HTTP `404`/`301` thật ở server (tránh Soft 404)!', en: 'Mention Wave-1 HTML vs Wave-2 JS queues, non-JS social/AI crawlers, and returning true HTTP `404`/`301` codes instead of Soft 404s.' },
    ],
    example: {
      title: { vi: 'So sánh HTML nhận được bởi Search Crawler (CSR vs SSR/SSG)', en: 'Crawler Raw HTML Inspector: CSR vs SSR/SSG' },
      description: { vi: 'Mô phỏng chính xác dữ liệu mà một crawler không chạy JS (curl / Slackbot / Wave 1) nhìn thấy từ server.', en: 'Compare raw Wave-1 HTML visible to non-JS bots across CSR vs SSR/SSG.' },
      mode: 'ts',
      code: `function fetchAsNonJsCrawler(strategy: 'CSR' | 'SSR' | 'SSG') {
  if (strategy === 'CSR') {
    return {
      status: 200,
      ttfbMs: 35,
      rawHtml: '<title>My App</title><div id="root"></div><script src="/bundle.js"></script>',
      extractedTitle: 'My App (generic!)',
      visibleWords: 0,
    };
  }
  return {
    status: 200,
    ttfbMs: strategy === 'SSG' ? 25 : 140,
    rawHtml: '<title>Running Shoes — Store</title><main><h1>Running Shoes</h1><p>Carbon plate...</p></main>',
    extractedTitle: 'Running Shoes — Store',
    visibleWords: 240,
  };
}

console.log('CSR seen by bot:', fetchAsNonJsCrawler('CSR'));
console.log('SSG seen by bot:', fetchAsNonJsCrawler('SSG'));
console.log('SSR seen by bot:', fetchAsNonJsCrawler('SSR'));`,
      tryItPrompt: { vi: 'So sánh trường `visibleWords` và `ttfbMs` giữa CSR (0 chữ ở Wave 1), SSR (đầy đủ chữ), và SSG (vừa đủ chữ vừa nhanh ở CDN)!', en: 'Compare Wave-1 `visibleWords` and `ttfbMs` across CSR, SSR, and SSG.' },
    },
    quiz: [
      {
        id: 'q-ssrs-1',
        topicId: 'ssr-ssg-seo',
        categoryId: 'seo',
        question: { vi: 'Vì sao các crawler mạng xã hội (Slack, Facebook, X) và một số bot vẫn không đọc được dữ liệu của ứng dụng CSR thuần?', en: 'Why do social link preview bots (Slack, Facebook, X) fail on pure client-rendered CSR apps?' },
        options: [
          { vi: 'Phần lớn các bot này chỉ tải chuỗi HTML gốc ở HTTP response đầu tiên mà KHÔNG thực thi file JavaScript bundle.', en: 'Most social/preview crawlers parse only initial HTTP HTML and do not run client-side JavaScript bundles.' },
          { vi: 'Chúng không hỗ trợ HTTPS.', en: 'They lack HTTPS.' },
          { vi: 'CSR không có địa chỉ IP.', en: 'CSR lacks IP addresses.' },
          { vi: 'CSS ngăn bot đọc text.', en: 'CSS hides text from bots.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Chỉ khi server trả sẵn HTML + meta tags (SSR/SSG/ISR hoặc Edge render) ở response đầu, mọi bot đều đọc được ngay lập tức.',
          en: 'Pre-rendered SSR/SSG HTML ensures every crawler and social bot reads full metadata on the first byte response.',
        },
      },
      {
        id: 'q-ssrs-2',
        topicId: 'ssr-ssg-seo',
        categoryId: 'seo',
        question: { vi: 'Hiện tượng "Soft 404" xảy ra khi nào trên ứng dụng SSR/SPA và gây hại gì cho SEO?', en: 'What is a "Soft 404" in SSR/SPA apps and why does it harm SEO?' },
        options: [
          { vi: 'Trang hiển thị thông báo "Không tìm thấy bài viết" nhưng server lại trả HTTP Status `200 OK` thay vì `404 Not Found`, khiến bot vẫn cố index và lãng phí crawl budget.', en: 'Rendering a "Not Found" UI while returning HTTP `200 OK` instead of `404`, causing search engines to waste crawl budget indexing dead pages.' },
          { vi: 'Server trả về lỗi `500` khi hết pin.', en: 'Server returning `500`.' },
          { vi: 'Ảnh tải bị mờ.', en: 'Blurry images.' },
          { vi: 'Font chữ tải chậm hơn 4 giây.', en: 'Slow web font load.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Khi slug không tồn tại, luôn đặt HTTP status `404` thực sự trên response từ server SSR.',
          en: 'Always emit an authentic HTTP `404` status on missing resource routes during SSR.',
        },
      },
    ],
    relatedTopicIds: ['ssr', 'isr', 'title-meta'],
  },
];
