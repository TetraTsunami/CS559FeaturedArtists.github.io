// Code Attribution: I used Stack Overflow, Geeks for Geeks, ChatGPT, some YouTube videos (some physics about planetary motions and Js), 
// and Class notes when I got stuck on the math and how to get the planets moving and the eccentricity stuff. They really helped me figure out 
// the position calculations and how to animate things, like how to find the right face angle for each planet. 
// I made sure to understand the methods instead of just copying code, so I could really get the hang of it all.


const canvas = document.getElementById('solarSystem');
const context = canvas.getContext('2d');

function moveToTx(loc, matrix) {
    var res = vec2.create();
    vec2.transformMat3(res, loc, matrix);
    context.moveTo(res[0], res[1]);
}

function lineToTx(loc, matrix) {
    var res = vec2.create();
    vec2.transformMat3(res, loc, matrix);
    context.lineTo(res[0], res[1]);
}

// orbit formula 
function orbit(t, distX, distY, ecc) {
    const r = distX * (1 - ecc * ecc) / (1 + ecc * Math.cos(t));
    return [r * Math.cos(t), r * Math.sin(t)];
}

class Planet {
    constructor(size, color, distX, distY, speed, rotationSpeed = 0.02) {
        this.size = size;
        this.color = color;
        this.distX = distX;
        this.distY = distY;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed;
        this.angle = 0;
        this.rotation = 0;
        this.matrix = mat3.create();
        this.moons = [];
    }

    // updating the planets position 
    update(parentMatrix, ecc, scale) {
        this.angle += this.speed;
        this.rotation += this.rotationSpeed;
        const [x, y] = orbit(this.angle, this.distX * (1 + ecc), this.distY * (1 + ecc), 0);

        let localMatrix = mat3.create();
        mat3.translate(localMatrix, localMatrix, [x, y]);
        mat3.rotate(localMatrix, localMatrix, this.rotation);
        mat3.scale(localMatrix, localMatrix, [scale, scale]);

        mat3.multiply(this.matrix, parentMatrix, localMatrix);

        this.moons.forEach(moon => moon.update(this.matrix, ecc, scale));
    }

    // draw planet
    draw(ecc) {
        context.beginPath();
        moveToTx([this.size, 0], this.matrix);
        for (let i = 1; i <= 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            lineToTx([this.size * Math.cos(angle), this.size * Math.sin(angle)], this.matrix);
        }
        context.fillStyle = this.color;
        context.fill();

        // draw moon orbits
        if (this.distX > 0 && this.distY > 0) {
            context.beginPath();
            for (let t = 0; t < Math.PI * 2; t += 0.01) {
                const [x, y] = orbit(t, this.distX * (1 + ecc), this.distY * (1 + ecc), 0);
                if (t === 0) {
                    moveToTx([x, y], this.matrix);
                } else {
                    lineToTx([x, y], this.matrix);
                }
            }
            context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            context.stroke();
        }

        this.moons.forEach(moon => moon.draw(ecc));
    }

    addMoon(moon) {
        this.moons.push(moon);
    }
}

// create sun and planets
const sun = new Planet(30, 'yellow', 0, 0, 0);
const planets = [
    new Planet(10, 'blue', 150, 150, 0.01, 0.02),
    new Planet(8, 'red', 250, 250, 0.006, 0.03)
];

planets.forEach(p => sun.addMoon(p));

let ecc = 0;
let scale = 1;

// animate the scene, planets keep spinning
function animate() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const centerMatrix = mat3.create();
    mat3.translate(centerMatrix, centerMatrix, [canvas.width / 2, canvas.height / 2]);
    sun.update(centerMatrix, ecc, scale);
    sun.draw(ecc);

    requestAnimationFrame(animate);
}

animate();

// button to add random planet
document.getElementById('addPlanet').addEventListener('click', () => {
    const size = 5 + Math.random() * 10;
    const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
    const orbitDist = 100 + Math.random() * 200;
    const speed = 0.001 + Math.random() * 0.008; 
    const rotationSpeed = 0.005 + Math.random() * 0.04; 
    const newPlanet = new Planet(size, color, orbitDist, orbitDist, speed, rotationSpeed);
    sun.addMoon(newPlanet);
});

// slider for disctance
document.getElementById('orbitShape').addEventListener('input', (event) => {
    ecc = parseFloat(event.target.value);
});

// slider for scal
document.getElementById('planetScale').addEventListener('input', (event) => {
    scale = parseFloat(event.target.value);
});