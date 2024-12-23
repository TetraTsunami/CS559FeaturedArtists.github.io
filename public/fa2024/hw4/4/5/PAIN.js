// HTML elements
const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');
const pathButton = document.getElementById('pathButton');
const glowButton = document.getElementById('glowButton');
const backgroundImg = new Image();

// state variables
let path = false;
let glow = false;
let time = 0;
let lastTimestamp = 0;
const deltaTime = 0.01;
const numSegments = 35;
const segmentDelay = 0.05;
const waveAmplitude = 0.5;
const waveSpeed = 2;
const bodySegments = [];
let earAngle = 0;
let earOscillationSpeed = 0.25;
let earAmplitude = 0.2;

// path variables
const stack = [mat3.create()];
const tangents = [];
const points = [
    [-36, -10.5],
    [-40, 12.5],
    [-25, 22.5],
    [-8, 7.5],
    [35, 17.5],
    [45, 2.5],
    [40, -5.5],
    [30, 0.5],
    [15, -4.5],
    [-10, -10.5],
    [-15, -20],
    [-20, -20],
    [-25, -8.5]
];
const orbs = [];
const numOrbs = 10;

window.onload = function () {
    pathButton.addEventListener("click", togglePath);
    glowButton.addEventListener("click", toggleGlow);

    // initialize tangents
    points.forEach((point, i) => {
        let tangent;
        if (i === 0) {
            tangent = computeTangent(points[0], points[1]);
        } else if (i === points.length - 1) {
            tangent = computeTangent(points[i - 1], points[i]);
        } else {
            tangent = computeTangent(points[i - 1], points[i + 1]);
        }
        tangents.push(tangent);
    });

    // initialize body
    for (let i = 0; i < numSegments; i++) {
        bodySegments.push({
            timeOffset: i * segmentDelay,
            position: vec2.create(),
            derivative: vec2.create()
        });
    }

    // initialize orbs
    for (let i = 0; i < numOrbs; i++) {
        orbs.push({
            angle: randomRange(0, Math.PI * 2), // Current angle in radians
            radius: randomRange(50, 150),        // Distance from dragon
            speed: randomRange(0.01, 0.03),      // Angular speed
            color: '#f8feee',             // Orb color
            size: randomRange(5, 15),             // Orb size
            radiusOscillationAmplitude: randomRange(10, 30),     // Amplitude of radius oscillation
            radiusOscillationFrequency: randomRange(1.5, 2.5),   // Frequency of radius oscillation
            phase: randomRange(0, Math.PI * 2),
            hasLightning: false,                  // Is lightning currently active
            lightningTimer: 0,                    // Timer for lightning duration
            nextLightning: randomRange(2, 5)      // Time until next lightning in seconds
        });
    }

    draw(0);
};

function draw(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = (timestamp - lastTimestamp) / 1000; // Convert to seconds
    lastTimestamp = timestamp;

    canvas.width = canvas.width;
    drawBackground();

    if (path) { drawPath() };
    drawDragon();

    time += deltaTime;
    updateOrbsWithLightning(deltaTime);

    // Get current head position for orb positioning
    const s = (time) % points.length;
    const i = Math.floor(s) % points.length;
    const t = s - i;
    const { position: headPosition } = getPositionAndDerivative(i, t);

    const transformMatrix = mat3.create();
    mat3.fromTranslation(transformMatrix, [canvas.width / 2, canvas.height / 2]);
    mat3.scale(transformMatrix, transformMatrix, [10, -10]);

    // Transform head position to canvas coordinates
    const transformedHead = vec2.create();
    vec2.transformMat3(transformedHead, headPosition, transformMatrix);

    earAngle += earOscillationSpeed;
    drawOrbs(transformedHead);

    requestAnimationFrame(draw);
}

function drawBackground() {
    backgroundImg.src = glow ? 'night.jpg' : 'day.png';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImg, 0, 0, 1000, 500);
}

