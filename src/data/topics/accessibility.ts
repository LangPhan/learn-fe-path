import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const accessibilityTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['keyboard-interactions'],
    mentalModel: {
      vi: 'Mọi thao tác người dùng làm được bằng chuột đều PHẢI thực hiện mượt mà chỉ bằng bàn phím: `Tab` chuyển giữa các vùng điều khiển, `Arrow` di chuyển trong cùng widget (Tabs, Menu, Listbox) theo pattern Roving Tabindex, `Enter`/`Space` kích hoạt, và `Escape` đóng popup.',
      en: 'Every mouse workflow must work seamlessly via keyboard alone: `Tab` moves across major widgets, `Arrow` keys navigate within composite widgets via Roving Tabindex, `Enter`/`Space` activate, and `Escape` dismisses.',
    },
    keyPoints: [
      { vi: 'Luôn dùng thẻ `<button>`, `<a href>`, `<input>` gốc thay cho `<div onClick>` để tự động có Enter/Space/focus.', en: 'Use native `<button>`, `<a href>`, and `<input>` rather than `<div onClick>` so Enter/Space activation works naturally.' },
      { vi: 'Roving Tabindex cho composite widget (Toolbar, Tabs, RadioGroup): chỉ item đang active có `tabIndex={0}`, các item còn lại `tabIndex={-1}` và di chuyển bằng phím mũi tên!', en: 'Roving tabindex keeps only one item at `tabIndex={0}` inside a group while siblings use `tabIndex={-1}` and respond to Arrow/Home/End keys.' },
      { vi: 'Cung cấp Skip Link (`Skip to main content`) ngay đầu trang và tôn trọng chuẩn phím tắt ARIA APG.', en: 'Include a skip link at the top of the document and follow WAI-ARIA Authoring Practices keyboard maps.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Tabs, Dropdown Menu, Combobox/Autocomplete, Modal Dialog, Data Table, Command Palette.', en: 'All composite interactive components: Tabs, Menus, Comboboxes, Dialogs, Toolbars, and Command Palettes.' },
      ],
      whenToAvoid: [
        { vi: 'Tránh tạo phím tắt đơn phím chữ cái (ví dụ bấm `k` không kèm modifier) gây cướp phím khi user đang bật trình đọc màn hình hoặc gõ IME!', en: 'Avoid single-character shortcuts without modifiers when inputs might be focused or for screen-reader users (WCAG 2.1.4).' },
      ],
    },
    pitfalls: [
      { vi: 'Bắt mọi Tab phải đi qua 30 nút trong một toolbar thay vì dùng Roving Tabindex làm người dùng bàn phím bấm Tab mỏi tay mới qua được 1 thanh công cụ!', en: 'Leaving `tabIndex={0}` on 30 sibling toolbar buttons forces keyboard users to press Tab 30 times just to pass one toolbar.' },
    ],
    interviewTips: [
      { vi: 'Nêu rõ Roving Tabindex (`tabIndex = isActive ? 0 : -1` + `ArrowLeft`/`ArrowRight`/`Home`/`End` + wrap-around) — đây là chuẩn trực tiếp từ tài liệu `building-components` (`accessibility.mdx`)!', en: 'Walk through Roving Tabindex (`0` vs `-1`, Arrow/Home/End, wrap-around) directly—this immediately signals deep UI engineering rigor.' },
    ],
    example: {
      title: { vi: 'Toolbar Bàn phím chuẩn Roving Tabindex (Arrow / Home / End)', en: 'Roving Tabindex Keyboard Toolbar Demo' },
      description: { vi: 'Bấm vào một nút trong toolbar rồi dùng mũi tên Trái/Phải, Home, End để di chuyển focus đúng chuẩn WAI-ARIA!', en: 'Click any toolbar button and navigate with ArrowLeft, ArrowRight, Home, and End keys.' },
      mode: 'react',
      code: `import React, { useRef, useState } from 'react';

const ACTIONS = ['Bold', 'Italic', 'Underline', 'Link', 'Code'];

export default function App() {
  const [activeIdx, setActiveIdx] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveTo = (idx: number) => {
    setActiveIdx(idx);
    refs.current[idx]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const len = ACTIONS.length;
    if (e.key === 'ArrowRight') { e.preventDefault(); moveTo((i + 1) % len); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); moveTo((i - 1 + len) % len); }
    else if (e.key === 'Home') { e.preventDefault(); moveTo(0); }
    else if (e.key === 'End') { e.preventDefault(); moveTo(len - 1); }
  };

  return (
    <div className="col">
      <div role="toolbar" aria-label="Formatting toolbar" className="row card">
        {ACTIONS.map((label, i) => (
          <button
            key={label}
            ref={(el) => { refs.current[i] = el; }}
            tabIndex={activeIdx === i ? 0 : -1}
            aria-pressed={activeIdx === i}
            className={activeIdx === i ? 'primary' : ''}
            onClick={() => setActiveIdx(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="muted" style={{ fontSize: 12 }}>
        Focus index: {activeIdx} ({ACTIONS[activeIdx]}) — try Tabbing in, then using ArrowLeft/ArrowRight/Home/End!
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử dùng phím Tab rời khỏi Toolbar để kiểm tra con trỏ nhảy thẳng ra ngoài chỉ với 1 lần bấm Tab!', en: 'Press Tab to exit the entire toolbar in a single keystroke, verifying Roving Tabindex efficiency.' },
    },
    challenge: {
      id: 'challenge-roving-index',
      topicId: 'keyboard-interactions',
      categoryId: 'accessibility',
      title: { vi: 'Cài đặt getNextRovingIndex cho Composite Widget', en: 'Implement getNextRovingIndex' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm `getNextRovingIndex(currentIndex: number, key: string, totalItems: number, disabledIndices?: number[]): number` xử lý điều hướng cho toolbar/tabs ngang/dọc: `ArrowRight`/`ArrowDown` tiến 1 bước (wrap-around từ cuối về đầu), `ArrowLeft`/`ArrowUp` lùi 1 bước (wrap từ đầu về cuối), `Home` về phần tử hợp lệ đầu tiên, `End` tới phần tử hợp lệ cuối cùng. Luôn bỏ qua các index nằm trong `disabledIndices`. Nếu mọi item đều disabled hoặc `totalItems <= 0` trả về `-1`. Phím khác giữ nguyên `currentIndex`.',
        en: 'Implement `getNextRovingIndex(currentIndex, key, totalItems, disabledIndices?)`. Support `ArrowRight`/`ArrowDown` (next wrapping), `ArrowLeft`/`ArrowUp` (prev wrapping), `Home` (first enabled), and `End` (last enabled), skipping any indices in `disabledIndices`. Return `-1` if `totalItems <= 0` or all items are disabled; preserve `currentIndex` for unhandled keys.',
      },
      starterCode: `export function getNextRovingIndex(
  currentIndex: number,
  key: string,
  totalItems: number,
  disabledIndices: number[] = []
): number {
  // TODO: handle ArrowRight/ArrowDown, ArrowLeft/ArrowUp, Home, End skipping disabled items
  return currentIndex;
}`,
      solutionCode: `export function getNextRovingIndex(
  currentIndex: number,
  key: string,
  totalItems: number,
  disabledIndices: number[] = []
): number {
  if (totalItems <= 0) return -1;
  const disabled = new Set(disabledIndices);
  const enabled: number[] = [];
  for (let i = 0; i < totalItems; i++) {
    if (!disabled.has(i)) enabled.push(i);
  }
  if (enabled.length === 0) return -1;

  if (key === 'Home') return enabled[0];
  if (key === 'End') return enabled[enabled.length - 1];

  const isNext = key === 'ArrowRight' || key === 'ArrowDown';
  const isPrev = key === 'ArrowLeft' || key === 'ArrowUp';
  if (!isNext && !isPrev) return currentIndex;

  const step = isNext ? 1 : -1;
  for (let offset = 1; offset <= totalItems; offset++) {
    const candidate = ((currentIndex + step * offset) % totalItems + totalItems) % totalItems;
    if (!disabled.has(candidate)) return candidate;
  }
  return currentIndex;
}`,
      testCode: `test('navigates with wrap-around and skips disabled items', () => {
  expect(getNextRovingIndex(0, 'ArrowRight', 4)).toBe(1);
  expect(getNextRovingIndex(3, 'ArrowRight', 4)).toBe(0);
  expect(getNextRovingIndex(0, 'ArrowLeft', 4)).toBe(3);
  expect(getNextRovingIndex(0, 'ArrowRight', 4, [1])).toBe(2);
  expect(getNextRovingIndex(2, 'Home', 4, [0])).toBe(1);
  expect(getNextRovingIndex(1, 'End', 4, [3])).toBe(2);
  expect(getNextRovingIndex(0, 'ArrowDown', 3, [0, 1, 2])).toBe(-1);
  expect(getNextRovingIndex(2, 'Enter', 4)).toBe(2);
});`,
      hints: [
        { vi: 'Tạo danh sách các index hợp lệ không nằm trong `disabledIndices` để xử lý nhanh `Home`, `End` và trường hợp tất cả đều disabled.', en: 'Precompute enabled indices so `Home`, `End`, and all-disabled cases resolve cleanly.' },
        { vi: 'Dùng phép chia dư chuẩn hóa số âm `((idx % n) + n) % n` khi vòng về đầu/cuối.', en: 'Wrap around circularly using `((currentIndex + step * offset) % totalItems + totalItems) % totalItems`.' },
      ],
    },
    quiz: [
      {
        id: 'q-kb-1',
        topicId: 'keyboard-interactions',
        categoryId: 'accessibility',
        question: { vi: 'Kỹ thuật Roving Tabindex đặt giá trị `tabIndex` như thế nào cho một nhóm 5 nút Tab?', en: 'How does Roving Tabindex assign `tabIndex` values across a 5-tab bar?' },
        options: [
          { vi: 'Tab đang được chọn/focus giữ `tabIndex={0}`, 4 tab còn lại mang `tabIndex={-1}` và chuyển bằng phím Mũi tên.', en: 'Only the active/focused tab gets `tabIndex={0}` while the other 4 get `tabIndex={-1}` and move via Arrow keys.' },
          { vi: 'Gán `tabIndex={1}` tới `tabIndex={5}`.', en: 'Assign `tabIndex` 1 through 5.' },
          { vi: 'Đặt cả 5 nút `tabIndex={-1}`.', en: 'Set `tabIndex={-1}` on all five.' },
          { vi: 'Đặt cả 5 nút `tabIndex={0}`.', en: 'Set `tabIndex={0}` on all five.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Chỉ 1 điểm dừng Tab cho cả widget giúp Tab qua toàn trang nhanh chóng, còn bên trong widget dùng Arrow keys.',
          en: 'Single-tab-stop widgets avoid forcing users to Tab past every sibling tab.',
        },
      },
      {
        id: 'q-kb-2',
        topicId: 'keyboard-interactions',
        categoryId: 'accessibility',
        question: { vi: 'Vì sao không nên gán `tabIndex > 0` (vd `tabIndex={2}`, `tabIndex={5}`) lên các phần tử HTML?', en: 'Why is positive `tabIndex > 0` considered an Accessibility anti-pattern?' },
        options: [
          { vi: 'Phá vỡ thứ tự đọc logic của DOM khiến người dùng bàn phím nhảy cóc hỗn loạn trên trang.', en: 'It overrides natural DOM reading order and creates erratic, confusing Tab focus jumps.' },
          { vi: 'Vì HTML5 xóa bỏ tabIndex dương.', en: 'HTML5 removed positive integers.' },
          { vi: 'Nó vô hiệu hóa click chuột.', en: 'It blocks mouse clicks.' },
          { vi: 'Nó làm trang chạy chậm.', en: 'It slows CSS rendering.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Hãy sắp xếp cấu trúc HTML đúng thứ tự thị giác và chỉ sử dụng `tabIndex={0}` hoặc `tabIndex={-1}`.',
          en: 'Match DOM order to visual reading order and stick exclusively to `0` and `-1`.',
        },
      },
    ],
    relatedTopicIds: ['focus-management', 'wai-aria', 'event-handlers'],
  },

  {
    ...TOPIC_META_MAP['wai-aria'],
    mentalModel: {
      vi: 'Quy tắc số 1 của ARIA: "Không dùng ARIA nếu thẻ HTML ngữ nghĩa gốc đã làm sẵn việc đó!" Chỉ bổ sung `role`, state (`aria-expanded`, `aria-selected`), và properties (`aria-label`, `aria-live`) cho các custom widget phức tạp như Combobox, Modal, Toast.',
      en: 'First Rule of ARIA: never recreate native semantics with `<div role="button">` when `<button>` exists! Layer ARIA roles, states (`aria-expanded`), and live regions (`aria-live`) onto custom interactive widgets.',
    },
    keyPoints: [
      { vi: 'Roles xác định loại thành phần (`role="dialog"`, `role="tablist"`, `role="status"`).', en: 'Roles communicate widget identity (`dialog`, `tablist`, `combobox`, `alert`).' },
      { vi: 'States thay đổi theo tương tác (`aria-expanded`, `aria-selected`, `aria-checked`, `aria-disabled`).', en: 'States convey dynamic changes (`aria-expanded`, `aria-pressed`, `aria-selected`, `aria-invalid`).' },
      { vi: 'Properties mô tả liên kết & thông báo (`aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-live="polite"` vs `"assertive"`).', en: 'Properties connect labels/descriptions (`aria-labelledby`, `aria-describedby`) and live announcements (`aria-live="polite"` vs `"assertive"`).' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Dùng Semantic HTML cho `<nav>`, `<main>`, `<header>`, `<button>`, `<a>`, `<label>`; dùng ARIA cho Tabs, Accordion, Autocomplete, Toast `aria-live`.', en: 'Native landmarks/controls everywhere; ARIA for custom widgets and dynamic `aria-live` status updates.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng gắn `role="button"` lên `<div>` mà quên lập trình phím `Enter`/`Space` — "No ARIA is better than Bad ARIA"!', en: 'Never put `role="button"` on a `<div>` without full keyboard handling—bad ARIA breaks assistive tech worse than none.' },
      ],
    },
    pitfalls: [
      { vi: 'Gắn `aria-hidden="true"` lên một vùng chứa nút/link có thể nhận Tab focus -> người dùng mù Tab vào "hố đen" không được Screen Reader đọc bất kỳ chữ nào!', en: 'Putting `aria-hidden="true"` on an ancestor containing focusable buttons traps keyboard users in silent focus.' },
    ],
    interviewTips: [
      { vi: 'Phân biệt `aria-live="polite"` (đợi screen reader đọc xong câu hiện tại — dùng cho "Đã lưu", "5 kết quả tìm thấy") vs `aria-live="assertive"` / `role="alert"` (ngắt ngang đọc ngay — chỉ dùng cho lỗi khẩn cấp!).', en: 'Contrast `aria-live="polite"` (search count, save toast) vs `aria-live="assertive"` / `role="alert"` (urgent errors only).' },
    ],
    example: {
      title: { vi: 'Thực hành Semantic HTML + ARIA States + Live Region', en: 'Semantic HTML + ARIA States & Live Announcer' },
      description: { vi: 'Thử tương tác vùng thông báo `aria-live="polite"` và quan sát cấu trúc semantic chuẩn WCAG.', en: 'Trigger polite live announcements and inspect proper `aria-expanded` / `aria-describedby` wiring.' },
      mode: 'html',
      code: `<main aria-label="Profile settings demo" class="col">
  <div class="card">
    <label for="api-key" style="display:block;font-weight:600;margin-bottom:4px;">API Secret Name</label>
    <input id="api-key" aria-describedby="api-help" placeholder="prod-gateway-token" style="width:100%;" />
    <div id="api-help" class="muted" style="font-size:12px;margin-top:4px;">Used only for backend server calls.</div>
  </div>
  <div class="row">
    <button type="button" class="primary" onclick="document.getElementById('live-box').textContent='Settings saved at ' + new Date().toLocaleTimeString();">
      Save Settings
    </button>
    <div id="live-box" role="status" aria-live="polite" class="badge">Ready</div>
  </div>
</main>`,
      tryItPrompt: { vi: 'Thử bấm "Save Settings" và kiểm tra `aria-live="polite"` cập nhật nhẹ nhàng bên trong `role="status"`.', en: 'Click Save Settings and check the live region inside `role="status"` update.' },
    },
    quiz: [
      {
        id: 'q-aria-1',
        topicId: 'wai-aria',
        categoryId: 'accessibility',
        question: { vi: 'Quy tắc đầu tiên của WAI-ARIA ("First Rule of ARIA Use") phát biểu điều gì?', en: 'What does the First Rule of ARIA state?' },
        options: [
          { vi: 'Nếu đã có phần tử Semantic HTML gốc đáp ứng sẵn hành vi (như `<button>`, `<nav>`, `<input>`), hãy dùng thẻ gốc thay vì `<div>` + ARIA role.', en: 'If a native semantic HTML element (`<button>`, `<nav>`, `<select>`) provides the behavior, use it instead of `<div>` + ARIA.' },
          { vi: 'Mọi thẻ `<div>` đều phải gắn thêm `role`.', en: 'Every `<div>` must have an explicit `role`.' },
          { vi: 'Chỉ dùng ARIA cho CSS Grid.', en: 'Use ARIA solely for CSS Grid.' },
          { vi: 'Cấm dùng `<button>` trong React.', en: 'Avoid `<button>` in React.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Thẻ HTML gốc mang sẵn cả semantics lẫn hỗ trợ bàn phím mặc định trên mọi trình duyệt và công nghệ hỗ trợ.',
          en: 'Native elements deliver built-in semantics, focusability, and keyboard triggers reliably.',
        },
      },
      {
        id: 'q-aria-2',
        topicId: 'wai-aria',
        categoryId: 'accessibility',
        question: { vi: 'Khi thông báo kết quả tìm kiếm vừa cập nhật xong ("Found 12 skills"), nên dùng thuộc tính `aria-live` nào?', en: 'Which `aria-live` setting fits non-urgent dynamic updates like "Found 12 matching skills"?' },
        options: [
          { vi: '`aria-live="polite"` để đợi Screen Reader đọc hết câu đang dở rồi mới báo.', en: '`aria-live="polite"` so AT announces after finishing the current utterance.' },
          { vi: '`aria-live="assertive"` để cắt ngang ngay mỗi phím gõ.', en: '`aria-live="assertive"` interrupting every keystroke.' },
          { vi: '`aria-hidden="true"`.', en: '`aria-hidden="true"`.' },
          { vi: '`role="presentation"`.', en: '`role="presentation"`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`polite` không ngắt lời khi người dùng đang gõ; chỉ dùng `assertive`/`role="alert"` cho lỗi nghiêm trọng.',
          en: 'Reserve `assertive` for critical alerts; dynamic status counts belong in `polite` regions.',
        },
      },
    ],
    relatedTopicIds: ['keyboard-interactions', 'semantic-markup', 'image-alt-text'],
  },

  {
    ...TOPIC_META_MAP['a11y-headings-hierarchy'],
    mentalModel: {
      vi: 'Người dùng Screen Reader không quét mắt dọc trang mà bấm phím tắt `H` nhảy thẳng giữa các Heading (`<h1>` -> `<h2>` -> `<h3>`) như xem mục lục sách. Nhảy cóc từ `<h1>` xuống thẳng `<h4>` hoặc dùng `<h3>` chỉ để chữ to đẹp làm mục lục bị gãy!',
      en: 'Screen reader users navigate by pressing `H` to jump through headings like a table of contents. Skipping levels (`h1` -> `h4`) or picking `<h*>` strictly for font size breaks the document outline.',
    },
    keyPoints: [
      { vi: 'Một `<h1>` duy nhất định danh nội dung chính mỗi trang.', en: 'Use one clear `<h1>` naming the primary page subject.' },
      { vi: 'Không nhảy cấp đi xuống (`h1` -> `h2` -> `h3`, không nhảy `h1` -> `h3`). Có thể quay ngược cấp lên lại (`h3` -> `h2` ở section mới).', en: 'Step down one level at a time (`h1` -> `h2` -> `h3`); stepping back up (`h3` -> `h2`) for a new section is valid.' },
      { vi: 'Tách biệt Ngữ nghĩa (heading level `h2`/`h3`) khỏi Kích thước hiển thị (CSS class `text-xl` / `text-sm`).', en: 'Decouple semantic heading tag level from visual typography classes.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi trang web, bài viết, form nhiều phần và modal dialog (tiêu đề modal dùng `<h2>`).', en: 'Every page layout, multi-section dashboard, article, and dialog header.' },
      ],
      whenToAvoid: [
        { vi: 'Không dùng `<h3>` cho nhãn logo navbar hay dòng trích dẫn trang trí ngắn — dùng `<span>`/`<p>` cho text thường.', en: 'Do not wrap nav brand text or decorative captions in heading tags.' },
      ],
    },
    pitfalls: [
      { vi: 'Component `<CardTitle>` fix cứng `<h4>` làm khi nhúng trực tiếp dưới `<h1>` trên trang con tạo lỗi nhảy cóc `h1 -> h4`!', en: 'Hardcoding `<h4>` inside a reusable `<CardTitle>` creates skipped heading outlines whenever placed under `<h1>` or `<h2>`.' },
    ],
    interviewTips: [
      { vi: 'Đề xuất pattern cho component tái sử dụng: truyền prop `as="h2" | "h3" | "h4"` hoặc `<HeadingContext>` để component tự tăng cấp độ lồng nhau!', en: 'Propose polymorphic `as` heading props or a `<HeadingLevelProvider>` so reusable cards never skip outline levels.' },
    ],
    example: {
      title: { vi: 'Kiểm tra Outline Thứ tự Heading (Valid vs Skipped)', en: 'Heading Outline Validator Demo' },
      description: { vi: 'Kiểm thử danh sách thẻ heading xem tài liệu có duy nhất 1 `<h1>` và không nhảy cấp hay không.', en: 'Audit heading sequences to catch missing `<h1>` tags or skipped depth jumps (`h1 -> h3`).' },
      mode: 'ts',
      code: `function auditHeadings(levels: number[]) {
  const issues: string[] = [];
  const h1Count = levels.filter((l) => l === 1).length;
  if (h1Count !== 1) issues.push(\`Expected exactly 1 <h1>, found \${h1Count}\`);

  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      issues.push(\`Skipped level at index \${i}: h\${levels[i - 1]} -> h\${levels[i]}\`);
    }
  }
  return { valid: issues.length === 0, issues };
}

console.log('Clean outline [1, 2, 3, 2, 3]:', auditHeadings([1, 2, 3, 2, 3]));
console.log('Broken outline [1, 3, 2]:', auditHeadings([1, 3, 2]));`,
      tryItPrompt: { vi: 'Thử kiểm tra mảng `[2, 3]` (thiếu `<h1>` hoàn toàn) để xem trình kiểm tra báo lỗi gì.', en: 'Test `[2, 3]` (missing `<h1>`) and observe the outline error message.' },
    },
    challenge: {
      id: 'challenge-validate-headings',
      topicId: 'a11y-headings-hierarchy',
      categoryId: 'accessibility',
      title: { vi: 'Cài đặt validateHeadingOutline chuẩn WCAG & SEO', en: 'Implement validateHeadingOutline' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm `validateHeadingOutline(levels: number[]): { valid: boolean; errors: string[] }`. Kiểm tra: 1) Mảng không rỗng và phần tử đầu tiên phải là `1` (`h1`), 2) Có đúng một `1` duy nhất, 3) Mọi phần tử nằm trong 1..6, 4) Không bước nào nhảy xuống quá 1 cấp (`levels[i] - levels[i-1] > 1`).',
        en: 'Implement `validateHeadingOutline(levels: number[]): { valid: boolean; errors: string[] }`. Rules: non-empty starting with `1`, exactly one `1`, all levels within `1..6`, and no downward skip greater than 1 (`levels[i] - levels[i - 1] > 1`).',
      },
      starterCode: `export function validateHeadingOutline(levels: number[]): {
  valid: boolean;
  errors: string[];
} {
  // TODO: validate starting h1, single h1, range 1..6, and no skipped levels (>1 jump)
  return { valid: false, errors: [] };
}`,
      solutionCode: `export function validateHeadingOutline(levels: number[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (levels.length === 0) {
    errors.push('Document has no headings.');
    return { valid: false, errors };
  }
  if (levels[0] !== 1) {
    errors.push('First heading must be h1.');
  }
  const h1Count = levels.filter((l) => l === 1).length;
  if (h1Count !== 1) {
    errors.push('Document must have exactly one h1.');
  }
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    if (level < 1 || level > 6 || !Number.isInteger(level)) {
      errors.push(\`Invalid heading level h\${level} at index \${i}.\`);
    }
    if (i > 0 && level - levels[i - 1] > 1) {
      errors.push(\`Skipped heading level h\${levels[i - 1]} -> h\${level} at index \${i}.\`);
    }
  }
  return { valid: errors.length === 0, errors };
}`,
      testCode: `test('accepts valid nested outlines and rejects skips or duplicate h1', () => {
  expect(validateHeadingOutline([1, 2, 3, 3, 2, 3]).valid).toBe(true);
  expect(validateHeadingOutline([1, 3]).valid).toBe(false);
  expect(validateHeadingOutline([2, 3]).valid).toBe(false);
  expect(validateHeadingOutline([1, 2, 1]).valid).toBe(false);
  expect(validateHeadingOutline([]).valid).toBe(false);
});`,
      hints: [
        { vi: 'Lưu ý: đi từ `h3` quay lại `h2` (`level - prev === -1`) là HOÀN TOÀN HỢP LỆ khi bắt đầu section mới; chỉ cấm nhảy xuống > 1 (`level - prev > 1`).', en: 'Stepping back up (e.g. `h3 -> h2`) is valid; only stepping down by > 1 (`level - prev > 1`) is a skip.' },
      ],
    },
    quiz: [
      {
        id: 'q-a11yh-1',
        topicId: 'a11y-headings-hierarchy',
        categoryId: 'accessibility',
        question: { vi: 'Thứ tự thẻ heading nào sau đây hợp lệ trên cùng một trang web?', en: 'Which sequence of heading levels forms a valid outline on a page?' },
        options: [
          { vi: '`h1 -> h2 -> h3 -> h2 -> h3`', en: '`h1 -> h2 -> h3 -> h2 -> h3`' },
          { vi: '`h1 -> h3 -> h2`', en: '`h1 -> h3 -> h2`' },
          { vi: '`h2 -> h3 -> h4` (không có `h1`)', en: '`h2 -> h3 -> h4` (no `h1`)' },
          { vi: '`h1 -> h4 -> h2`', en: '`h1 -> h4 -> h2`' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Sau khi hết phần con `h3`, hoàn toàn có thể mở một section lớn mới ở cấp `h2` mà không bỏ cấp khi đi xuống.',
          en: 'Stepping back up from `h3` to a new `h2` section is valid; only downward skips like `h1 -> h3` break structure.',
        },
      },
      {
        id: 'q-a11yh-2',
        topicId: 'a11y-headings-hierarchy',
        categoryId: 'accessibility',
        question: { vi: 'Nếu thiết kế đòi hỏi tiêu đề mục này cần cỡ chữ nhỏ bằng 14px nhưng cấu trúc nó ngay sau `<h1>`, ta nên làm gì?', en: 'If design calls for a small 14px sub-section heading immediately below `<h1>`, what is the right approach?' },
        options: [
          { vi: 'Dùng thẻ `<h2>` để giữ đúng cấu trúc outline và chỉnh cỡ chữ `14px` bằng CSS class.', en: 'Keep semantic `<h2>` for outline integrity and style its visual size to `14px` via CSS.' },
          { vi: 'Dùng thẻ `<h5>` cho khớp kích thước chữ nhỏ mặc định.', en: 'Use `<h5>` so browser default sizing looks smaller.' },
          { vi: 'Dùng thẻ `<b>`.', en: 'Use a `<b>` tag.' },
          { vi: 'Đặt vào thẻ `<h1>` thứ hai.', en: 'Use a second `<h1>`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Thẻ heading quyết định cấu trúc ngữ nghĩa cho Screen Reader/SEO; CSS quyết định kích thước thị giác.',
          en: 'Semantic tag levels belong to document hierarchy, whereas CSS classes control visual sizing.',
        },
      },
    ],
    relatedTopicIds: ['seo-heading-hierarchy', 'wai-aria', 'semantic-markup'],
  },

  {
    ...TOPIC_META_MAP['focus-management'],
    mentalModel: {
      vi: 'Người dùng bàn phím cần luôn biết con trỏ đang đứng ở đâu (`:focus-visible` rõ nét), không bị lọt ra nền khi mở Modal (Focus Trap + `inert`), và khi đóng Modal con trỏ phải quay về ĐÚNG nút vừa mở nó!',
      en: 'Keyboard users rely on crisp `:focus-visible` outlines, scoped focus traps inside open modals (`inert` background), and automatic focus restoration back to the trigger when overlays close.',
    },
    keyPoints: [
      { vi: '`:focus-visible` thay cho `:focus`: hiện vòng focus đậm nét khi dùng bàn phím (`Tab`), không hiện viền xấu lúc click chuột.', en: 'Style `:focus-visible` (never remove outlines with `outline: none` without a replacement!) so keyboard focus stands out clearly.' },
      { vi: 'Modal Focus Management: lưu `previouslyFocused = document.activeElement`, chuyển focus vào trong modal khi mở, bẫy `Tab`/`Shift+Tab` ở 2 đầu modal, và `previouslyFocused.focus()` khi đóng!', en: 'Overlays save `activeElement`, focus into the dialog, cycle Tab inside boundaries (plus `inert` on background), and restore focus on close.' },
      { vi: 'Quản lý focus khi xóa item khỏi danh sách: chuyển focus sang phần tử kế cận thay vì để focus rơi về `document.body`!', en: 'When deleting a list item, programmatically move focus to the next/previous item rather than letting it drop to `<body>`.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Dialog, Drawer/Sheet, Popover Menu, xóa dòng danh sách, điều hướng SPA giữa các trang (chuyển focus về `<h1>` hoặc main region).', en: 'Dialogs, Drawers, Menus, destructive list deletions, and SPA route transitions.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng bao giờ dùng `outline: none` toàn cục trong CSS reset mà không thiết kế focus ring tương phản >= 3:1!', en: 'Never strip `:focus-visible` outlines globally without providing a high-contrast replacement.' },
      ],
    },
    pitfalls: [
      { vi: 'Header `position: sticky/fixed` che khuất mất phần tử đang được Tab tới ở bên dưới — nhớ thêm CSS `scroll-margin-top` bằng chiều cao header!', en: 'Sticky headers often obscure focused controls scrolled near the top edge; add `scroll-margin-top` matching header height.' },
    ],
    interviewTips: [
      { vi: 'Kể đủ 4 mảnh ghép chuẩn của Modal Focus Management: 1) Capture trigger ref, 2) Move focus inside on open, 3) Focus trap + `inert` background, 4) Restore focus on Escape/Close!', en: 'Name all 4 modal focus steps: capture trigger -> focus dialog -> trap + `inert` background -> restore trigger focus on close.' },
    ],
    example: {
      title: { vi: 'Dialog Focus Trap & Focus Restoration (Thuần React)', en: 'Accessible Dialog Focus Trap & Restore Demo' },
      description: { vi: 'Mở Dialog rồi bấm `Tab` / `Shift+Tab` liên tục để thấy focus kẹt an toàn trong modal, bấm `Escape` focus quay về nút mở!', en: 'Open the Dialog, press Tab/Shift+Tab to cycle cleanly inside, and hit Escape to watch focus restore to the trigger.' },
      mode: 'react',
      code: `import React, { useEffect, useRef, useState } from 'react';

export default function App() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstBtnRef = useRef<HTMLButtonElement>(null);
  const lastBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      firstBtnRef.current?.focus();
    } else if (triggerRef.current && document.activeElement !== document.body) {
      triggerRef.current.focus();
    }
  }, [open]);

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstBtnRef.current) {
        e.preventDefault();
        lastBtnRef.current?.focus();
      } else if (!e.shiftKey && document.activeElement === lastBtnRef.current) {
        e.preventDefault();
        firstBtnRef.current?.focus();
      }
    }
  };

  return (
    <div className="col">
      <button ref={triggerRef} className="primary" onClick={() => setOpen(true)}>
        Open Accessible Dialog
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dlg-title"
          onKeyDown={handleModalKeyDown}
          className="card col"
          style={{ borderColor: '#38bdf8' }}
        >
          <strong id="dlg-title">Confirm Action (Focus Trapped)</strong>
          <p className="muted" style={{ margin: 0 }}>Press Tab, Shift+Tab, or Escape.</p>
          <div className="row">
            <button ref={firstBtnRef} onClick={() => setOpen(false)}>Cancel</button>
            <button ref={lastBtnRef} className="primary" onClick={() => setOpen(false)}>Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử bấm Mở Dialog -> bấm Tab từ "Confirm" (nó tự quay lại "Cancel"!) -> bấm Escape để thấy focus ring quay về "Open Accessible Dialog".', en: 'Open dialog -> Tab past Confirm (wraps back to Cancel) -> hit Escape and watch focus return to the trigger button.' },
    },
    quiz: [
      {
        id: 'q-focus-1',
        topicId: 'focus-management',
        categoryId: 'accessibility',
        question: { vi: 'Khi đóng một Modal Dialog bằng phím `Escape` hoặc nút Close, vị trí con trỏ focus bàn phím PHẢI được đưa về đâu?', en: 'Where should keyboard focus move immediately when an accessible Modal Dialog closes?' },
        options: [
          { vi: 'Trả về đúng phần tử kích hoạt (trigger button) đã mở modal đó.', en: 'Restore focus back to the exact trigger element that opened the modal.' },
          { vi: 'Để rơi về `document.body` ở đầu trang.', en: 'Drop focus to `document.body` at the top of the page.' },
          { vi: 'Xóa sạch focus hoàn toàn.', en: 'Clear focus everywhere.' },
          { vi: 'Đưa xuống chân trang footer.', en: 'Move focus to the footer.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Nếu không trả focus về trigger, người dùng bàn phím/screen reader sẽ phải bấm Tab lại từ đầu toàn bộ trang web.',
          en: 'Restoring focus preserves the user’s reading/interaction position without forcing a full-page re-Tab.',
        },
      },
      {
        id: 'q-focus-2',
        topicId: 'focus-management',
        categoryId: 'accessibility',
        question: { vi: 'Vì sao dùng `:focus-visible` trong CSS hiện đại tốt hơn `:focus`?', en: 'Why is `:focus-visible` superior to `:focus` for button and link focus rings?' },
        options: [
          { vi: 'Hiển thị vòng focus rõ ràng cho người dùng bàn phím/assistive tech nhưng tránh hiện viền thừa khi click chuột thông thường.', en: 'Shows clear focus rings for keyboard navigation while avoiding intrusive outlines on regular pointer clicks.' },
          { vi: 'Làm nút bấm to gấp đôi.', en: 'Doubles button sizes.' },
          { vi: 'Tắt phím Tab hoàn toàn.', en: 'Disables Tab navigation.' },
          { vi: 'Tự động tạo skip-link.', en: 'Auto-creates skip links.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`:focus-visible` cân bằng hoàn hảo giữa thẩm mỹ khi click chuột và độ rõ nét bắt buộc cho điều hướng bàn phím.',
          en: '`:focus-visible` satisfies both visual polish on mouse clicks and strong keyboard focus visibility.',
        },
      },
    ],
    relatedTopicIds: ['keyboard-interactions', 'wai-aria', 'ui-states'],
  },

  {
    ...TOPIC_META_MAP['visual-a11y'],
    mentalModel: {
      vi: 'Tạo độ tương phản chữ/nền đạt chuẩn WCAG (`>= 4.5:1` cho chữ thường, `>= 3:1` cho chữ to/icon), dùng `rem` để người dùng tăng cỡ chữ hệ thống vẫn đọc mượt, và không bao giờ chỉ dùng mỗi màu đỏ/xanh làm dấu hiệu duy nhất (vì người mù màu sẽ không phân biệt được!).',
      en: 'Maintain WCAG contrast (`>= 4.5:1` normal text, `>= 3:1` large text/UI icons), scale typography with `rem`, honor `prefers-reduced-motion`, and pair colors with icons or labels.',
    },
    keyPoints: [
      { vi: 'WCAG AA Contrast: tối thiểu `4.5:1` cho text thường (<18pt / <24px) và `3:1` cho large text (>=18pt hoặc >=14pt bold) và UI borders/icons. WCAG AAA đạt `7:1`.', en: 'WCAG AA: `4.5:1` minimum for normal text, `3:1` for large text and UI controls/focus rings (AAA requires `7:1`).' },
      { vi: 'Dùng `rem` cho `font-size` và không khóa `user-scalable=no` trong `<meta name="viewport">` để người dùng zoom 200% thoải mái.', en: 'Use `rem` typography units and avoid `maximum-scale=1` / `user-scalable=no` so 200% zoom works smoothly.' },
      { vi: 'Không truyền tải trạng thái chỉ bằng màu sắc (ví dụ lỗi form chỉ tô viền đỏ -> phải kèm icon + dòng text mô tả lỗi).', en: 'Never encode status by color alone—pair red error borders with icons and explicit text messages for colorblind users.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi bảng màu theme (Dark/Light), nút bấm, nhãn muted, tooltip, biểu đồ và trạng thái badge.', en: 'Every design token pair, muted label, button state, focus ring, and data chart.' },
      ],
      whenToAvoid: [
        { vi: 'Tránh các chữ xám nhạt thời thượng (`#9ca3af` trên nền `#ffffff` chỉ đạt 2.5:1 -> trượt WCAG AA!) trong văn bản chính.', en: 'Avoid trendy ultra-faint grey text on light cards or dark muted slate on obsidian that falls below 4.5:1.' },
      ],
    },
    pitfalls: [
      { vi: 'Dùng `px` cứng cho chữ hoặc container cố định chiều cao `height: 36px; overflow: hidden` khiến khi người dùng phóng cỡ chữ hệ thống lên 200% chữ bị cắt mất!', en: 'Fixed pixel box heights (`height: 36px; overflow: hidden`) clip wrapped text when users zoom font sizes to 200%.' },
    ],
    interviewTips: [
      { vi: 'Nhớ chính xác công thức Relative Luminance & Contrast Ratio `(L1 + 0.05) / (L2 + 0.05)` cùng ngưỡng `4.5:1` (AA) / `7:1` (AAA) và làm bài Challenge ngay bên phải!', en: 'Know the WCAG relative luminance contrast formula `(L1 + 0.05) / (L2 + 0.05)` and `4.5:1` AA / `7:1` AAA thresholds.' },
    ],
    example: {
      title: { vi: 'Máy tính Độ tương phản Màu WCAG AA/AAA trực tiếp', en: 'Live WCAG Contrast Ratio Calculator' },
      description: { vi: 'Kiểm tra trực tiếp các cặp màu chữ/nền theo công thức Relative Luminance chuẩn W3C.', en: 'Test foreground/background hex pairs with exact W3C relative luminance math.' },
      mode: 'ts',
      code: `function channelLum(c8: number): number {
  const s = c8 / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function hexLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channelLum(r) + 0.7152 * channelLum(g) + 0.0722 * channelLum(b);
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = hexLuminance(fg);
  const l2 = hexLuminance(bg);
  const [bright, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return Number(((bright + 0.05) / (dark + 0.05)).toFixed(2));
}

console.log('Obsidian + Sky (#38bdf8 on #090c12):', contrastRatio('#38bdf8', '#090c12'), '-> AA Pass!');
console.log('Muted trap (#94a3b8 on #ffffff):', contrastRatio('#94a3b8', '#ffffff'), '-> FAILS AA 4.5:1!');
console.log('Crisp Slate (#475569 on #ffffff):', contrastRatio('#475569', '#ffffff'), '-> AA Pass!');`,
      tryItPrompt: { vi: 'Mở tab Interactive Lab ("A11y Lab") để dùng bộ chọn màu trực tiếp + trình kiểm tra bàn phím và `aria-live`!', en: 'Open the A11y Lab Interactive Visualizer to experiment with live color pickers, roving tabindex, and screen-reader logs!' },
    },
    challenge: {
      id: 'challenge-contrast-ratio',
      topicId: 'visual-a11y',
      categoryId: 'accessibility',
      title: { vi: 'Cài đặt calculateContrastRatio chuẩn WCAG 2.1', en: 'Implement WCAG calculateContrastRatio' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm `calculateContrastRatio(hex1: string, hex2: string): { ratio: number; aaNormal: boolean; aaLarge: boolean; aaaNormal: boolean }` theo đúng chuẩn WCAG 2.1 (hỗ trợ cả mã 6 ký tự `#rrggbb` và 3 ký tự `#rgb`). Làm tròn `ratio` về 2 chữ số thập phân (`Math.round(r * 100) / 100`). `aaNormal >= 4.5`, `aaLarge >= 3`, `aaaNormal >= 7`.',
        en: 'Implement `calculateContrastRatio(hex1, hex2)` returning `{ ratio, aaNormal, aaLarge, aaaNormal }` per WCAG 2.1 relative luminance. Support `#rrggbb` and shorthand `#rgb`, round `ratio` to 2 decimals, with `aaNormal = ratio >= 4.5`, `aaLarge = ratio >= 3`, `aaaNormal = ratio >= 7`.',
      },
      starterCode: `export function calculateContrastRatio(hex1: string, hex2: string): {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
} {
  // TODO: parse hex (#rgb or #rrggbb), compute relative luminance L, return contrast ratio & WCAG levels
  return { ratio: 1, aaNormal: false, aaLarge: false, aaaNormal: false };
}`,
      solutionCode: `export function calculateContrastRatio(hex1: string, hex2: string): {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
} {
  const toLuminance = (raw: string): number => {
    let hex = raw.trim().replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };

  const l1 = toLuminance(hex1);
  const l2 = toLuminance(hex2);
  const bright = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  const ratio = Math.round(((bright + 0.05) / (dark + 0.05)) * 100) / 100;

  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
  };
}`,
      testCode: `test('calculates exact WCAG contrast ratios across shorthand and 6-digit hex', () => {
  expect(calculateContrastRatio('#000', '#fff')).toEqual({
    ratio: 21,
    aaNormal: true,
    aaLarge: true,
    aaaNormal: true,
  });
  const weak = calculateContrastRatio('#94a3b8', '#ffffff');
  expect(weak.aaNormal).toBe(false);
  expect(weak.aaLarge).toBe(false);

  const good = calculateContrastRatio('#38bdf8', '#090c12');
  expect(good.ratio).toBeGreaterThan(8);
  expect(good.aaaNormal).toBe(true);
});`,
      hints: [
        { vi: 'Nếu chuỗi hex sau khi bỏ `#` chỉ dài 3 ký tự, nhân đôi mỗi ký tự trước khi `parseInt(..., 16)`.', en: 'Expand 3-char hex codes (`#fff` -> `ffffff`) before slicing RGB channels.' },
        { vi: 'Hàm tuyến tính hóa sRGB: `c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4`.', en: 'Use the WCAG linear threshold `0.03928` (or `0.04045` — both match standard values at 2 decimals) and `(bright + 0.05) / (dark + 0.05)`.' },
      ],
    },
    quiz: [
      {
        id: 'q-va11y-1',
        topicId: 'visual-a11y',
        categoryId: 'accessibility',
        question: { vi: 'Tỷ lệ tương phản màu tối thiểu chuẩn WCAG Level AA cho văn bản bình thường (< 18pt) là bao nhiêu?', en: 'What is the minimum WCAG AA contrast ratio required for normal body text?' },
        options: [
          { vi: '4.5 : 1 (và 3 : 1 cho chữ lớn / icon UI).', en: '4.5 : 1 (and 3 : 1 for large text and UI components).' },
          { vi: '2 : 1.', en: '2 : 1.' },
          { vi: '10 : 1.', en: '10 : 1.' },
          { vi: '1.5 : 1.', en: '1.5 : 1.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'WCAG 2.1 Level AA yêu cầu tối thiểu 4.5:1 cho text thường và 3:1 cho large text/UI controls.',
          en: 'WCAG AA specifies 4.5:1 for normal copy and 3:1 for large headings/UI graphics.',
        },
      },
      {
        id: 'q-va11y-2',
        topicId: 'visual-a11y',
        categoryId: 'accessibility',
        question: { vi: 'Thuộc tính `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">` vi phạm nguyên tắc nào?', en: 'Why does `user-scalable=no` or `maximum-scale=1` in `<meta name="viewport">` break accessibility?' },
        options: [
          { vi: 'Chặn người dùng thị lực kém phóng to (pinch-to-zoom) trang web lên >= 200%.', en: 'It blocks low-vision users from zooming the page up to 200% or higher.' },
          { vi: 'Làm vỡ kết nối HTTPS.', en: 'It breaks HTTPS.' },
          { vi: 'Chặn font chữ tiếng Việt.', en: 'It blocks Vietnamese fonts.' },
          { vi: 'Làm tăng kích thước JS.', en: 'It enlarges JS bundles.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'WCAG 1.4.4 bắt buộc cho phép zoom văn bản lên ít nhất 200% không mất nội dung.',
          en: 'WCAG 1.4.4 requires supporting pinch/browser zoom to at least 200%.',
        },
      },
    ],
    relatedTopicIds: ['theming-config', 'focus-management', 'image-alt-text'],
  },
];
