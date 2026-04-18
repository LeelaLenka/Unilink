import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function RequireAuth({ children, allowAdmin = false }) {
  const { me, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="card p-6">
        <div className="text-sm text-slate-300">Loading…</div>
      </div>
    );
  }

  if (!me?.user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!allowAdmin && me.user.role === "admin") return <Navigate to="/admin" replace />;
  return children;
}

