import { useState } from "react";
import { api } from "../utils/api.js";

export default function IssuerPortal() {
  const [token, setToken] = useState(null);
  const [loginForm, setLoginForm] = useState({ id: "DOC-1", password: "password123" });
  const [issueForm, setIssueForm] = useState({ patientId: "", documentType: "Blood Test" });
  const [parameters, setParameters] = useState([{ key: "Blood_Sugar", value: "90" }]);
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
    const formattedParams = parameters.reduce((acc, param) => {
      if (param.key) acc[param.key] = param.value;
      return acc;
    }, {});

    try {
      await api.issueCredential({
        patientId: issueForm.patientId,
        documentType: issueForm.documentType,
        parameters: formattedParams
      }, token);
      setMessage("Credential securely issued and stored on network.");
    } catch (err) {
      setMessage(`Issue Error: ${err.message}`);
    }
  }

  if (!token) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-soft">
        <h2 className="text-2xl font-bold">Issuer Login</h2>
        <form onSubmit={handleLogin} className="mt-4 grid gap-4">
          <input value={loginForm.id} onChange={e => setLoginForm({...loginForm, id: e.target.value})} className="border p-2 rounded" placeholder="Doctor ID" />
          <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="border p-2 rounded" placeholder="Password" />
          <button className="bg-medical-blue text-white p-2 rounded">Login</button>
        </form>
        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-soft">
      <h2 className="text-2xl font-bold text-medical-navy">Issue Credential</h2>
      <p className="text-sm text-emerald-600 mb-4">{message}</p>
      <form onSubmit={handleIssue} className="grid gap-4">
        <input required value={issueForm.patientId} onChange={e => setIssueForm({...issueForm, patientId: e.target.value})} placeholder="Patient ID (e.g. PAT-2048)" className="border p-2 rounded" />
        <input required value={issueForm.documentType} onChange={e => setIssueForm({...issueForm, documentType: e.target.value})} placeholder="Document Type" className="border p-2 rounded" />
        
        {parameters.map((param, index) => (
          <div key={index} className="flex gap-2">
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
        <button type="button" onClick={() => setParameters([...parameters, {key:"", value:""}])} className="text-medical-blue text-sm text-left">Add Parameter +</button>
        <button type="submit" className="bg-medical-blue text-white p-2 rounded mt-2">Sign & Issue</button>
      </form>
    </div>
  );
}