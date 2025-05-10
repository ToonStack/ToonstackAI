import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

// Azure Blob setup
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_BLOB_CONTAINER_NAME);

// Generate SAS URL
const generateSASUrl = (blobClient) => {
  const expiresOn = new Date();
  expiresOn.setMinutes(expiresOn.getMinutes() + 60); // SAS URL expires in 1 hour

  const sasToken = blobClient.generateSasUrl({
    permissions: 'r', // Only read access
    expiresOn: expiresOn,
  });

  return sasToken;
};

export const uploadAudioToAzureBlob = async (audioBuffer, filename) => {
  if (!containerClient) {
    throw new Error("Azure Blob Storage connection is not initialized.");
  }

  try {
    const blobClient = containerClient.getBlockBlobClient(filename);
    const uploadBlobResponse = await blobClient.upload(audioBuffer, audioBuffer.length);
    console.log(`Blob uploaded with response code ${uploadBlobResponse._response.status}`);

    // Generate SAS URL
    const sasUrl = generateSASUrl(blobClient);
    console.log(`SAS URL generated: ${sasUrl}`);

    return sasUrl;
  } catch (uploadError) {
    console.error("❌ Upload to Azure Blob failed:", uploadError.message);
    throw uploadError;
  }
};
