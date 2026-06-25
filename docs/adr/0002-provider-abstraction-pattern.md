# ADR-0002: Provider 抽象化パターンの採用

## Status

Accepted

## Context

Spotify oEmbed API は過去にCORSヘッダーの有無が変わったり、レスポンス形式が変更された実績がある。単一のAPI依存では仕様変更時にサービスが停止する。

## Decision

`TrackInfoProvider` interfaceで楽曲情報取得を抽象化し、`FallbackTrackInfoProvider` で複数実装をチェーンする。

```
OEmbedProvider → (失敗時) → 次のProvider → ... → 全失敗でエラー
```

## Consequences

- API仕様変更時、新しいProviderを追加するだけで対応可能
- 各Providerが独立しているため、テスト・差し替えが容易
- `artist: string | null` を型に組み込み、Providerごとに取得精度が異なることを許容
- Contract Tests（週次CI）で仕様変更を早期検知
