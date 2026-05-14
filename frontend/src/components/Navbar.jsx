import { NavLink } from "react-router-dom";

const links = [
  { to: "/issuer", label: "Issuer Portal" },
  { to: "/prover", label: "Prover Portal" },
  { to: "/verifier", label: "Verifier Portal" },
];

export default function Navbar() {
  return (
    <header className="border-b border-sky-100 bg-white/90 shadow-sm backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-medical-blue">
            Local Only ZKP Demo
          </p>
          <h1 className="text-xl font-bold text-medical-navy sm:text-2xl">
            ZKP Document Verification
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "rounded-md px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-medical-blue text-white shadow-sm"
                    : "bg-sky-50 text-medical-navy hover:bg-sky-100",
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
