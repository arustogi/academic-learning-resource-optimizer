const AWS = require('aws-sdk');
const openai = require('openai');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

openai.apiKey = process.env.OPENAI_API_KEY;

exports.handler = async (event) => {
    const { userId, documentContent } = JSON.parse(event.body);

    const response = await openai.Completion.create({
        engine: 'davinci-codex',
        prompt: documentContent,
        max_tokens: 150
    });

    const studyGuide = response.choices[0].text;

    const params = {
        TableName: process.env.STUDY_MATERIAL_TABLE,
        Item: {
            id: userId,
            DocumentContent: documentContent,
            StudyGuide: studyGuide,
            Timestamp: new Date().toISOString()
        }
    };

    await dynamoDB.put(params).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Study guide created successfully', studyGuide })
    };
};
