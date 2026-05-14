// frontend/src/utils/api.js

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/**
 * A reusable helper function to handle all API requests and automatically
 * attach the JWT token if the user is logged in.
 */
async function fetchWithAuth(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  
  // Attach the JWT Token for protected routes
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = { method, headers };
  
  // Only add a body if there is data to send (POST/PUT requests)
  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();
  
  // If the server returns a 400 or 401 status, throw the custom error message
  if (!response.ok) {
    throw new Error(data.error || "API Request Failed");
  }
  
  return data;
}

export const api = {
  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================
  
  // Issuer (Doctor) Login - Hardcoded in backend as DOC-1 / password123
  loginIssuer: (id, password) => 
    fetchWithAuth("/auth/issuer/login", "POST", { id, password }),

  // Prover (Patient) Login & Signup - Dynamic using db2.json
  loginProver: (patientId, pin) => 
    fetchWithAuth("/auth/prover/login", "POST", { patientId, pin }),
    
  signupProver: (patientId, pin, name) => 
    fetchWithAuth("/auth/prover/signup", "POST", { patientId, pin, name }),

  // Verifier Login - Hardcoded in backend as verify999
  loginVerifier: (apiKey) => 
    fetchWithAuth("/auth/verifier/login", "POST", { apiKey }),


  // ==========================================
  // ISSUER (Doctor) ENDPOINTS
  // ==========================================
  issueCredential: (payload, token) => 
    fetchWithAuth("/issuer/credential", "POST", payload, token),


  // ==========================================
  // PROVER (Patient) ENDPOINTS
  // ==========================================
  getCredentials: (token) => fetchWithAuth("/prover/credentials", "GET", null, token),
  getVerificationRequest: (reqId, token) => fetchWithAuth(`/prover/request/${reqId}`, "GET", null, token),
  submitProof: (payload, token) => fetchWithAuth("/prover/submit-proof", "POST", payload, token),


  // ==========================================
  // VERIFIER ENDPOINTS
  // ==========================================
  createRequest: (payload, token) => fetchWithAuth("/verifier/request", "POST", payload, token),
  checkRequestStatus: (reqId, token) => fetchWithAuth(`/verifier/request/${reqId}`, "GET", null, token),
};
