function setup() { "use strict";
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    var slider1 = document.getElementById('slider1');
    var slider2 = document.getElementById('slider2');
    var hueCat = 0;

    slider1.value = 50;
    slider2.value = 50;

    var particles = [];
    const particleSpawnRadius = 320;

    function drawHeart(color, x = 0, y = 0) {
        ctx.save();
        ctx.globalAlpha = Number(slider2.value) / 100;
        ctx.translate(x + (Number(slider1.value) - 50) * 0.8, y);
        ctx.beginPath();
        ctx.fillStyle = color
        ctx.moveTo(75,45);
        ctx.bezierCurveTo(75,35,70,25,50,25);
        ctx.bezierCurveTo(20,25,20,60,20,60);
        ctx.bezierCurveTo(20,80,40,100,75,120);
        ctx.bezierCurveTo(110,100,130,80,130,60);
        ctx.bezierCurveTo(130,60,130,25,100,25);
        ctx.bezierCurveTo(85,25,75,35,75,40);
        ctx.fill();
        ctx.restore();
    }

    function drawCat(color) {
        ctx.save();
        ctx.translate(285, 240);
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.moveTo(100, 170);
        ctx.lineTo(150, 50);
        ctx.lineTo(220, 130);
        ctx.bezierCurveTo(300,110,340,110,420,130);
        ctx.lineTo(490, 50);
        ctx.lineTo(540, 170);
        ctx.bezierCurveTo(620,230,620,350,540,410);
        ctx.bezierCurveTo(430,490,210,490,100,410);
        ctx.bezierCurveTo(20,350,20,230,100,170);
        ctx.closePath();
        ctx.moveTo(270, 340);
        ctx.lineTo(370, 340);
        ctx.bezierCurveTo(368,415,272,415,270,340);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
    function animateCat(){
        hueCat = hueCat % 360 + 1;
        drawCat(`hsl(${hueCat}, 80%, 50%)`);
    }

    function drawEyes(){
        drawHeart("hsl(330, 90%, 60%)", 145 + 285, 175 + 240);
        drawHeart("hsl(330, 90%, 60%)", 345 + 285, 175 + 240);
    }

    function addParticle(){
        const angle = Math.random() * Math.PI * 2;
        const x = canvas.width / 2 + particleSpawnRadius * Math.cos(angle);
        const y = canvas.height / 2 + particleSpawnRadius * Math.sin(angle);

        const vx = -Math.sin(angle);
        const vy = Math.cos(angle);

        particles.push({
            x, y, 
            vx, vy
        });
    }

    function drawParticles(){
        ctx.save();
        ctx.fillStyle = `hsl(${360 - hueCat}, 80%, 50%)`;

        particles.forEach(p => {
            p.x += p.vx; 
            p.y += p.vy;
        });
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); 
            ctx.fill();
        });

        ctx.restore();
    }

    var cnt = 0;
    function animate(){
        canvas.width = canvas.width;
        drawParticles();
        drawEyes();

        if (cnt++ > 0) {
            addParticle();
            cnt = 0;
            if (particles.length >= 1500) {
                particles = [];
            }
        }
        animateCat();

        requestAnimationFrame(animate);
        // console.log(particles.length);
    }

    slider1.addEventListener("input", drawEyes);
    slider2.addEventListener("input", drawEyes);

    animate();
}

window.onload = setup;


