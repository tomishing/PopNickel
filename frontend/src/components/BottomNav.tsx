import { NavLink } from "react-router-dom";

function HomeIcon({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-m3-primary">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 text-m3-on-surface-variant">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}

function AddIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      className={`w-6 h-6 ${active ? "text-m3-primary" : "text-m3-on-surface-variant"}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ScanIcon({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-m3-primary">
      <path d="M12 10.8c-1.21 0-2.2.99-2.2 2.2s.99 2.2 2.2 2.2 2.2-.99 2.2-2.2-.99-2.2-2.2-2.2zM9.16 7.28L7.75 5.86C6.06 7.15 5 9.15 5 11.2h2c0-1.49.68-2.82 1.74-3.71l.42.59zM19 11.2h2c0-2.05-1.06-4.05-2.75-5.34l-1.41 1.41A5.14 5.14 0 0119 11.2zm-7-8.2c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      className="w-6 h-6 text-m3-on-surface-variant">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

interface TabProps {
  to: string;
  label: string;
  end?: boolean;
  icon: (active: boolean) => React.ReactNode;
}

function Tab({ to, label, end, icon }: TabProps) {
  return (
    <NavLink to={to} end={end} className="flex-1 flex flex-col items-center pt-3 pb-1 gap-1">
      {({ isActive }) => (
        <>
          {/* M3 active pill indicator */}
          <div className={`flex items-center justify-center w-16 h-8 rounded-full transition-colors duration-200
                           ${isActive ? "bg-m3-primary-container" : "bg-transparent"}`}>
            {icon(isActive)}
          </div>
          <span className={`text-xs font-medium transition-colors
                            ${isActive ? "text-m3-primary" : "text-m3-on-surface-variant"}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <nav className="bg-m3-surface-container border-t border-m3-outline-variant flex items-start flex-shrink-0">
      <Tab to="/" end label="Home"     icon={(a) => <HomeIcon active={a} />} />
      <Tab to="/add"  label="Add"      icon={(a) => <AddIcon  active={a} />} />
      <Tab to="/scan" label="Scan"     icon={(a) => <ScanIcon active={a} />} />
    </nav>
  );
}
