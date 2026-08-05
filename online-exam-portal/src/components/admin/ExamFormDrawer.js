import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import QuestionSelectorDialog from './QuestionSelectorDialog';
import { rosterApi } from '../../api/rosterApi';

const initialFormState = {
  title: '',
  subject: '',
  description: '',
  passingScore: 50,
  duration: 60,
  startDate: '',
  endDate: '',
  questionMode: 'fixed', // 'fixed' or 'pool'
  fixedQuestions: [],
  poolSettings: {
    topic: '',
    difficulty: 'medium',
    size: 10,
  },
  batches: [],
};

const SectionDivider = ({ label }) => (
  <Box sx={{ mt: 4, mb: 3 }}>
    <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, color: '#16201C', fontSize: '15px', mb: 1 }}>
      {label}
    </Typography>
    <Divider sx={{ borderColor: '#E3DFD4' }} />
  </Box>
);

const ExamFormDrawer = ({ open, onClose, onSave, exam = null, isLive = false }) => {
  const [form, setForm] = useState(initialFormState);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);

  useEffect(() => {
    if (exam) {
      setForm({ ...initialFormState, ...exam, questionMode: exam.questionMode || 'fixed' });
    } else {
      setForm(initialFormState);
    }
  }, [exam, open]);

  useEffect(() => {
    if (open) {
      rosterApi.listBatches().then(setAvailableBatches).catch(console.error);
    }
  }, [open]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePoolChange = (e) => {
    setForm(prev => ({
      ...prev,
      poolSettings: { ...prev.poolSettings, [e.target.name]: e.target.value }
    }));
  };

  const isValid = form.title && form.subject && form.duration > 0 && form.passingScore >= 0;

  const handleSave = () => {
    if (isValid) {
      onSave(form);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 480, bgcolor: '#FBFAF6' } }}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h5" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, color: '#16201C', mb: 1 }}>
          {exam ? 'Edit Exam' : 'New Exam'}
        </Typography>

        {isLive && (
          <Alert severity="warning" sx={{ mb: 2, '& .MuiAlert-icon': { color: '#C97A1A' } }}>
            This exam is currently live or has active attempts. Schedule and question configuration cannot be edited.
          </Alert>
        )}

        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
          <SectionDivider label="Basics" />
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              error={!form.title}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
            />
            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              error={!form.subject}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={3}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
            />
          </Stack>

          <SectionDivider label="Schedule" />
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              disabled={isLive}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
            />
            <TextField
              fullWidth
              type="date"
              label="End Date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              disabled={isLive}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
            />
          </Stack>

          <SectionDivider label="Rules" />
          <Stack direction="row" spacing={2.5}>
            <TextField
              fullWidth
              type="number"
              label="Duration (minutes)"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              error={form.duration <= 0}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
            />
            <TextField
              fullWidth
              type="number"
              label="Passing Score (%)"
              name="passingScore"
              value={form.passingScore}
              onChange={handleChange}
              error={form.passingScore < 0 || form.passingScore > 100}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
            />
          </Stack>

          <SectionDivider label="Questions" />
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={form.questionMode === 'pool'} 
                  onChange={(e) => setForm({ ...form, questionMode: e.target.checked ? 'pool' : 'fixed' })}
                  disabled={isLive}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0F7A5C' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0F7A5C' } }}
                />
              }
              label={form.questionMode === 'pool' ? "Question Pool Mode" : "Fixed Question Mode"}
              sx={{ color: '#16201C' }}
            />
          </Box>

          {form.questionMode === 'fixed' ? (
            <Box sx={{ p: 2, bgcolor: '#F6F4EF', border: '1px solid #E3DFD4', borderRadius: '2px' }}>
              <Typography sx={{ color: '#6B6A62', fontSize: '13px', mb: 1 }}>
                Search and select specific questions from the bank.
              </Typography>
              <Button disabled={isLive} onClick={() => setSelectorOpen(true)} variant="outlined" size="small" sx={{ borderColor: '#E3DFD4', color: '#16201C', textTransform: 'none' }}>
                Select Questions
              </Button>
              <Typography sx={{ mt: 1, fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px', color: '#0F7A5C' }}>
                {form.fixedQuestions.length} questions selected
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2.5} sx={{ p: 2, bgcolor: '#F6F4EF', border: '1px solid #E3DFD4', borderRadius: '2px' }}>
              <TextField
                id="topic-filter-field"
                select
                fullWidth
                label="Topic Filter"
                name="topic"
                value={form.poolSettings.topic}
                onChange={handlePoolChange}
                disabled={isLive}
                size="small"
              >
                <MenuItem value="">Any Topic</MenuItem>
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="react">React</MenuItem>
                <MenuItem value="databases">Databases</MenuItem>
              </TextField>
              <TextField
                id="difficulty-filter-field"
                select
                fullWidth
                label="Difficulty"
                name="difficulty"
                value={form.poolSettings.difficulty}
                onChange={handlePoolChange}
                disabled={isLive}
                size="small"
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </TextField>
              <TextField
                fullWidth
                type="number"
                label="Pool Size (Questions to pull)"
                name="size"
                value={form.poolSettings.size}
                onChange={handlePoolChange}
                disabled={isLive}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
              />
              <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px', color: '#6B6A62' }}>
                150 questions available in bank matching criteria
              </Typography>
            </Stack>
          )}

          <SectionDivider label="Batches" />
          <Box sx={{ mb: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="exam-batches-label">Assigned Batches</InputLabel>
              <Select
                labelId="exam-batches-label"
                multiple
                value={form.batches || []}
                onChange={(e) => setForm({ ...form, batches: e.target.value })}
                label="Assigned Batches"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const batch = availableBatches.find(b => b.id === value);
                      return (
                        <Box key={value} sx={{ bgcolor: '#E3DFD4', px: 1, py: 0.25, borderRadius: '2px', fontSize: '12px' }}>
                          {batch ? batch.name : value}
                        </Box>
                      );
                    })}
                  </Box>
                )}
                sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: '2px' } }}
              >
                {availableBatches.map((batch) => (
                  <MenuItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ pt: 2, mt: 'auto', borderTop: '1px solid #E3DFD4' }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={onClose} sx={{ color: '#6B6A62', textTransform: 'none' }}>Cancel</Button>
            <Button
              disabled={!isValid}
              onClick={handleSave}
              variant="contained"
              sx={{
                bgcolor: '#0F7A5C',
                color: '#fff',
                textTransform: 'none',
                boxShadow: 'none',
                borderRadius: '2px',
                '&:hover': { bgcolor: '#085041', boxShadow: 'none' },
                '&.Mui-disabled': { bgcolor: 'rgba(15, 122, 92, 0.3)', color: '#fff' }
              }}
            >
              Save Exam
            </Button>
          </Stack>
        </Box>
      </Box>
      <QuestionSelectorDialog
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        initialSelection={form.fixedQuestions}
        onConfirm={(selection) => {
          setForm(prev => ({ ...prev, fixedQuestions: selection }));
          setSelectorOpen(false);
        }}
      />
    </Drawer>
  );
};

export default ExamFormDrawer;
