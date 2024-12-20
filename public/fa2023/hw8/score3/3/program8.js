const canvas = document.getElementById("myCanvas");
canvas.width = 900; // x
canvas.height = 600; // y
let gl = canvas.getContext("webgl");

const slider1 = document.getElementById("slider1");
slider1.type = "range";
slider1.min = -100;
slider1.max = 100;
slider1.value = 0;

const slider2 = document.getElementById("slider2");
slider2.type = "range";
slider2.min = -100;
slider2.max = 100;
slider2.value = 0;

let angle2 = 0;

const slider3 = document.getElementById("slider3");
slider3.type = "range";
slider3.min = 0;
slider3.max = 100;
slider3.value = 30;

const slider4 = document.getElementById("slider4");
slider4.type = "range";
slider4.min = 1;
slider4.max = 7;
slider4.value = 0;

const slider5 = document.getElementById("slider5");
slider5.type = "range";

const slider6 = document.getElementById("slider6");
slider6.type = "range";
slider6.min = 3;
slider6.max = 100;
slider6.value = 3;

let animationSpeed = 3;

let resetCanvas = document.getElementById("resetCanvas");
let animateToggle = document.getElementById("animateToggle");
let animate = false;

let changeRotation = document.getElementById("changeRotation");
let rotationType = 1;

