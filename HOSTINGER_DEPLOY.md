# HOSTINGER VPS デプロイメントガイド - SIN JAPAN POKER

## 概要
このガイドでは、SIN JAPAN POKERアプリケーションをHostinger VPS（sinjapan-poker.com）にデプロイする完全な手順を説明します。

## 前提条件

### 必要なもの
- Hostinger VPS（既に契約済み）
- ドメイン: sinjapan-poker.com
- PostgreSQL（Neon）データベース（既に設定済み）
- Node.js 18.x以上
- PM2（プロセスマネージャー）

## 📦 1. GitHubへのプッシュ

### ローカル環境で実行（Replit外）
```bash
# プロジェクトをダウンロード
git clone <your-replit-git-url>
cd sinjapan-poker

# GitHubにプッシュ
git remote add origin https://github.com/SINJAPANLLC/sinjapan-poker-ver2.git
git add .
git commit -m "Production ready deployment - Card bias removed"
git push -u origin main
```

## 🖥️ 2. Hostinger VPSへのSSH接続

```bash
ssh root@<your-hostinger-vps-ip>
# または
ssh root@sinjapan-poker.com
```

## 📥 3. アプリケーションのデプロイ

### プロジェクトのクローン
```bash
cd /var/www
git clone https://github.com/SINJAPANLLC/sinjapan-poker-ver2.git poker
cd poker
```

### Node.jsとnpmのインストール確認
```bash
node -v  # v18.x以上
npm -v
```

Node.jsがインストールされていない場合：
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 依存関係のインストール
```bash
npm install --production
```

### 環境変数の設定
```bash
nano .env
```

以下の内容を貼り付け：
```env
# 本番環境
NODE_ENV=production

# データベース（Neon PostgreSQL）
DATABASE_URL=postgresql://neondb_owner:your-password@your-host.neon.tech/neondb?sslmode=require
PGHOST=your-host.neon.tech
PGDATABASE=neondb
PGUSER=neondb_owner
PGPASSWORD=your-password
PGPORT=5432

# JWT認証
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long

# アプリケーションURL
NEXT_PUBLIC_APP_URL=https://sinjapan-poker.com
NEXT_PUBLIC_SOCKET_URL=https://sinjapan-poker.com

# Stripe（決済）
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# SendGrid（メール）
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@sinjapan-poker.com
```

**Ctrl+X** → **Y** → **Enter** で保存

### Next.jsアプリケーションのビルド
```bash
npm run build
```

## 🚀 4. PM2でアプリケーションを起動

### PM2のインストール
```bash
npm install -g pm2
```

### アプリケーション起動
```bash
pm2 start server.js --name "poker-app" --max-memory-restart 1G
```

### PM2の自動起動設定
```bash
pm2 startup
pm2 save
```

### PM2コマンド一覧
```bash
pm2 status           # アプリの状態確認
pm2 logs poker-app   # ログ確認
pm2 restart poker-app # 再起動
pm2 stop poker-app   # 停止
pm2 delete poker-app # 削除
pm2 monit            # リアルタイム監視
```

## 🌐 5. Nginx リバースプロキシ設定

### Nginxのインストール
```bash
sudo apt update
sudo apt install nginx -y
```

### Nginx設定ファイル作成
```bash
sudo nano /etc/nginx/sites-available/poker
```

以下の内容を貼り付け：
```nginx
upstream poker_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name sinjapan-poker.com www.sinjapan-poker.com;

    # HTTPSへリダイレクト
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sinjapan-poker.com www.sinjapan-poker.com;

    # SSL証明書（Let's Encryptで後で設定）
    ssl_certificate /etc/letsencrypt/live/sinjapan-poker.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sinjapan-poker.com/privkey.pem;

    # セキュリティヘッダー
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # 最大アップロードサイズ
    client_max_body_size 10M;

    # プロキシ設定
    location / {
        proxy_pass http://poker_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket対応
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # 静的ファイル（Next.js）
    location /_next/static {
        proxy_pass http://poker_backend;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### Nginx設定の有効化
```bash
sudo ln -s /etc/nginx/sites-available/poker /etc/nginx/sites-enabled/
sudo nginx -t  # 設定テスト
sudo systemctl restart nginx
```

## 🔒 6. SSL証明書の設定（Let's Encrypt）

### Certbotのインストール
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### SSL証明書の取得
```bash
sudo certbot --nginx -d sinjapan-poker.com -d www.sinjapan-poker.com
```

指示に従って：
1. メールアドレスを入力
2. 利用規約に同意
3. HTTPからHTTPSへのリダイレクトを選択

### 自動更新の設定
```bash
sudo certbot renew --dry-run
```

## 📊 7. データベースマイグレーション

```bash
cd /var/www/poker
npm run db:push
```

## 🔄 8. コードの更新手順（今後）

GitHubで更新した後：
```bash
cd /var/www/poker
git pull origin main
npm install --production
npm run build
pm2 restart poker-app
```

## 🛡️ 9. ファイアウォール設定

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
sudo ufw status
```

## 📈 10. 監視とログ

### アプリケーションログ
```bash
pm2 logs poker-app
pm2 logs poker-app --lines 100
```

### Nginxログ
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### システムリソース監視
```bash
pm2 monit
htop
```

## 🚨 11. トラブルシューティング

### アプリが起動しない
```bash
# ログ確認
pm2 logs poker-app --lines 200

# ポート確認
sudo lsof -i :5000

# 手動起動でエラー確認
cd /var/www/poker
node server.js
```

### データベース接続エラー
```bash
# 環境変数確認
cat .env

# データベース接続テスト
psql $DATABASE_URL
```

### Nginxエラー
```bash
# 設定テスト
sudo nginx -t

# エラーログ確認
sudo tail -f /var/log/nginx/error.log

# 再起動
sudo systemctl restart nginx
```

### Socket.io接続エラー
- WebSocket接続がブロックされていないか確認
- Nginx設定でUpgradeヘッダーが正しく設定されているか確認
- ファイアウォールでポート443が開いているか確認

## 🔐 12. セキュリティチェックリスト

- [x] SSL証明書が有効
- [x] HTTPSへの強制リダイレクト
- [x] ファイアウォールが有効
- [x] 環境変数が.envファイルに保存
- [x] JWT_SECRETが32文字以上
- [x] データベース認証情報が安全
- [x] 不要なポートが閉じられている
- [x] SSH鍵認証が設定されている

## 📝 13. 環境変数チェックリスト

デプロイ前に以下の環境変数が設定されていることを確認：

```bash
# 確認コマンド
cd /var/www/poker
cat .env | grep -v "^#" | grep "="
```

必須の環境変数：
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ NEXT_PUBLIC_APP_URL
- ✅ NEXT_PUBLIC_SOCKET_URL

オプション（機能によって必要）：
- STRIPE_SECRET_KEY（決済機能）
- SENDGRID_API_KEY（メール機能）

## 🎉 デプロイ完了！

アプリケーションは以下のURLでアクセス可能です：
- https://sinjapan-poker.com
- https://www.sinjapan-poker.com

---

**サポート**: 問題が発生した場合は、GitHub Issuesで報告してください。
