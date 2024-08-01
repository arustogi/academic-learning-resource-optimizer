const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { S3Client, PutObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { v4: uuidv4 } = require('uuid');

const dynamoClient = new DynamoDBClient({ region: "us-west-2" });
const s3Client = new S3Client({ region: "us-west-2" });

const BUCKET_NAME = "study-material-bucket";

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
        const { documentTitle, documentContent, fileType, fileName, folderName } = JSON.parse(event.body);

        if (!documentTitle || !documentContent || !folderName) {
            response = {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST"
                },
                body: JSON.stringify({ message: "Missing document title, content, or folder name" }),
            };
            console.log("Missing document title, content, or folder name:", response);
            return response;
        }

        console.log("Starting file processing...");
        const startTime = Date.now();

        let plainTextContent;
        const buffer = Buffer.from(documentContent, 'base64');
        if (fileType === 'application/pdf') {
            const pdfData = await pdf(buffer);
            plainTextContent = pdfData.text;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const docxData = await mammoth.extractRawText({ buffer });
            plainTextContent = docxData.value;
        } else {
            plainTextContent = buffer.toString('utf-8');
        }

        const documentId = uuidv4();
        const s3Key = `${folderName}/${documentId}/${fileName}`;

        console.log(`File processing completed in ${(Date.now() - startTime) / 1000} seconds`);
        
        // Check if the file already exists
        const headParams = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
        };

        try {
            await s3Client.send(new HeadObjectCommand(headParams));
            response = {
                statusCode: 409,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST"
                },
                body: JSON.stringify({ message: "File already exists" }),
            };
            return response;
        } catch (error) {
            if (error.name !== 'NotFound') {
                throw error;
            }
        }

        // Upload document to S3
        const s3Params = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: buffer,
            ContentType: fileType,
            Metadata: {
                'document-title': documentTitle
            }
        };

        console.log("Params for S3 upload:", s3Params);

        const s3Command = new PutObjectCommand(s3Params);
        await s3Client.send(s3Command);

        const s3Url = `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

        console.log("S3 upload completed, URL:", s3Url);

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
                uploadedAt: { S: new Date().toISOString() },
                content: { S: plainTextContent } // Store the parsed content
            }
        };

        console.log("Params to be inserted into DynamoDB:", dynamoParams);

        const dynamoCommand = new PutItemCommand(dynamoParams);
        await dynamoClient.send(dynamoCommand);

        console.log("DynamoDB insert completed");

        response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({ message: "Document uploaded successfully", s3Url }),
        };
        console.log("Document uploaded successfully:", response);
    } catch (error) {
        console.error("Error uploading document:", error);
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