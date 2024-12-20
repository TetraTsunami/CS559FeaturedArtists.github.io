class WaveSection {
    /** @type {Vector2} */
    start;
    /** @type {Vector2} */
    startSlope;
    /** @type {Vector2} */
    end;
    /** @type {Vector2} */
    endSlope;

    constructor(start, sslope, end, eslope) {
        this.start = start;
        this.startSlope = sslope;
        this.end = end;
        this.endSlope = eslope;
    }

    /**
     * @param {Matrix3x3} transform 
     */
    draw(transform) {
        const P0 = [
            this.start,
            this.startSlope,
            this.end,
            this.endSlope
        ]

        let curve = (t) => Cubic(Hermite, P0, t);
        let step = 50;
        let t_begin = 0;
        let t_end = 1;
        /** @type {Vector2} */
        let beginPoint = curve(t_begin);

        context.beginPath();
        // context.moveTo(beginPoint.x, beginPoint.y);
        moveToTx(beginPoint, transform);
        for (var i = 1; i <= step; i++) {
            var t = ((step - i) / step) * t_begin + (i / step) * t_end;
            /** @type {Vector2} */
            let point = curve(t);
            // context.lineTo(point.x, point.y);
            lineToTx(point, transform);
        }
        context.stroke();
    }
}

class Wave extends GameObject {
    /** @type {WaveSection[]} */
    wave = [];
    /** @type {string} */
    color;
    /** @type {Number[]} */
    dash

    offset;

    static step = new Vector2(1, 0);
    static getRandomSlope() {
        return Vector2.randomOnUnitCircle();
        // return new Vector2(rr(1), rr(1)).normalize();
    }

    constructor(color, dash = []) {
        super(0, 0);
        this.color = color;
        this.dash = dash;
        this.velocity = new Vector2(1, 0);
        this.offset = new Vector2(rr(200), 0);

        const speed = 3;
        let start = new Vector2(0, 0);
        let startSlope = Wave.getRandomSlope().mul(speed);
        let end = start.add(Wave.step);
        let endSlope = Wave.getRandomSlope().mul(speed);

        const firstWave = new WaveSection(start, startSlope, end, endSlope);

        this.wave.push(firstWave);
        for (let i = 1; i < 4; i++) {
            start = end;
            startSlope = endSlope;
            end = end.add(Wave.step);
            endSlope = Wave.getRandomSlope().mul(speed);
            const section = new WaveSection(start, startSlope, end, endSlope);

            this.wave.push(section);
        }
        this.wave[this.wave.length - 1].endSlope = firstWave.startSlope;
    }

    draw() {
        const scale = 100;
        let transform = this.getGlobalTransform();
        // give up random noise, too shaky
        // if (this.dash.length == 0) transform.mul(randomNoise, transform);
        transform.translate(this.offset.x, this.offset.y, transform);
        transform.scale(scale, scale, transform);


        let size = Wave.step.mul(4);

        let baseTransform = transform.clone();
        transform.translate(3 * -size.x, 3 * -size.y, transform);

        if (size.x > 0) this.position.x %= scale * size.x;
        if (size.y > 0) this.position.y %= scale * size.y;

        let maxCount = canvas.width / (scale * size.x) + 2;

        for (let i = 0; i < maxCount; i++) {
            transform.translate(size.x, size.y, transform);
            this.drawSection(transform);
        }
    }

    /**
     * 
     * @param {Matrix3x3} transform 
     */
    drawSection(transform) {
        context.lineWidth = 2;//hsl(0, 0, 0)

        let beginPoint = this.wave[0].start.clone();
        context.beginPath();
        context.setLineDash([4, 8]);
        beginPoint.y -= 1;
        moveToTx(beginPoint, transform);
        beginPoint.y += 2;
        lineToTx(beginPoint, transform);
        context.stroke();

        context.strokeStyle = this.color;
        context.setLineDash(this.dash);
        for (let index = 0; index < this.wave.length; index++) {
            const element = this.wave[index];
            element.draw(transform);
        }
    }

    /** @param {Wave} other */
    slopeClone(other) {
        for (let index = 0; index < other.wave.length; index++) {
            /** @type {WaveSection} */
            const element = other.wave[index];
            this.wave[index].startSlope = this.wave[index].startSlope.normalize().mul(element.startSlope.magnitude());
            this.wave[index].endSlope = this.wave[index].endSlope.normalize().mul(element.endSlope.magnitude());
        }
    }
}

