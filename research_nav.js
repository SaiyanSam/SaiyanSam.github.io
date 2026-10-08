
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("theme-toggle");
    const themeStylesheet = document.getElementById("theme-stylesheet");
    const menuButton = document.getElementById("menu-button");
    const navLinks = document.getElementById("nav-links");

    function updateThemeControls(theme) {
        document.documentElement.dataset.theme = theme;

        if (themeStylesheet) {
            themeStylesheet.href =
                theme === "dark" ? "style_dark.css" : "style.css";
        }

        document.querySelectorAll("[data-theme-option]").forEach(button => {
            const active = button.dataset.themeOption === theme;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    }

    const saved = localStorage.getItem("portfolio-theme");
    const initial = saved || document.documentElement.dataset.theme || "light";
    updateThemeControls(initial);

    if (toggle) {
        toggle.addEventListener("click", () => {
            const next =
                document.documentElement.dataset.theme === "dark"
                    ? "light"
                    : "dark";

            localStorage.setItem("portfolio-theme", next);
            updateThemeControls(next);
        });
    }

    document.querySelectorAll("[data-theme-option]").forEach(button => {
        button.addEventListener("click", () => {
            const theme = button.dataset.themeOption;
            localStorage.setItem("portfolio-theme", theme);
            updateThemeControls(theme);
        });
    });

    if (menuButton && navLinks) {
        menuButton.addEventListener("click", () => {
            const open = navLinks.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", String(open));
        });
    }
});
