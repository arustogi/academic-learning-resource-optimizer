const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({ region: "us-west-2" });

const BUCKET_NAME = "study-material-bucket"; 

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    let response;
    try {
        const { folderName } = JSON.parse(event.body);

        if (!folderName) {
            response = {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing folder name" }),
            };
            console.log("Missing folder name:", response);
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
            body: JSON.stringify({ message: "Folder created successfully" }),
        };
        console.log("Folder created successfully:", response);
    } catch (error) {
        console.error("Error creating folder:", error);
        response = {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error }),
        };
    }
    return response;
};

