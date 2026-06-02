# Zero-Knowledge Proof (ZKP) Credential Platform

A full-stack Self-Sovereign Identity (SSI) platform that allows organizations to issue credentials, users to store them securely, and third parties to verify them without exposing the underlying raw data.

### 🧠 The Architecture
The platform is built on a 3-tier architecture:
1. **Issuers (Doctors, Banks, Universities):** Cryptographically sign and issue data to the user (e.g., Blood Sugar = 90, Credit Score = 750).
2. **Provers (The User/Patient):** Store credentials in a secure local wallet. When requested, they generate a Zero-Knowledge Proof locally to prove they meet a condition.
3. **Verifiers (Insurance, Employers):** Set policies (e.g., "Blood Sugar < 100") and verify the mathematical proof submitted by the user without ever seeing the actual number.

### 🛠 Tech Stack
* **Frontend:** React.js, Tailwind CSS, Vite
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Security:** JSON Web Tokens (JWT), Cryptographic Hashing

### ✨ Key Features
* **Multi-Domain Categorization:** Automatically routes credentials into Health, Finance, or Education vaults.
* **Smart Verification:** Prover wallet automatically disables expired credentials or documents that lack the required parameters.
* **Audit Trail Dashboard:** Users have a permanent history of exactly who verified their data, what policy was checked, and when.
