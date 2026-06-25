# TuneCard — Product Requirements Document

## 1. プロダクト概要

**TuneCard** は、Spotifyで聴いている曲をX（旧Twitter）にシェアする際、曲名・アーティスト名を含む整形テキストをワンタップで生成するiOS Share Extensionアプリ。

Spotifyの標準シェア機能ではXへの投稿にリンクしか含まれず、曲名・アーティスト名がテキストに入らない。既存のワークアラウンド（iOSショートカット、IFTTT）はSpotifyの仕様変更で頻繁に壊れる問題がある。TuneCardはShare Extensionとして常駐し、Spotifyの共有シートから直接起動することで、最小ステップでの投稿を実現する。

### 対象ユーザー

自分自身（個人ツール）。GitHub公開前提で、同じ課題を持つユーザーにも使ってもらえる設計にする。

### 競合状況

専用のiOSアプリは存在しない。iOSショートカットやIFTTTによるワークアラウンドのみ。いずれもSpotify仕様変更への追従が困難で、安定的に使えるプロダクトがない空白地帯。


## 2. ユーザーストーリーと要求仕様

### US-1: 基本シェアフロー（MVP）

**ストーリー:** Spotifyで曲を聴いていて「この曲シェアしたい」と思ったとき、Spotifyの共有ボタン → TuneCardを選択 → 曲名・アーティスト名・リンクが整形されたテキストが表示される → コピーまたはXアプリへ遷移して投稿する。

**受け入れ条件:**
- Spotifyの共有シートからTuneCardが選択できる
- Spotify楽曲URLを受け取り、曲名・アーティスト名を取得できる
- デフォルトフォーマットでテキストが生成される（例: `曲名 / アーティスト名 #NowPlaying\nhttps://open.spotify.com/track/xxx`）
- 「クリップボードにコピー」ボタンでテキストをコピーできる
- 「Xで投稿」ボタンでXアプリの投稿画面に遷移し、テキストが入力済みの状態になる
- ネットワークエラー時に適切なエラーメッセージが表示される

### US-2: テキストフォーマットのカスタマイズ

**ストーリー:** シェアするテキストのフォーマットを自分好みにカスタマイズしたい。ハッシュタグの有無、絵文字、フォーマットの並び順などを設定画面から変更できる。

**受け入れ条件:**
- ホストアプリ（TuneCardメインアプリ）内に設定画面がある
- フォーマットテンプレートを編集できる（プレースホルダー: `{title}`, `{artist}`, `{url}`）
- デフォルトテンプレート: `{title} / {artist} #NowPlaying\n{url}`
- プリセットテンプレートを複数用意する（シンプル、詳細、ハッシュタグなし等）
- 設定はApp Groupsを通じてShare Extensionと共有される

### US-3: 一言コメントの追加

**ストーリー:** シェアテキストに自分のコメントを一言添えたい。

**受け入れ条件:**
- Share Extension画面にコメント入力欄がある
- 入力したコメントがフォーマットテキストの先頭（または末尾、設定次第）に追加される
- コメントは任意（空欄でもシェア可能）

### US-4: アルバム・プレイリストのシェア対応

**ストーリー:** 楽曲だけでなくアルバムやプレイリストのURLも同様にシェアしたい。

**受け入れ条件:**
- `open.spotify.com/album/xxx` 形式のURLに対応
- `open.spotify.com/playlist/xxx` 形式のURLに対応
- それぞれ適切なタイトル情報を取得して整形する
- 楽曲以外のSpotify URL（アーティストページ等）でも可能な範囲で対応する

### US-5: シェア履歴

**ストーリー:** 過去にシェアした曲を振り返りたい。

**受け入れ条件:**
- ホストアプリ内でシェア履歴一覧が確認できる
- 曲名、アーティスト名、シェア日時が表示される
- 履歴からの再シェアが可能


## 3. MVP定義

### MVP（v1.0）スコープ — IN

- US-1: 基本シェアフロー（Share Extension + テキスト生成 + コピー/X遷移）
- US-3: 一言コメント入力
- ホストアプリはShare Extensionの説明・使い方画面のみ（最小構成）

### MVP後（v1.x）スコープ — LATER

