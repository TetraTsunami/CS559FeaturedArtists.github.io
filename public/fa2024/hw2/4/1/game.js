async function loadVertices(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error("ERRRRRROOOOOR");
        }
        const vertices = await response.json(); 
        return vertices;
    } catch (error) {
        console.error(error);
        return [];
    }
}


async function world() {
    "use strict";
    const canvas = document.getElementById('canvas');    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    var slider1 = document.getElementById('slider1');
    var fovSlider = document.getElementById('fovSlider');
    

    if (!slider1 || !fovSlider) {
        console.error('Slider not found!');
        return;
    }

    slider1.value = 3;
    fovSlider.value = 65;
    let usePointer = 0;
    let yaw = 0; 
    let pitch = -0.13; 
    let dx = 800;
    let dy = 100;
    let dz = 5000;
    const origY = dy;
    var ego = { x: dx, y: dy, z: dz };
    let mouseSensitivityConst = 0.001;
    let mouseSensitivity = 0;
    const pitchLimit = Math.PI / 3 - 0.01; 
    let chargeStartTime = 0;
    let maxChargeTime = 3000; //ms
    let isCharging = false;
    let chargedBulletScale = 1;
    let shootingInterval = null;


    const base = [
        { x: 0, y: 2000, z: 0 },        
        { x: 4000, y: 2000, z: 0 },     
        { x: 4000, y: 2000, z: -4000 }, 
        { x: 0, y: 2000, z: -4000 }     
    ];

    const grid = [
        { x: 4000, y: 2000, z: 0 },
        { x: 3000, y: 2000, z: 0 },
        { x: 3000, y: 2000, z: -4000 },     
        { x: 2000, y: 2000, z: -4000 },
        { x: 2000, y: 2000, z: 0 },     
        { x: 1000, y: 2000, z: 0 }, 
        { x: 1000, y: 2000, z: -4000 },  
        { x: 0, y: 2000, z: -4000 },      
        { x: 0, y: 2000, z: -1000 },
        { x: 4000, y: 2000, z: -1000 },
        { x: 4000, y: 2000, z: -2000 },
        { x: 0, y: 2000, z: -2000 },
        { x: 0, y: 2000, z: -3000 },
        { x: 4000, y: 2000, z: -3000 }     
    ];

    const cube = [
        { x:   0, y:   0, z:   0 },       
        { x: 4000, y:   0, z:   0 },
        { x: 4000, y: 4000, z:   0 },
        { x:   0, y: 4000, z:   0 },
        { x:   0, y:   0, z:   0 },      
        
        { x:   0, y:   0, z: -4000 },
        { x:   0, y: 4000, z: -4000 },
        { x:   0, y: 4000, z:    0 }, 
        
        { x: 4000, y: 4000, z:    0 },
        { x: 4000, y: 4000, z: -4000 },
        { x:   0, y: 4000, z: -4000 }, 
        
        { x: 4000, y: 4000, z: -4000 },
        { x: 4000, y:   0, z: -4000 },
        { x: 4000, y:   0, z:    0 }, 

        { x: 4000, y:   0, z: -4000 },
        { x:   0, y:   0, z: -4000 },           
    ];

    const bulletTemplate = [
        { x:   0, y:   0, z:   0 },       
        { x:   9, y:   0, z:   0 },
        { x:   9, y:   9, z:   0 },
        { x:   0, y:   9, z:   0 },
        { x:   0, y:   0, z:   0 },      
        
        { x:   0, y:   0, z:  -57 },
        { x:   0, y:   9, z:  -57 },
        { x:   0, y:   9, z:   0 }, 
        
        { x:   9, y:   9, z:   0 },
        { x:   9, y:   9, z:  -57 },
        { x:   0, y:   9, z:  -57 }, 
        
        { x:   9, y:   9, z:  -57 },
        { x:   9, y:   0, z:  -57 },
        { x:   9, y:   0, z:   0 }, 

        { x:   9, y:   0, z:  -57 },
        { x:   0, y:   0, z:  -57 },           
    ];

    const gun = await loadVertices('gun.json');
    const muzzle = await loadVertices('fm.json');
    let bullets = [];
    const bulletSpeed = 1500;

    let isJumping = false;
    const jumpHeight = 600; 
    // const jumpSpeed = 5;
    let crouch = false;

    let cam2scrn = 1043;

    function calculateDistance(fov) {
        const fovRadians = (fov * Math.PI) / 180; 
        return (1600 / (2 * Math.tan(fovRadians / 2))).toFixed(2);
    }

    function renderScene() {
        const context = canvas.getContext('2d');
        if (!context) {
            console.error('Failed to get canvas context!');
            return;
        }
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);

        cam2scrn = calculateDistance(fovSlider.value);

        function translateObj(obj, x1, y1, z1) {
            return obj.map(point => ({
                x: point.x + x1,
                y: point.y + y1,
                z: point.z + z1
            }));
        }
        

        function projectPoint(point, camera) {
            const cosYaw = Math.cos(-yaw);
            const sinYaw = Math.sin(-yaw);
            const cosPitch = Math.cos(-pitch);
            const sinPitch = Math.sin(-pitch);
            const translatedX = point.x - camera.x;
            const translatedZ = point.z - camera.z;
            const translatedY = - point.y + camera.y;
        
            const rotatedX = translatedX * cosYaw - translatedZ * sinYaw;
            const rotatedZ = translatedX * sinYaw + translatedZ * cosYaw;
        
            const rotatedY = translatedY * cosPitch - rotatedZ * sinPitch;
            const finalZ = translatedY * sinPitch + rotatedZ * cosPitch;
        
            if (finalZ >= 0) return null;
        
            const xProjected = (rotatedX * cam2scrn) / -finalZ + canvas.width / 2;
            const yProjected = (rotatedY * cam2scrn) / -finalZ + canvas.height / 2;
        
            return { x: xProjected, y: yProjected };
        }

        function drawGroundSegments() {
            const startIndex = Math.floor(ego.z / -4000) - 1; 
            const segmentsBehind = 4; 
            const segmentsInFront = 4;

            for (let i = startIndex - segmentsBehind; i <= startIndex + segmentsInFront; i++) {
                if (i < 0) continue;
                const translatedBase = translateObj(base, 0, 0, -4000 * i);
                const translatedGrid = translateObj(grid, 0, 0, -4000 * i);
                const projectedBase = translatedBase.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
                const projectedGrid = translatedGrid.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
                
                if (projectedBase.length > 0 && projectedGrid.length > 0) {
                    drawWarpedBase(projectedBase, projectedGrid);
                }
            }
        }
        
        drawGroundSegments();

        const translatedCube = translateObj(cube, 0, -2000, 0);
        const projectedCube = translatedCube.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
        drawObj(projectedCube, "red", false); // Draw the walls !!! placeholder !!! FIX THIS LATER

        console.log("Rendering scene with", bullets.length, "bullets");
        bullets.forEach((bullet, index) => {
            const translatedBullet = translateObj(bullet.shape, bullet.position.x, bullet.position.y, bullet.position.z);
            const projectedBullet = translatedBullet.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
            if (projectedBullet.length > 0) {
                drawObj(projectedBullet, "blue", true);
            } 
        });

        // const translatedGun = translateObj(gun, ego.x+10, ego.y+250, ego.z-600); 
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);
        const cosPitch = Math.cos(pitch);
        const sinPitch = Math.sin(pitch);
        
        const translatedGun = gun.map(point => {
            let x = point.x + 10;
            let y = point.y + 300;
            let z = point.z - 600;
    
            const rotatedX = x * cosYaw - z * sinYaw;
            const rotatedZ = x * sinYaw + z * cosYaw;
            const rotatedY = y * cosPitch + rotatedZ * sinPitch;
            const finalZ = - y * sinPitch + rotatedZ * cosPitch;
    
            return {
                x: rotatedX + ego.x, 
                y: rotatedY + ego.y, 
                z: finalZ + ego.z
            };
        });
        

        const projectedGun = translatedGun.map(corner => projectPoint(corner, ego)).filter(point => point !== null);
        drawObj(projectedGun, "green", false, false);
    
    }

    // function isConvex(triangle) {
    //     const crossProduct = (v1, v2, v3) => {
    //         return (v2.x - v1.x) * (v3.y - v1.y) - (v2.y - v1.y) * (v3.x - v1.x);
    //     };
        
    //     const cp1 = crossProduct(triangle[0], triangle[1], triangle[2]);
    //     const cp2 = crossProduct(triangle[1], triangle[2], triangle[0]);
    //     return cp1 * cp2 >= 0;
    // }

    function drawObj(projectedPoints, objColor, closeShape = true, fillShape = false) {
        if (projectedPoints.length < 2) return;
        
        const context = canvas.getContext('2d');
        const flippedPoints = projectedPoints.map(point => ({
            x: point.x,
            y: canvas.height - point.y
        }));
        
        context.beginPath();
        context.moveTo(flippedPoints[0].x, flippedPoints[0].y);
        
        for (let i = 1; i < flippedPoints.length; i++) {
            context.lineTo(flippedPoints[i].x, flippedPoints[i].y);
        }
        
        if (closeShape) {
            context.lineTo(flippedPoints[0].x, flippedPoints[0].y); 
        }
    
        if (fillShape) {
            context.fillStyle = objColor;
            context.fill(); 
        } else {
            context.strokeStyle = objColor;
            context.lineWidth = 2;
            context.stroke();
        }
    }
    

    function drawWarpedBase(projectedBase, projectedGrid) {
        if (projectedBase.length < 2 || projectedGrid.length < 2) return;

        const context = canvas.getContext('2d');
        const flippedBaseCorners = projectedBase.map(point => ({
            x: point.x,
            y: canvas.height - point.y
        }));

        const flippedGridCorners = projectedGrid.map(point => ({
            x: point.x,
            y: canvas.height - point.y
        }));

        context.beginPath();
        context.moveTo(flippedBaseCorners[0].x, flippedBaseCorners[0].y);
        flippedBaseCorners.forEach((point, index) => {
            if (index > 0) {
                context.lineTo(point.x, point.y);
            }
        });
        context.closePath();
        let baseColor = dy - 2000 <= 0 ? '#909090' : '#202020';

        context.fillStyle = baseColor;
        context.fill();

        context.beginPath();
        flippedGridCorners.forEach((point, index) => {
            if (index === 0) {
                context.moveTo(point.x, point.y);
            } else {
                context.lineTo(point.x, point.y);
            }
        });
        context.closePath();
        context.strokeStyle = 'black';
        context.stroke();
    }

    canvas.addEventListener('mousemove', (event) => {
        const deltaX = event.movementX;
        const deltaY = event.movementY;
        yaw += deltaX * mouseSensitivity;
        pitch -= deltaY * mouseSensitivity; 
        if (pitch > pitchLimit) pitch = pitchLimit;
        if (pitch < -pitchLimit) pitch = -pitchLimit;
    });

    const keysPressed = {};
    let pace = 10; 

    document.addEventListener('keydown', (event) => {
        if (!event.repeat) {
            keysPressed[event.key] = true; 
    
            if (event.key === ' ') {
                crouch = false;
                ego.y = origY;  
                initiateJump();
            }
    
            if (event.key === 'c') { 
                crouch = !crouch;
                ego.y = crouch ? origY * 3 : origY; 
            }
        }
    });

    document.addEventListener('keyup', (event) => {
        keysPressed[event.key] = false; 
        resetMovement(); 
    });

    window.addEventListener('blur', () => {
        for (let key in keysPressed) {
            keysPressed[key] = false;
        }
        resetMovement();
    });

    function resetMovement() {
        pace = 0;
    }

    function updateMovement() {
        pace = keysPressed['Shift'] ? 133 : 90;   
        
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);

        if (keysPressed['d']) {
            ego.x += pace * cosYaw; 
            ego.z += pace * sinYaw;
        }
        if (keysPressed['a']) {
            ego.x -= pace * cosYaw; 
            ego.z -= pace * sinYaw;
        }

        if (keysPressed['w'] ) {
            ego.x += pace * sinYaw; 
            ego.z -= pace * cosYaw;
        }
        if (keysPressed['s']) {
            ego.x -= pace * sinYaw; 
            ego.z += pace * cosYaw;
        }

        updateBullets();

        renderScene();
        requestAnimationFrame(updateMovement);
    }

    function initiateJump() {
        if (isJumping) return;
        isJumping = true;
        let jumpProgress = 0;
        const originalY = ego.y;

        function jumpAnimation() {
            if (jumpProgress < 1) {
                ego.y = originalY - jumpHeight * Math.sin(Math.PI * jumpProgress);
                jumpProgress += 0.023; 
                requestAnimationFrame(jumpAnimation);
            } else {
                ego.y = originalY; 
                isJumping = false;
            }
        }
        jumpAnimation();
    }

    
    function updateBullets() {
        bullets.forEach((bullet, index) => {
            bullet.position.x += bullet.direction.x * bulletSpeed;
            bullet.position.y += bullet.direction.y * bulletSpeed;
            bullet.position.z += bullet.direction.z * bulletSpeed;
            console.log("Bullet loc:", bullet.position);

            const maxDistance = 50000;
            if (
                Math.abs(bullet.position.x - ego.x) > maxDistance ||
                Math.abs(bullet.position.y - ego.y) > maxDistance ||
                Math.abs(bullet.position.z - ego.z) > maxDistance
            ) {
                console.log("Removing bullet", index, "due to out-of-bounds position.");
                bullets.splice(index, 1);
            }
        });
    }

    function shoot(isCharged) {
        const scale = isCharged ? chargedBulletScale : 1;

        const offsetDistance = 50; 
        const startX = ego.x + offsetDistance * Math.cos(yaw) * Math.cos(pitch) + 150 ; 
        const startY = ego.y + offsetDistance * Math.sin(pitch) + 200 ; 
        const startZ = ego.z + offsetDistance * Math.sin(yaw) * Math.cos(pitch);

        const direction = {
            x: Math.cos(pitch) * Math.sin(yaw),  
            y: Math.sin(pitch),                  
            z: Math.cos(pitch) * Math.cos(yaw)   
        };
    
        const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
        direction.x /= magnitude;
        direction.y /= -magnitude;
        direction.z /= -magnitude;
    
        const scaledBulletShape = bulletTemplate.map(point => ({
            x: point.x * scale,
            y: point.y * scale,
            z: point.z * scale
        }));
    
        bullets.push({
            shape: JSON.parse(JSON.stringify(scaledBulletShape)),
            position: { x: startX, y: startY, z: startZ }, 
            direction: direction 
        });
    
        console.log("Bullet fired:", { startX, startY, startZ, direction, scale });
    }
    
    canvas.addEventListener('mousedown', (event) => {
        if (event.button === 2 && usePointer) { 
            isCharging = true;
            chargeStartTime = Date.now();
            console.log("Charging started.");
        }

        if (event.button === 0 && usePointer) {
            if (!shootingInterval) {
                shootingInterval = setInterval(() => {
                    shoot(false); 
                }, 100);
            }
        }
    });

    canvas.addEventListener('mouseup', (event) => {
        if (event.button === 2 && usePointer && isCharging) { 
            isCharging = false;
            const chargeDuration = Date.now() - chargeStartTime;

            if (chargeDuration >= 100) {
                chargedBulletScale = 5 + Math.min(chargeDuration / maxChargeTime, 1) * 10; 
                shoot(true); 
                chargedBulletScale = 1;
            }
        }

        if (event.button === 0 && usePointer) {
            clearInterval(shootingInterval);
            shootingInterval = null;
        }
    }); 


    requestAnimationFrame(updateMovement); 


    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            console.log('Pointer locked');
            usePointer = 1;
            mouseSensitivity = parseFloat(slider1.value) * mouseSensitivityConst;
        } else {
            console.log('Pointer unlocked');
            usePointer = 0;
            mouseSensitivity = 0;
        }
    });

    renderScene(); 
}

window.onload = world;
