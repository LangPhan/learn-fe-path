import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const commonPatternsTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['pattern-infinite-scrolling'],
    mentalModel: {
      vi: 'Ở góc độ kiến trúc tổng thể, Infinite Scrolling bền vững cho 50.000 bài đăng là sự phối hợp 3 lớp: **Cursor Pagination API** (lấy trang không lệch) + **IntersectionObserver Sentinel** (tải ngầm trước 300px) + **Windowing / List Virtualization** (tái chế DOM giữ RAM & FPS phẳng lì!).',
      en: 'Production-scale infinite scrolling fuses three architectural primitives: **Cursor Pagination APIs** (drift-free pages), **IntersectionObserver sentinels** (300px early trigger), and **List Virtualization** (bounded DOM memory over hours of scrolling).',
    },
    keyPoints: [
      { vi: 'Cursor-based state shape: lưu `pages` hoặc mảng `ids` chuẩn hóa kèm `nextCursor` và `inFlightLock` chống gọi trùng.', en: 'Store normalized item arrays keyed by `nextCursor` with strict in-flight locks preventing duplicate page fetches.' },
      { vi: 'Memory & DOM cap: sau 500–1000 item trên feed dài, hoặc dùng Virtualizer, hoặc cuộn tới trang cũ phải giải phóng DOM ngoài viewport để tab mobile không crash OOM.', en: 'Combine infinite feeds with list virtualization so scrolling through thousands of media cards never crashes mobile memory.' },
      { vi: 'Bi-directional Infinite Scroll (Chat / Timeline): khi chèn tin nhắn cũ lên ĐỈNH danh sách (`prepend`), PHẢI giữ nguyên vị trí nhìn hiện tại bằng cách cộng bù chênh lệch `scrollHeight`!', en: 'Bi-directional chat history prepending at the top must adjust `scrollTop += newScrollHeight - oldScrollHeight` to prevent viewport jumps.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'News feed mạng xã hội, tin nhắn chat lịch sử hai chiều, lưới ảnh/video khám phá vô tận.', en: 'Social feeds, bi-directional chat histories, and endless discovery media grids.' },
      ],
      whenToAvoid: [
        { vi: 'Khi trình duyệt cần in ấn (Print), nhảy trang chính xác, hoặc bấm tới footer ở cuối trang.', en: 'Printable reports, strict jump-to-page tables, and footer-heavy layouts.' },
      ],
    },
    pitfalls: [
      { vi: 'Trong Chat App khi tải thêm tin nhắn cũ ở trên đỉnh (`prepend`), toàn bộ màn hình chat bị giật nhảy tụt lên đầu tin nhắn cũ nhất do quên bù trừ `scrollHeight` (hoặc dùng CSS `overflow-anchor: auto`)!', en: 'Prepending older chat messages jumps the scroll position to the top unless scroll offset delta is restored.' },
    ],
    interviewTips: [
      { vi: 'Khi thiết kế Chat App hoặc News Feed, nêu bật **Bi-directional Scroll Anchoring** (`scrollTop += newHeight - prevHeight`) + **Virtualization** + **Cursor API** — combo ăn điểm tuyệt đối!', en: 'Stand out by combining Cursor APIs, Virtualization, and Bi-directional top-prepend scroll anchoring (`scrollTop += deltaHeight`).' },
    ],
    example: {
      title: { vi: 'Bi-directional Scroll Anchoring (Prepend Chat History không giật!)', en: 'Chat Prepend Scroll Anchoring Demo' },
      description: { vi: 'Cuộn lên đỉnh bấm "Load Older Messages": tin nhắn cũ được chèn lên trên nhưng vị trí dòng tin đang đọc đứng yên tại chỗ!', en: 'Load older messages onto the top of a chat feed while keeping the currently viewed message anchored in place.' },
      mode: 'react',
      code: `import React, { useLayoutEffect, useRef, useState } from 'react';

export default function App() {
  const [msgs, setMsgs] = useState(() => Array.from({ length: 12 }, (_, i) => \`Message #\${20 + i}\`));
  const [anchorMode, setAnchorMode] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);
  const prevScrollH = useRef(0);

  const loadOlder = () => {
    const box = boxRef.current;
    if (box) prevScrollH.current = box.scrollHeight;
    setMsgs((prev) => {
      const firstNum = parseInt(prev[0].replace('Message #', ''), 10);
      const older = Array.from({ length: 5 }, (_, i) => \`Message #\${firstNum - 5 + i} (older)\`);
      return [...older, ...prev];
    });
  };

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box || !anchorMode || prevScrollH.current === 0) return;
    const delta = box.scrollHeight - prevScrollH.current;
    box.scrollTop += delta;
    prevScrollH.current = 0;
  }, [msgs, anchorMode]);

  return (
    <div className="col">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button className="primary" onClick={loadOlder}>Prepend 5 Older Messages</button>
        <label className="row" style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={anchorMode} onChange={(e) => setAnchorMode(e.target.checked)} />
          <span>Scroll Anchoring ON</span>
        </label>
      </div>
      <div ref={boxRef} style={{ height: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
        {msgs.map((m) => (
          <div key={m} style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>{m}</div>
        ))}
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Tắt "Scroll Anchoring ON" rồi bấm Prepend để thấy tin cũ đẩy dòng đang xem trượt biến mất, sau đó bật lại để kiểm chứng `useLayoutEffect` giữ đứng im!', en: 'Uncheck Scroll Anchoring and prepend messages to feel the viewport jump, then re-enable `useLayoutEffect` anchoring.' },
    },
    quiz: [
      {
        id: 'q-pinf-1',
        topicId: 'pattern-infinite-scrolling',
        categoryId: 'common-patterns',
        question: { vi: 'Khi chèn thêm các tin nhắn lịch sử cũ lên ĐỈNH danh sách chat (`prepend`), làm sao để vùng nhìn đang đọc của người dùng không bị giật nhảy lên trên?', en: 'When prepending older chat history items to the TOP of a scrollable list, how do you stop the viewport from jumping?' },
        options: [
          { vi: 'Lưu `prevScrollHeight` trước khi render và trong `useLayoutEffect` cộng bù `container.scrollTop += container.scrollHeight - prevScrollHeight` (hoặc dùng `overflow-anchor`).', en: 'Capture `prevScrollHeight` before update and adjust `scrollTop += scrollHeight - prevScrollHeight` synchronously inside `useLayoutEffect`.' },
          { vi: 'Gọi `window.scrollTo(0, 0)`.', en: 'Call `window.scrollTo(0, 0)`.' },
          { vi: 'Xóa sạch tin nhắn phía dưới.', en: 'Delete newer messages.' },
          { vi: 'Bọc bằng `<iframe>`.', en: 'Wrap in an iframe.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`useLayoutEffect` chạy đồng bộ trước khi trình duyệt vẽ pixel ra màn hình nên cộng bù `deltaHeight` giữ mắt nhìn cố định không nháy khung hình!',
          en: '`useLayoutEffect` adjusts `scrollTop` synchronously before browser paint so the visible messages stay rock steady.',
        },
      },
      {
        id: 'q-pinf-2',
        topicId: 'pattern-infinite-scrolling',
        categoryId: 'common-patterns',
        question: { vi: 'Bộ 3 kỹ thuật trụ cột cho một Infinite Feed chạy hàng giờ mà không làm trình duyệt tràn RAM/chậm là gì?', en: 'Which three architectural pieces combine to keep a multi-hour Infinite Feed fast and drift-free?' },
        options: [
          { vi: 'Cursor Pagination + `IntersectionObserver` prefetch + List Virtualization.', en: 'Cursor Pagination + `IntersectionObserver` sentinel + List Virtualization.' },
          { vi: 'Offset Pagination + `setInterval` 50ms + `innerHTML +=`.', en: 'Offset Pagination + 50ms `setInterval` + `innerHTML +=`.' },
          { vi: 'Short Polling + LocalStorage 50MB + `document.write`.', en: 'Short Polling + LocalStorage + `document.write`.' },
          { vi: 'GIF animations + Inline scripts + Global CSS.', en: 'GIF animations + inline scripts.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Cursor tránh lệch dữ liệu, IntersectionObserver tải đúng lúc không chặn main thread, và Virtualization giữ DOM nhỏ gọn O(1).',
          en: 'Cursors prevent drift, IntersectionObserver triggers fetches smoothly, and Virtualization bounds DOM size.',
        },
      },
    ],
    relatedTopicIds: ['ux-infinite-scrolling', 'pagination', 'list-virtualization'],
  },

  {
    ...TOPIC_META_MAP['event-sourcing'],
    mentalModel: {
      vi: 'Thay vì chỉ lưu ảnh chụp hiện tại (`{ balance: 150 }`) và ghi đè mất dấu vết cũ, **Event Sourcing** lưu toàn bộ sổ cái nhật ký các sự kiện bất biến (`[Deposited(200), Withdrew(50)]`). Trạng thái hiện tại chỉ là phép `events.reduce(reducer, initialState)` — nhờ đó bạn có thể **Du hành thời gian (Time Travel)** tới bất kỳ mốc lịch sử nào, kiểm toán đầy đủ (Audit Log), và đồng bộ Offline dễ dàng!',
      en: 'Instead of mutating snapshots in place, **Event Sourcing** records an append-only ledger of immutable domain events (`events.reduce(reducer, initial)`). You gain exact audit logs, time-travel replay to any timestamp, and clean offline event merging.',
    },
    keyPoints: [
      { vi: 'Append-only Event Log: mọi thao tác người dùng tạo ra 1 sự kiện bất biến có `{ id, type, payload, timestamp }`. Không bao giờ sửa/xóa sự kiện đã ghi.', en: 'Append-only domain events (`{ id, type, payload, timestamp }`) are immutable facts—never edited retroactively.' },
      { vi: 'State Projection: `currentState = events.reduce(applyEvent, initialState)` là hàm thuần tất định (cùng log luôn cho ra đúng cùng 1 state!).', en: 'Project current state purely with `events.reduce(applyEvent, initialState)`.' },
      { vi: 'Snapshots định kỳ: nếu log dài tới 50.000 events, lưu checkpoint snapshot mỗi 500 events để không phải replay từ sự kiện số 0!', en: 'Create periodic snapshots (e.g. every 500 events) so replay starts from the nearest checkpoint rather than event 0.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Trình chỉnh sửa thiết kế/văn bản (Figma/Notion), hệ thống tài chính cần audit log, đồng bộ offline-first dựa trên log thao tác.', en: 'Design tools, rich editors, financial ledgers, and offline-first sync engines.' },
      ],
      whenToAvoid: [
        { vi: 'Form cài đặt hồ sơ đơn giản chỉ cần lưu 1 bản ghi cuối cùng (CRUD thuần túy gọn nhẹ hơn nhiều!).', en: 'Simple CRUD user settings where history replay adds needless complexity.' },
      ],
    },
    pitfalls: [
      { vi: 'Nhét hành động ngẫu nhiên (`Math.random()` hoặc `Date.now()`) vào bên trong hàm reducer `applyEvent` -> mỗi lần replay sẽ ra một kết quả khác nhau! Mọi giá trị ngẫu nhiên/thời gian phải sinh lúc tạo Event!', en: 'Calling `Math.random()` or `Date.now()` inside the projection reducer breaks determinism across replays—bake timestamps/IDs into the event object when created.' },
    ],
    interviewTips: [
      { vi: 'Kết hợp Event Sourcing với **Undo/Redo**, **Offline Sync**, và **Time-Travel Debugging** — và nhắc kỹ quy tắc **Deterministic Reducer + Periodic Snapshots**!', en: 'Connect Event Sourcing to Time-Travel Undo, Offline Sync, Deterministic Reducers, and Periodic Snapshots.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Event Sourcing Ledger + Time-Travel Replay', en: 'Event Sourcing Ledger & Time-Travel Projection' },
      description: { vi: 'Replay chuỗi sự kiện bất biến từ bước 0 đến N để tái tạo chính xác trạng thái tại mọi thời điểm lịch sử.', en: 'Replay an immutable event stream up to any index N to inspect historical projections.' },
      mode: 'ts',
      code: `type BankEvent =
  | { id: string; type: 'OPENED'; owner: string }
  | { id: string; type: 'DEPOSITED'; amount: number }
  | { id: string; type: 'WITHDREW'; amount: number };

function applyEvent(state: { owner: string; balance: number }, ev: BankEvent) {
  switch (ev.type) {
    case 'OPENED': return { owner: ev.owner, balance: 0 };
    case 'DEPOSITED': return { ...state, balance: state.balance + ev.amount };
    case 'WITHDREW': return { ...state, balance: state.balance - ev.amount };
  }
}

const eventLog: BankEvent[] = [
  { id: 'e1', type: 'OPENED', owner: 'An' },
  { id: 'e2', type: 'DEPOSITED', amount: 500 },
  { id: 'e3', type: 'WITHDREW', amount: 120 },
  { id: 'e4', type: 'DEPOSITED', amount: 80 },
];

const replayAt = (stepCount: number) =>
  eventLog.slice(0, stepCount).reduce(applyEvent, { owner: '', balance: 0 });

console.log('After event #2:', replayAt(2));
console.log('After event #3:', replayAt(3));
console.log('Current state (#4):', replayAt(4));`,
      tryItPrompt: { vi: 'Mở tab Interactive Lab ("Event Sourcing & Undo/Redo") để kéo thanh Time-Travel Scrubber trực tiếp trên giao diện Kanban!', en: 'Open the Interactive Lab tab to scrub through live Event Sourcing time-travel on a Kanban task board!' },
    },
    challenge: {
      id: 'challenge-replay-events',
      topicId: 'event-sourcing',
      categoryId: 'common-patterns',
      title: { vi: 'Cài đặt replayEventLog hỗ trợ UpTo & Snapshot', en: 'Implement replayEventLog w/ Snapshot Checkpoint' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm `replayEventLog<S, E>(events: E[], reducer: (state: S, event: E) => S, initialState: S, options?: { upToIndex?: number; snapshot?: { state: S; appliedCount: number } }): S`. Nếu có `snapshot` hợp lệ (`snapshot.appliedCount <= targetCount`), bắt đầu `reduce` từ `snapshot.state` và chỉ phát tiếp phần `events.slice(snapshot.appliedCount, targetCount)` để tối ưu hiệu năng!',
        en: 'Implement `replayEventLog<S, E>(events, reducer, initialState, { upToIndex?, snapshot? })`. Replay events up to `targetCount = upToIndex ?? events.length`. If `snapshot` is provided with `snapshot.appliedCount <= targetCount`, resume reducing from `snapshot.state` over `events.slice(snapshot.appliedCount, targetCount)`.',
      },
      starterCode: `export function replayEventLog<S, E>(
  events: E[],
  reducer: (state: S, event: E) => S,
  initialState: S,
  options: { upToIndex?: number; snapshot?: { state: S; appliedCount: number } } = {}
): S {
  // TODO: compute clamped targetCount and apply snapshot checkpoint optimization
  return initialState;
}`,
      solutionCode: `export function replayEventLog<S, E>(
  events: E[],
  reducer: (state: S, event: E) => S,
  initialState: S,
  options: { upToIndex?: number; snapshot?: { state: S; appliedCount: number } } = {}
): S {
  const targetCount = Math.max(0, Math.min(events.length, options.upToIndex ?? events.length));
  const snap = options.snapshot;

  if (snap && snap.appliedCount >= 0 && snap.appliedCount <= targetCount) {
    return events.slice(snap.appliedCount, targetCount).reduce(reducer, snap.state);
  }
  return events.slice(0, targetCount).reduce(reducer, initialState);
}`,
      testCode: `test('replays slices and accelerates via snapshot checkpoint', () => {
  const events = [10, 5, -3, 20, -2];
  const sum = (s: number, e: number) => s + e;

  expect(replayEventLog(events, sum, 0)).toBe(30);
  expect(replayEventLog(events, sum, 0, { upToIndex: 3 })).toBe(12);

  let stepsCalled = 0;
  const countedSum = (s: number, e: number) => {
    stepsCalled += 1;
    return s + e;
  };
  const fast = replayEventLog(events, countedSum, 0, {
    snapshot: { state: 12, appliedCount: 3 },
  });
  expect(fast).toBe(30);
  expect(stepsCalled).toBe(2); // Only replayed index 3 and 4!
});`,
      hints: [
        { vi: 'Giới hạn `targetCount = Math.max(0, Math.min(events.length, options.upToIndex ?? events.length))`.', en: 'Clamp `targetCount` safely between `0` and `events.length`.' },
        { vi: 'Nếu `snapshot.appliedCount <= targetCount`, dùng `events.slice(snapshot.appliedCount, targetCount).reduce(reducer, snapshot.state)`.', en: 'When `snapshot.appliedCount <= targetCount`, slice from `snapshot.appliedCount` to `targetCount` starting at `snapshot.state`.' },
      ],
    },
    quiz: [
      {
        id: 'q-esrc-1',
        topicId: 'event-sourcing',
        categoryId: 'common-patterns',
        question: { vi: 'Điều gì PHẢI tránh bên trong hàm projection reducer `(state, event) => nextState` của Event Sourcing?', en: 'What must NEVER happen inside an Event Sourcing projection reducer?' },
        options: [
          { vi: 'Tạo giá trị không tất định như `Date.now()` hoặc `Math.random()` (phải gắn sẵn giá trị vào Event ngay lúc sự kiện phát sinh).', en: 'Non-deterministic logic like `Date.now()` or `Math.random()`, which must be captured on the event payload at creation time.' },
          { vi: 'Dùng câu lệnh `switch (event.type)`.', en: 'Using `switch (event.type)`.' },
          { vi: 'Trả về bản sao object mới bằng spread syntax.', en: 'Returning shallow object copies.' },
          { vi: 'Cộng trừ số nguyên.', en: 'Integer arithmetic.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Replay cùng một event log phải luôn cho ra kết quả giống hệt nhau; reducer bắt buộc phải thuần khiết và tất định (deterministic).',
          en: 'Deterministic pure reducers guarantee identical projected state on every replay.',
        },
      },
      {
        id: 'q-esrc-2',
        topicId: 'event-sourcing',
        categoryId: 'common-patterns',
        question: { vi: 'Khi nhật ký Event Log tích tụ tới hàng trăm nghìn sự kiện làm replay từ đầu quá chậm, kỹ thuật tối ưu chuẩn là gì?', en: 'How do Event Sourced apps avoid slow full-log replay when logs grow to 100,000+ events?' },
        options: [
          { vi: 'Lưu **Periodic Snapshots** (checkpoint định kỳ) để chỉ cần nạp snapshot gần nhất rồi replay phần sự kiện mới phía sau nó.', en: 'Save **Periodic Snapshots** so projections load the latest checkpoint and replay only subsequent delta events.' },
          { vi: 'Xóa sạch toàn bộ lịch sử sự kiện.', en: 'Delete all historical events.' },
          { vi: 'Chuyển sang dùng `innerHTML`.', en: 'Switch to `innerHTML`.' },
          { vi: 'Gọi API polling mỗi 10ms.', en: 'Poll every 10ms.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Snapshots biến thời gian khởi tạo từ O(total history) về O(events since last checkpoint).',
          en: 'Snapshots bound startup replay time to only the delta since the latest checkpoint.',
        },
      },
    ],
    relatedTopicIds: ['undo-redo', 'reducer-flux-pattern', 'conflict-resolution'],
  },

  {
    ...TOPIC_META_MAP['reducer-flux-pattern'],
    mentalModel: {
      vi: 'Tách biệt hoàn toàn **Ý định xảy ra cái gì** (Action object `{ type: "FILTER_CHANGED", value: "perf" }`) khỏi **Trạng thái biến đổi thế nào** (Pure Reducer function `(state, action) => nextState`). Nhờ đó toàn bộ logic UI dễ test như toán học, dễ ghi log và ghép nối không rối!',
      en: 'Decouple **what happened** (an Action object) from **how state transitions** (a pure `(state, action) => nextState` Reducer)—turning messy UI callbacks into deterministic, unit-testable state machines.',
    },
    keyPoints: [
      { vi: 'Dùng TypeScript Discriminated Union cho `Action` và `State` giúp compiler kiểm tra chặt chẽ mọi nhánh chuyển trạng thái.', en: 'Model `Action` and `State` as TypeScript discriminated unions so exhaustive switches catch missing cases at compile time.' },
      { vi: 'Rất hiệu quả khi nhiều state phụ thuộc nhau thay đổi cùng một lúc (ví dụ chuyển tab vừa đổi filter vừa reset page về 1 và hủy error cũ).', en: 'Shines when one interaction transitions multiple coupled fields atomically (e.g., changing category resets page, clears errors, and updates query).' },
      { vi: 'Trong React, `useReducer` cho phép truyền `dispatch` ổn định qua Context mà không bao giờ thay đổi tham chiếu giữa các lần render!', en: 'React `useReducer` provides a referentially stable `dispatch` function ideal for passing down Context without consumer churn.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Form nhiều bước, giỏ hàng nhiều điều kiện, bộ lọc phức tạp, mini state machine nội bộ.', en: 'Multi-step wizards, filter toolbars, checkout carts, and local finite state machines.' },
      ],
      whenToAvoid: [
        { vi: 'Biến đơn giản độc lập như bật/tắt 1 modal (`useState(false)` gọn nhẹ và trực tiếp hơn).', en: 'Standalone toggles (`const [open, setOpen] = useState(false)`) where reducer boilerplate adds zero value.' },
      ],
    },
    pitfalls: [
      { vi: 'Truyền trực tiếp `dispatch` lẫn `state` trong cùng một Context duy nhất làm mọi component chỉ muốn gọi `dispatch(...)` bị re-render theo khi `state` đổi -> hãy tách `StateContext` và `DispatchContext`!', en: 'Combining `state` and `dispatch` in one React Context re-renders dispatch-only buttons on every state change—split into two contexts!' },
    ],
    interviewTips: [
      { vi: 'Nhắc mẹo **Split StateContext & DispatchContext** với `useReducer`: các nút chỉ kích hoạt action dùng `DispatchContext` sẽ KHÔNG BAO GIỜ re-render thừa khi state thay đổi!', en: 'Highlight splitting `StateContext` and `DispatchContext`: dispatch-only consumers never re-render when `state` updates because `dispatch` identity is stable.' },
    ],
    example: {
      title: { vi: 'Multi-Field Wizard State Machine dùng Pure Reducer', en: 'Exhaustive TypeScript Reducer State Machine' },
      description: { vi: 'Trình từng bước (Step 1 -> Step 2 -> Submitting -> Done) cập nhật nguyên tử mọi trường liên quan trong một `dispatch`.', en: 'Drive a multi-step checkout wizard using atomic reducer transitions instead of scattered `useState` hooks.' },
      mode: 'react',
      code: `import React, { useReducer } from 'react';

type WizardState =
  | { step: 'plan'; plan: 'free' | 'pro'; error: string | null }
  | { step: 'confirm'; plan: 'free' | 'pro'; agreed: boolean }
  | { step: 'done'; plan: 'free' | 'pro' };

type Action =
  | { type: 'SELECT_PLAN'; plan: 'free' | 'pro' }
  | { type: 'NEXT' }
  | { type: 'TOGGLE_AGREE' }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };

