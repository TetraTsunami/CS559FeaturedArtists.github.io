const pi = Math.PI;

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

var frames = 0;

const sun = {
    x: canvas.width/2,
    y: canvas.height/2,
    radius: 50,
    orbit: 50,
    speed: .5,
    colors: ["red", "orange", "gold"]
}
const earth = {
    radius: 12,
    orbit: 150,
    speed: -1.2,
    colors: ["green", "aqua", "blue"]
}
const earthMoon = {
    radius: 4,
    orbit: 30,
    speed: -2,
    colors: ["black", "gray"]
}
const purplePlanet = {
    radius: 20,
    orbit: 220,
    speed: .5,
    colors: ["rebeccapurple","blueviolet", "indigo"]
}
const rainbowPlanet = {
    radius: 25,
    orbit: 300,
    speed: -.8,
    colors: [0, 0, 0]
}

draw();


function draw() {
    var val = (frames % 360) * pi/180;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();


    sun.radius = 30 + 10 * (2 + Math.cos(val));
    context.translate(sun.x, sun.y);
    drawStar(sun, 4);

    context.save();
    drawPlanet(earth);
    drawPlanet(earthMoon);
    context.restore();

    context.save();
    drawPlanet(purplePlanet);
    context.restore();

    context.save();
    var t1 = Math.floor(255 - 80*(Math.cos(frames/100)+1));
    var t2 = Math.floor(255 - 80*(Math.sin(frames/100)+1));
    var t3 = Math.floor(255 - 80*(Math.cos(frames/100 + pi/4)+1));
    var c1 = "#" + t1.toString(16) + t2.toString(16) + t3.toString(16);
    var c2 = "#" + t2.toString(16) + t3.toString(16) + t2.toString(16);
    var c3 = "#" + t3.toString(16) + t1.toString(16) + t1.toString(16);
    rainbowPlanet.colors = [c1, c2, c3];
    drawPlanet(rainbowPlanet);
    context.restore();

    context.restore();
    frames++;
    window.requestAnimationFrame(draw);
}

function drawStar(star, layers) {
    var colors = star.colors;
    var radius = star.radius;
    var speed = star.speed;
    var orbit = star.orbit;
    context.rotate(frames * speed * pi/180);
    context.translate(0, orbit);


    for (k = layers-1; k >= 0; k--) {
        for (i = 0; i < colors.length; i++) {
            drawSpinnyBall(i*360/colors.length, (5+3*k) * Math.abs(speed), radius/(6+2*k),  radius*(1-(k/layers)), colors[i]);
            drawSpinnyBall(i*360/colors.length, (6+3*k) * Math.abs(speed), radius/(6+2*k),  radius*(1-(k+1)/layers), colors[i]);
        }
    }
}

function drawPlanet(planet) {
    var speed = planet.speed;
    var radius = planet.radius;
    var orbit = planet.orbit;
    var colors = planet.colors;

    context.rotate(frames * speed * pi/180);
    context.translate(0, orbit);
    for (i = 0; i < colors.length; i++) {
        context.beginPath();
        context.fillStyle = planet.colors[i];
        context.arc(0, 0, radius*(1 - ((i)/(colors.length-1))/1.5), 0, 2*pi);
        context.fill();
        context.closePath();
    }
}

function drawSpinnyBall(offset, speed, ballRad, orbitRad, color) {
    context.save();
    context.fillStyle = color;
    context.rotate((offset + frames * speed) * pi / 180);
    context.translate(0, orbitRad);
    drawTail(ballRad, orbitRad, color, 25);

    context.beginPath();
    context.arc(0, 0, ballRad, 0, 2*pi );
    context.fill();
    context.closePath();

    context.restore();
}

function drawTail(ballRad, orbitRad, color, length) {
    context.save();
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(0,0);
    for (j = 0; j < length; j++) {
        context.lineWidth = 2*ballRad - j;
        context.translate(0, -orbitRad);
        context.rotate(-4 * pi / 180);
        context.translate(0, orbitRad);
        context.lineTo(0,0);
        context.stroke();
    }
    context.closePath();
    context.restore();
}