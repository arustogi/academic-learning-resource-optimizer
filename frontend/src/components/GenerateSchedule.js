import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ff4081',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    subtitle1: {
      color: '#757575',
    },
    body1: {
      color: '#333',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

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
    <ThemeProvider theme={theme}>
      <Card style={{ maxWidth: 600, margin: '20px auto', padding: '20px' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Generate Study Schedule
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Fill in the details to generate your custom study schedule.
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Folder Name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              label="Schedule Name"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            <CardActions style={{ justifyContent: 'center' }}>
              <Button type="submit" variant="contained" color="primary" style={{ marginTop: '16px', padding: '10px 20px' }}>
                Generate Schedule
              </Button>
            </CardActions>
          </form>
          {message && <Typography variant="body1" color="textSecondary" style={{ marginTop: '16px' }}>{message}</Typography>}
          {isLoading && <CircularProgress style={{ marginTop: '16px' }} />}
          {schedule && (
            <Paper style={{ marginTop: '16px', padding: '20px', backgroundColor: '#f4f6f8' }}>
              <Typography variant="h6" gutterBottom>
                Generated Schedule
              </Typography>
              <div dangerouslySetInnerHTML={{ __html: schedule }} />
            </Paper>
          )}
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

export default GenerateSchedule;
