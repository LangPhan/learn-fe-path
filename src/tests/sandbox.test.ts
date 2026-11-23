import { describe, expect, it } from 'vitest';
import { loadAllTopics } from '@/data/loader';
import { compileCode } from '@/sandbox/compiler';
import { buildSrcDoc } from '@/sandbox/buildSrcDoc';

function extractScriptBodies(doc: string): string[] {
  const matches = Array.from(doc.matchAll(/<script>([\s\S]*?)<\/script>/gi));
  return matches.map((m) => m[1].replace(/<\\\/script/gi, '</script'));
}

describe('Offline Sandbox Compilation & SrcDoc Generation', () => {
  it('compiles, wraps, and JS-parses all 86 topic live examples cleanly with zero syntax or scope collisions', async () => {
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
      } else {
        const scripts = extractScriptBodies(doc);
        expect(scripts.length, `${topic.id}: missing runtime scripts`).toBeGreaterThanOrEqual(2);
        const mainExecutionScript = scripts[scripts.length - 1];
        expect(
          () => new Function(mainExecutionScript),
          `${topic.id}: generated sandbox script failed JS syntax/scope parsing`,
        ).not.toThrow();
      }
    }
  });

  it('formats plain nested objects as JSON without false [Circular] markers while still handling true cycles', () => {
    const doc = buildSrcDoc({
      runId: 'vitest-log',
      mode: 'ts',
      compiledCode: 'console.log("ok");',
      theme: 'dark',
    });
    const [bridgeScript] = extractScriptBodies(doc);
    const messages: Array<Record<string, unknown>> = [];

    const mockWindow = {
      parent: {
        postMessage(payload: Record<string, unknown>) {
          messages.push(payload);
        },
      },
      console: globalThis.console,
      addEventListener() {},
      HTMLElement: globalThis.HTMLElement,
    };

    const runBridge = new Function('window', bridgeScript);
    runBridge(mockWindow);

    mockWindow.console.log({ id: 'res-1', ok: true, meta: { retries: 2 } });
    const plainMsg = messages.find((m) => m.type === 'sandbox-log') as { args?: string[] } | undefined;
    expect(plainMsg).toBeDefined();
    expect(plainMsg?.args?.[0]).toContain('"id": "res-1"');
    expect(plainMsg?.args?.[0]).toContain('"retries": 2');
    expect(plainMsg?.args?.[0]).not.toContain('[Circular]');

    const cyclic: { name: string; self?: unknown } = { name: 'root' };
    cyclic.self = cyclic;
    mockWindow.console.log(cyclic);
    const cycMsg = messages[1] as { args?: string[] };
    expect(cycMsg.args?.[0]).toContain('"name": "root"');
    expect(cycMsg.args?.[0]).toContain('[Circular]');
  });
});
