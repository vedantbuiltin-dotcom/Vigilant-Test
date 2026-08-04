import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, Typography, Stack, Button, TextField, MenuItem, Tabs, Tab, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip 
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import { resultsApi } from '../../api/resultsApi';
import { monitorApi } from '../../api/monitorApi'; // For fetching exam list
import StudentReportDrawer from './StudentReportDrawer';
import ReleaseResultsDialog from './ReleaseResultsDialog';
import AnalyticsTab from './AnalyticsTab';
import AuditLogPanel from './AuditLogPanel';

const MetricCard = ({ title, value, highlight }) => (
  <Card
    elevation={0}
    sx={{
      flex: 1,
      bgcolor: '#FBFAF6',
      border: highlight ? '2px solid #C97A1A' : '1px solid #E3DFD4',
      borderRadius: '2px',
      color: highlight ? '#C97A1A' : '#16201C',
    }}
  >
    <CardContent sx={{ p: '16px !important' }}>
      <Typography variant="caption" sx={{ display: 'block', mb: 1, color: highlight ? '#C97A1A' : '#6B6A62', fontWeight: 500, lineHeight: 1.2, textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500, letterSpacing: '-0.02em' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Results = () => {
  const { examId: routeExamId } = useParams();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(routeExamId || '');
  const [currentTab, setCurrentTab] = useState(0);

  const [summary, setSummary] = useState(null);
  const [resultsList, setResultsList] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentReport, setStudentReport] = useState(null);
  
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch exams for dropdown
    const fetchExams = async () => {
      try {
        const data = await monitorApi.getExams();
        setExams(data);
      } catch (err) {
        console.error('Failed to fetch exams', err);
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;

    const loadData = async () => {
      try {
        const [sum, list, analytics] = await Promise.all([
          resultsApi.getSummary(selectedExamId).catch(() => ({})),
          resultsApi.getList(selectedExamId).catch(() => []),
          resultsApi.getAnalytics(selectedExamId).catch(() => ({}))
        ]);
        setSummary(sum);
        setResultsList(list);
        setAnalyticsData(analytics);
      } catch (err) {
        console.error('Failed to load results data', err);
      }
    };
    loadData();
  }, [selectedExamId]);

  const handleExamChange = (e) => {
    const newId = e.target.value;
    setSelectedExamId(newId);
    navigate(`/admin/results/${newId}`);
  };

  const handleRowClick = async (studentId) => {
    setSelectedStudentId(studentId);
    try {
      const report = await resultsApi.getStudentReport(selectedExamId, studentId);
      setStudentReport(report);
    } catch (err) {
      console.error('Failed to load student report', err);
    }
  };

  const closeDrawer = () => {
    setSelectedStudentId(null);
    setStudentReport(null);
  };

  const handleReleaseConfirm = async () => {
    try {
      await resultsApi.releaseResults(selectedExamId);
      setReleaseDialogOpen(false);
      setSummary(prev => ({ ...prev, status: 'Released' }));
    } catch (err) {
      console.error('Failed to release results', err);
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px' }}>
      
      {/* Header / Selector */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Typography variant="h4" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500, color: '#16201C', fontSize: '24px' }}>
              {summary?.title || 'Results'}
            </Typography>
            {summary && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#6B6A62', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  RESULTS
                </Typography>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: summary.status === 'Released' ? '#0F7A5C' : '#6B6A62', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {summary.status}
                </Typography>
              </Box>
            )}
          </Stack>
          
          {!routeExamId && (
            <TextField
              select
              size="small"
              value={selectedExamId}
              onChange={handleExamChange}
              sx={{ width: 300, mt: 1, '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '2px' } }}
              displayEmpty
            >
              <MenuItem value="" disabled>Select an exam to view results...</MenuItem>
              {exams.map(e => (
                <MenuItem key={e.id} value={e.id}>{e.title}</MenuItem>
              ))}
            </TextField>
          )}
        </Box>
        
        {selectedExamId && summary && (
          <Tooltip title={summary.pendingGrading > 0 ? `${summary.pendingGrading} responses awaiting manual grading` : ''} placement="bottom-end">
            <span>
              <Button
                variant="contained"
                onClick={() => setReleaseDialogOpen(true)}
                disabled={summary.status === 'Released' || summary.pendingGrading > 0}
                sx={{
                  bgcolor: '#0F7A5C',
                  color: '#fff',
                  boxShadow: 'none',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#085041', boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: '#E3DFD4', color: '#9D9B91' }
                }}
              >
                Release results
              </Button>
            </span>
          </Tooltip>
        )}
      </Stack>

      {selectedExamId && summary ? (
        <Box>
          {/* Metrics */}
          <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
            <MetricCard title="AVERAGE SCORE" value={summary.averageScore || '-'} />
            <MetricCard title="PASS RATE" value={summary.passRate || '-'} />
            <MetricCard title="AWAITING GRADING" value={summary.pendingGrading || '0'} highlight={summary.pendingGrading > 0} />
          </Stack>

          {/* Tabs & Toolbar */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ borderBottom: '1px solid #E3DFD4', mb: 3 }}>
            <Tabs 
              value={currentTab} 
              onChange={(e, val) => setCurrentTab(val)}
              sx={{
                minHeight: '40px',
                '& .MuiTab-root': { minHeight: '40px', py: 1, textTransform: 'none', fontSize: '15px', color: '#6B6A62', fontWeight: 500 },
                '& .Mui-selected': { color: '#16201C !important' },
                '& .MuiTabs-indicator': { bgcolor: '#16201C' }
              }}
            >
              <Tab label="Results" />
              <Tab label="Analytics" />
              <Tab label="Audit Log" />
            </Tabs>
            
            <Stack direction="row" spacing={2} alignItems="center">
              {summary.pendingGrading > 0 && (
                <Button 
                  component={Link} 
                  to="/admin/grading" 
                  size="small"
                  endIcon={<LaunchIcon sx={{ fontSize: '14px' }}/>}
                  sx={{ color: '#C97A1A', textTransform: 'none', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                >
                  Grading queue
                </Button>
              )}
              <Button size="small" startIcon={<FileDownloadOutlinedIcon />} sx={{ color: '#6B6A62', textTransform: 'none' }}>CSV</Button>
              <Button size="small" startIcon={<FileDownloadOutlinedIcon />} sx={{ color: '#6B6A62', textTransform: 'none' }}>PDF</Button>
            </Stack>
          </Stack>

          {/* Content */}
          {currentTab === 0 ? (
            <TableContainer sx={{ border: '1px solid #E3DFD4', borderRadius: '4px', bgcolor: '#fff' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F6F4EF' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>STUDENT</TableCell>
                    <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>SCORE</TableCell>
                    <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>RESULT</TableCell>
                    <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>TIME TAKEN</TableCell>
                    <TableCell sx={{ color: '#6B6A62', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>FLAGS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#6B6A62' }}>No results available.</TableCell>
                    </TableRow>
                  ) : (
                    resultsList.map(row => (
                      <TableRow 
                        key={row.studentId} 
                        hover 
                        onClick={() => handleRowClick(row.studentId)}
                        sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                      >
                        <TableCell sx={{ fontSize: '14px', color: '#16201C', fontWeight: 500 }}>{row.studentName}</TableCell>
                        <TableCell sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px' }}>
                          <span style={{ color: '#16201C' }}>{row.scoreRaw}</span> <span style={{ color: '#6B6A62' }}>({row.scorePercent}%)</span>
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px', color: row.passed ? '#0F7A5C' : '#8A1515', fontWeight: 500 }}>
                          {row.passed ? 'Pass' : 'Fail'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', color: '#6B6A62' }}>{row.timeTaken}</TableCell>
                        <TableCell>
                          {row.flags > 0 ? (
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: '#FDECC8', px: 1, py: 0.25, borderRadius: '12px' }}>
                              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#854F0B' }}>{row.flags}</Typography>
                            </Box>
                          ) : (
                            <Typography sx={{ fontSize: '13px', color: '#6B6A62' }}>0</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : currentTab === 1 ? (
            <AnalyticsTab data={analyticsData} />
          ) : (
            <AuditLogPanel examId={selectedExamId} />
          )}

          {/* Drawer & Dialog */}
          <StudentReportDrawer 
            open={!!selectedStudentId} 
            onClose={closeDrawer} 
            report={studentReport} 
            examTitle={summary.title} 
          />
          <ReleaseResultsDialog 
            open={releaseDialogOpen}
            onClose={() => setReleaseDialogOpen(false)}
            onConfirm={handleReleaseConfirm}
            pendingGrading={summary.pendingGrading || 0}
            studentCount={resultsList.length}
          />
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 10, border: '1px dashed #E3DFD4', borderRadius: '4px' }}>
          <Typography sx={{ color: '#6B6A62' }}>Select an exam from the dropdown above to view results.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Results;
