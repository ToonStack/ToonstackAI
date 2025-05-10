import { convertTextToSpeech } from '../../config/elevenLabs.js';
import { streamToBuffer } from '../../utils/streamToBuffer.js';
import { BlobServiceClient } from '@azure/storage-blob';
import redisClient from '../../config/redisClient.js'; // Make sure this exists
import dotenv from 'dotenv';

dotenv.config();

// Azure Blob setup
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_BLOB_CONTAINER_NAME);

export const textToSpeech = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    console.log('🟡 [API] Received text for conversion:', text);

    const cacheKey = `tts:${text.trim().toLowerCase()}`;
    const cachedUrl = await redisClient.get(cacheKey);

    if (cachedUrl) {
      console.log('🟢 [CACHE] Returning cached audio URL');
      return res.status(200).json({
        message: 'Returned from cache',
        url: cachedUrl,
      });
    }

    console.log('🟡 [API] Generating audio from Eleven Labs...');
    const audioStream = await convertTextToSpeech(text);
    console.log('✅ [TTS] Audio stream received from ElevenLabs');

    console.log('🟡 [API] Converting ElevenLabs stream to buffer...');
    const audioBuffer = await streamToBuffer(audioStream);
    console.log('✅ [API] Converted stream to buffer. Buffer size:', audioBuffer.length);

    const filename = `tts_${Date.now()}.mp3`;
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    const uploadResponse = await blockBlobClient.upload(audioBuffer, audioBuffer.length);
    const blobUrl = blockBlobClient.url;
    console.log(`✅ [API] Uploaded blob to Azure. Status: ${uploadResponse._response.status}`);

    // Cache the result for 24 hours (86400 seconds)
    await redisClient.setEx(cacheKey, 86400, blobUrl);
    console.log('🟢 [CACHE] Audio URL cached successfully');

    return res.status(200).json({
      message: 'TTS successful',
      url: blobUrl,
    });
  } catch (error) {
    console.error('❌ [API] Error in /api/audio:', error.message);
    return res.status(500).json({ error: 'Text-to-speech conversion failed', details: error.message });
  }
};
