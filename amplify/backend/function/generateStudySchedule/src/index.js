const { DynamoDBClient, GetItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const axios = require('axios');

const dynamoClient = new DynamoDBClient({ region: "us-west-2" });
exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST",
            },
            body: JSON.stringify({}),
        };
    }

    let response;
    try {
        let requestBody;
        if (event.body) {
            // Case when event has a body field, typically from API Gateway
            try {
                requestBody = JSON.parse(event.body);
                console.log("Parsed requestBody from body:", requestBody);
            } catch (error) {
                console.error("Invalid JSON input in event body", error);
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "Invalid JSON input in event body" }),
                };
            }
        } else {
            // Direct invocation or test event case
            requestBody = event;
            console.log("Using event directly as requestBody:", requestBody);
        }

        const { folderName } = requestBody;
        if (!folderName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing folderName" }),
            };
        }

        const deadlines = await fetchDeadlines(folderName);
        const embeddings = await fetchEmbeddings(folderName);
        const detailedSchedule = await generateStudySchedule(embeddings, deadlines);

        response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({ message: "Study schedule created successfully", schedule: detailedSchedule }),
        };

    } catch (error) {
        console.error("Error processing request:", error);
        response = {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }

    return response;
};




async function fetchDeadlines(folderName) {
    const params = {
        TableName: 'studyMaterialDeadlines',
        Key: { folderName: { S: folderName } }
    };
    const result = await dynamoClient.send(new GetItemCommand(params));

    if (!result.Item || !result.Item.deadlines) {
        throw new Error('No deadlines found for the provided folderName.');
    }

    return JSON.parse(result.Item.deadlines.S);
}

async function fetchEmbeddings(folderName) {
    const params = {
        TableName: 'studyMaterialEmbeddings',
        FilterExpression: "folderName = :folderName",
        ExpressionAttributeValues: {
            ":folderName": { S: folderName }
        }
    };
    const command = new ScanCommand(params);
    const data = await dynamoClient.send(command);

    if (!data.Items || data.Items.length === 0) {
        console.error("No items found for folderName:", folderName);
        throw new Error(`No embeddings found for folderName: ${folderName}`);
    }

    return data.Items.map(item => {
        if (!item.documentId || !item.embeddings) {
            console.warn("Item missing expected attributes:", JSON.stringify(item, null, 2));
            return null;
        }

        try {
            return {
                documentId: item.documentId.S,
                embeddings: JSON.parse(item.embeddings.S)
            };
        } catch (error) {
            console.error("Error parsing embeddings for item:", JSON.stringify(item, null, 2));
            throw new Error("Failed to parse embeddings data");
        }
    }).filter(item => item !== null);
}


async function generateStudySchedule(embeddings, deadlines) {
    const OPENAI_API_KEY = "";
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const prompt = `You are an AI assistant tasked with creating a detailed study schedule. Given the following embeddings of study materials and deadlines:\n\n${JSON.stringify(embeddings)}\n\n${JSON.stringify(deadlines)}\n\nPlease generate a study schedule in a tabular format day by day, with a focus on the areas needing the most improvement. The schedule should be organized by week, and each week should include bullet points of tasks to complete. Format it like this:

Week 1:
- bullet 1
- bullet 2

Week 2:
- bullet 1
- bullet 2
`;

    try {
        const response = await axios.post(apiUrl, {
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            max_tokens: 1500,
            n: 1,
            stop: null,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error calling OpenAI API:", error.response?.data || error.message);
        throw new Error("Failed to generate study schedule");
    }
}
