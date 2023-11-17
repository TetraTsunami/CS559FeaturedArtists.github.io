/**
 * Custom game engine-like codes, some behaves similar to Unity
 */

/** canvas context @type {CanvasRenderingContext2D}  */
let context;
/** canvas @type {HTMLCanvasElement} */
let canvas;
/** start time of the game @type {Number} */
let baseTime;

function init() {
    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth - 100;
    canvas.height = window.innerHeight - 150;

    context = canvas.getContext('2d');
    baseTime = Date.now();
}

/**
 * Custom user canvas stack
 */
class CanvasStack {
    /**
     * @type {Matrix3x3[]}
     */
    static stack = [];

    /**
     * @type  {Matrix3x3}
     */
    static current = Matrix3x3.identity();

    /**
     * 
     * @param {Matrix3x3} transform 
     */
    static setTransform(transform) {
        this.current = transform;
        transform.asCurrentTransform();
    }

    /**
     * 
     * @return {Matrix3x3}   
     */
    static getTransform() {
        return this.current.clone();
    }

    static save() {
        let current = this.current.clone();
        this.stack.push(current);
    }

    static restore() {
        if (this.stack.length == 0) return;
        this.current = this.stack.pop();
        this.current.asCurrentTransform();
    }
}

class GameObject {
    /** @type {GameObject[]} */
    static renderingObjects = []

    /** @type {boolean} */
    alive = true;

    /** @type {GameObject} */
    parent;

    /** local position of the game objeect @type {Vector2} */
    position;
    /** local scale of the game object @type {Vector2} */
    scale;
    /** local rotation of the game object (in degree) @type {Number} */
    rotation = 0;

    /** render layer of the game object @type {Number} */
    layer

    /** @type {Vector2} */
    velocity;
    /** @type {Number} */
    radius;

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.scale = new Vector2(1, 1);
        this.rotation = 0;
        this.alive = true;

        this.velocity = new Vector2(0, 0);
        this.radius = 1;
        this.layer = 0;
        GameObject.renderingObjects.push(this);
    }

    /**
     * 
     * @returns {Matrix3x3}
     */
    getTransform() {
        let transform = Matrix3x3.fromTranslation(this.position.x, this.position.y);
        // transform.scale(this.scale.x, this.scale.y, transform); 
        transform.mul(Matrix3x3.fromRotation(this.rotation / 180 * Math.PI), transform);
        transform.scale(this.scale.x, this.scale.y, transform);

        return transform;
    }

    /**
     * 
     * @returns {Matrix3x3}
     */
    getGlobalTransform() {
        if (this.parent instanceof GameObject) {
            let base = this.parent.getGlobalTransform();
            base.mul(this.getTransform(), base);
            return base;
        }
        return this.getTransform();
    }

    /**
     * 
     * @returns {Vector2}
     */
    getGlobalPosition() {
        return this.getGlobalTransform().position();
    }

    /**
     * 
     * @returns {Vector2}
     */
    getGlobalScale() {
        if (this.parent instanceof GameObject) {
            return this.scale.componentMul(this.parent.getGlobalScale());
        }
        return this.scale;
    }
    /**
     * 
     * @returns {Number}
     */
    getGlobalRotation() {
        if (this.parent instanceof GameObject) {
            return this.rotation * this.parent.getGlobalRotation();
        }
        return this.rotation;
    }

    isColliding(other) {
        let selfGlobal = this.getGlobalPosition();
        let otherGlobal = other.getGlobalPosition();
        return Math.sqrt((selfGlobal.x - otherGlobal.x) ** 2 + (selfGlobal.y - otherGlobal.y) ** 2) < this.radius + other.radius;
    }

    move() {
        this.position.add(this.velocity, this.position);
    }

    draw() { }

    onDestroy() { }

    /**
     * 
     * @param {GameObject} gameObject 
     * @returns 
     */
    static destroy(gameObject) {
        if (!gameObject.alive) return;
        let index = GameObject.renderingObjects.indexOf(gameObject);
        if (index != -1) {
            GameObject.renderingObjects.splice(index, 1);
        }
        gameObject.onDestroy();
        gameObject.alive = false;
    }

    static render() {
        // game object rendering
        let layers = [];
        GameObject.renderingObjects.forEach(g => {
            if (!layers.includes(g.layer)) {
                layers.push(Number(g.layer));
            }
        });
        layers.sort((a, b) => a - b);
        for (let index = 0; index < layers.length; index++) {
            const layer = layers[index];
            GameObject.renderingObjects.forEach(g => {
                if (g.layer == layer) {
                    let transform = g.getGlobalTransform();
                    CanvasStack.save();
                    CanvasStack.setTransform(transform);
                    g.draw();
                    CanvasStack.restore();
                }
            });
        }
    }

    static physicsUpdate() {
        GameObject.renderingObjects.forEach(g => {
            g.move();
        });
    }

    static removeFromRenderQueue(gameObject) {
        GameObject.renderingObjects.splice(GameObject.renderingObjects.indexOf(gameObject), 1);
    }
}

