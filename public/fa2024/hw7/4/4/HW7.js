var bank = 0.0;
var direction = 0.0;
var spaceship_location = [0, 0, 700];
time = 0

function start() {
  

  // Get canvas, WebGL context, twgl.m4
  var canvas = document.getElementById("mycanvas");
  var gl = canvas.getContext("webgl");
  var slider1 = document.getElementById('slider1');
  slider1.value = 100

  // for this demo, set obj_model to reference the model name defined 
  // in the other included script
  var spaceship_model = my_spaceship_model;
  var sphere_model = my_sphere_model;

  // initialize a variable that contains the proper gl enum for the 
  // size of our triangle index elements
  var triangleIndexSize_spaceship = gl.UNSIGNED_INT;
  switch (spaceship_model.triangleIndices.BYTES_PER_ELEMENT) {
    case 1:
      triangleIndexSize_spaceship = gl.UNSIGNED_BYTE;
      break;
    case 2:
      triangleIndexSize_spaceship = gl.UNSIGNED_SHORT;
      break;
    case 4:
      // for uint32, we have to enable the extension that allows uint32 as triangle indices
      gl.getExtension('OES_element_index_uint');
      triangleIndexSize_spaceship = gl.UNSIGNED_INT;
      break;
    default:
      throw new Error('unknown triangle index element size');
  }

  var triangleIndexSize_sphere = gl.UNSIGNED_INT;
  switch (sphere_model.triangleIndices.BYTES_PER_ELEMENT) {
    case 1:
      triangleIndexSize_sphere = gl.UNSIGNED_BYTE;
      break;
    case 2:
      triangleIndexSize_sphere = gl.UNSIGNED_SHORT;
      break;
    case 4:
      // for uint32, we have to enable the extension that allows uint32 as triangle indices
      gl.getExtension('OES_element_index_uint');
      triangleIndexSize_sphere = gl.UNSIGNED_INT;
      break;
    default:
      throw new Error('unknown triangle index element size');
  }


  // Sliders at center
  // var slider1 = document.getElementById('slider1');
  // slider1.value = 0;
  // var slider2 = document.getElementById('slider2');
  // slider2.value = 0;

  // Read shader source
  var vertexSource = document.getElementById("vertexShader").text;
  var vertexSource2 = document.getElementById("vertexShader2").text;
  var fragmentSource1 = document.getElementById("fragmentShader1").text;
  var fragmentSource2 = document.getElementById("fragmentShader2").text;
  var fragmentSource3 = document.getElementById("fragmentShader3").text;
  var fragmentSource4 = document.getElementById("fragmentShader4").text;
  var fragmentSource5 = document.getElementById("fragmentShader5").text;
  var fragmentSource6 = document.getElementById("fragmentShader6").text;
  
  // Compile vertex shader1
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader)); return null;
  }

  // Compile vertex shader2
  var vertexShader2 = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader2, vertexSource2);
  gl.compileShader(vertexShader2);
  if (!gl.getShaderParameter(vertexShader2, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader2)); return null;
  }

  //////////////// Fragment Shader 1 ///////////////////////
  // Compile fragment shader
  var fragmentShader1 = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader1, fragmentSource1);
  gl.compileShader(fragmentShader1);
  if (!gl.getShaderParameter(fragmentShader1, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader1)); return null;
  }

  // Attach the shaders and link
  var shaderProgram1 = gl.createProgram();
  gl.attachShader(shaderProgram1, vertexShader);
  gl.attachShader(shaderProgram1, fragmentShader1);
  gl.linkProgram(shaderProgram1);
  if (!gl.getProgramParameter(shaderProgram1, gl.LINK_STATUS)) {
    alert("Could not initialize shaders");
  }

  // with the vertex shader, we need to pass it positions
  // as an attribute - so set up that communication
  shaderProgram1.PositionAttribute = gl.getAttribLocation(shaderProgram1, "vPosition");
  gl.enableVertexAttribArray(shaderProgram1.PositionAttribute);

  shaderProgram1.NormalAttribute = gl.getAttribLocation(shaderProgram1, "vNormal");
  gl.enableVertexAttribArray(shaderProgram1.NormalAttribute);

  // shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
  // gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);

  // this gives us access to the matrix uniform
  shaderProgram1.MVmatrix = gl.getUniformLocation(shaderProgram1, "uMV");
  shaderProgram1.MVNormalmatrix = gl.getUniformLocation(shaderProgram1, "uMVn");
  shaderProgram1.MVPmatrix = gl.getUniformLocation(shaderProgram1, "uMVP");

  //////////////// Fragment Shader 2 ///////////////////////
  // Compile fragment shader
  var fragmentShader2 = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader2, fragmentSource2);
  gl.compileShader(fragmentShader2);
  if (!gl.getShaderParameter(fragmentShader2, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader2)); return null;
  }

  // Attach the shaders and link
  var shaderProgram2 = gl.createProgram();
  gl.attachShader(shaderProgram2, vertexShader);
  gl.attachShader(shaderProgram2, fragmentShader2);
  gl.linkProgram(shaderProgram2);
  if (!gl.getProgramParameter(shaderProgram2, gl.LINK_STATUS)) {
    alert("Could not initialize shaders");
  }


  // with the vertex shader, we need to pass it positions
  // as an attribute - so set up that communication
  shaderProgram2.PositionAttribute = gl.getAttribLocation(shaderProgram2, "vPosition");
  gl.enableVertexAttribArray(shaderProgram2.PositionAttribute);

  shaderProgram2.NormalAttribute = gl.getAttribLocation(shaderProgram2, "vNormal");
  gl.enableVertexAttribArray(shaderProgram2.NormalAttribute);

  // shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
  // gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);

  // this gives us access to the matrix uniform
  shaderProgram2.MVmatrix = gl.getUniformLocation(shaderProgram2, "uMV");
  shaderProgram2.MVNormalmatrix = gl.getUniformLocation(shaderProgram2, "uMVn");
  shaderProgram2.MVPmatrix = gl.getUniformLocation(shaderProgram2, "uMVP");


  //////////////// Fragment Shader 3 ///////////////////////
  // Compile fragment shader
  var fragmentShader3 = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader3, fragmentSource3);
  gl.compileShader(fragmentShader3);
  if (!gl.getShaderParameter(fragmentShader3, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader3)); return null;
  }

  // Attach the shaders and link
  var shaderProgram3 = gl.createProgram();
  gl.attachShader(shaderProgram3, vertexShader);
  gl.attachShader(shaderProgram3, fragmentShader3);
  gl.linkProgram(shaderProgram3);
  if (!gl.getProgramParameter(shaderProgram3, gl.LINK_STATUS)) {
    alert("Could not initialize shaders");
  }


  // with the vertex shader, we need to pass it positions
  // as an attribute - so set up that communication
  shaderProgram3.PositionAttribute = gl.getAttribLocation(shaderProgram3, "vPosition");
  gl.enableVertexAttribArray(shaderProgram3.PositionAttribute);

  shaderProgram3.NormalAttribute = gl.getAttribLocation(shaderProgram3, "vNormal");
  gl.enableVertexAttribArray(shaderProgram3.NormalAttribute);

  // shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
  // gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);

  // this gives us access to the matrix uniform
  shaderProgram3.MVmatrix = gl.getUniformLocation(shaderProgram3, "uMV");
  shaderProgram3.MVNormalmatrix = gl.getUniformLocation(shaderProgram3, "uMVn");
  shaderProgram3.MVPmatrix = gl.getUniformLocation(shaderProgram3, "uMVP");


  //////////////// Fragment Shader 4 ///////////////////////
  // Compile fragment shader
  var fragmentShader4 = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader4, fragmentSource4);
  gl.compileShader(fragmentShader4);
  if (!gl.getShaderParameter(fragmentShader4, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader4)); return null;
  }

  // Attach the shaders and link
  var shaderProgram4 = gl.createProgram();
  gl.attachShader(shaderProgram4, vertexShader);
  gl.attachShader(shaderProgram4, fragmentShader4);
  gl.linkProgram(shaderProgram4);
  if (!gl.getProgramParameter(shaderProgram4, gl.LINK_STATUS)) {
    alert("Could not initialize shaders");
  }


  // with the vertex shader, we need to pass it positions
  // as an attribute - so set up that communication
  shaderProgram4.PositionAttribute = gl.getAttribLocation(shaderProgram4, "vPosition");
  gl.enableVertexAttribArray(shaderProgram4.PositionAttribute);

  shaderProgram4.NormalAttribute = gl.getAttribLocation(shaderProgram4, "vNormal");
  gl.enableVertexAttribArray(shaderProgram4.NormalAttribute);

  // shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
  // gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);

  // this gives us access to the matrix uniform
  shaderProgram4.MVmatrix = gl.getUniformLocation(shaderProgram4, "uMV");
  shaderProgram4.MVNormalmatrix = gl.getUniformLocation(shaderProgram4, "uMVn");
  shaderProgram4.MVPmatrix = gl.getUniformLocation(shaderProgram4, "uMVP");

  
  //////////////// Fragment Shader 5 ///////////////////////
  // Compile fragment shader
  var fragmentShader5 = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader5, fragmentSource5);
  gl.compileShader(fragmentShader5);
  if (!gl.getShaderParameter(fragmentShader5, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader5)); return null;
  }

  // Attach the shaders and link
  var shaderProgram5 = gl.createProgram();
  gl.attachShader(shaderProgram5, vertexShader);
  gl.attachShader(shaderProgram5, fragmentShader5);
  gl.linkProgram(shaderProgram5);
  if (!gl.getProgramParameter(shaderProgram5, gl.LINK_STATUS)) {
    alert("Could not initialize shaders");
  }


  // with the vertex shader, we need to pass it positions
  // as an attribute - so set up that communication
  shaderProgram5.PositionAttribute = gl.getAttribLocation(shaderProgram5, "vPosition");
  gl.enableVertexAttribArray(shaderProgram5.PositionAttribute);

  shaderProgram5.NormalAttribute = gl.getAttribLocation(shaderProgram5, "vNormal");
  gl.enableVertexAttribArray(shaderProgram5.NormalAttribute);

  // shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
  // gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);

  // this gives us access to the matrix uniform
  shaderProgram5.MVmatrix = gl.getUniformLocation(shaderProgram5, "uMV");
  shaderProgram5.MVNormalmatrix = gl.getUniformLocation(shaderProgram5, "uMVn");
  shaderProgram5.MVPmatrix = gl.getUniformLocation(shaderProgram5, "uMVP");

  //////////////// Fragment Shader 6 ///////////////////////
  // Compile fragment shader
  var fragmentShader6 = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader6, fragmentSource6);
  gl.compileShader(fragmentShader6);
  if (!gl.getShaderParameter(fragmentShader6, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader6)); return null;
  }

  // Attach the shaders and link
  var shaderProgram6 = gl.createProgram();
  gl.attachShader(shaderProgram6, vertexShader);
  gl.attachShader(shaderProgram6, fragmentShader6);
  gl.linkProgram(shaderProgram6);
  if (!gl.getProgramParameter(shaderProgram6, gl.LINK_STATUS)) {
    alert("Could not initialize shaders");
  }


  // with the vertex shader, we need to pass it positions
  // as an attribute - so set up that communication
  shaderProgram6.PositionAttribute = gl.getAttribLocation(shaderProgram6, "vPosition");
  gl.enableVertexAttribArray(shaderProgram6.PositionAttribute);

  shaderProgram6.NormalAttribute = gl.getAttribLocation(shaderProgram6, "vNormal");
  gl.enableVertexAttribArray(shaderProgram6.NormalAttribute);

  // shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
  // gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);

  // this gives us access to the matrix uniform
  shaderProgram6.MVmatrix = gl.getUniformLocation(shaderProgram6, "uMV");
  shaderProgram6.MVNormalmatrix = gl.getUniformLocation(shaderProgram6, "uMVn");
  shaderProgram6.MVPmatrix = gl.getUniformLocation(shaderProgram6, "uMVP");
  




  ///////////////////// Spaceship /////////////////////
  var trianglePosBuffer_spaceship = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer_spaceship);
  gl.bufferData(gl.ARRAY_BUFFER, spaceship_model.vertexPos, gl.STATIC_DRAW);
  trianglePosBuffer_spaceship.itemSize = 3;
  trianglePosBuffer_spaceship.numItems = spaceship_model.vertexPos.length;

  // a buffer for normals
  var triangleNormalBuffer_spaceship = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer_spaceship);
  gl.bufferData(gl.ARRAY_BUFFER, spaceship_model.vertexNormals, gl.STATIC_DRAW);
  triangleNormalBuffer_spaceship.itemSize = 3;
  triangleNormalBuffer_spaceship.numItems = spaceship_model.vertexNormals.length;

  // a buffer for indices
  var indexBuffer_spaceship = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_spaceship);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, spaceship_model.triangleIndices, gl.STATIC_DRAW);

  /////////////////// Sphere ///////////////////////////
  var trianglePosBuffer_sphere = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer_sphere);
  gl.bufferData(gl.ARRAY_BUFFER, sphere_model.vertexPos, gl.STATIC_DRAW);
  trianglePosBuffer_sphere.itemSize = 3;
  trianglePosBuffer_sphere.numItems = sphere_model.vertexPos.length;

  // a buffer for normals
  var triangleNormalBuffer_sphere = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer_sphere);
  gl.bufferData(gl.ARRAY_BUFFER, sphere_model.vertexNormals, gl.STATIC_DRAW);
  triangleNormalBuffer_sphere.itemSize = 3;
  triangleNormalBuffer_sphere.numItems = sphere_model.vertexNormals.length;

  // a buffer for indices
  var indexBuffer_sphere = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_sphere);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere_model.triangleIndices, gl.STATIC_DRAW);



  

  // Scene (re-)draw routine
  function draw() {
    var bank_angle = bank * 0.01 * Math.PI;   // Bank angle (could be used for tilting camera)

    var direction_angle = direction * 0.01 * Math.PI;  // Direction angle (for movement around the spaceship)

    var distance = 400;  // Fixed distance from the spaceship (adjust as needed)

    // Update eye position so the camera follows the spaceship
    var eye = [
        spaceship_location[0] + distance * Math.sin(direction_angle),  // x: based on direction
        slider1.value,  // y: fixed height (can adjust for different heights)
        spaceship_location[2] + distance * Math.cos(direction_angle)  // z: based on direction
    ];

    // Target the spaceship's location
    var target = spaceship_location;
    var up = [0, 1, 0];

    ///// Experimenting with different ups, but this makes it super disorienting /////
    // if(bank % 200 < -10 && bank % 200 > -50) {
    //   up = [0.1, 1, 0];
    // }

    // if(bank % 200 > 10 && bank % 200 < 50) {
    //   up = [-0.1, 1, 0];
    // }

    // var up = [Math.min((bank / 2)/ ((bank/2) + 1), 0.5), 1, 0];
    // var up = [Math.sin(bank_angle), Math.cos(bank_angle), 0]

    function draw_spaceship() {
      gl.useProgram(shaderProgram1);
      var tModel = mat4.create();
      mat4.translate(tModel, tModel, spaceship_location);
      // set up camera transform
      var tCamera = mat4.create();
      mat4.lookAt(tCamera, eye, target, up);
      // make our coord system bigger/smaller
      // Draw spaceship
      s = 1;
      // mat4.fromScaling(tModel, [s, s, s]);
      mat4.rotate(tModel, tModel, direction_angle, [0, 1, 0]);
      mat4.rotate(tModel, tModel, bank_angle, [0, 0, 1]);
      // set up projection transform
      var tProjection = mat4.create();
      mat4.perspective(tProjection, Math.PI / 4, 1, 100, 10000);

      var tMV = mat4.create();
      var tMVn = mat3.create();
      var tMVP = mat4.create();
      mat4.multiply(tMV, tCamera, tModel); // "modelView" matrix
      mat3.normalFromMat4(tMVn, tMV);
      mat4.multiply(tMVP, tProjection, tMV);

      // Set up uniforms & attributes
      gl.uniformMatrix4fv(shaderProgram1.MVmatrix, false, tMV);
      gl.uniformMatrix3fv(shaderProgram1.MVNormalmatrix, false, tMVn);
      gl.uniformMatrix4fv(shaderProgram1.MVPmatrix, false, tMVP);

      gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer_spaceship);
      gl.vertexAttribPointer(shaderProgram1.PositionAttribute, trianglePosBuffer_spaceship.itemSize,
        gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer_spaceship);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_spaceship);
      gl.vertexAttribPointer(shaderProgram1.NormalAttribute, triangleNormalBuffer_spaceship.itemSize,
        gl.FLOAT, false, 0, 0);

      // Do the drawing
      gl.drawElements(gl.TRIANGLES, spaceship_model.triangleIndices.length, triangleIndexSize_spaceship, 0);
    }


    function draw_sphere2(positionx, positiony, positionz, size) {
      gl.useProgram(shaderProgram2);
      // set up camera transform
      var tCamera = mat4.create();
      mat4.lookAt(tCamera, eye, target, up);
      var tModel = mat4.create();
      w = sphere_model.bboxMax[0] - sphere_model.bboxMin[0]
      h = sphere_model.bboxMax[1] - sphere_model.bboxMin[1]
      d = sphere_model.bboxMax[2] - sphere_model.bboxMin[2]
      s = size
      mat4.fromScaling(tModel, [s, s, s]);
      mat4.translate(tModel, tModel, [positionx/s, positiony / s, positionz/s])


      // set up projection transform
      var tProjection = mat4.create();
      mat4.perspective(tProjection, Math.PI / 4, 1, 100, 10000);

      var tMV = mat4.create();
      var tMVn = mat3.create();
      var tMVP = mat4.create();
      mat4.multiply(tMV, tCamera, tModel); // "modelView" matrix
      mat3.normalFromMat4(tMVn, tMV);
      mat4.multiply(tMVP, tProjection, tMV);

      // Set up uniforms & attributes
      gl.uniformMatrix4fv(shaderProgram2.MVmatrix, false, tMV);
      gl.uniformMatrix3fv(shaderProgram2.MVNormalmatrix, false, tMVn);
      gl.uniformMatrix4fv(shaderProgram2.MVPmatrix, false, tMVP);

      gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer_sphere);
      gl.vertexAttribPointer(shaderProgram2.PositionAttribute, trianglePosBuffer_sphere.itemSize,
        gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer_sphere);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_sphere);
      gl.vertexAttribPointer(shaderProgram2.NormalAttribute, triangleNormalBuffer_sphere.itemSize,
        gl.FLOAT, false, 0, 0);

      // Do the drawing
      gl.drawElements(gl.TRIANGLES, sphere_model.triangleIndices.length, triangleIndexSize_sphere, 0);
    }

    function draw_sphere3(positionx, positiony, positionz, size) {
      gl.useProgram(shaderProgram3);
      // set up camera transform
      var tCamera = mat4.create();
      mat4.lookAt(tCamera, eye, target, up);
      var tModel = mat4.create();
      w = sphere_model.bboxMax[0] - sphere_model.bboxMin[0]
      h = sphere_model.bboxMax[1] - sphere_model.bboxMin[1]
      d = sphere_model.bboxMax[2] - sphere_model.bboxMin[2]
      s = size
      mat4.fromScaling(tModel, [s, s, s]);
      mat4.translate(tModel, tModel, [positionx/s, positiony / s, positionz/s])


      // set up projection transform
      var tProjection = mat4.create();
      mat4.perspective(tProjection, Math.PI / 4, 1, 100, 10000);

      var tMV = mat4.create();
      var tMVn = mat3.create();
      var tMVP = mat4.create();
      mat4.multiply(tMV, tCamera, tModel); // "modelView" matrix
      mat3.normalFromMat4(tMVn, tMV);
      mat4.multiply(tMVP, tProjection, tMV);

      // Set up uniforms & attributes
      gl.uniformMatrix4fv(shaderProgram3.MVmatrix, false, tMV);
      gl.uniformMatrix3fv(shaderProgram3.MVNormalmatrix, false, tMVn);
      gl.uniformMatrix4fv(shaderProgram3.MVPmatrix, false, tMVP);

      gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer_sphere);
      gl.vertexAttribPointer(shaderProgram3.PositionAttribute, trianglePosBuffer_sphere.itemSize,
        gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer_sphere);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_sphere);
      gl.vertexAttribPointer(shaderProgram3.NormalAttribute, triangleNormalBuffer_sphere.itemSize,
        gl.FLOAT, false, 0, 0);

      // Do the drawing
      gl.drawElements(gl.TRIANGLES, sphere_model.triangleIndices.length, triangleIndexSize_sphere, 0);
    }

    function draw_sphere4(positionx, positiony, positionz, size) {
      gl.useProgram(shaderProgram4);
      // set up camera transform
      var tCamera = mat4.create();
      mat4.lookAt(tCamera, eye, target, up);
      var tModel = mat4.create();
      w = sphere_model.bboxMax[0] - sphere_model.bboxMin[0]
      h = sphere_model.bboxMax[1] - sphere_model.bboxMin[1]
      d = sphere_model.bboxMax[2] - sphere_model.bboxMin[2]
      s = size
      mat4.fromScaling(tModel, [s, s, s]);
      mat4.translate(tModel, tModel, [positionx/s, positiony / s, positionz/s])


      // set up projection transform
      var tProjection = mat4.create();
      mat4.perspective(tProjection, Math.PI / 4, 1, 100, 10000);

      var tMV = mat4.create();
      var tMVn = mat3.create();
      var tMVP = mat4.create();
      mat4.multiply(tMV, tCamera, tModel); // "modelView" matrix
      mat3.normalFromMat4(tMVn, tMV);
      mat4.multiply(tMVP, tProjection, tMV);

      // Set up uniforms & attributes
      gl.uniformMatrix4fv(shaderProgram4.MVmatrix, false, tMV);
      gl.uniformMatrix3fv(shaderProgram4.MVNormalmatrix, false, tMVn);
      gl.uniformMatrix4fv(shaderProgram4.MVPmatrix, false, tMVP);

      gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer_sphere);
      gl.vertexAttribPointer(shaderProgram4.PositionAttribute, trianglePosBuffer_sphere.itemSize,
        gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer_sphere);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_sphere);
      gl.vertexAttribPointer(shaderProgram4.NormalAttribute, triangleNormalBuffer_sphere.itemSize,
        gl.FLOAT, false, 0, 0);

      // Do the drawing
      gl.drawElements(gl.TRIANGLES, sphere_model.triangleIndices.length, triangleIndexSize_sphere, 0);
    }
    function draw_sphere5(positionx, positiony, positionz, size) {
      gl.useProgram(shaderProgram5);
      // set up camera transform
      var tCamera = mat4.create();
      mat4.lookAt(tCamera, eye, target, up);
      var tModel = mat4.create();
      w = sphere_model.bboxMax[0] - sphere_model.bboxMin[0]
      h = sphere_model.bboxMax[1] - sphere_model.bboxMin[1]
      d = sphere_model.bboxMax[2] - sphere_model.bboxMin[2]
      s = size
      mat4.fromScaling(tModel, [s, s, s]);
      mat4.translate(tModel, tModel, [positionx/s, positiony / s, positionz/s])


      // set up projection transform
      var tProjection = mat4.create();
      mat4.perspective(tProjection, Math.PI / 4, 1, 100, 10000);

      var tMV = mat4.create();
      var tMVn = mat3.create();
      var tMVP = mat4.create();
      mat4.multiply(tMV, tCamera, tModel); // "modelView" matrix
      mat3.normalFromMat4(tMVn, tMV);
      mat4.multiply(tMVP, tProjection, tMV);

      // Set up uniforms & attributes
      gl.uniformMatrix4fv(shaderProgram5.MVmatrix, false, tMV);
      gl.uniformMatrix3fv(shaderProgram5.MVNormalmatrix, false, tMVn);
      gl.uniformMatrix4fv(shaderProgram5.MVPmatrix, false, tMVP);

      gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer_sphere);
      gl.vertexAttribPointer(shaderProgram5.PositionAttribute, trianglePosBuffer_sphere.itemSize,
        gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer_sphere);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_sphere);
      gl.vertexAttribPointer(shaderProgram5.NormalAttribute, triangleNormalBuffer_sphere.itemSize,
        gl.FLOAT, false, 0, 0);

      // Do the drawing
      gl.drawElements(gl.TRIANGLES, sphere_model.triangleIndices.length, triangleIndexSize_sphere, 0);
    }

    function draw_sphere6(positionx, positiony, positionz, size) {
      gl.useProgram(shaderProgram6);
      // set up camera transform
      var tCamera = mat4.create();
      mat4.lookAt(tCamera, eye, target, up);
      var tModel = mat4.create();
      w = sphere_model.bboxMax[0] - sphere_model.bboxMin[0]
      h = sphere_model.bboxMax[1] - sphere_model.bboxMin[1]
      d = sphere_model.bboxMax[2] - sphere_model.bboxMin[2]
      s = size
      mat4.fromScaling(tModel, [s, s, s]);
      mat4.translate(tModel, tModel, [positionx/s, positiony / s, positionz/s])


      // set up projection transform
      var tProjection = mat4.create();
      mat4.perspective(tProjection, Math.PI / 4, 1, 100, 10000);

      var tMV = mat4.create();
      var tMVn = mat3.create();
      var tMVP = mat4.create();
      mat4.multiply(tMV, tCamera, tModel); // "modelView" matrix
      mat3.normalFromMat4(tMVn, tMV);
      mat4.multiply(tMVP, tProjection, tMV);

      // Set up uniforms & attributes
      gl.uniformMatrix4fv(shaderProgram6.MVmatrix, false, tMV);
      gl.uniformMatrix3fv(shaderProgram6.MVNormalmatrix, false, tMVn);
      gl.uniformMatrix4fv(shaderProgram6.MVPmatrix, false, tMVP);

      gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer_sphere);
      gl.vertexAttribPointer(shaderProgram6.PositionAttribute, trianglePosBuffer_sphere.itemSize,
        gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer_sphere);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_sphere);
      gl.vertexAttribPointer(shaderProgram6.NormalAttribute, triangleNormalBuffer_sphere.itemSize,
        gl.FLOAT, false, 0, 0);

      // Do the drawing
      gl.drawElements(gl.TRIANGLES, sphere_model.triangleIndices.length, triangleIndexSize_sphere, 0);
    }

    /////////////////// Animate spheres /////////////////
    function animate_spheres(centerX, centerY, centerZ, time) {
      // Central position
  
      // Sphere 1: Orbiting in the X-Y plane
      const sphere1X = centerX + 90 * Math.cos(time * 0.01);
      const sphere1Y = centerY + 90 * Math.sin(time * 0.01);
      const sphere1Z = centerZ;
      draw_sphere4(sphere1X, sphere1Y, sphere1Z, 20);
  
      // Sphere 2: Orbiting in the Y-Z plane
      const sphere2X = centerX;
      const sphere2Y = centerY + 80 * Math.cos(time * 0.015);
      const sphere2Z = centerZ + 80 * Math.sin(time * 0.015);
      draw_sphere4(sphere2X, sphere2Y, sphere2Z, 10);
  
      // Sphere 3: Orbiting in the X-Z plane
      const sphere3X = centerX + 100 * Math.cos(time * 0.02);
      const sphere3Y = centerY;
      const sphere3Z = centerZ + 100 * Math.sin(time * 0.02);
      draw_sphere4(sphere3X, sphere3Y, sphere3Z, 10);
  }

  function animate_spheres2(centerX, centerY, centerZ, time) {
    // Central position

    // Sphere 1: Orbiting in the X-Y plane
    const sphere1X = centerX + 80 * Math.cos(time * 0.04);
    const sphere1Y = centerY + 80 * Math.sin(time * 0.04);
    const sphere1Z = centerZ;
    draw_sphere4(sphere1X, sphere1Y, sphere1Z, 15);

    // Sphere 2: Orbiting in the Y-Z plane
    // const sphere2X = centerX;
    // const sphere2Y = centerY + 80 * Math.cos(time * 0.035);
    // const sphere2Z = centerZ + 80 * Math.sin(time * 0.035);
    // draw_sphere4(sphere2X, sphere2Y, sphere2Z, 10);

    // Sphere 3: Orbiting in the X-Z plane
    const sphere3X = centerX + 96 * Math.cos(time * 0.03);
    const sphere3Y = centerY;
    const sphere3Z = centerZ + 96 * Math.sin(time * 0.03);
    draw_sphere4(sphere3X, sphere3Y, sphere3Z, 10);
}
  



    ////////////////// Draw code //////////////////
    // Clear screen, prepare for rendering
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // draw_sphere(100, 0, -50, 60)
    // draw_sphere(0, 0, 100, 60)
    // draw_sphere(-200, 0, -100, 40)
    draw_spaceship()

    // Cluster
    centerX = -400 * Math.cos(time * 0.002);
    centerY = 0;
    centerZ = 400 * Math.sin(time * 0.002);
    draw_sphere2(centerX, centerY, centerZ, 50)
    animate_spheres(centerX, centerY, centerZ, time)

    // Pair
    centerX = -600 * Math.cos((time + 300) * 0.004);
    centerY = 0;
    centerZ = -600 * Math.sin((time + 300) * 0.004);
    draw_sphere5(centerX, centerY, centerZ, 50)
    animate_spheres2(centerX, centerY, centerZ, time)

    // Distant pair
    centerX = -1100 * Math.cos((time + 400) * 0.001);
    centerY = 0;
    centerZ = -1100 * Math.sin((time + 400) * 0.001);
    draw_sphere6(centerX, centerY, centerZ, 80)
    animate_spheres(centerX, centerY, centerZ, time)


    // Distant Cluster
    centerX = -1400 * Math.cos(time * 0.002);
    centerY = 0;
    centerZ = 1400 * Math.sin(time * 0.002);
    draw_sphere3(centerX, centerY, centerZ, 80)
    animate_spheres(centerX, centerY, centerZ, time)







    draw_sphere3(0, 0, 0, 150)

  }

  slider1.addEventListener("input", draw);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'w') { 
    //  slider2.value++;
      bank += 2;
      draw();
    } else if (event.key === 's') {
      // slider2.value--;
      bank -= 2;
      draw();
    } else if (event.key === 'a') {
      direction += 0.5
      if(bank % 200 < 50 && bank % 200 > 0) {
        direction += 1.5
      }
      draw();
    } else if (event.key === 'd') {
      direction -= 0.5
      if((bank % 200) < 0 && (bank % 200 > -50)) {
        direction -= 1.5
      }
      draw();
    }
    if (event.code === 'Space') { 
      speed = 10
      var direction_angle = direction * 0.01 * Math.PI; 
      spaceship_location[0] -= Math.sin(direction_angle) * speed;
      spaceship_location[2] -= Math.cos(direction_angle) * speed;
      draw();
     }
  });

  slider1.addEventListener("input", draw);

  function animate() {
		draw();
		time += 1
		requestAnimationFrame(animate);
	}

  animate();
}

window.onload = start;
