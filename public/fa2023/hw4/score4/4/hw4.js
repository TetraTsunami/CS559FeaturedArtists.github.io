"use strict";
function setup() {

    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Variables  ////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    var slider1 = document.getElementById('slider1');
    var slider2 = document.getElementById('slider2');
    var slider3 = document.getElementById('slider3');
    var hueCat = 0;
    var acceleration = 0;
    var y = 0;
    var bottom = 0;
    var top = 600;
    var walls = [];
    var genCount = 500;
    var minH = 150;
    var maxH = 400;
    var score = 0;
    var hardMode = true;
    var catBaseHeight = 120;
    var time = 0;
    var nebulaColors = ['#489BCF', '#4A61A4', '#8783A5'];
    var nebulaParticles = [];
    var anim;
    var walkSpeed = 1;
    var jumpForce = 1;
    var sun = {
        x: 0,
        y: 400,
        radius: 100
    }
    var gameRunning = false;
    var showSunPath = true;

    slider1.value = 50;
    slider2.value = 50;
    slider3.value = 50;

    var walkSpeed = 1;
    var jumpForce = 1;
    var tailAngle = 0.05 * Math.PI;
    var tailDir = -1;
    var lastTx;
    
    var cat_canvas = mat3.create();
    mat3.fromTranslation(cat_canvas, [0, 0]);

    var catAccesories = {
        eyes: "line",
        feet: "none",
        hat: "none",
        neck: "none",
        mouth: "closed"
    }

    var Bezier = function(t) {
        var a = 1 - t;
        return [
            a ** 3,
            3 * a ** 2 * t,
            3 * a * t ** 2,
            t ** 3,
        ];
    }
    
    function BezierDeriv(t) {
        var a = 1 - t;
        return [
            -3 * a ** 2,
            3 * (3 * a ** 2 - 2 * a * t),
            3 * (2 * t - 3 * t ** 2),
            3 * t ** 2,
        ];
    }

    function Cubic(basis,P,t){
        var b = basis(t);
        var result=vec2.create();
        vec2.scale(result,P[0],b[0]);
        vec2.scaleAndAdd(result,result,P[1],b[1]);
        vec2.scaleAndAdd(result,result,P[2],b[2]);
        vec2.scaleAndAdd(result,result,P[3],b[3]);
        return result;
    }



    // define four points to draw a hemisphere
    var p0=[0,0];
    var p1=[0.5,2];
    var p2=[2.5,2];
    var p3=[3,0];

    
    var p4=[3,0];
    var p5=[3.5,-2];
    var p6=[5.5,-2];
    var p7=[6,0];

    var C0 = function(t, n) {
        return Cubic(Bezier, [
            [0 + n * 3, 0],
            [0.5 + n * 3, 2],
            [2.5 + n * 3, 2],
            [3 + n * 3, 0]
        ], t);
    }
    var C1 = function(t, n) {
        return Cubic(Bezier, [
            [3 + n * 3, 0],
            [3.5 + n * 3, -2],
            [5.5 + n * 3, -2],
            [6 + n * 3, 0]
        ], t);
    }
    var CWave = function(t) {
        // alternating between two curves
        if (Math.floor(t) % 2 == 0) {
            return C0(t % 1, Math.floor(t));
        }
        else {
            return C1(t % 1, Math.floor(t - 1));
        }
    }
    
    var cannon_t = 0;

    const fps = 60;


    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Functionalities ///////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    function moveToTx(x, y, Tx = lastTx)
    {var res=vec2.create(); vec2.transformMat3(res,[x,y],Tx); ctx.moveTo(res[0],res[1]);}

    function lineToTx(x, y, Tx = lastTx)
    {var res=vec2.create(); vec2.transformMat3(res,[x,y],Tx); ctx.lineTo(res[0],res[1]);}

    function bezierCurveToTx(cp1x, cp1y, cp2x, cp2y, x, y, Tx = lastTx) {
        var res = [];
        var temp = vec2.create(); 
        vec2.transformMat3(temp, [cp1x, cp1y],Tx);
        res.push(temp[0], temp[1]);
        vec2.transformMat3(temp, [cp2x, cp2y],Tx); 
        res.push(temp[0], temp[1]);
        vec2.transformMat3(temp, [x, y],Tx);
        res.push(temp[0], temp[1]);
        ctx.bezierCurveTo(res[0],res[1],res[2],res[3],res[4],res[5]); 
    }
    
    function fillRectTx(x, y, sizeX = 10, sizeY = 10, Tx = lastTx)
    {var res=vec2.create(); vec2.transformMat3(res,[x,y],Tx); ctx.fillRect(res[0],res[1], sizeX, sizeY);}

    function ellipseTx(x, y, radiusX, radiusY, rotation, startAngle, endAngle, Tx = lastTx) {
        var res = [];
        var temp = vec2.create(); 
        vec2.transformMat3(temp, [x, y],Tx);
        res.push(temp[0], temp[1]);
        ctx.ellipse(res[0],res[1],radiusX, radiusY, rotation, startAngle, endAngle); 
    }

    function setTx(Tx)
    {lastTx = Tx;}

    function translateTx(x, y, Tx = lastTx) {
        var transTx = mat3.create();
        var res = mat3.create();
        mat3.fromTranslation(transTx, [x, y]);
        mat3.multiply(res, Tx, transTx);
        return res;
    }

    function scaleTx(x, y, Tx = lastTx) {
        var transTx = mat3.create();
        var res = mat3.create();
        mat3.scale(transTx, transTx, [x, y]);
        mat3.multiply(res, Tx, transTx);
        return res;
    }

    function rotateTx(angle, Tx = lastTx) {
        var transTx = mat3.create();
        var res = mat3.create();
        mat3.rotate(transTx, transTx, angle);
        mat3.multiply(res, Tx, transTx);
        return res;
    }

    const catScaleX = 0.2;
    var catScaleY = 0.2;

    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Cat Drawing ///////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    function drawCat(color) {
        catScaleY = 0.2 * (1 + (slider3.value - 50) / 50);
        setTx(cat_canvas);
        setTx(translateTx(120, 660 - y));
        setTx(translateTx(0, -70 * ((slider3.value - 50) / 25)));
        setTx(scaleTx(catScaleX, catScaleY));
        

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3;
        moveToTx(100, 170);
        lineToTx(150, 50);
        lineToTx(220, 130);
        
        bezierCurveToTx(300,110,340,110,420,130);
        lineToTx(490, 50);
        lineToTx(540, 170);
        bezierCurveToTx(620,230,620,350,540,410);
        bezierCurveToTx(430,490,210,490,100,410);
        bezierCurveToTx(20,350,20,230,100,170);
        ctx.closePath();

        setTx(translateTx(30, 0));

        if (catAccesories.mouth == "open") {
            
            moveToTx(270, 340);
            lineToTx(370, 340);
            bezierCurveToTx(368,415,272,415,270,340);
            ctx.closePath();
            ctx.stroke();
        }
        else {
            moveToTx(245, 350);
            bezierCurveToTx(260, 390, 310, 390, 320, 360);
            bezierCurveToTx(330, 390, 380, 390, 395, 350);
        }

        if (catAccesories.eyes == "line") {
            moveToTx(240, 220);
            lineToTx(240, 290);

            moveToTx(400, 220);
            lineToTx(400, 290);
        }
        else if (catAccesories.eyes == "dot") {
            // setTx(translateTx(0, 20));
            fillRectTx(240, 240, 7);
            fillRectTx(400, 240, 7);
        }
        else {
            moveToTx(200, 260);
            lineToTx(280, 260);

            moveToTx(360, 260);
            lineToTx(440, 260);
        }
        ctx.stroke();

        if (catAccesories.hat == "hat") {
            var Tx = lastTx;
            setTx(translateTx(190, 100));
            
            // fillRectTx(0, 0);

            ctx.fillStyle = "#454545";
            fillRectTx(0, -300, 40, 50 * (1 + (slider3.value - 50) / 50));
            fillRectTx(-100, -70, 80, 15);

            ctx.fillStyle = "red";
            fillRectTx(0, -100, 40, 10);
            lastTx = Tx;
        }
        
        setTx(translateTx(10, -20));
        drawBody(color);

    }

    function drawFoot(x, y, sign = 1) {
        var Tx = lastTx;
        ctx.beginPath();
        setTx(translateTx(x,y));
        setTx(rotateTx(sign * tailAngle * 6));
        if (catAccesories.feet == "socks") {
            ellipseTx(0, 50, 50 *catScaleX, 90 * catScaleY, 0, -0.17 * Math.PI, 1.23 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.fillStyle = "#FA8072";
            ellipseTx(0, 50, 50 *catScaleX, 90 * catScaleY, 0, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.fill();
        }
        else {
            ellipseTx(0, 50, 50 *catScaleX, 90 * catScaleY, 0, -0.17 * Math.PI, 1.23 * Math.PI);
            ctx.stroke();
        }
        lastTx = Tx;
    }

    function drawFeet() {
        drawFoot(-330, 530);
        drawFoot(-150, 520, -1);
        drawFoot(65, 550);
        drawFoot(240, 505, -1);
    }

    function drawBody(color) {
        
        drawFeet();
        ctx.beginPath();
        ctx.strokeStyle = color;

        ellipseTx(-50, 370, 400 * catScaleX, 250 * catScaleY, 0, 0.177 * Math.PI, 0.97 * Math.PI);
        ctx.fillStyle = '#000116';
        ctx.fill();
        ctx.beginPath();
        ellipseTx(-50, 370, 400 * catScaleX, 250 * catScaleY, 0, 0.16 * Math.PI, 1.61 * Math.PI);
        ctx.stroke();

        if (catAccesories.neck == "bow tie") {
            ctx.fillStyle = color;
            var Tx = lastTx;
            setTx(translateTx(300, 490));
            
            ctx.beginPath();
            
            lineToTx(-90, -50);
            lineToTx(-90, 50);
            lineToTx(0, 0);
            lineToTx(90, -50);
            lineToTx(90, 50);
            fillRectTx(-27, -27, 10, 11);

            ctx.fill();
            lastTx = Tx;
        }
        
        setTx(translateTx(-350, 205));

        setTx(rotateTx(tailAngle * 2));
        tailAngle += 0.02 * tailDir * walkSpeed;
        if (Math.abs(tailAngle) > 0.05 * Math.PI) {
            tailDir *= -1;
        }

        ctx.beginPath();
        moveToTx(0, 0);
        
        var px1 = -100;
        var py1 = -400;
        var px2 = -300;
        var py2 = -300;
        bezierCurveToTx(px1, py1, px2, py2, -58, 30);
        lineToTx(-40, 40);
        ctx.stroke();
    }


    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Game Logic  ///////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    function changeSpeed() {
        walkSpeed = 1 + ((slider1.value - 50) / 70);
    }
    function changeJumpForce() {
        jumpForce = 1 + ((slider2.value - 50) / 150);
    }

    function drawScore() {
        score += (genCount % 10 == 0);
        ctx.font = "70px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("SCORE: " + score, 1000, 100);
    }

    function jump() {
        if (y <= bottom) acceleration += 13 * jumpForce;
    }

    function updatePhysics() {
        y += acceleration;
        if (y <= bottom) {
            y = bottom;
            acceleration = 0;
        }
        else {
            acceleration -= 0.2;
        }
    }

    function generateWall() {
        var height = Math.round(Math.random() * (maxH - minH) + minH);
        walls.push(new wall(30, height, "silver", canvas.width));
    }

    function wall(width, height, color, xPos) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.xPos = xPos;
        this.yPos = Math.random() * (canvas.height - this.height);
        this.up = true;
        this.ySpeed = 0.8 + 2 * Math.random();
        this.updateXPos = function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
        }
        this.updateXYPos = function() {
            this.yPos -= this.up ? this.ySpeed : -this.ySpeed;
            if (this.yPos + this.height >= canvas.height) {
                this.up = true;
            }
            else if (this.yPos <= 0) {
                this.up = false;
            }

            ctx.fillStyle = this.color;
            ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
        }
    }
    function updateWalls() {
        genCount += 1;
        if (genCount > 250) {
            generateWall();
            genCount = 0;
        }
        for (var i = 0; i < walls.length; i += 1) {
            walls[i].xPos += -4 * walkSpeed;
            if (hardMode) {
                walls[i].updateXYPos();
            }
            else {
                walls[i].updateXPos();
            }
        }
    }

    function checkCollision() {
        for (var i = 0; i < walls.length; i += 1) {
            if (walls[i].xPos > 30 && walls[i].xPos < 200) {
                var lowerBound = (canvas.height - walls[i].height - walls[i].yPos);
                var higherBound = (canvas.height - walls[i].yPos);
                if (y >= lowerBound && y <= higherBound) {
                    return true;
                }
                var catHeight = catBaseHeight * (1 + (slider3.value - 50) / 50)
                if (y + catHeight >= lowerBound && y + catHeight <= higherBound) {
                    return true;
                }
            }
        }
        return false;
    }

    function retry() {
        var id = window.requestAnimationFrame(function(){});
   while(id--){
     window.cancelAnimationFrame(id);
   }
        score = 0;
        walls = [];
        genCount = 500;
        acceleration = 0;
        sun.x = 0;
        sun.y = 400;

        cancelAnimationFrame(anim);
        animateHW4();
    }
      
    function drawSun() {
        const gradient = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, sun.radius);

        gradient.addColorStop(0.3, 'rgba(255,255,0,1)');
        gradient.addColorStop(1, 'rgba(255,90,0,0)');

        ctx.fillStyle = gradient;

        ctx.save();
        ctx.translate(0, 200);

        ctx.beginPath();
        ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    }

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////  Bg Drawing ///////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    function updateSun() {
        if (genCount % 5 != 0) {
            return;
        }

        var progress = time % 5000 / 500;  
        

        var pos = CWave(progress);

        sun.x = pos[0] * 50;
        sun.y = pos[1] * -50;
        
        // sun.x += 1.5 * Math.cos(-Math.PI / 2 + progress);
        // sun.y += 0.5 * Math.sin(-Math.PI / 2 + progress);
      
        time += 1;
    }

    for(var i = 0; i < 100; i++) {
        nebulaParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3,
            vel: {
                x: (Math.random() - 0.5) * 0.5,
                y: (Math.random() - 0.5) * 0.5
            },
            color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)]
        });
    }

    function drawNebulaParticles() {
        nebulaParticles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color; 
            ctx.fill();
        });
    }

    function updateNebulaParticles() {
        nebulaParticles.forEach(particle => {
        particle.x += particle.vel.x;
        particle.y += particle.vel.y;

        if (particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
                particle.x = Math.random() * canvas.width;
                particle.y = Math.random() * canvas.height;
            }
        });
    }

    function drawBackGround() {
        ctx.fillStyle = '#000116';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawNebulaParticles();
        updateNebulaParticles();
    }

    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Inventory Page   //////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    var invcanvas = document.getElementById('inventoryCanvas');
    const invctx = invcanvas.getContext('2d'); 
    
    const buttonWidth = 80;
    const buttonHeight = 80;
    
    let invX = 40;
    let invY = 50;
    
    function Inventory(categories) {
        this.categories = categories;
    
        this.draw = function() {
            var x = invX;
            for (var i = 0; i < this.categories.length; i++) {
                
                
                invctx.fillStyle = 'pink';
                invctx.fillRect(x, invY, buttonWidth, buttonHeight);
                invctx.fillStyle = 'black';
                invctx.font = '16px Arial'; 
                invctx.fillText(this.categories[i].name, x, invY + buttonHeight / 2);
                
                this.categories[i].draw(x);
                x += buttonWidth * 1.3;
            }
        }
        this.checkClick = function(mouseX, mouseY) {
            var x = invX;
            for (var i = 0; i < this.categories.length; i++) {
                if (mouseX > x && mouseX < x + buttonWidth) {
                    try {
                        catAccesories[this.categories[i].name.toLowerCase()] = this.categories[i].checkClick(mouseX, mouseY).toLowerCase();
                    }
                    catch {}
                    return;
                }
                x += buttonWidth * 1.3;
            }
        }
    }
    
    function Category(name, items) {
        this.name = name;
        this.items = items;
    
        this.draw = function(x) {
            var y = invY + buttonHeight * 1.05;
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].draw(x, y);
                y += buttonHeight * 1.05;
            }
        }
        this.checkClick = function(mouseX, mouseY) {
            var y = invY + buttonHeight * 1.05;
            for (var i = 0; i < this.items.length; i++) {
                if (mouseY > y && mouseY < y + buttonHeight) {
                    return this.items[i].name;
                }
                y += buttonHeight * 1.05;
            }
        }
    }
    
    function Item(name) {
        this.name = name;
    
        this.draw = function(x, y) {
            this.x = x;
            this.y = y;
            invctx.fillStyle = 'lightblue';
            invctx.fillRect(x, y, buttonWidth, buttonHeight);
            invctx.fillStyle = 'black';
            invctx.font = '16px Arial'; 
            invctx.fillText(this.name, x, y + buttonHeight / 2); 
        }
    }
    
    var eyesItems = [new Item("Line"), new Item("Sleep"), new Item("Dot")];
    var feetItems = [new Item("None"), new Item("Socks")];
    var hatItems = [new Item("None"), new Item("Hat")];
    var neckItems = [new Item("None"), new Item("Bow Tie")];
    var mouthItems = [new Item("Closed"), new Item("Open")];
    
    var eyesCategory = new Category("Eyes", eyesItems);
    var feetCategory = new Category("Feet", feetItems);
    var hatCategory = new Category("Hat", hatItems);    
    var neckCategory = new Category("Neck", neckItems);
    var mouthCategory = new Category("Mouth", mouthItems);
    
    var inventory = new Inventory([eyesCategory, hatCategory, feetCategory, neckCategory, mouthCategory]);
    
    inventory.draw();
    invctx.fillStyle = 'black';
    invctx.font = '24px Arial';
    invctx.fillText("Cat's Closet!", 220, invY - 20);

    var startCounter = 0;

    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Projectile Motion   ///////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    const g = 9.8;

    var cannonX = 0;
    var cannonY = 0;
    var cannonInitV = 120;
    var cannonTraceDashed = true;

    var angle = 45;
    
    function cannonTrace(t, a = -1) {
        if (a != -1) {
            var angleTemp = a;
        }
        else {
             var angleTemp = angle;
        }

        var cannonAngle = angleTemp * Math.PI / 180;
        var cannonVX = cannonInitV * Math.cos(cannonAngle);
        var cannonVY = -cannonInitV * Math.sin(cannonAngle);

        return [cannonX + cannonVX * t, cannonY + cannonVY * t + 0.5 * g * t * t];
    }
    function cannonTrace_tangent(t, a = -1) {
        if (a != -1) {
            var angleTemp = a;
        }
        else {
            var angleTemp = angle;
        }
        var cannonAngle = angleTemp * Math.PI / 180;
        var cannonVX = cannonInitV * Math.cos(cannonAngle);
        var cannonVY = -cannonInitV * Math.sin(cannonAngle);

        return [cannonVX, cannonVY + g * t];
    }

    function drawTrajectory(t_begin, t_end, intervals, funct, a = -1, color = "red", Tx = lastTx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        moveToTx(funct(t_begin));
        ctx.beginPath();
        for (var i = 1; i < intervals; i++) {
            ctx.setLineDash([5, 5]);
            if (a != -1) {
                var point = funct(((intervals-i)/intervals)*t_begin+(i/intervals)*t_end);
            }
            else {
                var point = funct(((intervals-i)/intervals)*t_begin+(i/intervals)*t_end);
            }
            lineToTx(point[0], point[1]);
        }
        ctx.stroke();
    }

    function changeCannonAngle(dir) {
        angle += dir;
        if (angle < 20) {
            angle = 20;
        }
        else if (angle > 85) {
            angle = 85;
        }
        // drawTrajectory(0, 25, 100, cannonTrace);
    }

    function changeLaserAngle(dir) {
        laserAngle += dir;
        if (laserAngle < 20) {
            laserAngle = 20;
        }
        else if (laserAngle > 85) {
            laserAngle = 85;
        }
    }


    function cannonTrace(t, a = -1) {
        if (a != -1) {
            var angleTemp = a;
        }
        else {
             var angleTemp = angle;
        }

        var cannonAngle = angleTemp * Math.PI / 180;
        var cannonVX = cannonInitV * Math.cos(cannonAngle);
        var cannonVY = -cannonInitV * Math.sin(cannonAngle);

        return [cannonX + cannonVX * t, cannonY + cannonVY * t + 0.5 * g * t * t]
    }
    function cannonTrace_tangent(t, a = -1) {
        if (a != -1) {
            var angleTemp = a;
        }
        else {
            var angleTemp = angle;
        }
        var cannonAngle = angleTemp * Math.PI / 180;
        var cannonVX = cannonInitV * Math.cos(cannonAngle);
        var cannonVY = -cannonInitV * Math.sin(cannonAngle);

        return [cannonVX, cannonVY + g * t];
    }

    var laserVX = 50;
    var laserVY = 50;

    var Cbeam = function(t) {
        if (t < Math.PI * 2) {
            return [laserVX * t, -laserVY * Math.sin(4 * t)];
        }
        else if (t < Math.PI * 6) {
            return [laserVX * t, -laserVY * 2 * Math.sin(2 * t)];
        }
        else {
            return [laserVX * t, -laserVY * 4 * Math.sin(t)];
        }
    }

    var Cbeam_tangent = function(t) {
        if (t < Math.PI * 2) {
            return [laserVX, -laserVY * 4 * Math.cos(4 * t)];
        }
        else if (t < Math.PI * 6) {
            return [laserVX, -laserVY * 4 * Math.cos(2 * t)];
        }
        else {
            return [laserVX, -laserVY * 4 * Math.cos(t)];
        }
    }

    

    setTx(new mat3.create());
    setTx(translateTx(100, canvas.height - 100));
    var Ttraj_to_canvas = lastTx;
    var shootAngle = 45;
    var shootTx = lastTx;
    var shooting = false;

    function drawCannon(shooting){
        setTx(Ttraj_to_canvas);
        drawTrajectory(0, 30, 100, cannonTrace, 30);

        if (!shooting) {
            return;
        }
        
        cannon_t += 0.1;
        
        var Tcannon_to_traj = mat3.create();
        var Tcannon_to_canvas = mat3.create();

        var tangent = cannonTrace_tangent(cannon_t, shootAngle);
        mat3.fromTranslation(Tcannon_to_traj, cannonTrace(cannon_t, shootAngle));
        mat3.rotate(Tcannon_to_traj, Tcannon_to_traj, Math.atan2(tangent[1],tangent[0]));
        mat3.multiply(Tcannon_to_canvas, shootTx, Tcannon_to_traj);
        setTx(Tcannon_to_canvas);
        
        
        ctx.beginPath();
        ctx.fillStyle = "gray";

        // draw the missile
        moveToTx(50, 0);
        bezierCurveToTx(25, -30, -25, -40, -50, -20);
        lineToTx(-50, 20);
        bezierCurveToTx(-25, 40, 25, 30, 50, 0);

        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#FF5733";
        moveToTx(-50, -17);
        lineToTx(-60, -12);
        lineToTx(-60, 12);
        lineToTx(-50, 17);
        ctx.fill();

        ctx.beginPath();
        moveToTx(-33, -28);
        bezierCurveToTx(-40, -40, -45, -50, -70, -40);
        bezierCurveToTx(-50, -40, -40, -20, -45, -23);
        ctx.fill();

        ctx.beginPath();
        moveToTx(-33, 28);
        bezierCurveToTx(-40, 40, -45, 50, -70, 40);
        bezierCurveToTx(-50, 40, -40, 20, -45, 23);
        ctx.fill();

        ctx.beginPath();
        moveToTx(20, -20);
        lineToTx(20, 20);
        // change back to solid line
        ctx.strokeStyle = "black";
        ctx.setLineDash([]);

        ctx.stroke();
    }



    setTx(new mat3.create());
    setTx(translateTx(200, canvas.height - 70));
    var TtrajLaser_to_canvas = lastTx;
    var laserShootAngle = 45;
    var laserShootTx = lastTx;
    var laserShooting = false;

    
    var laserAngle = 45;
    
    var laser_t = 0;
    var laserInitV = 200;


    function drawLaser(laserShooting) {
        setTx(TtrajLaser_to_canvas);
        // setTx(rotateTx(laserAngle * -Math.PI / 270));
        drawTrajectory(0, 30, 200, Cbeam, 30);

        if (!laserShooting) {
            return;
        }
        
        laser_t += 0.1;
        
        var Tlaser_to_traj = mat3.create();
        var Tlaser_to_canvas = mat3.create();

        var tangent = Cbeam_tangent(laser_t, laserShootAngle);

        mat3.fromTranslation(Tlaser_to_traj, Cbeam(laser_t, laserShootAngle));
        mat3.rotate(Tlaser_to_traj, Tlaser_to_traj, Math.atan2(tangent[1],tangent[0]));
        mat3.multiply(Tlaser_to_canvas, laserShootTx, Tlaser_to_traj);
        setTx(Tlaser_to_canvas);
        // console.log(Cbeam(laser_t, laserShootAngle) + (200, canvas.height - 70));

        ctx.beginPath();
        ctx.fillStyle = "red";
        moveToTx(30, 0);
        bezierCurveToTx(15, -15, -15, -15, -30, 0);
        bezierCurveToTx(-15, 15, 15, 15, 30, 0);

        ctx.fill();
    }


    

    function drawTrajectoryTest(t_begin,t_end,intervals,C) {
	    ctx.strokeStyle="red";
	    ctx.beginPath();
        // ctx.setLineDash([]);
        // ctx.lineWidth = 30;
        moveToTx(C(t_begin)[0], C(t_begin)[1]);
        for(var i=1;i<=intervals;i++){
            var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
            lineToTx(C(t)[0], C(t)[1]);
        }
        ctx.stroke();
	}

    function Test() {
        if (!showSunPath) return;
        setTx(new mat3.create());

        setTx(translateTx(0, 200));

        setTx(scaleTx(50, -50));
        drawTrajectoryTest(0.0,10.0,200,CWave);
    }

    var hit = false;

    function checkBulletCollision() {
        var laserX = Cbeam(laser_t, laserShootAngle)[0] + 200;
        var laserY = Cbeam(laser_t, laserShootAngle)[1] + canvas.height - 70;
        for (var i = 0; i < walls.length; i += 1) {
            if (walls[i].xPos > laserX - 30 && walls[i].xPos < laserX + 30) {
                var lowerBound = (canvas.height - walls[i].height - walls[i].yPos);
                var higherBound = (canvas.height - walls[i].yPos);
                if (canvas.height - laserY >= lowerBound && canvas.height -  laserY <= higherBound) {
                    walls.splice(i, 1);
                    laserShooting = false;
                    return;
                }
            }
        }
        var cannonX = cannonTrace(cannon_t, shootAngle)[0] + 100;
        var cannonY = cannonTrace(cannon_t, shootAngle)[1] + canvas.height - 100;
        for (var i = 0; i < walls.length; i += 1) {
            if (walls[i].xPos > cannonX - 30 && walls[i].xPos < cannonX + 30) {
                var lowerBound = (canvas.height - walls[i].height - walls[i].yPos);
                var higherBound = (canvas.height - walls[i].yPos);
                if (canvas.height - cannonY >= lowerBound && canvas.height -  cannonY <= higherBound) {
                    walls.splice(i, 1);
                    hit = true;
                    shooting = false;
                    return;
                }
            }
        }
    }


    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Setup Everything //////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    let particles = []; 

    class Particle { 
        constructor(x, y, radius, dx, dy) { 
            this.x = x; 
            this.y = y; 
            this.radius = radius; 
            this.dx = dx; 
            this.dy = dy; 
            this.alpha = 1; 
        } 
        draw() { 
            ctx.save(); 
            ctx.globalAlpha = this.alpha; 
            ctx.fillStyle = 'red'; 
            ctx.beginPath(); 
              
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); 
      
            ctx.fill(); 
              
            ctx.restore(); 
        } 
        update() { 
            this.alpha -= 0.01; 
            this.x += this.dx; 
            this.y += this.dy; 
            this.draw(); 
        } 
    } 
    function generateExplosion() { 
        for (i = 0; i <= 200; i++) { 
            let dx = (Math.random() - 0.5) * (Math.random() * 6); 
            let dy = (Math.random() - 0.5) * (Math.random() * 6); 
            let radius = Math.random() * 3; 
            let particle = new Particle(0, 0, radius, dx, dy); 
            particles.push(particle); 
        } 
        explode();
    }
      
    function explode() { 
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.fillStyle = "white"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height); 
        particles.forEach((particle, i) => { 
                if (particle.alpha <= 0) { 
                    particles.splice(i, 1); 
                } else particle.update() 
            }) 
        return particles.length > 0;
    } 

    var missleCollides = true;

    function animateHW4() {
      canvas.width = canvas.width;
    
    //   drawTrajectory(0, 25, 100, cannonTrace);
      drawBackGround();
      drawCat("hotpink");

      if (!gameRunning) {
          startCounter += 1;
          if (startCounter % 100 < 50) {

              ctx.fillStyle = "white";
              ctx.font = "70px Arial";
              ctx.fillText("Press Space to Start", 500, canvas.height / 2);
          }
      }
      else {
            updateWalls();
            updatePhysics();
            drawScore();

            updateSun();
            drawSun();
            drawCannon(shooting);
            drawLaser(laserShooting);
            Test();
            checkBulletCollision();


        //   if (missleCollides) {
        //     generateExplosion();
        //     missleCollides = false;
        //   }
  
          if (checkCollision()) {
              cancelAnimationFrame(anim);
              return;
          }
      }

      setTimeout(() => {
        anim = requestAnimationFrame(animateHW4);
      }, 1000 / fps);
    }
    
    slider1.addEventListener("input", changeSpeed);
    slider2.addEventListener("input", changeJumpForce);

    document.addEventListener('keydown', event => {
        if (event.code === 'Space') {
            if (!gameRunning) {
                gameRunning = true;
                animateHW4();
            }
            // jump();
        }
        else if (event.code === 'KeyR') {
            retry();
        }
        else if (event.code === 'ArrowRight') {
            changeCannonAngle(-1);
        }
        else if (event.code === 'ArrowLeft') {
            changeCannonAngle(1);
        }
        else if (event.code === 'ArrowDown') {
            changeLaserAngle(-1);
        }
        else if (event.code === 'ArrowUp') {
            changeLaserAngle(1);
        }
        else if (event.code === 'KeyZ') {
            if (!shooting || cannon_t > 25){
                cannon_t = 0;
                shootAngle = angle;
                shootTx = Ttraj_to_canvas;
                shooting = true;
            }
        }
        else if (event.code === 'KeyX') {
            if (!laserShooting || laser_t > 25){
                laser_t = 0;
                laserShootAngle = angle;
                laserShootTx = TtrajLaser_to_canvas;
                laserShooting = true;
            }
        }
    });
    document.getElementById("retry").addEventListener("click", () => {
        retry();
    });
    document.addEventListener("mousedown", event => {
        var rect = invcanvas.getBoundingClientRect();
        inventory.checkClick(event.clientX - rect.left, event.clientY - rect.top);
    });
    // checkbox for show sun path
    document.getElementById("showPath").addEventListener("change", event => {
        showSunPath = event.target.checked;
    });

    var Hermite = function(t) {
        return [
          2*t*t*t-3*t*t+1,
          t*t*t-2*t*t+t,
          -2*t*t*t+3*t*t,
          t*t*t-t*t
        ];
    }



    animateHW4();


    

}


window.onload = setup;