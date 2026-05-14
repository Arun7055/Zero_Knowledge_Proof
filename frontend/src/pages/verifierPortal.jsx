import { useState } from "react";
import { api } from "../utils/api.js";

export default function VerifierPortal() {
  const [token, setToken] = useState(null);
  const [apiKey, setApiKey] = useState("verify999");
  
  // Create Request State
  const [reqForm, setReqForm] = useState({ parameterKey: "Blood_Sugar", operator: "<", threshold: "100" });
  const [createdRequest, setCreatedRequest] = useState(null);
  
  // Check Request State
  const [checkId, setCheckId] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await api.loginVerifier(apiKey);
      setToken(res.token);
    } catch (err) { setMessage(err.message); }
  }

  async function handleCreateRequest(e) {
    e.preventDefault();
    try {
      const res = await api.createRequest(reqForm, token);
      setCreatedRequest(res.request);
      setCheckId(res.request.id);
      setMessage("Request generated! Give this ID to the patient.");
    } catch (err) { setMessage(err.message); }
  }

  async function handleCheckStatus(e) {
    e.preventDefault();
    try {
      const res = await api.checkRequestStatus(checkId, token);
      setStatusResult(res.request);
    } catch (err) { setMessage(err.message); }
  }

  if (!token) return ( /* Your existing Login form here */
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-soft border border-sky-100">
        <h2 className="text-2xl font-bold text-medical-navy">Verifier Login</h2>
        <form onSubmit={handleLogin} className="mt-4 grid gap-4">
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="border p-2 rounded" placeholder="API Key" />
          <button className="bg-medical-navy text-white p-2 rounded">Authenticate</button>
        </form>
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
      {/* Box 1: Create Requirement */}
      <div className="p-6 bg-white rounded-lg shadow-soft border border-sky-100">
        <h2 className="text-xl font-bold text-medical-navy">1. Set Policy</h2>
        <form onSubmit={handleCreateRequest} className="mt-4 grid gap-4">
          <input value={reqForm.parameterKey} onChange={e => setReqForm({...reqForm, parameterKey: e.target.value})} className="border p-2 rounded" placeholder="Parameter (e.g. Blood_Sugar)" />
          <select value={reqForm.operator} onChange={e => setReqForm({...reqForm, operator: e.target.value})} className="border p-2 rounded">
            <option value="<">&lt; Less Than</option>
            <option value=">">&gt; Greater Than</option>
            <option value="=">= Equals</option>
          </select>
          <input value={reqForm.threshold} onChange={e => setReqForm({...reqForm, threshold: e.target.value})} className="border p-2 rounded" placeholder="Threshold (e.g. 100)" />
          <button type="submit" className="bg-medical-navy text-white p-2 rounded">Generate Request ID</button>
        </form>

        {createdRequest && (
          <div className="mt-4 p-4 bg-sky-50 rounded border border-sky-200">
            <p className="text-sm font-bold text-sky-800">Share this ID with the Patient:</p>
            <p className="font-mono text-lg font-bold text-medical-navy">{createdRequest.id}</p>
          </div>
        )}
      </div>

      {/* Box 2: Check Status */}
      <div className="p-6 bg-white rounded-lg shadow-soft border border-sky-100">
        <h2 className="text-xl font-bold text-medical-navy">2. Check Proof</h2>
        <form onSubmit={handleCheckStatus} className="mt-4 flex gap-2">
          <input required value={checkId} onChange={e => setCheckId(e.target.value)} className="border p-2 rounded flex-1" placeholder="Request ID" />
          <button type="submit" className="bg-medical-blue text-white px-4 rounded">Check</button>
        </form>

        {statusResult && (
          <div className={`mt-6 p-4 rounded border ${statusResult.status === 'verified' ? 'bg-medical-mint border-emerald-200' : statusResult.status === 'pending' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
            <p className="font-bold uppercase tracking-widest text-xs">Status: {statusResult.status}</p>
            <p className="mt-2 font-semibold">Condition: {statusResult.parameterKey} {statusResult.operator} {statusResult.threshold}</p>
            {statusResult.status === 'verified' && <p className="text-sm mt-2 text-emerald-800">✅ Cryptographic math verified. Data hidden.</p>}
          </div>
        )}
      </div>
    </div>
  );
}