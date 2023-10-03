function setUp(){
    var canvas = document.getElementById('butterflyCanvas');
    
    var slider = document.getElementById('slider');
    slider.value = 0;
  
    
    function draw(){
      var context = canvas.getContext('2d');
      canvas.width = canvas.width;
      var d = parseInt(slider.value);
      
      
      
      
       function drawBody(){
         
         context.translate(-21,-15);
         context.beginPath();
       context.fillStyle = `hsl(${d*2 + 85}, 60%, 70%)`;
       context.lineWidth = 3;
       context.strokeStyle = `hsl(${d*2 + 130}, 90%, 30%)`;
       
       context.moveTo(260,260);
       context.lineTo(268,253);
       context.lineTo(279,263);
       context.lineTo(271,271);
        context.closePath();
       context.fill();
         
       context.moveTo(279,271);
       context.lineTo(288,276);
       context.lineTo(415,397);
        context.lineTo(420,415);
        context.lineTo(400,404);
       context.lineTo(285,284);
         context.closePath();
         context.fill();
         
         context.translate(6,6);
         context.lineWidth = 2;
         //tentacle
         context.moveTo(256,250);
         context.lineTo(250,200);
         context.lineTo(256,160);
         context.lineTo(265,150);
         context.lineTo(278,155);
         context.lineTo(285,165);
         context.lineTo(280,175);
         context.lineTo(265,170);
         
         //tentacle
         context.moveTo(256,250);
         context.lineTo(195,230);
         context.lineTo(180,200);
         context.lineTo(180,184);
         context.lineTo(195,177);
         context.lineTo(210,185);
         context.lineTo(204,203);
         context.lineTo(193,198);
         
         context.save();
         context.restore();
       
       context.stroke();
       }
      
      
      
      
      function leftWing(){
        context.lineWidth = 3.5;
        context.strokeStyle=`hsl(${d*2 + 190}, 90%, 60%)`;
        //upper half
        context.beginPath();
        context.moveTo(265,266);
        context.lineTo(260-150*Math.cos(1/70*Math.PI + d*(1/60)*Math.PI )-Math.abs(d)*3, 
                       260-150*Math.sin(1/70*Math.PI + d*(1/60)*Math.PI)-d*2);
        
        context.lineTo(280-260*Math.cos(1/70*Math.PI + d*(1/60)*Math.PI )-Math.abs(d)*2, 
                       280-260*Math.sin(1/70*Math.PI + d*(1/60)*Math.PI)-d*2);
        
        context.lineTo(295-260*Math.cos(1/70*Math.PI + d*(1/60)*Math.PI )-Math.abs(d)*3, 
                       295-260*Math.sin(1/70*Math.PI + d*(1/60)*Math.PI)-d*2);
        
        context.lineTo(320-185*Math.cos(-1/20*Math.PI + d*(1/60)*Math.PI )-Math.abs(d), 
                       320-185*Math.sin(-1/20*Math.PI + d*(1/60)*Math.PI)-d*2);
        
        
        context.lineTo(330-110*Math.cos(-1/6*Math.PI + d*(1/60)*Math.PI)-Math.abs(d), 
                       330-110*Math.sin(-1/6*Math.PI + d*(1/60)*Math.PI)-d*3);
        
        context.lineTo(340-70*Math.cos(-1/6*Math.PI + d*(1/90)*Math.PI), 
                       340-70*Math.sin(-1/6*Math.PI + d*(1/90)*Math.PI)-d*3.5);
        
        context.lineTo(320,320);
        context.closePath();
        
        //lower half
        context.moveTo(340-70*Math.cos(-1/6*Math.PI + d*(1/90)*Math.PI), 
                       340-70*Math.sin(-1/6*Math.PI + d*(1/90)*Math.PI)-d*3.5);
        
        context.lineTo(350 - 110*Math.cos(-1/4*Math.PI + d*(1/60)*Math.PI)+d*2, 
                       350 - 110*Math.sin(-1/4*Math.PI + d*(1/60)*Math.PI)-d*2.5);
        
        context.lineTo(370 - 130*Math.cos(-1/4*Math.PI + d*(1/60)*Math.PI)+d*2, 
                       370 - 130*Math.sin(-1/4*Math.PI + d*(1/60)*Math.PI)-d*3);
        
        context.lineTo(380 - 150*Math.cos(-1/3*Math.PI + d*(1/60)*Math.PI)+d*3, 
                       380 - 150*Math.sin(-1/3*Math.PI + d*(1/60)*Math.PI)-d*3.5);
        
        context.lineTo(390 - 100*Math.cos(-1/3*Math.PI + d*(1/60)*Math.PI), 
                       390 - 100*Math.sin(-1/3*Math.PI + d*(1/60)*Math.PI)-d*2);
        
        context.lineTo(400 - 60*Math.cos(-1/4*Math.PI + d*(1/60)*Math.PI)+Math.abs(d)*0.2, 
                       400 - 60*Math.sin(-1/4*Math.PI + d*(1/60)*Math.PI)-d);
        
        context.lineTo(350,350);
        
        context.lineTo(320,320);
        context.closePath();
      
        
        context.stroke();
        leftPattern();
      }
      
      function leftPattern(){
        context.lineWidth = 3;
        //pattern1
        context.beginPath();
        context.fillStyle = `hsl(${d*5 + 170}, 80%, 80%)`;
        context.moveTo(260,280-d*0.5);
        context.lineTo(275-150*Math.cos(1/70*Math.PI + d*(1/60)*Math.PI )-Math.abs(d)*3, 
                       275-150*Math.sin(1/70*Math.PI + d*(1/60)*Math.PI)-d*2);
        
        context.lineTo(304-130*Math.cos(1/70*Math.PI + d*(1/60)*Math.PI )-Math.abs(d)*2, 
                       304-130*Math.sin(1/70*Math.PI + d*(1/60)*Math.PI)-d*1.3);
        
        
        context.lineTo(274,294-d*0.8);
        context.closePath();
        context.fill();
        
        //pattern2
         context.moveTo(282,300-d*0.5);
        
        context.lineTo(300-110*Math.cos(-1/30*Math.PI + d*(1/60)*Math.PI )-Math.abs(d), 
                       300-110*Math.sin(-1/30*Math.PI + d*(1/60)*Math.PI)-d*2.3);
        
        context.lineTo(325-95*Math.cos(-1/30*Math.PI + d*(1/60)*Math.PI )-Math.abs(d), 
                       325-95*Math.sin(-1/30*Math.PI + d*(1/60)*Math.PI)-d*1.8);
        
        context.lineTo(295,312-d*0.7);
        context.closePath();
        context.fill();
        
        //patern3
        context.moveTo(301,316-d*0.7);
        
        context.lineTo(340-90*Math.cos(-1/70*Math.PI + d*(1/60)*Math.PI )-Math.abs(d), 
                       340-90*Math.sin(-1/70*Math.PI + d*(1/60)*Math.PI)-d*1.5);
        
        context.lineTo(355-75*Math.cos(-1/70*Math.PI + d*(1/60)*Math.PI )-Math.abs(d), 
                       355-75*Math.sin(-1/70*Math.PI + d*(1/60)*Math.PI)-d*1.6);
        
        context.lineTo(310,323-d*0.7);
        context.closePath();
        context.fill();
        
        //low patern
        
        context.moveTo(320-d*0.5,340-d);
        
        context.lineTo(350 - 85*Math.cos(-1/4*Math.PI + d*(1/60)*Math.PI)+d*1.3, 
                       350 - 85*Math.sin(-1/4*Math.PI + d*(1/60)*Math.PI)-d*3.5);
        
        context.lineTo(370 - 95*Math.cos(-1/4*Math.PI + d*(1/60)*Math.PI)+d, 
                       370 - 95*Math.sin(-1/4*Math.PI + d*(1/60)*Math.PI)-d*3.5);
        
        context.lineTo(385 - 85*Math.cos(-1/4*Math.PI + d*(1/60)*Math.PI)+Math.abs(d)*0.8, 
                       385 - 85*Math.sin(-1/4*Math.PI + d*(1/60)*Math.PI)-d*2.7);
        
        context.lineTo(390 - 70*Math.cos(-1/4*Math.PI + d*(1/60)*Math.PI)+Math.abs(d)*0.7, 
                       390 - 70*Math.sin(-1/4*Math.PI + d*(1/60)*Math.PI)-d*2);
        
        context.lineTo(340-d*0.3,360-d*0.5);
        context.closePath();
        context.fill();
        
        linePattern();
      }
        
        function linePattern(){
          //stroke line pattern
          context.beginPath();
        context.lineWidth = 2;
        context.moveTo(282-180*Math.cos(1/70*Math.PI + d*(1/60)*Math.PI )-Math.abs(d)*2.5, 
                       282-180*Math.sin(1/70*Math.PI + d*(1/60)*Math.PI)-d*1.4);
        
        context.lineTo(290-230*Math.cos(1/70*Math.PI + d*(1/60)*Math.PI )-Math.abs(d)*2, 
                       290-230*Math.sin(1/70*Math.PI + d*(1/60)*Math.PI)-d*1.5);
        
        context.lineTo(310-220*Math.cos(1/70*Math.PI + d*(1/60)*Math.PI )-d*1.8, 
                       310-220*Math.sin(1/70*Math.PI + d*(1/60)*Math.PI)-d*1.2);
        
        context.lineTo(320-160*Math.cos(1/70*Math.PI + d*(1/60)*Math.PI )-d, 
                       320-160*Math.sin(1/70*Math.PI + d*(1/60)*Math.PI)-d*0.4);
        context.closePath();
        
        
          context.moveTo(282+170*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI )+ Math.abs(d)*0.5, 
                       282-170*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI)-d*0.5);
          
          context.lineTo(290+230*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI )+ Math.abs(d)*0.5, 
                       290-230*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI)-d*0.9);
          
          context.lineTo(310+205*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI ) + Math.abs(d)*0.8, 
                       310-205*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI)-d*0.9);
        
          context.lineTo(320+150*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI ) + Math.abs(d)*0.5, 
                       320-150*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI)-d*0.9);
          
          context.closePath();
         
        context.stroke();
        }
      
      
      function rightWing(){
        context.lineWidth = 3.5;
        context.strokeStyle = `hsl(${d*2 + 190}, 90%, 60%)`;
        //upper half
        context.beginPath();
        context.moveTo(265,266);
        
        context.lineTo(265+150*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI), 
                       265-150*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI));
        
        context.lineTo(280+270*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI )+Math.abs(d), 
                       280-270*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI)-d*1.5);
        
        context.lineTo(295+270*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI )+Math.abs(d), 
                       295-270*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI)-d);
        
        context.lineTo(320+180*Math.cos(1/4*Math.PI + d*(1/120)*Math.PI )+Math.abs(d), 
                       320-180*Math.sin(1/4*Math.PI + d*(1/120)*Math.PI)-d);
        
        context.lineTo(330+130*Math.cos(1/5*Math.PI + d*(1/120)*Math.PI )+Math.abs(d), 
                       330-130*Math.sin(1/5*Math.PI + d*(1/120)*Math.PI)-d*2);
        
        
        context.lineTo(340+90*Math.cos(1/5*Math.PI + d*(1/120)*Math.PI)+Math.abs(d), 
                       340-90*Math.sin(1/5*Math.PI + d*(1/120)*Math.PI)-d);
        
        context.lineTo(320,320);
        
        //lower half
        
        context.moveTo(340+90*Math.cos(1/5*Math.PI + d*(1/120)*Math.PI)+Math.abs(d), 
                       340-90*Math.sin(1/5*Math.PI + d*(1/120)*Math.PI)-d);
        
        context.lineTo(350 + 130*Math.cos(1/8*Math.PI + d*(1/120)*Math.PI)+Math.abs(d)*0.3, 
                       350 - 130*Math.sin(1/8*Math.PI + d*(1/120)*Math.PI)-d*1.5);
        
        context.lineTo(360 + 170*Math.cos(1/20*Math.PI + d*(1/120)*Math.PI)+Math.abs(d)*0.2, 
                       360 - 170*Math.sin(1/20*Math.PI + d*(1/120)*Math.PI)-d*2);
        
        context.lineTo(360 + 170*Math.cos(1/60*Math.PI + d*(1/120)*Math.PI)+Math.abs(d)*0.3, 
                       360 - 170*Math.sin(1/60*Math.PI + d*(1/120)*Math.PI)-d*1.8);
        
        context.lineTo(370 + 120*Math.cos(1/80*Math.PI + d*(1/150)*Math.PI)+Math.abs(d)*0.3, 
                       370 - 120*Math.sin(1/80*Math.PI + d*(1/150)*Math.PI)-d*1.9);
        
        
        context.lineTo(360 + 70*Math.cos(-1/20*Math.PI + d*(1/150)*Math.PI)+Math.abs(d)*0.4, 
                       360 - 70*Math.sin(-1/20*Math.PI + d*(1/150)*Math.PI)-d*1.6);
        
        context.lineTo(350,350);
        
        context.stroke();
        rightPattern();
      }
      
      function rightPattern(){
        context.lineWidth = 2;
        //pattern1
        context.beginPath();
        context.fillStyle = `hsl(${d*5 + 170}, 80%, 80%)`;
        
        //pattern 1
        context.moveTo(284- d*0.4,266);
        
        context.lineTo(280+150*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI), 
                       280-150*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI));
        
        context.lineTo(308+130*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI), 
                       308-130*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI));
        
        context.lineTo(298-d*0.4,280);
        context.closePath();
        context.fill();
        
        //pattern2
        context.moveTo(303 - d*0.4,285);
        context.lineTo(320+125*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI), 
                       320-125*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI));
        
        context.lineTo(340+108*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI), 
                       340-108*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI)-d*0.5);
        
        context.lineTo(314-d*0.4,296);
        
        context.closePath();
        context.fill();
        
        //pattern 3
        context.moveTo(320 - d*0.4,300);
        
        context.lineTo(347+103*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI), 
                       347-103*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI)-d*0.5);
        
        context.lineTo(358+87*Math.cos(1/3*Math.PI + d*(1/120)*Math.PI), 
                       358-87*Math.sin(1/3*Math.PI + d*(1/120)*Math.PI)-d*0.7);
        
        context.lineTo(328-d*0.6,309-d*0.3);
        context.closePath();
        context.fill();
        
        //low pattern
        
        context.moveTo(342-d*0.3,324- d*0.4);
        
        context.lineTo(335 + 90*Math.cos(1/8*Math.PI + d*(1/120)*Math.PI)+Math.abs(d)*0.3, 
                       335 - 90*Math.sin(1/8*Math.PI + d*(1/120)*Math.PI)-d*0.6);
        
        context.lineTo(355 + 110*Math.cos(1/8*Math.PI + d*(1/120)*Math.PI)+d, 
                       355 - 110*Math.sin(1/8*Math.PI + d*(1/120)*Math.PI)-d);
        
        context.lineTo(375 + 100*Math.cos(1/8*Math.PI + d*(1/120)*Math.PI)+d*0.4, 
                       375 - 100*Math.sin(1/8*Math.PI + d*(1/120)*Math.PI)-d*1.7);
        
        context.lineTo(380 + 60*Math.cos(1/8*Math.PI + d*(1/120)*Math.PI)+d*0.6, 
                       380 - 60*Math.sin(1/8*Math.PI + d*(1/120)*Math.PI)-d*2);
        
        context.lineTo(360-d*0.3,340- d*0.4);
        context.closePath();
        context.fill();
        
        //context.stroke();
      }
      
      context.translate(d,d*2.5);
      leftWing();
      rightWing();
      drawBody();
    }
      
    
    
    // Event listener for the slider
    slider.addEventListener('input', draw);
    draw();
  };
  window.onload = setUp;