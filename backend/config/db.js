import { JSONFilePreset } from 'lowdb/node';

// Data DB (Credentials & Proofs)
const defaultData = { credentials: [], proofs: [] };
export const db = await JSONFilePreset('db.json', defaultData);

// Auth DB (Users only)
const defaultUsers = { users: [] };
export const authDb = await JSONFilePreset('db2.json', defaultUsers);