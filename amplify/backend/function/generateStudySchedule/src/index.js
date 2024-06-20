const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const axios = require('axios');

const dynamoClient = new DynamoDBClient({ region: "us-west-2" });
const s3Client = new S3Client({ region: "us-west-2" });

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        console.log("Handling OPTIONS request");
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
        try {
            requestBody = JSON.parse(event.body);
        } catch (e) {
            console.error("Invalid JSON input in event body", e);
            throw new Error("Invalid JSON input in event body");
        }

        console.log("Parsed requestBody:", requestBody);

        let bodyContent;
        if (requestBody.body) {
            try {
                bodyContent = JSON.parse(requestBody.body);
            } catch (e) {
                console.error("Invalid JSON input in body field", e);
                throw new Error("Invalid JSON input in body field");
            }
        } else {
            bodyContent = requestBody;
        }

        console.log("Parsed bodyContent:", bodyContent);

        const { endDate } = bodyContent;
        if (!endDate) {
            throw new Error("Missing endDate");
        }

        const params = {
            TableName: 'studyMaterial-dev'
        };

        const command = new ScanCommand(params);
        const data = await dynamoClient.send(command);

        if (data.Items) {
            let documentSummaries = [];
            for (const item of data.Items) {
                const s3Url = item.s3Url.S;
                const documentContent = await fetchS3Content(s3Url);
                const documentSummary = await summarizeDocument(documentContent);
                documentSummaries.push(documentSummary);
            }

            const detailedSchedule = await generateStudySchedule(documentSummaries, endDate);
            response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST"
                },
                body: JSON.stringify({ message: "Study schedule created successfully", schedule: detailedSchedule }),
            };
        } else {
            response = {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST"
                },
                body: JSON.stringify({ message: "No documents found" }),
            };
        }
    } catch (error) {
        console.error("Error processing documents:", error);
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

async function fetchS3Content(s3Url) {
    const bucketName = s3Url.split(".s3.amazonaws.com/")[0].split("//")[1];
    const key = s3Url.split(".s3.amazonaws.com/")[1];

    const params = {
        Bucket: bucketName,
        Key: key
    };

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    const stream = response.Body;

    return await streamToString(stream);
}

async function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
}

async function summarizeDocument(documentContent) {
    const OPENAI_API_KEY =;
    if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const prompt = `You are an AI assistant tasked with analyzing study materials. Given the following content:\n\n${documentContent}\n\nPlease summarize the key points and topics that should be focused on for improvement.`;

    try {
        const response = await axios.post(apiUrl, {
            model: "gpt-4",  // Using GPT-4
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

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error calling OpenAI API:", error.response?.data || error.message);
        throw new Error("Failed to summarize document");
    }
}

async function generateStudySchedule(documentSummaries, endDate) {
    const OPENAI_API_KEY = ;
    if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY environment variable is not set yet");
    }

    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const prompt = `You are an AI assistant tasked with creating a detailed study schedule. Given the following summaries of study materials:\n\n${documentSummaries.join("\n\n")}\n\nPlease generate a study schedule to be completed by ${endDate}, with a focus on the areas needing the most improvement.`;

    try {
        const response = await axios.post(apiUrl, {
            model: "gpt-4",  // Using GPT-4
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
