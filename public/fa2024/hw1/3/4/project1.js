// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
//      -> used everytime i drew a circle (using arc())
// week2 demos
//      -> used demo2 for sliders, used demo3 for stroke and fill + their styles  


function setup() { "use strict";
    var canvas = document.getElementById('project1_canvas');
    var eye_slider = document.getElementById('eye_placement');
    eye_slider.value = 0;
    var nose_slider = document.getElementById('nose_length');
    nose_slider.value = 0;
    //var eye_placement = 0;

    function draw() {
        var context = canvas.getContext('2d');
        canvas.width = canvas.width;
        var eye_placement = eye_slider.value;
        var nose_length = nose_slider.value;

        function drawFace() {
            context.fillStyle = "yellow";
            context.strokeStyle = "black";
            context.lineWidth = 8;
            var x = 200;
            var y = 200;
            var radius = 110;
            let startAngle = 0;
            let endAngle = 2 * Math.PI;

            context.arc(x, y, radius, startAngle, endAngle);
            context.stroke();
            context.fill();
        }
        function drawEyeTops() {
            // left
            context.beginPath();
            context.fillStyle = "black";
            context.strokeStyle = "black";
            context.lineWidth = 4;
            context.moveTo(123,170);
            context.lineTo(173,170);
            context.stroke();

            // right
            context.beginPath();
            context.fillStyle = "black";
            context.strokeStyle = "black";
            context.lineWidth = 4;
            context.moveTo(223,170);
            context.lineTo(273,170);
            context.stroke();

        }
        function drawLEye() {
            context.beginPath();
            context.fillStyle = "black";
            var x = 138;
            // + eye_placement;
            var y = 170;
            var radius = 15;
            let startAngle = 0;
            let endAngle = Math.PI;

            context.arc(x, y, radius, startAngle, endAngle);
            context.fill();
        }
        function drawREye() {
            context.beginPath();
            context.fillStyle = "black";
            var x = 238;
            // + eye_placement;
            var y = 170;
            var radius = 15;
            let startAngle = 0;
            let endAngle = Math.PI;

            context.arc(x, y, radius, startAngle, endAngle);
            context.fill();
        }
        function drawNose() {
            context.beginPath();
            context.fillStyle = "yellow";
            context.moveTo(200,200);
            context.lineTo(nose_length,215);
            context.lineTo(200,230);
            context.strokeStyle = "black";
            context.lineWidth = 4;
            //context.closePath();
            context.stroke();
            //context.fill();

        }
        function drawMouth() {
            context.beginPath();
            context.rect(140,240,120,30);
            context.strokeStyle = "black";
            context.fillStyle = "#dfdfde";
            context.lineWidth = 8;
            context.stroke();
            context.fill();
        }
        drawFace();
        drawEyeTops();
        drawNose();
        drawMouth();
        context.save();
        context.translate(eye_placement,0);
        drawLEye();
        drawREye();
        context.restore();
        //eye_placement = (eye_placement + 2) % 40;
        //window.requestAnimationFrame(draw);
    }
    eye_slider.addEventListener("input",draw);
    nose_slider.addEventListener("input",draw);
    draw();
    //window.requestAnimationFrame(draw);
}
window.onload = setup;