function wizardReducer(state: WizardState, action: Action): WizardState {
  if (action.type === 'RESET') return { step: 'plan', plan: 'free', error: null };
  if (state.step === 'plan') {
    if (action.type === 'SELECT_PLAN') return { ...state, plan: action.plan, error: null };
    if (action.type === 'NEXT') return { step: 'confirm', plan: state.plan, agreed: false };
  }
  if (state.step === 'confirm') {
    if (action.type === 'TOGGLE_AGREE') return { ...state, agreed: !state.agreed };
    if (action.type === 'SUBMIT' && state.agreed) return { step: 'done', plan: state.plan };
  }
  return state;
}

export default function App() {
  const [state, dispatch] = useReducer(wizardReducer, { step: 'plan', plan: 'free', error: null });

  return (
    <div className="card col">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>Wizard Step: <span className="badge">{state.step.toUpperCase()}</span></strong>
        <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      </div>
      {state.step === 'plan' && (
        <div className="row">
          <button className={state.plan === 'free' ? 'primary' : ''} onClick={() => dispatch({ type: 'SELECT_PLAN', plan: 'free' })}>Free</button>
          <button className={state.plan === 'pro' ? 'primary' : ''} onClick={() => dispatch({ type: 'SELECT_PLAN', plan: 'pro' })}>Pro</button>
          <button onClick={() => dispatch({ type: 'NEXT' })}>Continue -&gt;</button>
        </div>
      )}
      {state.step === 'confirm' && (
        <div className="col">
          <label className="row" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={state.agreed} onChange={() => dispatch({ type: 'TOGGLE_AGREE' })} />
            <span>Confirm {state.plan.toUpperCase()} plan terms</span>
          </label>
          <button className="primary" disabled={!state.agreed} onClick={() => dispatch({ type: 'SUBMIT' })}>Activate</button>
        </div>
      )}
      {state.step === 'done' && <div style={{ color: '#22c55e' }}>Activated {state.plan.toUpperCase()} plan!</div>}
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử thêm nút Back trong bước `confirm` để quay lại bước `plan` mà vẫn giữ nguyên gói `state.plan` đã chọn.', en: 'Add a `BACK` action in the `confirm` branch returning to `plan` while preserving the chosen tier.' },
    },
    quiz: [
      {
        id: 'q-redpat-1',
        topicId: 'reducer-flux-pattern',
        categoryId: 'common-patterns',
        question: { vi: 'Tại sao nên tách `StateContext` và `DispatchContext` riêng khi chia sẻ `useReducer` xuống cây component lớn?', en: 'Why split `StateContext` and `DispatchContext` when distributing `useReducer` across large subtrees?' },
        options: [
          { vi: 'Hàm `dispatch` luôn giữ nguyên tham chiếu ổn định; tách Context giúp các nút chỉ gọi `dispatch` không bị re-render thừa mỗi khi `state` thay đổi.', en: '`dispatch` has a stable reference; splitting contexts prevents dispatch-only triggers from re-rendering whenever `state` updates.' },
          { vi: 'React cấm truyền 2 giá trị trong một Context.', en: 'React forbids objects in Context.' },
          { vi: 'Để giảm tốc độ render xuống 30fps.', en: 'To cap FPS at 30.' },
          { vi: 'Để tự động lưu vào Cookie.', en: 'To store cookies.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Các component chỉ subscribe `DispatchContext` miễn nhiễm hoàn toàn khỏi các lần re-render do `state` cập nhật.',
          en: 'Consumers reading only `DispatchContext` skip reconciliation on state changes.',
        },
      },
      {
        id: 'q-redpat-2',
        topicId: 'reducer-flux-pattern',
        categoryId: 'common-patterns',
        question: { vi: 'Ưu điểm lớn nhất của `useReducer` so với nhiều `useState` rời rạc khi thiết kế state machine phức tạp là gì?', en: 'When does `useReducer` beat multiple independent `useState` calls?' },
        options: [
          { vi: 'Đóng gói chuyển đổi nhiều trường state liên quan thành 1 transaction nguyên tử, dễ kiểm soát trạng thái hợp lệ và viết unit test thuần cho reducer.', en: 'Updates coupled state fields atomically inside one pure, unit-testable transition function avoiding invalid half-states.' },
          { vi: 'Không cần viết JavaScript.', en: 'Requires no JavaScript.' },
          { vi: 'Tự động gọi API REST.', en: 'Calls REST APIs automatically.' },
          { vi: 'Bỏ qua kiểm tra TypeScript.', en: 'Skips TypeScript types.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Logic nghiệp vụ chuyển trạng thái tập trung vào một hàm thuần túy dễ kiểm thử mà không cần mount React component.',
          en: 'Pure reducer transitions keep business state rules cohesive and trivially unit-testable without DOM mounts.',
        },
      },
    ],
    relatedTopicIds: ['flux-architecture', 'event-sourcing', 'undo-redo'],
  },

  {
    ...TOPIC_META_MAP['undo-redo'],
    mentalModel: {
      vi: 'Hai ngăn xếp kinh điển: `past` (lịch sử đã qua) và `future` (những bước vừa Undo chờ Redo) kẹp giữa `present`! Mỗi thay đổi mới đẩy `present` vào `past` và XÓA SẠCH `future`. Với dữ liệu lớn (canvas 10MB), thay vì chụp snapshot cả state hãy dùng **Command Pattern** lưu cặp `{ do, undo }` gọn nhẹ!',
      en: 'Maintain two stacks—`past` and `future`—around `present`. A new edit pushes `present` onto `past` and clears `future`. For huge documents/canvases, store lightweight `{ apply, invert }` commands instead of cloning full snapshots.',
    },
    keyPoints: [
      { vi: 'State Snapshot Stack: `{ past: T[], present: T, future: T[] }`: `undo()` đẩy `present` sang `future` và pop đỉnh `past`; `redo()` làm ngược lại; `set(next)` đẩy `present` vào `past` và đặt `future = []`!', en: 'Snapshot stacks (`{ past, present, future }`): `set` clears `future`; `undo` pops `past` and pushes `present` onto `future`; `redo` pops `future`.' },
      { vi: 'Giới hạn chiều sâu lịch sử (`maxHistory = 50–100`) để tránh tràn RAM khi người dùng sửa suốt nhiều giờ.', en: 'Cap history stack depth (e.g., 50-100 steps) so long editing sessions never bloat memory.' },
      { vi: 'Gom nhóm (Coalescing/Debouncing) khi gõ phím nhanh hoặc kéo thanh trượt (`onDrag`) để bấm Undo một phát quay về trước khi kéo chứ không lùi từng milimet!', en: 'Coalesce rapid keystrokes or continuous slider drags into single undo transactions instead of 200 tiny pixel steps.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Snapshot Stack cho cấu hình/form/bảng nhỏ gọn. Command Pattern (`{ execute, undo }` hoặc JSON Patches RFC 6902) cho Canva/Figma/Rich Editor dữ liệu lớn.', en: 'Snapshots for medium immutable state; inverse Command Pattern or JSON Patches for massive canvases.' },
      ],
      whenToAvoid: [
        { vi: 'Đừng đặt Undo vào hành động đã phát thanh ra ngoài không thu hồi được (như gửi email thật hoặc trừ tiền) trừ khi có hộp trì hoãn 5 giây "Gmail Undo Send" trước khi gửi thật!', en: 'Irreversible external side effects cannot use local undo unless delayed behind a cancellable send buffer ("Gmail Undo Send").' },
      ],
    },
    pitfalls: [
      { vi: 'Thực hiện thay đổi mới sau khi vừa bấm `Undo` mà quên xóa mảng `future` -> nhánh lịch sử tương lai bị rối loạn khi bấm `Redo`!', en: 'Forgetting to clear `future` when applying a new edit after an `undo` leaves stale future states reachable on `redo`.' },
    ],
    interviewTips: [
      { vi: 'Phân biệt **Snapshot Memento (`past/present/future`)** vs **Inverse Command Pattern** vs **Patch Diffs (Immer `produceWithPatches`)** + mẹo **Transaction Coalescing** khi gõ/kéo chuột!', en: 'Compare Snapshot Stacks vs Command Inversion vs Immer Patches, and highlight coalescing continuous drags/keystrokes into single undo entries.' },
    ],
    example: {
      title: { vi: 'Interactive Sketch Canvas với Undo / Redo (Ctrl+Z) & History Depth', en: 'Interactive Undo/Redo Stack Demo' },
      description: { vi: 'Thêm/xóa các thẻ chip rồi thử bấm Undo, Redo, và thực hiện thêm mới ngay sau khi Undo để thấy `future` được dọn sạch!', en: 'Add chips, step backward/forward through `past` and `future` stacks, and watch `future` reset on new edits.' },
      mode: 'react',
      code: `import React, { useState } from 'react';

export default function App() {
  const [history, setHistory] = useState<{ past: string[][]; present: string[]; future: string[] }>({
    past: [],
    present: ['Header', 'Hero'],
    future: [],
  });

  const commit = (next: string[]) => {
    setHistory((h) => ({ past: [...h.past, h.present].slice(-20), present: next, future: [] }));
  };

  const undo = () => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const prev = h.past[h.past.length - 1];
      return { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future] };
    });
  };

  const redo = () => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const [next, ...rest] = h.future;
      return { past: [...h.past, h.present], present: next, future: rest };
    });
  };

  return (
    <div className="col">
      <div className="row">
        <button disabled={history.past.length === 0} onClick={undo}>↶ Undo ({history.past.length})</button>
        <button disabled={history.future.length === 0} onClick={redo}>↷ Redo ({history.future.length})</button>
        <button className="primary" onClick={() => commit([...history.present, 'Block #' + (history.present.length + 1)])}>+ Add Block</button>
        <button disabled={history.present.length === 0} onClick={() => commit(history.present.slice(0, -1))}>- Pop Last</button>
      </div>
      <div className="card row">
        {history.present.length === 0 ? <span className="muted">Empty canvas</span> : history.present.map((b, i) => (
          <span key={i} className="badge">{b}</span>
        ))}
      </div>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử bấm `+ Add Block` 2 lần -> bấm `Undo` -> bấm `- Pop Last` -> chú ý bộ đếm `Redo` tự động về 0 vì nhánh tương lai cũ đã được thay thế!', en: 'Add 2 blocks, hit Undo, then Pop Last—watch the Redo counter reset to 0 as a fresh timeline starts.' },
    },
    challenge: {
      id: 'challenge-undo-redo',
      topicId: 'undo-redo',
      categoryId: 'common-patterns',
      title: { vi: 'Cài đặt createUndoRedoManager với Max History', en: 'Implement createUndoRedoManager' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm `createUndoRedoManager<T>(initialState: T, maxHistory = 50)` trả về các phương thức: `get(): T`, `set(next: T): T` (đẩy `present` vào `past`, cắt gọn `past` không vượt quá `maxHistory` bằng cách bỏ phần tử cũ nhất ở đầu, và xóa sạch `future`), `undo(): boolean` (trả `false` nếu không undo được), `redo(): boolean` (trả `false` nếu không redo được), `canUndo(): boolean`, `canRedo(): boolean`. Nếu `Object.is(next, present)` trong `set(next)` thì bỏ qua không đẩy vào lịch sử.',
        en: 'Implement `createUndoRedoManager<T>(initialState, maxHistory = 50)` with `get()`, `set(next)` (no-op if `Object.is(next, present)`, else pushes `present` to `past` capped at `maxHistory` oldest-dropped, and clears `future`), `undo(): boolean`, `redo(): boolean`, `canUndo()`, `canRedo()`.',
      },
      starterCode: `export function createUndoRedoManager<T>(initialState: T, maxHistory = 50) {
  // TODO: manage past stack, present state, future stack, and history cap
  return {
    get: (): T => initialState,
    set: (_next: T): T => initialState,
    undo: (): boolean => false,
    redo: (): boolean => false,
    canUndo: (): boolean => false,
    canRedo: (): boolean => false,
  };
}`,
      solutionCode: `export function createUndoRedoManager<T>(initialState: T, maxHistory = 50) {
  let past: T[] = [];
  let present = initialState;
  let future: T[] = [];

  return {
    get(): T {
      return present;
    },
    set(next: T): T {
      if (Object.is(next, present)) return present;
      past = [...past, present];
      if (past.length > maxHistory) {
        past = past.slice(past.length - maxHistory);
      }
      present = next;
      future = [];
      return present;
    },
    undo(): boolean {
      if (past.length === 0) return false;
      const previous = past[past.length - 1];
      past = past.slice(0, -1);
      future = [present, ...future];
      present = previous;
      return true;
    },
    redo(): boolean {
      if (future.length === 0) return false;
      const [next, ...rest] = future;
      past = [...past, present];
      present = next;
      future = rest;
      return true;
    },
    canUndo(): boolean {
      return past.length > 0;
    },
    canRedo(): boolean {
      return future.length > 0;
    },
  };
}`,
      testCode: `test('supports set, undo, redo, branch clearing, and maxHistory cap', () => {
  const mgr = createUndoRedoManager('v0', 2);
  mgr.set('v1');
  mgr.set('v2');
  mgr.set('v3'); // past capped at 2: ['v1', 'v2']
  expect(mgr.get()).toBe('v3');
  expect(mgr.canUndo()).toBe(true);
  expect(mgr.canRedo()).toBe(false);

  expect(mgr.undo()).toBe(true);
  expect(mgr.get()).toBe('v2');
  expect(mgr.undo()).toBe(true);
  expect(mgr.get()).toBe('v1');
  expect(mgr.undo()).toBe(false); // v0 was evicted by maxHistory = 2

  expect(mgr.redo()).toBe(true);
  expect(mgr.get()).toBe('v2');

  mgr.set('v2-branch');
  expect(mgr.canRedo()).toBe(false); // future cleared!
});`,
      hints: [
        { vi: 'Khi `past.length > maxHistory`, cắt giữ lại `maxHistory` phần tử cuối: `past.slice(past.length - maxHistory)`.', en: 'Keep the newest `maxHistory` snapshots via `past.slice(past.length - maxHistory)`.' },
        { vi: 'Kiểm tra `Object.is(next, present)` ở đầu `set(next)` để không lưu trùng trạng thái giống hệt.', en: 'Short-circuit `Object.is(next, present)` in `set`.' },
      ],
    },
    quiz: [
      {
        id: 'q-undo-1',
        topicId: 'undo-redo',
        categoryId: 'common-patterns',
        question: { vi: 'Khi người dùng vừa bấm `Undo` 2 lần rồi thực hiện một thao tác chỉnh sửa mới (`set`), điều gì PHẢI xảy ra với ngăn xếp `future`?', en: 'After hitting `Undo` twice and then performing a brand-new edit, what MUST happen to the `future` (redo) stack?' },
        options: [
          { vi: 'Xóa rỗng ngăn xếp `future` vì nhánh lịch sử mới đã thay thế nhánh cũ.', en: 'Clear the `future` stack completely because the new edit starts a fresh timeline.' },
          { vi: 'Giữ nguyên `future` không đổi.', en: 'Keep `future` intact.' },
          { vi: 'Sao chép `future` vào `past`.', en: 'Copy `future` into `past`.' },
          { vi: 'Khóa không cho chỉnh sửa.', en: 'Lock further edits.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Nếu không làm rỗng `future`, thao tác Redo kế tiếp sẽ nhảy nhầm sang tương lai cũ không khớp hiện tại.',
          en: 'Clearing `future` maintains a single linear active history without contradictory redo branches.',
        },
      },
      {
        id: 'q-undo-2',
        topicId: 'undo-redo',
        categoryId: 'common-patterns',
        question: { vi: 'Trong ứng dụng vẽ Canvas hoặc bảng tính 50.000 ô, giải pháp Undo/Redo nào tiết kiệm RAM hơn hẳn việc clone nguyên state snapshot mỗi lần sửa?', en: 'For a 50,000-cell spreadsheet or large design canvas, what Undo/Redo design avoids cloning massive state snapshots per edit?' },
        options: [
          { vi: 'Command Pattern (lưu cặp hàm/patch đảo ngược `{ do, undo }` hoặc Immer structural sharing patches).', en: 'Command Pattern (storing lightweight `{ apply, invert }` commands or structural-sharing Immer JSON patches).' },
          { vi: 'Chụp ảnh màn hình Base64 lưu vào Cookie.', en: 'Store PNG screenshots in cookies.' },
          { vi: 'Dùng `JSON.parse(JSON.stringify(hugeState))` mỗi lần di chuột.', en: 'Deep clone with `JSON.stringify` on every mousemove.' },
          { vi: 'Chỉ hỗ trợ tối đa 1 bước Undo.', en: 'Limit to 1 undo step.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Chỉ lưu phép biến đổi delta (ví dụ `{ cell: "B4", prev: 10, next: 25 }`) tốn vài chục byte thay vì vài chục MB!',
          en: 'Inverse commands and delta patches consume bytes per edit rather than megabytes of duplicated snapshots.',
        },
      },
    ],
    relatedTopicIds: ['event-sourcing', 'reducer-flux-pattern', 'conflict-resolution'],
  },

  {
    ...TOPIC_META_MAP['media-streaming'],
    mentalModel: {
      vi: 'Không bao giờ ép người dùng tải nguyên file MP4 2GB mới xem được! **Adaptive Bitrate Streaming (HLS `.m3u8` / DASH `.mpd`)** chặt video thành từng mảnh nhỏ 2–6 giây với nhiều độ phân giải (360p, 720p, 1080p, 4K), rồi đẩy qua **MSE (Media Source Extensions)** tự hạ/tăng chất lượng mượt mà theo tốc độ mạng thực tế từng giây!',
      en: 'Instead of buffering a monolithic 2GB MP4, **HLS/DASH Adaptive Bitrate (ABR)** slices video into 2-6 second segments across quality rungs (360p–4K), while **Media Source Extensions (MSE)** switches rungs seamlessly on bandwidth changes.',
    },
    keyPoints: [
      { vi: 'Manifest playlist (`.m3u8` cho HLS, `.mpd` cho DASH): danh sách trỏ tới từng đoạn segment `.ts`/`.m4s` và từng mức bitrate.', en: 'Manifests (`.m3u8` / `.mpd`) list available bitrate ladders and time-indexed media segments.' },
      { vi: 'Thuật toán ABR (Adaptive Bitrate): đo throughput thực tế lúc tải từng segment + mực nước đệm `SourceBuffer` -> giảm xuống 480p trước khi buffer cạn gây quay vòng tròn (rebuffer), nâng lên 1080p khi Wi-Fi ổn định!', en: 'ABR loops inspect measured download throughput and buffer occupancy to avoid rebuffering stalls while maximizing sharpness.' },
      { vi: 'Tối ưu Player UX: tải trước 2–3 segment kế tiếp (sliding buffer window), giải phóng segment cũ đã xem để không tràn RAM tab, kết hợp sprite thumbnail lúc tua thanh seekbar và preload `metadata`.', en: 'Buffer 2-3 segments ahead, evict watched buffer behind playhead, and show seekbar sprite thumbnails.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Video khóa học dài > 1 phút, phim, livestream độ trễ thấp (LL-HLS), nền tảng video UGC (YouTube/Netflix).', en: 'Long-form courses, OTT streaming, live video (LL-HLS), and multi-quality players.' },
      ],
      whenToAvoid: [
        { vi: 'Video lặp nền ngắn 4 giây (<1MB) -> dùng thẳng thẻ `<video src="clip.mp4" autoplay muted loop playsinline>` đơn giản hơn nhiều so với HLS/MSE!', en: 'Tiny 4-second looping UI clips—plain `<video src="clip.mp4">` via HTTP Range requests is simpler and zero-JS.' },
      ],
    },
    pitfalls: [
      { vi: 'Đặt `preload="auto"` lên danh sách 15 thẻ `<video>` trong feed khiến trình duyệt tải trước cùng lúc hàng chục MB làm nghẽn băng thông trang!', en: 'Placing `preload="auto"` on 15 feed video tags exhausts connections and wastes mobile bandwidth; use `preload="metadata"` or `none`.' },
    ],
    interviewTips: [
      { vi: 'Nắm trọn luồng kiến trúc Video Streaming Player: **Manifest (HLS/DASH) -> ABR Bitrate Ladder -> MSE (`MediaSource` + `SourceBuffer`) -> Buffer Management (ahead vs eviction) -> Seek Scrubbing Thumbnails + DRM/EME (nếu bảo vệ bản quyền)**.', en: 'Outline the complete streaming pipeline: Manifests -> ABR selector -> MSE `SourceBuffer` -> sliding window eviction -> sprite preview thumbnails.' },
    ],
    example: {
      title: { vi: 'Bộ chọn chất lượng Adaptive Bitrate (ABR Engine)', en: 'Adaptive Bitrate (ABR) Ladder Selector' },
      description: { vi: 'Mô phỏng thuật toán ABR quyết định chọn 1080p, 720p hay 360p dựa trên tốc độ tải segment gần nhất và dung lượng buffer còn lại.', en: 'Simulate an ABR controller balancing network throughput and remaining buffer seconds to pick video quality rungs.' },
      mode: 'ts',
      code: `interface QualityRung { label: string; bitrateKbps: number }
const LADDER: QualityRung[] = [
  { label: '360p', bitrateKbps: 800 },
  { label: '720p', bitrateKbps: 2500 },
  { label: '1080p', bitrateKbps: 5000 },
  { label: '4K', bitrateKbps: 15000 },
];

function selectABRRung(measuredKbps: number, bufferSeconds: number): QualityRung {
  // Safety factor 0.75 + panic drop if buffer is dangerously low (<4s)
  const budgetKbps = bufferSeconds < 4 ? measuredKbps * 0.45 : measuredKbps * 0.75;
  const candidates = LADDER.filter((r) => r.bitrateKbps <= budgetKbps);
  return candidates[candidates.length - 1] ?? LADDER[0];
}

console.log('Healthy Wi-Fi (8000 kbps, 12s buffer):', selectABRRung(8000, 12));
console.log('Tunnel drop (3200 kbps, 2s buffer!):', selectABRRung(3200, 2));
console.log('Fiber 5G (25000 kbps, 18s buffer):', selectABRRung(25000, 18));`,
      tryItPrompt: { vi: 'Chú ý trường hợp `bufferSeconds < 4`: hệ số an toàn hạ xuống 0.45 để ưu tiên KHÔNG BAO GIỜ bị đứng hình rebuffer!', en: 'Notice how low buffer (<4s) aggressively drops bitrate budget to prioritize stall-free playback.' },
    },
    quiz: [
      {
        id: 'q-media-1',
        topicId: 'media-streaming',
        categoryId: 'common-patterns',
        question: { vi: 'Web API nào của trình duyệt cho phép JavaScript (như `hls.js` / `dash.js`) tự nạp từng đoạn segment video vào thẻ `<video>` để chuyển đổi bitrate mượt mà?', en: 'Which browser API allows JS players (`hls.js`, `dash.js`) to feed fetched segments directly into `<video>` for ABR switching?' },
        options: [
          { vi: 'Media Source Extensions (MSE — `MediaSource` & `SourceBuffer`).', en: 'Media Source Extensions (MSE — `MediaSource` & `SourceBuffer`).' },
          { vi: 'WebGL Canvas 2D.', en: 'WebGL Canvas 2D.' },
          { vi: 'localStorage.', en: 'localStorage.' },
          { vi: 'Intl.Segmenter.', en: 'Intl.Segmenter.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'MSE cho phép JS tải segment qua `fetch`, chọn mức bitrate phù hợp và append buffer trực tiếp vào `<video>`.',
          en: 'MSE decouples transport/ABR logic from native `<video>` decoding via `SourceBuffer` streams.',
        },
      },
      {
        id: 'q-media-2',
        topicId: 'media-streaming',
        categoryId: 'common-patterns',
        question: { vi: 'Khi trình bày một Feed có 20 video trên màn hình, thuộc tính `<video>` nào NÊN đặt mặc định trước khi người dùng bấm Play hoặc cuộn tới?', en: 'In a feed containing 20 video cards, which `preload` setting prevents wasting bandwidth on initial page load?' },
        options: [
          { vi: '`preload="metadata"` hoặc `preload="none"` kết hợp ảnh `poster`.', en: '`preload="metadata"` or `preload="none"` paired with a lightweight `poster` image.' },
          { vi: '`preload="auto"` cho tất cả 20 video.', en: '`preload="auto"` on all 20 videos.' },
          { vi: 'Chuyển hết video sang GIF.', en: 'Convert all 20 videos to GIF.' },
          { vi: 'Xóa thuộc tính `controls`.', en: 'Remove `controls`.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: '`poster` + `preload="none"` (hoặc `metadata`) chỉ tải vài KB ban đầu thay vì pre-buffer hàng chục MB video chưa xem.',
          en: 'Poster images with `preload="metadata"`/`none` preserve bandwidth until playback intent is clear.',
        },
      },
    ],
    relatedTopicIds: ['image-adaptive-loading', 'perf-adaptive-loading', 'sse'],
  },

  {
    ...TOPIC_META_MAP['conflict-resolution'],
    mentalModel: {
      vi: 'Hai người cùng sửa một công việc khi offline (hoặc bấm Lưu song song trên hai tab)! Có 3 mức giải quyết xung đột từ đơn giản đến nâng cao: **Version Check / Optimistic Locking** (báo user ghi đè hoặc hợp nhất thủ công), **Last-Write-Wins (LWW)** theo timestamp + client tie-breaker, và **CRDT / OT** tự động trộn không mất ký tự trong cộng tác thời gian thực!',
      en: 'Concurrent edits from two tabs or offline devices collide. Resolve conflicts across three tiers: **Optimistic Concurrency Control** (`version`/ETag check + manual merge), **Last-Write-Wins (LWW)** (timestamp + deterministic tie-breaker), or **OT / CRDTs** for automatic character-level merging.',
    },
    keyPoints: [
      { vi: 'Optimistic Concurrency Control (`If-Match: "v4"` / `version: 4`): nếu server đã lên `v5`, server trả `409 Conflict` kèm bản `v5` mới nhất để UI hiện Diff 3 chiều cho user chọn giữ cái nào.', en: 'Optimistic Locking sends `expectedVersion`; mismatched server versions return `409 Conflict` so the UI offers Keep Mine / Take Theirs / Merge.' },
      { vi: 'Field-level LWW (Last-Write-Wins theo từng trường!): A sửa `title`, B sửa `assignee` -> nếu ghép ở mức từng trường thay vì nguyên record sẽ giữ được CẢ HAI thay đổi mà không mất công của ai!', en: 'Field-level LWW resolves timestamps per field (`title`, `status`) instead of whole-record overwrites so independent edits merge cleanly.' },
      { vi: 'CRDT (Conflict-free Replicated Data Types) & OT (Operational Transformation): bắt buộc cho Google Docs / Figma nhiều người cùng gõ từng chữ song song không cần khóa file!', en: 'OT and CRDTs guarantee eventual consistency across concurrent text/canvas edits without central locks.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Optimistic Locking + Merge UI cho Wiki/CMS/Ticket quan trọng (không được phép ghi đè thầm lặng!). Field-level LWW cho Profile/Settings. CRDT (Yjs/Automerge) cho Google Docs/Whiteboard.', en: 'Versioned 409 diff UI for CMS/tickets; Field-level LWW for tasks/settings; CRDTs (Yjs) for multiplayer editors.' },
      ],
      whenToAvoid: [
        { vi: 'Tuyệt đối đừng dùng LWW toàn bộ bản ghi cho bài viết dài nhiều người sửa — người lưu sau sẽ âm thầm xóa sạch toàn bộ công sức viết 2 tiếng của người trước!', en: 'Never use whole-document LWW for collaborative prose—it silently obliterates coworkers’ paragraphs.' },
      ],
    },
    pitfalls: [
      { vi: 'Chỉ so sánh timestamp đồng hồ client mà thiếu tie-breaker (khi 2 thiết bị lệch giờ hoặc trùng mili-giây) hoặc quên chỉnh lệch đồng hồ máy người dùng (clock skew)!', en: 'Relying solely on uncalibrated client wall clocks without deterministic tie-breakers or logical clocks (Lamport/HLC).' },
    ],
    interviewTips: [
      { vi: 'Trình bày thang 3 cấp độ rõ ràng: 1) Whole-record `409 Conflict` + Merge UI, 2) Per-field LWW (Hybrid Logical Clocks), 3) OT vs CRDT (Yjs/Automerge) cho Google Docs / Figma!', en: 'Walk through the 3-tier conflict spectrum: `409` optimistic locking + diff UI -> Field-level LWW -> OT/CRDTs for real-time multiplayer.' },
    ],
    example: {
      title: { vi: 'So sánh Whole-Record Overwrite vs Field-Level LWW Merge', en: 'Field-Level LWW Merge vs Whole-Record Overwrite' },
      description: { vi: 'Thiết bị A sửa `title` lúc t=100, Thiết bị B sửa `done` lúc t=110 — xem Field-level LWW giữ lại trọn vẹn cả hai chỉnh sửa!', en: 'Device A edits `title` at t=100 while Device B toggles `done` at t=110; watch field-level LWW preserve both changes.' },
      mode: 'ts',
      code: `interface TaskFieldState {
  title: { value: string; ts: number; actor: string };
  done: { value: boolean; ts: number; actor: string };
}

function mergeFieldLWW(local: TaskFieldState, remote: TaskFieldState): TaskFieldState {
  const pick = <T,>(a: { value: T; ts: number; actor: string }, b: { value: T; ts: number; actor: string }) => {
    if (b.ts > a.ts) return b;
    if (b.ts === a.ts && b.actor > a.actor) return b; // Deterministic tie-breaker!
    return a;
  };
  return {
    title: pick(local.title, remote.title),
    done: pick(local.done, remote.done),
  };
}

const deviceA: TaskFieldState = {
  title: { value: 'Ship Offline Queue v2', ts: 200, actor: 'A' },
  done: { value: false, ts: 100, actor: 'A' },
};
const deviceB: TaskFieldState = {
  title: { value: 'Ship Offline Queue', ts: 100, actor: 'B' },
  done: { value: true, ts: 180, actor: 'B' },
};

console.log('Merged state preserving BOTH edits:', mergeFieldLWW(deviceA, deviceB));`,
      tryItPrompt: { vi: 'Thử đặt `ts: 200` cho `title` trên cả `deviceA` và `deviceB` để kiểm chứng `actor` tie-breaker luôn cho kết quả giống nhau ở mọi client!', en: 'Give both devices `ts: 200` on `title` to verify the deterministic `actor` tie-breaker guarantees convergence.' },
    },
    challenge: {
      id: 'challenge-resolve-lww',
      topicId: 'conflict-resolution',
      categoryId: 'common-patterns',
      title: { vi: 'Cài đặt resolveConflictLWW (Per-Field + Tie-Breaker)', en: 'Implement Per-Field resolveConflictLWW' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm `resolveConflictLWW<T extends Record<string, unknown>>(local: { fields: T; timestamps: Record<keyof T, number>; clientId: string }, remote: { fields: T; timestamps: Record<keyof T, number>; clientId: string }): { merged: T; conflicts: Array<keyof T> }`. Với từng key: nếu `remote` có `ts > local` lấy của `remote`; nếu `local` > `remote` lấy của `local`; nếu `ts` bằng nhau VÀ giá trị khác nhau (`!Object.is`), thêm key vào mảng `conflicts` rồi lấy giá trị của bên có `clientId` lớn hơn theo thứ tự từ điển (`remote.clientId > local.clientId ? remote : local`) để đảm bảo đồng nhất trên mọi thiết bị!',
        en: 'Implement `resolveConflictLWW(local, remote)` merging per-field timestamps. Higher timestamp wins per key; on exact timestamp ties where values differ (`!Object.is`), record the key in `conflicts` and break ties deterministically using lexicographically larger `clientId` (`remote.clientId > local.clientId`).',
      },
      starterCode: `export function resolveConflictLWW<T extends Record<string, unknown>>(
  local: { fields: T; timestamps: Record<keyof T, number>; clientId: string },
  remote: { fields: T; timestamps: Record<keyof T, number>; clientId: string }
): { merged: T; conflicts: Array<keyof T> } {
  // TODO: merge per-field by timestamp and break equal-timestamp ties deterministically by clientId
  return { merged: { ...local.fields }, conflicts: [] };
}`,
      solutionCode: `export function resolveConflictLWW<T extends Record<string, unknown>>(
  local: { fields: T; timestamps: Record<keyof T, number>; clientId: string },
  remote: { fields: T; timestamps: Record<keyof T, number>; clientId: string }
): { merged: T; conflicts: Array<keyof T> } {
  const merged = {} as T;
  const conflicts: Array<keyof T> = [];
  const keys = Array.from(
    new Set([...Object.keys(local.fields), ...Object.keys(remote.fields)])
  ) as Array<keyof T>;

  for (const key of keys) {
    const lTs = local.timestamps[key] ?? -Infinity;
    const rTs = remote.timestamps[key] ?? -Infinity;
    if (rTs > lTs) {
      merged[key] = remote.fields[key];
    } else if (lTs > rTs) {
      merged[key] = local.fields[key];
    } else {
      if (!Object.is(local.fields[key], remote.fields[key])) {
        conflicts.push(key);
      }
      merged[key] =
        remote.clientId > local.clientId ? remote.fields[key] : local.fields[key];
    }
  }

  return { merged, conflicts };
}`,
      testCode: `test('merges independent fields and resolves exact-ts ties deterministically', () => {
  const res = resolveConflictLWW(
    {
      fields: { title: 'New Title', status: 'todo' },
      timestamps: { title: 200, status: 100 },
      clientId: 'client-a',
    },
    {
      fields: { title: 'Old Title', status: 'done' },
      timestamps: { title: 100, status: 250 },
      clientId: 'client-b',
    }
  );
  expect(res.merged).toEqual({ title: 'New Title', status: 'done' });
  expect(res.conflicts).toEqual([]);

  const tied = resolveConflictLWW(
    { fields: { title: 'Draft A' }, timestamps: { title: 300 }, clientId: 'a' },
    { fields: { title: 'Draft B' }, timestamps: { title: 300 }, clientId: 'b' }
  );
  expect(tied.merged).toEqual({ title: 'Draft B' });
  expect(tied.conflicts).toEqual(['title']);
});`,
      hints: [
        { vi: 'Dùng `Set` gộp tất cả các key từ `local.fields` và `remote.fields`.', en: 'Collect the union of keys across both `local.fields` and `remote.fields`.' },
        { vi: 'Khi `rTs === lTs`, kiểm tra `!Object.is(local.fields[key], remote.fields[key])` rồi push vào `conflicts`, chọn `remote.clientId > local.clientId` làm tie-breaker.', en: 'On `rTs === lTs`, record in `conflicts` if values differ, then pick whichever client has the lexicographically higher `clientId`.' },
      ],
    },
    quiz: [
      {
        id: 'q-conf-1',
        topicId: 'conflict-resolution',
        categoryId: 'common-patterns',
        question: { vi: 'Ưu điểm lớn nhất của Field-level LWW so với Record-level LWW khi hai người sửa cùng một Task offline là gì?', en: 'Why is Field-level LWW superior to Whole-Record LWW when two offline users update the same task?' },
        options: [
          { vi: 'Nếu A sửa Tiêu đề và B sửa Trạng thái, trộn ở mức từng trường giữ được CẢ HAI thay đổi thay vì bên sau ghi đè mất sửa đổi của bên trước.', en: 'Independent edits to different fields (e.g., Title by A, Status by B) both survive instead of one overwriting the other.' },
          { vi: 'Giảm số lượng key JSON xuống 1.', en: 'Collapses JSON to 1 key.' },
          { vi: 'Không cần đồng bộ qua mạng.', en: 'Requires no network sync.' },
          { vi: 'Loại bỏ nhu cầu dùng Database.', en: 'Eliminates databases.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Phạm vi xung đột thu hẹp xuống từng thuộc tính giúp giảm đáng kể mất mát dữ liệu khi hợp nhất.',
          en: 'Narrowing conflict granularity to individual fields preserves orthogonal updates seamlessly.',
        },
      },
      {
        id: 'q-conf-2',
        topicId: 'conflict-resolution',
        categoryId: 'common-patterns',
        question: { vi: 'Khi cài đặt trình soạn thảo văn bản cộng tác thời gian thực kiểu Google Docs / Notion, cấu trúc nào đảm bảo mọi người gõ cùng một đoạn văn vẫn hội tụ về văn bản giống hệt nhau?', en: 'Which class of algorithms guarantees eventual convergence for concurrent real-time rich-text editing like Google Docs?' },
        options: [
          { vi: 'CRDT (Conflict-free Replicated Data Types) hoặc OT (Operational Transformation).', en: 'CRDTs (Conflict-free Replicated Data Types) or OT (Operational Transformation).' },
          { vi: 'Short Polling kết hợp CSS Grid.', en: 'Short Polling with CSS Grid.' },
          { vi: 'DocumentFragment.', en: 'DocumentFragment.' },
          { vi: 'Preload hints.', en: 'Preload hints.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'OT và CRDTs (như Yjs / Automerge) giải quyết chèn/xóa ký tự đồng thời ở nhiều vị trí mà không bị lệch offset.',
          en: 'OT and CRDTs reconcile concurrent character insertions and deletions mathematically without locking.',
        },
      },
    ],
    relatedTopicIds: ['offline-first', 'event-sourcing', 'net-offline-usage'],
  },

  {
    ...TOPIC_META_MAP['offline-first'],
    mentalModel: {
      vi: 'Thay vì coi Offline là một trang báo lỗi "No Internet", **Offline-first (Local-First)** coi bộ nhớ cục bộ trên thiết bị (**IndexedDB** + **Service Worker Cache**) là nguồn dữ liệu chính! Mọi thao tác đọc/viết diễn ra ở tốc độ 0ms trên đĩa cục bộ rồi đồng bộ delta hai chiều với server ở chế độ nền.',
      en: '**Offline-first (Local-First)** treats local device storage (**IndexedDB** + **Service Worker Cache**) as the primary read/write store: UI renders in 0ms offline or online while a background sync engine exchanges deltas with the server.',
    },
    keyPoints: [
      { vi: 'Service Worker (Network Proxy lập trình được): cache App Shell (`Cache-First` / `Stale-While-Revalidate`) để ứng dụng mở lên ngay cả khi đang bật Chế độ Máy Bay.', en: 'Service Workers cache the App Shell and static assets (`Cache-First` / `SWR`) so the app boots instantaneously offline.' },
      { vi: 'IndexedDB (thay cho LocalStorage vốn chỉ 5MB và đồng bộ gây lag!): lưu trữ có cấu trúc hàng trăm MB dữ liệu, đánh index tìm kiếm offline nhanh và dùng cho Outbox Queue.', en: 'IndexedDB (async, indexed, hundreds of MBs vs 5MB blocking LocalStorage) holds offline datasets and mutation queues.' },
      { vi: 'Background Sync + Delta Sync (`?since=lastSyncCursor`) + Conflict Resolution: khi mạng nối lại chỉ tải các bản ghi đổi từ mốc `lastSyncCursor` thay vì tải lại toàn bộ DB.', en: 'Delta synchronization (`?since=cursor`) fetches only changed records after reconnect alongside conflict resolution.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Ứng dụng ghi chú (Notion/Obsidian), Quản lý công việc (Linear/Todoist), PWA di động, POS bán hàng, App thực địa.', en: 'Note apps, task managers, field-service PWAs, POS registers, and collaborative tools.' },
      ],
      whenToAvoid: [
        { vi: 'App ngân hàng thời gian thực hoặc tìm kiếm toàn kho dữ liệu hàng tỷ bản ghi không thể tải xuống thiết bị.', en: 'Massive multi-terabyte search engines or real-time financial settlement UIs.' },
      ],
    },
    pitfalls: [
      { vi: 'Dùng `localStorage` để làm cơ sở dữ liệu Offline-first: `localStorage` bị giới hạn ~5MB, CHẶN luồng chính đồng bộ (`JSON.parse` 4MB làm lag UI), và KHÔNG truy cập được bên trong Service Worker!', en: 'Using `localStorage` for offline-first data hits 5MB caps, blocks the main thread synchronously, and is inaccessible inside Service Workers—always use IndexedDB!' },
    ],
    interviewTips: [
      { vi: 'Vẽ đủ bộ 4 thành phần Offline-first PWA: 1) **Service Worker** (App Shell + static cache), 2) **IndexedDB** (Local Primary Store + Outbox Queue), 3) **Sync Engine** (Delta Sync + Backoff + Background Sync API), 4) **Conflict Resolution** + Storage Quota management (`navigator.storage.estimate()`)!', en: 'Sketch the 4-part Offline-First stack: Service Worker App Shell, IndexedDB Store & Outbox, Delta Sync Engine, and Conflict Resolution + Storage Quota checks.' },
    ],
    example: {
      title: { vi: 'Mô phỏng Local-First Store + Delta Sync Cursor Engine', en: 'Local-First Store + Delta Sync Simulator' },
      description: { vi: 'Đọc/ghi bản ghi tức thì tại Local Store ngay cả khi tắt mạng, rồi đồng bộ hai chiều với Remote Server bằng Delta Cursor.', en: 'Read/write instantaneously in a local store offline, then run delta sync + push outbox when back online.' },
      mode: 'ts',
      code: `interface Note { id: string; text: string; version: number }

const serverDB: Note[] = [
  { id: 'n1', text: 'Server initial note', version: 1 },
  { id: 'n2', text: 'Architecture checklist', version: 2 },
];
let serverVersion = 2;

const localStore = new Map<string, Note>();
const pendingWrites: Note[] = [];
let lastSyncedVersion = 0;

function writeLocal(id: string, text: string) {
  const note = { id, text, version: 0 };
  localStore.set(id, note); // 0ms instant write!
  pendingWrites.push(note);
}

async function syncWithServer() {
  // 1. Push local outbox
  while (pendingWrites.length > 0) {
    const item = pendingWrites.shift()!;
    serverVersion += 1;
    const saved = { ...item, version: serverVersion };
    serverDB.push(saved);
  }
  // 2. Pull only deltas since lastSyncedVersion
  const deltas = serverDB.filter((n) => n.version > lastSyncedVersion);
  for (const d of deltas) localStore.set(d.id, d);
  lastSyncedVersion = serverVersion;
  return { pulledDeltas: deltas.length, localTotal: localStore.size, lastSyncedVersion };
}

console.log('Initial delta sync:', await syncWithServer());
writeLocal('n3', 'Drafted offline on subway!');
console.log('Local read immediately (offline):', localStore.get('n3'));
console.log('Reconnect delta sync:', await syncWithServer());`,
      tryItPrompt: { vi: 'Thử thêm một bản ghi mới trên `serverDB` có `version: 4` để thấy lần `syncWithServer()` tiếp theo chỉ kéo đúng 1 delta đó về!', en: 'Push a `version: 4` record onto `serverDB` and watch the next sync pull strictly that delta.' },
    },
    quiz: [
      {
        id: 'q-offf-1',
        topicId: 'offline-first',
        categoryId: 'common-patterns',
        question: { vi: 'Vì sao phải chọn **IndexedDB** thay cho **localStorage** khi xây dựng dữ liệu Offline-first trên trình duyệt?', en: 'Why does Offline-first architecture require **IndexedDB** rather than **localStorage**?' },
        options: [
          { vi: 'IndexedDB bất đồng bộ (không block UI), lưu được hàng trăm MB, hỗ trợ index truy vấn nhanh và truy cập được trong Service Worker.', en: 'IndexedDB is asynchronous (non-blocking), stores hundreds of MBs, supports indexed queries, and works inside Service Workers.' },
          { vi: 'localStorage không lưu được chuỗi văn bản.', en: 'localStorage cannot store strings.' },
          { vi: 'IndexedDB tự động đồng bộ qua Bluetooth.', en: 'IndexedDB syncs via Bluetooth.' },
          { vi: 'localStorage xóa dữ liệu mỗi 5 phút.', en: 'localStorage wipes every 5 minutes.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'localStorage đồng bộ (synchronous) làm khựng main thread với payload lớn, giới hạn ~5MB, và bị cấm dùng trong Service Worker threads.',
          en: 'localStorage is synchronous, limited to ~5MB, and unavailable inside Service Workers.',
        },
      },
      {
        id: 'q-offf-2',
        topicId: 'offline-first',
        categoryId: 'common-patterns',
        question: { vi: 'Kỹ thuật caching Service Worker nào mở trang web/App Shell nhanh tức thì từ cache trước đồng thời âm thầm cập nhật bản mới từ mạng cho lần sau?', en: 'Which Service Worker caching strategy serves cached App Shell assets immediately while updating the cache asynchronously?' },
        options: [
          { vi: 'Stale-While-Revalidate (SWR).', en: 'Stale-While-Revalidate (SWR).' },
          { vi: 'Network-Only.', en: 'Network-Only.' },
          { vi: 'No-Cache No-Store.', en: 'No-Cache No-Store.' },
          { vi: 'Disable-Worker.', en: 'Disable-Worker.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'SWR vừa mang lại tốc độ 0ms kể cả offline/mạng yếu vừa đảm bảo bản cache luôn được làm mới ở nền.',
          en: 'Stale-While-Revalidate pairs instant cache reads with transparent background freshness updates.',
        },
      },
    ],
    relatedTopicIds: ['net-offline-usage', 'conflict-resolution', 'caching-expiry'],
  },
];
