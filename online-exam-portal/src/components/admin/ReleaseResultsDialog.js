import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const ReleaseResultsDialog = ({ open, onClose, onConfirm, pendingGrading, studentCount }) => {
  const navigate = useNavigate();

  const isBlocked = pendingGrading > 0;

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: '#FBFAF6', borderRadius: '4px', width: '450px' } }}>
      <DialogTitle sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, fontSize: '18px' }}>
        {isBlocked ? 'Release Blocked' : 'Release Results'}
      </DialogTitle>
      
      <DialogContent>
        {isBlocked ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#C97A1A', mb: 2 }}>
              <WarningAmberIcon sx={{ mr: 1 }} />
              <Typography sx={{ fontWeight: 500 }}>Manual grading incomplete</Typography>
            </Box>
            <Typography sx={{ fontSize: '14px', color: '#16201C', mb: 3 }}>
              There are currently <strong>{pendingGrading} responses</strong> awaiting manual grading. 
              Results cannot be released until all attempts are fully graded.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => {
                onClose();
                navigate('/admin/grading'); // Assuming grading queue route
              }}
              sx={{
                borderColor: '#C97A1A',
                color: '#C97A1A',
                textTransform: 'none',
                '&:hover': { borderColor: '#A86515', bgcolor: 'rgba(201, 122, 26, 0.05)' }
              }}
            >
              Go to Grading Queue
            </Button>
          </Box>
        ) : (
          <Typography sx={{ fontSize: '14px', color: '#16201C', mt: 1 }}>
            Are you sure you want to release the results? <strong>{studentCount} students</strong> will be able to view their final scores and feedback immediately.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ color: '#6B6A62', textTransform: 'none' }}>
          {isBlocked ? 'Close' : 'Cancel'}
        </Button>
        {!isBlocked && (
          <Button 
            variant="contained" 
            onClick={onConfirm}
            sx={{
              bgcolor: '#0F7A5C',
              color: '#fff',
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': { bgcolor: '#085041', boxShadow: 'none' }
            }}
          >
            Confirm & Release
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReleaseResultsDialog;
