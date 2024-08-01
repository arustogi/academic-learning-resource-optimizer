const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require('uuid');
const dynamoClient = new DynamoDBClient({ region: "us-west-2" });

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));
    
    try {
        // Check if event.body is a string or already parsed
        const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        const { scheduleName, schedule } = requestBody;

        if (!scheduleName || !schedule) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST"
                },
                body: JSON.stringify({ message: "Missing schedule name or schedule content" }),
            };
        }

        const dynamoParams = {
            TableName: 'saved-scheds',
            Item: {
                ID: { S: uuidv4() },  // Ensuring the primary key 'id' is included
                scheduleName: { S: scheduleName },
                schedule: { S: JSON.stringify(schedule) }, // Ensure the schedule is stored as a string
                createdAt: { S: new Date().toISOString() }
            }
        };

        const dynamoCommand = new PutItemCommand(dynamoParams);
        await dynamoClient.send(dynamoCommand);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({ message: "Schedule saved successfully" }),
        };

    } catch (error) {
        console.error("Error saving schedule:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
};
