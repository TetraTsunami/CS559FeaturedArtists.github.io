/**
 * Implementation of my own library for matrix and for a game (a very small game engine really)
 * 
 * @author Wendi Cai
 */

class Vector2 {
    /** @type {Number}   */ x;
    /** @type {Number}   */ y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /** @param {Vector2} other  @param {Vector2} result */
    add(other, result = null) {
        if (result) {
            result.x = this.x + other.x;
            result.y = this.y + other.y;
            return result;
        } return new Vector2(this.x + other.x, this.y + other.y);
    }
    /** @param {Vector2} other */
    sub(other) {
        if (result) {
            result.x = this.x - other.x;
            result.y = this.y - other.y;
            return result;
        } return new Vector2(this.x - other.x, this.y - other.y);
    }
    magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2); }
    /** @param {Number} other  @param {Vector2} result */
    mul(other, result = null) {
        if (result) {
            result.x = this.x * other;
            result.y = this.y * other;
            return result;
        }
        return new Vector2(this.x * other, this.y * other);
    }
    /** @param {Vector2} other */
    dot(other) { return this.x * other.x + this.y * other.y; }

    /** @param {Vector2} result */
    normalize(result = null) {
        let l = this.magnitude();
        if (result) {
            result.x = this.x / l;
            result.y = this.y / l;
        }
        return new Vector2(this.x / l, this.y / l);
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    radian() {
        return Math.atan2(this.y, this.x);
    }

    static randomInUnitCircle() {
        let result;
        do {
            result = new Vector2(rr(-1, 1), rr(-1, 1));
        }
        while (result.magnitude() > 1);
        return result;
    }

    static randomOnUnitCircle() {
        let result = Vector2.randomInUnitCircle();
        result = result.mul(1 / result.magnitude());
        return result;
    }

    /** Vector util  @param {Number} radian */
    static Angle2Vector(radian) {
        return new Vector2(Math.cos(radian), Math.sin(radian));
    }
}


class Vector4 {
    /** @type {Number}   */ x;
    /** @type {Number}   */ y;
    /** @type {Number}   */ z;
    /** @type {Number}   */ w;
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /** @param {Vector4} other */
    add(other) { return new Vector4(this.x + other.x, this.y + other.y, this.z + other.z, this.w + other.w); }
    /** @param {Vector4} other */
    sub(other) { return new Vector4(this.x - other.x, this.y - other.y, this.z - other.z, this.w - other.w); }
    magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2); }
    /** @param {Number} other */
    mul(other) {
        return new Vector4(this.x * other, this.y * other, this.z * other, this.w * other);
    }

    /** @param {Vector4} other */
    dot(other) { return this.x * other.x + this.y * other.y + this.z * other.z + this.w + other.w; }

    /** @param {Vector4} other */
    scale(n) {
        return new Vector2(x * n.x, y * n.x, z * n.y, w * n.y);
    }

    /** @param {Vector4} v4  @param {Number[][]} mat4  */
    horizontalMul(v4, mat4) {
        if (mat4[0].length == 4)
            return new Vector4(
                v4.x * mat4[0][0] + v4.y * mat4[1][0] + v4.z * mat4[2][0] + v4.w * mat4[3][0],
                v4.x * mat4[0][1] + v4.y * mat4[1][1] + v4.z * mat4[2][1] + v4.w * mat4[3][1],
                v4.x * mat4[0][2] + v4.y * mat4[1][2] + v4.z * mat4[2][2] + v4.w * mat4[3][2],
                v4.x * mat4[0][3] + v4.y * mat4[1][3] + v4.z * mat4[2][3] + v4.w * mat4[3][3],
            );
        if (mat4[0].length == 2)
            return new Vector2(
                v4.x * mat4[0][0] + v4.y * mat4[1][0] + v4.z * mat4[2][0] + v4.w * mat4[3][0],
                v4.x * mat4[0][1] + v4.y * mat4[1][1] + v4.z * mat4[2][1] + v4.w * mat4[3][1],
            );
    }
}

/**
 * Waiting for 3D
 */
class Matrix4x4 {
    static create() {
        return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]
    }

    static transpose(mat4) {
        return [
            [mat4[0, 0], mat4[1, 0], mat4[2, 0], mat4[3, 0]],
            [mat4[0, 1], mat4[1, 1], mat4[2, 1], mat4[3, 1]],
            [mat4[0, 2], mat4[1, 2], mat4[2, 2], mat4[3, 2]],
            [mat4[0, 3], mat4[1, 3], mat4[2, 3], mat4[3, 3]]
        ]
    }
}

/**
 * Waiting for 3D
 */
class Matrix4x2 {
    static create() {
        return [
            [1, 0],
            [0, 1],
            [0, 0],
            [0, 0]
        ]
    }
}

/**
 * 2D transform
 */
