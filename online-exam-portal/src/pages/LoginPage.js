import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import AuthHeader from '../components/common/AuthHeader';

const initialState = { email: '', password: '', name: '' };

const CornerBracket = ({ top, bottom, left, right }) => (
  <Box
    sx={{
      position: 'absolute',
      top,
      bottom,
      left,
      right,
      width: 22,
      height: 22,
      border: '2px solid #C97A1A',
      borderBottom: bottom !== undefined ? undefined : 'none',
      borderTop: top !== undefined ? undefined : 'none',
      borderRight: right !== undefined ? undefined : 'none',
      borderLeft: left !== undefined ? undefined : 'none',
      pointerEvents: 'none',
    }}
  />
);

const FormLabel = ({ children }) => (
  <Typography
    sx={{
      display: 'block',
      mb: 0.5,
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#6B6A62',
      fontWeight: 500,
    }}
  >
    {children}
  </Typography>
);

const LoginPage = () => {
  const { login, register, loading, error, user, token, bypass } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  if (token && user) {
    const dest = location.state?.from?.pathname || '/home';
    return <Navigate to={dest} replace />;
  }

  if (bypass) {
    return <Navigate to={location.state?.from?.pathname || '/home'} replace />;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      if (mode === 'login') {
        await login({ email: form.email.trim(), password: form.password });
      } else {
        if (form.password.length < 8) {
          setLocalError('Password must be at least 8 characters.');
          return;
        }
        await register({ email: form.email.trim(), password: form.password, name: form.name.trim() });
      }
      navigate('/home', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Unable to authenticate.');
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@example.com', password: 'Admin@12345', name: '' });
    else setForm({ email: 'student@example.com', password: 'Student@12345', name: '' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          overflow: 'visible',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        <CornerBracket top={0} left={0} />
        <CornerBracket top={0} right={0} />
        <CornerBracket bottom={0} left={0} />
        <CornerBracket bottom={0} right={0} />

        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <AuthHeader />

          <Stack direction="row" spacing={3} sx={{ mb: 3, borderBottom: '1px solid #DDD8C9' }}>
            <Box
              component="button"
              type="button"
              onClick={() => setMode('login')}
              sx={{
                all: 'unset',
                cursor: 'pointer',
                pb: 1,
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: mode === 'login' ? '#16201C' : '#6B6A62',
                borderBottom: mode === 'login' ? '2px solid #0F7A5C' : '2px solid transparent',
              }}
            >
              LOGIN
            </Box>
            <Box
              component="button"
              type="button"
              onClick={() => setMode('register')}
              sx={{
                all: 'unset',
                cursor: 'pointer',
                pb: 1,
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: mode === 'register' ? '#16201C' : '#6B6A62',
                borderBottom: mode === 'register' ? '2px solid #0F7A5C' : '2px solid transparent',
              }}
            >
              REGISTER
            </Box>
          </Stack>

          {(localError || error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError || error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              {mode === 'register' && (
                <Box>
                  <FormLabel>FULL NAME</FormLabel>
                  <TextField
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </Box>
              )}
              <Box>
                <FormLabel>EMAIL</FormLabel>
                <TextField
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </Box>
              <Box>
                <FormLabel>PASSWORD</FormLabel>
                <TextField
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  helperText={mode === 'register' ? 'Use at least 8 characters.' : undefined}
                  FormHelperTextProps={{
                    sx: { mx: 0, mt: 0.5, fontSize: '11px', color: '#6B6A62' },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Button
                type="submit"
                size="large"
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 1,
                  backgroundColor: mode === 'login' ? '#16201C' : '#0F7A5C',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: mode === 'login' ? '#16201C' : '#0F7A5C',
                    opacity: 0.9,
                  },
                }}
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Enter exam portal' : 'Create candidate account'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3, borderColor: '#DDD8C9' }}>
            <Typography variant="caption" sx={{ color: '#6B6A62' }}>
              Demo credentials
            </Typography>
          </Divider>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => fillDemo('student')}
              sx={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '12px',
                color: '#6B6A62',
                borderColor: '#DDD8C9',
                '&:hover': { borderColor: '#16201C', backgroundColor: 'transparent' },
              }}
            >
              demo · student
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => fillDemo('admin')}
              sx={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '12px',
                color: '#6B6A62',
                borderColor: '#DDD8C9',
                '&:hover': { borderColor: '#16201C', backgroundColor: 'transparent' },
              }}
            >
              demo · admin
            </Button>
          </Stack>

          <Typography
            variant="caption"
            align="center"
            sx={{ display: 'block', mt: 3, color: '#A09F97', fontSize: '11px' }}
          >
            By continuing you accept the fair-use exam rules.{' '}
            <Link
              href="https://github.com/Kash15if"
              target="_blank"
              rel="noreferrer"
              sx={{ color: '#6B6A62', textDecorationColor: '#DDD8C9' }}
            >
              Learn more
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
