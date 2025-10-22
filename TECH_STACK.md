# SIN JAPAN POKER - 技術スタック

## 🎯 システムアーキテクチャ

### フロントエンド

#### 基盤技術
- **フレームワーク**: Next.js 14 (App Router) + TypeScript
- **UIライブラリ**: 
  - TailwindCSS 3.x（カスタムデザインシステム）
  - HeadlessUI（アクセシブルなコンポーネント）
  - Framer Motion（アニメーション）
- **状態管理**: Zustand + Persist Middleware
- **フォント**: Inter（Google Fonts）

#### リアルタイム通信
- **Socket.IO Client** 4.6.0
  - ゲームルーム管理
  - リアルタイム同期
  - プレイヤーアクション配信

#### Live2Dキャラクター（オプション）
- **Live2D Cubism SDK for Web**
  - HTML5 Canvas統合
  - アバターアニメーション
  - 感情表現システム

---

### バックエンド

#### メインサーバー
- **言語**: Node.js 18+ (LTS)
- **フレームワーク**: Express.js 4.x
- **TypeScript**: 完全型安全

#### ゲームロジック
```typescript
StateMachine設計:
- Room単位で独立したゲームステート管理
- プレイヤーアクション処理
- ポットロジック / ベット管理
- ハンド評価エンジン
```

#### 認証システム
**優先順位付き選択肢**:
1. **Firebase Auth**（推奨）
   - メール/パスワード
   - Google OAuth
   - Magic Link
   - 匿名認証（ゲストプレイ）

2. **Supabase Auth**（代替案）
   - オープンソース
   - PostgreSQL連携

3. **Magic Link**（シンプル認証）
   - パスワードレス
   - メールのみ

---

### データベース

#### メインDB
**PostgreSQL 15+**
```sql
主要テーブル:
- users（ユーザー情報 + KYC）
- wallets（リアル/プレイマネー）
- transactions（入出金履歴）
- games（ゲーム履歴）
- hands（ハンド履歴）
- rake_records（レーキ記録）
- affiliate_commissions（アフィリエイト報酬）
- compliance_logs（コンプライアンスログ）
```

#### キャッシュ・セッション管理
**Redis 7+**
```
用途:
- セッション管理
- マッチメイキングキュー
- リアルタイムランキング
- レート制限
- ゲームステートキャッシュ
```

#### 補助DB（オプション）
**Firestore**
- リアルタイム通知
- チャットメッセージ
- 軽量データ同期

---

### KYC連携

#### Sumsub（推奨）
```typescript
機能:
- 本人確認書類アップロード（パスポート、運転免許証）
- 顔認証（Liveness Check）
- 住所確認
- AML/CFTスクリーニング
- 多言語対応（日本語含む）

実装:
import { Sumsub } from '@sumsub/websdk';

const sumsub = Sumsub.init({
  apiUrl: 'https://api.sumsub.com',
  accessToken: process.env.SUMSUB_TOKEN,
  applicantEmail: user.email,
  applicantPhone: user.phone,
  lang: 'ja',
});
```

#### Persona（代替案）
- シンプルなAPI
- 迅速な審査
- カスタマイズ可能なフロー

---

### 決済API

#### 仮想通貨決済（優先）
1. **CoinPayments**
   - BTC, ETH, USDT, USDC, LTC
   - 即時通知システム
   - IPN（Instant Payment Notification）

2. **NOWPayments**
   - 自動換金機能
   - API Key認証
   - Webhook統合

3. **Stripe（オプション - フィアット）**
   - クレジットカード決済
   - Google Pay / Apple Pay
   - 3Dセキュア対応

4. **PayMongo（フィリピン・アジア向け）**
   - GCash, Maya統合
   - 銀行振込

#### 決済フロー
```typescript
1. ユーザーがチップ購入リクエスト
2. 決済APIでインボイス生成
3. 仮想通貨アドレス発行
4. Webhook で入金確認
5. チップ自動付与
6. トランザクション記録
```

---

### メール送信

#### SendGrid（推奨）
```typescript
用途:
- 登録確認メール
- パスワードリセット
- 入出金通知
- KYC承認通知
- プロモーションメール

実装例:
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: 'noreply@sinjapanpoker.com',
  templateId: 'd-xxxxx',
  dynamicTemplateData: {
    username: user.username,
    amount: deposit.amount,
  },
});
```

#### Mailgun（代替案）
- 高い到達率
- 詳細な分析機能

---

### ストレージ

