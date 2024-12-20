function start() {

  var canvas = document.getElementById("mycanvas");
  var gl = canvas.getContext("webgl");

  var slider1 = document.getElementById('slider1');
  slider1.value = 0.3;
  var slider2 = document.getElementById('slider2');
  slider2.value = 0;
  var slider3 = document.getElementById('slider3');
  slider3.value = 75;
  var textureDropdown = document.getElementById('textureDropdown');

  // Read shader source
  var vertexSource = document.getElementById("vertexShader").text;
  var fragmentSource = document.getElementById("fragmentShader").text;

  // Compile vertex shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader)); return null;
  }

  // Compile fragment shader
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader)); return null;
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
  shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
  gl.enableVertexAttribArray(shaderProgram.PositionAttribute);

  shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
  gl.enableVertexAttribArray(shaderProgram.NormalAttribute);

  shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
  gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);

  // this gives us access to the matrix uniform
  shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram, "uMV");
  shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram, "uMVn");
  shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram, "uMVP");
  shaderProgram.time = gl.getUniformLocation(shaderProgram, "time");

  // Attach samplers to texture units
  shaderProgram.texSampler1 = gl.getUniformLocation(shaderProgram, "texSampler1");
  gl.uniform1i(shaderProgram.texSampler1, 0);
  shaderProgram.texSampler2 = gl.getUniformLocation(shaderProgram, "texSampler2");
  gl.uniform1i(shaderProgram.texSampler2, 1);

  // Data ...
  var vertexNormals = my_model.vertexNormals;
  var vertexPos = my_model.vertexPos;
  var vertexTextureCoords = my_model.vertexTextureCoords;
  var triangleIndices = my_model.triangleIndices;

  // we need to put the vertices into a buffer so we can
  // block transfer them to the graphics hardware
  var trianglePosBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
  trianglePosBuffer.itemSize = 3;

  // a buffer for normals
  var triangleNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
  triangleNormalBuffer.itemSize = 3;

  // a buffer for textures
  var textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexTextureCoords, gl.STATIC_DRAW);
  textureBuffer.itemSize = 2;

  // a buffer for indices
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);

  // Set up texture
  var texture1 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  var texture2 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  function initTextureThenDraw() {
    switch (textureDropdown.value) {
      case 'concert_img':
      loadTexture(concert_img, texture1);
      break;
      case 'goat_img':
      loadTexture(goat_img, texture1);
      break;
      case 'lightbulb_img':
      loadTexture(lightbulb_img, texture1);
      break;
      case 'northern_lights_img':
      loadTexture(northern_lights_img, texture1);
      break;
      case 'sunset_img':
      loadTexture(sunset_img, texture1);
      break;
      case 'texaco_img':
      loadTexture(texaco_img, texture1);
      break;
      case 'uncrustable_img':
      loadTexture(uncrustable_img, texture1);
      break;
      default:
      loadTexture(sunset_img, texture1);
    }

    loadTexture(carbonfiber_img, texture2)

    window.setTimeout(draw, 200);
  }

  function loadTexture(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Use mipmap, select interpolation mode
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  }
  // draw routine
  function draw() {

    // Circle around the y-axis
    var eye = [0, 150.0, 400.0];
    var target = [0, 0, 0];
    var up = [0, 1, 0];

    var tModel = mat4.create();
    mat4.fromScaling(tModel, [slider3.value, slider3.value, slider3.value]);
    mat4.rotate(tModel, tModel, slider2.value * 0.01 * Math.PI, [1, 1, 1]);
    mat4.rotate(tModel, tModel, performance.now() * slider1.value / 5000, [0, 1, 0]);

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
    gl.uniform1f(shaderProgram.time, performance.now() / 1000);

    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
      gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.NormalAttribute, triangleNormalBuffer.itemSize,
      gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.vertexAttribPointer(shaderProgram.texcoordAttribute, textureBuffer.itemSize,
      gl.FLOAT, false, 0, 0);

    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);

    // Do the drawing
    gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);
    requestAnimationFrame(draw);
  }

  textureDropdown.addEventListener("change", initTextureThenDraw);
  initTextureThenDraw();
}

window.onload = start;
