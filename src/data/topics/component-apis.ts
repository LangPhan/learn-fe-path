import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const componentApisTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['theming-config'],
    mentalModel: {
      vi: 'Không tô màu cứng (#ffffff hay #1e293b) vào từng nút bấm; đặt tên theo vai trò ngữ nghĩa (--surface-card, --fg-muted, --accent-primary) để đổi cả theme Dark/Light hoặc Multi-Brand chỉ bằng một lớp CSS.',
      en: 'Never hardcode raw hex colors inside components; map semantic design tokens (--background, --surface, --primary) to CSS custom properties so dark mode and brand themes swap cleanly without touching component markup.',
    },
    keyPoints: [
      { vi: 'Hai tầng tokens: Primitive Tokens (slate-900, sky-500) -> Semantic Tokens (--background, --card, --primary, --border).', en: 'Two-tier token hierarchy: Primitive palette values feed Semantic role tokens (--background, --primary, --border).' },
      { vi: 'Dùng CSS Custom Properties trên `:root` và `.dark` / `[data-theme]` để đổi theme O(1) không làm React re-render cả cây component.', en: 'CSS custom properties toggle themes at the root without forcing React tree re-renders.' },
      { vi: 'Cho phép consumer truyền `className` ghi đè an toàn qua `tailwind-merge` (`cn()`) hoặc override token cục bộ.', en: 'Support per-instance overrides via merged `className` (`cn()`) or scoped CSS variable overrides.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi thư viện UI, sản phẩm hỗ trợ Dark/Light mode, hoặc nền tảng White-label đa thương hiệu.', en: 'Design systems, Dark/Light apps, and multi-tenant white-label products.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng phơi bày quá nhiều biến token chi li từng pixel khiến người dùng hệ thống bị rối khi cấu hình.', en: 'Avoid exposing hundreds of micro-tokens when a disciplined 10–15 semantic token set suffices.' },
      ],
    },
    pitfalls: [
      { vi: 'Đặt tên token theo màu sắc (--blue-500) thay vì ngữ nghĩa (--primary): khi sang brand màu xanh lá hoặc dark mode sẽ cực kỳ vô nghĩa.', en: 'Naming tokens after raw colors (--blue) instead of roles (--primary) breaks semantic clarity when themes change.' },
    ],
    interviewTips: [
      { vi: 'Đây là chuẩn cốt lõi trong `building-components` và `shadcn/ui`: Semantic CSS Variables + `@theme inline` + `cn()` merge order (Base -> Variants -> Conditional -> User className).', en: 'Reference the two-tier token system plus `cn()` specificity merge order (base -> variant -> conditional -> consumer override).' },
    ],
    example: {
      title: { vi: 'Theme Token Resolver & Multi-Brand Preview', en: 'Live Semantic Theme Token Studio' },
      description: { vi: 'Đổi bộ Semantic Token (Obsidian / Paper / Forest) qua CSS Variables mà không đụng một dòng JSX của Card.', en: 'Swap root CSS variable tokens across presets and watch components adapt without changing markup.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

const THEMES = {
  obsidian: { '--t-bg': '#0c1118', '--t-fg': '#eef2f7', '--t-accent': '#38bdf8', '--t-border': '#253042' },
  paper: { '--t-bg': '#f8fafc', '--t-fg': '#0f172a', '--t-accent': '#0369a1', '--t-border': '#cbd5e1' },
  forest: { '--t-bg': '#0f1f14', '--t-fg': '#ecfdf5', '--t-accent': '#4ade80', '--t-border': '#1f3b28' },
} as const;

export default function App() {
  const [preset, setPreset] = useState<keyof typeof THEMES>('obsidian');
  const vars = THEMES[preset] as React.CSSProperties;

  return (
    <div className="col">
      <div className="row">
        {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((key) => (
          <button key={key} className={preset === key ? 'primary' : ''} onClick={() => setPreset(key)}>
            {key.toUpperCase()}
          </button>
        ))}
      </div>
      <div
        style={{
          ...vars,
          background: 'var(--t-bg)',
          color: 'var(--t-fg)',
          border: '1px solid var(--t-border)',
          borderRadius: 10,
          padding: 16,
          transition: 'background 150ms ease, color 150ms ease',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16 }}>Token-Driven Card</div>
        <p style={{ opacity: 0.8, margin: '6px 0 12px' }}>Zero hardcoded colors inside JSX; driven 100% by CSS variables.</p>
        <button style={{ background: 'var(--t-accent)', color: '#081018', border: 'none', fontWeight: 600 }}>
          Primary Action
        </button>
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử thêm một biến `--t-radius` để điều khiển độ bo góc qua token cấu hình.', en: 'Add a `--t-radius` token across presets to see radius theming in action.' },
    },
    challenge: {
      id: 'challenge-theme-resolver',
      topicId: 'theming-config',
      categoryId: 'component-apis',
      title: { vi: 'Cài đặt createThemeResolver gộp token kế thừa', en: 'Implement createThemeResolver' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm createThemeResolver(baseTokens: Record<string, string>, overrides?: Partial<Record<string, string>>): { tokens: Record<string, string>; toCssVars: () => Record<string, string> }. Gộp baseTokens và overrides (bỏ qua giá trị undefined trong overrides), đồng thời toCssVars() chuyển mỗi key "bgCard" hoặc "primary" thành "--bgCard" / "--primary" (nếu chưa có prefix "--").',
        en: 'Write createThemeResolver(baseTokens, overrides?) returning { tokens, toCssVars() }. Merge overrides onto baseTokens (ignoring undefined values), and toCssVars() returns CSS custom property keys prefixed with "--" if not already prefixed.',
      },
      starterCode: `export function createThemeResolver(
  baseTokens: Record<string, string>,
  overrides: Record<string, string | undefined> = {}
) {
  // TODO: merge defined overrides and map keys to '--<key>' in toCssVars()
  return {
    tokens: {} as Record<string, string>,
    toCssVars: (): Record<string, string> => ({}),
  };
}`,
      solutionCode: `export function createThemeResolver(
  baseTokens: Record<string, string>,
  overrides: Record<string, string | undefined> = {}
) {
  const tokens: Record<string, string> = { ...baseTokens };
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined) {
      tokens[k] = v;
    }
  }

  return {
    tokens,
    toCssVars(): Record<string, string> {
      const cssVars: Record<string, string> = {};
      for (const [k, v] of Object.entries(tokens)) {
        const varName = k.startsWith('--') ? k : '--' + k;
        cssVars[varName] = v;
      }
      return cssVars;
    },
  };
}`,
      testCode: `test('merges overrides cleanly while ignoring undefined', () => {
  const theme = createThemeResolver(
    { bg: '#090c12', accent: '#38bdf8' },
    { accent: '#22c55e', bg: undefined }
  );
  expect(theme.tokens).toEqual({ bg: '#090c12', accent: '#22c55e' });
  expect(theme.toCssVars()).toEqual({ '--bg': '#090c12', '--accent': '#22c55e' });
});`,
      hints: [
        { vi: 'Sao chép baseTokens, duyệt overrides và chỉ gán khi value !== undefined.', en: 'Clone baseTokens, loop overrides, and assign only when value !== undefined.' },
        { vi: 'Kiểm tra `k.startsWith("--")` trong toCssVars để tránh biến thành `----bg`.', en: 'Check `k.startsWith("--")` so pre-prefixed keys are not double-prefixed.' },
      ],
    },
    quiz: [
      {
        id: 'q-theme-1',
        topicId: 'theming-config',
        categoryId: 'component-apis',
        question: { vi: 'Lợi ích lớn nhất của việc lưu Design Tokens bằng CSS Custom Properties thay vì chỉ dùng React Context là gì?', en: 'Why prefer CSS Custom Properties over passing theme objects strictly through React Context?' },
        options: [
          { vi: 'Đổi theme tức thì không gây React re-render lại toàn bộ cây component và hoạt động tự nhiên với Tailwind/SSR.', en: 'Theme switches update via CSS cascade without forcing full React subtree re-renders, and work seamlessly with SSR.' },
          { vi: 'CSS Variables có thể gọi SQL trực tiếp.', en: 'CSS Variables run SQL queries directly.' },
          { vi: 'Context không hỗ trợ chuỗi string.', en: 'React Context cannot store strings.' },
          { vi: 'CSS Variables tự động dịch ngôn ngữ.', en: 'CSS Variables translate text.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Đổi biến CSS trên thẻ <html> hoặc root wrapper cập nhật màu chỉ bằng bước repaint nhẹ nhàng, tránh re-render JS.',
          en: 'Updating root CSS variables skips React reconciliation completely and prevents Dark-mode flash on SSR.',
        },
      },
      {
        id: 'q-theme-2',
        topicId: 'theming-config',
        categoryId: 'component-apis',
        question: { vi: 'Thứ tự gộp class nào đúng chuẩn trong `cn()` của `building-components`?', en: 'What is the proper class ordering inside `cn()` according to component craft best practices?' },
        options: [
          { vi: 'Base styles -> Variant styles -> Conditional state styles -> Consumer `className` override ở cuối.', en: 'Base styles -> Variant styles -> Conditional styles -> Consumer `className` override last.' },
          { vi: 'Consumer className đứng đầu, Base styles đứng cuối.', en: 'Consumer className first, base styles last.' },
          { vi: 'Sắp xếp theo thứ tự bảng chữ cái.', en: 'Alphabetical order.' },
          { vi: 'Chỉ truyền chuỗi inline style.', en: 'Only inline styles.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Đặt consumer `className` ở cuối giúp `tailwind-merge` ưu tiên phần tùy biến của người gọi khi xảy ra xung đột utility.',
          en: 'Placing consumer `className` last lets `tailwind-merge` cleanly resolve overrides in favor of the caller.',
        },
      },
    ],
    relatedTopicIds: ['composition', 'visual-a11y', 'rtl'],
  },

  {
    ...TOPIC_META_MAP['event-handlers'],
    mentalModel: {
      vi: 'Một component tốt giống người phục vụ tinh tế: tự xử lý thao tác nội bộ của mình, đồng thời vẫn gọi đầy đủ callback của người dùng truyền vào và tôn trọng `event.defaultPrevented`.',
      en: 'A resilient UI primitive runs its own internal behavior while still forwarding consumer event handlers and honoring `event.defaultPrevented` or controlled vs uncontrolled state.',
    },
    keyPoints: [
      { vi: 'Compose Event Handlers: không bao giờ ghi đè mất `props.onClick` của consumer hoặc mất handler nội bộ của component.', en: 'Compose consumer and internal event handlers instead of overwriting either one.' },
      { vi: 'Cho phép consumer gọi `event.preventDefault()` để chặn hành vi mặc định của component (như đóng Dialog hoặc Toggle).', en: 'Check `event.defaultPrevented` before executing internal default behavior so consumers can opt out.' },
      { vi: 'Hỗ trợ cả Controlled (`value` + `onValueChange`) lẫn Uncontrolled (`defaultValue`), tương đồng pattern `useControllableState`.', en: 'Support both controlled (`value`/`onChange`) and uncontrolled (`defaultValue`) event flows consistently.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi component tương tác tái sử dụng (Button, Trigger, Input, Select, Accordion, Tabs).', en: 'Every reusable interactive primitive (Button, Trigger, Input, Tabs, Accordion).' },
      ],
      whenToAvoid: [
        { vi: 'Tránh tạo tên prop lạ như `handleClickCustom` khi DOM/React đã có chuẩn `onClick`, `onKeyDown`, `onChange`.', en: 'Avoid inventing non-standard handler prop names where native `onClick`/`onKeyDown` conventions fit.' },
      ],
    },
    pitfalls: [
      { vi: 'Viết `<button {...props} onClick={internalClick} />` làm `props.onClick` của user bị mất trắng!', en: 'Placing `onClick={internalClick}` after `{...props}` silently drops the consumer callback.' },
    ],
    interviewTips: [
      { vi: 'Nêu rõ hàm `composeEventHandlers(theirHandler, ourHandler)` — đây chính là pattern thực tế bên trong Radix UI và Base UI!', en: 'Highlight `composeEventHandlers(externalHandler, internalHandler)` respecting `defaultPrevented`, used across Radix and Base UI.' },
    ],
    example: {
      title: { vi: 'composeEventHandlers với defaultPrevented Guard', en: 'Safe Event Handler Composition' },
      description: { vi: 'Xem cách gộp handler của người dùng và handler nội bộ đồng thời cho phép preventDefault ngăn hành vi mặc định.', en: 'Compose external and internal handlers while letting consumers prevent default internal side effects.' },
      mode: 'ts',
      code: `interface SyntheticEv { defaultPrevented: boolean; preventDefault(): void }

function composeHandlers<E extends SyntheticEv>(
  externalHandler?: (e: E) => void,
  internalHandler?: (e: E) => void
) {
  return (event: E) => {
    externalHandler?.(event);
    if (!event.defaultPrevented) {
      internalHandler?.(event);
    }
  };
}

let modalOpen = true;
const closeInternal = () => { modalOpen = false; console.log('Internal: modal closed'); };

const handleNormal = composeHandlers(() => console.log('Consumer: analytics tracked'), closeInternal);
const handleGuarded = composeHandlers((e) => {
  console.log('Consumer: unsaved changes! blocking close');
  e.preventDefault();
}, closeInternal);

const makeEv = (): SyntheticEv => ({
  defaultPrevented: false,
  preventDefault() { this.defaultPrevented = true; },
});

handleNormal(makeEv());
console.log('modalOpen after normal:', modalOpen);

modalOpen = true;
handleGuarded(makeEv());
console.log('modalOpen after guarded:', modalOpen);`,
      tryItPrompt: { vi: 'Thử thêm tùy chọn `checkForDefaultPrevented = false` nếu muốn một handler luôn chạy.', en: 'Try adding a `checkForDefaultPrevented` boolean parameter to the composer.' },
    },
    challenge: {
      id: 'challenge-compose-handlers',
      topicId: 'event-handlers',
      categoryId: 'component-apis',
      title: { vi: 'Cài đặt composeEventHandlers', en: 'Implement composeEventHandlers' },
      difficulty: 'easy',
      prompt: {
        vi: 'Viết hàm composeEventHandlers<E extends { defaultPrevented?: boolean }>(externalHandler?: (event: E) => void, internalHandler?: (event: E) => void, checkDefaultPrevented = true): (event: E) => void. Luôn gọi externalHandler trước; sau đó gọi internalHandler trừ khi checkDefaultPrevented là true VÀ event.defaultPrevented là true.',
        en: 'Implement composeEventHandlers<E extends { defaultPrevented?: boolean }>(externalHandler?, internalHandler?, checkDefaultPrevented = true): (event: E) => void. Always invoke externalHandler first, then invoke internalHandler unless checkDefaultPrevented is true and event.defaultPrevented is true.',
      },
      starterCode: `export function composeEventHandlers<E extends { defaultPrevented?: boolean }>(
  externalHandler?: (event: E) => void,
  internalHandler?: (event: E) => void,
  checkDefaultPrevented = true
): (event: E) => void {
  // TODO: invoke externalHandler then conditionally internalHandler
  return (_event: E) => {};
}`,
      solutionCode: `export function composeEventHandlers<E extends { defaultPrevented?: boolean }>(
  externalHandler?: (event: E) => void,
  internalHandler?: (event: E) => void,
  checkDefaultPrevented = true
): (event: E) => void {
  return (event: E) => {
    externalHandler?.(event);
    if (!checkDefaultPrevented || !event.defaultPrevented) {
      internalHandler?.(event);
    }
  };
}`,
      testCode: `test('calls both handlers in order and respects defaultPrevented', () => {
  const order: string[] = [];
  const fn = composeEventHandlers<{ defaultPrevented: boolean }>(
    () => order.push('external'),
    () => order.push('internal')
  );
  fn({ defaultPrevented: false });
  expect(order).toEqual(['external', 'internal']);

  const orderBlocked: string[] = [];
  const fnBlocked = composeEventHandlers<{ defaultPrevented: boolean }>(
    (e) => {
      orderBlocked.push('external');
      e.defaultPrevented = true;
    },
    () => orderBlocked.push('internal')
  );
  fnBlocked({ defaultPrevented: false });
  expect(orderBlocked).toEqual(['external']);
});

test('ignores defaultPrevented when checkDefaultPrevented is false', () => {
  const order: string[] = [];
  const fn = composeEventHandlers<{ defaultPrevented: boolean }>(
    (e) => {
      order.push('external');
      e.defaultPrevented = true;
    },
    () => order.push('internal'),
    false
  );
  fn({ defaultPrevented: false });
  expect(order).toEqual(['external', 'internal']);
});`,
      hints: [
        { vi: 'Gọi `externalHandler?.(event)` đầu tiên.', en: 'Call `externalHandler?.(event)` first.' },
        { vi: 'Điều kiện gọi internalHandler là `!checkDefaultPrevented || !event.defaultPrevented`.', en: 'Invoke `internalHandler?.(event)` when `!checkDefaultPrevented || !event.defaultPrevented`.' },
      ],
    },
    quiz: [
      {
        id: 'q-ev-1',
        topicId: 'event-handlers',
        categoryId: 'component-apis',
        question: { vi: 'Điều gì xảy ra nếu viết `<button {...props} onClick={handleInternalClick} />` trong component library?', en: 'What bug happens if you write `<button {...props} onClick={handleInternalClick} />`?' },
        options: [
          { vi: 'Handler `onClick` do người dùng truyền qua `props` bị ghi đè mất hoàn toàn.', en: 'Any `onClick` passed via `props` by the consumer gets silently overwritten.' },
          { vi: 'Nút tự động đổi màu nền.', en: 'The button changes background automatically.' },
          { vi: 'Button không nhận được focus bàn phím.', en: 'The button loses keyboard focus.' },
          { vi: 'TypeScript tự động gộp hai hàm.', en: 'TypeScript auto-merges both functions.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Prop đứng sau luôn ghi đè prop trùng tên đứng trước; phải dùng composeEventHandlers để chạy cả hai.',
          en: 'Later JSX props overwrite earlier ones; compose both handlers explicitly.',
        },
      },
      {
        id: 'q-ev-2',
        topicId: 'event-handlers',
        categoryId: 'component-apis',
        question: { vi: 'Vì sao hàm compose handler lại kiểm tra `!event.defaultPrevented` trước khi chạy logic nội bộ?', en: 'Why check `!event.defaultPrevented` before executing internal component behavior?' },
        options: [
          { vi: 'Để cho phép người dùng gọi `e.preventDefault()` chặn hành vi mặc định (vd không đóng modal khi form chưa lưu).', en: 'So consumers can call `e.preventDefault()` to cancel default behavior (such as closing an unsaved dialog).' },
          { vi: 'Để ngăn sự kiện sủi bọt (bubbling).', en: 'To stop DOM bubbling.' },
          { vi: 'Để tăng tốc độ CSS transition.', en: 'To accelerate CSS transitions.' },
          { vi: 'Để vô hiệu hóa phím Tab.', en: 'To disable Tab navigation.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Cho phép consumer kiểm soát hoàn toàn việc có thực hiện hành vi mặc định của primitive hay không.',
          en: 'Respecting `defaultPrevented` mirrors native browser event semantics.',
        },
      },
    ],
    relatedTopicIds: ['composition', 'render-props', 'keyboard-interactions'],
  },

  {
    ...TOPIC_META_MAP['render-props'],
    mentalModel: {
      vi: 'Cha lo toàn bộ logic nặng nhọc (theo dõi chuột, Fetch state, Virtual window, Data sorting), còn việc vẽ ra HTML/UI gì thì giao lại cho hàm con `children(state)` tự do quyết định.',
      en: 'Inversion of control via a function-as-child: the parent manages stateful behavior or geometry, while calling `children(data)` lets the consumer own 100% of the rendered markup.',
    },
    keyPoints: [
      { vi: 'Giúp tách biệt hoàn toàn Behavior (logic/state) khỏi Presentation (JSX/CSS) mà không ràng buộc cấu trúc DOM.', en: 'Separates reusable stateful logic cleanly from DOM markup and styling choices.' },
      { vi: 'Dù Custom Hooks thay thế nhiều trường hợp dùng Render Props, Render Props vẫn rất giá trị trong Headless UI, `<VirtualList>{(item, style) => ...}</VirtualList>` và `render` prop polymorphism.', en: 'While hooks cover pure logic reuse, render props remain invaluable for item-level rendering templates (virtual lists, tables, polymorphic slots).' },
      { vi: 'Giữ signature ổn định cho hàm render để tránh re-render con không cần thiết nếu danh sách lớn.', en: 'Memoize item rows when passing render callbacks inside large virtualized lists.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Customizing từng dòng trong Virtual List / Data Table, hoặc Base UI `render` prop để thay thế thẻ HTML gốc.', en: 'Custom row/cell templates in Data Tables, Virtualizers, or polymorphic `render` element overrides.' },
      ],
      whenToAvoid: [
        { vi: 'Lồng 4–5 Render Props vào nhau ("wrapper callback hell") — khi chỉ cần chia sẻ state/logic thuần, hãy viết Custom Hook.', en: 'Deeply nested render-prop callback pyramids—extract Custom Hooks for pure logic sharing.' },
      ],
    },
    pitfalls: [
      { vi: 'Lạm dụng Render Props cho logic đơn giản thay cho Custom Hook làm cây JSX khó đọc và rối DevTools.', en: 'Overusing render-prop wrappers where a plain custom hook makes JSX cleaner.' },
    ],
    interviewTips: [
      { vi: 'So sánh Custom Hooks vs Render Props vs Compound Components: mỗi pattern giải quyết một bài toán khác nhau trong Component API Design!', en: 'Compare Custom Hooks (logic sharing) vs Render Props (consumer-owned item markup) vs Compound Components (structured subcomponents).' },
    ],
    example: {
      title: { vi: 'Headless SearchList dùng Render Prop `(item) => JSX`', en: 'Headless FilterableList with Render Prop' },
      description: { vi: 'Một component SearchList lo lọc & bàn phím nhưng nhường toàn bộ cách vẽ từng kết quả qua hàm children.', en: 'A reusable FilterableList manages filtering & empty state while delegating item UI via `children`.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

function FilterableList<T>({
  items,
  filterBy,
  children,
}: {
  items: T[];
  filterBy: (item: T, q: string) => boolean;
  children: (item: T, index: number) => React.ReactNode;
}) {
  const [query, setQuery] = useState('');
  const filtered = items.filter((item) => filterBy(item, query));

  return (
    <div className="col">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter skills..."
      />
      {filtered.length === 0 ? (
        <div className="card muted">No matches for "{query}"</div>
      ) : (
        <div className="col">{filtered.map((item, idx) => children(item, idx))}</div>
      )}
    </div>
  );
}

const TOPICS = [
  { id: '1', name: 'Server-sent events', tag: 'Realtime' },
  { id: '2', name: 'List virtualization', tag: 'Perf' },
  { id: '3', name: 'Content Security Policy', tag: 'Security' },
];

export default function App() {
  return (
    <FilterableList items={TOPICS} filterBy={(t, q) => t.name.toLowerCase().includes(q.toLowerCase())}>
      {(item) => (
        <div key={item.id} className="card row" style={{ justifyContent: 'space-between' }}>
          <strong>{item.name}</strong>
          <span className="badge">{item.tag}</span>
        </div>
      )}
    </FilterableList>
  );
}`,
      tryItPrompt: { vi: 'Thử thay cách render từng dòng thành danh sách <li> đánh số thứ tự dựa trên tham số `index`.', en: 'Customize the render-prop output to display numbered rows using the `index` parameter.' },
    },
    quiz: [
      {
        id: 'q-rp-1',
        topicId: 'render-props',
        categoryId: 'component-apis',
        question: { vi: 'Khi nào Render Props vẫn vượt trội hơn Custom Hooks trong Component API Design?', en: 'When do Render Props remain preferable over Custom Hooks?' },
        options: [
          { vi: 'Khi component cha quản lý vùng DOM/vòng lặp (như VirtualList, DataTable) và muốn người dùng tùy biến toàn bộ markup từng phần tử.', en: 'When a parent manages iteration/layout (e.g., VirtualList, Table) and delegates per-item markup to callers.' },
          { vi: 'Khi cần gọi API mạng lần đầu.', en: 'When making basic initial fetch calls.' },
          { vi: 'Khi muốn lưu biến toàn cục trong window.', en: 'When storing globals on window.' },
          { vi: 'Render Props luôn nhanh hơn HTML thuần.', en: 'Render Props always beat plain HTML.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Render Props cho phép đảo ngược kiểm soát (inversion of control) phần giao diện trong khi giữ nguyên khung hành vi.',
          en: 'Render props empower callers to render arbitrary item markup inside parent-managed containers.',
        },
      },
      {
        id: 'q-rp-2',
        topicId: 'render-props',
        categoryId: 'component-apis',
        question: { vi: 'Nhược điểm lớn nhất nếu lồng quá nhiều component dùng Render Props cho logic đơn thuần là gì?', en: 'What drawback occurs when nesting multiple logic-only Render Prop wrappers?' },
        options: [
          { vi: 'Tạo ra "wrapper callback hell" làm JSX lồng sâu khó đọc và khó bảo trì — nên thay bằng Custom Hooks.', en: 'It creates deep "callback wrapper hell" in JSX; custom hooks solve pure logic reuse cleanly.' },
          { vi: 'Trình duyệt chặn render nhiều hơn 2 hàm.', en: 'Browsers block more than two nested callbacks.' },
          { vi: 'Không dùng được TypeScript.', en: 'TypeScript cannot type render props.' },
          { vi: 'CSS bị xóa bỏ hoàn toàn.', en: 'CSS fails to load.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Lồng 4–5 hàm render trong JSX tạo hình kim tự tháp khó đọc; dùng Custom Hooks ghép logic phẳng hơn nhiều.',
          en: 'Nested render functions create awkward JSX pyramids compared to flat custom hook composition.',
        },
      },
    ],
    relatedTopicIds: ['composition', 'event-handlers', 'list-virtualization'],
  },

  {
    ...TOPIC_META_MAP['composition'],
    mentalModel: {
      vi: 'Thay vì tạo một "siêu component" `<Card title subtitle footerIcon badgeColor onHeaderClick ... />` nhồi 30 props cứng nhắc, hãy chia thành các mảnh lắp ghép như Lego (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`) tự do phối hợp!',
      en: 'Avoid monolithic components bloated with 30 config props; decompose UI into small single-element cooperating pieces (`Root`, `Trigger`, `Content`) linked cleanly via Context.',
    },
    keyPoints: [
      { vi: 'Single Element Wrapping (chuẩn `building-components`): mỗi exported subcomponent chỉ bọc một phần tử HTML và kế thừa đầy đủ `React.ComponentProps<...>`.', en: 'Single-element wrapping: each subcomponent wraps one DOM element and extends native HTML attributes.' },
      { vi: 'Compound Components chia sẻ state ngầm qua React Context (`Tabs.Root` -> `Tabs.Trigger` + `Tabs.Content`) giúp người dùng sắp xếp lại bố cục tùy ý.', en: 'Compound components share state through Context so consumers can reorder or decorate markup freely.' },
      { vi: 'Dùng `data-slot` và `data-state` để styling theo trạng thái một cách tường minh thay vì phình to số lượng props.', en: 'Expose `data-slot` and `data-state` attributes for declarative Tailwind styling without prop explosion.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Mọi thư viện Design System (`shadcn/ui`, Radix, Base UI), Tabs, Accordion, Dialog, Card, Form Fields.', en: 'Design systems, Tabs, Dialogs, Accordions, Cards, and reusable multi-part UI widgets.' },
      ],
      whenToAvoid: [
        { vi: 'Một icon button đơn giản không có phần tử con phức tạp.', en: 'Simple atomic leaf components that contain only one element.' },
      ],
    },
    pitfalls: [
      { vi: 'Dùng subcomponent ngoài `<Root>` mà không throw lỗi Context rõ ràng khiến debug rất khó hiểu.', en: 'Rendering compound subcomponents outside their `<Root>` without throwing a clear Context error.' },
    ],
    interviewTips: [
      { vi: 'Nhấn mạnh trực tiếp nguyên lý trong `building-components`: "Composition over configuration props" — minh họa bằng refactor từ `<Accordion items={...} />` sang `<Accordion><AccordionItem>...</AccordionItem></Accordion>`!', en: 'Demonstrate refactoring a monolithic `<Accordion data={...} />` into composable `<Accordion.Root>/<Accordion.Item>/<Accordion.Trigger>/<Accordion.Content>`.' },
    ],
    example: {
      title: { vi: 'Compound Accordion với Context + data-state', en: 'Compound Accordion Component (building-components pattern)' },
      description: { vi: 'Xây dựng Accordion lắp ghép tự do theo chuẩn Root / Item / Trigger / Content với ARIA và data-state.', en: 'Build a composable Compound Accordion using Context, ARIA attributes, and `data-state` styling.' },
      mode: 'react',
      code: `import React, { createContext, useContext, useState } from 'react';

const AccCtx = createContext<{ openId: string | null; toggle: (id: string) => void } | null>(null);
const ItemCtx = createContext<string>('');

function Accordion({ defaultOpen, children }: { defaultOpen?: string; children: React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen ?? null);
  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));
  return <AccCtx.Provider value={{ openId, toggle }}><div data-slot="accordion" className="col">{children}</div></AccCtx.Provider>;
}

function AccordionItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <ItemCtx.Provider value={value}><div className="card" style={{ padding: 0, overflow: 'hidden' }}>{children}</div></ItemCtx.Provider>;
}

function AccordionTrigger({ children }: { children: React.ReactNode }) {
  const ctx = useContext(AccCtx)!;
  const id = useContext(ItemCtx);
  const isOpen = ctx.openId === id;
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      data-state={isOpen ? 'open' : 'closed'}
      onClick={() => ctx.toggle(id)}
      style={{ width: '100%', textAlign: 'left', border: 'none', borderRadius: 0, display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}
    >
      <span>{children}</span>
      <span>{isOpen ? '−' : '+'}</span>
    </button>
  );
}

function AccordionContent({ children }: { children: React.ReactNode }) {
  const ctx = useContext(AccCtx)!;
  const id = useContext(ItemCtx);
  if (ctx.openId !== id) return null;
  return <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }} className="muted">{children}</div>;
}

export default function App() {
  return (
    <Accordion defaultOpen="one">
      <AccordionItem value="one">
        <AccordionTrigger>1. Why Composition?</AccordionTrigger>
        <AccordionContent>No prop explosion — insert badges, icons, or custom wrappers freely inside any slot.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>2. Accessible by Default</AccordionTrigger>
        <AccordionContent>Built-in aria-expanded, semantic button trigger, and declarative data-state hooks.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}`,
      tryItPrompt: { vi: 'Thử chèn một badge "NEW" vào bên trong AccordionTrigger mà không phải sửa định nghĩa prop của Accordion!', en: 'Insert a badge inside AccordionTrigger without altering Accordion prop types.' },
    },
    quiz: [
      {
        id: 'q-comp-1',
        topicId: 'composition',
        categoryId: 'component-apis',
        question: { vi: 'Mục đích chính của thuộc tính `data-slot` và `data-state` trong các thư viện như shadcn/ui là gì?', en: 'What is the purpose of `data-slot` and `data-state` attributes in modern composable component libraries?' },
        options: [
          { vi: 'Định danh từng phần cấu trúc và trạng thái hiển thị để style bằng CSS/Tailwind mà không phình to các props như `openClassName`.', en: 'Identify structural parts and visual states declaratively in CSS/Tailwind without exploding state-specific class props.' },
          { vi: 'Lưu dữ liệu vĩnh viễn vào IndexedDB.', en: 'Persist data to IndexedDB.' },
          { vi: 'Tự động dịch ngôn ngữ HTML.', en: 'Auto-translate HTML text.' },
          { vi: 'Thay thế hoàn toàn thuộc tính alt của ảnh.', en: 'Replace image alt attributes.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`data-state="open"` và `data-slot="card-header"` giúp viết CSS sạch sẽ một prop `className` duy nhất thay vì hàng chục props class phụ.',
          en: '`data-*` attributes prevent className prop explosion while keeping styling inspectable and composable.',
        },
      },
      {
        id: 'q-comp-2',
        topicId: 'composition',
        categoryId: 'component-apis',
        question: { vi: 'Nguyên tắc "Single Element Wrapping" khuyên điều gì khi viết một subcomponent?', en: 'What does Single Element Wrapping recommend when designing subcomponents?' },
        options: [
          { vi: 'Mỗi subcomponent nên bọc đúng một phần tử HTML gốc và mở rộng `React.ComponentProps<...>` để consumer kiểm soát hoàn toàn DOM & ARIA.', en: 'Each subcomponent should wrap a single underlying element and extend `React.ComponentProps<...>` for full consumer control.' },
          { vi: 'Gom cả trang web vào đúng một component nhận 40 props.', en: 'Wrap the whole page in one component accepting 40 props.' },
          { vi: 'Cấm dùng Context API.', en: 'Never use React Context.' },
          { vi: 'Luôn bọc mọi nút bấm trong 5 thẻ `<div>`.', en: 'Wrap every button in 5 nested divs.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '1 component = 1 element giúp truyền className, ref, ARIA và cấu trúc DOM minh bạch không cần prop drilling.',
          en: 'One component per element prevents prop drilling and gives callers direct semantic and styling control.',
        },
      },
    ],
    relatedTopicIds: ['render-props', 'event-handlers', 'theming-config'],
  },
];
