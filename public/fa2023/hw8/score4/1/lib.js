/**
 * Custom game engine-like codes, some behaves similar to Unity
 */

const { vec2, vec3, vec4, mat3, mat4, quat } = glMatrix

/** canvas context @type {WebGLRenderingContext}  */
let gl;
/** canvas @type {HTMLCanvasElement} */
let canvas;
/** start time of the game @type {Number} */
let baseTime;
/** main camera @type {Camera} */
let mainCamera;

/** @type {WebGLBuffer} */
let trianglePosBuffer;
/** @type {WebGLBuffer} */
let triangleNormalBuffer;
/** @type {WebGLBuffer} */
let colorBuffer;
/** @type {WebGLBuffer} */
let indexBuffer;
/** @type {WebGLBuffer} */
let textureBuffer;

const heightSpace = 370;

function init() {
    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth - 100;
    canvas.height = window.innerHeight - heightSpace;


    gl = canvas.getContext("webgl");
    // we need to put the vertices into a buffer so we can
    // block transfer them to the graphics hardware
    trianglePosBuffer = gl.createBuffer();
    trianglePosBuffer.itemSize = 3;
    trianglePosBuffer.numItems = 24000;

    // a buffer for normals
    triangleNormalBuffer = gl.createBuffer();
    triangleNormalBuffer.itemSize = 3;
    triangleNormalBuffer.numItems = 24000;

    // a buffer for colors
    colorBuffer = gl.createBuffer();
    colorBuffer.itemSize = 3;
    colorBuffer.numItems = 24000;

    // a buffer for indices
    indexBuffer = gl.createBuffer();
    indexBuffer.itemSize = 3;
    indexBuffer.numItems = 24000;

    textureBuffer = gl.createBuffer();
    textureBuffer.itemSize = 2;
    textureBuffer.numItems = 240;

    baseTime = Date.now();
    mainCamera = new Camera(p(0, 20, -8), p(0, 5, 1), false);
}

class Rect {
    x_min;
    x_max;
    y_min;
    y_max;

    constructor(x, y, mx, my) {
        this.x_min = x;
        this.x_max = mx;
        this.y_min = y;
        this.y_max = my;
    }
}

class RenderQueue {
    /** @type {GameObject[]} */
    static renderingObjects = []

    /**
     * Renders everything in the render queue
     */
    static render() {
        // Clear screen, prepare for rendering 
        gl.clearColor(180 / 255, 167 / 255, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.enable(gl.CULL_FACE);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        RenderQueue.renderingObjects.forEach(g => {
            if (g.isActiveInHeirachy() && g.alive)
                g.draw();
        });
    }

    /**
     * 
     * @param {GameObject} gameObject 
     * @returns 
     */
    static add(gameObject) {
        let index = this.renderingObjects.indexOf(gameObject);
        if (index == -1) {
            RenderQueue.renderingObjects.push(gameObject);
            return true;
        }
        return false;
    }

    /**
     * 
     * @param {GameObject} gameObject 
     * @returns 
     */
    static remove(gameObject) {
        let index = this.renderingObjects.indexOf(gameObject);
        if (index != -1) { this.renderingObjects.splice(index, 1); return true; }
        return false;
    }
}

/**
 * Camera in the game
 */
class Camera extends GameObject {
    /** @type {vec3} **/
    target;
    /** @type {vec3} **/
    up;
    /** @type {Number} **/
    near = 0.1;
    /** @type {Number} **/
    far = 1000;

    /** @type {Rect}  */
    rect = new Rect(-100, -100, 100, 100);

    // 2D
    ortho;
    // 3D
    fov = 70 / 180 * Math.PI;
    // draw self
    drawSelf = false;

    forward;


    /**
     * 
     * @param {vec3} eye 
     * @param {vec3} target 
     * @param {vec3} up 
     * @param {boolean} ortho 
     */
    constructor(eye, target, ortho = false) {
        super(eye);
        this.target = target;
        this.up = vec3.fromValues(0, 1, 0);
        this.ortho = ortho;
        this.forward = vec3.create();
        vec3.sub(this.forward, this.target, this.position);
        vec3.normalize(this.forward, this.forward);
        if (ortho) this.rect = new Rect(-10, -10, 10, 10);
    }

