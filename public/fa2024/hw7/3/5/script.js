function start() {
  // Get canvas, WebGL context, twgl.m4
  var canvas = document.getElementById("mycanvas");
  var gl = canvas.getContext("webgl");

  // Sliders at center

  //   var time = 0;

  // Read shader source
  var vertexSource = document.getElementById("vertexShader").text;
  var fragmentSource = document.getElementById("fragmentShader").text;

  // Compile vertex shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
    return null;
  }

  // Compile fragment shader
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader));
    return null;
  }

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
  shaderProgram.PositionAttribute = gl.getAttribLocation(
    shaderProgram,
    "vPosition"
  );
  gl.enableVertexAttribArray(shaderProgram.PositionAttribute);

  shaderProgram.NormalAttribute = gl.getAttribLocation(
    shaderProgram,
    "vNormal"
  );
  gl.enableVertexAttribArray(shaderProgram.NormalAttribute);

  shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "vColor");
  gl.enableVertexAttribArray(shaderProgram.ColorAttribute);

  shaderProgram.texcoordAttribute = gl.getAttribLocation(
    shaderProgram,
    "vTexCoord"
  );
  //   gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);

  // this gives us access to the matrix uniform
  shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram, "uMV");
  shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram, "uMVn");
  shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram, "uMVP");

  //   const location = gl.getUniformLocation(WebGLProgram, "uniformName");
  var timeLocation = gl.getUniformLocation(shaderProgram, "time");
  //   gl.uniform1f(timeLocation, time);

  // Data ...

  // example: (x = 0.1, y = 0, z = 0, sideLengthX = .2, sideLengthY = .2, sideLengthZ = .2)
  const createStructureVertexPos = (
    xCoord,
    yCoord,
    zCoord,
    sideLengthX,
    sideLengthY,
    sideLengthZ
  ) => {
    return new Float32Array([
      // face 0
      // indice 0
      xCoord,
      yCoord,
      zCoord,
      // indice 1
      xCoord,
      yCoord + sideLengthY,
      zCoord,
      // indice 2
      xCoord - sideLengthX,
      yCoord + sideLengthY,
      zCoord,
      // indice 3
      xCoord - sideLengthX,
      yCoord,
      zCoord,
      // face 1
      // index 4
      xCoord,
      yCoord,
      zCoord,
      // index 5
      xCoord,
      yCoord + sideLengthY,
      zCoord,
      // index 6
      xCoord,
      yCoord + sideLengthY,
      zCoord - sideLengthZ,
      // index 7
      xCoord,
      yCoord,
      zCoord - sideLengthZ,
      // face 2
      //   index 8
      xCoord,
      yCoord,
      zCoord - sideLengthZ,
      // index 9
      xCoord,
      yCoord + sideLengthY,
      zCoord - sideLengthZ,
      //   index 10
      xCoord - sideLengthX,
      yCoord + sideLengthY,
      zCoord - sideLengthZ,
      // index 11
      xCoord - sideLengthX,
      yCoord,
      zCoord - sideLengthZ,
      // face 3
      // index 12
      xCoord - sideLengthX,
      yCoord,
      zCoord,
      // index 13
      xCoord - sideLengthX,
      yCoord + sideLengthY,
      zCoord,
      // index 14
      xCoord - sideLengthX,
      yCoord + sideLengthY,
      zCoord - sideLengthZ,
      // index 15
      xCoord - sideLengthX,
      yCoord,
      zCoord - sideLengthZ,
      // face 4
      // index 16
      xCoord,
      yCoord + sideLengthY,
      zCoord,
      // index 17
      xCoord,
      yCoord + sideLengthY,
      zCoord - sideLengthZ,
      // index 18
      xCoord - sideLengthX,
      yCoord + sideLengthY,
      zCoord - sideLengthZ,
      // index 19
      xCoord - sideLengthX,
      yCoord + sideLengthY,
      zCoord,
      // face 5
      // index 20
      xCoord,
      yCoord,
      zCoord,
      // index 21
      xCoord,
      yCoord,
      zCoord - sideLengthZ,
      // index 22
      xCoord - sideLengthX,
      yCoord,
      zCoord - sideLengthZ,
      // index 23
      xCoord - sideLengthX,
      yCoord,
      zCoord,
    ]);
  };

  const getTriangleIndices = (startingIndex) => {
    return new Uint8Array([
      // 0,1,2
      startingIndex,
      startingIndex + 1,
      startingIndex + 2,
      // 0, 2, 3
      startingIndex,
      startingIndex + 2,
      startingIndex + 3,
      // 4,5,6
      startingIndex + 4,
      startingIndex + 5,
      startingIndex + 6,
      // 4,6,7
      startingIndex + 4,
      startingIndex + 6,
      startingIndex + 7,
      // 8,9,10
      startingIndex + 8,
      startingIndex + 9,
      startingIndex + 10,
      //   8,10,12
      startingIndex + 8,
      startingIndex + 10,
      startingIndex + 11,
      // 12, 13, 14
      startingIndex + 12,
      startingIndex + 13,
      startingIndex + 14,
      //  12, 14, 15
      startingIndex + 12,
      startingIndex + 14,
      startingIndex + 15,
      // 16, 17, 18
      startingIndex + 16,
      startingIndex + 17,
      startingIndex + 18,
      // 16, 18, 19
      startingIndex + 16,
      startingIndex + 18,
      startingIndex + 19,
      // 20, 21, 22
      startingIndex + 20,
      startingIndex + 21,
      startingIndex + 22,
      // 20, 22, 23
      startingIndex + 20,
      startingIndex + 22,
      startingIndex + 23,
    ]);
  };

  var time = 0;
  var angle1 = time * 0.01 * Math.PI;

  // VERTEX POSITIONS
  // vertex positions for the ground level
  var vertexPosGround = new Float32Array([
    1, 0, 1, 1, 0, -1, -1, 0, -1, -1, 0, 1,
  ]);
  var vertexPosBlock1 = createStructureVertexPos(-0.2, 0, -0.2, 0.2, 0.5, 0.2);
  var vertexPosBlock2 = createStructureVertexPos(-0.5, 0, 0.5, 0.2, 0.7, 0.1);
  var vertexPosBlock3 = createStructureVertexPos(0.5, 0, 0, 0.3, 0.9, 0.6);
  var vertexPosBlock4 = createStructureVertexPos(0.1, 0, -0.6, 0.4, 0.4, 0.2);
  var vertexPosBlock5 = createStructureVertexPos(-0.8, 0, -0.8, 0.1, 0.4, 0.1);
  var vertexPosBlock6 = createStructureVertexPos(-0.5, 0, 0.8, 0.4, 0.6, 0.05);
  var vertexPosBlock7 = createStructureVertexPos(0.9, 0, 0.8, 0.5, 0.9, 0.5);

  // vertex positions
  //   var vertexPos = new Float32Array(vertexPosGround, vertexPosBlock1);
  var vertexPos = Float32Array.of(
    ...vertexPosGround,
    ...vertexPosBlock1,
    ...vertexPosBlock2,
    ...vertexPosBlock3,
    ...vertexPosBlock4,
    ...vertexPosBlock5,
    ...vertexPosBlock6,
    ...vertexPosBlock7
  );
  console.log("vertexPos", vertexPos);

  // VERTEX NORMALS
  var vertexNormalsGround = new Float32Array([
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
  ]);
  var vertexNormalsBlock1 = new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0,
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
  ]);

  // vertex normals
  //   var vertexNormals = new Float32Array(
  //     vertexNormalsGround,
  //     vertexNormalsBlock1
  //   );
  var vertexNormals = Float32Array.of(
    ...vertexNormalsGround,
    ...vertexNormalsBlock1,
    ...vertexNormalsBlock1,
    ...vertexNormalsBlock1,
    ...vertexNormalsBlock1,
    ...vertexNormalsBlock1,
    ...vertexNormalsBlock1,
    ...vertexNormalsBlock1
  );
  console.log("vertexNormals", vertexNormals);

  // VERTEX COLORS
  var vertexColorsGround = new Float32Array([
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
  ]);
  // vertexColors of block 1 will be the calcualted normals at each vertex

  // vertex colors
  //   var vertexColors = new Float32Array(vertexColorsGround, vertexNormalsBlock1);
  var vertexColors = Float32Array.of(
    ...vertexColorsGround,
    ...vertexNormalsBlock1,
    ...vertexNormalsBlock1,
    ...vertexNormalsBlock1,
    ...vertexNormalsBlock1,
    ...vertexNormalsBlock1,
    ...vertexNormalsBlock1,
    ...vertexNormalsBlock1
  );
  console.log("vertexColors", vertexColors);

  // TRIANGLE INDICES
  var triangleIndicesGround = new Uint8Array([0, 1, 2, 0, 2, 3]); // 4 vertices: 0 - 3
  var triangleIndicesBlock1 = getTriangleIndices(4);
  var triangleIndicesBlock2 = getTriangleIndices(28);
  var triangleIndicesBlock3 = getTriangleIndices(52);
  var triangleIndicesBlock4 = getTriangleIndices(76);
  var triangleIndicesBlock5 = getTriangleIndices(100);
  var triangleIndicesBlock6 = getTriangleIndices(124);
  var triangleIndicesBlock7 = getTriangleIndices(148);

  // element index array
  //   var triangleIndices = new Uint8Array(
  //     triangleIndicesGround,
  //     triangleIndicesBlock1
  //   );
  var triangleIndices = Uint8Array.of(
    ...triangleIndicesGround,
    ...triangleIndicesBlock1,
    ...triangleIndicesBlock2,
    ...triangleIndicesBlock3,
    ...triangleIndicesBlock4,
    ...triangleIndicesBlock5,
    ...triangleIndicesBlock6,
    ...triangleIndicesBlock7
  );
  console.log("triangleIndices", triangleIndices);

  var numVertices = vertexPos.length / 3;

  // we need to put the vertices into a buffer so we can
  // block transfer them to the graphics hardware
  var trianglePosBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
  trianglePosBuffer.itemSize = 3;
  trianglePosBuffer.numItems = numVertices;

  // a buffer for normals
  var triangleNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
  triangleNormalBuffer.itemSize = 3;
  triangleNormalBuffer.numItems = numVertices;

  // a buffer for colors
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
  colorBuffer.itemSize = 3;
  colorBuffer.numItems = numVertices;

  // a buffer for indices
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);

  gl.uniform1f(timeLocation, time);

  let startTime = null;

  // Scene (re-)draw routine
  function draw(currentTime) {
    // console.log(time);

    if (startTime === null) {
      startTime = currentTime;
    }
    const time = (currentTime - startTime) / 10000.0;
    // console.log(time);
    gl.uniform1f(timeLocation, time);

    // Translate slider values to angles in the [-pi,pi] interval
    var angle1 = time * 1 * Math.PI;
    var angle2 = Math.sin(time * 3 * Math.PI);

    // Circle around the y-axis
    // var eye = [400 * Math.sin(angle1), 150.0, 400.0 * Math.cos(angle1)];
    var eye = [
      300 * Math.sin(angle1),
      150 + 50 * Math.sin(3 * angle1),
      300.0 * Math.cos(angle1),
    ];
    var target = [0, 0, 0];
    var up = [0, 1, 0];

    // const delta = time % 100;

    var tModel = mat4.create();
    // mat3.fromTranslation(tModel, [delta, 0, delta]);
    // mat4.fromTranslation(tModel, [0, 1000 * Math.cos(-angle2), 0]);
    mat4.fromScaling(tModel, [50 * Math.sin(3 * angle1) + 100, 100, 100]);

    // mat4.rotateY(tModel, tModel, -angle2, [1, 1, 1]);

    var tCamera = mat4.create();
    mat4.lookAt(tCamera, eye, target, up);

    var tProjection = mat4.create();
    mat4.perspective(tProjection, Math.PI / 4, 1, 10, 1000);

    var tMV = mat4.create();
    var tMVn = mat3.create();
    var tMVP = mat4.create();
    mat4.multiply(tMV, tCamera, tModel); // "modelView" matrix
    mat3.normalFromMat4(tMVn, tMV);
    mat4.multiply(tMVP, tProjection, tMV);

    // Clear screen, prepare for rendering
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up uniforms & attributes
    gl.uniformMatrix4fv(shaderProgram.MVmatrix, false, tMV);
    gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix, false, tMVn);
    gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);

    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.vertexAttribPointer(
      shaderProgram.PositionAttribute,
      trianglePosBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
    gl.vertexAttribPointer(
      shaderProgram.NormalAttribute,
      triangleNormalBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(
      shaderProgram.ColorAttribute,
      colorBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    // Do the drawing
    gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);
    // time = (time + 1) % 500;

    window.requestAnimationFrame(draw);
  }

  //   slider1.addEventListener("input", draw);
  //   slider2.addEventListener("input", draw);
  //   draw();
  //   time = (time + 1) % 225;
  window.requestAnimationFrame(draw);
}

window.onload = start;
