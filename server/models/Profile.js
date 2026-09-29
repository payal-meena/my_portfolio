const mongoose = require("mongoose");

// Every string below defaults to the exact text from the original index.html,
// so the site is complete even before anything is edited in the admin panel.
const s = (def) => ({ type: String, trim: true, default: def });

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    initials: { type: String, trim: true },
    title: { type: String, trim: true },
    heroHeading: { type: String, trim: true },
    heroText: { type: String, trim: true },
    aboutText: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    resumeUrl: { type: String, trim: true },
    email: { type: String, trim: true },
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    contactText: { type: String, trim: true },
    stats: [{ value: String, label: String }],

    siteText: {
      metaTitle: s("My Portfolio"),
      metaDescription: s("Professional student portfolio — projects, skills, contact."),
      nav: {
        about: s("About"),
        skills: s("Skills"),
        projects: s("Projects"),
        education: s("Education"),
        contact: s("Contact"),
      },
      headings: {
        about: s("About Me"),
        skills: s("Skills"),
        projects: s("Projects"),
        education: s("Education"),
        contact: s("Contact"),
      },
      buttons: {
        viewProjects: s("View Projects"),
        downloadResume: s("Download Resume"),
        sendMessage: s("Send Message"),
        reset: s("Reset"),
        visit: s("Visit"),
        viewRepo: s("View Repo"),
        email: s("📧 Email"),
        github: s("💻 GitHub"),
        linkedin: s("🔗 LinkedIn"),
      },
      form: {
        namePlaceholder: s("Your name"),
        emailPlaceholder: s("Your email"),
        messagePlaceholder: s("Message"),
      },
      footer: {
        text: s("Built with ❤️ —"),
        name: s("Payal Meena"),
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
