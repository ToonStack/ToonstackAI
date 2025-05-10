import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

let containerClient;

try {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
  const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;

  containerClient = blobServiceClient.getContainerClient(containerName);

  // Test the connection by checking if the container exists
  const exists = await containerClient.exists();

  if (exists) {
    console.log(`✅ Connected to Azure Blob Container: ${containerName}`);
  } else {
    console.warn(`⚠️ Container '${containerName}' does not exist in Azure Blob Storage.`);
  }
} catch (err) {
  console.error("❌ Failed to connect to Azure Blob Storage:", err.message);
}

export const uploadAudioToAzureBlob = async (audioBuffer, filename) => {
  if (!containerClient) {
    throw new Error("Azure Blob Storage connection is not initialized.");
  }

  try {
    const blobClient = containerClient.getBlockBlobClient(filename);
    const uploadBlobResponse = await blobClient.upload(audioBuffer, audioBuffer.length);
    console.log(`Blob uploaded with response code ${uploadBlobResponse._response.status}`);
    return blobClient.url;
  } catch (uploadError) {
    console.error("❌ Upload to Azure Blob failed:", uploadError.message);
    throw uploadError;
  }
};
