import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Stack, Alert, CircularProgress, IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { superAdminApi } from '../../api/superAdminApi';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const SuperAdmin = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [creating, setCreating] = useState(false);


  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.listAdmins();
      setAdmins(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    try {
      setCreating(true);
      setError(null);
      setSuccess(null);
      await superAdminApi.createAdmin({ name, email, password });
      setSuccess(`Admin ${name} created successfully!`);
      setName('');
      setEmail('');
      setPassword('');
      fetchAdmins();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to create admin');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAdmin = async (id, email) => {
    if (email === 'vedantbuiltin@gmail.com') {
      setError('Cannot delete the super admin');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this administrator?')) return;
    
    try {
      setError(null);
      await superAdminApi.deleteAdmin(id);
      setSuccess('Administrator deleted successfully');
      fetchAdmins();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to delete admin');
    }
  };

  // Extra layer of security
  if (user?.email !== 'vedantbuiltin@gmail.com') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2 }}>
      <Typography variant="h4" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, color: '#16201C', mb: 3 }}>
        Super Admin Control
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 4, borderRadius: '8px', border: '1px solid #E3DFD4', boxShadow: 'none' }}>
        <Typography variant="h6" sx={{ mb: 2, fontFamily: '"Space Grotesk", sans-serif' }}>
          Add New Administrator
        </Typography>
        <form onSubmit={handleCreateAdmin}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Full Name"
              variant="outlined"
              size="small"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Email Address"
              type="email"
              variant="outlined"
              size="small"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              size="small"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={creating}
              sx={{ minWidth: 120, height: 40, boxShadow: 'none' }}
            >
              {creating ? <CircularProgress size={24} color="inherit" /> : 'Create'}
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper sx={{ borderRadius: '8px', border: '1px solid #E3DFD4', boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F0EEE6' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No admins found.
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Box component="span" sx={{ bgcolor: '#FAEEDA', color: '#633806', px: 1, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 500 }}>
                        {admin.role.toUpperCase()}
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(admin.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      {admin.email !== 'vedantbuiltin@gmail.com' && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteAdmin(admin.id, admin.email)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SuperAdmin;
