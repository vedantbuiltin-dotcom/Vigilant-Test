import React, { useState } from 'react';
import { Box, Typography, Stack, TextField, Button, IconButton, Tooltip, Alert, Snackbar } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { rosterApi } from '../../api/rosterApi';

const BatchRow = ({ batch, onRefresh, onError }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(batch.name);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveEdit = async () => {
    if (!editName.trim() || editName === batch.name) {
      setIsEditing(false);
      return;
    }
    setIsUpdating(true);
    try {
      await rosterApi.updateBatch(batch.id, { name: editName });
      await onRefresh();
    } catch (err) {
      onError(err.message || 'Failed to rename batch');
      setEditName(batch.name);
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete batch "${batch.name}"?`)) return;
    setIsDeleting(true);
    try {
      await rosterApi.removeBatch(batch.id);
      await onRefresh();
    } catch (err) {
      if (err.status === 409 || err.message?.toLowerCase().includes('conflict') || err.message?.toLowerCase().includes('reference')) {
        onError(`Cannot delete batch "${batch.name}" because it is currently assigned to an exam.`);
      } else {
        onError(err.message || 'Failed to delete batch');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ p: 1.5, border: '1px solid #E3DFD4', borderRadius: '4px', bgcolor: '#fff', mb: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {isEditing ? (
          <Stack direction="row" spacing={1} sx={{ flex: 1, mr: 1 }}>
            <TextField
              size="small"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              fullWidth
              disabled={isUpdating}
              sx={{ '& .MuiOutlinedInput-root': { height: '32px' } }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') {
                  setEditName(batch.name);
                  setIsEditing(false);
                }
              }}
            />
            <IconButton size="small" onClick={handleSaveEdit} disabled={isUpdating} sx={{ color: '#0F7A5C' }}>
              <CheckOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => { setEditName(batch.name); setIsEditing(false); }} disabled={isUpdating}>
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ) : (
          <Typography
            onClick={() => setIsEditing(true)}
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: '#16201C',
              cursor: 'pointer',
              flex: 1,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {batch.name}
          </Typography>
        )}

        {!isEditing && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px', color: '#6B6A62' }}>
              {batch.studentCount || 0}
            </Typography>
            <Tooltip title="Delete Batch">
              <IconButton size="small" onClick={handleDelete} disabled={isDeleting} sx={{ color: '#C97A1A' }}>
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

const BatchesSidebar = ({ batches, onRefresh }) => {
  const [newBatchName, setNewBatchName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddBatch = async () => {
    if (!newBatchName.trim()) return;
    setIsAdding(true);
    try {
      await rosterApi.createBatch({ name: newBatchName });
      setNewBatchName('');
      await onRefresh();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create batch');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#FBFAF6', border: '1px solid #E3DFD4', borderRadius: '4px', p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="overline" sx={{ color: '#6B6A62', fontWeight: 600, letterSpacing: '0.05em', mb: 2 }}>
        BATCHES
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="New batch name"
          value={newBatchName}
          onChange={(e) => setNewBatchName(e.target.value)}
          fullWidth
          disabled={isAdding}
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
          onKeyDown={(e) => e.key === 'Enter' && handleAddBatch()}
        />
        <Button
          variant="contained"
          onClick={handleAddBatch}
          disabled={!newBatchName.trim() || isAdding}
          sx={{
            bgcolor: '#0F7A5C',
            color: '#fff',
            minWidth: 'auto',
            px: 2,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#085041', boxShadow: 'none' }
          }}
        >
          Add
        </Button>
      </Stack>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {batches.map(batch => (
          <BatchRow key={batch.id} batch={batch} onRefresh={onRefresh} onError={setErrorMsg} />
        ))}
        {batches.length === 0 && (
          <Typography sx={{ fontSize: '13px', color: '#6B6A62', textAlign: 'center', mt: 4 }}>
            No batches created yet.
          </Typography>
        )}
      </Box>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMsg('')} severity="error" sx={{ width: '100%', boxShadow: 3 }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BatchesSidebar;
