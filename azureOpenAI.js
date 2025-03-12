import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AZURE_OPENAI_API_URL = process.env.AZURE_OPENAI_API_URL;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;

export async function queryAzureOpenAI(userQuery, context) {
  try {
    const response = await axios.post(
      AZURE_OPENAI_API_URL,
      {
        model: 'gpt-4o', // Adjust based on your Azure deployment
        messages: [
          { 
            role: 'system', 
            content: 'You are an AI assistant that provides insightful and natural responses. Use any relevant information from the database seamlessly, blending it with general knowledge to ensure a natural flow.' 
          },
          { 
            role: 'user', 
            content: `User Query: ${userQuery}\n\nRelevant Database Content:\n${context}` 
          }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_API_KEY,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error querying Azure OpenAI:', error);
    return 'Sorry, I encountered an issue processing your request.';
  }
}
