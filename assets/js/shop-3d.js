import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const STORAGE_GOLD = "cards20-gold";
const STORAGE_UNLOCKED = "cards20-unlocked";
const STORAGE_SHOP_VERSION = "cards20-shop-version";
const SHOP_VERSION = "three-pack-v2";

const DEFAULT_GOLD = 10000;
const DEFAULT_UNLOCKED = [
    "skeleton",
"anaconda",
"dragon",
"narwhal",
"secret1"
];

const CARD_BACK_CANDIDATES = [
    "assets/images/cards/card_back.jpg",
"assets/images/cards/card_back.png"
];

const cardPool = [
    { id: "skeleton", name: "Skeleton", image: "assets/images/cards/Skeleton.jpg", number: "1/45", setNumber: 1, type: "Grass", rarity: "Common", hp: 250, dmg: 250 },
{ id: "anaconda", name: "Anaconda", image: "assets/images/cards/Anaconda.jpg", number: "7/45", setNumber: 7, type: "Grass", rarity: "Legendary", hp: 350, dmg: 300 },
{ id: "dragon", name: "Dragon", image: "assets/images/cards/Dragon.jpg", number: "8/45", setNumber: 8, type: "Fire", rarity: "Common", hp: 150, dmg: 300 },
{ id: "kirin", name: "Kirin", image: "assets/images/cards/Kirin.jpg", number: "9/45", setNumber: 9, type: "Fire", rarity: "Common", hp: 180, dmg: 290 },
{ id: "cracken", name: "Cracken", image: "assets/images/cards/Cracken.jpg", number: "15/45", setNumber: 15, type: "Water", rarity: "Common", hp: 220, dmg: 280 },
{ id: "penguin", name: "Penguin", image: "assets/images/cards/Penguin.jpg", number: "16/45", setNumber: 16, type: "Water", rarity: "Common", hp: 270, dmg: 230 },
{ id: "bird", name: "Bird", image: "assets/images/cards/Bird.jpg", number: "22/45", setNumber: 22, type: "Air", rarity: "Common", hp: 275, dmg: 225 },
{ id: "owl", name: "Owl", image: "assets/images/cards/Owl.jpg", number: "29/45", setNumber: 29, type: "Phantom", rarity: "Common", hp: 210, dmg: 260 },
{ id: "golem", name: "Golem", image: "assets/images/cards/Golem.jpg", number: "36/45", setNumber: 36, type: "Magic", rarity: "Common", hp: 300, dmg: 210 },
{ id: "narwhal", name: "Narwhal", image: "assets/images/cards/Narwhal.jpg", number: "43/45", setNumber: 43, type: "Plasma", rarity: "Epic", hp: 250, dmg: 325 },
{ id: "secret1", name: "Secret Prototype", image: "assets/images/cards/Secret1.jpg", number: "46/45", setNumber: 46, type: "Unknown", rarity: "Secret", hp: 360, dmg: 360 }
];

const packConfigs = {
    standard: {
        id: "standard",
        name: "Standard Pack",
        cost: 120,
        cards: 4,
        focus: "Common-heavy",
        best: "Legendary chance",
        subtitle: "4 cards · common-heavy spread",
        description:
        "A steadier entry pack aimed at broad collection growth. It mostly produces commons, but stronger hits can still break through.",
        colors: {
            baseA: "#2e5e19",
            baseB: "#121212",
            accent: "#f1c40f",
            glint: "#cfff78",
            glow: "#8cd335"
        }
    },
    epic: {
        id: "epic",
        name: "Epic Pack",
        cost: 260,
        cards: 5,
        focus: "Premium odds",
        best: "Epic or better",
        subtitle: "5 cards · premium odds",
        description:
        "A stronger pack with a more exciting ceiling. It leans toward better outcomes and gives a much better shot at premium pulls.",
        colors: {
            baseA: "#7e1f6f",
            baseB: "#121212",
            accent: "#ff77c6",
            glint: "#ff9ee4",
            glow: "#db67ff"
        }
    }
};

const goldValue = document.getElementById("marketGoldValue");
const packList = document.getElementById("marketPackList");
const sidebarNote = document.getElementById("marketSidebarNote");
const stageTitle = document.getElementById("marketStageTitle");
const stagePrice = document.getElementById("marketStagePrice");
const packGuidance = document.getElementById("packGuidance");
const buyPackButton = document.getElementById("buyPackButton");
const detailCount = document.getElementById("marketDetailCount");
const detailFocus = document.getElementById("marketDetailFocus");
const detailBest = document.getElementById("marketDetailBest");
const detailPrice = document.getElementById("marketDetailPrice");
const detailCopy = document.getElementById("marketDetailCopy");
const pullStatus = document.getElementById("marketPullStatus");
const openedPackMeta = document.getElementById("openedPackMeta");
const revealedCards = document.getElementById("revealedCards");
const viewport = document.getElementById("pack3dViewport");

if (
    !goldValue ||
    !packList ||
    !sidebarNote ||
    !stageTitle ||
    !stagePrice ||
    !packGuidance ||
    !buyPackButton ||
    !detailCount ||
    !detailFocus ||
    !detailBest ||
    !detailPrice ||
    !detailCopy ||
    !pullStatus ||
    !openedPackMeta ||
    !revealedCards ||
    !viewport
) {
    throw new Error("Marketplace DOM is missing required elements.");
}

