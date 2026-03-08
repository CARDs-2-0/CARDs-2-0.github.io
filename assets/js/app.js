// ---------- Active nav ----------
(() => {
    const page = document.body.dataset.page;
    const links = document.querySelectorAll(".nav-link");
    links.forEach((link) => {
        const href = link.getAttribute("href");
        if ((page === "home" && href === "index.html")) {
            link.classList.add("active");
        }
    });
})();

// ---------- Golden reveal cursor ----------
(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = document.querySelector(".cursor-dot");
    const glow = document.querySelector(".cursor-glow");
    if (!dot || !glow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    const animate = () => {
        glowX += (mouseX - glowX) * 0.14;
        glowY += (mouseY - glowY) * 0.14;
        glow.style.transform = `translate(${glowX}px, ${glowY}px)`;
        requestAnimationFrame(animate);
    };
    animate();
})();

// ---------- Speed-line parallax ----------
(() => {
    const onScroll = () => {
        const shift = window.scrollY * -0.08;
        document.documentElement.style.setProperty("--speedShift", `${shift}px`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
})();

// ---------- 3D Tilt Cards ----------
(() => {
    const cards = document.querySelectorAll(".tilt-card");
    cards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const px = (x / rect.width - 0.5) * 2;
            const py = (y / rect.height - 0.5) * 2;

            card.style.transform = `rotateY(${px * 7}deg) rotateX(${py * -7}deg) translateZ(6px)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "rotateY(0deg) rotateX(0deg) translateZ(0)";
        });
    });
})();

// ---------- Reveal on viewport ----------
(() => {
    const items = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) entry.target.classList.add("in-view");
            });
        },
        { threshold: 0.15 }
    );

    items.forEach((el) => io.observe(el));
})();

// ---------- Star selector UI ----------
(() => {
    const stars = document.querySelectorAll(".star");
    const ratingInput = document.getElementById("ratingValue");
    if (!stars.length || !ratingInput) return;

    const paint = (value) => {
        stars.forEach((star) => {
            star.classList.toggle("active", Number(star.dataset.value) <= value);
        });
    };

    stars.forEach((star) => {
        star.addEventListener("mouseenter", () => paint(Number(star.dataset.value)));
        star.addEventListener("click", () => {
            const value = Number(star.dataset.value);
            ratingInput.value = String(value);
            paint(value);
        });
    });

    const row = document.querySelector(".star-row");
    row?.addEventListener("mouseleave", () => paint(Number(ratingInput.value)));
})();
