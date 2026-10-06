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

## v0.2.0 高分子の調査

高分子40教材を改訂し、教材29図・演習15図、例題40題、独自演習180問を追加した。範囲と採用判断は [POLYMER_CONTENT.md](POLYMER_CONTENT.md) にまとめた。以下は新規外部資料20件の参照記録。出典の本文・抄録・製品情報・教育範囲のどこを使ったかはパックの `sources[].use` に記録する。

| 資料 | 参照した範囲 |
|---|---|
| [高分子学会：IUPAC高分子用語の日本語訳](https://main.spsj.or.jp/c19/iupac/Recommendations/glossary36.html) | 2026-10-06確認。重合・重付加・重縮合・開環・共重合・網目の用語を確認。高校で使う分類と専門的な分類を区別。 本文・図・設問は転載せず、本教材で独自作成。 |
| [英国王立化学会：縮合重合の教育範囲](https://edu.rsc.org/resources/condensation-polymerisation-organic-chemistry-worksheets-14-16/4012558.article) | 2026-10-06確認。検索索引で二官能性原料、ポリエステル・ポリアミドの指導範囲を確認。本文取得はできず、添付教材は未使用。 本文・図・設問は転載せず、本教材で独自作成。 |
| [日本化学会：ナイロンの合成と反応（2011）](https://www.jstage.jst.go.jp/article/kakyoshi/59/12/59_KJ00007731216/_article/-char/ja/) | 2026-10-06確認。高校のナイロン合成教育の範囲を確認。酸と酸塩化物による副生成物の違いは化学量論から独自説明。 本文・図・設問は転載せず、本教材で独自作成。 |
| [東京都立武蔵高校：ナイロン66の合成授業](https://www.metro.ed.jp/musashi-h/news/2026/09/3_66.html) | 2026-10-06確認。界面で繊維を生成・引き上げる実際の授業観察を確認。写真・実験手順は転載しない。 本文・図・設問は転載せず、本教材で独自作成。 |
| [高分子学会論文：ナイロン6の単量体化（2001）](https://www.jstage.jst.go.jp/article/koron1974/58/10/58_10_548/_article/-char/ja) | 2026-10-06確認。ナイロン6のε-カプロラクタム開環重合と加水分解の関係を確認。特殊な実験条件を通常の高校反応と混同しない。 本文・図・設問は転載せず、本教材で独自作成。 |
| [クラレ：PVOH技術情報](https://poval.kuraray.com/en/library/) | 2026-10-06確認。ポリ酢酸ビニルの加水分解によるPVA製造を確認。 本文・図・設問は転載せず、本教材で独自作成。 |
| [クラレ：ビニロン製品情報](https://www.kuraray.com/jp-ja/products/pva-fiber/) | 2026-10-06確認。PVA繊維の用途と、水溶性製品も存在する点を確認。高校の代表製法と市販製品全体を区別。 本文・図・設問は転載せず、本教材で独自作成。 |
| [クラレ：メタクリル製品](https://methacrylate.kuraray.com/en/) | 2026-10-06確認。MMA・PMMA・アクリル樹脂の関係と透明性の用途を確認。 本文・図・設問は転載せず、本教材で独自作成。 |
| [ダイキン：PTFE Fシリーズ](https://www.daikinchemicals.com/solutions/products/fluoropolymers/polyflon-ptfe-f.html) | 2026-10-06確認。PTFEの耐熱・耐薬品性などの代表的な用途を確認。数値保証や無制限の耐熱性は教材で主張しない。 本文・図・設問は転載せず、本教材で独自作成。 |
| [Veolia：イオン交換技術ハンドブック](https://www.watertechnologies.com/handbook/chapter-08-ion-exchange) | 2026-10-06確認。固定官能基と交換される対イオン、陽・陰イオン交換の区別を確認。電荷計算は独自作問。 本文・図・設問は転載せず、本教材で独自作成。 |
| [三和澱粉工業：でん粉の構造](https://www.sanwa-starch.co.jp/hyakka00/hyakka03/hyakka03_02/) | 2026-10-06確認。アミロース・アミロペクチンとヨウ素呈色の違いを確認。 本文・図・設問は転載せず、本教材で独自作成。 |
| [日本化学会：ヨウ素デンプン反応の発色（2015）](https://www.jstage.jst.go.jp/article/kakyoshi/63/5/63_KJ00010110249/_article/-char/ja) | 2026-10-06確認。呈色が主にアミロース内部のヨウ素種に関係する点を確認。発色の詳細な電子論は高校範囲から除外。 本文・図・設問は転載せず、本教材で独自作成。 |
| [東京大学：セルロースの構造](https://forestchemistry.fp.a.u-tokyo.ac.jp/celluloseHP/bacteria_cellulose.html) | 2026-10-06確認。β-1,4結合とセルロース鎖の水素結合を確認。特定製品の市場予測・数値は使用しない。 本文・図・設問は転載せず、本教材で独自作成。 |
| [旭化成：ベンベルグ（キュプラ）](https://www.asahi-kasei.com/jp/services-products/comfortlife) | 2026-10-06確認。セルロース原料からの再生繊維という製品分類を確認。製造写真は未使用。 本文・図・設問は転載せず、本教材で独自作成。 |
| [日本化学会：アミノ酸・タンパク質の検出（2015）](https://www.jstage.jst.go.jp/article/kakyoshi/63/3/63_KJ00010079896/_article/-char/ja) | 2026-10-06確認。検出反応の指導上の注意を確認。検出条件と反応性の差を明示し、全アミノ酸への一般化を避ける。 本文・図・設問は転載せず、本教材で独自作成。 |
| [米国NHGRI：塩基対](https://www.genome.gov/genetics-glossary/Base-Pair) | 2026-10-06確認。DNAの相補的塩基対と水素結合の役割を確認。 本文・図・設問は転載せず、本教材で独自作成。 |
| [米国NHGRI：ヌクレオチド](https://www.genome.gov/genetics-glossary/Nucleotide) | 2026-10-06確認。糖・塩基・リン酸の3成分とDNA/RNAの糖の違いを確認。 本文・図・設問は転載せず、本教材で独自作成。 |
| [日本バイオプラスチック協会：生分解性プラスチック](https://jbpaweb.net/english/e-gp/) | 2026-10-06確認。生分解性の概念を確認。分解速度の数値を一般化しない。 本文・図・設問は転載せず、本教材で独自作成。 |
| [日本バイオプラスチック協会：バイオマスプラスチック](https://www.jbpaweb.net/english/e-bp/) | 2026-10-06確認。原料由来の分類と、生分解性という性質による分類を区別。 本文・図・設問は転載せず、本教材で独自作成。 |
| [山形大学：高分子科学の教育範囲](https://www.yamagata-u.ac.jp/gakumu/syllabus/2026/html/05_52212.html) | 2026-10-06確認。平均分子量・結晶・非晶・ガラス転移・融解の学習範囲を確認。大学の発展事項には発展と表示する。 本文・図・設問は転載せず、本教材で独自作成。 |

文章、図、問題は独自作成した。原文・外部図版・既存の入試問題の複製は収録していない。RSCは検索索引で範囲を確認しただけで本文・添付は未取得。抄録だけの資料も本文を読んだ根拠としては扱わない。
