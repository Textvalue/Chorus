"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr("");
    setBusy(true);
    try {
      if (isRegister) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not create account.");
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        throw new Error(isRegister ? "Account created, but sign-in failed. Try logging in." : "Wrong email or password.");
      }
      router.push("/");
      router.refresh();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Image
            src="/brand/spark.png"
            alt="Tutti"
            width={34}
            height={34}
            style={{ height: 34, width: "auto", mixBlendMode: "multiply", margin: "0 auto 14px" }}
          />
          <h1 className="ch" style={{ marginBottom: 6 }}>
            {isRegister ? "Create your workspace" : "Welcome back"}
          </h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            {isRegister ? "Your team. In tune. Start in a minute." : "Sign in to your Tutti workspace."}
          </p>
        </div>

        <form className="card" style={{ padding: 24 }} onSubmit={submit}>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email" type="email" className="field" autoComplete="email" required
            placeholder="you@company.com" value={email}
            onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 14 }}
          />
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password" type="password" className="field"
            autoComplete={isRegister ? "new-password" : "current-password"} required
            placeholder={isRegister ? "At least 8 characters" : "Your password"} value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {err && <p style={{ color: "var(--amber-500, #b45309)", fontSize: 13, marginTop: 14, marginBottom: 0 }}>{err}</p>}

          <button className="btn pri lg" type="submit" disabled={busy} style={{ width: "100%", marginTop: 18 }}>
            {busy ? <span className="spinner" /> : null}
            {isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, marginTop: 18 }}>
          {isRegister ? (
            <>Already have an account? <Link href="/login" style={{ color: "var(--action-primary)", fontWeight: 600 }}>Sign in</Link></>
          ) : (
            <>New to Tutti? <Link href="/register" style={{ color: "var(--action-primary)", fontWeight: 600 }}>Create a workspace</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
