import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

function csvToList(text) {
  return text
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function Settings() {
  const { refreshMe } = useAuth();
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => (await api.get("/user/profile")).data,
  });

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [collegeLocation, setCollegeLocation] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [achievements, setAchievements] = useState("");
  const [certifications, setCertifications] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    const p = profileQuery.data || {};
    setName(p.name || "");
    setAge(p.age != null && p.age !== "" ? String(p.age) : "");
    setCollegeName(p.college || "");
    setCollegeLocation(p.collegeLocation || "");
    setGraduationYear(p.graduation_year || "");
    setDepartment(p.department || "");
    setYear(p.year || "");
    setBio(p.bio || "");
    setSkills((p.skills || []).join(", "));
    setInterests((p.interests || []).join(", "));
    setAchievements((p.achievements || []).join(", "));
    setCertifications((p.certifications || []).join(", "));
    setContactEmail(p.contactEmail || "");
    setContactPhone(p.contactPhone || "");
  }, [profileQuery.data]);

  const saveProfile = useMutation({
    mutationFn: async () =>
      (await api.put("/user/profile", {
        name,
        age,
        college: collegeName,
        collegeLocation,
        graduation_year: graduationYear,
        department,
        year,
        bio,
        skills: csvToList(skills),
        interests: csvToList(interests),
        achievements: csvToList(achievements),
        certifications: csvToList(certifications),
        contactEmail,
        contactPhone,
      })).data,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["userProfile"] });
      await refreshMe(); // Important to refresh auth state just in case name changed
    },
  });

  async function saveAll(e) {
    e.preventDefault();
    await saveProfile.mutateAsync();
  }

  if (profileQuery.isLoading) {
    return (
      <div className="card p-6">
        <div className="text-sm text-slate-300">Loading…</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6">
        <h2 className="font-display text-2xl font-semibold text-white">
          <span className="crimson-gradient">Settings</span>
        </h2>
        <p className="mt-1 text-sm text-slate-300">Update your account name and profile details.</p>

        <form className="mt-6 space-y-4" onSubmit={saveAll}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-300">Full name</label>
              <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-300">Age</label>
              <input className="input mt-1" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 20" />
            </div>
            <div>
              <label className="text-xs text-slate-300">Graduation year</label>
              <input className="input mt-1" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="e.g. 2027" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-300">College name</label>
              <input className="input mt-1" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-300">College location</label>
              <input className="input mt-1" value={collegeLocation} onChange={(e) => setCollegeLocation(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-300">Year of study</label>
              <input className="input mt-1" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-300">Department</label>
              <input className="input mt-1" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-300">Contact email</label>
              <input className="input mt-1" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-300">Contact phone</label>
              <input className="input mt-1" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-300">Bio</label>
              <textarea className="input mt-1 min-h-[88px] resize-none" value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-300">Skills (comma separated)</label>
              <input className="input mt-1" value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-300">Interests (comma separated)</label>
              <input className="input mt-1" value={interests} onChange={(e) => setInterests(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-300">Achievements (comma separated)</label>
              <input className="input mt-1" value={achievements} onChange={(e) => setAchievements(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-300">Certifications (comma separated)</label>
              <input className="input mt-1" value={certifications} onChange={(e) => setCertifications(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn-primary" type="submit" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
