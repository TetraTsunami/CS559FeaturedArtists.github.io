function setup() {
    var obCanvas = document.getElementById('observeCanvas');
    var camCanvas = document.getElementById('camCanvas');
    var obContext = obCanvas.getContext('2d');
    var camContext = camCanvas.getContext('2d');
    var sliderDrive = document.getElementById('sliderDrive');
    sliderDrive.value = 0;
    var sliderRotate = document.getElementById('sliderRotate');
    sliderRotate.value = 0;

    var context = camContext; 

    function draw() {

	obCanvas.width = obCanvas.width;
	camCanvas.width = camCanvas.width;

	var disTraveled = sliderDrive.value*0.01;
    var viewAngle = sliderRotate.value*0.02*Math.PI;
     
	function moveToTx(loc,Tx)
	{var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.moveTo(res[0],res[1]);}

	function lineToTx(loc,Tx)
	{var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.lineTo(res[0],res[1]);}
	
	function drawShip(TxU,scale) {
        var Tx = mat4.clone(TxU);
        mat4.scale(Tx,Tx,[scale,scale,scale]);
		context.beginPath();
		context.fillStyle = "silver";
		moveToTx([-1,-1,-1],Tx);
		lineToTx([-1,1,-1],Tx);
		lineToTx([-1,1,1],Tx);
		lineToTx([-1,-1,1],Tx);
		context.closePath();
		context.fill();
		moveToTx([-1,-1,1],Tx);
		lineToTx([-1,1,1],Tx);
		lineToTx([1,1,1],Tx);
		lineToTx([1,-1,1],Tx);
		context.closePath();
		context.fill();
		moveToTx([1,1,-1],Tx);
		lineToTx([-1,1,-1],Tx);
		lineToTx([-1,1,1],Tx);
		lineToTx([1,1,1],Tx);
		context.closePath();
		context.fill();
		moveToTx([-1,-1,-1],Tx);
		lineToTx([-1,1,-1],Tx);
		lineToTx([1,1,-1],Tx);
		lineToTx([1,-1,-1],Tx);
		context.closePath();
		context.fill();
		moveToTx([1,-1,-1],Tx);
		lineToTx([-1,-1,-1],Tx);
		lineToTx([-1,-1,1],Tx);
		lineToTx([1,-1,1],Tx);
		context.closePath();
		context.fill();
		moveToTx([1,-1,-1],Tx);
		lineToTx([1,1,-1],Tx);
		lineToTx([1,1,1],Tx);
		lineToTx([1,-1,1],Tx);
		context.closePath();
		context.fill();
		context.beginPath();
		context.fillStyle = "red";  
		moveToTx([1,-1,-1],Tx);
		lineToTx([2.5,0,0],Tx);
		lineToTx([1,-1,1],Tx);
		context.closePath();
		context.fill();
		moveToTx([1,-1,1],Tx);
		lineToTx([2.5,0,0],Tx);
		lineToTx([1,1,1],Tx);
		context.closePath();
		context.fill();
		moveToTx([1,1,1],Tx);
		lineToTx([2.5,0,0],Tx);
		lineToTx([1,1,-1],Tx);
		context.closePath();
		context.fill();
		moveToTx([1,1,-1],Tx);
		lineToTx([2.5,0,0],Tx);
		lineToTx([1,-1,-1],Tx);
		context.closePath();
		context.fill();
	}
	
	function drawFlame(TxU,scale){
		var Tx = mat4.clone(TxU);
		mat4.scale(Tx,Tx,[scale,scale,scale]);
		context.beginPath();
		context.fillStyle = "Orange"
		moveToTx([0,-1,-1],Tx);
		lineToTx([1,0,0],Tx);
		lineToTx([0,-1,1],Tx);
		context.closePath();
		context.fill();
		moveToTx([0,-1,1],Tx);
		lineToTx([1,0,0],Tx);
		lineToTx([0,1,1],Tx);
		context.closePath();
		context.fill();
		moveToTx([0,1,1],Tx);
		lineToTx([1,0,0],Tx);
		lineToTx([0,1,-1],Tx);
		context.closePath();
		context.fill();
		moveToTx([0,1,-1],Tx);
		lineToTx([1,0,0],Tx);
		lineToTx([0,-1,-1],Tx);
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
	    var result=vec3.create();
	    vec3.scale(result,P[0],b[0]);
	    vec3.scaleAndAdd(result,result,P[1],b[1]);
	    vec3.scaleAndAdd(result,result,P[2],b[2]);
	    vec3.scaleAndAdd(result,result,P[3],b[3]);
	    return result;
	}
	
	var p0=[0,0,0];
	var d0=[100,300,200];
	var p1=[100,100,-50];
	var d1=[-100,300,-150];
	var p2=[200,150,100];
	var d2=[0,300,-100];

	var P0 = [p0,d0,p1,d1];
	var P1 = [p1,d1,p2,d2];
	
	var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
	var C1 = function(t_) {return Cubic(Hermite,P1,t_);};

	var C0prime = function(t_) {return Cubic(HermiteDerivative,P0,t_);};
	var C1prime = function(t_) {return Cubic(HermiteDerivative,P1,t_);};
      
    var Ccomp = function(t) {
        if (t<1){
            var u = t;
            return C0(u);
        } else {
            var u = t-1.0;
            return C1(u);
        }          
	}

    var Ccomp_tangent = function(t) {
        if (t<1){
            var u = t;
            return C0prime(u);
        } else {
            var u = t-1.0;
            return C1prime(u);
        }          
	}

    var camCurve = function(angle) {
        var distance = 120.0;
        var eye = vec3.create();
        eye[0] = distance*Math.sin(viewAngle);
        eye[1] = 100;
        eye[2] = distance*Math.cos(viewAngle);  
        return [eye[0],eye[1],eye[2]];
    }

    var eyeCam = camCurve(viewAngle);
    var targetCam = vec3.fromValues(0,0,0); 
    var upCam = vec3.fromValues(0,1,0); 
	var TlookAtCam = mat4.create();
    mat4.lookAt(TlookAtCam, eyeCam, targetCam, upCam);
      
    var eyeOb = vec3.fromValues(500,300,500);
    var targetOb = vec3.fromValues(0,50,0); 
    var upOb = vec3.fromValues(0,1,0); 
	var TlookAtOb = mat4.create();
    mat4.lookAt(TlookAtOb, eyeOb, targetOb, upOb);
      
    var Tviewport = mat4.create();
	mat4.fromTranslation(Tviewport,[200,300,0]);  
	mat4.scale(Tviewport,Tviewport,[100,-100,1]); 
    context = camContext;

    var TprojectionCam = mat4.create();
    mat4.ortho(TprojectionCam,-100,100,-100,100,-1,1);

    var TprojectionOb = mat4.create();
    mat4.ortho(TprojectionOb,-120,120,-120,120,-1,1);

    var tVP_PROJ_VIEW_Cam = mat4.create();
    mat4.multiply(tVP_PROJ_VIEW_Cam,Tviewport,TprojectionCam);
    mat4.multiply(tVP_PROJ_VIEW_Cam,tVP_PROJ_VIEW_Cam,TlookAtCam);
    var tVP_PROJ_VIEW_Ob = mat4.create();
    mat4.multiply(tVP_PROJ_VIEW_Ob,Tviewport,TprojectionOb);
    mat4.multiply(tVP_PROJ_VIEW_Ob,tVP_PROJ_VIEW_Ob,TlookAtOb);
      
    var Tmodel = mat4.create();
	mat4.fromTranslation(Tmodel,Ccomp(disTraveled));
    var tangent = Ccomp_tangent(disTraveled);
    var angle = Math.atan2(tangent[1],tangent[0]);
	mat4.rotateZ(Tmodel,Tmodel,angle);

    var tVP_PROJ_VIEW_MOD_Cam = mat4.create();
	mat4.multiply(tVP_PROJ_VIEW_MOD_Cam, tVP_PROJ_VIEW_Cam, Tmodel);
    var tVP_PROJ_VIEW_MOD1_Ob = mat4.create();
	mat4.multiply(tVP_PROJ_VIEW_MOD1_Ob, tVP_PROJ_VIEW_Ob, Tmodel);
    var tVP_PROJ_VIEW_MOD2_Ob = mat4.create();
    mat4.translate(tVP_PROJ_VIEW_MOD2_Ob, tVP_PROJ_VIEW_Ob, eyeCam);
	var TlookFromCam = mat4.create();
    mat4.invert(TlookFromCam,TlookAtCam);
    mat4.multiply(tVP_PROJ_VIEW_MOD2_Ob, tVP_PROJ_VIEW_MOD2_Ob, TlookFromCam);

    context = camContext;
	var flameToShipCam = mat4.create();
	mat4.fromTranslation(flameToShipCam,[-25,0,0]);
	var flameToCamCanvas = mat4.create();
	mat4.multiply(flameToCamCanvas,tVP_PROJ_VIEW_MOD_Cam,flameToShipCam);
	drawFlame(flameToCamCanvas,disTraveled*25);
	drawShip(tVP_PROJ_VIEW_MOD_Cam,25.0);

    context = obContext; 
	var flameToShipOb = mat4.create();
	mat4.fromTranslation(flameToShipOb,[-25,0,0]);
	var flameToObCanvas = mat4.create();
	mat4.multiply(flameToObCanvas,tVP_PROJ_VIEW_MOD1_Ob,flameToShipOb);
	drawFlame(flameToObCanvas,disTraveled*25);
	drawShip(tVP_PROJ_VIEW_MOD1_Ob,25.0);      
    }
    
  
    sliderDrive.addEventListener("input",draw);
    sliderRotate.addEventListener("input",draw);
    draw();
}
window.onload = setup;
