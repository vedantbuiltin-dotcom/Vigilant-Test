import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, Stack, Button, TextField, MenuItem,
  IconButton, Autocomplete, FormControlLabel, Radio, RadioGroup
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { questionApi } from '../../api/questionApi';

const DEFAULT_MCQ_OPTIONS = [{ text: '' }, { text: '' }];

const QuestionFormDrawer = ({ open, onClose, onSave, question = null }) => {
  const [type, setType] = useState('mcq');
  const [questionText, setQuestionText] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [mark, setMark] = useState(1);
  
  // MCQ specific
  const [options, setOptions] = useState(DEFAULT_MCQ_OPTIONS);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);

  // Short answer specific
  const [modelAnswer, setModelAnswer] = useState('');

  // Topic auto-complete list
  const [availableTopics, setAvailableTopics] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topics = await questionApi.getTopics();
        setAvailableTopics(topics);
      } catch (err) {
        console.error('Failed to fetch topics', err);
      }
    };
    if (open) fetchTopics();
  }, [open]);

  useEffect(() => {
    if (question) {
      setType(question.type || 'mcq');
      setQuestionText(question.question || '');
      setTopic(question.topic || question.tags?.[0] || ''); // Topic might be saved in tags for now based on legacy code
      setDifficulty(question.difficulty || 'medium');
      setMark(question.mark || 1);
      
      if (question.type === 'mcq') {
        const qOptions = question.options?.length >= 2 
          ? question.options.map(opt => ({ text: opt }))
          : DEFAULT_MCQ_OPTIONS;
        setOptions(qOptions);
        setCorrectAnswerIndex(question.correctAnswerIndex || 0);
      } else if (question.type === 'true_false') {
        setCorrectAnswerIndex(question.correctAnswerIndex || 0);
      } else if (question.type === 'short_answer') {
        setModelAnswer(question.modelAnswer || '');
      }
    } else {
      setType('mcq');
      setQuestionText('');
      setTopic('');
      setDifficulty('medium');
      setMark(1);
      setOptions(DEFAULT_MCQ_OPTIONS);
      setCorrectAnswerIndex(0);
      setModelAnswer('');
    }
  }, [question, open]);

  const handleAddOption = () => {
    setOptions([...options, { text: '' }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    if (correctAnswerIndex === index) {
      setCorrectAnswerIndex(0);
    } else if (correctAnswerIndex > index) {
      setCorrectAnswerIndex(correctAnswerIndex - 1);
    }
  };

  const handleOptionChange = (index, val) => {
    const newOptions = [...options];
    newOptions[index].text = val;
    setOptions(newOptions);
  };

  const handleSave = () => {
    const data = {
      type,
      question: questionText,
      topic,
      difficulty,
      mark: Number(mark)
    };

    if (type === 'mcq') {
      data.options = options.map(o => o.text);
      data.correctAnswerIndex = correctAnswerIndex;
    } else if (type === 'true_false') {
      data.options = ['True', 'False'];
      data.correctAnswerIndex = correctAnswerIndex;
    } else if (type === 'short_answer') {
      data.modelAnswer = modelAnswer;
    }

    if (question && question.id) {
      data.id = question.id;
    }
    
    onSave(data);
  };

  const isFormValid = () => {
    if (!questionText.trim()) return false;
    if (!topic.trim()) return false;
    if (type === 'mcq') {
      if (options.some(o => !o.text.trim())) return false;
    }
    if (type === 'short_answer' && !modelAnswer.trim()) return false;
    return true;
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 500, bgcolor: '#FBFAF6' } }}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500 }}>
            {question ? 'Edit question' : 'Add question'}
          </Typography>
          <IconButton onClick={onClose} size="small"><CloseOutlinedIcon /></IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Stack spacing={3}>
            
            <TextField
              select
              label="Question Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
            >
              <MenuItem value="mcq">Multiple Choice (MCQ)</MenuItem>
              <MenuItem value="true_false">True / False</MenuItem>
              <MenuItem value="short_answer">Short Answer</MenuItem>
            </TextField>

            <TextField
              label="Question Text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
            />

            {type === 'mcq' && (
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1, color: '#16201C' }}>Options</Typography>
                <Typography sx={{ fontSize: '12px', color: '#6B6A62', mb: 2 }}>Select the radio button next to the correct answer.</Typography>
                <RadioGroup value={correctAnswerIndex} onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))}>
                  <Stack spacing={2}>
                    {options.map((opt, idx) => (
                      <Stack direction="row" spacing={1} alignItems="center" key={idx}>
                        <FormControlLabel
                          value={idx}
                          control={<Radio sx={{ color: '#0F7A5C', '&.Mui-checked': { color: '#0F7A5C' } }} />}
                          label=""
                          sx={{ m: 0 }}
                        />
                        <TextField
                          value={opt.text}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          fullWidth
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                        />
                        <IconButton 
                          onClick={() => handleRemoveOption(idx)} 
                          disabled={options.length <= 2}
                          size="small"
                          sx={{ color: '#C97A1A' }}
                        >
                          <DeleteOutlineOutlinedIcon />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                </RadioGroup>
                <Button 
                  startIcon={<AddOutlinedIcon />} 
                  onClick={handleAddOption}
                  sx={{ mt: 2, color: '#0F7A5C', textTransform: 'none' }}
                >
                  Add option
                </Button>
              </Box>
            )}

            {type === 'true_false' && (
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1, color: '#16201C' }}>Correct Answer</Typography>
                <RadioGroup value={correctAnswerIndex} onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))} row>
                  <FormControlLabel value={0} control={<Radio sx={{ color: '#0F7A5C', '&.Mui-checked': { color: '#0F7A5C' } }} />} label="True" />
                  <FormControlLabel value={1} control={<Radio sx={{ color: '#0F7A5C', '&.Mui-checked': { color: '#0F7A5C' } }} />} label="False" />
                </RadioGroup>
              </Box>
            )}

            {type === 'short_answer' && (
              <TextField
                label="Model Answer (Grading Reference)"
                value={modelAnswer}
                onChange={(e) => setModelAnswer(e.target.value)}
                fullWidth
                multiline
                rows={4}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
              />
            )}

            <Stack direction="row" spacing={2}>
              <Autocomplete
                freeSolo
                options={availableTopics}
                value={topic}
                onChange={(_, newValue) => setTopic(newValue || '')}
                onInputChange={(_, newInputValue) => setTopic(newInputValue)}
                fullWidth
                size="small"
                renderInput={(params) => <TextField {...params} label="Topic" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />}
              />
              
              <TextField
                select
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                size="small"
                sx={{ width: '150px', '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </TextField>
            </Stack>

            <TextField
              label="Marks"
              type="number"
              value={mark}
              onChange={(e) => setMark(e.target.value)}
              size="small"
              sx={{ width: '150px', '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
              inputProps={{ min: 0, step: 0.5 }}
            />

          </Stack>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4, pt: 2, borderTop: '1px solid #E3DFD4' }}>
          <Button onClick={onClose} sx={{ color: '#6B6A62' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!isFormValid()}
            sx={{
              bgcolor: '#0F7A5C',
              color: '#fff',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#085041', boxShadow: 'none' }
            }}
          >
            Save
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default QuestionFormDrawer;
