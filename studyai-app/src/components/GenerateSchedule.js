import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';

const GenerateSchedule = ({ apiUrl }) => {
  const [folderName, setFolderName] = useState('');
  const [scheduleName, setScheduleName] = useState('');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!folderName || !scheduleName) {
      setMessage('Please enter both a folder name and a schedule name.');
      return;
    }

    try {
      console.log('Sending request to API...');
      const response = await axios.post(`${apiUrl}/generateSchedule`, { folderName, scheduleName });

      if (response.status === 200) {
        setMessage('Schedule generation process has started. Fetching the latest schedule...');
        setIsLoading(true);
        pollForCompletion(); // Start polling for the latest schedule
      } else {
        setMessage('Unexpected response from the server.');
      }

    } catch (error) {
      console.error('Error starting schedule generation:', error);
      setMessage('Error starting schedule generation.');
    }
  };

  const pollForCompletion = async () => {
    try {
      const response = await axios.get(`${apiUrl}/getLatestSchedule`, {
        params: { folderName }
      });

      if (response.status === 200 && response.data.schedule) {
        setMessage('Schedule generation complete.');
        setSchedule(response.data.schedule); // The schedule is now an HTML string
        setIsLoading(false);
      } else {
        setTimeout(pollForCompletion, 5000);
      }
    } catch (error) {
      console.error('Error polling for completion:', error);
      setMessage('Error polling for completion.');
      setIsLoading(false); 
    }
  };

  return (
    <Paper style={{ padding: '20px', marginTop: '20px' }}>
      <Typography variant="h5" gutterBottom style={{ color: '#3f51b5' }}>
        Generate Schedule
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Folder Name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Schedule Name"
          value={scheduleName}
          onChange={(e) => setScheduleName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '16px' }}>
          Generate Schedule
        </Button>
      </form>
      {message && <Typography variant="body1" color="textSecondary" style={{ marginTop: '16px' }}>{message}</Typography>}
      {isLoading && <CircularProgress style={{ marginTop: '16px' }} />}
      {schedule && (
        <div style={{ marginTop: '16px' }} dangerouslySetInnerHTML={{ __html: schedule }} />
      )}
    </Paper>
  );
};

export default GenerateSchedule;
