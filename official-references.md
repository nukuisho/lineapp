# official-references.md

## 1. このファイルの目的

このファイルは、「援農ボランティア参加管理LINEアプリ」を実装する際に参照すべき公式資料を管理する。

LINE、LIFF、Firebase、Next.jsなどの仕様については、原則として公式資料を参照する。

ブログ、Qiita、個人リポジトリ、生成AIの回答は補助資料として扱い、公式仕様の代わりにはしない。

最終確認日：

```text
2026-08-01
```

公式仕様が本リポジトリ内の記述と異なる場合は、公式仕様を優先し、差異を報告する。

---

## 2. 参照の優先順位

実装時は、次の順番で参照する。

1. LINE Developers公式ドキュメント
2. LINE公式GitHubリポジトリ
3. Firebase公式ドキュメント
4. Next.js公式ドキュメント
5. Vercel公式ドキュメント
6. 本リポジトリ内の設計資料
7. その他の参考資料

---

## 3. LINE LIFF

### 3.1 LIFFの概要

参照目的：

* LIFFの役割
* LINE内ブラウザで動くWebアプリの構造
* LIFF SDKの基本
* LINE Loginとの関係
* 外部ブラウザとの違い

公式資料：

* LINE Developers「LIFF overview」
* LINE Developers「LINE Front-end Framework」

実装前に確認する項目：

* LIFFアプリの起動方法
* LIFFブラウザか外部ブラウザかの判定
* 利用可能なLIFF API
* LIFF URLの形式
* エンドポイントURLの扱い

---

### 3.2 LIFFアプリの作成

参照目的：

* LIFFアプリの登録
* LIFF IDの取得
* エンドポイントURLの設定
* Scopeの設定
* LIFF SDKの導入
* `liff.init()`の利用

公式資料：

* LINE Developers「Developing a LIFF app」
* LINE Developers「Registering a LIFF app」
* LINE Developers「Trying a LIFF app」
* LINE Developers「LIFF API reference」

主な確認事項：

* `liff.init()`の呼び出し方法
* LIFF IDの設定方法
* 初期化失敗時の処理
* LIFFアプリのサイズ設定
* Scopeの設定
* LINE Loginの必要条件

---

### 3.3 LIFF URLと追加パス

参照目的：

* QRコードからLIFFアプリを起動する
* URLに農園用トークンを含める
* `check-in`画面へ遷移する
* クエリパラメーターを受け取る

公式資料：

* LINE Developers「Opening a LIFF app」
* LINE Developers「LIFF URL」
* LINE Developers「Using a LIFF URL」

想定URL：

```text
https://liff.line.me/{LIFF_ID}/check-in?token={qrToken}
```

確認事項：

* LIFF URLへパスを付ける方法
* クエリパラメーターの扱い
* LIFF内でのリダイレクト
* 外部ブラウザで開かれた場合の挙動
* URLに機密情報を含めないこと

---

## 4. LINEユーザー認証

### 4.1 ユーザー情報の取得

参照目的：

* LINE表示名の取得
* プロフィール画像URLの取得
* LINEユーザーの識別
* ログイン状態の確認

公式資料：

* LINE Developers「Getting user profiles」
* LINE Developers「Using user data in LIFF apps and servers」
* LINE Developers「LIFF API reference」

利用候補：

* `liff.isLoggedIn()`
* `liff.login()`
* `liff.getProfile()`
* `liff.getIDToken()`
* `liff.getAccessToken()`

注意事項：

`liff.getProfile()`で取得したユーザーIDを、そのままサーバー認証に利用しない。

クライアントから送信されたユーザー情報だけで本人確認を完了しない。

---

### 4.2 IDトークンの検証

参照目的：

* サーバー側でLINEユーザーを検証する
* なりすましを防止する
* LINEユーザーとシステムユーザーを紐づける

公式資料：

* LINE Developers「Verify ID token」
* LINE Developers「Using user data in LIFF apps and servers」
* LINE Login API reference

確認事項：

* IDトークンの検証方法
* チャネルIDの照合
* 有効期限の確認
* 発行元の確認
* ユーザーIDの取得
* 検証失敗時の処理

禁止事項：

* クライアントから送られた`lineUserId`だけを信用する
* IDトークンをログへ全文出力する
* IDトークンをURLへ含める
* チャネルシークレットをブラウザへ渡す

---

### 4.3 LIFF開発ガイドライン

参照目的：

* 安全なユーザー情報の利用
* トークン管理
* URL設計
* LIFFブラウザ内の動作
* セキュリティ上の注意事項

公式資料：