class ParticleSystem extends GameObject {
    /** @type {Particle[]} */
    particles;

    move() {
        this.particles.forEach(p => p.move());
    }

    draw() {  // game object rendering
        const layers = [];
        this.particles.forEach(g => {
            if (!layers.includes(g.layer)) {
                layers.push(Number(g.layer));
            }
        });
        layers.sort((a, b) => a - b);
        for (let index = 0; index < layers.length; index++) {
            const layer = layers[index];
            this.particles.forEach(g => { if (g.layer == layer) g.draw(); });
        }
    }

    onDestroy() {
        this.particles.forEach(p => p.onDestroy());
    }

    /**
     * 
     * @param {Particle} particle 
     */
    addParticle(particle) {
        this.particles.push(particle);
        GameObject.removeFromRenderQueue(particle);
        particle.parent = this;
    }
}

class Particle extends GameObject {
    /** @type {Number} */
    alpha;
    /** @type {string} */
    color;

    constructor(x, y) {
        super(x, y);
        this.alpha = 1;
        this.layer = Math.floor(rr(3));
    }
}

class FloatingText extends GameObject {
    time;
    color = hsl(0, 0, 100);
    lastTime;

    constructor(x, y, txt, time) {
        super(x, y)
        this.text = txt;
        this.time = time;
        this.lastTime = Date.now();
    }

    draw() {
        let pos = this.position;
        let a = context.globalAlpha;
        context.globalAlpha = 1 - (this.getLifeime() / this.time);
        context.font = "30px Arial";
        context.fillStyle = this.color;
        context.fillText(this.text, pos.x, pos.y);
        context.globalAlpha = a;

        if (this.getLifeime() > this.time) {
            GameObject.destroy(this);
        }
    }

    getLifeime() { return (Date.now() - this.lastTime) / 1000 }
}

class CurveSection {
    /** @type {Function} */
    uB;
    p0;
    p1;
    p2;
    p3;
    step = 50;

    /**
     * 
     * @param {Function} uB 
     * @param {Vector2} start 
     * @param {Vector2} sslope 
     * @param {Vector2} end 
     * @param {Vector2} eslope 
     */
    constructor(uB, start, sslope, end, eslope) {
        this.uB = uB;
        this.p0 = start;
        this.p1 = sslope;
        this.p2 = end;
        this.p3 = eslope;
    }

    P() {
        return [
            this.p0,
            this.p1,
            this.p2,
            this.p3
        ]
    }

    /** 
     * @param {Number} t 
     */
    curve(t) {
        return CurveSection.Cubic(this.uB, this.P(), t);
    }

    draw(t_begin = 0, t_end = 1) {
        context.beginPath();
        this.outline(t_begin, t_end);
        context.stroke();
    }

