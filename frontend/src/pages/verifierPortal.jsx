import { useState } from "react";
import { api } from "../utils/api.js";

export default function VerifierPortal() {
  const [token, setToken] = useState(null);
  const [apiKey, setApiKey] = useState("verify999");
  const [proofId, setProofId] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await api.loginVerifier(apiKey);
      setToken(res.token);
      setMessage(`Logged in as ${res.user.name}`);
    } catch (err) {
      setMessage(`Login Error: ${err.message}`);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setResult(null);
    try {
      const res = await api.verifyProof(proofId, token);
      setResult(res);
    } catch (err) {
      setMessage(`Verify Error: ${err.message}`);
    }
  }

  if (!token) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-soft">
        <h2 className="text-2xl font-bold">Verifier Login</h2>
        <form onSubmit={handleLogin} className="mt-4 grid gap-4">
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="border p-2 rounded" placeholder="API Key" />
          <button className="bg-medical-navy text-white p-2 rounded">Authenticate</button>
        </form>
        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-soft">
      <h2 className="text-2xl font-bold text-medical-navy">Verify Proof</h2>
      <p className="text-sm text-emerald-600 mb-4">{message}</p>
      
      <form onSubmit={handleVerify} className="flex gap-4">
        <input required value={proofId} onChange={e => setProofId(e.target.value)} placeholder="Enter Proof ID (e.g. proof_17...)" className="border p-2 rounded flex-1" />
        <button type="submit" className="bg-medical-navy text-white px-4 py-2 rounded">Verify Claim</button>
      </form>

      {result && result.valid && (
        <div className="mt-6 p-6 bg-medical-mint border border-emerald-200 rounded text-center">
          <p className="text-xl font-bold text-emerald-800">✅ Cryptographic Proof Validated</p>
          <p className="mt-2 text-medical-navy font-semibold">Claim: {result.condition}</p>
          <p className="mt-2 text-sm text-emerald-700">Raw patient data remains hidden.</p>
        </div>
      )}

      {result && !result.valid && (
        <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded text-center">
          <p className="text-xl font-bold text-red-700">❌ Verification Failed</p>
        </div>
      )}
    </div>
  );
}