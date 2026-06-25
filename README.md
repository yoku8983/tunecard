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
- Cloudflare Pages（ホスティング）

## アーキテクチャ

詳細は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照。

- **Provider抽象化パターン**: Spotify APIの仕様変更に対するフォールバックチェーン
- **Contract Tests**: 週次CIでSpotify APIの変更を早期検知

## ライセンス

MIT
