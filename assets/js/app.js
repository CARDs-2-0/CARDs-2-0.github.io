(() => {
    const currentFile = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link").forEach((link) => {
        if (link.getAttribute("href") === currentFile) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
})();

(() => {
    const greetingElement = document.getElementById("welcomeGreeting");
    if (!greetingElement) {
        return;
    }

    const hour = new Date().getHours();
    let greetings =["Welcome Back", "Hello There", "Glad You're Here", "Nice to See You"];

    if (hour >= 5 && hour < 12) {
        greetings =[
            "Good Morning",
            "Hope Your Morning Is Going Well",
            "Welcome Back",
            "Nice to See You"
        ];
    } else if (hour >= 12 && hour < 17) {
        greetings =[
            "Good Afternoon",
            "Hope Your Day Is Going Well",
            "Welcome Back",
            "Glad You're Here"
        ];
    } else if (hour >= 17 && hour < 22) {
        greetings =[
            "Good Evening",
            "Hope You're Having a Good Evening",
            "Welcome Back",
            "Nice to See You"
        ];
    } else {
        greetings =[
            "Good Evening",
            "Hope You're Doing Well",
            "Welcome Back",
            "Glad You're Here"
        ];
    }

    if (Math.random() < 0.045) {
        greetingElement.textContent = "The vault predicted your return.";
        return;
    }

    greetingElement.textContent = greetings[Math.floor(Math.random() * greetings.length)];
})();

(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
        return;
    }

    const cursor = document.querySelector(".cursor");
    if (!cursor) {
        return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const textSelector = [
        "textarea",
        'input[type="text"]',
        'input[type="search"]',
        'input[type="email"]',
        'input[type="url"]',
        'input[type="tel"]',
        'input[type="password"]',
        '[contenteditable="true"]'
    ].join(", ");

    const interactiveSelector = [
        "a",
        "button",
        "[data-tilt-scene]",
        "[data-reveal-card]",
        ".nav-pill",
        ".news-modal-close",
        ".star-label"
    ].join(", ");

    const orbHideSelector = [
        "[data-tilt-scene]",
        "[data-reveal-card]"
    ].join(", ");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const setMode = (element) => {
        const isElement = element instanceof Element;
        const onText = Boolean(isElement && element.closest(textSelector));
        const onInteractive = Boolean(isElement && element.closest(interactiveSelector));
        const hideOrb = Boolean(isElement && element.closest(orbHideSelector));

        cursor.classList.toggle("is-text", onText);
        cursor.classList.toggle("is-active", onInteractive && !onText);
        cursor.classList.toggle("is-reveal", hideOrb);
    };

    const updateImmediate = () => {
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    };

    const showCursor = () => {
        cursor.classList.add("is-visible");
    };

    const hideCursor = () => {
        cursor.classList.remove("is-visible");
    };

    window.addEventListener(
        "mousemove",
        (event) => {
            targetX = event.clientX;
            targetY = event.clientY;

            showCursor();
            setMode(document.elementFromPoint(event.clientX, event.clientY));

            if (reducedMotion) {
                currentX = targetX;
                currentY = targetY;
                updateImmediate();
            }
        },
        { passive: true }
    );

    window.addEventListener("mousedown", () => {
        cursor.classList.add("is-pressed");
    });

    window.addEventListener("mouseup", () => {
        cursor.classList.remove("is-pressed");
    });

    window.addEventListener("blur", hideCursor);

    document.addEventListener("mouseout", (event) => {
        if (!event.relatedTarget) {
            hideCursor();
        }
    });

    if (!reducedMotion) {
        const animate = () => {
            currentX += (targetX - currentX) * 0.22;
            currentY += (targetY - currentY) * 0.22;
            updateImmediate();
            requestAnimationFrame(animate);
        };

        animate();
    }
})();

(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const root = document.documentElement;
    let targetScroll = window.scrollY || 0;
    let currentScroll = targetScroll;

    const onScroll = () => {
        targetScroll = window.scrollY || 0;
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const animate = () => {
        currentScroll += (targetScroll - currentScroll) * 0.1;
        root.style.setProperty("--parallax-fast", `${currentScroll * -0.16}px`);
        root.style.setProperty("--parallax-slow", `${currentScroll * -0.07}px`);
        requestAnimationFrame(animate);
    };

    animate();
})();

