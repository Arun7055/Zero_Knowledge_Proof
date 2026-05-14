import { JSONFilePreset } from 'lowdb/node';

const defaultData = {
  users: [
    { id: "DOC-1", role: "issuer", password: "password123", name: "Dr. Smith" },
    { id: "PAT-2048", role: "prover", pin: "1234", name: "John Doe" },
    { id: "VER-1", role: "verifier", apiKey: "verify999", name: "Acme Insurance" },
  ],
  credentials: [],
  proofs: []
};

// Initializes lowdb and writes defaults if db.json is missing
const db = await JSONFilePreset('db.json', defaultData);

export default db;