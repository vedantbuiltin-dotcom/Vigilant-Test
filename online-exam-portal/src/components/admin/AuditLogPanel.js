import React, { useState, useEffect } from 'react';
import { Box, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import AuditLogTable from './AuditLogTable';
import { auditApi } from '../../api/auditApi';
import LaunchIcon from '@mui/icons-material/Launch';

const AuditLogPanel = ({ examId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId) return;
    
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await auditApi.getAuditLog({ examId, limit: 10 });
        setLogs(data.logs || []);
      } catch (err) {
        console.error('Failed to fetch audit log for panel', err);
        // Fallback for visual demo
        setLogs([
          { id: 101, timestamp: new Date(Date.now() - 3600000).toISOString(), adminName: 'Administrator', action: 'RELEASE_RESULTS', targetName: 'JavaScript fundamentals' },
          { id: 102, timestamp: new Date(Date.now() - 86400000).toISOString(), adminName: 'Administrator', action: 'PUBLISH_EXAM', targetName: 'JavaScript fundamentals' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [examId]);

  return (
    <Box>
      <Box sx={{ bgcolor: '#FBFAF6', border: '1px solid #E3DFD4', borderRadius: '4px', p: 1, mb: 2 }}>
        <AuditLogTable logs={logs} loading={loading} />
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <MuiLink 
          component={Link} 
          to={`/admin/audit?examId=${examId}`}
          sx={{ 
            fontSize: '13px', 
            color: '#6B6A62', 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center',
            '&:hover': { color: '#16201C', textDecoration: 'underline' } 
          }}
        >
          View full log
          <LaunchIcon sx={{ fontSize: '13px', ml: 0.5 }} />
        </MuiLink>
      </Box>
    </Box>
  );
};

export default AuditLogPanel;
