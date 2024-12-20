var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var showCircles = document.getElementById("circleVisibility");
var circleSlider = document.getElementById("scale");
let timeDelta = 0;
let timeLast = 0;
let radius = 7;
const HEIGHT = canvas.height;
const WIDTH = canvas.width;
const QUALITY = 3;

let circles = []
let sticks = []
showCircles.checked = true;
circleSlider.value = 0.7;

//Simulation variables
let gravity = 0.5;
let friction = 0.999;

context.lineWidth = 5;

//This wikipedia page is really good
//https://en.wikipedia.org/wiki/Verlet_integration

class Circle {
    constructor(x, y, r, color, pinned){
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.r = r;
        this.color = color
        this.pinned = pinned
    }

    draw(){
        context.strokeStyle = this.pinned ? "black" : `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
        context.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`
        
        context.save();
        context.translate(this.x, this.y)
        context.scale(circleSlider.value, circleSlider.value);
        context.beginPath();
        context.arc(0, 0, this.r, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
        context.restore();
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
        context.save();
        context.translate(this.p0.x, this.p0.y);
        context.rotate(theta);
        context.moveTo(0, 0);
        context.lineTo(this.l, 0);
        context.restore();
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

    const numCols = Math.ceil(WIDTH / (3 * radius));
    const numRows = Math.ceil(HEIGHT / (3 * radius));
    
    // Calculate the horizontal and vertical spacing between circles
    const horizontalSpacing = WIDTH / numCols;
    const verticalSpacing = HEIGHT / numRows;
    
    for (let i = 0; i < numRows - 3; i++) {
        for (let j = 0; j < numCols; j++) {
            const x = j * horizontalSpacing + radius;
            const y = i * verticalSpacing + radius;
            
            let circle = new Circle(x, y, radius, i == 0 ? [0,0,255] : [255, 0, 0], i == 0);
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

    for(let circle of circles){
        circle.update();
    }

    for(let i = 0; i < QUALITY; i++){
        for(let stick of sticks){
            stick.update();
        }

        for(let circle of circles){
            circle.constrain();
        }
    }

    for(let stick of sticks){
        stick.draw();
    }

    if(showCircles.checked){
        for(let circle of circles){
            circle.draw();
        }
    }

    
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

//Copied from https://stackoverflow.com/questions/7790725/javascript-track-mouse-position
function track(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
}

addEventListener("mousemove", track, false);
addEventListener('click', snip, false);

document.body.addEventListener("keydown", (event) => {
    if(event.key == 'c'){
        snip();
    }
    else if(event.key == 'r'){
        setup();
    }
    else if(event.key == 'f'){
        unfreeze();
    }
});

window.onload = setup;