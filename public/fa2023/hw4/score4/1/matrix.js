/**
 * Implementation of my own library for linear algebra and for a game (a very small game engine really)
 * 
 * @author Wendi Cai
 */

class Vector {
    /** 
     * @returns {Vector2}
     */
    toVector2() {
    }
    /** 
     * @returns {Vector3}
     */
    toVector3(z = 0) {
    }
    /** 
     * @returns {Vector4}
     */
    toVector4(z = 0, w = 0) {
    }
    /** 
     * @param {Vector} vec 
     * @param {Vector} result 
     * @returns {Vector}
     */
    componentMul(vec, result = null) {

    }
}

/**
 * Vector of 2 component
 */
class Vector2 extends Vector {
    /** @type {Number}   */ x;
    /** @type {Number}   */ y;
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
    }

    /** @param {Vector2} other  @param {Vector2} result */
    add(other, result = null) {
        if (!result) {
            result = new Vector2();
        }
        result.x = this.x + other.x;
        result.y = this.y + other.y;
        return result;
    }
    /** @param {Vector2} other @return {Vector2}  */
    sub(other, result = null) {
        if (!result) {
            result = new Vector2();
        }
        result.x = this.x - other.x;
        result.y = this.y - other.y;
        return result;
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
            return result;
        }
        return new Vector2(this.x / l, this.y / l);
    }
    /**
     * 
     * @param {Vector2} result 
     * @returns {Vector2} 
     */
    clone(result = null) {
        if (!result)
            result = new Vector2();
        result.x = this.x;
        result.y = this.y;
        return result;
    }
    radian() {
        return Math.atan2(this.y, this.x);
    }

    toVector2() {
        return this;
    }
    toVector3(z = 0) {
        return new Vector3(this.x, this.y, z);
    }
    toVector4(z = 0, w = 0) {
        return new Vector4(this.x, this.y, z, w);
    }

    /**
     * @param {Vector2} result 
     * @param {Vector} vec 
     */
    componentMul(vec, result = null) {
        if (!result) {
            result = new Vector2();
        }
        result.x = this.x * vec.x;
        result.y = this.y * vec.y;
        return result;
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

    /**
     * 
     * @param {Vector2} a 
     * @param {Vector2} b 
     * @returns 
     */
    static distance(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }
}


class Vector3 extends Vector {
    /** @type {Number}   */ z;
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /** @param {Vector3} other  @param {Vector3} result */
    add(other, result = null) {
        if (result) {
            result.x = this.x + other.x;
            result.y = this.y + other.y;
            result.z = this.z + other.z;
            return result;
        } return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
    }
    /** @param {Vector3} other */
    sub(other) {
        if (result) {
            result.x = this.x - other.x;
            result.y = this.y - other.y;
            result.z = this.z - other.z;
            return result;
        } return new Vector3(this.x + other.x, this.y + other.y, this.z - other.z);
    }
    magnitude() { return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2); }
    /** @param {Number} other  @param {Vector3} result */
    mul(other, result = null) {
        if (result) {
            result.x = this.x * other;
            result.y = this.y * other;
            result.z = this.z * other;
            return result;
        }
        return new Vector3(this.x * other, this.y * other);
    }
    /** @param {Vector3} other */
    dot(other) { return this.x * other.x + this.y * other.y + this.z * other.z; }

    /** @param {Vector3} result */
    normalize(result = null) {
        let l = this.magnitude();
        if (result) {
            result.x = this.x / l;
            result.y = this.y / l;
            result.z = this.z / l;
            return result;
        }
        return new Vector3(this.x / l, this.y / l, this.z / l);
    }
    clone(result = null) {

        if (!result) {
            result = new Vector3();
        }
        result.x = this.x;
        result.y = this.y;
        result.z = this.z;
        return result;
    }

    radianXY() {
        return Math.atan2(this.y, this.x);
    }

    toVector2() {
        return new Vector3(this.x, this.y);
    }
    toVector3() {
        return this;
    }
    toVector4(w = 0) {
        return new Vector4(this.x, this.y, this.z, w);
    }

    /**
     * @param {Vector3} result 
     * @param {Vector} vec 
     */
    componentMul(vec, result = null) {
        if (!result) {
            result = new Vector3();
        }
        result.x = this.x * vec.x;
        result.y = this.y * vec.y;
        result.z = this.z * (vec.z instanceof Number ? vec.z : (vec.z ? 1 : 0));
        return result;
    }

    static randomInUnitSphere() {
        let result;
        do {
            result = new Vector3(rr(-1, 1), rr(-1, 1), rr(-1, 1));
        }
        while (result.magnitude() > 1);
        return result;
    }
}


