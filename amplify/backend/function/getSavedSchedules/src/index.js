const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-west-2" });

exports.handler = async (event) => {
    try {
        const params = {
            TableName: "saved-scheds",
        };

        const data = await client.send(new ScanCommand(params));
        console.log('Scan result:', data); // Log scan result

        if (!data.Items) {
            throw new Error("No data found");
        }

        const schedules = data.Items.map(item => ({
            scheduleName: item.scheduleName.S,
            schedule: item.schedule.S
        }));

        console.log('Schedules:', schedules); // Log schedules for debugging

        return {
            statusCode: 200,
            body: JSON.stringify({ schedules }),
        };
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not fetch schedules" }),
        };
    }
};
