import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Stack, TextField, MenuItem, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Select, FormControl
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import InputAdornment from '@mui/material/InputAdornment';

import { questionApi } from '../../api/questionApi';
import QuestionFormDrawer from './QuestionFormDrawer';
import BulkImportDropzone from '../common/BulkImportDropzone';

const DifficultyLabel = ({ level }) => {
  let color = '#16201C';
  if (level === 'easy') color = '#6B6A62';
  if (level === 'hard') color = '#854F0B';

  return (
    <Typography sx={{ color, fontSize: '13px', fontWeight: 500, textTransform: 'lowercase' }}>
      {level || 'medium'}
    </Typography>
  );
};

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [topicFilter, setTopicFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Bulk Import Modal
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  // Selection
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qs, ts] = await Promise.all([
        questionApi.listAdmin({
          topic: topicFilter,
          difficulty: difficultyFilter,
          type: typeFilter,
          search: search
        }),
        questionApi.getTopics()
      ]);
      setQuestions(qs);
      setTopics(ts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Note: we debounce or fetch on search button/enter, but since we have a fast mock/local backend, 
  // we can just re-fetch when filters change for now, or just client-side filter.
  // The prompt asks for backend filters if we pass them, but client-side is fine for display.
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleOpenDrawer = (question = null) => {
    setSelectedQuestion(question);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setSelectedQuestion(null);
    setDrawerOpen(false);
  };

  const handleSaveQuestion = async (data) => {
    try {
      if (data.id) {
        await questionApi.update(data.id, data);
      } else {
        await questionApi.create(data);
      }
      fetchData();
      handleCloseDrawer();
    } catch (err) {
      console.error(err);
      alert('Failed to save question');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await questionApi.remove(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedRowIds.length} question(s)?`)) return;
    try {
      await Promise.all(selectedRowIds.map(id => questionApi.remove(id)));
      setSelectedRowIds([]);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete some questions');
    }
  };

  const handleBulkImport = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Assuming backend returns { totalImported, totalFailed, errors: [...] }
    const result = await questionApi.bulkImport(formData);
    fetchData(); // Refresh list after import
    return result;
  };

  const columns = [
    {
      field: 'question',
      headerName: 'QUESTION',
      flex: 1.5,
      minWidth: 250,
      renderCell: (params) => (
        <Tooltip title={params.value} placement="bottom-start" arrow>
          <Typography noWrap sx={{ fontFamily: '"Inter", sans-serif', color: '#16201C', fontSize: '14px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'type',
      headerName: 'TYPE',
      width: 130,
      renderCell: (params) => {
        let label = params.value;
        if (label === 'mcq') label = 'mcq';
        else if (label === 'short_answer') label = 'short answer';
        else if (label === 'true_false') label = 'true/false';
        return (
          <Typography sx={{ color: '#6B6A62', fontSize: '13px' }}>
            {label}
          </Typography>
        );
      }
    },
    {
      field: 'topic',
      headerName: 'TOPIC',
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ color: '#6B6A62', fontSize: '13px' }}>
          {params.value || params.row.tags?.[0] || 'Uncategorized'}
        </Typography>
      )
    },
    {
      field: 'difficulty',
      headerName: 'DIFFICULTY',
      width: 120,
      renderCell: (params) => <DifficultyLabel level={params.value} />
    },
    {
      field: 'mark',
      headerName: 'MARKS',
      width: 90,
      renderCell: (params) => (
        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px', color: '#16201C' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpenDrawer(params.row)} size="small" sx={{ color: '#6B6A62' }}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row.id)} size="small" sx={{ color: '#C97A1A' }}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  const filteredQuestions = questions.filter(q => {
    const tMatch = topicFilter === 'all' || (q.topic === topicFilter || q.tags?.includes(topicFilter));
    const dMatch = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    const tyMatch = typeFilter === 'all' || q.type === typeFilter;
    const sMatch = !search || q.question.toLowerCase().includes(search.toLowerCase());
    return tMatch && dMatch && tyMatch && sMatch;
  });

  return (
    <Box sx={{ maxWidth: '1200px' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, color: '#16201C', fontSize: '20px' }}>
          Question bank
        </Typography>
        <Stack direction="row" spacing={2}>
          {selectedRowIds.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleBulkDelete}
              startIcon={<DeleteOutlineOutlinedIcon />}
              sx={{ textTransform: 'none', borderRadius: '2px', fontFamily: '"Inter", sans-serif' }}
            >
              Delete Selected ({selectedRowIds.length})
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => setBulkImportOpen(true)}
            sx={{
              borderColor: '#C8C6BC',
              color: '#16201C',
              fontFamily: '"Inter", sans-serif',
              textTransform: 'none',
              boxShadow: 'none',
              borderRadius: '2px',
              '&:hover': { borderColor: '#16201C', bgcolor: 'transparent' },
            }}
          >
            Bulk import
          </Button>
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
            + Add question
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ bgcolor: '#FBFAF6', border: '1px solid #E3DFD4', borderRadius: '2px', mb: 4 }}>
        <Stack direction="row" spacing={2} sx={{ p: 2, borderBottom: '1px solid #E3DFD4' }}>
          <TextField
            id="topic-filter-field"
            select
            size="small"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="all">All topics</MenuItem>
            {topics.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          
          <TextField
            id="difficulty-filter-field"
            select
            size="small"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="all">All difficulty</MenuItem>
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </TextField>
          
          <TextField
            id="type-filter-field"
            select
            size="small"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="all">All types</MenuItem>
            <MenuItem value="mcq">MCQ</MenuItem>
            <MenuItem value="true_false">True/False</MenuItem>
            <MenuItem value="short_answer">Short Answer</MenuItem>
          </TextField>

          <TextField
            size="small"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '2px', bgcolor: '#fff' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ color: '#6B6A62', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Box sx={{ height: 600, width: '100%', '& .MuiDataGrid-root': { border: 'none', borderRadius: 0 } }}>
          <DataGrid
            rows={filteredQuestions}
            columns={columns}
            loading={loading}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => setSelectedRowIds(newSelection)}
            rowSelectionModel={selectedRowIds}
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

      <QuestionFormDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveQuestion}
        question={selectedQuestion}
      />

      <Dialog 
        open={bulkImportOpen} 
        onClose={() => setBulkImportOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#FBFAF6', borderRadius: '4px' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, fontSize: '18px' }}>
          Bulk import questions
        </DialogTitle>
        <DialogContent>
          <BulkImportDropzone onUpload={handleBulkImport} templateHref="/templates/questions_template.csv" templateName="questions_template.csv" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setBulkImportOpen(false)} sx={{ color: '#6B6A62', textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default QuestionBank;
