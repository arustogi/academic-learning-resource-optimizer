import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static" style={{ backgroundColor: '#3f51b5' }}>
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1, fontWeight: 'bold' }}>
          StudyHub
        </Typography>
        <Button color="inherit" component={Link} to="/upload">Upload Document</Button>
        <Button color="inherit" component={Link} to="/create-folder">Create Folder</Button>
        <Button color="inherit" component={Link} to="/generate-schedule">Generate Schedule</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
