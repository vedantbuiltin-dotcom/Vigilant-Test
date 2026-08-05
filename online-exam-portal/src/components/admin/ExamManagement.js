import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Select,
  FormControl,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

import { examApi } from '../../api/examApi';
import ExamFormDrawer from './ExamFormDrawer';
import PublishConfirmDialog from './PublishConfirmDialog';

const StatusChip = ({ status }) => {
  let bgcolor, color;
  switch (status) {
    case 'PUBLISHED':
      bgcolor = '#E1F5EE';
      color = '#085041';
      break;
    case 'CLOSED':
      bgcolor = '#E3DFD4';
      color = '#16201C';
      break;
    default:
      bgcolor = '#F6F4EF';
      color = '#6B6A62';
      status = 'DRAFT';
  }

  return (
    <Box
      sx={{
        bgcolor,
        color,
        px: 1.5,
        py: 0.5,
        borderRadius: '2px',
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        display: 'inline-block',
      }}
    >
      {status}
    </Box>
  );
};

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer & Dialog State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [examToPublish, setExamToPublish] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await examApi.list();
      setExams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleOpenDrawer = (exam = null) => {
    setSelectedExam(exam);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setSelectedExam(null);
    setDrawerOpen(false);
  };

  const handleSaveExam = async (examData) => {
    try {
      if (examData.id) {
        await examApi.update(examData.id, examData);
      } else {
        await examApi.create({ ...examData, status: 'DRAFT' });
      }
      fetchExams();
      handleCloseDrawer();
    } catch (err) {
      console.error('Error saving exam', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await examApi.remove(id);
      fetchExams();
    } catch (err) {
      console.error('Error deleting exam', err);
    }
  };

  const handleOpenPublish = (exam) => {
    setExamToPublish(exam);
    setPublishDialogOpen(true);
  };

  const handleConfirmPublish = async (exam) => {
    try {
      // Assuming a mock or future update logic
      await examApi.update(exam.id, { ...exam, status: 'PUBLISHED' });
      fetchExams();
    } catch (err) {
      console.error('Error publishing exam', err);
    } finally {
      setPublishDialogOpen(false);
      setExamToPublish(null);
    }
  };

  const columns = [
    { 
      field: 'title', 
      headerName: 'TITLE', 
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, color: '#16201C', fontSize: '14px' }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'subject', 
      headerName: 'SUBJECT', 
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ color: '#6B6A62', fontSize: '14px' }}>
          {params.value || 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'status', 
      headerName: 'STATUS', 
      width: 120,
      renderCell: (params) => <StatusChip status={params.row.status} />
    },
    { 
      field: 'startDate', 
      headerName: 'START', 
      width: 120,
      renderCell: (params) => (
        <Typography sx={{ color: '#6B6A62', fontSize: '14px' }}>
          {params.value ? new Date(params.value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Immediate'}
        </Typography>
      )
    },
    { 
      field: 'duration', 
      headerName: 'DURATION', 
      width: 120,
      renderCell: (params) => (
        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px', color: '#6B6A62' }}>
          {params.value} min
        </Typography>
      )
    },
    { 
      field: 'batches', 
      headerName: 'BATCHES', 
      width: 100,
      renderCell: (params) => (
        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px', color: '#16201C' }}>
          {params.row.batches?.length || 0}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: '',
      width: 140,
      sortable: false,
      renderCell: (params) => {
        const isDraft = !params.row.status || params.row.status === 'DRAFT';
        return (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton onClick={() => handleOpenDrawer(params.row)} size="small" sx={{ color: '#6B6A62' }}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {isDraft && (
              <Tooltip title="Publish">
                <IconButton onClick={() => handleOpenPublish(params.row)} size="small" sx={{ color: '#0F7A5C' }}>
                  <CloudUploadOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {isDraft && (
              <Tooltip title="Delete">
                <IconButton onClick={() => handleDelete(params.row.id)} size="small" sx={{ color: '#C97A1A' }}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      }
    }
  ];

  const filteredExams = exams.filter(exam => {
    const examStatus = exam.status || 'DRAFT';
    const statusMatch = statusFilter === 'all' || examStatus.toLowerCase() === statusFilter.toLowerCase();
    const subjectMatch = subjectFilter === 'all' || (exam.subject || '').toLowerCase().includes(subjectFilter.toLowerCase());
    return statusMatch && subjectMatch;
  });

  return (
    <Box sx={{ maxWidth: '1200px' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, color: '#16201C', fontSize: '20px' }}>
          Exams
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDrawer()}
          sx={{
            fontFamily: '"Inter", sans-serif',
            textTransform: 'none',
            boxShadow: 'none',
            borderRadius: '2px',
          }}
        >
          + New exam
        </Button>
      </Stack>

      <Box sx={{ bgcolor: '#FBFAF6', border: '1px solid #E3DFD4', borderRadius: '2px', mb: 4 }}>
        <Stack direction="row" spacing={2} sx={{ p: 2, borderBottom: '1px solid #E3DFD4' }}>
          <TextField
            id="status-filter-field"
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </TextField>
          
          <TextField
            id="subject-filter-field"
            select
            size="small"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="all">All subjects</MenuItem>
            <MenuItem value="web dev">Web dev</MenuItem>
            <MenuItem value="databases">Databases</MenuItem>
          </TextField>

          <TextField
            size="small"
            type="date"
            placeholder="Start date"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px', bgcolor: '#fff' } }}
          />
          <Typography sx={{ color: '#6B6A62', alignSelf: 'center' }}>-</Typography>
          <TextField
            size="small"
            type="date"
            placeholder="End date"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px', bgcolor: '#fff' } }}
          />
        </Stack>

        <Box sx={{ height: 500, width: '100%', '& .MuiDataGrid-root': { border: 'none', borderRadius: 0 } }}>
          <DataGrid
            rows={filteredExams}
            columns={columns}
            loading={loading}
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
      </Box>

      <ExamFormDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveExam}
        exam={selectedExam}
        isLive={selectedExam?.status === 'PUBLISHED' || selectedExam?.status === 'CLOSED'}
      />

      <PublishConfirmDialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        onConfirm={handleConfirmPublish}
        exam={examToPublish}
      />
    </Box>
  );
};

export default ExamManagement;
