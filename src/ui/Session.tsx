import React, { useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { answerLabel, grade, newId } from '../domain/engine';
import { Attempt, ContentPack, Question, Repository, Session } from '../domain/models';
import { Button, C, Card, Heading, ProgressBar, s, Tag } from './kit';
export type Running = { session: Session; questions: Question[]; index: number; results: Attempt[] };
export function QuestionScreen({ q, pack, session, index, total, repo, onExit, onNext, onRecord }: { q: Question; pack: ContentPack; session: Session; index: number; total: number; repo: Repository; onExit: () => void; onNext: (a: Attempt) => void; onRecord: () => void }) {
  const [startedAt] = useState(Date.now), [attemptId] = useState(newId), [input, setInput] = useState(''), [hints, setHints] = useState(0);
  const [unknown, setUnknown] = useState(false), [showAnswer, setShowAnswer] = useState(false), [draft, setDraft] = useState<Attempt | null>(null), [error, setError] = useState('');
  const latest = useRef<Attempt | null>(null), [busy, setBusy] = useState(false);
  const choices = useMemo(() => { const a = [...(q.choices ?? [])]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }, [q.id]);
  const persist = (a: Attempt) => { try { repo.saveAttempt(session, a); latest.current = a; setDraft(a); onRecord(); setError(''); return true; } catch { setError('保存できませんでした。回答を維持しています。もう一度試してください。'); return false; } };
  const attempt = (first: Attempt['firstOutcome'], changes: Partial<Attempt> = {}): Attempt => ({ id: attemptId, sessionId: session.id, mode: session.mode, packId: session.packId, packVersion: pack.manifest.packVersion,
    questionId: q.id, nodeIds: q.nodeIds, startedAt, recordedAt: latest.current?.recordedAt ?? Date.now(), firstOutcome: latest.current?.firstOutcome ?? first,
    finalOutcome: first, hintsUsed: hints, revealed: showAnswer, latencyMs: Date.now() - startedAt, ...latest.current, ...changes });
  const answer = (raw: string) => { if (busy || showAnswer || latest.current?.finalOutcome === 'correct' || latest.current?.finalOutcome === 'incorrect') return; const result = grade(q, raw);
    if (!result) { setError(q.kind === 'numeric' ? '単位を付けず、有限の数値だけを入力してください。' : '回答を入力してください。'); return; }
    setBusy(true); const a = attempt(result.outcome, { finalOutcome: result.outcome, hintsUsed: hints, revealed: false, answer: raw, misconception: unknown ? undefined : result.misconception });
    if (persist(a)) setShowAnswer(true); setBusy(false);
  };
  const markUnknown = () => { if (showAnswer || draft) return; const a = attempt('unknown', { finalOutcome: null, hintsUsed: hints }); if (persist(a)) setUnknown(true); };
  const hint = () => { if (hints >= q.hints.length || showAnswer) return; const n = hints + 1;
    const a = latest.current ? { ...latest.current, hintsUsed: n } : attempt('unknown', { finalOutcome: null, hintsUsed: n });
    if (persist(a)) { setHints(n); setUnknown(true); }
  };
  const reveal = () => { const a = attempt('unknown', { finalOutcome: latest.current?.finalOutcome ?? 'unknown', revealed: true, hintsUsed: hints }); if (persist(a)) { setUnknown(a.firstOutcome === 'unknown'); setShowAnswer(true); } };
  const done = showAnswer && draft;
  return <><View style={s.between}><Button title="終了" secondary small onPress={onExit} /><Tag color={session.tracked ? C.mint : C.gold}>{session.tracked ? '記録ON' : '記録OFF'}</Tag></View><Text style={s.caption}>QUESTION {index + 1} / {total} · {q.difficulty === 1 ? '基礎' : q.difficulty === 2 ? '標準' : '応用'}</Text><ProgressBar value={(index + 1) / total} />
    <Card><Text style={s.question}>{q.prompt}</Text>{q.kind === 'choice' ? choices.map(c => <Pressable key={c.id} accessibilityRole="button" disabled={showAnswer || busy} onPress={() => answer(c.id)} style={[s.answerChoice, showAnswer && c.id === q.answer && s.correctChoice, showAnswer && draft?.answer === c.id && c.id !== q.answer && { borderColor: C.red }]}><Text style={s.body}>{c.text}</Text></Pressable>)
    : <><TextInput accessibilityLabel="回答" value={input} editable={!showAnswer} onChangeText={setInput} onSubmitEditing={() => answer(input)} placeholder={q.kind === 'numeric' ? `数値だけ入力${q.unit ? '（' + q.unit + '）' : ''}` : '名称・式を入力'} keyboardType={q.kind === 'numeric' ? 'decimal-pad' : 'default'} autoCapitalize="none" autoCorrect={false} style={s.input} placeholderTextColor={C.muted} /><Button title="回答する" disabled={showAnswer || busy} onPress={() => answer(input)} /></>}
    {!showAnswer && <Button title="わからない" secondary disabled={unknown} onPress={markUnknown} />}
    {error ? <Text accessibilityRole="alert" style={{ color: C.red }}>{error}</Text> : null}</Card>
    {unknown && !showAnswer && <Card accent={C.gold}><Text style={s.cardTitle}>ここから理解をつなぎましょう</Text><Text style={s.bodyMuted}>最初に思い出せなかったことと、補助後の回答を分けて扱います。</Text><Button title="ヒントを見る" secondary disabled={hints >= q.hints.length} onPress={hint} /><Button title="答えと解説を見る" onPress={reveal} /></Card>}
    {!showAnswer && !unknown && <View style={s.row}><Button title="ヒントを見る" secondary small onPress={hint} /><Button title="答えと解説を見る" secondary small onPress={reveal} /></View>}
    {q.hints.slice(0, hints).map((h, i) => <Card key={i} accent={C.purple}><Text style={s.label}>ヒント {i + 1}</Text><Text style={s.body}>{h}</Text></Card>)}
    {done && <Card accent={draft.finalOutcome === 'correct' ? C.mint : C.gold}><Text style={[s.cardTitle, { color: draft.finalOutcome === 'correct' ? C.mint : C.gold }]}>{draft.finalOutcome === 'correct' ? draft.firstOutcome === 'unknown' || hints ? '補助後に正答' : '正答です' : '解説で確認しましょう'}</Text><Text style={s.label}>答え：{answerLabel(q)}</Text><Text style={s.body}>{q.explanation}</Text>{q.kind === 'choice' && draft.answer && draft.answer !== q.answer && <Text style={s.bodyMuted}>{q.choices?.find(c => c.id === draft.answer)?.feedback}</Text>}<Button title={index + 1 === total ? '結果を見る' : '次の問題へ'} onPress={() => onNext(draft)} /></Card>}
  </>;
}
export function Results({ running, onFinish }: { running: Running; onFinish: () => void }) {
  const clean = running.results.filter(a => a.firstOutcome === 'correct' && !a.hintsUsed && !a.revealed).length;
  const helped = running.results.filter(a => a.finalOutcome === 'correct' && (a.firstOutcome === 'unknown' || a.hintsUsed)).length;
  return <><Heading title="おつかれさまでした" detail={running.session.tracked ? '今回の証拠をもとに、次の学習と復習を更新しました。' : '今回の結果は保存されません。この画面を閉じると消えます。'} /><Card accent={C.mint}><Text style={s.bigResult}>{clean}<Text style={{ fontSize: 24, color: C.muted }}> / {running.results.length}</Text></Text><Text style={s.bodyMuted}>無補助の正答</Text><Text style={s.body}>補助後の正答：{helped}問</Text><Text style={s.body}>最初の未想起：{running.results.filter(a => a.firstOutcome === 'unknown').length}問</Text></Card>
    {running.session.mode === 'diagnostic' && <Card accent={C.purple}><Text style={s.cardTitle}>{clean === running.questions.length ? 'このチェック範囲は無補助で通過' : '補う知識が見つかりました'}</Text><Text style={s.bodyMuted}>正答した知識は次の推奨へ反映します。単元全体を永久に習得した扱いにはしません。</Text></Card>}
    <Button title="学習画面へ戻る" onPress={onFinish} /></>;
}
export function ReactionCard({ reaction: r, onLearn, onExercise }: { reaction: ContentPack['reactions'][number]; onLearn: () => void; onExercise: () => void }) {
  const [hidden, setHidden] = useState(false);
  return <Card><Tag color={C.purple}>{r.type}</Tag><Text style={s.cardTitle}>{r.from}</Text><Text style={{ color: C.mint, marginVertical: 8 }}>↓ {hidden ? '条件を思い出してみよう' : r.condition}</Text><Text style={s.cardTitle}>{r.to}</Text><View style={s.row}><Button title={hidden ? '条件を表示' : '条件を隠す'} secondary small onPress={() => setHidden(!hidden)} /><Button title="教材へ" secondary small onPress={onLearn} /><Button title="練習" small onPress={onExercise} /></View></Card>;
}
