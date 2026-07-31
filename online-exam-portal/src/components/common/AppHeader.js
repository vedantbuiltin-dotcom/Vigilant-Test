import { Alert, AppBar, Avatar, Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
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

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
            <SchoolRoundedIcon />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
              Online Exam Portal
            </Typography>
          </Stack>

          {user && (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.name || user.email}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  {user.role}
                  {bypass ? ' \u00b7 bypass' : ''}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 700 }}>
                {initials}
              </Avatar>
              {!bypass && (
                <Button
                  color="inherit"
                  variant="outlined"
                  startIcon={<LogoutRoundedIcon />}
                  onClick={handleLogout}
                  sx={{ borderColor: 'rgba(255,255,255,0.4)', '&:hover': { borderColor: '#fff' } }}
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
