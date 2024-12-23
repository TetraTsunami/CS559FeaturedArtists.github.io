function setup() {
  const canvas = document.getElementById("myCanvas");

  const ctx = canvas.getContext("2d");
  const slider1 = document.getElementById("slider1");

  canvas.width = 900; // x
  canvas.height = 600; // y

  slider1.type = "range";
  slider1.min = 0;
  slider1.max = 300;
  slider1.value = 0;

  const slider2 = document.getElementById("slider2");

  slider2.type = "range";
  slider2.min = 0;
  slider2.max = 100;
  slider2.value = 0;

  const slider3 = document.getElementById("slider3");
  slider3.type = "range";
  slider3.min = -1000;
  slider3.max = 1000;
  slider3.value = 50;

  let animateToggle = document.getElementById("animateToggle");
  let resetCurve = document.getElementById("resetCurve");
  let resetCamera = document.getElementById("resetCamera");
  let context = ctx;

  let viewAngle = slider2.value * 0.02 * Math.PI;
  let viewUpDown = slider3.value;

  let animate = false;
  let tParam = 0;

  function moveToTx(loc, Tx) {
    let res = vec3.create();
    vec3.transformMat4(res, loc, Tx);
    context.moveTo(res[0], res[1]);
  }

  function lineToTx(loc, Tx) {
    let res = vec3.create();
    vec3.transformMat4(res, loc, Tx);
    context.lineTo(res[0], res[1]);
  }

  function drawObject(color, TxU, scale) {
    let Tx = mat4.clone(TxU);
    mat4.scale(Tx, Tx, [scale, scale, scale]);
    context.beginPath();
    context.fillStyle = color;
    moveToTx([-0.05, -0.05, 0], Tx);
    lineToTx([-0.05, 0.05, 0], Tx);
    lineToTx([0.05, 0.05, 0], Tx);
    lineToTx([0.1, 0, 0], Tx);
    lineToTx([0.05, -0.05, 0], Tx);

    context.closePath();
    context.fill();

    for (let i = 0; i < 5; i++) {
      let belowLine = -(i * 0.01);
      let aboveLine = i * 0.01;
      context.beginPath();
      context.fillStyle = color;
      moveToTx([-0.05, -0.05, belowLine], Tx);
      lineToTx([-0.05, 0.05, belowLine], Tx);
      lineToTx([0.05, 0.05, belowLine], Tx);
      lineToTx([0.1, 0, belowLine], Tx);
      lineToTx([0.05, -0.05, belowLine], Tx);
      context.closePath();
      context.fill();

      context.beginPath();
      context.fillStyle = color;
      moveToTx([-0.05, -0.05, aboveLine], Tx);
      lineToTx([-0.05, 0.05, aboveLine], Tx);
      lineToTx([0.05, 0.05, aboveLine], Tx);
      lineToTx([0.1, 0, aboveLine], Tx);
      lineToTx([0.05, -0.05, aboveLine], Tx);
      context.closePath();
      context.fill();
    }
  }
  function drawCircle(center, radius, Tx, color) {
    let res = vec3.create();
    vec3.transformMat4(res, center, Tx);

    context.beginPath();
    context.arc(res[0], res[1], radius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
  }
  function draw3DAxes(color, TxU, scale) {
    let Tx = mat4.clone(TxU);
    mat4.scale(Tx, Tx, [scale, scale, scale]);

    context.strokeStyle = color;
    context.beginPath();
    // Axes
    moveToTx([1.2, 0, 0], Tx);
    lineToTx([0, 0, 0], Tx);
    lineToTx([0, 1.2, 0], Tx);
    moveToTx([0, 0, 0], Tx);
    lineToTx([0, 0, 1.2], Tx);
    // Arrowheads
    moveToTx([1.1, 0.05, 0], Tx);
    lineToTx([1.2, 0, 0], Tx);
    lineToTx([1.1, -0.05, 0], Tx);
    moveToTx([0.05, 1.1, 0], Tx);
    lineToTx([0, 1.2, 0], Tx);
    lineToTx([-0.05, 1.1, 0], Tx);
    moveToTx([0.05, 0, 1.1], Tx);
    lineToTx([0, 0, 1.2], Tx);
    lineToTx([-0.05, 0, 1.1], Tx);
    // X-label
    moveToTx([1.3, -0.05, 0], Tx);
    lineToTx([1.4, 0.05, 0], Tx);
    moveToTx([1.3, 0.05, 0], Tx);
    lineToTx([1.4, -0.05, 0], Tx);
    // Y-label
    moveToTx([-0.05, 1.4, 0], Tx);
    lineToTx([0, 1.35, 0], Tx);
    lineToTx([0.05, 1.4, 0], Tx);
    moveToTx([0, 1.35, 0], Tx);
    lineToTx([0, 1.28, 0], Tx);
    // Z-label
    moveToTx([-0.05, 0, 1.3], Tx);
    lineToTx([0.05, 0, 1.3], Tx);
    lineToTx([-0.05, 0, 1.4], Tx);
    lineToTx([0.05, 0, 1.4], Tx);

    context.stroke();
  }

  let Hermite = function (t) {
    return [
      2 * t * t * t - 3 * t * t + 1,
      t * t * t - 2 * t * t + t,
      -2 * t * t * t + 3 * t * t,
      t * t * t - t * t,
    ];
  };

  let HermiteDerivative = function (t) {
    return [
      6 * t * t - 6 * t,
      3 * t * t - 4 * t + 1,
      -6 * t * t + 6 * t,
      3 * t * t - 2 * t,
    ];
  };
  function Cubic(basis, P, t) {
    let b = basis(t);
    let result = vec3.create();
    vec3.scale(result, P[0], b[0]);
    vec3.scaleAndAdd(result, result, P[1], b[1]);
    vec3.scaleAndAdd(result, result, P[2], b[2]);
    vec3.scaleAndAdd(result, result, P[3], b[3]);
    return result;
  }

  let p0 = [-185.515, -184.997, -47.534];
  let d0 = [-438.2, -33.652, 56.084];

  let p1 = [-308.583, -37.706, 33.989];
  let d1 = [161.703, 135.409, -65.219];

  let p2 = [-18.309, 65.438, 37.842];
  let d2 = [323.295, 114.883, -89.364];

  let p3 = p0;
  let d3 = [-271.188, 120.022, 32.171];
  let P0 = [p0, d0, p1, d1]; // First two points and tangents
  let P1 = [p1, d1, p2, d2]; // Last two points and tangents
  let P2 = [p2, d2, p3, d3];

  let C0 = function (t_) {
    return Cubic(Hermite, P0, t_);
  };
  let C1 = function (t_) {
    return Cubic(Hermite, P1, t_);
  };
  let C2 = function (t_) {
    return Cubic(Hermite, P2, t_);
  };

  let C0prime = function (t_) {
    return Cubic(HermiteDerivative, P0, t_);
  };
  let C1prime = function (t_) {
    return Cubic(HermiteDerivative, P1, t_);
  };
  let C2prime = function (t_) {
    return Cubic(HermiteDerivative, P2, t_);
  };

  let Ccomp = function (t) {
    if (t < 1) {
      return C0(t);
    } else if (t < 2) {
      return C1(t - 1.0);
    } else {
      return C2(t - 2.0);
    }
  };

  let Ccomp_tangent = function (t) {
    if (t < 1) {
      return C0prime(t);
    } else if (t < 2) {
      return C1prime(t - 1.0);
    } else {
      return C2prime(t - 2.0);
    }
  };

  function drawTrajectory(t_begin, t_end, intervals, C, Tx, color) {
    context.strokeStyle = color;
    context.beginPath();
    moveToTx(C(t_begin), Tx);
    for (let i = 1; i <= intervals; i++) {
      let t = ((intervals - i) / intervals) * t_begin + (i / intervals) * t_end;
      lineToTx(C(t), Tx);
    }
    context.stroke();
  }

  let CameraCurve = function (angle) {
    let distance = 300.0;
    let eye = vec3.create();
    eye[0] = distance * Math.sin(viewAngle);
    eye[1] = viewUpDown;
    eye[2] = distance * Math.cos(viewAngle);
    return [eye[0], eye[1], eye[2]];
  };

  let circleRotationAngle = 0;
  function start() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circleRotationAngle += 0.08;
    let circleCenter = [0, 0.5, 40];
    let circleCenter2 = [40, 0.5, 0];
    viewAngle = slider2.value * 0.02 * Math.PI;
    viewUpDown = slider3.value;

    // Create Camera (lookAt) transform

    let eyeCamera = CameraCurve(viewAngle);
    let targetCamera = vec3.fromValues(0, 0, 0); // Aim at the origin of the world coords
    let upCamera = vec3.fromValues(0, 200, 0); // Y-axis of world coords to be vertical
    let TlookAtCamera = mat4.create();
    mat4.lookAt(TlookAtCamera, eyeCamera, targetCamera, upCamera);

    let Tviewport = mat4.create();
    mat4.fromTranslation(Tviewport, [canvas.width / 2, canvas.height / 2, 0]); // Move the center of the

    mat4.scale(Tviewport, Tviewport, [100, -100, 1]); // Flip the Y-axis,

    let Tcamera = mat4.create();
    mat4.ortho(Tcamera, -100, 100, -100, 100, -1, 1);

    let tVP_PROJ_VIEW_Camera = mat4.create();
    mat4.multiply(tVP_PROJ_VIEW_Camera, Tviewport, Tcamera);
    mat4.multiply(tVP_PROJ_VIEW_Camera, tVP_PROJ_VIEW_Camera, TlookAtCamera);

    let Tmodel = mat4.create();
    mat4.fromTranslation(Tmodel, Ccomp(tParam));
    let tangent = Ccomp_tangent(tParam);
    let angle = Math.atan2(tangent[1], tangent[0]);
    mat4.rotateZ(Tmodel, Tmodel, angle);

    let tVP_PROJ_VIEW_MOD_Camera = mat4.create();
    mat4.multiply(tVP_PROJ_VIEW_MOD_Camera, tVP_PROJ_VIEW_Camera, Tmodel);
    let TlookFromCamera = mat4.create();
    mat4.invert(TlookFromCamera, TlookAtCamera);

    let TmodelCircle = mat4.create();
    let tVP_PROJ_VIEW_MOD_Circle = mat4.create();

    mat4.fromRotation(TmodelCircle, circleRotationAngle, [1, 0, 0]);
    mat4.translate(TmodelCircle, TmodelCircle, circleCenter);
    mat4.multiply(
      tVP_PROJ_VIEW_MOD_Circle,
      tVP_PROJ_VIEW_MOD_Camera,
      TmodelCircle
    );

    //CIRCLE 2

    let TmodelCircle2 = mat4.create();
    let tVP_PROJ_VIEW_MOD_Circle2 = mat4.create();
    mat4.fromRotation(TmodelCircle2, circleRotationAngle, [0, 0, 1]);
    mat4.translate(TmodelCircle2, TmodelCircle2, circleCenter2);
    mat4.multiply(
      tVP_PROJ_VIEW_MOD_Circle2,
      tVP_PROJ_VIEW_MOD_Camera,
      TmodelCircle2
    );

    draw(
      tVP_PROJ_VIEW_Camera,
      tVP_PROJ_VIEW_MOD_Camera,
      tVP_PROJ_VIEW_MOD_Circle,
      tVP_PROJ_VIEW_MOD_Circle2
    );
  }

  function draw(
    cameraViewProjectionMatrix,
    modelViewProjectionMatrix,
    circleViewProjectionMatrix,
    circleViewProjectionMatrix2
  ) {
    draw3DAxes("grey", cameraViewProjectionMatrix, 100.0);
    drawTrajectory(0.0, 1.0, 100, C0, cameraViewProjectionMatrix, "red");
    drawTrajectory(0.0, 1.0, 100, C1, cameraViewProjectionMatrix, "blue");
    drawTrajectory(0.0, 1.0, 100, C2, cameraViewProjectionMatrix, "green");
    drawObject("green", modelViewProjectionMatrix, 100.0);
    drawCircle([0, 0, 0], 5, circleViewProjectionMatrix, "blue");
    drawCircle([0, 0, 0], 5, circleViewProjectionMatrix2, "red");
  }
  function animateFunction() {
    if (animate) {
      tParam += 3 * 0.005;
      tParam %= 3;
    } else {
      tParam = slider1.value * 0.01;
    }
    start();
    requestAnimationFrame(animateFunction);
  }
  let randomCurve = document.getElementById("randomCurve");
  randomCurve.addEventListener("click", randomizeCurve);
  resetCurve.addEventListener("click", resetCurve1);

  function randomizeCurve() {
    //Math.random() * (max - min) + min;

    function randomNumber(min, max) {
      return Math.random() * (max - min) + min;
    }

    function randomPoint() {
      let x = randomNumber(400, -400);
      let y = randomNumber(260, -260);
      let z = randomNumber(-50, 50);
      return [x, y, z];
    }

    function randomTangent() {
      let x = randomNumber(-canvas.width / 2, canvas.width / 2);
      let y = randomNumber(-canvas.height / 2, canvas.height / 2);
      let z = randomNumber(-100, 100);
      return [x, y, z];
    }

    let p0 = randomPoint();
    let d0 = randomTangent();
    console.log(`First ${p0}, ${d0}!\n`);

    let p1 = randomPoint();
    let d1 = randomTangent();
    console.log(`Second ${p1}, ${d1}!\n`);

    let p2 = randomPoint();
    let d2 = randomTangent();
    console.log(`Third ${p2}, ${d2}!\n`);

    let p3 = p0;
    let d3 = randomTangent();
    console.log(`Last ${d3}!\n`);

    P0 = [p0, d0, p1, d1]; // First two points and tangents
    P1 = [p1, d1, p2, d2]; // Last two points and tangents
    P2 = [p2, d2, p3, d3];
  }

  function resetCurve1() {
    let p0 = [-185.515, -184.997, -47.534];
    let d0 = [-438.2, -33.652, 56.084];

    let p1 = [-308.583, -37.706, 33.989];
    let d1 = [161.703, 135.409, -65.219];

    let p2 = [-18.309, 65.438, 37.842];
    let d2 = [323.295, 114.883, -89.364];

    let p3 = p0;
    let d3 = [-271.188, 120.022, 32.171];
    P0 = [p0, d0, p1, d1]; // First two points and tangents
    P1 = [p1, d1, p2, d2]; // Last two points and tangents
    P2 = [p2, d2, p3, d3];
    slider1.value = 0;
  }

  slider1.addEventListener("input", start);
  slider2.addEventListener("input", start);
  slider3.addEventListener("input", function () {
    viewUpDown = parseFloat(slider3.value);
    start();
  });
  animateToggle.addEventListener("click", () => {
    animate = !animate;
  });

  resetCamera.addEventListener("click", function () {
    slider2.value = 0;
    slider3.value = 50;
    start();
  });

  animateFunction();
}

window.onload = setup;
