import { useState, useEffect } from "react";
import { api } from "../utils/api.js";
import { createLocalProof } from "../utils/zkEngine.js";

export default function ProverPortal() {
  const [isLogin, setIsLogin] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  
  const [authForm, setAuthForm] = useState({ patientId: "", pin: "", name: "" });
  const [credentials, setCredentials] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [reqIdInput, setReqIdInput] = useState("");
  const [activeRequest, setActiveRequest] = useState(null);

  const [activeTab, setActiveTab] = useState("wallet"); // 'wallet' or 'history'
  const [auditLogs, setAuditLogs] = useState([]);

  // Check localStorage on load
  useEffect(() => {
    const savedToken = localStorage.getItem("proverToken");
    const savedUser = localStorage.getItem("proverUser");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      loadCredentials(savedToken);
      loadAuditLogs(savedToken);
    }
  }, []);

  async function handleAuth(e) {
    e.preventDefault();
    setMessage("");
    try {
      let res;
      if (isLogin) {
        res = await api.loginProver(authForm.patientId, authForm.pin);
      } else {
        res = await api.signupProver(authForm.patientId, authForm.pin, authForm.name);
      }
      
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("proverToken", res.token);
      localStorage.setItem("proverUser", JSON.stringify(res.user));
      
      loadCredentials(res.token);
    } catch (err) {
      setMessage(`Auth Error: ${err.message}`);
    }
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setCredentials([]);
    localStorage.removeItem("proverToken");
    localStorage.removeItem("proverUser");
  }

  async function loadCredentials(activeToken) {
    try {
      const res = await api.getCredentials(activeToken);
      setCredentials(res.credentials);
    } catch (err) {
      setMessage(`Fetch Error: ${err.message}`);
    }
  }

  async function handleLoadRequest(e) {
    e.preventDefault();
    try {
      const res = await api.getVerificationRequest(reqIdInput, token);
      setActiveRequest(res.request);
      setMessage(`Request loaded: Prove that ${res.request.parameterKey} ${res.request.operator} ${res.request.threshold}`);
    } catch (err) { setMessage(err.message); }
  }

  async function handleGenerateProof(credential) {
    setLoading(true);
    try {
      const proofPayload = await createLocalProof({
        credential,
        parameterKey: activeRequest.parameterKey,
        operator: activeRequest.operator,
        threshold: activeRequest.threshold
      });

      // Pass credentialId alongside requestId and proofPayload
      await api.submitProof({ 
        requestId: activeRequest.id, 
        proofPayload,
        credentialId: credential.id // <-- New addition
      }, token);
      
      setMessage("✅ Success! Proof generated locally and submitted to Verifier.");
      setActiveRequest(null);
      loadAuditLogs(token);
    } catch (err) {
      setMessage(`Proof Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadAuditLogs(activeToken) {
    try {
      const res = await api.getAuditLogs(activeToken);
      setAuditLogs(res.logs);
    } catch (err) {
      console.error("Failed to load logs", err);
    }
  }

  if (!token) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-soft border border-sky-100">
        <h2 className="text-2xl font-bold text-medical-navy text-center">
          {isLogin ? "Patient Login" : "Create Patient Wallet"}
        </h2>
        
        <form onSubmit={handleAuth} className="mt-6 grid gap-4">
          {!isLogin && (
            <input required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="border border-sky-200 p-3 rounded outline-none focus:ring-2 focus:ring-medical-blue" placeholder="Full Name" />
          )}
          <input required value={authForm.patientId} onChange={e => setAuthForm({...authForm, patientId: e.target.value})} className="border border-sky-200 p-3 rounded outline-none focus:ring-2 focus:ring-medical-blue" placeholder="Patient ID (e.g. PAT-001)" />
          <input required type="password" value={authForm.pin} onChange={e => setAuthForm({...authForm, pin: e.target.value})} className="border border-sky-200 p-3 rounded outline-none focus:ring-2 focus:ring-medical-blue" placeholder="Secure PIN" />
          
          <button type="submit" className="bg-medical-blue hover:bg-sky-700 text-white p-3 rounded font-bold shadow-sm transition">
            {isLogin ? "Unlock Wallet" : "Create Wallet"}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="mt-5 text-sm text-sky-600 hover:text-medical-navy font-semibold w-full text-center transition">
          {isLogin ? "Need a wallet? Sign up here." : "Already have a wallet? Log in."}
        </button>

        {message && <p className="mt-4 text-sm text-red-600 text-center bg-red-50 border border-red-100 p-3 rounded">{message}</p>}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-soft border border-sky-100">
      <div className="flex justify-between items-center border-b border-sky-100 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-medical-navy">Your Secure Wallet</h2>
        <button onClick={handleLogout} className="bg-slate-100 text-slate-700 px-4 py-2 rounded">Log Out</button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("wallet")} 
          className={`pb-2 px-2 font-bold transition ${activeTab === 'wallet' ? 'text-medical-blue border-b-2 border-medical-blue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          My Credentials
        </button>
        <button 
          onClick={() => setActiveTab("history")} 
          className={`pb-2 px-2 font-bold transition ${activeTab === 'history' ? 'text-medical-blue border-b-2 border-medical-blue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Access History
        </button>
      </div>

      {message && <div className="mb-6 p-4 bg-sky-50 text-sky-800 font-semibold rounded">{message}</div>}

      {/* VIEW: WALLET */}
      {activeTab === "wallet" && (
        <>
          <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-bold text-lg text-slate-800">Fulfill a Request</h3>
            <form onSubmit={handleLoadRequest} className="flex gap-2 mt-4">
              <input required value={reqIdInput} onChange={e => setReqIdInput(e.target.value)} className="border p-2 rounded flex-1" placeholder="e.g., req_17000000..." />
              <button type="submit" className="bg-medical-navy text-white px-4 rounded">Load Request</button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {credentials.map(cred => {
              const isExpired = new Date(cred.validUntil) < new Date();
              const canFulfill = activeRequest && cred.parameters.hasOwnProperty(activeRequest.parameterKey);

              return (
                <div key={cred.id} className={`border p-5 rounded-lg shadow-sm ${isExpired ? 'bg-red-50 border-red-200' : 'bg-white border-sky-100'}`}>
                  <h3 className="font-bold text-xl text-medical-navy">{cred.documentType}</h3>
                  <p className="text-sm text-slate-600 mt-2">Issuer: {cred.issuer}</p>
                  <p className={`text-sm font-bold mt-2 ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isExpired ? `Expired: ${new Date(cred.validUntil).toLocaleDateString()}` : `Valid until: ${new Date(cred.validUntil).toLocaleDateString()}`}
                  </p>
                  
                  {activeRequest && (
                    <button 
                      onClick={() => handleGenerateProof(cred)}
                      disabled={loading || !canFulfill || isExpired}
                      className={`mt-4 w-full px-4 py-2 rounded font-semibold text-white transition 
                        ${isExpired ? 'bg-red-300 cursor-not-allowed' : 
                          canFulfill ? 'bg-medical-blue hover:bg-sky-700' : 'bg-slate-300 cursor-not-allowed'}`}
                    >
                      {loading ? "Generating ZKP..." : 
                       isExpired ? "Document Expired" : 
                       canFulfill ? "Use This Document" : "Missing Required Data"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* VIEW: AUDIT HISTORY */}
      {activeTab === "history" && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {auditLogs.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No access history found. Your data has not been shared yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 border-b">Date</th>
                  <th className="p-4 border-b">Verifier</th>
                  <th className="p-4 border-b">Document Used</th>
                  <th className="p-4 border-b">Policy Checked</th>
                  <th className="p-4 border-b">Result</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {auditLogs.map(log => (
                  <tr key={log._id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-4 text-slate-600">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-slate-800">{log.verifierId}</td>
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