class Gear extends GameObject {
    count;
    gearLength;
    angularVelocity = 0;
    color = hsl(120, 100, 30);

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} count 
     * @param {Number} radius 
     * @param {Number} gearLength 
     */
    constructor(x, y, count, radius, gearLength = 5) {
        super(x, y);
        this.count = count;
        this.radius = radius;
        this.gearLength = gearLength;
    }

    move() {
        super.move();
        this.rotation += this.angularVelocity;
    }

    draw() {
        let transform = this.getGlobalTransform();
        let radian = 2 * Math.PI / this.count / 2;

        context.beginPath();
        moveToTx(new Vector2(this.radius, 0), transform);
        for (let i = 0; i < this.count; i++) {
            lineToTx(new Vector2(this.radius, 0), transform);
            lineToTx(new Vector2(this.radius - this.gearLength, 0), transform);
            transform.mul(Matrix3x3.fromRotation(radian), transform);
            lineToTx(new Vector2(this.radius - this.gearLength, 0), transform);
            lineToTx(new Vector2(this.radius, 0), transform);
            transform.mul(Matrix3x3.fromRotation(radian), transform);
        }
        context.fillStyle = this.color;
        context.fill();
        // context.stroke();
    }
}

class Arrow extends GameObject {
    color = hsl(0, 100, 50);
    length;
    arrowSize = 3;

    constructor(x, y, length = 10) {
        super(x, y);
        this.length = length;
    }

    draw() {
        const arrowSize = this.arrowSize;
        let transform = this.getGlobalTransform();
        transform.mul(Matrix3x3.fromRotation(-Math.PI / 2), transform);
        transform.translate(0, -this.length / 2, transform);
        context.beginPath();
        moveToTx(new Vector2(-1, 0), transform);
        lineToTx(new Vector2(-1, this.length), transform);
        lineToTx(new Vector2(-1 - arrowSize, this.length - arrowSize), transform);
        lineToTx(new Vector2(-1 - arrowSize, this.length), transform);
        lineToTx(new Vector2(0, this.length + arrowSize), transform);
        lineToTx(new Vector2(1 + arrowSize, this.length), transform);
        lineToTx(new Vector2(1 + arrowSize, this.length - arrowSize), transform);
        lineToTx(new Vector2(1, this.length), transform);
        lineToTx(new Vector2(1, 0), transform);
        context.fillStyle = this.color;
        context.fill();
    }
}

class GreenSparckle extends Particle {

    constructor(x, y) {
        super(x, y);
        let scale = rr(5);
        this.scale = new Vector2(scale, scale);
        this.velocity = new Vector2(0, rr(5));
        this.color = hsl(120, rr(50, 100), rr(30, 70));
    }

    draw() {
        let transform = this.getGlobalTransform();
        context.beginPath();
        moveToTx(new Vector2(1, 1), transform);
        lineToTx(new Vector2(1, -1), transform);
        lineToTx(new Vector2(-1, -1), transform);
        lineToTx(new Vector2(-1, 1), transform);
        context.fillStyle = this.color;
        context.fill();
        if (transform.position().y >= canvas.height) {
            GameObject.Destroy(this);
        }
    }

    move() {
        super.move();
        this.scale.add(new Vector2(-0.01, -0.01), this.scale);
        if (this.scale.x <= 0) {
            GameObject.Destroy(this);
        }
    }
}

class SpinBG extends GameObject {
    constructor() {
        super(0, 0);
        this.layer = 99;
    }
    draw() {
        const size = 400;
        context.fillStyle = hsl(100, 100, 50);
        context.fillRect(canvas.width / 2 - size / 2, canvas.height - 160, size, 160);
    }
}


/** @type {Wave} */
let targetWave;
/** @type {Wave} */
let playerWave;
/** @type {HTMLElement[]} */
let sliders = []
/** @type {HTMLElement[]} */
let positionSlider;
/** @type {Number} */
let score
/** @type {Number} */
let randomNoiseCounter = 0;
/** @type {Matrix3x3} */
let randomNoise;
/** @type {Gear[]} */
let gears = []
/** @type {Gear[]} */
let gearsLarge = []

const MAX_MATCH_ANGLE = 10;
const BASE_ANGLE = 45;