function loadGold() {
    const version = localStorage.getItem(STORAGE_SHOP_VERSION);

    if (version !== SHOP_VERSION) {
        localStorage.setItem(STORAGE_SHOP_VERSION, SHOP_VERSION);
        localStorage.setItem(STORAGE_GOLD, String(DEFAULT_GOLD));
        return DEFAULT_GOLD;
    }

    const parsed = Number(localStorage.getItem(STORAGE_GOLD));
    if (Number.isFinite(parsed) && parsed >= 0) {
        return Math.floor(parsed);
    }

    localStorage.setItem(STORAGE_GOLD, String(DEFAULT_GOLD));
    return DEFAULT_GOLD;
}

function saveGold(value) {
    localStorage.setItem(STORAGE_GOLD, String(Math.max(0, Math.floor(value))));
}

function loadUnlocked() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_UNLOCKED) || "null");
        if (Array.isArray(parsed) && parsed.length) {
            return new Set(parsed);
        }
    } catch (error) {
        //
    }

    localStorage.setItem(STORAGE_UNLOCKED, JSON.stringify(DEFAULT_UNLOCKED));
    return new Set(DEFAULT_UNLOCKED);
}

function saveUnlocked(unlockedSet) {
    localStorage.setItem(STORAGE_UNLOCKED, JSON.stringify(Array.from(unlockedSet)));
}

function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
}

function uniquePick(pool, excluded) {
    const available = pool.filter((card) => !excluded.has(card.id));
    const source = available.length ? available : pool;
    const card = randomFrom(source);
    excluded.add(card.id);
    return card;
}

function pickWeightedRarity(weights) {
    const total = weights.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * total;

    for (const entry of weights) {
        roll -= entry.weight;
        if (roll <= 0) {
            return entry.rarity;
        }
    }

    return weights[weights.length - 1].rarity;
}

function poolByRarity(rarity) {
    return cardPool.filter((card) => card.rarity === rarity);
}

function pullByRarity(rarityList, excluded) {
    const pool = cardPool.filter((card) => rarityList.includes(card.rarity) && !excluded.has(card.id));
    if (pool.length) {
        return uniquePick(pool, excluded);
    }
    return uniquePick(cardPool, excluded);
}

function generateStandardPack() {
    const excluded = new Set();
    const commons = poolByRarity("Common");

    const pulls = [
        uniquePick(commons, excluded),
        uniquePick(commons, excluded),
        uniquePick(commons, excluded)
    ];

    const bonusRarity = pickWeightedRarity([
        { rarity: "Common", weight: 70 },
        { rarity: "Epic", weight: 18 },
        { rarity: "Legendary", weight: 9 },
        { rarity: "Secret", weight: 3 }
    ]);

    pulls.push(pullByRarity([bonusRarity], excluded));
    return shuffle(pulls);
}

function generateEpicPack() {
    const excluded = new Set();
    const commons = poolByRarity("Common");

    const pulls = [
        uniquePick(commons, excluded),
        uniquePick(commons, excluded)
    ];

    const midRarity = pickWeightedRarity([
        { rarity: "Common", weight: 54 },
        { rarity: "Epic", weight: 28 },
        { rarity: "Legendary", weight: 14 },
        { rarity: "Secret", weight: 4 }
    ]);

    pulls.push(pullByRarity([midRarity], excluded));

    const guaranteedPremium = pickWeightedRarity([
        { rarity: "Epic", weight: 68 },
        { rarity: "Legendary", weight: 25 },
        { rarity: "Secret", weight: 7 }
    ]);

    pulls.push(pullByRarity([guaranteedPremium], excluded));

    const bonusRarity = pickWeightedRarity([
        { rarity: "Common", weight: 28 },
        { rarity: "Epic", weight: 38 },
        { rarity: "Legendary", weight: 24 },
        { rarity: "Secret", weight: 10 }
    ]);

    pulls.push(pullByRarity([bonusRarity], excluded));
    return shuffle(pulls);
}

function generatePack(packId) {
    return packId === "epic" ? generateEpicPack() : generateStandardPack();
}

function createCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function createPackFrontTexture(config) {
    const canvas = createCanvas(1024, 1536);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Could not create 2D canvas context.");
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const glintA = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    glintA.addColorStop(0, "rgba(255,255,255,0)");
    glintA.addColorStop(0.42, `${config.colors.glint}15`);
    glintA.addColorStop(0.5, `${config.colors.glint}35`);
    glintA.addColorStop(0.58, `${config.colors.glint}15`);
    glintA.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glintA;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.font = "700 118px Syne, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CARDs", canvas.width / 2 - 72, 236);

    ctx.fillStyle = config.colors.accent;
    ctx.font = "700 92px Syne, sans-serif";
    ctx.fillText("2.0", canvas.width / 2 + 212, 236);

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "700 106px Syne, sans-serif";
    ctx.fillText(config.name, canvas.width / 2, 520);

    ctx.fillStyle = "rgba(255,255,255,0.74)";
    ctx.font = "500 54px Syne, sans-serif";
    ctx.fillText(`${config.cards} Cards`, canvas.width / 2, 618);

    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.font = "500 42px Syne, sans-serif";
    ctx.fillText(config.focus, canvas.width / 2, 678);

    const orb = ctx.createRadialGradient(canvas.width / 2, 930, 40, canvas.width / 2, 930, 200);
    orb.addColorStop(0, `${config.colors.accent}ee`);
    orb.addColorStop(0.3, `${config.colors.accent}55`);
    orb.addColorStop(0.7, `${config.colors.accent}11`);
    orb.addColorStop(1, "transparent");
    ctx.fillStyle = orb;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 930, 178, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.09)";
    ctx.lineWidth = 2;
    for (let i = -2; i < 16; i += 1) {
        const x = i * 80;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 320, 1536);
        ctx.stroke();
    }

    ctx.fillStyle = "rgba(255,255,255,0.24)";
    ctx.font = "600 32px Syne, sans-serif";
    ctx.fillText("SEALEd BOOSTER", canvas.width / 2, 1340);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createTearStripTexture(config) {
    const canvas = createCanvas(1024, 280);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Could not create 2D canvas context.");
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const shine = ctx.createLinearGradient(0, 0, canvas.width, 0);
    shine.addColorStop(0, "rgba(255,255,255,0)");
    shine.addColorStop(0.25, `${config.colors.glint}10`);
    shine.addColorStop(0.5, `${config.colors.glint}35`);
    shine.addColorStop(0.75, `${config.colors.glint}10`);
    shine.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "700 74px Syne, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DRAG TO TEAR", canvas.width / 2, 174);

    ctx.strokeStyle = `${config.colors.accent}66`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(148, 146);
    ctx.lineTo(258, 146);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(766, 146);
    ctx.lineTo(876, 146);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createFoilTexture(colorHex) {
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Could not create 2D canvas context.");
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((-26 * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    for (let index = -3; index < 18; index += 1) {
        const x = index * 48;
        const gradient = ctx.createLinearGradient(x, 0, x + 40, 0);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.4, `${colorHex}04`);
        gradient.addColorStop(0.5, `${colorHex}30`);
        gradient.addColorStop(0.6, `${colorHex}08`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, -180, 28, 900);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createShineTexture() {
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Could not create 2D canvas context.");
    }

    const gradient = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.22, "rgba(255,255,255,0.18)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.04)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function loadTexture(loader, url) {
    return new Promise((resolve, reject) => {
        loader.load(
            url,
            (texture) => resolve(texture),
                    undefined,
                    () => reject(new Error(`Failed to load texture: ${url}`))
        );
    });
}

async function loadTextureAny(loader, urls) {
    for (const url of urls) {
        try {
            const texture = await loadTexture(loader, url);
            texture.colorSpace = THREE.SRGBColorSpace;
            return texture;
        } catch (error) {
            //
        }
    }

    throw new Error(`Could not load any texture from: ${urls.join(", ")}`);
}

function createRoundedCard(frontTexture, backTexture) {
    const geometry = new RoundedBoxGeometry(1.15, 1.66, 0.03, 6, 0.065);
    const material = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.75,
        metalness: 0.08
    });
    const mesh = new THREE.Mesh(geometry, material);

    const frontPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.09, 1.6),
                                      new THREE.MeshBasicMaterial({ map: frontTexture, transparent: false })
    );
    frontPlane.position.z = 0.016;
    mesh.add(frontPlane);

    const backPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.09, 1.6),
                                     new THREE.MeshBasicMaterial({ map: backTexture, transparent: false })
    );
    backPlane.rotation.y = Math.PI;
    backPlane.position.z = -0.016;
    mesh.add(backPlane);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function roundedUpperShape(width, height, seamPoints, radius) {
    const half = width / 2;
    const shape = new THREE.Shape();

    shape.moveTo(-half, seamPoints[0].y);

    for (let index = 1; index < seamPoints.length; index += 1) {
        shape.lineTo(seamPoints[index].x, seamPoints[index].y);
    }

    shape.lineTo(half, height - radius);
    shape.quadraticCurveTo(half, height, half - radius, height);
    shape.lineTo(-half + radius, height);
    shape.quadraticCurveTo(-half, height, -half, height - radius);
    shape.lineTo(-half, seamPoints[0].y);
    shape.closePath();

    return shape;
}

function roundedLowerShape(width, seamPoints, radius) {
    const half = width / 2;
    const shape = new THREE.Shape();

    shape.moveTo(-half + radius, 0);
    shape.lineTo(half - radius, 0);
    shape.quadraticCurveTo(half, 0, half, radius);
    shape.lineTo(half, seamPoints[seamPoints.length - 1].y);

    for (let index = seamPoints.length - 2; index >= 0; index -= 1) {
        shape.lineTo(seamPoints[index].x, seamPoints[index].y);
    }

    shape.lineTo(-half, radius);
    shape.quadraticCurveTo(-half, 0, -half + radius, 0);
    shape.closePath();

    return shape;
}

function createExtrudedMesh(shape, depth, material, yOffset) {
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelThickness: 0.018,
        bevelSize: 0.018,
        curveSegments: 20
    });

    geometry.translate(0, -yOffset, -depth / 2);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

