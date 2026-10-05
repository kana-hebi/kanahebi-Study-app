import { CAPABILITIES, ContentPack, Snapshot } from './models';
const object = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length < 20000;
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(str);
export function validatePack(value: unknown): ContentPack {
  const fail = (m: string): never => { throw new Error(`教材パック: ${m}`); };
  if (!object(value) || !object(value.manifest)) fail('形式が違います');
  const p = value as Record<string, any>, m = p.manifest;
  if (m.schemaVersion !== 1 || !str(m.packId) || !/^[a-z][a-z0-9.-]{2,100}$/.test(m.packId)
    || !str(m.packVersion) || !/^\d+\.\d+\.\d+$/.test(m.packVersion) || !str(m.title)
    || !str(m.publisher) || !str(m.subject) || !str(m.language) || !str(m.description)) fail('manifestが不正です');
  if (!strings(m.requiredCapabilities) || m.requiredCapabilities.some((c: string) => !CAPABILITIES.includes(c))) fail('未対応の機能が必要です');
  for (const [key, limit] of [['units', 500], ['nodes', 5000], ['questions', 10000], ['reactions', 2000], ['sources', 200]] as const) {
    if (!Array.isArray(p[key]) || p[key].length > limit) fail(`${key}のサイズが不正です`);
  }
  if (!p.units.length || !p.nodes.length || !p.questions.length) fail('教材が空です');
  const unique = (xs: any[], name: string) => {
    const ids = new Set<string>();
    for (const x of xs) {
      if (!object(x) || !str(x.id) || !x.id.startsWith(m.packId + '.') || ids.has(x.id)) fail(`${name}のIDが不正/重複しています`);
      ids.add(x.id);
    }
    return ids;
  };
  const units = unique(p.units, 'unit'), nodes = unique(p.nodes, 'node');
  unique(p.questions, 'question'); unique(p.reactions, 'reaction');
  const sources = new Set<string>();
  for (const s of p.sources) {
    if (!object(s) || !str(s.id) || sources.has(s.id) || !str(s.title) || !str(s.use)
      || (s.url !== undefined && (!str(s.url) || !/^https:\/\//.test(s.url)))) fail('出典が不正です');
    sources.add(s.id);
  }
  for (const u of p.units) if (!str(u.title) || !str(u.summary) || !Number.isInteger(u.stage) || u.stage < 0) fail('単元が不正です');
  const graph = new Map<string, string[]>();
  for (const n of p.nodes) {
    if (!units.has(n.unitId) || !str(n.title) || !str(n.dimension) || !strings(n.prerequisites)
      || n.prerequisites.some((id: string) => !nodes.has(id)) || !object(n.lesson)
      || !['core', 'example', 'caution'].every(k => str(n.lesson[k]))) fail('知識ノードが不正です');
    graph.set(n.id, n.prerequisites);
  }
  const visiting = new Set<string>(), done = new Set<string>();
  const visit = (id: string) => { if (visiting.has(id)) fail('前提関係が循環しています'); if (done.has(id)) return;
    visiting.add(id); graph.get(id)!.forEach(visit); visiting.delete(id); done.add(id); };
  nodes.forEach(visit);
  for (const q of p.questions) {
    if (!strings(q.nodeIds) || !q.nodeIds.length || new Set(q.nodeIds).size !== q.nodeIds.length || q.nodeIds.some((id: string) => !nodes.has(id))
      || !str(q.prompt) || ![1, 2, 3].includes(q.difficulty) || !strings(q.hints) || q.hints.length < 2
      || !str(q.explanation) || !sources.has(q.sourceId)) fail('問題の参照/説明が不正です');
    const capability = q.kind === 'choice' ? 'question.multipleChoice.v1' : q.kind === 'text' ? 'question.textInput.v1' : 'question.numericInput.v1';
    if (!m.requiredCapabilities.includes(capability)) fail('問題形式のcapabilityが宣言されていません');
    if (q.kind === 'choice') {
      if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 8 || !str(q.answer)) fail('選択問題が不正です');
      const ids = new Set();
      for (const c of q.choices) {
        if (!object(c) || !str(c.id) || ids.has(c.id) || !str(c.text) || !str(c.feedback)
          || (c.misconception !== undefined && !str(c.misconception))) fail('選択肢が不正です'); ids.add(c.id);
      }
      if (!ids.has(q.answer)) fail('正解の選択肢が存在しません');
    } else if (q.kind === 'text') {
      if (!str(q.answer) || (q.aliases !== undefined && !strings(q.aliases))) fail('文字入力の正解が不正です');
    } else if (q.kind === 'numeric') {
      if (typeof q.answer !== 'number' || !Number.isFinite(q.answer) || typeof q.tolerance !== 'number'
        || !Number.isFinite(q.tolerance) || q.tolerance < 0 || (q.unit !== undefined && !str(q.unit))) fail('数値の正解が不正です');
    } else fail('未対応の問題形式です');
  }
  for (const r of p.reactions) if (![r.from, r.to, r.condition, r.type].every(str) || !nodes.has(r.nodeId)) fail('反応が不正です');
  // Only JSON data is retained. The pack never supplies evaluated code, HTML or paths.
  return JSON.parse(JSON.stringify(p)) as ContentPack;
}
export function parsePack(text: string): ContentPack {
  if (text.length > 5_000_000) throw new Error('教材パックは5MB以下にしてください');
  return validatePack(JSON.parse(text));
}
export function compareVersions(a: string, b: string) {
  const aa = a.split('.').map(Number), bb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (aa[i] !== bb[i]) return aa[i] - bb[i]; return 0;
}
export function checkUpdate(oldPack: ContentPack | undefined, pack: ContentPack) {
  if (!oldPack) return;
  if (compareVersions(pack.manifest.packVersion, oldPack.manifest.packVersion) < 0) throw new Error('古い版への更新はできません');
  const nodeIds = new Set(pack.nodes.map(n => n.id));
  if (oldPack.nodes.some(n => !nodeIds.has(n.id))) throw new Error('既存の知識IDを削除する更新は移行処理が必要です');
  if (compareVersions(pack.manifest.packVersion, oldPack.manifest.packVersion) === 0 && JSON.stringify(oldPack) !== JSON.stringify(pack)) throw new Error('内容変更には教材バージョンを上げてください');
}
export function validateSnapshot(value: unknown): Snapshot {
  if (!object(value) || !Array.isArray(value.packs) || !Array.isArray(value.attempts) || value.attempts.length > 100000
    || !strings(value.bookmarks) || !object(value.settings)) throw new Error('バックアップの形式が違います');
  const packs = value.packs.map(validatePack);
  if (new Set(packs.map(p => p.manifest.packId)).size !== packs.length) throw new Error('教材IDが重複しています');
  const ids = new Set<string>();
  for (const a of value.attempts) {
    if (!object(a) || !str(a.id) || ids.has(a.id) || !str(a.sessionId) || !str(a.packId) || !str(a.packVersion)
      || !str(a.questionId) || !strings(a.nodeIds) || !a.nodeIds.length || !['course', 'free', 'review', 'diagnostic', 'exam'].includes(a.mode)
      || !['correct', 'incorrect', 'unknown'].includes(a.firstOutcome) || ![null, 'correct', 'incorrect', 'unknown'].includes(a.finalOutcome)
      || !Number.isFinite(a.startedAt) || !Number.isFinite(a.recordedAt) || !Number.isFinite(a.latencyMs) || a.latencyMs < 0
      || !Number.isInteger(a.hintsUsed) || a.hintsUsed < 0 || typeof a.revealed !== 'boolean'
      || (a.answer !== undefined && typeof a.answer !== 'string') || (a.misconception !== undefined && !str(a.misconception))
      || (a.firstOutcome === 'unknown' && a.misconception !== undefined)) throw new Error('解答履歴が不正です');
    if (!packs.some(p => p.manifest.packId === a.packId && a.nodeIds.every((id: string) => p.nodes.some(n => n.id === id)))) throw new Error('履歴に対応する知識がありません');
    ids.add(a.id);
  }
  if (Object.entries(value.settings).some(([k, v]) => !str(k) || typeof v !== 'string')) throw new Error('設定が不正です');
  return JSON.parse(JSON.stringify({ ...value, packs })) as Snapshot;
}