window.onload = () => {
    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth - 100;
    canvas.height = window.innerHeight - 150;
    context = canvas.getContext('2d');

    sliders.push(document.getElementById('slider1'));
    sliders.push(document.getElementById('slider2'));
    sliders.push(document.getElementById('slider3'));
    sliders.push(document.getElementById('slider4'));
    positionSlider = document.getElementById('sliderx');
    for (let i = 0; i < sliders.length; i++) {
        const element = sliders[i];
        element.value = BASE_ANGLE;
    }

    baseTime = Date.now();
    score = 0;
    randomNoise = new Matrix3x3();

    // create waves
    targetWave = new Wave(hsl(120, 100, 50));
    targetWave.position.x = 200;
    targetWave.position.y = canvas.height / 2;
    targetWave.layer = 100;
    playerWave = new Wave(hsl(0, 100, 50), [2, 4]);
    playerWave.position.x = 200;
    playerWave.position.y = canvas.height / 2;
    playerWave.layer = 101;
    playerWave.slopeClone(targetWave);

    genRandomDecor();
    new SpinBG();
    const gearSize = 100;
    const length = 5;
    const innerRadius = gearSize - length;
    let start = (canvas.width / 2) - innerRadius * 1.5;
    for (let i = 0; i < 4; i++) {
        let x = start + i * innerRadius;
        let y = canvas.height - 100;
        const gear = new Gear(x, y, 20, gearSize / 3, 4);
        gears.push(gear);

        let arrow = new Arrow(0, 0, 10);
        arrow.parent = gear;
        arrow.scale = new Vector2(2, 2);

        const gearLarge = new Gear(x, y, 30, gearSize / 2, 4);
        gearLarge.color = hsl(120, 100, 20);
        gearLarge.layer = 100;
        gearsLarge.push(gearLarge);

        gear.layer = 101;
        arrow.layer = 102;
    }

    requestAnimationFrame(update);
}

function genRandomDecor() {

    const gearCount = 20;
    let g0 = new Gear(100, 100, gearCount, 30, 5);
    g0.angularVelocity = 1;
    g0.rotation = 180;

    let g1 = new Gear(155, 100, gearCount, 30, 5);
    g1.angularVelocity = -1;
    g1.rotation += 360 / gearCount;

    let g2 = new Gear(45, 0, 10, 20, 5);
    g2.parent = g1;
    g2.angularVelocity = 0;
    g2.color = hsl(120, 100, 20);
    g2.layer = 1;

    let g3 = new Gear(0, 0, 30, 40, 5);
    g3.parent = g2;
    g3.angularVelocity = 1;
    g3.color = hsl(120, 100, 15);
    g3.layer = -1;

    let pos = new Vector2(rrwidth(), rrheight());
    let lastGear = new Gear(pos.x, pos.y, rri(16, 32), rr(50, 20), rr(5, 12));
    lastGear.angularVelocity = rr(-1, 1);
    lastGear.color = hsl(rr(100, 140), rr(100, 50), rr(10, 20));
    lastGear.layer = 0;
    for (let i = 0; i < 10; i++) {
        pos = new Vector2(rrwidth(), rrheight());
        let gear;
        if (rr(1) > 0.2) {
            gear = new Gear(pos.x, pos.y, rri(16, 32), rr(50, 20), rr(4, 8));
        }
        else {
            gear = new Gear(lastGear.radius, 0, rri(16, 32), rr(50, 20), rr(4, 8));
            gear.parent = lastGear;
        }
        gear.angularVelocity = rr(-1, 1);
        gear.color = hsl(rr(100, 140), rr(100, 50), rr(10, 20));
        gear.layer = 0;
        lastGear = gear;
    }

    const border = 300;
    pos = new Vector2(border + rr(canvas.width - border), border + rr(canvas.height - border));
    for (let i = 0; i < 2; i++) {
        let gear;
        gear = new Gear(lastGear.radius, 0, rri(16, 32), rr(50, 20), rr(4, 8));
        gear.parent = lastGear;
        gear.angularVelocity = rr(-1, 1);
        gear.color = hsl(rr(100, 140), rr(100, 50), rr(10, 20));
        gear.layer = 0;
        lastGear = gear;
    }

}

function update() {
    physicsUpdate();
    envUpdate();
    gameUpdate();
    renderUpdate();

    requestAnimationFrame(update);
}

