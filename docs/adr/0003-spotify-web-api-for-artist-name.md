# ADR-0003: アーティスト名取得に Spotify Web API を採用

## Status

Accepted

## Context

Spotify oEmbed API の `title` フィールドは曲名のみを返し、アーティスト名を含まない。アーティスト名取得のために以下の選択肢を比較した（Issue #2）。

### 検討した選択肢

1. **Cloudflare Workers + HTMLスクレイピング** — SpotifyページのHTML `<title>` タグをパース。コスト0円、シークレット不要。ただしHTML構造変更で壊れるリスク
2. **Cloudflare Workers + Spotify Web API** — Client Credentials Flowで公式API。コスト0円（Premium課金済み）。リッチなデータ、公式仕様で安定
3. **Vercel/Netlify Functions** — 同等機能だがCloudflare Pagesとの二重管理
4. **AWS Lambda** — 設定が複雑、個人プロジェクトにはオーバー
5. **公開CORSプロキシ** — 予告なし停止、セキュリティリスク。本番利用不可
6. **自前VPS** — 運用負荷が過大

## Decision

Cloudflare Workers + Spotify Web API（Client Credentials Flow）を採用する。

### 決定理由

- 開発者がSpotify Premium Standard課金済みのため、Development Modeの追加コストなし
- 公式APIのためHTML構造変更による破損リスクがない
- アーティスト名以外にもアルバム名、ジャケット画像（複数サイズ）、再生時間等のリッチなデータが取得可能
- 既にCloudflare Pagesでホスティング中のため、Workersとの統合がシームレス
- HTMLスクレイピング方式の方が実装は簡単だが、長期的な保守コスト（仕様変更耐性）を重視

## Consequences

- Spotify Developer Dashboardでのアプリ登録が必要
- Client ID + Client Secretのシークレット管理（Wrangler secrets）
- トークン取得・期限切れ再取得のロジックが必要（1時間有効）
- 将来的に取得データを拡充しやすい（アルバム名、ジャケ画像等）
