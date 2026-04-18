import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useParams } from "react-router-dom";

export function AdminDashboard() {
  const qc = useQueryClient();
  const { tab } = useParams();
  const [eventFilter, setEventFilter] = useState("pending");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ["admin"] });
    setTimeout(() => setRefreshing(false), 500);
  }

  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => (await api.get("/admin/users")).data.users,
    enabled: tab === "users",
  });

  const eventsQuery = useQuery({
    queryKey: ["admin", "events"],
    queryFn: async () => (await api.get("/admin/events")).data.events,
    enabled: tab === "events",
  });

  const reportsQuery = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => (await api.get("/admin/reports")).data.reports,
    enabled: tab === "reports",
  });

  const groupsQuery = useQuery({
    queryKey: ["admin", "groups"],
    queryFn: async () => (await api.get("/admin/groups")).data.groups,
    enabled: tab === "groups",
  });

  const approveEvent = useMutation({
    mutationFn: async (eventId) => (await api.patch(`/admin/events/${eventId}/approve`)).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "events"] });
      await qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const rejectEvent = useMutation({
    mutationFn: async (eventId) => (await api.patch(`/admin/events/${eventId}/reject`)).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "events"] });
      await qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId) => (await api.delete(`/admin/users/${userId}`)).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "users"] });
      await qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async (groupId) => (await api.delete(`/admin/groups/${groupId}`)).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "groups"] });
      await qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const header = useMemo(() => {
    if (tab === "users") return { title: "User Management", desc: "View registered accounts and remove users if needed." };
    if (tab === "events") return { title: "Event Approvals", desc: "Review and approve student-submitted events." };
    if (tab === "groups") return { title: "Groups Management", desc: "Monitor groups and remove inappropriate ones." };
    if (tab === "reports") return { title: "Reports Inbox", desc: "Review complaints and reported content from the community." };
    return { title: "Admin Dashboard", desc: "Manage uni network operations, users, events, and reports." };
  }, [tab]);

  function getStatusBadge(status) {
    if (status === "approved") return <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">Approved</span>;
    if (status === "rejected") return <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-xs text-rose-200">Rejected</span>;
    return <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-200">Pending</span>;
  }

  const filteredEvents = eventsQuery.data?.filter(e => eventFilter === "all" || e.status === "pending") || [];
  const filteredUsers = usersQuery.data?.filter(u => userRoleFilter === "all" || u.role === userRoleFilter) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white md:text-3xl">{header.title}</h1>
          <p className="mt-2 text-sm text-slate-300">
            {header.desc}
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-ghost shrink-0 p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.02] border border-white/5"
          title="Refresh data"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={refreshing ? "animate-spin text-crimson-400" : ""}>
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
            <path d="M16 21v-5h5"></path>
          </svg>
        </button>
      </div>

      {!tab && statsQuery.data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-5 border-white/5 shadow-none">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</div>
            <div className="text-3xl font-display font-bold text-white mt-1">{statsQuery.data.totalUsers}</div>
          </div>
          <div className="card p-5 border-white/5 shadow-none">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Events</div>
            <div className="text-3xl font-display font-bold text-white mt-1">{statsQuery.data.totalEvents}</div>
          </div>
          <div className="card p-5">
            <div className="text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-between uppercase tracking-wider">
              <span>Pending Approvals</span>
              {statsQuery.data.pendingEvents > 0 && (
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse"></div>
              )}
            </div>
            <div className="text-3xl font-display font-bold text-[var(--text-accent)] mt-1">
              {statsQuery.data.pendingEvents}
            </div>
          </div>
          <div className="card p-5 border-crimson-500/10 shadow-none">
            <div className="text-xs font-semibold text-crimson-300 flex items-center justify-between uppercase tracking-wider">
              <span>Total Reports</span>
            </div>
            <div className="text-3xl font-display font-bold text-white mt-1">{statsQuery.data.totalReports}</div>
          </div>
        </div>
      ) : null}

      {tab ? (
        <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">Filter & Search</div>
          </div>
          {tab === "events" && (
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg shrink-0">
              <button 
                onClick={() => setEventFilter("pending")} 
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${eventFilter === "pending" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
              >
                Pending only
              </button>
              <button 
                onClick={() => setEventFilter("all")} 
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${eventFilter === "all" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
              >
                All Events
              </button>
            </div>
          )}
          {tab === "users" && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Filter:</span>
              <select 
                value={userRoleFilter} 
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-transparent border border-white/10 rounded-lg text-sm text-white px-2 py-1 outline-none focus:border-crimson-400/50"
              >
                <option value="all" className="bg-ink-900">All Roles</option>
                <option value="student" className="bg-ink-900">Students</option>
                <option value="admin" className="bg-ink-900">Admins</option>
              </select>
            </div>
          )}
        </div>
      ) : null}

      {tab === "users" ? (
        usersQuery.isLoading ? (
          <div className="card p-6 text-sm text-slate-300">Loading users…</div>
        ) : usersQuery.isError ? (
          <div className="card p-6 text-sm text-rose-300">Failed to load users.</div>
        ) : filteredUsers.length ? (
          <div className="card overflow-hidden p-0 border-white/5 border border-x-0 sm:border-x shadow-none">
            <div className="grid grid-cols-[1.5fr,2fr,1fr,1fr,120px] gap-0 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold tracking-[0.22em] text-slate-300">
              <div>NAME</div>
              <div>EMAIL</div>
              <div>ROLE</div>
              <div>STATUS</div>
              <div className="text-right">ACTION</div>
            </div>
            <div className="divide-y divide-white/10">
              {filteredUsers.map((u) => (
                <div key={u._id} className="grid grid-cols-[1.5fr,2fr,1fr,1fr,120px] items-center px-4 py-3 gap-0">
                  <div className="text-sm text-white truncate pr-2">{u.name}</div>
                  <div className="text-sm text-slate-300 truncate pr-2">{u.email}</div>
                  <div className="text-sm text-slate-300 capitalize">{u.role}</div>
                  <div><span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-200 whitespace-nowrap">Active</span></div>
                  <div className="text-right">
                    {u.role !== "admin" && (
                      <button
                        className="btn-ghost text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 px-2 py-1"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this user?")) {
                            deleteUser.mutate(u._id);
                          }
                        }}
                        disabled={deleteUser.isPending}
                        title="Delete user"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center text-slate-300 shadow-none border-dashed border-white/20 bg-transparent">
            <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="text-sm font-medium text-white mb-1">No users found</div>
            <div className="text-sm">There are no users matching your current role filter.</div>
          </div>
        )
      ) : null}

      {tab === "events" ? (
        eventsQuery.isLoading ? (
          <div className="card p-6 text-sm text-slate-300">Loading events…</div>
        ) : eventsQuery.isError ? (
          <div className="card p-6 text-sm text-rose-300">Failed to load events.</div>
        ) : filteredEvents.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEvents.map((e) => (
              <div key={e._id} className="card p-5 bg-white/[0.02] border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-sm font-semibold text-white truncate">{e.eventName}</div>
                      {getStatusBadge(e.status)}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                       <span className="text-xs text-slate-400">{new Date(e.date).toLocaleString()}</span>
                    </div>
                    {e.location ? <div className="mt-3 text-sm text-slate-300 truncate">Location: {e.location}</div> : null}
                    <div className="mt-2 text-sm text-slate-300 flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      {e.createdBy?.name || "Unknown"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {e.status !== "approved" && (
                      <button 
                        className="btn-primary whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 py-1.5 px-3" 
                        onClick={() => approveEvent.mutate(e._id)} 
                        disabled={approveEvent.isPending || rejectEvent.isPending}
                      >
                        Approve
                      </button>
                    )}
                    {e.status !== "rejected" && (
                      <button 
                        className="btn-ghost whitespace-nowrap text-rose-400 hover:bg-rose-500/10 hover:text-rose-200 border-rose-500/20 ring-1 ring-rose-500/20 py-1.5 px-3 border-white/5" 
                        onClick={() => rejectEvent.mutate(e._id)} 
                        disabled={approveEvent.isPending || rejectEvent.isPending}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center text-slate-300 shadow-none border-dashed border-white/20 bg-transparent">
            <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className="text-sm font-medium text-white mb-1">You're all caught up!</div>
            <div className="text-sm">No events found matching your filter.</div>
          </div>
        )
      ) : null}

      {tab === "groups" ? (
        groupsQuery.isLoading ? (
          <div className="card p-6 text-sm text-slate-300">Loading groups…</div>
        ) : groupsQuery.isError ? (
          <div className="card p-6 text-sm text-rose-300">Failed to load groups.</div>
        ) : groupsQuery.data && groupsQuery.data.length ? (
          <div className="card overflow-hidden p-0 border-white/5 border border-x-0 sm:border-x shadow-none">
            <div className="grid grid-cols-[2fr,1fr,1.5fr,120px] gap-0 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold tracking-[0.22em] text-slate-300">
              <div>GROUP NAME</div>
              <div>MEMBERS</div>
              <div>CREATED BY</div>
              <div className="text-right">ACTION</div>
            </div>
            <div className="divide-y divide-white/10">
              {groupsQuery.data.map((g) => (
                <div key={g._id} className="grid grid-cols-[2fr,1fr,1.5fr,120px] items-center px-4 py-3 gap-0">
                  <div className="text-sm text-white truncate pr-2 font-medium">{g.groupName}</div>
                  <div className="text-sm text-slate-300">{g.members?.length || 0}</div>
                  <div className="text-sm text-slate-300 truncate pr-2">{g.createdBy?.name || "Unknown"}</div>
                  <div className="text-right">
                    <button
                      className="btn-ghost text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 px-2 py-1"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this group?")) {
                          deleteGroup.mutate(g._id);
                        }
                      }}
                      disabled={deleteGroup.isPending}
                      title="Delete group"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center text-slate-300 shadow-none border-dashed border-white/20 bg-transparent">
            <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="text-sm font-medium text-white mb-1">No groups found</div>
            <div className="text-sm">There are no groups created by users yet.</div>
          </div>
        )
      ) : null}

      {tab === "reports" ? (
        reportsQuery.isLoading ? (
          <div className="card p-6 text-sm text-slate-300">Loading reports…</div>
        ) : reportsQuery.isError ? (
          <div className="card p-6 text-sm text-rose-300">Failed to load reports.</div>
        ) : reportsQuery.data?.length ? (
          <div className="grid gap-4">
            {reportsQuery.data.map((r, i) => (
              <div key={i} className="card p-5 bg-white/[0.02] border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="chip text-[10px] uppercase bg-rose-500/10 text-rose-300 border-rose-500/20">{r.type || "Spam"}</span>
                       <span className="text-sm font-semibold text-white">Reported: {r.target || "User"}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{r.description || "Inappropriate conduct flagged by community."}</div>
                    <div className="mt-2 text-xs text-slate-400">Reported by: {r.reportedBy || "Anonymous"}</div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                     <button className="btn-ghost text-xs text-slate-400 hover:text-white px-2 py-1">Ignore</button>
                     <button className="btn-ghost text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-200 px-2 py-1 border border-rose-500/20">Remove Content</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center text-slate-300 shadow-none border-dashed border-white/20 bg-transparent">
            <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div className="text-sm font-medium text-white mb-1">No reports yet</div>
            <div className="text-sm">The community is quiet. No complaints or reports have been filed.</div>
          </div>
        )
      ) : null}
    </div>
  );
}
