export function formatLastInteraction(hours) {
  if (hours === 0) {
    return "agora";
  }

  if (hours < 24) {
    return `há ${hours}h`;
  }

  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}
