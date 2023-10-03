class Vector2 {
    /** @type {Number}   */     x;    /** @type {Number}   */ y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /** @param {Vector2} other */
    add(other) { return new Vector2(this.x + other.x, this.y + other.y); }
    /** @param {Vector2} other */
    sub(other) { return new Vector2(this.x - other.x, this.y - other.y); }
    magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); }
    /** @param {Number} other */
    mul(other) { return new Vector2(this.x * other, this.y * other); }
}

class GameObject {
    /** @type {Vector2} */
    position;
    /** @type {Number} */
    radius;

    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.radius = 1;
    }

    isColliding(other) {
        return Math.sqrt((this.position.x - other.position.x) ** 2 + (this.position.y - other.position.y) ** 2) < this.radius + other.radius;
    }


    draw() { }
}

class Player extends GameObject {
    constructor(x, y) {
        super(x, y);
        super.radius = 30;
    }

    draw() {
        context.translate(this.position.x, this.position.y);
        context.scale(.5, .5);
        // body
        context.beginPath();
        context.arc(0, 0, 30, 0, Math.PI * 2);
        context.fillStyle = "#179cf0";
        context.fill();
        context.beginPath();
        context.arc(- 50, 0, 80, 0, Math.PI / 3 * 2);
        context.fill();
        context.beginPath();
        context.arc(- 20, - 50, 80, Math.PI / 2, Math.PI * 0.9);
        context.fill();

        // beak
        context.beginPath();
        context.moveTo(20, 15);
        context.lineTo(20, - 15);
        context.lineTo(60, 0);
        context.closePath();
        context.fillStyle = "#179cf0";
        context.fill();

        // eye
        context.beginPath();
        context.arc(0, 0, 10, 0, Math.PI * 2);
        context.fillStyle = "#ffffff";
        context.fill();
        context.beginPath();
        context.arc(0, 0, 5, 0, Math.PI * 2);
        context.fillStyle = "#000000";
        context.fill();


        context.setTransform(1, 0, 0, 1, 0, 0)
        // draw score
        var oldFont = context.font;
        context.font = "50px serif";
        context.fillStyle = "#000000";
        context.fillText(score, 50, 50);
        context.font = oldFont;
    }
}

class Coin extends GameObject {
    /** @type {Number} */
    score;
    constructor(x, y) {
        super(x, y);
        super.radius = 20;
        this.score = 1;
    }

    draw() {
        let position = this.position;

        // fill
        context.beginPath();
        context.arc(position.x, position.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = "#FFFF00";
        context.fill();

        // boundary
        context.beginPath();
        context.arc(position.x, position.y, this.radius, 0, Math.PI * 2);
        context.strokeStyle = "#FFC000";
        context.stroke();

        var oldFont = context.font;
        context.font = "30px serif";
        context.textAlign = "center"
        context.fillStyle = "#000000";
        context.strokeText("$", position.x, position.y + 10);
        context.font = oldFont;
    }
}

class WeatherParticle extends GameObject {
    /** @type {Vector2} */
    velocity;
    /** @type {Number} */
    layer
    /** @type {Number} */
    alpha;

    constructor(x, y) {
        super(x, y);
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.alpha = 1;
        this.layer = Math.floor(rr(0, 3));
    }
}

class RainDrop extends WeatherParticle {

    constructor(x, y) {
        super(x, y);
        this.radius = Math.random() * 2 + 3;
        this.velocity = new Vector2(Math.random() * 0.1, Math.random() * 2 + 3);
    }

    draw() {
        const globalAlpha = context.globalAlpha, position = this.position, radius = this.radius;
        context.beginPath();
        context.moveTo(position.x, position.y);
        context.lineTo(position.x - radius, position.y + radius * 4);
        context.lineTo(position.x + radius, position.y + radius * 4);
        context.closePath();
        context.globalAlpha = this.alpha;
        context.fillStyle = "#4040ff";
        context.fill();
        context.beginPath();
        context.arc(position.x, position.y + radius * 4, radius, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = globalAlpha;
    }
}

class Snowflake extends WeatherParticle {
    /** @type {Number} */
    angle;
    /** @type {Number} */
    type;
    special;
    colorOffset;
    constructor(x, y) {
        super(x, y);
        this.radius = 10 + Math.random() * 10;
        this.type = Math.floor(Math.random() * 3);
        this.velocity = new Vector2(0, 0.2);
        this.angle = Math.random() * 2 * Math.PI;
        this.special = Math.random() < 0.1;
        this.colorOffset = Math.random() * 360;
    }

