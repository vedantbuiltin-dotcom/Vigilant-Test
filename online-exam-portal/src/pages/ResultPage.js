import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import AppHeader from '../components/common/AppHeader';

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.submission) {
    return <Navigate to="/home" replace />;
  }

  const { submission, examTitle } = state;
  const passed = submission.passed;
  const percentage = submission.percentage ?? 0;

  return (
    <>
      <AppHeader />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                mx: 'auto',
                mb: 3,
                display: 'grid',
                placeItems: 'center',
                background: passed
                  ? 'linear-gradient(135deg, #34d399, #10b981)'
                  : 'linear-gradient(135deg, #f87171, #ef4444)',
                color: '#fff',
              }}
            >
              <EmojiEventsRoundedIcon sx={{ fontSize: 48 }} />
            </Box>

            <Typography variant="h4" gutterBottom>
              {passed ? 'Congratulations!' : 'Better luck next time'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              You {passed ? 'passed' : 'did not pass'} the {examTitle || 'exam'}.
            </Typography>

            <Box sx={{ my: 4 }}>
              <Typography variant="h2" sx={{ fontWeight: 700 }}>
                {percentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {submission.score} / {submission.totalMarks} marks
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percentage}
                color={passed ? 'success' : 'error'}
                sx={{ mt: 2, height: 10, borderRadius: 6 }}
              />
            </Box>

            <Stack direction="row" justifyContent="center" spacing={1.5} sx={{ mb: 3 }}>
              <Chip
                color={passed ? 'success' : 'error'}
                label={passed ? 'Passed' : 'Failed'}
                sx={{ fontWeight: 600 }}
              />
              <Chip variant="outlined" label={`${submission.details?.length || 0} answered`} />
            </Stack>

            <Button
              variant="contained"
              size="large"
              startIcon={<HomeRoundedIcon />}
              onClick={() => navigate('/home', { replace: true })}
            >
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default ResultPage;
