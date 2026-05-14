import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="mx-auto max-w-4xl py-12">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-600">
          Privacy-Preserving Healthcare
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-slate-900 sm:text-5xl">
          Zero-Knowledge Medical Records
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Prove your medical status (like blood test results or prescriptions) to third parties without ever revealing the raw underlying data. Choose your role below to begin.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {/* Issuer Card */}
        <Link
          to="/issuer"
          className="group flex flex-col items-center rounded-2xl border border-sky-100 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:border-sky-600 hover:shadow-md"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-600 transition group-hover:bg-sky-600 group-hover:text-white">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-bold text-slate-900">Issuer</h2>
          <p className="mt-2 text-sm text-slate-600">
            For Hospitals & Doctors. Issue cryptographically signed medical credentials to patients.
          </p>
          <span className="mt-6 text-sm font-bold text-sky-600">Login as Doctor &rarr;</span>
        </Link>

        {/* Prover Card */}
        <Link
          to="/prover"
          className="group flex flex-col items-center rounded-2xl border border-sky-100 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-bold text-slate-900">Prover</h2>
          <p className="mt-2 text-sm text-slate-600">
            For Patients. Generate Zero-Knowledge proofs locally on your device without exposing data.
          </p>
          <span className="mt-6 text-sm font-bold text-emerald-600">Login as Patient &rarr;</span>
        </Link>

        {/* Verifier Card */}
        <Link
          to="/verifier"
          className="group flex flex-col items-center rounded-2xl border border-sky-100 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:border-slate-800 hover:shadow-md"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-slate-800 group-hover:text-white">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-bold text-slate-900">Verifier</h2>
          <p className="mt-2 text-sm text-slate-600">
            For Insurance / Employers. Verify mathematical proofs submitted by patients instantly.
          </p>
          <span className="mt-6 text-sm font-bold text-slate-700">Login as Verifier &rarr;</span>
        </Link>
      </div>
    </section>
  );
}