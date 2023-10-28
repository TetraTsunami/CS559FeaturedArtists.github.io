function setup() {

  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');
  var slider = document.getElementById('slider');
  slider.value = 0;

  var y = (200*540)- 4930;
  var m = 0;

  function draw() {
      canvas.width = canvas.width;
      var x = slider.value;
      
      function setCanvasTransform(Tx) {
	    context.setTransform(Tx[0],Tx[1],Tx[3],Tx[4],Tx[6],Tx[7]);
	  }

      function limbs() {
          context.beginPath();
          context.lineWidth = 10;
          context.strokeStyle = "black";
          context.moveTo(80, 0);
          context.lineTo(130, 65);
          context.stroke();
          context.moveTo(-80, 0);
          context.lineTo(-90, 75);
          context.stroke();  
          context.moveTo(10, 80);
          context.lineTo(10, 280);
          context.moveTo(-10, 80);
          context.lineTo(-10, 280);
          context.stroke();
          context.beginPath();
          context.lineWidth = 1;
          context.fillStyle = "#ce370c";
          context.moveTo(5, 280);
          context.lineTo(40, 280);
          context.lineTo(40, 290);
          context.lineTo(5, 290);
          context.lineTo(5, 280);
          context.fill();
          context.stroke();
          context.beginPath();
          context.moveTo(-5, 280);
          context.lineTo(-40, 280);
          context.lineTo(-40, 290);
          context.lineTo(-5, 290);
          context.lineTo(-5, 280);
          context.fill();
          context.stroke();
          context.stroke();          
          context.closePath();
      }

      function forearms() {
          context.beginPath();
          context.arc(0, 0, 6, 0, Math.PI * 2)
          context.fillStyle= "black";
          context.fill();
          context.beginPath();
          context.lineWidth = 10;
          context.strokeStyle = "black";
          context.moveTo(0, 0);
          context.lineTo(90, 10);
          context.stroke();
          context.beginPath();
          context.fillStyle = "white";
          context.lineWidth = 3;
          context.arc(90, 10, 12, 0, Math.PI*2);
          context.stroke();
          context.fill();
          context.closePath();
      }

      function background() {
          context.fillStyle = "#b5d1cf";
          context.beginPath();
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.closePath();
        }
      
      function frame() {
          context.beginPath();
          context.lineWidth = 10;
          context.strokeStyle = "black";
          context.arc(100, 100, 80, 0, 2 * Math.PI);
          context.fillStyle = "#385263";
          context.fill();
          context.stroke();

          context.beginPath();
          context.lineWidth = 6;
          context.strokeStyle = "#d4b13a";
          context.moveTo(100,25);
          context.lineTo(100, 40);
          context.stroke();
          context.moveTo(175, 100);
          context.lineTo(160, 100);
          context.stroke();
          context.moveTo(100, 175);
          context.lineTo(100, 160);
          context.stroke();
          context.moveTo(25, 100);
          context.lineTo(40, 100);
          context.stroke();

          context.beginPath();
          context.strokeStyle = "#ce370c";
          context.arc(100, 100, 3.5, 0, Math.PI * 2);
          context.fillStyle = "#ce370c";
          context.fill();
          context.stroke();

          context.beginPath();
          context.fillStyle = "#e2e6dc";
          context.arc(75, 80, 10, 0, Math.PI * 2);
          context.arc(125, 80, 10, 0, Math.PI *2);
          context.fill();

          context.beginPath();
          context.lineWidth = 3;
          context.strokeStyle = "black";
          context.moveTo(60, 60);
          context.lineTo(85, 65);
          context.moveTo(115, 65);
          context.lineTo(140, 60);
          
          context.moveTo(120, 135);
          context.arcTo(100, 145, 80, 135, 60);
          context.stroke();

      }

      function sec() {
          context.lineWidth = 2;
          context.strokeStyle = "#ce370c";
  
          context.beginPath();
          context.moveTo(0,0);
          context.lineTo(65,0);
          context.lineTo(60, -5);
          context.lineTo(60, 5);
          context.lineTo(65,0);
          context.fillStyle = "#ce370c"
          context.fill();
          context.stroke();
      }

      function minute() {
          context.lineWidth = 3;
          context.strokeStyle = "#ce370c";
  
          context.beginPath();
          context.moveTo(0,0);
          context.lineTo(55,0);
          context.lineTo(50, -5);
          context.lineTo(50, 5);
          context.lineTo(55, 0);
          context.fillStyle = "#ce370c"
          context.fill();
          context.stroke();
      }

      function hour() {
          context.lineWidth = 3;
          context.strokeStyle = "#ce370c";
          context.beginPath();
          context.moveTo(0, 0)
          context.lineTo(35, 0);
          context.lineTo(30, -5);
          context.lineTo(30, 5);
          context.lineTo(35, 0);
          context.fillStyle = "#ce370c"
          context.fill();
          context.stroke();
      }
      
      function pupil() {
          context.fillStyle = "black";
          context.beginPath();
          context.arc(75, 80, 4, 0, Math.PI * 2);
          context.arc(125, 80, 4, 0, Math.PI *2);
          context.fill();
          context.closePath();
      }

      function clock() {

          frame();
          var Tpupil = mat3.create();
          mat3.fromTranslation(Tpupil, [(x/10), 1]);
          var Tpupil_to_canvas = mat3.create();
          mat3.multiply(Tpupil_to_canvas, clock_to_canvas, Tpupil);
          setCanvasTransform(Tpupil_to_canvas);
          pupil();
          
          var Tcenter = mat3.create();
          mat3.fromTranslation(Tcenter, [100, 100]);
          var Tto_center = mat3.create();
          mat3.multiply(Tto_center, Tcenter, clock_to_canvas);
        
          var Tminute = mat3.create();
          mat3.rotate(Tminute, Tminute, (3* Math.PI /2));
          mat3.rotate(Tminute, Tminute, ((y/100) * Math.PI) / 2);
          var Tminute_to_canvas = mat3.create();
          mat3.multiply(Tminute_to_canvas, Tto_center, Tminute);
          setCanvasTransform(Tminute_to_canvas);
          minute(); 
          
          var Tsec = mat3.create();
          mat3.rotate(Tsec, Tsec, 3* Math.PI /2);
          mat3.rotate(Tsec, Tsec, (((60*y)/100) * Math.PI) / 2);
          var Tsec_to_canvas = mat3.create();
          mat3.multiply(Tsec_to_canvas, Tto_center, Tsec);
          setCanvasTransform(Tsec_to_canvas);
          sec();

          var Thour = mat3.create();
          mat3.rotate(Thour, Thour, 3* Math.PI /2); 
          mat3.rotate(Thour, Thour, (((y/60)/100) * Math.PI) / 2);  
          var Thour_to_canvas = mat3.create();
          mat3.multiply(Thour_to_canvas, Tto_center, Thour);
          setCanvasTransform(Thour_to_canvas);
          hour();
          
         setCanvasTransform(Tto_center);
      }

      background();
      var clock_to_canvas = mat3.create();
      mat3.fromTranslation(clock_to_canvas, [250+(100*Math.cos(m)), 110]);
      setCanvasTransform(clock_to_canvas);
      clock();
      limbs();

      var Tcenter_to_leftarm = mat3.create();
      mat3.fromTranslation(Tcenter_to_leftarm, [230, 165]);
      mat3.rotate(Tcenter_to_leftarm, Tcenter_to_leftarm, (Math.PI * 3.5 /2));
      mat3.rotate(Tcenter_to_leftarm, Tcenter_to_leftarm, .5*(Math.sin(4*m)));
      var Tleftarm_to_canvas = mat3.create();
      mat3.multiply(Tleftarm_to_canvas, clock_to_canvas, Tcenter_to_leftarm);
      setCanvasTransform(Tleftarm_to_canvas);
      forearms();

      var Tcenter_to_rightarm = mat3.create();
      mat3.fromTranslation(Tcenter_to_rightarm, [10, 175]);
      mat3.rotate(Tcenter_to_rightarm, Tcenter_to_rightarm, (Math.PI * 3 /6));
      mat3.rotate(Tcenter_to_rightarm, Tcenter_to_rightarm, (-.05*Math.sin(3*m)));
      var Trightarm_to_canvas = mat3.create();
      mat3.multiply(Trightarm_to_canvas, clock_to_canvas, Tcenter_to_rightarm);
      setCanvasTransform(Trightarm_to_canvas);
      forearms();

      m = m+0.02;
      y = y+(1/540);
      window.requestAnimationFrame(draw);
  }
    window.requestAnimationFrame(draw);
  
  }
  
  window.onload = setup;