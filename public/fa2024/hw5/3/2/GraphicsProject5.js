function setup() {
  var canvas = document.getElementById('myCanvas');

  var slider1 = document.getElementById('slider1');
  slider1.value = 0;

  var slider2 = document.getElementById('slider2');
  slider2.value = 0;

  var showCurve = document.getElementById('showCurve');
  showCurve.checked = false;

  var showAxis = document.getElementById('showAxis');
  showCurve.checked = false;

  function draw() {
    var context = canvas.getContext('2d');
    canvas.width = canvas.width;

    var tSliderValue = slider1.value * 0.01;
    var viewAngle = slider2.value * -0.01 * Math.PI;
    var curveOn = showCurve.checked;
    var axisOn = showAxis.checked;

    function moveToTx(loc,Tx)
    {var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.moveTo(res[0],res[1]);}
  
    function lineToTx(loc,Tx)
    {var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.lineTo(res[0],res[1]);}
    

    function draw3DAxes(color,TxU,scale) {
      var Tx = mat4.clone(TxU);
      mat4.scale(Tx,Tx,[scale,scale,scale]);

      context.strokeStyle=color;
      context.beginPath();
      // Axes
      moveToTx([1.2,0,0],Tx);lineToTx([0,0,0],Tx);lineToTx([0,1.2,0],Tx);
      moveToTx([0,0,0],Tx);lineToTx([0,0,1.2],Tx);
      // Arrowheads
      moveToTx([1.1,.05,0],Tx);lineToTx([1.2,0,0],Tx);lineToTx([1.1,-.05,0],Tx);
      moveToTx([.05,1.1,0],Tx);lineToTx([0,1.2,0],Tx);lineToTx([-.05,1.1,0],Tx);
      moveToTx([.05,0,1.1],Tx);lineToTx([0,0,1.2],Tx);lineToTx([-.05,0,1.1],Tx);
      // X-label
      moveToTx([1.3,-.05,0],Tx);lineToTx([1.4,.05,0],Tx);
      moveToTx([1.3,.05,0],Tx);lineToTx([1.4,-.05,0],Tx);
      // Y-label
      moveToTx([-.05,1.4,0],Tx);lineToTx([0,1.35,0],Tx);lineToTx([.05,1.4,0],Tx);
      moveToTx([0,1.35,0],Tx);lineToTx([0,1.28,0],Tx);
      // Z-label
      moveToTx([-.05,0,1.3],Tx);
      lineToTx([.05,0,1.3],Tx);
      lineToTx([-.05,0,1.4],Tx);
      lineToTx([.05,0,1.4],Tx);

    context.stroke();
    }

    function drawSquare(color, Tx){
      context.strokeStyle = "black";
      context.beginPath();
      
      context.fillStyle = color;
      moveToTx([0,0,0], Tx);lineToTx([1,0,0], Tx);lineToTx([1,1,0], Tx);lineToTx([0,1,0], Tx);lineToTx([0,0,0], Tx);
      context.fill();
      context.stroke();
    }

    function drawNineSquares(color, Tx){
      var stack = [ Tx ];

      drawSquare(color, Tx);

      stack.unshift(mat4.clone(stack[0]));
      var two = mat4.create();
      mat4.fromTranslation(two,[1,0,0]);
      mat4.multiply(stack[0],stack[0],two);
      drawSquare(color, stack[0]);
      stack.shift();
      
      stack.unshift(mat4.clone(stack[0]));
      var three = mat4.create();
      mat4.fromTranslation(three,[2,0,0]);
      mat4.multiply(stack[0],stack[0],three);
      drawSquare(color, stack[0]);
      stack.shift();

      stack.unshift(mat4.clone(stack[0]));
      var four = mat4.create();
      mat4.fromTranslation(four,[0,1,0]);
      mat4.multiply(stack[0],stack[0],four);
      drawSquare(color, stack[0]);
      stack.shift();

      stack.unshift(mat4.clone(stack[0]));
      var five = mat4.create();
      mat4.fromTranslation(five,[0,2,0]);
      mat4.multiply(stack[0],stack[0],five);
      drawSquare(color, stack[0]);
      stack.shift();

      stack.unshift(mat4.clone(stack[0]));
      var six = mat4.create();
      mat4.fromTranslation(six,[1,2,0]);
      mat4.multiply(stack[0],stack[0],six);
      drawSquare(color, stack[0]);
      stack.shift();

      stack.unshift(mat4.clone(stack[0]));
      var seven = mat4.create();
      mat4.fromTranslation(seven,[1,1,0]);
      mat4.multiply(stack[0],stack[0],seven);
      drawSquare(color, stack[0]);
      stack.shift();

      stack.unshift(mat4.clone(stack[0]));
      var eight = mat4.create();
      mat4.fromTranslation(eight,[2,1,0]);
      mat4.multiply(stack[0],stack[0],eight);
      drawSquare(color, stack[0]);
      stack.shift();

      stack.unshift(mat4.clone(stack[0]));
      var nine = mat4.create();
      mat4.fromTranslation(nine,[2,2,0]);
      mat4.multiply(stack[0],stack[0],nine);
      drawSquare(color, stack[0]);
      stack.shift();
    }

    function drawCube(color, TxU, scale){
      // setup stack 
      var Tx = mat4.clone(TxU);
      mat4.scale(Tx,Tx,[scale,scale,scale]);
      var a = mat4.create();
      mat4.fromTranslation(a, [2.125,0,0]);
      mat4.multiply(Tx, Tx, a);
      mat4.fromTranslation(a, Ccomp(tSliderValue));
      mat4.multiply(Tx, Tx, a);
      mat4.fromYRotation(a, 1.25 * Math.PI);
      mat4.multiply(Tx, Tx, a);

      var stack = [Tx]

      // floor
      stack.unshift(mat4.clone(stack[0]));
      var white = mat4.create();
      mat4.fromXRotation(white, .5 * Math.PI);
      mat4.multiply(stack[0], stack[0], white);
      drawNineSquares("white", stack[0]);
      stack.shift();

      stack.unshift(mat4.clone(stack[0]));
      var red = mat4.create();
      mat4.fromTranslation(red, [0, 0, 1]);
      mat4.fromYRotation(red, -.5 * Math.PI);
      mat4.multiply(stack[0], stack[0], red);
      drawNineSquares("red", stack[0]);
      stack.shift();

      stack.unshift(mat4.clone(stack[0]));
      var green = mat4.create();
      mat4.fromTranslation(green, [0, 0, 3]);
      mat4.multiply(stack[0], stack[0], green);
      drawNineSquares("green", stack[0]);
      stack.shift();

      stack.unshift(mat4.clone(stack[0]));
      var yellow = mat4.create();
      mat4.fromTranslation(yellow, [3, 0, 0]);
      mat4.multiply(stack[0], stack[0], yellow);
      var yellow2 = mat4.create();
      mat4.fromYRotation(yellow2, -.5 * Math.PI);
      mat4.multiply(stack[0], stack[0], yellow2);

      drawNineSquares("blue", Tx);

      drawNineSquares("yellow", stack[0]);
      stack.shift();

      stack.unshift(mat4.clone(stack[0]));
      var white = mat4.create();
      mat4.fromTranslation(white, [0, 3, 0]);
      mat4.multiply(stack[0], stack[0], white);
      var white2 = mat4.create();
      mat4.fromXRotation(white2, .5 * Math.PI);
      mat4.multiply(stack[0], stack[0], white2);
      drawNineSquares("orange", stack[0]);
      stack.shift();
    }

    function drawFloorWalls(wallColor, floorColor, TxU, scale){
      var Tx = mat4.clone(TxU);
      mat4.scale(Tx,Tx,[scale,scale,scale]);

      var translation = mat4.create();
      mat4.fromTranslation(translation, [0, 0, -2]);
      mat4.multiply(Tx, Tx, translation);

      var rotation = mat4.create();
      mat4.fromYRotation(rotation, -.25 * Math.PI);
      mat4.multiply(Tx, Tx, rotation);

      var floor = mat4.create();
      mat4.fromTranslation(floor, [0, 0, 0]);
      mat4.multiply(Tx, Tx, floor);
      var floor2 = mat4.create();
      mat4.fromXRotation(floor2, .5 * Math.PI);
      mat4.multiply(Tx, Tx, floor2);

      drawNineSquares(floorColor, Tx);
    }

    function drawHermite(color, TxU, scale){
      var Tx = mat4.clone(TxU);
      mat4.scale(Tx,Tx,[scale,scale,scale]);
      var a = mat4.create();
      //mat4.fromTranslation(a, [0,3,0]);
      mat4.multiply(Tx, Tx, a);

      drawTrajectory(0.0, 1.0, 100, C0, Tx, "white");
      drawTrajectory(0.0, 1.0, 100, C1, Tx, "red");
      drawTrajectory(0.0, 1.0, 100, C2, Tx, "black");

      draw3DAxes("black", Tx, 1);
    }


    function backgroundColor(color){
      context.fillStyle = color;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    function star(size, distance, color, Tx) {
      context.fillStyle = "white";
      context.fillStyle = color;
      context.beginPath();
      moveToTx([distance - size/2, -size/2, 0], Tx);
      lineToTx([distance + size/2, -size/2, 0], Tx);
      lineToTx([distance + size/2, size/2, 0], Tx);
      lineToTx([distance - size/2, size/2, 0], Tx);
      context.fill();
    }

    
    var Hermite = function(t) {
	    return [
		2*(t*t*t) - 3*(t*t) + 1,
		(t*t*t) - 2*(t*t) + t,
		-2*(t*t*t) + 3*(t*t),
		(t*t*t) - (t*t)
	    ];
	  }

    function Cubic(basis,P,t){
      var b = basis(t);
      var result = vec3.create();
      vec3.scale(result,P[0],b[0]);
      vec3.scaleAndAdd(result,result,P[1],b[1]);
      vec3.scaleAndAdd(result,result,P[2],b[2]);
      vec3.scaleAndAdd(result,result,P[3],b[3]);
      return result;
    }

    var p0=[0, 0, 0];
    var d0=[5, 2, 1];
    var p1=[0, 1, -.5];
    var d1=[3, 2, 1];
    var p2=[0, 2, 0];
    var d2=[3, 2, 1];
    var p3=[0, 3, .5];
    var d3=[2, 3, 5];
  
    var P0 = [p0,d0,p1,d1]; // First two points and tangents
    var P1 = [p1,d1,p2,d2]; // Last two points and tangents
    var P2 = [p2,d2,p3,d3]; // Last two points and tangents

    var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
    var C1 = function(t_) {return Cubic(Hermite,P1,t_);};
    var C2 = function(t_) {return Cubic(Hermite,P2,t_);};


  function drawTrajectory(t_begin, t_end, intervals, C, Tx, color) {
    context.strokeStyle = color;
    context.beginPath();
      moveToTx(C(t_begin), Tx);
      for(var i = 1; i <= intervals; i++){
          var t = ((intervals - i) / intervals) * t_begin + (i/intervals) * t_end;
          lineToTx(C(t),Tx);
      }
      context.stroke();
  }

  // For moving object along curve
  var Ccomp = function(t) {
    if (t<1){
        var u = t;
        return C0(u);
    } 
    else if (t >= 1 && t < 2){
      var u = t-1.0;
      return C1(u);
    }
    else {
      var u = t-2.0;
      return C2(u);
    }          
  }

  var CameraCurve = function(angle) {
    var distance = 120.0;
    var eye = vec3.create();
    eye[0] = distance * Math.sin(viewAngle);
    eye[1] = 65;
    eye[2] = distance * Math.cos(viewAngle);  
    return [eye[0], eye[1], eye[2]];
  }

    //#region Tranformation Matrixes

    // Create Camera (lookAt) transform
    var camPos = CameraCurve(viewAngle); // Camera Pos
    var camTarget = vec3.fromValues(0,0,0); // Aim at the origin of the world coords
    var up = vec3.fromValues(0,100,0); // Y-axis of world coords to be vertical
	  var TlookAtCamera = mat4.create();
    mat4.lookAt(TlookAtCamera, camPos, camTarget, up);

    // Create ViewPort transform (assumed the same for both canvas instances)
    var Tviewport = mat4.create();
    // Move the center of the "lookAt" transform (where the camera points) 
    // to the canvas coordinates (400,300)
    mat4.fromTranslation(Tviewport,[400,275,0]);  
    // Flip the Y-axis, scale everything by 100x
    mat4.scale(Tviewport,Tviewport,[100,-100,1]); 
    
    // Create Camera projection transform
    var TprojectionCamera = mat4.create();
    mat4.ortho(TprojectionCamera,-100,100,-100,100,-1,1);

    // Create transform t_VP_PROJ_CAM that incorporates 
    // viewport, projection and camera transforms
    var tVP_PROJ_VIEW_Camera = mat4.create();
    mat4.multiply(tVP_PROJ_VIEW_Camera,Tviewport,TprojectionCamera);
    mat4.multiply(tVP_PROJ_VIEW_Camera,tVP_PROJ_VIEW_Camera,TlookAtCamera);

    //#endregion
    
    backgroundColor("#f3de8a");
    
    drawFloorWalls("black", "#ddb517", tVP_PROJ_VIEW_Camera, 100);

    // lots of hierarchy
    drawCube("blue", tVP_PROJ_VIEW_Camera, 50.0);

    if(axisOn) draw3DAxes("magenta", tVP_PROJ_VIEW_Camera,100.0);

    if (curveOn) drawHermite("black", tVP_PROJ_VIEW_Camera, 50);

    console.log(showCurve);

  }
  
  slider1.addEventListener("input", draw);
  slider2.addEventListener("input", draw);
  showCurve.addEventListener("input", draw);
  showAxis.addEventListener("input", draw);

  draw();

  requestAnimationFrame(draw);
}

window.onload = setup;


