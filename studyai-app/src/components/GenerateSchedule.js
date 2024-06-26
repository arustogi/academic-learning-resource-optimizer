import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const GenerateSchedule = ({ apiUrl, setOutput }) => {
    const [endDate, setEndDate] = useState('');
    const [folderName, setFolderName] = useState('');

    const handleGenerateSchedule = async () => {
        if (!endDate || !folderName) {
            alert('Please enter all fields');
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/generateSchedule`, { endDate, folderName }, { timeout: 60000 });

            if (response && response.data) {
                console.log('Full response data:', response.data); // Added for full response debugging
                
                // Parse the response data to get the schedule
                const parsedResponse = JSON.parse(response.data.body);
                const schedule = parsedResponse.schedule || parsedResponse;

                console.log('Parsed Schedule:', schedule); // Log the parsed schedule for debugging

                if (typeof schedule === 'string') {
                    formatAndSetOutput(schedule);
                } else if (Array.isArray(schedule)) {
                    formatAndSetOutput(schedule.join('\n'));
                } else {
                    setOutput('Error: Schedule is in an unexpected format');
                    console.log('Unexpected schedule format:', JSON.stringify(schedule, null, 2));
                }
            } else {
                setOutput('Error: No response data');
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
            if (error.response && error.response.data) {
                setOutput(`Error: ${error.response.data.message}`);
                console.log('Error response data:', JSON.stringify(error.response.data, null, 2)); // Log the error response data
            } else {
                setOutput(`Error: ${error.message}`);
            }
        }
    };

    const formatAndSetOutput = (schedule) => {
        try {
            console.log('Formatting schedule:', schedule); // Log the schedule before formatting

            const formattedSchedule = schedule.split('\n').map((line) => {
                if (line.startsWith('Week')) {
                    return `### ${line}`;
                } else if (line.trim()) {
                    return `- ${line}`;
                }
                return line;
            }).join('\n');

            setOutput(<ReactMarkdown>{formattedSchedule}</ReactMarkdown>);
        } catch (error) {
            console.error('Error formatting schedule:', error);
            setOutput('Error: Could not format the schedule properly');
        }
    };

    return (
        <div>
            <h2>Generate Study Schedule</h2>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" />
            <input type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Folder Name" />
            <button onClick={handleGenerateSchedule}>Generate Schedule</button>
        </div>
    );
};

export default GenerateSchedule;
