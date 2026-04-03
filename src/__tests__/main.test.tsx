import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Root } from '../Root';

const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({ render: renderMock }));

vi.mock('react-dom/client', () => ({
  __esModule: true,
  default: {
    createRoot: createRootMock
  }
}));

describe('main', () => {
  it('mounts app to #root with ThemeProvider and Root', async () => {
    const rootEl = document.createElement('div');
    rootEl.id = 'root';
    document.body.appendChild(rootEl);

    await import('../main');

    expect(createRootMock).toHaveBeenCalledWith(rootEl);
    expect(renderMock).toHaveBeenCalledTimes(1);
    const [app] = renderMock.mock.calls[0];
    expect(app.type).toBe(React.StrictMode);
    // StrictMode > QueryClientProvider > ThemeModeProvider > Root
    const queryProvider = app.props.children;
    expect(queryProvider.type.toString()).toContain('client');
    const themeProvider = queryProvider.props.children;
    expect(themeProvider.type.toString()).toContain('ThemeProvider');
    const children = Array.isArray(themeProvider.props.children)
      ? themeProvider.props.children
      : [themeProvider.props.children];
    const hasRoot = children.some((c: React.ReactElement) => c?.type === Root);
    expect(hasRoot).toBe(true);

    document.body.removeChild(rootEl);
  });
});