class Pack3DStage {
    constructor(container, textures, callbacks) {
        this.container = container;
        this.textures = textures;
        this.callbacks = callbacks;
        this.clock = new THREE.Clock();

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        this.camera.position.set(0, 0.18, 5.6);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setSize(container.clientWidth, container.clientHeight, false);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.domElement.setAttribute("aria-hidden", "true");
        container.appendChild(this.renderer.domElement);

        this.sceneRoot = new THREE.Group();
        this.scene.add(this.sceneRoot);

        this.packRoot = new THREE.Group();
        this.sceneRoot.add(this.packRoot);

        this.tempGroup = new THREE.Group();
        this.sceneRoot.add(this.tempGroup);

        this.pointer = {
            active: false,
            nx: 0.5,
            ny: 0.5,
            downX: 0,
            downY: 0
        };

        this.drag = {
            active: false,
            pointerId: null,
            startX: 0
        };

        this.ripCurrent = 0;
        this.ripTarget = 0;
        this.isPurchased = false;
        this.isOpened = false;
        this.canReveal = false;

        this.stackEntries = [];
        this.flyingEntries = [];

        this.setupLights();
        this.setupFloor();
        this.buildPack("standard");
        this.bindEvents();
        this.onResize();
        this.animate();
    }

    setupLights() {
        const ambient = new THREE.HemisphereLight(0xffffff, 0x080808, 1.2);
        this.scene.add(ambient);

        const key = new THREE.DirectionalLight(0xffffff, 1.65);
        key.position.set(2.8, 3.8, 3.5);
        key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        key.shadow.bias = -0.0002;
        this.scene.add(key);

        const fill = new THREE.PointLight(0xf1c40f, 0.55, 8, 2);
        fill.position.set(-2.2, 0.2, 2.6);
        this.scene.add(fill);

        const back = new THREE.PointLight(0xffffff, 0.18, 9, 2);
        back.position.set(0, 1.2, -3.4);
        this.scene.add(back);
    }

    setupFloor() {
        const floorGlow = new THREE.Mesh(
            new THREE.CircleGeometry(4.2, 64),
                                         new THREE.MeshBasicMaterial({
                                             color: 0xf1c40f,
                                             transparent: true,
                                             opacity: 0.08
                                         })
        );
        floorGlow.rotation.x = -Math.PI / 2;
        floorGlow.position.set(0, -1.72, 0);
        this.scene.add(floorGlow);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
                                     new THREE.MeshStandardMaterial({
                                         color: 0x090909,
                                         roughness: 0.96,
                                         metalness: 0.02,
                                         transparent: true,
                                         opacity: 0.96
                                     })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, -1.78, 0);
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    buildPack(packId) {
        this.selectedConfig = packConfigs[packId];
        this.packRoot.clear();
        this.stackEntries = [];
        this.flyingEntries = [];
        this.tempGroup.clear();

        const PACK_WIDTH = 1.82;
        const PACK_HEIGHT = 2.52;
        const PACK_DEPTH = 0.14;
        const SEAM_Y = 2.07;
        const seamPoints = [
            new THREE.Vector2(-0.91, SEAM_Y),
            new THREE.Vector2(-0.68, SEAM_Y - 0.04),
            new THREE.Vector2(-0.44, SEAM_Y + 0.028),
            new THREE.Vector2(-0.22, SEAM_Y - 0.055),
            new THREE.Vector2(0.0, SEAM_Y + 0.02),
            new THREE.Vector2(0.22, SEAM_Y - 0.05),
            new THREE.Vector2(0.44, SEAM_Y + 0.024),
            new THREE.Vector2(0.68, SEAM_Y - 0.038),
            new THREE.Vector2(0.91, SEAM_Y)
        ];

        const lowerMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(this.selectedConfig.colors.baseA),
                                                             roughness: 0.42,
                                                             metalness: 0.18,
                                                             clearcoat: 0.44,
                                                             clearcoatRoughness: 0.22
        });

        const upperMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(this.selectedConfig.colors.baseA),
                                                             roughness: 0.38,
                                                             metalness: 0.2,
                                                             clearcoat: 0.48,
                                                             clearcoatRoughness: 0.2
        });

        const lowerShape = roundedLowerShape(PACK_WIDTH, seamPoints, 0.18);
        const upperShape = roundedUpperShape(PACK_WIDTH, PACK_HEIGHT, seamPoints, 0.18);

        this.lowerBody = createExtrudedMesh(lowerShape, PACK_DEPTH, lowerMaterial, PACK_HEIGHT / 2);
        this.upperStrip = createExtrudedMesh(upperShape, PACK_DEPTH, upperMaterial, PACK_HEIGHT / 2);

        this.packRoot.add(this.lowerBody);

        this.tearGroup = new THREE.Group();
        this.tearGroup.add(this.upperStrip);
        this.packRoot.add(this.tearGroup);

        this.frontDesignTexture = createPackFrontTexture(this.selectedConfig);
        this.frontDesignPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(1.42, 2.02),
                                               new THREE.MeshBasicMaterial({
                                                   map: this.frontDesignTexture,
                                                   transparent: true,
                                                   depthWrite: false
                                               })
        );
        this.frontDesignPlane.position.set(0, 0.02, PACK_DEPTH / 2 + 0.02);
        this.packRoot.add(this.frontDesignPlane);

        this.foilTexture = createFoilTexture(this.selectedConfig.colors.glint);
        this.foilTexture.repeat.set(1.2, 1.2);
        this.foilPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(1.54, 2.14),
                                        new THREE.MeshBasicMaterial({
                                            map: this.foilTexture,
                                            transparent: true,
                                            opacity: 0.26,
                                            blending: THREE.AdditiveBlending,
                                            depthWrite: false
                                        })
        );
        this.foilPlane.position.set(0, 0.02, PACK_DEPTH / 2 + 0.03);
        this.packRoot.add(this.foilPlane);

        this.shineTexture = createShineTexture();
        this.shinePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.88, 0.88),
                                         new THREE.MeshBasicMaterial({
                                             map: this.shineTexture,
                                             transparent: true,
                                             opacity: 0,
                                             blending: THREE.AdditiveBlending,
                                             depthWrite: false
                                         })
        );
        this.shinePlane.position.set(0, 0.2, PACK_DEPTH / 2 + 0.05);
        this.packRoot.add(this.shinePlane);

        this.tearTextTexture = createTearStripTexture(this.selectedConfig);
        this.tearTextPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(1.36, 0.25),
                                            new THREE.MeshBasicMaterial({
                                                map: this.tearTextTexture,
                                                transparent: true,
                                                depthWrite: false
                                            })
        );
        this.tearTextPlane.position.set(0, 1.01, PACK_DEPTH / 2 + 0.05);
        this.tearGroup.add(this.tearTextPlane);

        this.slotWell = new THREE.Mesh(
            new RoundedBoxGeometry(1.02, 1.52, 0.06, 6, 0.08),
                                       new THREE.MeshStandardMaterial({
                                           color: 0x050505,
                                           roughness: 1,
                                           metalness: 0
                                       })
        );
        this.slotWell.position.set(0, -0.28, 0.012);
        this.packRoot.add(this.slotWell);

        this.slotFrame = new THREE.Mesh(
            new RoundedBoxGeometry(1.13, 1.63, 0.05, 6, 0.1),
                                        new THREE.MeshStandardMaterial({
                                            color: 0x181818,
                                            roughness: 0.85,
                                            metalness: 0.08
                                        })
        );
        this.slotFrame.position.set(0, -0.28, PACK_DEPTH / 2 + 0.005);
        this.packRoot.add(this.slotFrame);

        this.stackGroup = new THREE.Group();
        this.stackGroup.position.set(0, -0.28, 0.025);
        this.packRoot.add(this.stackGroup);

        this.packRoot.position.set(0, 0.36, 0);
        this.showPreviewStack(this.selectedConfig.cards);
        this.applyRipProgress(0);
    }

    showPreviewStack(count) {
        this.stackGroup.clear();
        this.stackEntries = [];

        for (let index = 0; index < Math.min(count, 4); index += 1) {
            const mesh = createRoundedCard(this.textures.cardBack, this.textures.cardBack);
            mesh.scale.setScalar(0.72);
            mesh.rotation.y = Math.PI;
            mesh.position.set(index * 0.01, index * 0.014, -index * 0.02);
            this.stackGroup.add(mesh);
            this.stackEntries.push({ mesh, data: null });
        }
    }

    loadPurchasedPack(cards) {
        this.stackGroup.clear();
        this.stackEntries = [];

        for (let index = 0; index < cards.length; index += 1) {
            const cardData = cards[index];
            const mesh = createRoundedCard(this.textures.cards[cardData.id], this.textures.cardBack);
            mesh.scale.setScalar(0.72);
            mesh.rotation.y = Math.PI;
            mesh.position.set(index * 0.01, index * 0.014, -index * 0.02);
            this.stackGroup.add(mesh);

            this.stackEntries.push({
                mesh,
                data: cardData
            });
        }
    }

    setSelectedPack(packId) {
        if (this.isPurchased && !this.isOpened && this.stackEntries.length) {
            return;
        }

        if (this.isPurchased && this.isOpened && this.stackEntries.length) {
            return;
        }

        this.isPurchased = false;
        this.isOpened = false;
        this.canReveal = false;
        this.ripCurrent = 0;
        this.ripTarget = 0;
        this.buildPack(packId);
    }

    purchase(cards) {
        this.isPurchased = true;
        this.isOpened = false;
        this.canReveal = false;
        this.ripCurrent = 0;
        this.ripTarget = 0;
        this.buildPack(this.selectedConfig.id);
        this.loadPurchasedPack(cards);
    }

    clearPack() {
        this.isPurchased = false;
        this.isOpened = false;
        this.canReveal = false;
        this.ripCurrent = 0;
        this.ripTarget = 0;
        this.buildPack(this.selectedConfig.id);
    }

    applyRipProgress(progress) {
        this.tearGroup.position.x = progress * 1.04;
        this.tearGroup.position.y = progress * 0.08;
        this.tearGroup.position.z = progress * 0.08;
        this.tearGroup.rotation.z = -progress * 0.26;
        this.tearGroup.rotation.y = progress * 0.08;

        this.tearTextPlane.material.opacity = 1 - progress * 0.96;
    }

    pointerInfo(clientX, clientY) {
        const rect = this.container.getBoundingClientRect();
        const nx = (clientX - rect.left) / rect.width;
        const ny = (clientY - rect.top) / rect.height;

        return {
            nx,
            ny,
            hitPack: nx > 0.22 && nx < 0.78 && ny > 0.08 && ny < 0.92,
            inRipZone: nx > 0.22 && nx < 0.78 && ny > 0.08 && ny < 0.26
        };
    }

    setHover(clientX, clientY) {
        const rect = this.container.getBoundingClientRect();
        this.pointer.active = true;
        this.pointer.nx = THREE.MathUtils.clamp((clientX - rect.left) / rect.width, 0, 1);
        this.pointer.ny = THREE.MathUtils.clamp((clientY - rect.top) / rect.height, 0, 1);

        const localX = (this.pointer.nx - 0.5) * 1.12;
        const localY = (0.5 - this.pointer.ny) * 1.52;

        this.shinePlane.position.x = localX;
        this.shinePlane.position.y = 0.16 + localY * 0.26;
    }

    clearHover() {
        this.pointer.active = false;
    }

    startDrag(event) {
        if (!this.isPurchased || this.isOpened) {
            return false;
        }

        const info = this.pointerInfo(event.clientX, event.clientY);
        if (!info.hitPack || !info.inRipZone) {
            return false;
        }

        this.drag.active = true;
        this.drag.pointerId = event.pointerId;
        this.drag.startX = event.clientX;
        return true;
    }

    updateDrag(clientX) {
        const delta = clientX - this.drag.startX;
        const progress = THREE.MathUtils.clamp(delta / 120, 0, 1);
        this.ripCurrent = progress;
        this.ripTarget = progress;
        this.applyRipProgress(progress);
    }

    finishDrag() {
        const shouldOpen = this.ripCurrent >= 0.62;
        this.drag.active = false;
        this.drag.pointerId = null;

        if (shouldOpen) {
            const wasOpened = this.isOpened;
            this.isOpened = true;
            this.canReveal = true;
            this.ripTarget = 1;

            if (!wasOpened && this.callbacks?.onOpened) {
                this.callbacks.onOpened();
            }
        } else {
            this.ripTarget = 0;
        }
    }

    revealNext() {
        if (!this.isOpened || !this.canReveal || !this.stackEntries.length) {
            return null;
        }

        const nextEntry = this.stackEntries.pop();
        if (!nextEntry || !nextEntry.data) {
            return null;
        }

        this.scene.attach(nextEntry.mesh);

        this.flyingEntries.push({
            mesh: nextEntry.mesh,
            data: nextEntry.data,
            startTime: performance.now(),
                                fromPosition: nextEntry.mesh.position.clone(),
                                toPosition: new THREE.Vector3(1.75, 0.78, 1.3),
                                fromRotation: nextEntry.mesh.rotation.clone(),
                                toRotation: new THREE.Euler(-0.28, -0.56, 0.18),
                                duration: 520
        });

        this.layoutStackCards();

        if (this.stackEntries.length === 0) {
            this.canReveal = false;
        }

        return nextEntry.data;
    }

    layoutStackCards() {
        this.stackEntries.forEach((entry, index) => {
            const targetX = index * 0.01;
            const targetY = index * 0.014;
            const targetZ = -index * 0.02;

            entry.mesh.position.x += (targetX - entry.mesh.position.x) * 0.16;
            entry.mesh.position.y += (targetY - entry.mesh.position.y) * 0.16;
            entry.mesh.position.z += (targetZ - entry.mesh.position.z) * 0.16;
            entry.mesh.rotation.y += (Math.PI - entry.mesh.rotation.y) * 0.16;
        });
    }

    bindEvents() {
        this.container.addEventListener("pointerdown", (event) => {
            this.pointer.downX = event.clientX;
            this.pointer.downY = event.clientY;

            if (this.startDrag(event)) {
                this.container.setPointerCapture(event.pointerId);
                event.preventDefault();
            }
        });

        this.container.addEventListener("pointermove", (event) => {
            this.setHover(event.clientX, event.clientY);

            if (this.drag.active && event.pointerId === this.drag.pointerId) {
                this.updateDrag(event.clientX);
            }
        });

        this.container.addEventListener("pointerup", (event) => {
            const movedDistance =
            Math.abs(event.clientX - this.pointer.downX) + Math.abs(event.clientY - this.pointer.downY);

            if (this.drag.active && event.pointerId === this.drag.pointerId) {
                this.finishDrag();
                return;
            }

            const info = this.pointerInfo(event.clientX, event.clientY);
            if (this.isOpened && this.canReveal && movedDistance < 8 && info.hitPack) {
                const revealed = this.revealNext();
                if (revealed && this.callbacks?.onReveal) {
                    this.callbacks.onReveal(revealed);
                }
            }
        });

        this.container.addEventListener("pointerleave", () => {
            this.clearHover();
        });

        window.addEventListener("resize", () => this.onResize());
    }

    onResize() {
        const width = this.container.clientWidth || 1;
        const height = this.container.clientHeight || 1;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height, false);
    }

    update(delta, elapsed) {
        if (!this.drag.active) {
            this.ripCurrent = THREE.MathUtils.damp(this.ripCurrent, this.ripTarget, 8, delta);
            this.applyRipProgress(this.ripCurrent);
        }

        this.foilTexture.offset.x = (elapsed * 0.035) % 1;

        let targetRotY = 0;
        let targetRotX = -0.08;

        if (!this.isPurchased) {
            targetRotY = Math.sin(elapsed * 0.7) * 0.22;
            targetRotX = -0.06 + Math.cos(elapsed * 0.56) * 0.025;
        } else if (this.pointer.active) {
            targetRotY = (this.pointer.nx - 0.5) * 0.28;
            targetRotX = -0.08 + (0.5 - this.pointer.ny) * 0.12;
        }

        this.packRoot.rotation.y = THREE.MathUtils.damp(this.packRoot.rotation.y, targetRotY, 5.2, delta);
        this.packRoot.rotation.x = THREE.MathUtils.damp(this.packRoot.rotation.x, targetRotX, 5.2, delta);

        const shineOpacity = this.isPurchased && this.pointer.active ? 0.3 : 0;
        this.shinePlane.material.opacity = THREE.MathUtils.damp(this.shinePlane.material.opacity, shineOpacity, 9, delta);

        this.layoutStackCards();

        const now = performance.now();
        this.flyingEntries = this.flyingEntries.filter((entry) => {
            const t = Math.min(1, (now - entry.startTime) / entry.duration);
            const eased = 1 - Math.pow(1 - t, 3);

            entry.mesh.position.lerpVectors(entry.fromPosition, entry.toPosition, eased);
            entry.mesh.rotation.x = entry.fromRotation.x + (entry.toRotation.x - entry.fromRotation.x) * eased;
            entry.mesh.rotation.y = entry.fromRotation.y + (entry.toRotation.y - entry.fromRotation.y) * eased;
            entry.mesh.rotation.z = entry.fromRotation.z + (entry.toRotation.z - entry.fromRotation.z) * eased;
            entry.mesh.scale.setScalar(0.72 + eased * 0.08);

            entry.mesh.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material && "opacity" in child.material) {
                    child.material.transparent = true;
                    child.material.opacity = 1 - eased * 0.85;
                }
            });

            if (t >= 1) {
                entry.mesh.removeFromParent();
                return false;
            }

            return true;
        });

        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        const elapsed = this.clock.elapsedTime;
        this.update(delta, elapsed);
    }
}

