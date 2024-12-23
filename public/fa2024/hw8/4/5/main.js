const canvas = document.getElementById("glCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL not supported!");
    throw new Error("WebGL not supported!");
}

gl.viewport(0, 0, canvas.width, canvas.height);

// Handle window resize
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 2000);
    gl.uniformMatrix4fv(uProjectionMatrixLoc, false, projectionMatrix);
});

// Vertex shader
const vertexShaderSource = `
    precision mediump float;
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying vec3 vNormal;
    varying vec3 vFragPos;
    varying vec2 vTexCoord;

    void main() {
        vNormal = mat3(uModelMatrix) * aNormal;
        vFragPos = vec3(uModelMatrix * vec4(aPosition, 1.0));
        vTexCoord = aTexCoord;
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    }
`;

// Fragment shader
const fragmentShaderSource = `
    precision mediump float;

    struct Light {
        vec3 position;
        vec3 color;
    };

    uniform Light uLight;
    uniform vec3 uViewPos;
    uniform bool uIsEmissive; 
    uniform bool uUseTexture;
    uniform sampler2D uTexture;

    varying vec3 vNormal;
    varying vec3 vFragPos;
    varying vec2 vTexCoord;

    void main() {
        vec3 norm = normalize(vNormal);
        vec3 lightDir = normalize(uLight.position - vFragPos);
        vec3 viewDir = normalize(uViewPos - vFragPos);

        vec3 baseColor = vec3(1.0);
        if (uUseTexture) {
            baseColor = texture2D(uTexture, vTexCoord).rgb;
        }

        vec3 result;
        if (uIsEmissive) {
            result = baseColor;
        } else {
            vec3 ambient = 0.1 * uLight.color;
            float diff = max(dot(norm, lightDir), 0.0);
            vec3 diffuse = diff * uLight.color;
            vec3 reflectDir = reflect(-lightDir, norm);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
            vec3 specular = spec * uLight.color;

            result = (ambient + diffuse + specular) * baseColor;
        }

        gl_FragColor = vec4(result, 1.0);
    }
`;

// Shader compilation helper
function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Program creation helper
function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link failed:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

// Texture loading helper
function loadTexture(gl, url, onLoad) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const placeholder = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, placeholder);

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        if ((image.width & (image.width - 1)) === 0 && (image.height & (image.height - 1)) === 0) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        if (onLoad) onLoad();
    };
    image.src = url;
    return texture;
}

// Sphere initialization with lat/lon to texture mapping
function initSphereBuffers(gl, radius, latitudeBands, longitudeBands) {
    const positions = [];
    const normals = [];
    const texCoords = [];
    const indices = [];

    for (let lat = 0; lat <= latitudeBands; lat++) {
        const latDeg = -90 + (lat / latitudeBands) * 180;
        const theta = (latDeg * Math.PI) / 180;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= longitudeBands; lon++) {
            const lonDeg = -180 + (lon / longitudeBands) * 360;
            const phi = (lonDeg * Math.PI) / 180;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * cosTheta;
            const y = sinTheta;
            const z = sinPhi * cosTheta;

            const u = (lonDeg + 180) / 360;
            const v = (latDeg + 90) / 180; // Flip V coordinate

            normals.push(x, y, z);
            texCoords.push(u, v);
            positions.push(radius * x, radius * y, radius * z);
        }
    }

    for (let lat = 0; lat < latitudeBands; lat++) {
        for (let lon = 0; lon < longitudeBands; lon++) {
            const first = lat * (longitudeBands + 1) + lon;
            const second = first + longitudeBands + 1;
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    const buffers = {
        position: gl.createBuffer(),
        normal: gl.createBuffer(),
        texCoord: gl.createBuffer(),
        indices: gl.createBuffer(),
        indexCount: indices.length,
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return buffers;
}

// Cube buffers for buildings
function initCubeBuffers(gl) {
    const positions = [
        // Front
        -0.5, 0, 0.5,
        0.5, 0, 0.5,
        0.5, 1, 0.5,
        -0.5, 1, 0.5,
        // Back
        -0.5, 0, -0.5,
        -0.5, 1, -0.5,
        0.5, 1, -0.5,
        0.5, 0, -0.5,
        // Top
        -0.5, 1, -0.5,
        -0.5, 1, 0.5,
        0.5, 1, 0.5,
        0.5, 1, -0.5,
        // Bottom
        -0.5, 0, -0.5,
        0.5, 0, -0.5,
        0.5, 0, 0.5,
        -0.5, 0, 0.5,
        // Right
        0.5, 0, -0.5,
        0.5, 1, -0.5,
        0.5, 1, 0.5,
        0.5, 0, 0.5,
        // Left
        -0.5, 0, -0.5,
        -0.5, 0, 0.5,
        -0.5, 1, 0.5,
        -0.5, 1, -0.5,
    ];

    const normals = [
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
    ];

    const texCoords = [
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
    ];

    const indices = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ];

    const buffers = {
        position: gl.createBuffer(),
        normal: gl.createBuffer(),
        texCoord: gl.createBuffer(),
        indices: gl.createBuffer(),
        indexCount: indices.length,
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return buffers;
}

// Create and use the WebGL program
const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
gl.useProgram(program);

// Get uniform locations
const uModelMatrixLoc = gl.getUniformLocation(program, "uModelMatrix");
const uViewMatrixLoc = gl.getUniformLocation(program, "uViewMatrix");
const uProjectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
const uLightLoc = {
    position: gl.getUniformLocation(program, "uLight.position"),
    color: gl.getUniformLocation(program, "uLight.color"),
};
const uViewPosLoc = gl.getUniformLocation(program, "uViewPos");
const uIsEmissiveLoc = gl.getUniformLocation(program, "uIsEmissive");
const uUseTextureLoc = gl.getUniformLocation(program, "uUseTexture");
const uTextureLoc = gl.getUniformLocation(program, "uTexture");

// Set up projection matrix
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 2000);
gl.uniformMatrix4fv(uProjectionMatrixLoc, false, projectionMatrix);

// Animation control
let isPaused = false;
const pauseButton = document.getElementById("pauseButton");
pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Resume" : "Pause";
});