    draw() {
        // set transform
        context.translate(this.position.x, this.position.y);
        context.rotate(this.angle);
        context.scale(this.radius, this.radius);

        const globalAlpha = context.globalAlpha;
        context.beginPath();
        context.moveTo(0, 0);

        for (let index = 0; index < 6; index++) {
            switch (this.type) {
                case undefined:
                case null:
                case 0:
                default:
                    context.lineTo(-0.1, 0);
                    context.lineTo(-0.1, 1);
                    context.lineTo(0.1, 1);
                    context.lineTo(0.1, 0);
                    break;
                case 1:
                    context.lineTo(-0.1, 0);
                    context.lineTo(-0.1, 0.4);
                    context.lineTo(-0.3, 0.6);
                    context.lineTo(-0.3, 0.8);
                    context.lineTo(-0.1, 0.6);
                    context.lineTo(-0.1, 1);
                    context.lineTo(0.1, 1);
                    context.lineTo(0.1, 0.6);
                    context.lineTo(0.3, 0.8);
                    context.lineTo(0.3, 0.6);
                    context.lineTo(0.1, 0.4);
                    context.lineTo(0.1, 0);
                    break;
                case 2:
                    context.lineTo(-0.1, 0);
                    context.lineTo(-0.1, 0.5);
                    context.lineTo(-0.05, 0.5);
                    context.lineTo(-0.05, 1);
                    context.lineTo(0.05, 1);
                    context.lineTo(0.05, .5);
                    context.lineTo(0.1, .5);
                    context.lineTo(0.1, 0);
                    break;
            }
            context.rotate(Math.PI / 3);
        }

        context.globalAlpha = this.alpha;
        let color = "#a0a0ff";
        if (this.special) {
            color = "hsl(" + String((this.colorOffset + 8 * phase) % 360) + ", 100%, 75%)";//hsl();
        }
        context.fillStyle = color;
        context.fill();
        // reset transform
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.globalAlpha = globalAlpha;
    }
}

class Cloud extends WeatherParticle {
    /** @type {Number[]} */
    radii;

    constructor() {
        super(rr(0, window.innerWidth), rr(0, window.innerHeight / 8));
        this.velocity = new Vector2(rr(-0.2, 0.2), rr(-0.01, 0.01));
        this.radii = [];
        for (let index = 0; index < 5; index++) {
            this.radii.push(30 * rr(1.1, 1.7));
        }
    }

