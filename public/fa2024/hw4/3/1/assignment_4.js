function setup() {
    var canvas = document.getElementById('canvas');

    var objectPosition = 0;

    function draw() {
        var context = canvas.getContext("2d");
        canvas.width = canvas.width; // reset canvas

        // Obtained from in-class demo
        function moveToTx(loc, Tx) {
            var res = vec2.create();
            vec2.transformMat3(res, loc, Tx);
            context.moveTo(res[0], res[1]);
        }
    
        // Obtained from in-class demo
        function lineToTx(loc, Tx) {
            var res = vec2.create();
            vec2.transformMat3(res, loc, Tx);
            context.lineTo(res[0], res[1]);
        }

        // Obtained from in-class demo
        var Hermite = function(t) {
            return [
            2*t*t*t - 3*t*t + 1,
            t*t*t - 2*t*t + t,
            -2*t*t*t + 3*t*t,
            t*t*t - t*t
            ];
        }
        
        // Obtained from in-class demo
        function Cubic(basis, P, t){
            var b = basis(t);
            var result = vec2.create();
            vec2.scale(result, P[0], b[0]);
            vec2.scaleAndAdd(result, result, P[1], b[1]);
            vec2.scaleAndAdd(result, result, P[2], b[2]);
            vec2.scaleAndAdd(result, result, P[3], b[3]);
            return result;
        }    

        // Obtained and modified from in-class demo
        function drawTrajectory(t_begin, t_end, intervals, C, Tx) {
            context.beginPath();
            moveToTx(C(t_begin), Tx);
            for(var i = 1; i <= intervals; i++){
                var t = ((intervals-i)/intervals)*t_begin + (i/intervals)*t_end;
                lineToTx(C(t), Tx);
            }
            context.stroke();
        }
    
        function circle(x, y, r, Tx) {
            context.beginPath();
            var loc = vec2.create();
            vec2.transformMat3(loc, [x, y], Tx);
            context.arc(loc[0], loc[1], r, 0, 2*Math.PI);
            context.fill();
        }

        mainTx = mat3.create();
        mat3.fromTranslation(mainTx, [100, 50]);
        mat3.rotate(mainTx, mainTx, 0.1);

        var p0 = [0,0];
        var d0 = [300, 300];
        var p1 = [300, 150];
        var d1 = [300, -300]
        var p2 = [600, 150];
        var d2 = [300, 300];
        var p3 = [900, 0];
        var d3 = [300, -300];
        var p4 = [450, 500];
        var d4 = [-1000, 0];

        var P0 = [p0,d0,p1,d1];
        var P1 = [p1,d1,p2,d2];
        var P2 = [p2,d2,p3,d3];
        var P3 = [p3,d3,p4,d4];
        var P4 = [p4,d4,p0,d0];


        var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
        var C1 = function(t_) {return Cubic(Hermite,P1,t_);};
        var C2 = function(t_) {return Cubic(Hermite,P2,t_);};
        var C3 = function(t_) {return Cubic(Hermite,P3,t_);};
        var C4 = function(t_) {return Cubic(Hermite,P4,t_);};
        
        var Ccomp = function(t) {
            if (t < 1){
                var u = t;
                return C0(u);
            } else if (t < 2) {
                var u = t-1.0;
                return C1(u);
            } else if (t < 3) {
                var u = t-2.0;
                return C2(u);
            } else if (t < 4) {
                var u = t-3.0;
                return C3(u);
            } else {
                var u = t-4.0;
                return C4(u);
            }
        }
    
        drawTrajectory(0.0,1.0,100,C0,mainTx);
        drawTrajectory(0.0,1.0,100,C1,mainTx);
        drawTrajectory(0.0,1.0,100,C2,mainTx);
        drawTrajectory(0.0,1.0,100,C3,mainTx);
        drawTrajectory(0.0,1.0,100,C4,mainTx);

        context.fillStyle = "red";
        circle(Ccomp(objectPosition)[0], Ccomp(objectPosition)[1], 3, mainTx);

        objectPosition = (objectPosition + 0.01) % 5;

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);    
}

window.onload = setup;