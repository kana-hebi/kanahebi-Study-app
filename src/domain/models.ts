export type QuestionKind = 'choice' | 'text' | 'numeric';
export type Outcome = 'correct' | 'incorrect' | 'unknown';
export type Mode = 'course' | 'free' | 'review' | 'diagnostic' | 'exam';
export interface Unit { id: string; title: string; stage: number; summary: string }
export interface KnowledgeNode {
  id: string; unitId: string; title: string; dimension: string;
  prerequisites: string[]; lesson: { core: string; example: string; caution: string };
}
export interface Choice { id: string; text: string; misconception?: string; feedback: string }
export interface Question {
  id: string; nodeIds: string[]; kind: QuestionKind; difficulty: 1 | 2 | 3;
  prompt: string; choices?: Choice[]; answer: string | number; aliases?: string[];
  tolerance?: number; unit?: string; hints: string[]; explanation: string; sourceId: string;
}
export interface Reaction { id: string; from: string; to: string; condition: string; nodeId: string; type: string }
export interface ContentPack {
  manifest: { packId: string; packVersion: string; schemaVersion: 1; title: string; subject: string;
    publisher: string; language: string; requiredCapabilities: string[]; description: string };
  units: Unit[]; nodes: KnowledgeNode[]; questions: Question[]; reactions: Reaction[];
  sources: { id: string; title: string; url?: string; use: string }[];
}
export interface Session { id: string; mode: Mode; tracked: boolean; packId: string; startedAt: number }
export interface Attempt {
  id: string; sessionId: string; mode: Mode; packId: string; packVersion: string;
  questionId: string; nodeIds: string[]; startedAt: number; recordedAt: number;
  firstOutcome: Outcome; finalOutcome: Outcome | null; hintsUsed: number;
  revealed: boolean; answer?: string; misconception?: string; latencyMs: number;
}
export interface LearnerState {
  nodeId: string; score: number; state: 'unseen' | 'learning' | 'unstable' | 'stable' | 'mastered';
  attempts: number; cleanSuccesses: number; distinctQuestions: number; dueAt: number;
  lastAt: number; misconceptions: string[];
}
export interface Snapshot { packs: ContentPack[]; attempts: Attempt[]; bookmarks: string[]; settings: Record<string, string> }
export interface Repository {
  read(): Snapshot;
  install(pack: ContentPack): void;
  saveAttempt(session: Session, attempt: Attempt): boolean;
  toggleBookmark(id: string): void;
  setSetting(key: string, value: string): void;
  restore(data: Snapshot): void;
}
export const CAPABILITIES = ['question.multipleChoice.v1', 'question.textInput.v1',
  'question.numericInput.v1', 'render.chemFormula.v1', 'view.reactionMap.v1'];
