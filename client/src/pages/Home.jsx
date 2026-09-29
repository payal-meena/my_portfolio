import { useEffect, useState } from "react";
import { api, assetUrl } from "../api";

function Contact({ p }) {
  const t = p.siteText;
  const [status, setStatus] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setStatus("Sending...");
    try {
      await api("/api/messages", { method: "POST", body: Object.fromEntries(new FormData(form)) });
      form.reset();
      setStatus("Message sent. Thank you!");
    } catch (err) {
      setStatus(err.message);
    }
  };
  return (
    <section id="contact" className="card fade-slide">
      <h2>{t.headings.contact}</h2>
      <p className="muted">{p.contactText}</p>
      <form style={{ display: "grid", gap: 10, marginTop: 10 }} onSubmit={submit}>
        <input className="field" name="name" required placeholder={t.form.namePlaceholder} />
        <input className="field" name="email" type="email" required placeholder={t.form.emailPlaceholder} />
        <textarea className="field" name="message" required rows="5" placeholder={t.form.messagePlaceholder} />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" type="submit">{t.buttons.sendMessage}</button>
          <button className="btn" type="reset">{t.buttons.reset}</button>
        </div>
        {status && <p className="muted">{status}</p>}
      </form>
    </section>
  );
}

export default function Home() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    Promise.all([api("/api/profile"), api("/api/skills"), api("/api/projects"), api("/api/education")])
      .then(([profile, skills, projects, education]) => setD({ profile, skills, projects, education }))
      .catch(() => setErr("Could not load the portfolio. Please refresh in a moment."));
  }, []);

  useEffect(() => {
    if (!d) return;
    document.title = d.profile.siteText.metaTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", d.profile.siteText.metaDescription);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("show");
        io.unobserve(en.target);
      }),
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".fade-slide").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [d]);

  if (err) return <p className="muted" style={{ padding: 30 }}>{err}</p>;
  if (!d) return <p className="muted" style={{ padding: 30 }}>Loading...</p>;

  const { profile: p, skills, projects, education } = d;
  const t = p.siteText;
  const links = [["about", t.nav.about], ["skills", t.nav.skills], ["projects", t.nav.projects], ["education", t.nav.education], ["contact", t.nav.contact]];

  return (
    <div className="container">
      <header>
        <div className="brand">
          <div className="avatar">{p.initials}</div>
          <div>
            <div style={{ fontWeight: 700 }}>{p.name}</div>
            <div className="muted" style={{ fontSize: 13 }}>{p.title}</div>
          </div>
        </div>
        <div className="hamburger" onClick={() => setOpen(!open)}><span></span><span></span><span></span></div>
        <nav id="navbar" className={open ? "active" : ""} onClick={() => setOpen(false)}>
          {links.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-left card intro">
            <h1 className="fade-slide">{p.heroHeading}</h1>
            <p className="fade-slide">{p.heroText}</p>
            <div className="cta fade-slide">
              <a className="btn btn-primary" href="#projects">{t.buttons.viewProjects}</a>
              <a className="btn" href={assetUrl(p.resumeUrl)} target="_blank" rel="noreferrer">{t.buttons.downloadResume}</a>
            </div>
            <div className="stats fade-slide">
              {p.stats.map((s) => (
                <div className="stat" key={s._id || s.label}><b>{s.value}</b><span className="muted">{s.label}</span></div>
              ))}
            </div>
            <div className="socials fade-slide">
              <a href={`mailto:${p.email}`} className="btn">{t.buttons.email}</a>
              <a href={p.github} className="btn" target="_blank" rel="noreferrer">{t.buttons.github}</a>
              <a href={p.linkedin} className="btn" target="_blank" rel="noreferrer">{t.buttons.linkedin}</a>
            </div>
          </div>
          <div className="hero-right"><img src={assetUrl(p.photoUrl)} alt={p.name} /></div>
        </section>

        <section id="about" className="card fade-slide">
          <h2>{t.headings.about}</h2>
          <p className="muted">{p.aboutText}</p>
        </section>

        <section id="skills" className="fade-slide">
          <h2>{t.headings.skills}</h2>
          <div className="grid-4">
            {skills.map((s) => (
              <div className="skill fade-slide" key={s._id}>
                <strong>{s.category}</strong>
                <div className="muted">{s.items.join(", ")}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="projects">
          <h2 className="fade-slide">{t.headings.projects}</h2>
          <div className="projects">
            {projects.map((pr) => (
              <article className="proj fade-slide" key={pr._id}>
                <h3>{pr.title}</h3>
                <p>{pr.description}</p>
                <div className="tags">{pr.techStack.map((x) => <span className="tag" key={x}>{x}</span>)}</div>
                <div style={{ marginTop: 10 }}>
                  {pr.liveUrl && <a href={pr.liveUrl}>{t.buttons.visit}</a>}
                  {pr.repoUrl && <a href={pr.repoUrl}>{t.buttons.viewRepo}</a>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="education" className="card fade-slide">
          <h2>{t.headings.education}</h2>
          {education.map((e) => (
            <div className="row fade-slide" key={e._id}>
              <div><strong>{e.title}</strong><div className="muted">{e.detail}</div></div>
            </div>
          ))}
        </section>

        <Contact p={p} />

        <footer>{t.footer.text} <span className="muted">{t.footer.name}</span></footer>
      </main>
    </div>
  );
}