function envUpdate() {
    randomNoiseCounter++;
    if (randomNoiseCounter < 10) return;
    randomNoise = new Matrix3x3();
    randomNoise.translate(0, rr(-1, 1), randomNoise);
    randomNoise.scale(1, 1 + rr(-1, 1) * .01, randomNoise);
    randomNoiseCounter = 0;

    new GreenSparckle(rrwidth(), rrheight());
    new GreenSparckle(rrwidth(), rrheight());
}

function gameUpdate() {
    let totalAngle = 0;
    for (let index = 0; index < sliders.length; index++) {
        const element = sliders[index];
        const baseSlope = playerWave.wave[index].startSlope;
        const angle = -element.value;
        const radian = angle / 180 * Math.PI;
        const slope = Vector2.Angle2Vector(radian).mul(baseSlope.magnitude());
        totalAngle += angle;

        playerWave.wave[index].startSlope = slope;
        gears[index].rotation = angle;
        for (let i = 0; i < sliders.length; i++) {
            if (i != index) {
                gearsLarge[i].rotation = angle * (i % 2 == 0 ? -1 : 1);
            }
        }

        if (index == 0) {
            playerWave.wave[sliders.length - 1].endSlope = slope;
        }
        else {
            playerWave.wave[index - 1].endSlope = slope;
        }
    }
    totalAngle += positionSlider.value;
    for (let i = 0; i < sliders.length; i++) {
        gearsLarge[i].rotation = totalAngle * (i % 2 == 0 ? -1 : 1);
    }

    playerWave.offset.x = positionSlider.value;

    let matches = true;
    for (let i = 0; i < playerWave.wave.length; i++) {
        const element = playerWave.wave[i];
        let diff = Math.abs(element.startSlope.radian() - targetWave.wave[i].startSlope.radian());
        diff = Math.min(diff, Math.PI * 2 - diff);
        if (diff < MAX_MATCH_ANGLE / 180 * Math.PI) {
            continue;
        }
        else {
            matches = false;
            break;
        }

    }

    if (matches) {
        score += 1;
        GameObject.Destroy(targetWave);
        targetWave = createNewTargetWave(playerWave.position.x, playerWave.position.y, targetWave.color, targetWave.dash);
        for (let index = 0; index < sliders.length; index++) {
            const element = sliders[index];
            element.value = BASE_ANGLE;
        }
        var text = new FloatingText(canvas.width / 2, canvas.height - 100, "Complete +1", 1);
        text.velocity = new Vector2(0, -1);
    }
}

function createNewTargetWave(x, y, color, dash = []) {
    let wave = new Wave(color, dash);
    targetWave.layer = 100;
    wave.position.x = x;
    wave.position.y = y;
    return wave;
}


function renderUpdate() {
    context.reset();

    // bg
    context.fillStyle = hsl(120, 100, 5);
    context.fillRect(0, 0, screen.width, screen.height);
    const gridSize = 50;
    context.strokeStyle = hsl(120, 100, 20 + 5 * Math.sin(Date.now() * 0.002));
    for (let x = 0; x < canvas.width; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
    }
    for (let y = 0; y < canvas.width; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
    }

    // game object rendering
    let layers = [];
    GameObject.gameObjects.forEach(g => {
        if (!layers.includes(g.layer)) {
            layers.push(Number(g.layer));
        }
    });
    layers.sort((a, b) => a - b);
    for (let index = 0; index < layers.length; index++) {
        const layer = layers[index];
        GameObject.gameObjects.forEach(g => { if (g.layer == layer) g.draw(); });
    }

    context.fillStyle = hsl(90, 100, 50);
    context.fillRect(0, canvas.height - 50, canvas.width, 50);


    context.font = "30px Arial";
    context.fillStyle = "#000";
    context.fillText("Score: " + score.toString(), 20, canvas.height - 20);
}

/**
 * 
 * @param {Vector2} loc 
 * @param {Matrix3x3} Tx 
 */
function moveToTx(loc, Tx) {
    var res = Tx.transform(loc);// vec2.transformMat3(res, loc, Tx); 
    context.moveTo(res.x, res.y);
    // console.log(res.x, res.y);
}

/**
 * 
 * @param {Vector2} loc 
 * @param {Matrix3x3} Tx 
 */
function lineToTx(loc, Tx) {
    var res = Tx.transform(loc);// vec2.transformMat3(res, loc, Tx);
    context.lineTo(res.x, res.y);
}
