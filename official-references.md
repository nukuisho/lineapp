# LINE開発・公式参照資料

最終確認日：2026-08-01

このファイルは、実装時に参照すべき公式資料と、その利用目的を管理する。

公式仕様が本リポジトリ内の記述と異なる場合は、公式仕様を優先し、差異を報告すること。

## LIFF

### LIFF概要

用途：

* LIFFの基本構造
* LINE内ブラウザと外部ブラウザの違い
* LIFF SDKの位置付け

公式ドキュメント：

* LINE Developers「LIFF overview」
* LINE Developers「LINE Front-end Framework」

### LIFFアプリの開発

用途：

* LIFF SDKの導入
* `liff.init()`の実装
* エンドポイントURL
* LINE Login
* デプロイ方法

公式ドキュメント：

* LINE Developers「Developing a LIFF app」
* LINE Developers「LIFF API reference」
* LINE Developers「Opening a LIFF app」

### ユーザー認証とプロフィール

用途：

* IDトークン
* アクセストークン
* サーバー側検証
* プロフィール情報
* なりすまし防止

公式ドキュメント：

* LINE Developers「Using user data in LIFF apps and servers」
* LINE Developers「LIFF app development guidelines」

重要事項：

* クライアントから送られたユーザーIDを信用しない
* サーバー側でトークンを検証する
* URLにアクセストークンやユーザーIDを含めない

## 公式サンプル

### LIFF Starter

公式リポジトリ：

* `line/line-liff-v2-starter`

用途：

* LIFF初期化
* ログイン状態の確認
* プロフィール取得
* 基本的なLIFF APIの利用例

### LIFF Playground

公式リポジトリ：

* `line/liff-playground`

用途：

* LIFF APIの挙動確認
* LINE内ブラウザでの機能検証

### LIFF Mock

公式リポジトリ：

* `line/liff-mock`

用途：

* ローカルテスト
* LIFF環境のモック
* 自動テスト支援

### LIFF Inspector

公式リポジトリ：

* `line/liff-inspector`

用途：

* LINE内ブラウザのデバッグ
* Console、Network、Elementsの確認

## Messaging API

### 公式ドキュメント

用途：

* プッシュメッセージ
* 応答メッセージ
* Webhook
* 署名検証
* メッセージ送信制限

公式資料：

* LINE Developers「Messaging API overview」
* LINE Developers「Receive messages」
* LINE Developers「Verify webhook signature」
* LINE Developers「Send messages」

### Node.js SDK

公式リポジトリ：

* `line/line-bot-sdk-nodejs`

用途：

* Messaging APIクライアント
* Webhookイベント型
* 署名検証
* メッセージ送信

## Firebase

### Firestore

公式資料：

* Firebase「Cloud Firestore」
* Firebase「Get started with Cloud Firestore Security Rules」
* Firebase「Firestore data model」
* Firebase「Transactions and batched writes」
* Firebase「Firestore Emulator」

重要事項：

* ブラウザ側SDKはSecurity Rulesで保護する
* Firebase Admin SDKはSecurity Rulesを迂回する
* Admin SDKのアクセスはIAMとサーバー側認可で保護する
* 参加登録とスタンプ更新は原子的に処理する

## 更新ルール

LINEまたはFirebaseに依存する実装を追加・変更した場合は、次を行う。

1. 参照した公式資料を追加する
2. 確認日を更新する
3. 仕様上の前提を設計資料に記録する
4. 関連するテストを追加する