const state = {
    gold: loadGold(),
    unlocked: loadUnlocked(),
    selectedPack: "standard",
    currentPack: null,
    stage: null
};

function getSelectedConfig() {
    return packConfigs[state.selectedPack];
}

function renderGold() {
    goldValue.textContent = String(state.gold);
}

function renderPackButtons() {
    const hasActiveUnfinishedPack = Boolean(state.currentPack && !state.currentPack.complete);

    packList.querySelectorAll("[data-pack-option]").forEach((button) => {
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }

        const isSelected = button.dataset.packOption === state.selectedPack;
        button.classList.toggle("is-active", isSelected);
        button.disabled = hasActiveUnfinishedPack;
    });
}

function renderDetails() {
    const config = getSelectedConfig();

    stageTitle.textContent = config.name;
    stagePrice.textContent = `${config.cost} Gold`;

    detailCount.textContent = String(config.cards);
    detailFocus.textContent = config.focus;
    detailBest.textContent = config.best;
    detailPrice.textContent = `${config.cost} Gold`;
    detailCopy.textContent = config.description;

    sidebarNote.textContent = state.currentPack && !state.currentPack.complete
    ? "Finish opening the current pack before switching products."
    : "More products can be added here later without changing the overall layout.";
}

function formatCardCount(count) {
    return `${count} card${count === 1 ? "" : "s"} left`;
}

