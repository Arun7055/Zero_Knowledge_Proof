import { JSONFilePreset } from 'lowdb/node';

// ==========================================
// 1. DATA DATABASE (db.json)
// Stores medical credentials and submitted proofs
// ==========================================
const defaultData = {
  credentials: [],
  proofs: []
};
export const db = await JSONFilePreset('db.json', defaultData);


// ==========================================
// 2. AUTH DATABASE (db2.json)
// Stores user accounts and passwords
// ==========================================
const defaultAuthData = {
  users: []
};
export const authDb = await JSONFilePreset('db2.json', defaultAuthData);