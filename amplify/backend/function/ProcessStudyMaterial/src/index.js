import { DynamoDB } from 'aws-sdk';
const docClient = new DynamoDB.DocumentClient();
import { v4 as uuidv4 } from 'uuid'; // to generate unique documentId

export async function handler(event) {
    console.log("Received event:", JSON.stringify(event, null, 2));
    
    let response;
    try {
        const { documentContent } = JSON.parse(event.body);

        if (!documentContent) {
            response = {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing document content" }),
            };
            console.log("Missing document content:", response);
            return response;
        }

        const params = {
            TableName: 'studyMaterial', // Correct DynamoDB table name
            Item: {
                documentId: uuidv4(), // Unique document identifier
                documentContent,
                uploadedAt: new Date().toISOString()
            }
        };

        console.log("Params to be inserted:", params);

        await docClient.put(params).promise();
        response = {
            statusCode: 200,
            body: JSON.stringify({ message: "Document uploaded successfully" }),
        };
        console.log("Document uploaded successfully:", response);
    } catch (error) {
        console.error("Error uploading document:", error);
        response = {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error }),
        };
    }
    return response;
}
