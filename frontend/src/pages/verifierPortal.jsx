import { useState, useEffect } from "react";
import { api } from "../utils/api.js";
import QRCode from "react-qr-code";

export default function VerifierPortal() {
  const [token, setToken] = useState(null);
  const [apiKey, setApiKey] = useState("verify999");
  
  const [reqForm, setReqForm] = useState({ parameterKey: "", operator: "", threshold: "" });
  const [createdRequest, setCreatedRequest] = useState(null);
  
  const [checkId, setCheckId] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [message, setMessage] = useState("");

  const [activeTab, setActiveTab] = useState("verify");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (token) loadHistory();
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await api.loginVerifier(apiKey);
      setToken(res.token);
      setMessage("");
    } catch (err) { setMessage(`Login Error: ${err.message}`); }
  }

  async function loadHistory() {
    try {
      const res = await api.getVerifierHistory(token);
      setHistory(res.logs);
    } catch (err) { console.error("Failed to load history", err); }
  }

  async function handleCreateRequest(e) {
    e.preventDefault();
    try {
      const res = await api.createRequest(reqForm, token);
      setCreatedRequest(res.request);
      setCheckId(res.request.id);
      setMessage("Request generated! Give this ID to the user.");
    } catch (err) { setMessage(err.message); }
  }

  async function handleCheckStatus(e) {
    e.preventDefault();
    try {
      const res = await api.checkRequestStatus(checkId, token);
      setStatusResult(res.request);
      loadHistory(); // Refresh history if status changed
      setMessage("");
    } catch (err) { setMessage(err.message); }
  }

  function handleLogout() {
    setToken(null);
    setHistory([]);
    setActiveTab("verify");
    setCreatedRequest(null);
    setStatusResult(null);
    setMessage("");
  }

  if (!token) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-soft border border-sky-100">
        <h2 className="text-2xl font-bold text-medical-navy text-center">Verifier Login</h2>
        <form onSubmit={handleLogin} className="mt-6 grid gap-4">
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="border border-sky-200 p-3 rounded outline-none focus:ring-2 focus:ring-medical-blue" placeholder="API Key" />
          <button className="bg-medical-navy hover:bg-slate-800 text-white p-3 rounded font-bold shadow-sm transition">Authenticate</button>
        </form>
        {message && <p className="mt-4 text-sm text-red-600 font-semibold text-center">{message}</p>}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-soft border border-sky-100">
      <div className="flex justify-between items-center border-b border-sky-100 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-medical-navy">Verification Dashboard</h2>
        <button onClick={handleLogout} className="bg-slate-100 text-slate-700 px-4 py-2 rounded hover:bg-slate-200 transition">Log Out</button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("verify")} 
          className={`pb-2 px-2 font-bold transition ${activeTab === 'verify' ? 'text-medical-blue border-b-2 border-medical-blue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Verification Engine
        </button>
        <button 
          onClick={() => setActiveTab("history")} 
          className={`pb-2 px-2 font-bold transition ${activeTab === 'history' ? 'text-medical-blue border-b-2 border-medical-blue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Verification History
        </button>
      </div>

      {message && <div className={`mb-6 p-4 rounded font-semibold ${message.includes("Error") ? "bg-red-50 text-red-800 border border-red-200" : "bg-sky-50 text-sky-800 border border-sky-200"}`}>{message}</div>}

      {/* ========================================== */}
      {/* VIEW: VERIFICATION ENGINE                  */}
      {/* ========================================== */}
      {activeTab === "verify" && (
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Box 1: Create Requirement */}
          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
            <h2 className="text-xl font-bold text-medical-navy">1. Set Policy</h2>
            <p className="text-sm text-slate-600 mb-4 mt-1">Define the mathematical requirement the user must prove.</p>
            
            <form onSubmit={handleCreateRequest} className="grid gap-4">
              <input required value={reqForm.parameterKey} onChange={e => setReqForm({...reqForm, parameterKey: e.target.value})} className="border border-slate-300 p-2 rounded focus:outline-none focus:border-medical-blue" placeholder="Parameter (e.g. CreditScore)" />
              <select value={reqForm.operator} onChange={e => setReqForm({...reqForm, operator: e.target.value})} className="border border-slate-300 p-2 rounded focus:outline-none focus:border-medical-blue">
                <option value="<">&lt; Less Than</option>
                <option value=">">&gt; Greater Than</option>
                <option value="=">= Equals</option>
              </select>
              <input required type="number" value={reqForm.threshold} onChange={e => setReqForm({...reqForm, threshold: e.target.value})} className="border border-slate-300 p-2 rounded focus:outline-none focus:border-medical-blue" placeholder="Threshold (e.g. 700)" />
              <button type="submit" className="bg-medical-navy hover:bg-slate-800 text-white p-3 rounded font-bold transition shadow-sm">Generate Policy Request</button>
            </form>

            {createdRequest && (
              <div className="mt-6 p-6 bg-white rounded-lg border border-sky-200 flex flex-col items-center text-center shadow-sm">
                <p className="text-sm font-bold text-sky-800 mb-4">Share this QR Code or ID with the User:</p>
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-sky-100">
                  <QRCode value={createdRequest.id} size={160} level="H" fgColor="#0f172a" />
                </div>
                <p className="font-mono text-lg font-bold text-medical-navy tracking-wider bg-slate-50 px-3 py-1 rounded shadow-sm border border-slate-200">
                  {createdRequest.id}
                </p>
              </div>
            )}
          </div>

          {/* Box 2: Check Status */}
          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
            <h2 className="text-xl font-bold text-medical-navy">2. Check Proof</h2>
            <p className="text-sm text-slate-600 mb-4 mt-1">Verify if the user has mathematically satisfied the policy.</p>
            
            <form onSubmit={handleCheckStatus} className="flex gap-2">
              <input required value={checkId} onChange={e => setCheckId(e.target.value)} className="border border-slate-300 p-2 rounded flex-1 focus:outline-none focus:border-medical-blue" placeholder="Request ID (e.g. req_123...)" />
              <button type="submit" className="bg-medical-blue hover:bg-sky-700 text-white px-4 rounded font-bold transition shadow-sm">Check</button>
            </form>

            {statusResult && (
              <div className={`mt-6 p-5 rounded-lg border shadow-sm ${statusResult.status === 'verified' ? 'bg-medical-mint border-emerald-200' : statusResult.status === 'pending' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                <p className="font-bold uppercase tracking-widest text-xs mb-1">Status: {statusResult.status}</p>
                <p className="font-semibold text-slate-800">Condition Checked: {statusResult.parameterKey} {statusResult.operator} {statusResult.threshold}</p>
                {statusResult.status === 'verified' && (
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <p className="text-sm font-bold text-emerald-800">✅ Cryptographic math verified.</p>
                    <p className="text-xs text-emerald-700 mt-1">Underlying data remained completely hidden.</p>
                  </div>
                )}
                {statusResult.status === 'pending' && (
                  <p className="text-sm mt-2 text-amber-700">⏳ Waiting for user to submit zero-knowledge proof...</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* VIEW: VERIFICATION HISTORY                 */}
      {/* ========================================== */}
      {activeTab === "history" && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          {history.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No verifications logged yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 border-b">Date</th>
                  <th className="p-4 border-b">Prover (User)</th>
                  <th className="p-4 border-b">Document Type</th>
                  <th className="p-4 border-b">Policy Checked</th>
                  <th className="p-4 border-b">Result</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {history.map(log => (
                  <tr key={log._id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-4 text-slate-600">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-slate-800">{log.proverId}</td>
                    <td className="p-4 text-medical-navy">{log.documentType}</td>
                    <td className="p-4 font-mono text-xs bg-slate-100 rounded px-2">{log.policyChecked}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${log.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}