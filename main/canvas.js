// =============================================================================
// Deep Space Background Canvas System
// =============================================================================

const canvas = document.getElementById("stars");
const c = canvas ? canvas.getContext("2d") : null;

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------
const CONFIG = {
    // Star Layer Configuration
    tinyStars: {
        count: 150,
        baseRadius: 0.5,
        color: "rgba(227, 241, 242, 0.8)"
    },
    smallStars: {
        count: 70,
        baseRadius: 1.0,
        color: "rgba(254, 248, 230, 0.8)"
    },
    twinkleStars: {
        count: 200,
        minRadius: 0.5,
        radiusRange: 2.0,
        twinkleSpeed: 0.03,
        shadowBlur: 10,
        shadowColor: "rgba(188, 231, 234, 0.8)",
        palette: [
            "255,255,255",
            "255,248,220",
            "200,220,255",
            "255,235,180"
        ]
    },

    // Distant Planets Configuration (Sparse, low brightness, subtle depth)
    planets: {
        count: 3,               // 2-4 widely spaced planets
        minRadius: 2.5,
        maxRadius: 5.0,
        driftSpeed: 0.008,
        driftAmount: 3.5,
        palette: [
            { base: "rgba(130, 140, 160, 0.45)", shadow: "rgba(30, 35, 45, 0.55)" }, // Muted slate
            { base: "rgba(145, 135, 155, 0.38)", shadow: "rgba(35, 25, 40, 0.50)" }, // Dusky taupe
            { base: "rgba(110, 135, 145, 0.40)", shadow: "rgba(20, 30, 35, 0.50)" }  // Pale ice blue
        ]
    }
};

// Expose configuration globally for runtime adjustments if needed
window.SpaceBackgroundConfig = CONFIG;

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// -----------------------------------------------------------------------------
// State Holders
// -----------------------------------------------------------------------------
let tinyStars = [];
let smallStars = [];
let twinklingStars = [];
let planets = [];
let time = 0;

// -----------------------------------------------------------------------------
// Generation Functions
// -----------------------------------------------------------------------------
function createTinyStars() {
    const list = [];
    for (let i = 0; i < CONFIG.tinyStars.count; i++) {
        list.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: CONFIG.tinyStars.baseRadius
        });
    }
    return list;
}

function createSmallStars() {
    const list = [];
    for (let i = 0; i < CONFIG.smallStars.count; i++) {
        list.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: CONFIG.smallStars.baseRadius
        });
    }
    return list;
}

function createTwinklingStars() {
    const list = [];
    const colors = CONFIG.twinkleStars.palette;
    for (let i = 0; i < CONFIG.twinkleStars.count; i++) {
        list.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * CONFIG.twinkleStars.radiusRange + CONFIG.twinkleStars.minRadius,
            phase: Math.random() * Math.PI * 2,
            twinkle: Math.random() * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    return list;
}

/**
 * Creates distant, muted planets spaced widely across the viewport.
 */
function createPlanets() {
    const list = [];
    const palette = CONFIG.planets.palette;
    const count = CONFIG.planets.count;

    for (let i = 0; i < count; i++) {
        // Distribute planets across distinct sectors to avoid clustering
        const sectorWidth = canvas.width / count;
        const x = randomRange(sectorWidth * i + 40, sectorWidth * (i + 1) - 40);
        const y = randomRange(canvas.height * 0.15, canvas.height * 0.85);
        const radius = randomRange(CONFIG.planets.minRadius, CONFIG.planets.maxRadius);
        const colorScheme = palette[i % palette.length];

        list.push({
            baseX: x,
            baseY: y,
            radius: radius,
            colorScheme: colorScheme,
            phaseOffset: Math.random() * Math.PI * 2
        });
    }
    return list;
}

// -----------------------------------------------------------------------------
// System Initialization & Resizing
// -----------------------------------------------------------------------------
function initBackground() {
    if (!canvas) return;
    tinyStars = createTinyStars();
    smallStars = createSmallStars();
    twinklingStars = createTwinklingStars();
    planets = createPlanets();
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initBackground();
}

// -----------------------------------------------------------------------------
// Rendering Functions
// -----------------------------------------------------------------------------

function drawTinyStars() {
    c.shadowBlur = 0;
    c.fillStyle = CONFIG.tinyStars.color;
    c.beginPath();
    for (const star of tinyStars) {
        c.moveTo(star.x + star.radius, star.y);
        c.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    }
    c.fill();
}

function drawSmallStars() {
    c.shadowBlur = 0;
    c.fillStyle = CONFIG.smallStars.color;
    c.beginPath();
    for (const star of smallStars) {
        c.moveTo(star.x + star.radius, star.y);
        c.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    }
    c.fill();
}

function drawPlanets() {
    for (const p of planets) {
        const driftX = Math.cos(time * CONFIG.planets.driftSpeed + p.phaseOffset) * CONFIG.planets.driftAmount;
        const driftY = Math.sin(time * CONFIG.planets.driftSpeed + p.phaseOffset) * CONFIG.planets.driftAmount;
        const px = p.baseX + driftX;
        const py = p.baseY + driftY;

        c.save();
        // Subtle sphere body with gentle terminator/crescent shading
        const planetGrad = c.createRadialGradient(
            px - p.radius * 0.35,
            py - p.radius * 0.35,
            p.radius * 0.1,
            px,
            py,
            p.radius
        );
        planetGrad.addColorStop(0, p.colorScheme.base);
        planetGrad.addColorStop(0.85, p.colorScheme.shadow);
        planetGrad.addColorStop(1, "rgba(5, 7, 12, 0.7)");

        c.fillStyle = planetGrad;
        c.beginPath();
        c.arc(px, py, p.radius, 0, Math.PI * 2);
        c.fill();
        c.restore();
    }
}

function drawTwinklingStars() {
    for (const star of twinklingStars) {
        const alpha = 0.5 + star.twinkle * Math.sin(time + star.phase);

        c.beginPath();
        c.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

        c.shadowBlur = CONFIG.twinkleStars.shadowBlur;
        c.shadowColor = CONFIG.twinkleStars.shadowColor;
        c.fillStyle = `rgba(${star.color}, ${alpha})`;
        c.fill();
    }
}

// -----------------------------------------------------------------------------
// Animation Loop
// -----------------------------------------------------------------------------
function animate() {
    requestAnimationFrame(animate);
    if (!c || !canvas) return;

    // Clear previous frame
    c.clearRect(0, 0, canvas.width, canvas.height);

    // Render layers in visual depth order:
    // 1. Dim background tiny stars
    drawTinyStars();

    // 2. Medium stars
    drawSmallStars();

    // 3. Distant subtle planets
    drawPlanets();

    // 4. Brighter twinkling stars
    time += CONFIG.twinkleStars.twinkleSpeed;
    drawTwinklingStars();
}

// -----------------------------------------------------------------------------
// Setup & Start
// -----------------------------------------------------------------------------
if (canvas && c) {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    animate();
}
