import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useMe } from "../hooks/useAuth";
import { useScanReceipt } from "../hooks/useScanReceipt";

const FREE_SCAN_LIMIT = 10;

export default function ScanReceiptPage() {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const scanMutation = useScanReceipt();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scansUsed = user?.scans_used_this_month ?? 0;
  const isLimitReached = user?.plan === "free" && scansUsed >= FREE_SCAN_LIMIT;

  async function handleFile(file: File) {
    await scanMutation.mutateAsync(file);
    navigate("/");
  }

  return (
    <AppLayout>
      {/* M3 Small Top App Bar */}
      <div className="flex items-center gap-1 px-2 h-14 bg-m3-surface">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center
                     text-m3-on-surface hover:bg-m3-surface-container active:bg-m3-surface-container-high">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-lg font-medium text-m3-on-surface ml-1">Scan Receipt</h1>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Camera viewfinder */}
        <div className="w-full aspect-[3/4] rounded-xl3 bg-[#1C1B1F] overflow-hidden
                        relative flex items-center justify-center">
          {/* Corner guide marks */}
          {[
            "top-4 left-4 border-t-4 border-l-4 rounded-tl-xl",
            "top-4 right-4 border-t-4 border-r-4 rounded-tr-xl",
            "bottom-4 left-4 border-b-4 border-l-4 rounded-bl-xl",
            "bottom-4 right-4 border-b-4 border-r-4 rounded-br-xl",
          ].map((cls) => (
            <span key={cls} className={`absolute w-8 h-8 border-m3-primary ${cls}`} />
          ))}

          {/* Scan line animation */}
          {!scanMutation.isPending && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-m3-primary/60
                            animate-[scan_2s_ease-in-out_infinite]" />
          )}

          <div className="flex flex-col items-center gap-3 text-center">
            {scanMutation.isPending ? (
              <div className="w-12 h-12 rounded-full border-4 border-m3-primary border-t-transparent animate-spin" />
            ) : (
              <>
                <span className="text-5xl opacity-30">🧾</span>
                <p className="text-white/40 text-sm">Point at your receipt</p>
              </>
            )}
          </div>
        </div>

        {/* Scan quota — M3 linear progress */}
        {user && (
          <div className="bg-m3-surface-container rounded-xl2 px-4 py-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-m3-on-surface">Monthly scans</span>
              <span className={`text-sm font-medium tabular-nums
                                ${isLimitReached ? "text-red-600" : "text-m3-primary"}`}>
                {user.plan === "free" ? `${scansUsed} / ${FREE_SCAN_LIMIT}` : "∞ Unlimited"}
              </span>
            </div>
            {user.plan === "free" && (
              <div className="h-1 bg-m3-outline-variant rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all
                                 ${isLimitReached ? "bg-red-500" : "bg-m3-primary"}`}
                  style={{ width: `${Math.min((scansUsed / FREE_SCAN_LIMIT) * 100, 100)}%` }} />
              </div>
            )}
          </div>
        )}

        {isLimitReached && (
          <div className="bg-red-50 border border-red-200 rounded-xl2 px-4 py-3">
            <p className="text-sm text-red-700">
              Monthly scan limit reached. Upgrade to scan unlimited receipts.
            </p>
          </div>
        )}

        {scanMutation.error && (
          <p className="text-xs text-red-700 bg-red-50 rounded-xl px-4 py-3">
            Scan failed. Please try again.
          </p>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />

        {/* M3 Filled button */}
        <button disabled={isLimitReached || scanMutation.isPending}
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3.5 bg-m3-primary text-m3-on-primary font-medium text-sm
                     rounded-full flex items-center justify-center gap-2
                     transition-all active:opacity-80 disabled:opacity-40">
          {scanMutation.isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              Take Photo
            </>
          )}
        </button>
      </div>
    </AppLayout>
  );
}
