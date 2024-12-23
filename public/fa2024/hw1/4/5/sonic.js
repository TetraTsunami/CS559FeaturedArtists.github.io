function setup() { "use strict";
    var canvas = document.getElementById('myCanvas');
    var slider1 = document.getElementById('slider1');
    slider1.value = 0;
    var slider2 = document.getElementById('slider2');
    slider2.value = -58;
    function draw() {
      var context = canvas.getContext('2d');
      canvas.width = canvas.width;
      // use the sliders to get various parameters
      var dx = slider1.value;
      var dy = slider2.value;
      var theta1 = slider1.value*0.005*Math.PI;
      
      function DrawSonic(color) {
        context.beginPath(); //feet
        context.fillStyle = "red";
        context.moveTo(-36,50);
        context.lineTo(-39,63);
        context.lineTo(-27,65);
        context.lineTo(-18,57);
        context.moveTo(36,50);
        context.lineTo(39,63);
        context.lineTo(27,65);
        context.lineTo(18,57);
        context.fill();
        context.stroke();
        
        context.beginPath(); //body
        context.fillStyle = color;
        context.arc(0, 0, 60, 0, 2 * Math.PI);
        context.fill();      
        context.stroke();
        
        context.beginPath(); //ears
        context.moveTo(-50,-30);
        context.lineTo(-50,-65);
        context.lineTo(-25,-55);
        context.moveTo(50,-30);
        context.lineTo(50,-65);
        context.lineTo(25,-55);
        context.fill();
        context.stroke();
        
        context.beginPath(); //belly
        context.fillStyle = "beige";
        context.ellipse(0, 40, 30, 20, 0, 0, 2 * Math.PI);
        context.fill();
        
        context.beginPath(); //mouth
        context.fillStyle = "beige";
        context.ellipse(0, 0, 35, 12, 0, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
        
        context.beginPath(); //lips
        context.moveTo(10,4);
        context.lineTo(20,2);
        context.lineTo(24,-2)
        context.stroke();
        
        context.beginPath(); //arms
        context.fillStyle = "beige";
        context.moveTo(-50,10);
        context.lineTo(-40,25);
        context.lineTo(-35,20);
        context.lineTo(-45,5);
        context.lineTo(-49,5);
        context.closePath();
        context.moveTo(50,10);
        context.lineTo(40,25);
        context.lineTo(35,20);
        context.lineTo(45,5);
        context.lineTo(49,5);
        context.closePath();
        context.stroke();
        context.fill();
        
        context.beginPath(); //hands
        context.fillStyle = "white";
        context.moveTo(-40,25);
        context.lineTo(-27,40);
        context.lineTo(-27,30);
        context.lineTo(-22,25);
        context.lineTo(-30,25);
        context.lineTo(-35,20);
        context.closePath();
        context.moveTo(40,25);
        context.lineTo(27,40);
        context.lineTo(27,30);
        context.lineTo(22,25);
        context.lineTo(30,25);
        context.lineTo(35,20);
        context.closePath();
        context.fill();
        context.stroke();
        
        context.beginPath(); // ear inners
        context.fillStyle = "beige";
        context.moveTo(-45,-35);
        context.lineTo(-45,-55);
        context.lineTo(-30,-50);
        context.moveTo(45,-35);
        context.lineTo(45,-55);
        context.lineTo(30,-50);
        context.stroke();
        context.fill();
        
        context.beginPath(); //eyes
        context.fillStyle = "white";
        context.moveTo(0,-12);
        context.lineTo(-18,-6);
        context.lineTo(-29,-8);
        context.lineTo(-35,-25);
        context.lineTo(-25,-42);
        context.lineTo(-15,-40);
        context.lineTo(-7,-22);
        context.lineTo(0,-20);
        context.lineTo(7,-22);
        context.lineTo(15,-40);
        context.lineTo(25,-42);
        context.lineTo(35,-25);
        context.lineTo(29,-8);
        context.lineTo(18,-6);
        context.closePath();
        context.stroke();
        context.fill();
        
        context.beginPath(); //nose
        context.fillStyle = "black";
        context.ellipse(0, -13, 3, 8, 0, 0, 2 * Math.PI);
        context.fill();
        
        context.beginPath(); //iris
        context.fillStyle = "green";
        context.ellipse(-14, -22, 5, 12, 0, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.ellipse(14, -22, 5, 12, 0, 0, 2 * Math.PI);
        context.fill();
        
        context.beginPath(); //pupils
        context.fillStyle = "black";
        context.ellipse(-14, -22, 3, 9, 0, 0, 2 * Math.PI);
        context.ellipse(14, -22, 3, 9, 0, 0, 2 * Math.PI);
        context.fill();
        
        context.beginPath(); //sparkles
        context.fillStyle = "white";
        context.ellipse(-14, -18, 1.5, 3, 0, 0, 2 * Math.PI);
        context.ellipse(14, -18, 1.5, 3, 0, 0, 2 * Math.PI);
        context.fill();
        
        context.beginPath(); //eyebrows
        context.moveTo(-29,-8);
        context.lineTo(-35,-25);
        context.lineTo(-25,-42);
        context.lineTo(-15,-40);
        context.lineTo(-7,-22);
        context.lineTo(0,-20);
        context.lineTo(7,-22);
        context.lineTo(15,-40);
        context.lineTo(25,-42);
        context.lineTo(35,-25);
        context.lineTo(29,-8);
        context.stroke();
      }      
      
      function DrawSpike1() {
        context.beginPath();
        context.fillStyle = "blue";
        context.moveTo(-60,-10);
        context.lineTo(-55,-50);
        context.lineTo(-35,-90);
        context.lineTo(-25,-50)
        context.fill();
        context.stroke();
      }
      
      function DrawSpike2() {
        context.beginPath();
        context.fillStyle = "blue";
        context.moveTo(-30,-50);
        context.lineTo(-20,-80);
        context.lineTo(5,-110);
        context.lineTo(5,-90);
        context.lineTo(25,-50);
        context.fill();
        context.stroke();
      }
      
      function DrawSpike3() {
        context.beginPath();
        context.fillStyle = "blue";
        context.moveTo(20,-50);
        context.lineTo(30,-70);
        context.lineTo(45,-85);
        context.lineTo(45,-65);
        context.lineTo(55,-20);
        context.fill();
        context.stroke();
      }
      
      function DrawBG() {
        context.beginPath();
        context.fillStyle = "cornflowerblue";
        context.rect(0,0,400,400)
        context.fill();
        
        context.beginPath();
        context.fillStyle = "sienna";
        context.rect(0,300,400,100)
        context.fill();
        context.stroke();
        
        context.beginPath();
        context.fillStyle = "green";
        context.rect(0,250,400,50)
        context.fill();
        context.stroke();
        
        context.beginPath();
        context.fillStyle = "limegreen";
        context.translate(-4,0);
        for (let i = 0; i < 30; i++) {
          context.rect(16*i, 250, 8, 50)
        }
        context.fill();
        context.stroke();
        
        context.beginPath();
        context.fillStyle = "sandybrown";
        context.translate(-6,0);
        var count = 20;
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 11; j++) {
            if (i%2 == 0) {
              count = 0;
            }
            context.rect(count+40*j,300+20*i,20,20)
            count = 20;
          }
        }
        context.fill();
        context.stroke();
      }
      DrawBG();
      
      context.save();
      context.translate(200,200)
      context.translate(dx,0);
      context.rotate(theta1);
      context.translate(-0.20*dy,-0.8*dy);
      DrawSpike1();
      context.restore();
      
      context.save();
      context.translate(200,200)
      context.translate(dx, 0);
      context.rotate(theta1);
      context.translate(0,-dy);
      DrawSpike2();
      context.restore();
      
      context.save();
      context.translate(200,200)
      context.translate(dx,0);
      context.rotate(theta1);
      context.translate(0.20*dy,-0.8*dy);
      DrawSpike3();
      context.restore();
      
      context.save();
      context.translate(200,200)
      context.translate(dx,0);
      context.rotate(theta1);
      
      DrawSonic("blue");
      context.restore();
    }               
    slider1.addEventListener("input",draw);
    slider2.addEventListener("input",draw);
    draw();
  }
  window.onload = setup;