* LINE Developers「LIFF app development guidelines」
* LINE Developers「Security guidelines」

特に確認する項目：

* アクセストークンの安全な扱い
* ユーザー情報のサーバー送信
* URLに含めてはいけない情報
* 外部ブラウザ対応
* エラー処理
* 個人情報の必要最小限の取得

---

## 5. LINE公式GitHubリポジトリ

### 5.1 LIFF Starter

公式リポジトリ：

```text
line/line-liff-v2-starter
```

参照目的：

* LIFF SDKの導入
* `liff.init()`の実装例
* ログイン処理
* プロフィール取得
* Next.jsでのLIFF利用
* 環境変数の設定

本プロジェクトでは、Next.js向けの実装例を優先して確認する。

注意事項：

* サンプルコードをそのまま本番利用しない
* 現在のLIFF SDKバージョンを確認する
* 本プロジェクトの認証要件に合わせて修正する
* 不要な機能をコピーしない

---

### 5.2 LIFF Playground

公式リポジトリ：

```text
line/liff-playground
```

参照目的：

* LIFF APIの動作確認
* LIFF環境情報の確認
* LINE内ブラウザでの挙動確認
* API実行結果の比較

本番アプリのコードベースとしてではなく、仕様確認用として使用する。

---

### 5.3 LIFF Mock

公式リポジトリ：

```text
line/liff-mock
```

参照目的：

* ローカル環境でのLIFFテスト
* LINEアプリを開かずに開発する
* LIFF APIのモック
* 自動テスト

導入する場合は、現在のプロジェクト構成との互換性を確認する。

MVP初期段階では必須としない。

---

### 5.4 LIFF Inspector

公式リポジトリ：

```text
line/liff-inspector
```

参照目的：

* LINE内ブラウザのデバッグ
* Consoleの確認
* Networkの確認
* DOMの確認
* LIFF固有の不具合調査

MVP初期段階では必須としないが、実機試験時に利用を検討する。

---

## 6. LINE Messaging API

MVPでは、LINE Messaging APIによるメッセージ送信を実装しない。

将来、次の機能を追加する場合に参照する。

* 参加登録完了通知
* 募集通知
* リマインド
* 農家からの「ありがとう」
* スタンプ獲得通知

公式資料：

* LINE Developers「Messaging API overview」
* LINE Developers「Send messages」
* LINE Developers「Webhook」
* LINE Developers「Verify webhook signature」

公式Node.js SDK：

```text
line/line-bot-sdk-nodejs
```

Messaging APIを追加する場合は、次を確認する。

* チャネルアクセストークン
* Webhook署名検証
* メッセージ送信対象
* 友だち追加状態
* メッセージ数と料金
* エラー処理
* 再送制御

---

## 7. Firebase Firestore

### 7.1 Firestoreの概要

参照目的：

* データベース作成
* コレクションとドキュメント
* データ取得
* データ保存
* クエリ
* インデックス

公式資料：

* Firebase「Cloud Firestore」
* Firebase「Get started with Cloud Firestore」
* Firebase「Firestore data model」

本プロジェクトで想定するコレクション：

```text
users
farms
participations
```

---

### 7.2 Firebase Admin SDK

参照目的：

* Next.jsサーバー側からFirestoreへアクセスする
* サービスアカウントを利用する
* 参加登録をサーバー側で処理する

公式資料：

* Firebase Admin SDK documentation
* Firebase「Add the Firebase Admin SDK to your server」
* Firebase「Initialize the Admin SDK」

注意事項：

* 秘密鍵をブラウザへ渡さない
* 秘密鍵をGitHubへコミットしない
* 改行を含む環境変数の扱いに注意する
* Admin SDKはFirestore Security Rulesを迂回する
* サーバー側で認証と入力検証を行う

---

### 7.3 Transaction

参照目的：

* 参加履歴作成
* 累計参加回数更新
* 累計スタンプ数更新
* 重複登録防止
* データ整合性の維持

公式資料：

* Firebase「Transactions and batched writes」

参加登録では、可能な限りTransactionを使用する。

確認事項：

* Transactionの再試行
* 同時更新時の競合
* 読み取り後の書き込み
* エラー時のロールバック
* 一意制約の代替設計

---

### 7.4 Firestore Security Rules

MVPでは、重要な書き込みをサーバー側のAdmin SDKから行う。

ただし、クライアント側でFirestoreを利用する場合はSecurity Rulesを設定する。

公式資料：

* Firebase「Get started with Cloud Firestore Security Rules」
* Firebase「Securely query data」

重要事項：

