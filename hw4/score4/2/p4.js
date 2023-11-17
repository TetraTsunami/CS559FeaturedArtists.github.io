const GameState = {
    ACTIVE: 0,
    WIN: 1,
    LOSE: 2
};

const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');
const debug = document.getElementById('debug');
const HEIGHT = canvas.height;
const WIDTH = canvas.width;
let sDx = Math.random() * 10;
let sDy = Math.random() * 10;
const FRICTION = 0.9;
const GRAVITY = 0.5;
const FLOOR = HEIGHT - 30 - 41*3;
let timeDelta = 0;
let timeLast = 0;
let gameState = GameState.ACTIVE;
let winAlpha = 0;
let time = Date.now();

function setup(){
    bg.src = "krakobg.png";
    floor.src = "krakofloor.png";
    kirbyRun.src = "kirbyrun.png";
    kirbyRunMirror.src = "kirbyRunMirror.png";
    kirbyIdle.src = "kirbyIdle.png";
    kirbyIdleMirror.src = "kirbyIdleMirror.png";
    kirbyJump.src = "kirbyJump.png";
    kirbyJumpMirror.src = "kirbyJumpMirror.png";
    kirbyJumpAttack.src = "kirbyAirAttack.png";
    kirbyJumpAttackMirror.src = "kirbyAirAttackMirror.png";
    krakoBase.src = "krakoBase.png";
    krakoEye.src = "krakoEye.png";
    krakoHurt.src = "krakoBaseHurt.png";
    healthKirby.src = "healthKirby.png";
    healthKrako.src = "healthKrako.png";
    winIcon.src = "winIcon.png";
    kirby = new Kirby(50, HEIGHT - 200);
    krako = new Krako(WIDTH/2 - 64*3, 0);
    debug.checked = false;
    requestAnimationFrame(draw);
}

function screenShake(){
    sDx = Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1);
    sDy = 0;
    context.save();
    context.translate(sDx, sDy);
}

function undoShake(){
    context.restore();
}

function drawUI(){
    context.imageSmoothingEnabled = false;
    context.save();
    context.scale(3,3);

    //Kirby's health
    for(let i = 0; i < kirby.health; i++){
        context.drawImage(healthKirby, i * 14/3, 0);
    }

    //Krako's health
    context.drawImage(healthKrako, WIDTH/3 - 80, 0);
    //Need to draw a bar to signify his health
    context.lineWidth = 0.5;
    context.fillStyle = "rgb(248, 144, 0)";
    context.strokeStyle = "rgb(247, 103, 8)";
    context.beginPath();
    context.rect(WIDTH/3 - 72, 2, 64 * (krako.health/100), 4);
    context.fill();
    context.stroke();

    context.restore();
    context.imageSmoothingEnabled = true;
}

function winScreen(){
    context.imageSmoothingEnabled = false;
    context.fillStyle = "black";
    context.save();
    context.translate(WIDTH/2, HEIGHT/2);
    context.globalAlpha = winAlpha;
    winAlpha = Math.min(1, winAlpha + 0.01);
    context.drawImage(winIcon, -116*1.5, -28*3, 116*3, 28*3);
    context.globalAlpha = 1;
    context.textAlign = "center";
    context.font = "20px Arial"
    context.fillText(`It took you ${time/1000} seconds`, -10, 40);
    context.restore();
    context.imageSmoothingEnabled = true;
}

function loseScreen(){
    context.fillStyle = 'rgba(127,127,127,0.5)'
    context.save();
    context.rect(0,0,WIDTH,HEIGHT);
    context.fill();
    context.font = "20px Arial"
    context.fillStyle = 'rgba(0,0,0,1)'
    context.fillText(`You lasted ${time/1000} seconds! Refresh to try again!`, WIDTH/2 - 20*13, HEIGHT/2 + 40);
    context.restore();
}

function draw(elapsedTime){
    timeDelta = (elapsedTime - timeLast)/1000;
    timeLast = elapsedTime;
    canvas.width = canvas.width;

    if(kirby.hurt){
        screenShake();
    }
    if(gameState == GameState.ACTIVE && krako.health <= 0){
        gameState = GameState.WIN;
        time = Date.now() - time;
    }

    if(gameState == GameState.ACTIVE && kirby.health <= 0){
        gameState = GameState.LOSE;
        time = Date.now() - time;
    }

    context.drawImage(bg, 0, 0, WIDTH, HEIGHT)
    context.drawImage(floor, 0, HEIGHT - 16, WIDTH, 16)
    krako.update();
    kirby.update();

    if(debug.checked){
        let mat = mat3.create();
        mat3.scale(mat,mat,[WIDTH,HEIGHT]);
        drawTrajectory(0.0,1.0,100,C0,mat,"red");
        drawTrajectory(0,1.0,100,C1,mat,"blue");
        drawTrajectory(0.0,1.0,100,C2,mat,"red");
        drawTrajectory(0,1.0,100,C3,mat,"blue");
    }

    undoShake();
    drawUI();
    
    if(gameState == GameState.WIN){
        winScreen();
    }

    else if(gameState == GameState.LOSE){
        loseScreen();
    }

    requestAnimationFrame(draw);
    
}

const keysPressed = {};
document.body.addEventListener("keydown", (event) => {
    keysPressed[event.key] = true;
});

document.body.addEventListener("keyup", (event) => {
    keysPressed[event.key] = false;
});

function updateCharacterVelocity() {
    if(kirby.lockout == 0){
        if (keysPressed['d'] || keysPressed['ArrowRight']) {
            kirby.vx += 50 * timeDelta;
        }
        if (keysPressed['a'] || keysPressed['ArrowLeft']) {
            kirby.vx -= 50 * timeDelta;
        }
        if ((keysPressed['w'] || keysPressed[' '] || keysPressed['ArrowUp']) && (kirby.state !== KirbyState.JUMPING && kirby.state !== KirbyState.ATTACKING)) {
            kirby.vy = -12;
        }
        if((keysPressed['s'] || keysPressed['ArrowDown']) && kirby.vy >= 0 && kirby.state == KirbyState.JUMPING){
            kirby.vy *= 2;
        }
        if(keysPressed['z'] && kirby.state == KirbyState.JUMPING && !kirby.attack_cooldown){
            kirby.state = KirbyState.ATTACKING;
        }
    }
}


window.onload = setup;