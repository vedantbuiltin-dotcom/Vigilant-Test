import React from 'react';
import { Box, Typography, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ImportResultSummary = ({ summary }) => {
  if (!summary) return null;

  const { totalImported = 0, totalFailed = 0, errors = [] } = summary;

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: '#FBFAF6', border: '1px solid #E3DFD4', borderRadius: '4px' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: totalFailed > 0 ? 2 : 0 }}>
        {totalFailed === 0 ? (
          <CheckCircleOutlineIcon sx={{ color: '#0F7A5C' }} />
        ) : (
          <ErrorOutlineIcon sx={{ color: '#C97A1A' }} />
        )}
        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, color: '#16201C' }}>
          {totalImported} imported, {totalFailed} failed
        </Typography>
      </Stack>

      {totalFailed > 0 && errors.length > 0 && (
        <Accordion elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              p: 0,
              minHeight: 'auto',
              '& .MuiAccordionSummary-content': { m: 0 },
            }}
          >
            <Typography sx={{ fontSize: '14px', color: '#6B6A62', textDecoration: 'underline' }}>
              View failed rows
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, mt: 1 }}>
            <Box sx={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #E3DFD4', borderRadius: '2px' }}>
              {errors.map((err, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.5,
                    borderBottom: idx < errors.length - 1 ? '1px solid #E3DFD4' : 'none',
                    bgcolor: '#fff',
                  }}
                >
                  <Typography sx={{ fontSize: '13px', fontFamily: '"IBM Plex Mono", monospace', color: '#16201C', mb: 0.5 }}>
                    Row {err.row}
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: '#C97A1A' }}>
                    {err.reason}
                  </Typography>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default ImportResultSummary;
