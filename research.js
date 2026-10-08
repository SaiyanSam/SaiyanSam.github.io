
"use strict";

const RESEARCH_INDEX = "data/research/index.json";

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
}

function safeURL(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    const url = value.trim();

    if (/^https?:\/\//i.test(url)) return url;

    if (
        !url.startsWith("/") &&
        !url.startsWith("//") &&
        !url.includes("..") &&
        /^[a-zA-Z0-9_./-]+$/.test(url)
    ) return url;

    return "";
}

function isVideo(url) {
    return /\.(mp4|webm|ogg)(?:\?.*)?$/i.test(url);
}

function mediaHTML(path, autoplay = false) {
    const url = safeURL(path);

    if (!url) {
        return '<div class="research-media-placeholder">Media coming soon</div>';
    }

    if (isVideo(url)) {
        return `<video src="${escapeHTML(url)}"
            ${autoplay
                ? "autoplay muted loop playsinline"
                : "controls playsinline"}
            preload="metadata"></video>`;
    }

    return `<img src="${escapeHTML(url)}"
                 alt="Research visualization"
                 loading="lazy">`;
}

function tagsHTML(tags) {
    if (!Array.isArray(tags)) return "";

    return `<div class="research-tags">
        ${tags.map(tag =>
            `<span class="research-tag">${escapeHTML(tag)}</span>`
        ).join("")}
    </div>`;
}

function tileHTML(item) {
    const id = encodeURIComponent(item.id);

    return `
        <a class="research-tile"
           href="research.html?id=${id}">

            <div class="research-tile-media">
                ${mediaHTML(item.thumbnail)}
            </div>

            <div class="research-tile-body">
                <span class="research-status">
                    ${escapeHTML(item.status)}
                </span>

                <h4>${escapeHTML(item.title)}</h4>

                <p>${escapeHTML(
                    item.description || item.subtitle || ""
                )}</p>

                <span class="research-tile-action">
                    Explore research →
                </span>
            </div>
        </a>
    `;
}

async function fetchJSON(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`${path}: HTTP ${response.status}`);
    }

    return response.json();
}

async function loadResearchTiles() {
    const manuscripts = document.getElementById("manuscript-grid");
    const ongoing = document.getElementById("ongoing-project-grid");

    if (!manuscripts || !ongoing) return;

    try {
        const entries = await fetchJSON(RESEARCH_INDEX);

        if (!Array.isArray(entries)) {
            throw new Error("Research index must be an array");
        }

        const manuscriptEntries = entries.filter(
            item => item.category === "manuscript"
        );

        const ongoingEntries = entries.filter(
            item => item.category === "ongoing"
        );

        manuscripts.innerHTML = manuscriptEntries.length
            ? manuscriptEntries.map(tileHTML).join("")
            : "<p>Research manuscripts will appear here.</p>";

        ongoing.innerHTML = ongoingEntries.length
            ? ongoingEntries.map(tileHTML).join("")
            : "<p>Ongoing projects will appear here.</p>";

    } catch (error) {
        console.error(error);
        manuscripts.textContent = "Unable to load manuscripts.";
        ongoing.textContent = "Unable to load ongoing projects.";
    }
}

function resourceHTML(label, value) {
    const url = safeURL(value);

    if (!url) {
        return `<span class="research-resource disabled">
            ${escapeHTML(label)} — Coming soon
        </span>`;
    }

    return `<a class="research-resource"
               href="${escapeHTML(url)}"
               target="_blank"
               rel="noopener noreferrer">
            ${escapeHTML(label)} ↗
        </a>`;
}

function sectionHTML(section) {
    if (!section || !section.title) return "";

    const image = safeURL(section.image);

    return `
        <section class="research-content-section">
            <h2>${escapeHTML(section.title)}</h2>

            ${section.text
                ? `<p>${escapeHTML(section.text)}</p>`
                : ""}

            ${image
                ? `<img src="${escapeHTML(image)}"
                        alt="${escapeHTML(section.title)}"
                        loading="lazy">`
                : ""}

            ${section.caption
                ? `<p class="research-caption">
                    ${escapeHTML(section.caption)}
                   </p>`
                : ""}
        </section>
    `;
}


