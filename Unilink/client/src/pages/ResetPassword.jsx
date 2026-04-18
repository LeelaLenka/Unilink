import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export function ResetPassword() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const initialToken = useMemo(() => search.get("token") || "", [search]);

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      const { data } = await api.post("/auth/reset-password", { token, password });
      setMsg(data.message || "Password updated.");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setMsg(err?.response?.data?.error || "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h2 className="font-display text-2xl font-semibold text-white">
          <span className="crimson-gradient">Reset password</span>
        </h2>
        <p className="mt-1 text-sm text-slate-300">Paste the token from the forgot-password step and choose a new password.</p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-xs text-slate-300">Reset token</label>
            <input className="input mt-1 font-mono text-xs" value={token} onChange={(e) => setToken(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-300">New password</label>
            <div className="relative mt-1">
              <input
                className="input pr-11"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 grid w-9 place-items-center text-slate-300 hover:text-white"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                    <path
                      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                    <path
                      d="M4 4l16 16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                    <path
                      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {msg ? <div className="text-sm text-slate-300">{msg}</div> : null}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
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
