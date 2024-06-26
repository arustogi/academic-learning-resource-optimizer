import React, { useState } from 'react';
import CreateFolder from './components/CreateFolder';
import UploadDocument from './components/UploadDocument';
import GenerateSchedule from './components/GenerateSchedule';

const App = () => {
    const [output, setOutput] = useState('');
    const apiUrl = 'https://9cfdj03mjb.execute-api.us-west-2.amazonaws.com/dev';  // Replace with your API Gateway endpoint

    return (
      <div className="container">
          <h1>Study Material Manager</h1>
          <CreateFolder apiUrl={apiUrl} setOutput={setOutput} />
          <UploadDocument apiUrl={apiUrl} setOutput={setOutput} />
          <GenerateSchedule apiUrl={apiUrl} setOutput={setOutput} />
          <h2>Output</h2>
          <div id="output">{output}</div>
      </div>
  );
};

export default App;
