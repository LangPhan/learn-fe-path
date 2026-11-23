import { describe, expect, it } from 'vitest';
import { CATEGORIES, CATEGORY_MAP } from '@/data/categories';
import { TOPIC_INDEX, TOPIC_META_MAP } from '@/data/topicIndex';
import { getCachedTopic, loadAllTopics, loadCategoryTopics } from '@/data/loader';
import { SCENARIO_INDEX } from '@/data/scenarioIndex';
import { SCENARIOS } from '@/data/scenarios';
import { VALID_VISUALIZER_IDS } from '@/components/visualizers/VisualizerRegistry';

describe('Curriculum Integrity & Completeness', () => {
  it('defines all 14 categories distributed across 3 columns matching the cheatsheet', () => {
    expect(CATEGORIES).toHaveLength(14);
    expect(Object.keys(CATEGORY_MAP)).toHaveLength(14);

    const col1 = CATEGORIES.filter((c) => c.column === 1);
    const col2 = CATEGORIES.filter((c) => c.column === 2);
    const col3 = CATEGORIES.filter((c) => c.column === 3);

    expect(col1).toHaveLength(6);
    expect(col2).toHaveLength(3);
    expect(col3).toHaveLength(5);

    for (const cat of CATEGORIES) {
      expect(cat.title.vi.trim().length).toBeGreaterThan(0);
      expect(cat.title.en.trim().length).toBeGreaterThan(0);
      expect(cat.description.vi.trim().length).toBeGreaterThan(0);
      expect(cat.description.en.trim().length).toBeGreaterThan(0);
    }
  });

  it('indexes all 86 unique topics and keeps loader modules 1-to-1 with TOPIC_INDEX', async () => {
    expect(TOPIC_INDEX).toHaveLength(86);
    const uniqueIndexIds = new Set(TOPIC_INDEX.map((t) => t.id));
    expect(uniqueIndexIds.size).toBe(86);

    const loaded = await loadAllTopics();
    expect(loaded).toHaveLength(86);

    const loadedMap = new Map(loaded.map((t) => [t.id, t]));
    expect(loadedMap.size).toBe(86);

    const mismatches: string[] = [];
    for (const meta of TOPIC_INDEX) {
      const full = loadedMap.get(meta.id);
      if (!full) {
        mismatches.push(`${meta.id}: missing full topic`);
        continue;
      }
      if (full.categoryId !== meta.categoryId) mismatches.push(`${meta.id}: categoryId`);
      if (full.difficulty !== meta.difficulty) mismatches.push(`${meta.id}: difficulty`);
      if (full.sandboxMode !== meta.sandboxMode) mismatches.push(`${meta.id}: sandboxMode (${full.sandboxMode} vs ${meta.sandboxMode})`);
      if (full.example.mode !== meta.sandboxMode) mismatches.push(`${meta.id}: example.mode (${full.example.mode} vs ${meta.sandboxMode})`);
      if (full.visualizerId !== meta.visualizerId) mismatches.push(`${meta.id}: visualizerId`);
      if (Boolean(full.challenge) !== meta.hasChallenge) mismatches.push(`${meta.id}: hasChallenge`);
    }
    expect(mismatches).toEqual([]);
  });

  it('ensures every topic has complete bilingual theory, valid visualizers, valid links, and quizzes', async () => {
    const loaded = await loadAllTopics();
    const validVisualizerSet = new Set(VALID_VISUALIZER_IDS);

    const issues: string[] = [];
    for (const topic of loaded) {
      if (!topic.title.vi.trim() || !topic.title.en.trim()) issues.push(`${topic.id}: title`);
      if (!topic.summary.vi.trim() || !topic.summary.en.trim()) issues.push(`${topic.id}: summary`);
      if (!topic.mentalModel.vi.trim() || !topic.mentalModel.en.trim()) issues.push(`${topic.id}: mentalModel`);
      if (topic.keyPoints.length < 3) issues.push(`${topic.id}: keyPoints=${topic.keyPoints.length}`);
      if (topic.tradeoffs.whenToUse.length < 1) issues.push(`${topic.id}: whenToUse=${topic.tradeoffs.whenToUse.length}`);
      if (topic.tradeoffs.whenToAvoid.length < 1) issues.push(`${topic.id}: whenToAvoid=${topic.tradeoffs.whenToAvoid.length}`);
      if (topic.pitfalls.length < 1) issues.push(`${topic.id}: pitfalls=${topic.pitfalls.length}`);
      if (topic.interviewTips.length < 1) issues.push(`${topic.id}: interviewTips=${topic.interviewTips.length}`);
      for (const item of [
        ...topic.tradeoffs.whenToUse,
        ...topic.tradeoffs.whenToAvoid,
        ...topic.pitfalls,
        ...topic.interviewTips,
      ]) {
        if (!item.vi.trim() || !item.en.trim()) issues.push(`${topic.id}: empty bilingual bullet`);
      }
      if (!topic.example.title.vi.trim() || !topic.example.title.en.trim()) issues.push(`${topic.id}: example.title`);
      if (!topic.example.description.vi.trim() || !topic.example.description.en.trim()) issues.push(`${topic.id}: example.description`);
      if (!topic.example.tryItPrompt.vi.trim() || !topic.example.tryItPrompt.en.trim()) issues.push(`${topic.id}: example.tryItPrompt`);
      if (!topic.example.code.trim()) issues.push(`${topic.id}: example.code`);
      if (topic.visualizerId && !validVisualizerSet.has(topic.visualizerId)) issues.push(`${topic.id}: visualizerId=${topic.visualizerId}`);
      for (const relId of topic.relatedTopicIds) {
        if (!TOPIC_META_MAP[relId]) issues.push(`${topic.id}: unknown relatedTopicId=${relId}`);
      }
      if (topic.quiz.length < 2) issues.push(`${topic.id}: quiz=${topic.quiz.length}`);
      for (const q of topic.quiz) {
        if (q.topicId !== topic.id || q.categoryId !== topic.categoryId) issues.push(`${topic.id}/${q.id}: id mismatch`);
        if (!q.question.vi.trim() || !q.question.en.trim()) issues.push(`${topic.id}/${q.id}: question`);
        if (q.options.length < 2 || q.correctIndex < 0 || q.correctIndex >= q.options.length) issues.push(`${topic.id}/${q.id}: options/correctIndex`);
        if (!q.explanation.vi.trim() || !q.explanation.en.trim()) issues.push(`${topic.id}/${q.id}: explanation`);
        for (const opt of q.options) {
          if (!opt.vi.trim() || !opt.en.trim()) issues.push(`${topic.id}/${q.id}: option text`);
        }
      }
      for (const kp of topic.keyPoints) {
        if (!kp.vi.trim() || !kp.en.trim()) issues.push(`${topic.id}: keyPoint text`);
      }
    }
    expect(issues).toEqual([]);
  });

  it('defines 6 complete RADIO system design scenarios aligned with SCENARIO_INDEX and valid topic links', () => {
    expect(SCENARIO_INDEX).toHaveLength(6);
    expect(SCENARIOS).toHaveLength(6);

    const indexIds = SCENARIO_INDEX.map((s) => s.id);
    const fullIds = SCENARIOS.map((s) => s.id);
    expect(fullIds).toEqual(indexIds);

    for (const sc of SCENARIOS) {
      expect(sc.title.vi.trim().length).toBeGreaterThan(0);
      expect(sc.title.en.trim().length).toBeGreaterThan(0);
      expect(sc.subtitle.vi.trim().length).toBeGreaterThan(0);
      expect(sc.subtitle.en.trim().length).toBeGreaterThan(0);

      for (const stepKey of ['requirements', 'architecture', 'dataModel', 'interfaceApi', 'optimizations'] as const) {
        const step = sc.radio[stepKey];
        expect(step.heading.vi.trim().length).toBeGreaterThan(0);
        expect(step.heading.en.trim().length).toBeGreaterThan(0);
        expect(step.bullets.length).toBeGreaterThanOrEqual(2);
      }

      expect(sc.decisions.length).toBeGreaterThanOrEqual(2);
      for (const d of sc.decisions) {
        expect(d.options.length).toBeGreaterThanOrEqual(2);
        expect(d.options.some((o) => o.isOptimal), `${sc.id}/${d.id}: missing optimal option`).toBe(true);
      }

      expect(sc.relatedTopicIds.length).toBeGreaterThanOrEqual(4);
      for (const relId of sc.relatedTopicIds) {
        expect(
          TOPIC_META_MAP[relId],
          `${sc.id}: unknown relatedTopicId "${relId}"`,
        ).toBeDefined();
      }
    }
  });

  it('serves cached topics synchronously once a category module has been loaded', async () => {
    await loadCategoryTopics('architecture');
    const cached = getCachedTopic('architecture', 'ssr');
    expect(cached).toBeDefined();
    expect(cached?.id).toBe('ssr');
    expect(cached?.categoryId).toBe('architecture');
  });
});
