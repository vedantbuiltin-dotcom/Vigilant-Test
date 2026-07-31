import { Box, Typography, Stack } from '@mui/material';

const AuthHeader = () => {
  return (
    <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          fontFamily: '"Space Grotesk", sans-serif', 
          fontWeight: 500, 
          letterSpacing: '-0.01em',
        }}
      >
        <Box component="span" sx={{ color: '#16201C' }}>VIGILANT</Box>
        <Box component="span" sx={{ color: '#0F7A5C' }}>-TEST</Box>
      </Typography>
      
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box 
          sx={{ 
            width: 7, 
            height: 7, 
            borderRadius: '50%', 
            backgroundColor: '#0F7A5C' 
          }} 
        />
        <Typography 
          sx={{ 
            fontFamily: '"IBM Plex Mono", monospace', 
            fontSize: '11px', 
            color: '#6B6A62',
            textTransform: 'uppercase'
          }}
        >
          SECURE SESSION · fair-use monitored
        </Typography>
      </Stack>
    </Stack>
  );
};

export default AuthHeader;
