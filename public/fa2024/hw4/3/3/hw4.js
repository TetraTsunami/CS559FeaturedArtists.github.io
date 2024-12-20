function setup() {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var slider1 = document.getElementById('slider1');
    slider1.value = -25;
	var tParam = 0;

	var slider = slider1.value * 0.01;

    function draw() {
	canvas.width = canvas.width;
	// use the sliders to get the angles
	
	
	function moveToTx(loc,Tx)
	{var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.moveTo(res[0],res[1]);}

	function lineToTx(loc,Tx)
	{var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.lineTo(res[0],res[1]);}
	
	function drawObject(color,Tx) {
	    context.beginPath();
	    context.fillStyle = color;
	    moveToTx([-.10, .10],Tx);
		lineToTx([-.10,-.10],Tx);
		lineToTx([.10,-.10],Tx);
	    lineToTx([.10,.10],Tx);
	    
	    
		
	    context.closePath();
	    context.fill();
		context.beginPath();
		var carP0 = [-.10,.10];
		var carP1 = [-.09,.25];
		var carP2 = [.09, .25];
		var carP3 = [.10,.10];
		var carHead = [carP0, carP1, carP2, carP3];

		var B0 = function(t_) {return Cubic(Bezier, carHead, t_)}
	
		context.fillStyle = color;
		fillTrajectory(0.0,1.0,100,B0,Tx,"grey");

		var carP4 = [-.10, -.10];
		var carP5 = [-0.04, -.15];
		var carP6 = [0.04, -.15];
		var carP7 = [.10, -.10];
		var cartail = [carP4, carP5, carP6, carP7];
		var B1 = function(t_) {return Cubic(Bezier, cartail, t_)}
		fillTrajectory(0.0,1.0,100,B1,Tx,"grey");
		context.closePath();
	    context.fill();
	}
	
	function drawAxes100unit(color,Tx) {
	    context.strokeStyle=color;
	    context.beginPath();
	    // Axes
	    moveToTx([120,0],Tx);lineToTx([0,0],Tx);lineToTx([0,120],Tx);
	    // Arrowheads
	    moveToTx([110,5],Tx);lineToTx([120,0],Tx);lineToTx([110,-5],Tx);
	    moveToTx([5,110],Tx);lineToTx([0,120],Tx);lineToTx([-5,110],Tx);
	    // X-label
	    moveToTx([130,0],Tx);lineToTx([140,10],Tx);
	    moveToTx([130,10],Tx);lineToTx([140,0],Tx);
	    context.stroke();
	}

	function drawAxes1unit(color,Tx) {
	    context.strokeStyle=color;
	    context.beginPath();
	    // Axes
	    moveToTx([1.20,0],Tx);lineToTx([0,0],Tx);lineToTx([0,1.20],Tx);
	    // Arrowheads
	    moveToTx([1.10,.05],Tx);lineToTx([1.20,0],Tx);lineToTx([1.10,-.05],Tx);
	    moveToTx([.05,1.10],Tx);lineToTx([0,1.20],Tx);lineToTx([-.05,1.10],Tx);
	    // X-label
	    moveToTx([1.30,0],Tx);lineToTx([1.40,.10],Tx);
	    moveToTx([1.30,.10],Tx);lineToTx([1.40,0],Tx);
	    context.stroke();
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

  var Bezier = function(t) {
	var oneMinusT = 1-t;
	return [
		Math.pow(oneMinusT, 3),
		3 * Math.pow(oneMinusT, 2) * t,
		3 * oneMinusT * Math.pow(t, 2),
		Math.pow(t, 3),
	]
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
      
    var p0=[0,0];
    var d0=[0,3];

    var p1=[1,1];
    var d1=[1,3];

    var p2=[2,2];
    var d2=[3,0];

	var p3=[3, 1];
	var d3=[-1, -3];

	var p4 =[slider, -slider];
	var d4 =[0 - slider, 3 - slider];



    var P0 = [p0,d0,p1,d1]; // First two points and tangents
    var P1 = [p1,d1,p2,d2]; // Last two points and tangents
	var P2 = [p2,d2,p3,d3];
	var P3 = [p3,d3,p4,d4];

    var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
    var C1 = function(t_) {return Cubic(Hermite,P1,t_);};
  	var C2 = function(t_) {return Cubic(Hermite,P2,t_);};
	var C3 = function(t_) {return Cubic(Hermite,P3,t_);};

	var D0 = function(t_) {return Cubic(HermiteDerivative,P0,t_);};
	var D1 = function(t_) {return Cubic(HermiteDerivative,P1,t_);};
	var D2 = function(t_) {return Cubic(HermiteDerivative,P2,t_);};
	var D3 = function(t_) {return Cubic(HermiteDerivative,P3,t_);};

	

    var Ccomp = function(t) {
        if (t<1){
            var u = t;
            return C0(u);
        } else if (t >= 1 & t < 2) {
            var u = t-1.0;
            return C1(u);
        } else if (t >= 2 && t < 3) {
			var u = t - 2;
			return C2(u);
		} else if (t >=3 && t < 4) {
			var u = t - 3;
			return C3(u);
		}
    }

	var Angle = function(t) {
		if (t<1) {
			return -Math.atan2(D0(t)[0], D0(t)[1]);
		} else if (t>=1 && t < 2) {
			var u = t - 1;
			return -Math.atan2(D1(u)[0], D1(u)[1]);
		} else if (t>=2 && t<3) {
			var u = t - 2;
			return -Math.atan2(D2(u)[0], D2(u)[1]);
		} else {
			var u = t - 3;
			return -Math.atan2(D3(u)[0], D3(u)[1]);
		}
	}

	// var Ccomp = function(t) {
    //     if (t<1){
    //         var u = t;
    //         return C0(u);
    //     } else {
    //         var u = t-1.0;
    //         return C1(u);
    //     }          
    // }

	function fillTrajectory(t_begin,t_end,intervals,C,Tx,color) {
	    context.fillStyle=color;
	    context.beginPath();
        moveToTx(C(t_begin),Tx);
        for(var i=1;i<=intervals;i++){
            var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
            lineToTx(C(t),Tx);
        }
		lineToTx(C(t_end), Tx);
        context.fill();
	}

    function drawTrajectory(t_begin,t_end,intervals,C,Tx,color) {
		context.lineWidth = 50;
	    context.strokeStyle=color;
	    context.beginPath();
        moveToTx(C(t_begin),Tx);
        for(var i=1;i<=intervals;i++){
            var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
            lineToTx(C(t),Tx);
        }
        context.stroke();
	}

	// make sure you understand these    

	//drawAxes100unit("black", mat3.create());
	
	var Tblue_to_canvas = mat3.create();
	mat3.fromTranslation(Tblue_to_canvas,[50,350]);
	mat3.scale(Tblue_to_canvas,Tblue_to_canvas,[150,-150]); // Flip the Y-axis
	//drawAxes1unit("grey",Tblue_to_canvas);

    drawTrajectory(0.0,1.0,100,C0,Tblue_to_canvas,"red");
	// var Tp = mat3.create();
	// mat3.fromTranslation(Tp, [0, 0.1]);
	// mat3.multiply(Tp, Tblue_to_canvas, Tp);
	// drawTrajectory(0.0,1.0,100,C0,Tp,"red");


	//drawTrajectory(0.0,1.0,100,C0P,Tblue_to_canvas,"red");
	drawTrajectory(0.0,1.0,100,C1,Tblue_to_canvas,"blue");

	drawTrajectory(0.0,1.0,100,C2,Tblue_to_canvas,"green");

	drawTrajectory(0.0,1.0,100,C3,Tblue_to_canvas,"yellow");

	//drawTrajectory(0.0,1.0,100,C1P,Tblue_to_canvas,"blue");
	var Tgreen_to_blue = mat3.create();
	mat3.fromTranslation(Tgreen_to_blue,Ccomp(tParam));
	var Tgreen_to_canvas = mat3.create();
	mat3.multiply(Tgreen_to_canvas, Tblue_to_canvas, Tgreen_to_blue);
	mat3.rotate(Tgreen_to_canvas, Tgreen_to_canvas, Angle(tParam));
	//mat3.fromTranslation(Tgreen_to_canvas, Tgreen_to_canvas, [5, 0])
	drawObject("black",Tgreen_to_canvas);
	//drawObject("white",Tgreen_to_canvas);
	update();
	window.requestAnimationFrame(draw);

	function update() {
		tParam += 0.002;
		tParam = tParam % 4;
	}
    }

	function updateSlide() {
		slider = slider1.value * 0.01;
	}



    
    slider1.addEventListener("input",updateSlide);
    draw();
}
window.onload = setup;
