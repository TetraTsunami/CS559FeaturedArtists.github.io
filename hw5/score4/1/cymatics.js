let frequencyInput, backwardSpeedInput, audioContext, oscillator, penPositions, rotationInput;
let canvasBackground = "#202123";
let drawingColor = "#F7F7F8";
let isPlaying = false;

let projMatrix, viewMatrix, radius;

let bounceAmplitude = 50;
let bounceFrequency = 0.05;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noFill();
  strokeWeight(3);

  projMatrix = glMatrix.mat4.create();
  viewMatrix = glMatrix.mat4.create();

  radius = 800;
  setupCamera();

  frequencyInput = select("#frequency-slider");
  backwardSpeedInput = select("#backward-slider");
  rotationInput = select("#rotation-slider");

  setupAudio();
  penPositions = [];

  speakerPosition = createVector(200, 0, 0);
  secondSpeakerPosition = createVector(-200, 0, 0);
}

function draw() {
  background(canvasBackground);
  stroke(drawingColor);

  updatePenPositions();
  drawCurve();
  updateCamera();

  let bounce = sin(frameCount * bounceFrequency) * bounceAmplitude;

  drawSpeaker(bounce);
  drawSecondSpeaker(bounce);
}

function drawSpeaker(bounce) {
  push(); // Save current transformation state
  translate(speakerPosition.x, speakerPosition.y+bounce, speakerPosition.z); // Move to speaker position

  drawSpeakerBody();
  drawSpeakerCone();
  drawControlKnobs();

  pop(); // Revert to original state
}

function drawSpeakerBody() {
  push();
  fill('brown'); // Color for speaker body
  box(50, 100, 25); // Dimensions for speaker body
  pop();
}

function drawSpeakerCone() {
  push();
  translate(0, -25, 12.5); // Position cone in the upper part of the body
  fill('black'); // Color for speaker cone
  cone(20, 30); // Dimensions for speaker cone
  pop();
}

function drawControlKnobs() {
  push();
  translate(0, 25, 12.5); // Position knobs in the lower part of the body
  fill('gray'); // Color for control knobs
  sphere(5); // Dimensions for control knobs
  translate(15, 0, 0); // Position for the second knob
  sphere(5); // Dimensions for second knob
  translate(-30, 0, 0); // Position for the second knob
  sphere(5); // Dimensions for second knob
  pop();
}

function drawSecondSpeaker(bounce) {
  push(); // Save current transformation state
  translate(secondSpeakerPosition.x, secondSpeakerPosition.y+bounce, secondSpeakerPosition.z);

  drawSpeakerBody();
  drawSpeakerCone();
  drawControlKnobs();

  pop(); // Revert to original state
}


function updatePenPositions() {
  let amplitude = map(sin(frameCount * (oscillator.frequency.value / 100)), -1, 1, 50, 200);
  let angle = frameCount * (oscillator.frequency.value / 100);
  let nextPenPosition = createVector(amplitude * cos(angle), amplitude * sin(angle), 0);

  penPositions.push(nextPenPosition);
  penPositions.forEach(p => p.z -= backwardSpeedInput.value());
  if (penPositions.length > 50) penPositions.shift();
}

function drawCurve() {
  beginShape();
  penPositions.forEach(p => curveVertex(p.x, p.y, p.z));
  endShape();
}

function setupCamera() {
  let fov = radians(20); // Convert degrees to radians
  let aspect = width / height;
  let near = 0.1;
  let far = 15000;

  glMatrix.mat4.perspective(projMatrix, fov, aspect, near, far);
  applyProjectionMatrix(projMatrix);
}

function updateCamera() {
  let theta = radians(rotationInput.value());
  let eye = [radius * sin(theta), 0, radius * cos(theta)];
  let center = [0, 0, 0];
  let up = [0, 1, 0];

  glMatrix.mat4.lookAt(viewMatrix, eye, center, up);
  applyViewMatrix(viewMatrix);
}

function applyProjectionMatrix(matrix) {
  // Field of view (fov)
  let fov = 2 * Math.atan(1 / matrix[5]);

  // Aspect ratio
  let aspect = matrix[5] / matrix[0];

  // Near plane
  let near = matrix[14] / (matrix[10] - 1);

  // Far plane
  let far = matrix[14] / (matrix[10] + 1);

  perspective(fov, aspect, near, far);
}

function applyViewMatrix(matrix) {
  // Inverting the view matrix to get the camera position
  let invView = glMatrix.mat4.create();
  glMatrix.mat4.invert(invView, matrix);
  let camX = invView[12];
  let camY = invView[13];
  let camZ = invView[14];

  // Assuming the camera is looking at the origin
  let centerX = 0, centerY = 0, centerZ = 0;

  // Assuming Y is up
  let upX = 0, upY = 1, upZ = 0;

  camera(camX, camY, camZ, centerX, centerY, centerZ, upX, upY, upZ);
}


function setupAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = frequencyInput.value();
  oscillator.connect(audioContext.destination);
  oscillator.start(0);
}

function toggleAudio() {
  isPlaying ? stopAudio() : startAudio();
  isPlaying = !isPlaying;
  document.getElementById("play-button").classList.toggle("playing");
}

function startAudio() {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function stopAudio() {
  oscillator.stop();
}

// Additional functions to manipulate audio and camera if needed:
function updateFrequency(value) {
  oscillator.frequency.value = value;
}
