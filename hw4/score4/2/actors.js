//Assets
const bg = new Image();
const floor = new Image();
const kirbyRun = new Image();
const kirbyRunMirror = new Image();
const kirbyIdle = new Image();
const kirbyIdleMirror = new Image();
const kirbyJump = new Image();
const kirbyJumpMirror = new Image();
const kirbyJumpAttack = new Image();
const kirbyJumpAttackMirror = new Image();
const krakoBase = new Image();
const krakoHurt = new Image();
const krakoEye = new Image();
const healthKirby = new Image();
const healthKrako = new Image();
const winIcon = new Image();

let kirby;
let krako;
const KirbyState = {
    DUMMY: -1,
    STANDING: 0,
    RUNNING: 1,
    JUMPING: 2,
    ATTACKING: 3
}

const KrakoState = {
    DUMMY: -1,
    IDLE: 1 << 0,
    READY: 1 << 1,
    SWEEP: 1 << 2,
    LIGHTNING: 1 << 3,
    DAMAGED: 1 << 4
}


class Kirby {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.animFrame = 0; //Current frame of animation
        this.animLen = 0; //Length of the animation in frames.
        this.frameLen = 0; //How long to hold a frame.
        this.framesHeld = 0; //How long the current frame has been held.
        this.state = KirbyState.STANDING;
        this.prev_state = KirbyState.DUMMY;
        this.attacking = false; //If your attack hitbox is active.
        this.attack_cooldown = false;
        this.health = 5;
        this.invincibility_frames = 0;
        this.hurt = false;
        this.lockout = 0; //Frame lockout after being damaged.
    }

    updateState(){
        if(this.y >= FLOOR - 5 && Math.abs(this.vx) > 0.1){
            this.state = KirbyState.RUNNING;
            this.attack_cooldown = false;
        }
        else if(this.y < FLOOR - 5 && this.state != KirbyState.ATTACKING){
            this.state = KirbyState.JUMPING;
        }
        else if(this.y >= FLOOR - 5) {
            this.state = KirbyState.STANDING;
            this.attack_cooldown = false;
        }

        this.attacking = this.state == KirbyState.ATTACKING && this.animFrame < 8;
    }

    animate(){
        this.updateState();
        if(this.state != this.prev_state){
            this.animFrame = 0;
            this.framesHeld = 0;
            switch(this.state){
                case KirbyState.STANDING:
                    this.animLen = 2;
                    this.frameLen = 45;
                    this.attack_cooldown = false;
                    break;
                case KirbyState.ATTACKING:
                    this.animLen = 11;
                    this.frameLen = 3;
                    this.attack_cooldown = false;
                    break;
                case KirbyState.JUMPING:
                    this.animLen = 5;
                    this.frameLen = 10;
                    break;
                case KirbyState.RUNNING:
                    this.animLen = 8;
                    this.frameLen = 4;
                    break;
            }
            this.prev_state = this.state;
        }
        context.imageSmoothingEnabled = false;
        switch(this.state){
            case KirbyState.STANDING:
                if(this.vx < 0){
                    context.drawImage(kirbyIdleMirror, this.animFrame * 32, 0, 31, 41, this.x, this.y, 32*3, 41*3);
                }
                else {
                    context.drawImage(kirbyIdle, this.animFrame * 32, 0, 31, 41, this.x, this.y, 32*3, 41*3);
                }
                break;
            case KirbyState.JUMPING:
                if(this.vx < 0){
                    context.drawImage(kirbyJumpMirror, this.animFrame * 32, 0, 31, 41, this.x, this.y, 32*3, 41*3);
                }
                else {
                    context.drawImage(kirbyJump, this.animFrame * 32, 0, 31, 41, this.x, this.y, 32*3, 41*3);
                }
                break;
            case KirbyState.RUNNING:
                if(this.vx < 0){
                    context.drawImage(kirbyRunMirror, this.animFrame * 32, 0, 31, 41, this.x, this.y, 32*3, 41*3);
                }
                else {
                    context.drawImage(kirbyRun, this.animFrame * 32, 0, 31, 41, this.x, this.y, 32*3, 41*3);
                }
                break;
            case KirbyState.ATTACKING:
                if(this.vx < 0){
                    context.drawImage(kirbyJumpAttackMirror, this.animFrame * 36, 0, 36, 60, this.x, this.y, 36*3, 60*3);
                }
                else{
                    context.drawImage(kirbyJumpAttack, this.animFrame * 36, 0, 36, 60, this.x, this.y, 36*3, 60*3);
                }
                break;
        }
        if(this.state != KirbyState.JUMPING && this.state != KirbyState.ATTACKING){
            this.animFrame += (this.framesHeld % this.frameLen == 0)
            this.framesHeld = (this.framesHeld + 1) % this.frameLen;
            this.animFrame %= this.animLen;
        }
        else if(this.state == KirbyState.JUMPING){
            this.animFrame += (this.framesHeld % this.frameLen == 0 && this.animFrame != 4)
            this.framesHeld = (this.framesHeld + 1) % this.frameLen;
            this.animFrame %= this.animLen;
        }
        else if(this.state == KirbyState.ATTACKING){
            this.attack_cooldown = this.animFrame > 8;
            this.animFrame += (this.framesHeld % this.frameLen == 0 && this.animFrame != 10)
            this.framesHeld = (this.framesHeld + 1) % this.frameLen;
            this.animFrame %= this.animLen;
        }

        context.imageSmoothingEnabled = true;
    }

    constrain(){
        this.vx *= FRICTION;
        this.vy += GRAVITY;

        if(this.x > WIDTH - 32*3){
            this.x = WIDTH - 32*3;
        }
        if(this.x < 0){
            this.x = 0;
        }
        if(this.y > FLOOR){
            this.y = FLOOR;
        }
        if(this.y < 0){
            this.y = 0;
        }

        if(this.vx < -20){
            this.vx = -20;
        }
        if(this.vx > 20){
            this.vx = 20;
        }
        if(this.vy < -20){
            this.vy = -20;
        }
        if(this.vy > 20){
            this.vy = 20;
        }
    }

    update(){
        if(gameState == GameState.ACTIVE)
            updateCharacterVelocity();
        this.animate();
        this.constrain();
        kirby.x += kirby.vx;
        kirby.y += kirby.vy;
        kirby.invincibility_frames = Math.max(0, kirby.invincibility_frames - 1);
        kirby.lockout = Math.max(0, kirby.lockout - 1);
        if(kirby.invincibility_frames == 0){
            kirby.hurt = false;
        }
    }
}

