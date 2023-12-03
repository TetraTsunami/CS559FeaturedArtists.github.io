function setup() {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    var speed = 0.04;
	var progress = 0;

    var slider = document.getElementById('slider');
    slider.value = 0;

    function draw() {
	canvas.width = canvas.width;

	// use the slider to get the angle
    var viewAngle = slider.value*0.02*Math.PI;
     
	function moveToTx(loc,Tx)
	{var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.moveTo(res[0],res[1]);}

	function lineToTx(loc,Tx)
	{var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.lineTo(res[0],res[1]);}

    function drawCar(color,Tx) {
        // Car body - use downward slope to display F1 car shape in 3D
        context.beginPath();
        context.fillStyle = color;
        moveToTx([-15,3,-5],Tx);
        lineToTx([-15,3,5],Tx);
        lineToTx([-11,3,5],Tx);
        lineToTx([-11,3,2],Tx);
        lineToTx([-9,2,2],Tx);
        lineToTx([0,2,5],Tx);
        lineToTx([3,2,5],Tx);
        lineToTx([5,1,1],Tx);
        lineToTx([12,0,1],Tx);
        lineToTx([10,0,5],Tx);
        lineToTx([14,0,5],Tx);
        lineToTx([17,0,0],Tx);
        lineToTx([14,0,-5],Tx);
        lineToTx([10,0,-5],Tx);
        lineToTx([12,0,-1],Tx);
        lineToTx([5,1,-1],Tx);
        lineToTx([3,2,-5],Tx);
        lineToTx([0,2,-5],Tx);
        lineToTx([-9,2,-2],Tx);
        lineToTx([-11,3,-2],Tx);
        lineToTx([-11,3,-5],Tx);
        lineToTx([-15,3,-5],Tx);
        context.closePath();
        context.fill();

        // Rear Wheels
        context.fillStyle = "black";
        context.beginPath();
        moveToTx([-10,0,2],Tx);
        lineToTx([-10,0,5],Tx);
        lineToTx([-5,0,5],Tx);
        lineToTx([-5,0,2],Tx);
        context.closePath();
        context.fill();
        context.beginPath();
        moveToTx([-10,0,-2],Tx);
        lineToTx([-10,0,-5],Tx);
        lineToTx([-5,0,-5],Tx);
        lineToTx([-5,0,-2],Tx);
        context.closePath();
        context.fill();

        // Front wheels (including axle)
        context.beginPath();
        moveToTx([10,0,2],Tx);
        lineToTx([10,0,5],Tx);
        lineToTx([5,0,5],Tx);
        lineToTx([5,0,2],Tx);
        lineToTx([7,0,2],Tx);
        lineToTx([7,0,1],Tx);
        lineToTx([8,0,1],Tx);
        lineToTx([8,0,2],Tx);
        context.closePath();
        context.fill();
        context.beginPath();
        moveToTx([10,0,-2],Tx);
        lineToTx([10,0,-5],Tx);
        lineToTx([5,0,-5],Tx);
        lineToTx([5,0,-2],Tx);
        lineToTx([7,0,-2],Tx);
        lineToTx([7,0,-1],Tx);
        lineToTx([8,0,-1],Tx);
        lineToTx([8,0,-2],Tx);
        context.closePath();
        context.fill();
    }

    function drawPlane(Tx) {
        context.beginPath();
	    context.fillStyle = "gray";
        context.globalAlpha = 0.5;
	    moveToTx([300,0,65],Tx);
	    lineToTx([300,0,620],Tx);
        lineToTx([720,0,620],Tx);
      	lineToTx([720,0,65],Tx);
	    context.closePath();
	    context.fill();
        context.globalAlpha = 1;
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
	    var result=vec3.create();
	    vec3.scale(result,P[0],b[0]);
	    vec3.scaleAndAdd(result,result,P[1],b[1]);
	    vec3.scaleAndAdd(result,result,P[2],b[2]);
	    vec3.scaleAndAdd(result,result,P[3],b[3]);
	    return result;
	}
	
	var p0=[300,10,475];
    var d0=[-20,0,-150];
    var p1=[320,10,330];
    var d1=[100,0,-50];
    var p2=[450,40,300];
    var d2=[150,0,-50];
    var p3=[600,45,240];
    var d3=[50,0,-100];
    var p4=[575,50,165];
    var d4=[20,0,-50];
    var p5=[652,35,65];
    var d5=[35,0,20];
    var p6=[663,30,85];
    var d6=[20,0,40];
    var p7=[690,25,120];
    var d7=[30,0,-30];
    var p8=[675,20,75];
    var d8=[30,0,-20];
    var p9=[720,10,65];
    var d9=[-15,0,50];
    var p10=[675,10,245];
    var d10=[-150,0,150];
    var p11=[498,0,315];
    var d11=[0,0,30];
    var p12=[500,0,330];
    var d12=[-15,0,0];
    var p13=[468,0,325];
    var d13=[-45,0,-25];
    var p14=[335,0,345];
    var d14=[-30,0,45];
    var p15=[325,0,440];
    var d15=[20,0,30];
    var p16=[343,0,455];
    var d16=[15,0,30];
    var p17=[353,0,520];
    var d17=[-10,0,10];
    var p18=[340,0,530];
    var d18=[0,0,30];
    var p19=[365,0,585];
    var d19=[45,0,70];
    var p20=[400,0,615];
    var d20=[0,0,50];
    var p21=[350,10,620];
    var d21=[-45,0,-60];

    var P0 = [p0,d0,p1,d1]; // Start -> T1
    var P1 = [p1,d1,p2,d2]; // T1 -> T2
    var P2 = [p2,d2,p3,d3]; // T2 -> T3
    var P3 = [p3,d3,p4,d4]; // T3 -> T4
    var P4 = [p4,d4,p5,d5]; // T4 -> T5
    var P5 = [p5,d5,p6,d6]; // T5 -> Hairpin
    var P6 = [p6,d6,p7,d7]; // Hairpin -> T6
    var P7 = [p7,d7,p8,d8]; // T6 -> T7
    var P8 = [p8,d8,p9,d9]; // T7 -> T8
    var P9 = [p9,d9,p10,d10]; // T8 -> T9
    var P10 = [p10,d10,p11,d11]; // T9 -> T10
    var P11 = [p11,d11,p12,d12]; // T10 -> Chicane
    var P12 = [p12,d12,p13,d13]; // Chicane -> T11
    var P13 = [p13,d13,p14,d14]; // T11 -> T12
    var P14 = [p14,d14,p15,d15]; // T12 -> T13
    var P15 = [p15,d15,p16,d16]; // T13 -> T14
    var P16 = [p16,d16,p17,d17]; // T14 -> T15
    var P17 = [p17,d17,p18,d18]; // T15 -> T16
    var P18 = [p18,d18,p19,d19]; // T16 -> T17
    var P19 = [p19,d19,p20,d20]; // T17 -> T18
    var P20 = [p20,d20,p21,d21]; // T18 -> T19
    var P21 = [p21,d21,p0,d0]; // T19 -> Finish

    var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
    var C1 = function(t_) {return Cubic(Hermite,P1,t_);};
    var C2 = function(t_) {return Cubic(Hermite,P2,t_);};
    var C3 = function(t_) {return Cubic(Hermite,P3,t_);};
    var C4 = function(t_) {return Cubic(Hermite,P4,t_);};
    var C5 = function(t_) {return Cubic(Hermite,P5,t_);};
    var C6 = function(t_) {return Cubic(Hermite,P6,t_);};
    var C7 = function(t_) {return Cubic(Hermite,P7,t_);};
    var C8 = function(t_) {return Cubic(Hermite,P8,t_);};
    var C9 = function(t_) {return Cubic(Hermite,P9,t_);};
    var C10 = function(t_) {return Cubic(Hermite,P10,t_);};
    var C11 = function(t_) {return Cubic(Hermite,P11,t_);};
    var C12 = function(t_) {return Cubic(Hermite,P12,t_);};
    var C13 = function(t_) {return Cubic(Hermite,P13,t_);};
    var C14 = function(t_) {return Cubic(Hermite,P14,t_);};
    var C15 = function(t_) {return Cubic(Hermite,P15,t_);};
    var C16 = function(t_) {return Cubic(Hermite,P16,t_);};
    var C17 = function(t_) {return Cubic(Hermite,P17,t_);};
    var C18 = function(t_) {return Cubic(Hermite,P18,t_);};
    var C19 = function(t_) {return Cubic(Hermite,P19,t_);};
    var C20 = function(t_) {return Cubic(Hermite,P20,t_);};
    var C21 = function(t_) {return Cubic(Hermite,P21,t_);};

    var C0prime = function(t_) {return Cubic(HermiteDerivative,P0,t_);};
    var C1prime = function(t_) {return Cubic(HermiteDerivative,P1,t_);};
    var C2prime = function(t_) {return Cubic(HermiteDerivative,P2,t_);};
    var C3prime = function(t_) {return Cubic(HermiteDerivative,P3,t_);};
    var C4prime = function(t_) {return Cubic(HermiteDerivative,P4,t_);};
    var C5prime = function(t_) {return Cubic(HermiteDerivative,P5,t_);};
    var C6prime = function(t_) {return Cubic(HermiteDerivative,P6,t_);};
    var C7prime = function(t_) {return Cubic(HermiteDerivative,P7,t_);};
    var C8prime = function(t_) {return Cubic(HermiteDerivative,P8,t_);};
    var C9prime = function(t_) {return Cubic(HermiteDerivative,P9,t_);};
    var C10prime = function(t_) {return Cubic(HermiteDerivative,P10,t_);};
    var C11prime = function(t_) {return Cubic(HermiteDerivative,P11,t_);};
    var C12prime = function(t_) {return Cubic(HermiteDerivative,P12,t_);};
    var C13prime = function(t_) {return Cubic(HermiteDerivative,P13,t_);};
    var C14prime = function(t_) {return Cubic(HermiteDerivative,P14,t_);};
    var C15prime = function(t_) {return Cubic(HermiteDerivative,P15,t_);};
    var C16prime = function(t_) {return Cubic(HermiteDerivative,P16,t_);};
    var C17prime = function(t_) {return Cubic(HermiteDerivative,P17,t_);};
    var C18prime = function(t_) {return Cubic(HermiteDerivative,P18,t_);};
    var C19prime = function(t_) {return Cubic(HermiteDerivative,P19,t_);};
    var C20prime = function(t_) {return Cubic(HermiteDerivative,P20,t_);};
    var C21prime = function(t_) {return Cubic(HermiteDerivative,P21,t_);};
      
    var Ccomp = function(t) {
        if (t<1) {
            var u = t;
            return C0(u);
        } else if (t<2) {
            var u = t - 1.0;
            return C1(u);
        } else if (t<3) {
            var u = t - 2.0;
            return C2(u);
        } else if (t<4) {
            var u = t - 3.0;
            return C3(u);
        } else if (t<5) {
            var u = t - 4.0;
            return C4(u);
        } else if (t<6) {
            var u = t - 5.0;
            return C5(u);
        } else if (t<7) {
            var u = t - 6.0;
            return C6(u);
        } else if (t<8) {
            var u = t - 7.0;
            return C7(u);
        } else if (t<9) {
            var u = t - 8.0;
            return C8(u);
        } else if (t<10) {
            var u = t - 9.0;
            return C9(u);
        } else if (t<11) {
            var u = t - 10.0;
            return C10(u);
        } else if (t<12) {
            var u = t - 11.0;
            return C11(u);
        } else if (t<13) {
            var u = t - 12.0;
            return C12(u);
        } else if (t<14) {
            var u = t - 13.0;
            return C13(u);
        } else if (t<15) {
            var u = t - 14.0;
            return C14(u);
        } else if (t<16) {
            var u = t - 15.0;
            return C15(u);
        } else if (t<17) {
            var u = t - 16.0;
            return C16(u);
        } else if (t<18) {
            var u = t - 17.0;
            return C17(u);
        } else if (t<19) {
            var u = t - 18.0;
            return C18(u);
        } else if (t<20) {
            var u = t - 19.0;
            return C19(u);
        } else if (t<21) {
            var u = t - 20.0;
            return C20(u);
        } else {
            var u = t - 21.0;
            return C21(u);
        }          
    }

    var Ccomp_tangent = function(t) {
        if (t<1) {
            var u = t;
            return C0prime(u);
        } else if (t<2) {
            var u = t - 1.0;
            return C1prime(u);
        } else if (t<3) {
            var u = t - 2.0;
            return C2prime(u);
        } else if (t<4) {
            var u = t - 3.0;
            return C3prime(u);
        } else if (t<5) {
            var u = t - 4.0;
            return C4prime(u);
        } else if (t<6) {
            var u = t - 5.0;
            return C5prime(u);
        } else if (t<7) {
            var u = t - 6.0;
            return C6prime(u);
        } else if (t<8) {
            var u = t - 7.0;
            return C7prime(u);
        } else if (t<9) {
            var u = t - 8.0;
            return C8prime(u);
        } else if (t<10) {
            var u = t - 9.0;
            return C9prime(u);
        } else if (t<11) {
            var u = t - 10.0;
            return C10prime(u);
        } else if (t<12) {
            var u = t - 11.0;
            return C11prime(u);
        } else if (t<13) {
            var u = t - 12.0;
            return C12prime(u);
        } else if (t<14) {
            var u = t - 13.0;
            return C13prime(u);
        } else if (t<15) {
            var u = t - 14.0;
            return C14prime(u);
        } else if (t<16) {
            var u = t - 15.0;
            return C15prime(u);
        } else if (t<17) {
            var u = t - 16.0;
            return C16prime(u);
        } else if (t<18) {
            var u = t - 17.0;
            return C17prime(u);
        } else if (t<19) {
            var u = t - 18.0;
            return C18prime(u);
        } else if (t<20) {
            var u = t - 19.0;
            return C19prime(u);
        } else if (t<21) {
            var u = t - 20.0;
            return C20prime(u);
        } else {
            var u = t - 21.0;
            return C21prime(u);
        }        
    }

    var CameraCurve = function(angle) {
        var distance = 100.0;
        var eye = vec3.create();
        eye[0] = distance*Math.sin(angle) + 500;
        eye[1] = 50;
        eye[2] = distance*Math.cos(angle) + 350;  
        return [eye[0],eye[1],eye[2]];
    }

    function drawTrajectory(t_begin,t_end,intervals,C,Tx,color) {
	    context.strokeStyle=color;
	    context.beginPath();
        moveToTx(C(t_begin),Tx);
        for(var i=1;i<=intervals;i++){
            var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
            lineToTx(C(t),Tx);
        }
        context.stroke();
	}

    // Create Camera (lookAt) transform
    var eyeCamera = CameraCurve(viewAngle);
    var targetCamera = vec3.fromValues(500,0,350); // Aim at the center of the track
    var upCamera = vec3.fromValues(0,100,0); // Y-axis of world coords to be vertical
	var TlookAtCamera = mat4.create();
    mat4.lookAt(TlookAtCamera, eyeCamera, targetCamera, upCamera);
      
    // Create ViewPort transform
    var Tviewport = mat4.create();
	mat4.fromTranslation(Tviewport,[500,350,0]);  // Move the center of the "lookAt" transform (where the camera points) to the center of the canvas
	mat4.scale(Tviewport,Tviewport,[100,-100,100]); // Flip the Y-axis, scale everything by 100x

    // Create Camera projection transform
    var TprojectionCamera = mat4.create();
    mat4.ortho(TprojectionCamera,-75,75,-75,75,-1,1);
     
    // Create transform t_VP_PROJ_CAM that incorporates viewport, projection and camera transforms
    var tVP_PROJ_VIEW_Camera = mat4.create();
    mat4.multiply(tVP_PROJ_VIEW_Camera,Tviewport,TprojectionCamera);
    mat4.multiply(tVP_PROJ_VIEW_Camera,tVP_PROJ_VIEW_Camera,TlookAtCamera);
      
	// Create model(ing) transform (from moving object to world)
    var Tmodel = mat4.create();
	mat4.fromTranslation(Tmodel,Ccomp(progress));
    var tangent = Ccomp_tangent(progress);
    var angle = Math.atan2(tangent[1],tangent[0]);
	mat4.rotateZ(Tmodel,Tmodel,angle);

    // Create transform t_VP_PROJ_VIEW_MOD that incorporates viewport, projection, camera, and modeling transform
    var tVP_PROJ_VIEW_MOD_Camera = mat4.create();
	mat4.multiply(tVP_PROJ_VIEW_MOD_Camera, tVP_PROJ_VIEW_Camera, Tmodel);
    mat4.scale(tVP_PROJ_VIEW_MOD_Camera, tVP_PROJ_VIEW_MOD_Camera, [1,-1,1]); // Flip Y-axis

    // Draw the following in the Camera window
    drawPlane(tVP_PROJ_VIEW_Camera);

    // Sector 1
    drawTrajectory(0.0,1.0,100,C0,tVP_PROJ_VIEW_Camera,"firebrick");
    drawTrajectory(0.0,1.0,100,C1,tVP_PROJ_VIEW_Camera,"firebrick");
    drawTrajectory(0.0,1.0,100,C2,tVP_PROJ_VIEW_Camera,"firebrick");
    drawTrajectory(0.0,1.0,100,C3,tVP_PROJ_VIEW_Camera,"firebrick");
    drawTrajectory(0.0,1.0,100,C4,tVP_PROJ_VIEW_Camera,"firebrick");
    // Sector 2
    drawTrajectory(0.0,1.0,100,C5,tVP_PROJ_VIEW_Camera,"mediumblue");
    drawTrajectory(0.0,1.0,100,C6,tVP_PROJ_VIEW_Camera,"mediumblue");
    drawTrajectory(0.0,1.0,100,C7,tVP_PROJ_VIEW_Camera,"mediumblue");
    drawTrajectory(0.0,1.0,100,C8,tVP_PROJ_VIEW_Camera,"mediumblue");
    drawTrajectory(0.0,1.0,100,C9,tVP_PROJ_VIEW_Camera,"mediumblue");
    drawTrajectory(0.0,1.0,100,C10,tVP_PROJ_VIEW_Camera,"mediumblue");
    drawTrajectory(0.0,1.0,100,C11,tVP_PROJ_VIEW_Camera,"mediumblue");
    drawTrajectory(0.0,1.0,100,C12,tVP_PROJ_VIEW_Camera,"mediumblue");
    drawTrajectory(0.0,1.0,100,C13,tVP_PROJ_VIEW_Camera,"mediumblue");
    // Sector 3
    drawTrajectory(0.0,1.0,100,C14,tVP_PROJ_VIEW_Camera,"goldenrod");
    drawTrajectory(0.0,1.0,100,C15,tVP_PROJ_VIEW_Camera,"goldenrod");
    drawTrajectory(0.0,1.0,100,C16,tVP_PROJ_VIEW_Camera,"goldenrod");
    drawTrajectory(0.0,1.0,100,C17,tVP_PROJ_VIEW_Camera,"goldenrod");
    drawTrajectory(0.0,1.0,100,C18,tVP_PROJ_VIEW_Camera,"goldenrod");
    drawTrajectory(0.0,1.0,100,C19,tVP_PROJ_VIEW_Camera,"goldenrod");
    drawTrajectory(0.0,1.0,100,C20,tVP_PROJ_VIEW_Camera,"goldenrod");
    drawTrajectory(0.0,1.0,100,C21,tVP_PROJ_VIEW_Camera,"goldenrod");

    drawCar("red",tVP_PROJ_VIEW_MOD_Camera);
    progress += speed;
    if (progress >= 22) { // Lap end
        progress = 0;
    }
    requestAnimationFrame(draw);

    }

    draw();
}
window.onload = setup;