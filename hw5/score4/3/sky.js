// This work is based on my assignment 3 submission. However, more exciting features comes with this one.
// You can rotate by moving your mouse and I made 3 diffrent shapes.  Also a large star move along 
"use strict";

var canv = document.getElementById('canvas');
var mainCtx = canv.getContext('2d');
canv.width = window.innerWidth;
canv.height = window.innerHeight;

var cameraDistance = 500;

var currentShape = 0;
var colorHue = 217;
var allStars = [];
var totalStars = 500;
var canv2 = document.createElement('canvas');
var subCtx = canv2.getContext('2d');
canv2.width = 100;
canv2.height = 100;

var centerOfGradient=canv2.width/2;
var gradient = subCtx.createRadialGradient(centerOfGradient, centerOfGradient, 0, centerOfGradient, centerOfGradient, 50);
gradient.addColorStop(0.025,'#fff');
gradient.addColorStop(0.1,'hsl('+colorHue+',61%,33%)');
gradient.addColorStop(0.25,'hsl('+colorHue+',64%,6%)');
gradient.addColorStop(1,'transparent');
subCtx.fillStyle=gradient;
subCtx.beginPath();
subCtx.arc(centerOfGradient,centerOfGradient,50,0,Math.PI*2);
subCtx.fill();
var canv3=document.createElement('canvas');
var subCtx2=canv3.getContext('2d');
canv3.width=350;
canv3.height=350;

var centerOfGradient2 = canv3.width/2;
var gradient2 = subCtx2.createRadialGradient(centerOfGradient2, centerOfGradient2, 0, centerOfGradient2, centerOfGradient2, 75);
gradient.addColorStop(0.025,'#000');
gradient.addColorStop(0.9, 'hsl('+colorHue+',61%,33%)');
gradient.addColorStop(0.25,'hsl('+colorHue+',4%,26%)');
gradient.addColorStop(1,'transparent');
subCtx2.fillStyle =gradient2;
subCtx2.beginPath();
subCtx2.arc(centerOfGradient2,centerOfGradient2, 75, 0, Math.PI*2);
subCtx2.fill();



var cameraRotationX =0;
var cameraRotationY =0;
var isDragging = false;
var lastMouseX, lastMouseY;

canv.addEventListener('mousedown',function(e){
isDragging=true;
lastMouseX=e.clientX;
    lastMouseY=e.clientY;
});

canv.addEventListener('mousemove',function(e){
    if (isDragging) {
        var deltaX =e.clientX-lastMouseX;
        var deltaY =e.clientY-lastMouseY;

        cameraRotationY +=deltaX*0.005;
        cameraRotationX +=deltaY*0.005;

        lastMouseX =e.clientX;
        lastMouseY =e.clientY;
    }
});

canv.addEventListener('mouseup',function(){
    isDragging = false;
});

canv.addEventListener('wheel',function(e){
    if (e.deltaY > 0) {
        cameraDistance +=20;
    } else {
        cameraDistance-=20;
    }
    cameraDistance = Math.max(100,cameraDistance);
    cameraDistance = Math.min(1000,cameraDistance);

    e.preventDefault();
});


function getRandomValue(min,max){
    if (!max){
        max =min;
        min=0;
    }
    return Math.floor(Math.random() * (max -min+1))+min;
}

function computeShape(t){
    if (currentShape === 0){
        var A =150;
        var B= 150;
        var a = 3;
        var b = 2;
    var delta=Math.PI / 2;

        var x = A * Math.sin(a*t+delta);
        var y = B * Math.sin(b*t);
        var z = 100 *Math.sin(4.0*Math.PI*t);
        return vec3.fromValues(x,y,z);
    } else if (currentShape===1){
        var r = 150*t;
        var x = 3*Math.cos(t);
        var y = r*Math.sin(t);
        var z = 100 * Math.sin(4.0*Math.PI*t);
        return vec3.fromValues(x,y,z);
    } else if (currentShape ===2){
        var x = 150 *Math.cos(t);
        var y = 150 *Math.sin(t);
        var z = 100 *Math.sin(4.0*Math.PI*t);
        return vec3.fromValues(x,y,z);
    }
}

function BigStar(tStart){
    this.pos = computeShape(tStart);
    this.rad =100;
    this.spd = 0.005;
    this.alphaVal = 1 ; 
    this.t =tStart;
}

BigStar.prototype.move=function(){
    this.t += this.spd;
    this.pos = computeShape(this.t);
}

