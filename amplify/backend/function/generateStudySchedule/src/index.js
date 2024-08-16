const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

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
            requestBody = event;
            console.log("Using event directly as requestBody:", requestBody);
        }

        const { folderName, scheduleName } = requestBody;
        if (!folderName || !scheduleName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing folderName or scheduleName" }),
            };
        }

        
        const asyncInvokeParams = {
            FunctionName: "generateStudyScheduleWorker-dev", 
            InvocationType: "Event", 
            Payload: JSON.stringify({ folderName, scheduleName })
        };

        await lambda.invoke(asyncInvokeParams).promise();

        // Immediately return a response indicating that the process has started
        response = {
            statusCode: 202,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({ message: "Schedule generation process started." }),
        };

    } catch (error) {
        console.error("Error starting schedule generation:", error);
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
