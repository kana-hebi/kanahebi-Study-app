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
  const refs = (v: any) => strings(v) && v.length > 0 && new Set(v).size === v.length && v.every(id => sources.has(id));
  const diagrams = new Set<string>();
  const colors = ['text', 'muted', 'mint', 'purple', 'gold', 'red'];
  if (p.diagrams !== undefined) {
    if (!Array.isArray(p.diagrams) || p.diagrams.length > 500 || !m.requiredCapabilities.includes('render.vectorDiagram.v1')) fail('図解機能/サイズが不正です');
    for (const d of p.diagrams) {
      if (!object(d) || !str(d.id) || !d.id.startsWith(m.packId + '.') || diagrams.has(d.id)
        || !str(d.title) || !str(d.description) || !refs(d.sourceIds)
        || !Number.isFinite(d.width) || d.width < 240 || d.width > 1200
        || !Number.isFinite(d.height) || d.height < 80 || d.height > 1600
        || !Array.isArray(d.elements) || !d.elements.length || d.elements.length > 200) fail('図解が不正です');
      const x = (v: any) => Number.isFinite(v) && v >= 0 && v <= d.width;
      const y = (v: any) => Number.isFinite(v) && v >= 0 && v <= d.height;
      for (const e of d.elements) {
        if (!object(e) || (e.color !== undefined && !colors.includes(e.color)) || (e.dashed !== undefined && typeof e.dashed !== 'boolean')) fail('図解要素が不正です');
        if (e.type === 'text') { if (!x(e.x) || !y(e.y) || !str(e.text) || e.text.length > 100 || /[\r\n]/.test(e.text)
          || (e.size !== undefined && (!Number.isFinite(e.size) || e.size < 12 || e.size > 32))
          || (e.align !== undefined && !['start', 'middle', 'end'].includes(e.align))) fail('図解文字が不正です'); }
        else if (e.type === 'line') { if (!x(e.x1) || !x(e.x2) || !y(e.y1) || !y(e.y2)) fail('図解の線が不正です'); }
        else if (e.type === 'polyline') { if (!Array.isArray(e.points) || e.points.length < 2 || e.points.length > 100 || e.points.some((pt: any) => !Array.isArray(pt) || pt.length !== 2 || !x(pt[0]) || !y(pt[1]))) fail('図解の折れ線が不正です'); }
        else if (e.type === 'rect') { if (!x(e.x) || !y(e.y) || !(e.width > 0) || !(e.height > 0) || !x(e.x + e.width) || !y(e.y + e.height)) fail('図解の矩形が不正です'); }
        else if (e.type === 'ellipse') { if (!(e.rx > 0) || !(e.ry > 0) || !x(e.cx - e.rx) || !x(e.cx + e.rx) || !y(e.cy - e.ry) || !y(e.cy + e.ry)) fail('図解の楕円が不正です'); }
        else fail('未対応の図解要素です');
      }
      diagrams.add(d.id);
    }
  }
  const diagramRef = (id: any) => str(id) && diagrams.has(id);
  const blocks = (v: any) => {
    if (!Array.isArray(v) || !v.length || v.length > 40 || !m.requiredCapabilities.includes('render.lessonBlocks.v1')) fail('詳細教材機能/サイズが不正です');
    for (const b of v) {
      if (!object(b)) fail('詳細教材が不正です');
      if (b.type === 'diagram') { if (!diagramRef(b.diagramId)) fail('図解の参照が不正です'); }
      else if (!str(b.heading)) fail('教材見出しが不正です');
      else if (b.type === 'paragraph') { if (!str(b.body)) fail('教材本文が不正です'); }
      else if (b.type === 'table') { if (!strings(b.columns) || b.columns.length < 2 || b.columns.length > 5 || !Array.isArray(b.rows) || !b.rows.length || b.rows.length > 30 || b.rows.some((r: any) => !strings(r) || r.length !== b.columns.length)) fail('比較表が不正です'); }
      else if (b.type === 'worked') { if (!str(b.prompt) || !strings(b.steps) || !b.steps.length || b.steps.length > 12 || !str(b.answer) || (b.diagramId !== undefined && !diagramRef(b.diagramId))) fail('例題が不正です'); }
      else fail('未対応の教材ブロックです');
    }
  };
  for (const u of p.units) if (!str(u.title) || !str(u.summary) || !Number.isInteger(u.stage) || u.stage < 0) fail('単元が不正です');
  const graph = new Map<string, string[]>();
  for (const n of p.nodes) {
    if (!units.has(n.unitId) || !str(n.title) || !str(n.dimension) || !strings(n.prerequisites)
      || n.prerequisites.some((id: string) => !nodes.has(id)) || !object(n.lesson)
      || !['core', 'example', 'caution'].every(k => str(n.lesson[k]))) fail('知識ノードが不正です');
    if (n.lesson.goals !== undefined && (!strings(n.lesson.goals) || !n.lesson.goals.length || n.lesson.goals.length > 8)) fail('到達目標が不正です');
    if (n.lesson.sourceIds !== undefined && !refs(n.lesson.sourceIds)) fail('教材の出典参照が不正です');
    if (n.lesson.relatedNodeIds !== undefined && (!strings(n.lesson.relatedNodeIds) || n.lesson.relatedNodeIds.length > 8 || n.lesson.relatedNodeIds.some((id: string) => id === n.id || !nodes.has(id)))) fail('関連教材の参照が不正です');
    if (n.lesson.blocks !== undefined) blocks(n.lesson.blocks);
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
    if (q.sourceIds !== undefined && !refs(q.sourceIds)) fail('問題の出典参照が不正です');
    if (q.diagramId !== undefined && !diagramRef(q.diagramId)) fail('問題の図解参照が不正です');
    if (q.explanationBlocks !== undefined) blocks(q.explanationBlocks);
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
