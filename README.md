# 援農パスポート

## 第1段階のUI試作品

このリポジトリでは、援農ボランティア参加管理LINEアプリの第1段階UI試作品をNext.js + TypeScriptで実装しています。

- LINE LIFF連携、LINE IDトークンのサーバー検証、および検証済みLINEユーザーのFirestore保存を実装しています。
- Firebase Admin SDKをNext.jsのサーバー処理だけで使用し、検証済みLINEユーザーをFirestoreへ保存します。
- 参加登録画面は、Firestoreの受付中農園一覧と参加登録APIへ接続しています。
- 参加履歴画面は、LINE IDトークンで確認した本人の参加履歴をFirestoreから取得します。
- ホーム画面の集計値には、引き続きUI確認用のダミーデータが残っています。

## 確認できる画面

- /: ホーム画面
- /check-in: 参加登録画面
- /check-in/complete: 登録完了画面
- /history: 参加履歴画面
- /error: エラー画面
## 開発環境

- Node.js 20.9.0以上
- Next.js 16.2.12
- React 18.3.1
- LIFF SDK 2.29.2
- TypeScript 5.5.4
- ESLint 9
- Vitest 4.1.10
- Firebase Admin SDK 14.2.0

## 確認コマンド

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## ローカル起動方法

環境変数の設定例をコピーする。

```bash
cp .env.example .env.local
```

`.env.local`へ、LINE Developers Consoleで発行されたLIFF IDと、LINE LoginチャネルのChannel IDを設定する。

```env
NEXT_PUBLIC_LIFF_ID=your-liff-id
LINE_CHANNEL_ID=your-line-channel-id
```

LIFF URL全体ではなく、LIFF IDだけを設定する。`NEXT_PUBLIC_LIFF_ID`はブラウザへ公開されるが、`LINE_CHANNEL_ID`はサーバー処理だけで参照するため`NEXT_PUBLIC_`を付けない。

`.env.local`はGit管理対象外であり、実際のLIFF IDやChannel IDを`.env.example`へ記載しない。

依存関係をインストールし、開発サーバーを起動する。

```bash
npm install
npm run dev
```

## Vercel環境変数

VercelのProduction環境には、次を設定する。

```env
NEXT_PUBLIC_LIFF_ID=your-liff-id
LINE_CHANNEL_ID=your-line-channel-id
```

`NEXT_PUBLIC_LIFF_ID`はブラウザ側でLIFF SDKを初期化するための公開可能な識別子である。`LINE_CHANNEL_ID`はLINE IDトークン検証を行うサーバー処理だけで参照し、`NEXT_PUBLIC_`を付けない。

現在使用するLINEのIDトークン検証エンドポイントではChannel Secretを送信しない。LINE Channel Secretなどのサーバー用秘密情報には`NEXT_PUBLIC_`を付けず、ブラウザへ渡さない。

## 暫定的なビルド・依存関係設定

Next.js 16.2.12のTurbopackによる本番ビルドでは、`/_not-found`のページデータ収集エラーが発生したため、現在の`npm run build`はWebpackを明示的に使用する。

Next.js 16.2.12が指定するPostCSSおよびsharpのバージョンに対するnpmセキュリティ監査対応として、`package.json`の`overrides`でPostCSS 8.5.25とsharp 0.35.3を使用している。

Next.jsを更新する際は、次を再確認する。

- Turbopackで本番ビルドできるか
- Webpackの明示指定を削除できるか
- PostCSSおよびsharpの`overrides`を削除できるか
- `npm audit --omit=dev`と`npm audit`がともに成功するか

## 制約

- 参加登録はFirestoreへ保存しますが、任意写真はプレビューだけで保存しません。
- ホーム画面の集計値は、まだFirestoreへ接続していません。
- 次段階では、ホーム画面の集計値取得を実装します。

## LINEプロフィールのPoC表示

ログイン済みの場合、LIFF SDKの`getProfile()`から取得したLINE表示名をホーム画面へ仮表示する。

表示名は実行時に文字列かつ空でないことを検証するが、本人確認、認可、FirestoreのドキュメントID、参加履歴の所有者判定には使用しない。

サーバー側の本人確認は、LINE IDトークンを検証して行う。LINEユーザーID、IDトークン、アクセストークンは画面へ表示しない。

## LINE IDトークンのサーバー検証

ログイン済みの場合、LIFF SDKの`getIDToken()`でIDトークンを取得し、同一オリジンの`POST /api/line/verify-id-token`へJSONで送信する。

Next.jsのRoute Handlerは、サーバー環境変数`LINE_CHANNEL_ID`とIDトークンを`application/x-www-form-urlencoded`形式でLINE Login v2.1の検証エンドポイントへ送信する。LINEの成功レスポンスも外部データとして実行時検証し、発行元と対象チャネルが一致することを確認する。

IDトークン、検証済みのLINEユーザーID、LINE APIの詳細なエラー、プロフィール情報は、この確認用APIからブラウザへ返さない。IDトークンをログ、URL、localStorageへ保存しない。

この段階では本人確認の成否を画面へ表示するだけであり、Firestoreへのユーザー登録や参加履歴保存はまだ行わない。

## 2026-08-02 UI試作品の方針変更

