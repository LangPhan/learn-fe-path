import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const securityTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['https'],
    mentalModel: {
      vi: 'HTTP thuần giống gửi bưu thiếp ai ngồi chung quán cà phê Wi-Fi cũng đọc lén và sửa chữ được. HTTPS bọc toàn bộ lưu lượng bằng mã hóa TLS — bảo đảm **Bí mật** (không ai đọc lén), **Toàn vẹn** (không bị chèn script quảng cáo dọc đường) và **Xác thực** đúng server!',
      en: 'HTTPS wraps HTTP inside TLS encryption, providing confidentiality (anti-snooping), integrity (anti-MITM tampering), and server identity verification—plus unlocking modern Web APIs.',
    },
    keyPoints: [
      { vi: 'Mọi Web API mạnh (Service Workers, WebCrypto, Geolocation, Clipboard, HTTP/2 & HTTP/3) chỉ hoạt động trên Secure Context (`https://`).', en: 'Powerful browser features (Service Workers, WebCrypto, Clipboard, HTTP/2 & HTTP/3) strictly require a secure HTTPS context.' },
      { vi: 'HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`) ép trình duyệt tự nâng cấp mọi link `http://` sang `https://` chống tấn công SSL stripping.', en: 'HSTS (`Strict-Transport-Security`) forces browsers to upgrade HTTP requests locally before sending any insecure packet.' },
      { vi: 'Tuyệt đối không để **Mixed Content** (trang HTTPS gọi ảnh/script/API từ `http://` -> bị trình duyệt chặn đứng active mixed content!).', en: 'Eliminate mixed content (`http://` assets inside `https://` pages) which browsers block or flag insecurely.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: '100% website & API từ trang tĩnh nhỏ tới ứng dụng doanh nghiệp.', en: '100% of production sites, assets, and APIs.' },
      ],
      whenToAvoid: [
        { vi: 'Chỉ cẩn trọng trước khi bật `includeSubDomains; preload` trên HSTS — hãy kiểm tra mọi subdomain cũ đều đã hỗ trợ HTTPS nếu không các subdomain đó sẽ bị khóa truy cập vĩnh viễn trên Chrome!', en: 'Verify every subdomain supports TLS before enabling HSTS `includeSubDomains; preload`, as preload locks HTTP out.' },
      ],
    },
    pitfalls: [
      { vi: 'Cấu hình Cookie đăng nhập nhưng quên cờ `Secure` -> cookie có thể rò rỉ nếu người dùng lỡ chạm vào một request HTTP cũ chưa redirect.', en: 'Omitting the `Secure` attribute on session cookies allows accidental transmission over plain HTTP.' },
    ],
    interviewTips: [
      { vi: 'Nhắc đầy đủ 3 trụ cột TLS (Confidentiality, Integrity, Authentication) + HSTS chống downgrade + Cookie `Secure` + Secure Context APIs (SW, HTTP/2).', en: 'Cite the 3 TLS guarantees, HSTS downgrade protection, `Secure` cookies, and HTTPS-only Secure Context APIs.' },
    ],
    example: {
      title: { vi: 'Kiểm tra Secure Context & Mixed Content Auditor', en: 'HTTPS / HSTS / Mixed Content Auditor' },
      description: { vi: 'Chạy bộ kiểm tra URL tài nguyên trên trang để phát hiện Mixed Content và cấu hình HSTS/Cookie đạt chuẩn.', en: 'Audit page resource URLs and response security flags for Mixed Content and HSTS compliance.' },
      mode: 'ts',
      code: `function auditTransportSecurity(pageProtocol: 'http:' | 'https:', assetUrls: string[], hstsHeader?: string) {
  const issues: string[] = [];
  if (pageProtocol !== 'https:') issues.push('CRITICAL: Page not served over HTTPS');

  for (const url of assetUrls) {
    if (url.startsWith('http://')) {
      issues.push('MIXED_CONTENT: Blocked/insecure HTTP asset -> ' + url);
    }
  }
  if (!hstsHeader || !hstsHeader.includes('max-age=')) {
    issues.push('MISSING_HSTS: Add Strict-Transport-Security header');
  }
  return { secure: issues.length === 0, issues };
}

console.log('Insecure page audit:', auditTransportSecurity('https:', [
  'https://cdn.example/app.js',
  'http://legacy.example/widget.js',
]));
console.log('Hardened page audit:', auditTransportSecurity('https:', ['https://cdn.example/app.js'], 'max-age=31536000; includeSubDomains'));`,
      tryItPrompt: { vi: 'Thử sửa `http://legacy.example/widget.js` thành `https://` và kiểm tra kết quả đạt `secure: true`.', en: 'Upgrade the legacy widget URL to `https://` and watch the audit turn green.' },
    },
    quiz: [
      {
        id: 'q-https-1',
        topicId: 'https',
        categoryId: 'security',
        question: { vi: 'Header `Strict-Transport-Security` (HSTS) bảo vệ người dùng khỏi kiểu tấn công nào?', en: 'What attack does the `Strict-Transport-Security` (HSTS) header defend against?' },
        options: [
          { vi: 'SSL Stripping / Downgrade attacks (ép trình duyệt luôn nối HTTPS trực tiếp thay vì gửi request HTTP đầu tiên qua mạng Wi-Fi công cộng).', en: 'SSL stripping / protocol downgrade attacks on initial visits by forcing local HTTP -> HTTPS upgrades.' },
          { vi: 'Tấn công SQL Injection trong database.', en: 'SQL Injection on the backend database.' },
          { vi: 'Chặn mọi file hình ảnh SVG.', en: 'Blocking SVG files.' },
          { vi: 'Thay đổi màu nền Dark Mode.', en: 'Toggling Dark Mode.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'HSTS khiến trình duyệt nhớ không bao giờ gửi gói tin HTTP không mã hóa tới domain đó nữa trong suốt `max-age`.',
          en: 'HSTS instructs browsers never to initiate plain unencrypted HTTP connections to the host during `max-age`.',
        },
      },
      {
        id: 'q-https-2',
        topicId: 'https',
        categoryId: 'security',
        question: { vi: 'Hiện tượng "Mixed Content" xảy ra khi nào và trình duyệt xử lý thế nào với script HTTP nhúng trong trang HTTPS?', en: 'How do browsers handle an `http://` script loaded inside an `https://` page (Active Mixed Content)?' },
        options: [
          { vi: 'Trình duyệt mặc định CHẶN thực thi script HTTP đó vì kẻ tấn công MITM có thể sửa nội dung script chiếm quyền trang HTTPS.', en: 'Browsers block active HTTP scripts inside HTTPS pages because MITM attackers could tamper with executable JS.' },
          { vi: 'Trình duyệt tự động chạy script nhanh hơn.', en: 'Browsers run the script faster.' },
          { vi: 'Chuyển cả trang web về HTTP.', en: 'Downgrades the whole page to HTTP.' },
          { vi: 'Mã hóa tự động tại máy người dùng.', en: 'Client encrypts the script.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Một file `<script src="http://...">` bị chặn ngay lập tức để bảo toàn tính nguyên vẹn của toàn trang HTTPS.',
          en: 'Active mixed content (`<script>`, `<iframe>`, `fetch`) breaks TLS integrity and is blocked by default.',
        },
      },
    ],
    relatedTopicIds: ['csp', 'csrf', 'cors'],
  },

  {
    ...TOPIC_META_MAP['xss'],
    mentalModel: {
      vi: 'XSS xảy ra khi dữ liệu do người dùng gõ (tên, bình luận, URL `?next=`) vô tình bị trình duyệt thực thi như MÃ JAVASCRIPT THẬT! Quy tắc phòng thủ: luôn mặc định **Auto-Escape** (`textContent`, JSX `{text}`), tuyệt đối cẩn thận với `innerHTML` / `dangerouslySetInnerHTML` (phải sanitize bằng **DOMPurify**) và chặn URL `javascript:...`!',
      en: 'XSS occurs when untrusted user input is interpreted as executable JS. Defend by context-aware escaping (`textContent`/JSX `{expr}`), sanitizing rich HTML strictly via an allowlist sanitizer (DOMPurify), and rejecting `javascript:` URLs.',
    },
    keyPoints: [
      { vi: '3 loại XSS: **Stored** (lưu trong DB như comment), **Reflected** (nằm trong URL param trả lại ngay trên HTML), **DOM-based** (JS client tự lấy `location.search` gán vào `innerHTML`!).', en: '3 types: Stored (persisted comments), Reflected (echoed URL params), and DOM-based (client JS writing untrusted input into sinks like `innerHTML`).' },
      { vi: 'Dùng `textContent` / JSX `{value}` thay vì `innerHTML` / `dangerouslySetInnerHTML` / `document.write()`.', en: 'Prefer `textContent` and JSX interpolation over unsafe sinks (`innerHTML`, `dangerouslySetInnerHTML`, `eval`).' },
      { vi: 'Kiểm tra chặt chẽ `href` / `src` người dùng nhập: chỉ cho phép scheme `https:`, `http:`, `mailto:` — cấm tuyệt đối `javascript:alert(1)` và `data:text/html`!', en: 'Validate user-supplied `href`/`src` links to permit only safe protocols (`https:`, `http:`)—reject `javascript:` URIs.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Escape HTML mặc định mọi nơi; khi bắt buộc render Rich Text / Markdown từ user -> sanitize bằng DOMPurify + kết hợp CSP + HttpOnly Cookies!', en: 'Auto-escape everywhere; when rich HTML is genuinely required, run an allowlist sanitizer (DOMPurify) backed by CSP and HttpOnly cookies.' },
      ],
      whenToAvoid: [
        { vi: 'Tuyệt đối KHÔNG tự viết vài dòng regex `.replace(/<script>/g, "")` để chặn XSS ngoài thực tế — kẻ tấn công dễ dàng qua mặt bằng `<img src=x onerror=...>`, `<svg onload=...>`, hoặc viết hoa `<ScRiPt>`!', en: 'Never roll brittle regex filters in production to sanitize rich HTML—bypassed effortlessly by `<img onerror=...>` or `<svg onload=...>`; use a real HTML parser/allowlist like DOMPurify.' },
      ],
    },
    pitfalls: [
      { vi: 'React tự động escape JSX `{comment}`, NHƯNG vẫn dính XSS nếu bạn truyền `<a href={userWebsite}>` chứa `"javascript:alert(1)"` hoặc dùng `{ dangerouslySetInnerHTML }`!', en: 'React escapes JSX children automatically, yet `<a href={userUrl}>` with `"javascript:..."` or `dangerouslySetInnerHTML` still triggers XSS!' },
    ],
    interviewTips: [
      { vi: 'Nhắc ngay 2 lỗ hổng React dev hay quên dù React đã tự escape JSX: 1) `<a href="javascript:...">`, 2) `dangerouslySetInnerHTML` hoặc nhúng JSON state vào SSR `<script>` quên escape `<` -> `\\u003c`!', en: 'Point out the 2 classic React XSS blind spots: `href="javascript:..."` links and unescaped SSR JSON hydration state.' },
    ],
    example: {
      title: { vi: 'Safe Escaping + URL Protocol Guard Demo (An toàn tuyệt đối)', en: 'Safe HTML Escaping & Protocol Sanitizer' },
      description: { vi: 'Kiểm thử hàm escape HTML và kiểm tra đường dẫn `javascript:` nguy hiểm so với `https://` hợp lệ.', en: 'Test neutralizing HTML/attribute injection strings and filtering dangerous `javascript:` URLs.' },
      mode: 'ts',
      code: `function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeHref(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl, 'https://safe.example');
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return rawUrl;
    }
  } catch {}
  return '#blocked-unsafe-url';
}

console.log('Escaped payload:', escapeHtml('<img src=x onerror="alert(1)">'));
console.log('Evil href:', sanitizeHref('  JaVaScRiPt:alert(document.cookie)'));
console.log('Safe href:', sanitizeHref('https://components.build/docs'));`,
      tryItPrompt: { vi: 'Mở tab Interactive Lab ("Security Sandbox") để thử nghiệm tương tác trực tiếp các vector XSS, CORS, CSP và CSRF!', en: 'Open the Security Sandbox Interactive Lab tab to test XSS escaping, CORS preflight, and CSP rules!' },
    },
    challenge: {
      id: 'challenge-escape-html',
      topicId: 'xss',
      categoryId: 'security',
      title: { vi: 'Cài đặt escapeHtml & safeUrl phòng chống XSS', en: 'Implement escapeHtml & sanitizeSafeUrl' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết cả 2 hàm: 1) `escapeHtml(str: string): string` chuyển 5 ký tự `&`, `<`, `>`, `"`, `\'` thành HTML entities tương ứng (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`); 2) `sanitizeSafeUrl(url: string): string` chỉ cho phép `http:`, `https:`, `mailto:`, hoặc relative path bắt đầu bằng `/` (không phải `//`). Nếu là `javascript:`, `data:`, `vbscript:` (kể cả viết hoa hay có khoảng trắng/ký tự điều khiển ở đầu!) thì trả về `"about:blank"`.',
        en: 'Implement `escapeHtml(str)` (escaping `&`, `<`, `>`, `"`, `\'` to `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`) AND `sanitizeSafeUrl(url)` allowing only `http:`, `https:`, `mailto:`, or safe relative `/` paths (not `//`), returning `"about:blank"` for dangerous schemes like `javascript:` or `data:` regardless of casing or leading whitespace.',
      },
      starterCode: `export function escapeHtml(str: string): string {
  // TODO: escape &, <, >, ", '
  return str;
}

export function sanitizeSafeUrl(url: string): string {
  // TODO: allow only http:, https:, mailto:, or single-slash relative path; else 'about:blank'
  return 'about:blank';
}`,
      solutionCode: `export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeSafeUrl(url: string): string {
  const cleaned = url.replace(/[\\u0000-\\u001F\\u007F]/g, '').trim();
  if (!cleaned) return 'about:blank';
  if (cleaned.startsWith('/') && !cleaned.startsWith('//')) {
    return cleaned;
  }
  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'mailto:') {
      return cleaned;
    }
    return 'about:blank';
  } catch {
    return 'about:blank';
  }
}`,
      testCode: `test('escapes all 5 dangerous HTML characters', () => {
  expect(escapeHtml('<script src="a.js">&\\'test\\'')).toBe(
    '&lt;script src=&quot;a.js&quot;&gt;&amp;&#39;test&#39;'
  );
});

test('blocks javascript:, data:, and protocol-relative bypasses', () => {
  expect(sanitizeSafeUrl('  JaVaScRiPt:alert(1)')).toBe('about:blank');
  expect(sanitizeSafeUrl('java\\nscript:alert(1)')).toBe('about:blank');
  expect(sanitizeSafeUrl('data:text/html,<script>alert(1)</script>')).toBe('about:blank');
  expect(sanitizeSafeUrl('//evil.example/phish')).toBe('about:blank');
  expect(sanitizeSafeUrl('https://docs.example/guide')).toBe('https://docs.example/guide');
  expect(sanitizeSafeUrl('/topics/xss')).toBe('/topics/xss');
});`,
      hints: [
        { vi: 'Loại bỏ ký tự điều khiển (`[\\u0000-\\u001F\\u007F]`) và `.trim()` trước khi phân tích URL để chặn trick `java\\nscript:`.', en: 'Strip ASCII control characters and trim whitespace before checking URL protocol.' },
        { vi: 'Kiểm tra relative path bắt đầu bằng `/` nhưng KHÔNG phải `//` (protocol-relative redirect có thể trỏ sang domain lạ!).', en: 'Allow `/path` while rejecting `//evil.com` protocol-relative URLs.' },
      ],
    },
    quiz: [
      {
        id: 'q-xss-1',
        topicId: 'xss',
        categoryId: 'security',
        question: { vi: 'Dù React tự động escape chuỗi bên trong JSX `{userInput}`, trường hợp nào dưới đây VẪN gây lỗ hổng XSS trong ứng dụng React?', en: 'Even though React escapes `{userInput}` text nodes, which pattern STILL introduces XSS in React?' },
        options: [
          { vi: 'Truyền trực tiếp input vào `<a href={userWebsite}>` khi user nhập `"javascript:alert(document.cookie)"`.', en: 'Rendering `<a href={userWebsite}>` where `userWebsite` equals `"javascript:alert(...)"`.' },
          { vi: 'Render `<p>{comment}</p>`.', en: 'Rendering `<p>{comment}</p>`.' },
          { vi: 'Đặt biến CSS `color: var(--fg)`.', en: 'Using CSS variables.' },
          { vi: 'Dùng `useState` với string.', en: 'Storing strings in `useState`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'React không chặn `javascript:` trong thuộc tính `href` (chỉ cảnh báo ở dev mode), nên bạn phải validate scheme `https:`/`http:` trước khi gắn link.',
          en: 'Unvalidated `href` schemes allow `javascript:` execution on click despite JSX text escaping.',
        },
      },
      {
        id: 'q-xss-2',
        topicId: 'xss',
        categoryId: 'security',
        question: { vi: 'Khi buộc phải hiển thị nội dung HTML định dạng phong phú (từ trình soạn thảo WYSIWYG) trên trình duyệt, giải pháp đúng nhất là gì?', en: 'When you MUST render user-authored rich HTML from a WYSIWYG editor, what is the safest defense?' },
        options: [
          { vi: 'Sanitize bằng thư viện parser allowlist chuẩn như DOMPurify trước khi đưa vào DOM, kết hợp CSP và HttpOnly cookies.', en: 'Sanitize through an allowlist HTML parser like DOMPurify before mounting, paired with CSP and HttpOnly cookies.' },
          { vi: 'Dùng `.replace("<script>", "")` tự viết.', en: 'Strip `<script>` with a simple regex replace.' },
          { vi: 'Đưa trực tiếp vào `innerHTML`.', en: 'Assign directly to `innerHTML`.' },
          { vi: 'Mã hóa Base64.', en: 'Encode as Base64.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'HTML có hàng trăm vector như `<img onerror>`, `<svg onload>`, `style=`; chỉ có HTML AST allowlist sanitizer như DOMPurify mới lọc triệt để.',
          en: 'Only an allowlist DOM parser sanitizer like DOMPurify handles nested malformed tags and event attributes safely.',
        },
      },
    ],
    relatedTopicIds: ['csp', 'https', 'authentication'],
  },

  {
    ...TOPIC_META_MAP['csrf'],
    mentalModel: {
      vi: 'Trình duyệt tự động đính kèm Cookie phiên đăng nhập vào MỌI request gửi tới ngân hàng của bạn — kể cả khi request đó xuất phát ngầm từ một trang web độc hại bạn vừa lỡ bấm vào (`evil.example` gửi form POST tới `bank.example/transfer`)! Phòng thủ bằng `SameSite=Lax/Strict`, Anti-CSRF Token và kiểm tra header `Origin`.',
      en: 'Browsers attach cookies automatically on cross-site requests—letting malicious sites forge state-changing actions (`bank.example/transfer`) while you are logged in. Stop CSRF with `SameSite` cookies, anti-CSRF tokens, and `Origin` header validation.',
    },
    keyPoints: [
      { vi: '`SameSite=Strict`: không bao giờ gửi cookie từ bất kỳ trang lạ nào sang. `SameSite=Lax` (khuyến nghị chung): chặn gửi cookie ở các form POST/iframe chéo trang nhưng vẫn giữ đăng nhập khi bấm link GET thông thường từ Google/Email!', en: '`SameSite=Strict` blocks all cross-site cookies; `SameSite=Lax` blocks forged cross-site POST/subresources while preserving top-level GET link logins.' },
      { vi: 'Anti-CSRF Token (Synchronizer Token hoặc Double Submit Cookie) truyền qua custom header (`X-CSRF-Token`) hoặc hidden form input — trang lạ không thể đọc token đó nhờ Same-Origin Policy!', en: 'CSRF tokens sent in custom headers or hidden inputs leverage Same-Origin Policy so forged origins cannot guess or read the secret.' },
      { vi: 'Kiểm tra header `Origin` / `Referer` và `Sec-Fetch-Site` ở server, và KHÔNG BAO GIỜ thực hiện hành động thay đổi dữ liệu (xóa, chuyển tiền) bằng HTTP GET!', en: 'Validate `Origin` / `Sec-Fetch-Site` headers server-side and never put state-changing mutations on GET endpoints.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi ứng dụng web sử dụng Cookie để xác thực phiên (Session Cookie hoặc HttpOnly JWT Cookie).', en: 'Every web app authenticating requests via browser cookies.' },
      ],
      whenToAvoid: [
        { vi: 'Lưu ý với `SameSite=None; Secure`: bắt buộc dùng nếu widget/SSO của bạn chạy trong cross-site `<iframe>`, và khi đó BẮT BUỘC phải kèm Anti-CSRF token chặt chẽ!', en: 'If cross-site embeds require `SameSite=None; Secure`, enforce strict anti-CSRF tokens and Origin checks.' },
      ],
    },
    pitfalls: [
      { vi: 'Tin rằng `Access-Control-Allow-Origin` (CORS) chống được CSRF! KHÔNG PHẢI — `<form method="POST">` HTML truyền thống hoặc `fetch` simple request KHÔNG cần preflight CORS mà vẫn gửi cookie tới server thực thi mutation!', en: 'Believing CORS alone prevents CSRF! Standard HTML `<form method="POST">` bypasses CORS preflight completely and executes server mutations unless `SameSite`/CSRF tokens stop it.' },
    ],
    interviewTips: [
      { vi: 'Nhấn mạnh ngay điểm chết người này: **CORS KHÔNG CHỐNG ĐƯỢC CSRF** với simple POST requests/HTML forms; phải dùng `SameSite=Lax/Strict` + `X-CSRF-Token` + `Origin` verification!', en: 'State explicitly: CORS does not stop simple `<form>` POST CSRF attacks—you need `SameSite` cookies + CSRF tokens + `Origin` validation.' },
    ],
    example: {
      title: { vi: 'Mô phỏng CSRF Defense Check tại Backend Middleware', en: 'CSRF Defense Guard Simulator' },
      description: { vi: 'Kiểm thử xem một POST request đến từ `evil.example` vs `app.example` bị chặn ở những lớp bảo vệ nào.', en: 'Test simulated cross-site vs same-origin state-changing POST requests against SameSite, Origin, and CSRF token checks.' },
      mode: 'ts',
      code: `interface IncomingRequest {
  method: 'GET' | 'POST';
  origin: string;
  cookieSameSite: 'Strict' | 'Lax' | 'None';
  hasSessionCookie: boolean;
  csrfHeaderToken?: string;
  expectedCsrfToken: string;
}

function evaluateCsrfProtection(req: IncomingRequest) {
  const isCrossOrigin = req.origin !== 'https://app.example';
  const cookieSent = !isCrossOrigin || req.cookieSameSite === 'None';
  if (!cookieSent || !req.hasSessionCookie) {
    return { allowed: false, reason: 'Blocked: SameSite prevented cross-site session cookie transmission' };
  }
  if (req.method !== 'GET' && isCrossOrigin) {
    return { allowed: false, reason: 'Blocked: Mismatched Origin header (' + req.origin + ')' };
  }
  if (req.method !== 'GET' && req.csrfHeaderToken !== req.expectedCsrfToken) {
    return { allowed: false, reason: 'Blocked: Missing or invalid X-CSRF-Token' };
  }
  return { allowed: true, reason: 'Authorized same-origin request with valid CSRF token' };
}

console.log('Evil POST w/ Lax cookie:', evaluateCsrfProtection({
  method: 'POST', origin: 'https://evil.example', cookieSameSite: 'Lax', hasSessionCookie: true, expectedCsrfToken: 'sec-99',
}));
console.log('Valid app POST:', evaluateCsrfProtection({
  method: 'POST', origin: 'https://app.example', cookieSameSite: 'Lax', hasSessionCookie: true, csrfHeaderToken: 'sec-99', expectedCsrfToken: 'sec-99',
}));`,
      tryItPrompt: { vi: 'Thử đặt `cookieSameSite: "None"` cho `evil.example` để thấy lớp kiểm tra `Origin` và `X-CSRF-Token` vẫn chặn đứng cuộc tấn công như thế nào (Defense in Depth)!', en: 'Set `cookieSameSite: "None"` on the attacker request to watch `Origin` and `X-CSRF-Token` layers stop it cleanly.' },
    },
    quiz: [
      {
        id: 'q-csrf-1',
        topicId: 'csrf',
        categoryId: 'security',
        question: { vi: 'Vì sao cấu hình CORS chặt chẽ một mình VẪN KHÔNG ĐỦ để ngăn chặn tấn công CSRF?', en: 'Why does strict CORS configuration alone fail to prevent CSRF attacks?' },
        options: [
          { vi: 'Các "simple requests" như `<form method="POST">` HTML vẫn được trình duyệt gửi thẳng tới server kèm Cookie mà KHÔNG cần chạy preflight OPTIONS trước.', en: 'Simple requests such as HTML `<form method="POST">` fire straight to the server with cookies without triggering a CORS preflight.' },
          { vi: 'CORS chỉ áp dụng cho file CSS.', en: 'CORS only affects CSS.' },
          { vi: 'Trình duyệt tắt CORS trên HTTPS.', en: 'HTTPS disables CORS.' },
          { vi: 'CORS làm mất HttpOnly.', en: 'CORS strips HttpOnly.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'CORS chủ yếu chặn web lạ *đọc* kết quả response về JS, còn việc gửi form thay đổi dữ liệu thì trình duyệt vẫn thực thi nếu thiếu `SameSite` / CSRF token.',
          en: 'CORS restricts cross-origin response *reads*, not blind `<form>` POST side effects; `SameSite` and CSRF tokens stop the forged action itself.',
        },
      },
      {
        id: 'q-csrf-2',
        topicId: 'csrf',
        categoryId: 'security',
        question: { vi: 'Sự khác nhau giữa cookie `SameSite=Strict` và `SameSite=Lax` khi người dùng bấm vào một link từ trang kết quả Google dẫn tới trang web của bạn là gì?', en: 'How do `SameSite=Strict` and `SameSite=Lax` behave when a user clicks an external Google search link to your site?' },
        options: [
          { vi: '`Lax` vẫn gửi cookie ở điều hướng GET cấp cao nhất (giữ nguyên đăng nhập), còn `Strict` không gửi cookie ở lượt nhảy đầu từ ngoài vào.', en: '`Lax` sends the cookie on top-level GET navigations (keeping users signed in), whereas `Strict` omits it on the incoming cross-site hop.' },
          { vi: '`Strict` gửi cookie mọi lúc còn `Lax` chặn hết.', en: '`Strict` always sends cookies and `Lax` blocks all.' },
          { vi: 'Cả hai đều khóa JavaScript đọc cookie.', en: 'Both block JS access like HttpOnly.' },
          { vi: 'Không có sự khác biệt nào.', en: 'No difference exists.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`SameSite=Lax` là mặc định hiện đại cân bằng tuyệt vời giữa bảo vệ CSRF trên POST/iframe và trải nghiệm đăng nhập liền mạch khi bấm link.',
          en: '`SameSite=Lax` protects mutations while preserving seamless UX on external top-level link clicks.',
        },
      },
    ],
    relatedTopicIds: ['cors', 'authentication', 'xss'],
  },

  {
    ...TOPIC_META_MAP['cors'],
    mentalModel: {
      vi: 'Same-Origin Policy (SOP) là hàng rào mặc định của trình duyệt: code JS ở `https://a.example` không được tự ý đọc dữ liệu trả về từ `https://api.b.example` (khác scheme, host hoặc port). **CORS** là giấy phép do chính server `api.b.example` cấp qua HTTP headers (`Access-Control-Allow-Origin`)!',
      en: 'Same-Origin Policy blocks scripts on `a.example` from reading responses from `b.example`. **CORS** is the opt-in HTTP header handshake (`Access-Control-Allow-Origin`) issued by the target server granting cross-origin read permission.',
    },
    keyPoints: [
      { vi: 'Origin = `(scheme, hostname, port)`. Chỉ cần lệch một trong ba (ví dụ `http` vs `https`, hoặc `:3000` vs `:8080`) là khác origin!', en: 'An origin is the tuple `(scheme, host, port)`—changing any part triggers cross-origin enforcement.' },
      { vi: 'Preflight `OPTIONS`: khi gửi non-simple request (method `PUT`/`DELETE`, `Content-Type: application/json`, hoặc custom header `Authorization`), trình duyệt gửi `OPTIONS` hỏi phép trước; server cache kết quả bằng `Access-Control-Max-Age` để tránh hỏi lặp lại.', en: 'Non-simple requests (`Authorization`, `application/json`, `PUT`/`DELETE`) trigger an `OPTIONS` preflight; cache it with `Access-Control-Max-Age`.' },
      { vi: 'Khi dùng Cookies/Credentials (`credentials: "include"`), server CẤM trả `Access-Control-Allow-Origin: *` mà phải trả chính xác Origin hợp lệ trong allowlist kèm `Access-Control-Allow-Credentials: true` và `Vary: Origin`!', en: 'With `credentials: "include"`, wildcard `*` is invalid—echo a verified origin from an allowlist plus `Allow-Credentials: true` and `Vary: Origin`.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Khi Frontend (`app.domain.com`) gọi trực tiếp Backend API ở domain/port khác (`api.domain.com`).', en: 'Separate frontend (`app.example`) and backend (`api.example`) origins or third-party SDK APIs.' },
      ],
      whenToAvoid: [
        { vi: 'Tránh phản chiếu mù quáng mọi `req.headers.origin` vào `Access-Control-Allow-Origin` kèm `Allow-Credentials: true` — lỗ hổng bảo mật chết người cho phép mọi web lạ đọc dữ liệu riêng tư của user!', en: 'NEVER blindly mirror any incoming `Origin` header alongside `Allow-Credentials: true`; always validate against a strict allowlist.' },
      ],
    },
    pitfalls: [
      { vi: 'Quên thêm `Vary: Origin` khi trả `Access-Control-Allow-Origin` động theo whitelist -> CDN cache nhầm header của domain A trả lại cho domain B gây lỗi CORS ngẫu nhiên!', en: 'Forgetting `Vary: Origin` with dynamic allowlists causes CDNs to serve domain A’s cached CORS header to domain B.' },
    ],
    interviewTips: [
      { vi: 'Chủ động nêu cách loại bỏ CORS & Preflight latency hoàn toàn: phục vụ Frontend & API chung 1 origin qua Reverse Proxy / Next.js rewrites (`/api/*`), hoặc tối ưu preflight bằng `Access-Control-Max-Age`!', en: 'Note that routing `/api/*` via a same-origin reverse proxy eliminates CORS complexity and preflight roundtrips altogether.' },
    ],
    example: {
      title: { vi: 'Mô phỏng CORS Preflight & Strict Origin Allowlist', en: 'CORS Allowlist & Preflight Check Simulator' },
      description: { vi: 'Kiểm tra phản hồi CORS server cho simple GET vs credentialed JSON POST từ origin hợp lệ và origin giả mạo.', en: 'Test CORS allowlist matching, wildcard credential restrictions, and OPTIONS preflight rules.' },
      mode: 'ts',
      code: `const ALLOWLIST = new Set(['https://app.example', 'https://staging.app.example']);

function buildCorsHeaders(origin: string, withCredentials: boolean) {
  if (!ALLOWLIST.has(origin)) {
    return { allowed: false, headers: {} };
  }
  return {
    allowed: true,
    headers: {
      // Wildcard '*' is forbidden when credentials=true!
      'Access-Control-Allow-Origin': withCredentials ? origin : origin,
      'Access-Control-Allow-Credentials': String(withCredentials),
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    },
  };
}

console.log('Legit origin w/ creds:', buildCorsHeaders('https://app.example', true));
console.log('Lookalike bypass attempt:', buildCorsHeaders('https://app.example.evil.com', true));`,
      tryItPrompt: { vi: 'Chú ý trường hợp `https://app.example.evil.com` — nếu dùng `.includes("app.example")` thay vì kiểm tra chính xác trong `Set` sẽ dính bẫy bảo mật!', en: 'Notice why `Set.has(origin)` stops substring spoofing like `https://app.example.evil.com`.' },
    },
    challenge: {
      id: 'challenge-validate-cors',
      topicId: 'cors',
      categoryId: 'security',
      title: { vi: 'Cài đặt validateCorsOrigin an toàn (Strict Allowlist)', en: 'Implement Safe validateCorsOrigin' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm `validateCorsOrigin(requestOrigin: string | undefined, allowedOrigins: string[], withCredentials: boolean): { allowed: boolean; allowOriginHeader: string | null; varyOrigin: boolean }`. Quy tắc: Nếu `!requestOrigin` -> không hợp lệ (`allowed: false`). Nếu `allowedOrigins.includes("*")` và `!withCredentials` -> cho phép với `allowOriginHeader: "*"`, `varyOrigin: false`. Nếu `allowedOrigins` khớp CHÍNH XÁC `requestOrigin` (không dùng substring `.includes`!) -> cho phép với `allowOriginHeader: requestOrigin` và `varyOrigin: true`. Ngược lại trả `allowed: false, allowOriginHeader: null, varyOrigin: true`.',
        en: 'Implement `validateCorsOrigin(requestOrigin, allowedOrigins, withCredentials)`. Reject missing origins (`allowed: false`). Allow wildcard `"*"` ONLY when `!withCredentials` (`allowOriginHeader: "*"`, `varyOrigin: false`). Otherwise match `requestOrigin` strictly against `allowedOrigins` (`===`), echoing `requestOrigin` with `varyOrigin: true`, or rejecting if unmatched.',
      },
      starterCode: `export function validateCorsOrigin(
  requestOrigin: string | undefined,
  allowedOrigins: string[],
  withCredentials: boolean
): { allowed: boolean; allowOriginHeader: string | null; varyOrigin: boolean } {
  // TODO: enforce strict origin equality & disallow '*' with credentials
  return { allowed: false, allowOriginHeader: null, varyOrigin: true };
}`,
      solutionCode: `export function validateCorsOrigin(
  requestOrigin: string | undefined,
  allowedOrigins: string[],
  withCredentials: boolean
): { allowed: boolean; allowOriginHeader: string | null; varyOrigin: boolean } {
  if (!requestOrigin) {
    return { allowed: false, allowOriginHeader: null, varyOrigin: false };
  }
  const exactMatch = allowedOrigins.some((o) => o !== '*' && o === requestOrigin);
  if (exactMatch) {
    return { allowed: true, allowOriginHeader: requestOrigin, varyOrigin: true };
  }
  if (allowedOrigins.includes('*') && !withCredentials) {
    return { allowed: true, allowOriginHeader: '*', varyOrigin: false };
  }
  return { allowed: false, allowOriginHeader: null, varyOrigin: true };
}`,
      testCode: `test('validates strict origin allowlists and blocks wildcard with credentials', () => {
  expect(validateCorsOrigin('https://app.example', ['https://app.example'], true)).toEqual({
    allowed: true,
    allowOriginHeader: 'https://app.example',
    varyOrigin: true,
  });
  expect(validateCorsOrigin('https://app.example.evil.com', ['https://app.example'], true)).toEqual({
    allowed: false,
    allowOriginHeader: null,
    varyOrigin: true,
  });
  expect(validateCorsOrigin('https://any.example', ['*'], true)).toEqual({
    allowed: false,
    allowOriginHeader: null,
    varyOrigin: true,
  });
  expect(validateCorsOrigin('https://any.example', ['*'], false)).toEqual({
    allowed: true,
    allowOriginHeader: '*',
    varyOrigin: false,
  });
});`,
      hints: [
        { vi: 'Kiểm tra khớp chính xác `o === requestOrigin` (loại trừ `*`) trước, sau đó mới xét wildcard `*` khi `!withCredentials`.', en: 'Check exact origin equality before checking wildcard `* && !withCredentials`.' },
      ],
    },
    quiz: [
      {
        id: 'q-cors-1',
        topicId: 'cors',
        categoryId: 'security',
        question: { vi: 'Điều gì xảy ra nếu server trả `Access-Control-Allow-Origin: *` cùng `Access-Control-Allow-Credentials: true` khi `fetch(..., { credentials: "include" })`?', en: 'What does the browser do if a server responds with `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Credentials: true`?' },
        options: [
          { vi: 'Trình duyệt từ chối cho JS đọc response vì đặc tả CORS nghiêm cấm dùng wildcard `*` khi đính kèm credentials/cookies.', en: 'The browser rejects the response in JS because wildcard `*` is invalid with credentialed requests.' },
          { vi: 'Chạy bình thường trên mọi domain.', en: 'Succeeds across all origins.' },
          { vi: 'Tự động xóa toàn bộ cookies.', en: 'Wipes all cookies.' },
          { vi: 'Tự chuyển sang WebSockets.', en: 'Switches to WebSockets.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Credentialed CORS yêu cầu ghi rõ chính xác một Origin hợp lệ (đã xác minh theo allowlist) kèm `Vary: Origin`.',
          en: 'Credentialed requests require an explicit verified origin string rather than `*`.',
        },
      },
      {
        id: 'q-cors-2',
        topicId: 'cors',
        categoryId: 'security',
        question: { vi: 'Header phản hồi nào giúp trình duyệt cache kết quả Preflight `OPTIONS` (ví dụ trong 24 giờ) để tránh tốn thêm 1 roundtrip trước mỗi request JSON?', en: 'Which CORS response header caches `OPTIONS` preflight permissions to eliminate extra roundtrips?' },
        options: [
          { vi: 'Access-Control-Max-Age', en: 'Access-Control-Max-Age' },
          { vi: 'Cache-Control-Preflight', en: 'Cache-Control-Preflight' },
          { vi: 'X-Frame-Options', en: 'X-Frame-Options' },
          { vi: 'Strict-Transport-Security', en: 'Strict-Transport-Security' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`Access-Control-Max-Age: 86400` lưu kết quả preflight trong cache của trình duyệt, giảm hẳn độ trễ gọi API cross-origin.',
          en: '`Access-Control-Max-Age` caches preflight results per origin and method/header set.',
        },
      },
    ],
    relatedTopicIds: ['csrf', 'https', 'csp'],
  },

  {
    ...TOPIC_META_MAP['csp'],
    mentalModel: {
      vi: 'Content Security Policy (CSP) là hàng rào phòng thủ lớp hai (Defense-in-Depth): ngay cả khi kẻ xấu lén chèn được `<script>alert(1)</script>` hay `<script src="https://evil.com/steal.js">` qua lỗi XSS, trình duyệt sẽ đối chiếu với bảng luật CSP từ server và TỪ CHỐI thực thi mã không mang đúng `nonce` hoặc nguồn hợp lệ!',
      en: 'CSP is Defense-in-Depth against XSS and data exfiltration: HTTP headers instruct the browser strictly which script nonces, stylesheets, fonts, images, and fetch origins are permitted to execute or connect.',
    },
    keyPoints: [
      { vi: 'Các chỉ thị cốt lõi: `default-src`, `script-src` (chống XSS), `style-src`, `img-src`, `connect-src` (giới hạn đích `fetch`/WebSocket chống gửi trộm dữ liệu!), `frame-ancestors \'none\'` (chống Clickjacking!).', en: 'Key directives: `default-src`, `script-src`, `connect-src` (blocks unauthorized data exfiltration), `img-src`, and `frame-ancestors` (anti-clickjacking).' },
      { vi: 'Dùng `nonce-<random-per-request>` + `\'strict-dynamic\'` thay vì `\'unsafe-inline\'` hay `\'unsafe-eval\'` (vốn vô hiệu hóa sức mạnh chống XSS của CSP!).', en: 'Use per-request cryptographic `nonce-...` + `strict-dynamic` instead of `unsafe-inline` / `unsafe-eval`.' },
      { vi: 'Triển khai an toàn bằng `Content-Security-Policy-Report-Only` trước khi bật chặn cứng để kiểm tra xem có vô tình chặn nhầm script bên thứ ba hợp pháp không.', en: 'Roll out new policies with `Content-Security-Policy-Report-Only` + `report-to` first to catch false positives.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi ứng dụng web production (đặc biệt app đăng nhập, SaaS, fintech, dashboard quản trị).', en: 'Every production web app, especially authenticated SaaS, fintech, and UGC platforms.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng bật thẳng CSP chặn cứng mà chưa test bằng `Report-Only` trên các trang nhúng analytics/payment widget bên thứ ba -> dễ làm gãy nút thanh toán!', en: 'Never enforce strict CSP directly without staging through `Report-Only` telemetry if third-party widgets run.' },
      ],
    },
    pitfalls: [
      { vi: 'Dùng `script-src \'self\' \'unsafe-inline\'` và tưởng rằng CSP đã an toàn -> `\'unsafe-inline\'` cho phép mọi `<script>...</script>` và `onerror=...` chạy tự do!', en: 'Adding `\'unsafe-inline\'` to `script-src` completely defeats XSS protection by allowing injected inline scripts and `onerror` handlers.' },
    ],
    interviewTips: [
      { vi: 'Nêu quy trình triển khai CSP 3 bước chuẩn Senior: 1) Bật `Report-Only` thu log vi phạm, 2) Loại bỏ `unsafe-inline` chuyển sang SSR per-request `nonce` + `\'strict-dynamic\'`, 3) Khoá `object-src \'none\'` và `frame-ancestors \'none\'`.', en: 'Lay out the 3-step rollout: `Report-Only` telemetry -> per-request `nonce` + `strict-dynamic` (no `unsafe-inline`) -> `object-src \'none\'` & `frame-ancestors \'none\'`.' },
    ],
    example: {
      title: { vi: 'Bộ phân tích & Kiểm định Luật Content Security Policy (CSP)', en: 'CSP Directive Policy Evaluator' },
      description: { vi: 'Thử nghiệm kiểm tra một tài nguyên (inline script có/không có nonce, script từ domain lạ, fetch endpoint) trước chính sách CSP.', en: 'Evaluate scripts, images, and fetch targets against a parsed CSP header policy.' },
      mode: 'ts',
      code: `function parseCsp(header: string): Record<string, string[]> {
  const directives: Record<string, string[]> = {};
  for (const part of header.split(';')) {
    const tokens = part.trim().split(/\\s+/).filter(Boolean);
    if (tokens.length > 0) {
      directives[tokens[0].toLowerCase()] = tokens.slice(1);
    }
  }
  return directives;
}

const csp = parseCsp("default-src 'self'; script-src 'self' 'nonce-r4nd0m'; connect-src 'self' https://api.app.example; object-src 'none'");
console.log('Parsed CSP directives:', csp);
console.log('Allows script nonce-r4nd0m?', csp['script-src'].includes("'nonce-r4nd0m'"));
console.log('Allows inline without nonce?', csp['script-src'].includes("'unsafe-inline'"));`,
      tryItPrompt: { vi: 'Mở tab Interactive Lab ("Security Sandbox") để mô phỏng trực tiếp trình kiểm định CSP tương tác!', en: 'Open the Security Sandbox Interactive Lab tab to test CSP directives visually!' },
    },
    challenge: {
      id: 'challenge-evaluate-csp',
      topicId: 'csp',
      categoryId: 'security',
      title: { vi: 'Cài đặt evaluateCspRule kiểm tra quyền tải tài nguyên', en: 'Implement evaluateCspRule' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm `evaluateCspRule(cspHeader: string, directive: "script-src" | "img-src" | "connect-src", target: { origin: string; selfOrigin: string; isInline?: boolean; nonce?: string }): boolean`. Quy tắc: Parse `cspHeader` thành map các directive (phân cách `;`). Lấy list nguồn của `directive`, nếu không có thì fallback sang `default-src` (nếu vẫn không có -> `true`). Nếu list chứa `\'none\'` -> `false`. Nếu `target.isInline` -> cho phép chỉ khi có `\'unsafe-inline\'` hoặc có `\'nonce-<target.nonce>\'`. Nếu không inline -> kiểm tra `*`, hoặc `\'self\'` khớp `selfOrigin`, hoặc `target.origin` có trong list.',
        en: 'Implement `evaluateCspRule(cspHeader, directive, { origin, selfOrigin, isInline?, nonce? }): boolean`. Parse `;`-delimited directives, falling back from `directive` to `default-src` (allowing if neither exists). Reject if `\'none\'` is set. For `isInline`, allow only with `\'unsafe-inline\'` or matching `\'nonce-<nonce>\'`. Otherwise allow `*`, `\'self\'` matching `selfOrigin`, or exact `origin` match.',
      },
      starterCode: `export function evaluateCspRule(
  cspHeader: string,
  directive: 'script-src' | 'img-src' | 'connect-src',
  target: { origin: string; selfOrigin: string; isInline?: boolean; nonce?: string }
): boolean {
  // TODO: parse cspHeader, resolve directive -> default-src fallback, evaluate source rules
  return false;
}`,
      solutionCode: `export function evaluateCspRule(
  cspHeader: string,
  directive: 'script-src' | 'img-src' | 'connect-src',
  target: { origin: string; selfOrigin: string; isInline?: boolean; nonce?: string }
): boolean {
  const directives: Record<string, string[]> = {};
  for (const part of cspHeader.split(';')) {
    const tokens = part.trim().split(/\\s+/).filter(Boolean);
    if (tokens.length > 0) {
      directives[tokens[0].toLowerCase()] = tokens.slice(1);
    }
  }

  const sources = directives[directive] ?? directives['default-src'];
  if (!sources) return true;
  if (sources.includes("'none'")) return false;

  if (target.isInline) {
    if (sources.includes("'unsafe-inline'")) return true;
    if (target.nonce && sources.includes(\`'nonce-\${target.nonce}'\`)) return true;
    return false;
  }

  if (sources.includes('*')) return true;
  if (sources.includes("'self'") && target.origin === target.selfOrigin) return true;
  return sources.includes(target.origin);
}`,
      testCode: `test('enforces nonces, self fallback, none, and origin allowlists', () => {
  const policy = "default-src 'self'; script-src 'self' 'nonce-abc123' https://cdn.example; img-src 'self' data:; connect-src 'none'";
  expect(evaluateCspRule(policy, 'script-src', { origin: 'https://app.example', selfOrigin: 'https://app.example', isInline: true })).toBe(false);
  expect(evaluateCspRule(policy, 'script-src', { origin: 'https://app.example', selfOrigin: 'https://app.example', isInline: true, nonce: 'abc123' })).toBe(true);
  expect(evaluateCspRule(policy, 'script-src', { origin: 'https://evil.example', selfOrigin: 'https://app.example' })).toBe(false);
  expect(evaluateCspRule(policy, 'script-src', { origin: 'https://cdn.example', selfOrigin: 'https://app.example' })).toBe(true);
  expect(evaluateCspRule(policy, 'connect-src', { origin: 'https://app.example', selfOrigin: 'https://app.example' })).toBe(false);
});`,
      hints: [
        { vi: 'Tách từng cặp directive bằng `.split(";")`, cắt token bằng `/\\s+/` (lưu ý token trong CSP bọc nháy đơn như `\'self\'`, `\'none\'`, `\'nonce-xyz\'`).', en: 'Split on `;`, then whitespace, preserving single-quoted keywords like `\'self\'` and `\'none\'`.' },
        { vi: 'Nhớ fallback `directives[directive] ?? directives["default-src"]` nếu directive cụ thể không được khai báo.', en: 'Fall back to `directives["default-src"]` when `directive` is absent.' },
      ],
    },
    quiz: [
      {
        id: 'q-csp-1',
        topicId: 'csp',
        categoryId: 'security',
        question: { vi: 'Chỉ thị CSP nào ngăn trang web lạ nhúng trang của bạn vào trong thẻ `<iframe>` để tấn công Clickjacking?', en: 'Which CSP directive stops malicious external sites from embedding your app inside an `<iframe>` (Clickjacking)?' },
        options: [
          { vi: '`frame-ancestors \'none\'` (hoặc `\'self\'`).', en: '`frame-ancestors \'none\'` (or `\'self\'`).' },
          { vi: '`script-src \'unsafe-inline\'`.', en: '`script-src \'unsafe-inline\'`.' },
          { vi: '`img-src *`.', en: '`img-src *`.' },
          { vi: '`upgrade-insecure-requests`.', en: '`upgrade-insecure-requests`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`frame-ancestors` thay thế header cũ `X-Frame-Options` để khóa danh sách origin được phép nhúng trang của bạn vào frame.',
          en: '`frame-ancestors` is the modern CSP replacement for `X-Frame-Options` against clickjacking.',
        },
      },
      {
        id: 'q-csp-2',
        topicId: 'csp',
        categoryId: 'security',
        question: { vi: 'Cách an toàn nhất để cho phép các thẻ `<script>` nội tuyến hợp lệ của riêng ứng dụng chạy dưới CSP nghiêm ngặt mà không cần bật `\'unsafe-inline\'` là gì?', en: 'How can legitimate inline `<script>` tags run under strict CSP without weakening the policy with `\'unsafe-inline\'`?' },
        options: [
          { vi: 'Sinh một `nonce` ngẫu nhiên mật mã cho mỗi HTTP response, gắn vào cả header `script-src \'nonce-...\'` lẫn thẻ `<script nonce="...">`.', en: 'Generate a per-response cryptographic `nonce`, placing it in both `script-src \'nonce-...\'` and `<script nonce="...">`.' },
          { vi: 'Thêm `\'unsafe-eval\'`.', en: 'Add `\'unsafe-eval\'`.' },
          { vi: 'Dùng `script-src *`.', en: 'Set `script-src *`.' },
          { vi: 'Xóa header CSP khỏi server.', en: 'Remove the CSP header.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Kẻ tấn công XSS không thể đoán được `nonce` ngẫu nhiên sinh mới cho từng request nên script chèn lậu bị chặn tức thì.',
          en: 'Attackers cannot predict per-request cryptographic nonces, blocking injected inline scripts cleanly.',
        },
      },
    ],
    relatedTopicIds: ['xss', 'https', 'cors'],
  },
];
