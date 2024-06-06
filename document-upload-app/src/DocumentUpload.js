import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { get } from '@aws-amplify/api-rest';
import awsExports from './aws-exports';
import { TextField, Button, View, Alert } from '@aws-amplify/ui-react';

Amplify.configure(awsExports);

function DocumentUpload() {
    const [documentTitle, setDocumentTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadStatus(''); // Clear status on new file selection
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            console.error("No file selected");
            setUploadStatus('No file selected');
            return;
        }

        if (!documentTitle) {
            console.error("No document title provided");
            setUploadStatus('Please provide a document title');
            return;
        }

        try {
            const fileContent = await selectedFile.text(); // Read file content
            const restOperation = get({
                apiName: 'storeDocs', // Replace with your API name
                path: '/uploadDocument',
                init: {
                    body: {
                        userId: 'user123',
                        documentTitle,
                        documentContent: fileContent
                    }
                }
            });
            const { body } = await restOperation.response;
            const response = await body.json();
            console.log(response);
            setUploadStatus('Document Uploaded');
        } catch (error) {
            console.error("Error uploading document:", error);
            setUploadStatus(`Error uploading document: ${error.message}`);
        }
    };

    return (
        <View>
            <TextField
                label="Document Title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Document Title"
            />
            <input type="file" onChange={handleFileChange} />
            <Button onClick={handleUpload}>Upload Document</Button>
            {uploadStatus && <Alert variation={uploadStatus.startsWith('Error') ? 'error' : 'success'}>{uploadStatus}</Alert>}
        </View>
    );
}

export default DocumentUpload;
