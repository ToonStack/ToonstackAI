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
            content: 'You are a friendly AI teacher for kids. Explain things in a simple, fun,\
            and engaging way.Look up the context of questions asked, based on content from the\
            database and also add flavour to it. Keep responses\
             short and easy to understand for kids as 5 year olds.' 
          },
          { 
            role: 'user', 
            content: `What does "${userQuery}" mean in this story? Context:\n\n${context}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
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
