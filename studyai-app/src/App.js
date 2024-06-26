import React, { useState } from 'react';
import CreateFolder from './components/CreateFolder';
import UploadDocument from './components/UploadDocument';
import GenerateSchedule from './components/GenerateSchedule';

const App = () => {
    const [output, setOutput] = useState('');
    const apiUrl = 'https://9cfdj03mjb.execute-api.us-west-2.amazonaws.com/dev';  // Replace with your API Gateway endpoint

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
            <h1>Study Material Manager</h1>
            <CreateFolder apiUrl={apiUrl} setOutput={setOutput} />
            <UploadDocument apiUrl={apiUrl} setOutput={setOutput} />
            <GenerateSchedule apiUrl={apiUrl} setOutput={setOutput} />
            <h2>Output</h2>
            <textarea rows="10" value={output} readOnly style={{ width: '100%', margin: '10px 0', padding: '10px', boxSizing: 'border-box' }}></textarea>
        </div>
    );
};

export default App;
