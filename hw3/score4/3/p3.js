var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var showCircles = document.getElementById("circleVisibility");
var showSticks = document.getElementById("stickVisibility");
var backgroundVisibility = document.getElementById("background");
var shadingMode = document.getElementById("shadeMode");
var speedShade = document.getElementById("speed");
var circleSlider = document.getElementById("scale");
var redSlider = document.getElementById("sliderR");
var greenSlider = document.getElementById("sliderG");
var blueSlider = document.getElementById("sliderB");
var lightSlider = document.getElementById("sliderLight");
var fpsText = document.getElementById("fps");
var simulationStats = document.getElementById("sim");
var garfield = new Image();
let timeDelta = 0;
let timeLast = 0;
let radius = 5;
let mouseX = 0;
let mouseY = 0;
let backgroundColor = "white";

const HEIGHT = canvas.height;
const WIDTH = canvas.width;
const QUALITY = 3;
const numCols = Math.ceil(WIDTH / (3 * radius));
const numRows = Math.ceil(HEIGHT / (3 * radius));
garfield.src = "garfunkel.jpeg";

let circles = []
let sticks = []
showCircles.checked = false;
speedShade.checked = false;
stickVisibility.checked = true;
backgroundVisibility.checked = true;
shadeMode.checked = false;
blueSlider.value = 255;
lightSlider.value = 2500;
circleSlider.value = 0.7;

//Simulation variables
let gravity = 0.5;
let friction = 0.999;

context.lineWidth = 5;

function moveToTx(x,y,Tx)
{var res=vec2.create(); vec2.transformMat3(res,[x,y],Tx); context.moveTo(res[0],res[1]);}

function lineToTx(x,y,Tx)
{var res=vec2.create(); vec2.transformMat3(res,[x,y],Tx); context.lineTo(res[0],res[1]);}

function arcTx(x, y, radius, theta0, theta1, Tx){
    let vec = vec2.create();
    vec2.transformMat3(vec, [x,y], Tx);
    context.arc(vec[0], vec[1], radius, theta0, theta1);
}

function getNeighbors(r, c, num_rows, num_columns){
    let index = r * num_columns + c
    let neighbors = []

    if(r > 0)
        neighbors.push(circles[index - num_columns])  // Top Neighbor
    if(r < num_rows - 1)
        neighbors.push(circles[index + num_columns])  // Bottom Neighbor
    if(c > 0)
        neighbors.push(circles[index - 1])  // Left Neighbor
    if(c < num_columns - 1)
        neighbors.push(circles[index + 1])  // Right Neighbor
    
    return neighbors
}

function track(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
}


//This wikipedia page is really good
//https://en.wikipedia.org/wiki/Verlet_integration

class Circle {
    constructor(x, y, r, color, pinned, row, col){
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.r = r;
        this.color = color;
        this.pinned = pinned;
        this.row = row;
        this.col = col;
    }

    draw(){
        context.strokeStyle = this.pinned ? "black" : `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
        context.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`
        
        let mat = mat3.create();
        mat3.fromTranslation(mat, [this.x, this.y]);
        mat3.scale(mat, mat, [circleSlider.value, circleSlider.value]);
    
        context.beginPath();
        arcTx(0, 0, this.r * circleSlider.value, 0, 2 * Math.PI, mat);
        context.stroke();
        context.fill();
    }

    update(){
        if(this.pinned)
            return;
        let vx = (this.x - this.oldX) * friction;
        let vy = (this.y - this.oldY) * friction;
        this.oldX = this.x;
        this.oldY = this.y;
        this.x += vx;
        this.y += vy;
        this.y += gravity;
    }

    constrain(){
        if(this.pinned)
            return;
        let vx = (this.x - this.oldX) * friction;
        let vy = (this.y - this.oldY) * friction;

        if(this.x > WIDTH){
            this.x = WIDTH;
            this.oldX = this.x + vx;
        }
        else if(this.x < 0){
            this.x = 0;
            this.oldX = this.x + vx;
        }
        else if(this.y > HEIGHT){
            this.y = HEIGHT;
            this.oldY = this.y + vy;
        }
        else if(this.y < 0){
            this.y = 0;
            this.oldY = this.y + vy;
        }
    }
}

