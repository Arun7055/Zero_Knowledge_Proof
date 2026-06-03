import { useState } from "react";
import { api } from "../utils/api.js";

export default function IssuerPortal() {
  const [token, setToken] = useState(null);
  const [loginForm, setLoginForm] = useState({ id: "DOC-1", password: "password123" });
  
  // 1. Added validUntil to the main form state
  const [issueForm, setIssueForm] = useState({ patientId: "", documentType: "", validUntil: "" });
  
  // Kept parameters separate as an array!
  const [parameters, setParameters] = useState([{ key: "", value: "" }]);
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await api.loginIssuer(loginForm.id, loginForm.password);
      setToken(res.token);
      setMessage(`Logged in as ${res.user.name}`);
    } catch (err) {
      setMessage(`Login Error: ${err.message}`);
    }
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
      
      // Optional: Clear form after successful issue
      setIssueForm({ patientId: "", documentType: "", validUntil: "" });
      setParameters([{ key: "", value: "" }]);
    } catch (err) {
      setMessage(`Issue Error: ${err.message}`);
    }
  }

  if (!token) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-soft border border-sky-100">
        <h2 className="text-2xl font-bold text-medical-navy">Issuer Login</h2>
        <form onSubmit={handleLogin} className="mt-4 grid gap-4">
          <input value={loginForm.id} onChange={e => setLoginForm({...loginForm, id: e.target.value})} className="border p-2 rounded" placeholder="Doctor / Bank ID" />
          <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="border p-2 rounded" placeholder="Password" />
          <button className="bg-medical-blue text-white p-2 rounded font-bold">Login</button>
        </form>
        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-soft border border-sky-100">
      <h2 className="text-2xl font-bold text-medical-navy">Issue New Credential</h2>
      {message && <p className={`text-sm mb-4 font-semibold ${message.includes("Error") ? "text-red-600" : "text-emerald-600"}`}>{message}</p>}
      
      <form onSubmit={handleIssue} className="grid gap-4 mt-4">
        
        {/* Main Document Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">User ID</label>
            <input required value={issueForm.patientId} onChange={e => setIssueForm({...issueForm, patientId: e.target.value})} placeholder="e.g. ABC-2048" className="border p-2 rounded" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Document Type</label>
            <input required value={issueForm.documentType} onChange={e => setIssueForm({...issueForm, documentType: e.target.value})} placeholder="e.g. Blood Test / Report Card" className="border p-2 rounded" />
          </div>
        </div>

        {/* 3. The New Expiration Date Field */}
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expiration Date</label>
          <input required type="date" value={issueForm.validUntil} onChange={e => setIssueForm({...issueForm, validUntil: e.target.value})} className="border p-2 rounded w-full" />
        </div>
        
        {/* Dynamic Parameters Array */}
        <div className="mt-4 border-t pt-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Data Parameters</label>
          {parameters.map((param, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input value={param.key} onChange={e => {
                const newParams = [...parameters];
                newParams[index].key = e.target.value;
                setParameters(newParams);
              }} placeholder="Key" className="border p-2 rounded flex-1" />
              <input value={param.value} onChange={e => {
                const newParams = [...parameters];
                newParams[index].value = e.target.value;
                setParameters(newParams);
              }} placeholder="Value" className="border p-2 rounded flex-1" />
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
    </div>
  );
}