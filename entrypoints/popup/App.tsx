import { useState, useEffect } from "react";
import { CheckBox } from "./components/CheckBox";
import CommentDashboard from "./CommentDashboard";

type User = {
  UserId: string;
  Name: string;
  Email?: string;
}

type LoginFormData = {
  userId: string;
  password: string;
}

type RegisterFormData = {
  userId: string;
  name: string;
  password: string;
}

function App() {
  const [isCanva, setIsCanva] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  
  // ログインフォームデータ
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    userId: "",
    password: ""
  });
  
  // 新規登録フォームデータ
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    userId: "",
    name: "",
    password: ""
  });

  // 初期化時にログイン状態をチェック
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
    
    // 現在のURLを取得
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0]?.url; // URLが存在するか確認
      if (currentUrl && currentUrl.startsWith("https://www.canva.com/")) {
        setIsCanva(true);
      }
    });
  }, []);

  // ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://presentation.noonyuu.com/app/user/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: loginForm.userId,
          password: loginForm.password
        }),
      });
      
      if (!response.ok) {
        throw new Error('ログインに失敗しました');
      }
      
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 新規登録処理
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://presentation.noonyuu.com/app/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: registerForm.userId,
          name: registerForm.name,
          password: registerForm.password
        }),
      });
      
      if (!response.ok) {
        throw new Error('アカウント作成に失敗しました');
      }
      
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ログアウト処理
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // ログインフォーム入力ハンドラ
  const handleLoginFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 新規登録フォーム入力ハンドラ
  const handleRegisterFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 認証フォームの表示
  const renderAuthForm = () => {
    if (isRegisterMode) {
      return (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">新規アカウント作成</h2>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">ユーザーID</label>
              <input
                type="text"
                id="userId"
                name="userId"
                required
                value={registerForm.userId}
                onChange={handleRegisterFormChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">名前</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={registerForm.name}
                onChange={handleRegisterFormChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={registerForm.password}
                onChange={handleRegisterFormChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-300"
            >
              {isLoading ? "処理中..." : "アカウント作成"}
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-600">
            すでにアカウントをお持ちの方は
            <button 
              onClick={() => setIsRegisterMode(false)}
              className="text-indigo-600 hover:underline ml-1"
            >
              ログイン
            </button>
          </p>
        </div>
      );
    }
    
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">ログイン</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">ユーザーID</label>
            <input
              type="text"
              id="userId"
              name="userId"
              required
              value={loginForm.userId}
              onChange={handleLoginFormChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={loginForm.password}
              onChange={handleLoginFormChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-300"
          >
            {isLoading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          アカウントをお持ちでない方は
          <button 
            onClick={() => setIsRegisterMode(true)}
            className="text-indigo-600 hover:underline ml-1"
          >
            新規登録
          </button>
        </p>
      </div>
    );
  };

  // メインコンテンツのレンダリング
  const renderContent = () => {
    // ユーザーがログインしていない場合
    if (!user) {
      return renderAuthForm();
    }
    
    // ユーザーがログインしている場合
    if (isCanva) {
      return (
        <>
          <div className="bg-white p-3 mb-2 rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-600">ようこそ、</span>
              <span className="font-medium text-indigo-700">{user.Name}</span>
              <span className="text-sm text-gray-600">さん</span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              ログアウト
            </button>
          </div>
          <CheckBox />
          <CommentDashboard />
        </>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-sm min-h-64">
          <div className="text-3xl mb-3 text-indigo-600">🎨</div>
          <h2 className="text-xl font-semibold text-indigo-700 mb-2">Canvaで開いてください</h2>
          <p className="text-gray-600 mb-4">このツールはCanvaのプレゼンテーションでのみ使用できます</p>
          <a 
            href="https://www.canva.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm mb-4"
          >
            Canvaを開く
          </a>
          <button 
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            ログアウト
          </button>
        </div>
      );
    }
  };

  return (
    <div className="w-96 min-h-32 flex flex-col p-2 bg-gray-50">
      {renderContent()}
    </div>
  );
}

export default App;