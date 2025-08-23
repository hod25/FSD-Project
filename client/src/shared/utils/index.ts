// Common utility functions will go here
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US');
};

export const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
