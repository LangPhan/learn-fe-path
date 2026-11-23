import { transform } from 'sucrase';
import type { SandboxMode, TestCaseResult } from '@/types/curriculum';

export interface CompileResult {
  code: string;
  error: string | null;
}

export function preprocessSandboxImportsAndExports(source: string): string {
  let code = source;

  // Strip TypeScript `import type ...`
  code = code.replace(/^\s*import\s+type\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '');

  // Rewrite `import React, { useState, ... } from 'react'`
  code = code.replace(
    /^\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+)\}\s*from\s+['"]react['"];?\s*$/gm,
    (_m, _def, named) => {
      const cleaned = named
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s && !s.startsWith('type '))
        .map((s: string) => s.replace(/^type\s+/, '').replace(/\s+as\s+/g, ': '))
        .join(', ');
      return cleaned ? `const { ${cleaned} } = window.React;` : '';
    },
  );

  // Rewrite `import { useState, ... } from 'react'`
  code = code.replace(/^\s*import\s*\{([^}]+)\}\s*from\s+['"]react['"];?\s*$/gm, (_m, named) => {
    const cleaned = named
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s && !s.startsWith('type '))
      .map((s: string) => s.replace(/^type\s+/, '').replace(/\s+as\s+/g, ': '))
      .join(', ');
    return cleaned ? `const { ${cleaned} } = window.React;` : '';
  });

  // Strip `import React from 'react'` or `import * as React from 'react'`
  code = code.replace(/^\s*import\s+(?:\*\s+as\s+)?[A-Za-z_$][\w$]*\s+from\s+['"]react(?:-dom(?:\/client)?)?['"];?\s*$/gm, '');

  // Rewrite `import { createRoot } from 'react-dom/client'`
  code = code.replace(/^\s*import\s*\{([^}]+)\}\s*from\s+['"]react-dom(?:\/client)?['"];?\s*$/gm, (_m, named) => {
    const cleaned = named
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)
      .map((s: string) => s.replace(/\s+as\s+/g, ': '))
      .join(', ');
    return cleaned ? `const { ${cleaned} } = window.ReactDOMClient;` : '';
  });

  // Handle `export default async function Name` or `export default function Name` or `export default class Name`
  code = code.replace(
    /^\s*export\s+default\s+((?:async\s+)?function|class)\s+([A-Za-z_$][\w$]*)/gm,
    (_m, decl, name) => `window.__SANDBOX_DEFAULT_NAME__ = ${JSON.stringify(name)};\n${decl} ${name}`,
  );

  // Handle anonymous `export default function(...)`
  code = code.replace(
    /^\s*export\s+default\s+((?:async\s+)?function\s*\()/gm,
    'window.__SANDBOX_DEFAULT_EXPORT__ = $1',
  );

  // Handle `export default Expression;`
  code = code.replace(/^\s*export\s+default\s+/gm, 'window.__SANDBOX_DEFAULT_EXPORT__ = ');

  // Strip `export ` from declarations (`export function`, `export const`, `export class`, etc.)
  code = code.replace(/^\s*export\s+(?=(?:async\s+)?(?:function|const|let|var|class|interface|type|enum)\b)/gm, '');

  return code;
}