    draw() {
        // Define the cloud properties
        const cloudColor = "#303030"; // Dark color for the clouds
        const cloudRadius = 30; // Radius of individual cloud circles  
        const globalAlpha = context.globalAlpha;

        context.globalAlpha = this.alpha;
        context.fillStyle = cloudColor;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radii[0], 0, Math.PI * 2);
        context.arc(this.position.x + cloudRadius * 1.5, this.position.y - 30, this.radii[1], 0, Math.PI * 2);
        context.arc(this.position.x + cloudRadius * 1.5, this.position.y, this.radii[2], 0, Math.PI * 2);
        context.arc(this.position.x + cloudRadius * 3, this.position.y, this.radii[3], 0, Math.PI * 2);
        context.arc(this.position.x + cloudRadius * 4.5, this.position.y, this.radii[4], 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = globalAlpha;
    }
}

const SLIDER_MIN_VAL = 200;
const WAVE_SPEED = 0.05;
const COIN_SPAWN_CHANCE = 0.01;

/** @type {Player} */
let player;
/** @type {HTMLCanvasElement} */
let canvas;
/** @type {HTMLElement} */
let slider;
/** @type {HTMLElement} */
let weatherSlider;
/** @type {Coin[]} coins of the game */
let coins;
/** @type {Number} player score */
let score;
/** @type {CanvasRenderingContext2D} canvas context */
let context;
/** @type {WeatherParticle[]} Particles for weather simulation */
let wParticles;
/** @type {String[]} sea wave color */
let seaWavesColor;
let phase = 0; // Phase of the wave (initially 0)
let clearTransitAlpha = 0;

/**
 * Init the game
 */
function init() {
    player = new Player(200, window.innerHeight / 2);
    score = 0;
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    slider = document.getElementById('slider');
    weatherSlider = document.getElementById('weather');
    slider.addEventListener("input", onSliderMove);
    slider.value = (50 + window.innerHeight - 150) / 2;
    player.position.y = (50 + window.innerHeight - 150) / 2;

    wParticles = [];
    coins = [];

    seaWavesColor = ["#0000e0", "#0000c0", "#0000a0"]
    onSliderMove();
    // run updates in 60 fps
    // setInterval(update, 1000 / 60);
    window.requestAnimationFrame(update);
}

/**
 * Moving player
 */
function onSliderMove() {
    player.position.y = Number(slider.value);
}

function sliderUpdate() {
    slider.min = SLIDER_MIN_VAL;
    slider.max = window.innerHeight - 350;
}

/**
 * update the game view
 */
function update() {
    sliderUpdate();
    trySpawnCoin();
    envUpdate();
    physicsUpdate();
    renderUpdate();
    window.requestAnimationFrame(update);
}

function physicsUpdate() {
    coins.forEach(coin => {
        coin.position.x -= 4 * (window.innerHeight / 1080);
    });
    coins = coins.filter(coin => coin.position.x > 0);

    wParticles.forEach(drop => {
        if (drop instanceof Snowflake) {
            drop.velocity = drop.velocity.add(new Vector2((Math.random() - .5) / 10, Math.random() * .1));
            drop.velocity = new Vector2(Math.min(1, drop.velocity.x), Math.min(drop.velocity.y, 0.5));
            drop.angle += Math.random() * 0.02;
        }
        if (drop instanceof RainDrop) {
            drop.velocity.y += 0.02;
        }
        drop.position = drop.position.add(drop.velocity);
    });
    // y too low and x leave screen
    wParticles = wParticles.filter(p => p.position.y < window.outerHeight);
    wParticles = wParticles.filter(p => !(p.position.x < -10 || p.position.x > window.outerWidth));


    for (let index = coins.length - 1; index >= 0; index--) {
        const coin = coins[index];
        if (coin.isColliding(player)) {
            score += coin.score;
            delete coins[index];
        }
    }
}

/**
 * Render the game
 */
function renderUpdate() {
    canvas.width = window.innerWidth - 100;
    canvas.height = window.innerHeight - 100;

    context.reset();
    context.fillStyle = "#d0d0ff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (weatherSlider.value <= 0 && wParticles.length == 0) {
        clearTransitAlpha = Math.min(1, clearTransitAlpha + 0.01);
    }
    else {
        clearTransitAlpha = Math.max(0, clearTransitAlpha - 0.01);
    }
    if (clearTransitAlpha > 0) {
        const old = context.globalAlpha;
        context.globalAlpha = clearTransitAlpha;
        context.fillStyle = "#c2e0ff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.arc(canvas.width - 100, 40, 150, 0, 2 * Math.PI);
        context.fillStyle = "#ff0000";
        context.fill();
        context.globalAlpha = old;
    }

    // floor  
    drawSeaWaveLayer(0);
    for (let index = 0; index < seaWavesColor.length; index++) {
        wParticles.forEach(p => { if (p instanceof Cloud === false && p.layer == index) p.draw() });
        drawSeaWaveLayer(index);
    }
    wParticles.forEach(p => { if (p instanceof Cloud) p.draw() });

    player.draw();
    coins.forEach(coin => { coin.draw(); });
}

function trySpawnCoin() {
    if (Math.random() < COIN_SPAWN_CHANCE) {
        const coin = new Coin(window.innerWidth - 100, rr(200, window.innerHeight - 400));
        coins.push(coin);
    }
}

function envUpdate() {
    phase += WAVE_SPEED;

    // clear
    if (weatherSlider.value <= 0) {
        wParticles.forEach(p => { p.alpha -= 0.01; });
        wParticles = wParticles.filter(p => p.alpha >= 0);
        return;
    }
    // raining
    if (Math.random() < weatherSlider.value / 100) {
        if (Math.random() < 0.9) {
            wParticles.push(new RainDrop(rr(0, window.innerWidth), -10));
        }
        else {
            wParticles.push(new Snowflake(rr(0, window.innerWidth), -10));
        }
        if (weatherSlider.value > 0 && Math.random() < 0.01) {
            wParticles.push(new Cloud());
        }
    }
}

/** @param {Number} index */
function drawSeaWaveLayer(index) {
    const amplitude = 10; // Amplitude of the wave
    const frequency = 0.05; // Frequency of the wave (adjust for the desired wave length)

    context.beginPath();
    for (let x = 0; x < canvas.width; x++) {
        const y = amplitude * Math.sin((frequency - (index * 0.01)) * (x * (1 - index * 0.1)) + phase);
        context.lineTo(x, canvas.height - 175 + index * (50 - slider.value / window.innerHeight * 25) + y);
    }
    context.lineTo(canvas.width, canvas.height);
    context.lineTo(0, canvas.height);
    context.fillStyle = seaWavesColor[index]; //"#0000ff";
    context.fill();    // context.strokeStyle = "#ffffff"    // context.stroke();
}

/** Random util   @param {Number} min  @param {Number} max */
function rr(min, max) { return min + Math.random() * (max - min); }


window.onload = init;
