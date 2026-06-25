# TuneCard — Architecture Document

> PRD v2.0 (Web App + PWA) に基づく詳細設計

## 1. データフロー

```
User pastes Spotify URL
  │
  ▼
parseSpotifyUrl(input)  ──→  null (invalid) ──→ Error UI
  │
  ▼ SpotifyUrl
FallbackTrackInfoProvider.fetchTrackInfo(spotifyUrl)
  │
  ├─ WebApiProvider (Cloudflare Worker経由, Spotify Web API)
  │   └─ 失敗時 ──→ 次のProviderへ
  └─ OEmbedProvider (browser fetch, 認証不要)
      └─ 失敗時 ──→ 全Provider失敗エラー
  │
  ▼ TrackInfo
formatShareText(trackInfo, template, comment?)
  │
  ▼ string
UI表示: プレビュー → コピー or X投稿
```

## 2. 型定義

```typescript
// --- URL ---
type SpotifyContentType = 'track' | 'album' | 'playlist' | 'artist' | 'unknown';

interface SpotifyUrl {
  readonly originalUrl: string;
  readonly contentType: SpotifyContentType;
  readonly spotifyId: string;
}

// --- 楽曲情報 ---
interface TrackInfo {
  readonly title: string;
  readonly artist: string | null; // oEmbedではnull（HTMLページ<title>からのみ取得可能）
  readonly spotifyUrl: string;
  readonly thumbnailUrl?: string;
}

// --- Provider ---
interface TrackInfoProvider {
  readonly name: string;
  fetchTrackInfo(url: SpotifyUrl): Promise<TrackInfo>;
}

// --- oEmbed APIレスポンス ---
interface OEmbedResponse {
  title: string;           // 曲名のみ（アーティスト名を含まない）
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  html: string;
  type: string;            // "rich"
  version: string;         // "1.0"
  provider_name: string;   // "Spotify"
  provider_url: string;
}
```

## 3. モジュール責務

| モジュール | 関数/クラス | 入力 | 出力 | エラー時 |
|-----------|-----------|------|------|---------|
| `spotify-url-parser` | `parseSpotifyUrl(input: string)` | 任意の文字列 | `SpotifyUrl \| null` | null を返す |
| `oembed-title-parser` | `parseSpotifyTitle(rawTitle: string)` | oEmbed title or HTMLタイトル | `{ title: string; artist: string \| null }` | rawTitleをそのままtitleに、artist=null |
| `share-text-formatter` | `formatShareText(info: TrackInfo, template: string, comment?: string)` | TrackInfo + テンプレート + コメント | 整形済みテキスト | — |
| `web-api-provider` | `WebApiProvider.fetchTrackInfo(url)` | SpotifyUrl | `Promise<TrackInfo>` | Error throw |
| `oembed-provider` | `OEmbedProvider.fetchTrackInfo(url)` | SpotifyUrl | `Promise<TrackInfo>` | Error throw |
| `fallback-provider` | `FallbackTrackInfoProvider.fetchTrackInfo(url)` | SpotifyUrl | `Promise<TrackInfo>` | 最後のエラーをthrow |

## 4. エラーハンドリング戦略

- **URLバリデーション**: `parseSpotifyUrl` がnullを返した時点で即座にエラーUI表示
- **Provider タイムアウト**: `AbortSignal.timeout(5000)` で各Provider 5秒
- **フォールバック**: Provider失敗時は `console.warn` でログ出力し、次のProviderへ
- **全Provider失敗**: ユーザー向けメッセージ「楽曲情報を取得できませんでした。URLを確認してください。」
- **ネットワークエラー**: fetchの `TypeError` をキャッチ

## 5. テンプレート仕様

- デフォルト: `{title} / {artist} #NowPlaying\n{url}`
- プレースホルダー: `{title}`, `{artist}`, `{url}`
- **artist が null の場合**: `{artist}` とその前後の接続テキスト（` / `）を省略
  - 例: `{title} / {artist} #NowPlaying` → `{title} #NowPlaying`
- **コメントがある場合**: テキスト先頭に `{comment}\n` を追加
  - 例: `いい曲!\n曲名 / アーティスト #NowPlaying\nhttps://...`

## 6. oEmbed API に関する重要な注意

Spotify oEmbed API (`https://open.spotify.com/oembed?url={url}`) のレスポンスでは、`title` フィールドに **曲名のみ** が含まれる（例: "Shape of You"）。アーティスト名は含まれない。

一方、SpotifyのHTMLページの `<title>` タグには以下の形式で曲名とアーティスト名が含まれる:
- Track: `"Shape of You - song and lyrics by Ed Sheeran | Spotify"`
- Album: `"Discovery - Album by Daft Punk | Spotify"`

v1.1 より `WebApiProvider` を導入し、Cloudflare Worker 経由で Spotify Web API (Client Credentials Flow) を呼び出すことでアーティスト名を取得。Worker 未設定時は oEmbed にフォールバックし、`artist` は `null` となる。

## 7. インフラ構成

### デプロイ構成

```
┌─────────────────────────────────────────────────────┐
│                   GitHub Actions                     │
│  main push → deploy-frontend ──→ Cloudflare Pages    │
│            → deploy-worker   ──→ Cloudflare Workers   │
└─────────────────────────────────────────────────────┘

┌──────────────┐       HTTPS        ┌────────────────────┐
│   ブラウザ    │ ────────────────→  │  Cloudflare Pages   │
│  (PWA/SPA)   │                    │  tunecard.pages.dev │
└──────┬───────┘                    └────────────────────┘
       │
       │  fetch /track?id=xxx
       ▼
┌────────────────────┐  Client Credentials  ┌──────────────────┐
│ Cloudflare Workers  │ ──────────────────→  │    Spotify API    │
│ tunecard-api.       │                      │  api.spotify.com  │
│   workers.dev       │ ←──────────────────  │                  │
└────────────────────┘   TrackInfo JSON      └──────────────────┘
```

### CI/CD パイプライン

| ワークフロー | トリガー | 内容 |
|------------|---------|------|
| `ci.yml` | push / PR to main | フロント: lint → typecheck → test → build / Worker: typecheck |
| `deploy.yml` | push to main | フロント: build → Pages デプロイ / Worker: wrangler deploy（並列） |
| `contract-test.yml` | 毎週月曜 9:00 UTC | Spotify API 仕様変更検知 |

### 環境変数・シークレット

| 変数 | 管理場所 | 用途 |
|------|---------|------|
| `VITE_WORKER_URL` | GitHub Variables (`WORKER_URL`) → ビルド時注入 | フロントからWorkerへの接続先 |
| `SPOTIFY_CLIENT_ID` | Wrangler Secrets | Spotify Web API 認証 |
| `SPOTIFY_CLIENT_SECRET` | Wrangler Secrets | Spotify Web API 認証 |
| `CLOUDFLARE_API_TOKEN` | GitHub Secrets | CI/CD デプロイ用 |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Secrets | CI/CD デプロイ用 |
