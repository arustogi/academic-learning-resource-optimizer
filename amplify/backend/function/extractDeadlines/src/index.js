const { DynamoDBClient, ScanCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const axios = require('axios');

const dynamoClient = new DynamoDBClient({ region: "us-west-2" });

exports.handler = async (event) => {
    const { folderName } = event;

    try {
        const studyMaterials = await fetchStudyMaterials(folderName);
        const deadlines = await parseDeadlinesWithOpenAI(studyMaterials);
        const params = {
            TableName: 'studyMaterialDeadlines',
            Key: { folderName: { S: folderName } },
            UpdateExpression: "set deadlines = :deadlines",
            ExpressionAttributeValues: {
                ":deadlines": { S: JSON.stringify(deadlines) }
            }
        };

        await dynamoClient.send(new UpdateItemCommand(params));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Deadlines extracted and stored successfully' }),
        };
    } catch (error) {
        console.error("Error extracting deadlines:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error', error: error.message }),
        };
    }
};

async function fetchStudyMaterials(folderName) {
    const params = {
        TableName: 'studyMaterial-dev',
        FilterExpression: "folderName = :folderName",
        ExpressionAttributeValues: {
            ":folderName": { S: folderName }
        }
    };

    const command = new ScanCommand(params);
    const data = await dynamoClient.send(command);
    console.log("Data received from DynamoDB:", JSON.stringify(data, null, 2));

    return data.Items.map(item => {
        if (!item.id || !item.id.S || !item.content || !item.content.S) {
            console.warn("Item missing expected attributes:", JSON.stringify(item, null, 2));
            return null;
        }

        return {
            documentId: item.id.S,
            content: item.content.S
        };
    }).filter(item => item !== null); 
}

async function parseDeadlinesWithOpenAI(studyMaterials) {
    const OPENAI_API_KEY = ''
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const deadlines = [];
    for (const material of studyMaterials) {
        const prompt = `You are an AI assistant tasked with extracting deadlines from study materials. Given the following content:\n\n${material.content}\n\nPlease extract any dates and corresponding events mentioned in the content in the form they are in. Be aware that some dates and times maybe parts of the study materials and not relevant to the students timeline`;

        try {
            const response = await axios.post(apiUrl, {
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 500,
                n: 1,
                stop: null,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const extractedDeadlines = response.data.choices[0].message.content.trim();
            deadlines.push({ documentId: material.documentId, deadlines: extractedDeadlines });
        } catch (error) {
            console.error("Error calling OpenAI API:", error.response?.data || error.message);
            throw new Error("Failed to extract deadlines");
        }
    }

    return deadlines;
}