function updateMainButton() {
    const config = getSelectedConfig();
    buyPackButton.classList.remove("is-dark");

    if (!state.currentPack) {
        const canAfford = state.gold >= config.cost;
        buyPackButton.disabled = !canAfford;
        buyPackButton.textContent = canAfford ? "Buy Pack" : "Not Enough Gold";
        return;
    }

    buyPackButton.classList.add("is-dark");

    if (!state.currentPack.complete) {
        buyPackButton.disabled = true;
        buyPackButton.textContent = "Finish Opening Pack";
        return;
    }

    buyPackButton.disabled = false;
    buyPackButton.textContent = "Clear Opened Pack";
}

function renderTexts() {
    const config = getSelectedConfig();

    if (!state.currentPack) {
        packGuidance.textContent = "Buy a pack to begin. Then drag across the top seam to tear it open.";
        pullStatus.textContent = "No active pack yet.";
        openedPackMeta.textContent = "Buy and open a pack to start revealing cards.";
        return;
    }

    if (!state.currentPack.ripped) {
        packGuidance.textContent = "Drag the top strip to the right until the wrapper tears open.";
        pullStatus.textContent = `${config.name} purchased. Tear the top strip to open it.`;
        openedPackMeta.textContent = "Sealed pack ready. Tear it open first.";
        return;
    }

    if (!state.currentPack.complete) {
        const remaining = state.currentPack.cards.length - state.currentPack.revealIndex;
        packGuidance.textContent = "Tap the pack to deal the next card.";
        pullStatus.textContent = `${formatCardCount(remaining)} in this pack.`;
        openedPackMeta.textContent = `${state.currentPack.revealIndex} of ${state.currentPack.cards.length} cards revealed.`;
        return;
    }

    packGuidance.textContent = "Pack complete. Clear it and choose your next purchase.";
    pullStatus.textContent = `${state.currentPack.cards.length} cards revealed from this ${config.name}.`;
    openedPackMeta.textContent = `Pack complete · ${state.currentPack.cards.length} cards revealed.`;
}

