# TuneCard — Product Requirements Document

> **v2.0** — Webアプリ + PWA版（iOS Share Extension版から方針転換）

## 1. プロダクト概要

**TuneCard** は、Spotifyで聴いている曲をX（旧Twitter）にシェアする際、曲名・アーティスト名を含む整形テキストをワンタップで生成するWebアプリ（PWA）。

Spotifyの標準シェア機能ではXへの投稿にリンクしか含まれず、曲名・アーティスト名がテキストに入らない。既存のワークアラウンド（iOSショートカット、IFTTT）はSpotifyの仕様変更で頻繁に壊れる。TuneCardはPWAとしてホーム画面に常駐し、Spotifyからコピーしたリンクをペーストするだけで投稿用テキストを生成する。

### 対象ユーザー

自分自身（個人ツール）。GitHub公開前提で同じ課題を持つユーザーにも使ってもらう。

### 競合状況

この課題を解決する専用Webアプリ・iOSアプリは存在しない。iOSショートカットやIFTTTによるワークアラウンドのみ。いずれもSpotify仕様変更への追従が困難。

### なぜWebアプリか

- 開発環境にMacが不要（WSL2 + Claude Codeで完結）
- プラットフォーム非依存（iOS/Android/PC全対応）
- App Store審査・Apple Developer Program登録（$99/年）が不要
- PWA化でホーム画面追加 → ネイティブアプリに近い起動体験


## 2. ユーザーストーリーと要求仕様

### US-1: 基本シェアフロー（MVP）

**ストーリー:** Spotifyで曲を聴いていて「この曲シェアしたい」と思ったとき、Spotifyのリンクをコピー → TuneCard（ホーム画面のPWA）を開く → URLを貼り付ける → 曲名・アーティスト名・リンクが整形されたテキストが表示される → コピーまたはXの投稿画面に遷移して投稿する。

**受け入れ条件:**
- 入力欄にSpotify URLをペーストできる
- ペースト後、自動で楽曲情報を取得し整形テキストを表示する
- デフォルトフォーマット: `{title} / {artist} #NowPlaying\n{url}`
- 「コピー」ボタンでテキストをクリップボードにコピーできる
- 「Xで投稿」ボタンでXの投稿画面に遷移し、テキストが入力済みの状態になる
- 処理中はローディング表示、エラー時はメッセージを表示する
- 不正なURL（Spotify以外）にはエラーメッセージを出す

### US-2: テキストフォーマットのカスタマイズ

**ストーリー:** シェアするテキストのフォーマットを自分好みに変更したい。

**受け入れ条件:**
- 設定画面でフォーマットテンプレートを編集できる
- プレースホルダー: `{title}`, `{artist}`, `{url}`
- デフォルト: `{title} / {artist} #NowPlaying\n{url}`
- プリセット複数あり（シンプル、ハッシュタグなし等）
- 設定はlocalStorageに保存される

### US-3: 一言コメントの追加

**ストーリー:** シェアテキストに自分のコメントを添えたい。

**受け入れ条件:**
- テキスト生成後、コメント入力欄に一言入力できる
- コメントが整形テキストの先頭に追加される
- コメントは任意（空欄でもOK）

### US-4: アルバム・プレイリストのシェア対応

**ストーリー:** 楽曲だけでなくアルバムやプレイリストのURLも同様にシェアしたい。

**受け入れ条件:**
- `open.spotify.com/album/xxx` 形式のURLに対応
- `open.spotify.com/playlist/xxx` 形式のURLに対応
- 適切なタイトル情報を取得して整形する

### US-5: PWA対応

**ストーリー:** スマホのホーム画面からワンタップで起動したい。

**受け入れ条件:**
- PWAとしてインストール可能（manifest.json, Service Worker）
- ホーム画面アイコンがある
- オフライン時は前回の設定・UIが表示される（APIは当然オンライン必須）
- スプラッシュスクリーンがある

### US-6: シェア履歴

**ストーリー:** 過去にシェアした曲を振り返りたい。

**受け入れ条件:**
- シェア履歴一覧を画面内で確認できる
- 曲名、アーティスト名、日時を表示
- 履歴からの再シェアが可能
- IndexedDB or localStorageに保存


## 3. MVP定義

### MVP（v1.0）スコープ — IN

