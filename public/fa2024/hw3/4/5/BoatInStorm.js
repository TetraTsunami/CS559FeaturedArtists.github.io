function setUp() {
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext('2d');

    var canvasMatrix = mat3.create();

    var boatX = 300;
    var animatedOceanValue = 0;
    var animatedWheelValue = 100;
    var animatedSkyValue = 0;
    var light1Count = 0;
    var light2Count = 0;


    function moveToTx(loc, Tx) { var res = vec2.create(); vec2.transformMat3(res, loc, Tx); context.moveTo(res[0], res[1]); }

    function lineToTx(loc, Tx) { var res = vec2.create(); vec2.transformMat3(res, loc, Tx); context.lineTo(res[0], res[1]); }

    function drawTrajectory(t_begin, t_end, intervals, C, Tx, color) {
        context.strokeStyle = color;
        context.beginPath();
        moveToTx(C(t_begin), Tx);
        for (var i = 1; i <= intervals; i++) {
            var t = ((intervals - i) / intervals) * t_begin + (i / intervals) * t_end;
            lineToTx(C(t), Tx);
        }
        context.stroke();
        context.closePath();

    }


    function axes(color) {
        context.strokeStyle = color;
        context.beginPath();
        // Axes
        context.moveTo(120, 0); context.lineTo(0, 0); context.lineTo(0, 120);
        // Arrowheads
        context.moveTo(110, 5); context.lineTo(120, 0); context.lineTo(110, -5);
        context.moveTo(5, 110); context.lineTo(0, 120); context.lineTo(-5, 110);
        // X-label
        context.moveTo(130, -5); context.lineTo(140, 5);
        context.moveTo(130, 5); context.lineTo(140, -5);
        // Y-label
        context.moveTo(-5, 130); context.lineTo(0, 135); context.lineTo(5, 130);
        context.moveTo(0, 135); context.lineTo(0, 142);

        context.stroke();
        context.closePath();
    }

    function background() {
        context.beginPath();
        context.fillStyle = "lightgrey";
        context.rect(0, 0, 1000, 1000);
        context.fill();
        context.stroke();
        context.closePath();


    }

    function boat(x, y) {
        var xPos = x;
        var yPos = y;
        context.lineWidth = 5;
        context.strokeStyle = "black";

        function drawBody(x, y) {
            // create the body of the boat
            context.beginPath();
            context.fillStyle = "brown";
            context.moveTo(xPos, yPos);
            xPos += 450;
            context.lineTo(xPos, yPos);
            yPos -= 100;
            context.lineTo(xPos, yPos);
            xPos -= 525;
            context.lineTo(xPos, yPos);
            xPos = x;
            yPos = y;
            context.lineTo(xPos, yPos);
            context.fill();
            context.closePath();
            context.stroke();
        }

        function drawTopDeck(x, y) {
            // create the top deck
            context.beginPath();
            context.fillStyle = "tan";
            xPos = x + 125;
            yPos = y - 175;
            context.rect(xPos, yPos, 275, 75);
            context.fill();
            context.closePath();
            context.stroke();

            context.beginPath();
            xPos -= 25;
            yPos -= 25;
            context.fillStyle = "brown";
            context.rect(xPos, yPos, 325, 25);
            context.fill();
            context.closePath();
            context.stroke();
        }

        function drawSmokeStacks(x, y) {
            // create the smoke stacks
            context.beginPath();
            context.fillStyle = "brown";
            yPos = y - 50;
            xPos = x + 75;
            context.rect(xPos, yPos, 25, 50);
            xPos += 50;
            context.rect(xPos, yPos, 25, 50);
            xPos += 50;
            context.rect(xPos, yPos, 25, 50);
            xPos += 50;
            context.rect(xPos, yPos, 25, 50);
            context.fill();
            context.closePath();
            context.stroke();

            // create big stack
            context.beginPath();
            context.fillStyle = "lightgrey";
            xPos += 50;
            context.rect(xPos, yPos, 40, 50);
            xPos += 10;
            yPos -= 40;
            context.rect(xPos, yPos, 20, 40);
            context.fill();
            context.closePath();
            context.stroke();



            // create rope
            context.beginPath();
            context.fillStyle = "tan";
            xPos -= 185;
            yPos += 60;
            context.rect(xPos, yPos, 125, 10);
            context.fill();
            context.closePath();
            context.stroke();

        }


        function drawWindows(x, y) {
            // creates the windows
            context.beginPath();
            context.fillStyle = "yellow";

            xPos = x - 75;
            yPos = y + 90;

            context.moveTo(xPos, yPos);
            context.arc(xPos, yPos, 20, 3 * Math.PI / 2, Math.PI / 2, false);

            xPos += 70;
            context.moveTo(xPos, yPos);
            context.arc(xPos, yPos, 20, 0, 2 * Math.PI);

            xPos += 70;
            context.moveTo(xPos, yPos);
            context.arc(xPos, yPos, 20, 0, 2 * Math.PI);

            xPos += 70;
            context.moveTo(xPos, yPos);
            context.arc(xPos, yPos, 20, 0, 2 * Math.PI);

            context.fill();
            context.closePath();
            context.stroke();
        }

        drawBody(xPos, yPos);
        drawTopDeck(xPos, yPos);
        drawSmokeStacks(xPos, yPos);
        drawWindows(xPos, yPos);
    }

    function wheel(x, y, theta, Tx) {

        function wheelBoard(angle, matrix) {
            var rotate = matrix;
            mat3.rotate(rotate, rotate, angle);
            applyTransform(rotate);
            context.beginPath();
            context.rect(0, 0, 25, 165);
            context.fill();
            context.stroke();
            context.closePath();
            applyTransform(canvasMatrix);

        }

        context.lineWidth = 4;
        context.fillStyle = "white";
        var xPos = x;
        var yPos = y;
        var angleConstant = Math.PI / 4;

        var rotate1 = Tx;
        mat3.translate(rotate1, rotate1, [xPos, yPos]);
        mat3.rotate(rotate1, rotate1, theta);
        applyTransform(rotate1);
        context.beginPath();
        context.strokeStyle = "white";
        context.lineWidth = 8;
        context.arc(0, 0, 100, 0, 4 * Math.PI);
        context.arc(0, 0, 110, 0, 4 * Math.PI);
        context.arc(0, 0, 120, 0, 4 * Math.PI);
        context.stroke();
        context.closePath();
        context.strokeStyle = "black";
        context.lineWidth = 3;
        context.beginPath();
        context.rect(0, 0, 25, 165);
        context.fill();
        context.stroke();
        context.closePath();
        applyTransform(canvasMatrix);

        wheelBoard(angleConstant, Tx);
        wheelBoard(2 * angleConstant, Tx);
        wheelBoard(3 * angleConstant, Tx);
        wheelBoard(4 * angleConstant, Tx);
        wheelBoard(5 * angleConstant, Tx);
        wheelBoard(6 * angleConstant, Tx);
        wheelBoard(7 * angleConstant, Tx);

    }

    function applyTransform(matrix) {
        context.setTransform(matrix[0], matrix[1], matrix[3], matrix[4], matrix[6], matrix[7]);
    }

    var sinWave = function (t) {
        var x = t;
        var y = 50 * Math.sin((1 / 50) * t);
        return [x, y];
    }

    var dxSin = function (t) {
        var x = 1;
        var y = Math.cos((1 / 50) * t);
        return [x, y];
    }

    function ocean(y, isFront) {
        context.lineWidth = 10;
        var wave = mat3.create();
        mat3.fromTranslation(wave, [500, y + 600]);
        applyTransform(wave);
        //drawTrajectory(-500,500,1000,sinWave,canvasMatrix,"red");

        if (isFront) {
            context.lineWidth = 1;
            context.fillStyle = "blue";
            context.strokeStyle = "blue";
            context.beginPath();
            context.moveTo(-500, 50 * Math.sin(-500 / 50) + 25);
            context.lineTo(-500, 600);
            context.lineTo(500, 600)
            context.lineTo(500, 50 * Math.sin(-500 / 50) + 25);
            context.stroke();
            context.closePath();
            context.fill();

            context.beginPath();
            context.arc(-400, 50 * Math.sin(-500 / 50) + 25, 100, 0, 2 * Math.PI);
            context.arc(-200, 50 * Math.sin(-500 / 50) + 25, 100, 0, 2 * Math.PI);
            context.arc(0, 50 * Math.sin(-500 / 50) + 25, 100, 0, 2 * Math.PI);
            context.arc(200, 50 * Math.sin(-500 / 50) + 25, 100, 0, 2 * Math.PI);
            context.arc(400, 50 * Math.sin(-500 / 50) + 25, 100, 0, 2 * Math.PI);
            context.stroke();
            context.fill();

        }
        else {
            context.fillStyle = "darkblue";
            context.strokeStyle = "darkblue";
            context.beginPath();
            context.moveTo(-500, 50 * Math.sin(-500 / 50) + 50);
            context.lineTo(-500, 600);
            context.lineTo(500, 600)
            context.lineTo(500, 50 * Math.sin(-500 / 50) + 50);
            context.stroke();
            context.closePath();
            context.fill();

            context.beginPath();
            context.arc(-450, 50 * Math.sin(-500 / 50) + 50, 100, 0, 2 * Math.PI);
            context.arc(-250, 50 * Math.sin(-500 / 50) + 50, 100, 0, 2 * Math.PI);
            context.arc(-50, 50 * Math.sin(-500 / 50) + 50, 100, 0, 2 * Math.PI);
            context.arc(150, 50 * Math.sin(-500 / 50) + 50, 100, 0, 2 * Math.PI);
            context.arc(350, 50 * Math.sin(-500 / 50) + 50, 100, 0, 2 * Math.PI);
            context.arc(550, 50 * Math.sin(-500 / 50) + 50, 100, 0, 2 * Math.PI);
            context.stroke();
            context.fill();
        }

    }

    function sky(color, xOffset, yOffset, isLightning1, isLightning2) {
        var skyMatrix = mat3.create();
        mat3.fromTranslation(skyMatrix, [xOffset, 100 + yOffset]);
        applyTransform(skyMatrix);


        context.lineWidth = 1;
        context.fillStyle = color;
        context.strokeStyle = color;
        context.beginPath();
        context.arc(-100, 0, 100, 0, 2 * Math.PI);
        context.arc(0, 0, 100, 0, 2 * Math.PI);
        context.arc(100, 0, 100, 0, 2 * Math.PI);
        context.arc(200, 0, 100, 0, 2 * Math.PI);
        context.arc(300, 0, 100, 0, 2 * Math.PI);
        context.arc(400, 0, 100, 0, 2 * Math.PI);
        context.arc(500, 0, 100, 0, 2 * Math.PI);
        context.arc(600, 0, 100, 0, 2 * Math.PI);
        context.arc(700, 0, 100, 0, 2 * Math.PI);
        context.arc(800, 0, 100, 0, 2 * Math.PI);
        context.arc(900, 0, 100, 0, 2 * Math.PI);
        context.arc(1000, 0, 100, 0, 2 * Math.PI);
        context.fill();
        context.stroke();

        if (isLightning1) {

            var lightningMatrix1 = mat3.create();
            mat3.copy(lightningMatrix1, skyMatrix);

            context.lineWidth = 1;
            context.fillStyle = "yellow";
            context.strokeStyle = "yellow";
            mat3.translate(lightningMatrix1, lightningMatrix1, [300, 0]);
            applyTransform(lightningMatrix1);
            context.beginPath();
            context.rect(0, 0, 25, 100);
            context.stroke();
            context.fill();

            mat3.translate(lightningMatrix1, lightningMatrix1, [10, 75]);
            mat3.rotate(lightningMatrix1, lightningMatrix1, Math.PI / 4);
            applyTransform(lightningMatrix1);
            context.beginPath();
            context.rect(0, 0, 25, 100);
            context.stroke();
            context.fill();

            mat3.translate(lightningMatrix1, lightningMatrix1, [0, 100]);
            mat3.rotate(lightningMatrix1, lightningMatrix1, 6 * Math.PI / 4);
            applyTransform(lightningMatrix1);
            context.beginPath();
            context.rect(0, 0, 25, 100);
            context.stroke();
            context.fill();

        }

        if (isLightning2) {
            var lightningMatrix2 = mat3.create();
            mat3.copy(lightningMatrix2, skyMatrix);

            context.lineWidth = 5;
            context.fillStyle = "yellow";
            context.strokeStyle = "yellow";
            mat3.translate(lightningMatrix2, lightningMatrix2, [600, -50]);
            applyTransform(lightningMatrix2);
            context.beginPath();
            context.rect(0, 0, 25, 100);
            context.stroke();
            context.fill();

            mat3.translate(lightningMatrix2, lightningMatrix2, [10, 75]);
            mat3.rotate(lightningMatrix2, lightningMatrix2, Math.PI / 4);
            applyTransform(lightningMatrix2);
            context.beginPath();
            context.rect(0, 0, 25, 100);
            context.stroke();
            context.fill();

            mat3.translate(lightningMatrix2, lightningMatrix2, [0, 100]);
            mat3.rotate(lightningMatrix2, lightningMatrix2, 6 * Math.PI / 4);
            applyTransform(lightningMatrix2);
            context.beginPath();
            context.rect(0, 0, 25, 100);
            context.stroke();
            context.fill();
        }
    }

    function draw() {
        canvas.width = canvas.width;
        background();

        var oceanY = Math.sin((0.8) * animatedOceanValue) * 100;

        var num = 0.5;

        ocean(oceanY, true);
        var boatLoc = mat3.create();
        mat3.fromTranslation(boatLoc, [500, oceanY + 600]);
        mat3.translate(boatLoc, boatLoc, sinWave(boatX));
        var tangent = dxSin(boatX);
        var angle = Math.atan2(tangent[1], tangent[0]);
        mat3.rotate(boatLoc, boatLoc, angle);
        mat3.scale(boatLoc, boatLoc, [num, num]);
        applyTransform(boatLoc);
        context.lineWidth = 10;
        //axes("purple");
        boat(-225, 0);
        var theta1 = 2 * animatedWheelValue * Math.PI;
        wheel(470 - 225, - 110, theta1, boatLoc);
        applyTransform(canvasMatrix);
        ocean(oceanY, false);
        applyTransform(canvasMatrix);


        var light1 = false;
        var light2 = false;
        if (light1Count >= 60 && light1Count < 100) {
            light1 = true;

        }
        if (light1Count == 100) {
            light1 = true;
            light1Count = 0;
        }
        if (light2Count >= 10 && light2Count < 40) {
            light2 = true;

        }
        if (light2Count == 100) {
            light2Count = 0;
        }

        sky("darkgrey", 50 + animatedSkyValue, 0, light1, light2);
        applyTransform(canvasMatrix);
        sky("grey", 0 + animatedSkyValue, -50, false, false);

        if (boatX >= -700) {
            boatX -= 3;
        }
        else {
            boatX = 850;
        }

        if (animatedWheelValue < -1) {
            animatedWheelValue = 1;

        }
        else {
            animatedWheelValue -= 0.005;

        }

        if (animatedSkyValue < 100) {
            animatedSkyValue += 0.5;
        }
        else {
            animatedSkyValue = 0;
        }


        light1Count += 0.5;
        light2Count += 0.25;
        animatedOceanValue += 1 / 45;
        window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);

}
window.onload = setUp;