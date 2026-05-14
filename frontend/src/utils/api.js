const BASE_URL = "http://localhost:5000/api";

async function fetchWithAuth(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();
  
  if (!response.ok) throw new Error(data.error || "API Request Failed");
  return data;
}

// ... keep fetchWithAuth exactly the same ...

export const api = {
    // Auth - Login
    loginIssuer: (id, password) => fetchWithAuth("/auth/issuer/login", "POST", { id, password }),
    loginProver: (patientId, pin) => fetchWithAuth("/auth/prover/login", "POST", { patientId, pin }),
    loginVerifier: (verifierId, apiKey) => fetchWithAuth("/auth/verifier/login", "POST", { verifierId, apiKey }),
  
    // Auth - Signup
    signupIssuer: (id, password, name) => fetchWithAuth("/auth/issuer/signup", "POST", { id, password, name }),
    signupProver: (patientId, pin, name) => fetchWithAuth("/auth/prover/signup", "POST", { patientId, pin, name }),
    signupVerifier: (verifierId, apiKey, name) => fetchWithAuth("/auth/verifier/signup", "POST", { verifierId, apiKey, name }),
  
    // ... keep the rest exactly the same ...
  };