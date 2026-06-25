# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

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

- アーティスト名が取得できない（oEmbed API制約）→ Issue #2 で対応予定
