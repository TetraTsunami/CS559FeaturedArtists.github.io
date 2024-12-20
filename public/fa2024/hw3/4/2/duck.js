function setup() {
    var canvas = document.getElementById('canvas');
    var slider = document.getElementById('slider1');
    slider.value = 270;

    function draw() {
        var context = canvas.getContext('2d');
        canvas.width = canvas.width;
        var leftLegAngle = -(slider.value % 50) * 0.005 * Math.PI;
        var leftFootAngle = -2 * leftLegAngle;
        var rightLegAngle = leftLegAngle;
        var rightFootAngle = -leftFootAngle + 20;
        var x = 4 * (270 - slider.value);

        function drawBackground() {
            // sunset
            var grad = context.createRadialGradient(225, 250, 100, 225, 250, 300);
            grad.addColorStop(0, "#FFDEA3");
            grad.addColorStop("0.5", "#EBAE82");
            grad.addColorStop(1, "#A07D82");
            context.fillStyle = grad;
            context.fillRect(0, 0, 450, 235);

            // water
            context.beginPath();
            context.fillStyle = "rgb(87, 184, 188, 1)";
            context.fillRect(0, 235, 450, 175);
        }

        function drawClouds() {
            // cloud #1
            context.fillStyle = "rgb(237, 207, 185, 0.3)";
            context.beginPath();
            context.arc(-260, 100, 25, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(-225, 90, 30, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(-230, 110, 35, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(-190, 100, 30, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(-190, 110, 35, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(-160, 110, 25, 0, 2 * Math.PI);
            context.fill();

            context.fillStyle = "rgb(237, 207, 185, 0.9)";
            context.beginPath();
            context.arc(-260, 100, 20, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(-225, 90, 25, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(-230, 110, 30, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(-190, 100, 25, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(-190, 110, 30, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(-160, 110, 20, 0, 2 * Math.PI);
            context.fill();

            // cloud #2
            context.fillStyle = "rgb(237, 207, 185, 0.3)";
            context.beginPath();
            context.arc(0, 50, 25, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(35, 40, 30, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(30, 60, 35, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(70, 50, 30, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(70, 60, 35, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(100, 60, 25, 0, 2 * Math.PI);
            context.fill();

            context.fillStyle = "rgb(237, 207, 185, 0.9)";
            context.beginPath();
            context.arc(0, 50, 20, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(35, 40, 25, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(30, 60, 30, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(70, 50, 25, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(70, 60, 30, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(100, 60, 20, 0, 2 * Math.PI);
            context.fill();
    

            // cloud #3
            context.fillStyle = "rgb(237, 207, 185, 0.3)";
            context.beginPath();
            context.arc(260, 120, 25, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(295, 110, 30, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(290, 130, 35, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(330, 120, 30, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(330, 130, 35, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(360, 130, 25, 0, 2 * Math.PI);
            context.fill();

            context.fillStyle = "rgb(237, 207, 185, 0.9)";
            context.beginPath();
            context.arc(260, 120, 20, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(295, 110, 25, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(290, 130, 30, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(330, 120, 25, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(330, 130, 30, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.arc(360, 130, 20, 0, 2 * Math.PI);
            context.fill();
        }

        function drawDuck() {
            // head
            context.beginPath();
            context.arc(300, 70, 35, 0, 2 * Math.PI);
            context.fillStyle = "#F9EEED";
            context.fill();

            // eye
            context.beginPath();
            context.arc(310, 65, 5, 0, 2 * Math.PI);
            context.fillStyle = "black";
            context.fill();

            context.beginPath();
            context.arc(312, 63, 1, 0, 2 * Math.PI);
            context.fillStyle = "white";
            context.fill();

            // beak
            context.beginPath();
            context.moveTo(333, 60);
            context.lineTo(370, 80);
            context.lineTo(325, 95);
            context.lineTo(320, 80);
            context.fillStyle = "#FF9D5C";
            context.fill();

            // unmoveable part of legs
            context.beginPath();
            context.moveTo(150, 265);
            context.lineTo(165, 265);
            context.lineTo(135, 295);
            context.lineTo(120, 295);
            context.fillStyle = "#FF781F";
            context.fill();

            context.beginPath();
            context.moveTo(190, 265);
            context.lineTo(205, 265);
            context.lineTo(175, 295);
            context.lineTo(160, 295);
            context.fillStyle = "#FF6600";
            context.fill();

            // body
            context.beginPath();
            context.arc(300, 220, 55, 0, 2 * Math.PI);
            context.fillStyle = "#F9EEED";
            context.fill();

            context.beginPath();
            context.arc(120, 220, 50, 0, 2 * Math.PI);
            context.fillStyle = "#F9EEED";
            context.fill();

            context.beginPath();
            context.moveTo(100, 170);
            context.lineTo(300, 165);
            context.lineTo(295, 275);
            context.lineTo(120, 270);
            context.lineTo(75, 240);
            context.lineTo(60, 170);
            context.fillStyle = "#F9EEED";
            context.fill();

            // neck
            context.beginPath();
            context.moveTo(305, 105);
            context.lineTo(353, 205);
            context.lineTo(300, 220);
            context.lineTo(275, 170);
            context.lineTo(280, 160);
            context.lineTo(265, 70);
            context.fillStyle = "#F9EEED";
            context.fill();

            // wing
            context.beginPath();
            context.arc(250, 210, 50, 0, 2 * Math.PI);
            context.fillStyle = "#F5E7E6";
            context.fill();
            
            context.beginPath();
            context.moveTo(70, 170);
            context.lineTo(250, 160);
            context.lineTo(250, 260);
            context.lineTo(160, 235);
            context.lineTo(140, 225);
            context.lineTo(140, 215);
            context.lineTo(120, 205);
            context.lineTo(120, 195);
            context.lineTo(100, 185);
            context.lineTo(100, 180);
            context.fillStyle = "#F5E7E6";
            context.fill();
        }

        function drawLeg(color) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(15, 0);
            context.lineTo(10, 35);
            context.lineTo(0, 0);
            context.fillStyle = color;
            context.fill();
        }

        function drawFoot(color) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(30, 40);
            context.lineTo(10, 35);
            context.lineTo(0, 45);
            context.lineTo(-10, 35);
            context.lineTo(-30, 40);
            context.lineTo(0, 0);
            context.fillStyle = color;
            context.fill();
        }

        function drawWater() {
            // water over body with sun "reflection"
            var grad = context.createRadialGradient(225, 200, 100, 225, 200, 300);
            grad.addColorStop(0, "rgb(255, 222, 163, 0.4)");
            grad.addColorStop("0.5", "rgb(87, 184, 188, 0.4)");
            grad.addColorStop(1, "rgb(37, 159, 175, 0.4)");
            context.fillStyle = grad;
            context.fillRect(0, 235, 450, 175);

            // waves
            /**
             * sources:
             * https://stackoverflow.com/questions/29917446/drawing-sine-wave-in-canvas
             * https://flexbooks.ck12.org/cbook/ck-12-precalculus-concepts-2.0/section/5.5/primary/lesson/frequency-and-period-of-sinusoidal-functions-pcalc/
            */  
            context.beginPath();
            context.strokeStyle = "rgb(87, 184, 188, 0.4)";
            var x = 0;
            var y = 0;
            var a = 1; // amplitude (height of waves)
            var b = 10; // horizontal stretch/frequency (lower = more waves)
            var d = 235; // vertical shift

            if (slider.value % 2 == 0) {
                b = 5;
            }

            while (x <= canvas.width) {
              y = a * Math.sin(x / b) + d;
              context.lineTo(x, y);
              x++;
            }
            context.stroke();
        }

        // from Week 4 Demo 0a
        function setCanvasTransform(Tx) {
            context.setTransform(Tx[0],Tx[1],Tx[3],Tx[4],Tx[6],Tx[7]);
        }



        // background
        var Tcanvas = mat3.create();
        setCanvasTransform(Tcanvas);
        drawBackground();

        // moving clouds
        var Tclouds = mat3.create();
        mat3.fromTranslation(Tclouds, [slider.value, 0]);
        var Tclouds_to_canvas = mat3.create();
        mat3.multiply(Tclouds_to_canvas, Tcanvas, Tclouds);
        setCanvasTransform(Tclouds);
        drawClouds();

        // make duck smaller
        var TshrinkDuck = mat3.create();
        mat3.scale(TshrinkDuck, TshrinkDuck, [0.3, 0.3]);
        var TshrinkDuck_to_canvas = mat3.create();
        mat3.multiply(TshrinkDuck_to_canvas, Tcanvas, TshrinkDuck);
        setCanvasTransform(TshrinkDuck_to_canvas);

        // duck body
        var TduckBody_to_shrinkDuck = mat3.create();
        mat3.fromTranslation(TduckBody_to_shrinkDuck, [x, 540]); // new y-position after shrink
        var TduckBody_to_canvas = mat3.create();
        mat3.multiply(TduckBody_to_canvas, TshrinkDuck_to_canvas, TduckBody_to_shrinkDuck);
        setCanvasTransform(TduckBody_to_canvas);
        drawDuck();

        // right leg
        var TrightLeg_to_duckBody = mat3.create();
        mat3.fromTranslation(TrightLeg_to_duckBody, [160, 295]);
        mat3.rotate(TrightLeg_to_duckBody, TrightLeg_to_duckBody, rightLegAngle);
        var TrightLeg_to_canvas = mat3.create();
        mat3.multiply(TrightLeg_to_canvas, TduckBody_to_canvas, TrightLeg_to_duckBody);
        setCanvasTransform(TrightLeg_to_canvas);
        drawLeg("#FF6600");

        // right foot
        var TrightFoot_to_rightLeg = mat3.create();
        mat3.fromTranslation(TrightFoot_to_rightLeg, [10, 35]);
        mat3.rotate(TrightFoot_to_rightLeg, TrightFoot_to_rightLeg, rightFootAngle);
        var TrightFoot_to_canvas = mat3.create();
        mat3.multiply(TrightFoot_to_canvas, TrightLeg_to_canvas, TrightFoot_to_rightLeg);
        setCanvasTransform(TrightFoot_to_canvas);
        drawFoot("#FF6600");

        // left leg
        var TleftLeg_to_duckBody = mat3.create();
        mat3.fromTranslation(TleftLeg_to_duckBody, [120, 295]);
        mat3.rotate(TleftLeg_to_duckBody, TleftLeg_to_duckBody, leftLegAngle);
        var TleftLeg_to_canvas = mat3.create();
        mat3.multiply(TleftLeg_to_canvas, TduckBody_to_canvas, TleftLeg_to_duckBody);
        setCanvasTransform(TleftLeg_to_canvas);
        drawLeg("#FF781F");

        // left foot
        var TleftFoot_to_leftLeg = mat3.create();
        mat3.fromTranslation(TleftFoot_to_leftLeg, [10, 35]);
        mat3.rotate(TleftFoot_to_leftLeg, TleftFoot_to_leftLeg, leftFootAngle);
        var TleftFoot_to_canvas = mat3.create();
        mat3.multiply(TleftFoot_to_canvas, TleftLeg_to_canvas, TleftFoot_to_leftLeg);
        setCanvasTransform(TleftFoot_to_canvas);
        drawFoot("#FF781F");

        // water covering feet
        setCanvasTransform(Tcanvas);
        drawWater();
    }

    slider.addEventListener("input", draw);
    draw();
}

window.onload = setup;