- US-2: フォーマットカスタマイズ
- US-4: アルバム・プレイリスト対応
- US-5: シェア履歴
- Apple Watchコンプリケーション
- Widgetからのクイックシェア

### スコープ外 — OUT

- 画像（ジャケット写真）の添付
- Spotify OAuth認証フロー（MVPではoEmbed APIで認証不要）
- X以外のSNS対応（Threads, Bluesky等）
- 収益化機能（広告、課金）
- 楽曲の再生機能


## 4. 技術アーキテクチャ

### 4.1 全体構成

```
┌─────────────────────────────────────────────────┐
│ TuneCard.app (Host App)                         │
│  - 使い方説明                                     │
│  - 設定画面（v1.x）                               │
│  - シェア履歴（v1.x）                              │
└─────────────────────────────────────────────────┘
           │ App Groups (共有UserDefaults)
┌─────────────────────────────────────────────────┐
│ TuneCardShare (Share Extension)                 │
│  - SpotifyURL受信                                │
│  - TrackInfoProvider呼び出し                      │
│  - テキスト整形                                   │
│  - コピー / X遷移                                 │
└─────────────────────────────────────────────────┘
           │
┌─────────────────────────────────────────────────┐
│ TuneCardCore (Shared Framework)                 │
│  - TrackInfoProvider (Protocol)                 │
│  - OEmbedProvider (実装: 認証不要)               │
│  - WebAPIProvider (実装: OAuth, v1.x)           │
│  - HTMLMetaProvider (実装: OGPスクレイピング)     │
│  - SpotifyURLParser                             │
│  - ShareTextFormatter                           │
└─────────────────────────────────────────────────┘
```

### 4.2 技術スタック

| レイヤー | 技術選定 | 理由 |
|---------|---------|------|
| 言語 | Swift | iOS標準、Share Extensionとの相性 |
| UI | SwiftUI | 宣言的UI、少ないコード量でMVP達成 |
| アーキテクチャ | MVVM + Protocol-oriented | テスタビリティ、Provider差し替えの容易さ |
| ネットワーク | URLSession | 外部依存ゼロ、Share Extension内で軽量 |
| データ永続化 | UserDefaults (App Groups) | 設定共有。履歴はSwiftData (v1.x) |
| テスト | XCTest + Swift Testing | 標準テストフレームワーク |
| CI | GitHub Actions | 自動テスト・ビルド |
| 最小対応OS | iOS 17.0 | SwiftUI最新機能の活用、ユーザーの大半をカバー |


### 4.3 仕様変更耐性の設計（重要）

Spotifyの仕様変更に対して**壊れにくく、壊れても直しやすい**設計を初期から組み込む。

#### 4.3.1 Provider抽象化パターン

楽曲情報の取得を `TrackInfoProvider` protocolで抽象化し、複数の実装を用意する。

```swift
protocol TrackInfoProvider {
    func fetchTrackInfo(from url: SpotifyURL) async throws -> TrackInfo
}

struct TrackInfo {
    let title: String       // 曲名
    let artist: String      // アーティスト名
    let spotifyURL: URL     // 元のSpotify URL
    let albumName: String?  // アルバム名（任意）
}
```

**実装の優先順位（フォールバックチェーン）:**

1. **OEmbedProvider**（MVP、認証不要）
   - エンドポイント: `https://open.spotify.com/oembed?url={spotify_url}`
   - レスポンスの `title` フィールドから曲名・アーティスト名をパース
   - 認証不要のため最もシンプルかつ安定

2. **HTMLMetaProvider**（フォールバック）
   - SpotifyのWebページからOpen Graphメタタグ（`og:title`, `og:description`）を取得
   - oEmbedが壊れた場合のバックアップ
   - Web APIの認証なしで動作

3. **WebAPIProvider**（将来拡張、認証必要）
   - Spotify Web API `GET /v1/tracks/{id}` で最も正確な情報を取得
   - OAuth認証が必要なためMVPでは実装しない

#### 4.3.2 フォールバックチェーン