    outline(t_begin = 0, t_end = 1) {
        let step = 50;
        /** @type {Vector2} */
        let beginPoint = this.curve(t_begin);

        context.lineTo(beginPoint.x, beginPoint.y);
        for (var i = 1; i <= step; i++) {
            var t = ((step - i) / step) * t_begin + (i / step) * t_end;
            /** @type {Vector2} */
            let point = this.curve(t);
            context.lineTo(point.x, point.y);
        }
    }

    /**
     * @param {Function} basis 
     * @param {Vector2[]} P
     * @param {Number} t
     */
    static Cubic(basis, P, t) {
        let b = basis(t);
        let result = P[0].mul(b.x);
        result.add(P[1].mul(b.y), result);
        result.add(P[2].mul(b.z), result);
        result.add(P[3].mul(b.w), result);
        return result;
    }
}

class Curve extends GameObject {
    /** @type {CurveSection[]} */
    sections = [];
    /** @type {string} */
    color;
    /** @type {Number[]} */
    dash;
    /** @type {Vector2} */
    range = new Vector2(0, 1);

    lineWidth = 0.2;

    static getRandomSlope() {
        return Vector2.randomOnUnitCircle();
    }

    constructor(color, dash = []) {
        super(0, 0);
        this.color = color;
        this.dash = dash;
        this.offset = new Vector2(0, 0);
    }

    /** */
    newSection(p0, p1, p2, p3) {
        const section = new CurveSection(this.basis, p0, p1, p2, p3);
        this.add(section);
        return section;
    }

    add(section) {
        this.sections.push(section);
    }

    draw() {
        const min = this.range.x;
        const max = this.range.y;

        const fixedMin = min * this.sections.length;
        const fixedMax = max * this.sections.length;

        context.lineWidth = this.lineWidth;//hsl(0, 0, 0) 
        context.strokeStyle = this.color;
        var lineDash = context.getLineDash();
        context.setLineDash(this.dash);

        for (let index = Math.floor(fixedMin); index < fixedMax; index++) {
            const element = this.sections[index];
            const sectionMin = Math.max(fixedMin - index, 0);
            const sectionMax = Math.min(1, fixedMax - index);
            element.draw(sectionMin, sectionMax);
        }
        context.setLineDash(lineDash);
    }

    fill() {
        const min = this.range.x;
        const max = this.range.y;

        const fixedMin = min * this.sections.length;
        const fixedMax = max * this.sections.length;
        context.lineWidth = this.lineWidth;//hsl(0, 0, 0)   

        context.beginPath();
        let beginPoint = this.sections[Math.floor(fixedMin)].curve(Math.max(fixedMin - Math.floor(fixedMin), 0));
        context.moveTo(beginPoint.x, beginPoint.y);
        for (let index = Math.floor(fixedMin); index < fixedMax; index++) {
            const element = this.sections[index];
            const sectionMin = Math.max(fixedMin - index, 0);
            const sectionMax = Math.min(1, fixedMax - index);
            element.outline(sectionMin, sectionMax);
        }
        context.closePath();
        context.fill();
    }

    /** @param {Curve} other */
    slopeClone(other) {
        for (let index = 0; index < other.sections.length; index++) {
            /** @type {CurveSection} */
            const element = other.sections[index];
            this.sections[index].p1 = this.sections[index].p1.normalize().mul(element.p1.magnitude());
            this.sections[index].p3 = this.sections[index].p3.normalize().mul(element.p3.magnitude());
        }
    }

    drawControlPoints() {
        let transform = this.getGlobalTransform();
        this.sections.forEach(w => {
            w.drawControlPoint(transform);
        })
    }

    /**
     * 
     * @param {Number} t 
     * @returns 
     */
    basis(t) {
        return new Vector4(0, 0, 0, 0);
    }

