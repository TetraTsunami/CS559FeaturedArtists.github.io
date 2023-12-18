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
 * @returns {vec2|vec3|vec4}
 */
function p(x, y, z = undefined, w = undefined) {
    if (w || w === 0) {
        return Vector4(x, y, z, w);
    }
    if (z || z === 0) {
        return Vector3(x, y, z);
    }
    return Vector2(x, y);
}

/**
 * 
 * @param {Number} r 
 * @returns 
 */
function rrnp(r) {
    return rr(-r, r);
}

function rrCanvasPos() {
    return new Vector2(rrwidth(), rrheight());
}

/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @returns {vec2}
 */
function Vector2(x, y) {
    return vec2.fromValues(x, y);
}

/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} z  
 * @returns {vec3}
 */
function Vector3(x, y, z) {
    return vec3.fromValues(x, y, z);
}

/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} z 
 * @param {Number} w 
 * @returns {vec4} 
 */
function Vector4(x, y, z, w) {
    return vec4.fromValues(x, y, z, w)
}

/**
 * 
 * @param {number[]} arr 
 * @param {vec2} vec 
 */
function pushvec2(arr, vec) {
    arr.push(vec[0]);
    arr.push(vec[1]);
}

/**
 * 
 * @param {number[]} arr 
 * @param {vec3} vec 
 */
function pushvec3(arr, vec) {
    arr.push(vec[0]);
    arr.push(vec[1]);
    arr.push(vec[2]);
}

/**
 * 
 * @param {number[]} arr 
 * @param {vec4} vec 
 */
function pushvec4(arr, vec) {
    arr.push(vec[0]);
    arr.push(vec[1]);
    arr.push(vec[2]);
    arr.push(vec[3]);
}


/**
 * 
 * @param {vec2} position 
 * @returns 
 */
function isOursideCanvas(position) {
    return position.x < 0 || position.y < 0 || position.x > canvas.width || position.y > canvas.height;
}

/**
 * 
 * @param {number} color 
 * @param {number} width 
 * @param {number} height 
 * @returns 
 */
function createJpgBase64(color, width, height) {
    const channels = 3; // RGB
    const pixelCount = width * height;
    const headerSize = 3 + 16; // JPEG header size

    // Create an ArrayBuffer to store the raw pixel data
    const rawData = new ArrayBuffer(headerSize + pixelCount * channels);

    // Create a DataView to write into the ArrayBuffer
    const dataView = new DataView(rawData);

    // JPEG header
    dataView.setUint8(0, 0xFF);
    dataView.setUint8(1, 0xD8);
    dataView.setUint8(2, 0xFF);

    // APP0 marker
    dataView.setUint8(3, 0xE0);
    dataView.setUint8(4, 0x10);
    dataView.setUint8(5, 0x4A);
    dataView.setUint8(6, 0x46);
    dataView.setUint8(7, 0x49);
    dataView.setUint8(8, 0x46);
    dataView.setUint8(9, 0x00);
    dataView.setUint8(10, 0x01);
    dataView.setUint8(11, 0x01);
    dataView.setUint8(12, 0x00);
    dataView.setUint8(13, 0x48);
    dataView.setUint8(14, 0x00);
    dataView.setUint8(15, 0x48);
    dataView.setUint8(16, 0x00);
    dataView.setUint8(17, 0x00);

    // Write the color information to all pixels
    for (let i = headerSize; i < rawData.byteLength; i += channels) {
        dataView.setUint8(i, color >> 16);  // Red
        dataView.setUint8(i + 1, (color >> 8) & 0xFF);  // Green
        dataView.setUint8(i + 2, color & 0xFF);  // Blue
    }

    // Encode the compressed data in base64
    const base64String = btoa(String.fromCharCode.apply(null, rawData));

    return 'data:image/jpg;base64,' + base64String;
}

function uniformScale(s) {
    return [s, s, s];
}

function getTime() {
    return (Date.now() / 1000) % (Math.PI * 100);
}

function perlinNoise(width, height, frequency, amplitude) {
    // Generate a grid of random gradient vectors
    const gradientGrid = generateGradientGrid(width, height);

    function generateGradientGrid(width, height) {
        const grid = [];

        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const angle = Math.random() * 2 * Math.PI;
                row.push({ x: Math.cos(angle), y: Math.sin(angle) });
            }
            grid.push(row);
        }
        console.log(grid);
        return grid;
    }

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(t, a, b) {
        return a + t * (b - a);
    }

    function gradient(x, y, x0, y0) {
        const dx = x - x0;
        const dy = y - y0;

        const gridX = (x0 % width + width) % width;
        const gridY = (y0 % height + height) % height;

        return dx * gradientGrid[gridY][gridX].x + dy * gradientGrid[gridY][gridX].y;
    }

    function perlin(x, y) {
        const X = Math.floor(x) & (width - 1);
        const Y = Math.floor(y) & (height - 1);

        const x0 = Math.floor(x);
        const x1 = x0 + 1;
        const y0 = Math.floor(y);
        const y1 = y0 + 1;

        const xf = fade(x - x0);
        const yf = fade(y - y0);

        const n00 = gradient(x, y, x0, y0);
        const n01 = gradient(x, y, x0, y1);
        const n10 = gradient(x, y, x1, y0);
        const n11 = gradient(x, y, x1, y1);

        const ix0 = lerp(xf, n00, n10);
        const ix1 = lerp(xf, n01, n11);

        return lerp(yf, ix0, ix1) * amplitude;
    }

    const noise = [];

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const nx = x / width - 0.5;
            const ny = y / height - 0.5;
            row.push(perlin(nx * frequency, ny * frequency));
        }
        noise.push(row);
    }

    return noise;
}

function roundVec3(vec) {
    vec[0] = Math.round(vec[0]);
    vec[1] = Math.round(vec[1]);
    vec[2] = Math.round(vec[2]);
}

function floorVec3(vec) {
    vec[0] = Math.floor(vec[0]);
    vec[1] = Math.floor(vec[1]);
    vec[2] = Math.floor(vec[2]);
}