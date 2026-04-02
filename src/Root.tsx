import { AppBar, Avatar, Box, Chip, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { useTheme } from '@mui/material/styles';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { App } from './App';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { useThemeMode } from './context/ThemeContext';

function Navbar() {
  const { token, user, role, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const { palette } = useTheme();
  const isDark = palette.mode === 'dark';
  const location = useLocation();

  const ROLE_COLORS = {
    Admin: isDark ? { bg: 'rgba(92,78,232,0.25)', color: '#A5B4FC' } : { bg: '#EEF0FD', color: '#5C4EE8' },
    Accountant: isDark ? { bg: 'rgba(16,185,129,0.2)', color: '#34D399' } : { bg: '#D1FAE5', color: '#065F46' },
    Viewer: isDark ? { bg: 'rgba(245,158,11,0.2)', color: '#FCD34D' } : { bg: '#FEF3C7', color: '#92400E' },
  };

  // Hide navbar on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  if (!token || isAuthPage) return null;

  const email = typeof user?.email === 'string' ? user.email : '';
  const initials = email ? email.slice(0, 2).toUpperCase() : '??';
  const roleStyle = role ? (ROLE_COLORS[role] ?? { bg: '#F3F4F6', color: '#374151' }) : { bg: '#F3F4F6', color: '#374151' };

  return (
    <AppBar position="sticky" elevation={0} sx={{borderRadius: "0"}}>
      <Toolbar sx={{ px: { xs: 1.5, sm: 4 }, minHeight: '64px !important', gap: { xs: 1, sm: 2 } }}>
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Box sx={{
            width: { xs: 26, sm: 32 }, height: { xs: 26, sm: 32 }, borderRadius: '9px',
            background: 'linear-gradient(135deg, #5C4EE8 0%, #4538C7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ReceiptLongOutlinedIcon sx={{ fontSize: { xs: 14, sm: 17 }, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '1rem' }, letterSpacing: 0.3, color: '#0F0F1A' }}>
            PeakEaze
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Role badge */}
        {role ? (
          <Chip
            size="small"
            label={role}
            sx={{
              backgroundColor: roleStyle.bg,
              color: roleStyle.color,
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 24
            }}
          />
        ) : null}

        {/* User avatar */}
        <Avatar sx={{ width: { xs: 30, sm: 34 }, height: { xs: 30, sm: 34 }, bgcolor: '#5C4EE8', fontSize: '0.75rem', fontWeight: 700 }}>
          {initials}
        </Avatar>

        {email ? (
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
            {email}
          </Typography>
        ) : null}

        {/* Logout */}
        <Tooltip title="Sign out">
          <IconButton size="small" onClick={logout} sx={{ color: 'text.secondary', '&:hover': { color: '#5C4EE8' } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Theme toggle */}
        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton
            size="small"
            onClick={toggleMode}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: '#5C4EE8' },
              ml: 0.5
            }}
          >
            {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

function AppShell() {
  const { token } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isAuthPage || !token ? 'transparent' : 'background.default' }}>
      <Navbar />
      <Box
        component="main"
        sx={
          isAuthPage || !token
            ? {}
            : {
                maxWidth: 1200,
                mx: 'auto',
                px: { xs: 2, sm: 4 },
                pb: 6
              }
        }
      >
        <App />
      </Box>
    </Box>
  );
}

export function Root() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
