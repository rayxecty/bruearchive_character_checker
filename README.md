# ブルーアーカイブ キャラクター所持チェッカー (Blue Archive Tracker)

ブルーアーカイブ（ブルアカ）攻略Wikiのキャラクター所持トラッカーURLから生徒所持状況を復元・管理・共有できるWebツールです。

---

## 🚀 GitHub Pages への公開手順

本リポジトリは **GitHub Pages** へのデプロイに対応しています。以下の2つの方法のいずれかで公開できます。

### 方法1: GitHub Actions による自動デプロイ（推奨）

リポジトリにプッシュするだけで自動的にビルド＆公開されます。

1. GitHubのリポジトリページを開きます。
2. 上部メニューの **[Settings]** タブをクリックします。
3. 左側メニューの **[Pages]** を選択します。
4. **[Build and deployment]** の **[Source]** を **`GitHub Actions`** に変更します。
5. コードを `main`（または `master`）ブランチに `git push` すると、自動的に `.github/workflows/deploy.yml` が実行され、サイトが公開されます。
6. 公開URL: `https://<あなたのユーザー名>.github.io/bruearchive_character_checker/`

---

### 方法2: `gh-pages` コマンドによる手動デプロイ

ローカル環境からコマンド1つで `gh-pages` ブランチにデプロイすることも可能です。

```bash
# 依存関係をインストール
npm install

# ビルドして gh-pages ブランチにプッシュ
npm run deploy
```

その後、GitHubの **[Settings]** > **[Pages]** で **[Source]** を `Deploy from a branch` にし、ブランチを `gh-pages` / `/ (root)` に設定してください。

---

## 🛠️ 開発・ビルドコマンド

```bash
# 開発サーバー起動（ポート3000）
npm run dev

# プロダクションビルド（dist/ を出力、404.html自動生成）
npm run build

# ビルド成果物のプレビュー
npm run preview
```

## 📝 主な機能
- **Wiki URL / 共有コード解析**: ブルアカ攻略Wikiの所持トラッカーURLや共有コード（base64url + zlib deflate）を完全クライアントサイドで高速復元。
- **神名文字入手先別グループ表示**: Hard任務ステージ順、総力戦・大決戦・戦術対抗戦・合同火力演習ショップ、イベント配布、各種募集ごとに分類。
- **直感的な編集モード**: ワンクリックで各生徒の「所持」「未所持」を切替可能。全員所持・全員未所持の一括操作にも対応。
- **2カラム分割比較表示**: 所持生徒と未所持生徒を左右に並べて育成計画を立てられる専用ビュー。
- **所持率統計・エクスポート**: 学園別・レアリティ別の所持率チャート、共有URLやテキスト一覧のワンクリックコピー。
