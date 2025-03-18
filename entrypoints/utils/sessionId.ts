var sessionId: string | null = null;

export const createSessionId = () => {
  sessionId = window.location.hostname + window.location.pathname + "-" + crypto.randomUUID();
};

export const getSessionId = (): string => {
  if (!sessionId) {
    createSessionId();
  }
  return sessionId!;
};
