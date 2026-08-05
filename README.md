# ポチッと貴族

焼き鳥居酒屋のタッチパネル注文システムを模したポートフォリオ用Webアプリ。詳細仕様は
[`docs/SPEC.md`](docs/SPEC.md)、開発時の注意点は [`CLAUDE.md`](CLAUDE.md) を参照。

## セットアップ

```bash
npm install
cp .env.example .env.local   # Firebaseプロジェクトの値を記入
npm run dev
```

`.env.local` には Firebase コンソール(プロジェクトの設定 > マイアプリ > SDK の設定と構成)
から取得した Web アプリの設定値を入れる。Firestore が使えないままでも `/order` の
メニュー表示・カート操作・`/history` は動作するが、注文送信(Firestore書き込み)と
`/kitchen` のリアルタイム反映には有効なFirebaseプロジェクトが必要。

## 画面

| ルート | 内容 |
|---|---|
| `/order?table=xR7k2m` | 客席用注文画面(トークンは `src/data/tables.js` 参照。他に `p9Lm3q`(2番卓)、`a3f9x2`(3番卓)、`k8x2mQ`(4番卓)、`z7Yn5w`(5番卓)) |
| `/history` | 客席用注文履歴(このブラウザでの注文をlocalStorageから表示) |
| `/kitchen` | 厨房ディスプレイ(パスワードは `src/pages/KitchenPage.jsx` の `KITCHEN_PASSWORD`) |

## デプロイ

```bash
npm run build
firebase deploy
```

`.firebaserc` の `default` プロジェクトIDを実際のFirebaseプロジェクトIDに書き換えてから
実行すること。詳細な確認手順は `.claude/skills/verify-and-deploy/SKILL.md` を参照。

## メニューの編集

`src/data/menu.js` を直接編集する(管理画面なし、意図的な仕様)。手順は
`.claude/skills/menu-item/SKILL.md` を参照。画像は `public/images/` に配置し、現在は
`scripts/generate-placeholder-images.mjs` で生成したプレースホルダーSVGが入っている
(実際の写真に差し替え可能。ファイル名を変えなければ `menu.js` 側の変更は不要)。
