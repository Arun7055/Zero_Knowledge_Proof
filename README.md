# Zero-Knowledge SSI Identity Network (Architecture PoC)

A full-stack distributed system demonstrating the architecture of a **Self-Sovereign Identity (SSI)** network using the principles of Zero-Knowledge Proofs (ZKP). 
Live Demo : https://zero-knowledge-proof-kappa.vercel.app/

<img width="1160" height="832" alt="image" src="https://github.com/user-attachments/assets/97b9475b-5166-42c4-b6b6-440ee418a864" />


This project implements the complete data-routing pipeline required for decentralized identity verification. It allows users to prove they meet specific requirements (e.g., "Credit Score > 700") to third-party verifiers without ever revealing their actual underlying data.

## 🏗️ System Architecture: The SSI Trust Triangle

This system is divided into three distinct bounded contexts, representing the SSI Trust Triangle:
<img width="692" height="1050" alt="image" src="https://github.com/user-attachments/assets/09c49df8-b003-47b1-b76d-410cdf9e8a9b" />

All 3 parties' history is stored and can be accesed easily for future requirements.

1. **The Issuer (Data Provider):** Simulates an authoritative body (we have Bank, University, Hospital). Issues verifiable credentials to the user.

<img width="2438" height="1732" alt="image" src="https://github.com/user-attachments/assets/1e0f88f6-a14c-4d79-b263-55b796c73143" />

Issure history<img width="2460" height="1468" alt="image" src="https://github.com/user-attachments/assets/3fd51cf2-d3d8-4e97-a531-8daf9a67236d" />

  
2. **The Prover (User Wallet Enclave):** The frontend client where data is held. It evaluates policies locally in the browser, ensuring raw data never leaves the device.
<img width="1796" height="1598" alt="image" src="https://github.com/user-attachments/assets/2e527d5b-5ca9-414d-8001-108c43371d3d" />

When needed to prove something, the user can scan the QR code or requestId shared by the verifier, and choose specific documents to submit proof. <img width="1342" height="1602" alt="image" src="https://github.com/user-attachments/assets/72b3f6b4-8f09-4573-9cbb-2d52a1640df5" />

Prover history <img width="2646" height="1638" alt="image" src="https://github.com/user-attachments/assets/4252eb57-ee24-4255-bad9-ee6df80762b4" />
   
3. **The Verifier (Service Provider):** Generates policy requirements and mathematically verifies incoming proof payloads without knowing the underlying private data.
The verifier initially creates a request by setting some parameter, and then shares the QR code or requestId with the prover
<img width="2050" height="1762" alt="image" src="https://github.com/user-attachments/assets/f20cc7a1-3af9-4f99-a26d-f7e993eba39a" />

Once the prover has submitted their proof, verify will only know if the proof satisfies or doesn't satisfy the given criteria.
<img width="964" height="694" alt="image" src="https://github.com/user-attachments/assets/73ed9a2c-cbdb-450b-b9fa-ab4ad29ebfdb" />
<img width="488" height="300" alt="image" src="https://github.com/user-attachments/assets/f0397727-55cc-4923-82e9-a7c5493f510c" />

Verifier history <img width="2490" height="1416" alt="image" src="https://github.com/user-attachments/assets/cd2ce878-3684-43e2-9595-22b8d8347db4" />



## 🚀 Features & Technical Highlights

* **Decentralized State Machine:** Built a robust API layer in Node.js/Express to handle the asynchronous lifecycle of Verification Requests (Creation -> Pending -> Proved -> Verified).
* **Secure Enclave Simulation:** The React frontend acts as a client-side enclave. It fetches the Verifier's policy, compares it against the user's locally stored credential, and generates a proof payload. **Raw user data is never transmitted in the POST request.**
* **Role-Based Access Control (RBAC):** Implemented strict JWT-based authentication to isolate the domains of the Issuer, Prover, and Verifier.
* **QR Code Off-Chain Routing:** Verifier policies are translated into QR codes/IDs, simulating off-chain, peer-to-peer sharing of cryptographic requirements.

## 💻 Tech Stack
* **Frontend:** React, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Security:** JWT (JSON Web Tokens), bcrypt
* **Architecture:** REST API, MVC Pattern, Simulated ZKP Pipeline

## 🧠 Design Philosophy: Architecture Over Algorithms

This project serves as an **Architectural Prototype**. While production ZKP systems rely on heavy cryptographic circuits (zk-SNARKs, Groth16, Circom/snarkjs) to generate mathematically binding proofs via elliptic curve pairings, this project focuses strictly on the **Distributed System Design**.

The cryptographic engine is currently implemented as a mock service (Stubbing). This deliberate design choice proves out the network routing, API boundaries, and state management of the SSI Trust Triangle. The architecture is modularized so that compiled WebAssembly (`.wasm`) ZK circuits can be dropped into the prover module in the future without altering the overarching system design.

## ⚙️ Workflow / End-to-End Execution
<img width="1226" height="962" alt="image" src="https://github.com/user-attachments/assets/c2c6c7bf-8e4a-4621-8e7a-38b4681148c9" />


1. **Issue:** The Issuer authenticates and posts a credential (e.g., `CreditScore: 750`) to the User's Wallet.
2. **Request:** The Verifier creates a policy requirement (`CreditScore >= 700`) and generates a unique Request ID.
3. **Compute:** The User inputs the Request ID into their Wallet. The Wallet fetches the policy, evaluates the data locally, and generates a proof payload.
4. **Verify:** The Node.js backend receives the proof, validates it against the active Request ID, and updates the Verifier's dashboard to "Verified"—all while remaining completely blind to the number `750`.
