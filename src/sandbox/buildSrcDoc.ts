import { REACT_RUNTIME_IIFE } from '@/sandbox/generated/reactRuntime';
import { SHARED_TEST_HARNESS_SOURCE } from '@/sandbox/compiler';
import type { SandboxMode, Theme } from '@/types/curriculum';

export interface BuildSrcDocOptions {
  runId: string;
  mode: SandboxMode;
  compiledCode: string;
  compiledTestCode?: string;
  css?: string;
  theme: Theme;
}

function escapeScriptTag(content: string): string {
  return content.replace(/<\/script/gi, '<\\/script');
}

function buildBridgeScript(runId: string): string {
  return `
(function() {
  const RUN_ID = ${JSON.stringify(runId)};
  const send = (payload) => {
    try {
      window.parent.postMessage({ source: 'fe-sd-sandbox', runId: RUN_ID, ...payload }, '*');
    } catch {}
  };

  function safeFormat(val, seen = new WeakSet()) {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'bigint') return String(val);
    if (typeof val === 'symbol') return val.toString();
    if (typeof val === 'function') return '[Function: ' + (val.name || 'anonymous') + ']';
    if (val instanceof Error) return val.stack || (val.name + ': ' + val.message);
    if (val instanceof HTMLElement) return '<' + val.tagName.toLowerCase() + '>';
    if (typeof val === 'object') {
      if (seen.has(val)) return '[Circular]';
      seen.add(val);
      if (val instanceof Map) return 'Map(' + val.size + ') ' + safeFormat(Array.from(val.entries()), seen);
      if (val instanceof Set) return 'Set(' + val.size + ') ' + safeFormat(Array.from(val.values()), seen);
      if (Array.isArray(val)) return '[' + val.map((item) => safeFormat(item, seen)).join(', ') + ']';
      try {
        return JSON.stringify(val, (_k, v) => {
          if (typeof v === 'object' && v !== null) {
            if (seen.has(v)) return '[Circular]';
          }
          if (typeof v === 'function') return '[Function]';
          return v;
        }, 2);
      } catch {
        return Object.prototype.toString.call(val);
      }
    }
    return String(val);
  }

  const timers = new Map();
  const originalConsole = window.console;

  window.console = {
    ...originalConsole,
    log: (...args) => { send({ type: 'sandbox-log', level: 'log', args: args.map((a) => safeFormat(a)) }); },
    info: (...args) => { send({ type: 'sandbox-log', level: 'info', args: args.map((a) => safeFormat(a)) }); },
    warn: (...args) => { send({ type: 'sandbox-log', level: 'warn', args: args.map((a) => safeFormat(a)) }); },
    error: (...args) => { send({ type: 'sandbox-log', level: 'error', args: args.map((a) => safeFormat(a)) }); },
    table: (data) => { send({ type: 'sandbox-log', level: 'table', args: [safeFormat(data)] }); },
    time: (label = 'default') => { timers.set(label, performance.now()); },
    timeEnd: (label = 'default') => {
      const start = timers.get(label);
      if (start !== undefined) {
        const elapsed = (performance.now() - start).toFixed(2);
        timers.delete(label);
        send({ type: 'sandbox-log', level: 'info', args: [label + ': ' + elapsed + 'ms'] });
      }
    },
  };

  window.addEventListener('error', (event) => {
    send({
      type: 'sandbox-error',
      message: event.error ? (event.error.message || String(event.error)) : (event.message || 'Runtime error'),
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    send({
      type: 'sandbox-error',
      message: reason instanceof Error ? reason.message : String(reason),
    });
  });

  window.__SANDBOX_SEND__ = send;
})();
`;
}