```swift
final class FallbackTrackInfoProvider: TrackInfoProvider {
    private let providers: [TrackInfoProvider]
    
    func fetchTrackInfo(from url: SpotifyURL) async throws -> TrackInfo {
        var lastError: Error?
        for provider in providers {
            do {
                return try await provider.fetchTrackInfo(from: url)
            } catch {
                lastError = error
                // ログ記録: どのProviderが失敗したか
                continue
            }
        }
        throw lastError ?? TrackInfoError.allProvidersFailed
    }
}
```

#### 4.3.3 SpotifyURLParser の分離

URL形式の変更に備え、URLパースロジックを独立したモジュールに切り出す。

```swift
struct SpotifyURL {
    let originalURL: URL
    let contentType: ContentType  // .track, .album, .playlist, .artist, .unknown
    let spotifyID: String
    
    enum ContentType: String {
        case track, album, playlist, artist, unknown
    }
}

struct SpotifyURLParser {
    // open.spotify.com/track/{id} 形式
    // spotify.link/{shortId} 形式（短縮URL）
    // spotify:track:{id} 形式（URI）
    static func parse(_ url: URL) -> SpotifyURL?
}
```

対応すべきURL形式:
- `https://open.spotify.com/track/{id}?si=xxx`
- `https://open.spotify.com/intl-ja/track/{id}?si=xxx`（ロケールプレフィックス付き）
- `https://spotify.link/{shortId}`（短縮URL、リダイレクト解決が必要）
- `spotify:track:{id}`（Spotify URI形式）

#### 4.3.4 Contract Tests（仕様変更の早期検知）

実際のSpotify APIエンドポイントに対してリクエストを送り、レスポンス構造が期待通りかを検証するテスト。GitHub Actions のスケジュール実行（週次）で定期的に実行する。

```swift
// ContractTests/SpotifyOEmbedContractTests.swift
final class SpotifyOEmbedContractTests: XCTestCase {
    /// oEmbed APIが期待するフィールドを返すことを検証
    func testOEmbedResponseStructure() async throws {
        let url = "https://open.spotify.com/oembed?url=https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh"
        let (data, response) = try await URLSession.shared.data(from: URL(string: url)!)
        
        XCTAssertEqual((response as? HTTPURLResponse)?.statusCode, 200)
        
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]
        XCTAssertNotNil(json["title"] as? String, "title field missing or not a string")
        XCTAssertNotNil(json["thumbnail_url"] as? String, "thumbnail_url field missing")
        XCTAssertNotNil(json["provider_name"] as? String, "provider_name field missing")
    }
}
```

CI失敗時にGitHub Issueを自動作成し、仕様変更を即座に検知する。

#### 4.3.5 レスポンスパースの堅牢化

oEmbed APIの `title` フィールドの形式が変わっても対応できるよう、パースロジックを段階的に設計する。

```swift
struct OEmbedTitleParser {
    /// titleフィールドから曲名とアーティスト名を分離する
    /// 想定フォーマット: "曲名 - song and lyrics by アーティスト名 | Spotify" など
    /// フォーマットが変わっても最低限titleそのものは返す
    static func parse(_ rawTitle: String) -> (title: String, artist: String?) {
        // 複数のパターンを試行
        // パターンが全て失敗した場合はrawTitle全体をtitleとして返す（graceful degradation）
    }
}
```

### 4.4 Share Extension の実装方針

```
[Spotifyアプリ]
    ↓ 共有ボタン
[iOS共有シート]
    ↓ TuneCardを選択
[TuneCard Share Extension]
    ↓ NSExtensionItem から URL を取得
    ↓ SpotifyURLParser でパース
    ↓ FallbackTrackInfoProvider で楽曲情報取得
    ↓ ShareTextFormatter でテキスト整形
[Share Extension UI]
    - 整形テキストのプレビュー表示
    - コメント入力欄
    - 「コピー」ボタン
    - 「Xで投稿」ボタン → twitter://post?message={encoded_text}
    - 「閉じる」ボタン
```

### 4.5 X（Twitter）への遷移

