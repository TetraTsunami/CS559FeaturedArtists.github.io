const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let tParam = 0;
const showPathCheckbox = document.getElementById("showPath");

const Hermite = function(t) {
    return [
        2 * t * t * t - 3 * t * t + 1,
        t * t * t - 2 * t * t + t,
        -2 * t * t * t + 3 * t * t,
        t * t * t - t * t
    ];
};
function Cubic(basis, P, t) {
    const b = basis(t);
    const result = [0, 0];
    for (let i = 0; i < 4; i++) {
        result[0] += P[i][0] * b[i];
        result[1] += P[i][1] * b[i];
    }
    return result;
}

const p0 = [100, 300], d0 = [100, -150];
const p1 = [300, 100], d1 = [100, 0];
const p2 = [500, 300], d2 = [100, 150];
const p3 = [700, 300], d3 = [-100, -150];
const p4 = [400, 500], d4 = [-200, 0];
const p5 = [100, 300], d5 = [100, -150];

const P0 = [p0, d0, p1, d1];
const P1 = [p1, d1, p2, d2];
const P2 = [p2, d2, p3, d3];
const P3 = [p3, d3, p4, d4];
const P4 = [p4, d4, p5, d5];

const C0 = function(t) { return Cubic(Hermite, P0, t); };
const C1 = function(t) { return Cubic(Hermite, P1, t); };
const C2 = function(t) { return Cubic(Hermite, P2, t); };
const C3 = function(t) { return Cubic(Hermite, P3, t); };
const C4 = function(t) { return Cubic(Hermite, P4, t); };

const Ccomp = function(t) {
    if (t < 1) return C0(t);
    else if (t < 2) return C1(t - 1);
    else if (t < 3) return C2(t - 2);
    else if (t < 4) return C3(t - 3);
    else if (t < 5) return C4(t - 4);
    return [0, 0];
};

function drawBird(x, y, angle, color, wingPosition) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);

    context.fillStyle = color;
    context.beginPath();
    context.arc(0, 0, 10, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = 'orange';
    context.beginPath();
    context.moveTo(10, 0);
    context.lineTo(15, -5);
    context.lineTo(15, 5);
    context.closePath();
    context.fill();

    context.strokeStyle = color;
    context.lineWidth = 4;
    context.beginPath();
    if (wingPosition > 0.5) {
        context.moveTo(-10, 0);
        context.lineTo(-20, -15);
        context.moveTo(10, 0);
        context.lineTo(20, -15);
    } else {
        context.moveTo(-10, 0);
        context.lineTo(-20, 15);
        context.moveTo(10, 0);
        context.lineTo(20, 15);
    }
    context.stroke();

    context.restore();
}

function drawBackground() {
    const trees = [[50, 200], [750, 200], [400, 50], [200, 500], [600, 500]];
    trees.forEach(([x, y]) => {
        context.fillStyle = 'forestgreen';
        context.beginPath();
        context.moveTo(x, y - 30);
        context.lineTo(x + 20, y);
        context.lineTo(x - 20, y);
        context.closePath();
        context.fill();
        context.fillStyle = 'saddlebrown';
        context.fillRect(x - 3, y, 6, 15);
    });

    const clouds = [[150, 100], [350, 150], [550, 80], [750, 120]];
    clouds.forEach(([x, y]) => {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(x, y, 20, 0, Math.PI * 2);
        context.arc(x + 30, y, 25, 0, Math.PI * 2);
        context.arc(x + 60, y, 20, 0, Math.PI * 2);
        context.fill();
    });
}

function drawTrajectory(t_begin, t_end, intervals, C, color) {
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.beginPath();
    const start = C(t_begin);
    context.moveTo(start[0], start[1]);

    for (let i = 1; i <= intervals; i++) {
        const t = t_begin + (i / intervals) * (t_end - t_begin);
        const point = C(t);
        if (point && point.length === 2) {
            context.lineTo(point[0], point[1]);
        }
    }
    context.stroke();
}

function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    if (showPathCheckbox.checked) {
        drawTrajectory(0, 5, 200, Ccomp, "rgba(0,0,0,0.2)");
    }
    const birdColors = ['red', 'lime', 'blue', 'yellow'];
    for (let i = 0; i < 4; i++) {
        const offset = i * 1.25;
        let t = (tParam + offset) % 5;
        const position = Ccomp(t);
        if (position && position.length === 2) {
            const derivative = Ccomp(t + 0.01);
            const angle = Math.atan2(derivative[1] - position[1], derivative[0] - position[0]);
            const wingPosition = Math.abs(Math.sin(tParam * 4));
            drawBird(position[0], position[1], angle, birdColors[i], wingPosition);
        }
    }
    tParam += 0.01;
    if (tParam > 5) tParam = 0;
    requestAnimationFrame(animate);
}

animate();
