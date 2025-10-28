# SIN JAPAN POKER

PPPOKER風の本格的なオンラインポーカーアプリケーション

## 機能

### 🎮 ゲーム機能
- **多様なゲームモード**
  - テキサスホールデム
  - オマハ
  - OFC (オープンフェイスチャイニーズ)
- **リアルタイム対戦** (Socket.io)
- **クイックゲーム** (リンク共有で即座にプレイ)

### 👥 クラブ機能
- クラブ作成・管理
- クラブコードで参加
- プライベートゲーム開催
- メンバー管理

### 🏆 トーナメント
- マルチテーブルトーナメント (MTT)
- Sit & Go
- Spin Up

### 🐉 ペット育成
- ドラゴン、フェニックス、タイガー、タートル
- レベルアップシステム
- ボーナスアビリティ

### 📊 データ分析
- プレイヤー統計
- 勝率・VPIP・PFR
- ベストハンド記録
- 詳細な戦績データ

### 💬 ソーシャル機能
- ゲーム内チャット
- 音声メッセージ対応
- フレンド機能

## 技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (状態管理)
- **Socket.io Client** (リアルタイム通信)
- **Framer Motion** (アニメーション)

### バックエンド
- **Node.js**
- **Express**
- **Socket.io** (WebSocket)
- **MongoDB** (データベース)
- **Mongoose** (ODM)
- **JWT** (認証)
- **bcryptjs** (パスワードハッシュ化)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下を設定：

```env
MONGODB_URI=mongodb://localhost:27017/poker-app
JWT_SECRET=your-secret-key-change-this-in-production
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. MongoDBの起動

MongoDBをローカルで起動するか、MongoDB Atlasを使用してください。

```bash
# macOS (Homebrew)
brew services start mongodb-community

# または Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 4. アプリケーションの起動

**開発モード：**

```bash
# Next.jsアプリを起動
npm run dev

# 別のターミナルでSocket.ioサーバーを起動
npm run server
```

アプリケーションは以下で利用可能です：
- フロントエンド: http://localhost:3000
- Socket.ioサーバー: http://localhost:3001

### 5. 本番ビルド

```bash
npm run build
npm start
```

## Hostingerでのデプロイ

### 前提条件
- Hostingerアカウント
- Node.js対応のホスティングプラン

### デプロイ手順

1. **GitHubリポジトリの準備**
   ```bash
   git add .
   git commit -m "Deploy to Hostinger"
   git push origin main
   ```

2. **Hostingerでの設定**
   - Hostingerの管理パネルにログイン
   - Webサイト管理で対象ドメインを選択
   - File Managerまたはcpanelにアクセス
   - GitHubからファイルをアップロードまたはgit cloneを実行

3. **環境変数の設定**
   Hostingerの環境変数設定で以下を追加：
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-production-secret
   NEXT_PUBLIC_SOCKET_URL=your-domain-url
   ```

4. **依存関係のインストール**
   ```bash
   npm install --production
   ```

5. **アプリケーションのビルド**
   ```bash
   npm run build
   ```

6. **アプリケーションの起動**
   ```bash
   npm start
   ```

### Hostinger注意点
- Node.jsアプリケーションのポート設定は自動的に管理されます
- MongoDB AtlasなどのクラウドDBを使用することを推奨
- 静的ファイルは `/public` ディレクトリに配置
- SSL証明書の設定を忘れずに行ってください

## プロジェクト構造

```
SIN JAPAN POKER/
├── app/                    # Next.js App Router
│   ├── auth/              # 認証ページ
│   ├── clubs/             # クラブ関連ページ
│   ├── game/              # ゲームページ
│   ├── pet/               # ペット育成ページ
│   ├── stats/             # 統計ページ
│   ├── tournaments/       # トーナメントページ
│   └── lobby/             # ロビーページ
├── components/            # Reactコンポーネント
│   ├── Card.tsx          # カードコンポーネント
│   ├── PokerTable.tsx    # ポーカーテーブル
│   └── GameActions.tsx   # ゲームアクション
├── lib/                   # ユーティリティ
│   ├── poker-engine.ts   # ポーカーゲームロジック
│   ├── mongodb.ts        # MongoDB接続
│   └── auth.ts           # 認証ヘルパー
├── models/               # Mongooseモデル
│   ├── User.ts
│   ├── Club.ts
│   ├── Pet.ts
│   └── PlayerStats.ts
├── pages/api/            # API Routes
│   ├── auth/            # 認証API
│   ├── clubs/           # クラブAPI
│   ├── pets/            # ペットAPI
│   └── stats/           # 統計API
├── server/              # Socket.ioサーバー
│   └── index.js
├── store/               # Zustand状態管理
│   ├── useAuthStore.ts
│   └── useGameStore.ts
└── types/               # TypeScript型定義
    └── index.ts
```

## 主な機能の使い方

### 1. アカウント登録・ログイン
1. トップページで「新規登録」をクリック
2. メールアドレス、ユーザー名、パスワードを入力
3. 登録完了後、自動的にログイン

### 2. ゲームの開始
- **クイックゲーム**: リンクを共有して友達と対戦
- **ゲーム作成**: カスタム設定でゲームを作成
- **クラブゲーム**: クラブ内でプライベート対戦

### 3. クラブの作成・参加
- **作成**: クラブ名と説明を入力、クラブコードが自動生成
- **参加**: 6桁のクラブコードを入力

### 4. ペットの育成
- ペットを作成 (ドラゴン、フェニックス、タイガー、タートル)
- 餌を与えてレベルアップ
- レベル5ごとに新しいアビリティ獲得

### 5. 統計の確認
- 総ゲーム数、勝率、獲得チップ
- VPIP、PFR、アグレッションなどの詳細統計
- ベストハンド記録

## ゲームルール

### テキサスホールデム
1. 各プレイヤーに2枚のホールカード
2. 5枚のコミュニティカード
3. 最高のポーカーハンドを作成
4. ベッティングラウンド: プリフロップ、フロップ、ターン、リバー

### 役の強さ（高い順）
1. ロイヤルフラッシュ
2. ストレートフラッシュ
3. フォーカード
4. フルハウス
5. フラッシュ
6. ストレート
7. スリーカード
8. ツーペア
9. ワンペア
10. ハイカード

## 開発

### 新機能の追加
1. 型定義を `types/index.ts` に追加
2. APIルートを `pages/api/` に作成
3. フロントエンドページを `app/` に作成
4. 必要に応じてSocket.ioイベントを追加

### データベースモデルの追加
1. `models/` にMongooseスキーマを作成
2. 型定義を追加
3. APIエンドポイントを実装

## トラブルシューティング

### MongoDBに接続できない
- MongoDBが起動しているか確認
- `.env.local` のURIが正しいか確認

### Socket.ioが接続できない
- Socket.ioサーバーが起動しているか確認（ポート3001）
- ファイアウォール設定を確認

### ビルドエラー
```bash
rm -rf .next
npm install
npm run build
```

## ライセンス

MIT License

## 作者

SIN JAPAN POKER Development Team

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

