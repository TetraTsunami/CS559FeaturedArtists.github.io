function setup() { "use strict";
  //some named colors
  const brick = "#FF8B63";
  const grass = "#c9ff7c";
  const shadow = "#DD8B64";
  const steel = "#6495ED";
  const golden = "#FFD700";
  const purple = "rgba(128, 0, 128, 0.5)"; // Purple with 50% opacity

  var canvas = document.getElementById('myCanvas');
  var slider1 = document.getElementById('slider1');
  slider1.value = 0;
  var slider2 = document.getElementById('slider2');
  slider2.value = 34;
  function draw() {
    var context = canvas.getContext('2d');
    canvas.width = canvas.width;

    // use the sliders to get angle of rotation
    var theta1 = slider1.value*0.02*Math.PI;
    var theta2 = slider2.value*0.02*Math.PI;

    function lateralFace(x,y,down1,down2,right) {
      context.moveTo(x,y);
      context.lineTo(x,y+(down1*30));
      context.lineTo(x+(right*30),y+(down1*30)+(down2*30));
      context.lineTo(x+(right*30),y+(down2*30));
      context.closePath();
      context.fill();
    }

    function topFace(x,y,down1,down2,right1,right2) {
      context.moveTo(x,y);
      context.lineTo(x+(right1*30),y+(down1*30));
      context.lineTo(x+(right1*30)+(right2*30),y+(down1*30)+(down2*30));
      context.lineTo(x+(right2*30),y+(down2*30));
      context.closePath();
      context.fill();
    }

    function movingPart(color) {     
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = 5; 
      context.moveTo(0,0);
      context.lineTo(0,105);
      context.stroke();
    }

    function movingPart2(color) {     
      context.beginPath();
      context.fillStyle = color;
      context.lineWidth = 5; 
      context.moveTo(0,0);
      context.lineTo(-90,-52.5);
      context.stroke();
    }

    function backgroundSquares() {
      // Draw the squares  
      context.beginPath();
      context.fillStyle = golden;
      context.strokeStyle = golden; 
      lateralFace(195,180,1,-0.5,1)
      topFace(270,345,0.5,-0.5,1,1)    
   
    }

    function drawGreenTick() {
      context.beginPath();
      context.strokeStyle = "green";
      context.moveTo(0,0);
      context.lineTo(30,0);
      context.lineTo(135,-30);
      context.lineTo(45,60);
      context.closePath();
      context.stroke();
      context.closePath();

    }




    function setupBaseStructure() {

      //bunch of filled and unfilled polygons to make the base structure
      context.beginPath();  
      context.fillStyle = grass;
      context.strokeStyle = grass; 
      //top grass
      topFace(90,120,2,-0.5,3.5,1)
      //bottom grass
      topFace(90,330,0.5,-2,1,3.5)

      context.beginPath();
      context.fillStyle = shadow;
      context.strokeStyle = shadow;
      // bottom shadow
      lateralFace(120,345,1,-2,3.5)

      //bottom grass
      context.beginPath();  
      context.fillStyle = grass;
      context.strokeStyle = grass; 
      topFace(90,330,4,-0.5,7,1)

      //arch 
      context.beginPath();
      context.fillStyle = purple;
      context.strokeStyle = purple;
      const ydisp = 0.15
      const xdisp = 0.25
      lateralFace(90,150,6,ydisp,xdisp); 
      lateralFace(120,140,6,ydisp,xdisp);
      lateralFace(120,165,6,ydisp,xdisp); 
      lateralFace(145,155,5.85,ydisp,xdisp);

      // Top front surface
      context.beginPath();
      context.fillStyle = brick;
      context.strokeStyle = brick; 
      lateralFace(90,120,1,2,3.5)
      //Bottom front surface
      lateralFace(90,330,1,4,7)
      lateralFace(270,345,3,0.5,1)

      //stairs - lateral surfaces
      const stair_width = 0.25 //*30px
      lateralFace(120,105,-stair_width,2*stair_width,1)
      lateralFace(120+30*stair_width,105-30*stair_width,-stair_width,2*stair_width,1)
      lateralFace(120+60*stair_width,105-60*stair_width,-stair_width,2*stair_width,1)
      lateralFace(120+90*stair_width,105-90*stair_width,-stair_width,2*stair_width,1)

      //stairs - top faces
      context.beginPath();
      context.fillStyle = golden;
      context.strokeStyle = golden; 
      topFace(120,105-30*stair_width,2*stair_width,0,1,stair_width) 
      topFace(120+30*stair_width,105-60*stair_width,2*stair_width,0,1,stair_width) 
      topFace(120+60*stair_width,105-90*stair_width,2*stair_width,0,1,stair_width) 
      topFace(120+90*stair_width,105-120*stair_width,2*stair_width,-0.75,1,8*stair_width)

      // Draw a flag - end point
      context.beginPath();
      context.strokeStyle = "black";
      context.moveTo(150+90*stair_width,105-120*stair_width);
      context.lineTo(150+90*stair_width,75-120*stair_width);
      context.stroke()
      context.fillStyle = "red"
      context.moveTo(150+90*stair_width,75-120*stair_width);
      context.lineTo(150+90*stair_width,60-120*stair_width)
      context.lineTo(150+90*stair_width+15,45-120*stair_width+15)
      context.fill();
      context.closePath();

      // Draw a golf ball - start point
      context.beginPath();
      context.fillStyle = "#fbfbed";
      context.arc(240, 390, 15, 0, 2 * Math.PI);
      context.fill();
      context.strokeStyle = "#c1c1b7";
      context.arc(240, 390, 15, 0, 2 * Math.PI);
      context.stroke();

      // bottom right - side surface
      context.beginPath();
      context.fillStyle = shadow;
      context.strokeStyle = shadow; 
      lateralFace(300,360,4,-0.5,1)
      

    }

    backgroundSquares();
    context.save();
    context.translate(300,240);
    context.rotate(theta1);
    movingPart(steel);
    context.restore();
    context.save();
    context.translate(300,240);   
    context.rotate(theta2);
    movingPart(steel);
    context.restore();
    context.translate(0,0);
    context.save();
    setupBaseStructure();
    context.restore();
    //movingPart2(steel);
    //context.rotate(theta1);
    //context.save();
    //context.restore();
    
  }
  slider1.addEventListener("input",draw);
  slider2.addEventListener("input",draw);

  draw();
}
window.onload = setup;


