const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

// Vertex shader program
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    varying lowp vec4 vColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor; 
    }
`;

// Fragment shader program
const fsSource = `
    varying lowp vec4 vColor; 
    void main() {
        gl_FragColor = vColor; 
    }
`;

// Colors
const colors = [
    // Front face: white
    1.0, 1.0, 1.0, 1.0,    // Top Right
    1.0, 1.0, 1.0, 1.0,    // Top Left
    1.0, 1.0, 1.0, 1.0,    // Bottom Right
    1.0, 1.0, 1.0, 1.0,    // Bottom Left

    // Back face: yellow
    1.0, 1.0, 0.0, 1.0,    // Top Right
    1.0, 1.0, 0.0, 1.0,    // Top Left
    1.0, 1.0, 0.0, 1.0,    // Bottom Right
    1.0, 1.0, 0.0, 1.0,    // Bottom Left

    // Top face: green
    0.0, 1.0, 0.0, 1.0,    // Top Right
    0.0, 1.0, 0.0, 1.0,    // Top Left
    0.0, 1.0, 0.0, 1.0,    // Bottom Right
    0.0, 1.0, 0.0, 1.0,    // Bottom Left

    // Bottom face: blue
    0.0, 0.0, 1.0, 1.0,    // Top Right
    0.0, 0.0, 1.0, 1.0,    // Top Left
    0.0, 0.0, 1.0, 1.0,    // Bottom Right
    0.0, 0.0, 1.0, 1.0,    // Bottom Left

    // Right face: orange
    1.0, 0.65, 0.0, 1.0,   // Top Right
    1.0, 0.65, 0.0, 1.0,   // Top Left
    1.0, 0.65, 0.0, 1.0,   // Bottom Right
    1.0, 0.65, 0.0, 1.0,   // Bottom Left

    // Left face: red
    1.0, 0.0, 0.0, 1.0,    // Top Right
    1.0, 0.0, 0.0, 1.0,    // Top Left
    1.0, 0.0, 0.0, 1.0,    // Bottom Right
    1.0, 0.0, 0.0, 1.0,    // Bottom Left
];

// Create a buffer for the cube's vertex colors.
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

// Function to compile a shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Check if the shader compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('THE SHADER IS FUCKED ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Function to initialize shaders
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('THE SHADERPROGRAM IS FUCKED ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
};

let rotationDirection = 1; // Default: counter clockwise
function reverseRotation() {
    rotationDirection *= -1;
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('reverseRotationButton').addEventListener('click', reverseRotation);
});

// Cube shit
function initBuffers(gl) {
    // Create a buffer for the cube's vertex positions.
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Array for cube faces
    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        
        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
        
        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        
        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        
        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
        
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Indices for cube faces
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        indices: indexBuffer,
    };
}

// Pyramid shit
function createPyramidGeometry(gl) {
    const pyramidVertices = [
        -0.5, 0, -0.5,   // 0: Bottom Left
         0.5, 0, -0.5,   // 1: Bottom Right
         0.5, 0,  0.5,   // 2: Top Right

         0.5, 0,  0.5,   // 2: Top Right
        -0.5, 0,  0.5,   // 3: Top Left
        -0.5, 0, -0.5,   // 0: Bottom Left

        // Sides (Pyramid Point = 0, 1, 0)
        -0.5, 0, -0.5,   // 0: Base Bottom Left
         0.5, 0, -0.5,   // 1: Base Bottom Right
         0, 1, 0,       

         0.5, 0, -0.5,   // 1: Base Bottom Right
         0.5, 0,  0.5,   // 2: Base Top Right
         0, 1, 0,        

         0.5, 0,  0.5,   // 2: Base Top Right
        -0.5, 0,  0.5,   // 3: Base Top Left
         0, 1, 0,        

        -0.5, 0,  0.5,   // 3: Base Top Left
        -0.5, 0, -0.5,   // 0: Base Bottom Left
         0, 1, 0,        
    ];

    const pyramidBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pyramidVertices), gl.STATIC_DRAW);

    return pyramidBuffer;
}

// Initialize the buffers
const buffers = initBuffers(gl);
const pyramidBuffer = createPyramidGeometry(gl);
buffers.color = colorBuffer;

let rotation = 0.0;

function drawScene(gl, programInfo, buffers, pyramidBuffer, deltaTime) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black
    gl.clearDepth(1.0);                 

    gl.enable(gl.DEPTH_TEST);           
    gl.depthFunc(gl.LEQUAL);            

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Perspective matrix
    const fov = 45 * Math.PI / 180;  
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar); 

    const radius = 10; // Distance from the object
    const cameraHeight = radius * Math.sin(Math.PI / 4); // 45 degree viewing angle
    const cameraDistance = radius * Math.cos(Math.PI / 4); 

    // Camera's orbit (PARAMETRIC CURVE - circular path)
    const eyeX = cameraDistance * Math.cos(rotation);
    const eyeZ = cameraDistance * Math.sin(rotation);

    const eye = [eyeX, cameraHeight, eyeZ]; 
    const center = [0, 0, 0]; 
    const up = [0, 1, 0]; 
    const modelViewMatrix = mat4.create();
    mat4.lookAt(modelViewMatrix, eye, center, up);

    gl.useProgram(programInfo.program);

    // Shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);

        {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexColor,
                4, // number of components per vertex color
                gl.FLOAT,
                false,
                0,
                0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
        }

    // Draw Cube
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            3, // numComponents
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0); // offset
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        // Set the shader uniforms for model-view matrix
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);

        const vertexCount = 36; 
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
    let cubeModelViewMatrix = mat4.clone(modelViewMatrix);

    // Draw Pyramid
    {
        // Apply a transformation to position the pyramid relative to the cube (HIERARCHICAL MODELING)
        let pyramidModelViewMatrix = mat4.create();
        mat4.translate(pyramidModelViewMatrix, cubeModelViewMatrix, [1.5, 0.0, 0.0]); // Pyramid position relative to cube
        mat4.scale(pyramidModelViewMatrix, pyramidModelViewMatrix, [0.5, 0.5, 0.5]);

        // Set up the pyramid's vertex position attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, pyramidBuffer);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            pyramidModelViewMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, 18);
    }

    rotation += deltaTime * rotationDirection;
    
}

function render(now) {
    now *= 0.001; 
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, pyramidBuffer, deltaTime);

    requestAnimationFrame(render);
}

let then = 0;
requestAnimationFrame(render);