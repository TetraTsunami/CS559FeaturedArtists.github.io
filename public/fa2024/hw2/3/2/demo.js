function setup() {
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");
    var hourAngle = 0;
    var minuteAngle = 0;
    var hourSpeed = Math.PI / 180;
    var minuteSpeed = Math.PI / 30;
    var aroundAngle = 0;
    var aroundSpeed = Math.PI / 360;

    var speedMult = 1;
    var slider = document.getElementById("slider");
    var speed = document.getElementById("speed");

    slider.addEventListener("input", function(){
        speedMult = parseFloat(slider.value);
        speed.textContent = speedMult + "x";

    });

    function drawHand(length, width, rotation){
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2); 
        context.rotate(rotation);
        context.beginPath();
        context.moveTo(0,0);
        context.lineTo(length, 0);
        context.lineWidth = width;
        context.strokeStyle = "black";
        context.stroke();
        context.restore();
    }

    function drawSun(){
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2); 
        context.rotate(aroundAngle);
        context.beginPath();
        context.arc(150, 0, 20, 0, 2 * Math.PI); 
        context.fillStyle = "Orange";
        context.fill();
        context.translate(150, 0)
        for (var i = 0; i < 12; i++) {
            context.save();
            context.rotate(i *Math.PI / 6);
            context.beginPath();
            context.moveTo(30, 0);
            context.lineTo(40, 0);
            context.lineWidth = 4;
            context.strokeStyle = "red";
            context.stroke();
            context.restore();
        }
        context.restore();
    }

    function drawMoon(){
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2); 
        context.rotate(aroundAngle);
        context.beginPath();
        context.arc(-150, 0, 35, 0, 2 * Math.PI); 
        context.fillStyle = "yellow";
        context.fill();
        context.beginPath();
        context.arc(-130, 0, 20, 0, 2 * Math.PI);
        context.fillStyle = "white"; 
        context.fill();
        context.restore();
    }

    function drawClock() {
        canvas.width = canvas.width; 
        context.save(); 
        context.translate(canvas.width / 2, canvas.height / 2); 
        context.beginPath();
        context.arc(0, 0, 100, 0, 2 * Math.PI); 
        context.lineWidth = 4; 
        context.strokeStyle = "black"; 
        context.stroke();

        for (var i = 0; i < 12; i++) {
            context.save();
            context.rotate(i *Math.PI / 6);
            context.beginPath();
            context.moveTo(80, 0);
            context.lineTo(100, 0);
            context.lineWidth = 4;
            context.stroke();
            context.restore();
        }
        context.restore();

        drawSun();
        drawMoon();

        drawHand(70, 8, hourAngle);
        drawHand(100, 5, minuteAngle);

        hourAngle += hourSpeed * speedMult;
        minuteAngle += minuteSpeed * speedMult;

        aroundAngle += aroundSpeed * speedMult;

        requestAnimationFrame(drawClock);
    }

    drawClock(); 
}

window.onload = setup;

// web that helps : https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener