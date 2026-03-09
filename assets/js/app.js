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

(() => {
    if (document.body.dataset.page !== "index") {
        return;
    }

    const form = document.getElementById("indexControls");
    const searchInput = document.getElementById("collectionSearch");
    const rarityFilter = document.getElementById("rarityFilter");
    const typeFilter = document.getElementById("typeFilter");
    const sortFilter = document.getElementById("sortFilter");
    const ownershipToggle = document.getElementById("ownershipToggle");
    const resultsMeta = document.getElementById("indexResultsMeta");
    const grid = document.getElementById("collectionGrid");

    const masterUnlockedValue = document.getElementById("masterUnlockedValue");
    const masterVisibleValue = document.getElementById("masterVisibleValue");
    const masterLockedValue = document.getElementById("masterLockedValue");
    const masterSpecialValue = document.getElementById("masterSpecialValue");
    const masterSpecialLabel = document.getElementById("masterSpecialLabel");
    const masterShownValue = document.getElementById("masterShownValue");

    const modal = document.getElementById("cardDetailModal");
    const modalBody = document.getElementById("cardDetailBody");

    if (
        !form ||
        !searchInput ||
        !rarityFilter ||
        !typeFilter ||
        !sortFilter ||
        !ownershipToggle ||
        !resultsMeta ||
        !grid ||
        !masterUnlockedValue ||
        !masterVisibleValue ||
        !masterLockedValue ||
        !masterSpecialValue ||
        !masterSpecialLabel ||
        !masterShownValue ||
        !modal ||
        !modalBody
    ) {
        return;
    }

    const totalSetCards = 45;

    const previewUnlockedIds = new Set([
        "skeleton",
        "anaconda",
        "dragon",
        "narwhal",
        "secret1"
    ]);

    const cards = [
        {
            id: "skeleton",
            name: "Skeleton",
            image: "assets/images/cards/Skeleton.jpg",
            number: "1/45",
            setNumber: 1,
            type: "Grass",
            rarity: "Common",
            hp: 250,
            dmg: 250,
            description: "A perfectly balanced Grass card and one of the cleanest baseline stat references in the current preview.",
            unlocked: previewUnlockedIds.has("skeleton"),
 isSecret: false
        },
        {
            id: "anaconda",
            name: "Anaconda",
            image: "assets/images/cards/Anaconda.jpg",
            number: "7/45",
            setNumber: 7,
            type: "Grass",
            rarity: "Legendary",
            hp: 350,
            dmg: 300,
            description: "The current flagship Legendary with full-scene presentation and premium collector weight.",
            unlocked: previewUnlockedIds.has("anaconda"),
 isSecret: false
        },
        {
            id: "dragon",
            name: "Dragon",
            image: "assets/images/cards/Dragon.jpg",
            number: "8/45",
            setNumber: 8,
            type: "Fire",
            rarity: "Common",
            hp: 150,
            dmg: 300,
            description: "A classic Fire glass cannon. Heavy attack, fragile health, and immediate pressure.",
            unlocked: previewUnlockedIds.has("dragon"),
 isSecret: false
        },
        {
            id: "kirin",
            name: "Kirin",
            image: "assets/images/cards/Kirin.jpg",
            number: "9/45",
            setNumber: 9,
            type: "Fire",
            rarity: "Common",
            hp: 180,
            dmg: 290,
            description: "An aggressive Fire card with high damage and a cleaner compact silhouette.",
            unlocked: previewUnlockedIds.has("kirin"),
 isSecret: false
        },
        {
            id: "cracken",
            name: "Cracken",
            image: "assets/images/cards/Cracken.jpg",
            number: "15/45",
            setNumber: 15,
            type: "Water",
            rarity: "Common",
            hp: 220,
            dmg: 280,
            description: "A stronger Water attacker in the preview pool with more pressure than a typical tank card.",
            unlocked: previewUnlockedIds.has("cracken"),
 isSecret: false
        },
        {
            id: "penguin",
            name: "Penguin",
            image: "assets/images/cards/Penguin.jpg",
            number: "16/45",
            setNumber: 16,
            type: "Water",
            rarity: "Common",
            hp: 270,
            dmg: 230,
            description: "A steadier Water card with higher health and a calmer offensive profile.",
            unlocked: previewUnlockedIds.has("penguin"),
 isSecret: false
        },
        {
            id: "bird",
            name: "Bird",
            image: "assets/images/cards/Bird.jpg",
            number: "22/45",
            setNumber: 22,
            type: "Air",
            rarity: "Common",
            hp: 275,
            dmg: 225,
            description: "An Air-aligned creature with balanced survivability and a lighter, agile feel.",
            unlocked: previewUnlockedIds.has("bird"),
 isSecret: false
        },
        {
            id: "owl",
            name: "Owl",
            image: "assets/images/cards/Owl.jpg",
            number: "29/45",
            setNumber: 29,
            type: "Phantom",
            rarity: "Common",
            hp: 210,
            dmg: 260,
            description: "A Phantom card with a ghostly theme and sharper offensive edge.",
            unlocked: previewUnlockedIds.has("owl"),
 isSecret: false
        },
        {
            id: "golem",
            name: "Golem",
            image: "assets/images/cards/Golem.jpg",
            number: "36/45",
            setNumber: 36,
            type: "Magic",
            rarity: "Common",
            hp: 300,
            dmg: 210,
            description: "A Magic-aligned heavier body with defensive presence and clean mystic framing.",
            unlocked: previewUnlockedIds.has("golem"),
 isSecret: false
        },
        {
            id: "narwhal",
            name: "Narwhal",
            image: "assets/images/cards/Narwhal.jpg",
            number: "43/45",
            setNumber: 43,
            type: "Plasma",
            rarity: "Epic",
            hp: 250,
            dmg: 325,
            description: "One of the few premium-tier cards currently illustrated. Plasma-aligned and stat-heavy.",
            unlocked: previewUnlockedIds.has("narwhal"),
 isSecret: false
        },
        {
            id: "secret1",
            name: "Secret Prototype",
            image: "assets/images/cards/Secret1.jpg",
            number: "46/45",
            setNumber: 46,
            type: "Unknown",
            rarity: "Secret",
            hp: null,
            dmg: null,
            description: "A temporary secret placeholder. Hidden from players until a secret is actually unlocked.",
            unlocked: previewUnlockedIds.has("secret1"),
 isSecret: true
        }
    ];

    const rarityOrder = {
        Common: 1,
        Epic: 2,
        Legendary: 3,
        Secret: 4
    };

    const typeOrder = {
        Grass: 1,
        Fire: 2,
        Water: 3,
        Air: 4,
        Phantom: 5,
        Magic: 6,
        Plasma: 7,
        Unknown: 8
    };

    const state = {
        query: "",
        rarity: "all",
        type: "all",
        sort: "number",
        view: "all"
    };

    const normalize = (value) =>
    String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, " ")
    .trim();

    const isSubsequence = (needle, haystack) => {
        let index = 0;
        for (const character of haystack) {
            if (character === needle[index]) {
                index += 1;
                if (index === needle.length) {
                    return true;
                }
            }
        }
        return needle.length > 1 && index === needle.length;
    };

    const formatStat = (value) => (typeof value === "number" ? String(value) : "TBD");
    const statSortValue = (value) => (typeof value === "number" ? value : -1);

    const hasKnownSecret = () => cards.some((card) => card.isSecret && card.unlocked);

    const getVisiblePool = () => cards.filter((card) => !card.isSecret || card.unlocked);

    const syncRarityOptions = () => {
        const secretOption = rarityFilter.querySelector('option[value="Secret"]');
        const shouldShowSecret = hasKnownSecret();

        if (shouldShowSecret && !secretOption) {
            const option = document.createElement("option");
            option.value = "Secret";
            option.textContent = "Secret";
            rarityFilter.appendChild(option);
        }

        if (!shouldShowSecret && secretOption) {
            if (state.rarity === "Secret") {
                state.rarity = "all";
                rarityFilter.value = "all";
            }
            secretOption.remove();
        }
    };

    const getSearchScore = (card, query) => {
        const normalizedQuery = normalize(query);
        if (!normalizedQuery) {
            return 0;
        }

        const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
        const fields = [
            normalize(card.name),
 normalize(card.type),
 normalize(card.rarity),
 normalize(card.number),
 normalize(card.hp),
 normalize(card.dmg),
 normalize(card.unlocked ? "unlocked owned discovered" : "locked hidden missing"),
 normalize(`${card.name} ${card.type} ${card.rarity} ${card.number} ${card.hp ?? ""} ${card.dmg ?? ""}`)
        ];

        let matchedTokens = 0;
        let score = 0;

        tokens.forEach((token) => {
            let best = 0;

            fields.forEach((field) => {
                if (!field) {
                    return;
                }

                if (field.includes(token)) {
                    best = Math.max(best, 6);
                } else if (isSubsequence(token, field.replace(/\s+/g, ""))) {
                    best = Math.max(best, 3);
                }
            });

            if (best > 0) {
                matchedTokens += 1;
                score += best;
            }
        });

        if (matchedTokens === 0) {
            return -1;
        }

        return score + matchedTokens * 4;
    };

    const compareCards = (first, second) => {
        switch (state.sort) {
            case "name":
                return first.name.localeCompare(second.name);
            case "rarity":
                return (
                    (rarityOrder[first.rarity] || 99) - (rarityOrder[second.rarity] || 99) ||
                    first.setNumber - second.setNumber
                );
            case "type":
                return (
                    (typeOrder[first.type] || 99) - (typeOrder[second.type] || 99) ||
                    first.setNumber - second.setNumber
                );
            case "hp":
                return statSortValue(second.hp) - statSortValue(first.hp) || first.setNumber - second.setNumber;
            case "dmg":
                return statSortValue(second.dmg) - statSortValue(first.dmg) || first.setNumber - second.setNumber;
            case "status":
                return Number(second.unlocked) - Number(first.unlocked) || first.setNumber - second.setNumber;
            case "number":
            default:
                return first.setNumber - second.setNumber;
        }
    };

    const getFilteredCards = () => {
        const base = getVisiblePool().filter((card) => {
            if (state.view === "unlocked" && !card.unlocked) {
                return false;
            }

            if (state.rarity !== "all" && card.rarity !== state.rarity) {
                return false;
            }

            if (state.type !== "all" && card.type !== state.type) {
                return false;
            }

            return true;
        });

        const query = state.query.trim();
        const scored = base
        .map((card) => ({
            card,
            score: getSearchScore(card, query)
        }))
        .filter((entry) => query === "" || entry.score > -1);

        scored.sort((first, second) => {
            if (query && second.score !== first.score) {
                return second.score - first.score;
            }
            return compareCards(first.card, second.card);
        });

        return scored.map((entry) => entry.card);
    };

    const renderMaster = (shownCount) => {
        const visiblePool = getVisiblePool();
        const unlockedMainCount = cards.filter((card) => card.unlocked && !card.isSecret).length;
        const visibleMainCount = visiblePool.filter((card) => !card.isSecret).length;
        const lockedMainCount = visiblePool.filter((card) => !card.unlocked && !card.isSecret).length;
        const unlockedSecretCount = cards.filter((card) => card.isSecret && card.unlocked).length;

        masterUnlockedValue.innerHTML = `${unlockedMainCount} <span>/ ${totalSetCards}</span>`;
        masterVisibleValue.textContent = String(visibleMainCount);
        masterLockedValue.textContent = String(lockedMainCount);
        masterShownValue.textContent = String(shownCount);

        if (unlockedSecretCount > 0) {
            masterSpecialValue.textContent = String(unlockedSecretCount);
            masterSpecialLabel.textContent = "Secret Seen";
        } else {
            masterSpecialValue.textContent = String(visibleMainCount);
            masterSpecialLabel.textContent = "Preview Pool";
        }
    };

    const renderGrid = (filteredCards) => {
        if (!filteredCards.length) {
            grid.innerHTML = `
            <div class="vault-empty luxury-panel">
            No cards match the current search and filters.
            </div>
            `;
            return;
        }

        grid.innerHTML = filteredCards
        .map((card) => {
            const statusClass = card.unlocked ? "unlocked" : "locked";
            const statusLabel = card.unlocked ? "Unlocked" : "Locked";

            return `
            <button
            type="button"
            class="vault-card reveal-card js-collection-reveal ${card.unlocked ? "" : "is-locked"}"
            data-collection-reveal
            data-reveal-card
            data-card-id="${card.id}"
            aria-label="Open ${card.name} details"
            >
            <span
            class="vault-card-media tilt-scene js-collection-tilt"
            data-collection-tilt
            data-tilt-scene
            data-tilt-max="11"
            >
            <span class="card-container">
            <span class="card-face">
            <img src="${card.image}" alt="${card.name} card" width="614" height="889" />
            <span class="shine"></span>
            </span>
            </span>
            </span>

            <span class="vault-card-head">
            <span class="vault-card-name">${card.name}</span>
            <span class="vault-card-status ${statusClass}">${statusLabel}</span>
            </span>

            <span class="vault-card-meta">${card.rarity} · ${card.type}</span>
            <span class="vault-card-line">
            <span>${card.number}</span>
            <span>HP ${formatStat(card.hp)} / DMG ${formatStat(card.dmg)}</span>
            </span>
            </button>
            `;
        })
        .join("");
    };

    const updateResultsMeta = (shownCount) => {
        const visibleMainCount = getVisiblePool().filter((card) => !card.isSecret).length;
        const unlockedMainCount = cards.filter((card) => card.unlocked && !card.isSecret).length;
        const unlockedSecretCount = cards.filter((card) => card.isSecret && card.unlocked).length;

        let text = `Showing ${shownCount} cards · ${unlockedMainCount} of ${visibleMainCount} main-set preview cards unlocked.`;

        if (unlockedSecretCount > 0) {
            text += ` ${unlockedSecretCount} secret card discovered.`;
        }

        resultsMeta.textContent = text;
    };

    const bindTiltScenes = (root) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const scenes = root.querySelectorAll("[data-collection-tilt]");
        const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

        scenes.forEach((scene) => {
            if (scene.dataset.collectionTiltBound === "true") {
                return;
            }

            scene.dataset.collectionTiltBound = "true";
            scene.style.display = "block";

            const container = scene.querySelector(".card-container");
            const card = scene.querySelector(".card-face");
            const shine = scene.querySelector(".shine");

            if (!container || !card || !shine) {
                return;
            }

            container.style.display = "block";
            card.style.display = "block";

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
                scene.addEventListener("pointerenter", (event) => {
                    if (event.pointerType === "touch") {
                        return;
                    }
                    start();
                    updatePoint(event.clientX, event.clientY);
                });

                scene.addEventListener("pointermove", (event) => {
                    if (!isActive || event.pointerType === "touch") {
                        return;
                    }
                    updatePoint(event.clientX, event.clientY);
                });

                scene.addEventListener("pointerleave", () => {
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

            scene.addEventListener("touchend", stop, { passive: true });
            scene.addEventListener("touchcancel", stop, { passive: true });
        });
    };

    const bindRevealCards = (root) => {
        if (
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
            !window.matchMedia("(hover: hover) and (pointer: fine)").matches
        ) {
            return;
        }

        root.querySelectorAll("[data-collection-reveal]").forEach((card) => {
            if (card.dataset.collectionRevealBound === "true") {
                return;
            }

            card.dataset.collectionRevealBound = "true";

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
    };

    const openCardModal = (card) => {
        const statusClass = card.unlocked ? "unlocked" : "locked";
        const statusLabel = card.unlocked ? "Unlocked" : "Locked";

        modalBody.innerHTML = `
        <div class="card-detail-layout">
        <div class="card-detail-visual">
        <div
        class="card-detail-image tilt-scene ${card.unlocked ? "" : "is-locked"}"
        data-collection-tilt
        data-tilt-scene
        data-tilt-max="8"
        >
        <div class="card-container">
        <div class="card-face">
        <img src="${card.image}" alt="${card.name} card" width="614" height="889" />
        <span class="shine"></span>
        </div>
        </div>
        </div>
        </div>

        <div class="card-detail-copy">
        <p class="card-detail-kicker">${card.number}</p>
        <h2 class="card-detail-title" id="cardDetailTitle">${card.name}</h2>

        <div class="card-detail-subline">
        <span class="card-detail-badge type">${card.type}</span>
        <span class="card-detail-badge">${card.rarity}</span>
        <span class="card-detail-badge status ${statusClass}">${statusLabel}</span>
        </div>

        <p class="card-detail-copy-text">${card.description}</p>

        <div class="card-detail-stat-grid">
        <article class="card-detail-stat">
        <span>HP</span>
        <strong>${formatStat(card.hp)}</strong>
        </article>
        <article class="card-detail-stat">
        <span>DMG</span>
        <strong>${formatStat(card.dmg)}</strong>
        </article>
        <article class="card-detail-stat">
        <span>Total</span>
        <strong>${typeof card.hp === "number" && typeof card.dmg === "number" ? card.hp + card.dmg : "TBD"}</strong>
        </article>
        </div>

        <div class="card-detail-info-grid">
        <article class="card-detail-info">
        <span>Type</span>
        <strong>${card.type}</strong>
        </article>
        <article class="card-detail-info">
        <span>Rarity</span>
        <strong>${card.rarity}</strong>
        </article>
        <article class="card-detail-info">
        <span>Set Number</span>
        <strong>${card.number}</strong>
        </article>
        <article class="card-detail-info">
        <span>Preview Status</span>
        <strong>${statusLabel}</strong>
        </article>
        </div>
        </div>
        </div>
        `;

        bindTiltScenes(modalBody);

        modal.hidden = false;
        document.body.classList.add("modal-open");

        requestAnimationFrame(() => {
            modal.classList.add("is-open");
            modal.querySelector(".card-detail-close")?.focus({ preventScroll: true });
        });
    };

    const closeCardModal = () => {
        if (modal.hidden) {
            return;
        }

        modal.classList.remove("is-open");
        document.body.classList.remove("modal-open");

        window.setTimeout(() => {
            modal.hidden = true;
            modalBody.innerHTML = "";
        }, 280);
    };

    const render = () => {
        syncRarityOptions();

        const filteredCards = getFilteredCards();

        renderMaster(filteredCards.length);
        updateResultsMeta(filteredCards.length);
        renderGrid(filteredCards);
        bindTiltScenes(grid);
        bindRevealCards(grid);
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
    });

    searchInput.addEventListener("input", () => {
        state.query = searchInput.value;
        render();
    });

    rarityFilter.addEventListener("change", () => {
        state.rarity = rarityFilter.value;
        render();
    });

    typeFilter.addEventListener("change", () => {
        state.type = typeFilter.value;
        render();
    });

    sortFilter.addEventListener("change", () => {
        state.sort = sortFilter.value;
        render();
    });

    ownershipToggle.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLButtonElement)) {
            return;
        }

        const view = target.dataset.view;
        if (!view) {
            return;
        }

        state.view = view;

        ownershipToggle.querySelectorAll("button").forEach((button) => {
            button.classList.toggle("is-active", button === target);
        });

        render();
    });

    grid.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const button = target.closest("[data-card-id]");
        if (!(button instanceof HTMLElement)) {
            return;
        }

        const card = cards.find((entry) => entry.id === button.dataset.cardId);
        if (!card) {
            return;
        }

        openCardModal(card);
    });

    modal.addEventListener("click", (event) => {
        const target = event.target;
        if (target instanceof Element && target.hasAttribute("data-close-card-modal")) {
            closeCardModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (modal.hidden) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closeCardModal();
        }
    });

    render();
})();