class Stick {
    constructor(p0, p1){
        this.p0 = p0;
        this.p1 = p1;
        let dx = this.p1.x - this.p0.x;
        let dy = this.p1.y - this.p0.y;
        this.l = Math.sqrt(dx * dx + dy * dy);
    }

    draw(){
        context.strokeStyle = "black";
        let dx = this.p1.x - this.p0.x;
        let dy = this.p1.y - this.p0.y;
        let theta = Math.atan2(dy, dx);
        let mat = mat3.create();

        context.beginPath();
        mat3.fromTranslation(mat, [this.p0.x, this.p0.y]);
        mat3.rotate(mat, mat, theta);
        moveToTx(0, 0, mat);
        lineToTx(this.l, 0, mat);
        context.stroke();
    }

    update(){
        let dx = this.p1.x - this.p0.x;
        let dy = this.p1.y - this.p0.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let diff = this.l - distance;
        let percent = diff / distance / 2;
        let offsetX = dx * percent;
        let offsetY = dy * percent;

        if(!this.p0.pinned){
            this.p0.x -= offsetX
            this.p0.y -= offsetY;
        }
        if(!this.p1.pinned){
            this.p1.x += offsetX;
            this.p1.y += offsetY;
        }
    }
}


function setup(){
    circles = [];
    sticks = [];

    // Calculate the horizontal and vertical spacing between circles
    const horizontalSpacing = WIDTH / numCols;
    const verticalSpacing = HEIGHT / numRows;
    
    for (let i = 0; i < numRows - 3; i++) {
        for (let j = 0; j < numCols; j++) {
            const x = j * horizontalSpacing + radius;
            const y = i * verticalSpacing + radius;
            
            let circle = new Circle(x, y, radius, i == 0 ? [0,0,255] : [255, 0, 0], i == 0, i, j);
            circles.push(circle)
    
            // Connect to neighbors (up, down, left, right)
            if (i > 0) {
                const upStick = new Stick(circle, circles[(i - 1) * numCols + j]);
                sticks.push(upStick);
            }
            if (j > 0) {
                const leftStick = new Stick(circle, circles[i * numCols + (j - 1)]);
                sticks.push(leftStick);
            }
        }
    }
}

function blow(){
    if(mouseX < 0 || mouseX > WIDTH || mouseY < 0 || mouseY > HEIGHT){
        return;
    }

    let maxDistance = 500;

    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];
        let dx = mouseX - circle.x; // Calculate the horizontal distance
        let dy = mouseY - circle.y; // Calculate the vertical distance
        let distance = Math.sqrt(dx * dx + dy * dy); // Calculate the Euclidean distance
    
        if (distance < maxDistance && !circle.pinned) {
            circle.x += 1;
            circle.y += 1;
        }
    }
}

function snip(){
    if(mouseX < 0 || mouseX > WIDTH || mouseY < 0 || mouseY > HEIGHT){
        return;
    }

    let closestStickIndex = -1; // Initialize with an invalid index
    let closestDistance = Infinity;

    for (let i = 0; i < sticks.length; i++) {
        let stick = sticks[i];
        let dx = mouseX - (stick.p1.x + stick.p0.x) / 2; // Calculate the horizontal distance
        let dy = mouseY - (stick.p1.y + stick.p0.y) / 2; // Calculate the vertical distance
        let distance = Math.sqrt(dx * dx + dy * dy); // Calculate the Euclidean distance
    
        if (distance < closestDistance) {
            closestDistance = distance;
            closestStickIndex = i;
        }
    }
    
    if (closestStickIndex !== -1) {
        sticks.splice(closestStickIndex, 1); // Remove the closest stick from the array
    }
}

function unfreeze(){
    if(mouseX < 0 || mouseX > WIDTH || mouseY < 0 || mouseY > HEIGHT){
        return;
    }

    let closestCircleIndex = -1; // Initialize with an invalid index
    let closestDistance = Infinity;

    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];
        let dx = mouseX - circle.x; // Calculate the horizontal distance
        let dy = mouseY - circle.y; // Calculate the vertical distance
        let distance = Math.sqrt(dx * dx + dy * dy); // Calculate the Euclidean distance
    
        if (distance < closestDistance) {
            closestDistance = distance;
            closestCircleIndex = i;
        }
    }

    if (closestCircleIndex !== -1) {
        circles[closestCircleIndex].pinned = !circles[closestCircleIndex].pinned;
    }
}


