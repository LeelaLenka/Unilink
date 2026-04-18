import React from "react";

const profileRows = [
  { label: "Name", key: "name" },
  { label: "Age", key: "age" },
  { label: "Graduation Year", key: "graduationYear" },
  { label: "College Name", key: "collegeName" },
  { label: "College Location", key: "collegeLocation" },
  { label: "Year of Study", key: "yearOfStudy" },
  { label: "Department", key: "department" },
  { label: "Email", key: "contactEmail" },
  { label: "Phone", key: "contactPhone" },
  { label: "Bio", key: "bio" },
];

export function ProfileView({ profileData, hasProfileData, onAddProfile, onEditProfile }) {
  if (!hasProfileData) {
    return (
      <div className="card p-6 md:p-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Profile</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-3">Profile incomplete. Please add your details.</p>
        <button type="button" className="btn-primary mt-4" onClick={onAddProfile}>
          Go to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6 md:p-8">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-accent)] border border-[var(--border-color)] flex items-center justify-center text-3xl font-medium text-[var(--text-on-btn)] shadow-lg">
            {profileData.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{profileData.name || "Student"}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{profileData.department || "Student Profile"}</p>
          </div>
        </div>
        <button type="button" className="btn-ghost border border-black/10 text-xs py-1.5" onClick={onEditProfile}>
          Edit Profile
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {profileRows.map((row) => (
          <div key={row.key} className={row.key === "bio" ? "panel md:col-span-2" : "panel"}>
            <div className="text-[11px] font-medium tracking-[0.07em] text-[var(--text-secondary)] uppercase mb-2">{row.label}</div>
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{profileData[row.key] || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
