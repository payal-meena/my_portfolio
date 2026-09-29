import { useEffect, useState } from "react";
import { api, assetUrl } from "../api";

const CONFIG = {
  skills: [["category", "Category"], ["items", "Items (comma separated)", "list"], ["order", "Order (1, 2, 3...)", "number"]],
  projects: [
    ["title", "Title"], ["description", "Description", "area"], ["techStack", "Tech stack (comma separated)", "list"],
    ["liveUrl", "Live URL"], ["repoUrl", "Repo URL"], ["order", "Order (1, 2, 3...)", "number"],
  ],
  education: [["title", "Title"], ["detail", "Detail"], ["order", "Order (1, 2, 3...)", "number"]],
};

const BASIC = [
  ["name", "Name"], ["initials", "Initials (avatar)"], ["title", "Title under name"], ["heroHeading", "Hero heading"],
  ["heroText", "Hero text", "area"], ["aboutText", "About text", "area"], ["email", "Email"], ["github", "GitHub URL"],
  ["linkedin", "LinkedIn URL"], ["contactText", "Contact text", "area"], ["photoUrl", "Photo URL"], ["resumeUrl", "Resume URL"],
];

// list every text path inside siteText, e.g. "siteText.nav.about"
const leaves = (o, prefix) =>
  Object.entries(o || {}).flatMap(([k, v]) => (v && typeof v === "object" ? leaves(v, `${prefix}.${k}`) : [`${prefix}.${k}`]));

function Input({ label, area, ...props }) {
  return <label>{label}{area ? <textarea rows="4" {...props} /> : <input {...props} />}</label>;
}

function Login({ onLogin }) {
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const { token } = await api("/api/auth/login", { method: "POST", body: Object.fromEntries(new FormData(e.target)) });
      localStorage.setItem("token", token);
      onLogin();
    } catch (x) {
      setErr(x.message);
    }
  };
  return (
    <form className="card adm-login" onSubmit={submit}>
      <h2>Admin Login</h2>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button className="btn btn-primary">Login</button>
      {err && <p className="adm-err">{err}</p>}
    </form>
  );
}

function ProfileEditor() {
  const [p, setP] = useState(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { api("/api/profile").then(setP); }, []);
  if (!p) return <p>Loading...</p>;

  const get = (path) => path.split(".").reduce((o, k) => o?.[k], p) ?? "";
  const setPath = (path, val) =>
    setP((prev) => {
      const n = structuredClone(prev);
      const ks = path.split(".");
      let o = n;
      ks.slice(0, -1).forEach((k) => (o = o[k]));
      o[ks[ks.length - 1]] = val;
      return n;
    });
  const setStat = (i, key, val) => setP({ ...p, stats: p.stats.map((s, j) => (j === i ? { ...s, [key]: val } : s)) });

  const upload = async (kind, file) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const { url } = await api(`/api/files/${kind}`, { method: "POST", form });
      setPath(kind === "photo" ? "photoUrl" : "resumeUrl", url);
      setMsg(`${kind} uploaded`);
    } catch (e) {
      setMsg(e.message);
    }
  };
  const save = async () => {
    try { setP(await api("/api/profile", { method: "PUT", body: p })); setMsg("Saved"); }
    catch (e) { setMsg(e.message); }
  };

  const field = ([path, label, type]) => (
    <Input key={path} label={label} area={type === "area"} value={get(path)} onChange={(e) => setPath(path, e.target.value)} />
  );

  return (
    <div className="adm-item">
      <div className="card adm-item">
        <h3>Main details</h3>
        {BASIC.map(field)}
        <div className="adm-row">
          <img src={assetUrl(p.photoUrl)} alt="" width="70" height="70" style={{ borderRadius: 10, objectFit: "cover" }} />
          <label>Upload photo (JPG, PNG, WEBP, max 5MB)<input type="file" accept="image/*" onChange={(e) => upload("photo", e.target.files[0])} /></label>
        </div>
        <label>Upload resume (PDF, max 5MB)<input type="file" accept="application/pdf" onChange={(e) => upload("resume", e.target.files[0])} /></label>
      </div>

      <div className="card adm-item">
        <h3>Stats</h3>
        {p.stats.map((s, i) => (
          <div className="adm-row" key={i}>
            <input value={s.value} placeholder="Value" onChange={(e) => setStat(i, "value", e.target.value)} />
            <input value={s.label} placeholder="Label" onChange={(e) => setStat(i, "label", e.target.value)} />
            <button className="btn" onClick={() => setP({ ...p, stats: p.stats.filter((_, j) => j !== i) })}>Remove</button>
          </div>
        ))}
        <button className="btn" onClick={() => setP({ ...p, stats: [...p.stats, { value: "", label: "" }] })}>+ Add stat</button>
      </div>

      <div className="card adm-item">
        <h3>All other site text (menu, headings, buttons, placeholders, footer)</h3>
        {leaves(p.siteText, "siteText").map((path) => field([path, path.replace("siteText.", "")]))}
      </div>

      <div className="adm-row"><button className="btn btn-primary" onClick={save}>Save all</button><span className="adm-msg">{msg}</span></div>
    </div>
  );
}

