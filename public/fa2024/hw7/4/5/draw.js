var mat3 = glMatrix.mat3;
var mat4 = glMatrix.mat4;
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;

function start() {
  var canvas = document.getElementById("myCanvas");
  var gl = canvas.getContext("webgl");

  var slider1 = document.getElementById("slider1");
  var slider2 = document.getElementById("slider2");
  var timeSlider = document.getElementById("timeStep");

  var vertexSource = document.getElementById("vertexShader").text;
  var fragmentSource = document.getElementById("fragmentShader").text;

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader)); return null;
  }
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader)); return null;
  }

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {

  }
  gl.useProgram(shaderProgram);

  shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPos");
  shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "vCol");
  shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNorm");
  shaderProgram.MovesAttribute = gl.getAttribLocation(shaderProgram, "moves");
  gl.enableVertexAttribArray(shaderProgram.PositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.ColorAttribute);
  gl.enableVertexAttribArray(shaderProgram.NormalAttribute);
  gl.enableVertexAttribArray(shaderProgram.MovesAttribute);

  shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram, "uMV");
  shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram, "uMVn");
  shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram, "uMVP");
  shaderProgram.UTime = gl.getUniformLocation(shaderProgram, "uTime");

  var vertexPos = [];
  var vertexNormals = [];
  var vertexColors = [];
  var vertexIndex = [];
  var vertexMoves = [];


  var trianglePosBuffer = gl.createBuffer();
  var triangleNormBuffer = gl.createBuffer();
  var triangleColBuffer = gl.createBuffer();
  var triangleIndBuffer = gl.createBuffer();
  var triangleMovementBuffer = gl.createBuffer();
  function createAndBindBuffers() {
    var tempPos = new Float32Array(vertexPos);
    var tempNorms = new Float32Array(vertexNormals);
    var tempCols = new Float32Array(vertexColors);
    var tempInd = new Uint16Array(vertexIndex);
    var tempMoves = new Float32Array(vertexMoves);

    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tempPos, gl.STATIC_DRAW);
    trianglePosBuffer.itemSize = 3;
    trianglePosBuffer.numItems = vertexPos.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tempNorms, gl.STATIC_DRAW);
    triangleNormBuffer.itemSize = 3;
    triangleNormBuffer.numItems = vertexNormals.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tempCols, gl.STATIC_DRAW);
    triangleColBuffer.itemSize = 3;
    triangleColBuffer.numItems = vertexColors.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleMovementBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tempMoves, gl.STATIC_DRAW);
    triangleMovementBuffer.itemSize = 1;
    triangleMovementBuffer.numItems = vertexMoves.length;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, tempInd, gl.STATIC_DRAW);
  }

  function createCube(cube) {
    var N = vec3.fromValues(cube.norm[0], cube.norm[1], cube.norm[2]);
    vec3.normalize(N, N);
    var A = vec3.fromValues(cube.arb[0], cube.arb[1], cube.arb[2]);
    vec3.normalize(A, A);
    var U = vec3.create();
    vec3.cross(U, N, A);
    vec3.normalize(U, U);
    var V = vec3.create();
    vec3.cross(V, N, U)
    vec3.normalize(V, V);
    var orth = [U, V, N];
    //0,1,2
    var vertices = [];
    for (var i = 0; i < 8; i++) {
      var curpoint = vec3.clone(cube.center);
      for (var j = 0; j < 3; j++) {
        var tmp = vec3.clone(orth[j]);
        vec3.scale(tmp, tmp, cube.sideLength / 2);
        if (((i >> j) & 1) == 1) {
          vec3.scale(tmp, tmp, -1)
        }
        vec3.add(curpoint, curpoint, tmp)
      }
      vertices.push(curpoint);
    }
    var negU = vec3.clone(U);
    vec3.scale(negU, negU, -1);
    var negV = vec3.clone(V);
    vec3.scale(negV, negV, -1);
    var negN = vec3.clone(N);
    vec3.scale(negN, negN, -1);
    var faces = [
      {
        vertices: [vertices[0], vertices[2], vertices[6], vertices[4]],
        normal: U
      },
      {
        vertices: [vertices[1], vertices[3], vertices[7], vertices[5]],
        normal: negU
      },
      {
        vertices: [vertices[0], vertices[1], vertices[3], vertices[2]],
        normal: N
      },
      {
        vertices: [vertices[4], vertices[5], vertices[7], vertices[6]],
        normal: negN
      },
      {
        vertices: [vertices[0], vertices[1], vertices[5], vertices[4]],
        normal: V
      },
      {
        vertices: [vertices[2], vertices[3], vertices[7], vertices[6]],
        normal: negV
      },
    ]
    var triangleIndices =
      [0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // top
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // bottom
        20, 21, 22, 20, 22, 23]; // back
    var cind = vertexPos.length / 3;
    var j = 0;
    for (var f = 0; f < 6; f++) {
      var face = faces[f];
      for (var v = 0; v < 4; v++) {
        var vertex = face.vertices[v];
        for (var i = 0; i < 3; i++) {
          vertexPos.push(vertex[i]);
          vertexNormals.push(face.normal[i]);
          vertexColors.push(cube.color[i]);
        }
        vertexMoves.push(cube.moves);
      }
    }
    console.log(triangleIndices.length);
    for (var i = 0; i < 36; i++) vertexIndex.push(triangleIndices[i] + cind);
  }

  var cTime = 0;
  var eye = vec3.fromValues(0, 0, 0);
  var target = [1, 1, 1];
  var up = [0, 1, 0];
  function draw() {
    cTime += (timeSlider.value / 1000);

    var angle1 = slider1.value * Math.PI * 0.01;
    var angle2 = slider2.value * 0.1;
    target = [Math.cos(angle1), angle2, Math.sin(angle1)];



    var tModel = mat4.create();
    mat4.fromScaling(tModel, [1, 1, 1]);

    var tCamera = mat4.create();
    var actTarget = vec3.create();
    vec3.add(actTarget, eye, target);
    mat4.lookAt(tCamera, eye, actTarget, up);

    var tProjection = mat4.create();
    mat4.perspective(tProjection, Math.PI / 4, 1, 10, 1000);

    var tMV = mat4.create();
    var tMVn = mat3.create();
    var tMVP = mat4.create();
    mat4.multiply(tMV, tCamera, tModel);
    mat3.normalFromMat4(tMVn, tMV);
    mat4.multiply(tMVP, tProjection, tMV)

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(shaderProgram.MVmatrix, false, tMV);
    gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix, false, tMVn);
    gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);
    gl.uniform1f(shaderProgram.UTime, cTime);

    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
      gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormBuffer);
    gl.vertexAttribPointer(shaderProgram.NormalAttribute, triangleNormBuffer.itemSize,
      gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColBuffer);
    gl.vertexAttribPointer(shaderProgram.ColorAttribute, triangleColBuffer.itemSize,
      gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleMovementBuffer);
    gl.vertexAttribPointer(shaderProgram.MovesAttribute, triangleMovementBuffer.itemSize,
      gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, vertexIndex.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(draw);
  }

  function createRandomCube() {
    var norm = vec3.fromValues(Math.random(), Math.random(), Math.random());
    var arb = vec3.fromValues(Math.random(), Math.random(), Math.random());
    vec3.normalize(norm, norm);
    vec3.normalize(arb, arb);
    var crossprod = vec3.create();
    vec3.cross(crossprod, norm, arb);
    var crossLen = vec3.len(crossprod)
    while (crossLen < 0.001) {
      var arb = vec3.fromValues(Math.random(), Math.random(), Math.random());
      vec3.normalize(arb, arb);
      vec3.cross(crossprod, norm, arb);
      var crossLen = vec3.len(crossprod)
    }
    var color = vec3.fromValues(Math.random(), Math.random(), Math.random());
    const mult = 1000;
    var pos = vec3.fromValues(Math.random() * mult - mult / 2, Math.random() * mult - mult / 2, Math.random() * mult - mult / 2);
    var sideLength = Math.random() * 100;
    return {
      norm,
      arb,
      center: pos,
      sideLength,
      color,
      moves: -1.0
    }
  }

  var cubes = [{
    norm: [1, 0, 0],
    arb: [0, 1, 0],
    center: [100, 0, 0],
    sideLength: 20,
    color: [1, 1, 0],
    moves: -1.0
  },
  {
    norm: [1, 0, 0],
    arb: [0, 1, 0],
    center: [0, 0, 0],
    sideLength: 20,
    color: [0, 0, 0],
    moves: 1.0
  },
  ];
  console.log(vertexMoves);
  for (var i = 0; i < 100; i++) cubes.push(createRandomCube());
  cubes.forEach(cube => {
    createCube(cube);
  })
  createAndBindBuffers();

  draw();

  const stepScale = 5;
  document.addEventListener("keydown", (event) => {

    var normForward = vec3.create();
    vec3.normalize(normForward, target);
    vec3.scale(normForward, normForward, stepScale)
    if (event.key == 'w') {
      vec3.add(eye, eye, normForward);
    }

    if (event.key == 's') {
      vec3.scale(normForward, normForward, -1);
      vec3.add(eye, eye, normForward);
    }
    var orth = vec3.create()
    vec3.cross(orth, up, target);
    vec3.normalize(orth, orth);
    vec3.scale(orth, orth, stepScale)
    if (event.key == 'a') {
      vec3.add(eye, eye, orth);
    }
    if (event.key == 'd') {
      vec3.scale(orth, orth, -1);
      vec3.add(eye, eye, orth);
    }
  })

}
window.onload = start;

