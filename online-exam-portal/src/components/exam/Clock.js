import { Box, CircularProgress, Typography } from '@mui/material';
import { formatDuration } from '../../utils/time';

const colorFor = (ratio) => {
  if (ratio <= 0.15) return 'error';
  if (ratio <= 0.35) return 'warning';
  return 'primary';
};

const Clock = ({ totalSeconds, secondsLeft }) => {
  const safeTotal = Math.max(1, totalSeconds || 1);
  const ratio = Math.min(1, Math.max(0, secondsLeft / safeTotal));
  const value = ratio * 100;
  const color = colorFor(ratio);

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={140}
        thickness={4}
        sx={{ color: 'rgba(0,0,0,0.06)' }}
      />
      <CircularProgress
        variant="determinate"
        value={value}
        color={color}
        size={140}
        thickness={4}
        sx={{ position: 'absolute', left: 0, transform: 'rotate(-90deg)!important' }}
      />
      <Box
        sx={{
          inset: 0,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Time left
        </Typography>
        <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }} color={`${color}.main`}>
          {formatDuration(secondsLeft)}
        </Typography>
      </Box>
    </Box>
  );
};

export default Clock;
