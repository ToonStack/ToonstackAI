import express from 'express';
import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Setup Azure Blob
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_BLOB_CONTAINER_NAME);

// Route to test upload
router.get('/test-blob-upload', async (req, res) => {
  try {
    // Dummy audio buffer (like an mp3 file)
    const dummyBuffer = Buffer.from('This is a dummy audio file.', 'utf-8');
    const filename = `dummy_test_audio_${Date.now()}.mp3`;

    // Upload buffer to blob
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    const uploadResponse = await blockBlobClient.upload(dummyBuffer, dummyBuffer.length);

    console.log(`✅ Uploaded with status: ${uploadResponse._response.status}`);

    res.json({
      message: 'Upload successful',
      url: blockBlobClient.url,
      status: uploadResponse._response.status
    });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

export default router;
