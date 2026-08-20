const imagekit = require('../config/imagekit');
const path = require('path');

/**
 * Uploads file buffer to ImageKit (or generates base64 fallback URL if ImageKit is unconfigured)
 * @param {Object} file Multer file object
 * @param {string} folder Destination folder in ImageKit
 * @returns {Promise<{url: string, fileId: string}>}
 */
const uploadImage = async (file, folder = 'blog_platform') => {
  if (!file) return null;

  if (imagekit) {
    try {
      const response = await imagekit.upload({
        file: file.buffer, // buffer or base64 string
        fileName: `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`,
        folder: `/enterprise_blog/${folder}`,
        useUniqueFileName: true,
      });

      return {
        url: response.url,
        fileId: response.fileId,
        thumbnailUrl: response.thumbnailUrl || response.url,
      };
    } catch (error) {
      console.error('[ImageService Upload Error]', error.message);
      // Fallback to data URI if ImageKit API call fails
    }
  }

  // Fallback mode: Convert buffer to Data URI
  const mimeType = file.mimetype || 'image/jpeg';
  const base64Data = file.buffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  return {
    url: dataUri,
    fileId: `local_${Date.now()}`,
    thumbnailUrl: dataUri,
  };
};

/**
 * Deletes file from ImageKit by fileId if available
 * @param {string} fileId 
 */
const deleteImage = async (fileId) => {
  if (!fileId || fileId.startsWith('local_') || !imagekit) return;
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error('[ImageService Delete Error]', error.message);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
