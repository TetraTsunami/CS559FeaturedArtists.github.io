var canvasElement = document.getElementById("animationCanvas");
var canvasContext = canvasElement.getContext("2d");

var groundHeight = 20;
var roadWidth = canvasElement.width;
var roadPositionY = canvasElement.height / 1.5;
var roadThickness = 20;

var vehicleWidth = 104;
var vehicleHeight = 20;
var wheelRadius = 15;

var cloudDiameter = 20;
let cloudPositionX1 = 50;
let cloudPositionX2 = 100;
let cloudPositionX3 = 150;
var cloudPositionY = 50;
var cloudMovementSpeed = 0.75;

let vehiclePositionX = -vehicleWidth;
let wheelRotationAngle = 0;
let vehicleMovementSpeed = 1;

function renderGround() {
  canvasContext.fillStyle = "#00a70a";
  canvasContext.fillRect(
    0,
    roadPositionY,
    canvasElement.width,
    canvasElement.height - roadPositionY
  );
}

function renderRoad() {
  canvasContext.fillStyle = "#666666";
  canvasContext.fillRect(0, roadPositionY, roadWidth, roadThickness);
}

function renderVehicle() {
  canvasContext.fillStyle = "black";
  canvasContext.fillRect(
    vehiclePositionX,
    roadPositionY - vehicleHeight,
    vehicleWidth * 1.5,
    vehicleHeight
  );

  canvasContext.beginPath();
  canvasContext.moveTo(
    vehiclePositionX + vehicleWidth * 0.25,
    roadPositionY - vehicleHeight
  );
  canvasContext.lineTo(
    vehiclePositionX + vehicleWidth * 1.25,
    roadPositionY - vehicleHeight
  );
  canvasContext.lineTo(
    vehiclePositionX + vehicleWidth,
    roadPositionY - vehicleHeight - 40
  );
  canvasContext.lineTo(
    vehiclePositionX + vehicleWidth * 0.5,
    roadPositionY - vehicleHeight - 40
  );
  canvasContext.closePath();
  canvasContext.fill();

  canvasContext.fillStyle = "darkgray";
  let doorX = vehiclePositionX + vehicleWidth * 0.6;
  let doorY = roadPositionY - vehicleHeight;
  let doorWidth = vehicleWidth * 0.4;
  let doorHeight = vehicleHeight;
  canvasContext.fillRect(doorX, doorY, doorWidth, doorHeight);

  canvasContext.fillStyle = "gray";
  let handleWidth = 10;
  let handleHeight = 4;
  let handleX = doorX + doorWidth / 2 - handleWidth / 2;
  let handleY = doorY + doorHeight / 2 - handleHeight / 2;
  canvasContext.fillRect(handleX, handleY, handleWidth, handleHeight);

  for (let i = 0; i < 2; i++) {
    canvasContext.save();
    var wheelPositionX = vehiclePositionX + vehicleWidth / 4 + i * vehicleWidth;
    canvasContext.translate(wheelPositionX, roadPositionY);
    canvasContext.rotate(wheelRotationAngle);

    var wheelGradient = canvasContext.createLinearGradient(
      wheelRadius,
      0,
      -wheelRadius,
      0
    );
    wheelGradient.addColorStop(0, "gray");
    wheelGradient.addColorStop(1, "white");

    canvasContext.fillStyle = wheelGradient;
    canvasContext.beginPath();
    canvasContext.arc(0, 0, wheelRadius, 0, Math.PI * 2);
    canvasContext.fill();

    canvasContext.restore();
  }
}

function renderCloud(x, y) {
  canvasContext.globalAlpha = 0.75;
  canvasContext.fillStyle = "#d5d6d6";
  canvasContext.beginPath();
  canvasContext.arc(x, y, cloudDiameter, 0, Math.PI * 2);
  canvasContext.arc(
    x - cloudDiameter / 2,
    y - cloudDiameter / 2,
    cloudDiameter,
    0,
    Math.PI * 2
  );
  canvasContext.arc(
    x + cloudDiameter / 2,
    y - cloudDiameter / 2,
    cloudDiameter,
    0,
    Math.PI * 2
  );
  canvasContext.fill();
  canvasContext.globalAlpha = 1.0;
}

function renderSun() {
  canvasContext.fillStyle = "yellow";
  canvasContext.beginPath();
  canvasContext.arc(50, 50, 40, 0, Math.PI * 2);
  canvasContext.fill();
}

var windmillBaseWidth = 10;
var windmillHeight = 100;
var windmillBladeLength = 50;
var windmillBladeWidth = 7;
var windmillPositionX1 = canvasElement.width / 4;
var windmillPositionX2 = (canvasElement.width * 3) / 4;
var windmillPositionY = canvasElement.height - groundHeight;

let bladeRotationAngle1 = 0;
let bladeRotationAngle2 = Math.PI;
var bladeRotationSpeed = 0.003;

function renderWindmill(x, y) {
  canvasContext.fillStyle = "white";
  canvasContext.fillRect(
    x - windmillBaseWidth / 2,
    y - windmillHeight - 80,
    windmillBaseWidth,
    windmillHeight
  );

  canvasContext.fillStyle = "white";
  for (let i = 0; i < 4; i++) {
    canvasContext.save();
    canvasContext.translate(x, y - windmillHeight - 80);
    canvasContext.rotate(
      (i * Math.PI) / 2 +
        (i % 2 === 0 ? bladeRotationAngle1 : bladeRotationAngle2)
    );
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(0, -windmillBladeLength);
    canvasContext.lineTo(windmillBladeWidth, -windmillBladeLength / 2);
    canvasContext.lineTo(0, 0);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.restore();
  }
}

function animateScene() {
  canvasContext.fillStyle = "#85faf9";
  canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);

  renderGround();
  renderRoad();
  renderSun();
  renderVehicle();
  renderCloud(cloudPositionX1, cloudPositionY);
  renderCloud(cloudPositionX2 - 5, cloudPositionY - 3);
  renderCloud(cloudPositionX3 - 5, cloudPositionY);

  renderWindmill(windmillPositionX1, windmillPositionY);
  renderWindmill(windmillPositionX2, windmillPositionY);

  vehiclePositionX += vehicleMovementSpeed;

  cloudPositionX1 -= cloudMovementSpeed;
  cloudPositionX2 -= cloudMovementSpeed;
  cloudPositionX3 -= cloudMovementSpeed;

  if (vehiclePositionX > canvasElement.width) {
    vehiclePositionX = -vehicleWidth;
  }

  if (cloudPositionX1 + cloudDiameter < 0) {
    cloudPositionX1 = canvasElement.width;
  }
  if (cloudPositionX2 + cloudDiameter < 0) {
    cloudPositionX2 = canvasElement.width;
  }
  if (cloudPositionX3 + cloudDiameter < 0) {
    cloudPositionX3 = canvasElement.width;
  }

  wheelRotationAngle += 0.1;

  bladeRotationAngle1 += bladeRotationSpeed;
  bladeRotationAngle2 += bladeRotationSpeed;

  if (bladeRotationAngle1 >= Math.PI * 2) {
    bladeRotationAngle1 -= Math.PI * 2;
  }
  if (bladeRotationAngle2 >= Math.PI * 2) {
    bladeRotationAngle2 -= Math.PI * 2;
  }

  requestAnimationFrame(animateScene);
}

animateScene();
