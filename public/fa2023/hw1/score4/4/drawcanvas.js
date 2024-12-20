let canvas = document.getElementById("draw-canvas");
let ctx = canvas.getContext("2d");

let startAnimBtn = document.getElementById("start-anim");
let pauseAnimBtn = document.getElementById("pause-anim");
let stopAnimBtn = document.getElementById("stop-anim");

let xSlider = document.getElementById("x-translate");
let ySlider = document.getElementById("y-translate");
let zSlider = document.getElementById("z-translate");

let camera = { x: 0, y: 0, z: 0 }

function drawAxes(x, y, len, arrowSize) {
    ctx.lineWidth = 2;

    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(x, y, arrowSize, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(x + len, y);
    ctx.lineTo(x + len, y + arrowSize);
    ctx.lineTo(x + len + (arrowSize * 2), y);
    ctx.lineTo(x + len, y - arrowSize);
    ctx.fill();

    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - len);
    ctx.stroke();

    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.moveTo(x, y - len);
    ctx.lineTo(x + arrowSize, y - len);
    ctx.lineTo(x, y - len - (arrowSize * 2));
    ctx.lineTo(x - arrowSize, y - len);
    ctx.fill();
}

function drawCube(x, y, z, halfSize, color) {
    let verts = [
        { _x: x - halfSize, _y: y - halfSize, _z: z - halfSize},
        { _x: x + halfSize, _y: y - halfSize, _z: z - halfSize},
        { _x: x - halfSize, _y: y + halfSize, _z: z - halfSize},
        { _x: x + halfSize, _y: y + halfSize, _z: z - halfSize},
        { _x: x - halfSize, _y: y - halfSize, _z: z + halfSize},
        { _x: x + halfSize, _y: y - halfSize, _z: z + halfSize},
        { _x: x - halfSize, _y: y + halfSize, _z: z + halfSize},
        { _x: x + halfSize, _y: y + halfSize, _z: z + halfSize},
    ].map(v => projectTo2D(v));

    if (verts.every(v => v.z <= 1))
    {
        return;
    }

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(verts[4].x, verts[4].y);
    ctx.lineTo(verts[5].x, verts[5].y);
    ctx.lineTo(verts[7].x, verts[7].y);
    ctx.lineTo(verts[6].x, verts[6].y);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    ctx.lineTo(verts[4].x, verts[4].y);
    ctx.moveTo(verts[1].x, verts[1].y);
    ctx.lineTo(verts[5].x, verts[5].y);
    ctx.moveTo(verts[3].x, verts[3].y);
    ctx.lineTo(verts[7].x, verts[7].y);
    ctx.moveTo(verts[2].x, verts[2].y);
    ctx.lineTo(verts[6].x, verts[6].y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    ctx.lineTo(verts[1].x, verts[1].y);
    ctx.lineTo(verts[3].x, verts[3].y);
    ctx.lineTo(verts[2].x, verts[2].y);
    ctx.closePath();
    ctx.stroke();
}

function projectTo2D(vert) {
    let diffVect = {
        x: vert._x - camera.x,
        y: vert._y - camera.y,
        z: vert._z - camera.z
    };

    let propVect2D = {
        x: diffVect.x / Math.abs(diffVect.z),
        y: diffVect.y / Math.abs(diffVect.z)
    }

    return {
        x: propVect2D.x * canvas.width / 2 + canvas.width / 2,
        y: propVect2D.y * canvas.height / 2 + canvas.height / 2,
        z: diffVect.z
    }
}

let colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "violet"
];
let cubes = [];

function spawnCubes() {
    // destroy cubes
    cubes = cubes.filter(cube => camera.z < cube.z + cube.half)

    // spawn cubes
    let randX = Math.random() * 10 - 5;
    let randY = Math.random() * 10 - 5;
    let randHalf = Math.random() * 0.9 + 0.1;
    let randColor = colors[Math.floor(Math.random() * colors.length)]
    cubes.unshift({ x: randX, y: randY, z: 5, half: randHalf, color: randColor})
    draw();
}

function animate() {
    cubes.map(cube => cube.z -= 0.1);
    draw();
}

let cubeSpawnAnim;
let cubeMoveAnim;

function draw() {
    camera = {
        x: xSlider.value,
        y: -ySlider.value,
        z: zSlider.value
    };
    canvas.width = canvas.width;
    for (let cube of cubes) {
        drawCube(cube.x, cube.y, cube.z, cube.half, cube.color);
    }
    drawAxes(12, 500, 64, 3);
}

draw();

xSlider.addEventListener("input", draw);
ySlider.addEventListener("input", draw);
zSlider.addEventListener("input", draw);

startAnimBtn.addEventListener("click", () => {
    if (!cubeSpawnAnim) {
        cubeSpawnAnim = setInterval(spawnCubes, 250);
    }
    if (!cubeMoveAnim) {
        cubeMoveAnim = setInterval(animate, 40);
    }
});

function pauseAnim() {
    clearInterval(cubeSpawnAnim);
    cubeSpawnAnim = null;
    clearInterval(cubeMoveAnim);
    cubeMoveAnim = null;
}

pauseAnimBtn.addEventListener("click", pauseAnim);

stopAnimBtn.addEventListener("click", () => {
    pauseAnim();
    canvas.width = canvas.width;
    cubes = [];
    draw();
});