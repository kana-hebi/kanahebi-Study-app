import { openDatabaseSync } from 'expo-sqlite';
import { SqlRepository } from './sql-repository';
export function openRepository() { return new SqlRepository(openDatabaseSync('kanahebi-study.db')); }
