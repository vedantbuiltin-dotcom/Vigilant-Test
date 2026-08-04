import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
} from '@mui/material';

const PublishConfirmDialog = ({ open, onClose, onConfirm, exam }) => {
  if (!exam) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#FBFAF6', borderRadius: '2px' } }}>
      <DialogTitle sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, color: '#16201C' }}>
        Confirm Publish: {exam.title}
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: '#E3DFD4' }}>
        <Typography sx={{ color: '#6B6A62', fontFamily: '"Inter", sans-serif', mb: 3 }}>
          Once published, students will be able to start this exam if the current time is within the scheduled window. Are you sure everything is correct?
        </Typography>

        <Stack spacing={2} sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px', color: '#16201C' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #E3DFD4' }}>
            <Typography variant="inherit" sx={{ color: '#6B6A62' }}>Question Count:</Typography>
            <Typography variant="inherit" sx={{ fontWeight: 600 }}>{exam.questions?.length || exam.questionCount || 0}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #E3DFD4' }}>
            <Typography variant="inherit" sx={{ color: '#6B6A62' }}>Duration:</Typography>
            <Typography variant="inherit" sx={{ fontWeight: 600 }}>{exam.duration} minutes</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #E3DFD4' }}>
            <Typography variant="inherit" sx={{ color: '#6B6A62' }}>Assigned Batches:</Typography>
            <Typography variant="inherit" sx={{ fontWeight: 600 }}>{exam.batches?.length || 0}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #E3DFD4' }}>
            <Typography variant="inherit" sx={{ color: '#6B6A62' }}>Exam Window:</Typography>
            <Typography variant="inherit" sx={{ fontWeight: 600 }}>
              {exam.startDate ? new Date(exam.startDate).toLocaleDateString() : 'Immediate'} - {exam.endDate ? new Date(exam.endDate).toLocaleDateString() : 'No end'}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#6B6A62', fontFamily: '"Inter", sans-serif', textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(exam)}
          variant="contained"
          sx={{
            bgcolor: '#0F7A5C',
            color: '#fff',
            fontFamily: '"Inter", sans-serif',
            textTransform: 'none',
            boxShadow: 'none',
            borderRadius: '2px',
            '&:hover': { bgcolor: '#085041', boxShadow: 'none' },
          }}
        >
          Publish Exam
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PublishConfirmDialog;
