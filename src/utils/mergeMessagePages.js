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

export const appendUniqueMessages = (currentMessages, newerMessages) => {
  const merged = [...currentMessages];

  for (const message of newerMessages) {
    const existingIndex = merged.findIndex(
      (current) =>
        (current?._id && message?._id && current._id === message._id) ||
        (current?.clientMessageId &&
          message?.clientMessageId &&
          current.clientMessageId === message.clientMessageId),
    );
    if (existingIndex === -1) {
      merged.push(message);
    } else {
      merged[existingIndex] = message;
    }
  }

  return merged;
};
