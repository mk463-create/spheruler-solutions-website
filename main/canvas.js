const canvas = document.getElementById("stars");
const c = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);



// ----------------------
// Star Colours
// ----------------------

const colors = [
    "255,255,255",
    "255,248,220",
    "200,220,255",
    "255,235,180"
];

// ----------------------
// Tiny Stars (Radius 0.5)
// ----------------------

let tinyStars = [];

for (let i = 0; i < 150; i++) {
    tinyStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
    });
}

// ----------------------
// Small Stars (Radius 1)
// ----------------------

let smallStars = [];

for (let i = 0; i < 70; i++) {
    smallStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
    });
}

// ----------------------
// Twinkling Stars
// ----------------------

let stars = [];

for (let i = 0; i < 200; i++) {

    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        phase: Math.random() * Math.PI * 2,
        twinkle: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]
    });

}

let time = 0;

// ----------------------
// Animation
// ----------------------


function animate() {

    requestAnimationFrame(animate);

    c.clearRect(0, 0, canvas.width, canvas.height);

    // ----------------------
    // Tiny Stars
    // ----------------------
   
    c.shadowBlur = 0;

    for (let star of tinyStars) {

        c.beginPath();
        c.arc(star.x, star.y, 0.5, 0, Math.PI * 2);

        c.fillStyle = 'rgba(227, 241, 242, 0.8)';
        c.fill();
    }

    // ----------------------
    // Small Stars
    // ----------------------

    for (let star of smallStars) {

        c.beginPath();
        c.arc(star.x, star.y, 1, 0, Math.PI * 2);

        c.fillStyle = 'rgba(254, 248, 230, 0.8)';
        c.fill();
    }

    // ----------------------
    // Twinkling Stars
    // ----------------------

    time += 0.03;

    for (let star of stars) {

        let alpha = 0.5 + star.twinkle * Math.sin(time + star.phase);

        c.beginPath();

        c.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI * 2
        );

        c.shadowBlur = 10;
        c.shadowColor = "rgba(188,231,234,0.8)";
        c.fillStyle = `rgba(${star.color}, ${alpha})`;

        c.fill();
    }
}

animate();
