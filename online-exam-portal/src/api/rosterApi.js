import apiClient from './client';

export const rosterApi = {
  // Students
  listStudents: async () => {
    const res = await apiClient.get('/admin/students');
    return res.data.students || [];
  },
  createStudent: async (data) => {
    const res = await apiClient.post('/admin/students', data);
    return res.data.student;
  },
  updateStudent: async (id, data) => {
    const res = await apiClient.put(`/admin/students/${id}`, data);
    return res.data.student;
  },
  removeStudent: async (id) => {
    const res = await apiClient.delete(`/admin/students/${id}`);
    return res.data;
  },
  reassignBatch: async (studentId, batchId) => {
    const res = await apiClient.put(`/admin/students/${studentId}/batch`, { batchId });
    return res.data.student;
  },
  bulkImportStudents: async (formData) => {
    const file = formData.get('file');
    if (!file) throw new Error("No file uploaded");

    const ext = file.name.split('.').pop().toLowerCase();
    let students = [];

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
              const y = item.transform[5];
              if (lastY !== -1 && Math.abs(y - lastY) > 5) {
                pageText += '\n';
              }
              pageText += item.str + ' ';
              lastY = y;
            }
            rawText += pageText + '\n';
          }
        } else {
          const mammoth = (await import('mammoth/mammoth.browser')).default || (await import('mammoth/mammoth.browser'));
          const result = await mammoth.extractRawText({ arrayBuffer });
          rawText = result.value;
        }

        const { parseTextToStudents } = await import('../utils/studentParser');
        students = parseTextToStudents(rawText);
        
      } catch (err) {
        throw new Error('Failed to parse document: ' + err.message);
      }
    } else {
      // CSV parse
      const Papa = (await import('papaparse')).default;
      students = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data.map(row => ({
              fullName: row.fullName || row.FullName || row.name || row.Name || row['STUDENT NAME'] || '',
              email: row.email || row.Email || row['EMAIL ADDRESS'] || '',
              batchName: row.batchName || row.BatchName || row.batch || row.Batch || row['BATCH'] || 'Unassigned'
            })).filter(s => s.email);
            resolve(parsed);
          },
          error: reject
        });
      });
    }

    if (students.length === 0) {
      throw new Error("Could not find any student records (emails) in the document.");
    }

    const res = await apiClient.post('/admin/students/bulk-import', { students });
    return res.data;
  },

  // Batches
  listBatches: async () => {
    const res = await apiClient.get('/admin/batches');
    return res.data.batches || [];
  },
  createBatch: async (data) => {
    const res = await apiClient.post('/admin/batches', data);
    return res.data.batch;
  },
  updateBatch: async (id, data) => {
    const res = await apiClient.put(`/admin/batches/${id}`, data);
    return res.data.batch;
  },
  removeBatch: async (id) => {
    const res = await apiClient.delete(`/admin/batches/${id}`);
    return res.data;
  }
};
