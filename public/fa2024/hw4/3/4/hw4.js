const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');
var slider1 = document.getElementById('slider1');
slider1.value = 0;

var slider2 = document.getElementById('slider2');
slider2.value = 0;

var stack = [ mat3.create() ]; // Initialize stack with identity on top

function moveToTx(x,y)  
{var res=vec2.create(); vec2.transformMat3(res,[x,y],stack[0]); context.moveTo(res[0],res[1]);}

function lineToTx(x,y)
{var res=vec2.create(); vec2.transformMat3(res,[x,y],stack[0]); context.lineTo(res[0],res[1]);}

function drawObject(color) {
	context.beginPath();
	context.fillStyle = color;
	moveToTx(-.05,-.05);
	lineToTx(-.05,.05);
	lineToTx(.05,.05);
	lineToTx(.1,0);
	lineToTx(.05,-.05);
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

var Bezier = function(t) {
    return [
        (1 - t) * (1 - t) * (1 - t),   // B0
        3 * t * (1 - t) * (1 - t),     // B1
        3 * t * t * (1 - t),           // B2
        t * t * t                      // B3
    ];
};

var BezierDerivative = function(t) {
    return [
        -3 * (1 - t) * (1 - t),        // B0'
        3 * (1 - t) * (1 - t) - 6 * t * (1 - t),   // B1'
        6 * t * (1 - t) - 3 * t * t,   // B2'
        3 * t * t                      // B3'
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

var p0=[0,0];
var d0=[1,1];
var p1=[2,1];
var d1=[-1,3];
var p2=[1,2];
var d2=[0,3];

var P0 = [p0,d0,p1,d1];
var P1 = [p1,d1,p2,d2];
var P2 = [p2, d2, p0, d0];

var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
var C1 = function(t_) {return Cubic(Hermite,P1,t_);};
var C2 = function(t_) {return Cubic(Hermite,P2,t_);};

var C0prime = function(t_) {return Cubic(HermiteDerivative,P0,t_);};
var C1prime = function(t_) {return Cubic(HermiteDerivative,P1,t_);};
var C2prime = function(t_) {return Cubic(HermiteDerivative,P2,t_);};

var Ccomp = function(t) {
	if (t<1){
		var u = t;
		return C0(u);
	} 
	else if (t < 2) {
		var u = t-1.0;
		return C1(u);
	}
	else {
		var u = t - 2.0;
		return C2(u);
	}
}

var Ccomp_tangent = function(t) {
	if (t<1){
		var u = t;
		return C0prime(u);
	} 
	else if (t<2) {
		var u = t-1.0;
		return C1prime(u);
	}
	else {
		var u = t-2.0;
		return C2prime(u);
	}
}

var b0=[0,0]; //bezier point
var b1=[1,2];
var b2=[2,1];
var b3=[1,3];
var b4=[2,4];
var b5=[5,5];

var B0 = [b0,b1,b2,b3];
var B1 = [b3,b2,b1,b5];
var B2 = [b5, b3, b4, [4,3]];

var cB0 = function(t_) {return Cubic(Bezier,B0,t_);};
var cB1 = function(t_) {return Cubic(Bezier,B1,t_);};
var cB2 = function(t_) {return Cubic(Bezier,B2,t_);};

var cB0prime = function(t_) {return Cubic(BezierDerivative,B0,t_);};
var cB1prime = function(t_) {return Cubic(BezierDerivative,B1,t_);};
var cB2prime = function(t_) {return Cubic(BezierDerivative,B2,t_);};

var cBcomp = function(t) {
	if (t<1){
		var u = t;
		return cB0(u);
	} 
	else if (t < 2) {
		var u = t-1.0;
		return cB1(u);
	}
	else {
		var u = t - 2.0;
		return cB2(u);
	}
}

var cBcomp_tangent = function(t) {
	if (t<1){
		var u = t;
		return cB0prime(u);
	} 
	else if (t<2) {
		var u = t-1.0;
		return cB1prime(u);
	}
	else {
		var u = t-2.0;
		return cB2prime(u);
	}
}

function drawTrajectory(t_begin,t_end,intervals,C,color) {
	context.strokeStyle=color;
	context.beginPath();
	var pos = C(t_begin);
	moveToTx(pos[0], pos[1]);
	for(var i=1;i<=intervals;i++){
		var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
		pos = C(t);
		lineToTx(pos[0], pos[1]);
	}
	context.stroke();
}
function setup(){
	function draw(){
		context.clearRect(0, 0, canvas.width, canvas.height);
		var tParam1 = slider1.value*0.01;
		var tParam2 = slider2.value*0.01;
		var Thermite_to_canvas = mat3.create();
		mat3.fromTranslation(Thermite_to_canvas,[50,350]);
		mat3.scale(Thermite_to_canvas,Thermite_to_canvas,[150,-150]); // Flip the Y-axis
		stack.unshift(Thermite_to_canvas);
		drawTrajectory(0.0,1.0,100,C0,"red");
		drawTrajectory(0.0,1.0,100,C1,"blue");
		drawTrajectory(0.0,1.0,100,C2,"black");
		var Tobject_to_hermite = mat3.create();
		mat3.fromTranslation(Tobject_to_hermite,Ccomp(tParam1));
		var THobject_to_canvas = mat3.create();
		var tangent = Ccomp_tangent(tParam1);
		var angle = Math.atan2(tangent[1],tangent[0]);
		mat3.rotate(Tobject_to_hermite,Tobject_to_hermite,angle);
		mat3.multiply(THobject_to_canvas, Thermite_to_canvas, Tobject_to_hermite);
		stack.unshift(THobject_to_canvas);
		drawObject("green");
		stack.shift();
		var Tbezier_to_canvas = mat3.create();
		mat3.fromTranslation(Tbezier_to_canvas, [350, 350]);
		mat3.scale(Tbezier_to_canvas,Tbezier_to_canvas,[50,-50]);
		stack.unshift(Tbezier_to_canvas);
		drawTrajectory(0.0,1.0,100,cB0,"red");
		drawTrajectory(0.0,1.0,100,cB1,"blue");
		drawTrajectory(0.0,1.0,100,cB2,"black");
		var Tobject_to_bezier = mat3.create();
		mat3.fromTranslation(Tobject_to_bezier,cBcomp(tParam2));
		var TBobject_to_canvas = mat3.create();
		var tangent = cBcomp_tangent(tParam2);
		var angle = Math.atan2(tangent[1],tangent[0]);
		mat3.rotate(Tobject_to_bezier,Tobject_to_bezier,angle);
		mat3.multiply(TBobject_to_canvas, Tbezier_to_canvas, Tobject_to_bezier);
		stack.unshift(TBobject_to_canvas);
		drawObject("green");
		stack.shift();
	}
	slider1.addEventListener("input",draw);
	slider2.addEventListener("input",draw);
	draw();
}
window.onload=setup;