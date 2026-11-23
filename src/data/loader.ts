import type { CategoryId, CodingChallenge, QuizQuestion, TopicContent } from '@/types/curriculum';

const categoryCache = new Map<CategoryId, TopicContent[]>();

const categoryImporters: Record<CategoryId, () => Promise<{ topics: TopicContent[] }>> = {
  architecture: () => import('@/data/topics/architecture').then((m) => ({ topics: m.architectureTopics })),
  'state-management': () => import('@/data/topics/state-management').then((m) => ({ topics: m.stateManagementTopics })),
  'backend-apis': () => import('@/data/topics/backend-apis').then((m) => ({ topics: m.backendApisTopics })),
  'realtime-updates': () => import('@/data/topics/realtime-updates').then((m) => ({ topics: m.realtimeUpdatesTopics })),
  'component-apis': () => import('@/data/topics/component-apis').then((m) => ({ topics: m.componentApisTopics })),
  networking: () => import('@/data/topics/networking').then((m) => ({ topics: m.networkingTopics })),
  performance: () => import('@/data/topics/performance').then((m) => ({ topics: m.performanceTopics })),
  images: () => import('@/data/topics/images').then((m) => ({ topics: m.imagesTopics })),
  accessibility: () => import('@/data/topics/accessibility').then((m) => ({ topics: m.accessibilityTopics })),
  seo: () => import('@/data/topics/seo').then((m) => ({ topics: m.seoTopics })),
  'user-experience': () => import('@/data/topics/user-experience').then((m) => ({ topics: m.userExperienceTopics })),
  security: () => import('@/data/topics/security').then((m) => ({ topics: m.securityTopics })),
  i18n: () => import('@/data/topics/i18n').then((m) => ({ topics: m.i18nTopics })),
  'common-patterns': () => import('@/data/topics/common-patterns').then((m) => ({ topics: m.commonPatternsTopics })),
};

export async function loadCategoryTopics(categoryId: CategoryId): Promise<TopicContent[]> {
  const cached = categoryCache.get(categoryId);
  if (cached) return cached;
  const loader = categoryImporters[categoryId];
  const { topics } = await loader();
  categoryCache.set(categoryId, topics);
  return topics;
}

export function getCachedTopic(categoryId: CategoryId, topicId: string): TopicContent | undefined {
  return categoryCache.get(categoryId)?.find((t) => t.id === topicId);
}

export function prefetchCategory(categoryId: CategoryId): void {
  if (categoryCache.has(categoryId)) return;
  void loadCategoryTopics(categoryId);
}

export async function loadTopic(categoryId: CategoryId, topicId: string): Promise<TopicContent | undefined> {
  const topics = await loadCategoryTopics(categoryId);
  return topics.find((t) => t.id === topicId);
}

export async function loadAllTopics(): Promise<TopicContent[]> {
  const ids = Object.keys(categoryImporters) as CategoryId[];
  const groups = await Promise.all(ids.map((id) => loadCategoryTopics(id)));
  return groups.flat();
}

export async function loadAllChallenges(): Promise<CodingChallenge[]> {
  const all = await loadAllTopics();
  return all.flatMap((t) => (t.challenge ? [t.challenge] : []));
}

export async function loadAllQuizzes(): Promise<QuizQuestion[]> {
  const all = await loadAllTopics();
  return all.flatMap((t) => t.quiz);
}
