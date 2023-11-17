function setup() {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var rotateVal = 0; 
    var traverseVal = 0; 
    var pos = 0; 

    function draw() {
        canvas.width = canvas.width; 
        traverseVal += 0.001; 
        traverseVal = traverseVal % 1; 
        rotateVal += 0.01 * Math.PI;
        rotateVal = rotateVal % (2 * Math.PI); 

        function moveToTx(loc,Tx)
	    {var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.moveTo(res[0],res[1]);}

	    function lineToTx(loc,Tx)
	    {var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.lineTo(res[0],res[1]);}

        function arcTx(x, y, radius, Tx)
	    {var res=vec2.create(); vec2.transformMat3(res,[x,y],Tx); context.arc(res[0],res[1], radius, 0, 2 * Math.PI);}

        function drawStickMan(color,Tx) {

            context.lineWidth = 2;
            context.strokeStyle = color;
    
            context.beginPath();
            moveToTx([0, 0], Tx);     // (60, 125) transformed to (0, 0)
            lineToTx([8, -10], Tx);   // (68, 115) transformed
            lineToTx([16, 0], Tx);    // (76, 125) transformed
            moveToTx([8, -10], Tx);   // (68, 115) transformed
            lineToTx([8, -25], Tx);   // (68, 100) transformed
            moveToTx([3, -18], Tx);   // (63, 107) transformed
            lineToTx([13, -18], Tx);  // (73, 107) transformed
            moveToTx([8, -25], Tx);
            arcTx(8, -35, 10, Tx);

            context.closePath();
            context.fill();
        }

        var Hermite = function(t) {
            return [
            2*t*t*t-3*t*t+1,
            t*t*t-2*t*t+t,
            -2*t*t*t+3*t*t,
            t*t*t-t*t
            ];
        }
    
        var HermiteDerivative = function(t) {
                return [
            6*t*t-6*t,
            3*t*t-4*t+1,
            -6*t*t+6*t,
            3*t*t-2*t
                ];
        }

        function Cubic(basis,P,t){
            var b = basis(t);
            var result=vec2.create();
            vec2.scale(result,P[0],b[0]);
            vec2.scaleAndAdd(result,result,P[1],b[1]);
            vec2.scaleAndAdd(result,result,P[2],b[2]);
            vec2.scaleAndAdd(result,result,P[3],b[3]);
            return result;
        }

        
        var ballLine = function(t) { // make this animated, not having to do with the slider 
            var x = t;
            var y = (t*t*t); 

            var rotX = x * Math.cos(rotateVal) - y * Math.sin(rotateVal);
            var rotY = x * Math.sin(rotateVal) + y * Math.cos(rotateVal);

            return [rotX, rotY]; 
        }

        var circleDraw = function(t) {
            var x = 0.5 * Math.cos(t);
            var y = 0.5 * Math.sin(t);
        
            return [x, y];
        }

        var tailDraw = function(t) {
            var x = t-4;
            var y = (t*t*0.6); 
            return [x, y]; 
        }

        var bow = function(t) {
            var x = t-1;
            var y = (t*t); 
            return [x, y]; 
        }

        var stern = function(t) {
            var x = t+5;
            var y = (t*t*t); 
            return [x, y]; 
        }

        var line = function(t) {
            var x = t;
            var y = (t*t)*(-1-0.5) + t*(2+2) - 2; 
            return [x, y]; 
        }

        var flatLine = function(t) {
            var x = t;
            var y = 0; 

            return [x, y]; 
        }
        
        var p0 = [0, 0]; 
        var d0 = [-1, 0]; 
        var p1 = [-3.5, -.5];
        var d1 = [-1, -2];
        var p2 = [-4,0];
        var d2 = [0, 3];
        var p3 = [0,2];
        var d3 = [0,5]; 
        var p4 = [1,4];
        var d4 = [2, 3];
        var p5 = [0,0];
        var d5 = [0,11]; 

        var objp0 = [0, 0]; 
        var objd0 = [0, 1];
        var objp1 = [1, 1];
        var objd1 = [2, 1]; 
        
        var P0 = [p0,d0,p1,d1];
        var P1 = [p1,d1,p2,d2]; 
        var P2 = [p2, d2, p3, d3]; 
        var P3 = [p3, d3, p4, d4]; 
        var P4 = [p4, d4, p5, d5]; 

        var Objp0 = [objp0, objd0, objp1, objd1];


        var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
        var C1 = function(t_) {return Cubic(Hermite,P1,t_);};
        var C2 = function(t_) {return Cubic(Hermite,P2,t_);};
        var C3 = function(t_) {return Cubic(Hermite,P3,t_);};
        var C4 = function(t_) {return Cubic(Hermite,P4,t_);};

        var objC0 = function(t_) {return Cubic(Hermite,Objp0,t_);};

        var C0prime = function(t_) {return Cubic(HermiteDerivative,P0,t_);};
        var C1prime = function(t_) {return Cubic(HermiteDerivative,P1,t_);};
        var C2prime = function(t_) {return Cubic(HermiteDerivative,P2,t_);};
        var C3prime = function(t_) {return Cubic(HermiteDerivative,P3,t_);};
        var C4prime = function(t_) {return Cubic(HermiteDerivative,P4,t_);};

        var objC0prime = function(t_) {return Cubic(HermiteDerivative,Objp0,t_);};


        var Ccomp = function (tVal) {
            var curveNum = Math.floor(tVal * 5);
            var local = (tVal * 5) - curveNum;
            var pos = 0;
            
            // Determine the selected curve and calculate the position on it
            if (curveNum === 0) {
                pos = C0(local);
            } else if (curveNum === 1) {
                pos = C1(local);
            } else if (curveNum === 2) {
                pos = C2(local);
            } else if (curveNum === 3) {
                pos = C3(local);
            } else if (curveNum === 4) {
                pos = C4(local);
            } 

            console.log(curveNum);
    
            return pos;
        }

        pos = Ccomp(traverseVal); 

        var Ccomp_tangent = function(t) {
            var u = t; 
            return objC0prime(u); 
        }

        function drawTrajectory(t_begin,t_end,intervals,C,Tx,color) {
            context.strokeStyle=color;
            context.beginPath();
            context.lineWidth = 3; 
            moveToTx(C(t_begin),Tx);
            for(var i=1;i<=intervals;i++){
                var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
                lineToTx(C(t),Tx);
            }
            
            context.stroke();
        }

        function drawEye(Tx) {
            context.beginPath(); 
            context.fillStyle = 'black';
            
            arcTx(0.3, 3, 5, Tx);

            context.closePath();
            context.fill(); 
        }
        function drawPoint(Tx) {
            context.beginPath(); 
            context.fillStyle = 'black';
            
            arcTx(0, 0, 10, Tx);

            context.closePath();
            context.fill(); 
        }
        

        var ball = mat3.create();
        mat3.fromTranslation(ball, [800, 340]);
        mat3.scale(ball, ball, [100, -100]);

        drawTrajectory(0, 2*Math.PI, 100, circleDraw, ball, 'black'); 
        mat3.scale(ball, ball, [0.5, 0.5]); 
        drawTrajectory(-0.83, 0, 100, ballLine, ball, 'red'); 
        drawTrajectory(0, 0.83, 100, ballLine, ball, 'blue'); 
        

        var boat = mat3.create(); 
        mat3.fromTranslation(boat, [300, 890]);
        mat3.scale(boat, boat, [100, -100]);

        drawTrajectory(-2, 0, 100, bow, boat, 'red'); 
        drawTrajectory(0, 1.5, 100, stern, boat, 'blue'); 
        drawTrajectory(-1, 5, 100, flatLine, boat, 'blue'); 

        var dogDraw = mat3.create(); 
        mat3.fromTranslation(dogDraw, [700, 800]);
        mat3.scale(dogDraw, dogDraw, [100, -100]);

        
        drawTrajectory(-1, 0, 100, tailDraw, dogDraw, 'green'); 
        drawTrajectory(0, 1, 100, C0, dogDraw, 'green'); 
        drawTrajectory(0, 1, 100, C1, dogDraw, 'blue'); 
        drawTrajectory(0, 1, 100, C2, dogDraw, 'red'); 
        drawTrajectory(0, 1, 100, C3, dogDraw, 'black'); 
        drawTrajectory(0, 1, 100, C4, dogDraw, 'blue'); 
        drawEye(dogDraw); 

        
        var point_on_dog = mat3.create();
        var point = mat3.create(); // Define the point matrix
        mat3.fromTranslation(point_on_dog, pos); // Apply translation to point_on_dog
        mat3.multiply(point, dogDraw, point_on_dog); // Multiply point by dogDraw
        drawPoint(point); // Draw the point

        requestAnimationFrame(draw);
    }
    draw();
}
window.onload = setup;