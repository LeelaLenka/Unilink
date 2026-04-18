import React from "react";
import { NavLink } from "react-router-dom";

function Item({ to, children, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-crimson-500/20 text-white ring-1 ring-crimson-400/25"
            : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export function SidebarNav({ role }) {
  if (role === "admin") {
    return (
      <nav className="flex flex-col gap-1 p-3">
        <div className="px-2 pb-2 text-xs font-semibold tracking-[0.2em] text-slate-500">ADMIN MENU</div>
        <Item to="/admin" end>Dashboard</Item>
        <Item to="/admin/users">Users</Item>
        <Item to="/admin/events">Events Queue</Item>
        <Item to="/admin/groups">Groups</Item>
        <Item to="/admin/reports">Reports</Item>
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1 p-3">
      <div className="px-2 pb-2 text-xs font-semibold tracking-[0.2em] text-slate-500">MENU</div>
      <Item to="/home">Dashboard</Item>
      <Item to="/feed">Feed</Item>
      <Item to="/events">Events</Item>
      <Item to="/groups">Groups</Item>
      <Item to="/people">People</Item>
      <Item to="/profile">Profile</Item>
      <div className="my-2 border-t border-white/10" />
      <Item to="/settings">Settings</Item>
    </nav>
  );
}
