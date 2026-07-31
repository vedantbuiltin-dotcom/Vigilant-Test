import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AuthHeader from '../common/AuthHeader';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', path: '/admin' },
  { text: 'Exams', path: '/admin/exams' },
  { text: 'Question Bank', path: '/admin/questions' },
  { text: 'Student Roster', path: '/admin/roster' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid #DDD8C9'
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <AuthHeader />
        </Box>
        <List sx={{ mt: 2 }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderLeft: active ? '3px solid #0F7A5C' : '3px solid transparent',
                    bgcolor: active ? 'rgba(15, 122, 92, 0.05)' : 'transparent',
                  }}
                >
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: active ? 600 : 500,
                      color: active ? '#16201C' : '#6B6A62'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