export function compileCode(source: string, mode: SandboxMode): CompileResult {
  if (mode === 'html') {
    return { code: source, error: null };
  }

  try {
    const preprocessed = preprocessSandboxImportsAndExports(source);
    const result = transform(preprocessed, {
      transforms: mode === 'react' ? ['typescript', 'jsx'] : ['typescript'],
      jsxRuntime: 'classic',
      production: true,
    });
    return { code: result.code, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { code: '', error: message };
  }
}

export const SHARED_TEST_HARNESS_SOURCE = `
const __tests = [];
function test(name, fn) {
  __tests.push({ name, fn });
}
const it = test;

function __deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp && b instanceof RegExp) return a.source === b.source && a.flags === b.flags;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!__deepEqual(a[key], b[key])) return false;
  }
  return true;
}

function __fmt(v) {
  try {
    if (typeof v === 'string') return JSON.stringify(v);
    if (v === undefined) return 'undefined';
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function __createMatchers(actual, negated) {
  const assert = (cond, msg) => {
    const pass = negated ? !cond : cond;
    if (!pass) {
      throw new Error(negated ? 'Expected NOT: ' + msg : msg);
    }
  };

  return {
    get not() {
      return __createMatchers(actual, !negated);
    },
    toBe(expected) {
      assert(Object.is(actual, expected), 'Expected ' + __fmt(actual) + ' to be ' + __fmt(expected));
    },
    toEqual(expected) {
      assert(__deepEqual(actual, expected), 'Expected ' + __fmt(actual) + ' to equal ' + __fmt(expected));
    },
    toContain(item) {
      const ok = typeof actual === 'string'
        ? actual.includes(String(item))
        : Array.isArray(actual)
          ? actual.some((el) => __deepEqual(el, item))
          : false;
      assert(ok, 'Expected ' + __fmt(actual) + ' to contain ' + __fmt(item));
    },
    toBeTruthy() {
      assert(Boolean(actual), 'Expected ' + __fmt(actual) + ' to be truthy');
    },
    toBeFalsy() {
      assert(!actual, 'Expected ' + __fmt(actual) + ' to be falsy');
    },
    toBeNull() {
      assert(actual === null, 'Expected ' + __fmt(actual) + ' to be null');
    },
    toBeUndefined() {
      assert(actual === undefined, 'Expected ' + __fmt(actual) + ' to be undefined');
    },
    toBeDefined() {
      assert(actual !== undefined, 'Expected value to be defined');
    },
    toBeGreaterThan(n) {
      assert(actual > n, 'Expected ' + actual + ' > ' + n);
    },
    toBeGreaterThanOrEqual(n) {
      assert(actual >= n, 'Expected ' + actual + ' >= ' + n);
    },
    toBeLessThan(n) {
      assert(actual < n, 'Expected ' + actual + ' < ' + n);
    },
    toBeLessThanOrEqual(n) {
      assert(actual <= n, 'Expected ' + actual + ' <= ' + n);
    },
    toBeCloseTo(expected, precision = 2) {
      const diff = Math.abs(actual - expected);
      const tol = Math.pow(10, -precision) / 2;
      assert(diff < tol, 'Expected ' + actual + ' to be close to ' + expected);
    },
    toHaveLength(len) {
      const actualLen = actual && typeof actual.length === 'number' ? actual.length : -1;
      assert(actualLen === len, 'Expected length ' + actualLen + ' to be ' + len);
    },
    toThrow(match) {
      let threw = false;
      let errMsg = '';
      try {
        if (typeof actual === 'function') actual();
      } catch (e) {
        threw = true;
        errMsg = e && e.message ? e.message : String(e);
      }
      if (match) {
        const matches = match instanceof RegExp ? match.test(errMsg) : errMsg.includes(String(match));
        assert(threw && matches, 'Expected function to throw matching ' + match + ', got: ' + errMsg);
      } else {
        assert(threw, 'Expected function to throw');
      }
    },
  };
}

function expect(actual) {
  return __createMatchers(actual, false);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function mockFetch(url, options = {}) {
  const { delay = 80, failRate = 0, response = { ok: true, url }, status = 200, signal } = options;
  if (signal && signal.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, delay);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      }, { once: true });
    }
  });
  if (Math.random() < failRate) {
    throw new Error('Network error fetching ' + url);
  }
  return {
    ok: status >= 200 && status < 300,
    status,
    url,
    json: async () => (typeof response === 'function' ? response(url) : response),
    text: async () => JSON.stringify(typeof response === 'function' ? response(url) : response),
  };
}
`;

export async function runChallengeTestsInMemory(
  userCode: string,
  testCode: string,
): Promise<{ passed: number; total: number; results: TestCaseResult[]; error?: string }> {
  const compiledUser = compileCode(userCode, 'ts');
  if (compiledUser.error) {
    return { passed: 0, total: 0, results: [], error: `Compile error: ${compiledUser.error}` };
  }
  const compiledTests = compileCode(testCode, 'ts');
  if (compiledTests.error) {
    return { passed: 0, total: 0, results: [], error: `Test compile error: ${compiledTests.error}` };
  }

  const fullBody = `
    const window = globalThis;
    ${SHARED_TEST_HARNESS_SOURCE}
    ${compiledUser.code}
    ${compiledTests.code}
    const results = [];
    for (const tc of __tests) {
      const start = performance.now();
      try {
        await tc.fn();
        results.push({ name: tc.name, passed: true, durationMs: Math.max(0.1, Number((performance.now() - start).toFixed(2))) });
      } catch (err) {
        results.push({
          name: tc.name,
          passed: false,
          error: err instanceof Error ? err.message : String(err),
          durationMs: Math.max(0.1, Number((performance.now() - start).toFixed(2))),
        });
      }
    }
    return results;
  `;

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
      ...args: string[]
    ) => () => Promise<TestCaseResult[]>;
    const runner = new AsyncFunction(fullBody);
    const results = await runner();
    const passed = results.filter((r) => r.passed).length;
    return { passed, total: results.length, results };
  } catch (err) {
    return {
      passed: 0,
      total: 0,
      results: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
