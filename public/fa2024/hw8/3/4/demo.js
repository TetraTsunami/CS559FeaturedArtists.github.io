function start() {

  // Get canvas, WebGL context, twgl.m4
  var canvas = document.getElementById("mycanvas");
  var gl = canvas.getContext("webgl");

  // Sliders at center
  var slider1 = document.getElementById('slider1');
  slider1.value = 0;
  var slider2 = document.getElementById('slider2');
  slider2.value = 0;

  // Read shader source
  var vertexSource = document.getElementById("vertexShader").text;
  var stickFragmentSource = document.getElementById("fragmentShader").text;

  function shaderSetup(vSource, fSource){
    var vertexShader = compileShader(gl.VERTEX_SHADER, vSource);
    var fragmentShader = compileShader(gl.FRAGMENT_SHADER, fSource);
    if (!vertexShader || !fragmentShader) return;
  
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("Could not initialize shaders");
      return;
    }
    gl.useProgram(shaderProgram);
    return shaderProgram;
  }

  // GPT Helper method
  function compileShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfostick(shader));
      return null;
    }
    return shader;
  }

  // with the vertex shader, we need to pass it positions
  // as an attribute - so set up that communication
  function setupAttributesAndUniforms(shdrPrgm){
    shdrPrgm.PositionAttribute = gl.getAttribLocation(shdrPrgm, "vPosition");
    gl.enableVertexAttribArray(shdrPrgm.PositionAttribute);
  
    shdrPrgm.NormalAttribute = gl.getAttribLocation(shdrPrgm, "vNormal");
    gl.enableVertexAttribArray(shdrPrgm.NormalAttribute);
  
    shdrPrgm.ColorAttribute = gl.getAttribLocation(shdrPrgm, "vColor");
    gl.enableVertexAttribArray(shdrPrgm.ColorAttribute);
  
    shdrPrgm.texcoordAttribute = gl.getAttribLocation(shdrPrgm, "vTexCoord");
    gl.enableVertexAttribArray(shdrPrgm.texcoordAttribute);
  
    // this gives us access to the matrix uniform
    shdrPrgm.MVmatrix = gl.getUniformLocation(shdrPrgm, "uMV");
    shdrPrgm.MVNormalmatrix = gl.getUniformLocation(shdrPrgm, "uMVn");
    shdrPrgm.MVPmatrix = gl.getUniformLocation(shdrPrgm, "uMVP");
  
    // Attach samplers to texture units
    shdrPrgm.texSampler1 = gl.getUniformLocation(shdrPrgm, "texSampler1");
    gl.uniform1i(shdrPrgm.texSampler1, 0);
    shdrPrgm.texSampler2 = gl.getUniformLocation(shdrPrgm, "texSampler2");
    gl.uniform1i(shdrPrgm.texSampler2, 1);
  }


  var triangleIndices = new Uint8Array([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23 
  ]);

  var stickVertexPos = new Float32Array([
    5,5,5,   5,0,5,   5,5,-5,    5,0,-5,
    5,5,-5,  5,0,-5,  -5,5,-5,  -5,0,-5,
    5,5,5,   5,5,-5,  -5,5,5,   -5,5,-5, 
    -5,5,5, -5,0,5,    5,5,5,    5,0,5,
    5,0,5,   5,0,-5,  -5,0,5,   -5,0,-5,
    -5,5,-5, -5,0,-5, -5,5,5,    -5,0,5
    ]);

  var stickVertexNormals = new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
  ]);

  var stickVertexColors = new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
    1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1
  ]);

  var stickVertexTextureCoords = new Float32Array([
    0, 0.5,   0, 1,   0.5, 0.5,   0.5, 1,
    0.5, 0.5,   0.5, 1,   0, 0.5,   0, 1,
    0.5, 0.5,   0.5, 1,   0, 0.5,   0, 1,
    0.5, 0.5,   0.5, 1,   0, 0.5,   0, 1,
    0.5, 0.5,   0.5, 1,   0, 0.5,   0, 1,
    0, 0.5,   0, 1,   0.5, 0.5,   0.5, 1,
  ]);

  var stickTriangleIndices = new Uint8Array([
    0, 1, 2, 2, 3, 1,
    4, 5, 6, 6, 7, 5,
    8, 9, 10, 10, 11, 9,
    12, 13, 14, 14, 15, 13,
    16, 17, 18, 18, 19, 17,
    20, 21, 22, 22, 23, 21 
  ]);
  
  var roofVertexPos = new Float32Array([
    2,8,2,   6,5,6,   2,8,-2,    6,5,-6,
    2,8,-2,  6,5,-6,  -2,8,-2,  -6,5,-6,
    2,8,2,   2,8,-2,  -2,8,2,   -2,8,-2,
    -2,8,2, -6,5,6,    2,8,2,    6,5,6,
    6,5,6,   6,5,-6,  -6,5,6,   -6,5,-6,
    -2,8,-2, -6,5,-6, -2,8,2,    -6,5,6
  ]);
  
  var stickTrianglePosBuffer = createBuffer(stickVertexPos, false, false);
  stickTrianglePosBuffer.numItems = stickTriangleIndices.length;
  var stickTriangleNormalBuffer = createBuffer(stickVertexNormals);
  stickTriangleNormalBuffer.numItems = stickVertexNormals.length;
  var stickColorBuffer = createBuffer(stickVertexColors);
  stickColorBuffer.numItems = stickVertexColors.length;
  var stickTextureBuffer = createBuffer(stickVertexTextureCoords, false, true);
  stickTextureBuffer.numItems = stickVertexTextureCoords.length / 2;
  var stickIndexBuffer = createBuffer(stickTriangleIndices, true);
  var roofTrianglePosBuffer = createBuffer(roofVertexPos, false, false);
  roofTrianglePosBuffer.numItems = stickTriangleIndices.length;
  

  // GPT Helper method
  function createBuffer(data, isIndexBuffer = false, isTextureBuffer = false) {
    var buffer = gl.createBuffer();
    var target = isIndexBuffer ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    if (!isIndexBuffer) buffer.itemSize = isTextureBuffer ? 2 : 3;
    return buffer;
  }
  
  var texture1 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  var image1 = new Image();
  
  var texture2 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  var image2 = new Image();

  function initTextureThenDraw() {
    image1.onload = function () { loadTexture(image1, texture1); };
    image1.crossOrigin = "anonymous";
    image1.src = "https://live.staticflickr.com/65535/50641871583_78566f4fbb_o.jpg";

	image2.onload = function () { loadTexture(image2, texture2); };
    image2.crossOrigin = "anonymous";
    image2.src = "https://live.staticflickr.com/5323/30998511026_c90053af9c_o.jpg";
	
    window.setTimeout(draw, 200);
  }

  function loadTexture(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Option 1 : Use mipmap, select interpolation mode
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  }

  function drawPart(trianglePosBuffer, triangleNormalBuffer, colorBuffer, indexBuffer, textureBuffer, modelMatrix, matrix1, matrix2, shaderPrgm) {
    var tMV = mat4.create();
    var tMVn = mat3.create();
    var tMVP = mat4.create();
    mat4.multiply(tMV, matrix1, modelMatrix);
    mat3.normalFromMat4(tMVn, tMV);
    mat4.multiply(tMVP, matrix2, tMV);

    gl.uniformMatrix4fv(shaderPrgm.MVmatrix, false, tMV);
    gl.uniformMatrix3fv(shaderPrgm.MVNormalmatrix, false, tMVn);
    gl.uniformMatrix4fv(shaderPrgm.MVPmatrix, false, tMVP);

    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.vertexAttribPointer(shaderPrgm.PositionAttribute, trianglePosBuffer.itemSize,
      gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
    gl.vertexAttribPointer(shaderPrgm.NormalAttribute, triangleNormalBuffer.itemSize,
      gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(shaderPrgm.ColorAttribute, colorBuffer.itemSize,
      gl.FLOAT, false, 0, 0);

    // set index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Bind Texture
    
    if (textureBuffer != null) {
      gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
      gl.vertexAttribPointer(shaderPrgm.texcoordAttribute, textureBuffer.itemSize,
        gl.FLOAT, false, 0, 0);
    }
    

    gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);
  }

  function draw() {
	var angle1 = slider1.value * 0.01 * Math.PI; // camera angle
    var angle2 = slider2.value * 0.05 - 4;
	
    var eye = [20 * Math.sin(angle1), 5, 20 * Math.cos(angle1)];
    var target = [0, angle2, 0];
    var up = [0, 1, 0];

    var matrix1 = mat4.create();
    mat4.lookAt(matrix1, eye, target, up);

    var matrix2 = mat4.create();
    mat4.perspective(matrix2, Math.PI / 4, 1, 10, 1000);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var stickShaderProgram = shaderSetup(vertexSource, stickFragmentSource);
    setupAttributesAndUniforms(stickShaderProgram);

    var campfireParentMatrix = mat4.create();
    var campfireTransform = mat4.create();
    mat4.fromTranslation(campfireTransform, [0, -5, 0]);
    mat4.multiply(campfireParentMatrix, campfireParentMatrix, campfireTransform);

    // House box
    var stick1ModelMatrix = mat4.create();
    mat4.fromScaling(stick1ModelMatrix, [0.5, 0.5, 0.5]);
    mat4.translate(stick1ModelMatrix,stick1ModelMatrix, [0,0.1,0]); // move up 0.1
    mat4.multiply(stick1ModelMatrix, stick1ModelMatrix, campfireParentMatrix);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    drawPart(stickTrianglePosBuffer, stickTriangleNormalBuffer, stickColorBuffer, stickIndexBuffer, stickTextureBuffer, stick1ModelMatrix, matrix1, matrix2, stickShaderProgram);

    // Roof
    var stick2ModelMatrix = mat4.create();
    mat4.fromScaling(stick2ModelMatrix, [0.5, 0.5, 0.5]);
    mat4.rotate(stick2ModelMatrix,stick2ModelMatrix, Math.PI * .5 ,[0,1,0]); // rotate 90 degree
    mat4.multiply(stick2ModelMatrix, stick2ModelMatrix, campfireParentMatrix);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    drawPart(roofTrianglePosBuffer, stickTriangleNormalBuffer, stickColorBuffer, stickIndexBuffer, stickTextureBuffer, stick2ModelMatrix, matrix1, matrix2, stickShaderProgram);
  
  }

  slider1.addEventListener("input", draw);
  slider2.addEventListener("input", draw);
  initTextureThenDraw();
}

window.onload = start;