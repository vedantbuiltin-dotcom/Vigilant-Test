import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Stack, IconButton, Tooltip } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

const drawerWidth = 200;

const menuItems = [
  { text: 'Dashboard', path: '/admin/dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
  { text: 'Exams', path: '/admin/exams', icon: <DescriptionOutlinedIcon fontSize="small" /> },
  { text: 'Question bank', path: '/admin/questions', icon: <StorageOutlinedIcon fontSize="small" /> },
  { text: 'Students', path: '/admin/roster', icon: <PeopleAltOutlinedIcon fontSize="small" /> },
  { text: 'Live monitor', path: '/admin/monitor', icon: <MonitorHeartOutlinedIcon fontSize="small" /> },
  { text: 'Results', path: '/admin/results', icon: <AssessmentOutlinedIcon fontSize="small" /> },
  { text: 'Audit log', path: '/admin/audit', icon: <HistoryOutlinedIcon fontSize="small" /> },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const initials = (user?.name || user?.email || 'A')
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
    
  const displayId = user?.id ? String(user.id).substring(0, 4).toUpperCase() : '0001';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F6F4EF' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            bgcolor: '#FBFAF6',
            borderRight: '1px solid #E3DFD4'
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 22,
              height: 22,
              border: '2px solid #C97A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}
          >
            <Box sx={{ width: 5, height: 5, bgcolor: '#0F7A5C', borderRadius: '50%' }} />
          </Box>
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              fontSize: '15px'
            }}
          >
            <Box component="span" sx={{ color: '#16201C' }}>VIGILANT</Box>
            <Box component="span" sx={{ color: '#0F7A5C' }}>-TEST</Box>
          </Typography>
        </Box>
        <List sx={{ px: 0 }}>
          {menuItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderLeft: active ? '3px solid #0F7A5C' : '3px solid transparent',
                    bgcolor: active ? '#F0EEE6' : 'transparent',
                    py: 1,
                    px: 2.5,
                    '&:hover': {
                      bgcolor: active ? '#F0EEE6' : 'rgba(0,0,0,0.02)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: active ? '#16201C' : '#6B6A62' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: active ? 500 : 400,
                      fontSize: '14px',
                      color: active ? '#16201C' : '#6B6A62'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 500, fontSize: '13px', color: '#16201C', lineHeight: 1.2 }}>
                {user?.name || user?.email || 'Administrator'}
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
                ADMIN · ID {displayId}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: '#FAEEDA', color: '#633806', fontSize: 13, fontWeight: 600, width: 36, height: 36 }}>
              {initials}
            </Avatar>
            <Tooltip title="Logout">
              <IconButton onClick={() => { logout(); navigate('/login'); }} size="small" sx={{ ml: 0.5 }}>
                <LogoutOutlinedIcon fontSize="small" sx={{ color: '#6B6A62' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        <Box sx={{ p: 4, pt: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
