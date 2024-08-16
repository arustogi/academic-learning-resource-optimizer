const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");

const dynamoClient = new DynamoDBClient({ region: "us-west-2" });

exports.handler = async (event) => {
    const { folderName } = event.queryStringParameters;

    try {
        const params = {
            TableName: 'saved-scheds',
            KeyConditionExpression: "folderName = :folderName",
            ExpressionAttributeValues: {
                ":folderName": { S: folderName }
            },
            ScanIndexForward: false, // Sorts in descending order
            Limit: 1 // Get the most recent item
        };

        const data = await dynamoClient.send(new QueryCommand(params));

        if (data.Items && data.Items.length > 0) {
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({
                    scheduleName: data.Items[0].scheduleName.S,
                    schedule: JSON.parse(data.Items[0].schedule.S),
                    savedAt: data.Items[0].savedAt.S,
                }),
            };
        } else {
            return {
                statusCode: 404,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({ message: "No schedules found." }),
            };
        }
    } catch (error) {
        console.error("Error retrieving the latest schedule:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
};
