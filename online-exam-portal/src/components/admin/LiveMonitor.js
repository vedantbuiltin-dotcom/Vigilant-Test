import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, TextField, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import MoreTimeOutlinedIcon from '@mui/icons-material/MoreTimeOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { keyframes } from '@emotion/react';
import { io } from 'socket.io-client';

import { monitorApi } from '../../api/monitorApi';
import LiveCountdown from './LiveCountdown';
import FlagTimeline from './FlagTimeline';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';

const pulseAnimation = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(201, 122, 26, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(201, 122, 26, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(201, 122, 26, 0); }
`;

const FlagPill = ({ count }) => {
  if (!count || count === 0) {
    return <Typography sx={{ fontSize: '14px', color: '#6B6A62' }}>0</Typography>;
  }
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: '#FDECC8', px: 1.5, py: 0.5, borderRadius: '12px' }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#C97A1A', mr: 1, animation: `${pulseAnimation} 2s infinite` }} />
      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#854F0B' }}>{count}</Typography>
    </Box>
  );
};

const ConnectionDot = ({ status }) => {
  let color = '#C8C6BC'; // disconnected
  if (status === 'connected') color = '#0F7A5C';
  if (status === 'reconnecting') color = '#C97A1A';

  return (
    <Tooltip title={`Socket status: ${status}`}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, ml: 2, display: 'inline-block' }} />
    </Tooltip>
  );
};

const Row = ({ row, onAction }) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: open ? '#FBFAF6' : 'inherit', cursor: 'pointer', '&:hover': { bgcolor: '#FBFAF6' } }} onClick={() => setOpen(!open)}>
        <TableCell sx={{ width: 50, borderBottom: '1px solid #E3DFD4' }}>
          <IconButton aria-label="expand row" size="small" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, color: '#16201C', borderBottom: '1px solid #E3DFD4' }}>
          {row.studentName}
        </TableCell>
        <TableCell sx={{ color: '#6B6A62', fontSize: '14px', borderBottom: '1px solid #E3DFD4' }}>
          {row.startedAt ? new Date(row.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid #E3DFD4' }}>
          {row.status === 'active' && row.endTime ? (
            <LiveCountdown endTime={row.endTime} />
          ) : (
            <Typography sx={{ color: '#6B6A62', fontSize: '13px', textTransform: 'uppercase' }}>{row.status}</Typography>
          )}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid #E3DFD4' }}>
          <FlagPill count={row.flags?.length || 0} />
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid #E3DFD4' }}>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Extend Time">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onAction('extend', row); }} disabled={row.status !== 'active'}>
                <MoreTimeOutlinedIcon fontSize="small" sx={{ color: row.status === 'active' ? '#6B6A62' : '#C8C6BC' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Force Submit">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onAction('submit', row); }} disabled={row.status !== 'active'}>
                <StopCircleOutlinedIcon fontSize="small" sx={{ color: row.status === 'active' ? '#C97A1A' : '#C8C6BC' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0, border: 'none' }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <FlagTimeline flags={row.flags || []} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const LiveMonitor = () => {
  const { examId: routeExamId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(routeExamId || '');
  const [attempts, setAttempts] = useState([]);
  
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastConfirm, setBroadcastConfirm] = useState('');
  
  // Action Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'extend' | 'submit'
  const [actionTarget, setActionTarget] = useState(null);
  const [extendMins, setExtendMins] = useState(10);

  const socketRef = useRef(null);
  const pollTimerRef = useRef(null);

  useEffect(() => {
    // Fetch exams for dropdown if not scoped
    const fetchExams = async () => {
      try {
        const data = await monitorApi.getExams();
        setExams(data);
        if (!selectedExamId && data.length > 0) {
          // If no exam selected, maybe don't auto-select to prevent jumping, but prompt says "if this page isn't already scoped"
        }
      } catch (err) {
        console.error('Failed to fetch exams', err);
      }
    };
    fetchExams();
  }, [selectedExamId]);

  const loadAttempts = async (id) => {
    try {
      const data = await monitorApi.getLiveAttempts(id);
      setAttempts(data);
    } catch (err) {
      console.error('Failed to load attempts', err);
    }
  };

  useEffect(() => {
    if (!selectedExamId) return;

    // 1. Initial Load
    loadAttempts(selectedExamId);

    // 2. Setup Socket
    const baseUrl = config.apiBaseUrl.replace(/\/api$/, '');
    const socket = io(baseUrl, {
      path: '/socket.io',
      query: { examId: selectedExamId },
      auth: { token }
    });
    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      console.error('[SOCKET ADMIN] Connection error:', err.message);
    });

    socket.on('connect', () => {
      console.log(`[SOCKET ADMIN] Connected, querying exam ${selectedExamId}`);
      setSocketStatus('connected');
    });
    socket.on('disconnect', () => setSocketStatus('disconnected'));
    socket.on('reconnecting', () => setSocketStatus('reconnecting'));

    socket.on('attempt_update', (data) => {
      // Update attempts in place
      setAttempts(prev => {
        const idx = prev.findIndex(a => a.id === data.id);
        if (idx === -1) return [data, ...prev];
        const newArr = [...prev];
        newArr[idx] = { ...newArr[idx], ...data };
        return newArr;
      });
    });

    socket.on('flag_event', (data) => {
      setAttempts(prev => {
        return prev.map(a => {
          if (a.id === data.attemptId) {
            return { ...a, flags: [...(a.flags || []), data.flag] };
          }
          return a;
        });
      });
    });

    // 3. Polling Fallback if disconnected
    pollTimerRef.current = setInterval(() => {
      if (socketRef.current?.disconnected) {
        loadAttempts(selectedExamId);
      }
    }, 10000);

    return () => {
      socket.disconnect();
      clearInterval(pollTimerRef.current);
    };
  }, [selectedExamId, token]);

  const handleExamChange = (e) => {
    const newId = e.target.value;
    setSelectedExamId(newId);
    navigate(`/admin/monitor/${newId}`);
  };

  const handleSendBroadcast = async () => {
    if (!broadcastText.trim() || !selectedExamId) return;
    try {
      // Could be via socket or REST. Using REST api.
      const res = await monitorApi.broadcast(selectedExamId, broadcastText);
      setBroadcastText('');
      setBroadcastConfirm(`Sent to ${res.sentCount || attempts.filter(a => a.status === 'active').length} students.`);
      setTimeout(() => setBroadcastConfirm(''), 3000);
    } catch (err) {
      alert('Failed to send broadcast');
    }
  };

  const openActionDialog = (type, attempt) => {
    setActionType(type);
    setActionTarget(attempt);
    setExtendMins(10);
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!actionTarget) return;
    try {
      if (actionType === 'submit') {
        await monitorApi.forceSubmit(actionTarget.id);
      } else if (actionType === 'extend') {
        await monitorApi.extendTime(actionTarget.id, extendMins);
      }
      setDialogOpen(false);
      // Wait for socket to update it or manually refetch
      loadAttempts(selectedExamId);
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h4" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, color: '#16201C', fontSize: '20px' }}>
            Live monitor
          </Typography>
          <ConnectionDot status={socketStatus} />
        </Stack>
        
        {!routeExamId && (
          <TextField
            select
            size="small"
            value={selectedExamId}
            onChange={handleExamChange}
            sx={{ width: 250, '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '2px' } }}
            displayEmpty
          >
            <MenuItem value="" disabled>Select an exam to monitor...</MenuItem>
            {exams.map(e => (
              <MenuItem key={e.id} value={e.id}>{e.title}</MenuItem>
            ))}
          </TextField>
        )}
      </Stack>

      <Box sx={{ bgcolor: '#FBFAF6', border: '1px solid #E3DFD4', borderRadius: '4px', p: 2, mb: 4, display: 'flex', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Broadcast a message to all active students..."
          value={broadcastText}
          onChange={(e) => setBroadcastText(e.target.value)}
          sx={{ flex: 1, mr: 2, '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '2px' } }}
          disabled={!selectedExamId}
          onKeyDown={(e) => e.key === 'Enter' && handleSendBroadcast()}
        />
        <Button
          variant="contained"
          onClick={handleSendBroadcast}
          disabled={!broadcastText.trim() || !selectedExamId}
          endIcon={<SendOutlinedIcon />}
          sx={{
            bgcolor: '#16201C',
            color: '#fff',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#000', boxShadow: 'none' }
          }}
        >
          Send
        </Button>
        {broadcastConfirm && (
          <Typography sx={{ ml: 2, fontSize: '13px', color: '#0F7A5C', fontWeight: 500, animation: 'fadeIn 0.3s ease-in' }}>
            {broadcastConfirm}
          </Typography>
        )}
      </Box>

      {selectedExamId ? (
        <TableContainer sx={{ border: '1px solid #E3DFD4', borderRadius: '2px', bgcolor: '#fff' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F6F4EF' }}>
              <TableRow>
                <TableCell sx={{ width: 50, borderBottom: '1px solid #E3DFD4' }} />
                <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', borderBottom: '1px solid #E3DFD4' }}>STUDENT</TableCell>
                <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', borderBottom: '1px solid #E3DFD4' }}>STARTED</TableCell>
                <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', borderBottom: '1px solid #E3DFD4' }}>TIME LEFT</TableCell>
                <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', borderBottom: '1px solid #E3DFD4' }}>FLAGS</TableCell>
                <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', borderBottom: '1px solid #E3DFD4' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attempts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#6B6A62' }}>
                    No live attempts found.
                  </TableCell>
                </TableRow>
              ) : (
                attempts.map(attempt => (
                  <Row key={attempt.id} row={attempt} onAction={openActionDialog} />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 10, border: '1px dashed #E3DFD4', borderRadius: '4px' }}>
          <Typography sx={{ color: '#6B6A62' }}>Select an exam from the dropdown above to start monitoring.</Typography>
        </Box>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} PaperProps={{ sx: { bgcolor: '#FBFAF6', borderRadius: '4px', width: '400px' } }}>
        <DialogTitle sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, fontSize: '18px' }}>
          {actionType === 'submit' ? 'Force Submit' : 'Extend Time'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '14px', color: '#16201C', mb: 2 }}>
            {actionType === 'submit' 
              ? `Are you sure you want to force-submit the exam for ${actionTarget?.studentName}? They will not be able to continue.`
              : `Add extra time for ${actionTarget?.studentName}.`
            }
          </Typography>
          {actionType === 'extend' && (
            <TextField
              label="Minutes to add"
              type="number"
              size="small"
              fullWidth
              value={extendMins}
              onChange={(e) => setExtendMins(Number(e.target.value))}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
              inputProps={{ min: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#6B6A62', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmAction}
            sx={{
              bgcolor: actionType === 'submit' ? '#C97A1A' : '#0F7A5C',
              color: '#fff',
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': { bgcolor: actionType === 'submit' ? '#A86515' : '#085041', boxShadow: 'none' }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LiveMonitor;
