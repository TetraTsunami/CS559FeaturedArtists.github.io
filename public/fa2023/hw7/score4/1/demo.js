function start() {

  // Get canvas, WebGL context, twgl.m4
  var canvas = document.getElementById("mycanvas");
  var gl = canvas.getContext("webgl");

  // for this demo, set obj_model to reference the model name defined 
  // in the other included script
  var earth = my_model;
  var sun = my_model;
  var mercury = my_model;
  // initialize a variable that contains the proper gl enum for the 
  // size of our triangle index elements
  var triangleIndexSize = gl.UNSIGNED_INT;
  switch (earth.triangleIndices.BYTES_PER_ELEMENT) {
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


  // Sliders at center

  var slider2 = document.getElementById('slider2');
  slider2.value = 0;

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
  shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
  gl.enableVertexAttribArray(shaderProgram.PositionAttribute);

  shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
  gl.enableVertexAttribArray(shaderProgram.NormalAttribute);

  shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
  gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);

  // shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
  // gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);

  // Attach samplers to texture units
  shaderProgram.texSampler1 = gl.getUniformLocation(shaderProgram, "texSampler1");
  gl.uniform1i(shaderProgram.texSampler1, 0);
  shaderProgram.texSampler2 = gl.getUniformLocation(shaderProgram, "texSampler2");
  gl.uniform1i(shaderProgram.texSampler2, 1);
  shaderProgram.texSampler3 = gl.getUniformLocation(shaderProgram, "texSampler3");
  gl.uniform1i(shaderProgram.texSampler3, 1);




  // this gives us access to the matrix uniform
  shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram, "uMV");
  shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram, "uMVn");
  shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram, "uMVP");
  shaderProgram.type = gl.getUniformLocation(shaderProgram, "type");


  var image1 = new Image();
  var image2 = new Image();
  var image3 = new Image();

  // Set up texture
  var texture1 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  

  var texture2 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  var texture3 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture3);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  function initTextureThenDraw() {
      image1.onload = function() {
          loadTexture(image1, texture1);
      };
      image1.crossOrigin = "anonymous";
      image1.src = image;

      image2.onload = function() {
          loadTexture(image2, texture2);
      };
      image2.crossOrigin = "anonymous";
      image2.src = sun_image;

      image3.onload = function() {
        loadTexture(image3, texture3);
      };
      image3.crossOrigin = "anonymous";
      // image3.src = asteroid_texture;

      window.setTimeout(render, 200);
  }

  function loadTexture(image, texture) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      // Option 1 : Use mipmap, select interpolation mode
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

      // Option 2: At least use linear filters
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Optional ... if your shader & texture coordinates go outside the [0,1] range
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }




  // Scene (re-)draw routine
  function draw(count) {

      // we need to put the vertices into a buffer so we can
      // block transfer them to the graphics hardware
      var trianglePosBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, earth.vertexPos, gl.STATIC_DRAW);
      trianglePosBuffer.itemSize = 3;
      trianglePosBuffer.numItems = earth.vertexPos.length;

      // a buffer for normals
      var triangleNormalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, earth.vertexNormals, gl.STATIC_DRAW);
      triangleNormalBuffer.itemSize = 3;
      triangleNormalBuffer.numItems = earth.vertexNormals.length;

      // a buffer for indices
      var indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, earth.triangleIndices, gl.STATIC_DRAW);


      //sun vertex buffer
      var sunVertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, sun.vertexPos, gl.STATIC_DRAW);
      sunVertexBuffer.itemSize = 3;
      sunVertexBuffer.numItems = sun.vertexPos.length;

      //sun normals
      var sunNormalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sunNormalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, sun.vertexNormals, gl.STATIC_DRAW);
      sunNormalBuffer.itemSize = 3;
      sunNormalBuffer.numItems = sun.vertexNormals.length;

      // sun buffer indices
      var sunIndexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sunIndexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sun.triangleIndices, gl.STATIC_DRAW);



      //mercury vertex buffer
      var mercuryVertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, mercuryVertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, mercury.vertexPos, gl.STATIC_DRAW);
      mercuryVertexBuffer.itemSize = 3;
      mercuryVertexBuffer.numItems = mercury.vertexPos.length;

      //mercury normals
      var mercuryNormalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, mercuryNormalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, mercury.vertexNormals, gl.STATIC_DRAW);
      mercuryNormalBuffer.itemSize = 3;
      mercuryNormalBuffer.numItems = mercury.vertexNormals.length;

      // mercury buffer indices
      var mercuryIndexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mercuryIndexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mercury.triangleIndices, gl.STATIC_DRAW);




      //a buffer for textures
      var textureBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, earth.vertexTextureCoords, gl.STATIC_DRAW);
      textureBuffer.itemSize = 2;
      textureBuffer.numItems = earth.vertexTextureCoords.length;

      
      // Translate slider values to angles in the [-pi,pi] interval
      var angle2 = slider2.value * 0.01 * Math.PI;

      // Circle around the y-axis
      var eye = [0, 500, 800.0];
      var target = [200-slider2.value, 0, 0];
      var up = [0, 1, 0];

      // set up model transform
      // somewhat arbitrarily, let's make the model 200 units tall/wide/high
      // with its center at the origin of the wcs
      // w = earth.bboxMax[0] - earth.bboxMin[0]
      // h = earth.bboxMax[1] - earth.bboxMin[1]
      // d = earth.bboxMax[2] - earth.bboxMin[2]
      // s = 200 / Math.max(w, h, d);
      // make our coord system bigger/smaller
      var tModel = mat4.create();
      mat4.translate(tModel, tModel, [200*Math.sin(count/8), 0, 200*Math.cos(count/8)])
      mat4.scale(tModel, tModel, [30, -30, 30])
      // mat4.translate(tModel, tModel, [2,0,-5])

      // rotate our coord system according to slider2
      mat4.rotate(tModel, tModel, count, [0, 1, 0]);

      // translate coord system so model center is at wcs origin
      // offset = [
      //   -(earth.bboxMax[0] + earth.bboxMin[0]) / 2,
      //   -(earth.bboxMax[1] + earth.bboxMin[1]) / 2,
      //   -(earth.bboxMax[2] + earth.bboxMin[2]) / 2];
      // mat4.translate(tModel, tModel, offset);

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
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT );



      // Set up uniforms & attributes
      gl.uniformMatrix4fv(shaderProgram.MVmatrix, false, tMV);
      gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix, false, tMVn);
      gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);
      gl.uniform1i(shaderProgram.type, 1);

      //earth buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
      gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
          gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
      gl.vertexAttribPointer(shaderProgram.NormalAttribute, triangleNormalBuffer.itemSize,
          gl.FLOAT, false, 0, 0);


      //sun buffers


      gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
      gl.vertexAttribPointer(shaderProgram.texcoordAttribute, textureBuffer.itemSize,
          gl.FLOAT, false, 0, 0);

      // Bind texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texture2);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, texture3);


      // Do the drawing
      gl.drawElements(gl.TRIANGLES, earth.triangleIndices.length, triangleIndexSize, 0);

      // sun transforms
      var tModel_sun = mat4.create();
      mat4.scale(tModel_sun, tModel_sun, [100, -100, 100])
      mat4.rotate(tModel_sun, tModel_sun, count, [0, 1, 0]);
      tMV = mat4.create();
      tMVn = mat3.create();
      tMVP = mat4.create();
      mat4.multiply(tMV, tCamera, tModel_sun); // "modelView" matrix
      mat3.normalFromMat4(tMVn, tMV);
      mat4.multiply(tMVP, tProjection, tMV);

      gl.uniformMatrix4fv(shaderProgram.MVmatrix, false, tMV);
      gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix, false, tMVn);
      gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);

      gl.uniform1i(shaderProgram.type, 2);

      gl.drawElements(gl.TRIANGLES, sun.triangleIndices.length, triangleIndexSize, 0);



  }
  var count = 0;
  var asteroidStack = [];

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  class Mouse {
    constructor(canvas) {
      this.flag = false;
      canvas.onmousedown= e => {
        var pos = [getRandomInt(400), getRandomInt(400), getRandomInt(400)];

        var magnitude = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2]);
        var vel = [-pos[0] / magnitude, -pos[1] / magnitude, -pos[2] / magnitude];
        asteroidStack.push(new Asteroid(pos, vel, asteroid, 8, 8, 8, getRandomInt(2)));
      }
    }
  }

  function render() {
      m = new Mouse(canvas);
      const frame = () => {
          gl.clearColor(0.0, 0.0, 0.0, 1.0);
          // gl.enable(gl.DEPTH_TEST);
          count = count + 0.1;
          // if (count == 100) {
          //     count = 0;
          // }

          draw(count);

          for (var i = 0; i < asteroidStack.length; i++) {

              asteroidStack[i].update();
              asteroidStack[i].draw();
              if (asteroidStack[i].checkColision()) {
                  asteroidStack.splice(i, 1);
              }
          }

          requestAnimationFrame(frame);

      }
      frame();
  }

  initTextureThenDraw();
  // draw(1);
  // render();

  class Asteroid {
      constructor(pos, vel, asteroid, a, b, c, chase) {
          this.pos = pos;
          this.vel = vel;
          this.asteroid = asteroid;
          this.a = a;
          this.b = b;
          this.c = c;
          this.planet = chase;
      }

      update() {
          // if(this.checkColision()){
          //   this.vel = [0, 0, 0];
          // }

          if(this.planet == 1){
            var plant_pos = [200*Math.sin(count/8), 0, 200*Math.cos(count/8)];
            var loc = vec3.create();
            loc[0] = plant_pos[0]-this.pos[0];
            loc[1] = 0-this.pos[1];
            loc[2] = plant_pos[2]-this.pos[2];

            vec3.normalize(loc, loc);

            this.vel[0] = loc[0]*3;
            this.vel[1] = loc[1]*3;
            this.vel[2] = loc[2]*3;
          }
          this.pos[0] += this.vel[0];
          this.pos[1] += this.vel[1];
          this.pos[2] += this.vel[2];
      }

      checkColision() {
          //sun points - 
          for (var u = 0; u <= Math.PI; u = u + 0.2) {
              for (var v = 0; v <= 2 * Math.PI; v = v + 0.2) {
                  var x = 100 * Math.sin(u) * Math.cos(v);
                  var y = 100 * Math.sin(u) * Math.sin(v);
                  var z = 100 * Math.cos(u);

                  var dis = (x - this.pos[0]) * (x - this.pos[0]) / 400 + (y - this.pos[1]) * (y - this.pos[1]) / 100 + (z - this.pos[2]) * (z - this.pos[2]) / 100;

                  if (dis <= 1) {
                      this.explosion = [x, y, z]
                      return true;
                  }
              }
          }

          //mercury points - 
          for (var u = 0; u <= Math.PI; u = u + 0.2) {
              for (var v = 0; v <= 2 * Math.PI; v = v + 0.2) {
                  var x = 200 + 15 * Math.sin(u) * Math.cos(v);
                  var y = 15 * Math.sin(u) * Math.sin(v);
                  var z = 15 * Math.cos(u);

                  var dis = (x - this.pos[0]) * (x - this.pos[0]) / 400 + (y - this.pos[1]) * (y - this.pos[1]) / 100 + (z - this.pos[2]) * (z - this.pos[2]) / 100;

                  if (dis <= 1) {
                      this.explosion = [x, y, z]
                      return true;
                  }
              }
          }

          //earth points - 
          for (var u = 0; u <= Math.PI; u = u + 0.2) {
              for (var v = 0; v <= 2 * Math.PI; v = v + 0.2) {
                  var x = 400 + 30 * Math.sin(u) * Math.cos(v);
                  var y = 30 * Math.sin(u) * Math.sin(v);
                  var z = 30 * Math.cos(u);

                  var dis = (x - this.pos[0]) * (x - this.pos[0]) / 400 + (y - this.pos[1]) * (y - this.pos[1]) / 100 + (z - this.pos[2]) * (z - this.pos[2]) / 100;

                  if (dis <= 1) {
                      this.explosion = [x, y, z]
                      return true;
                  }
              }
          }

          return false;
      }


      draw() {
          // Circle around the y-axis
          var eye = [0, 500, 800.0];
          var target = [200-slider2.value, 0, 0];
          var up = [0, 1, 0];

          // set up camera transform
          var tCamera = mat4.create();
          mat4.lookAt(tCamera, eye, target, up);

          // set up projection transform
          var tProjection = mat4.create();
          mat4.perspective(tProjection, Math.PI / 4, 1, 10, 1000);

          // gl.clear(gl.ARRAY_BUFFER);

          // asteroid vertex buffer
          var asteroidVertexBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, asteroidVertexBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, this.asteroid.vertexPos, gl.STATIC_DRAW);
          asteroidVertexBuffer.itemSize = 3;
          asteroidVertexBuffer.numItems = this.asteroid.vertexPos.length;

          // asteroid normals
          var asteroidNormalBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, asteroidNormalBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, this.asteroid.vertexNormals, gl.STATIC_DRAW);
          asteroidNormalBuffer.itemSize = 3;
          asteroidNormalBuffer.numItems = this.asteroid.vertexNormals.length;

          // asteroid buffer indices
          var asteroidIndexBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, asteroidIndexBuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.asteroid.triangleIndices, gl.STATIC_DRAW);


          gl.bindBuffer(gl.ARRAY_BUFFER, asteroidVertexBuffer);
          gl.vertexAttribPointer(shaderProgram.PositionAttribute, asteroidVertexBuffer.itemSize,
              gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, asteroidNormalBuffer);
          gl.vertexAttribPointer(shaderProgram.NormalAttribute, asteroidNormalBuffer.itemSize,
              gl.FLOAT, false, 0, 0);


          var tModel_sun = mat4.create();
          mat4.translate(tModel_sun, tModel_sun, [this.pos[0], this.pos[1], this.pos[2]]);
          mat4.scale(tModel_sun, tModel_sun, [this.a, -this.b, this.c])
          // mat4.rotate(tModel_sun, tModel_sun, count, [0, 1, 0]);
          var tMV = mat4.create();
          var tMVn = mat3.create();
          var tMVP = mat4.create();
          mat4.multiply(tMV, tCamera, tModel_sun); // "modelView" matrix
          mat3.normalFromMat4(tMVn, tMV);
          mat4.multiply(tMVP, tProjection, tMV);

          gl.uniformMatrix4fv(shaderProgram.MVmatrix, false, tMV);
          gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix, false, tMVn);
          gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);

          gl.uniform1i(shaderProgram.type, 3);
          gl.drawElements(gl.TRIANGLES, this.asteroid.triangleIndices.length, triangleIndexSize, 0);
      }
  }

}

start();