@echo off
echo ================================
echo  補助金検索システム セットアップ
echo ================================
echo.

echo [1/5] フロントエンドの依存関係をインストール中...
call npm install
if %errorlevel% neq 0 (
    echo エラー: フロントエンドのインストールに失敗しました
    pause
    exit /b 1
)

echo.
echo [2/5] バックエンドの依存関係をインストール中...
cd server
call npm install
if %errorlevel% neq 0 (
    echo エラー: バックエンドのインストールに失敗しました
    pause
    exit /b 1
)

echo.
echo [3/5] 環境変数ファイルを確認中...
if not exist .env (
    echo .envファイルが見つかりません。作成します...
    (
        echo # OpenAI API設定^(オプション^)
        echo OPENAI_API_KEY=
        echo.
        echo # サーバー設定
        echo PORT=5000
    ) > .env
    echo .envファイルを作成しました: server\.env
) else (
    echo .envファイルは既に存在します
)

cd ..

echo.
echo [4/5] セットアップ完了！
echo.
echo ================================
echo  起動方法
echo ================================
echo 1. サーバーを起動（このターミナル）:
echo    cd server
echo    npm run dev
echo.
echo 2. フロントエンド起動（別ターミナル）:
echo    npm start
echo.
echo ================================
echo.

pause

