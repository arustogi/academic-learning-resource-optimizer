const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require('uuid');

const dynamoClient = new DynamoDBClient({ region: "us-west-2" });
const s3Client = new S3Client({ region: "us-west-2" });

const BUCKET_NAME = "study-material-bucket"; 

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    let response;
    try {
        const { documentTitle, documentContent, fileType, fileName, folderName } = JSON.parse(event.body);

        if (!documentTitle || !documentContent || !folderName) {
            response = {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing document title, content, or folder name" }),
            };
            console.log("Missing document title, content, or folder name:", response);
            return response;
        }

        const documentId = uuidv4();
        const s3Key = `${folderName}/${documentId}/${fileName}`;

        // Upload document to S3
        const s3Params = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: Buffer.from(documentContent, 'base64'),
            ContentType: fileType,
            Metadata: {
                'document-title': documentTitle
            }
        };

        console.log("Params for S3 upload:", s3Params);

        const s3Command = new PutObjectCommand(s3Params);
        await s3Client.send(s3Command);

        const s3Url = `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

        // Store the S3 URL in DynamoDB
        const dynamoParams = {
            TableName: 'studyMaterial-dev',
            Item: {
                id: { S: documentId },
                documentTitle: { S: documentTitle },
                s3Url: { S: s3Url },
                fileType: { S: fileType },
                fileName: { S: fileName },
                folderName: { S: folderName },
                uploadedAt: { S: new Date().toISOString() }
            }
        };

        console.log("Params to be inserted into DynamoDB:", dynamoParams);

        const dynamoCommand = new PutItemCommand(dynamoParams);
        await dynamoClient.send(dynamoCommand);

        response = {
            statusCode: 200,
            body: JSON.stringify({ message: "Document uploaded successfully", s3Url }),
        };
        console.log("Document uploaded successfully:", response);
    } catch (error) {
        console.error("Error uploading document:", error);
        response = {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error }),
        };
    }
    return response;
};
