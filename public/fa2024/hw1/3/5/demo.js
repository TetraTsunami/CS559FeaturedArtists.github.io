function setup() {
    "use strict";
    var canvas = document.getElementById('myCanvas');
    var slider1 = document.getElementById('slider1');
    slider1.value = 50;
    var slider2 = document.getElementById('slider2');
    slider2.value = 50;
    var slider3 = document.getElementById('slider3');
    slider3.value = 0;

    function draw() {
        var context = canvas.getContext('2d');
        canvas.width = canvas.width;
        // use the sliders to get various parameters
        var greenSquareSize = slider1.value;
        var squareSize = slider2.value;
        var angle = slider3.value;

        context.beginPath();
        context.rect(300, 0, greenSquareSize, greenSquareSize);
        context.fillStyle = "#30ffa4";
        context.fill();

        context.beginPath();
        context.rect(0, 0, squareSize, squareSize);
        context.rect(0, 0, squareSize * 2, squareSize);
        context.rect(0, 0, squareSize, squareSize * 2);
        context.strokeStyle = "#306ae5";
        context.fillStyle = "#46e822";
        context.lineWidth = 12;
        context.stroke();
        context.fill();

        context.lineWidth = 4;

        context.beginPath();
        context.moveTo(150, 125);
        context.lineTo(125, 175);
        context.lineTo(175, 175);
        context.closePath();
        context.fillStyle = "#d744f5";
        context.fill();
        context.stroke();

        context.beginPath();
        const offset = 20;
        context.moveTo(300 - offset, 300 - offset);
        context.lineTo(350 - offset, 350 - offset);
        context.lineTo(325 - offset, 400 - offset);
        context.lineTo(275 - offset, 400 - offset);
        context.lineTo(250 - offset, 350 - offset);
        context.closePath();
        context.strokeStyle = "#936000";
        context.stroke();

        context.beginPath();
        context.moveTo(300, 100);
        context.lineTo(320, 150);
        context.lineTo(370, 150);
        context.lineTo(330, 180);
        context.lineTo(350, 230);
        context.lineTo(300, 200);
        context.lineTo(250, 230);
        context.lineTo(270, 180);
        context.lineTo(230, 150);
        context.lineTo(280, 150);
        context.closePath();
        context.strokeStyle = "#000000";
        context.stroke();

        context.save();
        context.translate(100, 250);
        context.rotate((Math.PI / 180) * angle);
        context.translate(-300, -300);

        context.beginPath();
        context.moveTo(300, 300);
        context.lineTo(350, 350);
        context.lineTo(325, 400);
        context.lineTo(275, 400);
        context.lineTo(250, 350);
        context.closePath();
        context.strokeStyle = "#ff5733";
        context.stroke();

        context.restore();

    }

    slider1.addEventListener("input", draw);
    slider2.addEventListener("input", draw);
    slider3.addEventListener("input", draw);
    draw();
}

window.onload = setup;