- US-1: 基本シェアフロー（URL入力 → テキスト生成 → コピー/X遷移）
- US-3: 一言コメント入力
- US-5: PWA対応（ホーム画面追加可能な状態）
- レスポンシブデザイン（モバイルファースト）

### MVP後（v1.x）スコープ — LATER

- US-2: フォーマットカスタマイズ
- US-4: アルバム・プレイリスト対応
- US-6: シェア履歴

### スコープ外 — OUT

- 画像（ジャケット写真）の添付
- Spotify OAuth認証フロー
- X以外のSNS対応（Threads, Bluesky等）
- 収益化機能
- 楽曲の再生機能


## 4. 技術アーキテクチャ

### 4.1 全体構成

```
┌──────────────────────────────────────────────────────┐
│  Browser (PWA)                                       │
│                                                      │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────┐  │
│  │ URL Input   │──▶│ TrackInfo   │──▶│ Text      │  │
│  │ (Paste)     │   │ Fetcher     │   │ Formatter │  │
│  └─────────────┘   └──────┬──────┘   └─────┬─────┘  │
│                           │                 │        │
│                    ┌──────▼──────┐   ┌──────▼─────┐  │
│                    │ Copy to     │   │ Open X     │  │
│                    │ Clipboard   │   │ (intent)   │  │
│                    └─────────────┘   └────────────┘  │
└───────────────────────────┬──────────────────────────┘
                            │ fetch
                ┌───────────▼───────────┐
                │  Spotify oEmbed API   │
                │  (CORS対応・認証不要) │
                └───────────────────────┘
                            │ フォールバック
                ┌───────────▼───────────┐
                │  Serverless Proxy     │
                │  (Cloudflare Worker)  │
                └───────────────────────┘
```

### 4.2 技術スタック

| レイヤー | 技術選定 | 理由 |
|---------|---------|------|
| 言語 | TypeScript | 型安全、Claude Codeとの相性 |
| フレームワーク | React + Vite | 高速ビルド、シンプル構成 |
| テスト | Vitest | Viteと統合、高速実行 |
| PWA | vite-plugin-pwa | Service Worker自動生成 |
| スタイリング | Tailwind CSS | ユーティリティファースト、モバイル対応 |
| ホスティング | Cloudflare Pages | 無料、高速CDN、Workers統合 |
| APIプロキシ | Cloudflare Workers | oEmbed CORS問題時のフォールバック |
| CI | GitHub Actions | 自動テスト・デプロイ |
| リンター | ESLint + Prettier | コード品質統一 |


### 4.3 仕様変更耐性の設計（重要）

Spotifyの仕様変更に対して**壊れにくく、壊れても直しやすい**設計。

#### 4.3.1 Provider抽象化パターン

楽曲情報の取得を共通interfaceで抽象化し、複数実装+フォールバックを用意する。

```typescript
interface TrackInfo {
  title: string;       // 曲名
  artist: string;      // アーティスト名
  spotifyUrl: string;  // 元のSpotify URL
  albumName?: string;  // アルバム名（任意）
}

interface TrackInfoProvider {
  name: string;
  fetchTrackInfo(url: SpotifyUrl): Promise<TrackInfo>;
}
```

**フォールバックチェーン（優先順位）:**

1. **OEmbedProvider**（MVP、認証不要、ブラウザ直接fetch）
   - エンドポイント: `https://open.spotify.com/oembed?url={spotify_url}`
   - レスポンスの `title` フィールドから曲名・アーティスト名をパース
   - CORS対応済み（2021年以降）

2. **ProxiedOEmbedProvider**（CORSフォールバック）
   - Cloudflare Worker経由で同じoEmbed APIを叩く
   - ブラウザ直接fetchでCORSエラーが発生した場合に自動切り替え

3. **HTMLMetaProvider**（Cloudflare Worker経由）
   - SpotifyのWebページからOGPメタタグ（`og:title`, `og:description`）をスクレイピング
   - oEmbed API自体が廃止・変更された場合のバックアップ

#### 4.3.2 フォールバック実装