```swift
// X公式アプリのURLスキーム
let tweetText = "曲名 / アーティスト名 #NowPlaying\nhttps://open.spotify.com/track/xxx"
let encoded = tweetText.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!

// X公式アプリがインストールされている場合
if let xURL = URL(string: "twitter://post?message=\(encoded)"),
   UIApplication.shared.canOpenURL(xURL) {
    UIApplication.shared.open(xURL)
} else {
    // WebフォールバックURL
    let webURL = URL(string: "https://twitter.com/intent/tweet?text=\(encoded)")!
    UIApplication.shared.open(webURL)
}
```

注意: Share Extension内では `UIApplication.shared` にアクセスできないため、`extensionContext` 経由で `openURL` を使用する。


## 5. ディレクトリ構成

```
TuneCard/
├── docs/
│   ├── PRD.md                    # 本ドキュメント
│   ├── ARCHITECTURE.md           # 詳細設計（Claude Codeが精緻化）
│   └── RELEASE_GUIDE.md          # リリース手順
├── TuneCard/                     # ホストアプリ
│   ├── App/
│   │   ├── TuneCardApp.swift
│   │   └── ContentView.swift     # 使い方説明画面
│   ├── Views/
│   ├── ViewModels/
│   └── Resources/
│       ├── Assets.xcassets
│       └── Info.plist
├── TuneCardShare/                # Share Extension
│   ├── ShareViewController.swift
│   ├── ShareView.swift           # SwiftUI View
│   ├── ShareViewModel.swift
│   └── Info.plist
├── TuneCardCore/                 # 共有フレームワーク
│   ├── Models/
│   │   ├── TrackInfo.swift
│   │   └── SpotifyURL.swift
│   ├── Providers/
│   │   ├── TrackInfoProvider.swift      # Protocol定義
│   │   ├── OEmbedProvider.swift
│   │   ├── HTMLMetaProvider.swift
│   │   └── FallbackTrackInfoProvider.swift
│   ├── Parsers/
│   │   ├── SpotifyURLParser.swift
│   │   ├── OEmbedTitleParser.swift
│   │   └── ShareTextFormatter.swift
│   └── Utilities/
│       └── Logger.swift
├── TuneCardTests/                # ユニットテスト
│   ├── Parsers/
│   │   ├── SpotifyURLParserTests.swift
│   │   ├── OEmbedTitleParserTests.swift
│   │   └── ShareTextFormatterTests.swift
│   ├── Providers/
│   │   ├── OEmbedProviderTests.swift
│   │   └── FallbackProviderTests.swift
│   └── Mocks/
│       └── MockTrackInfoProvider.swift
├── TuneCardContractTests/        # Contract Tests（CI週次実行）
│   └── SpotifyOEmbedContractTests.swift
├── .github/
│   └── workflows/
│       ├── ci.yml                # PR時のビルド・テスト
│       └── contract-test.yml     # 週次のContract Test
├── README.md
├── LICENSE                       # MIT License
└── .gitignore
```


## 6. 開発マイルストーン

### M0: プロジェクトセットアップ（Day 1）
- Xcodeプロジェクト作成（Host App + Share Extension + Shared Framework）
- App Groups設定
- Git初期化、GitHub リポジトリ作成
- CI設定（GitHub Actions）

### M1: コアロジック実装（Day 2-3）
- SpotifyURLParser の実装 + テスト
- OEmbedProvider の実装 + テスト
- OEmbedTitleParser の実装 + テスト
- ShareTextFormatter の実装 + テスト
- FallbackTrackInfoProvider の実装 + テスト

### M2: Share Extension UI（Day 4-5）
- Share Extension の基本UI実装（SwiftUI）
- URL受信 → 楽曲情報取得 → テキスト表示のフロー結合
- コメント入力欄の実装
- クリップボードコピー機能
- X遷移機能

### M3: ホストアプリ（Day 6）
- 使い方説明画面（Share Extensionの有効化手順）
- アプリアイコン・Launch Screen

### M4: 仕上げ・テスト（Day 7-8）
- 実機テスト（Spotify実環境との結合テスト）
- エラーハンドリングの確認
- HTMLMetaProvider（フォールバック）の実装
- Contract Tests作成
- README.md作成

### M5: リリース準備（Day 9-10）
- TestFlight配布設定
- App Store提出用メタデータ（スクリーンショット、説明文）
- App Store審査提出


## 7. テスト戦略

### ユニットテスト（TDD対象）

