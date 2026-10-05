import { Attempt, ContentPack, Repository, Session, Snapshot } from '../domain/models';
import { checkUpdate, validatePack, validateSnapshot } from '../domain/pack';
// Web is a browser verification/preview target. Native learner data uses SQLite.
export class WebRepository implements Repository {
  constructor(private storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage) {}
  read(): Snapshot { const raw = this.storage.getItem('kanahebi-study.v1'); return raw ? validateSnapshot(JSON.parse(raw)) : { packs: [], attempts: [], bookmarks: [], settings: {} }; }
  private commit(fn: (data: Snapshot) => void) { const next = this.read(); fn(next); this.storage.setItem('kanahebi-study.v1', JSON.stringify(next)); }
  install(value: ContentPack) { const p = validatePack(value); this.commit(s => { checkUpdate(s.packs.find(x => x.manifest.packId === p.manifest.packId), p); s.packs = [...s.packs.filter(x => x.manifest.packId !== p.manifest.packId), p]; }); }
  saveAttempt(session: Session, attempt: Attempt) {
    if (!session.tracked) return false;
    if (session.id !== attempt.sessionId || session.packId !== attempt.packId || session.mode !== attempt.mode) throw new Error('セッションが一致しません');
    this.commit(s => { const old = s.attempts.find(x => x.id === attempt.id);
      if (old && (old.firstOutcome !== attempt.firstOutcome || old.questionId !== attempt.questionId || old.sessionId !== attempt.sessionId)) throw new Error('最初の回答は変更できません');
      s.attempts = [...s.attempts.filter(a => a.id !== attempt.id), attempt];
    }); return true;
  }
  toggleBookmark(id: string) { this.commit(s => { s.bookmarks = s.bookmarks.includes(id) ? s.bookmarks.filter(x => x !== id) : [...s.bookmarks, id]; }); }
  setSetting(k: string, v: string) { this.commit(s => { s.settings[k] = v; }); }
  restore(value: Snapshot) { const s = validateSnapshot(value); this.storage.setItem('kanahebi-study.v1', JSON.stringify(s)); }
}
export function openRepository() { return new WebRepository(); }
