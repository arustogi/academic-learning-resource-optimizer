const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({ region: "us-west-2" });

const BUCKET_NAME = "study-material-bucket"; // Replace with your S3 bucket name

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
        console.log("Event body before parsing:", event.body);
        
        if (typeof event.body !== 'string') {
            throw new Error(`Expected event.body to be a string, but received: ${typeof event.body}`);
        }

        const body = JSON.parse(event.body);
        console.log("Parsed body:", body);

        const { folderName } = body;

        if (!folderName) {
            console.log("Missing folder name");
            response = {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({ message: "Missing folder name" }),
            };
            console.log("Response:", response);
            return response;
        }

        const folderKey = `${folderName}/`;

        // Create a folder by uploading a zero-byte object
        const s3Params = {
            Bucket: BUCKET_NAME,
            Key: folderKey,
            Body: "",
        };

        console.log("Params for S3 folder creation:", s3Params);

        const s3Command = new PutObjectCommand(s3Params);
        await s3Client.send(s3Command);

        response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ message: "Folder created successfully" }),
        };
        console.log("Folder created successfully:", response);
    } catch (error) {
        console.error("Error creating folder:", error);
        response = {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
    return response;
};