function ItemForm({ res, fields, item, onDone }) {
  const [f, setF] = useState(() =>
    Object.fromEntries(fields.map(([k, , t]) => [k, t === "list" ? (item[k] || []).join(", ") : item[k] ?? ""]))
  );
  const body = () =>
    Object.fromEntries(fields.map(([k, , t]) => [k,
      t === "list" ? f[k].split(",").map((s) => s.trim()).filter(Boolean) : t === "number" ? Number(f[k]) || 0 : f[k]]));
  const save = async () => {
    try {
      await api(item._id ? `/api/${res}/${item._id}` : `/api/${res}`, { method: item._id ? "PUT" : "POST", body: body() });
      onDone("Saved");
    } catch (e) { onDone(e.message); }
  };
  const del = async () => {
    if (item._id) {
      if (!confirm("Delete this item?")) return;
      try { await api(`/api/${res}/${item._id}`, { method: "DELETE" }); } catch (e) { return onDone(e.message); }
    }
    onDone("Removed");
  };
  return (
    <div className="card adm-item">
      {fields.map(([k, label, t]) => (
        <Input key={k} label={label} area={t === "area"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
      ))}
      <div className="adm-row">
        <button className="btn btn-primary" onClick={save}>{item._id ? "Save" : "Create"}</button>
        <button className="btn" onClick={del}>{item._id ? "Delete" : "Cancel"}</button>
      </div>
    </div>
  );
}

function ListEditor({ res }) {
  const [items, setItems] = useState(null);
  const [msg, setMsg] = useState("");
  const load = () => api(`/api/${res}`).then(setItems);
  useEffect(() => { setItems(null); load(); }, [res]);
  if (!items) return <p>Loading...</p>;
  return (
    <div>
      <div className="adm-row">
        <button className="btn btn-primary" onClick={() => setItems([{ _tmp: Date.now() }, ...items])}>+ Add new</button>
        <span className="adm-msg">{msg}</span>
      </div>
      {items.map((it) => (
        <ItemForm key={it._id || it._tmp} res={res} fields={CONFIG[res]} item={it} onDone={(m) => { setMsg(m); load(); }} />
      ))}
    </div>
  );
}

function Messages() {
  const [m, setM] = useState(null);
  const load = () => api("/api/messages").then(setM);
  useEffect(() => { load(); }, []);
  if (!m) return <p>Loading...</p>;
  if (!m.length) return <p className="muted">No messages yet.</p>;
  return m.map((x) => (
    <div className="card adm-item" key={x._id} style={{ opacity: x.isRead ? 0.6 : 1 }}>
      <div><b>{x.name}</b> · <a href={`mailto:${x.email}`}>{x.email}</a></div>
      <div className="muted">{new Date(x.createdAt).toLocaleString()}</div>
      <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{x.message}</p>
      <div className="adm-row">
        <button className="btn" onClick={async () => { await api(`/api/messages/${x._id}/read`, { method: "PATCH", body: { isRead: !x.isRead } }); load(); }}>
          {x.isRead ? "Mark unread" : "Mark read"}
        </button>
        <button className="btn" onClick={async () => { if (confirm("Delete this message?")) { await api(`/api/messages/${x._id}`, { method: "DELETE" }); load(); } }}>Delete</button>
      </div>
    </div>
  ));
}

const TABS = ["Profile", "Skills", "Projects", "Education", "Messages"];

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState("Profile");
  useEffect(() => { api("/api/auth/me").catch(() => {}); }, []); // logs out automatically if the token expired
  return (
    <div className="adm-wrap">
      <div className="adm-row" style={{ justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Admin Panel</h2>
        <div className="adm-row">
          <a href="/">View site</a>
          <button className="btn" onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div className="adm-tabs">
        {TABS.map((t) => <button key={t} className={`btn ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {tab === "Profile" && <ProfileEditor />}
      {tab === "Messages" && <Messages />}
      {CONFIG[tab.toLowerCase()] && <ListEditor res={tab.toLowerCase()} />}
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
  if (!authed) return <Login onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => { localStorage.removeItem("token"); setAuthed(false); }} />;
}