```typescript
class FallbackTrackInfoProvider implements TrackInfoProvider {
  name = "fallback";
  constructor(private providers: TrackInfoProvider[]) {}

  async fetchTrackInfo(url: SpotifyUrl): Promise<TrackInfo> {
    let lastError: Error | undefined;
    for (const provider of this.providers) {
      try {
        const result = await provider.fetchTrackInfo(url);
        return result;
      } catch (error) {
        console.warn(`[${provider.name}] failed:`, error);
        lastError = error as Error;
      }
    }
    throw lastError ?? new Error("All providers failed");
  }
}
```

#### 4.3.3 SpotifyURLParser の分離

URL形式の変更に備え、パースロジックを独立モジュールに分離する。

```typescript
interface SpotifyUrl {
  originalUrl: string;
  contentType: "track" | "album" | "playlist" | "artist" | "unknown";
  spotifyId: string;
}

// 対応するURL形式:
// - https://open.spotify.com/track/{id}?si=xxx
// - https://open.spotify.com/intl-ja/track/{id}?si=xxx （ロケールプレフィックス）
// - https://spotify.link/{shortId} （短縮URL → リダイレクト解決）
// - spotify:track:{id} （URI形式）
function parseSpotifyUrl(input: string): SpotifyUrl | null
```

#### 4.3.4 OEmbedレスポンスパーサーの堅牢化

oEmbedの `title` フィールド形式が変わっても最低限動く設計。

```typescript
// oEmbedのtitle形式は "曲名 - song and lyrics by アーティスト名 | Spotify" 等
// 形式が変更されても、最低限rawTitleをそのまま返す（graceful degradation）
function parseOEmbedTitle(rawTitle: string): { title: string; artist: string | null }
```

パース戦略:
1. 既知のパターン（正規表現）を順に試行
2. 全パターン失敗 → rawTitle全体をtitleとして返し、artistはnull
3. artistがnullの場合、フォーマッタはアーティスト名を省略する

#### 4.3.5 Contract Tests（CI週次実行）

実際のSpotify APIに対して週次でリクエストを送り、レスポンス構造を検証。

```typescript
// contract-tests/spotify-oembed.test.ts
describe("Spotify oEmbed API contract", () => {
  it("returns expected fields for a track URL", async () => {
    const res = await fetch(
      "https://open.spotify.com/oembed?url=https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh"
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("title");
    expect(typeof json.title).toBe("string");
    expect(json.title.length).toBeGreaterThan(0);
  });

  it("title can be parsed into track name and artist", async () => {
    const res = await fetch(
      "https://open.spotify.com/oembed?url=https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh"
    );
    const json = await res.json();
    const parsed = parseOEmbedTitle(json.title);
    expect(parsed.title.length).toBeGreaterThan(0);
    // artistがパースできなくてもテスト失敗にはしない（graceful degradation）
    // ただしwarningログを出す
    if (parsed.artist === null) {
      console.warn("WARNING: artist could not be parsed from title:", json.title);
    }
  });
});
```

CI失敗時にGitHub Issueを自動作成 → 仕様変更を即座に検知。


### 4.4 ユーザーフロー詳細

```
[Spotifyアプリ]
    │ 「…」→ シェア → リンクをコピー
    ▼
[TuneCard PWA を開く]（ホーム画面アイコン）
    │
    ▼
[URL入力欄]
    │ ペースト（または手入力）
    │ 入力検知 → SpotifyURLParser でバリデーション
    ▼
[ローディング表示]
    │ FallbackTrackInfoProvider → oEmbed API fetch
    ▼
[結果表示]
    ┌──────────────────────────────────┐
    │  🎵 曲名 / アーティスト名        │
    │                                  │
    │  ┌────────────────────────────┐  │
    │  │ コメント入力欄（任意）       │  │
    │  └────────────────────────────┘  │
    │                                  │
    │  ┌──────────────────────────┐    │
    │  │ 生成テキストプレビュー     │    │
    │  │ この曲いい                │    │
    │  │ 曲名 / Artist #NowPlaying │    │
    │  │ https://open.spotify...   │    │
    │  └──────────────────────────┘    │
    │                                  │
    │  [📋 コピー]  [𝕏 Xで投稿]       │
    └──────────────────────────────────┘
```

### 4.5 X（Twitter）への遷移

```typescript
function openXCompose(text: string): void {
  const encoded = encodeURIComponent(text);
  // Twitter Web Intentを使用（モバイル/PCどちらでも動作）
  window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");
}
```

