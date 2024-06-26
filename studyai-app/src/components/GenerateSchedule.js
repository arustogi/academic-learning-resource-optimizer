import React, { useState } from 'react';
import axios from 'axios';

const GenerateSchedule = ({ apiUrl, setOutput }) => {
    const [endDate, setEndDate] = useState('');
    const [folderName, setFolderName] = useState('');

    const handleGenerateSchedule = async () => {
        if (!endDate || !folderName) {
            alert('Please enter all fields');
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/generateSchedule`, { endDate, folderName });
            setOutput(JSON.stringify(response.data, null, 2));
        } catch (error) {
            setOutput(JSON.stringify(error.response.data, null, 2));
        }
    };

    return (
        <div>
            <h2>Generate Study Schedule</h2>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <input type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Folder Name" />
            <button onClick={handleGenerateSchedule}>Generate Schedule</button>
        </div>
    );
};

export default GenerateSchedule;
