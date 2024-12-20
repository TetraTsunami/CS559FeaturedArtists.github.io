class SeededRandom {
  constructor(seed) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  // Returns a pseudo-random value between 0 and 1
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  // Returns a pseudo-random integer between min (inclusive) and max (exclusive)
  randInt(min, max) {
    return Math.floor(this.next() * (max - min) + min);
  }

  // Returns a pseudo-random float between min (inclusive) and max (exclusive)
  randFloat(min, max) {
    return this.next() * (max - min) + min;
  }

  // Returns a pseudo-random boolean
  randBoolean() {
    return this.next() >= 0.5;
  }

  // Returns a pseudo-random item from an array
  randChoice(array) {
    return array[this.randInt(0, array.length)];
  }

  // Shuffles an array in-place
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.randInt(0, i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

function angleBetweenVectors(v1, v2) {
  const dotProduct = v1[0] * v2[0] + v1[1] * v2[1];
  const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
  const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
  let angle = Math.acos(dotProduct / (mag1 * mag2));

  const cross = v1[0] * v2[1] - v1[1] * v2[0];
  if (cross < 0) {
    angle = -angle;
  }

  return angle;
}

function valueToColor(value) {
  // Ensure the value is between 0 and 1
  value = Math.max(0, Math.min(1, value));

  // Define colors
  const colorStops = [
    { pos: 0, r: 255, g: 0, b: 0 },     // Red
    { pos: 0.2, r: 255, g: 127, b: 0 }, // Orange
    { pos: 0.4, r: 255, g: 255, b: 0 }, // Yellow
    { pos: 0.6, r: 0, g: 255, b: 0 },   // Green
    { pos: 0.8, r: 0, g: 0, b: 255 },   // Blue
    { pos: 1, r: 143, g: 0, b: 255 }    // Violet
  ];

  let lower = colorStops[0];
  let upper = colorStops[colorStops.length - 1];

  for (let i = 0; i < colorStops.length - 1; i++) {
    if (value >= colorStops[i].pos && value <= colorStops[i + 1].pos) {
      lower = colorStops[i];
      upper = colorStops[i + 1];
      break;
    }
  }
  // Interpolate the color
  const range = upper.pos - lower.pos;
  const valuePosition = (value - lower.pos) / range;
  const r = Math.round(lower.r + valuePosition * (upper.r - lower.r));
  const g = Math.round(lower.g + valuePosition * (upper.g - lower.g));
  const b = Math.round(lower.b + valuePosition * (upper.b - lower.b));

  // Return the color as an RGB string
  return `rgb(${r}, ${g}, ${b})`;
}
function setup() {
  "use strict";
  var canvas = document.getElementById('myCanvas');
  var scoreP = document.getElementById('score');
  var score = 0;
  const unitSize = 50
  const width = Math.floor(canvas.width / unitSize);
  const height = Math.floor(canvas.height / unitSize);
  var snakeLength = 2; // >=2
  const seed = 1234;
  const rng = new SeededRandom(seed);
  let targetPosition = generateRandomGridPosition(width, height);
  let snakePositions = [[0, 0]];

  if (snakeLength < 2) {
    throw new Error("Snake length must be greater than 1");
  }

  var colorSlider = document.getElementById('colorSlider');
  colorSlider.value = 0;
  var colorGradientSlider = document.getElementById('colorGradientSlider');
  colorGradientSlider.value = (colorGradientSlider.max - colorGradientSlider.min) * 0.1;

  function generateRandomGridPosition(gridXSize, gridYSize) {
    const x = rng.randInt(0, gridXSize);
    const y = rng.randInt(0, gridYSize);
    return [x, y];
  }
  function draw() {
    var context = canvas.getContext('2d');
    canvas.width = canvas.width;
    // use the sliders to get various parameters
    const colorVal = colorSlider.value / (colorSlider.max - colorSlider.min);
    const gradientVal = colorGradientSlider.value / (colorGradientSlider.max - colorGradientSlider.min);

    function DrawSnakeBody(idx, color) {
      if (idx == 0) {
        throw new Error("Can't draw snake head");
      };
      const pos = snakePositions[idx];
      const middlePoint = [unitSize * 0.5 + pos[0] * unitSize, unitSize * 0.5 + pos[1] * unitSize];
      context.save();

      context.beginPath();
      context.fillStyle = color; context.strokeStyle = color;
      context.moveTo(middlePoint[0] - 0.4 * unitSize, middlePoint[1] - 0.4 * unitSize);
      context.lineTo(middlePoint[0] + 0.4 * unitSize, middlePoint[1] - 0.4 * unitSize);
      context.lineTo(middlePoint[0] + 0.4 * unitSize, middlePoint[1] + 0.4 * unitSize);
      context.lineTo(middlePoint[0] - 0.4 * unitSize, middlePoint[1] + 0.4 * unitSize);
      context.closePath();
      context.fill();

      context.beginPath();
      context.restore();
    }

    function DrawSnakeHead(color) {
      const pos = snakePositions[0];
      const nextPos = snakePositions[1];
      const orientation = [pos[0] - nextPos[0], pos[1] - nextPos[1]];

      const middlePoint = [unitSize * 0.5 + pos[0] * unitSize, unitSize * 0.5 + pos[1] * unitSize];
      context.save();

      context.translate(middlePoint[0], middlePoint[1]);
      context.rotate(angleBetweenVectors([1, 0], orientation));

      context.beginPath();
      context.fillStyle = color; context.strokeStyle = color;
      context.moveTo(0.4 * unitSize, 0.15 * unitSize);
      context.lineTo(0.15 * unitSize, 0.4 * unitSize);
      context.lineTo(-0.4 * unitSize, 0.4 * unitSize);
      context.lineTo(-0.4 * unitSize, -0.4 * unitSize);
      context.lineTo(0.15 * unitSize, -0.4 * unitSize);
      context.lineTo(0.4 * unitSize, -0.15 * unitSize);

      context.closePath();
      context.lineWidth = 4;
      context.stroke();

      context.beginPath();
      context.fillStyle = "black";
      context.arc(0.15 * unitSize, 0.14 * unitSize, 0.1 * unitSize, 0, 2 * Math.PI);
      context.arc(0.15 * unitSize, - 0.14 * unitSize, 0.1 * unitSize, 0, 2 * Math.PI);
      context.fill();
      context.restore();

    }

    function DrawSnakeTail(color) {
      const pos = snakePositions[snakePositions.length - 1];
      const prevPos = snakePositions[snakePositions.length - 2];
      const orientation = [pos[0] - prevPos[0], pos[1] - prevPos[1]];
      const middlePoint = [unitSize * 0.5 + pos[0] * unitSize, unitSize * 0.5 + pos[1] * unitSize];
      context.save();

      context.translate(middlePoint[0], middlePoint[1]);
      context.rotate(angleBetweenVectors([1, 0], orientation));
      context.beginPath();

      context.fillStyle = color; context.strokeStyle = color;
      context.moveTo(0.5 * unitSize, 0 * unitSize);
      context.lineTo(-0.3 * unitSize, 0.4 * unitSize);
      context.lineTo(-0.4 * unitSize, 0.4 * unitSize);
      context.lineTo(-0.4 * unitSize, -0.4 * unitSize);
      context.lineTo(-0.3 * unitSize, -0.4 * unitSize);
      context.closePath();
      context.lineWidth = 4;
      context.stroke();

      context.restore();
    }

    function DrawSnakePart(idx, color) {
      if (idx == 0) {
        DrawSnakeHead(color);
      } else if (idx == snakePositions.length - 1) {
        DrawSnakeTail(color);
      } else {
        DrawSnakeBody(idx, color);
      }
    }
    function DrawTarget(color) {
      context.save();

      context.beginPath();
      context.arc(unitSize * 0.5 + targetPosition[0] * unitSize, unitSize * 0.5 + targetPosition[1] * unitSize, unitSize * 0.2, 0, 2 * Math.PI);
      context.fillStyle = color;
      context.fill();

      context.restore();
    }
    // make sure you understand these
    for (let i = 0; i < snakePositions.length; i++) {
      DrawSnakePart(i, valueToColor((colorVal + i * gradientVal) % 1));
    }
    DrawTarget(valueToColor(0.5));

  }
  function update() {
    function isValidPosition(purposedPos) {
      const inSideBody = snakePositions.some(pos => pos[0] == purposedPos[0] && pos[1] == purposedPos[1]);
      const outOfBound = purposedPos[0] < 0 || purposedPos[0] >= width || purposedPos[1] < 0 || purposedPos[1] >= height;
      return !inSideBody && !outOfBound;
    }
    const currentHeadPos = snakePositions[0];
    if (snakePositions.some(pos => pos[0] == targetPosition[0] && pos[1] == targetPosition[1])) {
      score += 1;
      snakeLength = 2 + score;
      scoreP.innerHTML = "Score: " + score;
    }
    while (snakePositions.some(pos => pos[0] == targetPosition[0] && pos[1] == targetPosition[1])) {
      targetPosition = generateRandomGridPosition(width, height);
    }
    let a = snakePositions.includes(targetPosition);

    // Move the snake towards the target
    const xDiff = targetPosition[0] - currentHeadPos[0];
    const yDiff = targetPosition[1] - currentHeadPos[1];
    const angle = xDiff == 0 ? (yDiff > 0 ? 90 : yDiff < 0 ? 270 : 361) : (Math.atan2(yDiff, xDiff) * (180 / Math.PI) + 360) % 360;
    const directions = [
      [1, 0],   // right
      [0, 1],   // down
      [-1, 0],  // left
      [0, -1]   // up
    ];
    let purposedNewHeadPos = [];

    for (const [dx, dy] of directions) {
      const newPos = [currentHeadPos[0] + dx, currentHeadPos[1] + dy];
      if (isValidPosition(newPos)) {
        purposedNewHeadPos.push(newPos);
      }
    }

    purposedNewHeadPos.sort((a, b) => {
      const distA = (a[0] - targetPosition[0]) ** 2 + (a[1] - targetPosition[1]) ** 2;
      const distB = (b[0] - targetPosition[0]) ** 2 + (b[1] - targetPosition[1]) ** 2;
      return distA - distB - 0.01;
    });

    if (purposedNewHeadPos.length > 0) {
      snakePositions.unshift(purposedNewHeadPos[0]);
    } else {
      // game over, reset
      snakePositions = [generateRandomGridPosition(width, height)];
      targetPosition = generateRandomGridPosition(width, height);
      score = 0;
      snakeLength = 2 + score;
      scoreP.innerHTML = "Score: " + score;
    }

    while (snakePositions.length > snakeLength) {
      snakePositions.pop();
    }

    draw();
  }
  colorGradientSlider.addEventListener("input", draw);
  colorSlider.addEventListener("input", draw);
  update();
  const intervalId = setInterval(update, 500);
}
window.onload = setup;


