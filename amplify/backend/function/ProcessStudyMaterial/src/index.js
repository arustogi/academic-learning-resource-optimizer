const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: "us-west-2" });

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));
    
    let response;
    try {
        const { documentTitle, documentContent, fileType, fileName } = JSON.parse(event.body);

        if (!documentTitle || !documentContent) {
            response = {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing document title or content" }),
            };
            console.log("Missing document title or content:", response);
            return response;
        }

        const params = {
            TableName: 'studyMaterial-dev', 
            Item: {
                id: { S: uuidv4() },
                documentTitle: { S: documentTitle },
                documentContent: { B: Buffer.from(documentContent, 'base64') },
                fileType: { S: fileType },
                fileName: { S: fileName },
                uploadedAt: { S: new Date().toISOString() }
            }
        };

        console.log("Params to be inserted:", params);

        const command = new PutItemCommand(params);
        await client.send(command);

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
};
