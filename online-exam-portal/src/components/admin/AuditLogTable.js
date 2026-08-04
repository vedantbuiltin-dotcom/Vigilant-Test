import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';

const ACTION_LABELS = {
  RELEASE_RESULTS: 'Released results',
  UNRELEASE_RESULTS: 'Unreleased results',
  PUBLISH_EXAM: 'Published exam',
  FORCE_SUBMIT: 'Force-submitted attempt',
  EXTEND_TIME: 'Extended time',
  ADD_STUDENT: 'Added student',
  BULK_IMPORT: 'Bulk imported students',
  CREATE_EXAM: 'Created exam',
  UPDATE_EXAM: 'Updated exam',
  DELETE_EXAM: 'Deleted exam',
};

const getActionLabel = (action) => {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  if (!action) return 'Unknown action';
  return action.split('_').map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join(' ');
};

const AuditLogTable = ({ logs = [], loading = false }) => {
  return (
    <TableContainer sx={{ bgcolor: 'transparent' }}>
      <Table size="small">
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#6B6A62', borderBottom: 'none' }}>
                Loading audit log...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#6B6A62', borderBottom: 'none' }}>
                No audit logs found.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => {
              const date = new Date(log.timestamp);
              // "Jul 31, 2:52 PM" format
              const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

              return (
                <TableRow key={log.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ width: '20%', borderBottom: '1px solid #E3DFD4', py: 2 }}>
                    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px', color: '#6B6A62' }}>
                      {`${dateStr}, ${timeStr}`}
                    </Typography>
                  </TableCell>
                  
                  <TableCell sx={{ width: '20%', borderBottom: '1px solid #E3DFD4', py: 2 }}>
                    <Typography sx={{ fontSize: '14px', color: '#16201C' }}>
                      {log.adminName}
                    </Typography>
                  </TableCell>
                  
                  <TableCell sx={{ width: '40%', borderBottom: '1px solid #E3DFD4', py: 2 }}>
                    <Typography sx={{ fontSize: '14px', color: '#16201C', fontWeight: 500 }}>
                      {getActionLabel(log.action)}
                    </Typography>
                    {log.reason && (
                      <Typography sx={{ fontSize: '13px', color: '#6B6A62', mt: 0.5 }}>
                        Reason: {log.reason}
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell sx={{ width: '20%', borderBottom: '1px solid #E3DFD4', py: 2 }}>
                    {log.targetUrl ? (
                      <MuiLink component={Link} to={log.targetUrl} sx={{ fontSize: '14px', color: '#6B6A62', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: '#16201C' } }}>
                        {log.targetName}
                      </MuiLink>
                    ) : (
                      <Typography sx={{ fontSize: '14px', color: '#6B6A62' }}>
                        {log.targetName || '-'}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AuditLogTable;
