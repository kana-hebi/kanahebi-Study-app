# 調査記録と設計への反映

調査日: 2026-10-06 JST。転載した教材集ではなく、本プロジェクトが教材・実装を設計するための参考記録。

| 資料 | 参照目的・採用判断 |
|---|---|
| [文部科学省：高等学校学習指導要領解説 理科編・理数編](https://www.mext.go.jp/component/a_menu/education/micro_detail/__icsFiles/afieldfile/2019/11/22/1407073_06_1_2.pdf) | 炭化水素、官能基、芳香族、合成・天然高分子という大範囲と、構造・性質・反応を結び付ける学習目的を確認。知識グラフへ細分化するのは本プロジェクトの設計判断。 |
| [東邦大学：有機化学は面白い](https://www.mnc.toho-u.ac.jp/v-lab/yuuki/index.html) | 構造と合成、アミノ酸・糖のつながりを専門家の公開講座で確認。大学受験教材へ研究内容をそのまま移植しない。 |
| [授業から電子書籍へ：有機化学演習2日目](https://note.com/knowlab/n/n8714f21a9dca) | 実際の授業で思考手順を可視化する工夫を参照。観察を部分構造の条件へ翻訳し、候補を検算する演習として取り入れる。記載される個別の異性体数を無条件な正解データとして取り込まない。 |
| [大学受験化学：有機化学の構造決定](https://kagakutatsujin.com/structure_determination.html) | 教師の解き方解説・分類の置き方を比較する参考。問題本文や図版は複製しない。 |
| [Expo SDK 57 SQLite](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/) | 永続化、同期トランザクション、WAL、パラメータ付きSQLを確認。インストール済み57.0.26の対応モジュール表を使って依存関係を固定した。 |
| [Expo：Local-first](https://docs.expo.dev/guides/local-first/) | ローカルを学習データの正本とし、オンライン機能を追加層にする方針を確認。 |
| [Expo：オフライン音声ツアー開発者の実装記録](https://expo.dev/blog/the-offline-first-multilingual-audio-tour-app-built-with-expo) | 先行する実装者の、ローカルDBとアセット、更新時の整合性検査という経験を参照。教材はアプリへ同梱し初回ダウンロードを不要にした。 |
| [Expo：ローカルでのアプリ開発](https://docs.expo.dev/guides/local-app-development/) | ネイティブコード生成とローカルビルドの手順。開発用サーバーを要するdebug起動と、JSを内蔵する配布用ビルドを分ける。 |
| [Android公式：アプリツール](https://developer.android.com/studio) | Command-Line Toolsの取得。15859902版を公式掲載SHA-256で照合し、SDK 36等を導入。 |
| [Expo：Permissions](https://docs.expo.dev/guides/permissions/) | ライブラリやテンプレートが付ける権限をblockedPermissionsで除去できることを確認。初版のAndroid APKは通信、オーバーレイ、振動、汎用ストレージ権限を使わない。 |

教材パックの各問題は新規に作成している。自動検証はスキーマ・参照・計算などの整合性を確認するもので、化学的正確さの第三者校閲や難関大学への十分な演習密度を証明しない。
