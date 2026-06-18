import { useState, useEffect } from "react";
// import { api } from "../utils/api.js";

// Mock API for Canvas Preview
const api = {
  loginIssuer: async () => ({ token: "mock-token", user: { name: "Mock Doctor" } }),
  getIssuerHistory: async () => ({ credentials: [] }),
  issueCredential: async () => ({ success: true })
};

export default function IssuerPortal() {
  const [token, setToken] = useState(null);
  const [loginForm, setLoginForm] = useState({ id: "DOC-1", password: "password123" });
  
  // 1. Main form state including validUntil
  const [issueForm, setIssueForm] = useState({ patientId: "", documentType: "", validUntil: "" });
  
  // Kept parameters separate as an array
  const [parameters, setParameters] = useState([{ key: "", value: "" }]);
  const [message, setMessage] = useState("");

  // History Tab States
  const [activeTab, setActiveTab] = useState("issue"); 
  const [history, setHistory] = useState([]);

  // Fetch history when token is available
  useEffect(() => {
    if (token) loadHistory();
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await api.loginIssuer(loginForm.id, loginForm.password);
      setToken(res.token);
      setMessage(`Logged in as ${res.user?.name || "Issuer"}`);
    } catch (err) {
      setMessage(`Login Error: ${err.message}`);
    }
  }

  async function loadHistory() {
    try {
      const res = await api.getIssuerHistory(token);
      setHistory(res.credentials);
    } catch (err) { console.error("Failed to load history", err); }
  }

  async function handleIssue(e) {
    e.preventDefault();
    
    // Convert the array into the object the backend expects
    const formattedParams = parameters.reduce((acc, param) => {
      // It is CRITICAL to convert the value to a Number here so the ZKP math works later
      if (param.key) acc[param.key] = Number(param.value); 
      return acc;
    }, {});

    try {
      await api.issueCredential({
        patientId: issueForm.patientId,
        documentType: issueForm.documentType,
        validUntil: issueForm.validUntil, // 2. Pass the date to the API
        parameters: formattedParams
      }, token);
      
      setMessage("✅ Credential securely issued and stored on network.");
      
      // Clear form after successful issue
      setIssueForm({ patientId: "", documentType: "", validUntil: "" });
      setParameters([{ key: "", value: "" }]);
      
      // Refresh the history list
      loadHistory(); 
    } catch (err) {
      setMessage(`Issue Error: ${err.message}`);
    }
  }

  function handleLogout() {
    setToken(null);
    setHistory([]);
    setActiveTab("issue");
    setMessage("");
  }

  if (!token) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-soft border border-sky-100">
        <h2 className="text-2xl font-bold text-medical-navy">Issuer Login</h2>
        <form onSubmit={handleLogin} className="mt-4 grid gap-4">
          <input value={loginForm.id} onChange={e => setLoginForm({...loginForm, id: e.target.value})} className="border p-2 rounded" placeholder="Doctor / Bank ID" />
          <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="border p-2 rounded" placeholder="Password" />
          <button className="bg-medical-blue text-white p-2 rounded font-bold hover:bg-sky-700 transition">Login</button>
        </form>
        {message && <p className="mt-4 text-sm text-red-600 font-semibold">{message}</p>}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-soft border border-sky-100">
      <div className="flex justify-between items-center border-b border-sky-100 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-medical-navy">Institution Portal</h2>
        <button onClick={handleLogout} className="bg-slate-100 text-slate-700 px-4 py-2 rounded hover:bg-slate-200 transition">Log Out</button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("issue")} 
          className={`pb-2 px-2 font-bold transition ${activeTab === 'issue' ? 'text-medical-blue border-b-2 border-medical-blue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Issue Credential
        </button>
        <button 
          onClick={() => setActiveTab("history")} 
          className={`pb-2 px-2 font-bold transition ${activeTab === 'history' ? 'text-medical-blue border-b-2 border-medical-blue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Issued History
        </button>
      </div>

      {message && <div className={`mb-6 p-4 rounded font-semibold ${message.includes("Error") ? "bg-red-50 text-red-800 border border-red-200" : "bg-sky-50 text-sky-800 border border-sky-200"}`}>{message}</div>}

      {/* ========================================== */}
      {/* VIEW: ISSUE CREDENTIAL                     */}
      {/* ========================================== */}
      {activeTab === "issue" && (
        <form onSubmit={handleIssue} className="grid gap-4 bg-slate-50 p-6 rounded-lg border border-slate-200">
          
          {/* Main Document Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">User ID</label>
              <input required value={issueForm.patientId} onChange={e => setIssueForm({...issueForm, patientId: e.target.value})} placeholder="e.g. USR-001" className="border border-slate-300 p-2 rounded focus:outline-none focus:border-medical-blue" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Document Type</label>
              <input required value={issueForm.documentType} onChange={e => setIssueForm({...issueForm, documentType: e.target.value})} placeholder="e.g. Blood Test / Report Card" className="border border-slate-300 p-2 rounded focus:outline-none focus:border-medical-blue" />
            </div>
          </div>

          {/* 3. The Expiration Date Field */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expiration Date</label>
            <input required type="date" value={issueForm.validUntil} onChange={e => setIssueForm({...issueForm, validUntil: e.target.value})} className="border border-slate-300 p-2 rounded w-full focus:outline-none focus:border-medical-blue" />
          </div>
          
          {/* Dynamic Parameters Array */}
          <div className="mt-4 border-t border-slate-200 pt-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Data Parameters</label>
            {parameters.map((param, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input required value={param.key} onChange={e => {
                  const newParams = [...parameters];
                  newParams[index].key = e.target.value;
                  setParameters(newParams);
                }} placeholder="Key (e.g. BloodPressure)" className="border border-slate-300 p-2 rounded flex-1 focus:outline-none focus:border-medical-blue" />
                <input required type="number" value={param.value} onChange={e => {
                  const newParams = [...parameters];
                  newParams[index].value = e.target.value;
                  setParameters(newParams);
                }} placeholder="Value (e.g. 110)" className="border border-slate-300 p-2 rounded flex-1 focus:outline-none focus:border-medical-blue" />
                
                {parameters.length > 1 && (
                  <button type="button" onClick={() => {
                    const newParams = parameters.filter((_, i) => i !== index);
                    setParameters(newParams);
                  }} className="bg-red-100 text-red-600 px-3 rounded font-bold hover:bg-red-200 transition">
                    X
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setParameters([...parameters, {key:"", value:""}])} className="text-medical-blue font-semibold text-sm hover:underline mt-1">
              + Add Another Parameter
            </button>
          </div>

          <button type="submit" className="bg-medical-blue hover:bg-sky-700 transition text-white p-3 rounded font-bold mt-4 shadow-sm">
            Sign & Issue Credential
          </button>
        </form>
      )}

      {/* ========================================== */}
      {/* VIEW: ISSUED HISTORY                       */}
      {/* ========================================== */}
      {activeTab === "history" && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {history.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No credentials issued yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 border-b">Date Issued</th>
                  <th className="p-4 border-b">Target User</th>
                  <th className="p-4 border-b">Document Type</th>
                  <th className="p-4 border-b">Valid Until</th>
                  <th className="p-4 border-b">Data Signed</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {history.map(cred => {
                  const isExpired = new Date(cred.validUntil) < new Date();
                  return (
                    <tr key={cred._id || cred.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="p-4 text-slate-600">{new Date(cred.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold text-slate-800">{cred.patientId}</td>
                      <td className="p-4 text-medical-navy">{cred.documentType}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${isExpired ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {new Date(cred.validUntil).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs bg-slate-100 rounded px-2">
                        {JSON.stringify(cred.parameters).replace(/[{""}]/g, '').replace(/:/g, ': ')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}