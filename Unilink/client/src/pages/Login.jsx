import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function Login() {
  const { login, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);

  useEffect(() => {
    if (!location.state?.loggedOut) return;
    setLoggedOutNotice(true);
    navigate("/login", { replace: true, state: {} });
  }, [location.state, navigate]);

  useEffect(() => {
    if (!loggedOutNotice) return;
    const t = setTimeout(() => setLoggedOutNotice(false), 4000);
    return () => clearTimeout(t);
  }, [loggedOutNotice]);

  useEffect(() => {
    const id = location.hash?.replace("#", "");
    if (!id) return;
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(t);
  }, [location.hash]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await login(email, password, rememberMe);
      const role = result?.user?.role;
      const isNew = Boolean(result?.isProfileIncomplete);
      sessionStorage.setItem(
        "unilink_welcome",
        JSON.stringify({ kind: isNew ? "new" : "return", name: result?.user?.name || "" }),
      );
      const fallback = role === "admin" ? "/admin" : "/home";
      navigate(from || fallback, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setBusy(true);
    try {
      const result = await loginGoogle();
      const role = result?.user?.role;
      const isNew = Boolean(result?.isProfileIncomplete);
      sessionStorage.setItem(
        "unilink_welcome",
        JSON.stringify({ kind: isNew ? "new" : "return", name: result?.user?.name || "" }),
      );
      const fallback = role === "admin" ? "/admin" : "/home";
      navigate(from || fallback, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || "Google Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="unilink-login grid min-h-[calc(100vh-140px)] w-full lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        {loggedOutNotice ? (
          <div className="mx-auto mb-6 w-full max-w-md">
            <div
              className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-100"
              role="status"
            >
              Successfully logged out.
            </div>
          </div>
        ) : null}
        
        <div className="mx-auto w-full max-w-md">
          <div className="card p-6 md:p-8">
            <h2 className="font-display text-2xl font-semibold text-white">
              Welcome <span className="crimson-gradient">back</span>
            </h2>
            <p className="mt-1 text-sm text-slate-300">Login to your UniLink account.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="text-xs font-medium text-slate-300">Email</label>
                <input className="input mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Password</label>
                <div className="relative mt-1.5">
                  <input
                    className="input pr-11"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 grid w-9 place-items-center rounded-lg text-slate-400 hover:text-white"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
              
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  className="rounded border-white/20 bg-white/[0.04] text-crimson-500 focus:ring-crimson-500/50"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-300 select-none cursor-pointer">Remember me for 30 days</label>
              </div>

              {error ? <div className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</div> : null}
              <button className="btn-primary mt-2 w-full py-2.5" disabled={busy}>
                {busy ? "Logging in…" : "Login"}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
              <div className="flex-1 border-t border-white/10"></div>
              <span>OR</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              className="btn-ghost mt-6 w-full py-2.5 gap-3 border border-white/10 hover:bg-white/[0.08]"
              disabled={busy}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
              Continue with Google
            </button>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-2 text-sm">
              <Link className="text-crimson-200 hover:text-crimson-100" to="/forgot-password">
                Forgot password?
              </Link>
              <span className="text-slate-600">|</span>
              <Link className="font-medium text-slate-300 hover:text-white" to="/register">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="unilink-login-panel hidden lg:block relative rounded-3xl overflow-hidden border border-white/10 bg-ink-900 mx-4 my-8 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-br from-crimson-500/20 via-ink-900 to-ink-950"></div>
        <div className="absolute inset-0 unilink-campus-illustration"></div>
        <div className="absolute inset-0 unilink-right-logo-watermark" aria-hidden="true"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"></div>
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <div className="inline-flex rounded-full border border-crimson-400/30 bg-crimson-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-crimson-200 mb-4">
            NETWORK OF THE FUTURE
          </div>
          <h3 className="text-4xl font-display font-extrabold text-white leading-tight">
            Connect with your campus community.
          </h3>
          <p className="mt-5 text-lg text-slate-300 max-w-md">
            Experience the central hub for events, groups, academic discussions and campus life.
          </p>
          <div className="grid grid-cols-3 gap-5 mt-8 pt-6 border-t border-white/10 max-w-md">
            <div>
              <div className="text-2xl font-display font-bold text-white">500+</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Students</div>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-white">120+</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Events</div>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-white">50+</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Groups</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

