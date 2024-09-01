import React, { useState } from 'react';
import axios from 'axios';
import {  TextField, Button, Typography, Paper } from '@mui/material';

const CreateFolder = ({ apiUrl, setOutput }) => {
  const [folderName, setFolderName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName) {
      setMessage('Please enter a folder name.');
      return;
    }

    try {
      await axios.post(`${apiUrl}/createFolder`, { folderName }); 
      setMessage('Folder created successfully.');
      setOutput('Folder created successfully.');
    } catch (error) {
      setMessage('Error creating folder.');
      setOutput('Error creating folder.');
    }
  };

  return (
    <Paper style={{ padding: '20px', marginTop: '20px' }}>
      <Typography variant="h5" gutterBottom style={{ color: '#3f51b5' }}>
        Create Folder
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Folder Name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '16px' }}>
          Create Folder
        </Button>
      </form>
      {message && <Typography variant="body1" color="textSecondary" style={{ marginTop: '16px' }}>{message}</Typography>}
    </Paper>
  );
};

export default CreateFolder;