class Krako {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.eyeFrame = 0; //Which eye frame to use.
        this.animFrame = 0; //Current frame of animation
        this.animLen = 3; //Length of the animation in frames.
        this.frameLen = 8; //How long to hold a frame.
        this.framesHeld = 0; //How long the current frame has been held.
        this.state = KrakoState.LIGHTNING;
        this.attack_state = KrakoState.IDLE;
        this.attacking = false; 
        this.attack_cooldown = 0;
        this.t = 0;
        this.invincibility_frames = 0;
        this.health = 100;
        this.hurt = false;


        //Special points for sweep attack curves
        //Each row is the point followed by its derivative for each entry. First 2 are the start point, last 2 are the end point.
        //These are all done as proportions of screen space.
        this.sweep_curve = [
            [[0.6, 0.3], [-1,-1], [0.2, 0.5], [-1,1]],
            [[0.2, 0.5], [-1,1], [0.4, 0.9], [1,1]], 
            [[0.4, 0.9], [1,1], [0.9, 0.5], [-0.5,0.5]], 
            [[0.9, 0.5], [-0.5,0.5], [0.6, 0.3], [-1,-1]]
        ]
    }

    drawEye(){
        let kirbyPos = vec2.fromValues(kirby.x, kirby.y);
        let krakoEyePos = vec2.fromValues(this.x + 96 + 24/2, this.y + 64 - 24/2);
        let angle = Math.atan2(kirbyPos[1] - krakoEyePos[1], kirbyPos[0] - krakoEyePos[0]) * -1;
        
        //Now choose the animation frame.
        if (angle >= 0 && angle < Math.PI / 4) {
            this.eyeFrame = 0;
        } else if (angle >= Math.PI / 4 && angle < Math.PI / 2) {
            this.eyeFrame = 7;
        } else if (angle >= Math.PI / 2 && angle < 3 * Math.PI / 4) {
            this.eyeFrame = 6;
        } else if (angle >= 3 * Math.PI / 4 && angle < Math.PI) {
            this.eyeFrame = 5;
        } else if (angle >= -Math.PI && angle < -3 * Math.PI / 4) {
            this.eyeFrame = 4;
        } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 2) {
            this.eyeFrame = 3;
        } else if (angle >= -Math.PI / 2 && angle < -Math.PI / 4) {
            this.eyeFrame = 2;
        } else {
            this.eyeFrame = 1;
        }
    }   

    animate(){
        context.imageSmoothingEnabled = false;
        context.drawImage(this.hurt ? krakoHurt : krakoBase, this.animFrame * 96, 0, 96, 64, this.x, this.y, 96*3, 64*3);
        this.drawEye();
        context.drawImage(krakoEye, this.eyeFrame * 24, 0, 24, 24, this.x + 96 + 24/2, this.y + 64 - 24/2, 24*3, 24*3);
        this.animFrame += (this.framesHeld % this.frameLen == 0)
        this.framesHeld = (this.framesHeld + 1) % this.frameLen;
        this.animFrame %= this.animLen;
        context.imageSmoothingEnabled = true;
    }

    areCirclesOverlapping(kirbPos, kirbRadius, krakPos, krakRadius) {
        // Calculate the distance between the centers of the circles
        const dx = kirbPos[0] - krakPos[0];
        const dy = kirbPos[1] - krakPos[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
      
        // Check if the distance is less than the sum of the radii
        return distance < kirbRadius + krakRadius;
    }

    //IMPLICIT CURVE!
    doEllipsesIntersect(center1, majorRadius1, minorRadius1, center2, majorRadius2, minorRadius2) {
        const [x1, y1] = center1;
        const [x2, y2] = center2;
      
        const a1 = majorRadius1;
        const b1 = minorRadius1;
        const a2 = majorRadius2;
        const b2 = minorRadius2;
      
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distanceBetweenCenters = Math.sqrt(dx * dx + dy * dy);
      
        // Check if the ellipses intersect
        return distanceBetweenCenters < a1 + a2 && distanceBetweenCenters < b1 + b2;
      }

    checkHit(){
        //The hitboxes are just circles of particular radii.
        let kirbPos = vec2.fromValues(kirby.x + 32 * 1.5, kirby.y + 42 * 2);
        let krakPos = vec2.fromValues(this.x + 96 * 1.5, this.y + 64 * 1.5);
        let krakoEyeRad = 32*1.5; //Contact damage
        let kirbyAttackRad = 26*1.5; //Kirby's attack radius
        let kirbyDmgRad = 22*1.5; //Kirby's hurt radius

        //The hurtbox is the eye, which is a circle of radius 24 * 1.5 = 36
        let kirbyDamaged = this.areCirclesOverlapping(kirbPos, kirbyDmgRad, krakPos, krakoEyeRad);
        let kirbyAttacked = this.doEllipsesIntersect(krakPos, 96 * 1.5, 64 * 1.5, kirbPos, kirbyAttackRad, kirbyAttackRad) && kirby.attacking;

        if(kirbyAttacked && this.invincibility_frames == 0){
            this.health -= 10;
            this.invincibility_frames = 200; //Cannot be damaged for 3 seconds.
        }

        if(kirbyDamaged && !kirby.hurt){
            //Apply knockback (everyone's favorite mechanic)
            let diff = vec2.fromValues(0,0);
            let rand = vec2.fromValues(0,0);
            vec2.random(rand, -10);
            vec2.subtract(diff, kirbPos, krakPos);
            vec2.normalize(diff, diff);
            vec2.scale(diff, diff, -5);
            kirby.vx += diff[0] + rand[0];
            kirby.vy += diff[1] + rand[1];

            kirby.hurt = true;
            kirby.invincibility_frames = 120;
            kirby.lockout = 60;
            kirby.health--;
        }
        
        if(!debug.checked)
            return;
        context.fillStyle = kirbyDamaged ? "red" : "blue";
        context.beginPath();
        context.arc(krakPos[0], krakPos[1], krakoEyeRad, 0, 2 * Math.PI);
        context.fill();

        context.fillStyle = "green";
        context.beginPath();
        context.arc(kirbPos[0], kirbPos[1], kirbyAttackRad, 0, 2 * Math.PI);
        context.fill();

        context.fillStyle = kirbyDamaged ? "red" : "blue";
        context.beginPath();
        context.arc(kirbPos[0], kirbPos[1], kirbyDmgRad, 0, 2 * Math.PI);
        context.fill();

        context.strokeStyle = "green";
        context.beginPath();
        context.save();
        context.ellipse(krakPos[0], krakPos[1], 96*1.5, 64*1.5, 0, 0, 2 * Math.PI);
        context.stroke();
        context.restore();
    }

    sweep_attack(){
        let newPos = interpolatePosition(this.t);
        this.x = (newPos[0] * WIDTH) - (96 * 1.5);
        this.y = (newPos[1] * HEIGHT) - (64 * 1.5);
        this.t += 0.01;
        if(this.t > 4){
            this.t = 0;
            this.state = KrakoState.IDLE;
        }
    }

    lightning_attack(){
        //move along the curve to the desired location.
        if(this.t < 1.1){
            let newPos = null;
            if (this.t < 1){
                let u = this.t;
                newPos = C0(u);
            } 
            else if (this.t >= 1 && this.t < 2){
                let u = this.t-1.0;
                newPos = C1(u);
            } 
            this.t += 0.01;
            this.x = (newPos[0] * WIDTH) - (96 * 1.5);
            this.y = (newPos[1] * HEIGHT) - (64 * 1.5);
        }
        else if(this.x < WIDTH - 96*3) {
            //Draw lightning and ATTACK.
            this.x += 240 * timeDelta;
            let krakPos = vec2.fromValues(this.x + 96 * 1.5, this.y + 64 * 2);
            let groundPos = vec2.fromValues(this.x + 96 * 1.5, HEIGHT - 16);
            let current = vec2.clone(krakPos); // Start from krakPos
            let lightnings = [];

            // While the distance between current and groundPos is greater than or equal to 5
            let count = 0;
            let spread = 15;
            while (count < 30) {
            // Generate random direction vectors (dx, dy)
            groundPos = vec2.fromValues(this.x + 96 * 1.5, HEIGHT - 16);
            let dx = (Math.random() - 0.5) * spread;
            let dy = (Math.random()) * 50;

                // Update the current position
                current[0] += dx;
                current[1] += dy;

                // Add the current position to the lightnings array
                lightnings.push(vec2.clone(current));
                count += 1;

                if(count % 10 == 0){
                    current = vec2.clone(krakPos);
                    spread += 10;
                }
            }

            context.save();
            context.strokeStyle = 'rgb(63, 160, 217)';
            context.fillStyle = 'rgb(153, 203, 232)';
            context.lineWidth = 5;
            const startingIndices = [0, 10, 20];

            // Loop through the starting indices
            for (const startIndex of startingIndices) {
            // Start a new path at the starting point
                context.beginPath();
                context.moveTo(lightnings[startIndex][0], lightnings[startIndex][1]);

                // Draw lines to connect the points within the lightning bolt segment
                for (let i = startIndex + 1; i < lightnings.length; i++) {
                    context.lineTo(lightnings[i][0], lightnings[i][1]);
                }

                // Stroke and fill the lightning bolt segment
                context.stroke();
                context.fill();
            }

            let kirbPos = vec2.fromValues(kirby.x + 32 * 1.5, kirby.y + 42 * 2);
            let kirbyDmgRad = 22*1.5;
            let lightningRad = 5;

            for(let i = 0; i < lightnings.length; i++){
                let kirbyDamaged = this.areCirclesOverlapping(kirbPos, kirbyDmgRad, lightnings[i], lightningRad);
                if(kirbyDamaged && !kirby.hurt){
                    //Apply knockback (everyone's favorite mechanic)
                    let diff = vec2.fromValues(0,0);
                    let rand = vec2.fromValues(0,0);
                    vec2.random(rand, -10);
                    vec2.subtract(diff, kirbPos, krakPos);
                    vec2.normalize(diff, diff);
                    vec2.scale(diff, diff, -5);
                    kirby.vx += diff[0] + rand[0];
                    kirby.vy += diff[1] + rand[1];
        
                    kirby.hurt = true;
                    kirby.invincibility_frames = 120;
                    kirby.lockout = 80;
                    kirby.health--;
                }
                
                if(debug.checked){
                    context.fillStyle = kirbyDamaged ? "red" : "blue";
                    context.beginPath();
                    context.arc(lightnings[i][0], lightnings[i][1], lightningRad, 0, 2 * Math.PI);
                    context.fill();
                }
            }
            
        }
        else {
            //Go back on the track back to the center!
            this.t = 3.1;
            this.state = KrakoState.SWEEP; //Kind of a cheat to get it back to the center ha
        }
    }

    move_to_target(targetX, targetY){
        // Create vectors for the target and current positions
        const target = vec2.fromValues(targetX, targetY);
        const current = vec2.fromValues(this.x + 96 * 1.5, this.y + 64 * 1.5);

        // Calculate the direction vector from current to target
        const direction = vec2.create();
        vec2.subtract(direction, target, current);
        vec2.normalize(direction, direction);

        // Define the speed at which the object moves
        const speed = 5;

        // Scale the direction vector by the speed
        vec2.scale(direction, direction, speed);

        // Update the object's position
        this.x += direction[0];
        this.y += direction[1];
    }

    update(){
        if(gameState == GameState.ACTIVE){
            if(this.state == KrakoState.READY){
                //Move to the desired location and then do the attack.
                this.attack_cooldown = Math.max(0, this.attack_cooldown - 1);
                if(this.attack_cooldown == 0){
                    this.state = this.attack_state;
                    this.attack_state = KrakoState.IDLE;
                }
            }

            else if(this.state === KrakoState.IDLE && (this.x >= WIDTH/2 - 96 * 1.5 && this.x <= WIDTH/2 + 96 * 1.5)){
                this.move_to_target(WIDTH/2, 64*1.5);
            }

            else if(this.state === KrakoState.IDLE && !(this.x >= WIDTH/2 - 96 * 1.5 && this.x <= WIDTH/2 + 96 * 1.5)){
                this.state = KrakoState.READY;
                this.attack_cooldown = 100;
                //Choose between one of the two attacks
                if(Math.random() < 0.5){
                    this.t = 0.2;
                    this.attack_state = KrakoState.LIGHTNING;
                }
                else {
                    this.t = 0.2;
                    this.attack_state = KrakoState.SWEEP;
                }
            }

            else if(this.state == KrakoState.SWEEP){
                this.sweep_attack();
            }
            else if(this.state == KrakoState.LIGHTNING){
                this.lightning_attack();
            }
        }

        this.animate();

        if(gameState == GameState.ACTIVE){
            this.invincibility_frames = Math.max(0, this.invincibility_frames-1);
            this.checkHit();
            this.hurt = this.invincibility_frames > 0;
        }
    }
}

