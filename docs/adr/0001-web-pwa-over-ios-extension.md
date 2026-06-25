# ADR-0001: iOS Share Extension から Web App + PWA への方針転換

## Status

Accepted

## Context

当初はiOS Share Extension（Swift）として設計していた。しかし開発環境にMacがなく（WSL2 Ubuntu）、Xcode/Simulatorが利用できないことが判明。

### 検討した選択肢

1. **iOS Share Extension（Swift）** — Mac + Xcode必須。$99/年のApple Developer Program登録も必要
2. **Web App + PWA** — WSL2 + Node.jsで完結。プラットフォーム非依存。無料ホスティング可能

## Decision

Web App + PWA で開発する。

## Consequences

- Mac/Xcode不要で開発環境が完結する
- iOS/Android/PC全対応になり、対象ユーザーが広がる
- App Store審査・Developer Program登録が不要
- PWA化でホーム画面追加可能（ネイティブに近い起動体験）
- iOS Share Sheetからの直接連携は不可（URLコピー → TuneCard起動 → ペーストのフロー）
