function setUp() {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    
    var theta1 = 0;
    var tParam = 0;

    const button = document.getElementById('button');
    
    let buttonValue = 0;

    function changeButton() {
      buttonValue = 1 - buttonValue;
      if (buttonValue == 1) {
        document.querySelector('button').innerHTML = 'Remove Helicopter Path';
      } else {
        document.querySelector('button').innerHTML = 'Show Helicopter Path';
      }
    }

    function draw() {
        canvas.width = canvas.width;
        
        function moveToTx(loc,Tx) {
            var res=vec2.create();
            vec2.transformMat3(res,loc,Tx); 
            context.moveTo(res[0],res[1]);
        }

        function lineToTx(loc,Tx) {
            var res=vec2.create(); 
            vec2.transformMat3(res,loc,Tx); 
            context.lineTo(res[0],res[1]);
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
        
        var p0=[1,0];
	    var d0=[-1,1];
	    var p1=[1/3,1];
	    var d1=[-1,2];
        var p2 = [-2,1];
        var d2 = [-1,-2];
        var p3 = [-1,0];
        var d3 = [-1,-2];
        var p4 = [-2,-1];
        var d4 = [1,-2];
        var p5 = [1/2,-1];
        var d5 = [1,-2];
        var p6 = [1,0];
        var d6 = [-3,3];

        var P0 = [p0,d0,p1,d1]; 
        var P1 = [p1,d1,p2,d2];
        var P2 = [p2,d2,p3,d3];
        var P3 = [p3,d3,p4,d4];
        var P4 = [p4,d4,p5,d5];
        var P5 = [p5,d5,p6,d6];

        var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
        var C1 = function(t_) {return Cubic(Hermite,P1,t_);}; 
        var C2 = function(t_) {return Cubic(Hermite,P2,t_);};
        var C3 = function(t_) {return Cubic(Hermite,P3,t_);};
        var C4 = function(t_) {return Cubic(Hermite,P4,t_);};
        var C5 = function(t_) {return Cubic(Hermite,P5,t_);};


        var C0prime = function(t_) {return Cubic(HermiteDerivative,P0,t_);};
        var C1prime = function(t_) {return Cubic(HermiteDerivative,P1,t_);};
        var C2prime = function(t_) {return Cubic(HermiteDerivative,P2,t_);};
        var C3prime = function(t_) {return Cubic(HermiteDerivative,P3,t_);};
        var C4prime = function(t_) {return Cubic(HermiteDerivative,P4,t_);};
        var C5prime = function(t_) {return Cubic(HermiteDerivative,P5,t_);};

        function drawPath(t_begin,t_end,intervals,C,Tx,color) {
            context.strokeStyle=color;
            context.beginPath();
            moveToTx(C(t_begin),Tx);
            for(var i=1;i<=intervals;i++){
                var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
                lineToTx(C(t),Tx);
            }
            context.stroke();
        }

        function drawHelicopter(color,Tx) {
            
            context.beginPath();
            context.fillStyle = "black";
            moveToTx([-.2,.275],Tx);
            lineToTx([-.15,.275],Tx);
            lineToTx([-.15,.25],Tx);
            lineToTx([-.2,.25],Tx);
            context.fill();
            context.closePath();

            context.beginPath();
            context.fillStyle = "black";
            moveToTx([.1,.3],Tx);
            lineToTx([.05,.3],Tx);
            lineToTx([.05,.25],Tx);
            lineToTx([.1,.25],Tx);
            context.fill();
            context.closePath();

            context.beginPath();
            context.fillStyle = "black";
            moveToTx([-.2,-.275],Tx);
            lineToTx([-.15,-.275],Tx);
            lineToTx([-.15,-.25],Tx);
            lineToTx([-.2,-.25],Tx);
            context.fill();
            context.closePath();

            context.beginPath();
            context.fillStyle = "black";
            moveToTx([.1,-.275],Tx);
            lineToTx([.05,-.275],Tx);
            lineToTx([.05,-.25],Tx);
            lineToTx([.1,-.25],Tx);
            context.fill();
            context.closePath();

            context.beginPath();
            context.fillStyle = "black";
            moveToTx([-.3,.3],Tx);
            lineToTx([.2,.3],Tx);
            lineToTx([.2,.275],Tx);
            lineToTx([-.3,.275],Tx);
            context.fill();
            context.closePath();

            context.beginPath();
            context.fillStyle = "black";
            moveToTx([-.3,-.3],Tx);
            lineToTx([.2,-.3],Tx);
            lineToTx([.2,-.275],Tx);
            lineToTx([-.3,-.275],Tx);
            context.fill();
            context.closePath();

            context.beginPath();
            context.fillStyle = color;
            moveToTx([-.2,-.25],Tx);
            lineToTx([-.3,-.1],Tx);
            lineToTx([-.8,-.05],Tx);
            lineToTx([-.8,-.075],Tx);
            lineToTx([-.9,-.075],Tx);
            lineToTx([-.9,.075],Tx);
            lineToTx([-.8,.075],Tx);
            lineToTx([-.8,.05],Tx);
            lineToTx([-.3,.1],Tx);
            lineToTx([-.2,.25],Tx);
            lineToTx([.1,.25],Tx);
            lineToTx([.20,.2],Tx);
            lineToTx([.25,0],Tx);
            lineToTx([.20,-.2],Tx);
            lineToTx([.1,-.25],Tx);
            context.closePath();
            context.fill();

            context.beginPath();
            context.fillStyle = "#ADD8E6";
            moveToTx([.05,.225],Tx);
            lineToTx([.15,.175],Tx)
            lineToTx([.20,0],Tx);
            lineToTx([.15,-.175],Tx);
            lineToTx([.05,-.225],Tx);
            context.closePath();
            context.fill();
            
        }

        function drawPropellers(Tx) {
            context.beginPath();
            context.fillStyle = "grey";
            
            moveToTx([.05,.05],Tx);

            lineToTx([.05,.025],Tx);
            lineToTx([.1,.025],Tx);

            lineToTx([.1,.05], Tx);
            lineToTx([.4,.05],Tx);
            lineToTx([.4,-.05],Tx);
            lineToTx([.1,-.05],Tx);

            lineToTx([.1,-.025],Tx);
            lineToTx([.05,-.025],Tx);

            lineToTx([.05,-.05],Tx);

            lineToTx([.025,-.05],Tx);
            lineToTx([.025,-.1],Tx);

            lineToTx([.05,-.1], Tx);
            lineToTx([.05,-.4],Tx);
            lineToTx([-.05,-.4],Tx);
            lineToTx([-.05,-.1],Tx);

            lineToTx([-.025,-.1],Tx);
            lineToTx([-.025,-.05],Tx);

            lineToTx([-.05,-.05],Tx);

            lineToTx([-.05,-.025],Tx);
            lineToTx([-.1,-0.025],Tx);

            lineToTx([-.1,-.05], Tx);
            lineToTx([-.4,-.05],Tx);
            lineToTx([-.4,.05],Tx);
            lineToTx([-.1, .05],Tx);

            lineToTx([-.1,.025],Tx);
            lineToTx([-.05,.025],Tx);

            lineToTx([-.05,.05],Tx);

            lineToTx([-.025,.05],Tx);
            lineToTx([-.025,.1],Tx);

            lineToTx([-.05,.1], Tx);
            lineToTx([-.05,.4],Tx);
            lineToTx([.05,.4],Tx);
            lineToTx([.05, .1],Tx);

            lineToTx([.025,.1],Tx);
            lineToTx([.025,.05],Tx);

            context.closePath();
            context.fill();
        }

        var Ccomp = function(t) {
            if (t == 0) {
                return C0(u);
            }
            if (t <= 1) {
                var u = t;
                return C0(u);
            } else if (t >= 1 && t <= 2) {
                var u = t - 1; 
                return C1(u);
            } else if (t >= 2 && t <= 3) {
                var u = t - 2; 
                return C2(u);
            } else if (t >= 3 && t <= 4) {
                var u = t - 3; 
                return C3(u);
            } else if (t >= 4 && t <= 5) {
                var u = t - 4; 
                return C4(u);
            } else if (t >= 5 && 5 <= 6) {
                var u = t -5;
                return C5(u);
            }      
        }

        var CCompTangent = function(t) {
            if (t == 0) {
                return C0prime(u);
            }
            if (t <= 1) {
                var u = t;
                return C0prime(u);
            } else if (t >= 1 && t <= 2) {
                var u = t - 1; 
                return C1prime(u);
            } else if (t >= 2 && t <= 3) {
                var u = t - 2; 
                return C2prime(u);
            } else if (t >= 3 && t <= 4) {
                var u = t - 3; 
                return C3prime(u);
            } else if (t >= 4 && t <= 5) {
                var u = t - 4; 
                return C4prime(u);
            } else if (t >= 5 && 5 <= 6) {
                var u = t -5;
                return C5prime(u);
            }
           }
    
        var pathToCanvas = mat3.create();
        mat3.fromTranslation(pathToCanvas,[550,365]);
        mat3.scale(pathToCanvas,pathToCanvas,[150,-150]);
        mat3.scale(pathToCanvas,pathToCanvas,[1.2,1.2]);

        if (buttonValue == 1) {
            drawPath(0.0,1.0,100,C0,pathToCanvas,"black");
            drawPath(0.0,1.0,100,C1,pathToCanvas,"black");
            drawPath(0.0,1.0,100,C2,pathToCanvas,"black");
            drawPath(0.0,1.0,100,C3,pathToCanvas,"black");
            drawPath(0.0,1.0,100,C4,pathToCanvas,"black");
            drawPath(0.0,1.0,100,C5,pathToCanvas,"black");
        }

        var helicopter = mat3.create();
        mat3.fromTranslation(helicopter,Ccomp(tParam));
        var helicopterToCanvas = mat3.create();
        var tangent = CCompTangent(tParam);
        var angle = Math.atan2(tangent[1],tangent[0]);
	    mat3.rotate(helicopter,helicopter,angle);
        mat3.multiply(helicopterToCanvas, pathToCanvas, helicopter);
        drawHelicopter("green",helicopterToCanvas);

        
        
        var propellers = mat3.create();
        mat3.fromTranslation(propellers, [-.15,0]);
        mat3.rotate(propellers,propellers,theta1);
        var completeHelicopter = mat3.create();
	    
	    
	    mat3.multiply(completeHelicopter, helicopterToCanvas, propellers);
        drawPropellers(completeHelicopter);
	    
        tParam = (tParam + .01) % 6;
        theta1 = (theta1 + .2) % (2 *Math.PI);
        setTimeout(() => {
            window.requestAnimationFrame(draw);
          }, "100");
    }


    button.addEventListener('click', changeButton);
    window.requestAnimationFrame(draw);
    setTimeout(() => {
            window.requestAnimationFrame(draw);
          }, "100");
}
window.onload = setUp;