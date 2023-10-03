/*
* CS 559 - Assignment 1 - Ben Gustafson
* Draws a mountain landscape with a slider that makes the sun rise and set
*/

function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');
  var slider = document.getElementById('slider');
  slider.value = 0;
  function draw() {

    var context = canvas.getContext('2d');
    canvas.width = canvas.width;

    // sliderVal ranges from 0.0 to 1.0
    var sliderVal = slider.value/100;

    /*
    * function DrawHills 
    *   draws a mountain shaped polygon 
    *   jagged line on top made using 3 sine functions
    *   extends down to the bottom of the canvas
    * y : y value to start the drawing at
    * r1, r2, r3 : random offset values
    */
    function DrawHills (y, color, r1, r2, r3){
      context.beginPath();
        context.fillStyle = color;
        for (let i = 0; i <= 400; i++){
            context.lineTo(i, y + Math.sin(i/20+r1)*40 
                                + Math.sin(i/5 + r2)*10 
                                + Math.sin(i + r3)*2);
        }
        context.lineTo(400, 400);
        context.lineTo(0,400);
        context.closePath();
        context.fill();   
    }

    // Draws a circle at given center, with given radius
    function DrawSun (radius, centerX, centerY, color){
        var numPoints = 100;  
        context.beginPath();
        context.fillStyle = color;
        for (let i = 1; i < numPoints; i++){
            context.lineTo(Math.cos(2.0*Math.PI*i/numPoints)*radius+centerX, 
                           Math.sin(2*Math.PI*i/numPoints)*radius+centerY)
        }
        context.closePath();
        context.fill();   
    }

    // Draws the background the given color 
    function DrawBackground (color){
      context.beginPath();
      context.fillStyle = color;
      context.moveTo(0,0);
      context.lineTo(400,0);
      context.lineTo(400,400);
      context.lineTo(0,400);
      context.closePath();
      context.fill();   
    }
    
    // Tie the color r,g,b to the slider
    // The color ranges from dark blue (0,0,50) 
    // to light yellow (255,200,150) and back to blue
    var r = Math.sin(sliderVal*3.14)*255;
    var g = Math.sin(sliderVal*3.14)*200;
    var b = Math.sin(sliderVal*3.14)*100 + 50;

    DrawBackground(`rgb(${r},${g},${b})`);
    DrawSun(20,
      Math.cos((sliderVal*3.14-.5)*1.5)*-180+200,
      Math.sin((sliderVal*3.14-.5)*1.5)*-200+220,
      "white");
    
    // Make the mountains get progressively darker by the value d
    var d = 30;
    // Make them slightly more orange than the sky
    r += 40;
    g += 20;
    DrawHills(200, `rgb(${r-d},${g-d},${b-d})`,       4.38,1.95,0.61);
    DrawHills(220, `rgb(${r-d*2},${g-d*2},${b-d*2})`, 2.35,2.41,0.75);
    DrawHills(240, `rgb(${r-d*3},${g-d*3},${b-d*3})`, 0.16,4.10,0.41);
    DrawHills(260, `rgb(${r-d*4},${g-d*4},${b-d*4})`, 1.22,1.15,2.56);
    
  }
  slider.addEventListener("input",draw);
  draw();
}
window.onload = setup;

