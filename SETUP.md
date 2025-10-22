# セットアップガイド

## 必要な環境

- Node.js 18.x以上
- MongoDB 6.x以上
- npm または yarn

## インストール手順

### 1. プロジェクトのクローン

```bash
cd "SIN JAPAN POKER"
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. MongoDBのセットアップ

#### オプションA: ローカルMongoDB (推奨)

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
1. [MongoDB Community Server](https://www.mongodb.com/try/download/community)をダウンロード
2. インストール後、サービスとして起動

**Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

#### オプションB: MongoDB Atlas (クラウド)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)でアカウント作成
2. 無料クラスターを作成
3. 接続文字列を取得

### 4. 環境変数の設定

`.env.local`ファイルを作成：

```bash
touch .env.local
```

以下の内容を記述：

```env
# MongoDB接続URI
MONGODB_URI=mongodb://localhost:27017/poker-app

# JWT秘密鍵（本番環境では必ず変更してください）
JWT_SECRET=your-super-secret-jwt-key-change-this

# Socket.ioサーバーURL
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 5. アプリケーションの起動

#### 開発モード

**ターミナル1 (Next.js):**
```bash
npm run dev
```

**ターミナル2 (Socket.ioサーバー):**
```bash
npm run server
```

アプリケーションにアクセス:
- フロントエンド: http://localhost:3000
- Socket.ioサーバー: http://localhost:3001

#### 本番モード

```bash
npm run build
npm start
# 別ターミナルで
npm run server
```

## 初回ログイン

1. http://localhost:3000 にアクセス
2. 「新規登録」をクリック
3. 以下の情報を入力：
   - メールアドレス: test@example.com
   - ユーザー名: testuser
   - パスワード: password123
4. 登録完了後、自動的にロビーへ

## トラブルシューティング

### MongoDBに接続できない

**エラー:** `MongooseServerSelectionError`

**解決方法:**
1. MongoDBが起動しているか確認:
   ```bash
   # macOS
   brew services list
   
   # Docker
   docker ps
   ```

2. `.env.local`のURIを確認

3. ポート27017が使用可能か確認:
   ```bash
   lsof -i :27017
   ```

### Socket.ioサーバーが起動しない

**エラー:** `EADDRINUSE: address already in use`

**解決方法:**
1. ポート3001を使用しているプロセスを確認:
   ```bash
   lsof -i :3001
   ```

2. プロセスを終了:
   ```bash
   kill -9 <PID>
   ```

### Next.jsビルドエラー

**解決方法:**
```bash
# キャッシュとnode_modulesをクリア
rm -rf .next node_modules
npm install
npm run dev
```

### TypeScriptエラー

**解決方法:**
```bash
# 型定義を再生成
npx tsc --noEmit
```

## 開発のヒント

### データベースのリセット

MongoDBデータベースをリセットする場合:

```bash
# MongoDBシェルに接続
mongosh

# データベースを削除
use poker-app
db.dropDatabase()
```

### ユーザーデータの確認

```bash
mongosh
use poker-app
db.users.find()
db.clubs.find()
db.pets.find()
```

### ログの確認

- Next.jsログ: ターミナル1
- Socket.ioログ: ターミナル2
- ブラウザコンソール: F12 → Console

## 次のステップ

1. ✅ アカウント登録・ログイン
2. ✅ ロビーを確認
3. ✅ クイックゲームを作成
4. ✅ クラブを作成
5. ✅ ペットを育成
6. ✅ 統計を確認

## サポート

問題が解決しない場合は、README.mdを参照するか、GitHubのIssuesで質問してください。