function drawDragon() {
    const n = points.length;
    const s = (time) % n;
    const i = Math.floor(s) % n;
    const t = s - i;

    const { position: headPosition, derivative: headDerivative } = getPositionAndDerivative(i, t);
    vec2.normalize(headDerivative, headDerivative);

    // goes through each segment
    bodySegments.forEach(segment => {
        // offets segment movement in sequence
        const segmentTime = time - segment.timeOffset;
        const sSegment = ((segmentTime % n) + n) % n;
        const idxSegment = Math.floor(sSegment);
        const tSegment = sSegment - idxSegment;

        // Get position and derivative for the current segment
        const { position, derivative } = getPositionAndDerivative(idxSegment, tSegment);
        vec2.normalize(derivative, derivative);

        // wave offset to simulate movement
        const phase = (segment.timeOffset / numSegments) * Math.PI * 2 + time * waveSpeed;
        const waveOffset = waveAmplitude * Math.sin(phase);
        vec2.scaleAndAdd(position, position, computeNormal(derivative), waveOffset);

        // update computed position
        vec2.copy(segment.position, position);
        vec2.copy(segment.derivative, derivative);
    });

    // transformations
    stackSave();
    mat3.fromTranslation(stack[0], [canvas.width / 2, canvas.height / 2]);
    mat3.scale(stack[0], stack[0], [10, -10]);

    drawBody();
    drawHead(headPosition, headDerivative);

    stackRestore();
}

