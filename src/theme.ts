import { createTheme, alpha } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

const BRAND = '#5C4EE8';
const BRAND_DARK = '#4538C7';
const BRAND_LIGHT = '#EEF0FD';

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';
  return createTheme({
  palette: {
    mode,
    primary: {
      main: BRAND,
      dark: BRAND_DARK,
      light: BRAND_LIGHT,
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#10B981',
      contrastText: '#ffffff'
    },
    background: {
      default: isDark ? '#0D0D1A' : '#F4F5F9',
      paper: isDark ? '#161625' : '#FFFFFF'
    },
    text: {
      primary: isDark ? '#F3F4F6' : '#0F0F1A',
      secondary: isDark ? '#9CA3AF' : '#6B7280'
    },
    divider: isDark ? '#2A2A3D' : '#E5E7EB',
    error: { main: '#EF4444' },
    warning: { main: isDark ? '#FCD34D' : '#F59E0B' },
    success: { main: isDark ? '#34D399' : '#10B981' }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500, color: '#6B7280' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0.2 }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.06), 0px 1px 2px rgba(0,0,0,0.04)',
    '0px 4px 8px rgba(0,0,0,0.06), 0px 2px 4px rgba(0,0,0,0.04)',
    '0px 8px 16px rgba(0,0,0,0.08), 0px 4px 8px rgba(0,0,0,0.04)',
    '0px 12px 24px rgba(0,0,0,0.10), 0px 4px 8px rgba(0,0,0,0.04)',
    '0px 16px 32px rgba(0,0,0,0.10)',
    '0px 20px 40px rgba(0,0,0,0.10)',
    '0px 24px 48px rgba(0,0,0,0.12)',
    '0px 28px 56px rgba(0,0,0,0.12)',
    '0px 32px 64px rgba(0,0,0,0.12)',
    '0px 36px 72px rgba(0,0,0,0.12)',
    '0px 40px 80px rgba(0,0,0,0.12)',
    '0px 44px 88px rgba(0,0,0,0.12)',
    '0px 48px 96px rgba(0,0,0,0.12)',
    '0px 52px 104px rgba(0,0,0,0.12)',
    '0px 56px 112px rgba(0,0,0,0.12)',
    '0px 60px 120px rgba(0,0,0,0.12)',
    '0px 64px 128px rgba(0,0,0,0.12)',
    '0px 68px 136px rgba(0,0,0,0.12)',
    '0px 72px 144px rgba(0,0,0,0.12)',
    '0px 76px 152px rgba(0,0,0,0.12)',
    '0px 80px 160px rgba(0,0,0,0.12)',
    '0px 84px 168px rgba(0,0,0,0.12)',
    '0px 88px 176px rgba(0,0,0,0.14)',
    '0px 92px 184px rgba(0,0,0,0.14)'
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.925rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          '&.Mui-disabled': {
            opacity: 0.55,
            color: '#ffffff',
            backgroundColor: alpha(BRAND, 0.6)
          }
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${BRAND_DARK} 0%, #3629A6 100%)`
          },
          '&.Mui-disabled': {
            background: `linear-gradient(135deg, ${alpha(BRAND, 0.75)} 0%, ${alpha(BRAND_DARK, 0.75)} 100%)`,
            color: 'rgba(255,255,255,0.85)'
          }
        },
        containedError: {
          '&.Mui-disabled': {
            background: alpha('#EF4444', 0.7),
            color: 'rgba(255,255,255,0.85)'
          }
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': { borderWidth: '1.5px' },
          '&.Mui-disabled': {
            borderWidth: '1.5px',
            borderColor: alpha(BRAND, 0.3),
            color: alpha(BRAND, 0.45)
          }
        },
        sizeSmall: {
          padding: '5px 14px',
          fontSize: '0.8125rem'
        },
        sizeMedium: {
          padding: '7px 18px',
          fontSize: '0.875rem'
        }
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FAFAFA',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: BRAND,
              borderWidth: '2px'
            }
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: BRAND,
            borderWidth: '2px'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: isDark
            ? '0px 1px 3px rgba(0,0,0,0.4), 0px 1px 2px rgba(0,0,0,0.3)'
            : '0px 1px 3px rgba(0,0,0,0.06), 0px 1px 2px rgba(0,0,0,0.04)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16
        },
        outlined: {
          borderColor: '#E5E7EB'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: 8
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: isDark ? '#1E1E2E' : '#F9FAFB',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isDark ? '#9CA3AF' : '#6B7280',
            borderBottom: isDark ? '1px solid #2A2A3D' : '1px solid #E5E7EB'
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover td': {
            backgroundColor: alpha(BRAND, 0.03)
          },
          '&:last-child td': { borderBottom: 0 }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: isDark ? '#2A2A3D' : '#F3F4F6',
          padding: '14px 16px'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          '&.Mui-focused': { color: BRAND }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: isDark ? '#13131F' : '#FFFFFF',
          color: isDark ? '#F3F4F6' : '#0F0F1A',
          boxShadow: isDark ? '0px 1px 0px #2A2A3D' : '0px 1px 0px #E5E7EB'
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: isDark ? '#2A2A3D' : '#E5E7EB' }
      }
    }
  }
  });
}

export const theme = createAppTheme('light');
