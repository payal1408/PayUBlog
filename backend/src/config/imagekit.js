const ImageKit = require('imagekit');

let imagekitInstance = null;

if (
  process.env.IMAGEKIT_PUBLIC_KEY &&
  process.env.IMAGEKIT_PRIVATE_KEY &&
  process.env.IMAGEKIT_URL_ENDPOINT
) {
  try {
    imagekitInstance = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
    console.log('[ImageKit] Configured successfully.');
  } catch (err) {
    console.error('[ImageKit Error] Failed to initialize:', err.message);
  }
} else {
  console.log('[ImageKit] Credentials missing. Image uploads will use base64 / static fallback mode.');
}

module.exports = imagekitInstance;
