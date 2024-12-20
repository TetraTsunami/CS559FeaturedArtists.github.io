let lastX = 0;
let lastY = 0;

let time = 0;

let smoothDx = 0;
let smoothDy = 0;

function setup() {
  "use strict";
  var canvas = document.getElementById("canvas");
  var slider1 = document.getElementById("slider1");
  slider1.value = 0;
  var slider2 = document.getElementById("slider2");
  slider2.value = 0;

  function draw() {
    var context = canvas.getContext("2d");
    canvas.width = canvas.width;

    var x = slider1.value;
    var y = slider2.value;

    // difference between last and current position; delta x and delta y
    var dx = x - lastX;
    var dy = y - lastY;

    // smooth the dx and dy values
    smoothDx += (dx - smoothDx) / 10;
    smoothDy += (dy - smoothDy) / 10;

    if (time > 628) {
      time = 0;
    }

    function DrawPetRock() {
      function DrawRockBase() {
        context.lineWidth = 5;
        context.strokeStyle = "#000000";
        context.fillStyle = "#AAAAAA";
        context.beginPath();
        const circleResolution = 30;
        const circleRadius = 100;
        for (
          let i = 0;
          i < 2 * Math.PI;
          i = i + (2 * Math.PI) / circleResolution
        ) {
          context.lineTo(
            canvas.width / 2 + Math.cos(i) * 1.5 * circleRadius,
            canvas.height / 2 + Math.sin(i) * circleRadius
          );
        }
        context.closePath();
        context.fill();
        context.stroke();
      }

      function DrawEye(xpos, ypos) {
        context.strokeStyle = "#FFFFFF";
        context.fillStyle = "#FFFFFF";
        context.beginPath();

        const circleResolution = 15;
        const circleRadius = 30;
        for (
          let i = 0;
          i < 2 * Math.PI;
          i = i + (2 * Math.PI) / circleResolution
        ) {
          context.lineTo(
            xpos + Math.cos(i) * circleRadius,
            ypos + Math.sin(i) * circleRadius
          );
        }

        context.closePath();
        context.fill();

        function DrawIris() {
          context.fillStyle = "#44A3DD";
          context.beginPath();

          const circleResolution = 15;
          const circleRadius = 16;
          for (
            let i = 0;
            i < 2 * Math.PI;
            i = i + (2 * Math.PI) / circleResolution
          ) {
            context.lineTo(
              xpos +
                Math.sin(time / 4) * smoothDx * 4 +
                Math.cos(i) * circleRadius,
              ypos +
                15 +
                Math.max(
                  -30,
                  ((Math.sin(time / 4) + 1) / 2) * Math.min(0, smoothDy) * 10
                ) +
                Math.sin(i) * circleRadius
            );
          }

          context.closePath();
          context.fill();
        }

        DrawIris();
      }

      function DrawTongue() {
        context.strokeStyle = "#000000";
        context.lineWidth = 5;
        context.fillStyle = "#CC0055";

        const hShakeMagnitude = 5;
        const vShakeMagnitude = 5;

        context.beginPath();
        context.lineTo(370, 240);
        context.lineTo(
          370 + Math.sin(time / 6) * smoothDx * hShakeMagnitude,
          280 + Math.sin(time / 6) * -smoothDy * vShakeMagnitude
        );
        context.lineTo(
          350 + Math.sin(time / 6) * smoothDx * hShakeMagnitude,
          300 + Math.sin(time / 6) * -smoothDy * vShakeMagnitude
        );
        context.lineTo(
          325 + Math.sin(time / 6) * smoothDx * hShakeMagnitude,
          280 + Math.sin(time / 6) * -smoothDy * vShakeMagnitude
        );
        context.lineTo(
          320 + Math.sin(time / 6) * smoothDx * hShakeMagnitude,
          270 + Math.sin(time / 6) * -smoothDy * vShakeMagnitude
        );
        context.lineTo(320, 260);
        context.closePath();
        context.fill();
      }

      function DrawSmile() {
        context.lineWidth = 17;
        context.strokeStyle = "#F7D83E";
        context.beginPath();

        const circleResolution = 15;
        const circleRadius = 80;
        for (let i = 0; i <= 3.14; i = i + (2 * Math.PI) / circleResolution) {
          context.lineTo(
            canvas.width / 2 + Math.cos(i) * circleRadius,
            canvas.height / 2 + 20 + (Math.sin(i) * circleRadius) / 2
          );
        }

        context.stroke();
      }

      DrawRockBase();
      DrawEye(canvas.width / 2 - 70, canvas.height / 2 - 30);
      DrawEye(canvas.width / 2 + 70, canvas.height / 2 - 30);
      DrawTongue();
      DrawSmile();
    }

    context.save();
    context.translate(x, y);
    DrawPetRock();
    context.restore();

    lastX = slider1.value;
    lastY = slider2.value;

    time++;

    window.requestAnimationFrame(draw);
  }
  window.requestAnimationFrame(draw);
}
window.onload = setup;