function drawHead(position, derivative) {
    const neckColor = glow ? "#b6ec84" : "#dddebc";
    const headColor = glow ? "#6f8a56" : "#90945c";
    const earColor = glow ? "#9bb074" : "#b7a879";
    const eyeWhiteColor = "#57b28b";
    const irisColor = "#d2c1e9";
    const pupilColor = "#8a849b";
    const eyeOutlineColor = "#d0f982";
    const hornColor = glow ? "#d8e594" : "#525c2c";

    context.save();

    const transformedPosition = vec2.create();
    vec2.transformMat3(transformedPosition, position, stack[0]);

    context.translate(transformedPosition[0], transformedPosition[1]);
    let angle = Math.atan2(derivative[1], derivative[0]);
    if (Math.abs(angle) > Math.PI / 2) {
        // Flip horizontally if moving left
        context.scale(-1, 1);
        angle = angle > 0 ? Math.PI - angle : -Math.PI - angle;
    }

    context.rotate(angle);

    const size = 100;

    const normal = computeNormal(derivative);
    context.translate(normal[0] * size * 0.01, normal[1] * size * 0.01);

    // neck
    context.fillStyle = neckColor;
    context.beginPath();
    context.ellipse(0, 0, size * 0.5, size * 0.3, 0, 0, 2 * Math.PI);
    context.fill();

    // ears
    context.fillStyle = earColor;
    const earFlopAngle = earAmplitude * Math.sin(earAngle);

    context.save();
    context.translate(-size * 0.45, -size * 0.05);
    context.rotate(earFlopAngle); // Apply oscillation
    context.beginPath();
    context.bezierCurveTo(
        -size * 0.35, -size * 0.15,
        -size * 0.05, -size * 0.15,
        size * 0.05, -size * 0.05
    );
    context.bezierCurveTo(
        -size * 0.05, size * 0.1,
        -size * 0.25, size * 0.1,
        -size * 0.45, -size * 0.05
    );
    context.closePath();
    context.fill();
    context.restore();

    // Right ear
    context.save();
    context.translate(size * 0.45, -size * 0.05);
    context.rotate(-earFlopAngle); // Apply mirrored oscillation
    context.beginPath();
    context.bezierCurveTo(
        size * 0.35, -size * 0.15,
        size * 0.05, -size * 0.15,
        -size * 0.05, -size * 0.05
    );
    context.bezierCurveTo(
        size * 0.05, size * 0.1,
        size * 0.25, size * 0.1,
        size * 0.45, -size * 0.05
    );
    context.closePath();
    context.fill();
    context.restore();

    // head
    context.fillStyle = headColor;
    context.beginPath();
    context.ellipse(50, 0, size * 0.4, size * 0.3, 0, 0, 2 * Math.PI);
    context.fill();

    // snout
    context.beginPath();
    context.ellipse(50 + size * 0.4, 0, size * 0.25, size * 0.15, 0, 0, 2 * Math.PI);
    context.fill();

    // eye
    context.fillStyle = eyeWhiteColor;
    context.beginPath();
    context.moveTo(50 - size * 0.25, -size * 0.05);
    context.bezierCurveTo(
        50 - size * 0.15, -size * 0.2,
        50 + size * 0.05, -size * 0.2,
        50 + size * 0.15, -size * 0.05
    );
    context.bezierCurveTo(
        50 + size * 0.05, size * 0.1,
        50 - size * 0.15, size * 0.1,
        50 - size * 0.25, -size * 0.05
    );
    context.closePath();
    context.fill();

    // iris
    context.fillStyle = irisColor;
    context.beginPath();
    context.arc(50 - size * 0.05, -size * 0.05, size * 0.08, 0, 2 * Math.PI);
    context.fill();

    // pupil
    context.fillStyle = pupilColor;
    context.beginPath();
    context.arc(50 - size * 0.05, -size * 0.05, size * 0.04, 0, 2 * Math.PI);
    context.fill();

    // eye outline
    context.strokeStyle = eyeOutlineColor;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(50 - size * 0.25, -size * 0.05);
    context.bezierCurveTo(
        50 - size * 0.15, -size * 0.2,
        50 + size * 0.05, -size * 0.2,
        50 + size * 0.15, -size * 0.05
    );
    context.bezierCurveTo(
        50 + size * 0.05, size * 0.1,
        50 - size * 0.15, size * 0.1,
        50 - size * 0.25, -size * 0.05
    );
    context.stroke();

    // horn
    context.fillStyle = hornColor;
    context.beginPath();
    context.bezierCurveTo(
        50 + size * 0.4, - size * 0.10,
        50 + size * 0.5, - size * 0.5,
        50 + size * 0.6, - size * 0.7
    );
    context.bezierCurveTo(
        50 + size * 0.4, - size * 0.45,
        50 + size * 0.3, - size * 0.35,
        50 + size * 0.2, - size * 0.20
    );
    context.closePath();
    context.fill();

    // Restore the canvas to its original state
    context.restore();
}

function drawBody() {
    stackSave();

    const topColor = glow ? "#6d976a" : "#dddebc";
    const middleColor = glow ? "#82b465" : "#3f4c32";
    const bottomColor = glow ? "#99e931" : "#95b75d";
    const spikeColor = glow ? "#e4f98d" : "#a2ad58";
    const middleToBottomGradient = createGradient(middleColor, bottomColor);
    const colors = { topColor, middleColor, bottomColor, spikeColor, middleToBottomGradient };

    context.lineWidth = 1.5;

    drawFilledBodySegment(colors.topColor, 0, 1);  // Draw between top and middle
    drawGradientBodySegment(colors.middleToBottomGradient, 1, 2);  // Draw gradient between middle and bottom

    drawBodyLines(colors);

    drawSpikes(bodySegments, stack, {
        color: spikeColor,
        lineWidth: 1.5,
        height: 1,
        baseLength: 1
    });

    drawLegs();
    drawTail();

    stackRestore();
}

