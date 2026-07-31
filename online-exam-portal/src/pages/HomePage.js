import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/common/AppHeader';
import LoadingScreen from '../components/common/LoadingScreen';
import { examApi } from '../api/examApi';
import { useAuth } from '../context/AuthContext';

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
    <>
      <AppHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom>
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </Typography>
          <Typography variant="body1" color="text.secondary">
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
          <Alert severity="info">No exams available yet. Please check back later.</Alert>
        ) : (
          <Grid container spacing={3}>
            {exams.map((exam) => (
              <Grid item xs={12} sm={6} md={4} key={exam.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Typography variant="h6">{exam.title}</Typography>
                      <Chip
                        label={`Pass ${exam.passingScore}%`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {exam.description || 'No description provided.'}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'text.secondary' }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AccessTimeRoundedIcon fontSize="small" />
                        <Typography variant="body2">{exam.duration} min</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <EmojiEventsRoundedIcon fontSize="small" />
                        <Typography variant="body2">Pass {exam.passingScore}%</Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrowRoundedIcon />}
                      onClick={() => handleStart(exam.id)}
                    >
                      Start exam
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default HomePage;
