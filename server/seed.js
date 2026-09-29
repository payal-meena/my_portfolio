require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("./models/Admin");
const Profile = require("./models/Profile");
const Skill = require("./models/Skill");
const Project = require("./models/Project");
const Education = require("./models/Education");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // 1. Admin (only if it does not exist)
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
  }
  if (!(await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() }))) {
    await Admin.create({
      email: ADMIN_EMAIL,
      password: await bcrypt.hash(ADMIN_PASSWORD, 12),
    });
    console.log("Admin created");
  } else {
    console.log("Admin already exists, skipped");
  }

  // 2. Portfolio content (only into empty collections)
  if ((await Profile.countDocuments()) === 0) {
    await Profile.create({
      name: "Payal Meena",
      initials: "PM",
      title: "React Frontend Developer | Aspiring Full-Stack Developer",
      heroHeading: "Hi — I'm Payal, a React Frontend Developer.",
      heroText:
        "I am a BCA graduate passionate about building modern and responsive web applications. With hands-on experience in React, JavaScript, and UI design, I have developed projects like task management systems, resume builders, and interactive dashboards. Currently, I am learning the MERN stack to enhance my backend skills and become a full-stack developer.",
      aboutText:
        "I’m a BCA graduate and a frontend developer specializing in React. I enjoy building responsive and user-friendly web applications that solve real-world problems. I have worked on projects like task managers, resume builders, and interactive dashboards, focusing on clean UI and smooth user experience. Currently, I’m expanding my skills by learning the MERN stack to become a full-stack developer. I’m actively looking for opportunities to start my career and grow as a developer.",
      photoUrl: "https://payal-meena.github.io/my_portfolio/Files/Profile.jpg",
      resumeUrl:
        "https://drive.google.com/file/d/1KDCt0X1m2_dnaV9-z6Y3CuC5T78Z4WNu/preview",
      email: "paylmeena20@gmail.com",
      github: "https://github.com/payal-meena",
      linkedin: "https://www.linkedin.com/in/payal-meena17",
      contactText:
        "Want to collaborate or hire me for an internship or job? Send a message.",
      stats: [
        { value: "3+", label: "Projects" },
        { value: "2026", label: "Grad Year" },
      ],
    });
    console.log("Profile seeded");
  }

  if ((await Skill.countDocuments()) === 0) {
    await Skill.insertMany([
      { category: "Programming", items: ["Java", "JavaScript"], order: 1 },
      {
        category: "Frontend",
        items: ["HTML", "CSS", "Bootstrap", "React", "Tailwind CSS"],
        order: 2,
      },
      {
        category: "Backend",
        items: ["MySQL", "MongoDB", "Node.js", "Express.js"],
        order: 3,
      },
      {
        category: "Tools",
        items: ["VS Code", "Git", "GitHub", "Postman", "Vercel", "Render"],
        order: 4,
      },
    ]);
    console.log("Skills seeded");
  }

  if ((await Project.countDocuments()) === 0) {
    await Project.insertMany([
      {
        title: "Hotel Room Booking System",
        description:
          "A Java and MySQL based application for managing hotel room reservations. Features include room availability check, booking, cancellation, and guest information management with a user-friendly interface.",
        techStack: ["Java", "MySQL", "OOP", "JDBC"],
        liveUrl: "",
        repoUrl: "https://github.com/payal-meena/Hotel-Room-Booking-System",
        order: 1,
      },
      {
        title: "IMDB Clone",
        description:
          "A movie database web application built with React and OMDb API. Users can search movies, view details like poster, genre, ratings, and plot with a responsive UI.",
        techStack: ["React", "API", "Responsive"],
        liveUrl: "https://imdb-clone-hazel.vercel.app/",
        repoUrl: "https://github.com/payal-meena/Imdb_clone",
        order: 2,
      },
      {
        title: "Room Booking Website",
        description:
          "A responsive and customizable website template built with HTML, CSS, and JavaScript. Designed with a clean layout and modern UI to be used as a starting point for personal or business websites.",
        techStack: ["HTML", "CSS", "JS", "Bootstrap"],
        liveUrl: "https://payal-meena.github.io/Website_Template/",
        repoUrl: "https://github.com/payal-meena/Website_Template",
        order: 3,
      },
      {
        title: "Resume Builder",
        description:
          "A dynamic resume builder web application that allows users to create professional resumes with real-time preview. Users can input their details, customize sections, and download the resume in a clean format.",
        techStack: ["React", "Tailwind CSS", "JavaScript"],
        liveUrl: "https://resume-builder-mu-rose.vercel.app/",
        repoUrl: "https://github.com/payal-meena/resume-builder",
        order: 4,
      },
      {
        title: "Finance Dashboard",
        description:
          "A finance dashboard that provides insights into income and expenses through interactive charts and visualizations. Helps users track spending habits and manage budgets effectively.",
        techStack: ["React", "Chart.js", "JavaScript", "Tailwind CSS"],
        liveUrl: "https://finance-dashboard-lovat-omega.vercel.app/",
        repoUrl: "https://github.com/payal-meena/finance-dashboard",
        order: 5,
      },
      {
        title: "Task Manager App",
        description:
          "A task management application that helps users organize daily tasks. Features include adding, updating, deleting tasks, and tracking task completion status with a clean and responsive UI.",
        techStack: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
        liveUrl: "https://task-manager-gamma-weld.vercel.app/",
        repoUrl: "https://github.com/payal-meena/task-manager",
        order: 6,
      },
    ]);
    console.log("Projects seeded");
  }

  if ((await Education.countDocuments()) === 0) {
    await Education.insertMany([
      {
        title:
          "BCA — Sant Singaji Institute of Science and Managemet Sandalpur",
        detail: "2023 — 2026",
        order: 1,
      },
      {
        title:
          "Class 12th — Arihant Convent Higher Secondary School Khategaon",
        detail: "Percentage: 86.2% | Stream: Science (PCM)",
        order: 2,
      },
      {
        title:
          "Class 10th — Arihant Convent Higher Secondary School Khategaon",
        detail: "Percentage: 98%",
        order: 3,
      },
    ]);
    console.log("Education seeded");
  }

  await mongoose.disconnect();
  console.log("Done");
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