function renderRevealedCards() {
    if (!state.currentPack || state.currentPack.revealed.length === 0) {
        revealedCards.innerHTML = `
        <div class="opened-cards-empty">
        Your revealed cards will appear here after you tear open a pack and start pulling from it.
        </div>
        `;
        return;
    }

    revealedCards.innerHTML = state.currentPack.revealed
    .map((card, index) => {
        const statusClass = card.isNewHit ? "new" : "owned";
        const statusText = card.isNewHit ? "New" : "Owned";

        return `
        <article class="market-pull-card ${card.isNewHit ? "is-new-hit" : ""} ${index === state.currentPack.revealed.length - 1 ? "just-dealt" : ""}">
        <div class="market-pull-media tilt-scene" data-market-html-tilt>
        <div class="card-container">
        <div class="card-face">
        <img src="${card.image}" alt="${card.name} card" width="614" height="889" />
        <span class="shine"></span>
        </div>
        </div>
        </div>

        <div class="market-pull-head">
        <h3 class="market-pull-name">${card.name}</h3>
        <span class="market-pull-flag ${statusClass}">${statusText}</span>
        </div>

        <div class="market-pull-meta">${card.rarity} · ${card.type}</div>
        <div class="market-pull-line">
        <span>${card.number}</span>
        <span>HP ${card.hp} / DMG ${card.dmg}</span>
        </div>
        </article>
        `;
    })
    .join("");

    bindHtmlTilt(revealedCards);
}

function renderAll() {
    renderGold();
    renderPackButtons();
    renderDetails();
    renderTexts();
    updateMainButton();
    renderRevealedCards();
}

function bindHtmlTilt(root) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const scenes = root.querySelectorAll("[data-market-html-tilt]");
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    scenes.forEach((scene) => {
        if (scene.dataset.marketHtmlTiltBound === "true") {
            return;
        }

        scene.dataset.marketHtmlTiltBound = "true";

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
        const maxTilt = 10;

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

            container.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale3d(1.03, 1.03, 1.03)`;

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

        const start = (clientX, clientY) => {
            bounds = scene.getBoundingClientRect();
            isActive = true;
            shine.style.opacity = "1";
            container.style.transition = "transform 0.08s ease-out";
            updatePoint(clientX, clientY);

            if (!rafId) {
                rafId = requestAnimationFrame(render);
            }
        };

        const stop = () => {
            isActive = false;
            shine.style.opacity = "0";

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
        };

        if (hasFinePointer) {
            scene.addEventListener("pointerenter", (event) => start(event.clientX, event.clientY));
            scene.addEventListener("pointermove", (event) => updatePoint(event.clientX, event.clientY));
            scene.addEventListener("pointerleave", stop);
        }

        scene.addEventListener("touchstart", (event) => {
            const touch = event.touches[0];
            if (!touch) {
                return;
            }
            start(touch.clientX, touch.clientY);
        }, { passive: true });

        scene.addEventListener("touchmove", (event) => {
            const touch = event.touches[0];
            if (!touch || !isActive) {
                return;
            }
            updatePoint(touch.clientX, touch.clientY);
            event.preventDefault();
        }, { passive: false });

        scene.addEventListener("touchend", stop, { passive: true });
        scene.addEventListener("touchcancel", stop, { passive: true });
    });
}

function buySelectedPack() {
    const config = getSelectedConfig();

    if (state.currentPack && !state.currentPack.complete) {
        return;
    }

    if (state.gold < config.cost) {
        return;
    }

    const generated = generatePack(config.id).map((card) => ({
        ...card,
        isNewHit: !state.unlocked.has(card.id)
    }));

    state.gold -= config.cost;
    saveGold(state.gold);

    state.currentPack = {
        type: config.id,
        cards: generated,
        ripped: false,
        revealIndex: 0,
        revealed: [],
        complete: false
    };

    state.stage.purchase(generated);
    renderAll();
}

function onPackOpened() {
    if (!state.currentPack) {
        return;
    }

    state.currentPack.ripped = true;
    renderAll();
}

function onCardRevealed(card) {
    if (!state.currentPack) {
        return;
    }

    state.currentPack.revealIndex += 1;
    state.currentPack.revealed.push(card);

    if (!state.unlocked.has(card.id)) {
        state.unlocked.add(card.id);
        saveUnlocked(state.unlocked);
    }

    if (state.currentPack.revealIndex >= state.currentPack.cards.length) {
        state.currentPack.complete = true;
    }

    renderAll();
}

async function init() {
    const loader = new THREE.TextureLoader();

    const backTexture = await loadTextureAny(loader, CARD_BACK_CANDIDATES);
    const cardTextures = {};

    for (const card of cardPool) {
        cardTextures[card.id] = await loadTextureAny(loader, [card.image]);
    }

    state.stage = new Pack3DStage(
        viewport,
        {
            cardBack: backTexture,
            cards: cardTextures
        },
        {
            onOpened: onPackOpened,
            onReveal: onCardRevealed
        }
    );

    packList.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const button = target.closest("[data-pack-option]");
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }

        if (state.currentPack && !state.currentPack.complete) {
            return;
        }

        const packId = button.dataset.packOption;
        if (!packId || !(packId in packConfigs)) {
            return;
        }

        state.selectedPack = packId;
        state.stage.setSelectedPack(packId);
        renderAll();
    });

    buyPackButton.addEventListener("click", () => {
        if (state.currentPack && state.currentPack.complete) {
            state.currentPack = null;
            state.stage.clearPack();
            renderAll();
            return;
        }

        if (!state.currentPack) {
            buySelectedPack();
        }
    });

    renderAll();
}

init().catch((error) => {
    console.error(error);
    packGuidance.textContent = "3D pack scene failed to load. Check your local server and file paths.";
});
