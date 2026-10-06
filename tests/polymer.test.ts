import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { grade, makeSession } from '../src/domain/engine';
import { lessonSearchText } from '../src/domain/lesson';
import { validatePack, validateSnapshot } from '../src/domain/pack';
import { SqlPort, SqlRepository } from '../src/data/sql-repository';
import { WebRepository } from '../src/data/repository.web';
const load = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const pack = validatePack(load('content/organic-polymer.json'));
const legacy = validatePack(load('tests/fixtures/legacy-plain.study-pack.json'));
function port(db: DatabaseSync): SqlPort {
  return { execSync: sql => db.exec(sql), runSync: (sql, ...p) => db.prepare(sql).run(...p),
    getAllSync: <T>(sql: string, ...p: any[]) => db.prepare(sql).all(...p) as T[],
    withTransactionSync: fn => { db.exec('BEGIN'); try { fn(); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; } } };
}
test('all v0.1 knowledge IDs and grading contracts survive the enriched pack', () => {
  const prior = load('tests/fixtures/v0.1-content-ids.json');
  assert.equal(prior.nodes.length, 114); assert.equal(Object.keys(prior.questions).length, 185);
  for (const id of prior.nodes) assert.ok(pack.nodes.some(n => n.id === id), id);
  for (const [id, contract] of Object.entries(prior.questions)) {
    const q = pack.questions.find(q => q.id === id)!; assert.ok(q, id);
    assert.deepEqual(Object.fromEntries(Object.keys(contract as object).map(k => [k, (q as any)[k]])), contract, id);
  }
});
test('plain v1 pack upgrades in native SQLite without changing attempts, bookmarks or filters', () => {
  const db = new DatabaseSync(':memory:'), repo = new SqlRepository(port(db)); repo.install(legacy);
  const s = makeSession(legacy.manifest.packId, 'free'), q = legacy.questions[0];
  repo.saveAttempt(s, { id: 'legacy-attempt', sessionId: s.id, mode: s.mode, packId: s.packId, packVersion: '0.1.0',
    questionId: q.id, nodeIds: q.nodeIds, startedAt: 10, recordedAt: 20, firstOutcome: 'unknown', finalOutcome: 'correct',
    hintsUsed: 1, revealed: false, latencyMs: 10, answer: 'a' });
  repo.toggleBookmark(legacy.nodes[0].id); repo.setSetting('freeUnit', legacy.units[0].id);
  const before = repo.read(); repo.install(pack); const after = repo.read();
  assert.deepEqual(after.attempts, before.attempts); assert.deepEqual(after.bookmarks, before.bookmarks); assert.deepEqual(after.settings, before.settings);
  assert.equal(after.packs[0].diagrams?.length, 44); assert.deepEqual(validateSnapshot(after), after); db.close();
});
test('browser adapter also retains legacy learning data while enriching the installed pack', () => {
  const storage = new Map<string, string>(); const repo = new WebRepository({ getItem: k => storage.get(k) ?? null, setItem: (k,v) => { storage.set(k,v); } });
  repo.install(legacy); repo.toggleBookmark(legacy.nodes[0].id); repo.setSetting('activePack', legacy.manifest.packId);
  const before = repo.read(); repo.install(pack); const after = repo.read();
  assert.deepEqual(after.bookmarks, before.bookmarks); assert.deepEqual(after.settings, before.settings);
  assert.equal(after.packs[0].manifest.packVersion, '0.2.0');
});
test('invalid vectors and lesson references fail before atomic native replacement', () => {
  const db = new DatabaseSync(':memory:'), repo = new SqlRepository(port(db)); repo.install(pack); const before = repo.read();
  const mutations: ((p: any) => void)[] = [
    p => p.diagrams[0].elements.push({ type: 'path', d: 'M0 0' }),
    p => p.diagrams[0].elements.push({ type: 'text', x: -1, y: 20, text: 'bad' }),
    p => p.diagrams[0].elements.push({ type: 'line', x1: 10, y1: 10, x2: Infinity, y2: 10 }),
    p => p.diagrams[0].elements.push({ type: 'ellipse', cx: 1, cy: 1, rx: 10, ry: 10 }),
    p => p.diagrams[0].sourceIds = ['absent'],
    p => p.nodes.find((n: any) => n.lesson.blocks).lesson.blocks.push({ type: 'diagram', diagramId: 'absent' }),
    p => p.nodes.find((n: any) => n.lesson.blocks).lesson.blocks.push({ type: 'table', heading: 'broken', columns: ['A','B'], rows: [['one']] }),
    p => p.manifest.requiredCapabilities = p.manifest.requiredCapabilities.filter((s: string) => s !== 'render.vectorDiagram.v1'),
    p => p.manifest.requiredCapabilities = p.manifest.requiredCapabilities.filter((s: string) => s !== 'render.lessonBlocks.v1'),
  ];
  for (const mutate of mutations) { const p = structuredClone(pack); p.manifest.packVersion = '0.2.1'; mutate(p); assert.throws(() => repo.install(p)); assert.deepEqual(repo.read(), before); }
  db.close();
});
test('deep instruction is searchable beyond the short summary and has distinct practice coverage', () => {
  const deep = pack.nodes.filter(n => n.lesson.blocks); assert.equal(deep.length, 40);
  assert.equal(deep.flatMap(n => n.lesson.blocks!).filter(b => b.type === 'worked').length, 40);
  const newQs = pack.questions.filter(q => q.id.includes('.q.poly-')); assert.equal(newQs.length, 180);
  assert.equal(new Set(newQs.map(q => q.prompt)).size, 180);
  for (const n of deep) assert.ok(newQs.filter(q => q.nodeIds.includes(n.id)).length >= 4, n.title);
  const pmma = deep.find(n => n.id.endsWith('.pmma'))!;
  assert.ok(!pmma.lesson.core.includes('置換側'));
  assert.ok(lessonSearchText(pmma).includes('置換側'));
  assert.ok(lessonSearchText(deep.find(n => n.id.endsWith('.polymer-average'))!).includes('分散度'));
  assert.equal(legacy.diagrams, undefined); assert.ok(!legacy.manifest.requiredCapabilities.includes('render.lessonBlocks.v1'));
});
test('all 56 new numeric exercises agree with independent atom, bond and mass calculations', () => {
  const h = 10.8 / 18 * 2;
  const peFraction = 4 / 28, psFraction = 8 / 104;
  const expected: Record<string, number> = {
    'addition-mass': 10.4 * .8, 'pp-mass': (3*12+6)*1500, 'pvc-cl-mass': 12.5/62.5*35.5,
    'ps-degree': 52000/(8*12+8), 'condensation-water': 8-1, 'pet-mass-end': 4*(166+62)-(4+4-1)*18,
    'nylon66-unit': 116+146-2*18, 'nylon6-amino': 10*131-(10-1)*18, 'urea-n-count': .030*2,
    'rubber-bromine': 6.8/68*160, 'copolymer-n-mass': 20*.07/14*53,
    'copolymer-sbr-fraction': (26/104)/(26/104+40.5/54)*100,
    'ion-ca-sites': .012*2, 'ion-capacity': .150-.040*2, 'ion-mixed-charge': .02+2*(.015+.010),
    'degree-pet': 96000/(166+62-2*18), 'degree-n6': 800*(6*12+11+14+16), 'degree-ptfe': 250000/(2*12+4*19),
    'bio-pla-finite': 8*90-(8-1)*18, 'ptfe-fraction': 4*19/(2*12+4*19)*100, 'ptfe-f-count': 5/100*4,
    'pmma-o-mass': 12*(2*16)/(5*12+8+2*16), 'acetate-tri-mass': 162+3*(43-1), 'vinylon-oh-count': .20*.30/2,
    'pva-full-yield': 8.60/86*44, 'pva-partial-yield': .10*.60*44+.10*.40*86,
    'acrylic-nitrogen': 5.30/53*14, 'starch-water-mass': 32.4/162*180, 'cellulose-oh-mol': 16.2/162*3,
    'peptide-gly-mass': 5*75-(5-1)*18, 'peptide-cycle-count': 5, 'sequence-three': 3*2*1,
    'sequence-repeat': (3*2*1)/(2*1), 'biuret-bond-count': 8-1, 'nucleotide-base-percent': (100-2*18)/2,
    'nucleotide-hbonds': 40*3+(100-40)*2, 'finite-multiple': 20-3, 'finite-unbalanced': 7+6-1,
    'finite-cycle': 6+6, 'hydro-pet-glycol': 19.2/192*62, 'hydro-pet-base': 9.6/192*2*40,
    'hydro-cellulose-glucose': 8.1/162*180, 'average-number': (3*10000+30000)/(3+1),
    'average-weight': (3*10000**2+30000**2)/(3*10000+30000), 'average-dispersity': 25000/20000,
    'substitution-degree': (267-162)/42, 'substitution-hydroxy': .2*(3-2.5), 'substitution-nitrate': 162+3*(14+2*16-1),
    'cap-pet-base': 19.2/192*2*40, 'cap-nylon-unequal': 5*116+4*146-(5+4-1)*18,
    'cap-pva-product': 4.4+(4.4/44*.6/2)*(30-18),
    'cap-nbr-ratio': (2.8/14)/((2.8/14)+(53.8-2.8/14*53)/54)*100,
    'cap-pe-ps-combustion': (h-13.2*psFraction)/(peFraction-psFraction), 'cap-cellulose-yield': 16.2/162*288*.9,
    'cap-end-mn': 5/(.250/1000), 'cap-ion-water': .020*2,
  };
  const numeric = pack.questions.filter(q => q.kind === 'numeric' && q.id.includes('.q.poly-'));
  assert.equal(numeric.length, 56); assert.equal(Object.keys(expected).length, numeric.length);
  for (const q of numeric) {
    const answer = expected[q.id.split('.q.poly-')[1]]; assert.ok(Number.isFinite(answer), q.id);
    assert.ok(Math.abs(Number(q.answer)-answer)<1e-8, q.id);
    assert.equal(grade(q, String(answer))?.outcome, 'correct', q.id);
    assert.equal(grade(q, String(answer+1))?.outcome, 'incorrect', q.id);
  }
});
