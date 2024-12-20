const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const wheelRadius = 250;
const wheelThickness = 7;
let rotationAngle = 0;
let stars = [];
const cabinColors = ['#adc3d8', '#ddc3d8', '#dafbf2', '#feffe6', '#c9eafb', '#c9b4f4', '#b5a4ff', '	#fdfbcb', '#fde994', '##6cc5d8'];

function animate() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  function drawBase() {
    context.fillStyle = '#91c7c2';
    context.beginPath();
    context.rect(250, 560, 300, 40);
    context.fill();

    const columnHeight = -620;
    context.beginPath();
    context.rect(385.5, 890, 25, -600);
    context.fill();
  }

  function drawWheel() {
    context.save();
    let mat = glMatrix.mat2d.create();
    mat = glMatrix.mat2d.translate(mat, mat, [centerX, centerY]);
    mat = glMatrix.mat2d.rotate(mat, mat, rotationAngle);
    mat = glMatrix.mat2d.translate(mat, mat, [-centerX, -centerY]);

    context.strokeStyle = 'pink';
    context.lineWidth = wheelThickness;
    context.beginPath();
    context.arc(centerX, centerY, wheelRadius, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(centerX, centerY, wheelRadius - 2 * wheelThickness, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = 'white';
    context.beginPath();
    context.arc(centerX, centerY, wheelThickness, 0, Math.PI * 2);
    context.fill();

    // Columns
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const startX = centerX + wheelThickness * Math.cos(angle);
      const startY = centerY + wheelThickness * Math.sin(angle);
      const endX = centerX + (wheelRadius - 1.5 * wheelThickness) * Math.cos(angle);
      const endY = centerY + (wheelRadius - 1.5 * wheelThickness) * Math.sin(angle);

      let vec = glMatrix.vec2.fromValues(startX, startY);
      vec = glMatrix.vec2.transformMat2d(vec, vec, mat);

      context.beginPath();
      context.moveTo(vec[0], vec[1]);

      vec = glMatrix.vec2.fromValues(endX, endY);
      vec = glMatrix.vec2.transformMat2d(vec, vec, mat);

      context.lineTo(vec[0], vec[1]);
      context.stroke();
    }

    context.restore();
  }

  function drawCabins() {
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 / 10) * i + rotationAngle;
    context.save();
    context.translate(centerX, centerY);
    context.rotate(angle);
    context.translate(20, -wheelRadius + 1.5 * wheelThickness);
    context.rotate(-angle);

    // Cabin Body
    context.fillStyle = cabinColors[i];
    context.fillRect(-15, -20, 30, 20);
    context.beginPath();
    context.moveTo(-15, -20);
    context.lineTo(15, -20);
    context.lineTo(0, -30);
    context.closePath();
    context.fill();

    context.fillStyle = '#fdfbdc';
    context.fillRect(-10, -18, 5, 5);
    context.fillRect(5, -18, 5, 5); 
    
    context.fillStyle = "#ddc3d8";
    context.beginPath();
    context.moveTo(-3, -20);
    context.lineTo(-3, 0);
    context.lineTo(3, 0);
    context.lineTo(3, -20);
    context.closePath();
    context.fill();

    context.restore();
  }
}


 function drawStars() {
  if (stars.length === 0) {
    const numberOfStars = 100;
    for (let i = 0; i < numberOfStars; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const starSize = Math.random() * 2;
      stars.push({
        x: x,
        y: y,
        size: starSize,
        originalSize: starSize,
        oscillationSpeed: Math.random() * 0.01
      });
    }
  }

  context.fillStyle = 'white';

  for (let star of stars) {
    star.size = star.originalSize + Math.sin(Date.now() * star.oscillationSpeed) * star.originalSize;
    context.beginPath();
    context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    context.fill();
  }
}
  drawStars();
  drawBase();
  drawWheel();
  drawCabins();

  rotationAngle += glMatrix.glMatrix.toRadian(0.3);

  requestAnimationFrame(animate);
}

window.onload = animate;



