function setup() { "use strict";
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var tParam = 7.5;
    var slider1 = document.getElementById('slider1');
    slider1.value = 1;

    function draw() {
        canvas.width = canvas.width;
        var speed = slider1.value;

        tParam = tParam + 0.01*speed;
        if (tParam >= 8) {
            tParam = 0;
        }
  
        var stack = [ mat3.create() ];

        function moveToTx(loc,Tx){
            var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.moveTo(res[0],res[1]);
        }

	    function lineToTx(loc,Tx){
            var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.lineTo(res[0],res[1]);
        }

        function rectTx(w,x,y,z, fill, Tx){
            context.beginPath();
            context.fillStyle = fill;
            moveToTx([w,x], Tx);
            lineToTx([w+y,x], Tx); //peak
            lineToTx([w+y,x+z], Tx);
            lineToTx([w,x+z], Tx);
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
        };
   
        var HermiteDerivative = function(t) {
            return [
            6*t*t-6*t,
            3*t*t-4*t+1,
            -6*t*t+6*t,
            3*t*t-2*t
            ];
        };
   
        function Cubic(basis,P,t){
            var b = basis(t);
            var result=vec2.create();
            vec2.scale(result,P[0],b[0]);
            vec2.scaleAndAdd(result,result,P[1],b[1]);
            vec2.scaleAndAdd(result,result,P[2],b[2]);
            vec2.scaleAndAdd(result,result,P[3],b[3]);
            return result;
        }

        var p0=[1.5,1.8];
        var d0=[1.5,0.5];
        var p1=[2.5,0.75];
        var d1=[1.5,2.3];
        var p2=[3.5,1.2];
        var d2=[1.5,2.3];
        var p3=[4.5,0.2];
        var d3=[-3,0.4];
        var p4=[5,1.2];
        var d4=[3,-1];
        var p5=[4,-.5];
        var d5=[-2,1];
        var p6=[1,0];
        var d6=[-3.3,0.4];
        var p7=[0.2,1.6];
        var d7=[1,1];
        var p8=[1.5,1.8];
        var d8=[1.5,0.5];

        var P0 = [p0,d0,p1,d1]; // First two points and tangents
        var P1 = [p1,d1,p2,d2]; 
        var P2 = [p2,d2,p3,d3]; 
        var P3 = [p3,d3,p4,d4]; // Last two points and tangents
        var P4 = [p4,d4,p5,d5];
        var P5 = [p5,d5,p6,d6];
        var P6 = [p6,d6,p7,d7];
        var P7 = [p7,d7,p8,d8];

        var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
        var C1 = function(t_) {return Cubic(Hermite,P1,t_);};
        var C2 = function(t_) {return Cubic(Hermite,P2,t_);};
        var C3 = function(t_) {return Cubic(Hermite,P3,t_);};
        var C4 = function(t_) {return Cubic(Hermite,P4,t_);};
        var C5 = function(t_) {return Cubic(Hermite,P5,t_);};
        var C6 = function(t_) {return Cubic(Hermite,P6,t_);};
        var C7 = function(t_) {return Cubic(Hermite,P7,t_);};

   
        var C0prime = function(t_) {return Cubic(HermiteDerivative,P0,t_);};
        var C1prime = function(t_) {return Cubic(HermiteDerivative,P1,t_);};
        var C2prime = function(t_) {return Cubic(HermiteDerivative,P2,t_);};
        var C3prime = function(t_) {return Cubic(HermiteDerivative,P3,t_);};
        var C4prime = function(t_) {return Cubic(HermiteDerivative,P4,t_);};
        var C5prime = function(t_) {return Cubic(HermiteDerivative,P5,t_);};
        var C6prime = function(t_) {return Cubic(HermiteDerivative,P6,t_);};
        var C7prime = function(t_) {return Cubic(HermiteDerivative,P7,t_);};
       
   
        var Ccomp = function(t) {
            if (t<1){
                var u = t;
                return C0(u);
            } else if(t<2){
                var u = t-1.0;
                return C1(u);
            }  
            else if(t<3){
                var u = t-2.0;
                return C2(u);
            } 
            else if(t<4){
                var u = t-3.0;
                return C3(u);
            }  
            else if(t<5){
                var u = t-4.0;
                return C4(u);
            }    
            else if(t<6){
                var u = t-5.0;
                return C5(u);
            }
            else if(t<7){
                var u = t-6.0;
                return C6(u);
            }
            else if(t<8){
                var u = t-7.0;
                return C7(u);
            }      
        };
   
        var Ccomp_tangent = function(t) {
            if (t<1){
                var u = t;
                return C0prime(u);
            } else if(t<2){
                var u = t-1.0;
                return C1prime(u);
            }  
            else if(t<3){
                var u = t-2.0;
                return C2prime(u);
            }
            else if(t<4){
                var u = t-3.0;
                return C3prime(u);
            }
            else if(t<5){
                var u = t-4.0;
                return C4prime(u);
            }
            else if(t<6){
                var u = t-5.0;
                return C5prime(u);
            }
            else if(t<7){
                var u = t-6.0;
                return C6prime(u);
            }
            else if(t<8){
                var u = t-7.0;
                return C7prime(u);
            }
        };
   
        function drawTrajectory(t_begin,t_end,intervals,C, Tx, color) {
            context.strokeStyle=color;
            context.beginPath();
            context.lineWidth = 12;
            moveToTx(C(t_begin),Tx);
            for(var i=1;i<=intervals;i++){
                var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
                lineToTx(C(t),Tx);
            }
            context.stroke();
            context.closePath();


        
            context.beginPath();
            context.strokeStyle="black";
            context.setLineDash([3, 10]);/*dashes are 5px and spaces are 3px*/
            context.lineWidth = 2;
            moveToTx(C(t_begin),Tx);
            for(var i=1;i<=intervals;i++){
                var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
                lineToTx(C(t),Tx);
            }
            context.stroke();
            context.setLineDash([0, 0]);
            context.closePath();

            context.lineWidth = 1;

    
        }
        function drawHead(xPos, Tx){
            context.beginPath();
            context.fillStyle = "black";
            moveToTx([0.1+xPos, -.20], Tx);
            lineToTx([0.08+xPos, -.21], Tx);
            lineToTx([0.07+xPos, -.23], Tx);
            lineToTx([0.08+xPos, -.25], Tx);
            lineToTx([0.1+xPos, -.27], Tx);
            lineToTx([0.12+xPos, -.25], Tx);
            lineToTx([0.13+xPos, -.23], Tx);
            lineToTx([0.12+xPos, -.21], Tx);
            context.closePath();
            context.fill();
        }

        function drawCart(Tx) {
            context.beginPath();
            context.fillStyle = "#8C7D43";
            moveToTx([0, 0.02], Tx);
            lineToTx([-.12, 0.0], Tx);
            lineToTx([-.18, -.15], Tx);
            lineToTx([0.18, -.15], Tx);
            lineToTx([0.12, 0.0], Tx);
            context.closePath();
            context.fill();

            context.beginPath();
            context.fillStyle = "#5C553A";
            moveToTx([0, -0.10], Tx);
            lineToTx([-.12, -0.10], Tx);
            lineToTx([-.18, -.14], Tx);
            lineToTx([0.18, -.14], Tx);
            lineToTx([0.12, -0.10], Tx);
            context.closePath();
            context.fill();

            context.beginPath();
            context.strokeStyle = "black";
            moveToTx([0.1, -.22], Tx);
            lineToTx([0.1, -.10], Tx);

            moveToTx([0.15, -.15], Tx);
            lineToTx([0.1, -.18], Tx);
            lineToTx([0.05, -.15], Tx);
            context.stroke();

            context.beginPath();
            context.strokeStyle = "black";
            moveToTx([0, -.22], Tx);
            lineToTx([0, -.10], Tx);

            moveToTx([0.05, -.15], Tx);
            lineToTx([0, -.18], Tx);
            lineToTx([-0.05, -.15], Tx);
            context.stroke();

            context.beginPath();
            context.strokeStyle = "black";
            moveToTx([-.1, -.22], Tx);
            lineToTx([-.10, -.10], Tx);

            moveToTx([-0.05, -.15], Tx);
            lineToTx([-.10, -.18], Tx);
            lineToTx([-0.15, -.15], Tx);
            context.stroke();
        
            drawHead(0,Tx);
            drawHead(-.10,Tx);
            drawHead(-.20,Tx);
        }

        function drawBackground(Tx){
            canvas.style.backgroundColor = "#ADD8E6";
            rectTx(0,300,900,100, "green", Tx);
            context.beginPath();
            context.strokeStyle = "black";
            context.lineWidth = 0.5;
            moveToTx([100, 145], Tx);
            lineToTx([100, 320], Tx);
            moveToTx([150, 110], Tx);
            lineToTx([150, 320], Tx);
            moveToTx([200, 100], Tx);
            lineToTx([200, 320], Tx);
            moveToTx([250, 95], Tx);
            lineToTx([250, 320], Tx);
            moveToTx([300, 93], Tx);
            lineToTx([300, 320], Tx);
            moveToTx([350, 88], Tx);
            lineToTx([350, 320], Tx);
            moveToTx([400, 83], Tx);
            lineToTx([400, 320], Tx);
            moveToTx([450, 78], Tx);
            lineToTx([450, 320], Tx);
            moveToTx([500, 70], Tx);
            lineToTx([500, 320], Tx);
            moveToTx([550, 60], Tx);
            lineToTx([550, 320], Tx);
            moveToTx([600, 48], Tx);
            lineToTx([600, 320], Tx);
            moveToTx([650, 28], Tx);
            lineToTx([650, 320], Tx);
            moveToTx([700, 25], Tx);
            lineToTx([700, 320], Tx);
            moveToTx([750, 45], Tx);
            lineToTx([750, 320], Tx);
            moveToTx([800, 90], Tx);
            lineToTx([800, 320], Tx);
            context.closePath();
            context.stroke();

            context.beginPath();
            context.strokeStyle = "black";
            context.lineWidth = 3;
            moveToTx([75, 338], Tx);
            lineToTx([75, 400], Tx);
            moveToTx([75, 338], Tx);
            lineToTx([125, 400], Tx);
            moveToTx([125, 365], Tx);
            lineToTx([125, 400], Tx);
            moveToTx([125, 400], Tx);
            lineToTx([175, 365], Tx);
            moveToTx([175, 365], Tx);
            lineToTx([175, 400], Tx);
            moveToTx([175, 365], Tx);
            lineToTx([225, 400], Tx);
            moveToTx([225, 365], Tx);
            lineToTx([225, 400], Tx);
            moveToTx([225, 400], Tx);
            lineToTx([275, 370], Tx);
            moveToTx([275, 370], Tx);
            lineToTx([275, 400], Tx);
            moveToTx([325, 335], Tx);
            lineToTx([325, 400], Tx);
            moveToTx([325, 400], Tx);
            lineToTx([375, 200], Tx);
            moveToTx([375, 200], Tx); //red left
            lineToTx([375, 400], Tx);
            moveToTx([375, 200], Tx);
            lineToTx([425, 400], Tx);
            moveToTx([425, 210], Tx);//blue
            lineToTx([425, 400], Tx);
            moveToTx([425, 400], Tx);
            lineToTx([475, 255], Tx);
            moveToTx([475, 255], Tx);
            lineToTx([475, 400], Tx);
            moveToTx([475, 255], Tx);
            lineToTx([525, 400], Tx);
            moveToTx([525, 235], Tx);
            lineToTx([525, 400], Tx);
            moveToTx([525, 400], Tx);
            lineToTx([575, 275], Tx);
            moveToTx([575, 275], Tx);
            lineToTx([575, 400], Tx);
            moveToTx([575, 275], Tx);
            lineToTx([625, 400], Tx);
            moveToTx([625, 310], Tx);
            lineToTx([625, 400], Tx);
            moveToTx([775, 285], Tx);
            lineToTx([775, 400], Tx);
            moveToTx([825, 270], Tx);
            lineToTx([825, 400], Tx);
            moveToTx([825, 270], Tx);
            lineToTx([775, 400], Tx)
            context.closePath();
            context.stroke();


            context.beginPath();
            context.strokeStyle = "black";
            context.lineWidth = 2;
            moveToTx([60, 200], Tx);
            lineToTx([60, 350], Tx);
            moveToTx([640, 200], Tx);
            lineToTx([640, 360], Tx);
            moveToTx([640, 200], Tx);
            lineToTx([675, 340], Tx);
            moveToTx([675, 150], Tx);
            lineToTx([675, 340], Tx);
            moveToTx([675, 340], Tx);
            lineToTx([725, 130], Tx);
            moveToTx([725, 130], Tx);
            lineToTx([725, 340], Tx);
            moveToTx([725, 130], Tx);
            lineToTx([765, 340], Tx);
            moveToTx([765, 130], Tx);
            lineToTx([765, 340], Tx);
            moveToTx([855, 230], Tx);
            lineToTx([855, 350], Tx);
            context.closePath();
            context.stroke();
        }

        stack.unshift(mat3.clone(stack[0])); //save
        var background_to_canvas = mat3.create();
        mat3.multiply(stack[0],stack[0],background_to_canvas);
        drawBackground(background_to_canvas);

        stack.unshift(mat3.clone(stack[0])); //save
        var Tcurve_to_canvas = mat3.create();
        mat3.fromTranslation(Tcurve_to_canvas,[50,100]);
        mat3.scale(Tcurve_to_canvas,Tcurve_to_canvas,[150,150]);

        drawTrajectory(0.0,1.0,100,C0,Tcurve_to_canvas,"red");
        drawTrajectory(0.0,1.0,100,C1,Tcurve_to_canvas,"blue");
        drawTrajectory(0.0,1.0,100,C2,Tcurve_to_canvas,"#FFFB33"); //yellow
        drawTrajectory(0.0,1.0,100,C3,Tcurve_to_canvas,"#FF9F33"); //orange
        drawTrajectory(0.0,1.0,100,C4,Tcurve_to_canvas,"purple");
        drawTrajectory(0.0,1.0,100,C5,Tcurve_to_canvas,"#33FF7C"); //green
        drawTrajectory(0.0,1.0,100,C6,Tcurve_to_canvas,"#33F3FF"); //ligth blue
        drawTrajectory(0.0,1.0,100,C7,Tcurve_to_canvas,"pink"); 


        var bird_to_curve = mat3.create();
        mat3.fromTranslation(bird_to_curve, Ccomp(tParam))
        var bird_to_canvas = mat3.create();
        var tangent = Ccomp_tangent(tParam);
        var rotAng = Math.atan2(tangent[1], tangent[0]);
        // if (tParam > 4.2) {
        //     mat3.rotate(bird_to_curve, bird_to_curve,rotAng); // Mirror along Y-Axis
        //     rotAng = rotAng * -1;
        // }
        // if (tParam > 7) {
        //     mat3.rotate(bird_to_curve, bird_to_curve,rotAng); // Mirror along Y-Axis
        //     rotAng = rotAng * -1;
        // }

        mat3.rotate(bird_to_curve, bird_to_curve,rotAng);
        mat3.multiply(bird_to_canvas,Tcurve_to_canvas,bird_to_curve);
        drawCart(bird_to_canvas);
        stack.shift(); //restore

        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
}
window.onload = setup;