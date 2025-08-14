// config/claudeAI.js
import dotenv from 'dotenv';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

dotenv.config();

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

export async function queryClaudeAI(userQuery, context) {
  try {
    const modelId = 'anthropic.claude-3-haiku-20240307-v1:0';

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a friendly AI teacher for kids. Explain things in a simple, fun, and engaging way. 
              Look up the context of questions asked, based on content from the database and also add flavour to it. 
              Keep responses short and easy to understand for 5-year-olds. Keep it at 15 words maximum.

              What does "${userQuery}" mean in this story? Context:\n\n${context}`
            }
          ]
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    };

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));

    return result.content?.[0]?.text || 'No answer received';
  } catch (error) {
    console.error('Error querying Claude AI:', error);
    return 'Sorry, I encountered an issue processing your request.';
  }
}
