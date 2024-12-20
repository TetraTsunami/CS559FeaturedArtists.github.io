function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');
  var slider1 = document.getElementById('slider1');
  slider1.value = 0;
  var context = canvas.getContext('2d');
  const image = document.getElementById('source');

  //constants
  const mindim = 15;

  function draw() {

    canvas.width = canvas.width;
    var stack = [mat3.create()]; // Stack initialized with Identity 

    function moveToC(loc,Tx)
    {var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.moveTo(res[0],res[1]);}
  
    function lineToC(loc,Tx)
    {var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.lineTo(res[0],res[1]);}

    function moveToTx(x,y)  
    {var res=vec2.create(); vec2.transformMat3(res,[x,y],stack[0]); context.moveTo(res[0],res[1]);}

    function lineToTx(x,y)
    {var res=vec2.create(); vec2.transformMat3(res,[x,y],stack[0]); context.lineTo(res[0],res[1]);}

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

    var p0=[0,560];
    var d0=[1000,0];
    var p1=[1000,400];
    var d1=[1000,0];
    var p21=[1000,100];
    var d21=[-1000,0]
    var p2=[1000,400];
    var d2=[1000,0];
    var p3=[2000,560];
    var d3=[100,0];
    var tParam = (slider1.value)*0.04;    

    var P0 = [p0,d0,p1,d1]; // First two points and tangents
    var P1 = [p1,d1,p21,d21]; // Second two points and tangents
    var P1_ = [p21,d21,p2,d2];
    var P2 = [p2,d2,p3,d3]; // Second two points and tangents

    var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
    var C1 = function(t_) {return Cubic(Hermite,P1,t_);};
    var C2 = function(t_) {return Cubic(Hermite,P1_,t_);};
    var C3 = function(t_) {return Cubic(Hermite,P2,t_);};

    var C0prime = function(t_) {return Cubic(HermiteDerivative,P0,t_);};
    var C1prime = function(t_) {return Cubic(HermiteDerivative,P1,t_);};
    var C2prime = function(t_) {return Cubic(HermiteDerivative,P1_,t_);};
    var C3prime = function(t_) {return Cubic(HermiteDerivative,P2,t_);};

    var Ccomp = function(t) {
      console.log(t)
      if (t<1){
        var u = t;
        return C0(u);
      } else if (t < 2) {
        var u = (t-1.0);
        return C1(u);
      } else if (t < 3) {
        var u = (t-2.0);
        return C2(u);       
      } else {
        var u = (t-3.0);
        return C3(u);   
      }
    }

    var Ccomp_tangent = function(t) {
      console.log(t)
      if (t<1){
        var u = t;
        return C0prime(u);
      } else if (t < 2) {
        var u = (t-1.0);
        return C1prime(u);
      } else if (t < 3) {
        var u = (t-2.0);
        return C2prime(u);       
      } else {
        var u = (t-3.0);
        return C3prime(u);   
      }
    }

    function drawTrajectory(t_begin,t_end,intervals,C,Tx,color) {
	    context.strokeStyle=color;
      context.lineWidth=5;
	    context.beginPath();
      moveToC(C(t_begin),Tx);
        for(var i=1;i<=intervals;i++){
            var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
            lineToC(C(t),Tx);
        }
        context.stroke();
        context.closePath();
	  }
    
    function drawTrainbox(color) {
	    context.fillStyle=color;
      context.shadowColor="yellow";
      context.shadowBlur = 10;
	    context.beginPath();  
      var minuni = 10;
      moveToTx(0,0);
      lineToTx(-minuni*5,0);
      lineToTx(-minuni*5,-minuni*2);
      lineToTx(-minuni*4,-minuni*3);
      lineToTx(-minuni*4,-minuni*1);
      lineToTx(-minuni*2,-minuni*1);
      lineToTx(-minuni*2,-minuni*3);
      lineToTx(0,-minuni*2);
      context.closePath();
      context.fill();
    }

    //arc's radius, starting angle and ending angle and direction do not change on translation 
    function translatedArc(x,y, radius, start_angle, end_angle, counterclockwise) {
      var res=vec2.create(); vec2.transformMat3(res, [x,y], stack[0]); 
      context.arc(res[0],res[1], radius, start_angle, end_angle, counterclockwise);
    }

    // Quadratic curve to uses two points, one end point and one control point.
    // Both need to be transformed appropriately
    function quadraticCurveToTx(cpx, cpy, x, y) {
      var res=vec2.create(); vec2.transformMat3(res, [x,y], stack[0]); 
      var cres=vec2.create(); vec2.transformMat3(cres, [cpx,cpy], stack[0]); 
      context.quadraticCurveTo(cres[0], cres[1], res[0], res[1]);
    }

    function axes(color) {
	    context.strokeStyle=color;
	    context.beginPath();
	    // Axes
	    moveToTx(120,0);lineToTx(0,0);lineToTx(0,120);
	    // Arrowheads
	    moveToTx(110,5);lineToTx(120,0);lineToTx(110,-5);
	    moveToTx(5,110);lineToTx(0,120);lineToTx(-5,110);
	    // X-label
	    moveToTx(130,-5);lineToTx(140,5);
	    moveToTx(130,5);lineToTx(140,-5);
	    // Y-label
	    moveToTx(-5,130);lineToTx(0,135);lineToTx(5,130);
	    moveToTx(0,135);lineToTx(0,142);
	    context.stroke();
	}


   function drawTent(color1,color2) {

    var gradient = context.createLinearGradient(0,0,600,800);
    gradient.addColorStop(0, "gray");
    gradient.addColorStop(1, color2);
    context.fillStyle = gradient; 
    context.beginPath();
    moveToTx(-7*mindim, -14*mindim);
    lineToTx(-3*mindim, 0);
    lineToTx(0, -13*mindim);
    context.closePath();
    context.fill();

    context.beginPath();
    moveToTx(0, -13*mindim);
    lineToTx(3*mindim, 0);
    lineToTx(7*mindim, -14*mindim);
    context.closePath();
    context.fill();

    context.beginPath();
    moveToTx(-13*mindim,0);
    lineToTx(-11*mindim, -15*mindim);
    lineToTx(-7*mindim, -14*mindim);
    context.closePath();
    context.fill();    

    context.beginPath();
    moveToTx(13*mindim,0);
    lineToTx(11*mindim, -15*mindim);
    lineToTx(7*mindim, -14*mindim);
    context.closePath();
    context.fill();   

    context.fillStyle = color1;
    //Triangle 1
     context.beginPath();
    moveToTx(-13*mindim,0);
    lineToTx(-7*mindim, -14*mindim);
    lineToTx(-3*mindim, 0);
    context.closePath();
    context.fill();
    //Triangle 2
    context.beginPath();
    moveToTx(-3*mindim, 0);
    lineToTx(0, -13*mindim);
    lineToTx(3*mindim, 0);
    context.closePath();
    context.fill();
    //Triangle 3
    context.beginPath();
    moveToTx(3*mindim, 0);
    lineToTx(7*mindim, -14*mindim);
    lineToTx(13*mindim, 0);
    context.closePath();
    context.fill();  

    //Top part
    context.beginPath();
    moveToTx(11*mindim, -15*mindim);
    lineToTx(0, -20*mindim);
    lineToTx(-11*mindim, -15*mindim);
    lineToTx(-7*mindim, -14*mindim);
    lineToTx(0, -13*mindim);
    lineToTx(7*mindim, -14*mindim);
    context.closePath();
    context.fill();

    //Pole and flag
    context.strokeStyle = "white";
    context.lineWidth = 1.5;
    context.beginPath();
    moveToTx(0, -20*mindim);
    lineToTx(0,-26*mindim);
    context.stroke();

    context.fillStyle = color2;
    moveToTx(0, -24*mindim);
    lineToTx(2*mindim, -25*mindim);
    lineToTx(0, -26*mindim);
    context.fill()

   }

    
    function drawFerrisUnit(c1,c2) {
     
      // Assuming the frame is centered around (0,0)

      //Make the segments for the umbrella/cover
      //outer red
      context.beginPath();
      translatedArc(0,0, mindim*2, -Math.PI/2, Math.PI, true);
      context.fillStyle = c1;
      context.shadowColor="yellow";
      context.shadowBlur = 10;
      translatedArc(-22.5,0, mindim/2, -Math.PI, 0, false);
      quadraticCurveToTx(-15,-30, 0, -30);
      context.fill();
      context.closePath();
      //inner gold
      context.fillStyle = c2;
      context.beginPath();
      translatedArc(-7.5,0, mindim/2, -Math.PI, 0, false);
      lineToTx(0,-30);
      quadraticCurveToTx(-15,-30, -15, 0);
      context.fill();
      context.closePath();
      //inner red
      context.beginPath();
      context.fillStyle = c1;
      translatedArc(7.5,0, mindim/2, -Math.PI, 0, false);
      quadraticCurveToTx(15,-30, 0,-30);
      lineToTx(0,0);
      context.fill();
      context.closePath();
      //outer gold
      context.beginPath();
      context.fillStyle = c2;
      translatedArc(22.5,0, mindim/2, -Math.PI, 0, false);
      translatedArc(0,0, mindim*2, 0, -Math.PI/2, true);
      quadraticCurveToTx(15,-30,15,0);
      context.fill();
      context.closePath();

      //make frame
      context.beginPath();
      context.fillStyle = c1;
      moveToTx(-25,15);
      lineToTx(-15,15);
      lineToTx(-15,25);
      lineToTx(15,25);
      lineToTx(15,15);
      lineToTx(25,15);
      lineToTx(25,25);
      quadraticCurveToTx(25,45,15,45);
      lineToTx(-15,45);
      quadraticCurveToTx(-25,45,-25,25);
      context.closePath();
      context.fill();
      context.beginPath();
      context.fillStyle = c2;
      moveToTx(-15,15);
      lineToTx(-15,30);
      lineToTx(15,30);
      lineToTx(15,15);
      context.shadowColor="yellow";
      context.shadowBlur = 20;
      context.closePath();
      context.fill();

      //connect umbrella to frame
      context.strokeStyle = "orange";
      context.lineWidth = 5;
      context.shadowBlur = 0;
      context.beginPath();
      moveToTx(-22.5,-10);
      lineToTx(-22.5,15);
      context.stroke();
      context.closePath();
      context.strokeStyle = "orange";
      context.lineWidth = 5;
      context.shadowBlur = 0;
      context.beginPath();
      moveToTx(22.5,-10);
      lineToTx(22.5,15);
      context.stroke();
      context.closePath();

     }


     function drawFerrisBase() {

        //arch
        context.beginPath();
        context.strokeStyle = "#fdffc8";
        context.lineWidth = 5;
        moveToTx(0,0);
        lineToTx(100,270);
        lineToTx(-100,270);
        context.closePath();
        context.stroke(); 
      }

     function drawFerrisWheel(rot_angle, num_spokes,c1,c2,c3) {
      const wheelRadius = 200;
      const numCars = 10;
      var numSpokes = num_spokes;

      context.strokeStyle = "gray";
      context.shadowBlur = 0;
      context.lineWidth = 3;
      //concentric circles
      for (let i = 0; i < numSpokes; i++) {
        const radius = wheelRadius - i * 20;
        context.beginPath();
        translatedArc(0, 0, radius, 0, Math.PI*2);
        context.stroke();
      }

      const time = new Date();
      const rotationAngle = 
        ((2 * Math.PI) / 60) * time.getSeconds() +
        ((2 * Math.PI) / 60000) * time.getMilliseconds();

      for( let i = 0; i < numCars; i++) {
        const carAngle = i*((2*Math.PI)/numCars);
        const dimX = wheelRadius * Math.cos(carAngle + rotationAngle);
        const dimY = wheelRadius * Math.sin(carAngle + rotationAngle);
        
        //spokes
        stack.unshift(mat3.clone(stack[0])); // "save"
        context.strokeStyle = c1;
        context.lineWidth = 5;
        var Tspoke_to_wheel = mat3.create();
	      mat3.rotate(Tspoke_to_wheel,Tspoke_to_wheel,carAngle);
	      mat3.multiply(stack[0],stack[0],Tspoke_to_wheel);
        context.beginPath();
        moveToTx(0,0);
        lineToTx(wheelRadius,0);
        context.stroke();
        context.closePath();
        stack.unshift(mat3.clone(stack[0])); // "save"
        //draw car relative to spoke_to_wheel
        var Tcar = mat3.create();
        mat3.fromTranslation(Tcar,[wheelRadius,0]);
        mat3.rotate(Tcar,Tcar,-rot_angle-carAngle);
        mat3.multiply(stack[0],stack[0],Tcar);
        drawFerrisUnit(c2,c3);
        stack.shift();          // "restore"

        stack.shift();          // "restore"
      }
  
      
    }
    
    context.fillStyle = "black"
    //context.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate the scale factors to fit within the canvas
    var scaleX = canvas.width*2 / image.width;
    var scaleY = canvas.height / image.height;
    var scale = Math.min(scaleX, scaleY);

    // Calculate the new dimensions
    var newWidth = image.width * scale;
    var newHeight = image.height * scale;

    // Draw the scaled image on the canvas
    context.drawImage(image, 0, 0, newWidth, newHeight);

    // Optionally, you can position the image in the center of the canvas:
    var offsetX = (canvas.width - newWidth) / 2;
    var offsetY = (canvas.height - newHeight) / 2;
    context.drawImage(image, offsetX, offsetY, newWidth, newHeight);
    //context.drawImage(image, 0,0);

    //translate the subsequent stuff to appear as if scrolling through carnival
    var Tscroll_to_canvas = mat3.create();
    mat3.fromTranslation(Tscroll_to_canvas, [-10*slider1.value, 0]);
    mat3.multiply(stack[0], stack[0], Tscroll_to_canvas);

    //ferris wheel
    stack.unshift(mat3.clone(stack[0])); // "save" 
    var Tferrisbase_to_scroll = mat3.create();
    mat3.fromTranslation(Tferrisbase_to_scroll, [200,300]);
    mat3.multiply(stack[0],stack[0],Tferrisbase_to_scroll);    
    drawFerrisBase();
    
    const time = new Date();
    var rotation_angle =  ((2 * Math.PI) / 60) * time.getSeconds() + ((2 * Math.PI) / 60000) * time.getMilliseconds();
    var Twheel_to_base = mat3.create();
    mat3.rotate(Twheel_to_base,Twheel_to_base,rotation_angle);
    mat3.multiply(stack[0],stack[0],Twheel_to_base);  
    drawFerrisWheel(rotation_angle, 5, "#001eff", "red", "gold");
    stack.shift();          // "restore"    

    
    stack.unshift(mat3.clone(stack[0])); // "save"

    //tent from 500 to 1000
    var Ttent1_to_canvas = mat3.create();
    mat3.fromTranslation(Ttent1_to_canvas, [750,560]);
    mat3.multiply(stack[0],stack[0],Ttent1_to_canvas);
    drawTent("#4285f4","#ffc041");
    stack.shift();          // "restore"    
  

    stack.unshift(mat3.clone(stack[0])); // "save"
    var Ttent2_to_canvas = mat3.create();
    mat3.fromTranslation(Ttent2_to_canvas, [1500,560]);   
    mat3.scale(Ttent2_to_canvas,Ttent2_to_canvas,[0.75,0.75]);
    mat3.multiply(stack[0],stack[0],Ttent2_to_canvas);
    drawTent("#a048f0","#ffffff");
    stack.shift();          // "restore"      

    //ferris wheel
    stack.unshift(mat3.clone(stack[0])); // "save" 
    var Tnewferris = mat3.create();
    mat3.fromTranslation(Tnewferris, [1750,300]);
    mat3.multiply(stack[0],stack[0],Tnewferris);    
    drawFerrisBase();
    
    const time_2 = new Date();
    var rotation_angle_2 = ((4 * Math.PI) / 60) * time.getSeconds() + ((4 * Math.PI) / 60000) * time.getMilliseconds();
    var Twheelnew = mat3.create();
    mat3.rotate(Twheelnew,Twheelnew,rotation_angle_2);
    mat3.multiply(stack[0],stack[0],Twheelnew);  
    drawFerrisWheel(rotation_angle_2, 5,"Chocolate", "SlateBlue", "GreenYellow");
    stack.shift();          // "restore"  


    // // foreground
    context.fillStyle = "#0c892e";
    context.beginPath();
    moveToTx(0,560);
    lineToTx(2000,560);
    lineToTx(2000,600);
    lineToTx(0,600);
    context.fill();
    context.closePath();

    stack.unshift(mat3.clone(stack[0])); // "save"
    //Roller coaster 
    drawTrajectory(0.0,1.0,100,C0,Tscroll_to_canvas,"#fdffc8");
    drawTrajectory(0.0,1.0,100,C1,Tscroll_to_canvas,"#fdffc8");
    drawTrajectory(0.0,1.0,100,C2,Tscroll_to_canvas,"#fdffc8");
    drawTrajectory(0.0,1.0,100,C3,Tscroll_to_canvas,"#fdffc8");

    var Tcoaster_to_track = mat3.create();
    mat3.fromTranslation(Tcoaster_to_track,Ccomp(tParam));
    mat3.multiply(stack[0],stack[0],Tcoaster_to_track);
    var Tcoaster_to_canvas = mat3.create();
    var tangent = Ccomp_tangent(tParam);
    var angle = Math.atan2(tangent[1],tangent[0]);
    mat3.rotate(Tcoaster_to_canvas,Tcoaster_to_canvas,angle);
    mat3.multiply(stack[0],stack[0],Tcoaster_to_canvas);
    drawTrainbox("red");

    stack.shift();          // "restore" 

    window.requestAnimationFrame(draw);

  }


  draw();


}
window.onload = setup;



