import { Attempt, ContentPack, Repository, Session, Snapshot } from '../domain/models';
import { checkUpdate, validatePack, validateSnapshot } from '../domain/pack';
export interface SqlPort {
  execSync(sql: string): void; runSync(sql: string, ...params: any[]): unknown;
  getAllSync<T>(sql: string, ...params: any[]): T[]; withTransactionSync(fn: () => void): void;
}
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS schema_versions (version INTEGER PRIMARY KEY);
CREATE TABLE IF NOT EXISTS packs (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, pack_id TEXT NOT NULL, data TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS attempts_pack ON attempts(pack_id);
CREATE TABLE IF NOT EXISTS bookmarks (id TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT OR IGNORE INTO schema_versions VALUES (1);`;
export class SqlRepository implements Repository {
  constructor(private db: SqlPort) { db.execSync('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;'); db.withTransactionSync(() => db.execSync(SCHEMA)); }
  read(): Snapshot {
    const parse = <T>(rows: { data: string }[]) => rows.map(r => JSON.parse(r.data) as T);
    return { packs: parse<ContentPack>(this.db.getAllSync('SELECT data FROM packs ORDER BY id')),
      attempts: parse<Attempt>(this.db.getAllSync('SELECT data FROM attempts ORDER BY id')),
      bookmarks: this.db.getAllSync<{ id: string }>('SELECT id FROM bookmarks').map(r => r.id),
      settings: Object.fromEntries(this.db.getAllSync<{ key: string; value: string }>('SELECT key,value FROM settings').map(r => [r.key, r.value])) };
  }
  install(value: ContentPack) {
    const pack = validatePack(value);
    this.db.withTransactionSync(() => {
      const old = this.db.getAllSync<{ data: string }>('SELECT data FROM packs WHERE id=?', pack.manifest.packId)[0];
      checkUpdate(old ? JSON.parse(old.data) : undefined, pack);
      this.db.runSync('INSERT OR REPLACE INTO packs VALUES (?,?)', pack.manifest.packId, JSON.stringify(pack));
    });
  }
  saveAttempt(session: Session, attempt: Attempt) {
    if (!session.tracked) return false;
    if (session.packId !== attempt.packId || session.id !== attempt.sessionId || session.mode !== attempt.mode) throw new Error('セッションと履歴が一致しません');
    this.db.withTransactionSync(() => {
      const old = this.db.getAllSync<{ data: string }>('SELECT data FROM attempts WHERE id=?', attempt.id)[0];
      if (old) {
        const a: Attempt = JSON.parse(old.data);
        if (a.firstOutcome !== attempt.firstOutcome || a.questionId !== attempt.questionId || a.sessionId !== attempt.sessionId) throw new Error('最初の回答は変更できません');
      }
      this.db.runSync('INSERT OR REPLACE INTO attempts VALUES (?,?,?)', attempt.id, attempt.packId, JSON.stringify(attempt));
    }); return true;
  }
  toggleBookmark(id: string) { this.db.withTransactionSync(() => {
    if (this.db.getAllSync('SELECT id FROM bookmarks WHERE id=?', id).length) this.db.runSync('DELETE FROM bookmarks WHERE id=?', id);
    else this.db.runSync('INSERT INTO bookmarks VALUES (?)', id);
  }); }
  setSetting(key: string, value: string) { this.db.runSync('INSERT OR REPLACE INTO settings VALUES (?,?)', key, value); }
  restore(value: Snapshot) {
    const data = validateSnapshot(value);
    this.db.withTransactionSync(() => {
      this.db.execSync('DELETE FROM attempts; DELETE FROM packs; DELETE FROM bookmarks; DELETE FROM settings;');
      for (const p of data.packs) this.db.runSync('INSERT INTO packs VALUES (?,?)', p.manifest.packId, JSON.stringify(p));
      for (const a of data.attempts) this.db.runSync('INSERT INTO attempts VALUES (?,?,?)', a.id, a.packId, JSON.stringify(a));
      for (const id of new Set(data.bookmarks)) this.db.runSync('INSERT INTO bookmarks VALUES (?)', id);
      for (const [k, v] of Object.entries(data.settings)) this.setSetting(k, v);
    });
  }
}