function draw(elapsedTime){
    timeDelta = elapsedTime - timeLast;
    timeLast = elapsedTime;
    canvas.width = canvas.width;
    if(backgroundVisibility.checked)
        context.drawImage(garfield, 0, 0, WIDTH, HEIGHT)
    
    let calculations = 0;
    let max_speed = 0;

    for(let circle of circles){
        circle.update();
        let vx = circle.x - circle.oldX;
        let vy = circle.y - circle.oldY;
        max_speed = Math.max(max_speed, Math.sqrt(vx*vx + vy*vy));
        calculations++;
    }

    for(let i = 0; i < QUALITY; i++){
        for(let stick of sticks){
            stick.update();
            calculations++;
        }

        for(let circle of circles){
            circle.constrain();
            calculations++;
        }
    }

    //Draw cloth
    for(let circle of circles){
        let neighbors = getNeighbors(circle.row, circle.col, numRows, numCols);
        //Check if the neighbors are within a close enough distance to draw a cloth.
        context.beginPath();
        let mat = mat3.create();
        let connect = 0;
        let cloth = vec2.create();
        let temp = vec2.create();
        let light = vec2.fromValues(mouseX, mouseY);
        let color = null;
        let clothX = circle.x;
        let clothY = circle.y;
        for(let n of neighbors){
            if(n != null){
                let dx = circle.x - n.x;
                let dy = circle.y - n.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < 45){
                    lineToTx(n.x, n.y, mat);
                    connect++;
                }
                clothX += n.x;
                clothY += n.y;
            }
            calculations++;
        }   
        
        clothX /= (1 + neighbors.length);
        clothY /= (1 + neighbors.length);
        cloth = vec2.fromValues(clothX, clothY); //Cloth position, roughly.
        vec2.subtract(temp, cloth, light);
        const angle = Math.atan2(temp[1], temp[0]);

        if(!shadeMode.checked && speedShade.checked){
            let vx = circle.x - circle.oldX;
            let vy = circle.y - circle.oldY;
            const hue = (Math.sqrt(vx*vx + vy*vy) / max_speed);
            color = `hsl(${hue * 360}, 100%, 50%)`; // Convert hue to an HSL color
        }
        else if(!shadeMode.checked){
            const distance = Math.sqrt(Math.pow(temp[0], 2) + Math.pow(temp[1], 2));
            const brightness = (distance/lightSlider.value) * 100;
            color = `rgb(${redSlider.value - brightness * 2.55}, ${greenSlider.value - brightness * 2.55}, ${blueSlider.value - brightness * 2.55})`;
        }
        else if(shadeMode.checked && !speedShade.checked){
            const hue = (angle + Math.PI) / (2 * Math.PI); // Normalize angle to [0, 1]
            color = `hsl(${hue * 360}, 100%, 50%)`; // Convert hue to an HSL color
        }
        
        
        context.fillStyle = color;
        context.strokeStyle = color;

        context.closePath();
        context.stroke();
        context.fill();
        calculations++;
    }

    if(stickVisibility.checked){
        for(let stick of sticks){
            stick.draw();
        }
    }

    if(showCircles.checked){
        for(let circle of circles){
            circle.draw();
        }
    }

    fpsText.textContent = `FPS: ${Math.round(1000/timeDelta)}`;
    simulationStats.textContent = `Circles: ${circles.length}\nSticks: ${sticks.length}\nTotal Calculations: ${calculations}`
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

//Copied from https://stackoverflow.com/questions/7790725/javascript-track-mouse-position
function track(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
}

addEventListener("mousemove", track, false);
addEventListener('click', blow, false);

document.body.addEventListener("keydown", (event) => {
    if(event.key == 'c'){
        snip();
    }
    if(event.key == 'b'){
        blow();
    }
    else if(event.key == 'r'){
        setup();
    }
    else if(event.key == 'f'){
        unfreeze();
    }
});

window.onload = setup;
addEventListener("mousemove", track, false);