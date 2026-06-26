function SignalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <rect x="1"  y="16" width="3" height="5" rx="0.5" />
      <rect x="6"  y="12" width="3" height="9" rx="0.5" />
      <rect x="11" y="8"  width="3" height="13" rx="0.5" />
      <rect x="16" y="4"  width="3" height="17" rx="0.5" opacity="0.35" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 18a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
      <path d="M12 13.5c1.6 0 3 .65 4.05 1.7l1.4-1.4A8.47 8.47 0 0012 11c-2.35 0-4.48.95-6.02 2.5l1.41 1.41A6.5 6.5 0 0112 13.5z" opacity="0.4"/>
      <path d="M12 9c2.76 0 5.26 1.12 7.07 2.93l1.41-1.41A13.45 13.45 0 0012 7C8.14 7 4.67 8.58 2.18 11.1l1.41 1.41C5.75 10.14 8.73 9 12 9z" opacity="0.2"/>
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg viewBox="0 0 25 12" className="w-6 h-3.5 fill-current">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35" fill="none" />
      <rect x="2" y="2" width="16" height="8" rx="2" />
      <path d="M23 4v4a2 2 0 000-4z" opacity="0.4"/>
    </svg>
  );
}

export default function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false });

  return (
    <div className="flex items-center justify-between px-5 h-7 bg-m3-surface flex-shrink-0 relative">
      {/* Time */}
      <span className="text-xs font-medium text-m3-on-surface tracking-tight w-10">{time}</span>

      {/* Punch-hole camera — centred */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-3 h-3 bg-black rounded-full" />

      {/* Status icons */}
      <div className="flex items-center gap-1.5 text-m3-on-surface">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}
