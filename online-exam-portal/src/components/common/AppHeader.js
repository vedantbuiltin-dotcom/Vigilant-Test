import { Alert, AppBar, Avatar, Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AppHeader = () => {
  const { user, logout, bypass } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (!bypass) navigate('/login', { replace: true });
  };

  const initials = (user?.name || user?.email || 'U')
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
    
  const displayId = user?.id ? String(user.id).substring(0, 4).toUpperCase() : '0000';

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#F6F4EF', borderBottom: '1px solid #DDD8C9' }}>
        <Toolbar sx={{ gap: 2, minHeight: '64px' }}>
          {/* Brand Mark */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                width: 26,
                height: 26,
                border: '2px solid #C97A1A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
            >
              <Box sx={{ width: 6, height: 6, bgcolor: '#0F7A5C', borderRadius: '50%' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                fontSize: '18px'
              }}
            >
              <Box component="span" sx={{ color: '#16201C' }}>VIGILANT</Box>
              <Box component="span" sx={{ color: '#0F7A5C' }}>-TEST</Box>
            </Typography>
          </Stack>

          {/* User Info Block */}
          {user && (
            <Stack direction="row" alignItems="center" spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ bgcolor: '#E1F5EE', color: '#085041', fontSize: 13, fontWeight: 600, width: 36, height: 36 }}>
                  {initials}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography sx={{ fontWeight: 500, fontSize: '13px', color: '#16201C', lineHeight: 1.2 }}>
                    {user.name || user.email}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: '11px',
                      color: '#6B6A62',
                      textTransform: 'uppercase',
                      mt: 0.5
                    }}
                  >
                    {user.role} · ID {displayId}
                    {bypass ? ' · BYPASS' : ''}
                  </Typography>
                </Box>
              </Stack>
              
              {!bypass && (
                <Button
                  variant="outlined"
                  startIcon={<LogoutRoundedIcon sx={{ fontSize: '18px !important' }} />}
                  onClick={handleLogout}
                  sx={{
                    borderColor: '#DDD8C9',
                    color: '#6B6A62',
                    fontFamily: '"Inter", sans-serif',
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 2,
                    py: 0.75,
                    '&:hover': {
                      borderColor: '#16201C',
                      bgcolor: 'transparent',
                      color: '#16201C'
                    }
                  }}
                >
                  Sign out
                </Button>
              )}
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {bypass && (
        <Alert
          severity="warning"
          variant="filled"
          sx={{ borderRadius: 0, justifyContent: 'center', '& .MuiAlert-message': { fontWeight: 600 } }}
        >
          AUTH_BYPASS is enabled - authentication is disabled. Disable in production.
        </Alert>
      )}
    </>
  );
};

export default AppHeader;
