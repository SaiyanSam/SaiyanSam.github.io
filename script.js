"use strict";

const DATA_PATHS = {
    profile: "data/profile.json",
    projects: "data/projects.json",
    publications: "data/publications.json"
};

document.addEventListener("DOMContentLoaded", async () => {
    setupThemeToggle();
    setupNavigation();
    setCurrentYear();

    await Promise.all([
        loadProfile(),
        Promise.resolve(),
        loadPublications()
    ]);
});

async function fetchJSON(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(
            `Could not load ${path}. HTTP status: ${response.status}`
        );
    }

    return response.json();
}

async function loadProfile() {
    try {
        const profile = await fetchJSON(DATA_PATHS.profile);

        setText("name", profile.name);
        setText("nav-name", profile.name);
        setText("footer-name", profile.name);
        setText("position", profile.position);
        setText("tagline", profile.tagline);
        setText(
            "research-statement",
            profile.research_statement
        );

        setText(
            "about-text",
            profile.about ||
                profile.research_statement
        );

        document.title = profile.name
            ? `${profile.name} | Research Portfolio`
            : "Research Portfolio";

        setProfileImage(profile.profile_image);
        renderResearchInterests(
            profile.research_interests
        );
        renderSocialLinks(profile);
        configureContactEmail(profile.email);
    } catch (error) {
        console.error(error);

        setText(
            "research-statement",
            "Profile information could not be loaded."
        );
    }
}

function setProfileImage(imagePath) {
    if (!imagePath) {
        return;
    }

    const image =
        document.getElementById("profile-image");

    if (image) {
        image.src = imagePath;
    }
}

function renderResearchInterests(interests = []) {
    const container =
        document.getElementById(
            "research-interests"
        );

    if (
        !container ||
        !Array.isArray(interests)
    ) {
        return;
    }

    container.innerHTML = interests
        .map(
            interest => `
                <span class="interest-tag">
                    ${escapeHTML(interest)}
                </span>
            `
        )
        .join("");
}

function renderSocialLinks(profile) {
    const container =
        document.getElementById("social-links");

    if (!container) {
        return;
    }

    const links = [
        {
            label: "CV",
            url: profile.cv
        },
        {
            label: "Google Scholar",
            url: profile.scholar
        },
        {
            label: "GitHub",
            url: profile.github
        },
        {
            label: "LinkedIn",
            url: profile.linkedin
        },
        {
            label: "ORCID",
            url: profile.orcid
        }
    ];

    container.innerHTML = links
        .filter(link => isValidLink(link.url))
        .map(
            link =>
                createLink(
                    link.label,
                    link.url
                )
        )
        .join("");
}

async function loadProjects() {
    const container =
        document.getElementById("project-grid");

    try {
        const projects =
            await fetchJSON(DATA_PATHS.projects);

        if (
            !Array.isArray(projects) ||
            projects.length === 0
        ) {
            container.innerHTML = `
                <p class="status-message">
                    Projects will be added soon.
                </p>
            `;

            return;
        }

        container.innerHTML = projects
            .map(createProjectCard)
            .join("");
    } catch (error) {
        console.error(error);

        container.innerHTML = `
            <p class="status-message">
                Projects could not be loaded.
                Check data/projects.json.
            </p>
        `;
    }
}

function createProjectCard(project) {
    const links = [
        {
            label: "Paper",
            url: project.paper
        },
        {
            label: "arXiv",
            url: project.arxiv
        },
        {
            label: "Code",
            url: project.code || project.github
        },
        {
            label: "Video",
            url: project.video
        },
        {
            label: "Project page",
            url: project.project_page
        }
    ]
        .filter(link => isValidLink(link.url))
        .map(
            link =>
                createLink(
                    link.label,
                    link.url
                )
        )
        .join("");

    const tags = Array.isArray(project.tags)
        ? project.tags
            .map(
                tag => `
                    <span class="project-tag">
                        ${escapeHTML(tag)}
                    </span>
                `
            )
            .join("")
        : "";

    return `
        <article class="project-card">
            ${createProjectMedia(project)}

            <div class="project-content">
                <h3>
                    ${escapeHTML(
                        project.title ||
                        "Untitled project"
                    )}
                </h3>

                ${
                    project.subtitle
                        ? `
                            <p class="project-subtitle">
                                ${escapeHTML(
                                    project.subtitle
                                )}
                            </p>
                        `
                        : ""
                }

                <p class="project-description">
                    ${escapeHTML(
                        project.description || ""
                    )}
                </p>

                ${
                    tags
                        ? `
                            <div class="project-tags">
                                ${tags}
                            </div>
                        `
                        : ""
                }

                ${
                    links
                        ? `
                            <div class="project-links">
                                ${links}
                            </div>
                        `
                        : ""
                }
            </div>
        </article>
    `;
}

function createProjectMedia(project) {
    const mediaPath =
        project.media ||
        project.image ||
        project.demo;

    if (!mediaPath) {
        return "";
    }

    if (isVideoFile(mediaPath)) {
        return `
            <video
                class="project-media"
                autoplay
                loop
                muted
                playsinline
                preload="metadata"
            >
                <source
                    src="${escapeAttribute(
                        mediaPath
                    )}"
                    type="${getVideoMimeType(
                        mediaPath
                    )}"
                >
            </video>
        `;
    }

    return `
        <img
            class="project-media"
            src="${escapeAttribute(mediaPath)}"
            alt="${escapeAttribute(
                project.title ||
                "Project preview"
            )}"
            loading="lazy"
        >
    `;
}

