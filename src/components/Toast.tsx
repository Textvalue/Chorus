"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { IconCheck } from "./Icons";

const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState("");
  const [on, setOn] = useState(false);

  const toast = useCallback((m: string) => {
    setMsg(m);
    setOn(true);
    window.clearTimeout((window as unknown as { __t?: number }).__t);
    (window as unknown as { __t?: number }).__t = window.setTimeout(() => setOn(false), 2600);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className={`toast${on ? " on" : ""}`}>
        <IconCheck />
        <span>{msg}</span>
      </div>
    </ToastCtx.Provider>
  );
}
