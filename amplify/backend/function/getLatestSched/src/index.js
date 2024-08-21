const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

const dynamoClient = new DynamoDBClient({ region: "us-west-2" });

exports.handler = async (event) => {
    const { folderName } = event.queryStringParameters;

    try {
        const params = {
            TableName: 'saved-scheds',
            FilterExpression: "folderName = :folderName",
            ExpressionAttributeValues: {
                ":folderName": { S: folderName }
            },
            ScanIndexForward: false // Sorts in descending order
        };

        const data = await dynamoClient.send(new ScanCommand(params));

        if (data.Items && data.Items.length > 0) {
            // Assuming that the scan returned multiple items, sort by the most recent savedAt date
            const latestItem = data.Items.reduce((prev, current) => {
                return (prev.savedAt.S > current.savedAt.S) ? prev : current;
            });

            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({
                    scheduleName: latestItem.scheduleName.S,
                    schedule: JSON.parse(latestItem.schedule.S),
                    savedAt: latestItem.savedAt.S,
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