//Curves
var Hermite = function(t) {
    return [
        2*t*t*t-3*t*t+1,
        t*t*t-2*t*t+t,
        -2*t*t*t+3*t*t,
        t*t*t-t*t
    ];
}

var HermiteDerivative = function(t) {
    return [
      6*t*t-6*t,
      3*t*t-4*t+1,
      -6*t*t+6*t,
      3*t*t-2*t
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

var C0 = function(t_) {return Cubic(Hermite,krako.sweep_curve[0],t_);};
var C1 = function(t_) {return Cubic(Hermite,krako.sweep_curve[1],t_);};
var C2 = function(t_) {return Cubic(Hermite,krako.sweep_curve[2],t_);};
var C3 = function(t_) {return Cubic(Hermite,krako.sweep_curve[3],t_);};

var interpolatePosition = function(t) {
    if (t<1){
        let u = t;
        return C0(u);
    } 
    else if (t >= 1 && t < 2){
        let u = t-1.0;
        return C1(u);
    } 
    else if(t >= 2 && t < 3){
        let u = t-2.0;
        return C2(u); 
    }
    else{
        let u = t-3.0;
        return C3(u);
    }
}

function moveToTx(loc,Tx)
{var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.moveTo(res[0],res[1]);}

function lineToTx(loc,Tx)
{var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.lineTo(res[0],res[1]);}

function drawTrajectory(t_begin,t_end,intervals,C,Tx,color) {
    context.strokeStyle=color;
    context.beginPath();
    moveToTx(C(t_begin),Tx);
    for(var i=1;i<=intervals;i++){
        var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
        lineToTx(C(t),Tx);
    }
    context.stroke();
}