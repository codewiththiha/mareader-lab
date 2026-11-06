import { useCallback, useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";
import { Nav, Footer } from "./components/Chrome";
import { Hero } from "./components/Hero";
import { Engines } from "./components/Engines";
import { Redraws } from "./components/Redraws";
import { Ledger } from "./components/Ledger";
import { Lab } from "./components/Lab";

interface Toast {
  msg: string;
  key: number;
}

export default function App() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [labId, setLabId] = useState<string | null>(null);

  const notify = useCallback((msg: string) => {
    setToast({ msg, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const openLab = useCallback((id: string) => {
    setLabId(id);
    requestAnimationFrame(() => {
      document.getElementById("lab")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <div className="grain min-h-screen bg-ink font-body text-paper">
      <Nav />
      <main>
        <Hero />
        <Engines notify={notify} />
        <Redraws notify={notify} />
        <Ledger notify={notify} openLab={openLab} />
        <Lab labId={labId} notify={notify} />
      </main>
      <Footer />

      {toast && (
        <div
          key={toast.key}
          className="toast-in fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-amber/50 bg-ink3 px-5 py-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.6)]"
        >
          <CircleCheck size={15} className="text-amber" />
          <span className="whitespace-nowrap text-[12.5px] font-medium text-paper">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
