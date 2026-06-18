import React, { useState, useEffect } from "react";
import { api } from "../utils/api.js";
import { createLocalProof } from "../utils/zkEngine.js";
import { Scanner } from "@yudiel/react-qr-scanner";

const api = {
  loginProver: async () => ({ token: "demo-token", user: { name: "Demo User" } }),
  signupProver: async () => ({ token: "demo-token", user: { name: "Demo User" } }),
  getCredentials: async () => ({
    credentials: [
      { id: "1", domain: "Health", documentType: "Basic Metabolic Panel", issuer: "City Hospital", validUntil: "2027-01-01", parameters: { BloodPressure: 110, HeartRate: 72 } },
      { id: "2", domain: "Finance", documentType: "Credit Report", issuer: "Global Bank", validUntil: "2027-05-12", parameters: { CreditScore: 780 } }
    ]
  }),
  getAuditLogs: async () => ({
    logs: [
      { _id: "log1", timestamp: Date.now() - 86400000, verifierId: "HealthPlus Insurance", documentType: "Basic Metabolic Panel", policyChecked: "BloodPressure < 120", status: "verified" }
    ]
  }),
  getVerificationRequest: async (id) => ({
    request: { id: id || "req_demo_123", parameterKey: "BloodPressure", operator: "<", threshold: "120" }
  }),
  submitProof: async () => ({ success: true })
};

const createLocalProof = async () => "mock_zkp_payload_12345";

const Scanner = ({ onScan }) => (
  <div className="p-8 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-600 bg-slate-900 rounded">
    <p className="mb-4">📷 [Camera Scanner Simulator]</p>
    <button
      type="button"
      onClick={() => onScan("req_demo_123")}
      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow transition"
    >
      Simulate Successful Scan
    </button>
  </div>
);
// --- END MOCKS ---

