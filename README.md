# TuneCard

Spotifyで聴いている曲をX（旧Twitter）にシェアするためのWebアプリ（PWA）。

曲名・アーティスト名を含む整形テキストを生成し、ワンタップでコピーまたはXの投稿画面に遷移できます。

## 機能

- Spotify URLを貼り付けるだけで楽曲情報を取得
- 整形テキストの自動生成（`曲名 / アーティスト名 #NowPlaying`）
- クリップボードへのコピー
- Xの投稿画面への直接遷移
- コメントの追加（任意）
- PWA対応（ホーム画面に追加可能）

## 開発

### セットアップ

```bash
npm install
```

### 開発サーバー

```bash
npm run dev
```

### テスト

```bash
npm run test          # 単発実行
npm run test:watch    # ウォッチモード
```

### ビルド

```bash
npm run build
npm run preview       # ビルド結果のプレビュー
```

### コード品質

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript型チェック
npm run format        # Prettier
```

## 技術スタック

- TypeScript + React + Vite
- Tailwind CSS v4
- Vitest
- vite-plugin-pwa
- Cloudflare Pages（フロントエンド ホスティング）
- Cloudflare Workers（Spotify Web API プロキシ）

## デプロイ

Cloudflare Pages（フロント）+ Cloudflare Workers（APIプロキシ）の2層構成。mainブランチへのpushで両方が自動デプロイされる。

### 必要なGitHub設定

| 種類 | 名前 | 用途 |
|------|------|------|
| Secret | `CLOUDFLARE_API_TOKEN` | Cloudflare APIトークン（Pages + Workers 編集権限） |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | CloudflareアカウントID |
| Variable | `WORKER_URL` | Worker URL（例: `https://tunecard-api.xxx.workers.dev`） |

> `WORKER_URL` 未設定でもフロントは動作する（oEmbedフォールバック、ただしアーティスト名は取得不可）。

### Worker 初回セットアップ

```bash
cd worker
npm ci

# 1. Worker をデプロイ
npx wrangler deploy

# 2. Spotify API のシークレットを設定
npx wrangler secret put SPOTIFY_CLIENT_ID
npx wrangler secret put SPOTIFY_CLIENT_SECRET

# 3. GitHub Repository Variables に Worker URL を設定
#    Settings → Secrets and variables → Actions → Variables
#    Name: WORKER_URL
#    Value: https://tunecard-api.<your-subdomain>.workers.dev
```

### 手動デプロイ

```bash
# フロントエンド
VITE_WORKER_URL=https://tunecard-api.xxx.workers.dev npm run build
npx wrangler pages deploy dist --project-name=tunecard

# Worker
cd worker && npx wrangler deploy
```

### CI/CD パイプライン

| ワークフロー | トリガー | 内容 |
|------------|---------|------|
| `ci.yml` | push / PR to main | フロント: lint → typecheck → test → build / Worker: typecheck |
| `deploy.yml` | push to main | フロント: build → Pages デプロイ / Worker: wrangler deploy（並列） |
| `contract-test.yml` | 毎週月曜 9:00 UTC | Spotify API 仕様変更検知（失敗時 Issue 自動作成） |

### Cloudflare FAQ

**Q: Pages と Workers の違いは？**

Pages はフロントエンド（HTML/CSS/JS の配信）、Workers はバックエンド（API サーバー）。Pages が画面を表示し、Workers が Spotify API への問い合わせを処理する。

**Q: 無料で使い続けられる？**

Free プランに期間制限はない。上限は Pages が帯域無制限・500ビルド/月、Workers が10万リクエスト/日。個人利用なら実質無料。上限を超えても自動課金されず、リクエストがエラーになるだけ。Workers 有料プラン（$5/月）で月1,000万リクエストまで拡張可能。

**Q: Push したら自動で公開される？**

main ブランチへの push（またはPRマージ）で GitHub Actions が起動し、約1分で Pages と Workers が同時に更新される。

**Q: サービスを停止・廃止したいときは？**

Cloudflare ダッシュボード → Workers & Pages から `tunecard`（Pages）と `tunecard-api`（Workers）を Delete する。ソースコードや Spotify credentials には影響しない。再開したければ再デプロイするだけ。

## アーキテクチャ

詳細は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照。

- **Provider抽象化パターン**: Spotify APIの仕様変更に対するフォールバックチェーン
- **Contract Tests**: 週次CIでSpotify APIの変更を早期検知
- **設計判断記録**: [docs/adr/](docs/adr/) にADR（Architecture Decision Records）として記録

## ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [docs/PRD.md](docs/PRD.md) | プロダクト要件定義 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 技術アーキテクチャ |
| [docs/ROADMAP.md](docs/ROADMAP.md) | 開発ロードマップ |
| [docs/adr/](docs/adr/) | 設計判断記録（ADR） |
| [CHANGELOG.md](CHANGELOG.md) | 変更履歴 |
| [SECURITY.md](SECURITY.md) | セキュリティポリシー |

## ライセンス

MIT
