const { DynamoDBClient, GetItemCommand, ScanCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const axios = require('axios');

const dynamoClient = new DynamoDBClient({ region: "us-west-2" });

exports.handler = async (event) => {
    const { folderName, scheduleName } = event;

    try {
        const deadlines = await fetchDeadlines(folderName);
        const embeddings = await fetchEmbeddings(folderName);
        const detailedSchedule = await generateSchedule(embeddings, deadlines);

        await saveScheduleToDynamoDB(scheduleName, folderName, detailedSchedule);

        console.log("Study schedule generated and saved successfully.");
        response = {
            statusCode: 200,
            body: JSON.stringify({ message: "Study schedule created successfully", schedule: detailedSchedule }),
        };
    } catch (error) {
        console.error("Error generating or saving study schedule:", error);
        response = {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
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
        if (!item.documentID || !item.embeddings) {
            console.warn("Item missing expected attributes:", JSON.stringify(item, null, 2));
            return null;
        }

        try {
            const embeddings = JSON.parse(item.embeddings.S); 
            return {
                documentID: item.documentID.S,
                embeddings: embeddings
            };
        } catch (error) {
            console.error("Error parsing embeddings for item:", JSON.stringify(item, null, 2));
            throw new Error("Failed to parse embeddings data");
        }
    }).filter(item => item !== null);
}



async function generateSchedule(embeddings, deadlines) {

    console.log("Embeddings passed to OpenAI:", JSON.stringify(embeddings));
    console.log("Deadlines passed to OpenAI:", JSON.stringify(deadlines));
    const chunkSize = 4000; 
    const chunks = [];
    for (let i = 0; i < embeddings.length; i += chunkSize) {
        chunks.push(embeddings.slice(i, i + chunkSize));
    }

    let completeSchedule = "";

    const OPENAI_API_KEY = '';
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const prompt =  `You are an AI assistant tasked with creating a detailed study schedule. Below are embeddings of the study materials that capture their content and relevance. Your task is to generate a study schedule that not only meets the deadlines but also accurately references real materials represented by these embeddings.

    The embeddings provided are based on the actual content of the study materials. Therefore, when creating the study schedule, cite the specific materials (e.g., chapters, notes, problem sets) based on the content represented by these embeddings. Do not generate fictional or generic materials. Only reference actual content that these embeddings represent.
    
    Here are the deadlines extracted:\n\n${JSON.stringify(deadlines)}
    
    And here are the embeddings:\n\n${JSON.stringify(embeddings)}
    
    Please generate the study schedule in JSON format, where each day includes tasks and the relevant materials to be used.`;

    try {
        const response = await axios.post(apiUrl, {
            model: "gpt-4o",
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
        completeSchedule += response.data.choices[0].message.content.trim() + "\n";
        
    } catch (error) {
        console.error("Error calling OpenAI API:", error.response?.data || error.message);
        throw new Error("Failed to generate study schedule");
    }
    return completeSchedule.trim();
}

async function saveScheduleToDynamoDB(scheduleName, folderName, schedule) {
    const params = {
        TableName: 'saved-scheds',
        Item: {
            ID: { S: `${scheduleName}-${folderName}` }, 
            scheduleName: { S: scheduleName },
            folderName: { S: folderName },
            schedule: { S: JSON.stringify(schedule) }, 
            savedAt: { S: new Date().toISOString() }
        }
    };

    try {
        const command = new PutItemCommand(params);
        await dynamoClient.send(command);
        console.log("Study schedule saved to DynamoDB:", params);
    } catch (error) {
        console.error("Error saving study schedule to DynamoDB:", error);
        throw new Error("Failed to save study schedule to DynamoDB");
    }
}
