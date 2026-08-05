import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, Stack, Button, TextField, MenuItem,
  IconButton, Autocomplete, FormControlLabel, Radio, RadioGroup,
  FormControl, InputLabel, Select
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
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 600, bgcolor: '#FAFAFA', borderLeft: '1px solid #EAEAEA' } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ px: 4, py: 3, borderBottom: '1px solid #EAEAEA', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, color: '#1A1A1A' }}>
            {question ? 'Edit question' : 'Add new question'}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#666', '&:hover': { bgcolor: '#F0F0F0', color: '#000' } }}>
            <CloseOutlinedIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 4 }}>
          <Stack spacing={4}>
            
            {/* Top row: Type & Marks */}
            <Stack direction="row" spacing={3}>
              <TextField
                id="question-type-field"
                select
                label="Question Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                fullWidth
                InputProps={{ sx: { borderRadius: '8px', bgcolor: '#FFFFFF' } }}
              >
                <MenuItem value="mcq">Multiple Choice (MCQ)</MenuItem>
                <MenuItem value="true_false">True / False</MenuItem>
                <MenuItem value="short_answer">Short Answer</MenuItem>
              </TextField>

              <TextField
                label="Marks"
                type="number"
                value={mark}
                onChange={(e) => setMark(e.target.value)}
                sx={{ width: '150px' }}
                InputProps={{ sx: { borderRadius: '8px', bgcolor: '#FFFFFF' } }}
                inputProps={{ min: 1, step: 0.5 }}
              />
            </Stack>

            {/* Question Text */}
            <TextField
              label="Question Text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="Type your question here..."
              InputProps={{ sx: { borderRadius: '8px', bgcolor: '#FFFFFF', fontSize: '15px' } }}
            />

            {/* Options Area */}
            {type === 'mcq' && (
              <Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, mb: 1, color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Options & Correct Answer
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#666', mb: 3 }}>
                  Select the card to mark it as the correct answer.
                </Typography>
                <RadioGroup value={correctAnswerIndex} onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))}>
                  <Stack spacing={2}>
                    {options.map((opt, idx) => {
                      const isSelected = correctAnswerIndex === idx;
                      return (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1.5,
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor: isSelected ? '#0F7A5C' : '#E0E0E0',
                            bgcolor: isSelected ? '#F0F9F6' : '#FFFFFF',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 2px 8px rgba(15, 122, 92, 0.15)' : 'none',
                            '&:hover': {
                              borderColor: isSelected ? '#0F7A5C' : '#B0B0B0',
                            }
                          }}
                        >
                          <FormControlLabel
                            value={idx}
                            control={<Radio color="primary" sx={{ color: isSelected ? '#0F7A5C' : '#999' }} />}
                            label=""
                            sx={{ m: 0, pl: 1 }}
                          />
                          <TextField
                            value={opt.text}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            fullWidth
                            size="small"
                            variant="standard"
                            InputProps={{ disableUnderline: true, sx: { fontSize: '15px', color: isSelected ? '#0A523E' : '#333' } }}
                          />
                          <IconButton 
                            onClick={() => handleRemoveOption(idx)} 
                            disabled={options.length <= 2}
                            size="small"
                            sx={{ color: '#D9534F', opacity: options.length <= 2 ? 0.3 : 0.8, '&:hover': { opacity: 1, bgcolor: '#FDF0F0' } }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Stack>
                </RadioGroup>
                <Button 
                  startIcon={<AddOutlinedIcon />} 
                  onClick={handleAddOption}
                  sx={{ mt: 3, color: '#0F7A5C', textTransform: 'none', fontWeight: 600, fontSize: '14px', borderRadius: '8px', '&:hover': { bgcolor: '#F0F9F6' } }}
                >
                  Add another option
                </Button>
              </Box>
            )}

            {type === 'true_false' && (
              <Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, mb: 2, color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Correct Answer
                </Typography>
                <RadioGroup value={correctAnswerIndex} onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))} row>
                  {[0, 1].map((val) => {
                    const isSelected = correctAnswerIndex === val;
                    return (
                      <Box
                        key={val}
                        sx={{
                          flex: 1,
                          mr: val === 0 ? 2 : 0,
                          p: 2,
                          border: '1px solid',
                          borderColor: isSelected ? '#0F7A5C' : '#E0E0E0',
                          bgcolor: isSelected ? '#F0F9F6' : '#FFFFFF',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(15, 122, 92, 0.15)' : 'none',
                        }}
                        onClick={() => setCorrectAnswerIndex(val)}
                      >
                        <Radio checked={isSelected} sx={{ p: 0, mr: 1.5, color: isSelected ? '#0F7A5C' : '#999' }} />
                        <Typography sx={{ fontWeight: 500, color: isSelected ? '#0A523E' : '#333' }}>
                          {val === 0 ? 'True' : 'False'}
                        </Typography>
                      </Box>
                    );
                  })}
                </RadioGroup>
              </Box>
            )}

            {type === 'short_answer' && (
              <Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, mb: 1, color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Grading Reference
                </Typography>
                <TextField
                  placeholder="Enter the ideal model answer to help graders evaluate student responses."
                  value={modelAnswer}
                  onChange={(e) => setModelAnswer(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  InputProps={{ sx: { borderRadius: '8px', bgcolor: '#FFFFFF' } }}
                />
              </Box>
            )}

            {/* Bottom Row: Topic & Difficulty */}
            <Stack direction="row" spacing={3}>
              <Autocomplete
                freeSolo
                options={availableTopics}
                value={topic}
                onChange={(_, newValue) => setTopic(newValue || '')}
                onInputChange={(_, newInputValue) => setTopic(newInputValue)}
                fullWidth
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Topic / Tag" 
                    placeholder="e.g. JavaScript"
                    InputProps={{ ...params.InputProps, sx: { borderRadius: '8px', bgcolor: '#FFFFFF' } }} 
                  />
                )}
              />
              
              <TextField
                select
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                sx={{ minWidth: '150px' }}
                InputProps={{ sx: { borderRadius: '8px', bgcolor: '#FFFFFF' } }}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </TextField>
            </Stack>

          </Stack>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 3, borderTop: '1px solid #EAEAEA', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            onClick={onClose} 
            sx={{ color: '#666', borderRadius: '8px', px: 3, textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!isFormValid()}
            sx={{ 
              bgcolor: '#0F7A5C', 
              color: '#fff', 
              borderRadius: '8px', 
              px: 4, 
              textTransform: 'none', 
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(15, 122, 92, 0.25)',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: '#0B5E46', boxShadow: '0 6px 16px rgba(15, 122, 92, 0.35)' },
              '&.Mui-disabled': { bgcolor: '#A0D2C4', color: '#FFF' }
            }}
          >
            {question ? 'Save Changes' : 'Create Question'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default QuestionFormDrawer;
