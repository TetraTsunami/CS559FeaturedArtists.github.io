// Project 3 - CS559 Bill Zhu
// References: In-Class examples such as the animation and robotic arm examples listed in project description.

function setup() {
  "use strict";
  var canvas = document.getElementById('myCanvas');

  let z = 0; //Used for swing animation
  let x = 0; //Used for branch animation

  function draw() {
    var context = canvas.getContext('2d');
    canvas.width = canvas.width;

    let swingAngle = Math.sin(z) * 0.3; //Used for swing animation
    let branchAngle = Math.sin(x) * 0.03; //Used for branch animation

    let stack = [mat3.create()]; //Stack for transformations

    function moveToTx(x, y) {
      let res = vec2.create();
      vec2.transformMat3(res, [x, y], stack[0]);
      context.moveTo(res[0], res[1]);
    }

    function lineToTx(x, y) {
      let res = vec2.create();
      vec2.transformMat3(res, [x, y], stack[0]);
      context.lineTo(res[0], res[1]);
    }

    //Draws tree trunk
    function DrawTrunk() {
      context.beginPath();

      //trunk
      moveToTx(800, 720);  // Starting point (bottom left)
      lineToTx(850, 300);
      lineToTx(870, 270);
      lineToTx(900, 310);
      lineToTx(910, 450);
      lineToTx(895, 720);
      lineToTx(900, 725);

      //Roots
      lineToTx(930, 747);
      lineToTx(900, 745);
      lineToTx(870, 730);
      lineToTx(860, 730);
      lineToTx(850, 760);
      lineToTx(840, 770);
      lineToTx(845, 725);
      lineToTx(830, 735);
      lineToTx(750, 750);
      context.closePath();
      context.fillStyle = "Black";
      context.fill();
    }

    //Draws a tree branch and makes it sway in the wind (this hurt to code)
    function DrawBranch(scale) {

      //Makes the branch sway
      stack.unshift(mat3.clone(stack[0]));
      let TbranchSway = mat3.create();
      mat3.rotate(TbranchSway, TbranchSway, branchAngle);
      mat3.multiply(stack[0], stack[0], TbranchSway);
      context.beginPath();

      //Main Branch
      moveToTx(0, 100 * scale);
      lineToTx(30 * scale, 50 * scale);
      lineToTx(60 * scale, 30 * scale);

      //Side Branch
      lineToTx(100 * scale, 10 * scale);
      lineToTx(100 * scale, -10 * scale);
      lineToTx(90 * scale, -7 * scale);
      lineToTx(30 * scale, -20 * scale);
      lineToTx(70 * scale, -15 * scale);
      lineToTx(60 * scale, -30 * scale);
      lineToTx(50 * scale, -40 * scale);
      lineToTx(60 * scale, -35 * scale);
      lineToTx(75 * scale, -18 * scale);
      lineToTx(90 * scale, -15 * scale);
      lineToTx(100 * scale, -20 * scale);
      lineToTx(100 * scale, -40 * scale);
      lineToTx(160 * scale, -50 * scale);
      lineToTx(180 * scale, -60 * scale);
      lineToTx(200 * scale, -80 * scale);
      lineToTx(210 * scale, -90 * scale);
      lineToTx(200 * scale, -75 * scale);
      lineToTx(190 * scale, -60 * scale);
      lineToTx(180 * scale, -55 * scale);
      lineToTx(200 * scale, -50 * scale);
      lineToTx(210 * scale, -60 * scale);
      lineToTx(200 * scale, -45 * scale);
      lineToTx(180 * scale, -50 * scale);
      lineToTx(170 * scale, -45 * scale);
      lineToTx(110 * scale, -30 * scale);
      lineToTx(110 * scale, 15 * scale);
      //End of upper branch

      //Main branch
      lineToTx(80 * scale, 30 * scale);
      lineToTx(100 * scale, 40 * scale);
      lineToTx(140 * scale, 47 * scale);
      lineToTx(170 * scale, 50 * scale);
      lineToTx(180 * scale, 45 * scale);
      lineToTx(220 * scale, 20 * scale);
      lineToTx(300 * scale, -50 * scale);
      lineToTx(230 * scale, 30 * scale);
      lineToTx(170 * scale, 67 * scale);
      lineToTx(200 * scale, 80 * scale);
      lineToTx(250 * scale, 90 * scale);
      lineToTx(300 * scale, 90 * scale);
      lineToTx(250 * scale, 95 * scale);
      lineToTx(200 * scale, 85 * scale);
      lineToTx(160 * scale, 70 * scale);
      lineToTx(120 * scale, 60 * scale);
      lineToTx(130 * scale, 80 * scale);
      lineToTx(170 * scale, 100 * scale);
      lineToTx(130 * scale, 90 * scale);
      lineToTx(110 * scale, 60 * scale);
      lineToTx(70 * scale, 50 * scale);
      lineToTx(50 * scale, 65 * scale);
      lineToTx(0 * scale, 150 * scale);

      context.closePath();
      context.fillStyle = "Black";
      context.fill();

      stack.shift();
    }

    //Draws a tree branch and makes it sway (for variation)
    function DrawBranch2(scale) {

      //Makes the branch sway
      stack.unshift(mat3.clone(stack[0]));
      let TbranchSway = mat3.create();
      mat3.rotate(TbranchSway, TbranchSway, -branchAngle);
      mat3.multiply(stack[0], stack[0], TbranchSway);
      context.beginPath();

      //Main Branch
      moveToTx(0, 100 * scale);
      lineToTx(30 * scale, 50 * scale);
      lineToTx(60 * scale, 30 * scale);

      //Side Branch
      lineToTx(100 * scale, 10 * scale);
      lineToTx(100 * scale, -10 * scale);
      lineToTx(100 * scale, -20 * scale);
      lineToTx(100 * scale, -40 * scale);
      lineToTx(160 * scale, -50 * scale);
      lineToTx(180 * scale, -60 * scale);
      lineToTx(200 * scale, -80 * scale);
      lineToTx(210 * scale, -90 * scale);
      lineToTx(200 * scale, -75 * scale);
      lineToTx(190 * scale, -60 * scale);
      lineToTx(180 * scale, -55 * scale);
      lineToTx(200 * scale, -50 * scale);
      lineToTx(210 * scale, -60 * scale);
      lineToTx(200 * scale, -45 * scale);
      lineToTx(180 * scale, -50 * scale);
      lineToTx(170 * scale, -45 * scale);
      lineToTx(110 * scale, -30 * scale);
      lineToTx(110 * scale, 15 * scale);
      //End of upper branch

      //Main branch
      lineToTx(80 * scale, 30 * scale);
      lineToTx(100 * scale, 40 * scale);
      lineToTx(140 * scale, 47 * scale);
      lineToTx(170 * scale, 50 * scale);
      lineToTx(180 * scale, 45 * scale);
      lineToTx(220 * scale, 20 * scale);
      lineToTx(300 * scale, -50 * scale);
      lineToTx(230 * scale, 30 * scale);
      lineToTx(170 * scale, 67 * scale);
      lineToTx(200 * scale, 80 * scale);
      lineToTx(250 * scale, 90 * scale);
      lineToTx(300 * scale, 90 * scale);
      lineToTx(250 * scale, 95 * scale);
      lineToTx(200 * scale, 85 * scale);
      lineToTx(160 * scale, 70 * scale);
      lineToTx(120 * scale, 60 * scale);
      lineToTx(130 * scale, 80 * scale);
      lineToTx(170 * scale, 100 * scale);
      lineToTx(130 * scale, 90 * scale);
      lineToTx(110 * scale, 60 * scale);
      lineToTx(70 * scale, 50 * scale);
      lineToTx(50 * scale, 65 * scale);
      lineToTx(0 * scale, 150 * scale);

      context.closePath();
      context.fillStyle = "Black";
      context.fill();

      stack.shift();
    }

    //Draws the hills (ground)
    function DrawHill(x, y, size, color) {
      context.beginPath();
      moveToTx(x, y);
      context.arc(x, y, size, Math.PI, 2 * Math.PI);
      context.fillStyle = color;
      context.fill();
    }

    //Draws the ground
    function DrawGround() {
      DrawHill(700, 3150, 2500, "#1e3117");
      DrawHill(600, 1630, 1000, "#084724");
      DrawHill(0, 1500, 800, "#406931");
      DrawHill(700, 2300, 1600, "#3A734D");
    }

    //Draws the grey sky
    function DrawSky() {
      context.rect(0, 0, 1200, 800);
      context.fillStyle = "gray";
      context.fill();
    }

    //Draws the swing and makes it sway (swing) in the wind
    function DrawSwing() {

      //Makes the swing sway
      stack.unshift(mat3.clone(stack[0]));
      let Tswinging = mat3.create();
      mat3.rotate(Tswinging, Tswinging, swingAngle);
      mat3.multiply(stack[0], stack[0], Tswinging);

      //Draws the left rope
      context.beginPath();
      moveToTx(0, 0);
      lineToTx(0, 380);
      context.lineWidth = 1;
      context.strokeStyle = "silver";
      context.stroke();

      //Draws the seat
      context.beginPath();
      moveToTx(-5, 380);
      lineToTx(30, 380);
      context.lineWidth = 3;
      context.strokeStyle = "brown";
      context.stroke();

      //Draws the right rope
      context.beginPath();
      moveToTx(25, 0);
      lineToTx(25, 380);
      context.lineWidth = 1;
      context.strokeStyle = "silver";
      context.stroke();

      stack.shift();
    }

    //Draws everything
    DrawSky();
    stack.unshift(mat3.clone(stack[0]));
    DrawGround();
    DrawTrunk();

    //branch
    let Tbranch1 = mat3.create();
    mat3.fromTranslation(Tbranch1, [900, 370]);
    mat3.multiply(stack[0], stack[0], Tbranch1);
    DrawBranch(1);

    //branch
    stack.shift();
    stack.unshift(mat3.clone(stack[0]));
    let Tbranch2 = mat3.create();
    mat3.fromTranslation(Tbranch2, [900, 130]);
    mat3.rotate(Tbranch2, Tbranch2, 100.7)
    mat3.multiply(stack[0], stack[0], Tbranch2);
    DrawBranch(1.5);

    //branch
    stack.shift();
    stack.unshift(mat3.clone(stack[0]));
    let Tbranch4 = mat3.create();
    mat3.fromTranslation(Tbranch4, [780, 160]);
    mat3.rotate(Tbranch4, Tbranch4, 100)
    mat3.multiply(stack[0], stack[0], Tbranch4);
    DrawBranch2(1.5);

    //branch and swing
    stack.shift();
    stack.unshift(mat3.clone(stack[0]));
    let Tswing = mat3.create();
    mat3.fromTranslation(Tswing, [650, 290]);
    mat3.multiply(stack[0], stack[0], Tswing);
    DrawSwing();
    let Tbranch3 = mat3.create();
    mat3.fromTranslation(Tbranch3, [300, -20]);
    mat3.scale(Tbranch3, Tbranch3, [-1, 1]);
    mat3.rotate(Tbranch3, Tbranch3, 100.2)
    mat3.multiply(stack[0], stack[0], Tbranch3);
    DrawBranch2(2);

    stack.shift();

    z += 0.05;
    x += 0.05;

    window.requestAnimationFrame(draw);
  }

  window.requestAnimationFrame(draw);
}

window.onload = setup;
