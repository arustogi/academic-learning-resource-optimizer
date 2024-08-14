import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Ensure correct imports
import NavBar from './components/NavBar';
import UploadDocument from './components/UploadDocument';
import CreateFolder from './components/CreateFolder';
import GenerateSchedule from './components/GenerateSchedule';
import { CssBaseline, Container, Typography } from '@mui/material';

const App = () => {
    const [output, setOutput] = useState('');
    const apiUrl = 'https://9cfdj03mjb.execute-api.us-west-2.amazonaws.com/dev';  

    return (
        <Router>  {/* Wrap your entire app in Router */}
            <CssBaseline />
            <NavBar />
            <Container maxWidth="md" style={{ marginTop: '40px', textAlign: 'center' }}>
                <Typography variant="h2" gutterBottom style={{ fontWeight: 'bold', color: '#3f51b5' }}>
                    Study Material Manager
                </Typography>
                <Typography variant="h6" gutterBottom style={{ marginBottom: '40px', color: '#757575' }}>
                    Organize your study materials, upload documents, and generate personalized study schedules.
                </Typography>
                <Routes>
                    <Route path="/upload" element={<UploadDocument apiUrl={apiUrl} setOutput={setOutput} />} />
                    <Route path="/create-folder" element={<CreateFolder apiUrl={apiUrl} setOutput={setOutput} />} />
                    <Route path="/generate-schedule" element={<GenerateSchedule apiUrl={apiUrl} setOutput={setOutput} />} />
                    <Route path="/" element={<UploadDocument apiUrl={apiUrl} setOutput={setOutput} />} />
                </Routes>
                <Typography variant="h4" gutterBottom style={{ marginTop: '40px', color: '#3f51b5' }}>
                    Output
                </Typography>
                <Typography id="output" variant="body1" style={{ color: '#616161', background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                    {output}
                </Typography>
            </Container>
        </Router> 
    );
};

export default App;