class Vector4 extends Vector {
    /** @type {Number}   */ x;
    /** @type {Number}   */ y;
    /** @type {Number}   */ z;
    /** @type {Number}   */ w;
    constructor(x, y, z, w) {
        super();
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
        return new Vector4(x * n.x, y * n.x, z * n.y, w * n.y);
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

    toVector2() {
        return new Vector2(this.x, this.y);
    }
    toVector3() {
        return new Vector3(this.x, this.y, this.z);
    }
    toVector4() {
        return this;
    }

    /**
     * @param {Vector4} result 
     * @param {Vector} vec 
     */
    componentMul(vec, result = null) {
        if (!result) {
            result = new Vector3();
        }
        result.x = this.x * vec.x;
        result.y = this.y * vec.y;
        result.z = this.z * (vec.z instanceof Number ? vec.z : (vec.z ? 1 : 0));
        result.w = this.w * (vec.w instanceof Number ? vec.w : (vec.w ? 1 : 0));
        return result;
    }
}

/**
 * Waiting for 3D
 */
class Matrix4x4 {
    value = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0]
        [0, 0, 0, 1]
    ];

    static create() {
        return new Matrix4x4();
    }

    transpose(mat4, result) {
        if (!result) result = new Matrix4x4();
        result.value = [
            [mat4[0, 0], mat4[1, 0], mat4[2, 0], mat4[3, 0]],
            [mat4[0, 1], mat4[1, 1], mat4[2, 1], mat4[3, 1]],
            [mat4[0, 2], mat4[1, 2], mat4[2, 2], mat4[3, 2]],
            [mat4[0, 3], mat4[1, 3], mat4[2, 3], mat4[3, 3]]
        ]
        return result;
    }

    static fromTranslation(x, y, z) {
        let m = new Matrix3x3();
        m.value = [
            [1, 0, 0, x],
            [0, 1, 0, y],
            [0, 0, 1, z],
            [0, 0, 0, 1]
        ]
        return m;
    }

    static fromScale(x, y) {
        let m = new Matrix3x3();
        m.value = [
            [x, 0, 0, 0],
            [0, y, 0, 0],
            [0, 0, z, 0],
            [0, 0, 0, 1],
        ]
        return m;
    }

    /**
     * other transform
     * @param {Matrix4x4} other 
     * @param {Matrix4x4} result 
     * @returns  {Matrix4x4}
     */
    mul(other, result = null) {
        if (!result) result = new Matrix4x4();
        const m00 = this.value[0][0];
        const m01 = this.value[0][1];
        const m02 = this.value[0][2];
        const m03 = this.value[0][3];
        const m10 = this.value[1][0];
        const m11 = this.value[1][1];
        const m12 = this.value[1][2];
        const m13 = this.value[1][3];
        const m20 = this.value[2][0];
        const m21 = this.value[2][1];
        const m22 = this.value[2][2];
        const m23 = this.value[2][3];
        const m30 = this.value[3][0];
        const m31 = this.value[3][1];
        const m32 = this.value[3][2];
        const m33 = this.value[3][3];
        const a00 = other.value[0][0];
        const a01 = other.value[0][1];
        const a02 = other.value[0][2];
        const a03 = other.value[0][3];
        const a10 = other.value[1][0];
        const a11 = other.value[1][1];
        const a12 = other.value[1][2];
        const a13 = other.value[1][3];
        const a20 = other.value[2][0];
        const a21 = other.value[2][1];
        const a22 = other.value[2][2];
        const a23 = other.value[2][3];
        const a30 = other.value[3][0];
        const a31 = other.value[3][1];
        const a32 = other.value[3][2];
        const a33 = other.value[3][3];
        result.value[0][0] = m00 * a00 + m01 * a10 + m02 * a20 + m03 * a30;
        result.value[0][1] = m00 * a01 + m01 * a11 + m02 * a21 + m03 * a31;
        result.value[0][2] = m00 * a02 + m01 * a12 + m02 * a22 + m03 * a32;
        result.value[0][3] = m00 * a03 + m01 * a13 + m02 * a23 + m03 * a33;

        result.value[1][0] = m10 * a00 + m11 * a10 + m12 * a20 + m13 * a30;
        result.value[1][1] = m10 * a01 + m11 * a11 + m12 * a21 + m13 * a31;
        result.value[1][2] = m10 * a02 + m11 * a12 + m12 * a22 + m13 * a32;
        result.value[1][3] = m10 * a03 + m11 * a13 + m12 * a23 + m13 * a33;

        result.value[2][0] = m20 * a00 + m21 * a10 + m22 * a20 + m23 * a30;
        result.value[2][1] = m20 * a01 + m21 * a11 + m22 * a21 + m23 * a31;
        result.value[2][2] = m20 * a02 + m21 * a12 + m22 * a22 + m23 * a32;
        result.value[2][3] = m20 * a03 + m21 * a13 + m22 * a23 + m23 * a33;

        result.value[3][0] = m30 * a00 + m31 * a10 + m32 * a20 + m33 * a30;
        result.value[3][1] = m30 * a01 + m31 * a11 + m32 * a21 + m33 * a31;
        result.value[3][2] = m30 * a02 + m31 * a12 + m32 * a22 + m33 * a32;
        result.value[3][3] = m30 * a03 + m31 * a13 + m32 * a23 + m33 * a33;
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
     * other transform
     * @param {Number} radian 
     * @param {Matrix3x3} result 
     * @returns  {Matrix3x3}
     */
    rotate(radian, result = null) {
        /**
            [Math.cos(radian), -Math.sin(radian), 0],
            [Math.sin(radian), Math.cos(radian), 0],
            [0, 0, 1],
         */
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

        const a00 = Math.cos(radian);
        const a01 = -Math.sin(radian);
        const a10 = -a01;
        const a11 = a00;
        result.value[0][0] = m00 * a00 + m01 * a10;
        result.value[0][1] = m00 * a01 + m01 * a11;
        result.value[0][2] = m02;

        result.value[1][0] = m10 * a00 + m11 * a10;
        result.value[1][1] = m10 * a01 + m11 * a11;
        result.value[1][2] = m12;

        result.value[2][0] = m20 * a00 + m21 * a10;
        result.value[2][1] = m20 * a01 + m21 * a11;
        result.value[2][2] = m22;
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
