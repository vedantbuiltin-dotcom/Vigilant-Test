import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

const Question = ({ index, total, question, currentAnswer, onAnswer, onNext, onClear }) => {
  const [selected, setSelected] = useState(currentAnswer ?? '');

  useEffect(() => {
    setSelected(currentAnswer ?? '');
  }, [currentAnswer, question?.id]);

  if (!question) return null;

  const handleSelect = (event) => setSelected(Number(event.target.value));

  const handleSubmit = () => {
    if (selected === '' || selected === null || Number.isNaN(Number(selected))) return;
    onAnswer(Number(selected));
  };

  const handleClear = () => {
    setSelected('');
    onClear?.();
  };

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Chip label={`Question ${index + 1} of ${total}`} color="primary" variant="outlined" />
        {currentAnswer != null && currentAnswer !== '' && (
          <Chip color="success" label="Answered" />
        )}
      </Stack>

      <Typography variant="h5" sx={{ mt: 2, mb: 3, lineHeight: 1.4 }}>
        {question.question}
      </Typography>

      <RadioGroup value={selected} onChange={handleSelect}>
        <Stack spacing={1.5}>
          {(question.options || []).map((option, idx) => {
            const checked = Number(selected) === idx;
            return (
              <Paper
                key={idx}
                variant="outlined"
                onClick={() => setSelected(idx)}
                sx={{
                  p: 1.5,
                  cursor: 'pointer',
                  borderColor: checked ? 'primary.main' : 'divider',
                  bgcolor: checked ? 'rgba(79,70,229,0.06)' : 'transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': { borderColor: 'primary.light', bgcolor: 'rgba(79,70,229,0.04)' },
                }}
              >
                <FormControlLabel
                  value={idx}
                  control={<Radio />}
                  label={
                    <Typography variant="body1" sx={{ fontWeight: checked ? 600 : 400 }}>
                      {option}
                    </Typography>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>
            );
          })}
        </Stack>
      </RadioGroup>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2, flexWrap: 'wrap' }}>
        <Button
          color="inherit"
          startIcon={<RestartAltRoundedIcon />}
          onClick={handleClear}
          disabled={selected === '' || selected === null}
        >
          Clear selection
        </Button>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={onNext}>
            Skip
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            disabled={selected === '' || selected === null}
            onClick={handleSubmit}
          >
            Save & next
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default Question;
