import type { TopicContent } from '@/types/curriculum';
import { TOPIC_META_MAP } from '@/data/topicIndex';

export const stateManagementTopics: TopicContent[] = [
  {
    ...TOPIC_META_MAP['state-lazy-loading'],
    mentalModel: {
      vi: 'Không cần chở theo toàn bộ đồ nghề của phòng kế toán, kho vận, nhân sự ngay khi mở ứng dụng — chỉ đăng ký và nạp state slice khi user thật sự mở module đó.',
      en: 'Do not initialize every feature store slice at app boot; dynamically register reducers/atoms only when the user navigates into that feature module.',
    },
    keyPoints: [
      { vi: 'Kết hợp route/feature code-splitting với reducer injection (injectReducer) hoặc store đăng ký theo module.', en: 'Pair route/feature code-splitting with dynamic reducer injection or modular store registration.' },
      { vi: 'Giảm dung lượng JS khởi động và tránh cấp phát RAM cho dữ liệu các tính năng hiếm dùng.', en: 'Reduces initial bundle size and avoids allocating heap memory for rarely visited features.' },
      { vi: 'Có thể dọn dẹp state slice khi user rời khỏi luồng lớn (ví dụ trình sửa video, báo cáo khổng lồ).', en: 'Allows tearing down heavy transient slices after leaving complex workflows.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'Enterprise SaaS hoặc Super-App có hàng chục phân hệ độc lập.', en: 'Large multi-module apps or enterprise suites where most users visit only a subset of features.' },
      ],
      whenToAvoid: [
        { vi: 'Ứng dụng nhỏ với vài slice chia sẻ toàn cục — tách rườm rà sẽ phức tạp hóa type safety.', en: 'Small applications with a handful of lightweight global slices.' },
      ],
    },
    pitfalls: [
      { vi: 'Action được dispatch trước khi chunk chứa reducer tương ứng tải xong sẽ bị rơi mất.', en: 'Dispatching actions before the feature reducer finishes injecting silently drops updates.' },
      { vi: 'Quên idempotency khi gọi injectReducer nhiều lần gây mất state hiện có khi remount route.', en: 'Re-injecting an already registered slice can accidentally reset existing state.' },
    ],
    interviewTips: [
      { vi: 'Trình bày pattern combineReducers động hoặc Redux Toolkit combineSlices().inject() + React Suspense.', en: 'Describe dynamic reducer registries (like RTK combineSlices) paired with route-level lazy loading.' },
    ],
    example: {
      title: { vi: 'Dynamic Reducer Registry (Lazy Slice Injection)', en: 'Dynamic Reducer Registry Simulator' },
      description: { vi: 'Xem cách store chỉ nạp thêm slice analyticsReducer khi module Analytics được kích hoạt.', en: 'Inspect how a modular store dynamically attaches a new slice reducer on demand without wiping existing state.' },
      mode: 'ts',
      code: `type Reducer<S = any> = (state: S | undefined, action: { type: string; payload?: any }) => S;

function createModularStore(initialReducers: Record<string, Reducer>) {
  let reducers = { ...initialReducers };
  let state: Record<string, any> = {};

  const initSlice = (key: string, reducer: Reducer) => {
    state = { ...state, [key]: reducer(undefined, { type: '@@INIT' }) };
  };
  for (const [k, r] of Object.entries(reducers)) initSlice(k, r);

  return {
    injectReducer(key: string, reducer: Reducer) {
      if (reducers[key]) return; // Idempotent guard
      reducers[key] = reducer;
      initSlice(key, reducer);
      console.log('[Injected slice]:', key);
    },
    dispatch(action: { type: string; payload?: any }) {
      const next: Record<string, any> = {};
      for (const [k, r] of Object.entries(reducers)) {
        next[k] = r(state[k], action);
      }
      state = next;
    },
    getState: () => state,
  };
}

const authReducer: Reducer = (s = { user: 'Linh' }, a) =>
  a.type === 'LOGOUT' ? { user: null } : s;

const store = createModularStore({ auth: authReducer });
console.log('Boot state (lightweight):', store.getState());

// Later, when user opens /analytics route:
const analyticsReducer: Reducer = (s = { views: 0 }, a) =>
  a.type === 'TRACK' ? { views: s.views + 1 } : s;

store.injectReducer('analytics', analyticsReducer);
store.dispatch({ type: 'TRACK' });
console.log('After lazy inject + action:', store.getState());`,
      tryItPrompt: { vi: 'Thử gọi injectReducer thêm một lần nữa với cùng key để kiểm tra tính idempotent.', en: 'Call injectReducer twice for the same slice key to verify state is preserved.' },
    },
    quiz: [
      {
        id: 'q-statelazy-1',
        topicId: 'state-lazy-loading',
        categoryId: 'state-management',
        question: { vi: 'Vì sao hàm injectReducer cần kiểm tra xem key của slice đã tồn tại chưa?', en: 'Why should injectReducer check if a slice key is already registered?' },
        options: [
          { vi: 'Để giữ tính idempotent và tránh reset nhầm dữ liệu đang có khi component remount.', en: 'To stay idempotent and avoid overwriting existing state on subsequent route visits.' },
          { vi: 'Vì JavaScript cấm object có quá 5 thuộc tính.', en: 'JavaScript forbids objects with more than 5 keys.' },
          { vi: 'Để trình duyệt tự động lưu sang IndexedDB.', en: 'To sync state to IndexedDB automatically.' },
          { vi: 'Để tắt toàn bộ Redux DevTools.', en: 'To disable Redux DevTools.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Nếu người dùng quay lại route cũ, tái đăng ký trùng tên mà không guard sẽ ghi đè hoặc mất dữ liệu đã tải.',
          en: 'Without an idempotency guard, revisiting a lazy route could reinitialize and wipe existing slice data.',
        },
      },
      {
        id: 'q-statelazy-2',
        topicId: 'state-lazy-loading',
        categoryId: 'state-management',
        question: { vi: 'Khi kết hợp state lazy loading, loại state nào KHÔNG nên nạp lười mà cần có ngay từ lúc boot?', en: 'Which slice should stay in the core boot store instead of being lazy-loaded?' },
        options: [
          { vi: 'Session người dùng hiện tại, theme và phân quyền cốt lõi (auth/config).', en: 'Current auth session, permissions, and global theme/locale config.' },
          { vi: 'Bảng cấu hình xuất file PDF nâng cao.', en: 'Advanced PDF export configuration modal state.' },
          { vi: 'Trạng thái trình chỉnh sửa ảnh.', en: 'Image cropper modal state.' },
          { vi: 'Lịch sử biểu đồ báo cáo quý.', en: 'Quarterly analytics chart filters.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Auth, permissions và i18n/theme dùng xuyên suốt mọi route nên cần có sẵn ngay khi khởi tạo app.',
          en: 'Cross-cutting slices like auth, permissions, and theme are needed immediately across all routes.',
        },
      },
    ],
    relatedTopicIds: ['code-splitting', 'flux-architecture', 'memory-leaks'],
  },

  {
    ...TOPIC_META_MAP['flux-architecture'],
    mentalModel: {
      vi: 'Dữ liệu chỉ đi một vòng tròn khép kín theo một chiều duy nhất: View gửi Action -> Store/Reducer xử lý thuần khiết -> Cập nhật Store -> View tự render lại. Không bao giờ có chuyện View sửa lén state hai chiều.',
      en: 'Data flows in a single predictable loop: View dispatches an Action -> Store/Reducer computes next state purely -> Store notifies Views -> View re-renders.',
    },
    keyPoints: [
      { vi: 'Unidirectional Data Flow giúp truy vết mọi thay đổi state: biết chính xác action nào ở thời điểm nào gây ra bug.', en: 'Unidirectional data flow makes every state transition traceable and debuggable via action logs.' },
      { vi: 'Reducer là pure function: (state, action) => newState, không mutate trực tiếp state cũ và không chứa side effects.', en: 'Reducers are pure immutable functions: (state, action) => newState without side effects.' },
      { vi: 'Hỗ trợ time-travel debugging, middleware logging và tách biệt logic nghiệp vụ khỏi React UI.', en: 'Enables time-travel debugging, middleware pipelines, and framework-agnostic domain testing.' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'State phức tạp nhiều tương tác chéo (workflow, giỏ hàng nhiều điều kiện khuyến mãi, trình chỉnh sửa).', en: 'Complex interdependent client workflows, carts with discount rules, and collaborative editors.' },
      ],
      whenToAvoid: [
        { vi: 'Chỉ cache dữ liệu lấy từ API (nên dùng server-state cache như TanStack Query/SWR thay vì chép tay vào Flux/Redux).', en: 'Pure server-data caching—prefer dedicated server-state libraries (TanStack Query/SWR) over manual Flux boilerplate.' },
      ],
    },
    pitfalls: [
      { vi: 'Mutate trực tiếp mảng/object trong reducer (không dùng copy/Immer) khiến selector so sánh tham chiếu không re-render.', en: 'Mutating state in place inside a reducer breaks referential equality checks and prevents UI updates.' },
      { vi: 'Nhét cả server cache lẫn form input từng phím gõ vào global store gây re-render lan tràn.', en: 'Dumping ephemeral keystrokes and raw server cache into global Flux stores causes noisy updates.' },
    ],
    interviewTips: [
      { vi: 'Phân biệt rõ Client/UI State vs Server Cache State — ứng viên senior luôn chỉ ra Flux/Reducer quản lý Client State còn TanStack Query/SWR quản lý Server Cache.', en: 'Distinguish UI/Client State vs Server Cache State—show you know when Flux is overkill compared to SWR/Query caches.' },
    ],
    example: {
      title: { vi: 'Mini Flux Store kết hợp React UI & Action Log', en: 'Live Flux Store + Action Inspector' },
      description: { vi: 'Thao tác với giỏ hàng dùng luồng Flux thuần và quan sát lịch sử action đi qua dispatcher.', en: 'Dispatch actions against an immutable Flux store and inspect the unidirectional transition log.' },
      mode: 'react',
      code: `import React, { useReducer } from 'react';

type State = { items: { id: string; title: string; qty: number }[]; log: string[] };
type Action = { type: 'ADD'; id: string; title: string } | { type: 'DEC'; id: string } | { type: 'CLEAR' };

function fluxReducer(state: State, action: Action): State {
  const entry = new Date().toLocaleTimeString() + ' -> ' + JSON.stringify(action);
  const nextLog = [entry, ...state.log].slice(0, 5);
  if (action.type === 'ADD') {
    const existing = state.items.find((i) => i.id === action.id);
    const items = existing
      ? state.items.map((i) => (i.id === action.id ? { ...i, qty: i.qty + 1 } : i))
      : [...state.items, { id: action.id, title: action.title, qty: 1 }];
    return { items, log: nextLog };
  }
  if (action.type === 'DEC') {
    const items = state.items
      .map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
      .filter((i) => i.qty > 0);
    return { items, log: nextLog };
  }
  return { items: [], log: nextLog };
}

export default function App() {
  const [state, dispatch] = useReducer(fluxReducer, {
    items: [{ id: 'book', title: 'FE System Design', qty: 1 }],
    log: [],
  });

  return (
    <div className="col">
      <div className="row">
        <button className="primary" onClick={() => dispatch({ type: 'ADD', id: 'book', title: 'FE System Design' })}>+ Book</button>
        <button onClick={() => dispatch({ type: 'ADD', id: 'lab', title: 'Sandbox Pass' })}>+ Sandbox</button>
        <button onClick={() => dispatch({ type: 'CLEAR' })}>Clear</button>
      </div>
      <div className="card">
        {state.items.length === 0 ? <span className="muted">Cart empty</span> : state.items.map((item) => (
          <div key={item.id} className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
            <span>{item.title} × {item.qty}</span>
            <button onClick={() => dispatch({ type: 'DEC', id: item.id })}>-1</button>
          </div>
        ))}
      </div>
      <pre className="card muted" style={{ margin: 0 }}>{state.log.join('\\n') || 'Dispatch an action to trace flow...'}</pre>
    </div>
  );
}`,
      tryItPrompt: { vi: 'Thử thêm action REMOVE_ITEM xóa thẳng một item bất kể số lượng.', en: 'Try adding a REMOVE_ITEM action that removes a line item regardless of quantity.' },
    },
    challenge: {
      id: 'challenge-flux-store',
      topicId: 'flux-architecture',
      categoryId: 'state-management',
      title: { vi: 'Cài đặt createFluxStore từ đầu', en: 'Build createFluxStore from Scratch' },
      difficulty: 'medium',
      prompt: {
        vi: 'Viết hàm createFluxStore<S, A>(reducer: (state: S, action: A) => S, initialState: S) trả về { getState, dispatch, subscribe }. subscribe(listener) trả về hàm unsubscribe; mọi listener đang đăng ký được gọi sau khi dispatch đổi state.',
        en: 'Implement createFluxStore<S, A>(reducer, initialState) returning { getState, dispatch, subscribe }. subscribe(listener) returns an unsubscribe function and fires on each dispatch.',
      },
      starterCode: `export function createFluxStore<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
) {
  // TODO: hold state, Set of listeners, implement getState, dispatch, subscribe
  return {
    getState: (): S => initialState,
    dispatch: (_action: A): void => {},
    subscribe: (_listener: (state: S) => void): (() => void) => () => {},
  };
}`,
      solutionCode: `export function createFluxStore<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
) {
  let state = initialState;
  const listeners = new Set<(state: S) => void>();

  return {
    getState: () => state,
    dispatch(action: A) {
      state = reducer(state, action);
      for (const listener of Array.from(listeners)) {
        listener(state);
      }
    },
    subscribe(listener: (state: S) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}`,
      testCode: `test('updates state via pure reducer and notifies active subscribers', () => {
  const store = createFluxStore(
    (s: number, a: { type: 'INC' | 'ADD'; n?: number }) =>
      a.type === 'INC' ? s + 1 : s + (a.n ?? 0),
    0
  );
  const seen: number[] = [];
  const unsub = store.subscribe((s) => seen.push(s));

  store.dispatch({ type: 'INC' });
  store.dispatch({ type: 'ADD', n: 5 });
  expect(store.getState()).toBe(6);
  expect(seen).toEqual([1, 6]);

  unsub();
  store.dispatch({ type: 'INC' });
  expect(store.getState()).toBe(7);
  expect(seen).toEqual([1, 6]);
});`,
      hints: [
        { vi: 'Dùng Set để lưu listeners giúp việc xóa khi unsubscribe đạt O(1) và tránh trùng lặp.', en: 'Store listeners in a Set for O(1) add/delete and natural deduplication.' },
        { vi: 'Trong dispatch, gán state = reducer(state, action) rồi duyệt snapshot listeners (Array.from(listeners)).', en: 'Inside dispatch, update state = reducer(state, action) then iterate a snapshot of listeners.' },
      ],
    },
    quiz: [
      {
        id: 'q-flux-1',
        topicId: 'flux-architecture',
        categoryId: 'state-management',
        question: { vi: 'Điều gì BẮT BUỘC đúng với một Reducer theo kiến trúc Flux?', en: 'Which property MUST hold true for a Flux/Redux reducer?' },
        options: [
          { vi: 'Là pure function: với cùng state & action luôn trả về cùng kết quả và không mutate state cũ.', en: 'It is a pure function: deterministic output without mutating previous state or triggering side effects.' },
          { vi: 'Phải gọi fetch() trực tiếp bên trong.', en: 'It must perform fetch() calls directly inside.' },
          { vi: 'Luôn trả về chuỗi JSON.', en: 'It always returns a JSON string.' },
          { vi: 'Chỉ chạy được một lần khi khởi động.', en: 'It runs only once on app startup.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Pure function bất biến đảm bảo tính dự đoán, time-travel và tối ưu so sánh tham chiếu cho UI.',
          en: 'Pure immutable transitions guarantee predictability, time-travel replay, and fast reference checks.',
        },
      },
      {
        id: 'q-flux-2',
        topicId: 'flux-architecture',
        categoryId: 'state-management',
        question: { vi: 'Điểm khác biệt cốt lõi giữa Flux và Two-way data binding là gì?', en: 'What separates Flux from two-way data binding?' },
        options: [
          { vi: 'Flux ép mọi thay đổi dữ liệu đi theo một chiều qua action & dispatcher thay vì view tự sửa chéo lẫn nhau.', en: 'Flux enforces strict unidirectional flow via explicit actions rather than bidirectional view/model mutations.' },
          { vi: 'Flux không dùng được với form input.', en: 'Flux cannot handle form inputs.' },
          { vi: 'Flux chạy trên Web Worker mặc định.', en: 'Flux runs in a Web Worker by default.' },
          { vi: 'Two-way binding không dùng được trong browser.', en: 'Two-way binding cannot run in browsers.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Luồng một chiều giúp tránh vòng lặp cập nhật dây chuyền khó debug ở các UI lớn.',
          en: 'Unidirectional data flow eliminates cascading mutation loops common in complex multi-view apps.',
        },
      },
    ],
    relatedTopicIds: ['normalized-stores', 'reducer-flux-pattern', 'event-sourcing'],
  },

  {
    ...TOPIC_META_MAP['normalized-stores'],
    mentalModel: {
      vi: 'Tổ chức state client y hệt các bảng trong cơ sở dữ liệu quan hệ: mỗi thực thể (user, post, comment) chỉ lưu MỘT BẢN GỐC duy nhất trong bảng byId[id] và tham chiếu bằng ID.',
      en: 'Structure client state like relational database tables: store each entity once in a byId lookup map and reference entities solely by ID.',
    },
    keyPoints: [
      { vi: 'Tránh trùng lặp dữ liệu: khi tác giả đổi tên hoặc đổi avatar, chỉ sửa 1 chỗ duy nhất tại users.byId[authorId], toàn bộ 50 bài viết tự đồng bộ.', en: 'Single source of truth: updating users.byId[id] instantly reflects across every post and comment.' },
      { vi: 'Truy xuất/cập nhật theo ID đạt O(1) thay vì phải duyệt lồng sâu nhiều vòng lặp O(N*M).', en: 'O(1) entity lookups and updates instead of deeply nested array traversals.' },
      { vi: 'Tách thứ tự hiển thị (allIds: string[]) khỏi dữ liệu bản ghi (byId: Record<string, Entity>).', en: 'Separate ordered lists (allIds: string[]) from entity records (byId: Record<string, T>).' },
    ],
    tradeoffs: {
      whenToUse: [
        { vi: 'News feed, mạng xã hội, app quản lý dự án (Jira/Linear) nơi một thực thể xuất hiện ở nhiều chỗ cùng lúc.', en: 'Social feeds, issue trackers, and normalized GraphQL/Relay caches where entities appear in multiple views.' },
      ],
      whenToAvoid: [
        { vi: 'Danh sách phẳng đơn giản chỉ đọc một lần không chia sẻ thực thể chéo nhau.', en: 'Simple flat lists or isolated forms with no shared relational entities.' },
      ],
    },
    pitfalls: [
      { vi: 'Xóa entity ở byId nhưng quên xóa ID trong các mảng tham chiếu gây lỗi undefined khi render.', en: 'Deleting an entity from byId without cleaning dangling IDs in lists causes undefined crashes.' },
    ],
    interviewTips: [
      { vi: 'Đây là điểm cộng cực lớn khi thiết kế News Feed hoặc Slack Chat: luôn vẽ schema normalized { posts: { byId, allIds }, users: { byId } }.', en: 'A staple in News Feed and Chat interviews: sketch normalized { posts: { byId, allIds }, users: { byId } } tables explicitly.' },
    ],
    example: {
      title: { vi: 'Chuẩn hóa Feed lồng nhau thành Normalized Store', en: 'Normalizing Nested Posts & Authors' },
      description: { vi: 'Chuyển đổi danh sách bài viết lồng object tác giả thành bảng phẳng O(1) và cập nhật tên tác giả một chỗ duy nhất.', en: 'Transform nested API posts into normalized tables and watch one user edit propagate across posts.' },
      mode: 'ts',
      code: `interface RawPost {
  id: string;
  title: string;
  author: { id: string; name: string };
}

function normalizePosts(raw: RawPost[]) {
  const postsById: Record<string, { id: string; title: string; authorId: string }> = {};
  const usersById: Record<string, { id: string; name: string }> = {};
  const postIds: string[] = [];

  for (const post of raw) {
    usersById[post.author.id] = { ...post.author };
    postsById[post.id] = { id: post.id, title: post.title, authorId: post.author.id };
    postIds.push(post.id);
  }
  return { posts: { byId: postsById, allIds: postIds }, users: { byId: usersById } };
}

const store = normalizePosts([
  { id: 'p1', title: 'Caching Strategies', author: { id: 'u1', name: 'Minh' } },
  { id: 'p2', title: 'Virtual Lists', author: { id: 'u1', name: 'Minh' } },
]);

// Update author once in O(1)
store.users.byId['u1'].name = 'Minh Tran';

console.log('Normalized Store:', store);
console.log('Resolved Post 2 Author:', store.users.byId[store.posts.byId['p2'].authorId].name);`,
      tryItPrompt: { vi: 'Thử thêm mảng comments lồng trong mỗi post và chuẩn hóa thành bảng comments riêng.', en: 'Extend normalizePosts to also extract nested comments into a commentsById table.' },
    },
    challenge: {
      id: 'challenge-normalize-entities',
      topicId: 'normalized-stores',
      categoryId: 'state-management',
      title: { vi: 'Viết hàm normalizeEntities chuẩn hóa dữ liệu lồng nhau', en: 'Implement normalizeEntities' },
      difficulty: 'medium',
      prompt: {
        vi: 'Cho mảng bài viết dạng { id: string; title: string; author: { id: string; name: string } }[], hãy viết hàm normalizeEntities trả về { postsById, postIds, usersById } trong đó mỗi post giữ authorId thay vì lồng cả object author và loại bỏ trùng lặp author.',
        en: 'Given posts shaped as { id, title, author: { id, name } }[], write normalizeEntities returning { postsById, postIds, usersById } where posts store authorId instead of nested author objects and usersById deduplicates authors.',
      },
      starterCode: `export interface NestedPost {
  id: string;
  title: string;
  author: { id: string; name: string };
}

export function normalizeEntities(posts: NestedPost[]) {
  // TODO: return { postsById, postIds, usersById }
  return {
    postsById: {} as Record<string, { id: string; title: string; authorId: string }>,
    postIds: [] as string[],
    usersById: {} as Record<string, { id: string; name: string }>,
  };
}`,
      solutionCode: `export interface NestedPost {
  id: string;
  title: string;
  author: { id: string; name: string };
}

export function normalizeEntities(posts: NestedPost[]) {
  const postsById: Record<string, { id: string; title: string; authorId: string }> = {};
  const postIds: string[] = [];
  const usersById: Record<string, { id: string; name: string }> = {};

  for (const post of posts) {
    usersById[post.author.id] = { id: post.author.id, name: post.author.name };
    postsById[post.id] = { id: post.id, title: post.title, authorId: post.author.id };
    postIds.push(post.id);
  }

  return { postsById, postIds, usersById };
}`,
      testCode: `test('normalizes nested posts and deduplicates shared authors', () => {
  const res = normalizeEntities([
    { id: 'p1', title: 'SSR', author: { id: 'u1', name: 'An' } },
    { id: 'p2', title: 'ISR', author: { id: 'u1', name: 'An' } },
    { id: 'p3', title: 'CSP', author: { id: 'u2', name: 'Binh' } },
  ]);
  expect(res.postIds).toEqual(['p1', 'p2', 'p3']);
  expect(Object.keys(res.usersById)).toEqual(['u1', 'u2']);
  expect(res.postsById['p2']).toEqual({ id: 'p2', title: 'ISR', authorId: 'u1' });
});`,
      hints: [
        { vi: 'Duyệt từng post, ghi user vào usersById[post.author.id] để tự động gộp trùng lặp.', en: 'Iterate each post, assigning usersById[post.author.id] so shared authors deduplicate automatically.' },
        { vi: 'Lưu post vào postsById[post.id] chỉ với { id, title, authorId: post.author.id } và push id vào postIds.', en: 'Store { id, title, authorId: post.author.id } inside postsById and push post.id into postIds.' },
      ],
    },
    quiz: [
      {
        id: 'q-norm-1',
        topicId: 'normalized-stores',
        categoryId: 'state-management',
        question: { vi: 'Vấn đề lớn nhất mà Normalized Store giải quyết khi hiển thị một user ở 20 bài viết trên feed là gì?', en: 'What core problem does a Normalized Store solve when one author appears across 20 feed items?' },
        options: [
          { vi: 'Tránh dữ liệu bị lệch pha khi tác giả đổi tên/avatar và cho phép cập nhật tại một chỗ duy nhất với độ phức tạp O(1).', en: 'Prevents stale duplicated user copies and enables single-place O(1) updates.' },
          { vi: 'Tự động nén HTML trước khi gửi.', en: 'Compresses HTML automatically.' },
          { vi: 'Thay thế HTTPS trên trình duyệt.', en: 'Replaces HTTPS in the browser.' },
          { vi: 'Tự động dịch ngôn ngữ giao diện.', en: 'Translates UI text automatically.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Không còn cảnh bài viết 1 hiện tên mới còn bài viết 5 hiện tên cũ do chép trùng object.',
          en: 'Single source of truth guarantees consistent author details everywhere in O(1).',
        },
      },
      {
        id: 'q-norm-2',
        topicId: 'normalized-stores',
        categoryId: 'state-management',
        question: { vi: 'Trong Normalized Store, tại sao thường tách thành cặp `byId` (Object/Map) và `allIds` (Array)?', en: 'Why do normalized slices commonly pair a `byId` map with an `allIds` array?' },
        options: [
          { vi: 'Object/Map giúp truy cập O(1) theo ID, còn Array giữ nguyên thứ tự sắp xếp của danh sách.', en: 'The map provides O(1) lookup by ID while the array preserves display ordering.' },
          { vi: 'JavaScript không thể lặp qua Object.', en: 'JavaScript cannot iterate over objects.' },
          { vi: 'Array bắt buộc phải dùng để parse JSON.', en: 'Arrays are required by JSON.parse.' },
          { vi: 'Để tăng kích thước bộ nhớ gấp đôi.', en: 'To intentionally double memory usage.' },
        ],
        correctIndex: 0,
        explanation: {
          vi: 'Object không đảm bảo thứ tự nghiệp vụ linh hoạt như sort/prepend/filter; kết hợp cả hai đạt tối ưu cả tốc độ lẫn thứ tự.',
          en: 'Pairing O(1) key maps with ordered ID arrays balances fast updates with explicit list order.',
        },
      },
    ],
    relatedTopicIds: ['flux-architecture', 'graphql', 'caching-expiry'],
  },
];
