import fs from 'fs';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import config from '../config/config.js';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

export function getExtension(contentType) {
  switch (contentType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/svg+xml':
      return 'svg';
    case 'image/gif':
      return 'gif';
    case 'image/jpeg':
    case 'image/jpg':
    default:
      return 'jpg';
  }
}

/**
 * Uploads a file or buffer to Cloudflare R2
 * @param {object|Buffer} file - Formidable file object ({ path, type }) or Buffer
 * @param {string} folder - 'shops' | 'products' | 'auctions'
 * @param {string} entityId - ID of the entity
 * @param {string} [mimeType] - MIME type if file is a Buffer
 * @returns {Promise<string>} Public URL of uploaded image
 */
export const uploadImage = async (file, folder, entityId, mimeType) => {
  if (!file) {
    throw new Error('No file or buffer provided for upload');
  }

  let fileData;
  let contentType;

  if (Buffer.isBuffer(file)) {
    fileData = file;
    contentType = mimeType || 'image/jpeg';
  } else if (file.path) {
    fileData = fs.readFileSync(file.path);
    contentType = file.type || mimeType || 'image/jpeg';
  } else if (file.buffer) {
    fileData = file.buffer;
    contentType = file.type || file.contentType || mimeType || 'image/jpeg';
  } else {
    throw new Error('Invalid file object provided');
  }

  const ext = getExtension(contentType);
  const key = `${folder}/${entityId}-${Date.now()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: fileData,
      ContentType: contentType,
    })
  );

  const baseUrl = (config.r2.publicUrl || '').replace(/\/$/, '');

  return `${baseUrl}/${key}`;
};

export const uploadProductImage = (file, productId) => uploadImage(file, 'products', productId);
export const uploadAuctionImage = (file, auctionId) => uploadImage(file, 'auctions', auctionId);

/**
 * Deletes an image from Cloudflare R2 if it belongs to our bucket
 * @param {string} imageUrl - Public URL of image to delete
 */
export const deleteImage = async imageUrl => {
  if (!imageUrl) return;
  const baseUrl = (config.r2.publicUrl || '').replace(/\/$/, '');
  if (!imageUrl.startsWith(baseUrl)) return;

  const key = imageUrl.replace(`${baseUrl}/`, '');
  if (!key) return;

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: config.r2.bucketName,
        Key: key,
      })
    );
  } catch (err) {
    console.error('Failed to delete previous image from R2:', err.message);
  }
};

export { s3Client };

export default {
  uploadImage,
  uploadProductImage,
  uploadAuctionImage,
  deleteImage,
  getExtension,
  s3Client,
};