function drawLegs() {
    const legColor = glow ? "#b6ec84" : "#dddebc";
    const footColor = glow ? "#6d976a" : "#90945c";
    const legWidth = 10;
    const legHeight = 50;
    const footWidth = 15;
    const footHeight = 10;

    // Attach legs to specific body segments (e.g., middle of the body)
    const frontLeftLegIndex = Math.floor(bodySegments.length * 0.3);
    const frontRightLegIndex = Math.floor(bodySegments.length * 0.3);
    const backLeftLegIndex = Math.floor(bodySegments.length * 0.7);
    const backRightLegIndex = Math.floor(bodySegments.length * 0.7);

    const legPositions = [
        bodySegments[frontLeftLegIndex].position,  // Front Left Leg
        bodySegments[frontRightLegIndex].position, // Front Right Leg
        bodySegments[backLeftLegIndex].position,   // Back Left Leg
        bodySegments[backRightLegIndex].position   // Back Right Leg
    ];

    legPositions.forEach((pos, i) => {
        stackSave();
        context.save();

        // Get the dragon's current transformation matrix
        const transformedPos = vec2.create();
        vec2.transformMat3(transformedPos, pos, stack[0]);

        // Translate to leg position
        context.translate(transformedPos[0], transformedPos[1]);

        // Determine if the leg is left or right for flipping
        const isLeftLeg = i % 2 === 0;
        if (!isLeftLeg) {
            context.scale(-1, 1); // Flip for right legs
        }

        // **Draw Leg**
        context.fillStyle = legColor;
        context.beginPath();
        context.rect(-legWidth / 2, 0, legWidth, legHeight);
        context.fill();

        // **Draw Foot**
        context.fillStyle = footColor;
        context.beginPath();
        context.ellipse(0, legHeight + footHeight / 2, footWidth / 2, footHeight / 2, 0, 0, 2 * Math.PI);
        context.fill();

        context.restore();
        stackRestore();
    });
}

function drawTail() {
    const tailColor = glow ? "#e4f98d" : "#a2ad58";
    const lastSegment = bodySegments[bodySegments.length - 1];
    const secondLastSegment = bodySegments[bodySegments.length - 2];

    const tangent = computeTangent(getOffsetPosition(secondLastSegment, 2), getOffsetPosition(lastSegment, 2));
    vec2.normalize(tangent, tangent);

    const normal = computeNormal(tangent);
    const tailBaseStart = vec2.create();
    const tailBaseEnd = vec2.create();

    vec2.scaleAndAdd(tailBaseStart, lastSegment.position, normal, 1.5); // Length of tail base
    vec2.scaleAndAdd(tailBaseEnd, lastSegment.position, normal, -2.5);

    // Calculate the tip of the tail
    const tailTip = vec2.create();
    vec2.scaleAndAdd(tailTip, lastSegment.position, tangent, 5); // Length of the tail

    // Draw the triangle-shaped tail
    context.fillStyle = tailColor;
    context.beginPath();
    moveToTx(tailBaseStart, stack[0]);
    lineToTx(tailBaseEnd, stack[0]);
    lineToTx(tailTip, stack[0]);
    context.closePath();
    context.fill();
}

function drawFilledBodySegment(color, offset1, offset2) {
    context.fillStyle = color;
    context.beginPath();
    moveToTx(bodySegments[0].position, stack[0]);

    for (let i = 1; i < bodySegments.length; i++) {
        lineToTx(bodySegments[i].position, stack[0]);
    }

    for (let i = bodySegments.length - 1; i >= 0; i--) {
        const offsetPos = getOffsetPosition(bodySegments[i], offset2);
        lineToTx(offsetPos, stack[0]);
    }

    context.closePath();
    context.fill();
}

function drawGradientBodySegment(gradient, offset1, offset2) {
    context.fillStyle = gradient;
    context.beginPath();

    moveToTx(getOffsetPosition(bodySegments[0], offset1), stack[0]);

    for (let i = 1; i < bodySegments.length; i++) {
        lineToTx(getOffsetPosition(bodySegments[i], offset1), stack[0]);
    }

    for (let i = bodySegments.length - 1; i >= 0; i--) {
        lineToTx(getOffsetPosition(bodySegments[i], offset2), stack[0]);
    }

    context.closePath();
    context.fill();
}

