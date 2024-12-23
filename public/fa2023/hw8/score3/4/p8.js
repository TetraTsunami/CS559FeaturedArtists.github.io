var val = 0;
var time = 0;
var temp = 0;
function start() {
  
  // Get canvas, WebGL context, twgl.m4
  var canvas = document.getElementById("mycanvas");
  var gl = canvas.getContext("webgl");

  // Sliders at center
  var slider1 = document.getElementById('slider1');
  slider1.value = 70;
  var slider2 = document.getElementById('slider2');
  slider2.value = 0;
  var slider3 = document.getElementById('slider3');
  slider3.value = 100;
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

  // Attach samplers to texture units
  shaderProgram.texSampler1 = gl.getUniformLocation(shaderProgram, "texSampler1");
  gl.uniform1i(shaderProgram.texSampler1, 0);
  shaderProgram.texSampler2 = gl.getUniformLocation(shaderProgram, "texSampler2");
  gl.uniform1i(shaderProgram.texSampler2, 1);

  // Data
  // vertex positions
  
  var vertexPos = new Float32Array(
      [  1, 0.5, 1,  -1, 0.5, 1,  0,-1, 0,   0,-1, 0, // 1 Traingles
         1, 0.5, 1,   0,-1, 0,   0,-1,0,   1, 0.5,-1,  // 2
         0.5, 1, 0.5,   0.5, 1,-0.5,  -0.5, 1,-0.5,  -0.5, 1, 0.5, // top of dia
        -1, 0.5, 1,  -1, 0.5,-1,  0,-1,0,  0,-1, 0, // 3
        -1,-1,-1,   1,0,-1,   1,0, 1,  -1,0, 1, // middle

         0,-1,0,  0,-1,0,  -1, 0.5,-1,   1, 0.5,-1,  // 4
       0.5,1,-0.5, 1,0.5,-1,  -1,0.5,-1, -0.5,1,-0.5,
         1,0.5,1,   1,0.5,-1,  0.5,1,-0.5, 0.5,1,0.5,
         1,0.5,1,   0.5,1,0.5, -0.5,1,0.5,  -1,0.5,1,
         -0.5,1,0.5,  -0.5,1,-0.5,  -1,0.5,-1, -1,0.5,1] 

      /*
      [  1, 0.7, 1,  -1, 0.7, 1,  0,-1, 0,   0,-1, 0, // 1
         1, 0.7, 1,   0,-1, 0,   0,-1,0,   1, 0.7,-1,  // 2
         0.7, 1, 0.7,   0.7, 1,-0.7,  -0.7, 1,-0.7,  -0.7, 1, 0.7, // top of dia makes it wider
        -1, 0.7, 1,  -1, 0.7,-1,  0,-1,0,  0,-1, 0, // 3
        -1,-1,-1,   1,0,-1,   1,0, 1,  -1,0, 1, // middle

         0,-1,0,  0,-1,0,  -1, 0.7,-1,   1, 0.7,-1,  // 4
       0.7,1,-0.7, 1,0.7,-1,  -1,0.7,-1, -0.7,1,-0.7,
         1,0.7,1,   1,0.7,-1,  0.7,1,-0.7, 0.7,1,0.7,
         1,0.7,1,   0.7,1,0.7, -0.7,1,0.7,  -1,0.7,1,
         -0.7,1,0.7,  -0.7,1,-0.7,  -1,0.7,-1, -1,0.7,1]
        */
         );
        
  // vertex normals
  var vertexNormals = new Float32Array(
      [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1, 
         1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0, 
         0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0, 
        -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0, 
         0,-1, 0,   0,-1, 0,   0,-1, 0,   0,-1, 0, 
         0, 0,-1,   0, 0,-1,   0, 0,-1,   0, 0,-1,
       0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
      0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
      0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
      0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,]);

  // vertex colors
  var vertexColors = new Float32Array(
      [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1, 
         1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
         0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
         1, 1, 0,   1, 1, 0,   1, 1, 0,   1, 1, 0,
         1, 0, 1,   1, 0, 1,   1, 0, 1,   1, 0, 1,
         0, 1, 1,   0, 1, 1,   0, 1, 1,   0, 1, 1,
         0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
         0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
         0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
         0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,]);
  
  // vertex texture coordinates
  var vertexTextureCoords = new Float32Array(
      [  0, 1.0,   0, 0,   0.5, 0.5,   0.5, 0.5, // 2    3,4
         0, 1.0,   0.5, 0.5,   0.5, 0.5,   1.0, 1.0, // 1    2,3
         0.75, 0.75,   0.25, 0.75,   0.25, 0.25,   0.75, 0.25, // top of dia
         0, 0,   1.0, 0,   0.5, 0.5,   0.5, 0.5, // 3    3,4 
         1.0, 1.0,   0, 1.0,   0, 0,   1.0, 0, // middle not important
         0.5, 0.5,   0.5, 0.5,   1.0, 0,   1.0, 1.0,  // 4   1,2
         0.25, 0.75,   0, 1.0,   0, 0,   0.25, 0.25, // left
         1.0, 1.0,   0, 1.0,   .25, 0.75,   0.75, 0.75, // upper
         1.0, 1.0,   0.75, 0.75,   0.75, 0.25,   1.0, 0, // right
         0.75, 0.25,   0.25, 0.25,   0.0, 0.0,   1.0, 0]); // bottom

  // element index array
  var triangleIndices = new Uint8Array(
      [  0, 1, 2,   0, 2, 3,    // front
         4, 5, 6,   4, 6, 7,    // right
         8, 9,10,   8,10,11,    // top
         12,13,14,  12,14,15,    // left
         //16,17,18,  16,18,19,    // bottom
         20,21,22,  20,22,23, 
         24,25,26, 24,26,27,
         28,29,30, 28,30,31,
         32,33,34, 32,34,35,
         36,37,38, 36,38,39]); // back

  // we need to put the vertices into a buffer so we can
  // block transfer them to the graphics hardware
  var trianglePosBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
  trianglePosBuffer.itemSize = 3;
  trianglePosBuffer.numItems = 36;

  // a buffer for normals
  var triangleNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
  triangleNormalBuffer.itemSize = 3;
  triangleNormalBuffer.numItems = 36;
  
  // a buffer for colors
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
  colorBuffer.itemSize = 3;
  colorBuffer.numItems = 36;

  // a buffer for textures
  var textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexTextureCoords, gl.STATIC_DRAW);
  textureBuffer.itemSize = 2;
  textureBuffer.numItems = 36;

  // a buffer for indices
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);    
/*
  var indexBuffer2 = gl.createBuffer(); // HUM
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer2);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices2, gl.STATIC_DRAW); 
*/
  // Set up texture
  var texture1 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  var image1 = new Image();

  var texture2 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  function initTextureThenDraw(value)
  { //console.log(value);
    image1.onload = function() { loadTexture(image1,texture1); };
    image1.crossOrigin = "anonymous";

    // Pictures for textures
    if(value < 25) {image1.src = "https://live.staticflickr.com/65535/53374008628_5e2c9366c2_o.png";}
    else if(value < 50) {image1.src = "https://live.staticflickr.com/65535/53373806661_349417e0db_o.png";}
    else if(value < 75) {image1.src = "https://live.staticflickr.com/65535/53373807226_febe0b24bb_o.png";}
    else {image1.src = "https://live.staticflickr.com/65535/53373987298_7147781405_o.png";}

    window.setTimeout(draw,30);
  }

  // Loading textures
  function loadTexture(image,texture)
  {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Option 1 : Use mipmap, select interpolation mode
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  }

  var angle1 = 0;
  function draw() {
      //requestAnimationFrame(draw);
      //time = time + 0.1;
      //time = time + slider1.value * 0.01; // Use slider to change the time
      temp = slider3.value;

      // [-pi,pi] interval
      angle1 += slider1.value*0.00002*Math.PI;
      //var timer = slider2.value * 0.01 * Math.PI;

      var angleRotate = slider2.value * 0.01 * Math.PI;


      // Circle around the y-axis
      var eye = [400*Math.sin(angle1),150.0 /* + 100*Math.sin(angle1)*/,400.0*Math.cos(angle1)];
      var target = [0,20*Math.sin(angle1*5),0];
      var up = [0,1,0];

      // Create the view matrix
      var tModel = mat4.create();
      mat4.fromRotation(tModel, angleRotate, [1, 1, 1]);
      mat4.scale(tModel, tModel, [100, 100, 100]);
  
      /*
      var tModel = mat4.create();
      mat4.fromScaling(tModel,[100,100,100]);
      mat4.rotate(tModel,tModel,0,[1,1,1]);
      */
    
      var tCamera = mat4.create();
      mat4.lookAt(tCamera, eye, target, up);      

      var tProjection = mat4.create();
      mat4.perspective(tProjection,Math.PI/4,1,10,1000);
    
      var tMV = mat4.create();
      var tMVn = mat3.create();
      var tMVP = mat4.create();
      mat4.multiply(tMV,tCamera,tModel); // "modelView" matrix
      mat3.normalFromMat4(tMVn,tMV);
      mat4.multiply(tMVP,tProjection,tMV);
    
      // Clear screen, prepare for rendering
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
      // Set up uniforms & attributes
      gl.uniformMatrix4fv(shaderProgram.MVmatrix,false,tMV);
      gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix,false,tMVn);
      gl.uniformMatrix4fv(shaderProgram.MVPmatrix,false,tMVP);
               
      gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
      gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
        gl.FLOAT, false, 0, 0);
        /*
      gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer2);
      gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer2.itemSize, // HUM
        gl.FLOAT, false, 0, 0);
        */
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
      gl.vertexAttribPointer(shaderProgram.NormalAttribute, triangleNormalBuffer.itemSize,
        gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize,
        gl.FLOAT,false, 0, 0);
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
      //gl.drawElements(gl.TRIANGLES, triangleIndices2.length, gl.UNSIGNED_BYTE, 0);
      initTextureThenDraw(temp);
  }
  
  //slider1.addEventListener("input",draw);
  //slider2.addEventListener("input",draw);
  //realbutton.addEventListener("click",draw);
  //slider3.addEventListener("input");
  draw();
  //initTextureThenDraw(temp);
  
   // Moved
  //slider3.addEventListener("input",initTextureThenDraw);
}

window.onload=start();