// Reset button
const resetButton = document.getElementById("resetButton");

// Initial camera parameters
const initialCameraAngle = 45;
const initialCameraHeight = 60;
const initialCameraDistance = 150;

let cameraAngle = initialCameraAngle;
let cameraHeight = initialCameraHeight;
let cameraDistance = initialCameraDistance;

resetButton.addEventListener('click', () => {
    // Reset camera to initial state
    cameraAngle = initialCameraAngle;
    cameraHeight = initialCameraHeight;
    cameraDistance = initialCameraDistance;
});

// Mouse interaction
let isMouseDown = false;
let lastX = 0;
let lastY = 0;
canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    lastX = e.clientX;
    lastY = e.clientY;
});
canvas.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        cameraAngle += deltaX * 0.5;
        cameraHeight -= deltaY * 0.5;

        if (cameraHeight > 89.9) cameraHeight = 89.9;
        if (cameraHeight < -89.9) cameraHeight = -89.9;

        lastX = e.clientX;
        lastY = e.clientY;
    }
});
canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});
canvas.addEventListener('wheel', (e) => {
    cameraDistance += e.deltaY * 0.1;
    if (cameraDistance < 10) cameraDistance = 10;
    if (cameraDistance > 2000) cameraDistance = 2000;
});

// Enable depth test and set clear color
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// Initialize sphere and cube buffers
const earthRadius = 30;
const sunRadius = 10;
const earthBuffers = initSphereBuffers(gl, earthRadius, 40, 40);
const sunBuffers = initSphereBuffers(gl, sunRadius, 20, 20);
const cubeBuffers = initCubeBuffers(gl);
const moonRadius = 10;
const moonBuffers = initSphereBuffers(gl, moonRadius, 20, 20); // Moon sphere

// Get attribute locations
const aPositionLoc = gl.getAttribLocation(program, "aPosition");
const aNormalLoc = gl.getAttribLocation(program, "aNormal");
const aTexCoordLoc = gl.getAttribLocation(program, "aTexCoord");

// Load textures
let texturesLoaded = 0;
const earthTexture = loadTexture(gl, 'textures/earthmap.jpg', checkTexturesLoaded);
const sunTexture = loadTexture(gl, 'textures/sunmap.jpg', checkTexturesLoaded);
const buildingTexture = loadTexture(gl, 'textures/facade.jpg', checkTexturesLoaded);
// Load moon texture (English comment)
const moonTexture = loadTexture(gl, 'textures/moonmap.jpg', checkTexturesLoaded);

function checkTexturesLoaded() {
    texturesLoaded++;
    if (texturesLoaded === 4) {
        requestAnimationFrame(drawScene);
    }
}

