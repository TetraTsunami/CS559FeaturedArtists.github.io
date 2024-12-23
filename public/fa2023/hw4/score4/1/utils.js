/**
 * Simple utility functions
 * 
 * @author Wendi Cai
 */

/** Random util   @param {Number} min  @param {Number} max */
function rr(min = 1, max = void 0) {
    if (max === void 0) {
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

/**
 * Returns the best vector representation of given vector component
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} z 
 * @param {Number} w 
 * @returns 
 */
function p(x, y, z = undefined, w = undefined) {
    if (w instanceof Number) {
        return new Vector4(x, y, z, w);
    }
    if (z instanceof Number) {
        return new Vector3(x, y, z);
    }
    return new Vector2(x, y);
}

function rrCanvasPos() {
    return new Vector2(rrwidth(), rrheight());
}

/**
 * 
 * @param {Vector2} position 
 * @returns 
 */
function isOursideCanvas(position) {
    return position.x < 0 || position.y < 0 || position.x > canvas.width || position.y > canvas.height;
}