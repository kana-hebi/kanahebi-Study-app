import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Attempt, ContentPack, Session } from '../src/domain/models';
import { grade, makeSession, recommend, statesFor } from '../src/domain/engine';
import { validatePack, validateSnapshot } from '../src/domain/pack';
import { SqlPort, SqlRepository } from '../src/data/sql-repository';
import { WebRepository } from '../src/data/repository.web';
const pack = validatePack(JSON.parse(readFileSync('content/organic-polymer.json', 'utf8')));
const math = validatePack(JSON.parse(readFileSync('content/math-check.study-pack.json', 'utf8')));
function sqlPort(db: DatabaseSync): SqlPort { return { execSync: sql => db.exec(sql), runSync: (sql, ...params) => db.prepare(sql).run(...params),
  getAllSync: <T>(sql: string, ...params: any[]) => db.prepare(sql).all(...params) as T[],
  withTransactionSync: fn => { db.exec('BEGIN'); try { fn(); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; } } }; }
function repository() { const db = new DatabaseSync(':memory:'), repo = new SqlRepository(sqlPort(db)); repo.install(pack); return { db, repo }; }
function event(session: Session, changes: Partial<Attempt> = {}): Attempt { const q = pack.questions[0]; return { id: 'attempt1', sessionId: session.id, mode: session.mode,
  packId: session.packId, packVersion: '0.1.0', questionId: q.id, nodeIds: q.nodeIds, startedAt: 1000, recordedAt: 1500,
  firstOutcome: 'correct', finalOutcome: 'correct', hintsUsed: 0, revealed: false, latencyMs: 500, answer: String(q.answer), ...changes }; }
