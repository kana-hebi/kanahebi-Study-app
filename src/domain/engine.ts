import { Attempt, ContentPack, KnowledgeNode, LearnerState, Question, Session } from './models';
const DAY = 86400000;
export function normalizeText(input: string) {
  return input.normalize('NFKC').trim().toLowerCase().replace(/[\s・]/g, '').replace(/[₀-₉]/g, c => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c)));
}
export function grade(q: Question, raw: string): { outcome: 'correct' | 'incorrect'; misconception?: string } | null {
  if (!raw.trim()) return null;
  let correct = false, misconception: string | undefined;
  if (q.kind === 'choice') {
    const c = q.choices!.find(c => c.id === raw); if (!c) return null;
    correct = raw === q.answer; if (!correct) misconception = c.misconception;
  } else if (q.kind === 'text') correct = [String(q.answer), ...(q.aliases ?? [])].some(x => normalizeText(x) === normalizeText(raw));
  else {
    const s = raw.normalize('NFKC').trim();
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(s)) return null;
    const n = Number(s); if (!Number.isFinite(n)) return null;
    correct = Math.abs(n - Number(q.answer)) <= (q.tolerance ?? 0) + Number.EPSILON * Math.max(1, Math.abs(Number(q.answer))) * 4;
  }
  return { outcome: correct ? 'correct' : 'incorrect', misconception };
}
export function answerLabel(q: Question) { return q.kind === 'choice' ? q.choices!.find(c => c.id === q.answer)!.text : `${q.answer}${q.unit ? ' ' + q.unit : ''}`; }
export function newId() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 11); }
export function makeSession(packId: string, mode: Session['mode'], tracked = true): Session {
  return { id: newId(), mode, tracked: mode === 'free' ? tracked : true, packId, startedAt: Date.now() };
}
export function statesFor(pack: ContentPack, all: Attempt[]): Record<string, LearnerState> {
  const result: Record<string, LearnerState> = {};
  for (const n of pack.nodes) {
    const events = all.filter(a => a.packId === pack.manifest.packId && a.nodeIds.includes(n.id)).sort((a, b) => a.recordedAt - b.recordedAt || a.id.localeCompare(b.id));
    let score = 0, clean = 0, streak = 0, dueAt = 0, lastAt = 0;
    const seen = new Set<string>(), cleanDays = new Set<number>(), misconceptions = new Set<string>();
    for (const a of events) {
      const unassisted = a.firstOutcome === 'correct' && !a.hintsUsed && !a.revealed;
      const newQuestion = !seen.has(a.questionId), newDay = !cleanDays.has(Math.floor(a.recordedAt / DAY));
      if (unassisted) {
        const gain = newQuestion ? .26 : newDay ? .12 : .02;
        score = Math.min(.99, score + gain); clean++; streak++;
        cleanDays.add(Math.floor(a.recordedAt / DAY));
        // Same-session repetition cannot grow the interval to weeks.
        dueAt = a.recordedAt + [1, 3, 7, 14, 30][Math.min(4, cleanDays.size - 1)] * DAY;
      } else {
        score = Math.max(0, score * .65 + (a.finalOutcome === 'correct' ? .06 : 0)); streak = 0;
        dueAt = a.recordedAt + 10 * 60000;
      }
      seen.add(a.questionId); lastAt = a.recordedAt; if (a.misconception && a.firstOutcome !== 'unknown') misconceptions.add(a.misconception);
    }
    const state = !events.length ? 'unseen' : score >= .85 && seen.size >= 3 && cleanDays.size >= 3 && streak >= 3 ? 'mastered'
      : score >= .65 && clean >= 3 ? 'stable' : events.at(-1)!.firstOutcome !== 'correct' ? 'unstable' : 'learning';
    result[n.id] = { nodeId: n.id, score, state, attempts: events.length, cleanSuccesses: clean, distinctQuestions: seen.size, dueAt, lastAt, misconceptions: [...misconceptions] };
  }
  return result;
}
export function recommend(pack: ContentPack, states: Record<string, LearnerState>, now = Date.now()): { node: KnowledgeNode; reason: string }[] {
  return pack.nodes.map((node, order) => {
    const s = states[node.id], gaps = node.prerequisites.filter(id => states[id]?.cleanSuccesses < 1 || states[id]?.score < .2);
    const due = s.attempts > 0 && s.dueAt <= now;
    const rank = due ? -100 - Math.min(100, (now - s.dueAt) / DAY) : gaps.length ? 1000 + gaps.length * 100 + order : s.state === 'unseen' ? order : 300 + s.score * 100 + order;
    const reason = due ? '復習の時期です' : gaps.length ? `先に「${pack.nodes.find(n => n.id === gaps[0])?.title}」がおすすめ` : s.state === 'unseen' ? '次の知識を確認しましょう' : s.state === 'unstable' ? 'つまずきを確認しましょう' : '理解を確かめましょう';
    return { node, reason, rank };
  }).sort((a, b) => a.rank - b.rank).map(({ node, reason }) => ({ node, reason }));
}
export function selectQuestions(pack: ContentPack, options: { nodeId?: string; unitId?: string; kind?: string; difficulty?: number; count: number }, history: Attempt[] = []): Question[] {
  const unitNodes = new Set(pack.nodes.filter(n => !options.unitId || n.unitId === options.unitId).map(n => n.id));
  const last = new Map<string, number>(); history.forEach(a => last.set(a.questionId, a.recordedAt));
  return pack.questions.filter(q => (!options.nodeId || q.nodeIds.includes(options.nodeId)) && q.nodeIds.some(id => unitNodes.has(id))
    && (!options.kind || q.kind === options.kind) && (!options.difficulty || q.difficulty === options.difficulty))
    .map(q => ({ q, rank: last.get(q.id) ?? 0, noise: Math.random() }))
    .sort((a, b) => a.rank - b.rank || a.noise - b.noise).slice(0, options.count).map(x => x.q);
}
