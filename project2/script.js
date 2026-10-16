
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll(".theme-toggle");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  // Footer year
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  // Theme preference: saved choice takes priority, otherwise use OS preference.
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("portfolio-theme");
  } catch {
    // The page still works when browser storage is unavailable.
  }

  const systemPrefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  function setTheme(theme, save = true) {
    const dark = theme === "dark";
    root.dataset.theme = dark ? "dark" : "light";

    themeButtons.forEach((button) => {
      button.textContent = dark ? "☀" : "☾";
      button.setAttribute(
        "aria-label",
        dark ? "Switch to light theme" : "Switch to dark theme"
      );
      button.setAttribute("aria-pressed", String(dark));
    });

    if (save) {
      try {
        localStorage.setItem("portfolio-theme", dark ? "dark" : "light");
      } catch {
        // Theme switching still works for the current page.
      }
    }
  }

  setTheme(savedTheme || (systemPrefersDark ? "dark" : "light"), false);

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme =
        root.dataset.theme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });
  });

  // Mobile navigation
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
      navToggle.textContent = isOpen ? "×" : "☰";
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation");
        navToggle.textContent = "☰";
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation");
        navToggle.textContent = "☰";
        navToggle.focus();
      }
    });
  }

  // Project filtering
  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".project-card");
  const filterStatus = document.querySelector(".filter-status");

  if (filterButtons.length && projectCards.length) {
    function applyFilter(filter) {
      let visibleCount = 0;

      projectCards.forEach((card) => {
        const matches =
          filter === "all" || card.dataset.category === filter;

        card.hidden = !matches;
        if (matches) visibleCount += 1;
      });

      filterButtons.forEach((button) => {
        const active = button.dataset.filter === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      if (filterStatus) {
        filterStatus.textContent =
          `${visibleCount} project${visibleCount === 1 ? "" : "s"} shown`;
      }
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        applyFilter(button.dataset.filter);
      });
    });

    applyFilter("all");
  }

  // Client-side form validation only; no data is transmitted.
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      formStatus.className = "form-status";

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        formStatus.textContent =
          "Please check the fields and correct any missing or invalid values.";
        formStatus.classList.add("error");
        return;
      }

      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();

      formStatus.textContent =
        `Thanks, ${name}! Your form passed browser validation. ` +
        "This demo does not send messages. Connect a backend to enable delivery.";
      formStatus.classList.add("success");
    });
  }
});
