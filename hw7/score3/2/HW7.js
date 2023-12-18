function start() {

    // Get canvas, WebGL context, twgl.m4
    var canvas = document.getElementById("mycanvas");
    //canvas.style.backgroundColor = '#92989c';
    var gl = canvas.getContext("webgl");

    var timer = 0;
    var loop = 0;
    var rotation_delta = 0;

    // Sliders at center
    var slider1 = document.getElementById('slider1');
    slider1.value = 0;
    var slider2 = document.getElementById('slider2');
    slider2.value = 35;

    // Read shader source
    var vertexSource = document.getElementById("vertexShader").text;
    var fragmentSource = document.getElementById("fragmentShader").text;

    // Compile vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader,vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(vertexShader)); return null; }

    // Compile fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader,fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(fragmentShader)); return null; }

    // Attach the shaders and link
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialize shaders"); }
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
    shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram,"uMV");
    shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram,"uMVn");
    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram,"uMVP");

    // Data ...

    // vertex positions
    var vertexPos = new Float32Array(
        [  .1, 1, .1,  -.1, 1, .1,  -1,-1, 1,   1,-1, 1,
           .1, 1, .1,   1,-1, 1,   1,-1,-1,   .1, 1,-.1,
           .1, 1, .1,   .1, 1,-.1,  -.1, 1,-.1,  -.1, 1, .1,
          -.1, 1, .1,  -.1, 1,-.1,  -1,-1,-1,  -1,-1, 1,
          -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,
           1,-1,-1,  -1,-1,-1,  -.1, 1,-.1,   .1, 1,-.1 ]);

    // vertex normals
    var vertexNormals = new Float32Array(
        [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
           1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
           0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
          -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
           0,-1, 0,   0,-1, 0,   0,-1, 0,   0,-1, 0,
           0, 0,-1,   0, 0,-1,   0, 0,-1,   0, 0,-1  ]);

    // vertex colors
    var vertexColors = new Float32Array(
        [  0.9, 0.9, 0.9,   0.9, 0.9, 0.9,   0.9, 0.9, 0.9,   0.9, 0.9, 0.9,
           0.9, 0.9, 0.9,   0.9, 0.9, 0.9,   0.9, 0.9, 0.9,   0.9, 0.9, 0.9,
           0.9, 0.9, 0.9,   0.9, 0.9, 0.9,   0.9, 0.9, 0.9,   0.9, 0.9, 0.9,
           0.9, 0.9, 0.9,   0.9, 0.9, 0.9,   0.9, 0.9, 0.9,   0.9, 0.9, 0.9,
              0.9, 0.9, 0.9,   0.9, 0.9, 0.9,   0.9, 0.9, 0.9,   0.9, 0.9, 0.9,
              0.9, 0.9, 0.9,   0.9, 0.9, 0.9,   0.9, 0.9, 0.9,   0.9, 0.9, 0.9]);

    // element index array
    var triangleIndices = new Uint8Array(
        [  0, 1, 2,   0, 2, 3,    // front
           4, 5, 6,   4, 6, 7,    // right
           8, 9,10,   8,10,11,    // top
          12,13,14,  12,14,15,    // left
          16,17,18,  16,18,19,    // bottom
	      20,21,22,  20,22,23 ]); // back


    // we need to put the vertices into a buffer so we can
    // block transfer them to the graphics hardware
    var trianglePosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
    trianglePosBuffer.itemSize = 3;
    trianglePosBuffer.numItems = 24;

    // a buffer for normals
    var triangleNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
    triangleNormalBuffer.itemSize = 3;
    triangleNormalBuffer.numItems = 24;

    // a buffer for colors
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
    colorBuffer.itemSize = 3;
    colorBuffer.numItems = 24;

    // a buffer for indices
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);

    // Scene (re-)draw routine
    function draw() {

        // Translate slider values to angles in the [-pi,pi] interval
        var angle1 = slider1.value*0.01*Math.PI;
        var angle2 = slider2.value*0.01*Math.PI;

        //Set up the STACK
        var stack = [ mat4.create() ]; // Initialize stack with identity on top

        var cameraDistance = 400.0;

        // Set up the Camera
        var eye = [cameraDistance*Math.sin(angle1)*Math.sin(angle2),cameraDistance*Math.cos(angle2),cameraDistance*Math.cos(angle1)*Math.sin(angle2)];
        var target = [0,0,0];
        var up = [0,1,0];

        stack.unshift(mat4.clone(stack[0])); // "save" (note: you *need* to clone)

        // Apply scaling to the model
        var tScale = mat4.create();
        mat4.fromScaling(tScale, [50, 50, 50]);
        mat4.multiply(stack[0], stack[0], tScale);

        // Apply translation to the model
        var tTranslate = mat4.create();
        mat4.fromTranslation(tTranslate, [0, loop, 0,]); // Translate along the z-axis
        mat4.multiply(stack[0], stack[0], tTranslate);

        // Apply rotation to the model
        var tRotate = mat4.create();
        mat4.fromRotation(tRotate, timer / 150, [0, 1, 0]); // Rotate around the y-axis
        mat4.multiply(stack[0], stack[0], tRotate);

        //stack.shift();


        var tCamera = mat4.create();
        mat4.lookAt(tCamera, eye, target, up);

        var tProjection = mat4.create();
        mat4.perspective(tProjection,Math.PI/4,1,10,1000);

        var tMV = mat4.create();
        var tMVn = mat3.create();
        var tMVP = mat4.create();
        mat4.multiply(tMV,tCamera,stack[0]); // "modelView" matrix
        mat3.normalFromMat4(tMVn,tMV);
        mat4.multiply(tMVP,tProjection,tMV);

        // Clear screen, prepare for rendering
        gl.clearColor(0.5, 0.5, 0.75, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set up uniforms & attributes
        gl.uniformMatrix4fv(shaderProgram.MVmatrix,false,tMV);
        gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix,false,tMVn);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix,false,tMVP);

        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
        gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
          gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.NormalAttribute, triangleNormalBuffer.itemSize,
          gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize,
          gl.FLOAT,false, 0, 0);

        // Do the drawing
        gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);

        // ----------- ANIMATINO VALUES -----------
        timer = timer + 1;
        loop = Math.sin(timer/150);
        rotation_delta = timer / 1000;

        window.requestAnimationFrame(draw);
    }

    //slider1.addEventListener("input",draw);
    //slider2.addEventListener("input",draw);
    //draw();
    window.requestAnimationFrame(draw);
}

window.onload=start;
