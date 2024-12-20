function setup() {
  "use strict";
  var canvas = document.getElementById("myCanvas");
  var context = canvas.getContext("2d");

  let dx = 0; // car x coord
  let dx_direction = 1; // direction of movement
  let wheel = 0; // wheel rotation angle
  let wheel_direction = 1; // direction of wheel rotation

  function setCanvasTransform(Tx) {
    context.setTransform(Tx[0], Tx[1], Tx[3], Tx[4], Tx[6], Tx[7]);
  }

  function moveToTx(x, y, Tx) {
    const ptX = Tx[0] * x + Tx[3] * y + Tx[6]; // transform x
    const ptY = Tx[1] * x + Tx[4] * y + Tx[7]; // transform y
    context.moveTo(ptX, ptY);
  }

  function lineToTx(x, y, Tx) {
    const ptX = Tx[0] * x + Tx[3] * y + Tx[6]; // transform x
    const ptY = Tx[1] * x + Tx[4] * y + Tx[7]; // transform y
    context.lineTo(ptX, ptY);
  }
  function draw() {
    canvas.width = canvas.width;

    function DrawCar(Tx) {
      context.beginPath();
      context.fillStyle = "green";
      context.strokeStyle = "black";
      context.lineWidth = 4;

      // car body
      moveToTx(50, 100, Tx);
      lineToTx(550, 100, Tx);
      lineToTx(550, 250, Tx);
      lineToTx(650, 250, Tx);
      lineToTx(650, 425, Tx);
      lineToTx(30, 425, Tx);
      lineToTx(30, 405, Tx);
      lineToTx(50, 405, Tx);
      lineToTx(50, 250, Tx);
      lineToTx(50, 100, Tx);
      context.fill();
      context.stroke();

      // window
      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 4;
      context.fillStyle = "grey";
      moveToTx(465, 125, Tx);
      lineToTx(525, 125, Tx);
      lineToTx(525, 250, Tx);
      lineToTx(465, 250, Tx);
      lineToTx(465, 125, Tx);
      context.fill();
      context.stroke();

      // Draw wheels
      DrawWheel(150, 425, "black", Tx);
      DrawWheel(450, 425, "black", Tx);
    }

    function DrawWheel(x, y, color, Tx) {
      // wheel transformation matrix
      let wheelTransform = mat3.create();
      mat3.fromTranslation(wheelTransform, [x, y]); // move wheel to its position
      mat3.rotate(wheelTransform, wheelTransform, wheel); // rotate the wheel

      // combine car transform and wheel transform
      let combinedTransform = mat3.create();
      mat3.multiply(combinedTransform, Tx, wheelTransform);

      setCanvasTransform(combinedTransform);

      // draw wheel
      context.beginPath();
      context.fillStyle = color;
      context.arc(0, 0, 50, 0, Math.PI * 2); // wheel circle
      context.fill();
      context.stroke();

      // draw wheel outer detail
      context.strokeStyle = "gray";
      context.beginPath();
      context.arc(0, 0, 40, 0, Math.PI * 2);
      context.stroke();

      // draw wheel inner details
      const rotationMatrix = mat3.create();
      const angleIncrement = Math.PI / 4;

      context.strokeStyle = "gray";

      for (let i = 0; i < 8; i++) {
        // create a rotation matrix for the current angle
        mat3.fromRotation(rotationMatrix, angleIncrement * i);

        // transform endpoints
        const x = 40 * rotationMatrix[0] + 0 * rotationMatrix[3];
        const y = 40 * rotationMatrix[1] + 0 * rotationMatrix[4];

        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(x, y);
        context.stroke();
      }
      setCanvasTransform([1, 0, 0, 1, 0, 0]); // instead of using restore
    }

    function DrawStopSign() {
      // draw sign
      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 4;
      context.fillStyle = "red";
      context.moveTo(1215, 145);
      context.lineTo(1240, 115);
      context.lineTo(1310, 115);
      context.lineTo(1335, 145);
      context.lineTo(1335, 185);
      context.lineTo(1310, 220);
      context.lineTo(1240, 220);
      context.lineTo(1215, 185);

      context.closePath();
      context.fill();
      context.stroke();

      // draw pole
      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 4;
      context.rect(1265, 220, 20, 265);
      context.stroke();

      // draw sign letters
      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 4;
      // S
      context.moveTo(1240, 160);
      context.lineTo(1230, 160);
      context.lineTo(1230, 170);
      context.lineTo(1240, 170);
      context.lineTo(1240, 180);
      context.lineTo(1230, 180);
      context.stroke();

      // T
      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 4;
      context.moveTo(1250, 160);
      context.lineTo(1270, 160);
      context.lineTo(1260, 160);
      context.lineTo(1260, 181);
      context.stroke();

      // O
      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 4;
      context.rect(1280, 160, 10, 20);
      context.stroke();

      // P
      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 4;
      context.moveTo(1305, 170);
      context.lineTo(1305, 160);
      context.lineTo(1315, 160);
      context.lineTo(1315, 170);
      context.lineTo(1305, 170);
      context.lineTo(1305, 181);
      context.stroke();
    }

    function DrawCrash() {
      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 4;
      context.moveTo(1210, 175);
      context.lineTo(1210, 160);
      context.lineTo(1190, 170);
      context.lineTo(1175, 160);
      context.lineTo(1185, 180);
      context.lineTo(1150, 200);
      context.lineTo(1175, 200);
      context.stroke();

      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 4;
      context.moveTo(1180, 140);
      context.lineTo(1200, 135);
      context.lineTo(1205, 150);
      context.closePath();
      context.stroke();
    }

    DrawStopSign();
    DrawCrash();

    // translation matrix to move car
    let carTranslation = mat3.create();
    mat3.fromTranslation(carTranslation, [dx, 0]);

    // draw car with transformation matrix
    DrawCar(carTranslation);

    dx += 5 * dx_direction; // move the car

    // reverse direction when the car hits edges
    if (dx > 600) {
      dx_direction = -1;
      wheel_direction = -1;
    } else if (dx < 0) {
      dx_direction = 1;
      wheel_direction = 1;
    }

    // rotate the wheels
    wheel += 0.05 * wheel_direction;

    window.requestAnimationFrame(draw);
  }

  window.requestAnimationFrame(draw);
}
window.onload = setup;
