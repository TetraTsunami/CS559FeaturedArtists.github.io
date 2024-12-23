const canvas = document.getElementById('dogCanvas');
const context = canvas.getContext('2d');
const speedControl = document.getElementById('speedControl');

let time = 0;
let speed = 2;
let mouseX = 0;
let mouseY = 0;

//event listener for mouse
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

//draw skybox with gradient effect
function drawSky() {
    //found this here, I like it, although it looks like colorbanding
    //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#E0F6FF");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

//make a blob for cloud, stack multiple for cool shapes ig
function drawCloud(x, y, size) {
    context.beginPath();
    context.arc(x, y, size, Math.PI * 0.5, Math.PI * 1.5);
    context.arc(x + size, y - size * 0.5, size * 0.75, Math.PI * 1, Math.PI * 2);
    context.arc(x + size * 1.5, y, size * 0.5, Math.PI * 1.5, Math.PI * 0.5);
    context.moveTo(x + size * 2, y);
    context.lineTo(x, y);
    context.fillStyle = "#FFFFFF";
    context.fill();
}

//simple tree that has swaying leaves
function drawTree(x, y, swayAngle) {
    context.save();
    context.translate(x, y);

    // Draw trunk
    context.fillStyle = '#8B4513';
    context.fillRect(-10, 0, 20, 100);

    // Draw leaves
    context.save();
    context.translate(0, -50);
    context.rotate(swayAngle);
    context.fillStyle = '#228B22';
    context.beginPath();
    context.moveTo(-50, 50);
    context.lineTo(0, -50);
    context.lineTo(50, 50);
    context.closePath();
    context.fill();

    context.translate(0, 40);
    context.beginPath();
    context.moveTo(-40, 40);
    context.lineTo(0, -40);
    context.lineTo(40, 40);
    context.closePath();
    context.fill();
    context.restore();

    context.restore();
}

// Draw green grass with triangles for blades
function drawGround() {
    context.fillStyle = '#8cbc5a';
    context.fillRect(0, 300, canvas.width, 100);

    // Add some grass blades across canvas
    context.strokeStyle = '#7bae4e';
    for (let i = 0; i < canvas.width; i += 10) {
        context.beginPath();
        context.moveTo(i, 300);
        context.lineTo(i + 5, 290);
        context.lineTo(i + 10, 300);
        context.stroke();
    }
}

//magnum opus, complex Buster
function drawDog(x, y, legAngle) {
    context.save();
    context.translate(x, y);

    // Body movement
    const bodyBob = Math.sin(legAngle * 2) * 5;
    context.translate(0, bodyBob);

    // Body
    context.fillStyle = '#000000';
    context.beginPath();
    context.ellipse(0, 0, 70, 40, 0, 0, 2 * Math.PI);
    context.fill();

    // Belly
    context.fillStyle = '#bc8f5f';
    context.beginPath();
    context.ellipse(0, 20, 60, 20, 0, 0, Math.PI);
    context.fill();

    // Head movement
    const headBob = Math.sin(legAngle * 2 + Math.PI / 2) * 3;
    context.save();
    context.translate(60, -30 + headBob);

    // Head
    context.fillStyle = '#000000';
    context.beginPath();
    context.ellipse(0, 0, 30, 30, 0, 0, 2 * Math.PI);
    context.fill();

    // Nose
    context.fillStyle = '#bc8f5f';
    context.beginPath();
    context.ellipse(25, 0, 20, 15, 0, 0, 2 * Math.PI);
    context.fill();

    // Ear
    context.fillStyle = '#000000';
    context.beginPath();
    context.ellipse(-10, -20, 10, 20, Math.PI / 4, 0, 2 * Math.PI);
    context.fill();

    // Eye
    context.fillStyle = '#FFFFFF';
    context.beginPath();
    context.arc(10, -10, 7, 0, 2 * Math.PI);
    context.fill();
    context.fillStyle = '#000000';
    context.beginPath();
    context.arc(12, -10, 3, 0, 2 * Math.PI);
    context.fill();

    // Nosetip
    context.fillStyle = '#000000';
    context.beginPath();
    context.ellipse(40, -5, 7, 5, 0, 0, 2 * Math.PI);
    context.fill();

    // Mouth
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(35, 5);
    context.quadraticCurveTo(25, 15, 15, 5);
    context.stroke();

    context.restore();
    //restored stack after head movement

    // Tail
    context.fillStyle = '#000000';
    context.save();
    context.translate(-60, -20);
    const tailWag = Math.sin(legAngle * 4) * 0.5;
    context.rotate(tailWag);
    context.beginPath();
    context.moveTo(0, 0);
    //read about this here:
    //https://www.w3schools.com/Tags/canvas_quadraticcurveto.asp#:~:text=The%20quadraticCurveTo()%20method%20adds%20a%20curve%20to%20the%20current%20path
    context.quadraticCurveTo(-20, -40, -40, -30);
    context.quadraticCurveTo(-30, -20, -40, -10);
    context.quadraticCurveTo(-20, 0, 0, 0);
    context.fill();
    context.restore();
    //restore stack after tail movement

    // draw legs function
    function drawLeg(x, y, angle, isBack) {
        context.save();
        context.translate(x, y);

        // Upper leg
        context.rotate(angle);
        context.fillStyle = '#000000';
        context.fillRect(-6, 0, 12, 30);

        // Lower leg, make separate to show off complex motion
        context.translate(0, 30);
        const lowerLegAngle = Math.sin(legAngle + (isBack ? Math.PI : 0)) * Math.PI / 6;
        context.rotate(lowerLegAngle);
        context.fillRect(-5, 0, 10, 25);

        // Paw
        context.translate(0, 25);
        context.fillStyle = '#bc8f5f';
        const pawSquish = Math.max(0, Math.sin(legAngle + (isBack ? Math.PI : 0)));
        context.scale(1 + 2 * pawSquish * 0.2, 1 - pawSquish * 0.2);
        context.beginPath();
        context.ellipse(0, 0, 8, 5, 0, 0, 2 * Math.PI);
        context.fill();

        context.restore();
    }

    // call draw leg
    drawLeg(40, 30, Math.sin(legAngle) * Math.PI / 8, false);
    drawLeg(20, 30, Math.sin(legAngle + Math.PI) * Math.PI / 8, false);
    drawLeg(-40, 30, Math.sin(legAngle + Math.PI) * Math.PI / 8, true);
    drawLeg(-20, 30, Math.sin(legAngle) * Math.PI / 8, true);

    context.restore();
    //restore stack after wacky leg movement
}

//draw everything
function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawSky();
    drawCloud(200 - time * speed * 0.5 % 900, 100, 30);
    drawCloud(500 - time * speed * 0.3 % 900, 50, 40);
    drawCloud(100 - time * speed * 0.3 % 900, 80, 50);
    drawCloud(600 - time * speed * 0.3 % 900, 70, 50);
    drawGround();

    //random number
    const treeSway = Math.sin(time * 2) * 0.05;
    drawTree(700, 200, treeSway);
    drawTree(200, 200, treeSway);

    // Calculate dog's position based on mouse cursor
    const dogX = mouseX;

    // Prevent the dog's Y position from being below ground level
    const dogY = Math.min(mouseY, 250);

    // Draw the dog with animated leg movement
    drawDog(dogX, dogY, time * speed);

    time += 0.05;
    requestAnimationFrame(animate);
}

speedControl.addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
});

animate();