Web Intentはモバイルでも自動的にXアプリが開く（インストール済みの場合）。URLスキーム（`twitter://`）よりも安定。


## 5. ディレクトリ構成

```
tunecard/
├── docs/
│   └── PRD.md                         # 本ドキュメント
├── src/
│   ├── main.tsx                       # エントリーポイント
│   ├── App.tsx                        # ルートコンポーネント
│   ├── components/
│   │   ├── UrlInput.tsx               # URL入力欄
│   │   ├── ResultCard.tsx             # 結果表示カード
│   │   ├── CommentInput.tsx           # コメント入力
│   │   ├── ActionButtons.tsx          # コピー/X投稿ボタン
│   │   └── ErrorMessage.tsx           # エラー表示
│   ├── core/
│   │   ├── types.ts                   # TrackInfo, SpotifyUrl等の型定義
│   │   ├── spotify-url-parser.ts      # URLパース
│   │   ├── oembed-title-parser.ts     # oEmbedタイトルパース
│   │   ├── share-text-formatter.ts    # テキスト整形
│   │   └── providers/
│   │       ├── track-info-provider.ts # Provider interface
│   │       ├── oembed-provider.ts     # oEmbed API実装
│   │       ├── proxied-oembed-provider.ts  # Worker経由
│   │       └── fallback-provider.ts   # フォールバックチェーン
│   ├── hooks/
│   │   └── useTrackInfo.ts            # React Hook
│   └── utils/
│       └── clipboard.ts              # クリップボード操作
├── tests/
│   ├── core/
│   │   ├── spotify-url-parser.test.ts
│   │   ├── oembed-title-parser.test.ts
│   │   ├── share-text-formatter.test.ts
│   │   └── providers/
│   │       ├── oembed-provider.test.ts
│   │       └── fallback-provider.test.ts
│   └── contract/
│       └── spotify-oembed.contract.test.ts  # 週次CI
├── worker/                            # Cloudflare Worker（APIプロキシ）
│   ├── src/
│   │   └── index.ts
│   └── wrangler.toml
├── public/
│   ├── manifest.json                  # PWA manifest
│   └── icons/                         # PWA icons
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .github/
│   └── workflows/
│       ├── ci.yml                     # PR時のビルド・テスト
│       ├── deploy.yml                 # main pushでCloudflare Pagesデプロイ
│       └── contract-test.yml          # 週次Contract Test
├── README.md
├── LICENSE                            # MIT
└── .gitignore
```


## 6. 開発マイルストーン

### M0: プロジェクトセットアップ（Day 1）
- Vite + React + TypeScript プロジェクト初期化
- Tailwind CSS セットアップ
- Vitest セットアップ
- ESLint + Prettier 設定
- Git初期化、GitHubリポジトリ作成・push
- GitHub Actions CI設定

### M1: コアロジック実装 — TDD（Day 2-3）
テストファーストで以下を実装する。

| モジュール | テスト観点 |
|-----------|----------|
| spotify-url-parser | 正常URL各形式、ロケールプレフィックス付き、短縮URL、URI形式、不正URL |
| oembed-title-parser | 既知のtitle形式からの分離、未知形式のgraceful degradation |
| share-text-formatter | テンプレート展開、プレースホルダー置換、コメント追加、特殊文字 |
| oembed-provider | 正常レスポンスのパース、HTTPエラー、タイムアウト（fetchモック） |
| fallback-provider | 順序通りのフォールバック、全Provider失敗時のエラー |

### M2: UI実装（Day 4-5）
- URL入力コンポーネント（ペースト検知、バリデーション）
- ローディング・エラー表示
- 結果カード（曲名・アーティスト表示）
- コメント入力欄
- テキストプレビュー
- コピー / X投稿ボタン
- レスポンシブデザイン（モバイルファースト）

### M3: PWA化 + 仕上げ（Day 6-7）
- manifest.json、Service Worker設定
- アプリアイコン作成
- 実際のSpotify URLとの結合テスト
- Contract Tests作成
- README.md作成

### M4: デプロイ（Day 8）
- Cloudflare Pages デプロイ設定
- カスタムドメイン設定（任意）
- GitHub Actions デプロイパイプライン
- Cloudflare Worker（APIプロキシ）のデプロイ（必要な場合のみ）


## 7. テスト戦略

