import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const GenerateSchedule = ({ apiUrl, setOutput }) => {
  const [folderName, setFolderName] = useState('');
  const [scheduleName, setScheduleName] = useState('');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!folderName || !scheduleName) {
      setMessage('Please enter both a folder name and a schedule name.');
      return;
    }

    try {
      console.log('Sending request to API...');
      const response = await axios.post(`${apiUrl}/generateSchedule`, { folderName, scheduleName });
      console.log('Raw API Response:', response.data);

      // Parse the JSON string in the body
      const parsedBody = JSON.parse(response.data.body);
      console.log('Parsed Body:', parsedBody);
      const rawSchedule = parsedBody.schedule;
      const jsonMatch = rawSchedule.match(/```json\s+({[\s\S]*})\s+```/);

      if (!jsonMatch) {
        throw new Error("Failed to extract JSON from the response");
      }

      const cleanSchedule = jsonMatch[1]; 
      console.log('Extracted JSON:', cleanSchedule);
      const scheduleObject = JSON.parse(cleanSchedule);
      console.log('Parsed Schedule Object:', scheduleObject);
      setSchedule(scheduleObject); 
      setMessage('Schedule generated successfully.');
      setOutput(cleanSchedule);

    } catch (error) {
      console.error('Error generating schedule:', error);
      setMessage('Error generating schedule.');
      setOutput('Error generating schedule.');
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
      {schedule && (
        <Table style={{ marginTop: '16px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Day</TableCell>
              <TableCell>Tasks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(schedule).map(([day, tasks], index) => (
              <TableRow key={index}>
                <TableCell>{day}</TableCell>
                <TableCell>
                  <ul>
                    {tasks.map((task, taskIndex) => (
                      <li key={taskIndex}>{task}</li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default GenerateSchedule;
