import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    timezone: user?.timezone || "",
  });
  const [saved, setSaved] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.patch("/users/me", form);
    setUser(res.data);
    localStorage.setItem("sprout_user", JSON.stringify(res.data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="pt-6 max-w-md">
      <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>Your profile</h1>

      <form onSubmit={submit} className="grid gap-3 mt-5">
        <label className="text-sm" style={{ color: "var(--text-muted)" }}>
          Name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </label>

        <label className="text-sm" style={{ color: "var(--text-muted)" }}>
          Bio
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </label>

        <label className="text-sm" style={{ color: "var(--text-muted)" }}>
          Timezone
          <input
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            placeholder="e.g. Asia/Kolkata"
            className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </label>

        <div className="flex items-center gap-3 mt-2">
          <button
            type="submit"
            className="font-display font-bold text-sm px-4 py-2.5 rounded-full"
            style={{ background: "#FF8B6B", color: "#3A1F16" }}
          >
            Save changes
          </button>
          {saved && <span className="text-sm" style={{ color: "#8FBE7A" }}>Saved.</span>}
        </div>
      </form>
    </div>
  );
}
