function setup() {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var slider2 = document.getElementById('slider2');
    slider2.value = 0;

    function draw() {
        canvas.width = canvas.width;
        // use the sliders to get the angles
        var tParam = slider2.value * 0.01;

        function moveToTx(loc, Tx) { var res = vec2.create(); vec2.transformMat3(res, loc, Tx); context.moveTo(res[0], res[1]); }

        function lineToTx(loc, Tx) { var res = vec2.create(); vec2.transformMat3(res, loc, Tx); context.lineTo(res[0], res[1]); }

        function drawObject(color, Tx) {
            context.beginPath();
            context.fillStyle = color;
            moveToTx([-.05, -.05], Tx);
            lineToTx([-.05, .05], Tx);
            lineToTx([.05, .05], Tx);
            lineToTx([.05, -.05], Tx);
            context.closePath();
            context.fill();
        }

        function drawAxes100unit(color, Tx) {
            context.strokeStyle = color;
            context.beginPath();
            // Axes
            moveToTx([120, 0], Tx); lineToTx([0, 0], Tx); lineToTx([0, 120], Tx);
            // Arrowheads
            moveToTx([110, 5], Tx); lineToTx([120, 0], Tx); lineToTx([110, -5], Tx);
            moveToTx([5, 110], Tx); lineToTx([0, 120], Tx); lineToTx([-5, 110], Tx);
            // X-label
            moveToTx([130, 0], Tx); lineToTx([140, 10], Tx);
            moveToTx([130, 10], Tx); lineToTx([140, 0], Tx);
            context.stroke();
        }

        function drawAxes1unit(color, Tx) {
            context.strokeStyle = color;
            context.beginPath();
            // Axes
            moveToTx([1.20, 0], Tx); lineToTx([0, 0], Tx); lineToTx([0, 1.20], Tx);
            // Arrowheads
            moveToTx([1.10, .05], Tx); lineToTx([1.20, 0], Tx); lineToTx([1.10, -.05], Tx);
            moveToTx([.05, 1.10], Tx); lineToTx([0, 1.20], Tx); lineToTx([-.05, 1.10], Tx);
            // X-label
            moveToTx([1.30, 0], Tx); lineToTx([1.40, .10], Tx);
            moveToTx([1.30, .10], Tx); lineToTx([1.40, 0], Tx);
            context.stroke();
        }


        var Bezier = function (t) {
            return [
                (1 - t) ** 3,
                3 * (1 - t) ** 2 * t,
                3 * (1 - t) * t ** 2,
                t ** 3
            ];
        }

        var BezierDerivative = function (t) {
            return [
                3 * ((1 - t) ** 2),
                6 - 12 * t,
                6 * t - 9 * t ** 2,
                3 * t ** 2
            ];
        }

        function Cubic(basis, P, t) {
            var b = basis(t);
            var result = vec2.create();
            vec2.scale(result, P[0], b[0]);
            vec2.scaleAndAdd(result, result, P[1], b[1]);
            vec2.scaleAndAdd(result, result, P[2], b[2]);
            vec2.scaleAndAdd(result, result, P[3], b[3]);
            return result;
        }



        var C0 = function (t) {
            var x = t;
            var y = t * t;
            return [x, y];
        }

        function drawflower(t_begin, t_end, intervals, C, Tx, color) {

            context.fillStyle = color;
            context.beginPath();
            mat3.rotate(Tx, Tx, -Math.PI);
            mat3.rotate(Tx, Tx, Math.PI);
            context.strokeStyle = color;
            context.beginPath();
            moveToTx(C(t_begin), Tx);
            for (var i = 1; i <= intervals; i++) {
                var t = ((intervals - i) / intervals) * t_begin + (i / intervals) * t_end;
                lineToTx(C(t), Tx);
            }
            context.strokeStyle = "red";
            context.stroke();
            context.fill();


        }

        function drawLayer(t_begin, t_end, intervals, C, Tx, color) {

            if (slider2.value <= 80) {
                petalCount = 10
            } else {
                petalCount = 10 + (slider2.value - 85)
            }
            for (let i = 0; i < petalCount; i++) {
                mat3.rotate(Tx, Tx, 1 / petalCount * Math.PI * 2);
                drawflower(t_begin, t_end, intervals, C, Tx, color)
            }

        }

        var r0 = [1, 0];
        var r1 = [2, 2];
        var r2 = [0, 3];
        var r3 = [1, 4];
        var r4 = [3, 0];
        var r5 = [4, 3];
        var r6 = [2, 2.5];
        var r7 = [3, 4];
        var R1 = [r0, r1, r2, r3]; // root
        var P1 = [r4, r5, r6, r7]; // 

        var C1 = function (t_) { return Cubic(Bezier, R1, t_); };
        var C4 = function (t_) { return Cubic(Bezier, P1, t_); };

        var Ccomp = function (t) {
            if (t < 1) {
                var u = t;
                return C1(u);
            } else {
                var u = t - 1.0;
                return C1(u);
            }
        }

        var C2 = function (t) { // C0 continuity at t=1
            var x = t;
            var y = -((t - 1) * (t - 1)) + 1;
            return [x, y];
        }
        var C1e = function (t) {
            var x = t;
            var y = 4 / 5 * t * t
            return [x, y];
        }
        var piceComp = function (t) {
            if (t < 1) {
                return C0(t);
            } else {
                return C2(t);
            }
        }


        function drawTrajectory(t_begin, t_end, intervals, C, Tx, color) {
            context.strokeStyle = color;
            context.beginPath();
            moveToTx(C(t_begin), Tx);
            for (var i = 1; i <= intervals; i++) {
                var t = ((intervals - i) / intervals) * t_begin + (i / intervals) * t_end;
                lineToTx(C(t), Tx);
            }
            context.stroke();
        }

        function drawTrajectoryfill(t_begin, t_end, intervals, C, Tx, color) {
            context.strokeStyle = color;
            context.fillStyle = "#bc6c6c";
            context.beginPath();
            moveToTx(C(t_begin), Tx);
            for (var i = 1; i <= intervals; i++) {
                var t = ((intervals - i) / intervals) * t_begin + (i / intervals) * t_end;
                lineToTx(C(t), Tx);
            }
            context.fill();
            context.stroke();
        }


        var wind = mat3.create();
        mat3.fromTranslation(wind, [0, canvas.height / 3]);
        mat3.scale(wind, wind, [200, -30]);
        drawTrajectory(0.0, 3.0, 100, C1e, wind, "gray");

        mat3.fromTranslation(wind, [100, canvas.height / 3]);
        mat3.scale(wind, wind, [200, -30]);
        drawTrajectory(0.5, 3.0, 100, C1e, wind, "gray");
        mat3.scale(wind, wind, [1 / 3, 1 / 2]);
        drawflower(0.0, 1.0, 100, C0, wind, "pink");
        mat3.fromTranslation(wind, [0, canvas.height / 4]);
        mat3.scale(wind, wind, [200, -30]);
        drawTrajectory(0.3, 1.3, 100, C1e, wind, "gray");
        mat3.scale(wind, wind, [1 / 3, -1 / 2]);
        drawflower(0.0, 1.0, 100, C0, wind, "pink");
        var leaf = mat3.create();
        mat3.fromTranslation(leaf, [300, 90]);
        mat3.scale(leaf, leaf, [200, -80]);
        mat3.scale(leaf, leaf, [1 / 3, 1 / 2]);
        drawflower(0.0, 1.0, 100, C0, leaf, "pink");
        mat3.fromTranslation(leaf, [200, 90]);
        mat3.scale(leaf, leaf, [100, -40]);
        mat3.scale(leaf, leaf, [1 / 3, -1 / 2]);
        drawflower(0.0, 1.0, 100, C0, leaf, "pink");
        mat3.fromTranslation(leaf, [250, 130]);
        mat3.scale(leaf, leaf, [200, -80]);
        mat3.scale(leaf, leaf, [1 / 3, -1 / 2]);
        drawflower(0.0, 1.0, 100, C0, leaf, "pink");


        var ground = mat3.create();
        mat3.fromTranslation(ground, [0, canvas.height]);
        mat3.scale(ground, ground, [200, -90]);
        drawTrajectoryfill(0.0, 2.0, 100, piceComp, ground, "brown");


        var Tblue_to_canvas = mat3.create();
        mat3.fromTranslation(Tblue_to_canvas, [canvas.width / 2, canvas.height / 2]);
        mat3.scale(Tblue_to_canvas, Tblue_to_canvas, [1, -1]);

        var Troot = mat3.create();
        mat3.fromTranslation(Troot, [0, canvas.height - 5]);
        mat3.scale(Troot, Troot, [50, -50]);

        drawTrajectory(0.0, 1.0, 100, C1, Troot, "red");
        drawTrajectory(0.0, 1.0, 100, C4, Troot, "red");

        var Tf = mat3.create();
        mat3.fromTranslation(Tf, Ccomp(tParam));
        mat3.scale(Tf, Tf, [0.3 + tParam, 0.3 + tParam])
        var Tm = mat3.create();
        mat3.multiply(Tm, Troot, Tf);
        drawLayer(0.0, 1.0, 100, C0, Tm, "pink");

        var Tf2 = mat3.create();
        mat3.fromTranslation(Tf2, C4(tParam));
        mat3.scale(Tf2, Tf2, [0.3 + tParam, 0.3 + tParam])
        var Tm2 = mat3.create();
        mat3.multiply(Tm2, Troot, Tf2);
        mat3.scale(Tm2, Tm2, [0.5, 0.5])
        drawLayer(0.0, 1.0, 100, C0, Tm2, "pink");

        var Troot1 = mat3.create();
        mat3.fromTranslation(Troot1, [70, canvas.height - 22]);
        mat3.scale(Troot1, Troot1, [30, -30]);
        drawTrajectory(0.0, 1.0, 100, C1, Troot1, "red");
        var Tm = mat3.create();
        mat3.multiply(Tm, Troot1, Tf);
        drawLayer(0.0, 1.0, 100, C0, Tm, "pink");

        var Troot2 = mat3.create();
        mat3.fromTranslation(Troot2, [180, canvas.height - 90]);
        mat3.scale(Troot2, Troot2, [20, -20]);
        drawTrajectory(0.0, 1.0, 100, C1, Troot2, "red");
        var Tm = mat3.create();
        mat3.multiply(Tm, Troot2, Tf);
        drawLayer(0.0, 1.0, 100, C0, Tm, "pink");

        var Troot3 = mat3.create();
        mat3.fromTranslation(Troot3, [290, canvas.height - 59]);
        mat3.scale(Troot3, Troot3, [-40, -40]);
        drawTrajectory(0.0, 1.0, 100, C1, Troot3, "red");
        var Tm = mat3.create();
        mat3.multiply(Tm, Troot3, Tf);
        drawLayer(0.0, 1.0, 100, C0, Tm, "pink");
        var Troot4 = mat3.create();
        mat3.fromTranslation(Troot4, [300, canvas.height - 20]);
        mat3.scale(Troot4, Troot4, [40, -40]);
        drawTrajectory(0.0, 1.0, 100, C1, Troot4, "red");
        var Tm = mat3.create();
        mat3.multiply(Tm, Troot4, Tf);
        drawLayer(0.0, 1.0, 100, C0, Tm, "pink");
        var Troot5 = mat3.create();
        mat3.fromTranslation(Troot5, [280, canvas.height - 20]);
        mat3.scale(Troot5, Troot5, [20, -20]);
        drawTrajectory(0.0, 1.0, 100, C1, Troot5, "red");
        var Tm = mat3.create();
        mat3.multiply(Tm, Troot5, Tf);
        mat3.scale(Tm, Tm, [0.5, 0.5])
        drawLayer(0.0, 1.0, 100, C0, Tm, "pink");


    }



    slider2.addEventListener("input", draw);
    draw();
}
window.onload = setup;


