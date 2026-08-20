/**
 * Calculates estimated reading time in minutes based on content word count.
 * Average reading speed: 180 words per minute.
 * @param {string} content 
 * @returns {number} estimated reading time in minutes (minimum 1)
 */
const calculateReadingTime = (content) => {
  if (!content) return 1;
  // Strip HTML tags if any
  const cleanText = content.replace(/<[^>]*>?/gm, '');
  const wordCount = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 180;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes > 0 ? minutes : 1;
};

module.exports = calculateReadingTime;
