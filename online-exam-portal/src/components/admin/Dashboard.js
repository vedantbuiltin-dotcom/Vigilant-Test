import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

// Simple viewfinder corner bracket
const CornerBracket = ({ top, bottom, left, right }) => (
  <Box
    sx={{
      position: 'absolute',
      width: 14,
      height: 14,
      top: top ? -1 : 'auto',
      bottom: bottom ? -1 : 'auto',
      left: left ? -1 : 'auto',
      right: right ? -1 : 'auto',
      borderTop: top ? '2px solid #C97A1A' : 'none',
      borderBottom: bottom ? '2px solid #C97A1A' : 'none',
      borderLeft: left ? '2px solid #C97A1A' : 'none',
      borderRight: right ? '2px solid #C97A1A' : 'none',
      pointerEvents: 'none',
    }}
  />
);

const MetricCard = ({ title, value, highlight }) => (
  <Card
    elevation={0}
    sx={{
      flex: 1,
      bgcolor: '#FBFAF6',
      border: highlight ? '2px solid #C97A1A' : '1px solid #E3DFD4',
      borderRadius: '2px',
      color: highlight ? '#C97A1A' : '#16201C',
    }}
  >
    <CardContent sx={{ p: '16px !important' }}>
      <Typography variant="caption" sx={{ display: 'block', mb: 1, color: highlight ? '#C97A1A' : '#6B6A62', fontWeight: 500, lineHeight: 1.2 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500, letterSpacing: '-0.02em' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const AdminLiveExamCard = ({ exam, onClick }) => (
  <Box sx={{ position: 'relative', cursor: 'pointer', mb: 2 }} onClick={onClick}>
    <CornerBracket top left />
    <CornerBracket top right />
    <CornerBracket bottom left />
    <CornerBracket bottom right />
    <Card
      elevation={0}
      sx={{
        bgcolor: '#FBFAF6',
        borderRadius: '2px',
        border: '1px solid #E3DFD4',
        '&:hover': {
          borderColor: '#DDD8C9',
          bgcolor: '#F6F4EF'
        }
      }}
    >
      <CardContent sx={{ p: '16px !important', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, color: '#16201C', mb: 1 }}>
            {exam.title}
          </Typography>
          <Stack direction="row" spacing={3} sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px', color: '#6B6A62' }}>
            <Box>{exam.activeStudentCount || 0} active</Box>
            <Box>{exam.questionCount || 0} questions</Box>
            <Box>ends in {exam.endsAt || 'N/A'}</Box>
          </Stack>
        </Box>
        <Box
          sx={{
            bgcolor: '#E1F5EE',
            color: '#085041',
            px: 1.5,
            py: 0.5,
            borderRadius: '16px',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}
        >
          {exam.status || 'PUBLISHED'}
        </Box>
      </CardContent>
    </Card>
  </Box>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    examsLiveCount: 0,
    studentsTestingCount: 0,
    flagsLastHourCount: 0,
    pendingGradingCount: 0,
    liveExams: []
  });

  const fetchSummary = async () => {
    try {
      const res = await api.get('/admin/dashboard-summary');
      if (res.data?.success) setData(res.data.summary);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ maxWidth: '900px' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, color: '#16201C', fontSize: '22px' }}>
          Welcome back, {user?.name || 'Administrator'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B6A62', fontSize: '12px', mt: 0.5 }}>
          Exam operations overview across all published exams
        </Typography>
      </Box>

      <Stack direction="row" sx={{ gap: '12px', mb: 6 }}>
        <MetricCard title="Exams live now" value={data.examsLiveCount} />
        <MetricCard title="Students testing" value={data.studentsTestingCount} />
        <MetricCard title="Flags last hour" value={data.flagsLastHourCount} highlight />
        <MetricCard title="Awaiting grading" value={data.pendingGradingCount} />
      </Stack>

      <Box>
        {data.liveExams?.length > 0 ? (
          data.liveExams.map(exam => (
            <AdminLiveExamCard key={exam.id} exam={exam} onClick={() => navigate(`/admin/exams/${exam.id}`)} />
          ))
        ) : (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography sx={{ color: '#16201C', fontWeight: 500 }}>No exams running right now</Typography>
            <Typography variant="body2" sx={{ color: '#6B6A62' }}>Check back later</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
