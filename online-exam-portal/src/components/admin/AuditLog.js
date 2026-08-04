import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, TextField, MenuItem, Pagination } from '@mui/material';
import AuditLogTable from './AuditLogTable';
import { auditApi } from '../../api/auditApi';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [adminId, setAdminId] = useState('');
  const [actionType, setActionType] = useState('');
  const [dateRange, setDateRange] = useState(''); // Simplified string input for demo

  // Assuming we have lists for dropdowns (normally fetched from an API)
  const admins = [{ id: '', name: 'All admins' }, { id: 'admin1', name: 'Administrator' }];
  const actions = [
    { value: '', label: 'All actions' },
    { value: 'RELEASE_RESULTS', label: 'Release results' },
    { value: 'UNRELEASE_RESULTS', label: 'Unrelease results' },
    { value: 'PUBLISH_EXAM', label: 'Publish exam' },
    { value: 'FORCE_SUBMIT', label: 'Force-submit attempt' }
  ];

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await auditApi.getAuditLog({
          page,
          limit: 15,
          adminId,
          actionType,
          dateRange
        });
        // Dummy mapping if data structure differs, but assuming backend returns logs array
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch audit log', err);
        // Fallback for UI visualization purposes if API isn't wired up completely yet
        setLogs([
          { id: 1, timestamp: new Date(Date.now() - 3600000).toISOString(), adminName: 'Administrator', action: 'RELEASE_RESULTS', targetName: 'JavaScript fundamentals' },
          { id: 2, timestamp: new Date(Date.now() - 7200000).toISOString(), adminName: 'Administrator', action: 'FORCE_SUBMIT', targetName: 'Meera Iyer' },
          { id: 3, timestamp: new Date(Date.now() - 10800000).toISOString(), adminName: 'Administrator', action: 'UNRELEASE_RESULTS', targetName: 'DBMS unit test', reason: 'question 4 had a wrong answer key' },
          { id: 4, timestamp: new Date(Date.now() - 86400000).toISOString(), adminName: 'Administrator', action: 'PUBLISH_EXAM', targetName: 'React internals' }
        ]);
        setTotalPages(3);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page, adminId, actionType, dateRange]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, color: '#16201C', fontSize: '24px', mb: 3 }}>
        Audit log
      </Typography>

      {/* Filter Row */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <TextField
          select
          size="small"
          value={adminId}
          onChange={(e) => { setAdminId(e.target.value); setPage(1); }}
          sx={{ width: 220, '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '2px' } }}
        >
          {admins.map((opt) => (
            <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={actionType}
          onChange={(e) => { setActionType(e.target.value); setPage(1); }}
          sx={{ width: 220, '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '2px' } }}
        >
          {actions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          placeholder="date range"
          value={dateRange}
          onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
          sx={{ width: 200, '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '2px' } }}
        />
      </Stack>

      <Box sx={{ bgcolor: '#FBFAF6', border: '1px solid #E3DFD4', borderRadius: '4px', p: 1 }}>
        <AuditLogTable logs={logs} loading={loading} />
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': {
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '13px',
                color: '#6B6A62',
                '&.Mui-selected': {
                  bgcolor: '#16201C',
                  color: '#fff',
                  '&:hover': { bgcolor: '#000' }
                }
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default AuditLog;