async function loadPublications() {
    const container =
        document.getElementById(
            "publication-list"
        );

    try {
        const publications =
            await fetchJSON(
                DATA_PATHS.publications
            );

        if (
            !Array.isArray(publications) ||
            publications.length === 0
        ) {
            container.innerHTML = `
                <p class="status-message">
                    Publications will be added soon.
                </p>
            `;

            return;
        }

        container.innerHTML = publications
            .map(createPublicationItem)
            .join("");
    } catch (error) {
        console.error(error);

        container.innerHTML = `
            <p class="status-message">
                Publications could not be loaded.
                Check data/publications.json.
            </p>
        `;
    }
}

function createPublicationItem(publication) {
    const links = [
        {
            label: "Paper",
            url: publication.paper
        },
        {
            label: "arXiv",
            url: publication.arxiv
        },
        {
            label: "Code",
            url: publication.code
        },
        {
            label: "Project page",
            url: publication.project_page
        }
    ]
        .filter(link => isValidLink(link.url))
        .map(
            link =>
                createLink(
                    link.label,
                    link.url
                )
        )
        .join("");

    const venueParts = [
        publication.venue,
        publication.year,
        publication.status
    ].filter(Boolean);

    return `
        <article class="publication-item">
            <p class="publication-title">
                ${escapeHTML(
                    publication.title ||
                    "Untitled publication"
                )}
            </p>

            ${
                publication.authors
                    ? `
                        <p class="publication-authors">
                            ${escapeHTML(
                                publication.authors
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                venueParts.length
                    ? `
                        <p class="publication-venue">
                            ${escapeHTML(
                                venueParts.join(" · ")
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                links
                    ? `
                        <div class="publication-links">
                            ${links}
                        </div>
                    `
                    : ""
            }
        </article>
    `;
}

function createLink(label, url) {
    return `
        <a
            class="link-button"
            href="${escapeAttribute(url)}"
            target="_blank"
            rel="noopener noreferrer"
        >
            ${escapeHTML(label)}
        </a>
    `;
}

function configureContactEmail(email) {
    const contactLink =
        document.getElementById(
            "contact-email"
        );

    if (!contactLink || !email) {
        return;
    }

    contactLink.href = `mailto:${email}`;
}

/* Theme switching */

function setupThemeToggle() {
    const toggle =
        document.getElementById(
            "theme-toggle"
        );

    const themeOptions =
        document.querySelectorAll(
            "[data-theme-option]"
        );

    if (!toggle) {
        return;
    }

    const initialTheme =
        document.documentElement.dataset.theme ||
        "light";

    updateThemeControls(initialTheme);

    toggle.addEventListener("click", () => {
        const activeTheme =
            document.documentElement.dataset.theme ||
            "light";

        applyTheme(
            activeTheme === "light"
                ? "dark"
                : "light"
        );
    });

    themeOptions.forEach(option => {
        option.addEventListener("click", () => {
            applyTheme(
                option.dataset.themeOption
            );
        });
    });
}

function applyTheme(theme) {
    const stylesheet =
        document.getElementById(
            "theme-stylesheet"
        );

    if (!stylesheet) {
        console.error(
            "Theme stylesheet element was not found."
        );

        return;
    }

    const validTheme =
        theme === "dark"
            ? "dark"
            : "light";

    document.documentElement.dataset.theme =
        validTheme;

    stylesheet.href =
        validTheme === "dark"
            ? "style_dark.css"
            : "style.css";

    localStorage.setItem(
        "portfolio-theme",
        validTheme
    );

    updateThemeControls(validTheme);
}

function updateThemeControls(theme) {
    const toggle =
        document.getElementById(
            "theme-toggle"
        );

    const lightOption =
        document.getElementById(
            "light-theme-option"
        );

    const darkOption =
        document.getElementById(
            "dark-theme-option"
        );

    const isDark =
        theme === "dark";

    if (toggle) {
        toggle.setAttribute(
            "aria-checked",
            String(isDark)
        );

        toggle.setAttribute(
            "aria-label",
            isDark
                ? "Switch to light theme"
                : "Switch to dark theme"
        );
    }

    if (lightOption) {
        lightOption.classList.toggle(
            "active",
            !isDark
        );

        lightOption.setAttribute(
            "aria-pressed",
            String(!isDark)
        );
    }

    if (darkOption) {
        darkOption.classList.toggle(
            "active",
            isDark
        );

        darkOption.setAttribute(
            "aria-pressed",
            String(isDark)
        );
    }
}

/* Mobile navigation */

function setupNavigation() {
    const menuButton =
        document.getElementById(
            "menu-button"
        );

    const navLinks =
        document.getElementById(
            "nav-links"
        );

    if (!menuButton || !navLinks) {
        return;
    }

    menuButton.addEventListener(
        "click",
        () => {
            const isOpen =
                navLinks.classList.toggle(
                    "open"
                );

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        }
    );

    navLinks
        .querySelectorAll("a")
        .forEach(link => {
            link.addEventListener(
                "click",
                () => {
                    navLinks.classList.remove(
                        "open"
                    );

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            );
        });
}

function setCurrentYear() {
    setText(
        "current-year",
        new Date().getFullYear()
    );
}

function setText(elementId, value) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return;
    }

    const element =
        document.getElementById(
            elementId
        );

    if (element) {
        element.textContent = value;
    }
}

function isValidLink(url) {
    return (
        typeof url === "string" &&
        url.trim() !== "" &&
        url.trim() !== "#" &&
        url.trim().toLowerCase() !==
            "placeholder"
    );
}

function isVideoFile(path) {
    return /\.(mp4|webm|ogg)$/i.test(
        path
    );
}

function getVideoMimeType(path) {
    if (/\.webm$/i.test(path)) {
        return "video/webm";
    }

    if (/\.ogg$/i.test(path)) {
        return "video/ogg";
    }

    return "video/mp4";
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value);
}
