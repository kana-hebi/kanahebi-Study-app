import { KnowledgeNode } from './models';
export function lessonSearchText(n: KnowledgeNode) {
  return [n.title, n.lesson.core, n.lesson.example, n.lesson.caution, ...(n.lesson.goals ?? []), ...(n.lesson.blocks ?? []).flatMap(b => b.type === 'paragraph' ? [b.heading, b.body] : b.type === 'table' ? [b.heading, ...b.columns, ...b.rows.flat()] : b.type === 'worked' ? [b.heading, b.prompt, ...b.steps, b.answer] : [])].join('\n');
}
