import { describe, expect, it } from 'vitest';
import { loadAllTopics } from '@/data/loader';
import { compileCode } from '@/sandbox/compiler';
import { buildSrcDoc } from '@/sandbox/buildSrcDoc';

describe('Offline Sandbox Compilation & SrcDoc Generation', () => {
  it('compiles and wraps all 86 topic live examples cleanly with zero errors', async () => {
    const topics = await loadAllTopics();
    expect(topics).toHaveLength(86);

    for (const topic of topics) {
      const compiled = compileCode(topic.example.code, topic.example.mode);
      expect(
        compiled.error,
        `${topic.id} (${topic.example.mode}) compile error: ${compiled.error ?? ''}`,
      ).toBeNull();
      expect(compiled.code.trim().length, `${topic.id}: empty compiled code`).toBeGreaterThan(0);

      const doc = buildSrcDoc({
        runId: `vitest-${topic.id}`,
        mode: topic.example.mode,
        compiledCode: compiled.code,
        css: topic.example.css,
        theme: 'dark',
      });

      expect(doc.toLowerCase()).toContain('<!doctype html>');
      expect(doc).toContain('fe-sd-sandbox');

      if (topic.example.mode === 'html') {
        expect(doc).toContain(topic.example.code);
      }
    }
  });
});