* Admin SDKはSecurity Rulesを迂回する
* Admin SDK利用時はサーバー側認可が必要
* クライアントから直接参加履歴を書き込ませない
* 他人の参加履歴を取得できないようにする

---

### 7.5 Firebase Emulator

参照目的：

* ローカル開発
* Firestoreのテスト
* サンプルデータの投入
* 本番データを使わない動作確認

公式資料：

* Firebase Local Emulator Suite
* Firebase「Connect your app to the Cloud Firestore Emulator」

MVP初期段階では任意とする。

導入コストが大きい場合は、後続フェーズで追加する。

---

## 8. Next.js

### 8.1 App Router

参照目的：

* 画面作成
* ページルーティング
* Server Component
* Client Component
* Route Handlers

公式資料：

* Next.js「App Router」
* Next.js「Pages and Layouts」
* Next.js「Server and Client Components」
* Next.js「Route Handlers」

本プロジェクトでは、原則としてApp Routerを使用する。

---

### 8.2 Route Handlers

参照目的：

* LINEトークン検証API
* 農園情報取得API
* 参加登録API
* 参加履歴取得API

公式資料：

* Next.js「Route Handlers」

注意事項：

* API入力値を検証する
* エラー内容を直接利用者へ返さない
* サーバー用環境変数をクライアントへ公開しない
* HTTPステータスを適切に使用する

---

### 8.3 環境変数

参照目的：

* LIFF ID
* LINEチャネル情報
* Firebase接続情報
* 開発環境と本番環境の切り替え

公式資料：

* Next.js「Environment Variables」

重要事項：

* `NEXT_PUBLIC_`付き変数はブラウザへ公開される
* 秘密情報には`NEXT_PUBLIC_`を付けない
* `.env.local`をGit管理しない
* `.env.example`には変数名だけを記載する

---

## 9. TypeScript

参照目的：

* ユーザー型
* 農園型
* 参加履歴型
* APIリクエストとレスポンス型
* LINE APIレスポンス型

公式資料：

* TypeScript Handbook

基本方針：

* `any`を避ける
* 外部入力は実行時検証する
* nullの可能性を明示する
* Firestoreデータを無条件に信用しない

---

## 10. UIとCSS

MVPでは、通常のCSSまたはTailwind CSSを使用する。

UIコンポーネントライブラリは必須としない。

Tailwind CSSを使用する場合の公式資料：

* Tailwind CSS Documentation
* Tailwind CSS「Installation with Next.js」

UI方針：

* スマートフォン優先
* LINE内ブラウザ対応
* 読みやすい文字
* 大きなボタン
* 単純な画面構成
* 緑色を基調
* 過度な装飾を避ける

---

## 11. Vercel

参照目的：

* Next.jsアプリの公開
* GitHub連携
* 環境変数設定
* Preview Deployment
* Production Deployment

公式資料：

* Vercel「Deploying Next.js」
* Vercel「Environment Variables」
* Vercel「Git integrations」

確認事項：

* 本番用環境変数
* Preview環境の扱い
* LIFFのエンドポイントURL
* HTTPS
* デプロイ後のURL変更

---

## 12. QRコード

QRコード自体は、農園ごとのLIFF URLまたはWeb URLを格納する。

QRコードには次を含めない。

* 個人情報
* LINEユーザーID
* IDトークン
* アクセストークン
* Firebase秘密鍵
* 管理者権限情報

QRコードへ含めるもの：

```text
ランダムな農園用qrToken
```

QRコード生成ライブラリを追加する場合は、次を確認する。

* メンテナンス状況
* ライセンス
* TypeScript対応
* サーバー側生成かクライアント側生成か

MVPでは、QRコード画像の自動生成を必須としない。

---

## 13. 公式資料の更新ルール

LINE、Firebase、Next.js、Vercelに依存する実装を追加または変更した場合は、次を行う。

1. 参照した公式資料をこのファイルへ追加する
2. 最終確認日を更新する
3. 変更対象の仕様を記録する
4. 関連するテストを追加する
5. `README.md`または`requirements.md`を更新する

---

## 14. 非公式資料の扱い

Qiita、Zenn、個人ブログ、Stack Overflow、生成AIの回答は、問題調査や理解の補助として使用してよい。

ただし、次の情報は公式資料で確認する。

* LIFF APIの引数
* トークンの検証方法
* LINEユーザーIDの取得方法
* Messaging APIの仕様
* Firestore Transaction
* Admin SDKの権限
* Next.jsの環境変数
* Vercelのデプロイ設定

非公式資料しか見つからない場合は、その旨を明記し、推測で本番実装を行わない。

