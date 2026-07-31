import { Box, Button, Stack, Typography } from '@mui/material';

const QuestionNavigator = ({ total, current, answers, onJump }) => (
  <Box>
    <Typography variant="overline" color="text.secondary">
      Questions
    </Typography>
    <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mt: 1 }}>
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === current;
        const isAnswered = answers[i] != null && answers[i] !== '';
        return (
          <Button
            key={i}
            onClick={() => onJump(i)}
            size="small"
            variant={isCurrent ? 'contained' : isAnswered ? 'outlined' : 'text'}
            color={isAnswered ? 'success' : 'primary'}
            sx={{
              minWidth: 36,
              px: 0,
              py: 0,
              height: 36,
              borderRadius: '50%',
              fontWeight: 600,
            }}
          >
            {i + 1}
          </Button>
        );
      })}
    </Stack>
  </Box>
);

export default QuestionNavigator;