function drawBodyLines(colors) {
    const topPath = createPath();
    const middlePath = createPath();
    const bottomPath = createPath();

    drawMainBody(topPath, middlePath, bottomPath, colors.topColor, colors.middleColor, colors.bottomColor);
}

function drawMainBody(topPath, middlePath, bottomPath, topColor, middleColor, bottomColor) {
    context.strokeStyle = topColor;
    context.stroke(topPath);

    context.strokeStyle = middleColor;
    context.stroke(middlePath);

    context.strokeStyle = bottomColor;
    context.stroke(bottomPath);
}

function drawSpikes(bodySegments, stack, config) {
    const { color, lineWidth, height, baseLength } = config;
    context.strokeStyle = color;
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();

    for (let i = 1; i < bodySegments.length; i++) {
        const current = bodySegments[i];
        const previous = bodySegments[i - 1];

        // tangent and normal
        const tangent = computeTangent(previous.position, current.position);
        vec2.normalize(tangent, tangent);
        const normal = computeNormal(tangent);

        // base start and end points along the tangent
        const baseStart = vec2.create();
        vec2.scaleAndAdd(baseStart, current.position, tangent, -baseLength / 2);

        const baseEnd = vec2.create();
        vec2.scaleAndAdd(baseEnd, current.position, tangent, baseLength / 2);

        // the apex point along the normal
        const apex = vec2.create();
        vec2.scaleAndAdd(apex, current.position, normal, height);

        context.fillStyle = color;
        context.beginPath();
        moveToTx(baseStart, stack[0]); // Move to base start
        lineToTx(baseEnd, stack[0]);   // Draw to base end
        lineToTx(apex, stack[0]);      // Draw to apex
        context.closePath();            // Close the path to form a triangle

        context.fill();
    }

    context.stroke();
}

function updateOrbsWithLightning(deltaTimeSeconds) {
    orbs.forEach(orb => {
        // Update angle for movement
        orb.angle += orb.speed;
        if (orb.angle > Math.PI * 2) {
            orb.angle -= Math.PI * 2;
        }

        // Update lightning timers
        if (orb.hasLightning) {
            orb.lightningTimer -= deltaTimeSeconds;
            if (orb.lightningTimer <= 0) {
                orb.hasLightning = false;
                orb.nextLightning = randomRange(2, 5); // Schedule next lightning
            }
        } else {
            orb.nextLightning -= deltaTimeSeconds;
            if (orb.nextLightning <= 0) {
                orb.hasLightning = true;
                orb.lightningTimer = randomRange(0.2, 0.5); // Lightning duration between 0.2 to 0.5 seconds
            }
        }
    });
}

function drawOrbs(headPosition) {
    orbs.forEach(orb => {
        orb.angle += orb.speed;
        if (orb.angle > Math.PI * 2) {
            orb.angle -= Math.PI * 2;
        }

        const currentRadius = orb.radius +
            orb.radiusOscillationAmplitude * Math.sin(time * orb.radiusOscillationFrequency + orb.phase);

        // Calculate orb position relative to the dragon's head
        const orbX = headPosition[0] + currentRadius * Math.cos(orb.angle);
        const orbY = headPosition[1] + currentRadius * Math.sin(orb.angle);

        // Create radial gradient for glow
        const gradient = context.createRadialGradient(orbX, orbY, 0, orbX, orbY, orb.size);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(0.75, 'rgba(152,243,162,1)');
        gradient.addColorStop(0.8, 'rgba(109,228,138,0.75)');
        gradient.addColorStop(1, 'rgba(78,166,114,0.5)');

        // Draw the orb
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(orbX, orbY, orb.size, 0, 2 * Math.PI);
        context.fill();

        // If the orb has lightning, draw it
        if (orb.hasLightning) {
            // Temporarily set orb's position for lightning drawing
            orb.position = [orbX, orbY];
            drawLightning(orb);
        }
    });
}

