class Star extends GameObject {
    hsl_h;
    hsl_s;
    hsl_l;
    isTouched;
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(x, y) {
        super(x, y);
        this.velocity = p(rr(-0.5, 0), 0);
        this.radius = rr(2, 20);
        if (rr() > 0.3) {
            this.hsl_h = rri(0, 60);
            this.hsl_s = rri(60, 100);
            this.hsl_l = rri(45, 120);
        }
        else {
            this.hsl_h = rr(230, 250);
            this.hsl_s = rr(60, 40);
            this.hsl_l = rr(60, 100);
        }
        this.colorVaryingSpeed = 1 / rr(400, 1000);
    }

    draw() {
        context.fillStyle = this.getColor();

        let current = CanvasStack.getTransform();
        const radius = this.radius / 2;
        for (let i = 0; i < 4; i++) {
            context.beginPath();
            context.moveTo(0, radius);
            context.lineTo(radius / 3, 0);
            context.lineTo(-radius / 3, 0);
            context.closePath();
            context.fill();
            current.rotate(Math.PI / 2, current);
            CanvasStack.setTransform(current);
        }
    }

    getColor() {
        let l = Math.sin(Date.now() * this.colorVaryingSpeed) * 20 + this.hsl_l;
        return hsl(this.hsl_h, this.hsl_s, l);
    }

    move() {
        if (isRunning) {
            this.position.add(this.velocity, this.position);
        }
    }

    /**
     * 
     * @param {Vector2} position 
     * @returns 
     */
    static randomStar(position) {
        const star = new Star();
        if (!position) position = rrCanvasPos();
        star.position = position;

        return star;
    }
}

class ChildStar extends Star {

    orbit;
    r;

    move() {
        this.r += 0.01;
        this.position = Vector2.Angle2Vector(this.r).mul(this.orbit);
    }

    /**
     * 
     * @param {Vector2} position 
     * @returns 
     */
    static randomStar(position) {
        const star = Star.randomStar(position);
        star.radius = rr(10, 20);
        const orbit = rr(10, 30);
        const child = new ChildStar(0, 0);
        child.radius = rr(star.radius * 0.75);
        child.parent = star;
        child.orbit = orbit;
        child.r = rr(0, Math.PI);
        return star;
    }
}

class Nebula extends GameObject {
    /** @type {Vector2[]} */
    points;
    hsl_h;
    hsl_s;
    hsl_l;
    alpha = 1;
    curve;

    constructor(x, y) {
        super(x, y);
        const baseRadius = 80;
        const offset = 20;
        const pointCount = rr(10, 20);
        const angle = 360 / pointCount;
        let current = baseRadius;

        this.points = [];
        this.velocity = p(rr(-0.05, 0), 0);

        for (let i = 0; i < pointCount; i++) {
            var direction = Vector2.Angle2Vector(angle * i / 180 * Math.PI);
            current = Math.max(60, current + rr(-offset, offset));
            direction.mul(current, direction);
            this.points.push(direction);
        }

        this.curve = new BSpline();
        this.curve.parent = this;
        GameObject.removeFromRenderQueue(this.curve);
        let i = 0;
        this.curve.newSection(this.points[i + 0], this.points[i + 1], this.points[i + 2], this.points[i + 3]);
        i = 4;
        for (; i < this.points.length; i++) {
            this.curve.append(this.points[i]);
        }
        this.curve.append(this.points[0]);
        this.curve.append(this.points[1]);
        this.curve.append(this.points[2]);
    }

    draw() {
        const oldAlpha = context.globalAlpha;
        context.fillStyle = this.getColor();
        context.globalAlpha = this.alpha;

        this.curve.fill();

        context.globalAlpha = oldAlpha;
    }

    getColor() {
        let l = this.hsl_l;
        return hsl(this.hsl_h, this.hsl_s, l);
    }

    move() {
        if (isRunning) {
            this.position.add(this.velocity, this.position);
        }
    }

