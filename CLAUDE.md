必ず日本語で回答してください。

# TuneCard

Spotifyの曲をX（Twitter）にシェアするPWA。React + Vite + TypeScript。

## コマンド

```bash
npm run dev          # 開発サーバー (port 5173)
npm run build        # プロダクションビルド → dist/
npm run test         # Vitest 単発実行
npm run test:watch   # Vitest ウォッチモード
npm run test:coverage # カバレッジレポート
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run format       # Prettier
```

## 技術スタック

- TypeScript 6 + React 19 + Vite 8
- Tailwind CSS v4（CSS-first、tailwind.config不要、カスタムテーマは `@theme` ディレクティブで定義）
- Lucide React（アイコン、tree-shakeable）
- Vitest 4（vitest.config.ts は vite.config.ts と分離必須）
- ESLint 9（flat config、eslint.config.ts）
- vite-plugin-pwa（autoUpdate、manifest inline）
- ホスティング: Cloudflare Pages（deploy.yml）

## アーキテクチャ

@docs/ARCHITECTURE.md

- **Provider抽象化パターン**: `TrackInfoProvider` interface → `FallbackTrackInfoProvider` でチェーン
- **Graceful degradation**: `TrackInfo.artist` は `string | null`。UI・フォーマッタともにnull対応済み
- **Contract Tests**: `tests/contract/` — 週次CIで実Spotify APIを叩き仕様変更を検知。通常テストからは除外

## コーディング規約

- TDD: テスト先行（Red → Green → Refactor）
- `erasableSyntaxOnly: true` — TypeScript 6ではパラメータプロパティ不可。明示的なフィールド宣言 + コンストラクタ代入
- `verbatimModuleSyntax: true` — 型インポートには `import type` を使用
- fetchモックは `vi.stubGlobal('fetch', ...)` を使用
- コンポーネントは関数コンポーネント + hooks

## ディレクトリ構成

```
src/core/          — ビジネスロジック（types, parsers, formatter）
src/core/providers/ — TrackInfoProvider実装（oEmbed, fallback）
src/components/    — Reactコンポーネント
src/hooks/         — カスタムhooks (useTrackInfo)
src/utils/         — ユーティリティ (clipboard, canShareFiles)
tests/core/        — ユニットテスト
tests/contract/    — Contract Tests（CI週次、通常テストから除外）
worker/            — Cloudflare Worker（Spotify Web APIプロキシ）
docs/              — PRD, ARCHITECTURE, ADR
```

## ドキュメント更新ルール

- 機能追加・設計変更時は ARCHITECTURE.md / ADR / CLAUDE.md を同時に更新する
- 型定義の変更は ARCHITECTURE.md の型定義セクションにも反映する
- 設計判断（なぜその方式を選んだか）は ADR に記録する

## 重要な注意

- Spotify Web API (Worker経由) でアーティスト名取得。Worker未設定時はoEmbedにフォールバック（artist=null）
- テスト設定は `vitest.config.ts` に書く（`vite.config.ts` の `test` プロパティはVitest 4で非対応）
- `baseUrl` は TypeScript 6 で非推奨。パスエイリアスは vite.config.ts の `resolve.alias` で設定

@docs/adr/