function drawLightning(orb) {
    const numBolts = 2; // Number of lightning bolts per orb
    const maxSegments = 5; // Maximum number of segments per bolt
    const boltLength = orb.size * 5; // Length of each bolt

    for (let i = 0; i < numBolts; i++) {
        const startAngle = randomRange(-Math.PI / 4, Math.PI / 4); // Random angle variation
        const boltPath = [];

        // Starting point at the orb's position
        const startX = orb.position[0];
        const startY = orb.position[1];
        boltPath.push([startX, startY]);

        // Generate random points for the bolt
        let currentX = startX;
        let currentY = startY;
        let currentAngle = orb.angle + startAngle;

        for (let j = 0; j < maxSegments; j++) {
            const segmentLength = boltLength / maxSegments;
            currentX += segmentLength * Math.cos(currentAngle + randomRange(-0.3, 0.3));
            currentY += segmentLength * Math.sin(currentAngle + randomRange(-0.3, 0.3));
            boltPath.push([currentX, currentY]);

            // Slightly change the angle for a jagged effect
            currentAngle += randomRange(-0.2, 0.2);
        }

        // Draw the bolt with varying opacity
        const opacity = randomRange(0.7, 1); // Random opacity between 0.7 and 1
        context.strokeStyle = `rgba(255, 255, 255, ${opacity})`; // White color with variable opacity
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(boltPath[0][0], boltPath[0][1]);
        for (let k = 1; k < boltPath.length; k++) {
            context.lineTo(boltPath[k][0], boltPath[k][1]);
        }
        context.stroke();
    }
}

function drawPath() {
    stackSave();
    mat3.fromTranslation(stack[0], [canvas.width / 2, canvas.height / 2]);
    mat3.scale(stack[0], stack[0], [10, -10]);

    points.forEach((P_start, i) => {
        const T_start = tangents[i];
        const P_end = points[(i + 1) % points.length];
        const T_end = tangents[(i + 1) % tangents.length];
        drawSegment(P_start, T_start, P_end, T_end);
    });

    stackRestore();
}