    /**
     * 
     * @param {Vector2} position 
     */
    static create(position) {
        var nebula = new Nebula(position.x, position.y);
        nebula.hsl_h = rr(230, 280);
        nebula.hsl_s = rr(80, 100);
        nebula.hsl_l = 10;//rr(10, 15);
        nebula.alpha = rr();
        return nebula;
    }
}
class PathNode extends Selectable {
    /**
     * @type {CurveSection}
     */
    section;
    otherSection;


    constructor(point, section) {
        super(point.x, point.y);
        this.position = point; //linking position
        this.radius = 7;
        this.section = section;
    }

    onSelect() {
    }

    onMouseDrag(x, y) {
        if (this.isEndPoint) {
            // this.section.
        }
        let pos = this.getGlobalPosition();
        this.position.x -= pos.x - x;
        this.position.y -= pos.y - y;
    }

    draw() {
        if (!isRunning) {
            if (this.interactable)
                context.strokeStyle = "#ffffff";
            else {
                context.strokeStyle = "#808080";
            }
            context.lineWidth = 1;
            context.strokeRect(-5, -5, 10, 10);
        }
    }
}

class Path extends GameObject {
    /** @type {Bezier} */
    curve;
    /** @type {Ship} */
    ship;
    /** @type {Number} */
    progress;

    p1n;
    p2n;
    p3n;

    constructor(p0) {
        super(0, 0);
        this.velocity = p(-0.25, 0);
        this.progress = 0;

        this.curve = new Bezier("#ffffff", [10, 5]);
        GameObject.removeFromRenderQueue(this.curve);
        const halfHeight = canvas.height / 2;
        if (p0 === undefined) p0 = p(60, halfHeight);
        const p1 = p(100, halfHeight + 30);
        const p2 = p(120, halfHeight);
        const p3 = p(150, halfHeight - 30);
        const section = this.curve.newSection(p0, p1, p2, p3);

        // let p0n = new PathNode(p0, section);
        // p0n.isStartPoint = true;
        // p0n.parent = this.curve;
        this.p1n = new PathNode(p1, section);
        this.p1n.parent = this;
        // p1n.isStartPoint = true;
        this.p2n = new PathNode(p2, section);
        this.p2n.parent = this;
        // p2n.isStartPoint = true; 
        this.p3n = new PathNode(p3, section);
        this.p3n.parent = this;
        // p3n.isEndPoint = true;

        let ship = new Ship(p0.x, p0.y);
        ship.parent = this;
        ship.scale = p(1, 1);
        this.ship = ship;
    }


    draw() {
        this.curve.lineWidth = 1;
        if (isRunning) {
            this.curve.color = "#00ff00";
            this.curve.range.x = this.progress;
            this.curve.range.y = 1;
            this.curve.draw();
        }
        else {
            this.curve.color = "#008000";
            this.curve.range.x = 0;
            this.curve.range.y = this.progress;
            this.curve.draw();
            this.curve.color = "#00ff00";
            this.curve.range.x = this.progress;
            this.curve.range.y = 1;
            this.curve.draw();
        }
    }

    move() {
        if (isRunning) {
            let disp = this.p3n.position.sub(this.curve.sections[0].p0).magnitude();
            // let disp2 = this.p3n.position.sub(this.ship.position).magnitude();
            this.progress += 0.5 / disp;

            let newPos = this.curve.interpolate(this.progress);
            let nextNewPos = this.curve.interpolate(this.progress + 0.001);
            let dir = nextNewPos.sub(newPos).radian() / Math.PI * 180;

            this.ship.rotation = dir;
            this.ship.position.x = newPos.x;
            this.ship.position.y = newPos.y;
            super.move();
            if (this.progress >= 1) {
                isRunning = false;
                this.continue();
            }
        }
        else {
            this.progress = (this.curve.sections.length - 1) / this.curve.sections.length;
            let newPos = this.curve.interpolate(this.progress);
            let nextNewPos = this.curve.interpolate(this.progress + 0.001);
            let dir = nextNewPos.sub(newPos).radian() / Math.PI * 180;

            this.ship.rotation = dir;
        }
    }

