import { JSONFilePreset } from 'lowdb/node';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, '..');

// ==========================================
// 1. DATA DATABASE (db.json)
// Stores medical credentials and submitted proofs
// ==========================================
const defaultData = {
  credentials: [],
  proofs: [],
  requests: []
};
export const db = await JSONFilePreset(path.join(backendDir, 'db.json'), defaultData);


// ==========================================
// 2. AUTH DATABASE (db2.json)
// Stores user accounts and passwords
// ==========================================
const defaultAuthData = {
  users: []
};
export const authDb = await JSONFilePreset(path.join(backendDir, 'db2.json'), defaultAuthData);
