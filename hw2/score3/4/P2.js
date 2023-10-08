
function setup() {
  var canvas = document.getElementById('myCanvas');

  function draw() {  
    var context = canvas.getContext('2d');
    canvas.width = canvas.width;

    hierarchialAnimation();

    var translateX = 0;
    var leavesIncrement = true;
    var runningTree = 0;
    var run = true;
    var translatePupils = 0;
    var movePupils = true;
    var translateEyesY = 0;
    var translateEyes = true;

    var shouldScale = true;
    var scaleFactor = 1.01;

    function hierarchialAnimation(){


      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "blue";
      context.fillRect(0, 0, canvas.width, canvas.height);


      context.save();
      drawGround();
      context.restore();

      context.save();
      context.translate(runningTree, 0);
      drawTree();

      // Save the state for the mouth translation
      context.save();
      context.translate(centerX, centerY);
      context.scale(scaleFactor, scaleFactor);
      context.translate(-centerX, -centerY);

      drawMouth();
      context.restore();  // Restore the state for the mouth translation

      context.save();
      context.translate(0, translateEyesY);
      drawEyes();
      context.translate(translatePupils, 0);
      drawPupils();
      context.restore();

      context.save();
      context.translate(translateX, 0);
      drawLeaves();
      context.restore();

      context.restore();


      // adjusting variables to alter the transforms/scale variables
      if(runningTree == -300){
        run = true;
      }
      if(runningTree == 300){
          run = false;
      }
      if(run){
        runningTree++;
      }
      else{
        runningTree--;
      }

      if(translateX == 0){
          leavesIncrement = true;
      }
      if(translateX == 10){
          leavesIncrement = false;
      }
      if(leavesIncrement){
          translateX++;
      }
      else{
          translateX--;
      }

      if(shouldScale){
        scaleFactor+=0.02;
      }
      else{
        scaleFactor-=0.02
      }
      if(scaleFactor >= 2){
        shouldScale = false;
      }
      if(scaleFactor <= 0.3){
        shouldScale = true;
      }

      if(translatePupils == -10){
        movePupils = true;
      }
      if(translatePupils == 10){
        movePupils = false;
      }
      if(movePupils){
        translatePupils += 0.25;
      }
      else{
        translatePupils -= 0.25;
      }

      if(translateEyesY == -5){
        translateEyes = true;
      }
      if(translateEyesY == 5){
        translateEyes = false;
      }
      if(translateEyes){
        translateEyesY += 0.5;
      }
      else{
        translateEyesY -= 0.5;
      }

      requestAnimationFrame(hierarchialAnimation);

    }

    drawGround();
    drawTree();
    drawLeaves();
      function drawGround(){
      context.beginPath();
      context.lineWidth="6";
      context.strokeStyle="green";
      context.fillStyle = "green";
      context.fillRect(0,370,600,30);
      context.stroke();
     }

     var centerX = 300;
     var centerY = 320;

     function drawMouth(){
        var circle = 2 * Math.PI;
        context.beginPath();
        context.lineWidth = "10";
        context.strokeStyle = "black";
        context.fillStyle = "white";
        context.arc(centerX, centerY, 20, 0, circle);
        context.closePath();
        context.fill();
        context.stroke();
     }

     function drawEyes(){
      context.beginPath();
      context.fillStyle = "rgb(254,254,254)";
      context.strokeStyle = "black";
      context.ellipse(350, 200, 40, 60, 0, 0, 2*Math.PI);
      context.fill();
      context.stroke();

      context.beginPath();
      context.fillStyle = "rgb(254,254,254)";
      context.strokeStyle = "black";
      context.ellipse(250, 200, 40, 60, 0, 0, 2*Math.PI);
      context.fill();
      context.stroke();
     }

     function drawPupils(){
      context.beginPath();
      context.fillStyle = "rgb(0,0,0)";
      context.strokeStyle = "black";
      context.ellipse(350, 200, 10, 10, 0, 0, 2*Math.PI);
      context.fill();
      context.stroke();

      context.beginPath();
      context.fillStyle = "rgb(0,0,0)";
      context.strokeStyle = "black";
      context.ellipse(250, 200, 10, 10, 0, 0, 2*Math.PI);
      context.fill();
      context.stroke();
     }

     function drawTree(){
      // draw left side bottom arc
          context.beginPath();
          context.lineWidth = "6";
          context.strokeStyle = "brown";
          context.fillStyle = "brown";
          context.moveTo(180, 400);
          var xStart = 210; // control curve
          var yStart = 390; // control curve
          var endX = 235; // end line
          var endY = 350; // end line
          context.quadraticCurveTo(xStart, yStart, endX, endY);

          context.lineTo(370, 350);          
          var xStart = 390; // control curve
          var yStart = 390; // control curve
          var endX = 420; // end line
          var endY = 400; // end line
          context.quadraticCurveTo(xStart, yStart, endX, endY);
          context.lineTo(420, 400);
          context.fill();
          context.stroke();
          context.closePath();

          // draw thick vertical left and right
          context.beginPath();
          context.lineWidth = "6";
          context.strokeStyle = "brown";
          context.fillStyle = "brown";
          context.fillRect(230, 240, 140, 400);
          context.stroke();
          context.closePath();

          // draw slightly thinning vertical left and right
          context.beginPath();
          context.lineWidth = "4";
          context.strokeStyle = "brown";
          context.fillStyle = "brown";
          context.moveTo(230, 240);
          context.lineTo(250, 120);
          context.lineTo(350, 120);
          context.lineTo(370, 240);
          context.lineTo(230,240);
          context.closePath();
          context.fill();

          // draw top out section
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "brown";
          context.fillStyle = "brown";
          context.moveTo(250, 120);
          context.lineTo(120, 80);
          context.lineTo(160,80);
          context.lineTo(290, 120);
          context.lineTo(250, 120);
          context.closePath();
          context.fill();
          context.stroke();

          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "brown";
          context.fillStyle = "brown";
          context.moveTo(350,120);
          context.lineTo(500, 80);
          context.lineTo(460, 80);
          context.lineTo(310, 120);
          context.lineTo(350, 120);
          context.closePath();
          context.fill();
          context.stroke();

          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "brown";
          context.fillStyle = "brown";
          context.moveTo(280, 120);
          context.lineTo(290, 80);
          context.lineTo(310, 80);
          context.lineTo(320, 120);
          context.lineTo(280, 120);
          context.closePath();
          context.fill();
     }

     function drawLeaves(){
          // arc(center x, center y, radias, start angle = 0, 2*Math.PI)
          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc(100,50, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc(65, 75, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 130, 40, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc(150, 60, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 200, 60, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc(240,  60, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 280, 60, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 320, 60, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 360,  60, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 400,  60, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 440,  60, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 480, 60, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 240, 20, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 280, 20, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 320, 20, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 360, 20, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc(400, 20, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 440, 20, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 480, 20, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc( 200, 20, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

          var circle = 2 * Math.PI;
          context.beginPath();
          context.lineWidth = "3";
          context.strokeStyle = "green";
          context.fillStyle = "green";
          context.arc(520, 80, 50, 0, circle);
          context.closePath();
          context.fill();
          context.stroke();

         
         

     }
   
  }// end of draw() function
          
  draw();
}
window.onload = setup;