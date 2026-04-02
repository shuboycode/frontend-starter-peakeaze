import { Box, Button, IconButton, InputAdornment, TextField, Tooltip, Typography, Alert } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../auth/AuthContext';
import { validateEmail, validatePassword } from '../validation/validators';
import { useThemeMode } from '../context/ThemeContext';

function AuthLeftPanel() {
  return (
    <Box
      sx={{
        flex: '0 0 45%',
        background: 'linear-gradient(145deg, #6C5CE7 0%, #5C4EE8 40%, #4538C7 100%)',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 5,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative blobs */}
      <Box sx={{ position: 'absolute', top: 60, left: 40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
      <Box sx={{ position: 'absolute', top: 120, left: 120, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <Box sx={{ position: 'absolute', bottom: 120, right: 40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <Box sx={{ position: 'absolute', bottom: 200, right: 120, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          background: 'rgba(255,255,255,0.2)',
          border: '1.5px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1 }}>P</Typography>
        </Box>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: 0.5 }}>PEAKEAZE</Typography>
      </Box>

      {/* Hero text */}
      <Box sx={{ zIndex: 1 }}>
        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem', lineHeight: 1.25, mb: 1.5 }}>
          Accounting,{' '}
          <Box component="span" sx={{ color: 'rgba(255,255,255,0.65)' }}>automated</Box>{' '}
          with Intelligence.
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.825rem', maxWidth: 300, lineHeight: 1.6 }}>
          Transform your accounting practice with intelligent automation. Let AI handle the routine while you focus on what matters.
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 4, zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.15)', pt: 2.5 }}>
        {[{ value: '98%', label: 'Time saved on\ndata entry' }, { value: '500+', label: 'Firms\ntransformed' }, { value: '99.9%', label: 'Accuracy\nrate' }].map((s) => (
          <Box key={s.value}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{s.value}</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', whiteSpace: 'pre-line', lineHeight: 1.4 }}>{s.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const { palette: { mode } } = useTheme();
  const { toggleMode } = useThemeMode();
  const isDark = mode === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const emailError = email.trim().length > 0 ? validateEmail(email) : null;
  const passwordError = password.trim().length > 0 ? validatePassword(password) : null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    if (emailError) { setFieldError(emailError); return; }
    if (passwordError) { setFieldError(passwordError); return; }

    try {
      await login(email, password);
      navigate('/invoices', { replace: true });
    } catch {
      // error is already in context
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AuthLeftPanel />

      {/* Right panel */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark
          ? 'linear-gradient(160deg, #0D0D1A 0%, #13131F 100%)'
          : 'linear-gradient(160deg, #F8F8FC 0%, #F0F0F8 100%)',
        p: { xs: 3, sm: 5 },
        position: 'relative'
      }}>
        {/* Theme toggle */}
        <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton
            size="small"
            onClick={toggleMode}
            sx={{ position: 'absolute', top: 16, right: 16, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        {/* Mobile brand logo — pinned to top */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, position: 'absolute', top: 24, left: 24 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(145deg, #6C5CE7, #4538C7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1 }}>P</Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: 0.5, color: '#5C4EE8' }}>PEAKEAZE</Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 360 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Welcome back</Typography>
          <Typography color="text.secondary" sx={{ mb: 3, fontSize: '0.875rem' }}>
            Sign in to your account to continue
          </Typography>

          <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>Email address</Typography>
              <TextField
                placeholder="you@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                size="small"
                error={!!emailError}
                helperText={emailError ?? ' '}
                FormHelperTextProps={{ sx: { mx: 0, mt: 0.5, mb: 0.25, minHeight: '1.25em' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>Password</Typography>
              <TextField
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                size="small"
                error={!!passwordError}
                helperText={passwordError ?? ' '}
                FormHelperTextProps={{ sx: { mx: 0, mt: 0.5, mb: 0.25, minHeight: '1.25em' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {(fieldError || error) ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{fieldError ?? error}</Alert>
            ) : null}

            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading || !email || !password || !!emailError || !!passwordError}
              sx={{ mt: 0.5, py: 1.25, fontSize: '0.9rem' }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </Button>
          </Box>

          <Typography align="center" sx={{ mt: 2.5, color: 'text.secondary', fontSize: '0.85rem' }}>
            Don't have an account?{' '}
            <Box
              component="span"
              onClick={() => navigate('/signup')}
              sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              Create one
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

