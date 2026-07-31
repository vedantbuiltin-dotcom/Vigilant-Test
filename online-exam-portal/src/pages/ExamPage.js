import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AppHeader from '../components/common/AppHeader';
import LoadingScreen from '../components/common/LoadingScreen';
import Clock from '../components/exam/Clock';
import Instructions from '../components/exam/Instructions';
import Question from '../components/exam/Question';
import QuestionNavigator from '../components/exam/QuestionNavigator';
import { examApi } from '../api/examApi';
import { submissionApi } from '../api/submissionApi';
import { useCountdown } from '../hooks/useCountdown';
import { setSession } from '../utils/storage';

const INSTRUCTIONS = [
  'There is no negative marking.',
  'Do not switch tabs or open new windows during the exam.',
  'Each question carries one mark unless stated.',
  'Your answers save automatically when you press "Save & next".',
];

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const submittedRef = useRef(false);

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // index -> selectedIndex
  const [submitting, setSubmitting] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [tabSwitchWarning, setTabSwitchWarning] = useState(false);

  const totalSeconds = (exam?.duration || 0) * 60;

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    if (!exam || !exam.questions?.length) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const payload = exam.questions
        .map((q, idx) => ({ questionId: q.id, selectedIndex: answers[idx] }))
        .filter((a) => a.selectedIndex != null && !Number.isNaN(Number(a.selectedIndex)));

      if (payload.length === 0) {
        // No answers given – send a no-op so we still get a submission record
        navigate('/result', { replace: true, state: { submission: null, examTitle: exam.title } });
        return;
      }

      const submission = await submissionApi.submit(exam.id, payload);
      setSession(null);
      navigate('/result', { replace: true, state: { submission, examTitle: exam.title } });
    } catch (err) {
      submittedRef.current = false;
      setError(err.message || 'Failed to submit exam.');
    } finally {
      setSubmitting(false);
    }
  }, [exam, answers, navigate]);

  const secondsLeft = useCountdown(totalSeconds, {
    intervalMs: 1000,
    onEnd: handleSubmit,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const detail = await examApi.get(examId);
        if (cancelled) return;
        setExam(detail);
        setAnswers(new Array(detail.questions?.length || 0).fill(null));
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load exam');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [examId]);

  // Detect tab switching for soft-warning
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState !== 'visible') {
        setTabSwitchWarning(true);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const totalQuestions = exam?.questions?.length || 0;
  const answeredCount = useMemo(() => answers.filter((a) => a != null).length, [answers]);
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleAnswer = (selectedIndex) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = selectedIndex;
      return next;
    });
    setCurrentIdx((idx) => Math.min(idx + 1, totalQuestions - 1));
  };

  const handleClear = () => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = null;
      return next;
    });
  };

  const handleNext = () => setCurrentIdx((idx) => Math.min(idx + 1, totalQuestions - 1));
  const handleJump = (idx) => setCurrentIdx(idx);

  if (loading) {
    return (
      <>
        <AppHeader />
        <LoadingScreen label="Loading exam..." />
      </>
    );
  }

  if (error || !exam) {
    return (
      <>
        <AppHeader />
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Alert severity="error">{error || 'Exam not found.'}</Alert>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/home')}>
              Back to dashboard
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  const currentQuestion = exam.questions[currentIdx];

  return (
    <>
      <AppHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {tabSwitchWarning && (
          <Alert severity="warning" onClose={() => setTabSwitchWarning(false)} sx={{ mb: 2 }}>
            Tab switching detected. Repeated activity may invalidate your session.
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  {exam.title}
                </Typography>
                <Box sx={{ my: 2 }}>
                  <Clock totalSeconds={totalSeconds} secondsLeft={secondsLeft} />
                </Box>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <LinearProgress
                    value={progress}
                    variant="determinate"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {answeredCount} of {totalQuestions} answered
                  </Typography>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <QuestionNavigator
                  total={totalQuestions}
                  current={currentIdx}
                  answers={answers}
                  onJump={handleJump}
                />
              </Paper>

              <Instructions items={INSTRUCTIONS} />

              <Stack direction="row" spacing={1.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={() => setConfirmQuit(true)}
                  disabled={submitting}
                >
                  Quit exam
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Question
              index={currentIdx}
              total={totalQuestions}
              question={currentQuestion}
              currentAnswer={answers[currentIdx]}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onClear={handleClear}
            />
          </Grid>
        </Grid>
      </Container>

      <Dialog open={confirmQuit} onClose={() => setConfirmQuit(false)}>
        <DialogTitle>Quit the exam?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your answered questions will be submitted as your final answers. You cannot resume after quitting.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmQuit(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setConfirmQuit(false);
              handleSubmit();
            }}
          >
            Quit and submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExamPage;
