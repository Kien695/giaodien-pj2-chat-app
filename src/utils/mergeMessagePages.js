const getMessageKey = (message) => {
  if (message?._id) return `id:${message._id}`;
  if (message?.clientMessageId) return `client:${message.clientMessageId}`;
  return null;
};

export const prependUniqueMessages = (currentMessages, olderMessages) => {
  const seen = new Set(currentMessages.map(getMessageKey).filter(Boolean));
  const uniqueOlder = [];

  for (const message of olderMessages) {
    const key = getMessageKey(message);
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    uniqueOlder.push(message);
  }

  return [...uniqueOlder, ...currentMessages];
};