(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const scenes = document.querySelectorAll("[data-tilt-scene]");
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    scenes.forEach((scene) => {
        const container = scene.querySelector(".card-container");
        const card = scene.querySelector(".card-face");
        const shine = scene.querySelector(".shine");

        if (!container || !card || !shine) {
            return;
        }

        let bounds;
        let isActive = false;
        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;
        let rafId = 0;

        const maxTilt = Number(scene.getAttribute("data-tilt-max")) || 12;

        const updatePoint = (clientX, clientY) => {
            if (!bounds) {
                bounds = scene.getBoundingClientRect();
            }

            const x = clientX - bounds.left;
            const y = clientY - bounds.top;

            targetX = Math.max(-1, Math.min(1, (x / bounds.width) * 2 - 1));
            targetY = Math.max(-1, Math.min(1, (y / bounds.height) * 2 - 1));
        };

        const render = () => {
            if (!isActive) {
                return;
            }

            currentX += (targetX - currentX) * 0.1;
            currentY += (targetY - currentY) * 0.1;

            const rotateY = currentX * maxTilt;
            const rotateX = currentY * -maxTilt;

            container.style.transform =
            `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale3d(1.03, 1.03, 1.03)`;

            const mouseXPercent = ((currentX + 1) / 2) * 100;
            const mouseYPercent = ((currentY + 1) / 2) * 100;

            shine.style.setProperty("--mouse-x", `${mouseXPercent}%`);
            shine.style.setProperty("--mouse-y", `${mouseYPercent}%`);

            const shadowX = -rotateY * 0.6;
            const shadowY = rotateX * 0.6;

            card.style.boxShadow = `
            ${shadowX}px ${shadowY + 20}px 60px rgba(0, 0, 0, 0.5),
                   0 0 5px rgba(0, 0, 0, 0.4)
                   `;

                   rafId = requestAnimationFrame(render);
        };

        const start = () => {
            bounds = scene.getBoundingClientRect();
            isActive = true;
            container.style.transition = "transform 0.08s ease-out";

            if (!rafId) {
                rafId = requestAnimationFrame(render);
            }
        };

        const stop = () => {
            isActive = false;

            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = 0;
            }

            container.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
            container.style.transform = "rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)";

            card.style.boxShadow = `
            0 0 5px rgba(0, 0, 0, 0.5),
                   0 20px 60px rgba(0, 0, 0, 0.6)
                   `;

                   currentX = 0;
                   currentY = 0;
                   targetX = 0;
                   targetY = 0;
        };

        if (hasFinePointer) {
            scene.addEventListener("mouseenter", () => {
                start();
            });

            scene.addEventListener("mousemove", (event) => {
                updatePoint(event.clientX, event.clientY);
            });

            scene.addEventListener("mouseleave", () => {
                stop();
            });
        }

        scene.addEventListener(
            "touchstart",
            (event) => {
                const touch = event.touches[0];
                if (!touch) {
                    return;
                }

                start();
                updatePoint(touch.clientX, touch.clientY);
            },
            { passive: true }
        );

        scene.addEventListener(
            "touchmove",
            (event) => {
                const touch = event.touches[0];
                if (!touch || !isActive) {
                    return;
                }

                updatePoint(touch.clientX, touch.clientY);
                event.preventDefault();
            },
            { passive: false }
        );

        scene.addEventListener(
            "touchend",
            () => {
                stop();
            },
            { passive: true }
        );

        scene.addEventListener(
            "touchcancel",
            () => {
                stop();
            },
            { passive: true }
        );

        window.addEventListener("resize", () => {
            bounds = scene.getBoundingClientRect();
        });
    });
})();

