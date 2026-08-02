# 援農パスポート

## 第1段階のUI試作品

このリポジトリでは、援農ボランティア参加管理LINEアプリの第1段階UI試作品をNext.js + TypeScriptで実装しています。

- LINEおよびFirestoreには未接続です。
- 画面はすべてダミーデータで表示します。
- 使用しているダミーデータは、src/lib/mock-data.ts に集約しています。

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

`.env.local`の`NEXT_PUBLIC_LIFF_ID`へ、LINE Developers Consoleで発行されたLIFF IDを設定する。

```env
NEXT_PUBLIC_LIFF_ID=your-liff-id
```

LIFF URL全体ではなく、LIFF IDだけを設定する。`.env.local`はGit管理対象外であり、実際のLIFF IDを`.env.example`へ記載しない。

依存関係をインストールし、開発サーバーを起動する。

```bash
npm install
npm run dev
```

## Vercel環境変数

VercelのProduction環境には、次を設定する。

```env
NEXT_PUBLIC_LIFF_ID=your-liff-id
```

`NEXT_PUBLIC_LIFF_ID`はブラウザ側でLIFF SDKを初期化するための公開可能な識別子である。LINE Channel Secretなどのサーバー用秘密情報には`NEXT_PUBLIC_`を付けない。

## 暫定的なビルド・依存関係設定

Next.js 16.2.12のTurbopackによる本番ビルドでは、`/_not-found`のページデータ収集エラーが発生したため、現在の`npm run build`はWebpackを明示的に使用する。

Next.js 16.2.12が指定するPostCSSおよびsharpのバージョンに対するnpmセキュリティ監査対応として、`package.json`の`overrides`でPostCSS 8.5.25とsharp 0.35.3を使用している。

Next.jsを更新する際は、次を再確認する。

- Turbopackで本番ビルドできるか
- Webpackの明示指定を削除できるか
- PostCSSおよびsharpの`overrides`を削除できるか
- `npm audit --omit=dev`と`npm audit`がともに成功するか

## 制約

- データベースには保存しません。
- 参加記録はUI確認用として、現在のブラウザのlocalStorageだけに保存します。
- 参加登録はサーバーへ送信せず、ダミーデータとブラウザ内保存を使用する試作品です。
- 次段階では、LINEログイン状態確認、プロフィール仮表示、IDトークンのサーバー検証、Firestore接続、農園情報取得、履歴保存、重複登録防止を実装します。

## LINEプロフィールのPoC表示

ログイン済みの場合、LIFF SDKの`getProfile()`から取得したLINE表示名をホーム画面へ仮表示する。

表示名は実行時に文字列かつ空でないことを検証するが、本人確認、認可、FirestoreのドキュメントID、参加履歴の所有者判定には使用しない。

サーバー側の本人確認は、次段階でLINE IDトークンを検証して行う。LINEユーザーID、IDトークン、アクセストークンは画面へ表示しない。

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
