function toggleMenu() {
  document.getElementById("navbar").classList.toggle("active");
}

function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  if (!name || !email || !message) {
    alert("Please fill all fields");
    return;
  }
  window.location.href = `mailto:payalm.bca2023@ssism.org?subject=Portfolio%20message%20from%20${encodeURIComponent(
    name
  )}&body=${encodeURIComponent(message + "\n\n" + email)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const faders = document.querySelectorAll(".fade-slide");

  const appearOptions = {
    threshold: 0.2, 
    rootMargin: "0px 0px -50px 0px",
  };

  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    });
  }, appearOptions);

  faders.forEach((fader) => {
    appearOnScroll.observe(fader);
  });
});
