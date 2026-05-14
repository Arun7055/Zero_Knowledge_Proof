import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // Your previous Navbar code
import Home from "./pages/Home";
import IssuerPortal from "./pages/issuerPortal";
import ProverPortal from "./pages/proverPortal";
import VerifierPortal from "./pages/verifierPortal";

export default function App() {
  return (
    <Router>
      {/* Global layout wrapper */}
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        
        {/* Main content area */}
        <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8 mt-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/issuer" element={<IssuerPortal />} />
            <Route path="/prover" element={<ProverPortal />} />
            <Route path="/verifier" element={<VerifierPortal />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}