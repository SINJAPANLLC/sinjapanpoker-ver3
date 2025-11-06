# 🚀 デプロイチェックリスト - SIN JAPAN POKER

## 📋 デプロイ前の確認事項

### ✅ コードの最終チェック
- [x] LSPエラーなし
- [x] カードバイアスシステム削除（公平性確保）
- [x] 全APIエンドポイント動作確認
- [x] Socket.io接続テスト完了
- [x] 背景画像（3種類）配置確認
- [x] サウンドエフェクト動作確認

### ✅ セキュリティチェック
- [x] JWT認証実装済み
- [x] XSS/CSRF対策済み
- [x] SQLインジェクション対策（Drizzle ORM）
- [x] 環境変数の分離
- [x] レート制限実装済み

### ✅ データベース
- [x] PostgreSQL（Neon）接続確認
- [x] スキーマ定義完了
- [x] マイグレーション準備完了

### ✅ 決済システム
- [x] Stripe統合完了
- [x] Webhookエンドポイント実装済み
- [x] トランザクション記録システム

## 🎯 デプロイ手順

### 1️⃣ GitHub へのプッシュ
```bash
# Replit以外の環境で実行
git add .
git commit -m "Production deployment - v1.0.0"
git push origin main
```

### 2️⃣ Hostinger VPS セットアップ
```bash
# SSH接続
ssh root@sinjapan-poker.com

# プロジェクトクローン
cd /var/www
git clone https://github.com/SINJAPANLLC/sinjapan-poker-ver2.git poker
cd poker

# 環境変数設定
nano .env
# DATABASE_URL, JWT_SECRET, その他の環境変数を設定

# 依存関係インストール
npm install --production

# ビルド
npm run build

# PM2で起動
pm2 start server.js --name poker-app
pm2 save
```

### 3️⃣ Nginx & SSL
```bash
# Nginx設定
sudo nano /etc/nginx/sites-available/poker
# 設定ファイルを作成（HOSTINGER_DEPLOY.md参照）

sudo ln -s /etc/nginx/sites-available/poker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL証明書取得
sudo certbot --nginx -d sinjapan-poker.com -d www.sinjapan-poker.com
```

### 4️⃣ データベースマイグレーション
```bash
cd /var/www/poker
npm run db:push
```

## 🧪 デプロイ後の動作確認

### アプリケーション
- [ ] https://sinjapan-poker.com でアクセス可能
- [ ] ホームページが正常に表示
- [ ] ユーザー登録・ログイン機能
- [ ] 練習モードでゲーム開始

### リアルタイム機能
- [ ] Socket.io接続成功
- [ ] ゲームプレイ（カード配布、ベット、フォールド）
- [ ] チャット機能
- [ ] 観戦モード
- [ ] 離席モード

### 決済機能
- [ ] Stripe Checkout動作
- [ ] チップ購入
- [ ] トランザクション記録

### 管理機能
- [ ] 管理者ダッシュボードアクセス
- [ ] ユーザー管理
- [ ] トーナメント管理
- [ ] 売上レポート

## 📊 パフォーマンスチェック

### サーバー
```bash
pm2 monit           # CPU/メモリ使用率
pm2 logs poker-app  # エラーログ確認
```

### ネットワーク
- [ ] ページ読み込み速度 < 3秒
- [ ] API応答時間 < 500ms
- [ ] WebSocket接続安定

## 🔒 セキュリティ最終チェック

- [ ] HTTPS強制リダイレクト
- [ ] SSL証明書有効
- [ ] セキュリティヘッダー設定
- [ ] ファイアウォール有効
- [ ] 環境変数保護
- [ ] 管理者パスワード変更

## 📝 デプロイ後のタスク

### 即時対応
- [ ] Google Analytics設定
- [ ] エラーモニタリング（Sentry等）
- [ ] バックアップ設定
- [ ] SSL自動更新確認

### 継続的メンテナンス
- [ ] 定期的なログ確認
- [ ] データベースバックアップ（毎日）
- [ ] セキュリティアップデート
- [ ] パフォーマンス監視

## 🎉 デプロイ完了条件

全ての項目にチェックが入ったらデプロイ完了！

---

**最終確認日**: 2025年11月7日
**デプロイ環境**: Hostinger VPS
**ドメイン**: sinjapan-poker.com
