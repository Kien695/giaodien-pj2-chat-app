export const formatLastActive = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return `Vừa xong`;
  if (minutes < 60) return `Truy cập ${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Truy cập ${hours} giờ trước`;
  if (hours < 48) return `Hôm qua`;
  const days = Math.floor(hours / 24);

  if (days > 2 && days < 30) return `Truy cập ${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Truy cập ${months} tháng trước`;
  const years = Math.floor(months / 12);
  return `Truy cập ${years} năm trước`;
};
