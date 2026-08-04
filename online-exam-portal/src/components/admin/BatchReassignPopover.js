import React, { useState, useEffect } from 'react';
import { Popover, Box, Typography, TextField, MenuItem, Button, Stack } from '@mui/material';

const BatchReassignPopover = ({ anchorEl, onClose, onApply, currentBatchId, batches }) => {
  const [selectedBatchId, setSelectedBatchId] = useState(currentBatchId || '');

  useEffect(() => {
    setSelectedBatchId(currentBatchId || '');
  }, [currentBatchId, anchorEl]);

  const handleApply = () => {
    if (selectedBatchId !== currentBatchId) {
      onApply(selectedBatchId);
    }
    onClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'reassign-popover' : undefined;

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: { p: 2, width: '250px', border: '1px solid #E3DFD4', boxShadow: 3, borderRadius: '4px' }
      }}
    >
      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#16201C', mb: 2 }}>
        Reassign Batch
      </Typography>
      
      <Stack spacing={2}>
        <TextField
          select
          size="small"
          fullWidth
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {batches.map(b => (
            <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
          ))}
        </TextField>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" onClick={onClose} sx={{ color: '#6B6A62', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button 
            size="small" 
            variant="contained" 
            onClick={handleApply}
            sx={{
              bgcolor: '#0F7A5C',
              color: '#fff',
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': { bgcolor: '#085041', boxShadow: 'none' }
            }}
          >
            Apply
          </Button>
        </Stack>
      </Stack>
    </Popover>
  );
};

export default BatchReassignPopover;
