import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from '@mui/material';

const AnalyticsTab = ({ data }) => {
  if (!data) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading analytics...</Typography></Box>;

  const { distribution = [], difficulty = [] } = data;

  // Ensure difficulty is sorted worst-first
  const sortedDifficulty = [...difficulty].sort((a, b) => a.correctPercent - b.correctPercent);

  // Find max count for histogram scaling
  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <Box sx={{ py: 3 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Box sx={{ bgcolor: '#FBFAF6', border: '1px solid #E3DFD4', borderRadius: '4px', p: 3, height: '100%' }}>
            <Typography variant="overline" sx={{ color: '#6B6A62', fontWeight: 600, letterSpacing: '0.05em', mb: 3, display: 'block' }}>
              SCORE DISTRIBUTION
            </Typography>
            <Stack spacing={1.5}>
              {distribution.map((bin, idx) => {
                const widthPercent = (bin.count / maxCount) * 100;
                return (
                  <Stack key={idx} direction="row" alignItems="center" spacing={2}>
                    <Typography sx={{ width: '40px', fontSize: '13px', color: '#6B6A62', textAlign: 'right', fontFamily: '"IBM Plex Mono", monospace' }}>
                      {bin.range}
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          height: '24px', 
                          bgcolor: '#0F7A5C', 
                          width: `${widthPercent}%`,
                          minWidth: bin.count > 0 ? '4px' : '0px',
                          borderRadius: '2px',
                          transition: 'width 0.5s ease'
                        }} 
                      />
                    </Box>
                    <Typography sx={{ width: '30px', fontSize: '13px', color: '#16201C', fontWeight: 500, fontFamily: '"IBM Plex Mono", monospace' }}>
                      {bin.count}
                    </Typography>
                  </Stack>
                );
              })}
              {distribution.length === 0 && (
                <Typography sx={{ color: '#6B6A62', fontSize: '14px', textAlign: 'center', py: 2 }}>No distribution data available yet.</Typography>
              )}
            </Stack>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Box sx={{ bgcolor: '#FBFAF6', border: '1px solid #E3DFD4', borderRadius: '4px', p: 3, height: '100%' }}>
            <Typography variant="overline" sx={{ color: '#6B6A62', fontWeight: 600, letterSpacing: '0.05em', mb: 3, display: 'block' }}>
              QUESTION DIFFICULTY
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, borderBottom: '1px solid #E3DFD4' }}>QUESTION</TableCell>
                    <TableCell align="right" sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, borderBottom: '1px solid #E3DFD4' }}>CORRECT %</TableCell>
                    <TableCell align="right" sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, borderBottom: '1px solid #E3DFD4' }}>AVG TIME</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedDifficulty.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 3, color: '#6B6A62' }}>No difficulty data available.</TableCell>
                    </TableRow>
                  )}
                  {sortedDifficulty.map((item, idx) => {
                    const isWeak = item.correctPercent < 40;
                    return (
                      <TableRow key={idx} sx={{ position: 'relative' }}>
                        <TableCell sx={{ 
                          borderBottom: '1px solid #E3DFD4',
                          borderLeft: isWeak ? '3px solid #C97A1A' : '3px solid transparent',
                          pl: isWeak ? 1.5 : 2
                        }}>
                          <Typography noWrap sx={{ maxWidth: '300px', fontSize: '14px', color: '#16201C' }}>
                            {item.questionText}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid #E3DFD4' }}>
                          <Typography sx={{ color: isWeak ? '#C97A1A' : '#16201C', fontWeight: isWeak ? 600 : 400, fontSize: '14px' }}>
                            {item.correctPercent}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid #E3DFD4', color: '#6B6A62', fontSize: '13px' }}>
                          {item.avgTime}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsTab;
