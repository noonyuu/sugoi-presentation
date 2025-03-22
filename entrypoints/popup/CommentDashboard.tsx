import { useState, useEffect } from "react";

type Comment = {
  id: number;
  name: string;
  text: string;
};

const CommentDashboard = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false); // アコーディオンの開閉状態

  // 最初の3件を表示し、それ以降は隠す
  const visibleComments = showAll ? comments : comments.slice(0, 2);

  useEffect(() => {
    console.log("popupがマウントされました");
    chrome.runtime.sendMessage({ action: "getData" }, (response) => {
      console.log("Received response:", response);
      if (response && response.data) {
        setSessionId(response.data);
        console.log("Received data:", response.data);
      }
    });
  }, []);

  useEffect(() => {
    if (sessionId) {
      console.log("コメントを取得します", sessionId);
      fetch(`https://presentation.noonyuu.com/app/comment/get/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("ネットワークエラー");
          }
          return res.json();
        })
        .then((data) => {
          setComments(
            data.map(
              (item: {
                ID: number;
                Name: string;
                Comment: string;
                SessionId: string;
              }) => ({
                id: item.ID,
                name: item.Name,
                text: item.Comment,
              }),
            ),
          );
        })
        .catch((error) => console.error("コメント取得エラー:", error));
    }
  }, [sessionId]);

  // CSVとしてダウンロード
  const downloadCSV = () => {
    try {
      const header = ["名前", "コメント"];
      const csvData = comments.map((comment) => [comment.name, comment.text]);

      const csvContent = [
        header.join(","),
        ...csvData.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // 別ウィンドウで開く代わりに、直接ダウンロードを試みる
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `プレゼンコメント_${new Date().toLocaleDateString("ja-JP")}.csv`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // URLを解放
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setDownloadStatus("CSVダウンロードが完了しました");
        setTimeout(() => setDownloadStatus(""), 3000);
      }, 100);
    } catch (error) {
      console.error("CSVダウンロードエラー:", error);
      setDownloadStatus("CSVダウンロードに失敗しました");
      setTimeout(() => setDownloadStatus(""), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 font-sans">
      <div>
        <div className="sha mb-6 rounded-lg bg-[#FFFFF1] p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">統計情報</h2>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-blue-100 p-4 text-center">
              <div className="text-lg font-bold text-blue-800">
                {comments.length}
              </div>
              <div className="text-sm text-blue-600">総コメント数</div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadCSV}
                className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white transition hover:bg-green-700"
              >
                CSVダウンロード
              </button>
            </div>

            {/* ステータスメッセージ */}
            {downloadStatus && (
              <div className="mt-2 rounded-lg bg-gray-100 p-2 text-sm">
                {downloadStatus}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-[#fff1f1] p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            コメント一覧
          </h2>

          {/* コメント一覧 */}
          <div className="space-y-4">
            {visibleComments.map((comment) => (
              <div
                key={comment.id}
                className="border-l-4 border-indigo-500 py-2 pl-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-12 pr-2 font-semibold">
                      {comment.name}
                    </div>
                    <div>{comment.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* アコーディオンボタン */}
          {comments.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full rounded bg-indigo-500 px-4 py-2 text-white transition hover:bg-indigo-600"
            >
              {showAll ? "閉じる" : "もっと見る"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentDashboard;