    lookAt() {
        let up = vec3.transformMat4(vec3.create(), this.up, mat4.fromQuat(mat4.create(), this.rotation));
        let m = mat4.create();
        return mat4.lookAt(m, this.position, this.target, up);
    }

    projection() {
        let aspect = this.getAspect();
        let m = mat4.create();

        return this.ortho
            ? mat4.ortho(m, this.rect.x_min, this.rect.x_max, this.rect.y_min, this.rect.y_max, this.near, this.far)
            : mat4.perspective(m, this.fov, aspect, this.near, this.far);
    }

    toView(tModel) {
        const tCamera = this.lookAt();
        const tProjection = this.projection();

        var tMV = mat4.create();
        var tMVn = mat3.create();
        var tMVP = mat4.create();
        mat4.multiply(tMV, tCamera, tModel); // "modelView" matrix
        mat3.normalFromMat4(tMVn, tMV);
        mat4.multiply(tMVP, tProjection, tMV);

        return { tMV, tMVn, tMVP };
    }

    getAspect() {
        let scale = this.getGlobalScale();
        let val = scale[1] / scale[0];
        let canvasAspect = canvas.height / canvas.width;
        return val / canvasAspect;
    }

    setPosition(pos) {
        this.position = pos;

        this.forward = vec3.sub(this.forward, this.target, this.position);
        vec3.normalize(this.forward, this.forward);
    }

    setTarget(pos) {
        this.target = pos;

        this.forward = vec3.sub(this.forward, this.target, this.position);
        vec3.normalize(this.forward, this.forward);
    }

    facingDirection() {
        return this.forward;
    }
}

/**
 * 
 * @param {string} vertexShader 
 * @param {string} fragmentShader 
 * @returns {WebGLProgram}
 */
function getShader(vertexSource, fragmentSource) {
    // Compile fragment shader
    var vertexShader = compileVertextShader(vertexSource);
    var fragmentShader = compileFragmentShader(fragmentSource);

    // Attach the shaders and link
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialize shaders");
    }
    gl.useProgram(shaderProgram);

    // with the vertex shader, we need to pass it positions
    // as an attribute - so set up that communication
    shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.enableVertexAttribArray(shaderProgram.PositionAttribute);

    shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
    gl.enableVertexAttribArray(shaderProgram.NormalAttribute);

    shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "vColor");
    gl.enableVertexAttribArray(shaderProgram.ColorAttribute);

    shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
    gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);

    // this gives us access to the matrix uniform
    shaderProgram.time = gl.getUniformLocation(shaderProgram, "time");
    shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram, "uMV");
    shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram, "uMVn");
    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram, "uMVP");

    // Attach samplers to texture units
    shaderProgram.texSampler = gl.getUniformLocation(shaderProgram, "texSampler");

    return shaderProgram;
}

/**
 * @param {string} vertexSource 
 * @returns {WebGLProgram} 
 */
function compileVertextShader(vertexSource) {
    // Compile vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader)); return null;
    }
    return vertexShader;
}

/**
 * @param {string} fragmentSource 
 * @returns {WebGLProgram} 
 */
/**
 * @param {string} fragmentSource 
 * @returns {WebGLProgram} 
 */
function compileFragmentShader(fragmentSource) {
    // Compile fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader)); return null;
    }
    return fragmentShader;
}

/**
 *  
 * @param {string} src 
 */
function createTexture(src) {
    // Set up texture
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    var image = new Image();
    image.onload = function () { loadTexture(image, texture); };
    image.crossOrigin = "anonymous";
    image.src = src;
    return { texture, image };
}

function loadTexture(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST); // Point filter with mipmapping
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Option 1 : Use mipmap, select interpolation mode
    // gl.generateMipmap(gl.TEXTURE_2D);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    // Option 2: At least use linear filters
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Optional ... if your shader & texture coordinates go outside the [0,1] range
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}