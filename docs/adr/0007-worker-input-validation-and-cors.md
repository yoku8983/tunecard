# ADR-0007: Worker の入力検証と CORS オリジン制限

## ステータス

Accepted

## コンテキスト

セキュリティ監査（2026-11）で、Cloudflare Worker（`worker/src/index.ts`）に次の問題が見つかった。

- `/track` `/album` `/playlist` の `id` を検証せず `https://api.spotify.com/v1/<type>/${id}` に埋め込んでいた。
  `id=../artists/...` のようなパスで、アプリのアクセストークンを使って想定外の Spotify API エンドポイントを呼べた。
- `Access-Control-Allow-Origin: *` で、任意のサイトのブラウザから Worker を呼べた（無料の Spotify プロキシ化 →
  アプリの Spotify レート枠・Workers 無料枠の消費リスク）。
- `/image` プロキシはホスト名のみ検証で、スキーム・ポート・リダイレクト先は見ていなかった。

## 決定

- **ID 検証**: `id` は Spotify ID の形式（base62 22文字 `^[A-Za-z0-9]{22}$`）以外を 400 で拒否する。
- **画像 URL 検証**: `https` かつ既定ポート・userinfo なし・許可ホスト完全一致のみ許可。上流 fetch は
  `redirect: 'manual'` とし、許可外ホストへのリダイレクト追従をしない。
- **CORS**: 許可オリジンを `wrangler.toml` の `[vars] ALLOWED_ORIGINS`（カンマ区切り）で管理し、
  一致したオリジンにだけ `Access-Control-Allow-Origin` を返す。Pages のプレビュー用に
  `https://*.tunecard.pages.dev` 形式のサブドメインワイルドカードを許可する。応答は常に `Vary: Origin`。
- 検証ロジックは Workers 固有 API に依存しない純粋関数として `worker/src/validation.ts` に切り出し、
  フロントの Vitest（`tests/worker/`）でテストする（Worker 側にテスト基盤を追加しないため）。
- **レート制限**: CORS はブラウザ経由しか防げないため、Workers Rate Limiting バインディング
  （`wrangler.toml` の `[[ratelimits]]`、`env.RATE_LIMITER`）でアクセス元 IP（`CF-Connecting-IP`）ごとに
  60秒あたり30回までに制限し、超過時は 429 + `Retry-After: 60` を返す。OPTIONS（プリフライト）は数えない。
  バインディング未設定や障害時は通す（fail-open）。ロジックは `worker/src/rate-limit.ts`。

## 理由

- 入力を「既知の正しい形式」に限定するのが最小コストで確実（ブラックリスト方式は抜けが出る）。
- `ALLOWED_ORIGINS` を設定値にしたのは、Pages の URL 変更やカスタムドメイン追加時にコード修正なしで対応するため。

## 結果・制約

- レート制限のカウントは Cloudflare の拠点ごとで、厳密な上限ではない（大量アクセスを大まかに止める用途）。
  上限は1回のシェアで2リクエスト程度という利用実態から、通常利用では届かない値にしている。
- WAF のレート制限ルールは独自ドメイン（Cloudflare ゾーン）が前提のため、`workers.dev` の本 Worker では使わない。
- Pages の本番 URL・カスタムドメインを変えたら `ALLOWED_ORIGINS` を更新すること（漏れると Worker 呼び出しが
  CORS で失敗し、oEmbed フォールバック＝artist=null になり、画像付き共有も失敗する）。
