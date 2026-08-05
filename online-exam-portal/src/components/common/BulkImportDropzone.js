import React, { useState, useRef } from 'react';
import { Box, Typography, Link, CircularProgress, Stack } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ImportResultSummary from './ImportResultSummary';

const BulkImportDropzone = ({ onUpload, templateHref = '#', templateName = 'template.csv' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState(null); // { totalImported, totalFailed, errors }
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const processFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['csv', 'xlsx', 'pdf', 'doc', 'docx'];
    if (!allowed.includes(ext)) {
      setSummary({ totalImported: 0, totalFailed: 1, errors: [{ row: 'File', reason: 'Invalid file type. Please upload a .csv, .xlsx, .pdf, or .docx file.' }] });
      return;
    }

    setIsUploading(true);
    setSummary(null);

    try {
      const result = await onUpload(file);
      setSummary(result);
    } catch (err) {
      setSummary({ totalImported: 0, totalFailed: 1, errors: [{ row: 'Upload Error', reason: err.message || 'Unknown error occurred during upload.' }] });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 1, textAlign: 'right' }}>
        <Link href={templateHref} download={templateName} sx={{ fontSize: '13px', color: '#0F7A5C', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          Download template
        </Link>
      </Box>
      
      <Box
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        sx={{
          border: '1px dashed #C8C6BC', // hairline dashed
          borderRadius: '4px',
          bgcolor: isDragging ? '#F6F4EF' : '#fff',
          p: 4,
          textAlign: 'center',
          cursor: isUploading ? 'default' : 'pointer',
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: !isUploading && '#F6F4EF'
          }
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".csv, .xlsx, .pdf, .doc, .docx"
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <Stack spacing={2} alignItems="center" justifyContent="center">
            <CircularProgress size={32} sx={{ color: '#0F7A5C' }} />
            <Typography sx={{ color: '#6B6A62', fontSize: '14px' }}>Uploading and processing file...</Typography>
          </Stack>
        ) : (
          <Stack spacing={1} alignItems="center" justifyContent="center">
            <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: '#6B6A62' }} />
            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, color: '#16201C' }}>
              Click or drag file to this area to upload
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#6B6A62' }}>
              Support for .csv, .xlsx, .pdf, or .docx file upload.
            </Typography>
          </Stack>
        )}
      </Box>

      {summary && <ImportResultSummary summary={summary} />}
    </Box>
  );
};

export default BulkImportDropzone;
