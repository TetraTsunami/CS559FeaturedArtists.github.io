//global named colors
const ocean_light   = "#86d6d4";
const ocean_bubble  = "#c3eaea";
const ocean_dark    = "#4daea5";
const sand_light    = "#f5e4a5";
const sand_mid      = "#e7c988";
const sand_dark     = "#d8b575";


function setup() { "use strict";

  function moveToTx(loc,Tx)
  {var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.moveTo(res[0],res[1]);}

  function lineToTx(loc,Tx)
  {var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.lineTo(res[0],res[1]);}

  function translatedArc(x,y, radius, start_angle, end_angle, counterclockwise, Tx) {
    var res=vec2.create(); vec2.transformMat3(res, [x,y], Tx); 
    context.arc(res[0],res[1], radius, start_angle, end_angle, counterclockwise);
  }

  class LeaderBoid {
    constructor(canvas, context) {
      this.position = vec2.fromValues(0,0);
      this.orientation = vec2.fromValues(1,0); 
    }
  
    render(context, Tx) {

      //draw at new position
      //fins
      context.fillStyle = "#ff6623"; 
      moveToTx([0,-10 ], Tx);
      lineToTx([-6,-12], Tx);
      lineToTx([-4,-3], Tx);
      lineToTx([0,-10 ], Tx);
      context.fill();

      moveToTx([0,10 ], Tx);
      lineToTx([-6,12], Tx);
      lineToTx([-4,3], Tx);
      lineToTx([0,10 ], Tx);
      context.closePath();
      context.fill();

      //body
      context.fillStyle = "#d94d1d";
      context.beginPath();
      translatedArc(0, 0,10, 0, 2*Math.PI, Boolean.False,Tx);
      context.fill();
      context.closePath();
  
      //tail
      context.fillStyle = "#ff6623"; 
      context.beginPath();
      moveToTx([-10,0 ],Tx);
      lineToTx([-16,-6],Tx);
      lineToTx([-16,6 ],Tx);
      context.closePath();
      context.fill();
  
      //update this new origin and direction for other boids to see
      vec2.transformMat3(this.position, [0,0], Tx);
      vec2.transformMat3(this.orientation, [1,0], Tx);
    }
  
  }

  class Boid {
    constructor(canvas, context) {
  
      this.position = vec2.fromValues(Math.random()*(canvas.width), Math.random()*(canvas.height));
      this.velocity = vec2.create();
      vec2.random(this.velocity);
      vec2.scale(this.velocity, this.velocity,Math.random() * (1.5 - 0.5) + 0.5);
      this.acceleration = vec2.create();
      this.maxSpeed = 1;
      this.maxForce = 0.1*this.maxSpeed;
    }
  
    edges(canvas) {
      if(this.position[0] < 0) {
        this.position[0] = canvas.width;
      } else if (this.position[0] > canvas.width) {
        this.position[0] = 0;
      }
      if(this.position[1] < 0) {
        this.position[1] = canvas.height;
      } else if (this.position[1] > canvas.height) {
        this.position[1] = 0;
      }
    }
    
    align(leader) {
      var perceptionR = 50;
      let alignmentforce = vec2.create();
      let total = 0;

      vec2.add(alignmentforce, alignmentforce, leader.orientation);
      //get diff of direction not magnitude
      vec2.normalize(alignmentforce,alignmentforce);
      var normvelocity = vec2.create();
      vec2.normalize(normvelocity, this.velocity); 
      vec2.subtract(alignmentforce,alignmentforce,normvelocity);
      //normalize to get direction
      vec2.normalize(alignmentforce,alignmentforce); 
      //limit the alignment force to maxforce value
      vec2.scale(alignmentforce,alignmentforce,this.maxForce);
      
      return alignmentforce;
    }
  
    cohesion(leader) {
      var perceptionR = 100;
      let cohesionforce = vec2.create();
      vec2.add(cohesionforce,cohesionforce, leader.position);

      vec2.subtract(cohesionforce,cohesionforce,this.position);
      //vec2.subtract(cohesionforce,cohesionforce,this.velocity);
      vec2.normalize(cohesionforce,cohesionforce); 
      //limit the alignment force to maxforce value
      vec2.scale(cohesionforce,cohesionforce,this.maxForce);
      
      return cohesionforce;  
    }
  
    separation(boids) {
      var perceptionR = 1000;
      let separationforce = vec2.create();
      let total = 0;
      for (let neighbor of boids) {
        //glMatrix fucntion that returns distance betwen vectors
        let d = vec2.distance(neighbor.position, this.position);
        if (neighbor != this && d < perceptionR) {
          let diff = vec2.create();
          //direction is opposite to the difference in position of tme and my neighbor
          vec2.subtract(diff, this.position, neighbor.position);
          // magnitude of the force is inversely proportional to distance
          // closer the boid, the stronger I want to separate from it => higher the separation vector magnitude
          vec2.normalize(diff,diff);
          if(d > 0) {
            vec2.scale(diff,diff, (1/d));
          } else {
            vec2.scale(diff,diff,this.maxForce);
          }
          
          //scale by direction of neighbors not magnitude
          vec2.add(separationforce,separationforce, diff);
          total++;
        }
      }
      if(total > 0) {
        vec2.scale(separationforce, separationforce, (1/total));
        //normalize to get direction
        //vec2.subtract(separationforce,separationforce,this.velocity);
        vec2.normalize(separationforce,separationforce); 
        //limit the separation force to maxforce value
        vec2.scale(separationforce,separationforce,this.maxForce);
      }
      return separationforce;  
    }
  
    finalflock(boids, leader) {
      var alignment = this.align(leader);
      var cohesion = this.cohesion(leader);
      let separation = this.separation(boids);
      //alignment force = unit mass * acceleration 
      //scale to slider values to control amts of cohesion, alignment and separation
      vec2.scale(alignment, alignment, slider2.value);
      vec2.scale(cohesion, cohesion, slider3.value);
      vec2.scale(separation, separation, slider4.value);
      this.acceleration = vec2.create();
      vec2.add(this.acceleration,this.acceleration, separation);
      vec2.add(this.acceleration,this.acceleration, cohesion);
      vec2.add(this.acceleration,this.acceleration, alignment);
    }
  
    update() {
      vec2.scale(this.acceleration, this.acceleration, 1/10); //inertia 
      vec2.add(this.velocity, this.velocity, this.acceleration);
      if(vec2.length(this.velocity) > this.maxSpeed) {
        vec2.normalize(this.velocity, this.velocity);
        vec2.scale(this.velocity, this.velocity, this.maxSpeed);
      }
      vec2.add(this.position, this.position, this.velocity);
      //vec2.normalize(this.velocity, this.velocity);
      //vec2.scale(this.velocity, this.velocity, this.maxSpeed);
    }
  
    render(context,angle) {
  
        //draw at this.position
        var Txtemp = mat3.create();
        mat3.fromTranslation(Txtemp, this.position);
        var zerodeg = vec2.fromValues(1,0);
        var Txboid = mat3.create();
        var normvelocity = vec2.create();
        vec2.normalize(normvelocity, this.velocity);
        //var angle = Math.acos(normvelocity[0],1);
        var angle = Math.atan2(normvelocity[1], normvelocity[0])
        mat3.rotate(Txboid,Txtemp,angle);
  
        //fins
        context.fillStyle = "#ff6623"; 
        moveToTx([0,-10 ], Txboid);
        lineToTx([-6,-12], Txboid);
        lineToTx([-4,-3], Txboid);
        lineToTx([0,-10 ], Txboid);
        context.fill();
  
        moveToTx([0,10 ], Txboid);
        lineToTx([-6,12], Txboid);
        lineToTx([-4,3], Txboid);
        lineToTx([0,10 ], Txboid);
        context.closePath();
        context.fill();
  
        //body
        context.fillStyle = "gold";
        context.beginPath();
        translatedArc(0, 0,10, 0, 2*Math.PI, Boolean.False,Txboid);
        context.fill();
        context.closePath();
    
        //tail
        context.fillStyle = "#ff6623"; 
        context.beginPath();
        moveToTx([-10,0 ],Txboid);
        lineToTx([-16,-6],Txboid);
        lineToTx([-16,6 ],Txboid);
        context.closePath();
        context.fill();
  
    }
  
  }

  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');
  var slider2 = document.getElementById('slider2');
  slider2.value = 1;
  var slider3 = document.getElementById('slider3');
  slider3.value = 1;
  var slider4 = document.getElementById('slider4');
  slider4.value = 1;
  const image = document.getElementById('source');
  var trajectoriesShown = false;
  var button = document.getElementById('mybutton');
  button.addEventListener('click', toggleTrajectories);
  function toggleTrajectories() {
    trajectoriesShown = !trajectoriesShown; // Toggle the flag
  }

  const flock = [];
  //constants
  const mindim = 5;

  //leader boid
  var leaderboid = new LeaderBoid(canvas,context);

  for( let i = 0; i < 50; i++) {
    flock.push(new Boid(canvas,context));
  }

  function draw() {

    canvas.width = canvas.width;

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

    var p0=[500,300];
    var d0=[200,0];
    var p1=[750,500];
    var d1=[300,100];
    var p2=[900,300];
    var d2=[0,-300];
    var p3=[500,50];
    var d3=[-300,0];
    var p4=[50,50];
    var d4=[-200,200];
    var p5=[150,400];
    var d5=[200,0];  

    var P0 = [p0,d0,p1,d1]; // First two points and tangents
    var P1 = [p1,d1,p2,d2]; // Second two points and tangents
    var P2 = [p2,d2,p3,d3];
    var P3 = [p3,d3,p4,d4]; 
    var P4 = [p4,d4,p5,d5]; 
    var P5 = [p5,d5,p0,d0];

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

    var Ccomp = function(t) {
      //console.log(t)
      if (t<1){
        var u = t;
        return C0(u);
      } else if (t < 2) {
        var u = (t-1.0);
        return C1(u);
      } else if (t < 3) {
        var u = (t-2.0);
        return C2(u);       
      } else if (t < 4) {
        var u = (t-3.0);
        return C3(u);       
      } else if (t < 5) {
        var u = (t-4.0);
        return C4(u);       
      } else {
        var u = (t-5.0);
        return C5(u);   
      }
    }

    var Ccomp_tangent = function(t) {
      //console.log(t)
      if (t<1){
        var u = t;
        return C0prime(u);
      } else if (t < 2) {
        var u = (t-1.0);
        return C1prime(u);
      } else if (t < 3) {
        var u = (t-2.0);
        return C2prime(u);       
      } else if (t < 4) {
        var u = (t-3.0);
        return C3prime(u);       
      } else if (t < 5) {
        var u = (t-4.0);
        return C4prime(u);       
      } else {
        var u = (t-5.0);
        return C5prime(u);   
      }
    }


    function drawTrajectory(t_begin,t_end,intervals,C,Tx,color) {
	    context.strokeStyle=color;
      context.lineWidth=3;
	    context.beginPath();
      moveToTx(C(t_begin),Tx);
        for(var i=1;i<=intervals;i++){
            var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
            lineToTx(C(t),Tx);
        }
        context.stroke();
        context.closePath();
	  }

    function axes(color,Tx) {
	    context.strokeStyle=color;
	    context.beginPath();
	    // Axes
	    moveToTx(120,0,Tx);lineToTx(0,0,Tx);lineToTx(0,120,Tx);
	    // Arrowheads
	    moveToTx(110,5,Tx);lineToTx(120,0,Tx);lineToTx(110,-5,Tx);
	    moveToTx(5,110,Tx);lineToTx(0,120,Tx);lineToTx(-5,110,Tx);
	    // X-label
	    moveToTx(130,-5,Tx);lineToTx(140,5,Tx);
	    moveToTx(130,5,Tx);lineToTx(140,-5,Tx);
	    // Y-label
	    moveToTx(-5,130,Tx);lineToTx(0,135,Tx);lineToTx(5,130,Tx);
	    moveToTx(0,135,Tx);lineToTx(0,142,Tx);
	    context.stroke();
	  } 

    context.fillStyle = ocean_light;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate the scale factors to fit within the canvas
    // var scaleX = canvas.width*2 / image.width;
    // var scaleY = canvas.height / image.height;
    // var scale = Math.min(scaleX, scaleY);

    // // Calculate the new dimensions
    // var newWidth = image.width * scale;
    // var newHeight = image.height * scale;

    // // Draw the scaled image on the canvas
    // context.drawImage(image, 0, 0, newWidth, newHeight);

    // // Optionally, you can position the image in the center of the canvas:
    // var offsetX = (canvas.width - newWidth);
    // var offsetY = (canvas.height - newHeight);
    // context.drawImage(image, offsetX, offsetY, newWidth, newHeight);



    const time = new Date();
    //var tParam = (slider1.value)*6/100
    var tParam = (((time.getSeconds() + (time.getMilliseconds()/1000))) % 30 )/5;

    var Tbase = mat3.create();
    if (trajectoriesShown) {
      drawTrajectory(0.0, 1.0, 100, C0, Tbase, "#01ffff");
      drawTrajectory(0.0, 1.0, 100, C1, Tbase, "#01ffff");
      drawTrajectory(0.0, 1.0, 100, C2, Tbase, "#01ffff");
      drawTrajectory(0.0, 1.0, 100, C3, Tbase, "#01ffff");
      drawTrajectory(0.0, 1.0, 100, C4, Tbase, "#01ffff");
      drawTrajectory(0.0, 1.0, 100, C5, Tbase, "#01ffff");
    }

    var Tleaderboid = mat3.create();
    mat3.fromTranslation(Tleaderboid,Ccomp(tParam));
    mat3.multiply(Tleaderboid,Tleaderboid,Tbase);
    var Torientation = mat3.create();
    var tangent = Ccomp_tangent(tParam);
    var angle = Math.atan2(tangent[1],tangent[0]);
    mat3.rotate(Torientation,Torientation,angle);
    mat3.multiply(Torientation,Tleaderboid,Torientation);
    axes("red",Torientation);

    //draw leaderboid 
    axes("green",Tbase)
    // axes("red",Tleaderboid)
    leaderboid.render(context, Torientation);

    var flock_snapshot = flock;
    for(let boid of flock) {
      if(boid.isleader == Boolean.False) {
        boid.edges(canvas);
        boid.finalflock(flock_snapshot, leaderboid);
        boid.update();
        boid.render(context,angle);
      }
    }
  
    

    window.requestAnimationFrame(draw);

  }


  draw();


}
window.onload = setup;



