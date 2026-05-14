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

  async function handleGenerateProof(credential) {
    setLoading(true);
    setMessage("Generating zero-knowledge proof locally...");
    try {
      const parameterKey = Object.keys(credential.parameters)[0];
      const proofPayload = await createLocalProof({
        credential,
        parameterKey,
        operator: "<",
        threshold: "100" 
      });

      const res = await api.submitProof(proofPayload, token);
      setMessage(`Success! Proof submitted. Your Proof ID is: ${res.proofId}`);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-sky-100 pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-navy">Your Secure Wallet</h2>
          <p className="text-slate-600 font-medium mt-1">Logged in as: {user?.name} ({user?.id})</p>
        </div>
        <button onClick={handleLogout} className="bg-slate-100 text-slate-700 px-4 py-2 rounded font-semibold hover:bg-slate-200 transition">
          Log Out
        </button>
      </div>

      {message && <div className="mb-6 p-4 bg-medical-mint border border-emerald-200 text-emerald-800 font-semibold rounded">{message}</div>}
      
      {credentials.length === 0 ? (
        <div className="text-center p-8 bg-sky-50 rounded-lg border border-sky-100">
          <p className="text-slate-600 font-medium">Your wallet is empty. No credentials issued yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {credentials.map(cred => (
            <div key={cred.id} className="border border-sky-100 p-5 rounded-lg bg-sky-50/50 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-medical-blue">Signed Document</span>
              <h3 className="font-bold text-xl text-medical-navy mt-1">{cred.documentType}</h3>
              <p className="text-sm text-slate-600 mt-2"><span className="font-semibold">Issuer:</span> {cred.issuer}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold">Parameters:</span> {Object.keys(cred.parameters).join(", ")}</p>
              <button 
                onClick={() => handleGenerateProof(cred)}
                disabled={loading}
                className="mt-5 w-full bg-medical-green hover:bg-emerald-600 text-white px-4 py-3 rounded font-semibold shadow-sm transition disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {loading ? "Generating ZKP..." : "Generate Proof (< 100)"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}