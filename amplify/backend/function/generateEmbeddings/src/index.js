
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const axios = require('axios');

const dynamoClient = new DynamoDBClient({ region: "us-west-2" });

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    try {
        const { folderName, documentID, documentContent } = event;

        if (!folderName || !documentID || !documentContent) {
            throw new Error("Missing required parameters: folderName, documentId, or documentContent");
        }

        // Generate embeddings for the document
        const embeddings = await generateEmbeddings(documentContent);

        // Check if embeddings are correctly generated
        if (!embeddings || !Array.isArray(embeddings) || embeddings.length === 0) {
            throw new Error("Embeddings were not generated correctly");
        }

        console.log("Embeddings generated:", embeddings);

        // Store embeddings in DynamoDB
        const params = {
            TableName: 'studyMaterialEmbeddings',
            Item: {
                folderName: { S: folderName },
                documentID: { S: documentID },
                embeddings: { S: JSON.stringify(embeddings) }
            }
        };

        console.log("DynamoDB PutItem parameters:", params);

        await dynamoClient.send(new PutItemCommand(params));

        return { statusCode: 200, body: 'Embeddings generated and stored successfully' };
    } catch (error) {
        console.error("Error processing event", error);
        return { statusCode: 500, body: `Internal server error: ${error.message}` };
    }
};

async function generateEmbeddings(documentContent) {
    const OPENAI_API_KEY = ''
    const apiUrl = 'https://api.openai.com/v1/embeddings';

    try {
        const response = await axios.post(apiUrl, {
            model: "text-embedding-ada-002",
            input: documentContent
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("OpenAI API response:", response.data);

        if (response.data && response.data.data && response.data.data[0] && response.data.data[0].embedding) {
            return response.data.data[0].embedding;
        } else {
            throw new Error("Invalid response format from OpenAI API");
        }
    } catch (error) {
        console.error("Error generating embeddings", error);
        throw new Error("Failed to generate embeddings");
    }
}

   