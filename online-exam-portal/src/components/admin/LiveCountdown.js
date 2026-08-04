import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const LiveCountdown = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!endTime) {
      setTimeLeft('--:--');
      return;
    }

    const calculateTimeLeft = () => {
      const total = new Date(endTime) - new Date();
      if (total <= 0) return '00:00';
      
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const seconds = Math.floor((total / 1000) % 60);

      const m = String(minutes).padStart(2, '0');
      const s = String(seconds).padStart(2, '0');
      
      if (hours > 0) {
        return `${hours}:${m}:${s}`;
      }
      return `${m}:${s}`;
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '14px', color: '#16201C' }}>
      {timeLeft}
    </Typography>
  );
};

export default LiveCountdown;
