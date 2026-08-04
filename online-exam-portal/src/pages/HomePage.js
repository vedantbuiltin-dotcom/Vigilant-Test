import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Typography,
  Stack
} from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/common/AppHeader';
import LoadingScreen from '../components/common/LoadingScreen';
import { examApi } from '../api/examApi';
import { useAuth } from '../context/AuthContext';

// Corner Bracket Component
const CornerBracket = ({ top, bottom, left, right }) => (
  <Box
    sx={{
      position: 'absolute',
      width: 16,
      height: 16,
      top: top ? -1 : 'auto',
      bottom: bottom ? -1 : 'auto',
      left: left ? -1 : 'auto',
      right: right ? -1 : 'auto',
      borderTop: top ? '2px solid #C97A1A' : 'none',
      borderBottom: bottom ? '2px solid #C97A1A' : 'none',
      borderLeft: left ? '2px solid #C97A1A' : 'none',
      borderRight: right ? '2px solid #C97A1A' : 'none',
      pointerEvents: 'none',
      zIndex: 1
    }}
  />
);

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await examApi.list();
        if (!cancelled) setExams(list);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load exams');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStart = (examId) => navigate(`/exam/${examId}`);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F6F4EF' }}>
      <AppHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, color: '#16201C', mb: 1 }}>
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B6A62', fontFamily: '"Inter", sans-serif' }}>
            Pick an exam below to get started. Once you begin, the timer cannot be paused.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <LoadingScreen label="Loading available exams..." />
        ) : exams.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, color: '#16201C', mb: 1 }}>
              No exams scheduled
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B6A62', fontFamily: '"Inter", sans-serif' }}>
              Check back once your instructor publishes an exam
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 3
            }}
          >
            {exams.map((exam) => (
              <Box key={exam.id} sx={{ position: 'relative' }}>
                <CornerBracket top left />
                <CornerBracket top right />
                <CornerBracket bottom left />
                <CornerBracket bottom right />
                
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    bgcolor: '#FBFAF6',
                    borderRadius: '2px',
                    border: '1px solid #DDD8C9', // Baseline border for the card structure, bracket sits on top
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2, gap: 2 }}>
                      <Typography variant="h6" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, color: '#16201C', lineHeight: 1.2 }}>
                        {exam.title}
                      </Typography>
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
                        Pass {exam.passingScore}%
                      </Box>
                    </Stack>
                    
                    <Typography variant="body2" sx={{ color: '#6B6A62', mb: 4, fontFamily: '"Inter", sans-serif', lineHeight: 1.5 }}>
                      {exam.description || 'No description provided.'}
                    </Typography>
                    
                    <Stack direction="row" spacing={2.5} alignItems="center" sx={{ color: '#6B6A62' }}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px', textTransform: 'uppercase' }}>
                          {exam.duration} MIN
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <FormatListNumberedRoundedIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px', textTransform: 'uppercase' }}>
                          {exam.totalQuestions || 10} Qs
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <SecurityRoundedIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px', textTransform: 'uppercase' }}>
                          Monitored
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                  
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrowRoundedIcon />}
                      onClick={() => handleStart(exam.id)}
                      sx={{
                        bgcolor: '#0F7A5C',
                        color: '#fff',
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        borderRadius: '2px',
                        py: 1.5,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#085041',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      ENTER EXAM
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