function detailHTML(item, category = "manuscript") {
    const sections = Array.isArray(item.sections) ? item.sections : [];

    if (category === "ongoing") {
        const architecture = safeURL(item.architecture_image);
        const overview = item.overview || item.abstract || "";
        const progress = item.current_progress || "";

        return `
            <article class="ongoing-detail">
                <h1 class="research-detail-title">
                    ${escapeHTML(item.title)}
                </h1>

                <p class="research-detail-meta">
                    ${escapeHTML(item.subtitle || "")}
                    ${item.subtitle && item.status ? " · " : ""}
                    ${escapeHTML(item.status || "Ongoing research")}
                </p>

                ${tagsHTML(item.tags)}

                <figure class="ongoing-architecture">
                    ${architecture
                        ? `<img src="${escapeHTML(architecture)}"
                                alt="${escapeHTML(item.title)} architecture">`
                        : `<div class="ongoing-architecture-placeholder">
                               Architecture figure coming soon
                           </div>`}

                    ${item.architecture_caption
                        ? `<figcaption>${escapeHTML(item.architecture_caption)}</figcaption>`
                        : ""}
                </figure>

                <div class="ongoing-information">
                    <section class="ongoing-overview">
                        <h2>Project Overview</h2>
                        <p>${escapeHTML(overview || "Overview coming soon.")}</p>
                    </section>

                    <section class="ongoing-progress">
                        <h2>Current Progress</h2>
                        <p>${escapeHTML(progress || "Progress details coming soon.")}</p>
                    </section>
                </div>

                ${sections.map(sectionHTML).join("")}
            </article>
        `;
    }

    // Existing manuscript layout: video + abstract.
    return `
        <article>
            <h1 class="research-detail-title">
                ${escapeHTML(item.title)}
            </h1>

            <p class="research-detail-meta">
                ${escapeHTML(item.authors || "")}
            </p>

            <p class="research-detail-meta">
                ${escapeHTML(item.subtitle || "")}
                ${item.subtitle && item.status ? " · " : ""}
                ${escapeHTML(item.status || "")}
            </p>

            <div class="research-resources">
                ${resourceHTML("arXiv", item.arxiv)}
                ${resourceHTML("Paper", item.paper)}
                ${resourceHTML("GitHub", item.github)}
            </div>

            <div class="research-intro">
                <div class="research-demo">
                    ${mediaHTML(item.demo || item.thumbnail)}
                </div>

                <div class="research-abstract">
                    <h2>Abstract</h2>
                    <p>${escapeHTML(
                        item.abstract || "Abstract coming soon."
                    )}</p>
                    ${tagsHTML(item.tags)}
                </div>
            </div>

            ${sections.map(sectionHTML).join("")}
        </article>
    `;
}

async function loadResearchDetail() {
    const root = document.getElementById("research-detail-root");
    if (!root) return;

    const id = new URLSearchParams(location.search).get("id");

    if (!id) {
        root.textContent = "No research project selected.";
        return;
    }

    try {
        const entries = await fetchJSON(RESEARCH_INDEX);
        const entry = entries.find(item => item.id === id);

        if (!entry) {
            root.textContent = "Research project not found.";
            return;
        }

        // Only filenames listed in the local index are loaded.
        if (
            !/^(publications|ongoing)\/[a-zA-Z0-9_-]+\.json$/.test(entry.file)
        ) {
            throw new Error("Invalid research filename");
        }

        const item = await fetchJSON(
            "data/research/" + entry.file
        );

        document.title = item.title + " | Research";
        root.innerHTML = detailHTML(item, entry.category);

    } catch (error) {
        console.error(error);
        root.textContent = "Unable to load research project.";
    }
}

function setupResearchTheme() {
    const button = document.getElementById("research-theme-toggle");
    if (!button) return;

    button.addEventListener("click", () => {
        const html = document.documentElement;
        const next = html.dataset.theme === "dark" ? "light" : "dark";

        html.dataset.theme = next;
        localStorage.setItem("portfolio-theme", next);

        document.getElementById("theme-stylesheet").href =
            next === "dark" ? "style_dark.css" : "style.css";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadResearchTiles();
    loadResearchDetail();
});
