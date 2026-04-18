import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [tokenInfo, setTokenInfo] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setTokenInfo(null);
    setBusy(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMsg(data.message || "Check your email.");
      if (data.resetToken) {
        setTokenInfo({ token: data.resetToken, expiresAt: data.expiresAt });
      }
    } catch (err) {
      setMsg(err?.response?.data?.error || "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h2 className="font-display text-2xl font-semibold text-white">
          <span className="crimson-gradient">Forgot password</span>
        </h2>
        <p className="mt-1 text-sm text-slate-300">Enter your account email. We’ll give you a reset token (demo mode).</p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {msg ? <div className="text-sm text-slate-300">{msg}</div> : null}
          {tokenInfo ? (
            <div className="rounded-xl border border-crimson-400/20 bg-crimson-500/10 p-3 text-xs text-slate-200">
              <div className="font-medium text-white">Reset token (copy for next step)</div>
              <div className="mt-2 break-all font-mono text-crimson-100">{tokenInfo.token}</div>
              <Link className="mt-3 inline-block text-crimson-200 hover:text-crimson-100" to={`/reset-password?token=${encodeURIComponent(tokenInfo.token)}`}>
                Open reset page →
              </Link>
            </div>
          ) : null}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-300">
          <Link className="text-crimson-200 hover:text-crimson-100" to="/login">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
