import { useState } from 'react';
import { Box, Button, Typography, Stack, Alert } from '@mui/material';
import Papa from 'papaparse';
import api from '../../api/client';

const QuestionBank = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // We assume the user has selected an exam to assign these to, but for this demo, 
    // we use a placeholder examId or require them to type it in.
    const targetExamId = prompt('Enter Exam ID to assign these questions to:');
    if (!targetExamId) return;

    setLoading(true);
    setMessage('');
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const formattedQuestions = results.data.map(row => ({
            question: row.question,
            options: [row.option1, row.option2, row.option3, row.option4].filter(Boolean),
            correctAnswerIndex: parseInt(row.correctAnswerIndex || 0, 10),
            mark: parseFloat(row.mark || 1),
            type: row.type || 'MCQ',
            tags: row.tags ? row.tags.split(',') : [],
            difficulty: row.difficulty || 'medium'
          }));

          const res = await api.post('/api/questions/bulk', {
            examId: targetExamId,
            questions: formattedQuestions
          });

          setMessage(`Successfully imported ${res.data.count} questions.`);
        } catch (err) {
          setMessage(`Error: ${err.message}`);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Question Bank</Typography>
      
      {message && <Alert sx={{ mb: 2 }} severity={message.startsWith('Error') ? 'error' : 'success'}>{message}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="contained" component="label" disabled={loading}>
          {loading ? 'Importing...' : 'Bulk Import CSV'}
          <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
        </Button>
        <Button variant="outlined">Add Single Question</Button>
      </Stack>
      
      <Typography variant="body2" color="text.secondary">
        CSV format should include headers: question, option1, option2, option3, option4, correctAnswerIndex, mark, type, tags, difficulty
      </Typography>
    </Box>
  );
};

export default QuestionBank;
