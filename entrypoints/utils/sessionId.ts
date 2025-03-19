var sessionId: string | null = null;

export const createSessionId = () => {
  const sanitizedPath = window.location.pathname.replace(/\//g, ""); // `/` を削除
  sessionId = window.location.hostname + sanitizedPath;
};

export const getSessionId = (): string => {
  if (!sessionId) {
    createSessionId();
  }
  return sessionId!;
};