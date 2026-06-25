# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

## [1.1.0] - 2026-06-26

### Added

- Spotify Web APIによるアーティスト名取得（Cloudflare Workers + Client Credentials Flow）
- Provider抽象化パターンにWebApiProviderを追加（Worker未設定時はoEmbedにフォールバック）
- Cloudflare Workers デプロイの自動化（GitHub Actions）

### Changed

- CI に Worker 側の typecheck を追加
- デプロイワークフローにフロントビルド時の `VITE_WORKER_URL` 注入を追加

## [1.0.0] - 2026-06-25

### Added

- Spotify URL貼り付けで楽曲情報を取得し、整形テキストを生成
- クリップボードへのコピー機能
- Xの投稿画面への直接遷移（Web Intent）
- コメント入力機能（任意）
- PWA対応（ホーム画面追加、Service Worker）
- Provider抽象化パターン（フォールバックチェーン）
- Contract Tests（週次CIでSpotify API仕様変更を検知）
- CI/CD（GitHub Actions → Cloudflare Pages）

### Known Issues

- ~~アーティスト名が取得できない（oEmbed API制約）~~ → v1.1.0 で解決