class Matrix3x3 {
    value = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ]

    static identity() {
        let m = new Matrix3x3();
        m.value = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]
        return m;
    }

    static create() {
        return new Matrix3x3();
    }

    static fromRotation(radian) {
        let m = new Matrix3x3();
        m.value = [
            [Math.cos(radian), -Math.sin(radian), 0],
            [Math.sin(radian), Math.cos(radian), 0],
            [0, 0, 1],
        ]
        return m;
    }

    static fromTranslation(x, y) {
        let m = new Matrix3x3();
        m.value = [
            [1, 0, x],
            [0, 1, y],
            [0, 0, 1],
        ]
        return m;
    }

    static fromScale(x, y) {
        let m = new Matrix3x3();
        m.value = [
            [x, 0, 0],
            [0, y, 0],
            [0, 0, 1],
        ]
        return m;
    }

    transpose(result = null) {
        if (!result) result = new Matrix3x3();
        result.value = [
            [result.value[0, 0], result.value[1, 0], result.value[2, 0]],
            [result.value[0, 1], result.value[1, 1], result.value[2, 1]],
            [result.value[0, 2], result.value[1, 2], result.value[2, 2]],
        ]
        return result;
    }

    /**
     * other transform
     * @param {Matrix3x3} other 
     * @param {Matrix3x3} result 
     * @returns  {Matrix3x3}
     */
    mul(other, result = null) {
        if (!result) result = new Matrix3x3();
        const m00 = this.value[0][0];
        const m01 = this.value[0][1];
        const m02 = this.value[0][2];
        const m10 = this.value[1][0];
        const m11 = this.value[1][1];
        const m12 = this.value[1][2];
        const m20 = this.value[2][0];
        const m21 = this.value[2][1];
        const m22 = this.value[2][2];
        const a00 = other.value[0][0];
        const a01 = other.value[0][1];
        const a02 = other.value[0][2];
        const a10 = other.value[1][0];
        const a11 = other.value[1][1];
        const a12 = other.value[1][2];
        const a20 = other.value[2][0];
        const a21 = other.value[2][1];
        const a22 = other.value[2][2];
        result.value[0][0] = m00 * a00 + m01 * a10 + m02 * a20;
        result.value[0][1] = m00 * a01 + m01 * a11 + m02 * a21;
        result.value[0][2] = m00 * a02 + m01 * a12 + m02 * a22;

        result.value[1][0] = m10 * a00 + m11 * a10 + m12 * a20;
        result.value[1][1] = m10 * a01 + m11 * a11 + m12 * a21;
        result.value[1][2] = m10 * a02 + m11 * a12 + m12 * a22;

        result.value[2][0] = m20 * a00 + m21 * a10 + m22 * a20;
        result.value[2][1] = m20 * a01 + m21 * a11 + m22 * a21;
        result.value[2][2] = m20 * a02 + m21 * a12 + m22 * a22;
        return result;
    }

    position() {
        return new Vector2(this.value[0][2], this.value[1][2]);
    }

    /**
     *  
     * @param {Vector2} vec 
     * @param {Vector2} result 
     *  
     * @returns {Vector2}
     */
    transform(vec, result = null) {
        let x = vec.x;
        let y = vec.y;
        if (result != null) {
            result.x = x * this.value[0][0] + y * this.value[0][1] + this.value[0][2];
            result.y = x * this.value[1][0] + y * this.value[1][1] + this.value[1][2];
            return result;
        }
        return new Vector2(
            x * this.value[0][0] + y * this.value[0][1] + this.value[0][2],
            x * this.value[1][0] + y * this.value[1][1] + this.value[1][2]
        )
    }

    translate(x, y, result = null) {
        if (!result) result = new Matrix3x3();
        /**
         * 1 0 x
         * 0 1 y
         * 0 0 1
         */
        result.value[0][0] = this.value[0][0];
        result.value[0][1] = this.value[0][1];
        result.value[0][2] = this.value[0][0] * x + this.value[0][1] * y + this.value[0][2];

        result.value[1][0] = this.value[1][0];
        result.value[1][1] = this.value[1][1];
        result.value[1][2] = this.value[1][0] * x + this.value[1][1] * y + this.value[1][2];

        result.value[2][0] = this.value[2][0];
        result.value[2][1] = this.value[2][1];
        result.value[2][2] = this.value[2][0] * x + this.value[2][1] * y + this.value[2][2];
        return result;
    }

    /**
     * other transform
     * @param {Matrix3x3} other 
     * @param {Matrix3x3} result 
     * @returns  {Matrix3x3}
     */
    scale(x, y, result = null) {
        /**
         * x 0 0
         * 0 y 0
         * 0 0 1
         */
        if (!result) result = new Matrix3x3();
        result.value[0][0] = this.value[0][0] * x;
        result.value[0][1] = this.value[0][1] * y;
        result.value[0][2] = this.value[0][2];

        result.value[1][0] = this.value[1][0] * x;
        result.value[1][1] = this.value[1][1] * y;
        result.value[1][2] = this.value[1][2];

        result.value[2][0] = this.value[2][0] * x;
        result.value[2][1] = this.value[2][1] * y;
        result.value[2][2] = this.value[2][2];
        return result;
    }

    /**
     * 
     * @param {Matrix3x3} result 
     * @returns {Matrix3x3}
     */
    clone(result = null) {
        if (result == null) result = new Matrix3x3();
        result.value[0][0] = Number(this.value[0][0]);
        result.value[0][1] = Number(this.value[0][1]);
        result.value[0][2] = Number(this.value[0][2]);

        result.value[1][0] = Number(this.value[1][0]);
        result.value[1][1] = Number(this.value[1][1]);
        result.value[1][2] = Number(this.value[1][2]);

        result.value[2][0] = Number(this.value[2][0]);
        result.value[2][1] = Number(this.value[2][1]);
        result.value[2][2] = Number(this.value[2][2]);
        // console.log(result.value[0][2])
        // console.log(this.value[0][2])
        return result;
    }

    asCurrentTransform() {
        context.setTransform(
            this.value[0][0],
            this.value[1][0],
            this.value[0][1],
            this.value[1][1],
            this.value[0][2],
            this.value[1][2]
        );
    }
}




