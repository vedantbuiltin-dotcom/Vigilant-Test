import apiClient from './client';

export const questionApi = {
  // Admin-specific question management
  listAdmin: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.topic && filters.topic !== 'all') params.append('topic', filters.topic);
    if (filters.difficulty && filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);

    const res = await apiClient.get(`/questions?${params.toString()}`);
    return res.data.questions || [];
  },

  getTopics: async () => {
    const res = await apiClient.get('/questions/topics');
    return res.data.topics || [];
  },

  create: async (data) => {
    const res = await apiClient.post('/questions', data);
    return res.data.question;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/questions/${id}`, data);
    return res.data.question;
  },

  remove: async (id) => {
    const res = await apiClient.delete(`/questions/${id}`);
    return res.data;
  },

  bulkImport: async (formData) => {
    const file = formData.get('file');
    if (!file) throw new Error("No file uploaded");

    const ext = file.name.split('.').pop().toLowerCase();
    if (['pdf', 'doc', 'docx'].includes(ext)) {
      let rawText = '';
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (ext === 'pdf') {
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            let lastY = -1;
            let pageText = '';
            for (const item of content.items) {
              const y = item.transform[5]; // y-coordinate
              if (lastY !== -1 && Math.abs(y - lastY) > 5) {
                pageText += '\n';
              }
              pageText += item.str;
              lastY = y;
            }
            rawText += pageText + '\n';
          }
        } else {
          const mammoth = (await import('mammoth/mammoth.browser')).default || (await import('mammoth/mammoth.browser'));
          const result = await mammoth.extractRawText({ arrayBuffer });
          rawText = result.value;
        }

        const { parseTextToQuestions } = await import('../utils/textParser');
        let questions = parseTextToQuestions(rawText, file.name);
        
        // If the parser failed to find any, fallback to one large question for the user to edit
        if (questions.length === 0) {
          questions = [{
            question: `Could not auto-parse questions from ${file.name}. Raw text:\n${rawText.substring(0, 200)}...`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswerIndex: 0,
            mark: 1,
            type: 'mcq',
            topic: 'Uncategorized',
            difficulty: 'medium'
          }];
        }

        const res = await apiClient.post('/questions/bulk', { questions });
        return {
          totalImported: res.data.count,
          totalFailed: 0,
          errors: []
        };
      } catch (err) {
        throw new Error('Failed to parse document: ' + err.message);
      }
    }

    const Papa = (await import('papaparse')).default;

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const parsedQuestions = results.data.map(row => ({
              question: row.question || row.Question || '',
              options: [row.option1 || row.Option1, row.option2 || row.Option2, row.option3 || row.Option3, row.option4 || row.Option4].filter(Boolean),
              correctAnswerIndex: parseInt(row.correctAnswerIndex || row.CorrectAnswerIndex || 0, 10),
              mark: parseInt(row.mark || row.Mark || 1, 10),
              type: row.type || row.Type || 'mcq',
              topic: row.topic || row.Topic || 'General',
              difficulty: row.difficulty || row.Difficulty || 'medium'
            }));

            // send to backend endpoint which expects { questions }
            const res = await apiClient.post('/questions/bulk', { questions: parsedQuestions });
            
            // map response to what UI expects
            resolve({ 
              totalImported: res.data.count, 
              totalFailed: 0, 
              errors: [] 
            });
          } catch (err) {
            reject(err);
          }
        },
        error: (error) => reject(error)
      });
    });
  }
};