#### Cloudflare R2（推奨）
```typescript
用途:
- ユーザーアバター画像
- KYC書類（暗号化）
- ゲームリプレイ動画
- ログファイル

特徴:
- S3互換API
- 無料エグレス（転送量無料）
- グローバルCDN

実装:
import { S3Client } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
```

#### AWS S3（代替案）
- 実績豊富
- 豊富なサービス連携

---

### 管理者画面（Admin Dashboard）

#### フレームワーク
**Next.js 14 + AdminJS**

#### 主要機能

##### 1. リアルタイムテーブル監視
```typescript
機能:
- 全ゲームテーブル可視化
- プレイヤーの手札表示（ホールカード）
- コミュニティカード表示
- ポットサイズ / ベット額
- プレイヤーアクション履歴

実装:
Socket.IO接続で全テーブルをsubscribe
管理者専用チャンネルで全データ受信
```

##### 2. プレイヤー管理
```typescript
- ユーザー検索・一覧
- KYCステータス確認・承認
- チップ残高確認
- 手動チップ付与/削減
- BANアカウント（一時/永久）
- 強制ログアウト
- IPアドレス / デバイスID確認
```

##### 3. 不正検知システム
```typescript
監視項目:
- 同一IPからの複数アカウント
- 異常なプレイ間隔（Bot疑い）
- 常勝アカウント（共謀疑い）
- 大額入出金パターン
- VPN/Proxyアクセス

アラート:
- リアルタイム通知
- Slack / Discord連携
- メール通知
```

##### 4. 財務管理
```typescript
機能:
- 日次/月次売上統計
- レーキ収益グラフ
- トーナメント参加料収益
- アフィリエイトコスト
- 入出金履歴
- 決済ステータス監視
- レーキ率動的変更
- キャップ設定変更
```

##### 5. コンプライアンス
```typescript
- AML/CFTアラート確認
- 高リスクトランザクション審査
- KYC書類レビュー
- 規制当局レポート生成
- ログエクスポート（CSV/JSON）
```

---

### インフラ・デプロイ

#### ホスティング
**Vercel（フロントエンド）**
- Next.js最適化
- 自動デプロイ
- Edge Functions

**Railway / Render（バックエンド）**
- Node.js対応
- PostgreSQL managed
- Redis managed
- 自動スケーリング

#### DNS & CDN
**Cloudflare**
- DNS管理
- DDoS Protection
- WAF（Web Application Firewall）
- Rate Limiting
- Geo Blocking
- SSL/TLS証明書

#### モニタリング
**Sentry**
- エラートラッキング
- パフォーマンス監視

**Datadog / New Relic**
- APM（Application Performance Monitoring）
- ログ集約
- メトリクス可視化

---

### 開発ツール

#### コード品質
```json
{
  "ESLint": "コード品質チェック",
  "Prettier": "コードフォーマット",
  "Husky": "Git Hooks",
  "lint-staged": "コミット前チェック"
}
```

#### テスト
```json
{
  "Jest": "ユニットテスト",
  "React Testing Library": "コンポーネントテスト",
  "Playwright": "E2Eテスト",
  "Supertest": "APIテスト"
}
```

#### CI/CD
**GitHub Actions**
```yaml
- Lint & Format Check
- Unit Tests
- Build Verification
- Auto Deploy（main branch）
```

---

### セキュリティ

#### 認証・認可
- JWT Token（HttpOnly Cookie）
- Refresh Token Rotation
- CSRF Protection
- Rate Limiting（Redis）

#### データ保護
- 暗号化（at rest & in transit）
- PII（個人識別情報）暗号化
- GDPR準拠

#### 監査
- 全API呼び出しログ
- 管理者アクション記録
- 5年間データ保存

---

### パフォーマンス最適化

#### フロントエンド
- Code Splitting
- Image Optimization（Next.js）
- Lazy Loading
- Service Worker（オフライン対応）

#### バックエンド
- Database Indexing
- Query Optimization
- Connection Pooling（pg-pool）
- Redis Caching Strategy

---

### 開発環境セットアップ

```bash
# 必要な環境変数
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/poker
REDIS_URL=redis://localhost:6379
FIREBASE_API_KEY=xxx
SUMSUB_API_KEY=xxx
COINPAYMENTS_API_KEY=xxx
SENDGRID_API_KEY=xxx
R2_ACCESS_KEY_ID=xxx
```

---

### ライセンス
**SIN JAPAN LIBERIA CO.,INC**
- Curaçao eGaming License（申請中）
- AML/CFT準拠
- GDPR準拠
- 国際ギャンブル規制準拠

