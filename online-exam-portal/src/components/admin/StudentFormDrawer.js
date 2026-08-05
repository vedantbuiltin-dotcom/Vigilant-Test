import React, { useState, useEffect } from 'react';
import { Drawer, Box, Typography, Stack, Button, TextField, MenuItem, IconButton, FormControl, InputLabel, Select } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

const StudentFormDrawer = ({ open, onClose, onSave, student = null, batches = [] }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [batchId, setBatchId] = useState('');

  useEffect(() => {
    if (student) {
      setFullName(student.fullName || student.name || ''); // depending on API mapping
      setEmail(student.email || '');
      setBatchId(student.batchId || student.batch?.id || '');
    } else {
      setFullName('');
      setEmail('');
      setBatchId('');
    }
  }, [student, open]);

  const handleSave = () => {
    const data = {
      fullName,
      email,
      batchId
    };
    if (student && student.id) {
      data.id = student.id;
    }
    onSave(data);
  };

  const isFormValid = () => {
    return fullName.trim() !== '' && email.trim() !== '';
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 400, bgcolor: '#FBFAF6' } }}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500 }}>
            {student ? 'Edit student' : 'Add student'}
          </Typography>
          <IconButton onClick={onClose} size="small"><CloseOutlinedIcon /></IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Stack spacing={3}>
            <TextField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              size="small"
            />
            
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              id="assign-batch-field"
              select
              label="Assign to Batch (Optional)"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {batches.map(b => (
                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4, pt: 2, borderTop: '1px solid #E3DFD4' }}>
          <Button onClick={onClose} sx={{ color: '#6B6A62' }}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSave}
            disabled={!isFormValid()}
          >
            Save
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default StudentFormDrawer;
