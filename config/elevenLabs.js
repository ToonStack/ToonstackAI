import { ElevenLabsClient } from 'elevenlabs';
import dotenv from 'dotenv';

dotenv.config();

const voiceId = process.env.VOICE_ID;

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

export async function convertTextToSpeech(text) {
  try {
    console.log('🟡 [TTS] Starting text-to-speech conversion...');
    console.log(`📄 [TTS] Text received: "${text}"`);
    console.log(`🗣️ [TTS] Using voice ID: ${voiceId}`);

    const audioStream = await client.textToSpeech.convertAsStream(voiceId, {
      text: text,
      model_id: 'eleven_multilingual_v2',
    });

    console.log('✅ [TTS] Audio stream received from ElevenLabs');
    return audioStream;
  } catch (error) {
    console.error('❌ [TTS] Error in ElevenLabs text-to-speech conversion:', error?.message || error);
    throw new Error('Failed to convert text to speech');
  }
}
