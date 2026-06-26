import type { ReactNode } from "react";
import StatusBar from "./StatusBar";
import BottomNav from "./BottomNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    /* Phone frame — centred on desktop */
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative flex flex-col w-[393px] h-[851px] bg-m3-surface overflow-hidden
                      shadow-2xl rounded-[40px] border border-white/10">
        <StatusBar />

        <main className="flex-1 overflow-y-auto bg-m3-surface">
          {children}
        </main>

        <BottomNav />

        {/* Android gesture home indicator */}
        <div className="h-5 bg-m3-surface-container flex items-center justify-center flex-shrink-0">
          <div className="w-32 h-1 bg-m3-outline-variant rounded-full" />
        </div>
      </div>
    </div>
  );
}
