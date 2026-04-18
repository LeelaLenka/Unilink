import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function RoleHome() {
  const { me, loading } = useAuth();

  if (loading) {
    return (
      <div className="card p-6">
        <div className="text-sm text-slate-300">Loading…</div>
      </div>
    );
  }

  if (!me?.user) return <Navigate to="/login" replace />;
  if (me.user.role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/home" replace />;
}

