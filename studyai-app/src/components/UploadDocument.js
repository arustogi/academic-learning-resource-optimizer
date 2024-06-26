import React, { useState } from 'react';
import axios from 'axios';

const UploadDocument = ({ apiUrl, setOutput }) => {
    const [documentTitle, setDocumentTitle] = useState('');
    const [file, setFile] = useState(null);
    const [folderName, setFolderName] = useState('');

    const handleUploadDocument = async () => {
        if (!documentTitle || !file || !folderName) {
            alert('Please enter all fields');
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            const base64File = reader.result.split(',')[1];
            const fileType = file.type || 'application/octet-stream';
            const fileName = file.name;

            try {
                const response = await axios.post(`${apiUrl}/uploadDocument`, {
                    documentTitle,
                    documentContent: base64File,
                    fileType,
                    fileName,
                    folderName
                });

                if (response && response.data) {
                    setOutput(JSON.stringify(response.data, null, 2));
                } else {
                    setOutput('Error: No response data');
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    setOutput(JSON.stringify(error.response.data, null, 2));
                } else {
                    setOutput(`Error: ${error.message}`);
                }
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <h2>Upload Document</h2>
            <input type="text" value={documentTitle} onChange={(e) => setDocumentTitle(e.target.value)} placeholder="Document Title" />
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <input type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Folder Name" />
            <button onClick={handleUploadDocument}>Upload Document</button>
        </div>
    );
};

export default UploadDocument;