    continue() {
        const newInit = this.p3n.getGlobalPosition();
        let curveSection = this.curve.append(p(newInit.x + 50, canvas.height / 2), p(newInit.x + 100, canvas.height / 2));
        this.progress = (this.curve.sections.length - 1) / this.curve.sections.length;
        this.p1n.position = curveSection.p1;
        this.p1n.interactable = false;
        this.p2n.position = curveSection.p2;
        this.p3n.position = curveSection.p3;

        this.p2n.position.x = curveSection.p1.x + 100;
        this.p3n.position.x = curveSection.p1.x + 200;

        fixPosition(this.p2n);
        fixPosition(this.p3n);

        /**
         * 
         * @param {GameObject} node 
         */
        function fixPosition(node) {
            let globalPos = node.getGlobalPosition();
            let position = node.position;
            let globalScale = node.getGlobalScale();

            while (isOursideCanvas(globalPos)) {
                if (globalPos.x > canvas.width) position.x -= globalScale.x;
                if (globalPos.y > canvas.height) position.y -= globalScale.y;
                if (globalPos.x < 0) position.x += globalScale.x;
                if (globalPos.y < 0) position.y += globalScale.y;
                globalPos = node.getGlobalPosition();
            }
        }
    }
}

class Ship extends GameObject {
    draw() {
        context.fillStyle = "#ffffff";
        context.fillRect(-7, -5, 14, 10);



        context.beginPath();
        context.moveTo(-7, 5);
        context.lineTo(-7, -5);
        context.lineTo(-9, 0);
        context.closePath();
        context.fill();



        context.beginPath();
        context.moveTo(7, 5);
        context.lineTo(7, -5);
        context.lineTo(15, 0);
        context.closePath();
        context.fill();
    }
}

class PassEffect extends GameObject {
    currentRadius;

    /**
     * 
     * @param {Star} star 
     */
    constructor(star) {
        super(0, 0);
        this.parent = star;
        this.radius = 20;
        this.currentRadius = 0;
    }

    draw() {
        context.fillStyle = "#ffff00";
        const old = context.globalAlpha;// = 1 - this.currentRadius / this.radius;
        context.globalAlpha = 1 - this.currentRadius / this.radius;

        this.currentRadius += 0.1;

        context.beginPath();
        context.arc(this.position.x, this.position.y, this.currentRadius, 0, Math.PI * 2);
        context.fill();


        context.globalAlpha = old;
        if (this.currentRadius >= this.radius) {
            GameObject.destroy(this);
        }
    }
}

class PauseButton extends Buttom {

    constructor(x, y, method) {
        super(x, y, method);
        this.radius = 20;
    }

    draw() {
        context.fillStyle = "#ffff00";
        if (isRunning) {
            context.fillRect(-10, -10, 4, 20);
            context.fillRect(6, -10, 4, 20);
        }
        else {
            context.beginPath();
            context.moveTo(-10, -10);
            context.lineTo(10, 0);
            context.lineTo(-10, 10);
            context.closePath();
            context.fill();
        }
    }

    onUnselect() {
        if (!isRunning && this.interactable) {
            this.method();
        }
    }
}


/** @type {boolean} */
let isRunning;
/** @type {HTMLElement} */
let scoreDisplayer;
/** @type {Number} */
let score = 0;
/** @type {Ship} */
let ship

window.onload = () => {
    init();
    scoreDisplayer = document.getElementById("score");
    registerEvents();

    let pause = new PauseButton(20, canvas.height - 20, this.run);
    pause.layer = 100;
    ship = new Path().ship;

    randomDecoration();
    requestAnimationFrame(update);
}

function run() {
    isRunning = true;
}