以下のモジュールはテストファーストで開発する。Claude Codeへの指示時に `/goal` でテストクリアを目標に設定する。

| モジュール | テスト観点 |
|-----------|----------|
| SpotifyURLParser | 各URL形式の正常パース、不正URLの処理、ロケールプレフィックス対応 |
| OEmbedTitleParser | 各種title形式からの曲名・アーティスト分離、未知形式のgraceful degradation |
| ShareTextFormatter | テンプレート展開、プレースホルダー置換、特殊文字のエスケープ |
| OEmbedProvider | 正常レスポンスのパース、HTTPエラー処理、タイムアウト処理 |
| FallbackTrackInfoProvider | Provider順序通りのフォールバック、全Provider失敗時のエラー |

### Contract Tests（CI週次実行）

| テスト | 目的 |
|-------|------|
| oEmbed APIレスポンス構造検証 | titleフィールドの存在・型を確認 |
| oEmbed title形式検証 | 曲名・アーティスト名が取得可能な形式であることを確認 |
| Spotify URL形式検証 | 公式Webページの楽曲URLパターンが変わっていないことを確認 |

### 手動テスト

| テスト | 確認内容 |
|-------|---------|
| Spotifyからの共有シート起動 | Share Extensionが表示されるか |
| 各種楽曲URL | 日本語タイトル、英語タイトル、複数アーティスト |
| Xアプリ遷移 | テキストが正しく引き渡されるか |
| ネットワークオフライン | エラーメッセージ表示 |
| 大量テキスト | 280文字制限に対する振る舞い |


## 8. Claude Code への指示テンプレート

### 初期指示

```
docs/PRD.md を読んで、以下の順序で進めてください。

1. PRDを元に docs/ARCHITECTURE.md を作成し、詳細設計を記述する
2. M0のプロジェクトセットアップを実行する
3. M1のコアロジックについて、まずテストを書き、テストが通る実装を書く
   - /goal "SpotifyURLParserTests が全てパスする"
   - /goal "OEmbedTitleParserTests が全てパスする"
   - /goal "ShareTextFormatterTests が全てパスする"
```

### 仕様変更対応時の指示

```
Spotify oEmbed APIのレスポンス形式が変わったようです。
TuneCardContractTests/ の失敗しているテストを確認し、
OEmbedTitleParser を修正してテストを通してください。
他のProviderへの影響も確認してください。
```


## 9. iOS App Store リリース手順（概要）

1. **Apple Developer Program** に登録する（年額 $99）
2. **App ID** と **Provisioning Profile** を Apple Developer Console で作成
3. **Xcode** でArchiveビルドを作成
4. **TestFlight** にアップロードし、自分のデバイスでベータテスト
5. **App Store Connect** で以下のメタデータを入力:
   - アプリ名: TuneCard
   - カテゴリ: ミュージック / ユーティリティ
   - スクリーンショット（6.7インチ、6.1インチ）
   - 説明文・キーワード
   - プライバシーポリシーURL（GitHub Pages等）
   - App Review用のデモ手順
6. **審査提出**（通常1〜3営業日で結果）
7. 承認後、**リリース**（即時 or 指定日）

詳細は別途 `docs/RELEASE_GUIDE.md` に記載する。


## 10. リスクと対策

| リスク | 影響 | 対策 |
|-------|------|------|
| Spotify oEmbed APIの廃止・変更 | 楽曲情報が取得できなくなる | フォールバックチェーン（HTMLMeta）+ Contract Testsで早期検知 |
| oEmbedのtitle形式変更 | パース失敗 | graceful degradation: パース失敗時はrawTitleをそのまま使用 |
| Spotify共有シートの変更 | URL形式が変わる | SpotifyURLParserを分離、テストで複数形式をカバー |
| XのURLスキーム変更 | X遷移が動かなくなる | WebフォールバックURL（intent/tweet）を常に用意 |
| App Store審査リジェクト | リリース遅延 | 最低限の機能でシンプルに保つ、審査ガイドライン事前確認 |
| Share Extension のメモリ制限 | クラッシュ | ネットワーク呼び出しを軽量に、画像処理なし |


## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-06-25 | v1.0 | 初版作成 |