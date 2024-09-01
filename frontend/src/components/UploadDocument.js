import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Paper } from '@mui/material';

const UploadDocument = ({ apiUrl, setOutput }) => {
  const [documentTitle, setDocumentTitle] = useState('');
  const [file, setFile] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentTitle || !file || !folderName) {
      setMessage('Please fill in all fields and select a file.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64File = reader.result.split(',')[1];
      const fileType = file.type;

      try {
        await axios.post(`${apiUrl}/uploadDocument`, { 
          documentTitle,
          documentContent: base64File,
          fileType,
          fileName: file.name,
          folderName
        });
        setMessage('Document uploaded successfully.');
        setOutput('Document uploaded successfully.');
      } catch (error) {
        setMessage('Error uploading document.');
        setOutput('Error uploading document.');
      }
    };
  };

  return (
    <Paper style={{ padding: '20px', marginTop: '20px' }}>
      <Typography variant="h5" gutterBottom style={{ color: '#3f51b5' }}>
        Upload Document
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Document Title"
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Folder Name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <input type="file" onChange={handleFileChange} style={{ marginTop: '20px', marginBottom: '20px' }} />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Upload
        </Button>
      </form>
      {message && <Typography variant="body1" color="textSecondary" style={{ marginTop: '16px' }}>{message}</Typography>}
    </Paper>
  );
};

export default UploadDocument;
