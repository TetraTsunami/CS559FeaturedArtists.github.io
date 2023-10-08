// Global vars
var iterations = 8
var playing = true

var F = [
    [-0.4,-0.6,0.5,-0.25],
    [0.6,0.2,0.7,-.2],
    [0,0.5,0.7,.25],
  ]

function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');

  // ------------------------- UI -----------------------------
  // Iteraions slider
  var iterSlider = document.getElementById("iterSlider");
  var iterSpan = document.getElementById("iterSpan");
  iterSlider.value = iterations;
  iterSlider.addEventListener('input', setIter);
  function setIter(){
    iterations = iterSlider.value
    iterSpan.innerHTML = iterSlider.value
    draw()
  }
  
  // All of the function sliders
  var sliders = [];
  var labels = [];
  var sliderDiv = document.getElementById('sliders');
  const labelNames = ["x translate", "y translate", 
    "scale\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0","rotate\xa0\xa0\xa0\xa0\xa0\xa0\xa0"]; //annoying alignment
  for (let i = 0; i < F.length; i ++){
    sliders.push([]);
    labels.push([]);

    for (let j = 0; j < F[0].length; j++){
      // The container
      const div = document.createElement('div');
      div.class = 'slider-container';
      sliderDiv.appendChild(div);

      // The label
      var newLabel = document.createElement('label');
      newLabel.class = 'slider-label';
      newLabel.textContent = `F${i} ${labelNames[j]}:`
      div.appendChild(newLabel);
      
      // The slider
      const newSlider = document.createElement('input');
      newSlider.type = 'range';
      newSlider.min =  '-1';
      newSlider.max =  '1';
      newSlider.step= '0.01';
      newSlider.style = 'width : 200px, float:left';
      newSlider.value = F[i][j];
      newSlider.addEventListener('input', setValuesToSliders);
      sliders[i].push(newSlider);
      div.appendChild(newSlider);
      
      // The span
      var newSpan = document.createElement('span');
      newSpan.innerHTML = newSlider.value;
      div.appendChild(newSpan);
      labels[i].push(newSpan);
    }
  }

  function setValuesToSliders(){
    for(let i = 0; i < F.length; i++){
      for (let j = 0; j < F[0].length; j++){
        F[i][j] = sliders[i][j].value * 1.0;// *1.0! thanks javascript :)
        labels[i][j].innerHTML = `${F[i][j]}`;
      }
    }
    draw();
  }

  function setSlidersToValues(){
    for(let i = 0; i < F.length; i++){
      for (let j = 0; j < F[0].length; j++){
        sliders[i][j].value = F[i][j];
        labels[i][j].innerHTML = `${F[i][j].toFixed(2)}`;
      }
    }
    draw();
  }
  
  // Buttons
  var playButton = document.getElementById('playButton');
  playButton.addEventListener("click",function (){
    if(playing){
      playing = false;
      playButton.innerHTML = "Play"
    }else{
      playing = true;
      playButton.innerHTML = "Stop"
      window.requestAnimationFrame(update);
    }
  });

  // --------------------- End UI ------------------------------------

  // --------------------- Drawing -----------------------------------
  function draw() {

    var context = canvas.getContext('2d');
    canvas.width = canvas.width;
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
  
    // Takes rgb inputs on 0.0 - 1.0 scale
    function DrawShape(r,g,b){
      context.fillStyle = `rgb(${r*255},${g*255},${b*255})`;
      context.beginPath();
      context.moveTo(0,0);
      context.lineTo(canvas.width,0);
      context.lineTo(canvas.width,canvas.width);
      context.lineTo(0,canvas.width);
      context.closePath();
      context.fill();
    }

 
/*
  Here is where we do the stuff that the assignment asks for.

  "It just has to have parts that move relative to each other (e.g. be hierarchical).
 And it should have at least one part that has two children (like the quadcopter has 4 propellers,
   or a car has 2 wheels). And it has to move by itself to show this off."

   We use canvas.save() and canvas.restore() to create a hierarchical relationship
   between the levels of the fractal. As the transformations are changed, the parts
   of the fractal move relative to each other. Each level branches 3 times. 
*/
    function DrawIFS(n, branch){
      if (n > 0){
        for (let i = 0; i < F.length; i++){
          context.save();
          context.translate(F[i][0]*canvas.width, F[i][1]*canvas.width)
          context.scale(F[i][2],F[i][2]);
          context.rotate(F[i][3] * 3.14159,F[i][1] * 3.14159);
          const b0 = 1-branch[0]/iterations
          const b1 = 1-branch[1]/iterations
          const b2 = 1-branch[2]/iterations
          DrawShape(b0*b0,b1*b1,b2*b2);//square them to get darker colors
          var newBranch = [...branch];
          newBranch[i] ++;
          DrawIFS(n-1, newBranch);
          context.restore();
        }
      }
    } 
    
    context.scale(0.25,0.25);
    context.translate(canvas.width*1.5, canvas.width*1.5)
    DrawShape(1,1,1);
    DrawIFS(iterations, [0,0,0]);

  }
  // --------------------- End Drawing ----------------------

  // -------------------- Animation -------------------------- 
  var anim_i = 1
  var anim_j = 3
  var frames_left = 200
  var incr = 0.01

  function update(){
    frames_left--;
    F[anim_i][anim_j] += incr
    if (anim_j == 3){
      // if we are rotating, wrap around when we hit +-1
      if (F[anim_i][anim_j] > 1)
        F[anim_i][anim_j] = -1
      if (F[anim_i][anim_j] < -1)
      F[anim_i][anim_j] = 1
    }else{
      // if we aren't rotating, turn around when we hit +-1
      if (F[anim_i][anim_j] > 1 || F[anim_i][anim_j] < -1){
        incr *= -1
      }
    }
    setSlidersToValues();
    if (frames_left <= 0){
      if(anim_j == 2 && F[anim_i][anim_j] < 0.3){
        // Avoid setting scale to be too small
        frames_left = 50;
      }else{
        frames_left = Math.floor(Math.random() * 100)+100;
        anim_i = Math.floor(Math.random() * F.length)
        anim_j = Math.floor(Math.random() * F[0].length)
      }
    }
    if (playing)
      window.requestAnimationFrame(update);
  }
  // ---------------------- End Animation ---------------------------------

  window.requestAnimationFrame(update);
}
window.onload = setup;
    