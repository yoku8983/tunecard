# Security Policy

## Reporting Vulnerabilities

セキュリティに関する問題を見つけた場合は、GitHub Issues ではなく kubo500t@gmail.com まで直接ご連絡ください。

## セキュリティ上の考慮事項

### APIキー・シークレット

- Spotify Client ID / Client Secret はCloudflare Workersのシークレット（`wrangler secret`）に格納し、フロントエンドに露出させない
- `.env` ファイルはリポジトリにコミットしない（`.gitignore` に含まれている）
- GitHub Actions のシークレット（`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`）はリポジトリ設定で管理

### CORS

- Cloudflare Workerは `Access-Control-Allow-Origin` を本番ドメインに限定する（`*` は開発時のみ）

### 入力バリデーション

- ユーザー入力（URL）は `parseSpotifyUrl()` で厳密にバリデーション。Spotify URLのみ受け付ける
- コメント入力はテキストとしてのみ使用し、HTMLとしてレンダリングしない（XSS防止）

### 依存関係

- `npm audit` で定期的に脆弱性チェック
- Dependabotによる自動更新の検討