BigStar.prototype.renderStar=function(){
    var perspectiveMatrix=mat4.create();
    mat4.perspective(perspectiveMatrix, Math.PI/4,canv.width/canv.height,0.1,1000);

    var viewMatrix =mat4.create();
    mat4.identity(viewMatrix);
    mat4.translate(viewMatrix,viewMatrix,[0,0,-cameraDistance]);
    mat4.rotateX(viewMatrix,viewMatrix,cameraRotationX);
    mat4.rotateY(viewMatrix,viewMatrix,cameraRotationY);

    var finalMatrix =mat4.create();
    mat4.multiply(finalMatrix,perspectiveMatrix,viewMatrix);

    var projected = vec4.create();
    vec4.transformMat4(projected,vec4.fromValues(this.pos[0], this.pos[1], this.pos[2], 1), finalMatrix);
    var scaleFactor =500/(this.pos[2]+500);
    var posX = projected[0]*scaleFactor+canv.width/2;
    var posY = projected[1]*scaleFactor+canv.height / 2;
    var radSize = this.rad * scaleFactor;
    mainCtx.globalAlpha = this.alphaVal;
    mainCtx.drawImage(canv2,posX -radSize/2,posY-radSize/2,radSize,radSize);
    mainCtx.drawImage(canv3,posX -radSize/2,posY-radSize/2,radSize, radSize);
}

function Star(tStart){
    this.pos = computeShape(tStart);
    this.rad = getRandomValue(40,50);
    this.spd = getRandomValue(0.001,0.005);
    this.alphaVal =getRandomValue(2,10)/10;
    this.orbitingStar ={
        rad: getRandomValue(30,40),
        alphaVal: getRandomValue(5,10)/10,
    angle: Math.random() *Math.PI*2
    };

    allStars.push(this);
}

Star.prototype.renderStar = function(){
    this.pos[2];
    var perspectiveMatrix =mat4.create();
    mat4.perspective(perspectiveMatrix,Math.PI/4, canv.width/canv.height,0.1,1000);

    var viewMatrix =mat4.create();
    mat4.identity(viewMatrix);
    mat4.translate(viewMatrix,viewMatrix, [0,0,-cameraDistance]);
    mat4.rotateX(viewMatrix,viewMatrix,cameraRotationX);
    mat4.rotateY(viewMatrix,viewMatrix,cameraRotationY);
    

    var finalMatrix =mat4.create();
    mat4.multiply(finalMatrix,perspectiveMatrix,viewMatrix);

    var projected = vec4.create();
    vec4.transformMat4(projected, vec4.fromValues(this.pos[0],this.pos[1], this.pos[2],1),finalMatrix);
    var scaleFactor = 500/(this.pos[2]+500);
    var posX = projected[0]*scaleFactor+canv.width/2;
    var posY = projected[1]*scaleFactor+canv.height/2;
    var radSize = this.rad *scaleFactor;
    mainCtx.globalAlpha =this.alphaVal;
    mainCtx.drawImage(canv2,posX-radSize/2,posY-radSize/2,radSize,radSize);
    if (currentShape === 1) {
        var orbitingStarX = posX+70*Math.cos(this.orbitingStar.angle);
        var orbitingStarY = posY +70*Math.sin(this.orbitingStar.angle);
        var orbitingStarRadSize =this.orbitingStar.rad*scaleFactor;
        mainCtx.globalAlpha = this.orbitingStar.alphaVal
        ;

        mainCtx.drawImage(canv2, orbitingStarX-orbitingStarRadSize/2,orbitingStarY-orbitingStarRadSize /2,orbitingStarRadSize,orbitingStarRadSize);
        this.orbitingStar.angle += 0.02;
    }
}
for (var i = 0; i < totalStars; i++){
    new Star(i *0.02);
}
var bigStar = new BigStar(0);

function drawScene() {
    mainCtx.globalCompositeOperation ='source-over';
    mainCtx.globalAlpha =0.8;
    mainCtx.fillStyle = 'hsla(217, 64%, 6%, 1)';
    mainCtx.fillRect(0, 0,canv.width,canv.height);
    mainCtx.globalCompositeOperation ='lighter';
    bigStar.move();
    bigStar.renderStar();
    for (var star of allStars){
        star.renderStar();
    }
    window.requestAnimationFrame(drawScene);
}
drawScene();
document.getElementById('changeShapeBtn').addEventListener('click',function(){
    currentShape = (currentShape + 1)%3;
    allStars = [];
    for (var i = 0; i <totalStars; i++){
        new Star(i *0.111);
    }
    bigStar = newBigStar(0);
});