(() => {
    if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
        return;
    }

    const revealCards = document.querySelectorAll("[data-reveal-card]");

    revealCards.forEach((card) => {
        const updateReveal = (event) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--reveal-x", `${event.clientX - rect.left}px`);
            card.style.setProperty("--reveal-y", `${event.clientY - rect.top}px`);
        };

        card.addEventListener("pointerenter", (event) => {
            card.classList.add("is-reveal-hover");
            updateReveal(event);
        });

        card.addEventListener("pointermove", (event) => {
            updateReveal(event);
        });

        card.addEventListener("pointerleave", () => {
            card.classList.remove("is-reveal-hover");
        });
    });
})();

(() => {
    const revealItems = document.querySelectorAll(".reveal");

    if (!revealItems.length) {
        return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        revealItems.forEach((item) => item.classList.add("in-view"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, io) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    io.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.14,
            rootMargin: "0px 0px -8% 0px"
        }
    );

    revealItems.forEach((item) => observer.observe(item));
})();

(() => {
    const modal = document.getElementById("newsModal");
    const modalTitle = document.getElementById("newsModalTitle");
    const modalDate = document.getElementById("newsModalDate");
    const modalBody = document.getElementById("newsModalBody");
    const closeButton = modal?.querySelector(".news-modal-close");
    const newsButtons = document.querySelectorAll(".news-card");

    if (!modal || !modalTitle || !modalDate || !modalBody || !closeButton || !newsButtons.length) {
        return;
    }

    let previousFocus = null;
    let closeTimer = 0;

    const focusableSelector =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

        const getFocusable = () => {
            return Array.from(modal.querySelectorAll(focusableSelector)).filter((element) => {
                return !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden");
            });
        };

        const openModal = (button) => {
            const templateId = button.getAttribute("data-news-template");
            const template = templateId ? document.getElementById(templateId) : null;
            const dateText = button.querySelector(".news-date")?.textContent?.trim() || "";
            const titleText = button.querySelector(".news-card-title")?.textContent?.trim() || "";

            if (!(template instanceof HTMLTemplateElement)) {
                return;
            }

            window.clearTimeout(closeTimer);

            previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            modalDate.textContent = dateText;
            modalTitle.textContent = titleText;
            modalBody.innerHTML = template.innerHTML;

            modal.hidden = false;
            document.body.classList.add("modal-open");

            requestAnimationFrame(() => {
                modal.classList.add("is-open");
                closeButton.focus({ preventScroll: true });
            });
        };

        const closeModal = () => {
            if (modal.hidden) {
                return;
            }

            modal.classList.remove("is-open");
            document.body.classList.remove("modal-open");

            closeTimer = window.setTimeout(() => {
                modal.hidden = true;
                modalBody.innerHTML = "";

                if (previousFocus) {
                    previousFocus.focus({ preventScroll: true });
                }
            }, 280);
        };

        newsButtons.forEach((button) => {
            button.addEventListener("click", () => {
                openModal(button);
            });
        });

        modal.addEventListener("click", (event) => {
            const target = event.target;
            if (target instanceof Element && target.hasAttribute("data-close-news")) {
                closeModal();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (modal.hidden) {
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                closeModal();
                return;
            }

            if (event.key === "Tab") {
                const focusable = getFocusable();
                if (!focusable.length) {
                    event.preventDefault();
                    return;
                }

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
})();

(() => {
    const form = document.getElementById("feedbackForm");
    const status = document.getElementById("feedbackStatus");
    const submitButton = document.getElementById("feedbackSubmit");

    if (!form || !status || !submitButton) {
        return;
    }

    const fields = Array.from(form.querySelectorAll("textarea, input"));

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const rating = String(formData.get("rating") || "").trim();
        const message = String(formData.get("message") || "").trim();

        status.classList.remove("is-error");

        if (!rating && !message) {
            status.textContent = "Add a rating or a short message first.";
            status.classList.add("is-error");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        fields.forEach((field) => {
            field.disabled = true;
        });

        window.setTimeout(() => {
            form.reset();
            fields.forEach((field) => {
                field.disabled = false;
            });

            submitButton.disabled = false;
            submitButton.textContent = "Submit Feedback";
            status.textContent = "Thanks — your feedback reached the current dev preview.";

            const messageBox = form.querySelector("#feedback-message");
            if (messageBox instanceof HTMLTextAreaElement) {
                messageBox.blur();
            }
        }, 850);
    });
})();
