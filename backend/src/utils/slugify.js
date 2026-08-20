/**
 * Generates a clean URL-friendly slug from text string
 * @param {string} text 
 * @returns {string}
 */
const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')           // Replace spaces and underscores with -
    .replace(/[^\w\-]+/g, '')          // Remove all non-word chars
    .replace(/\-\-+/g, '-')            // Replace multiple - with single -
    .replace(/^-+/, '')                // Trim - from start of text
    .replace(/-+$/, '');               // Trim - from end of text
};

module.exports = slugify;
