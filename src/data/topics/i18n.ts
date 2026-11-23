import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const i18nTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['html-lang-hreflang'],
    mentalModel: {
      vi: '`<html lang="vi">` báo cho Trình đọc màn hình phát âm đúng giọng tiếng Việt (không đọc giọng tiếng Anh méo chữ!), trình dịch tự động và luật hyphenation CSS; còn `<link rel="alternate" hreflang="...">` nối các bản dịch của cùng một trang để Google trả đúng phiên bản ngôn ngữ/quốc gia cho người tìm kiếm!',
      en: '`<html lang="vi">` instructs screen readers on voice pronunciation, hyphenation, and browser translation, while `<link rel="alternate" hreflang="...">` maps localized equivalents across countries/languages for search engines.',
    },
    keyPoints: [
      { vi: 'Dùng mã BCP 47 chuẩn trên `<html lang="vi">` hoặc `<html lang="en-US">`, và gắn `lang="..."` cục bộ lên đoạn quote ngoại ngữ giữa trang.', en: 'Set valid BCP 47 tags on `<html>` (`vi`, `en-US`, `ar-SA`) and override `lang` on inline foreign-language quotes.' },
      { vi: 'Cặp thẻ `hreflang` PHẢI có tính **đối xứng hai chiều (bidirectional)** và luôn có thẻ tự trỏ chính mình (`self-referencing`) cộng thêm `hreflang="x-default"` cho màn hình chọn vùng mặc định!', en: '`hreflang` links must be bidirectional/reciprocal, include a self-referencing link, and specify `x-default` for unmatched regions.' },
      { vi: 'Khi chuyển ngôn ngữ ở SPA trên client, nhớ cập nhật `document.documentElement.lang = nextLocale` và `document.documentElement.dir = isRtl ? "rtl" : "ltr"`.', en: 'In client-side locale switchers, always sync `document.documentElement.lang` and `dir` immediately.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: '100% website: luôn có `<html lang>`; thêm `hreflang` ngay khi phục vụ >= 2 ngôn ngữ hoặc nhiều thị trường (`en-US`, `en-GB`, `vi-VN`).', en: 'Every web page sets `<html lang>`; add `hreflang` maps whenever serving localized or regional URL variants.' },
      ],
      whenToAvoid: [
        { vi: 'Không tự động ép redirect 302 theo IP làm bot Googlebot (thường crawl từ IP Mỹ!) không bao giờ truy cập được trang `/vi` hoặc `/ja` — hãy để URL tách biệt (`/vi/...`, `/en/...`) kèm banner gợi ý chuyển ngôn ngữ!', en: 'Avoid forced IP redirects that trap search bots (often crawling from US IPs) away from `/vi` or `/ja` routes; serve dedicated URLs + subtle locale switcher.' },
      ],
    },
    pitfalls: [
      { vi: 'Quên link đối xứng: trang `/en` có trỏ `hreflang="vi"` tới `/vi`, nhưng `/vi` lại không trỏ ngược về `/en` -> Google bỏ qua toàn bộ cặp `hreflang`!', en: 'Missing return links (`en -> vi` without `vi -> en`) causes search engines to ignore the entire `hreflang` cluster.' },
    ],
    interviewTips: [
      { vi: 'Nêu rõ kiến thức thực chiến: URL strategy (`/vi/` vs subdomain vs query param), cặp `hreflang` đối xứng + `x-default`, và KHÔNG ép IP redirect cứng chặn crawler!', en: 'Cover URL routing (`/vi/` paths), reciprocal `hreflang` + `x-default`, and avoiding hard Geo-IP redirects.' },
    ],
    example: {
      title: { vi: 'Demo HTML `<html lang>` + `hreflang` Cluster + Inline `lang`', en: 'BCP 47 `<html lang>` & Reciprocal `hreflang` Blueprint' },
      description: { vi: 'Kiểm tra cấu trúc thẻ `<head>` đa ngôn ngữ đầy đủ `self`, `alternate`, `x-default` và đoạn quote dùng `lang="fr"`.', en: 'Inspect canonical multilingual `<head>` hreflang annotations and inline foreign-language `lang` attributes.' },
      mode: 'html',
      code: `<div class="card col">
  <strong>1. Reciprocal &lt;link rel="alternate" hreflang&gt; in &lt;head&gt;:</strong>
  <pre style="margin:0;white-space:pre-wrap;">&lt;html lang="vi" dir="ltr"&gt;
&lt;link rel="alternate" hreflang="vi" href="https://docs.example/vi/guides" /&gt;
&lt;link rel="alternate" hreflang="en" href="https://docs.example/en/guides" /&gt;
&lt;link rel="alternate" hreflang="ar" href="https://docs.example/ar/guides" /&gt;
&lt;link rel="alternate" hreflang="x-default" href="https://docs.example/en/guides" /&gt;</pre>
  <div style="border-top:1px solid var(--border);padding-top:8px;">
    <strong>2. Inline lang switch for Screen Readers:</strong>
    <p style="margin:4px 0 0;">Trong hệ thống thiết kế, triết lý <em lang="fr">"l'art pour l'art"</em> luôn nhường chỗ cho trải nghiệm thực tế.</p>
  </div>
</div>`,
      tryItPrompt: { vi: 'Thử mở tab Interactive Lab ("i18n Playground") để đổi qua lại LTR/RTL, Locale Intl formatting và gõ IME!', en: 'Check the i18n Playground Interactive Lab tab to test LTR/RTL, Intl formats, and IME events!' },
    },
    quiz: [
      {
        id: 'q-lang-1',
        topicId: 'html-lang-hreflang',
        categoryId: 'i18n',
        question: { vi: 'Vì sao thuộc tính `<html lang="...">` rất quan trọng đối với Accessibility (Screen Reader)?', en: 'Why does `<html lang="...">` matter critically for Screen Reader Accessibility?' },
        options: [
          { vi: 'Giúp trình đọc màn hình chọn đúng bộ phát âm và quy tắc ngôn ngữ (ví dụ giọng Tiếng Việt thay vì đọc tiếng Việt theo giọng Anh).', en: 'Screen readers use `lang` to switch pronunciation profiles and speech synthesis rules accurately.' },
          { vi: 'Tự động dịch toàn bộ văn bản sang 100 thứ tiếng.', en: 'Translates page text automatically.' },
          { vi: 'Kích hoạt CSS Grid.', en: 'Enables CSS Grid.' },
          { vi: 'Bật chế độ Dark Mode.', en: 'Enables Dark Mode.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Nếu trang tiếng Việt để mặc định `lang="en"`, trình đọc màn hình sẽ đọc méo âm không thể nghe hiểu nổi.',
          en: 'A mismatched `lang` attribute causes screen readers to pronounce copy using the wrong phonetic engine.',
        },
      },
      {
        id: 'q-lang-2',
        topicId: 'html-lang-hreflang',
        categoryId: 'i18n',
        question: { vi: 'Yêu cầu bắt buộc của thẻ `hreflang` để Google Search công nhận là hợp lệ là gì?', en: 'What structural requirement must `hreflang` annotations satisfy for Google to honor them?' },
        options: [
          { vi: 'Mỗi trang phải liệt kê chính nó (self-reference) và có liên kết đối xứng qua lại giữa tất cả các phiên bản ngôn ngữ (kèm `x-default`).', en: 'Annotations must be reciprocal across all localized pairs, include a self-referencing tag, and specify `x-default`.' },
          { vi: 'Chỉ cần đặt `hreflang` trên trang tiếng Anh.', en: 'Place `hreflang` solely on the English page.' },
          { vi: 'Đặt ở cuối thẻ `<footer>`.', en: 'Place inside `<footer>`.' },
          { vi: 'Gộp mọi ngôn ngữ vào chung 1 URL.', en: 'Serve all languages at one URL.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Thiếu liên kết đối xứng (bidirectional confirmation) làm Google bỏ qua thẻ `hreflang` nhằm chống một site tự nhận là bản dịch của site khác.',
          en: 'Bidirectional links confirm ownership and prevent third-party spoofing.',
        },
      },
    ],
    relatedTopicIds: ['rtl', 'sitemap', 'wai-aria'],
  },

  {
    ...TOPIC_META_MAP['rtl'],
    mentalModel: {
      vi: 'Với người đọc tiếng Ả Rập hoặc Do Thái (`dir="rtl"`), toàn bộ luồng đọc đảo ngược từ phải sang trái! Nếu bạn viết `margin-left: 16px` hoặc `text-align: left`, giao diện RTL sẽ vỡ vụn; thay bằng CSS Logical Properties (`margin-inline-start`, `padding-inline-end`, `text-align: start`, `inset-inline-start`) thì trình duyệt TỰ LẬT ĐỐI XỨNG 100% chỉ với `dir="rtl"`!',
      en: 'Right-to-left locales (`ar`, `he`, `fa`) flip reading flow horizontally. Replace physical CSS (`margin-left`, `left`, `text-align: left`) with CSS Logical Properties (`margin-inline-start`, `inset-inline-start`, `text-align: start`) so `dir="rtl"` mirrors layouts automatically!',
    },
    keyPoints: [
      { vi: 'CSS Logical Properties: `margin-inline-start` (`ms-*` trong Tailwind), `padding-inline-end` (`pe-*`), `border-inline-start` (`border-s-*`), `inset-inline-start` (`start-*`), `text-start` / `text-end`.', en: 'CSS Logical Properties (`margin-inline-start` / Tailwind `ms-*`, `pe-*`, `start-*`, `text-start`) mirror seamlessly in RTL.' },
      { vi: 'Icon mũi tên định hướng (Next/Back/Chevron, icon danh sách có lề) cần lật đối xứng trong RTL (`rtl:rotate-180` hoặc `rtl:-scale-x-100`), NHƯNG KHÔNG lật icon đồng hồ, nút Play nhạc, hay icon dấu tick (vì chiều kim đồng hồ và dấu tick vẫn giữ nguyên hướng)!', en: 'Mirror directional icons (arrows, chevrons, back buttons) via `rtl:scale-x-[-1]`, while preserving non-directional icons (clocks, play triangles, checkmarks).' },
      { vi: 'Dữ liệu hai chiều (Bidi text — số điện thoại hoặc tên tiếng Anh nằm giữa câu tiếng Ả Rập): dùng thẻ `<bdi>` hoặc CSS `unicode-bidi: isolate` và giữ `dir="ltr"` cho số điện thoại/URL/code block!', en: 'Wrap embedded usernames/numbers in `<bdi>` and force `dir="ltr"` on phone numbers, URLs, and code blocks.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Ngay từ ngày đầu xây Design System bằng Tailwind (`ms-3`, `ps-4`, `text-start`, `end-2`) — chi phí bằng 0 mà sẵn sàng cho thị trường RTL toàn cầu!', en: 'Always write CSS Logical Properties (`ms-*`, `pe-*`, `text-start`) from day one—zero runtime cost and instant RTL readiness.' },
      ],
      whenToAvoid: [
        { vi: 'Không xoay ngược video player progress bar từ phải sang trái nếu thanh play chuẩn vẫn giữ LTR (`dir="ltr"` cho audio/video scrubber và code editors!).', en: 'Keep code editors, URLs, phone numbers, and standard media timelines pinned to `dir="ltr"` even inside RTL pages.' },
      ],
    },
    pitfalls: [
      { vi: 'Viết `transform: translateX(20px)` hoặc `border-left: 3px solid` cứng -> khi đổi `dir="rtl"`, đường viền nằm sai bên lề và animation trượt ngược hướng!', en: 'Physical `border-left` or `right: 8px` stays frozen on the wrong side when `dir="rtl"` activates.' },
    ],
    interviewTips: [
      { vi: 'Nêu rõ bộ quy đổi CSS Logical Properties (`left/right` -> `inline-start/inline-end`) + nguyên tắc chọn lọc icon nào NÊN lật (Back/Forward arrows) và icon nào KHÔNG lật (Play button, Clock, Checkmark, Code editor)!', en: 'Highlight Logical Properties (`inline-start/end`), `<bdi>` isolation, and which icons mirror (chevrons) vs never mirror (media play, clocks, code blocks).' },
    ],
    example: {
      title: { vi: 'Demo Trực tiếp Physical `margin-left` vs Logical `margin-inline-start`', en: 'Live LTR <-> RTL Logical Properties Switcher' },
      description: { vi: 'Bấm chuyển `dir="ltr"` <-> `dir="rtl"` để thấy badge và `border-inline-start` tự động lật chuẩn xác trong khi physical `margin-left` bị lệch!', en: 'Toggle `dir="ltr"` vs `dir="rtl"` and watch logical properties mirror cleanly while physical properties break.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

export default function App() {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const isRtl = dir === 'rtl';

  return (
    <div className="col">
      <div className="row">
        <button className="primary" onClick={() => setDir((d) => (d === 'ltr' ? 'rtl' : 'ltr'))}>
          Toggle Direction: {dir.toUpperCase()}
        </button>
      </div>
      <div dir={dir} className="col">
        <div
          className="card"
          style={{
            borderInlineStart: '4px solid #22c55e',
            paddingInlineStart: 16,
            textAlign: 'start',
          }}
        >
          <strong>✅ Logical CSS (border-inline-start + padding-inline-start)</strong>
          <div style={{ marginTop: 6 }}>
            {isRtl ? 'مرحبا! تم عكس التخطيط تلقائيًا بشكل صحيح.' : 'Xin chào! Layout tự lật mượt khi sang RTL.'}
          </div>
        </div>
        <div
          className="card"
          style={{
            borderLeft: '4px solid #ef4444',
            paddingLeft: 16,
            textAlign: 'left',
          }}
        >
          <strong>❌ Physical CSS (border-left + text-align: left)</strong>
          <div style={{ marginTop: 6 }}>
            {isRtl ? 'نص عربي يلتصق بالجانب الخطأ!' : 'Looks fine only in LTR; breaks alignment in RTL!'}
          </div>
        </div>
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Bấm Toggle Direction để thấy card Logical CSS tự đổi viền xanh từ trái sang phải mượt mà!', en: 'Click Toggle Direction and compare how the Logical CSS green accent mirrors cleanly to the right edge!' },
    },
    quiz: [
      {
        id: 'q-rtl-1',
        topicId: 'rtl',
        categoryId: 'i18n',
        question: { vi: 'Thuộc tính CSS Logical nào thay thế đúng cho `margin-left: 12px` để tự động đảo lề trong chế độ RTL?', en: 'Which CSS Logical Property replaces `margin-left: 12px` so layouts mirror automatically under `dir="rtl"`?' },
        options: [
          { vi: '`margin-inline-start: 12px`', en: '`margin-inline-start: 12px`' },
          { vi: '`margin-block-start: 12px`', en: '`margin-block-start: 12px`' },
          { vi: '`margin-top: 12px`', en: '`margin-top: 12px`' },
          { vi: '`float: left`', en: '`float: left`' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Trục `inline` đại diện cho hướng viết ngang (`inline-start` là trái ở LTR và phải ở RTL); còn `block` là hướng dọc (trên/dưới).',
          en: '`inline-start` adapts horizontally to reading direction (left in LTR, right in RTL), whereas `block` is vertical.',
        },
      },
      {
        id: 'q-rtl-2',
        topicId: 'rtl',
        categoryId: 'i18n',
        question: { vi: 'Trong giao diện `dir="rtl"`, thành phần nào sau đây KHÔNG NÊN bị lật đối xứng ngang?', en: 'Inside an RTL (`dir="rtl"`) UI, which element should NOT be horizontally mirrored?' },
        options: [
          { vi: 'Khối mã code (`<pre><code>`), số điện thoại, icon đồng hồ và nút Play media.', en: 'Code blocks (`<pre><code>`), phone numbers, analog clock icons, and media Play triangles.' },
          { vi: 'Mũi tên điều hướng Quay lại / Tiếp theo (Back / Forward arrows).', en: 'Back and Forward navigation arrows.' },
          { vi: 'Vị trí đường viền nhấn cạnh đầu thẻ (`border-inline-start`).', en: 'Leading card accent borders (`border-inline-start`).' },
          { vi: 'Thứ tự cột trong flex row điều hướng.', en: 'Flex row navigation column flow.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Code, URL, số điện thoại luôn đọc từ trái sang phải (`dir="ltr"`), và icon phổ quát như Play/Clock giữ nguyên hướng chuẩn.',
          en: 'Code snippets, phone numbers, and universal time/media icons preserve standard LTR direction.',
        },
      },
    ],
    relatedTopicIds: ['html-lang-hreflang', 'theming-config', 'long-strings'],
  },

  {
    ...TOPIC_META_MAP['template-strings'],
    mentalModel: {
      vi: 'Không bao giờ cộng chuỗi kiểu `"You have " + count + " unread " + (count === 1 ? "message" : "messages")`! Vì ở tiếng Nga/Ba Lan/Ả Rập có tới 3–6 dạng số nhiều khác nhau, và trật tự chủ-vị-tân ngữ đảo lộn theo từng ngôn ngữ — hãy dùng **Named Placeholders** kết hợp **ICU / `Intl.PluralRules`**!',
      en: 'Never build translated UI sentences by concatenating strings or assuming singular/plural `n === 1`. Grammar word order flips across languages and Slavic/Arabic scripts have 3-6 plural categories—use named placeholders and `Intl.PluralRules`.',
    },
    keyPoints: [
      { vi: 'Sử dụng named template placeholders (`"Xin chào {name}, bạn có {count} tin nhắn"`) thay vì nối chuỗi rời rạc từng mảnh.', en: 'Always translate complete sentences with named placeholders (`"Hello {name}, {count} items"`), never concatenated fragments.' },
      { vi: 'Dùng `new Intl.PluralRules(locale).select(count)` (trả về `"zero" | "one" | "two" | "few" | "many" | "other"`) để chia số nhiều chuẩn mọi ngôn ngữ.', en: 'Use native `Intl.PluralRules` (`zero`, `one`, `two`, `few`, `many`, `other`) rather than hardcoding `count === 1`.' },
      { vi: 'Không nhét thẻ HTML thô vào chuỗi dịch dễ vỡ/XSS — dùng component interpolation (ví dụ `<Trans>` hoặc mảng token tách tag an toàn).', en: 'Avoid raw HTML inside translation files; interpolate rich React links/bold spans safely via component tags.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi chuỗi văn bản có biến động (tên người, số lượng, ngày tháng, link bên trong câu) trong app đa ngôn ngữ.', en: 'Every localized string containing dynamic variables, counts, or inline styled spans.' },
      ],
      whenToAvoid: [
        { vi: 'Không tái sử dụng cùng 1 key ngắn (vd `"Open"`) cho 2 ngữ cảnh hoàn toàn khác nghĩa (Động từ "Mở" vs Trạng thái "Đang mở") -> tạo key rõ ngữ cảnh!', en: 'Never reuse one English key like `"Open"` for both a button verb and an adjective status—different languages translate them differently.' },
      ],
    },
    pitfalls: [
      { vi: 'Dùng `count === 1 ? "item" : "items"` làm sai hoàn toàn khi dịch sang tiếng Ả Rập (6 dạng plural), tiếng Ba Lan (`few`/`many`), hoặc tiếng Việt/Nhật (`other` duy nhất)!', en: 'Hardcoding `count === 1 ? singular : plural` breaks Arabic (6 forms), Polish/Russian (`few`/`many`), and Vietnamese/Japanese (`other`).' },
    ],
    interviewTips: [
      { vi: 'Đề cập `Intl.PluralRules` + ICU MessageFormat + vì sao câu `"Saved " + time + " ago"` sai ngữ pháp khi sang tiếng Nhật/Việt (đảo vị trí biến)!', en: 'Show why `"Saved " + x + " ago"` breaks non-English word order and demonstrate `Intl.PluralRules` + named template placeholders.' },
    ],
    example: {
      title: { vi: 'Message Interpolator & `Intl.PluralRules` đa ngôn ngữ', en: 'Safe Template Interpolator + `Intl.PluralRules`' },
      description: { vi: 'Kiểm thử thay thế named placeholder và chia dạng số nhiều tự động theo luật ngữ pháp từng ngôn ngữ (`en`, `vi`, `pl`, `ar`).', en: 'Test named variable interpolation and native `Intl.PluralRules` selection across English, Vietnamese, Polish, and Arabic.' },
      mode: 'ts',
      code: `function formatMessage(
  template: string,
  params: Record<string, string | number>
): string {
  return template.replace(/\\{(\\w+)\\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : \`{\${key}}\`
  );
}

const enPlural = new Intl.PluralRules('en-US');
const plPlural = new Intl.PluralRules('pl-PL');
const viPlural = new Intl.PluralRules('vi-VN');

for (const n of [0, 1, 2, 5]) {
  console.log(\`n=\${n} -> en:\${enPlural.select(n)}, pl:\${plPlural.select(n)}, vi:\${viPlural.select(n)}\`);
}

console.log(formatMessage('Chào {user}, bạn có {count} thông báo mới.', { user: 'An', count: 4 }));`,
      tryItPrompt: { vi: 'Thử chạy `new Intl.PluralRules("ar-SA").select(n)` với 0, 1, 2, 3, 11 để thấy đủ 5-6 dạng số nhiều trong tiếng Ả Rập!', en: 'Inspect `Intl.PluralRules("ar-SA")` across 0, 1, 2, 3, and 11 to see Arabic plural categories.' },
    },
    challenge: {
      id: 'challenge-interpolate-template',
      topicId: 'template-strings',
      categoryId: 'i18n',
      title: { vi: 'Cài đặt interpolateTemplate + Plural Selector an toàn', en: 'Implement interpolateTemplate w/ Plural Rules' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm `interpolateTemplate(messages: { one?: string; other: string }, count: number, locale: string, vars?: Record<string, string | number>): string`. Dùng `new Intl.PluralRules(locale).select(count)` để chọn template phù hợp (fallback về `messages.other` nếu `messages[category]` không có), sau đó thay thế toàn bộ `{count}` bằng `count` (hoặc `vars` ghi đè nếu có) và các `{key}` từ `vars` (nhớ dùng `Object.hasOwn` để không dính prototype pollution!).',
        en: 'Implement `interpolateTemplate(messages: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }, count, locale, vars?)`. Pick the plural template via `new Intl.PluralRules(locale).select(count)` falling back to `messages.other`, then substitute `{count}` and own properties from `vars`.',
      },
      starterCode: `export function interpolateTemplate(
  messages: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string },
  count: number,
  locale: string,
  vars: Record<string, string | number> = {}
): string {
  // TODO: select plural template with Intl.PluralRules(locale) and interpolate {key} safely
  return '';
}`,
      solutionCode: `export function interpolateTemplate(
  messages: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string },
  count: number,
  locale: string,
  vars: Record<string, string | number> = {}
): string {
  const rule = new Intl.PluralRules(locale).select(count);
  const template = messages[rule] ?? messages.other;
  const merged: Record<string, string | number> = { count, ...vars };

  return template.replace(/\\{(\\w+)\\}/g, (full, key: string) =>
    Object.prototype.hasOwnProperty.call(merged, key) ? String(merged[key]) : full
  );
}`,
      testCode: `test('selects locale-accurate plural template and interpolates variables', () => {
  const enMsgs = { one: '{name} has {count} file', other: '{name} has {count} files' };
  expect(interpolateTemplate(enMsgs, 1, 'en-US', { name: 'Linh' })).toBe('Linh has 1 file');
  expect(interpolateTemplate(enMsgs, 3, 'en-US', { name: 'Linh' })).toBe('Linh has 3 files');

  const plMsgs = { one: '{count} plik', few: '{count} pliki', many: '{count} plików', other: '{count} pliku' };
  expect(interpolateTemplate(plMsgs, 2, 'pl-PL')).toBe('2 pliki');
  expect(interpolateTemplate(plMsgs, 5, 'pl-PL')).toBe('5 plików');
});`,
      hints: [
        { vi: 'Gọi `const rule = new Intl.PluralRules(locale).select(count);` rồi tra `messages[rule] ?? messages.other`.', en: 'Select category using `new Intl.PluralRules(locale).select(count)` with `?? messages.other` fallback.' },
        { vi: 'Gộp `{ count, ...vars }` trước khi chạy `.replace(/\\{(\\w+)\\}/g, ...)`.', en: 'Merge `{ count, ...vars }` and check `Object.prototype.hasOwnProperty.call(merged, key)`.' },
      ],
    },
    quiz: [
      {
        id: 'q-tmpl-1',
        topicId: 'template-strings',
        categoryId: 'i18n',
        question: { vi: 'Vì sao việc ghép chuỗi kiểu `t("thereAre") + " " + count + " " + t("items")` là lỗi nghiêm trọng trong thiết kế i18n?', en: 'Why is concatenating translated pieces (`t("thereAre") + count + t("items")`) an i18n anti-pattern?' },
        options: [
          { vi: 'Các ngôn ngữ khác nhau có trật tự ngữ pháp (Subject-Verb-Object) và quy tắc chia số nhiều hoàn toàn khác nhau — phải giữ nguyên câu hoàn chỉnh dùng `{placeholder}`.', en: 'Languages reorder sentence clauses and apply distinct plural inflections—translators need complete sentences with `{placeholders}`.' },
          { vi: 'JavaScript không thể cộng số với chuỗi.', en: 'JS cannot join numbers and strings.' },
          { vi: 'Cộng chuỗi gây rò rỉ CORS.', en: 'Causes CORS errors.' },
          { vi: 'Chỉ tiếng Anh hỗ trợ dấu cách.', en: 'Only English supports spaces.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Biên dịch viên cần thấy toàn bộ câu ngữ cảnh đầy đủ với `{count}` đặt tự do tại vị trí tự nhiên của ngôn ngữ đích.',
          en: 'Full sentences with named placeholders let translators place variables naturally per grammar rules.',
        },
      },
      {
        id: 'q-tmpl-2',
        topicId: 'template-strings',
        categoryId: 'i18n',
        question: { vi: 'API chuẩn tích hợp sẵn trong trình duyệt giúp xác định quy tắc số nhiều (`one`, `few`, `many`, `other`) theo từng ngôn ngữ mà không cần cài thư viện nặng là gì?', en: 'Which built-in browser ECMAScript API resolves locale-specific plural categories (`one`, `few`, `many`, `other`)?' },
        options: [
          { vi: '`Intl.PluralRules`', en: '`Intl.PluralRules`' },
          { vi: '`Math.plural`', en: '`Math.plural`' },
          { vi: '`String.prototype.pluralize`', en: '`String.prototype.pluralize`' },
          { vi: '`navigator.grammar`', en: '`navigator.grammar`' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`Intl.PluralRules` nhẹ 0 KB bundle, hỗ trợ chuẩn CLDR cho mọi ngôn ngữ trên mọi trình duyệt hiện đại.',
          en: '`Intl.PluralRules` ships natively in browsers with zero bundle cost.',
        },
      },
    ],
    relatedTopicIds: ['intl-formatting', 'html-lang-hreflang', 'xss'],
  },

  {
    ...TOPIC_META_MAP['intl-formatting'],
    mentalModel: {
      vi: 'Ngày 03/04/2026 là 4 tháng 3 (ở Việt Nam/Châu Âu) hay 3 tháng 4 (ở Mỹ)? Tiền Việt không có xu lẻ nhưng USD có 2 số thập phân! Thay vì cài thư viện nặng hàng chục KB, dùng trực tiếp **ECMAScript `Intl` API** (`DateTimeFormat`, `NumberFormat`, `RelativeTimeFormat`, `ListFormat`) có sẵn 0 KB trong trình duyệt!',
      en: 'Avoid shipping bulky date/number formatting libraries when the native **ECMAScript `Intl` API** (`NumberFormat`, `DateTimeFormat`, `RelativeTimeFormat`, `ListFormat`) handles every locale’s separators, decimals, currencies, and calendars at zero bundle cost.',
    },
    keyPoints: [
      { vi: '`Intl.NumberFormat(locale, { style: "currency", currency })`: tự đặt đúng ký hiệu tiền tệ (`$`, `₫`, `¥`), dấu phân tách `.` vs `,` và số chữ số thập phân (VND/JPY là 0, USD/EUR là 2).', en: '`Intl.NumberFormat` adapts decimal/grouping separators, currency symbols, and minor fraction digits (0 for VND/JPY, 2 for USD).' },
      { vi: '`Intl.DateTimeFormat(locale, { dateStyle, timeStyle, timeZone })`: định dạng ngày giờ chuẩn vùng miền và múi giờ IANA.', en: '`Intl.DateTimeFormat` renders regional day-month ordering and IANA time zones cleanly.' },
      { vi: '`Intl.RelativeTimeFormat`: định dạng "2 ngày trước", "in 3 hours", và `Intl.ListFormat`: nối mảng `"A, B, and C"` hoặc `"A, B và C"`.', en: '`Intl.RelativeTimeFormat` and `Intl.ListFormat` localize relative timestamps and natural conjunction lists natively.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi nơi hiển thị tiền tệ, số lượng lớn, ngày tháng, múi giờ, thời gian tương đối.', en: 'Every price, metric, date, timezone, and relative timestamp across localized apps.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng truyền nhầm `currency` theo ngôn ngữ UI (ví dụ user đổi ngôn ngữ sang English không có nghĩa tiền trong tài khoản VND bỗng đổi tỷ giá thành USD — tách rõ `displayLocale` và `currencyCode`!).', en: 'Never couple currency unit blindly to UI language—keep `displayLocale` (formatting style) separate from `currencyCode` (actual asset currency)!' },
      ],
    },
    pitfalls: [
      { vi: 'Khởi tạo `new Intl.NumberFormat(...)` bên trong vòng lặp 10.000 dòng của bảng -> hãy cache instance `Intl.*Format` theo `(locale, options)` vì constructor khá tốn CPU nếu gọi lặp hàng nghìn lần!', en: 'Instantiating `new Intl.NumberFormat()` inside a 10,000-row render loop hurts perf; memoize formatter instances per locale/options.' },
    ],
    interviewTips: [
      { vi: 'Hai điểm sáng giá khi phỏng vấn: 1) **Tách `locale` khỏi `currency`** (hiển thị 500,000 VND cho khách Mỹ vẫn phải là `₫500,000` chứ không đổi thành `$500,000`!), 2) **Cache/Reuse `Intl` formatter instances** để đạt tốc độ cao trong danh sách lớn!', en: 'Highlight two pro nuances: decoupling `displayLocale` from `currencyCode`, and caching `Intl` formatter instances for large tables.' },
    ],
    example: {
      title: { vi: 'Native ECMAScript `Intl` Formatting Studio (0 KB Bundle)', en: 'Native `Intl` APIs Across Locales' },
      description: { vi: 'So sánh cách `Intl.NumberFormat`, `DateTimeFormat`, `RelativeTimeFormat` và `ListFormat` hiển thị cùng dữ liệu qua `vi-VN`, `en-US`, `de-DE`, `ja-JP`.', en: 'Compare native `Intl` outputs for currencies, dates, relative times, and lists across 4 locales.' },
      mode: 'ts',
      code: `const sampleDate = new Date('2026-11-23T08:30:00Z');
const locales = ['vi-VN', 'en-US', 'de-DE', 'ja-JP'] as const;

for (const loc of locales) {
  const price = new Intl.NumberFormat(loc, { style: 'currency', currency: 'USD' }).format(1299.5);
  const date = new Intl.DateTimeFormat(loc, { dateStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' }).format(sampleDate);
  const rel = new Intl.RelativeTimeFormat(loc, { numeric: 'auto' }).format(-2, 'day');
  console.log(\`[\${loc}] Price: \${price} | Date: \${date} | Relative: \${rel}\`);
}`,
      tryItPrompt: { vi: 'Thử đổi `currency: "VND"` với giá `450000` để thấy `Intl.NumberFormat` tự ẩn phần thập phân thừa cho tiền Việt Nam!', en: 'Swap `currency: "VND"` and amount `450000` to observe automatic zero-decimal currency rules.' },
    },
    challenge: {
      id: 'challenge-format-currency',
      topicId: 'intl-formatting',
      categoryId: 'i18n',
      title: { vi: 'Cài đặt formatLocaleCurrency có Formatter Cache', en: 'Implement Memoized formatLocaleCurrency' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm `createCurrencyFormatter()` trả về hàm `(amount: number, locale: string, currency: string, compact?: boolean) => string`. Dùng `Intl.NumberFormat` và cache các instance `Intl.NumberFormat` theo khóa `${locale}|${currency}|${Boolean(compact)}` để tái sử dụng thay vì tạo mới mỗi lần. Khi `compact === true`, đặt `notation: "compact"`. Kèm thuộc tính `.cacheSize()` trả về số formatter đang giữ trong cache.',
        en: 'Implement `createCurrencyFormatter()` returning an object with `format(amount, locale, currency, compact = false): string` and `cacheSize(): number`. Reuse cached `Intl.NumberFormat` instances keyed by `${locale}|${currency}|${Boolean(compact)}`, passing `notation: "compact"` when `compact` is true.',
      },
      starterCode: `export function createCurrencyFormatter() {
  // TODO: memoize Intl.NumberFormat instances by key and support compact notation
  return {
    format: (_amount: number, _locale: string, _currency: string, _compact = false): string => '',
    cacheSize: (): number => 0,
  };
}`,
      solutionCode: `export function createCurrencyFormatter() {
  const cache = new Map<string, Intl.NumberFormat>();

  return {
    format(amount: number, locale: string, currency: string, compact = false): string {
      const key = \`\${locale}|\${currency}|\${compact}\`;
      let fmt = cache.get(key);
      if (!fmt) {
        fmt = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          ...(compact ? { notation: 'compact' as const } : {}),
        });
        cache.set(key, fmt);
      }
      return fmt.format(amount);
    },
    cacheSize(): number {
      return cache.size;
    },
  };
}`,
      testCode: `test('formats currencies accurately per locale and caches formatter instances', () => {
  const formatter = createCurrencyFormatter();
  const usd = formatter.format(1250.5, 'en-US', 'USD');
  const usdAgain = formatter.format(99.9, 'en-US', 'USD');
  const compact = formatter.format(1500000, 'en-US', 'USD', true);
  const vnd = formatter.format(250000, 'vi-VN', 'VND');

  expect(usd).toBe('$1,250.50');
  expect(usdAgain).toBe('$99.90');
  expect(compact).toContain('1.5M');
  expect(vnd).toContain('250.000');
  expect(formatter.cacheSize()).toBe(3);
});`,
      hints: [
        { vi: 'Tạo `const cache = new Map<string, Intl.NumberFormat>();` và key `${locale}|${currency}|${compact}`.', en: 'Store `Intl.NumberFormat` instances in a `Map` keyed by `${locale}|${currency}|${compact}`.' },
      ],
    },
    quiz: [
      {
        id: 'q-intl-1',
        topicId: 'intl-formatting',
        categoryId: 'i18n',
        question: { vi: 'Sai lầm nào hay gặp khi kết hợp chuyển đổi ngôn ngữ UI với hiển thị giá tiền trên trang e-commerce quốc tế?', en: 'What critical bug happens when coupling currency formatting purely to UI display language?' },
        options: [
          { vi: 'Tự động đổi đơn vị/giá trị tiền theo ngôn ngữ (vd đổi UI sang `en-US` liền in `$500,000` thay vì quy đổi hoặc giữ đúng mã tiền tệ `VND`) -> phải tách `displayLocale` khỏi `currencyCode`!', en: 'Formatting a 500,000 VND amount as `$500,000` just because UI switched to English—always keep `displayLocale` separate from `currencyCode`.' },
          { vi: 'Dùng `Intl.NumberFormat` trên trình duyệt.', en: 'Using `Intl.NumberFormat` in browsers.' },
          { vi: 'Hiển thị số thập phân cho USD.', en: 'Showing decimals for USD.' },
          { vi: 'Dùng mã ISO 4217 (USD, VND, JPY).', en: 'Using ISO 4217 codes.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Ngôn ngữ định dạng dấu phẩy/chấm và vị trí ký hiệu, còn mã tiền tệ (`currency`) phải gắn liền với giá trị thực sự của dữ liệu.',
          en: '`locale` governs punctuation/ordering while `currency` specifies the actual monetary unit.',
        },
      },
      {
        id: 'q-intl-2',
        topicId: 'intl-formatting',
        categoryId: 'i18n',
        question: { vi: 'Tại sao nên cache và tái sử dụng object `new Intl.DateTimeFormat(...)` / `new Intl.NumberFormat(...)` thay vì khởi tạo mới trong mỗi cell bảng?', en: 'Why reuse memoized `Intl.DateTimeFormat` / `Intl.NumberFormat` instances across table rows?' },
        options: [
          { vi: 'Khởi tạo object `Intl` mới rất tốn kém CPU so với việc gọi `.format(val)` trên instance đã tạo sẵn.', en: 'Constructing `Intl` formatters is noticeably slower than reusing `.format()` on a cached instance.' },
          { vi: 'Trình duyệt giới hạn tối đa 5 formatter mỗi trang.', en: 'Browsers restrict pages to 5 formatters.' },
          { vi: '`Intl` tự động gửi API mỗi lần `new`.', en: '`Intl` sends network requests per constructor.' },
          { vi: 'Cache giúp xóa lỗi CSS.', en: 'Caching fixes CSS.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Khởi tạo 1 lần rồi gọi `.format()` lặp lại cho 1.000 dòng nhanh hơn tới 10–30 lần so với gọi `new Intl.*` mỗi vòng lặp.',
          en: 'Reusing cached `Intl` formatter instances eliminates repeated locale option parsing overhead.',
        },
      },
    ],
    relatedTopicIds: ['template-strings', 'html-lang-hreflang', 'caching-memoizing'],
  },

  {
    ...TOPIC_META_MAP['avoid-text-in-images'],
    mentalModel: {
      vi: 'Chữ in chết bên trong file PNG/JPEG giống tấm bảng xi măng: dịch sang ngôn ngữ mới phải thuê designer vẽ lại 15 ảnh khác nhau, phóng to trên màn Retina bị nhòe, RTL không tự căn lề, Googlebot không đọc được SEO, và người khiếm thị mù tịt thông tin!',
      en: 'Baking UI copy into raster PNG/JPEG pixels makes localization require 15 redesigned files, breaks screen-reader access, blocks text zoom/SEO crawling, and fails RTL—keep text as live HTML/CSS layers over clean media.',
    },
    keyPoints: [
      { vi: 'Tách hình ảnh nền (chụp sạch không chứa chữ) khỏi lớp HTML/CSS text overlay (nút CTA, tiêu đề, badge khuyến mãi).', en: 'Separate textless background photography/graphics from live HTML/CSS text and button overlays.' },
      { vi: 'Đảm bảo lớp phủ HTML có độ tương phản WCAG >= 4.5:1 trên nền ảnh bằng vùng nền đặc hoặc scrim tương phản phù hợp.', en: 'Ensure HTML text overlaid on media maintains >= 4.5:1 contrast via clean solid cards or calm dark crops.' },
      { vi: 'Giữ khả năng bôi đen sao chép (selectable text), tự co giãn theo zoom trình duyệt 200%, và tự lật hướng `dir="rtl"`.', en: 'Live HTML copy stays selectable, zoomable, searchable, accessible, and responsive across LTR/RTL.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Banner quảng cáo, thẻ tính năng sản phẩm, UI mockup, bảng giá, nút CTA và tiêu đề hero.', en: 'Hero banners, promotional cards, feature UI showcases, pricing tiers, and CTAs.' },
      ],
      whenToAvoid: [
        { vi: 'Chỉ ngoại lệ với ảnh chụp vật lý thật (biển hiệu tiệm cà phê ngoài đời, nhãn chai sản phẩm) — và khi đó phải ghi lại chữ quan trọng ở `alt` hoặc mô tả xung quanh!', en: 'Real-world photography containing natural physical signage or product labels—just mirror important text inside `alt` or adjacent copy.' },
      ],
    },
    pitfalls: [
      { vi: 'Dùng ảnh chụp screenshot của dashboard/bảng chữ thay vì render HTML/SVG thật -> chữ mờ trên điện thoại và sai hoàn toàn khi người dùng chuyển từ Tiếng Việt sang Tiếng Anh!', en: 'Dropping static English screenshot PNGs into feature cards breaks completely when users toggle to Vietnamese or Arabic.' },
    ],
    interviewTips: [
      { vi: 'Liên kết thẳng quy tắc này với cả 4 trụ cột cùng lúc: **i18n** (dịch dễ, đỡ tạo N file ảnh), **A11y** (screen reader & zoom 200%), **SEO** (text index được), và **Performance** (HTML nhẹ hơn ảnh chữ sắc nét)!', en: 'Connect live HTML overlays to all 4 engineering wins: i18n translation, A11y readability/zoom, SEO indexing, and crisp resolution at zero raster cost.' },
    ],
    example: {
      title: { vi: 'So sánh HTML Overlay Đa ngôn ngữ vs Ảnh chứa chữ cứng', en: 'Live HTML Text Overlay vs Baked Text Banner' },
      description: { vi: 'Thay vì xuất 2 tấm ảnh PNG cho VI/EN, một ảnh nền sạch kết hợp HTML overlay tự đổi chữ tức thì theo ngôn ngữ.', en: 'Switch language on a single clean graphic + live HTML overlay—zero redesigned image files required.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

export default function App() {
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const copy = lang === 'vi'
    ? { badge: 'Mới phát hành', title: 'Giảm 30% độ trễ tải trang', cta: 'Xem hướng dẫn' }
    : { badge: 'New release', title: 'Cut page load latency by 30%', cta: 'Read the guide' };

  return (
    <div className="col">
      <div className="row">
        <button className="primary" onClick={() => setLang((l) => (l === 'vi' ? 'en' : 'vi'))}>
          Switch Language ({lang.toUpperCase()})
        </button>
      </div>
      <div style={{
        position: 'relative', borderRadius: 10, overflow: 'hidden', padding: 20,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid var(--border)', color: '#f8fafc',
      }}>
        <span className="badge" style={{ background: '#38bdf8', color: '#082f49', border: 'none' }}>{copy.badge}</span>
        <h3 style={{ margin: '10px 0 12px', fontSize: 18 }}>{copy.title}</h3>
        <button className="primary">{copy.cta}</button>
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử chuyển qua lại VI/EN để thấy text sắc nét, bôi đen được, hỗ trợ screen reader mà không tốn thêm bất kỳ file ảnh nào!', en: 'Toggle VI/EN and select the live text—accessible, localized, and razor-sharp without extra images.' },
    },
    quiz: [
      {
        id: 'q-noimgtxt-1',
        topicId: 'avoid-text-in-images',
        categoryId: 'i18n',
        question: { vi: 'Việc đặt chữ quảng cáo thành ảnh PNG thay vì dùng HTML/CSS overlay trên ảnh nền sạch gây ra vấn đề gì?', en: 'Which problems arise from baking promotional headlines into PNG pixels instead of live HTML overlays?' },
        options: [
          { vi: 'Tốn công xuất nhiều file ảnh cho từng ngôn ngữ, công cụ tìm kiếm không đọc được, screen reader bỏ sót, và chữ bị mờ khi phóng to/Retina.', en: 'Requires separate graphics per locale, hides copy from SEO and screen readers, and blurs under high-DPI zoom.' },
          { vi: 'Làm HTML tự chuyển thành XML.', en: 'Converts HTML to XML.' },
          { vi: 'Tắt hoàn toàn CSS grid.', en: 'Breaks CSS Grid.' },
          { vi: 'Không tải được qua HTTPS.', en: 'Fails over HTTPS.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Tách nền đồ họa khỏi văn bản HTML trực tiếp giúp giải quyết đồng thời i18n, SEO, Accessibility và độ sắc nét.',
          en: 'Live text over clean media solves translation, SEO indexing, zooming, and accessibility in one stroke.',
        },
      },
      {
        id: 'q-noimgtxt-2',
        topicId: 'avoid-text-in-images',
        categoryId: 'i18n',
        question: { vi: 'Khi phải đặt lớp chữ HTML nằm trên một bức ảnh nền, điều kiện Accessibility tối quan trọng là gì?', en: 'When overlaying live HTML copy onto a background photograph, what accessibility rule is mandatory?' },
        options: [
          { vi: 'Đảm bảo nền dưới chữ đủ tối/trơn (hoặc dùng box nền đặc) để đạt tỷ lệ tương phản chữ WCAG >= 4.5:1 trên mọi kích thước màn hình.', en: 'Ensure the background behind text remains calm/high-contrast (or sits inside a solid box) meeting >= 4.5:1 WCAG contrast across breakpoints.' },
          { vi: 'Để chữ cỡ 9px.', en: 'Shrink text to 9px.' },
          { vi: 'Đặt màu chữ trùng màu nền ảnh.', en: 'Match text color to photo hue.' },
          { vi: 'Gắn `aria-hidden="true"` lên tiêu đề.', en: 'Add `aria-hidden="true"` to the heading.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Vùng ảnh nhiều chi tiết rối sẽ làm chữ đè lên trở nên khó đọc, đặc biệt khi ảnh crop thay đổi trên điện thoại.',
          en: 'Verify calm low-detail crops or solid surfaces behind overlaid text at desktop and mobile breakpoints.',
        },
      },
    ],
    relatedTopicIds: ['image-alt-text', 'visual-a11y', 'rtl'],
  },

  {
    ...TOPIC_META_MAP['ime'],
    mentalModel: {
      vi: 'Khi gõ tiếng Việt (Telex/VNI: `a` + `a` -> `â`, `â` + `s` -> `ấ`), tiếng Nhật (Romaji -> Kanji), tiếng Trung hoặc tiếng Hàn, bộ gõ IME mở một phiên tổ hợp (`compositionstart` -> `compositionupdate` -> `compositionend`). Nếu bạn gửi API hoặc bấm `Enter` submit ngay khi `e.isComposing === true` (lúc user bấm Enter để xác nhận chọn chữ Kanji trong bảng gợi ý!), ô chat sẽ gửi tin nhắn dở dang trước khi kịp gõ xong!',
      en: 'Vietnamese Telex/VNI, Japanese, Chinese, and Korean Input Method Editors (IMEs) buffer intermediate keystrokes between `compositionstart` and `compositionend`. Never fire Enter-to-submit or search APIs while `event.nativeEvent.isComposing` is true!',
    },
    keyPoints: [
      { vi: 'Kiểm tra `e.nativeEvent.isComposing` (hoặc `e.isComposing` / `e.keyCode === 229`) trong `onKeyDown` trước khi xử lý phím `Enter` gửi tin nhắn hoặc kích hoạt shortcut!', en: 'Guard Enter-to-submit and shortcuts in `onKeyDown` with `if (e.nativeEvent.isComposing || e.keyCode === 229) return;`.' },
      { vi: 'Lắng nghe bộ 3 sự kiện `compositionstart`, `compositionupdate`, `compositionend` khi xử lý Autocomplete/Search: hoãn gọi API tìm kiếm cho tới khi kết thúc composition hoặc gộp debounce hợp lý (tránh tìm kiếm chuỗi latin rác giữa chừng như `"tieeng"` hoặc `"nihon"`).', en: 'Wait for `compositionend` before triggering autocomplete searches so half-composed phonetic buffers are not queried.' },
      { vi: 'Cẩn thận khi cập nhật/format lại `value` của Controlled `<input>` (như tự viết hoa / xóa dấu / mask số) ngay trong lúc `isComposing === true` — việc ghi đè DOM `input.value` giữa phiên IME sẽ làm vỡ hoặc nhân đôi ký tự Tiếng Việt/CJK trên Safari và Chrome!', en: 'Never mutate or reformat a controlled `<input>` value synchronously while `isComposing` is true—it corrupts IME character composition!' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi ô chat Enter-to-send, thanh Search/Command Palette, trình soạn thảo văn bản, và masked inputs hỗ trợ người dùng Tiếng Việt / Đông Á.', en: 'Every chat box, command palette, search input, rich-text editor, and masked field used globally.' },
      ],
      whenToAvoid: [
        { vi: 'Không chặn phím `Enter` bình thường khi `isComposing === false` — chỉ bỏ qua đúng cú Enter dùng để chốt từ trong bộ gõ IME.', en: 'Only skip Enter handling during active `isComposing` sessions so normal submission stays instant.' },
      ],
    },
    pitfalls: [
      { vi: 'Chủ quan test toàn tiếng Anh trên bàn phím US nên bỏ quên `isComposing`, đến khi user Việt/Nhật/Hàn gõ: cứ bấm Enter chọn chữ gợi ý trên IME là tin nhắn bay đi luôn nửa câu!', en: 'Testing only with English US keyboards misses the classic CJK bug where pressing Enter to accept an IME candidate prematurely submits the chat message.' },
      { vi: 'Trên Safari macOS, sự kiện `compositionend` đôi khi bắn NGAY TRƯỚC `keydown` Enter hoặc ngay sau tùy trình duyệt — dùng thêm biến ref `justEndedComposition` hoặc check `e.keyCode === 229` giúp an toàn tuyệt đối.', en: 'Safari ordering quirks mean checking both `isComposing` and `keyCode === 229` prevents edge-case premature submits.' },
    ],
    interviewTips: [
      { vi: 'Cực kỳ ít ứng viên biết chi tiết **IME `isComposing` + Controlled Input mutation bug** — nêu ra câu này trong bài thiết kế Chat App hoặc Typeahead Search tại thị trường global là điểm cộng chuẩn Staff Engineer!', en: 'Bringing up `e.isComposing` guards and avoiding controlled-value mutation mid-composition in Chat/Autocomplete interviews stands out immediately.' },
    ],
    example: {
      title: { vi: 'IME Composition Inspector + Enter-to-Submit Guard', en: 'Live IME Composition Events & Submit Guard' },
      description: { vi: 'Thử gõ bằng bộ gõ Tiếng Việt (Unikey/macOS Telex) hoặc tiếng Nhật/Trung vào ô dưới để quan sát `compositionstart`/`update`/`end` và `isComposing`!', en: 'Type using an IME (Vietnamese Telex/VNI, Japanese, Chinese) to watch live composition events and safe Enter submission.' },
      mode: 'react',
      code: `import React, { useRef, useState } from 'react';

export default function App() {
  const [text, setText] = useState('');
  const [composing, setComposing] = useState(false);
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const isComposingRef = useRef(false);

  const log = (msg: string) => setEvents((e) => [msg, ...e].slice(0, 6));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || isComposingRef.current || e.keyCode === 229) {
        log('BLOCKED premature Enter during IME composition!');
        return;
      }
      if (text.trim()) {
        setSubmitted((s) => [...s, text]);
        setText('');
        log('Submitted final composed text safely.');
      }
    }
  };

  return (
    <div className="col">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span>IME Status: <strong className="badge">{composing ? 'COMPOSING...' : 'IDLE'}</strong></span>
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onCompositionStart={(e) => { isComposingRef.current = true; setComposing(true); log('compositionstart'); }}
        onCompositionUpdate={(e) => log('compositionupdate: ' + e.data)}
        onCompositionEnd={(e) => { isComposingRef.current = false; setComposing(false); log('compositionend: ' + e.data); }}
        onKeyDown={onKeyDown}
        placeholder="Type Vietnamese/CJK w/ IME & press Enter..."
      />
      <div className="card">
        <strong>Submitted Messages:</strong> {submitted.join(' | ') || 'none'}
      </div>
      <pre className="card muted" style={{ margin: 0 }}>{events.join('\\n') || 'Waiting for input events...'}</pre>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Mở thêm tab Interactive Lab ("i18n Playground") để test song song RTL, Intl formatting và IME Inspector!', en: 'Explore the i18n Playground Interactive Lab tab to inspect RTL, Intl formatting, and IME side by side!' },
    },
    quiz: [
      {
        id: 'q-ime-1',
        topicId: 'ime',
        categoryId: 'i18n',
        question: { vi: 'Trong ô nhập tin nhắn chat gửi bằng phím `Enter`, tại sao phải kiểm tra `if (e.nativeEvent.isComposing || e.keyCode === 229) return;`?', en: 'Why must Enter-to-send chat boxes guard `onKeyDown` with `if (e.nativeEvent.isComposing || e.keyCode === 229) return;`?' },
        options: [
          { vi: 'Để phím `Enter` xác nhận chọn chữ từ bảng gợi ý bộ gõ IME (Nhật/Trung/Việt) không vô tình gửi luôn tin nhắn dở dang.', en: 'Prevents an Enter press used to confirm an IME candidate word (CJK/Vietnamese) from prematurely submitting the message.' },
          { vi: 'Để tăng tốc độ gõ phím.', en: 'To speed up typing.' },
          { vi: 'Để dịch chữ sang tiếng Anh.', en: 'To translate text to English.' },
          { vi: 'Để bật chế độ RTL.', en: 'To enable RTL.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Người dùng CJK thường xuyên bấm `Enter` để chốt chữ từ cửa sổ IME; bỏ qua guard này là lỗi UX phổ biến nhất với người dùng Châu Á.',
          en: 'CJK IMEs rely on Enter to commit candidate characters; missing `isComposing` guards sends half-typed messages.',
        },
      },
      {
        id: 'q-ime-2',
        topicId: 'ime',
        categoryId: 'i18n',
        question: { vi: 'Điều gì có thể xảy ra nếu bạn ép biến đổi chuỗi (ví dụ `.toUpperCase()` hoặc regex lọc ký tự) trực tiếp trên Controlled `<input value={val} />` khi `isComposing === true`?', en: 'What goes wrong if you synchronously reformat (`toUpperCase()` / regex strip) a controlled `<input>` value while `isComposing === true`?' },
        options: [
          { vi: 'Phá vỡ phiên tổ hợp dấu của bộ gõ IME, làm mất dấu hoặc nhân đôi ký tự đang gõ dở.', en: 'Interrupts active IME composition state, scrambling or duplicating diacritics and half-composed characters.' },
          { vi: 'Tự động gửi form lên server.', en: 'Submits the form.' },
          { vi: 'Làm mất CSS styling.', en: 'Removes CSS styles.' },
          { vi: 'Chuyển input thành password.', en: 'Turns input into password type.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Chỉ nên thực hiện biến đổi/lọc format văn bản bên trong `onCompositionEnd` (hoặc khi `!isComposing`) chứ không đè value giữa phiên gõ.',
          en: 'Defer input sanitization/normalization until `compositionend` completes.',
        },
      },
    ],
    relatedTopicIds: ['template-strings', 'keyboard-interactions', 'long-strings'],
  },
];
