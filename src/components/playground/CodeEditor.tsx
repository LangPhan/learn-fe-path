import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap, EditorView } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { cn } from '@/lib/utils';
import type { SandboxMode, Theme } from '@/types/curriculum';

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  mode: SandboxMode | 'css';
  theme: Theme;
  onRunShortcut?: () => void;
  fontSize?: number;
  className?: string;
  height?: string;
  readOnly?: boolean;
  ariaLabel?: string;
}

export function CodeEditor({
  value,
  onChange,
  mode,
  theme,
  onRunShortcut,
  fontSize = 13,
  className,
  height = '340px',
  readOnly = false,
  ariaLabel = 'Code editor',
}: CodeEditorProps) {
  const extensions = useMemo(() => {
    const langExt =
      mode === 'html'
        ? html()
        : mode === 'css'
          ? css()
          : javascript({
              jsx: mode === 'react',
              typescript: mode === 'ts' || mode === 'react',
            });

    const shortcutExt = Prec.highest(
      keymap.of([
        {
          key: 'Mod-Enter',
          run: () => {
            onRunShortcut?.();
            return true;
          },
        },
      ]),
    );

    const fontTheme = EditorView.theme({
      '&': {
        fontSize: `${fontSize}px`,
        fontFamily: 'var(--font-mono)',
      },
      '.cm-scroller': {
        fontFamily: 'var(--font-mono)',
        lineHeight: '1.55',
      },
      '.cm-content': {
        paddingTop: '10px',
        paddingBottom: '10px',
      },
    });

    return [langExt, shortcutExt, fontTheme, EditorView.lineWrapping];
  }, [mode, fontSize, onRunShortcut]);

  return (
    <div
      data-slot="code-editor"
      data-theme={theme}
      className={cn(
        'relative overflow-hidden rounded-md border border-border bg-card text-card-foreground',
        className,
      )}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        height={height}
        theme={theme === 'dark' ? oneDark : 'light'}
        extensions={extensions}
        readOnly={readOnly}
        aria-label={ariaLabel}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          bracketMatching: true,
          autocompletion: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}
