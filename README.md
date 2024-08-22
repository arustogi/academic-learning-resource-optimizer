# Context-Aware Study Schedule Generator


## Overview


The Context-Aware Study Schedule Generator is a web application designed to generate personalized and contextually relevant study schedules. By leveraging document embeddings and deadlines extracted from uploaded academic materials, the application produces a structured study plan that accurately references the content of the materials. This system is built on a serverless architecture using AWS services, ensuring scalability, reliability, and efficiency.


## Features


- **Document Upload & Embedding Generation**: Users can upload academic documents. The system generates embeddings representing the content of these materials.
- **Personalized Study Schedule**: The application processes the embeddings and deadlines to create a detailed, day-by-day study schedule, ensuring that each task is aligned with the relevant materials.
- **Asynchronous Processing**: Handles large datasets by separating the schedule generation into background processes, allowing for efficient handling and improved user experience.
- **Responsive User Interface**: A clean and intuitive React-based frontend that allows users to easily interact with the system, upload documents, and view generated schedules in a tabular format.
- **Serverless Architecture**: Built using AWS Lambda, DynamoDB, and API Gateway to ensure scalability, reliability, and security.


## Technologies


- **Frontend**: React, Axios, Material-UI
- **Backend**: Node.js, AWS Lambda, DynamoDB, API Gateway, OpenAI GPT-4
- **APIs**: OpenAI API for generating embeddings and study schedules
- **Database**: DynamoDB for storing document embeddings and generated schedules


## Getting Started


### Prerequisites


- Node.js
- AWS account with access to Lambda, DynamoDB, and API Gateway
- OpenAI API key


### Installation


1. **Clone the Repository**


   ```bash
   git clone https://github.com/your-username/context-aware-study-schedule-generator.git
   cd context-aware-study-schedule-generator
2. **Install Dependencies**
 
   ```bash
   npm install
4. **Set up your AWS credentials and configure access to Lambda, DynamoDB, and API Gateway**
5. **Obtain an OpenAI API key and store it securely**
6. **Deploy Backend (AWS Lambda)**
7. **Set up DynamoDB tables for storing embeddings and generated schedules**
8. **Configure API Gateway to handle requests and responses**
9. **Run the Frontend**


```bash
npm start


The application will be available at http://localhost:3000.
