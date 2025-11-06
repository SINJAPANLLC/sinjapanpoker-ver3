#!/bin/bash

# SIN JAPAN POKER - Hostinger VPS デプロイスクリプト
# SSH情報: ssh -p 65002 u170935974@45.13.135.26

echo "🚀 SIN JAPAN POKER デプロイ開始..."

# カラー定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# プロジェクトディレクトリ
PROJECT_DIR="/home/u170935974/poker"
REPO_URL="https://github.com/SINJAPANLLC/sinjapan-poker-ver2.git"

echo -e "${BLUE}📦 プロジェクトディレクトリを確認中...${NC}"

# プロジェクトディレクトリが存在するか確認
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✅ 既存プロジェクトを更新します${NC}"
    cd $PROJECT_DIR
    
    # 最新コードを取得
    echo -e "${BLUE}📥 最新コードを取得中...${NC}"
    git pull origin main
else
    echo -e "${BLUE}📂 新規プロジェクトをクローンします${NC}"
    mkdir -p /home/u170935974
    cd /home/u170935974
    git clone $REPO_URL poker
    cd poker
fi

echo -e "${BLUE}📦 依存関係をインストール中...${NC}"
npm install --production

echo -e "${BLUE}🔨 Next.jsアプリケーションをビルド中...${NC}"
npm run build

echo -e "${BLUE}🗄️ データベースマイグレーション実行中...${NC}"
npm run db:push

echo -e "${BLUE}🔄 PM2でアプリケーションを起動/再起動中...${NC}"

# PM2がインストールされているか確認
if ! command -v pm2 &> /dev/null
then
    echo -e "${BLUE}📦 PM2をインストール中...${NC}"
    npm install -g pm2
fi

# 既存のアプリケーションを確認
if pm2 list | grep -q "poker-app"; then
    echo -e "${GREEN}🔄 既存のアプリケーションを再起動します${NC}"
    pm2 restart poker-app
else
    echo -e "${GREEN}🚀 新規アプリケーションを起動します${NC}"
    pm2 start server.js --name poker-app --max-memory-restart 1G
    pm2 save
    pm2 startup
fi

echo -e "${GREEN}✅ デプロイ完了！${NC}"
echo ""
echo -e "${BLUE}📊 アプリケーション状態:${NC}"
pm2 status

echo ""
echo -e "${BLUE}📝 ログを確認:${NC}"
echo "  pm2 logs poker-app"
echo ""
echo -e "${BLUE}🌐 アクセス:${NC}"
echo "  http://45.13.135.26:5000"
echo ""
echo -e "${GREEN}🎉 デプロイが成功しました！${NC}"
