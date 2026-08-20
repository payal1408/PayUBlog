/**
 * Format publication timestamp to dynamic relative time 
 * (e.g. "Just now", "5m ago", "2h ago", "3d ago", or "Aug 19, 2026")
 */
export const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Just now';
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 30) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Calculate dynamic reading time from content
 */
export const formatReadingTime = (content, storedReadingTime) => {
  if (storedReadingTime && storedReadingTime > 1) {
    return `${storedReadingTime} min read`;
  }
  if (!content) return '1 min read';
  const cleanText = content.replace(/<[^>]*>?/gm, '');
  const wordCount = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return `${minutes} min read`;
};