function registerEvents() {
    canvas.addEventListener('mousedown', (event) => {
        const x = event.clientX - canvas.getBoundingClientRect().left;
        const y = event.clientY - canvas.getBoundingClientRect().top;
        // console.log(`Mouse Position: (${x}, ${y})`);
        Selectable.selectNearest(x, y);
    });
    canvas.addEventListener('mouseup', (event) => {
        Selectable.unselect();
    });

    canvas.addEventListener('mousemove', (event) => {
        // Get the mouse's x and y coordinates
        const x = event.clientX - canvas.getBoundingClientRect().left;
        const y = event.clientY - canvas.getBoundingClientRect().top;

        // Display the mouse position on the page
        // console.log(`Mouse Position: (${x}, ${y})`);
        if (Selectable.selected && Selectable.selected.interactable)
            Selectable.selected.onMouseDrag(x, y);
    });

    // Add keydown event listener to detect when a key is pressed
    document.addEventListener('keydown', (event) => {
        const key = event.key; // Get the key that was pressed
        // console.log(`Key Pressed: ${key}`);
    });

    // Add keyup event listener to detect when a key is released
    document.addEventListener('keyup', (event) => {
        const key = event.key; // Get the key that was released
        if (key == " ") {
            isRunning = true;
            Selectable.unselect();
        }
    });
}


function randomDecoration() {
    for (let i = 0; i < 5; i++) {
        randomConstellation();
    }
    for (let i = 0; i < 20; i++) {
        var nebula = Nebula.create(rrCanvasPos());
        nebula.layer = -1;
        nebula.scale = new Vector2(rr(0.5, 1.5), rr(0.5, 1.5));
    }
    for (let i = 0; i < canvas.height * canvas.width / 10000; i++) {
        Star.randomStar(rrCanvasPos());
    }
    for (let i = 0; i < 10; i++) {
        ChildStar.randomStar(rrCanvasPos());
    }
}

function randomConstellation(position = undefined) {
    let stars = []
    let count = rri(6, 12);

    if (position === undefined) position = rrCanvasPos();

    let avgVelocity = p(rr(-0.5, 0), 0);
    for (let i = 0; i < count; i++) {
        const element = Star.randomStar(position.add(Vector2.randomInUnitCircle().mul(100)));
        stars.push(element);
        element.velocity = avgVelocity.clone();
        element.velocity.x += rr(0, 0.1);
    }

    let b = new BSpline("#ffffff");
    b.newSection(stars[0].position, stars[1].position, stars[2].position, stars[3].position);
    for (let i = 4; i < stars.length - 3; i++) {
        b.append(stars[i].position);
    }
    b.append(stars[0].position);
    b.append(stars[1].position);
    b.append(stars[2].position);
}



function update() {


    renderUpdate();
    envUpdate();
    gameUpdate();
    GameObject.physicsUpdate();


    requestAnimationFrame(update);
}

function envUpdate() {
    if (!isRunning) return;
    if (rr() < 0.01) {
        Star.randomStar(p(canvas.width + 200, rrheight()));
    }
    if (rr() < 0.001) {
        ChildStar.randomStar(p(canvas.width + 200, rrheight()));
    }
    if (rr() < 0.004) {
        randomConstellation(p(canvas.width + 200, rrheight()));
    }
    if (rr() < 0.0008) {
        var nebula = Nebula.create(p(canvas.width + 200, rrheight()));
        nebula.layer = -1;
        nebula.scale = new Vector2(rr(0.5, 1.5), rr(0.5, 1.5));
    }
}

function gameUpdate() {
    scoreDisplayer.textContent = "Pass through Stars: " + score;

    GameObject.renderingObjects.forEach(element => {
        if (element instanceof Star) {
            if (element.isColliding(ship) && !element.isTouched) {
                element.isTouched = true;
                score++;
                new PassEffect(element);
            }
        }
    });
}


function renderUpdate(params) {
    context.reset();
    GameObject.render();
}