// Top 30 metropolitan areas
const bigCities = [
    {name: "Tokyo", lat: 35.6895, lon: 139.6917},
    {name: "Delhi", lat: 28.7041, lon: 77.1025},
    {name: "Shanghai", lat: 31.2304, lon: 121.4737},
    {name: "São Paulo", lat: -23.5505, lon: -46.6333},
    {name: "Mexico City", lat: 19.4326, lon: -99.1332},
    {name: "Dhaka", lat: 23.8103, lon: 90.4125},
    {name: "Cairo", lat: 30.0444, lon: 31.2357},
    {name: "Beijing", lat: 39.9042, lon: 116.4074},
    {name: "Mumbai", lat: 19.0760, lon: 72.8777},
    {name: "Osaka", lat: 34.6937, lon: 135.5022},
    {name: "Karachi", lat: 24.8607, lon: 67.0011},
    {name: "Chongqing", lat: 29.5630, lon: 106.5516},
    {name: "Istanbul", lat: 41.0082, lon: 28.9784},
    {name: "Kinshasa", lat: -4.4419, lon: 15.2663},
    {name: "Lagos", lat: 6.5244, lon: 3.3792},
    {name: "Manila", lat: 14.5995, lon: 120.9842},
    {name: "Tianjin", lat: 39.3434, lon: 117.3616},
    {name: "Buenos Aires", lat: -34.6037, lon: -58.3816},
    {name: "Kolkata", lat: 22.5726, lon: 88.3639},
    {name: "Shenzhen", lat: 22.5431, lon: 114.0579},
    {name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729},
    {name: "Guangzhou", lat: 23.1291, lon: 113.2644},
    {name: "Lahore", lat: 31.5497, lon: 74.3436},
    {name: "Bangalore", lat: 12.9716, lon: 77.5946},
    {name: "Moscow", lat: 55.7558, lon: 37.6173},
    {name: "Paris", lat: 48.8566, lon: 2.3522},
    {name: "Bogotá", lat: 4.7110, lon: -74.0721},
    {name: "Jakarta", lat: -6.2088, lon: 106.8456},
    {name: "Chennai", lat: 13.0827, lon: 80.2707},
    {name: "Lima", lat: -12.0464, lon: -77.0428}
];

const buildingCountPerCity = 200;
const maxRadius = 0.01;
const cities = [];

// Generate a skyline-like city
bigCities.forEach((cityData) => {
    const buildings = [];
    for (let j = 0; j < buildingCountPerCity; j++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * maxRadius;
        const bLat = cityData.lat + radius * Math.cos(angle);
        const bLon = cityData.lon + radius * Math.sin(angle);

        const bTheta = (90 - bLat) * Math.PI / 180;
        const bPhi = bLon * Math.PI / 180;
        const bx = Math.sin(bTheta) * Math.cos(bPhi);
        const by = Math.cos(bTheta);
        const bz = Math.sin(bTheta) * Math.sin(bPhi);

        const bPosition = vec3.fromValues(bx * earthRadius, by * earthRadius, bz * earthRadius);
        const bNormal = vec3.normalize(vec3.create(), bPosition);

        const distRatio = radius / maxRadius;
        const minH = 1;
        const maxH = 6;
        const height = maxH - (maxH - minH) * distRatio + Math.random() * 0.5;

        const baseScaleX = 0.1 + Math.random() * 0.3;
        const baseScaleZ = 0.1 + Math.random() * 0.3;

        buildings.push({position: bPosition, normal: bNormal, height, scaleX: baseScaleX, scaleZ: baseScaleZ});
    }
    cities.push({buildings});
});

// Animation variables
let lastTime = 0;
let earthRotation = 0;     // Earth's rotation
let earthRevolution = 0;   // Earth's revolution around the Sun
let sunRotation = 0;       // Sun's rotation
let moonRevolution = 0;
let moonRotation = 0;
const moonOrbitDistance = 50; // Distance from Earth

