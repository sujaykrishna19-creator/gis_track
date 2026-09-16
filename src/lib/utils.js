export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return String(dateStr);
  }
  return d.toLocaleDateString();
};
