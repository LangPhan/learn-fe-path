import { describe, expect, it } from 'vitest';
import { loadAllChallenges } from '@/data/loader';
import { TOPIC_META_MAP } from '@/data/topicIndex';
import { runChallengeTestsInMemory } from '@/sandbox/compiler';

describe('Automated Coding Challenges (Solutions Pass & Starters Fail)', () => {
  it('loads all 37 coding challenges with valid metadata and bilingual hints', async () => {
    const challenges = await loadAllChallenges();
    expect(challenges).toHaveLength(37);

    const uniqueIds = new Set(challenges.map((c) => c.id));
    expect(uniqueIds.size).toBe(37);

    for (const ch of challenges) {
      expect(TOPIC_META_MAP[ch.topicId], `${ch.id}: unknown topicId "${ch.topicId}"`).toBeDefined();
      expect(ch.title.vi.trim().length).toBeGreaterThan(0);
      expect(ch.title.en.trim().length).toBeGreaterThan(0);
      expect(ch.prompt.vi.trim().length).toBeGreaterThan(0);
      expect(ch.prompt.en.trim().length).toBeGreaterThan(0);
      expect(ch.starterCode.trim().length).toBeGreaterThan(0);
      expect(ch.solutionCode.trim().length).toBeGreaterThan(0);
      expect(ch.testCode.trim().length).toBeGreaterThan(0);
      expect(ch.hints.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('passes 100% of unit tests on every solutionCode and fails on every starterCode', async () => {
    const challenges = await loadAllChallenges();

    for (const ch of challenges) {
      const solutionRun = await runChallengeTestsInMemory(ch.solutionCode, ch.testCode);
      const failureDetails = solutionRun.results
        .filter((r) => !r.passed)
        .map((r) => `${r.name}: ${r.error ?? 'failed'}`)
        .join(' | ');

      expect(
        solutionRun.error,
        `${ch.id} solution runner error: ${solutionRun.error ?? ''}`,
      ).toBeUndefined();
      expect(solutionRun.total, `${ch.id} must define >= 1 unit test`).toBeGreaterThanOrEqual(1);
      expect(
        solutionRun.passed,
        `${ch.id} solution failed (${solutionRun.passed}/${solutionRun.total}): ${failureDetails}`,
      ).toBe(solutionRun.total);

      const starterRun = await runChallengeTestsInMemory(ch.starterCode, ch.testCode);
      const starterStillIncomplete = Boolean(starterRun.error) || starterRun.passed < starterRun.total;
      expect(
        starterStillIncomplete,
        `${ch.id} starterCode unexpectedly passed all ${starterRun.total} tests without user edits`,
      ).toBe(true);
    }
  }, 30000);
});