function setup() {
  const vertexSource = document.getElementById("vertexShader").text;
  const fragmentSource = document.getElementById("fragmentShader").text;

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
  gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);

  // this gives us access to the matrix uniform
  shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram, "uMV");
  shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram, "uMVn");
  shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram, "uMVP");

  // Attach samplers to texture units
  shaderProgram.texSampler1 = gl.getUniformLocation(
    shaderProgram,
    "texSampler1"
  );
  gl.uniform1i(shaderProgram.texSampler1, 0);
  shaderProgram.texSampler2 = gl.getUniformLocation(
    shaderProgram,
    "texSampler2"
  );
  gl.uniform1i(shaderProgram.texSampler2, 1);

  // Data ...

  // vertex positions
  var vertexPos = new Float32Array([
    1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1,
    -1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1,
    -1, -1, 1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, -1, -1, -1, -1,
    -1, -1, 1, -1, 1, 1, -1,
    //roof
    0, 3, 0,
  ]);

  // vertex normals
  var vertexNormals = new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0,
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    //roof
    0, 1, 0,
  ]);

  // vertex colors
  var vertexColors = new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0,
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
    //roof
    1, 0, 0,
  ]);

  // Texture coordinates for each face of the cube
  var vertexTextureCoords = new Float32Array([
    // Front face (vertices 0-3)
    0.25, 0, 0.5, 0, 0.5, 1, 0.25, 1,
    // Right face (vertices 4-7) 0, 0,,   1, 0,,   1, 1,   0, 1,
    0.25, 0, 0.25, 1, 0, 1, 0, 0,
    // Top face (vertices 8-11)
    0, 1, 0, 0, 1, 0, 1, 1,
    // Left face (vertices 12-15)
    0.5, 0, 0.75, 0, 0.75, 1, 0.5, 1,
    // Bottom face (vertices 16-19)
    1, 1, 0, 1, 0, 0, 1, 0,
    // Back face (vertices 20-23)
    1, 1, 0.75, 1, 0.75, 0, 1, 0,

    //roof
    0.5, 0.5,
  ]);
  // element index array

  var triangleIndices = new Uint16Array([
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14,
    15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
    //roof
    0, 1, 24, 0, 7, 24, 10, 7, 24, 10, 1, 24,
  ]);

  // we need to put the vertices into a buffer so we can
  // block transfer them to the graphics hardware
  var trianglePosBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
  trianglePosBuffer.itemSize = 3;
  trianglePosBuffer.numItems = 25;

  // a buffer for normals
  var triangleNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
  triangleNormalBuffer.itemSize = 3;
  triangleNormalBuffer.numItems = 25;

  // a buffer for colors
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
  colorBuffer.itemSize = 3;
  colorBuffer.numItems = 25;

  // a buffer for textures
  var textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexTextureCoords, gl.STATIC_DRAW);
  textureBuffer.itemSize = 2;
  textureBuffer.numItems = 25;

  // a buffer for indices
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);

  // Set up texture
  var texture1 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );
  var image1 = new Image();

  function initTextureThenDraw() {
    image1.onload = function () {
      loadTexture(image1, texture1);
    };
    image1.crossOrigin = "anonymous";
    image1.src =
      "https://farm6.staticflickr.com/5564/30725680942_e3bfe50e5e_b.jpg";

    window.setTimeout(animateFunction, 200);
  }

  function loadTexture(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Option 1 : Use mipmap, select interpolation mode
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
  }

  // Scene (re-)draw routine
  function draw() {
    // Translate slider values to angles in the [-pi,pi] interval
    let angle1 = slider1.value * 0.01 * Math.PI;
    let dist = slider3.value / 10;

    let numModels = parseInt(slider4.value); //starts at 1
    let modelTransformations = [];
    for (let i = 0; i < numModels; i++) {
      let transformation = mat4.create();
      mat4.fromScaling(transformation, [30, 30, 30]);

      if (rotationType === 2 && i !== 0) {
        mat4.rotate(transformation, transformation, angle2, [1, 1, 1]);
      }
      if (rotationType === 3 && i !== 0) {
        mat4.rotate(transformation, transformation, angle2, [1, 1, 1]);
      }
      switch (i) {
        case 0:
          mat4.translate(transformation, transformation, [0, 0, 0]);
          break;
        case 1:
          mat4.translate(transformation, transformation, [dist, 0, 0]);
          break;
        case 2:
          mat4.translate(transformation, transformation, [0, 0, -dist]);
          break;
        case 3:
          mat4.translate(transformation, transformation, [-dist, 0, 0]);
          break;
        case 4:
          mat4.translate(transformation, transformation, [0, 0, dist]);
          break;
        case 5:
          mat4.translate(transformation, transformation, [0, dist, 0]);
          break;
        case 6:
          mat4.translate(transformation, transformation, [0, -dist, 0]);
          break;
      }
      if (rotationType === 1 && i !== 0) {
        mat4.rotate(transformation, transformation, angle2, [1, 1, 1]);
      }
      if (rotationType === 3 && i !== 0) {
        mat4.rotate(transformation, transformation, angle2 * 5, [1, 1, 1]);
      }
      modelTransformations.push(transformation);
    }

    // Clear screen, prepare for rendering
    gl.clearColor(0.5, 1.0, 0.9, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (let i = 0; i < modelTransformations.length; i++) {
      const tModel = modelTransformations[i];
      const tMV = mat4.create();
      const tMVn = mat3.create();
      const tMVP = mat4.create();
      const tCamera = mat4.create();

      // Circle around the y-axis

      //edit eye for zoom
      let eye = [
        400 * Math.sin(angle1) * 2.7,
        150.0 * 2.7,
        400.0 * Math.cos(angle1) * 2.7,
      ];
      let target = [0, 0, 0];
      let up = [0, 1, 0];
      mat4.lookAt(tCamera, eye, target, up);

      const tProjection = mat4.create();
      mat4.perspective(tProjection, Math.PI / 4, 1, 10, 1500);

      mat4.multiply(tMV, tCamera, tModel); //"modelView" matrix
      mat3.normalFromMat4(tMVn, tMV);
      mat4.multiply(tMVP, tProjection, tMV);

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

      gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
      gl.vertexAttribPointer(
        shaderProgram.texcoordAttribute,
        textureBuffer.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      );
      // Bind texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture1);
      gl.activeTexture(gl.TEXTURE1);

      // Do the drawing
      gl.drawElements(
        gl.TRIANGLES,
        triangleIndices.length,
        gl.UNSIGNED_SHORT,
        0
      );
    }
  }

  function animateFunction() {
    if (animate) {
      animationSpeed = slider6.value;
      angle2 += animationSpeed * 0.005;
      angle2 %= 2 * Math.PI;
    } else {
      angle2 = slider2.value * 0.01 * Math.PI;
    }
    draw();
    requestAnimationFrame(animateFunction);
  }
  //rotates the camera
  slider1.addEventListener("input", draw);
  //rotates the model
  slider2.addEventListener("input", draw);
  //change distance from original model
  slider3.addEventListener("input", draw);
  //num modles
  slider4.addEventListener("input", draw);

  //changes speed of animation
  slider6.addEventListener("input", draw);

  resetCanvas.addEventListener("click", () => {
    slider1.value = 0;
    slider2.value = 0;
    slider3.value = 30;
    slider4.value = 0;
    slider6.value = 1;
    draw();
  });

  changeRotation.addEventListener("click", () => {
    switch (rotationType) {
      case 1:
        rotationType = 2;
        break;
      case 2:
        rotationType = 3;
        break;
      case 3:
        rotationType = 1;
        break;
    }

    draw();
  });

  animateToggle.addEventListener("click", () => {
    animate = !animate;
  });

  initTextureThenDraw();
}
window.onload = setup;
