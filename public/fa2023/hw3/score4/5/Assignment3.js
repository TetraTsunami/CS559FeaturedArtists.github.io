// HTML property references
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var text = document.getElementById('text');
var speedSlider = document.getElementById('speedSlider');
var bodyScaleSlider = document.getElementById('bodyScaleSlider');
var numSegmentsSlider = document.getElementById('numSegmentsSlider');
var scoreDisplay = document.getElementById('score');
var restartButton = document.getElementById('restart');

var color = Math.random() * 360; // Choose a random color each time the page refreshes

canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight * 0.95;

// For size calculations
var xCenter = canvas.width / 2;
var yCenter = canvas.height / 2;

// The smaller of the two dimensions
var limiter = canvas.width > canvas.height? yCenter : xCenter;

var gameOn = true;

// Caterpillar info
var dir = 0;
var [xPos, yPos] = [xCenter, yCenter];
var oldTransforms;
var size = 0.1;

// Shooter info
var shooters = [];
var shooterRate = 10;
var shooterSpeed = 10;

// Slider values
var speed = 3;
var bodyScale = 0.97;
var numSegments = 50;
var score = 0;

// "Game Over"
var gameOverText = [
    [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1]
]

// Sets styles for the specified slider
function setSliderStyles(slider) {
    slider.style.background = `hsl(${color}, 50%, 50%)`;
    slider.style.border = `5px solid hsl(${color}, 60%, 25%)`;
    slider.style.height = `${yCenter / 20}px`;
    slider.style.width = `${1.75 * xCenter}px`;
}

//-----------------MATH FUNCTIONS-----------------//

// For simple degree to radian coversions
function toRad(angle) {
    return angle * (Math.PI / 180);
}

function toDeg(angle) {
    return angle * (180 / Math.PI);
}

// Calculates the position from a given starting point, a vector length, and an angle
function calculatePos(x, y, len, angle) {
    return [len * Math.cos(angle) + x, len * Math.sin(angle) + y];
}

// Calculates the angle between two points (0-359)
function calculateAngle(x1, y1, x2, y2) {
    return (toDeg(Math.atan2((y2 - y1), (x2 - x1))) + 360) % 360;
}

