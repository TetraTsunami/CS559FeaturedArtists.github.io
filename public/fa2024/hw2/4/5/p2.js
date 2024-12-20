const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

class Flower {
    constructor(x, y, petalColor) {
        this.x = x;
        this.y = y;
        this.stemHeight = 100 + Math.random() * 50;
        this.petalColor = petalColor;
        this.swayAngle = 0;
        this.swaySpeed = 0.02 + Math.random() * 0.02;
        this.swayAmount = 0.1 + Math.random() * 0.1;
    }

    draw() {
        ctx.save();
        
        ctx.translate(this.x, canvas.height);
        
        this.swayAngle += this.swaySpeed;
        let sway = Math.sin(this.swayAngle) * this.swayAmount;
        ctx.rotate(sway);
        
        // Scale the flower to create a subtle "coming closer" effect
        let scale = 1 + Math.sin(this.swayAngle * 0.5) * 0.05;
        ctx.scale(scale, scale);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -this.stemHeight);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 5;
        ctx.stroke();
        
        ctx.save();

        ctx.translate(0, -this.stemHeight);
        
        // Draw petals
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i / 5) * Math.PI * 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(15, -20, 0, -40);
            ctx.quadraticCurveTo(-15, -20, 0, 0);
            ctx.fillStyle = this.petalColor;
            ctx.fill();
            ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        
        ctx.restore();
        ctx.restore();
    }
}

const flowers = [];
const flowerColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7'];

// Create flowers
for (let i = 0; i < 10; i++) {
    const x = Math.random() * canvas.width;
    const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    flowers.push(new Flower(x, 0, color));
}

function drawBackground() {
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#8FBC8F';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    flowers.forEach(flower => flower.draw());
    
    requestAnimationFrame(animate);
}

window.onload = animate;