### ユニットテスト（TDD対象、Vitest）

テストファーストで開発。Claude Codeへの指示時に `/goal` でテストクリアを目標に設定。

```
/goal "spotify-url-parser.test.ts が全てパスする"
/goal "oembed-title-parser.test.ts が全てパスする"
/goal "share-text-formatter.test.ts が全てパスする"
```

### Contract Tests（CI週次実行）

| テスト | 目的 |
|-------|------|
| oEmbed APIレスポンス構造検証 | title, thumbnail_url等のフィールド存在・型を確認 |
| oEmbed title形式検証 | 曲名・アーティスト名が取得可能な形式であることを確認 |
| Spotify URL形式検証 | 公式WebページのURL形式が変わっていないことを確認 |
| CORS対応確認 | oEmbedエンドポイントがCORSヘッダーを返すことを確認 |

### 手動テスト

| テスト | 確認内容 |
|-------|---------|
| 各種楽曲URL | 日本語タイトル、英語タイトル、複数アーティスト、feat.付き |
| X投稿遷移 | テキストが正しく引き渡されるか（モバイル/PC） |
| PWAインストール | ホーム画面追加、アイコン表示、起動 |
| オフライン | UI表示、APIエラーメッセージ |
| 各ブラウザ | Safari (iOS), Chrome (Android), Chrome (PC), Firefox |


## 8. Claude Code への指示テンプレート

### 初期指示

```
docs/PRD.md を読んで、以下の順序で進めてください。

1. M0: プロジェクトセットアップを実行する
   - Vite + React + TypeScript でプロジェクト初期化
   - Tailwind CSS, Vitest, ESLint, Prettier をセットアップ
   - ディレクトリ構成は PRD セクション5 に従う

2. M1: コアロジックをTDDで実装する
   - まず tests/core/ 以下にテストファイルを作成
   - /goal "spotify-url-parser.test.ts が全てパスする"
   - /goal "oembed-title-parser.test.ts が全てパスする"  
   - /goal "share-text-formatter.test.ts が全てパスする"
   - /goal "全てのProviderテストがパスする"

3. M2: UI実装
   - PRD セクション4.4 のユーザーフローに従ってUIを実装
   - モバイルファーストのレスポンシブデザイン
```

### 仕様変更対応時の指示

```
Spotify oEmbed APIのレスポンス形式が変わったようです。
contract/ のテストを実行して失敗箇所を確認し、
oembed-title-parser.ts を修正してテストを通してください。
fallback-provider経由で他のProviderも正常動作することを確認してください。
```


## 9. デプロイ・公開

### ホスティング

Cloudflare Pages（無料枠）を使用。

- mainブランチへのpushで自動デプロイ
- プレビューURL（PRごとに自動生成）
- カスタムドメイン設定可能

### Cloudflare Worker（APIプロキシ）

oEmbed APIのCORSが壊れた場合のみ使用するサーバーレスプロキシ。

```typescript
// worker/src/index.ts
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const spotifyUrl = url.searchParams.get("url");
    if (!spotifyUrl) return new Response("Missing url param", { status: 400 });

    const oembedRes = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`
    );
    const data = await oembedRes.text();

    return new Response(data, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
```


## 10. リスクと対策

| リスク | 影響 | 対策 |
|-------|------|------|
| Spotify oEmbed APIの廃止・変更 | 楽曲情報が取得できなくなる | フォールバックチェーン + Contract Testsで早期検知 |
| oEmbed CORS対応の撤回 | ブラウザ直接fetchが失敗 | Cloudflare Workerプロキシへ自動切り替え |
| oEmbedのtitle形式変更 | パース失敗 | graceful degradation: パース失敗時はrawTitle使用 |
| Spotify共有リンク形式の変更 | URLパース失敗 | SpotifyURLParserを分離、テストで複数形式カバー |
| X Web Intentの変更 | X遷移が動かなくなる | 標準的なintent URLを使用、クリップボードコピーは常に動作 |
| Cloudflare Pages/Workers停止 | サービスダウン | 静的サイトなので別ホスティングへの移行が容易 |


## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-06-25 | v1.0 | 初版作成（iOS Share Extension版） |
| 2026-06-25 | v2.0 | Webアプリ + PWA版に全面改訂。Mac不要の開発フローに変更 |