export default function ProverPortal() {
  const [isLogin, setIsLogin] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  
  const [authForm, setAuthForm] = useState({ patientId: "", pin: "", name: "" });
  const [credentials, setCredentials] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Request handling state
  const [reqIdInput, setReqIdInput] = useState("");
  const [activeRequest, setActiveRequest] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const [activeTab, setActiveTab] = useState("wallet");
  const [auditLogs, setAuditLogs] = useState([]);

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
      loadAuditLogs(res.token);
    } catch (err) {
      setMessage(`Auth Error: ${err.message}`);
    }
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setCredentials([]);
    setAuditLogs([]);
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

  async function loadAuditLogs(activeToken) {
    try {
      const res = await api.getAuditLogs(activeToken);
      setAuditLogs(res.logs);
    } catch (err) {
      console.error("Failed to load logs", err);
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

  // Handle successful QR scan
  function handleScanSuccess(detected) {
    if (detected) {
      const scannedValue = Array.isArray(detected) ? detected[0].rawValue : detected;
      setReqIdInput(scannedValue);
      setShowScanner(false);
      setMessage("✅ QR Code Scanned Successfully! Click 'Load Request'.");
    }
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

      await api.submitProof({ 
        requestId: activeRequest.id, 
        proofPayload,
        credentialId: credential.id
      }, token);
      
      setMessage("✅ Success! Proof generated locally and submitted to Verifier.");
      setActiveRequest(null);
      setReqIdInput("");
      
      // Refresh logs
      const updatedLogs = await api.getAuditLogs(token);
      setAuditLogs(updatedLogs.logs);
      
    } catch (err) {
      setMessage(`Proof Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md border border-blue-100">
        <h2 className="text-2xl font-bold text-slate-800 text-center">
          {isLogin ? "User Login" : "Create Identity Wallet"}
        </h2>
        
        <form onSubmit={handleAuth} className="mt-6 grid gap-4">
          {!isLogin && (
            <input required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="border border-blue-200 p-3 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full Name" />
          )}
          <input required value={authForm.patientId} onChange={e => setAuthForm({...authForm, patientId: e.target.value})} className="border border-blue-200 p-3 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="User ID (e.g. USR-001)" />
          <input required type="password" value={authForm.pin} onChange={e => setAuthForm({...authForm, pin: e.target.value})} className="border border-blue-200 p-3 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="Secure PIN" />
          
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-bold shadow-sm transition">
            {isLogin ? "Unlock Wallet" : "Create Wallet"}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="mt-5 text-sm text-blue-600 hover:text-slate-800 font-semibold w-full text-center transition">
          {isLogin ? "Need a wallet? Sign up here." : "Already have a wallet? Log in."}
        </button>

        {message && <p className="mt-4 text-sm text-red-600 text-center bg-red-50 border border-red-100 p-3 rounded">{message}</p>}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md border border-blue-100">
      <div className="flex justify-between items-center border-b border-blue-100 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Your Secure Wallet</h2>
        <button onClick={handleLogout} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded transition">Log Out</button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("wallet")} 
          className={`pb-2 px-2 font-bold transition ${activeTab === 'wallet' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          My Credentials
        </button>
        <button 
          onClick={() => setActiveTab("history")} 
          className={`pb-2 px-2 font-bold transition ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Access History
        </button>
      </div>

      {message && <div className="mb-6 p-4 bg-blue-50 text-blue-800 font-semibold rounded border border-blue-100">{message}</div>}

      {activeTab === "wallet" && (
        <>
          <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-bold text-lg text-slate-800">Fulfill a Request</h3>
            <p className="text-sm text-slate-600 mb-4">Paste the Request ID or scan the QR code provided by the verifier.</p>
            
            {/* Camera Scanner UI */}
            {showScanner && (
              <div className="mb-4 p-4 bg-black rounded-lg relative overflow-hidden flex flex-col items-center">
                <button 
                  onClick={() => setShowScanner(false)} 
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10 transition"
                >
                  Close Camera
                </button>
                <div className="w-full max-w-sm rounded overflow-hidden">
                  <Scanner onScan={handleScanSuccess} />
                </div>
                <p className="text-white text-sm mt-3 animate-pulse">Scanning for QR code...</p>
              </div>
            )}

            <form onSubmit={handleLoadRequest} className="flex gap-2 mt-4">
              <input 
                required 
                value={reqIdInput} 
                onChange={e => setReqIdInput(e.target.value)} 
                className="border p-2 rounded flex-1 outline-none focus:border-blue-500" 
                placeholder="e.g., req_17000000..." 
              />
              <button 
                type="button" 
                onClick={() => setShowScanner(!showScanner)} 
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 rounded font-bold transition flex items-center gap-2"
              >
                📷 Scan QR
              </button>
              <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded transition">
                Load Request
              </button>
            </form>
          </div>

          <h3 className="font-bold text-lg text-slate-800 mb-4">Your Secure Data Vault</h3>
          
          {credentials.length === 0 ? (
            <div className="text-center p-8 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-slate-600 font-medium">Your wallet is empty. No credentials issued yet.</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {["Health", "Finance", "Education"].map(domainName => {
                const domainCreds = credentials.filter(cred => cred.domain === domainName);
                if (domainCreds.length === 0) return null; 

                return (
                  <div key={domainName} className="border-t border-slate-200 pt-6">
                    <h4 className="text-xl font-extrabold text-slate-800 mb-4">{domainName} Credentials</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {domainCreds.map(cred => {
                        const isExpired = new Date(cred.validUntil) < new Date();
                        const canFulfill = activeRequest && cred.parameters.hasOwnProperty(activeRequest.parameterKey);
                      
                        return (
                          <div key={cred.id} className={`border p-5 rounded-lg shadow-sm ${isExpired ? 'bg-red-50 border-red-200' : 'bg-white border-blue-100'}`}>
                            <h3 className="font-bold text-xl text-slate-800">{cred.documentType}</h3>
                            <p className="text-sm text-slate-600 mt-2">Issuer: {cred.issuer}</p>
                            <p className="text-sm text-slate-600">Parameters: {Object.keys(cred.parameters).join(", ")}</p>
                            
                            <p className={`text-sm font-bold mt-2 ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                              {isExpired ? `Expired on: ${new Date(cred.validUntil).toLocaleDateString()}` : `Valid until: ${new Date(cred.validUntil).toLocaleDateString()}`}
                            </p>
                            
                            {activeRequest && (
                              <button 
                                onClick={() => handleGenerateProof(cred)}
                                disabled={loading || !canFulfill || isExpired} 
                                className={`mt-4 w-full px-4 py-2 rounded font-semibold text-white transition 
                                  ${isExpired ? 'bg-red-300 cursor-not-allowed' : 
                                    canFulfill ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'}`}
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
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

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
                    <td className="p-4 text-slate-800">{log.documentType}</td>
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