test('OFF free-study creates no database writes, including unknown, hints and reveals', () => {
  const { repo, db } = repository(), before = repo.read(), changes = db.prepare('SELECT total_changes() n').get()!.n;
  const session = makeSession(pack.manifest.packId, 'free', false);
  assert.equal(repo.saveAttempt(session, event(session)), false);
  assert.equal(repo.saveAttempt(session, event(session, { firstOutcome: 'unknown', finalOutcome: null, hintsUsed: 1 })), false);
  assert.equal(repo.saveAttempt(session, event(session, { firstOutcome: 'unknown', finalOutcome: 'unknown', revealed: true })), false);
  assert.equal(db.prepare('SELECT total_changes() n').get()!.n, changes); assert.deepEqual(repo.read(), before); db.close();
});
test('tracked free-study is persisted across process-equivalent reopening', () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-')), path = join(dir, 'data.sqlite');
  let db = new DatabaseSync(path); let repo = new SqlRepository(sqlPort(db)); repo.install(pack);
  const session = makeSession(pack.manifest.packId, 'free'); repo.saveAttempt(session, event(session)); db.close();
  db = new DatabaseSync(path); repo = new SqlRepository(sqlPort(db)); assert.equal(repo.read().attempts.length, 1);
  assert.equal(statesFor(pack, repo.read().attempts)[pack.nodes[0].id].cleanSuccesses, 1); db.close(); rmSync(dir, { recursive: true });
});
test('unknown then hint-assisted success remains one failed first-recall record', () => {
  const { repo, db } = repository(), session = makeSession(pack.manifest.packId, 'course');
  const unknown = event(session, { firstOutcome: 'unknown', finalOutcome: null, answer: undefined });
  repo.saveAttempt(session, unknown); repo.saveAttempt(session, { ...unknown, hintsUsed: 2, finalOutcome: 'correct', answer: 'a' });
  const history = repo.read().attempts; assert.equal(history.length, 1); assert.equal(history[0].firstOutcome, 'unknown');
  const state = statesFor(pack, history)[pack.nodes[0].id]; assert.equal(state.cleanSuccesses, 0); assert.deepEqual(state.misconceptions, []); assert.equal(state.dueAt, 1500 + 600000);
  assert.throws(() => repo.saveAttempt(session, { ...history[0], firstOutcome: 'correct' }), /変更できません/); db.close();
});
test('failed native pack replacement is atomic and preserves learner data', () => {
  const { repo, db } = repository(), session = makeSession(pack.manifest.packId, 'free'); repo.saveAttempt(session, event(session)); const before = repo.read();
  const bad = structuredClone(pack); bad.manifest.packVersion = '0.2.0'; bad.nodes.shift();
  assert.throws(() => repo.install(bad)); assert.deepEqual(repo.read(), before);
  const newer = structuredClone(pack); newer.manifest.packVersion = '0.2.0'; newer.manifest.description += ' 更新'; repo.install(newer);
  assert.equal(repo.read().attempts.length, 1); assert.equal(repo.read().packs[0].manifest.packVersion, '0.2.0'); assert.throws(() => repo.install(pack), /古い/); db.close();
});
test('pack validation rejects cyclic prerequisites, nonexistent answers and unsupported capabilities', () => {
  const bad = structuredClone(pack); bad.nodes[0].prerequisites = [bad.nodes[1].id]; assert.throws(() => validatePack(bad), /循環/);
  const bad2 = structuredClone(pack); bad2.questions[0].answer = 'absent'; assert.throws(() => validatePack(bad2), /正解/);
  const bad3 = structuredClone(pack); bad3.manifest.requiredCapabilities.push('run.arbitraryJavaScript'); assert.throws(() => validatePack(bad3), /未対応/);
});
test('numeric input validation does not accept blank, units, NaN, infinity or partial numeric strings', () => {
  const q = pack.questions.find(q => q.id.endsWith('.q.mole-ethanol'))!;
  for (const input of ['', ' ', '0.1 mol', 'NaN', 'Infinity', '1e309', '0.1abc', '0,1']) assert.equal(grade(q, input), null);
  assert.equal(grade(q, '０．１')?.outcome, 'correct'); assert.equal(grade(q, '1e-1')?.outcome, 'correct'); assert.equal(grade(q, '0.2')?.outcome, 'incorrect');
});
test('formula and Japanese term aliases normalize width and subscript digits', () => {
  const q = pack.questions.find(q => q.id.endsWith('condensed.recall'))!;
  assert.equal(grade(q, 'Ｃ２Ｈ４Ｏ２')?.outcome, 'correct'); assert.equal(grade(q, 'C₂H₄O₂')?.outcome, 'correct'); assert.equal(grade(q, 'C2H6O')?.outcome, 'incorrect');
});
test('same-day repetition cannot extend review interval or assert mastery', () => {
  const session = makeSession(pack.manifest.packId, 'course'); const history = Array.from({ length: 100 }, (_, i) => event(session, { id: `a${i}`, recordedAt: 1000 + i }));
  const state = statesFor(pack, history)[pack.nodes[0].id]; assert.notEqual(state.state, 'mastered'); assert.equal(state.distinctQuestions, 1); assert.equal(state.dueAt - state.lastAt, 86400000);
});
test('guidance has no locks and a verified prerequisite permits the next node', () => {
  const session = makeSession(pack.manifest.packId, 'course'); const states = statesFor(pack, [event(session)]);
  const r = recommend(pack, states, 1600); assert.equal(r.length, pack.nodes.length); assert.equal(r[0].node.id, pack.nodes[1].id);
});
test('separate mathematics pack works with the same grading and learner engine', () => {
  const { repo, db } = repository(); repo.install(math); const q = math.questions[0]; assert.equal(grade(q, '4')?.outcome, 'correct');
  const session = makeSession(math.manifest.packId, 'free'); repo.saveAttempt(session, event(session, { questionId: q.id, nodeIds: q.nodeIds }));
  assert.equal(statesFor(math, repo.read().attempts)[math.nodes[0].id].attempts, 1); assert.equal(statesFor(pack, repo.read().attempts)[pack.nodes[0].id].attempts, 0); db.close();
});
test('backup validation failure leaves existing SQLite database intact', () => {
  const { repo, db } = repository(), before = repo.read(); const bad = { ...before, attempts: [{ id: 'incomplete' }] };
  assert.throws(() => repo.restore(bad as any)); assert.deepEqual(repo.read(), before); const snapshot = validateSnapshot(before); repo.restore(snapshot); assert.deepEqual(repo.read(), before); db.close();
});
test('browser preview uses the same untracked and failed-import boundaries', () => {
  const map = new Map<string, string>(); const repo = new WebRepository({ getItem: k => map.get(k) ?? null, setItem: (k, v) => { map.set(k, v); } }); repo.install(pack);
  const before = map.get('kanahebi-study.v1'); const session = makeSession(pack.manifest.packId, 'free', false); repo.saveAttempt(session, event(session)); assert.equal(map.get('kanahebi-study.v1'), before);
  const bad = structuredClone(pack); bad.manifest.packVersion = '0.0.1'; assert.throws(() => repo.install(bad)); assert.equal(map.get('kanahebi-study.v1'), before);
});
test('independent numeric chemistry checks cover stoichiometry and finite-chain boundaries', () => {
  const expected: Record<string, number> = { 'combustion-gas': .1 * 2 * 22.4, 'sodium-gas': 4.6 / 46 / 2 * 22.4,
    'ester-yield': Math.min(.2, .1) * 88 * .75, 'peptide-water': 6 - 1, 'pet-unit-mass': 166 + 62 - 2 * 18,
    'finite-pet-water': 10 + 10 - 1, 'starch-hydrolysis': 8.1 / 162 * 180, 'fat-base': .02 * 3 * 40 };
  for (const [id, answer] of Object.entries(expected)) assert.ok(Math.abs(Number(pack.questions.find(q => q.id.endsWith('.q.' + id))!.answer) - answer) < 1e-8, id);
});
