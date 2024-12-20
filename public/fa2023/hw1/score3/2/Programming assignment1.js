function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');
  var slider1 = document.getElementById('slider1');
  slider1.value = 0;
  var slider2 = document.getElementById('slider2');
  slider2.value = 0;
  function draw() {
    var context = canvas.getContext('2d');
    canvas.width = canvas.width;
    // use the sliders to get various parameters
    var dx = slider1.value;
    var dy = slider2.value;
    
    function DrawBirdHead(color) {
      //head
      context.beginPath();
      context.fillStyle = color;
      context.arc(150, 150, 30 , 0, 2 * Math.PI, false);
      context.fill();  
      
    }
    function DrawBirdBody(color){
      context.fillStyle = color;
      context.moveTo(135,160);
      context.lineTo(135,210);
      context.lineTo(50,210);
      context.lineTo(50,160);
      context.closePath();
      context.fill(); 
      context.beginPath();
      context.lineWidth = 3;
      //left leg
      context.moveTo(80,210);
      context.lineTo(80,230);
      context.moveTo(80,220);
      context.lineTo(70,225);
      context.moveTo(80,220);
      context.lineTo(90,225);

      //right leg
      context.moveTo(105,210);
      context.lineTo(105,230);
      context.moveTo(105,220);
      context.lineTo(95,225);
      context.moveTo(105,220);
      context.lineTo(115,225);
      context.stroke();
    }
    function DrawBirdDetails(color) {
      context.fillStyle = color;
      //eyes
      context.beginPath();
      context.arc(160, 140, 5 , 0, 2 * Math.PI, false);
      context.fill(); 
      
      //beak
      context.fillStyle = "#964B00";
      context.beginPath();
      context.moveTo(179,160);
      context.lineTo(189,150);
      context.lineTo(179,140);
      context.closePath();
      
      context.fill(); 
    }
    
    function DrawBirdWing(color){
      context.fillStyle = color;
      context.moveTo(105,180);
      context.lineTo(80,150);
      context.lineTo(75,160);
      context.lineTo(60,152);
      context.lineTo(65,162);
      context.lineTo(50,158);
      context.lineTo(63,165);
      context.lineTo(48,170);
      context.closePath();
      context.fill(); 
      
    }
    function DrawTrees(color1,color2) {
      context.fillStyle=color1;
      context.beginPath();
      context.rect(300,500,30,100);
      context.fill();

      context.beginPath();
      context.rect(600,500,30,100);
      context.fill();

      context.beginPath();
      context.rect(900,500,30,100);
      context.fill();

      context.fillStyle=color2;

      context.beginPath();
      context.moveTo(300,500);
      context.lineTo(225,500);
      context.lineTo(315,400);
      context.lineTo(275,400);
      context.lineTo(315,350);
      context.lineTo(355,400);
      context.lineTo(315,400);
      context.lineTo(405,500);
      context.closePath();
      context.fill();


      context.beginPath();
      context.moveTo(600,500);
      context.lineTo(525,500);
      context.lineTo(615,400);

      context.lineTo(575,400);
      context.lineTo(615,350);
      context.lineTo(655,400);
      context.lineTo(615,400);
      context.lineTo(705,500);
      context.closePath();
      context.fill();

      context.beginPath();
      context.moveTo(900,500);
      context.lineTo(825,500);
      context.lineTo(915,400);
      context.lineTo(875,400);
      context.lineTo(915,350);
      context.lineTo(955,400);
      context.lineTo(915,400);
      context.lineTo(1005,500);
      context.closePath();
      context.fill();
      
     }
     function DrawSun(color) {
      
      context.fillStyle = color;
      context.beginPath();
      context.arc(1270, 0, 150 , 0, 2 * Math.PI, false);
      context.fill();  
      
      context.beginPath();
      context.arc(1090, 0, 10 , 0, 2 * Math.PI, false);
      context.fill(); 

      context.beginPath();
      context.arc(1105, 55, 10 , 0, 2 * Math.PI, false);
      context.fill(); 

      context.beginPath();
      context.arc(1150, 115, 10 , 0, 2 * Math.PI, false);
      context.fill(); 

      context.beginPath();
      context.arc(1215, 165, 10 , 0, 2 * Math.PI, false);
      context.fill(); 

      context.beginPath();
      context.arc(1270, 180, 10 , 0, 2 * Math.PI, false);
      context.fill();  
      
    }
    
    DrawTrees("#533C22","#8DA734");
    DrawSun("#EF8C55");
    context.save();
    context.translate(dx,dy);
    DrawBirdHead("#F3B647");
    DrawBirdBody("#F3B647");
    DrawBirdWing("#B18A73");
    DrawBirdDetails("black");
    
    context.restore();

    
  }
  slider1.addEventListener("input",draw);
  slider2.addEventListener("input",draw);
  draw();
}
window.onload = setup;


