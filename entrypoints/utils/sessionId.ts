var sessionId: string | null = null;

export const createSessionId = () => {
  const sanitizedPath = window.location.pathname.replace(/\//g, ""); // `/` を削除
  sessionId = window.location.hostname + sanitizedPath;
  // セッションIDをローカルストレージに保存
  localStorage.setItem("sessionId", sessionId);
  localStorage.setItem(
      'qrCode', `https://presentation.noonyuu.com/app/comment/form/${sessionId}`,
    );
};

export const getSessionId = (): string => {
  // if (!sessionId) {
  //   createSessionId();
  // }
  return sessionId!;
};

export const removeSessionId = () => {
  localStorage.removeItem("sessionId");
  sessionId = null;
};
