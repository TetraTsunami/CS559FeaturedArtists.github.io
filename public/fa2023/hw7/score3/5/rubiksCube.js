function start() {
    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext("webgl");

    if (!gl) {
        alert("WebGL not supported, falling back on experimental-webgl");
        gl = canvas.getContext("experimental-webgl");
    }

    if (!gl) {
        alert("Your browser does not support WebGL");
        return;
    }

    var slider1 = document.getElementById('slider1');
    var slider2 = document.getElementById('slider2');
    slider1.value = 0;
    slider2.value = 0;

    var vertexSource = document.getElementById("vertexShader").text;
    var fragmentSource = document.getElementById("fragmentShader").text;

    var vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    var fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

    var shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);

    shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.enableVertexAttribArray(shaderProgram.PositionAttribute);

    shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "vColor");
    gl.enableVertexAttribArray(shaderProgram.ColorAttribute);

    shaderProgram.TexCoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
    gl.enableVertexAttribArray(shaderProgram.TexCoordAttribute);

    shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
    gl.enableVertexAttribArray(shaderProgram.NormalAttribute);

    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram,"uMVP");
    shaderProgram.uSampler = gl.getUniformLocation(shaderProgram, "uSampler");
    
    shaderProgram.spotlightPosition1 = gl.getUniformLocation(shaderProgram, "spotlightPosition1");
    shaderProgram.spotlightDirection1 = gl.getUniformLocation(shaderProgram, "spotlightDirection1");
    shaderProgram.spotlightPosition2 = gl.getUniformLocation(shaderProgram, "spotlightPosition2");
    shaderProgram.spotlightDirection2 = gl.getUniformLocation(shaderProgram, "spotlightDirection2");
    shaderProgram.cutoffAngle = gl.getUniformLocation(shaderProgram, "cutoffAngle");

    var vertexData = createVertexData();
    var buffers = initializeBuffers(gl, vertexData);
    var cubeTexture = initTexture(gl);

    function draw() {
        var angle1 = slider1.value * 0.01 * Math.PI;
        var angle2 = slider2.value * 0.01 * Math.PI;

        var eye = [400 * Math.sin(angle1), 150.0, 400.0 * Math.cos(angle1)];
        var target = [0, 0, 0];
        var up = [0, 1, 0];

        var tModel = mat4.create();
        mat4.fromScaling(tModel, [100, 100, 100]);
        mat4.rotate(tModel, tModel, angle2, [1, 1, 1]);

        var tCamera = mat4.create();
        mat4.lookAt(tCamera, eye, target, up);

        var tProjection = mat4.create();
        mat4.perspective(tProjection, Math.PI / 4, canvas.width / canvas.height, 10, 1000);

        var tMVP = mat4.create();
        mat4.multiply(tMVP, tProjection, tCamera);
        mat4.multiply(tMVP, tMVP, tModel);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
        gl.uniform1i(shaderProgram.uSampler, 0);

        // Spotlight parameters
        var spotlightPosition1 = [2.0, 2.0, 2.0]; // Front-left-top position
        var spotlightDirection1 = [-1.0, -1.0, -1.0]; // Direction for the first light
        var spotlightPosition2 = [-2.0, 2.0, 2.0]; // Front-right-top position
        var spotlightDirection2 = [1.0, -1.0, -1.0]; // Direction for the second light
        var cutoffAngle = 45; // Degrees

        gl.uniform3fv(shaderProgram.spotlightPosition1, spotlightPosition1);
        gl.uniform3fv(shaderProgram.spotlightDirection1, spotlightDirection1);
        gl.uniform3fv(shaderProgram.spotlightPosition2, spotlightPosition2);
        gl.uniform3fv(shaderProgram.spotlightDirection2, spotlightDirection2);
        gl.uniform1f(shaderProgram.cutoffAngle, cutoffAngle);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
        gl.vertexAttribPointer(shaderProgram.PositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
        gl.vertexAttribPointer(shaderProgram.ColorAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.TexCoordAttribute, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
        gl.vertexAttribPointer(shaderProgram.NormalAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
        gl.drawElements(gl.TRIANGLES, vertexData.indices.length, gl.UNSIGNED_BYTE, 0);
    }

    slider1.addEventListener("input", draw);
    slider2.addEventListener("input", draw);
    draw();
}

function compileShader(gl, source, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function createShaderProgram(gl, vertexShader, fragmentShader) {
    if (!vertexShader || !fragmentShader) {
        console.error('Cannot create shader program: vertex or fragment shader is null');
        return null;
    }
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Could not initialize shaders");
        return null;
    }
    return program;
}


    function createVertexData() {

        var vertexPos = new Float32Array([
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
        ]);
    
        // Define colors for each vertex
        var vertexColors = new Float32Array([
            // Front face (red)
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
    
            // Back face (green)
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
    
            // Top face (blue)
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
    
            // Bottom face (cyan)
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
    
            // Right face (magenta)
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
    
            // Left face (yellow)
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0
        ]);
    
        // Texture coordinates for each vertex
        var textureCoords = new Float32Array([
            // Front
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
    
            // Back
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
    
            // Top
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
    
            // Bottom
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
    
            // Right
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
    
            // Left
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ]);
    
        // Indices for the cube's faces
        var triangleIndices = new Uint8Array([
            0, 1, 2,      0, 2, 3,    // Front
            4, 5, 6,      4, 6, 7,    // Back
            8, 9, 10,     8, 10, 11,  // Top
            12, 13, 14,   12, 14, 15, // Bottom
            16, 17, 18,   16, 18, 19, // Right
            20, 21, 22,   20, 22, 23  // Left
        ]);

        var vertexNormals = new Float32Array([
            // Normals for the front face (pointing towards +Z)
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
        
            // Normals for the back face (pointing towards -Z)
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
        
            // Normals for the top face (pointing towards +Y)
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
        
            // Normals for the bottom face (pointing towards -Y)
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
        
            // Normals for the right face (pointing towards +X)
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
        
            // Normals for the left face (pointing towards -X)
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0
        ]);
        
    
        return {
            positions: vertexPos,
            colors: vertexColors,
            normals: vertexNormals,
            texCoords: textureCoords,
            indices: triangleIndices
        };
    }
    

function initializeBuffers(gl, vertexData) {
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData.positions), gl.STATIC_DRAW);

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData.colors), gl.STATIC_DRAW);

    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData.texCoords), gl.STATIC_DRAW);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(vertexData.indices), gl.STATIC_DRAW);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData.normals), gl.STATIC_DRAW);

    return {
        positionBuffer: positionBuffer,
        colorBuffer: colorBuffer,
        normalBuffer: normalBuffer,
        texCoordBuffer: texCoordBuffer,
        indexBuffer: indexBuffer
    };
}

function initTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const size = 64;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            const stripe = (i % 2 === 0) ^ (j % 2 === 0);
            const color = stripe ? 255 : 0;
            const index = (i * size + j) * 4;
            data[index] = color;
            data[index + 1] = color;
            data[index + 2] = color;
            data[index + 3] = 255;
        }
    }

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = size;
    const height = size;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, data);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return texture;
}

window.onload = start;