export function buildSrcDoc({
  runId,
  mode,
  compiledCode,
  compiledTestCode,
  css = '',
  theme,
}: BuildSrcDocOptions): string {
  const isDark = theme === 'dark';
  const baseStyles = `
    :root {
      color-scheme: ${isDark ? 'dark' : 'light'};
      --bg: ${isDark ? '#0d1118' : '#ffffff'};
      --fg: ${isDark ? '#edf1f7' : '#0f172a'};
      --surface: ${isDark ? '#151c27' : '#f1f5f9'};
      --border: ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'};
      --muted: ${isDark ? '#94a3b8' : '#475569'};
      --accent: ${isDark ? '#38bdf8' : '#0369a1'};
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      background: var(--bg);
      color: var(--fg);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    button, input, select, textarea {
      font-family: inherit;
      font-size: 13px;
    }
    button {
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      transition: background 120ms ease, border-color 120ms ease;
    }
    button:hover { border-color: var(--accent); }
    button.primary {
      background: var(--accent);
      color: ${isDark ? '#081018' : '#ffffff'};
      border-color: var(--accent);
      font-weight: 600;
    }
    input, select, textarea {
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
    }
    pre, code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12.5px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
    }
    .muted { color: var(--muted); }
    .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .col { display: flex; flex-direction: column; gap: 8px; }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid var(--border);
      background: var(--surface);
    }
    ${css}
  `;

  const bridgeScript = escapeScriptTag(buildBridgeScript(runId));

  if (mode === 'html') {
    const trimmed = compiledCode.trim();
    const hasHtmlTag = /<html[\s>]/i.test(trimmed);
    const injectedCss = css ? `<style>${css}</style>` : '';
    const headAdditions = `<style>${baseStyles}</style>${injectedCss}<script>${bridgeScript}</script>`;
    const doneScript = `<script>window.__SANDBOX_SEND__ && window.__SANDBOX_SEND__({ type: 'sandbox-done', durationMs: 1 });</script>`;

    if (hasHtmlTag) {
      const withHead = /<head[^>]*>/i.test(trimmed)
        ? trimmed.replace(/<head([^>]*)>/i, `<head$1>${headAdditions}`)
        : trimmed.replace(/<html([^>]*)>/i, `<html$1><head>${headAdditions}</head>`);
      return /<\/body>/i.test(withHead)
        ? withHead.replace(/<\/body>/i, `${doneScript}</body>`)
        : `${withHead}${doneScript}`;
    }

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  ${headAdditions}
</head>
<body>
  ${trimmed}
  ${doneScript}
</body>
</html>`;
  }

  const reactRuntimeScript =
    mode === 'react' ? `<script>${escapeScriptTag(REACT_RUNTIME_IIFE)}</script>` : '';

  const reactScopePrelude =
    mode === 'react'
      ? `
      const React = window.React;
      const {
        useState, useEffect, useMemo, useCallback, useRef, useReducer,
        createContext, useContext, Fragment, memo, useTransition,
        useDeferredValue, useId, startTransition
      } = React;
      let __mountedRoot = null;
      function render(element) {
        const container = document.getElementById('root');
        if (!container) return;
        if (!__mountedRoot) {
          __mountedRoot = window.ReactDOMClient.createRoot(container);
        }
        __mountedRoot.render(element);
      }
      `
      : '';

  const reactAutoMount =
    mode === 'react'
      ? `
      let __Comp = window.__SANDBOX_DEFAULT_EXPORT__;
      if (!__Comp && window.__SANDBOX_DEFAULT_NAME__) {
        try {
          __Comp = eval(window.__SANDBOX_DEFAULT_NAME__);
        } catch {}
      }
      if (!__Comp && typeof App === 'function') {
        __Comp = App;
      }
      if (__Comp && !__mountedRoot) {
        render(React.createElement(__Comp));
      }
      `
      : '';

  const testExecutionBlock = compiledTestCode
    ? `
      ${escapeScriptTag(compiledTestCode)}
      const __results = [];
      for (const __tc of __tests) {
        const __t0 = performance.now();
        try {
          await __tc.fn();
          __results.push({
            name: __tc.name,
            passed: true,
            durationMs: Math.max(0.1, Number((performance.now() - __t0).toFixed(2))),
          });
        } catch (__err) {
          __results.push({
            name: __tc.name,
            passed: false,
            error: __err instanceof Error ? __err.message : String(__err),
            durationMs: Math.max(0.1, Number((performance.now() - __t0).toFixed(2))),
          });
        }
      }
      window.__SANDBOX_SEND__({ type: 'sandbox-tests', results: __results });
    `
    : '';

  const defaultNonReactHint =
    mode !== 'react' && !compiledTestCode
      ? `
      const __appEl = document.getElementById('root');
      if (__appEl && __appEl.innerHTML.trim() === '') {
        __appEl.innerHTML = '<div class="card"><div style="font-weight:600;margin-bottom:4px;">Execution complete</div><div class="muted" style="font-size:12.5px;">Inspect logs in the Console tab or update DOM via <code>document.getElementById("root")</code>.</div></div>';
      }
      `
      : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>${baseStyles}</style>
  <script>${bridgeScript}</script>
  ${reactRuntimeScript}
</head>
<body>
  <div id="root"></div>
  <script>
    (async function() {
      const __start = performance.now();
      try {
        ${escapeScriptTag(SHARED_TEST_HARNESS_SOURCE)}
        ${reactScopePrelude}
        ${escapeScriptTag(compiledCode)}
        ${reactAutoMount}
        ${testExecutionBlock}
        ${defaultNonReactHint}
      } catch (err) {
        window.__SANDBOX_SEND__({
          type: 'sandbox-error',
          message: err instanceof Error ? (err.stack || err.message) : String(err),
        });
      } finally {
        const elapsed = Number((performance.now() - __start).toFixed(2));
        window.__SANDBOX_SEND__({ type: 'sandbox-done', durationMs: elapsed });
      }
    })();
  </script>
</body>
</html>`;
}
