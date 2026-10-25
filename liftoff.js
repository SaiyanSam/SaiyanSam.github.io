
const slides = [
    { image: "lap-01.png", caption: "Lap Time 01" },
    { image: "lap-02.png", caption: "Lap Time 02" },
    { image: "lap-03.png", caption: "Lap Time 03" },
    { image: "lap-04.png", caption: "Lap Time 04" },
    { image: "lap-05.png", caption: "Lap Time 05" }
];

let currentSlide = 0;
let galleryTimer = null;

const lapImage = document.getElementById("lap-image");
const lapCaption = document.getElementById("lap-caption");
const lapCounter = document.getElementById("lap-counter");
const lapDots = document.getElementById("lap-dots");
const gallery = document.querySelector(".liftoff-gallery");

function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    const slide = slides[currentSlide];

    lapImage.src = "assets/hobbies/liftoff/lap-times/" + slide.image;
    lapImage.alt = slide.caption;
    lapCaption.textContent = slide.caption;
    lapCounter.textContent = `${currentSlide + 1} / ${slides.length}`;

    [...lapDots.children].forEach((dot, i) => {
        dot.classList.toggle("active", i === currentSlide);
        dot.setAttribute("aria-current", i === currentSlide ? "true" : "false");
    });
}

function stopGallery() {
    clearInterval(galleryTimer);
    galleryTimer = null;
}

function startGallery() {
    stopGallery();
    if (document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    galleryTimer = setInterval(() => showSlide(currentSlide + 1), 5000);
}

function navigateGallery(delta) {
    showSlide(currentSlide + delta);
    startGallery();
}

slides.forEach((slide, i) => {
    const dot = document.createElement("button");
    dot.className = "gallery-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show screenshot ${i + 1}`);
    dot.addEventListener("click", () => {
        showSlide(i);
        startGallery();
    });
    lapDots.appendChild(dot);
});

document.querySelector(".gallery-prev").addEventListener(
    "click", () => navigateGallery(-1)
);

document.querySelector(".gallery-next").addEventListener(
    "click", () => navigateGallery(1)
);

gallery.addEventListener("mouseenter", stopGallery);
gallery.addEventListener("mouseleave", startGallery);
gallery.addEventListener("focusin", stopGallery);
gallery.addEventListener("focusout", event => {
    if (!gallery.contains(event.relatedTarget)) startGallery();
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopGallery();
    else startGallery();
});

showSlide(0);
startGallery();
