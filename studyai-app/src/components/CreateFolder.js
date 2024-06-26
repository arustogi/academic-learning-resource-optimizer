import React, { useState } from 'react';
import axios from 'axios';

const CreateFolder = ({ apiUrl, setOutput }) => {
    const [folderName, setFolderName] = useState('');

    const handleCreateFolder = async () => {
        if (!folderName) {
            alert('Please enter a folder name');
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/createFolder`, { folderName });

            if (response && response.data) {
                setOutput(`Folder '${folderName}' created successfully.`);
            } else {
                setOutput('Error: No response data');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setOutput(`Error: ${error.response.data.message}`);
            } else {
                setOutput(`Error: ${error.message}`);
            }
        }
    };

    return (
        <div>
            <h2>Create Folder</h2>
            <input type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Folder Name" />
            <button onClick={handleCreateFolder}>Create Folder</button>
        </div>
    );
};

export default CreateFolder;
