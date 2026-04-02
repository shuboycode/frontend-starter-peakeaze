import type React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { Root } from '../Root';
import { theme } from '../theme';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('Root', () => {
  it('renders the app brand name', () => {
    renderWithTheme(<Root />);
    expect(screen.getAllByText(/PeakEaze/i).length).toBeGreaterThan(0);
  });
});
