import React, { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ProfileView } from "../components/ProfileView";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export function Profile() {
  const { me } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const profileQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => (await api.get("/user/profile")).data,
  });

  const p = profileQuery.data || me?.user || {};

  const connectionsQuery = useQuery({
    queryKey: ["connections"],
    queryFn: async () => (await api.get("/connections")).data.connections,
  });

  const incomingQuery = useQuery({
    queryKey: ["incoming_requests"],
    queryFn: async () => (await api.get("/connections/requests/incoming")).data.requests,
  });

  const respond = useMutation({
    mutationFn: async ({ requestId, action }) =>
      (await api.post(`/connections/requests/${requestId}/respond`, { action })).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["incoming_requests"] });
      await qc.invalidateQueries({ queryKey: ["connections"] });
    },
  });

  const profileData = useMemo(
    () => ({
      name: p.name || "",
      age: p.age != null ? String(p.age) : "",
      graduationYear: p.graduation_year || "",
      collegeName: p.college || "",
      collegeLocation: p.collegeLocation || "",
      yearOfStudy: p.year || "",
      department: p.department || "",
      contactEmail: p.contactEmail || "",
      contactPhone: p.contactPhone || "",
      bio: p.bio || "",
    }),
    [p],
  );

  const hasProfileData = useMemo(
    () => Object.values(profileData).some((value) => String(value || "").trim() !== ""),
    [profileData],
  );

  if (profileQuery.isLoading) {
    return (
      <div className="card p-6">
        <div className="text-sm text-slate-300">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
      <div className="space-y-4">
        <ProfileView
          profileData={profileData}
          hasProfileData={hasProfileData}
          onAddProfile={() => navigate("/settings")}
          onEditProfile={() => navigate("/settings")}
        />
      </div>

      <aside className="space-y-4">
        <div className="card p-4">
          <div className="text-sm font-medium text-[var(--text-primary)]">Incoming requests</div>
          <div className="mt-3 space-y-2">
            {incomingQuery.isLoading ? (
              <div className="text-sm text-[var(--text-hint)]">Loading...</div>
            ) : incomingQuery.data?.length ? (
              incomingQuery.data.map((r) => (
                <div key={r._id} className="panel">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{r.fromUser?.name || "Student"}</div>
                  <div className="mt-2 flex gap-2">
                    <button
                      className="flex-1 justify-center rounded-xl px-3 py-1.5 text-sm font-medium transition bg-[var(--color-accent)] hover:bg-[var(--color-accent)] text-[var(--text-on-btn)]"
                      onClick={() => respond.mutate({ requestId: r._id, action: "accept" })}
                      disabled={respond.isPending}
                    >
                      Accept
                    </button>
                    <button
                      className="flex-1 justify-center rounded-xl px-3 py-1.5 text-sm font-medium transition bg-[var(--bg-input)] hover:bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)]"
                      onClick={() => respond.mutate({ requestId: r._id, action: "reject" })}
                      disabled={respond.isPending}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-[var(--text-hint)]">No new requests.</div>
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-medium text-[var(--text-primary)]">My connections</div>
          <div className="mt-3 space-y-2">
            {connectionsQuery.isLoading ? (
              <div className="text-sm text-[var(--text-hint)]">Loading...</div>
            ) : connectionsQuery.data?.length ? (
              connectionsQuery.data.map((u) => (
                <div key={u._id} className="panel flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{u.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{u.email}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-[var(--text-hint)]">No connections yet.</div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
