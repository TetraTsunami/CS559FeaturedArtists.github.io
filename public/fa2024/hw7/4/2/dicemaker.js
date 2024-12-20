document.addEventListener("DOMContentLoaded", function () {
    const mat4 = glMatrix.mat4;
    const vec3 = glMatrix.vec3;
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        alert("WebGL not supported");
        throw new Error("WebGL not supported");
    }

    // Compile a shader
    function compileShader(id, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, document.getElementById(id).textContent);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    // Create a program
    function createProgram(vertexShaderId, fragmentShaderId) {
        const program = gl.createProgram();
        const vertexShader = compileShader(vertexShaderId, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fragmentShaderId, gl.FRAGMENT_SHADER);

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program));
        }

        return program;
    }

    // Programs for rendering faces and edges
    const faceProgram = createProgram("vertexShader", "fragmentShader");
    const edgeProgram = createProgram("edgeVertexShader", "edgeFragmentShader");

    // Icosahedron Geometry Data
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;

    const positions = [
        -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0,
        0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t,
        t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1,
    ];

    const indices = [
        0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
        1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
        3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
        4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1,
    ];

    const normals = positions.slice();

    function bufferData(bufferType, data, attribute, size, program) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(bufferType, buffer);
        gl.bufferData(bufferType, new Float32Array(data), gl.STATIC_DRAW);
        if (attribute !== null) {
            const location = gl.getAttribLocation(program, attribute);
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
        }
        return buffer;
    }

    const positionBuffer = bufferData(gl.ARRAY_BUFFER, positions, "aPosition", 3, faceProgram);
    const normalBuffer = bufferData(gl.ARRAY_BUFFER, normals, "aNormal", 3, faceProgram);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const edgeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    function setUniformMatrix(program, name, matrix) {
        const location = gl.getUniformLocation(program, name);
        gl.uniformMatrix4fv(location, false, matrix);
    }

    function setUniformVec3(program, name, vec) {
        const location = gl.getUniformLocation(program, name);
        gl.uniform3fv(location, vec);
    }

    function setUniformFloat(program, name, value) {
        const location = gl.getUniformLocation(program, name);
        gl.uniform1f(location, value);
    }

    const cameraAngleInput = document.getElementById("cameraAngle");
    let cameraAngle = 0;
    cameraAngleInput.addEventListener("input", () => {
        cameraAngle = parseFloat(cameraAngleInput.value);
    });

    function render() {
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);

        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6]);
        mat4.rotateY(modelViewMatrix, modelViewMatrix, cameraAngle * Math.PI / 180);
        mat4.rotateX(modelViewMatrix, modelViewMatrix, performance.now() / 1000);

        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);

        gl.useProgram(faceProgram);

        // Static light uniforms
        setUniformMatrix(faceProgram, "uProjectionMatrix", projectionMatrix);
        setUniformMatrix(faceProgram, "uModelViewMatrix", modelViewMatrix);
        setUniformMatrix(faceProgram, "uNormalMatrix", normalMatrix);
        setUniformVec3(faceProgram, "uLightPosition1", [5, 5, 5]);
        setUniformVec3(faceProgram, "uLightColor1", [1, 1, 1]);
        setUniformVec3(faceProgram, "uAmbientLight", [0.2, 0.2, 0.2]);

        // Dynamic light uniforms
        const time = performance.now() / 1000.0;
        const dynamicLightPos = [Math.sin(time) * 3, Math.cos(time) * 3, 0];
        const dynamicLightColor = [0.5 + 0.5 * Math.sin(time), 0.5 + 0.5 * Math.cos(time), 0.5 + 0.5 * Math.sin(time + 1.57)];
        setUniformVec3(faceProgram, "uLightPosition2", dynamicLightPos);
        setUniformVec3(faceProgram, "uLightColor2", dynamicLightColor);

        // Draw faces
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        // Draw edges
        gl.useProgram(edgeProgram);
        setUniformMatrix(edgeProgram, "uProjectionMatrix", projectionMatrix);
        setUniformMatrix(edgeProgram, "uModelViewMatrix", modelViewMatrix);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeIndexBuffer);
        gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(render);
    }

    render();
});
