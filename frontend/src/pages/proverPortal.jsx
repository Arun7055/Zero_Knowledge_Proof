import { useState, useEffect } from "react";
import { api } from "../utils/api.js";
import { createLocalProof } from "../utils/zkEngine.js";

export default function ProverPortal() {
  const [isLogin, setIsLogin] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  
  // No hardcoded data!
  const [authForm, setAuthForm] = useState({ patientId: "", pin: "", name: "" });
  const [credentials, setCredentials] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Check localStorage on component mount
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
      
      // Save to React State
      setToken(res.token);
      setUser(res.user);
      
      // Save to LocalStorage for persistence
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

  // ... handleGenerateProof function remains exactly the same ...

  if (!token) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-soft">
        <h2 className="text-2xl font-bold text-medical-navy">
          {isLogin ? "Patient Login" : "Patient Sign Up"}
        </h2>
        
        <form onSubmit={handleAuth} className="mt-6 grid gap-4">
          {!isLogin && (
            <input required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="border p-3 rounded" placeholder="Full Name" />
          )}
          <input required value={authForm.patientId} onChange={e => setAuthForm({...authForm, patientId: e.target.value})} className="border p-3 rounded" placeholder="Patient ID (e.g. PAT-001)" />
          <input required type="password" value={authForm.pin} onChange={e => setAuthForm({...authForm, pin: e.target.value})} className="border p-3 rounded" placeholder="Secure PIN" />
          
          <button type="submit" className="bg-medical-blue text-white p-3 rounded font-bold shadow-sm">
            {isLogin ? "Unlock Wallet" : "Create Wallet"}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="mt-4 text-sm text-sky-600 hover:underline w-full text-center">
          {isLogin ? "Need a wallet? Sign up here." : "Already have a wallet? Log in."}
        </button>

        {message && <p className="mt-4 text-sm text-red-600 text-center bg-red-50 p-2 rounded">{message}</p>}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-soft">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-navy">Your Secure Wallet</h2>
          <p className="text-slate-600">Logged in as: {user?.name} ({user?.id})</p>
        </div>
        <button onClick={handleLogout} className="bg-slate-100 text-slate-700 px-4 py-2 rounded hover:bg-slate-200 transition">
          Log Out
        </button>
      </div>

      {message && <div className="mb-4 p-3 bg-medical-mint text-emerald-800 rounded">{message}</div>}
      
      {/* ... mapping over credentials remains the same ... */}
    </div>
  );
}