// Calculates the distance between two points
function calculateDistance(x1, y1, x2, y2) {
    return (Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
}

// Linear interpolation between two angles; t is the amount between the two, from 0 to 1
function lerpAngle(start, end, t) {
    var deltaAngle = (end - start) % 360;
    // Find the shortest path
    if (360 - deltaAngle < deltaAngle) {
        deltaAngle = 360 - deltaAngle;
        var first = end;
    } else {
        var first = start;
    }

    //var lerp = 2 * deltaAngle % 360 - deltaAngle;
    return (first + (deltaAngle * t) + 360) % 360;
}

//-----------------DRAWING FUNCTIONS-----------------//

// Moves to position
function moveToTx(x, y, Tx) {
    var res = glMatrix.vec2.create(); 
    glMatrix.vec2.transformMat3(res, [x, y], Tx); 
    context.moveTo(res[0], res[1]);
}

// Draws line
function lineToTx(x, y, Tx) {
    var res = glMatrix.vec2.create();
    glMatrix.vec2.transformMat3(res, [x, y], Tx);
    context.lineTo(res[0], res[1]);
}	

// Draws arc
function arcAtTx(x, y, radius, start, end, Tx) {
    var res = glMatrix.vec2.create();
    glMatrix.vec2.transformMat3(res, [x, y], Tx);
    context.arc(res[0], res[1], radius, start, end);
}

// Draws a square
function drawSquare(size, Tx) {
    context.beginPath();
    context.fillStyle = `hsl(${color}, 60%, 25%)`;
    moveToTx(0, 0, Tx);
    lineToTx(size, 0, Tx);
    lineToTx(size, size, Tx);
    lineToTx(0, size, Tx);
    context.closePath();
    context.fill();
}

//-----------------CATERPILLAR-----------------//

// Draws caterpillar head
function drawHead(Tx, scale) {
    // Body
    context.beginPath();
    context.fillStyle = `hsl(${color}, 60%, 25%)`;
    context.lineWidth = limiter / 50;
    context.lineCap = "round";
    context.strokeStyle = `hsl(${color}, 50%, 50%)`;
    arcAtTx(0, 0, scale * limiter * size, 0, 2 * Math.PI, Tx);
    context.stroke();
    context.fill();

    // Eyes
    context.beginPath();
    context.fillStyle = "white";
    arcAtTx(0, limiter * 0.045, scale * limiter * (size / 2), 0, 2 * Math.PI, Tx);
    context.fill();

    context.beginPath();
    context.fillStyle = "white";
    arcAtTx(0, -limiter * 0.045, scale * limiter * (size / 2), 0, 2 * Math.PI, Tx);
    context.fill();

    // Pupils
    context.beginPath();
    context.fillStyle = `hsl(${color}, 50%, 50%)`;
    arcAtTx(limiter * 0.025, limiter * 0.05, scale * limiter * (size / 4), 0, 2 * Math.PI, Tx);
    context.fill();

    context.beginPath();
    context.fillStyle = `hsl(${color}, 50%, 50%)`;
    arcAtTx(limiter * 0.025, -limiter * 0.05, scale * limiter * (size / 4), 0, 2 * Math.PI, Tx);
    context.fill();
}

// Draws caterpillar body
function drawBody(Tx, scale) {
    context.beginPath();
    context.fillStyle = `hsl(${color}, 60%, 25%)`;
    context.lineWidth = limiter / 50;
    context.lineCap = "round";
    context.strokeStyle = `hsl(${color}, 50%, 50%)`;
    arcAtTx(0, 0, scale * limiter * size, 0, 2 * Math.PI, Tx);
    context.stroke();
    context.fill();
}

// Draws caterpillar without updating its position
function drawCaterpillar() {
    // Draw body segments (working backwards for correct layering)
    for (var i = 0; i < numSegments; i++) {
        var bodyPos = glMatrix.mat3.create();
        var invI = numSegments - i - 1;
        glMatrix.mat3.rotate(bodyPos, bodyPos, oldTransforms[invI][2]);
        glMatrix.mat3.fromTranslation(bodyPos, [oldTransforms[invI][0], oldTransforms[invI][1]]);
        drawBody(bodyPos, Math.pow(bodyScale, invI));
    }

    // Draw head
    var headPos = glMatrix.mat3.create();
    glMatrix.mat3.fromTranslation(headPos, [xPos, yPos]);
    glMatrix.mat3.rotate(headPos, headPos, dir);
    drawHead(headPos, 1);
}

// Updates caterpillar position
function moveCaterpillar(event, display) {
    // Calculate new position
    dir = toRad(lerpAngle(toDeg(dir), calculateAngle(xPos, yPos, event.clientX, event.clientY), 0.5));
    [xPos, yPos] = calculatePos(xPos, yPos, 3, dir);

    if (display) {
        // Draw body segments (working backwards for correct layering)
        for (var i = 0; i < numSegments; i++) {
            var bodyPos = glMatrix.mat3.create();
            var invI = numSegments - i - 1;
            glMatrix.mat3.rotate(bodyPos, bodyPos, oldTransforms[invI][2]);
            glMatrix.mat3.fromTranslation(bodyPos, [oldTransforms[invI][0], oldTransforms[invI][1]]);
            drawBody(bodyPos, Math.pow(bodyScale, invI));
        }

        // Draw head
        var headPos = glMatrix.mat3.create();
        glMatrix.mat3.fromTranslation(headPos, [xPos, yPos]);
        glMatrix.mat3.rotate(headPos, headPos, dir);
        drawHead(headPos, 1);
    }

    // Shift all old directions over and add the newest direction
    for (var i = 0; i < numSegments; i++) {
        oldTransforms[numSegments - i - 1] = oldTransforms[numSegments - i - 2];
    }
    oldTransforms[0] = [xPos, yPos, dir];
}

//-----------------SHOOTERS-----------------//

// Draws shooter to the screen
function drawShooter(Tx) {
    context.beginPath();
    context.fillStyle = `hsl(${color}, 60%, 25%)`;
    context.lineWidth = limiter / 40;
    context.lineCap = "round";
    context.strokeStyle = `hsl(${color}, 50%, 50%)`;
    arcAtTx(0, 0, 0.25 * limiter * size, 0, 2 * Math.PI, Tx);
    context.stroke();
    context.fill();
}

// Creates a shooter at a random position at the edge of the screen and sends it moving in the direction of the caterpillar
function createShooter() {
    var shootXPos;
    var shootYPos;
    var shootDir;

    // Picks random position on the edge of the screen
    if (Math.floor(Math.random() * 2) == 0) {
        shootXPos = Math.random() * canvas.width;
        if (Math.floor(Math.random() * 2) == 0) {
            shootYPos = canvas.height;
        } else {
            shootYPos = -canvas.height;
        }
    } else {
        shootYPos = Math.random() * canvas.height;
        if (Math.floor(Math.random() * 2) == 0) {
            shootXPos = canvas.width;
        } else {
            shootXPos = -canvas.width;
        }
    }

    shootDir = toRad(calculateAngle(shootXPos, shootYPos, xPos, yPos));
    shooters.push([shootXPos, shootYPos, shootDir]);
}

// Updates shooter positions
function moveShooters() {
    for (var i = 0; i < shooters.length; i++) {
        var [newX, newY] = calculatePos(shooters[i][0], shooters[i][1], shooterSpeed, shooters[i][2]);

        // If the shooter is off screen, remove it
        if (Math.abs(newX) > canvas.width + 20 || Math.abs(newY) > canvas.height + 20) {
            shooters.splice(i, 1);
            return;
        }

        shooters[i][0] = newX;
        shooters[i][1] = newY;
        var shooterPos = glMatrix.mat3.create();
        glMatrix.mat3.fromTranslation(shooterPos, [newX, newY]);
        drawShooter(shooterPos);
    }
}

//-----------------OTHER-----------------//

// Checks for any collisions between the caterpillar and the shooters
function checkCollisions() {
    if (shooters.length == 0) {
        return;
    }

    // Find closest shooter
    var minDistance = canvas.width > canvas.height? canvas.width * 10 : canvas.height * 10; // Some large number
    var minNum;
    for (var i = 0; i < shooters.length; i++) {
        var distance = calculateDistance(shooters[i][0], shooters[i][1], xPos, yPos);
        if (distance < minDistance) {
            minDistance = distance;
            minNum = i;
        }
    }

    for (var i = 0; i < oldTransforms.length; i++) {
        var distance = calculateDistance(oldTransforms[i][0], oldTransforms[i][1], shooters[minNum][0], shooters[minNum][1]);
        // The radius of the caterpillar head + the shooter radius; if the distance is smaller than this, then they must be overlapping
        var overlap = limiter * size * 1.25 * Math.pow(bodyScale, i)
        if (distance < overlap) {
            gameOver();
        }
    }    
}

// Converts a 0, 1 matrix into pixel text (0 is off, 1 is on)
function drawWords(x, y, size, text) {
    for (var i = 0; i < text.length; i++) {
        for (var j = 0; j < text[i].length; j++) {
            if (text[i][j] == 1) {
                var square = glMatrix.mat3.create();
                glMatrix.mat3.fromTranslation(square, [x + size * j, y + size * i]);
                drawSquare(size, square);
            }
        }
    }
}

//-----------------GAME INFO-----------------//

// Game ends
function gameOver() {
    gameOn = false;
    var wordSize = 10
    // Write "Game Over" on the screen
    drawWords(xCenter - (wordSize * gameOverText[0].length) / 2, yCenter - (wordSize * gameOverText.length) / 2, wordSize, gameOverText);
}

// Runs any time the player's mouse moves
function gameLoop(event) {
    canvas.width = canvas.width;

    if (!gameOn) {
        gameOver();
        return;
    }

    score++;
    scoreDisplay.innerHTML = `Score: ${Math.floor(score / 200)}`;

    // Update slider values
    speed = speedSlider.value;
    bodyScale = bodyScaleSlider.value / 100;
    numSegments = numSegmentsSlider.value;

    // Resize list if needed
    if (oldTransforms.length != numSegments) {
        var tempTransforms = new Array(numSegments);
        for (var j = 0; j < numSegments; j++) {
            if (j < oldTransforms.length) {
                tempTransforms[j] = oldTransforms[j];
            } else {
                tempTransforms[j] = new Array(3);
            }
        }
        oldTransforms = tempTransforms;
    }

    // Difficulty increases over time
    shooterRate = Math.round(100 * Math.pow(0.9, Math.floor(score / 500)));

    // Update shooters
    if (Math.floor(Math.random() * shooterRate) == 0) {
        createShooter();
    }
    moveShooters();

    // Don't bother moving if the caterpillar is close to the mouse
    if (calculateDistance(xPos, yPos, event.clientX, event.clientY) > 50) {
        for (var j = 0; j < speed; j++) {
            moveCaterpillar(event, false);
        }
        moveCaterpillar(event, true);
    } else {
        drawCaterpillar();
    }

    checkCollisions();
}

// Reset the game (keeps slider values)
function restart() {
    canvas.width = canvas.width;
    gameOn = true;

    // Caterpillar info
    dir = 0;
    [xPos, yPos] = [xCenter, yCenter];
    oldTransforms;
    size = 0.1;

    // Shooter info
    shooters = [];
    shooterRate = 10;

    // Slider values
    speed = speedSlider.value;
    bodyScale = bodyScaleSlider.value / 100;
    numSegments = numSegmentsSlider.value;

    score = 0;
    setup();
    drawCaterpillar();
    createShooter();
}

function setup() { "use strict";
    // Set styles
    canvas.style.background = "hsl(133, 40%, 40%)";
    canvas.style.border = `5px solid hsl(${color}, 60%, 25%)`;

    text.style.color = `hsl(${color}, 60%, 25%)`;
    text.style.backgroundColor = `hsl(${color}, 50%, 50%)`;
    text.style.border = `5px solid hsl(${color}, 60%, 25%)`;
    text.style.fontSize = `${limiter / 20}px`;
    text.style.margin = `-18px 0 0 0`;
    //text.style.width = `${2 * xCenter}px`;

    scoreDisplay.style.fontSize = `${limiter / 12}px`;

    setSliderStyles(speedSlider);
    setSliderStyles(bodyScaleSlider);
    setSliderStyles(numSegmentsSlider);

    restartButton.style.color = `hsl(${color}, 60%, 25%)`;
    restartButton.style.background = `hsl(${color}, 50%, 50%)`;
    restartButton.style.border = `5px solid hsl(${color}, 60%, 25%)`;
    restartButton.style.fontSize = `${limiter / 20}px`;
    restartButton.style.padding = `${limiter / 20}px ${limiter / 10}px`;
    restartButton.style.margin = `${limiter / 20}px`;

    speedSlider.value = speed;
    bodyScaleSlider.value = bodyScale * 100;
    numSegmentsSlider.value = numSegments;

    // Keeps track of previous positions
    oldTransforms = new Array(numSegments);
    for (var i = 0; i < numSegments; i++) {
        oldTransforms[i] = new Array(3);
    }

    var headPos = glMatrix.mat3.create();
    glMatrix.mat3.fromTranslation(headPos, [xCenter, yCenter]);
    drawHead(headPos, 1);
}

function startUp() {
    // Event listeners
    addEventListener("mousemove", (event) => {gameLoop(event)});
    setup();
    createShooter();
}

window.onload = startUp;