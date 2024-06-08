const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: "us-west-2" }); // Specify your region

exports.handler = async (event) => {
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
            TableName: 'studyMaterial-dev', // Correct DynamoDB table name
            Item: {
                id: { S: uuidv4() }, // Unique document identifier, assuming 'id' is the primary key
                documentContent: { S: documentContent },
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
