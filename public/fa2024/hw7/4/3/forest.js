// Get canvas, WebGL context
var canvas = document.getElementById("mycanvas");
var gl = canvas.getContext("webgl"); // webgl context
var crazy = false;
function crazyMode() {
  crazy = !crazy;
}

function start() {
  // positions for the trees
  var xPos = [1, -10, 8, 8, -6, 10, -10, -4]; 
  var zPos = [4, -6, -9, -6, 5, -19, 7, 16]; 
  var rotationAngles = []; // random angles of rotation for the trees
  // way to generate random num found on stack overflow
  for(i = 0; i < 8; i++) {
    var randomAngle = Math.random() * 2 * Math.PI;
    rotationAngles.push(randomAngle);
  }

  var angle1 = 0; // angle for bird
  var posOffset = 0; // movement var for deer
  // deer movement logic
  var hitLeft = false;
  var hitRight = true;

  function drawBird(cameraMatrix) {
    // Read shader source
    var vertexSource = document.getElementById("vShdrBird").text;
    var fragmentSource;
    if(crazy) {
      fragmentSource = document.getElementById("fShdrCrazy").text;
    }
    else {
      fragmentSource = document.getElementById("fShdrBird").text;
    }

    // Compile vertex shader
    var vShdrBird = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShdrBird, vertexSource);
    gl.compileShader(vShdrBird);
    if (!gl.getShaderParameter(vShdrBird, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(vShdrBird)); return null;
    }

    // Compile fragment shader
    var fShdrBird = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShdrBird, fragmentSource);
    gl.compileShader(fShdrBird);
    if (!gl.getShaderParameter(fShdrBird, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(fShdrBird)); return null;
    }

    // Attach the shaders and link
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vShdrBird);
    gl.attachShader(shaderProgram, fShdrBird);
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

    if(crazy) {
      const timeLocation = gl.getUniformLocation(shaderProgram, 'time');
      function animate() {
        requestAnimationFrame(animate);
   
        let time = performance.now() / 1000;
        gl.uniform1f(timeLocation, time);
      }
      animate();
     }

    // this gives us access to the matrix uniform
    shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram, "uMV");
    shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram, "uMVn");
    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram, "uMVP");
    
    // set bird_obj to reference the model name defined 
    // in the other included script
    var bird_obj = bird_model;

    // initialize a variable that contains the proper gl enum for the 
    // size of our triangle index elements
    var triangleIndexSize = gl.UNSIGNED_INT;
    switch (bird_obj.triangleIndices.BYTES_PER_ELEMENT) {
      case 1:
        triangleIndexSize = gl.UNSIGNED_BYTE;
        break;
      case 2:
        triangleIndexSize = gl.UNSIGNED_SHORT;
        break;
      case 4:
        // for uint32, we have to enable the extension that allows uint32 as triangle indices
        gl.getExtension('OES_element_index_uint');
        triangleIndexSize = gl.UNSIGNED_INT;
        break;
      default:
        throw new Error('unknown triangle index element size');
    }

    // we need to put the vertices into a buffer so we can
    // block transfer them to the graphics hardware
    var trianglePosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bird_obj.vertexPos, gl.STATIC_DRAW);
    trianglePosBuffer.itemSize = 3;
    trianglePosBuffer.numItems = bird_obj.vertexPos.length;

    // a buffer for normals
    var triangleNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bird_obj.vertexNormals, gl.STATIC_DRAW);
    triangleNormalBuffer.itemSize = 3;
    triangleNormalBuffer.numItems = bird_obj.vertexNormals.length;

    // a buffer for indices
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bird_obj.triangleIndices, gl.STATIC_DRAW);

    angle1 += 0.01;

    // bird lookAt transform variables
    var eye = [330 * Math.sin(angle1), 150.0, 330.0 * Math.cos(angle1)];
    var target = [0, 0, 0];
    var up = [0, 1, 0];

    // set up model transform
    // with its center at the origin of the wcs
    w = bird_obj.bboxMax[0] - bird_obj.bboxMin[0]
    h = bird_obj.bboxMax[1] - bird_obj.bboxMin[1]
    d = bird_obj.bboxMax[2] - bird_obj.bboxMin[2]
    s = 300 / Math.max(w, h, d);
    // scale coordinate system
    var tModel = mat4.create();
    mat4.fromScaling(tModel, [s, s, s])
    // rotate and translate the bird model
    mat4.fromTranslation(tModel, [100, 80, 0]);
    mat4.rotate(tModel, tModel, .5, [w, h, d]);

    // set up camera transform
    var tCamera = mat4.create();
    mat4.lookAt(tCamera, eye, target, up);

    // set up projection transform
    var tProjection = mat4.create();
    mat4.perspective(tProjection, Math.PI / 4, 1, 10, 1000);

    var tMV = mat4.create();
    var tMVn = mat3.create();
    var tMVP = mat4.create();
    mat4.multiply(tMV, tCamera, tModel); // "modelView" matrix
    mat3.normalFromMat4(tMVn, tMV);
    mat4.multiply(tMVP, tProjection, tMV);


    // Clear screen, prepare for rendering
    if(crazy) {
      gl.clearColor(0, 0, 0, 1.0);
    }
    else {
      gl.clearColor(0.14, 0.26, 0.12, 1.0);
    }
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up uniforms & attributes
    gl.uniformMatrix4fv(shaderProgram.MVmatrix, false, tMV);
    gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix, false, tMVn);
    gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);

    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
      gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.NormalAttribute, triangleNormalBuffer.itemSize,
      gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, bird_obj.triangleIndices.length, triangleIndexSize, 0);
  }

  function drawTrunk(pos, cameraMatrix, angle) {
    // Read shader source
    var vertexSource = document.getElementById("vShdrTrunk").text;
    var fragmentSource2;
    if(crazy) {
      fragmentSource2 = document.getElementById("fShdrCrazy").text;
    }
    else {
      fragmentSource2 = document.getElementById("fShdrTrunk").text;
    }

    // Compile vertex shader
    var vShdrTrunk = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShdrTrunk, vertexSource);
    gl.compileShader(vShdrTrunk);
    if (!gl.getShaderParameter(vShdrTrunk, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(vShdrTrunk)); return null;
    }

    // Compile fragment shader
    var fShdrTrunk = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShdrTrunk, fragmentSource2);
    gl.compileShader(fShdrTrunk);
    if (!gl.getShaderParameter(fShdrTrunk, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(fShdrTrunk)); return null;
    }

    // Attach the shaders and link
    var shaderProgramTrunk = gl.createProgram();
    gl.attachShader(shaderProgramTrunk, vShdrTrunk);
    gl.attachShader(shaderProgramTrunk, fShdrTrunk);
    gl.linkProgram(shaderProgramTrunk);
    if (!gl.getProgramParameter(shaderProgramTrunk, gl.LINK_STATUS)) {
      alert("Could not initialize shaders");
    }
    gl.useProgram(shaderProgramTrunk);

    // with the vertex shader, we need to pass it positions
    // as an attribute - so set up that communication
    shaderProgramTrunk.PositionAttribute = gl.getAttribLocation(shaderProgramTrunk, "vPosition");
    gl.enableVertexAttribArray(shaderProgramTrunk.PositionAttribute);

    shaderProgramTrunk.NormalAttribute = gl.getAttribLocation(shaderProgramTrunk, "vNormal");
    gl.enableVertexAttribArray(shaderProgramTrunk.NormalAttribute);
    
    if(crazy) {
      const timeLocation = gl.getUniformLocation(shaderProgramTrunk, 'time');
      function animate() {
        requestAnimationFrame(animate);
        let time = performance.now() / 1000; 
        gl.uniform1f(timeLocation, time); 
      }
      animate();
    }
    

    // this gives us access to the matrix uniform
    shaderProgramTrunk.MVmatrix = gl.getUniformLocation(shaderProgramTrunk, "uMV");
    shaderProgramTrunk.MVNormalmatrix = gl.getUniformLocation(shaderProgramTrunk, "uMVn");
    shaderProgramTrunk.MVPmatrix = gl.getUniformLocation(shaderProgramTrunk, "uMVP");
    var trunk_obj = trunk_model;

    var triangleIndexSize = gl.UNSIGNED_INT;
    switch (trunk_obj.triangleIndices.BYTES_PER_ELEMENT) {
      case 1:
        triangleIndexSize = gl.UNSIGNED_BYTE;
        break;
      case 2:
        triangleIndexSize = gl.UNSIGNED_SHORT;
        break;
      case 4:
        // for uint32, we have to enable the extension that allows uint32 as triangle indices
        gl.getExtension('OES_element_index_uint');
        triangleIndexSize = gl.UNSIGNED_INT;
        break;
      default:
        throw new Error('unknown triangle index element size');
    }

    // we need to put the vertices into a buffer so we can
    // block transfer them to the graphics hardware
    var trianglePosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, trunk_obj.vertexPos, gl.STATIC_DRAW);
    trianglePosBuffer.itemSize = 3;
    trianglePosBuffer.numItems = trunk_obj.vertexPos.length;

    // a buffer for normals
    var triangleNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, trunk_obj.vertexNormals, gl.STATIC_DRAW);
    triangleNormalBuffer.itemSize = 3;
    triangleNormalBuffer.numItems = trunk_obj.vertexNormals.length;

    // a buffer for indices
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, trunk_obj.triangleIndices, gl.STATIC_DRAW);

    // set up model transform
    // with its center at the origin of the wcs
    w = trunk_obj.bboxMax[0] - trunk_obj.bboxMin[0]
    h = trunk_obj.bboxMax[1] - trunk_obj.bboxMin[1]
    d = trunk_obj.bboxMax[2] - trunk_obj.bboxMin[2]
    s = 50 / Math.max(w, h, d);
    // scale coordinate system
    var tModel = mat4.create();
    mat4.fromScaling(tModel, [s, s, s])

    // translate coord system so model center is at wcs origin
    offset = [
      -(trunk_obj.bboxMax[0] + trunk_obj.bboxMin[0]) / 2,
      -(trunk_obj.bboxMax[1] + trunk_obj.bboxMin[1]) / 2,
      -(trunk_obj.bboxMax[2] + trunk_obj.bboxMin[2]) / 2];
    mat4.translate(tModel, tModel, offset);
    mat4.translate(tModel, tModel, pos);
    mat4.rotate(tModel, tModel, angle, [0,1,0]);

    // set up projection transform
    var tProjection = mat4.create();
    mat4.perspective(tProjection, Math.PI / 4, 1, 10, 1000);

    var tMV = mat4.create();
    var tMVn = mat3.create();
    var tMVP = mat4.create();
    mat4.multiply(tMV, cameraMatrix, tModel); // "modelView" matrix
    mat3.normalFromMat4(tMVn, tMV);
    mat4.multiply(tMVP, tProjection, tMV);

    // Set up uniforms & attributes
    gl.uniformMatrix4fv(shaderProgramTrunk.MVmatrix, false, tMV);
    gl.uniformMatrix3fv(shaderProgramTrunk.MVNormalmatrix, false, tMVn);
    gl.uniformMatrix4fv(shaderProgramTrunk.MVPmatrix, false, tMVP);

    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.vertexAttribPointer(shaderProgramTrunk.PositionAttribute, trianglePosBuffer.itemSize,
      gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
    gl.vertexAttribPointer(shaderProgramTrunk.NormalAttribute, triangleNormalBuffer.itemSize,
      gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, trunk_obj.triangleIndices.length, triangleIndexSize, 0);
  }

  function drawDeer(cameraMatrix) {
   // Read shader source
   var vertexSource = document.getElementById("vShdrTrunk").text;
   var fragmentSource2;
   if(crazy) {
    fragmentSource2 = document.getElementById("fShdrCrazy").text;
   }
   else {
    fragmentSource2 = document.getElementById("fShdrTrunk").text;
   }

   // Compile vertex shader
   var vShdrTrunk = gl.createShader(gl.VERTEX_SHADER);
   gl.shaderSource(vShdrTrunk, vertexSource);
   gl.compileShader(vShdrTrunk);
   if (!gl.getShaderParameter(vShdrTrunk, gl.COMPILE_STATUS)) {
     alert(gl.getShaderInfoLog(vShdrTrunk)); return null;
   }

   // Compile fragment shader
   var fShdrTrunk = gl.createShader(gl.FRAGMENT_SHADER);
   gl.shaderSource(fShdrTrunk, fragmentSource2);
   gl.compileShader(fShdrTrunk);
   if (!gl.getShaderParameter(fShdrTrunk, gl.COMPILE_STATUS)) {
     alert(gl.getShaderInfoLog(fShdrTrunk)); return null;
   }

   // Attach the shaders and link
   var shaderProgramTrunk = gl.createProgram();
   gl.attachShader(shaderProgramTrunk, vShdrTrunk);
   gl.attachShader(shaderProgramTrunk, fShdrTrunk);
   gl.linkProgram(shaderProgramTrunk);
   if (!gl.getProgramParameter(shaderProgramTrunk, gl.LINK_STATUS)) {
     alert("Could not initialize shaders");
   }
   gl.useProgram(shaderProgramTrunk);

   // with the vertex shader, we need to pass it positions
   // as an attribute - so set up that communication
   shaderProgramTrunk.PositionAttribute = gl.getAttribLocation(shaderProgramTrunk, "vPosition");
   gl.enableVertexAttribArray(shaderProgramTrunk.PositionAttribute);

   shaderProgramTrunk.NormalAttribute = gl.getAttribLocation(shaderProgramTrunk, "vNormal");
   gl.enableVertexAttribArray(shaderProgramTrunk.NormalAttribute);

   if(crazy) {
    const timeLocation = gl.getUniformLocation(shaderProgramTrunk, 'time');
    function animate() {
      requestAnimationFrame(animate);
      let time = performance.now() / 1000; 
      gl.uniform1f(timeLocation, time); 
     }
    animate();
   }
   
   // this gives us access to the matrix uniform
   shaderProgramTrunk.MVmatrix = gl.getUniformLocation(shaderProgramTrunk, "uMV");
   shaderProgramTrunk.MVNormalmatrix = gl.getUniformLocation(shaderProgramTrunk, "uMVn");
   shaderProgramTrunk.MVPmatrix = gl.getUniformLocation(shaderProgramTrunk, "uMVP");
   var deer_obj = deer_model;

   var triangleIndexSize = gl.UNSIGNED_INT;
   switch (deer_obj.triangleIndices.BYTES_PER_ELEMENT) {
     case 1:
       triangleIndexSize = gl.UNSIGNED_BYTE;
       break;
     case 2:
       triangleIndexSize = gl.UNSIGNED_SHORT;
       break;
     case 4:
       // for uint32, we have to enable the extension that allows uint32 as triangle indices
       gl.getExtension('OES_element_index_uint');
       triangleIndexSize = gl.UNSIGNED_INT;
       break;
     default:
       throw new Error('unknown triangle index element size');
   }

   // we need to put the vertices into a buffer so we can
   // block transfer them to the graphics hardware
   var trianglePosBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, deer_obj.vertexPos, gl.STATIC_DRAW);
   trianglePosBuffer.itemSize = 3;
   trianglePosBuffer.numItems = deer_obj.vertexPos.length;

   // a buffer for normals
   var triangleNormalBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, deer_obj.vertexNormals, gl.STATIC_DRAW);
   triangleNormalBuffer.itemSize = 3;
   triangleNormalBuffer.numItems = deer_obj.vertexNormals.length;

   // a buffer for indices
   var indexBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, deer_obj.triangleIndices, gl.STATIC_DRAW);

   // set up model transform
   // with its center at the origin of the wcs
   w = deer_obj.bboxMax[0] - deer_obj.bboxMin[0]
   h = deer_obj.bboxMax[1] - deer_obj.bboxMin[1]
   d = deer_obj.bboxMax[2] - deer_obj.bboxMin[2]
   s = 50 / Math.max(w, h, d);
   var tModel = mat4.create();
   mat4.fromScaling(tModel, [s, s, s]);

  if(hitRight) {
    posOffset += 0.01;
    mat4.translate(tModel, tModel, [-posOffset * 100, 5.0*Math.sin(-posOffset * 20), 0]);
    mat4.rotate(tModel, tModel, -Math.PI/2, [0,1,0]);
  }
  if(hitLeft) {
    posOffset -= 0.01;
    mat4.translate(tModel, tModel, [-posOffset * 100, 5.0*Math.sin(-posOffset*20), 0]);
    mat4.rotate(tModel, tModel, Math.PI/2, [0,1,0]);
    if(tModel[12] > 60) {
      hitLeft = false;
      hitRight = true;
    }
  }
  
  if(tModel[12] < -60) {
    hitLeft = true;
    hitRight = false;
  }

   // translate coord system so model center is at wcs origin
   offset = [
     -(deer_obj.bboxMax[0] + deer_obj.bboxMin[0]) / 2,
     -(deer_obj.bboxMax[1] + deer_obj.bboxMin[1]) / 2,
     -(deer_obj.bboxMax[2] + deer_obj.bboxMin[2]) / 2];
   mat4.translate(tModel, tModel, offset);

   // set up projection transform
   var tProjection = mat4.create();
   mat4.perspective(tProjection, Math.PI / 4, 1, 10, 1000);

   var tMV = mat4.create();
   var tMVn = mat3.create();
   var tMVP = mat4.create();
   mat4.multiply(tMV, cameraMatrix, tModel); // "modelView" matrix
   mat3.normalFromMat4(tMVn, tMV);
   mat4.multiply(tMVP, tProjection, tMV);

   // Set up uniforms & attributes
   gl.uniformMatrix4fv(shaderProgramTrunk.MVmatrix, false, tMV);
   gl.uniformMatrix3fv(shaderProgramTrunk.MVNormalmatrix, false, tMVn);
   gl.uniformMatrix4fv(shaderProgramTrunk.MVPmatrix, false, tMVP);

   gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
   gl.vertexAttribPointer(shaderProgramTrunk.PositionAttribute, trianglePosBuffer.itemSize,
     gl.FLOAT, false, 0, 0);
   gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
   gl.vertexAttribPointer(shaderProgramTrunk.NormalAttribute, triangleNormalBuffer.itemSize,
     gl.FLOAT, false, 0, 0);

   gl.drawElements(gl.TRIANGLES, deer_obj.triangleIndices.length, triangleIndexSize, 0);
 }

  var slider = document.getElementById('slider');
  var viewAngle = slider.value * 0.02 * Math.PI;
  slider.addEventListener('input', function() {
    viewAngle = slider.value * 0.02 * Math.PI;
  });

  function draw() {
    var CameraCurve = function(angle) {
      var distance = 350.0;
      var eye = vec3.create();
      eye[0] = distance*Math.sin(viewAngle);
      eye[1] = 100;
      eye[2] = distance*Math.cos(viewAngle); 
      return [eye[0],eye[1],eye[2]];
    }
    var eyeCamera = CameraCurve(viewAngle);
    var targetCamera = vec3.fromValues(0,0,0); 
    var upCamera = vec3.fromValues(0,1,0); 
    var tCamera = mat4.create();
    mat4.lookAt(tCamera, eyeCamera, targetCamera, upCamera);

    drawBird(tCamera);
    for(i = 0; i < 8; i++) {
      drawTrunk([xPos[i], 0, zPos[i]], tCamera, rotationAngles[i]);
    }
    drawDeer(tCamera);
    window.requestAnimationFrame(draw);
  }
  draw();
}

window.onload = start;