    interpolate(u) {
        const fixedu = u * this.sections.length;
        const i = Math.floor(fixedu);
        if (this.sections.length <= i) return this.sections[this.sections.length - 1].curve(1);
        return this.sections[i].curve(Math.max(fixedu - i, 0));
    }
}
class Hermite extends Curve {
    createSections(count) {
        if (count == 0) return;

        const speed = 3;
        let start = new Vector2(0, 0);
        let startSlope = Curve.getRandomSlope().mul(speed);
        let end = start.add(Curve.step);
        let endSlope = Curve.getRandomSlope().mul(speed);
        const firstCruve = new CurveSection(start, startSlope, end, endSlope);
        this.sections.push(firstCruve);

        for (let i = 1; i < count; i++) {
            start = end;
            startSlope = endSlope;
            end = end.add(Curve.step);
            endSlope = Curve.getRandomSlope().mul(speed);
            const section = new CurveSection(this.basis, start, startSlope, end, endSlope);
            this.sections.push(section);
        }
    }

    basis(t) {
        return new Vector4(
            2 * t ** 3 - 3 * t ** 2 + 1,
            t * t * t - 2 * t * t + t,
            -2 * t * t * t + 3 * t * t,
            t * t * t - t * t
        );
    }
}

class Bezier extends Curve {

    /**
     * @param {Vector2} pnext
     * @param {Vector2} pcontrol 
    */
    append(pcontrol, pnext) {
        /** @type {CurveSection} */
        const last = this.sections[this.sections.length - 1];
        const p0 = last.p3.clone();
        const p1 = p0.add(last.p3).sub(last.p2);
        const s = new CurveSection(this.basis, p0, p1, pcontrol, pnext);
        this.add(s);
        return s;
    }

    basis(t) {
        var a = 1 - t;
        return new Vector4(
            a ** 3,
            3 * a ** 2 * t,
            3 * a * t ** 2,
            t ** 3,
        );
    }
}

class BSpline extends Curve {

    /** @param {Vector2} pnext*/
    append(pnext) {
        /** @type {CurveSection} */
        const last = this.sections[this.sections.length - 1];
        const s = new CurveSection(this.basis, last.p1, last.p2, last.p3, pnext);
        this.add(s);
    }

    basis(t) {
        return new Vector4(
            1 + -3 * t + 3 * t ** 2 + -1 * t ** 3,
            4 + -6 * t ** 2 + 3 * t ** 3,
            1 + 3 * t + 3 * t ** 2 + -3 * t ** 3,
            t ** 3
        ).mul(1 / 6);
    }
}

class Selectable extends GameObject {
    /**
     * @type {Selectable}
     */
    static selected = null;
    /**
     * @type {Selectable[]}
     */
    static selectables = [];

    /**
     * @type {boolean}
     */
    interactable = true;

    constructor(x, y) {
        super(x, y);
        Selectable.selectables.push(this);
    }

    onMouseDrag(x, y) {
    }

    onSelect() {

    }

    onUnselect() {

    }

    static selectNearest(x, y) {
        let globalPos = p(x, y);
        Selectable.selectables.sort(
            (a, b) => {
                let posA = a.getGlobalPosition();
                let posB = b.getGlobalPosition();

                return Vector2.distance(posA, globalPos) - Vector2.distance(posB, globalPos);
            }
        )
        if (this.selectables.length > 0) {
            let candidate = this.selectables[0];
            let posA = candidate.getGlobalPosition();
            if (Vector2.distance(posA, globalPos) < candidate.radius) {
                this.selected = candidate;
                if (this.selected.interactable)
                    this.selected.onSelect();
            }
        }
    }

    static unselect() {
        if (this.selected)
            this.selected.onUnselect();
        this.selected = null;
    }
}


class Buttom extends Selectable {

    method;

    constructor(x, y, method) {
        super(x, y);
        this.method = method;
    }

    onUnselect() {
        if (this.method) this.method();
    }
}

