import React from 'react';
import { Box, Typography, Stack, Divider } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const getIconForType = (type) => {
  switch (type) {
    case 'tab-switch':
      return <SwapHorizIcon fontSize="small" sx={{ color: '#854F0B' }} />;
    case 'copy-paste':
      return <ContentPasteIcon fontSize="small" sx={{ color: '#854F0B' }} />;
    case 'fullscreen-exit':
      return <FullscreenExitIcon fontSize="small" sx={{ color: '#854F0B' }} />;
    default:
      return <WarningAmberIcon fontSize="small" sx={{ color: '#854F0B' }} />;
  }
};

const formatLabel = (type) => {
  return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const FlagTimeline = ({ flags = [] }) => {
  if (!flags.length) {
    return (
      <Box sx={{ p: 3, bgcolor: '#FBFAF6', textAlign: 'center' }}>
        <Typography sx={{ color: '#6B6A62', fontSize: '13px' }}>No flags recorded for this attempt.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#FBFAF6', borderTop: '1px solid #E3DFD4', borderBottom: '1px solid #E3DFD4' }}>
      <Typography variant="overline" sx={{ color: '#6B6A62', fontWeight: 600, letterSpacing: '0.05em', mb: 2, display: 'block' }}>
        FLAG TIMELINE
      </Typography>
      
      <Stack spacing={0}>
        {flags.map((flag, idx) => (
          <Box key={idx} sx={{ position: 'relative', pl: 3, pb: idx === flags.length - 1 ? 0 : 3 }}>
            {/* Timeline line */}
            {idx !== flags.length - 1 && (
              <Box sx={{ position: 'absolute', left: '11px', top: '24px', bottom: 0, width: '2px', bgcolor: '#E3DFD4' }} />
            )}
            
            {/* Timeline dot/icon */}
            <Box sx={{ position: 'absolute', left: 0, top: '2px', bgcolor: '#FDECC8', borderRadius: '50%', p: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              {getIconForType(flag.type)}
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px', color: '#6B6A62', width: '80px' }}>
                {new Date(flag.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#16201C', fontWeight: 500 }}>
                {formatLabel(flag.type)}
              </Typography>
              {flag.details && (
                <Typography sx={{ fontSize: '13px', color: '#6B6A62' }}>
                  — {flag.details}
                </Typography>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default FlagTimeline;
