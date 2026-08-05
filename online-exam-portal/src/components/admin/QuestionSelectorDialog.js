import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { questionApi } from '../../api/questionApi';

const QuestionSelectorDialog = ({ open, onClose, onConfirm, initialSelection = [] }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState(initialSelection);

  useEffect(() => {
    if (open) {
      setRowSelectionModel(initialSelection);
      fetchQuestions();
    }
  }, [open, initialSelection]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await questionApi.listAdmin();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: 'question',
      headerName: 'QUESTION',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography noWrap sx={{ fontFamily: '"Inter", sans-serif', color: '#16201C', fontSize: '14px' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'topic',
      headerName: 'TOPIC',
      width: 130,
      renderCell: (params) => (
        <Typography sx={{ color: '#6B6A62', fontSize: '13px' }}>
          {params.value || params.row.tags?.[0] || 'Uncategorized'}
        </Typography>
      )
    },
    {
      field: 'difficulty',
      headerName: 'DIFFICULTY',
      width: 100,
      renderCell: (params) => (
        <Typography sx={{ color: '#6B6A62', fontSize: '13px', textTransform: 'capitalize' }}>
          {params.value}
        </Typography>
      )
    }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#FBFAF6', borderRadius: '4px' } }}>
      <DialogTitle sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, fontSize: '18px' }}>
        Select Questions
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ height: 500, width: '100%', '& .MuiDataGrid-root': { border: 'none', borderRadius: 0 } }}>
          <DataGrid
            rows={questions}
            columns={columns}
            loading={loading}
            checkboxSelection
            onRowSelectionModelChange={(newRowSelectionModel) => {
              setRowSelectionModel(newRowSelectionModel);
            }}
            rowSelectionModel={rowSelectionModel}
            disableRowSelectionOnClick
            hideFooter
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: '#F6F4EF',
                borderBottom: '1px solid #E3DFD4',
                color: '#6B6A62',
                fontFamily: '"Inter", sans-serif',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #E3DFD4',
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#FBFAF6' }}>
        <Button onClick={onClose} sx={{ color: '#6B6A62', textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(rowSelectionModel)}
          variant="contained"
          sx={{
            bgcolor: '#0F7A5C',
            color: '#fff',
            textTransform: 'none',
            boxShadow: 'none',
            borderRadius: '2px',
            '&:hover': { bgcolor: '#085041', boxShadow: 'none' },
          }}
        >
          Confirm Selection ({rowSelectionModel.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionSelectorDialog;