function drawScene(now) {
    now *= 0.001;
    const deltaTime = now - lastTime;
    lastTime = now;

    if (!isPaused) {
        earthRotation += deltaTime * 5;       // Earth's rotation speed
        earthRevolution += deltaTime;     // Earth's revolution speed
        sunRotation += deltaTime * 40;        // Sun's rotation speed
        moonRevolution += deltaTime * 10.0;   // Moon orbit speed around Earth
        moonRotation = moonRevolution;
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Calculate Earth's position
    const earthRevolutionRad = (earthRevolution * Math.PI) / 180;
    const earthX = 150 * Math.cos(earthRevolutionRad);
    const earthY = 0;
    const earthZ = 150 * Math.sin(earthRevolutionRad);

    // Always look at Sun center
    const centerX = 0;
    const centerY = 0;
    const centerZ = 0;
    const angleRad = cameraAngle * Math.PI / 180;
    const heightRad = cameraHeight * Math.PI / 180;
    const eyeX = centerX + cameraDistance * Math.sin(angleRad) * Math.cos(heightRad);
    const eyeY = centerY + cameraDistance * Math.sin(heightRad);
    const eyeZ = centerZ + cameraDistance * Math.cos(angleRad) * Math.cos(heightRad);
    mat4.lookAt(viewMatrix, [eyeX, eyeY, eyeZ], [centerX, centerY, centerZ], [0, 1, 0]);
    gl.uniformMatrix4fv(uViewMatrixLoc, false, viewMatrix);

    // Set viewer position
    gl.uniform3fv(uViewPosLoc, [eyeX, eyeY, eyeZ]);

    // Set light (Sun at origin)
    const sunPositionVec = [0, 0, 0];
    gl.uniform3fv(uLightLoc.position, sunPositionVec);
    gl.uniform3fv(uLightLoc.color, [1.0, 1.0, 1.0]);
    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aNormalLoc);
    gl.enableVertexAttribArray(aTexCoordLoc);

    // Draw Sun
    gl.bindBuffer(gl.ARRAY_BUFFER, sunBuffers.position);
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sunBuffers.normal);
    gl.vertexAttribPointer(aNormalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sunBuffers.texCoord);
    gl.vertexAttribPointer(aTexCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sunBuffers.indices);
    let modelMatrix = mat4.create();
    mat4.rotateY(modelMatrix, modelMatrix, sunRotation * Math.PI / 180);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, modelMatrix);
    gl.uniform1i(uIsEmissiveLoc, true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sunTexture);
    gl.uniform1i(uTextureLoc, 0);
    gl.uniform1i(uUseTextureLoc, true);
    gl.drawElements(gl.TRIANGLES, sunBuffers.indexCount, gl.UNSIGNED_SHORT, 0);

    // Draw Earth
    gl.uniform1i(uIsEmissiveLoc, false);
    gl.bindBuffer(gl.ARRAY_BUFFER, earthBuffers.position);
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, earthBuffers.normal);
    gl.vertexAttribPointer(aNormalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, earthBuffers.texCoord);
    gl.vertexAttribPointer(aTexCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, earthBuffers.indices);
    modelMatrix = mat4.create();
    mat4.rotateY(modelMatrix, modelMatrix, earthRevolutionRad);
    mat4.translate(modelMatrix, modelMatrix, [150, 0, 0]);
    mat4.rotateY(modelMatrix, modelMatrix, earthRotation * Math.PI / 180);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, modelMatrix);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, earthTexture);
    gl.uniform1i(uTextureLoc, 0);
    gl.uniform1i(uUseTextureLoc, true);
    gl.drawElements(gl.TRIANGLES, earthBuffers.indexCount, gl.UNSIGNED_SHORT, 0);

    // Draw Moon with tidally locked to Earth
    const moonRevolutionRad = (moonRevolution * Math.PI) / 180;
    const moonX = earthX + moonOrbitDistance * Math.cos(moonRevolutionRad);
    const moonZ = earthZ + moonOrbitDistance * Math.sin(moonRevolutionRad);
    const moonY = earthY;
    let moonModelMatrix = mat4.create();
    mat4.translate(moonModelMatrix, moonModelMatrix, [moonX, moonY, moonZ]);
    // Rotate moon so the same face always faces Earth
    mat4.rotateY(moonModelMatrix, moonModelMatrix, -moonRevolutionRad);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, moonModelMatrix);
    gl.uniform1i(uIsEmissiveLoc, false);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, moonTexture);
    gl.uniform1i(uTextureLoc, 0);
    gl.uniform1i(uUseTextureLoc, true);
    gl.bindBuffer(gl.ARRAY_BUFFER, moonBuffers.position);
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, moonBuffers.normal);
    gl.vertexAttribPointer(aNormalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, moonBuffers.texCoord);
    gl.vertexAttribPointer(aTexCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonBuffers.indices);
    gl.drawElements(gl.TRIANGLES, moonBuffers.indexCount, gl.UNSIGNED_SHORT, 0);

    // Draw city buildings
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.position);
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.normal);
    gl.vertexAttribPointer(aNormalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.texCoord);
    gl.vertexAttribPointer(aTexCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeBuffers.indices);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, buildingTexture);
    gl.uniform1i(uTextureLoc, 0);
    gl.uniform1i(uUseTextureLoc, true);

    cities.forEach((city) => {
        city.buildings.forEach((building) => {
            const buildingMatrix = mat4.clone(modelMatrix);
            mat4.translate(buildingMatrix, buildingMatrix, building.position);
            const up = [0, 1, 0];
            const axis = vec3.cross(vec3.create(), up, building.normal);
            const angle = Math.acos(vec3.dot(up, building.normal));
            mat4.rotate(buildingMatrix, buildingMatrix, angle, axis);
            mat4.scale(buildingMatrix, buildingMatrix, [building.scaleX, building.height, building.scaleZ]);
            gl.uniformMatrix4fv(uModelMatrixLoc, false, buildingMatrix);
            gl.drawElements(gl.TRIANGLES, cubeBuffers.indexCount, gl.UNSIGNED_SHORT, 0);
        });
    });

    requestAnimationFrame(drawScene);
}