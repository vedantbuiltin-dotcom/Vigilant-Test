import React, { useState } from 'react';
import { Drawer, Box, Typography, Stack, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import FlagTimeline from './FlagTimeline';

const StudentReportDrawer = ({ open, onClose, report, examTitle }) => {
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  if (!report) return null;

  const { student, score, percentage, passed, flags = [], answers = [] } = report;
  
  const displayedAnswers = showAllAnswers ? answers : answers.slice(0, 5);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 600, bgcolor: '#FBFAF6' } }}>
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, color: '#16201C', mb: 0.5 }}>
              {student?.name}
            </Typography>
            <Typography sx={{ color: '#6B6A62', fontSize: '14px', mb: 2 }}>
              {examTitle}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500, fontSize: '18px', color: '#16201C' }}>
                {score} <Typography component="span" sx={{ color: '#6B6A62', fontSize: '14px' }}>({percentage}%)</Typography>
              </Typography>
              <Box
                sx={{
                  bgcolor: passed ? '#E1F5EE' : '#FCE8E8',
                  color: passed ? '#085041' : '#8A1515',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '16px',
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {passed ? 'Pass' : 'Fail'}
              </Box>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadOutlinedIcon />}
              sx={{
                borderColor: '#C8C6BC',
                color: '#16201C',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { borderColor: '#16201C', bgcolor: 'transparent' }
              }}
            >
              Export as PDF
            </Button>
            <IconButton onClick={onClose} size="small" sx={{ color: '#6B6A62' }}>
              <CloseOutlinedIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          
          {/* Flags Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="overline" sx={{ color: '#6B6A62', fontWeight: 600, letterSpacing: '0.05em', mb: 2, display: 'block' }}>
              FLAGGED INCIDENTS
            </Typography>
            {flags.length > 0 ? (
              <Box sx={{ border: '1px solid #E3DFD4', borderRadius: '4px', bgcolor: '#fff' }}>
                <FlagTimeline flags={flags} />
              </Box>
            ) : (
              <Box sx={{ p: 3, border: '1px dashed #E3DFD4', borderRadius: '4px', textAlign: 'center' }}>
                <Typography sx={{ color: '#6B6A62', fontSize: '13px' }}>No incidents flagged.</Typography>
              </Box>
            )}
          </Box>

          {/* Answers Section */}
          <Box>
            <Typography variant="overline" sx={{ color: '#6B6A62', fontWeight: 600, letterSpacing: '0.05em', mb: 2, display: 'block' }}>
              ANSWER BREAKDOWN
            </Typography>
            <TableContainer sx={{ border: '1px solid #E3DFD4', borderRadius: '4px', bgcolor: '#fff' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F6F4EF' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600 }}>QUESTION</TableCell>
                    <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600 }}>STUDENT ANSWER</TableCell>
                    <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600 }}>CORRECT ANSWER</TableCell>
                    <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, textAlign: 'right' }}>MARKS</TableCell>
                    <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, textAlign: 'right' }}>TIME</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedAnswers.map((ans, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontSize: '13px', color: '#16201C', borderBottom: '1px solid #E3DFD4', maxWidth: '150px' }}>
                        <Typography noWrap sx={{ fontSize: '13px' }}>{ans.question}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', color: ans.isCorrect ? '#0F7A5C' : '#C97A1A', borderBottom: '1px solid #E3DFD4' }}>
                        {ans.studentAnswer}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', color: '#6B6A62', borderBottom: '1px solid #E3DFD4' }}>
                        {ans.correctAnswer}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '13px', color: '#16201C', borderBottom: '1px solid #E3DFD4' }}>
                        {ans.marks}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '13px', color: '#6B6A62', borderBottom: '1px solid #E3DFD4' }}>
                        {ans.timeSpent}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {answers.length > 5 && !showAllAnswers && (
              <Button 
                fullWidth 
                onClick={() => setShowAllAnswers(true)}
                sx={{ 
                  mt: 2, 
                  color: '#16201C', 
                  textTransform: 'none', 
                  border: '1px solid #E3DFD4',
                  '&:hover': { bgcolor: '#F6F4EF' }
                }}
              >
                Show all answers ({answers.length - 5} more)
              </Button>
            )}
          </Box>
          
        </Box>
      </Box>
    </Drawer>
  );
};

export default StudentReportDrawer;
