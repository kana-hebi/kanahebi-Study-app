import React, { useEffect, useMemo, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import organic from './content/organic-polymer.json';
import { ContentPack, KnowledgeNode, Mode, Question, Repository, Snapshot } from './src/domain/models';
import { makeSession, recommend, selectQuestions, statesFor } from './src/domain/engine';
import { checkUpdate, compareVersions, parsePack, validatePack, validateSnapshot } from './src/domain/pack';
import { openRepository } from './src/data/repository';
import { exportJson, importJson } from './src/data/io';
import { Button, C, Card, confirm, Filters, Heading, modeLabels, notify, ProgressBar, s, stateLabels, Tag } from './src/ui/kit';
import { QuestionScreen, ReactionCard, Results, Running } from './src/ui/Session';
const tabs = ['ホーム', 'コース', '自由学習', '復習', 'その他'] as const;
export default function App() { return <SafeAreaProvider><StudyApp /></SafeAreaProvider>; }
function StudyApp() {
  const [init] = useState<{ repo?: Repository; error?: string }>(() => {
    try { const repo = openRepository(), p = validatePack(organic), old = repo.read().packs.find(x => x.manifest.packId === p.manifest.packId);
      if (!old || compareVersions(old.manifest.packVersion, p.manifest.packVersion) <= 0) repo.install(p);
      return { repo }; } catch (e) { return { error: String(e) }; }
  });
  const repo = init.repo;
  const [snapshot, setSnapshot] = useState<Snapshot>(() => repo?.read() ?? { packs: [], attempts: [], bookmarks: [], settings: {} });
  const [packId, setPackId] = useState(snapshot.settings.activePack ?? organic.manifest.packId);
  const [tab, setTab] = useState<(typeof tabs)[number]>('ホーム'), [detail, setDetail] = useState<KnowledgeNode | null>(null), [other, setOther] = useState('menu');
  const [running, setRunning] = useState<Running | null>(null);
  const [unit, setUnit] = useState(''), [node, setNode] = useState(''), [format, setFormat] = useState(''), [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState(''), [count, setCount] = useState('10'), [tracked, setTracked] = useState(true);
  const refresh = () => { try { if (repo) setSnapshot(repo.read()); } catch (e) { notify(String(e)); } };
  const pack = snapshot.packs.find(p => p.manifest.packId === packId) ?? snapshot.packs[0];
  const states = useMemo(() => pack ? statesFor(pack, snapshot.attempts) : {}, [pack, snapshot.attempts]);
  const now = Date.now(), dueNodes = pack?.nodes.filter(n => states[n.id].attempts > 0 && states[n.id].dueAt <= now) ?? [];
  const recommendations = pack ? recommend(pack, states) : [];
  const history = snapshot.attempts.filter(a => a.packId === pack?.manifest.packId);
  const stable = pack?.nodes.filter(n => ['stable', 'mastered'].includes(states[n.id].state)).length ?? 0;
  const attemptedNodes = pack?.nodes.filter(n => states[n.id].attempts > 0).length ?? 0;
  useEffect(() => { const timer = setInterval(refresh, 60000); return () => clearInterval(timer); }, [repo]);
  const goBack = () => { if (running) confirm('学習を終了しますか？', running.session.tracked ? '確定した回答は保存済みです。未回答は記録されません。' : '記録OFFの結果は終了すると消えます。', () => { setRunning(null); refresh(); });
    else if (detail) setDetail(null); else if (other !== 'menu') setOther('menu'); else setTab('ホーム'); };
  useEffect(() => { const sub = BackHandler.addEventListener('hardwareBackPress', () => { if (running || detail || other !== 'menu' || tab !== 'ホーム') { goBack(); return true; } return false; }); return () => sub.remove(); }, [running, detail, other, tab]);
  if (init.error || !pack || !repo) return <SafeAreaView style={s.root}><View style={s.container}><Heading title="データを開けませんでした" /><Text style={s.body}>{init.error ?? '教材がありません'}</Text><Text style={s.bodyMuted}>データを消去せず、エラー画面を開発者へ共有してください。</Text></View></SafeAreaView>;
  const guard = async (fn: () => void | Promise<void>) => { try { await fn(); } catch (e) { notify(e instanceof Error ? e.message : String(e)); } };
  function start(mode: Mode, questions: Question[], record = true) {
    if (!questions.length) { notify('条件に合う問題がありません。範囲や形式を変更してください。'); return; }
    setDetail(null); setRunning({ session: makeSession(pack.manifest.packId, mode, record), questions, index: 0, results: [] });
  }
  const forNode = (n: KnowledgeNode, mode: Mode = 'course') => start(mode, selectQuestions(pack, { nodeId: n.id, count: 5 }, history), mode === 'free' ? tracked : true);
  const finish = () => { setRunning(null); setDetail(null); refresh(); };
  const changePack = (id: string) => { setPackId(id); repo.setSetting('activePack', id); setUnit(''); setNode(''); setFormat(''); setDifficulty(''); setSearch(''); setDetail(null); refresh(); };
  const freeQuestions = selectQuestions(pack, { unitId: unit || undefined, nodeId: node || undefined, kind: format || undefined, difficulty: Number(difficulty) || undefined, count: Number(count) }, history);
  const matchingNodes = pack.nodes.filter(n => (!unit || n.unitId === unit) && (!search || (n.title + n.lesson.core).includes(search)));
  const openNode = (n: KnowledgeNode) => { setDetail(n); setSearch(''); };
  const title = running ? modeLabels[running.session.mode] : detail ? '知識を確認' : tab;
  const prerequisites = detail?.prerequisites.filter(id => states[id]?.cleanSuccesses < 1 || states[id]?.score < .2) ?? [];
  const list = (n: KnowledgeNode) => <Pressable key={n.id} style={s.listItem} onPress={() => openNode(n)}><Text style={s.listTitle}>{n.title}</Text><Text style={s.bodyMuted}>{n.lesson.core}</Text></Pressable>;
  return <SafeAreaView style={s.root} edges={['top', 'left', 'right', 'bottom']}><StatusBar barStyle="light-content" backgroundColor={C.bg} />
    <View style={s.top}><View style={s.brandMark}><Text style={{ color: C.bg, fontSize: 19, fontWeight: '800' }}>k</Text></View><View style={{ flex: 1 }}><Text style={s.brand}>かなへび学習室</Text><Text style={s.topSub}>{title} · 端末内で学習</Text></View><Tag color={C.mint}>オフライン対応</Tag></View>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView key={running ? `${running.session.id}.${running.index}` : detail?.id ?? `${tab}.${other}`} contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      {running ? running.index < running.questions.length ? <QuestionScreen key={`${running.session.id}.${running.index}`} q={running.questions[running.index]} pack={pack} session={running.session} index={running.index} total={running.questions.length} repo={repo} onExit={goBack} onRecord={refresh} onNext={a => { setRunning(r => r ? { ...r, index: r.index + 1, results: [...r.results, a] } : r); refresh(); }} /> : <Results running={running} onFinish={finish} />
      : detail ? <><Button title="戻る" secondary small onPress={() => setDetail(null)} /><Heading title={detail.title} detail={pack.units.find(u => u.id === detail.unitId)?.title} /><Tag color={C.mint}>{stateLabels[states[detail.id].state]}</Tag>
        {!!prerequisites.length && <Card accent={C.gold}><Text style={s.label}>先に確認すると分かりやすい知識</Text>{prerequisites.map(id => <Button key={id} title={pack.nodes.find(n => n.id === id)!.title} secondary small onPress={() => setDetail(pack.nodes.find(n => n.id === id)!)} />)}<Text style={s.caption}>前提不足でも、この知識を学べます。</Text></Card>}
        <Card><Text style={s.label}>考え方</Text><Text style={s.body}>{detail.lesson.core}</Text><Text style={s.label}>例でつなぐ</Text><Text style={s.body}>{detail.lesson.example}</Text><Text style={s.label}>間違えやすいところ</Text><Text style={s.body}>{detail.lesson.caution}</Text></Card>
        <Button title="この知識を練習する" onPress={() => forNode(detail, tab === 'コース' ? 'course' : 'free')} /><Text style={s.caption}>{tab === 'コース' || tracked ? '学習記録ONで開始します' : '自由学習の記録OFFで開始します'}</Text>
        <Button title={snapshot.bookmarks.includes(detail.id) ? 'ブックマークを外す' : 'ブックマークする'} secondary onPress={() => { repo.toggleBookmark(detail.id); refresh(); }} />
        </>
      : tab === 'ホーム' ? <><View style={s.hero}><Text style={s.eyebrow}>YOUR STUDY ROOM</Text><Text style={s.heroTitle}>一つずつ、{`\n`}理解をつなぐ。</Text><Text style={s.bodyMuted}>{pack.manifest.title}</Text></View>
        <View style={s.statRow}>{[[dueNodes.length, '今日の復習'], [attemptedNodes, '確認した知識'], [history.length, '記録した回答']].map(([v, label]) => <View key={label} style={s.stat}><Text style={s.statNumber}>{v}</Text><Text style={s.caption}>{label}</Text></View>)}</View>
        {recommendations[0] && <Card accent={C.mint}><Text style={s.eyebrow}>NEXT STEP</Text><Text style={s.cardTitle}>{recommendations[0].node.title}</Text><Text style={s.bodyMuted}>{recommendations[0].reason}</Text><Button title="おすすめから学ぶ" onPress={() => { setTab('コース'); openNode(recommendations[0].node); }} /></Card>}
        <Card><Text style={s.cardTitle}>自分で選ぶ、自由学習</Text><Text style={s.bodyMuted}>単元や知識、形式から。記録を切って試すこともできます。</Text><Button title="自由学習を開く" secondary onPress={() => setTab('自由学習')} /></Card>
        <Text style={s.sectionTitle}>今の広がり</Text><Text style={s.bodyMuted}>{pack.nodes.length}知識 · {pack.questions.length}問 · {pack.units.length}単元</Text><ProgressBar value={stable / pack.nodes.length} /><Text style={s.caption}>安定・定着 {stable}/{pack.nodes.length}。正答率とは別の目安です。</Text></>
      : tab === 'コース' ? <><Heading title="あなたの次の一歩" detail="回答と復習時期をもとにおすすめします。どの知識も自由に開けます。" />
        {recommendations.slice(0, 4).map((r, i) => <Card key={r.node.id} accent={i === 0 ? C.mint : undefined}><View style={s.row}><Text style={s.stepNumber}>{String(i + 1).padStart(2, '0')}</Text><Tag>{stateLabels[states[r.node.id].state]}</Tag></View><Text style={s.cardTitle}>{r.node.title}</Text><Text style={s.bodyMuted}>{r.reason}</Text><View style={s.row}><Button title="教材を読む" secondary small onPress={() => openNode(r.node)} /><Button title="練習する" small onPress={() => forNode(r.node)} /></View></Card>)}
        <Text style={s.sectionTitle}>すでに学んだ範囲を確認</Text><Text style={s.bodyMuted}>単元ごとの3〜5問を無補助で確認します。短い診断だけで永続的な習得とは扱いません。</Text>
        {pack.units.map(u => <Pressable key={u.id} style={s.listItem} onPress={() => { const qs = selectQuestions(pack, { unitId: u.id, count: 5 }, history); if (qs.length < 3) notify('診断用の問題が不足しています'); else start('diagnostic', qs); }}><Text style={s.listTitle}>{u.title}</Text><Text style={s.bodyMuted}>理解度チェック →</Text></Pressable>)}</>
      : tab === '自由学習' ? <><Heading title="今日、学びたいところから" detail="学ぶ順序も、記録するかどうかも、自分で選べます。" />
        <Card accent={tracked ? C.mint : C.gold}><View style={s.between}><View style={{ flex: 1 }}><Text style={s.cardTitle}>学習記録 {tracked ? 'ON' : 'OFF'}</Text><Text style={s.bodyMuted}>{tracked ? '習熟度・弱点・復習に反映します' : '結果はこの学習中だけ。終了後に残しません'}</Text></View><Switch accessibilityLabel="学習記録" value={tracked} onValueChange={setTracked} trackColor={{ false: '#43505A', true: C.mint }} thumbColor={C.text} /></View></Card>
        <TextInput accessibilityLabel="知識を検索" value={search} onChangeText={setSearch} placeholder="知識・反応を検索" placeholderTextColor={C.muted} style={s.input} />
        <Text style={s.label}>単元</Text><Filters selected={unit} onChange={id => { setUnit(id); setNode(''); }} options={[{ id: '', label: 'すべて' }, ...pack.units.map(u => ({ id: u.id, label: u.title }))]} />
        <Text style={s.label}>形式</Text><Filters selected={format} onChange={setFormat} options={[{ id: '', label: 'すべて' }, { id: 'choice', label: '選択' }, { id: 'text', label: '名称・式' }, { id: 'numeric', label: '計算' }]} />
        <Text style={s.label}>難易度</Text><Filters selected={difficulty} onChange={setDifficulty} options={[{ id: '', label: 'すべて' }, { id: '1', label: '基礎' }, { id: '2', label: '標準' }, { id: '3', label: '応用' }]} />
        <Text style={s.label}>問題数</Text><Filters selected={count} onChange={setCount} options={['5', '10', '20'].map(id => ({ id, label: `${id}問` }))} />
        {node && <Button title="知識の指定を解除" secondary small onPress={() => setNode('')} />}<Button title={`条件から演習する（最大${freeQuestions.length}問）`} disabled={!freeQuestions.length} onPress={() => start('free', freeQuestions, tracked)} />
        <Text style={s.sectionTitle}>知識一覧 · {matchingNodes.length}件</Text>{matchingNodes.map(n => <View key={n.id} style={[s.listItem, node === n.id && { borderColor: C.mint }]}><Pressable onPress={() => openNode(n)}><Text style={s.listTitle}>{n.title}</Text><Text style={s.bodyMuted}>{stateLabels[states[n.id].state]} · 教材を開く →</Text></Pressable><Button title={node === n.id ? '選択中' : 'この知識で絞る'} secondary small onPress={() => setNode(n.id)} /></View>)}</>
      : tab === '復習' ? <><Heading title="覚え直す、つなぎ直す" detail="想起できなかった知識は早めに、無補助の正答は間隔をあけて確認します。" /><Card accent={C.purple}><Text style={s.statNumber}>{dueNodes.length}<Text style={{ fontSize: 18, color: C.muted }}> 知識が復習時期</Text></Text><Button title="今日の復習を始める" disabled={!dueNodes.length} onPress={() => { const ids = new Set(dueNodes.map(n => n.id)); start('review', selectQuestions({ ...pack, questions: pack.questions.filter(q => q.nodeIds.some(id => ids.has(id))) }, { count: 10 }, history)); }} /></Card>
        <Text style={s.sectionTitle}>要確認の知識</Text>{pack.nodes.filter(n => states[n.id].state === 'unstable').map(n => <Card key={n.id}><Text style={s.cardTitle}>{n.title}</Text><Text style={s.bodyMuted}>次の復習：{new Date(states[n.id].dueAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text><Button title="今、復習する" secondary onPress={() => forNode(n, 'review')} /></Card>)}
        {!history.length && <Text style={s.bodyMuted}>記録ONで問題を解くと、ここに復習予定ができます。</Text>}<Text style={s.sectionTitle}>次の予定</Text>{pack.nodes.filter(n => states[n.id].attempts && states[n.id].dueAt > now).sort((a, b) => states[a.id].dueAt - states[b.id].dueAt).slice(0, 10).map(n => <Pressable key={n.id} style={s.listItem} onPress={() => openNode(n)}><Text style={s.listTitle}>{n.title}</Text><Text style={s.bodyMuted}>{new Date(states[n.id].dueAt).toLocaleDateString('ja-JP')}</Text></Pressable>)}</>
      : other === 'menu' ? <><Heading title="学びを見渡す" detail="資料・関係・記録を、必要なときに。" />{[['map', '反応マップ', '条件をたどり、知識へつなぐ'], ['reference', '資料集', '全ての知識を検索'], ['exam', '総合演習', '応用と計算をまとめて練習'], ['progress', '成績・履歴', '分野別の理解と回答を確認'], ['bookmarks', 'ブックマーク', 'もう一度読みたい知識'], ['packs', '教材パック・データ', '教材追加とバックアップ']].map(([id, t, d]) => <Pressable key={id} style={s.listItem} onPress={() => { setOther(id); setSearch(''); }}><Text style={s.listTitle}>{t} →</Text><Text style={s.bodyMuted}>{d}</Text></Pressable>)}
        <Card><Text style={s.label}>この初版について</Text><Text style={s.bodyMuted}>全領域に導入教材を用意しています。難関大向けの十分な演習量・第三者校閲・実機検証は今後の確認項目です。</Text><Text style={s.caption}>v0.1.0 · アカウント不要 · 標準解説は端末内</Text></Card></>
      : <><Button title="その他へ戻る" secondary small onPress={() => { setOther('menu'); setSearch(''); }} />
        {other === 'reference' || other === 'bookmarks' ? <><Heading title={other === 'reference' ? '資料集' : 'ブックマーク'} /><TextInput accessibilityLabel="資料を検索" value={search} onChangeText={setSearch} style={s.input} placeholder="知識名・説明で検索" placeholderTextColor={C.muted} />{pack.nodes.filter(n => (other !== 'bookmarks' || snapshot.bookmarks.includes(n.id)) && (!search || (n.title + n.lesson.core).includes(search))).map(list)}</>
        : other === 'map' ? <><Heading title="反応をたどる" detail="条件を隠して思い出したり、関連する知識を練習できます。" />{pack.reactions.length ? pack.reactions.map(r => <ReactionCard key={r.id} reaction={r} onLearn={() => openNode(pack.nodes.find(n => n.id === r.nodeId)!)} onExercise={() => forNode(pack.nodes.find(n => n.id === r.nodeId)!, 'free')} />) : <Text style={s.bodyMuted}>この教材に反応マップはありません。</Text>}</>
        : other === 'exam' ? <><Heading title="総合演習" detail="初版のオリジナル問題です。実際の過去問や時間制限模試の再現ではありません。" /><Card><Text style={s.body}>応用と計算を横断して、条件から答えを組み立てます。</Text><Button title="総合10問を始める" onPress={() => start('exam', selectQuestions({ ...pack, questions: pack.questions.filter(q => q.difficulty >= 2) }, { count: 10 }, history))} /></Card></>
        : other === 'progress' ? <><Heading title="成績・履歴" detail="習熟度推定は説明可能なルールによる目安です。" /><Card><Text style={s.body}>{history.filter(a => a.firstOutcome === 'correct' && !a.hintsUsed && !a.revealed).length} 無補助の正答 / {history.length} 回答</Text><Text style={s.bodyMuted}>未想起 {history.filter(a => a.firstOutcome === 'unknown').length}件 · ヒント使用 {history.filter(a => a.hintsUsed > 0).length}件</Text></Card>
          {pack.units.map(u => { const ns = pack.nodes.filter(n => n.unitId === u.id), known = ns.filter(n => ['stable', 'mastered'].includes(states[n.id].state)).length; return <Card key={u.id}><Text style={s.cardTitle}>{u.title}</Text><ProgressBar value={known / ns.length} /><Text style={s.caption}>安定・定着 {known}/{ns.length}知識</Text></Card>; })}
          <Text style={s.sectionTitle}>最近の回答</Text>{[...history].sort((a, b) => b.recordedAt - a.recordedAt).slice(0, 30).map(a => <View key={a.id} style={s.listItem}><Text style={s.listTitle}>{pack.questions.find(q => q.id === a.questionId)?.prompt ?? a.questionId}</Text><Text style={s.bodyMuted}>{a.firstOutcome === 'unknown' ? 'わからない' : a.firstOutcome === 'correct' ? '正答' : '誤答'}{a.firstOutcome === 'unknown' && a.finalOutcome === 'correct' ? ' → 補助後に正答' : ''} · ヒント{a.hintsUsed} · {modeLabels[a.mode]}</Text></View>)}</>
        : other === 'packs' ? <><Heading title="教材とデータ" detail="開発者が用意した専用JSONパックをスマホから追加できます。" />{snapshot.packs.map(p => <Card key={p.manifest.packId}><View style={s.row}><Tag color={p.manifest.packId === pack.manifest.packId ? C.mint : C.muted}>{p.manifest.packId === pack.manifest.packId ? '選択中' : p.manifest.subject}</Tag><Text style={s.caption}>v{p.manifest.packVersion}</Text></View><Text style={s.cardTitle}>{p.manifest.title}</Text><Text style={s.bodyMuted}>{p.nodes.length}知識 · {p.questions.length}問</Text><Text style={s.caption}>{p.manifest.description}</Text><Button title="この教材に切り替える" secondary disabled={p.manifest.packId === pack.manifest.packId} onPress={() => changePack(p.manifest.packId)} /></Card>)}
          <Button title="専用教材パックを追加・更新" onPress={() => guard(async () => { const text = await importJson(); if (!text) return; const p = parsePack(text); checkUpdate(snapshot.packs.find(x => x.manifest.packId === p.manifest.packId), p); repo.install(p); refresh(); notify(`「${p.manifest.title}」を保存しました。履歴は保持しています。`); })} />
          <Text style={s.sectionTitle}>学習データのバックアップ</Text><Text style={s.bodyMuted}>教材・回答履歴・設定を保存します。ファイルは暗号化されません。復元は現在のデータを置き換えます。</Text><Button title="バックアップを書き出す" secondary onPress={() => guard(() => exportJson('kanahebi-study-backup.json', repo.read()))} />
          <Button title="バックアップから復元" secondary onPress={() => guard(async () => { const text = await importJson(32000000); if (!text) return; const data = validateSnapshot(JSON.parse(text)); if (!data.packs.length) throw new Error('教材のないバックアップは復元できません'); confirm('データを復元', '現在の学習データを、このファイルの内容で置き換えます。', () => { void guard(() => { repo.restore(data); changePack(data.packs.some(p => p.manifest.packId === data.settings.activePack) ? data.settings.activePack : data.packs[0].manifest.packId); }); }); })} />
          <Text style={s.sectionTitle}>教材の出典</Text>{pack.sources.map(x => <View key={x.id} style={s.listItem}><Text style={s.listTitle}>{x.title}</Text><Text style={s.caption}>{x.use}{x.url ? '\n' + x.url : ''}</Text></View>)}</> : null}</>}
    </ScrollView></KeyboardAvoidingView>
    {!running && <View style={s.nav}>{tabs.map(t => <Pressable key={t} accessibilityRole="tab" accessibilityState={{ selected: tab === t }} onPress={() => { setTab(t); setDetail(null); setOther('menu'); setSearch(''); }} style={s.navItem}><View style={[s.navDot, tab === t && { backgroundColor: C.mint }]} /><Text style={[s.navText, tab === t && { color: C.mint }]}>{t}</Text></Pressable>)}</View>}
  </SafeAreaView>;
}
