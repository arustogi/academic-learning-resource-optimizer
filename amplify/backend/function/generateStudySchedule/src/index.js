const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const axios = require('axios');

const client = new DynamoDBClient({ region: "us-west-2" });

exports.handler = async (event) => {
    let response;
    try {
        const { endDate } = JSON.parse(event.body);
        const params = {
            TableName: 'studyMaterial-dev'
        };

        const command = new ScanCommand(params);
        const data = await client.send(command);

        if (data.Items) {
            let summarizedDocuments = [];
            for (const item of data.Items) {
                const documentContent = item.documentContent.S;
                summarizedDocuments.push(documentContent);
            }

            const documents = summarizedDocuments.join("\n");
            const openAIResponse = await generateStudySchedule(documents, endDate);
            response = {
                statusCode: 200,
                body: JSON.stringify({ message: "Study schedule created successfully", schedule: openAIResponse }),
            };
        } else {
            response = {
                statusCode: 404,
                body: JSON.stringify({ message: "No documents found" }),
            };
        }
    } catch (error) {
        console.error("Error processing documents:", error);
        response = {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
    return response;
};

async function generateStudySchedule(documents, endDate) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const prompt = `You are an AI assistant tasked with creating a study schedule. Given the following study materials:\n\n${documents}\n\nPlease generate a study schedule to be completed by ${endDate}.`;

    try {
        const response = await axios.post(apiUrl, {
            model: "gpt-3.5-turbo",
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
