import { ElevenLabsClient } from 'elevenlabs';
import dotenv from 'dotenv';

dotenv.config();

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

export async function convertTextToSpeech(text) {
  try {
    const audioStream = await client.textToSpeech.convertAsStream('JBFqnCBsd6RMkjVDRZzb', {
      text: text,
      model_id: 'eleven_multilingual_v2',
    });

    return audioStream;
  } catch (error) {
    console.error('Error in ElevenLabs text-to-speech conversion:', error);
    throw new Error('Failed to convert text to speech');
  }
}