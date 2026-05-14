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

  // Check localStorage on load
  useEffect(() => {
    const savedToken = localStorage.getItem("proverToken");
    const savedUser = localStorage.getItem("proverUser");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      loadCredentials(savedToken);
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
      // Create proof based on Verifier's exact request
      const proofPayload = await createLocalProof({
        credential,
        parameterKey: activeRequest.parameterKey,
        operator: activeRequest.operator,
        threshold: activeRequest.threshold
      });

      await api.submitProof({ requestId: activeRequest.id, proofPayload }, token);
      setMessage("✅ Success! Proof generated locally and submitted to Verifier.");
      setActiveRequest(null); // Clear request after fulfilling
    } catch (err) {
      setMessage(`Proof Error: ${err.message}`);
    } finally {
      setLoading(false);
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
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-soft border border-sky-100">
      <div className="flex justify-between items-center border-b border-sky-100 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-medical-navy">Your Secure Wallet</h2>
        <button onClick={handleLogout} className="bg-slate-100 text-slate-700 px-4 py-2 rounded">Log Out</button>
      </div>

      {message && <div className="mb-6 p-4 bg-sky-50 text-sky-800 font-semibold rounded">{message}</div>}

      {/* Step 1: Input Verifier's Request */}
      <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg">
        <h3 className="font-bold text-lg text-slate-800">Fulfill a Request</h3>
        <p className="text-sm text-slate-600 mb-4">Paste the Request ID provided by your employer or insurer.</p>
        <form onSubmit={handleLoadRequest} className="flex gap-2">
          <input required value={reqIdInput} onChange={e => setReqIdInput(e.target.value)} className="border p-2 rounded flex-1" placeholder="e.g., req_17000000..." />
          <button type="submit" className="bg-medical-navy text-white px-4 rounded">Load Request</button>
        </form>
      </div>

      {/* Step 2: Select Credential to Fulfill the Request */}
      <h3 className="font-bold text-lg text-medical-navy mb-4">Your Medical Records</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {credentials.map(cred => {
          // Check if this credential has the data the Verifier is asking for
          const canFulfill = activeRequest && cred.parameters.hasOwnProperty(activeRequest.parameterKey);

          return (
            <div key={cred.id} className="border border-sky-100 p-5 rounded-lg bg-white shadow-sm">
              <h3 className="font-bold text-xl text-medical-navy">{cred.documentType}</h3>
              <p className="text-sm text-slate-600 mt-2">Issuer: {cred.issuer}</p>
              <p className="text-sm text-slate-600">Parameters: {Object.keys(cred.parameters).join(", ")}</p>
              
              {activeRequest && (
                <button 
                  onClick={() => handleGenerateProof(cred)}
                  disabled={loading || !canFulfill}
                  className={`mt-4 w-full px-4 py-2 rounded font-semibold text-white ${canFulfill ? 'bg-medical-green hover:bg-emerald-600' : 'bg-slate-300 cursor-not-allowed'}`}
                >
                  {loading ? "Generating ZKP..." : canFulfill ? "Use This Credential" : "Missing Required Data"}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}