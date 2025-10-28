# Hostingerデプロイメントガイド

## 概要
このガイドでは、SIN JAPAN POKERアプリケーションをHostingerホスティングサービスにデプロイする方法を説明します。

## 前提条件

### 必要なもの
- Hostingerアカウント（Business以上のプランを推奨）
- Node.js対応プラン
- MongoDB Atlas アカウント（データベース用）
- GitHubアカウント

### 推奨スペック
- RAM: 2GB以上
- ストレージ: 20GB以上
- Node.js: 18.x以上

## 1. データベースの準備（MongoDB Atlas）

### MongoDB Atlasセットアップ
1. [MongoDB Atlas](https://www.mongodb.com/atlas)にアクセス
2. 無料のクラスターを作成
3. データベースユーザーを作成
4. IPアドレスをホワイトリストに追加（0.0.0.0/0 推奨）
5. 接続文字列をコピー

### 接続文字列の例
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
```

## 2. Hostingerでの初期設定

### cPanelアクセス
1. Hostingerの管理パネルにログイン
2. 「Website」セクションから対象ドメインを選択
3. 「Manage」をクリック
4. 「Advanced」タブの「Control Panel」を開く

### Node.jsアプリケーションの設定
1. cPanelで「Node.js App」を選択
2. 「Create Application」をクリック
3. 以下の設定を行う：
   - Node.js Version: 18.x 以上
   - Application Mode: Production
   - Application Root: `/public_html/poker-app`
   - Startup File: `server.js`

## 3. ファイルのアップロード

### 方法1: File Managerを使用
1. cPanelの「File Manager」を開く
2. `public_html/poker-app`フォルダを作成
3. プロジェクトファイルをアップロード

### 方法2: GitHubから直接デプロイ（推奨）
1. TerminalまたはSSHでHostingerサーバーに接続
2. 以下のコマンドを実行：

```bash
cd public_html
git clone https://github.com/SINJAPANLLC/sinjapan-poker-ver2.git poker-app
cd poker-app
```

## 4. 環境変数の設定

### Hostingerでの環境変数設定
1. Node.jsアプリケーション管理画面を開く
2. 「Environment Variables」セクションで以下を追加：

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/poker-app?retryWrites=true&w=majority
JWT_SECRET=your-very-secure-random-string-change-this-in-production
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 重要なセキュリティ設定
- `JWT_SECRET`: 32文字以上のランダムな文字列を生成
- 本番環境用のMongoDB接続文字列を使用
- HTTPSを必ず使用

## 5. 依存関係のインストールとビルド

### Terminal/SSHでの実行
```bash
cd public_html/poker-app

# 依存関係のインストール
npm install --production

# Next.jsアプリケーションをビルド
npm run build

# Socket.ioサーバー用の追加設定（必要に応じて）
npm install pm2 -g
```

## 6. アプリケーションの起動

### 起動方法
1. Hostingerの管理画面で「Start」ボタンをクリック
2. または、TerminalでPM2を使用：

```bash
# PM2でアプリケーションを起動
pm2 start server.js --name "poker-app"
pm2 startup
pm2 save
```

## 7. ドメインとSSLの設定

### SSL証明書の設定
1. Hostingerの管理画面で「SSL」を選択
2. Let's Encrypt SSL証明書を有効化
3. HTTPからHTTPSへのリダイレクトを有効化

### DNS設定の確認
- Aレコードがサーバーの正しいIPアドレスを指していることを確認
- CNAMEレコード（www）が正しく設定されていることを確認

## 8. トラブルシューティング

### よくある問題と解決方法

#### アプリケーションが起動しない
```bash
# ログを確認
npm run dev
# または
pm2 logs poker-app
```

#### データベース接続エラー
- MongoDB Atlasの接続文字列を確認
- IPアドレスがホワイトリストに登録されているか確認
- データベースユーザーの権限を確認

#### 静的ファイルが読み込まれない
- `.htaccess`ファイルが正しく配置されているか確認
- ファイルパーミッションを確認（755または644）

#### Socket.io接続エラー
- WebSocketが有効化されているか確認
- ファイアウォール設定を確認
- HTTPSでの接続を確認

## 9. パフォーマンス最適化

### 推奨設定
```javascript
// next.config.js の最適化
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['ws'],
  },
  compress: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
    minimumCacheTTL: 31536000,
  },
}
```

### キャッシュ設定
- 静的アセットの長期キャッシュを設定
- API レスポンスの適切なキャッシュヘッダーを設定

## 10. 監視とメンテナンス

### 定期的なチェック項目
- アプリケーションの稼働状況
- データベース接続状況
- SSL証明書の有効期限
- セキュリティーアップデート

### バックアップ
- 定期的なデータベースバックアップ
- コードベースのGitHub同期

## サポート

問題が発生した場合：
1. 本ドキュメントのトラブルシューティングセクションを確認
2. HostingerのサポートTicketを作成
3. GitHubのIssuesで報告

---

**注意**: このガイドは一般的なデプロイ手順です。Hostingerのプランや設定によっては一部手順が異なる場合があります。