農家によるQRコードの掲示・管理負担を避けるため、農園QRコード方式は使用せず、参加登録画面で利用中の農園一覧から農園を選択する方式へ変更した。

現在のUI試作品では、次を確認できる。

- LIFF SDKの初期化状態
- LINE内ブラウザ・外部ブラウザの判定
- LINEログイン状態と表示名のPoC表示
- トップページのお知らせ欄
- ダミー農園のプルダウン選択
- 日本時間の当日表示
- コメント入力
- 写真選択とプレビュー
- 写真の選択解除
- スタンプ個数を表示しない参加履歴

現在、LINE Messaging APIによる通知送信は行わない。

写真はプレビューのみで、Firebase Storage等への保存は行わない。

Firestore接続後は、利用中農園の一覧取得、農園のサーバー側検証、コメント保存、重複登録防止を実装する。


## Firebase Admin接続基盤

Firebase Admin SDKはNext.jsのサーバー処理だけで使用し、Firebase Authenticationは使用しない。現在は初期化基盤までを実装し、Firestoreの実データ読み書きは後続段階で実装する。

サーバー用環境変数は`FIREBASE_PROJECT_ID`、`FIREBASE_CLIENT_EMAIL`、`FIREBASE_PRIVATE_KEY`とする。これらに`NEXT_PUBLIC_`を付けず、実値をGit管理対象ファイルへ記載しない。

FirebaseプロジェクトはPoCのDevelopment用とProduction用を分離し、どちらもFirestoreロケーション`asia-northeast1`を使用する。ローカル開発とVercel PreviewはDevelopment用、Vercel ProductionはProduction用へ接続する。現段階では両環境ともPoCとする。


## 利用可能農園一覧API

\`GET /api/farms\`は、Firebase Admin SDKを使用してFirestoreの\`farms\`コレクションをサーバー側で読み取る。

一覧には\`isActive\`と\`isAccepting\`がともにtrueの農園だけを含め、ブラウザへは\`id\`、\`name\`、\`ownerName\`、\`fruitTypes\`だけを返す。状態値、Timestamp、Firebase内部エラーは返さない。

参加登録画面はこのAPIから農園一覧を取得し、読み込み中、取得失敗、受付中農園がない場合を画面に表示する。

## 参加登録API

`POST /api/participations`は、ブラウザから受け取ったLINE IDトークンをLINE APIで再検証し、検証結果から生成した内部ユーザーIDを使用して参加を登録する。クライアントからユーザーID、作業日、農園表示情報、付与スタンプ数は受け取らない。

参加登録時はFirestoreから農園の存在と受付状態を再確認し、参加履歴、同日重複防止キー、ユーザー集計値をTransactionで一体更新する。重複登録はHTTP 409で返し、LINE IDトークン、LINEユーザーID、内部ユーザーID、Firebase内部エラーはブラウザへ返さない。

参加登録画面はLIFF SDKからIDトークンを取得してこのAPIを呼び出す。登録中はフォームとボタンを無効化し、HTTPステータスに応じた利用者向け案内を表示する。

作業日は、日本時間の当日から1暦月前の同日まで選択できる。前月に同じ日が存在しない場合は前月末を最古日とし、未来日、範囲外の日付、存在しない日付はサーバー側で拒否する。

重複判定は`userId + farmId + workDate`を使用し、同じ利用者が同じ農園へ同じ作業日で複数登録することはできない。作業時間区分が異なる場合も同じ作業日の2件目として拒否する。

登録成功結果は完了画面への受け渡しのために一時的に`sessionStorage`へ保存する。IDトークンやユーザーIDは保存せず、参加履歴を`localStorage`へ保存しない。

## 本人限定の参加履歴API

`POST /api/participations/history`は、ブラウザから受け取ったLINE IDトークンをサーバー側で再検証し、検証結果から生成した内部ユーザーIDに一致する参加履歴だけをFirestoreから取得する。クライアントからユーザーIDは受け取らず、IDトークン、LINEユーザーID、内部ユーザーID、Firestore内部エラーはブラウザへ返さない。

参加履歴画面はLIFF SDKからIDトークンを取得してこのAPIを呼び出し、読み込み中、履歴なし、取得失敗の状態を表示する。Firestoreの外部データとAPIレスポンスは実行時検証し、有効な履歴を作業日の新しい順で最大50件表示する。

## PoC利用者データのリセット

運営者用の`npm run reset:poc-user`は、指定した内部ユーザーの参加履歴、重複登録防止キー、参加回数・スタンプ数をFirestore Transactionで一体的にリセットする。通常はdry-runとなり、対象プロジェクトと同じ値を`--confirm-project`へ明示した場合だけ更新する。

受付中にリセットすると同時登録と競合するため、対象農園の受付を一時停止してから実行する。最初はDevelopment環境でdry-runと実行結果を確認し、Productionでは削除対象とバックアップ方針を確認してから使用する。

```bash
npm run reset:poc-user -- \
  --project development-project-id \
  --user-id internal-user-id

npm run reset:poc-user -- \
  --project development-project-id \
  --user-id internal-user-id \
  --confirm-project development-project-id
```

実際のプロジェクトID、内部ユーザーID、Firebase秘密情報はチャット、ログ、Git管理対象ファイルへ記載しない。
