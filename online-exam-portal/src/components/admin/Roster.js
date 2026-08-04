import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Stack, TextField, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Chip, InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

import { rosterApi } from '../../api/rosterApi';
import BatchesSidebar from './BatchesSidebar';
import StudentFormDrawer from './StudentFormDrawer';
import BatchReassignPopover from './BatchReassignPopover';
import BulkImportDropzone from '../common/BulkImportDropzone';

const Roster = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState(''); // null/empty means all

  // UI state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  
  // Reassign popover
  const [reassignAnchorEl, setReassignAnchorEl] = useState(null);
  const [studentToReassign, setStudentToReassign] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sData, bData] = await Promise.all([
        rosterApi.listStudents(),
        rosterApi.listBatches()
      ]);
      setStudents(sData);
      setBatches(bData);
    } catch (err) {
      console.error('Error fetching roster data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -- Handlers --
  const handleOpenDrawer = (student = null) => {
    setSelectedStudent(student);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setSelectedStudent(null);
    setDrawerOpen(false);
  };

  const handleSaveStudent = async (data) => {
    try {
      if (data.id) {
        await rosterApi.updateStudent(data.id, data);
      } else {
        await rosterApi.createStudent(data);
      }
      fetchData();
      handleCloseDrawer();
    } catch (err) {
      console.error(err);
      alert('Failed to save student');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await rosterApi.removeStudent(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenReassign = (event, student) => {
    setStudentToReassign(student);
    setReassignAnchorEl(event.currentTarget);
  };

  const handleCloseReassign = () => {
    setStudentToReassign(null);
    setReassignAnchorEl(null);
  };

  const handleApplyReassign = async (newBatchId) => {
    if (!studentToReassign) return;
    try {
      await rosterApi.reassignBatch(studentToReassign.id, newBatchId);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to reassign batch');
    }
  };

  const handleBulkImport = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const result = await rosterApi.bulkImportStudents(formData);
    fetchData(); // Refresh list after import
    return result;
  };

  const handleBatchChipClick = (batchName) => {
    // Toggle filter: if already filtering by this batch, clear it.
    if (batchFilter === batchName) {
      setBatchFilter('');
    } else {
      setBatchFilter(batchName);
    }
  };

  // -- Columns --
  const columns = [
    {
      field: 'fullName',
      headerName: 'NAME',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, color: '#16201C', fontSize: '14px' }}>
          {params.value || params.row.name}
        </Typography>
      )
    },
    {
      field: 'email',
      headerName: 'EMAIL',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Typography sx={{ color: '#6B6A62', fontSize: '14px' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'batch',
      headerName: 'BATCH',
      width: 140,
      renderCell: (params) => {
        const batchName = params.value?.name || params.row.batchName || 'Unassigned';
        const isSelected = batchFilter === batchName;
        return (
          <Chip
            label={batchName}
            onClick={() => handleBatchChipClick(batchName)}
            size="small"
            sx={{
              bgcolor: isSelected ? '#E3DFD4' : '#F6F4EF',
              color: '#16201C',
              fontSize: '12px',
              fontFamily: '"Inter", sans-serif',
              borderRadius: '2px',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#E3DFD4' }
            }}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: '',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpenDrawer(params.row)} size="small" sx={{ color: '#6B6A62' }}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reassign batch">
            <IconButton onClick={(e) => handleOpenReassign(e, params.row)} size="small" sx={{ color: '#6B6A62' }}>
              <SyncAltOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeleteStudent(params.row.id)} size="small" sx={{ color: '#C97A1A' }}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  // -- Filtering --
  const filteredStudents = students.filter(s => {
    const sName = s.fullName || s.name || '';
    const nameMatch = !search || sName.toLowerCase().includes(search.toLowerCase()) || (s.email && s.email.toLowerCase().includes(search.toLowerCase()));
    
    const sBatchName = s.batch?.name || s.batchName || 'Unassigned';
    const bMatch = !batchFilter || sBatchName === batchFilter;
    
    return nameMatch && bMatch;
  });

  return (
    <Box sx={{ maxWidth: '1400px' }}>
      <Grid container spacing={3}>
        {/* Left Column: Students Table */}
        <Grid item xs={12} md={9}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Typography variant="h4" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, color: '#16201C', fontSize: '20px' }}>
                Students
              </Typography>
              <TextField
                size="small"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 250, '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '2px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon sx={{ color: '#6B6A62', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
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
                onClick={() => handleOpenDrawer()}
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
                + Add student
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ bgcolor: '#FBFAF6', border: '1px solid #E3DFD4', borderRadius: '2px' }}>
            <Box sx={{ height: 600, width: '100%', '& .MuiDataGrid-root': { border: 'none', borderRadius: 0 } }}>
              <DataGrid
                rows={filteredStudents}
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
        </Grid>

        {/* Right Column: Batches Sidebar */}
        <Grid item xs={12} md={3}>
          <BatchesSidebar batches={batches} onRefresh={fetchData} />
        </Grid>
      </Grid>

      {/* Drawers & Popovers */}
      <StudentFormDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveStudent}
        student={selectedStudent}
        batches={batches}
      />

      <BatchReassignPopover
        anchorEl={reassignAnchorEl}
        onClose={handleCloseReassign}
        onApply={handleApplyReassign}
        currentBatchId={studentToReassign?.batchId || studentToReassign?.batch?.id || ''}
        batches={batches}
      />

      {/* Bulk Import Modal */}
      <Dialog 
        open={bulkImportOpen} 
        onClose={() => setBulkImportOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#FBFAF6', borderRadius: '4px' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, fontSize: '18px' }}>
          Bulk import students
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '13px', color: '#6B6A62', mb: 2 }}>
            Note: Batches specified in the CSV will be auto-created if they don't already exist.
          </Typography>
          <BulkImportDropzone onUpload={handleBulkImport} templateHref="/templates/students_template.csv" templateName="students_template.csv" />
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

export default Roster;