function drawCircle(position) {
    const transformedPosition = vec2.create();
    vec2.transformMat3(transformedPosition, position, stack[0]);

    const color = glow ? "#fffa65" : "#3d4035";
    context.fillStyle = color;
    context.beginPath();
    context.arc(transformedPosition[0], transformedPosition[1], 3, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
}

function createPath() {
    const path = new Path2D();
    path.moveTo(bodySegments[0].position[0], bodySegments[0].position[1]);

    for (let i = 1; i < bodySegments.length; i++) {
        path.lineTo(bodySegments[i].position[0], bodySegments[i].position[1]);
    }
    return path;
}

function createGradient(color1, color2) {
    const middlePositions = bodySegments.map(segment => getOffsetPosition(segment, 1));
    const bottomPositions = bodySegments.map(segment => getOffsetPosition(segment, 2));

    const transformedMiddle = middlePositions.map(pos => vec2.transformMat3(vec2.create(), pos, stack[0]));
    const transformedBottom = bottomPositions.map(pos => vec2.transformMat3(vec2.create(), pos, stack[0]));

    const minY = Math.min(...transformedMiddle.concat(transformedBottom).map(p => p[1]));
    const maxY = Math.max(...transformedMiddle.concat(transformedBottom).map(p => p[1]));

    const centerX = transformedMiddle.concat(transformedBottom).reduce((acc, pos) => acc + pos[0], 0) / transformedMiddle.length;

    const gradient = context.createLinearGradient(centerX, minY, centerX, maxY);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    return gradient;
}

function stackSave() { stack.unshift(mat3.clone(stack[0])); }

function stackRestore() { return stack.shift(); }

function moveToTx(loc, Tx) { const res = vec2.create(); vec2.transformMat3(res, loc, Tx); context.moveTo(res[0], res[1]); }

function lineToTx(loc, Tx) { const res = vec2.create(); vec2.transformMat3(res, loc, Tx); context.lineTo(res[0], res[1]); }

function interpolatePosition(i, t) {
    const start = points[i];
    const startTangent = tangents[i];
    const end = points[(i + 1) % points.length];
    const endTangent = tangents[(i + 1) % points.length];
    return Cubic(Hermite, [start, startTangent, end, endTangent], t);
}

function interpolateSegmentPosition(segmentTime) {
    const sSegment = (segmentTime % points.length + points.length) % points.length;
    const idx = Math.floor(sSegment);
    const t = sSegment - idx;
    return interpolatePosition(idx, t);
}

function computeTangent(start, end) {
    const tangent = vec2.create();
    vec2.sub(tangent, end, start);
    vec2.scale(tangent, tangent, 0.5);
    return tangent;
}

function computeNormal(derivative) {
    const normalized = vec2.create();
    vec2.normalize(normalized, derivative);
    return vec2.fromValues(-normalized[1], normalized[0]);
}

function getPositionAndDerivative(i, t) {
    const position = Cubic(Hermite, [points[i], tangents[i], points[(i + 1) % points.length], tangents[(i + 1) % tangents.length]], t);
    const derivative = Cubic(HermiteDerivative, [points[i], tangents[i], points[(i + 1) % points.length], tangents[(i + 1) % tangents.length]], t);
    return { position, derivative };
}

function getOffsetPosition(segment, scale = 1) {
    const normal = computeNormal(segment.derivative);
    const offsetPosition = vec2.create();
    vec2.scaleAndAdd(offsetPosition, segment.position, normal, scale);
    return offsetPosition;
}

function drawSegment(P_start, T_start, P_end, T_end) {
    const P = [P_start, T_start, P_end, T_end];
    const curve = (t) => Cubic(Hermite, P, t);
    drawTrajectory(0, 1, 100, curve, stack[0], 'red');
}

function drawTrajectory(t_begin, t_end, intervals, curve, Tx, color) {
    context.strokeStyle = color;
    context.beginPath();
    moveToTx(curve(t_begin), Tx);
    const delta = (t_end - t_begin) / intervals;
    for (let i = 1; i <= intervals; i++) {
        const t = t_begin + i * delta;
        lineToTx(curve(t), Tx);
    }
    context.stroke();
}

const Hermite = function (t) {
    return [
        2 * t ** 3 - 3 * t ** 2 + 1,    // h1(t)
        t ** 3 - 2 * t ** 2 + t,        // h2(t)
        -2 * t ** 3 + 3 * t ** 2,       // h3(t)
        t ** 3 - t ** 2                 // h4(t)
    ];
}

const HermiteDerivative = function (t) {
    return [
        6 * t * t - 6 * t,          // h1'(t)
        3 * t * t - 4 * t + 1,      // h2'(t)
        -6 * t * t + 6 * t,         // h3'(t)
        3 * t * t - 2 * t           // h4'(t)
    ];
};

function Cubic(basis, P, t) { // P = [P0, T0, P1, T1]
    const b = basis(t); // Compute basis functions at t
    const result = vec2.create();
    vec2.scale(result, P[0], b[0]);               // result = P0 * h1(t)
    vec2.scaleAndAdd(result, result, P[1], b[1]); // result += T0 * h2(t)
    vec2.scaleAndAdd(result, result, P[2], b[2]); // result += P1 * h3(t)
    vec2.scaleAndAdd(result, result, P[3], b[3]); // result += T1 * h4(t)
    return result;
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function togglePath() {
    path = !path;
    pathButton.textContent = path ? "Hide Path" : "Show Path";
}

function toggleGlow() {
    glow = !glow;
    glowButton.textContent = glow ? "Light Mode" : "Dark Mode";
}