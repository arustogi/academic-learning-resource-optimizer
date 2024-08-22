import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import UploadDocument from './components/UploadDocument';
import CreateFolder from './components/CreateFolder';
import GenerateSchedule from './components/GenerateSchedule';
import { CssBaseline, Container, Typography, Paper } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// New Theme with custom colors
const theme = createTheme({
    palette: {
        primary: {
            main: '#1a73e8', // Custom blue
        },
        secondary: {
            main: '#ff5252', // Accent color
        },
        background: {
            default: '#f5f7fa',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h2: {
            fontWeight: '700',
        },
        h4: {
            fontWeight: '600',
            color: '#1a73e8',
        },
        h6: {
            color: '#616161',
        },
        body1: {
            color: '#424242',
        },
    },
    shape: {
        borderRadius: 12,
    },
});

const App = () => {
    const [output, setOutput] = useState('');
    const apiUrl = 'https://9cfdj03mjb.execute-api.us-west-2.amazonaws.com/dev';

    return (
        <ThemeProvider theme={theme}>
            <Router>
                <CssBaseline />
                <NavBar />
                <Container maxWidth="md" style={{ marginTop: '40px', textAlign: 'center' }}>
                    <Typography variant="h2" gutterBottom>
                        StudyHub
                    </Typography>
                    <Typography variant="h6" gutterBottom style={{ marginBottom: '40px' }}>
                        Organize your study materials and generate personalized study schedules.
                    </Typography>
                    <Paper elevation={3} style={{ padding: '30px', marginBottom: '40px', backgroundColor: '#ffffff' }}>
                        <Routes>
                            <Route path="/upload" element={<UploadDocument apiUrl={apiUrl} setOutput={setOutput} />} />
                            <Route path="/create-folder" element={<CreateFolder apiUrl={apiUrl} setOutput={setOutput} />} />
                            <Route path="/generate-schedule" element={<GenerateSchedule apiUrl={apiUrl} setOutput={setOutput} />} />
                            <Route path="/" element={<UploadDocument apiUrl={apiUrl} setOutput={setOutput} />} />
                        </Routes>
                    </Paper>
                    <Typography variant="h4" gutterBottom>
                        Latest Output
                    </Typography>
                    <Paper elevation={2} style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
                        <Typography id="output" variant="body1">
                            {output || 'No output generated yet.'}
                        </Typography>
                    </Paper>
                </Container>
            </Router>
        </ThemeProvider>
    );
};

export default App;