class GameObject {
    /** @type {GameObject[]} */
    static gameObjects = []

    /** @type {GameObject} */
    parent;

    /** @type {Vector2} */
    position;
    /** @type {Vector2} */
    scale;
    /** @type {Number} */
    rotation = 0;

    /** @type {Vector2} */
    velocity;
    /** @type {Number} */
    radius;
    /** @type {Number} */
    layer

    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.scale = new Vector2(1, 1);
        this.rotation = 0;

        this.velocity = new Vector2(0, 0);
        this.radius = 1;
        this.layer = 0;
        GameObject.gameObjects.push(this);
    }

    /**
     * 
     * @returns {Matrix3x3}
     */
    getTransform() {
        // let transform = Matrix3x3.fromScale(this.scale.x, this.scale.y);
        // transform.mul(Matrix3x3.fromRotation(this.rotation / 180 * Math.PI), transform);
        // transform.translate(this.position.x, this.position.y, transform);
        // console.log(JSON.stringify(transform));

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

    isColliding(other) {
        return Math.sqrt((this.position.x - other.position.x) ** 2 + (this.position.y - other.position.y) ** 2) < this.radius + other.radius;
    }

    move() {
        this.position = this.position.add(this.velocity);
    }

    draw() { }

    onDestroy() { }

    static Destroy(gameObject) {
        GameObject.gameObjects.splice(GameObject.gameObjects.indexOf(gameObject), 1);
        gameObject.onDestroy();
    }
}

class Particle extends GameObject {
    /** @type {Vector2} */
    velocity;
    /** @type {Number} */
    alpha;
    /** @type {string} */
    color;

    constructor(x, y) {
        super(x, y);
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
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
            GameObject.Destroy(this);
        }
    }

    getLifeime() { return (Date.now() - this.lastTime) / 1000 }
}

var Hermite = function (t) {
    return new Vector4(
        2 * t * t * t - 3 * t * t + 1,
        t * t * t - 2 * t * t + t,
        -2 * t * t * t + 3 * t * t,
        t * t * t - t * t
    );
}

/** @param {Vector2[]} P, @param {Number} t  */
function Cubic(basis, P, t) {
    let b = basis(t);
    let result = P[0].mul(b.x);
    result = result.add(P[1].mul(b.y));
    result = result.add(P[2].mul(b.z));
    result = result.add(P[3].mul(b.w));
    return result;
}

function physicsUpdate() {
    GameObject.gameObjects.forEach(g => {
        g.move();
    });
}

/** Random util   @param {Number} min  @param {Number} max */
function rr(min = 1, max = void 0) {
    if (max == void 0) {
        max = min;
        min = 0;
    }
    return min + Math.random() * (max - min);
}

/** Random util   @param {Number} min  @param {Number} max */
function rri(min = 1, max = void 0) {
    return Math.round(rr(min, max));
}

/** Random util   */
function rrwidth() {
    return rr(0, canvas.width);
}

/** Random util   */
function rrheight() {
    return rr(0, canvas.height);
}

/** lerp @param {Number} a  @param {Number} b   @param {Number} t */
function lerp(a, b, t) {
    return a + t * (b - a);
}

/** lerp @param {Number} a  @param {Number} b   @param {Number} v */
function inverseLerp(a, b, v) {
    return (v - a) / (b - a);
}

/** Vector util  @param {Number} h @param {Number} s @param {Number} l */
function hsl(h, s, l) {
    return "hsl(" + Math.floor(h) + ", " + Math.floor(s) + "%, " + Math.floor(l) + "%)";
}

/** @type {CanvasRenderingContext2D} canvas context */
let context;
/** @type {HTMLCanvasElement} */
let canvas;
/** @type {Number} */
let baseTime = Date.now()
