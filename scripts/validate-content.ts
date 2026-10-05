import { readFileSync, writeFileSync } from 'node:fs';
import { validatePack } from '../src/domain/pack';
const report = [];
for (const file of ['content/organic-polymer.json', 'content/math-check.study-pack.json']) {
  const p = validatePack(JSON.parse(readFileSync(file, 'utf8')));
  for (const n of p.nodes) if (!p.questions.some(q => q.nodeIds.includes(n.id))) throw new Error(`Uncovered knowledge node: ${n.id}`);
  for (const u of p.units) if (!p.nodes.some(n => n.unitId === u.id)) throw new Error(`Empty unit: ${u.id}`);
  report.push({ file, packId: p.manifest.packId, units: p.units.length, nodes: p.nodes.length, questions: p.questions.length,
    reactions: p.reactions.length, types: Object.fromEntries(['choice', 'text', 'numeric'].map(k => [k, p.questions.filter(q => q.kind === k).length])),
    stages: [...new Set(p.units.map(u => u.stage))], checks: ['schema', 'capabilities', 'unique IDs', 'reference integrity', 'acyclic prerequisite graph', 'every knowledge node has an exercise', 'hints and explanations present'] });
}
console.log(JSON.stringify(report, null, 2));
writeFileSync('docs/CONTENT_VALIDATION.json', JSON.stringify(report, null, 2) + '\n');
