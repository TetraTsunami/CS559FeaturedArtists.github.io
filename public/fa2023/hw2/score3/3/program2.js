function setup() {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    document.body.style.background = "#051427";

    class Planet {
        constructor(dist) {
            this.x = 0;
            this.y = dist;
            this.dx = 0;
            this.dy = 1;
            this.rot = 0;
        }
    }

    var start = Date.now();

    var mercuryX = 0;
    var mercuryY = -200;
    var mercurydX = 0;
    var mercurydY = 1;
    function animateMercury() {
        if (mercuryY > -110) {
            mercurydY *= -1;
        }
        mercuryX += mercurydX;
        mercurydY += .17;
        mercuryY += mercurydY;
        drawMercury(mercuryX, mercuryY);
    }

    function drawMercury(x, y) {
        context.translate(x, y);
        context.beginPath();
        context.fillStyle = "#8c8c94";
        context.arc(0, 0, 12, 0, 2 * Math.PI);
        context.fill();
    }

    var venusX = 0;
    var venusY = -220;
    var venusdX = 0;
    var venusdY = 1;
    function animateVenus() {
        if (venusY > -110) {
            venusdY *= -1;
        }
        venusX += venusdX;
        venusdY += .16;
        venusY += venusdY;
        drawVenus(venusX, venusY);
    }

    function drawVenus(x, y) {
        context.translate(x, y);
        context.beginPath();
        context.fillStyle = "#a57c1b";
        context.arc(0, 0, 16, 0, 2 * Math.PI);
        context.fill();
    }

    var moonX = 0;
    var moonY = -70;
    var moondX = 0;
    var moondY = 1;
    function animateMoon() {
        if (moonY > -35) {
            moondY *= -1;
        }
        moonX += moondX;
        moondY += .09;
        moonY += moondY;
        drawMoon(moonX, moonY);
    }

    function drawMoon(x, y) {
        context.translate(x, y);
        context.beginPath();
        context.fillStyle = "#c9c9c9";
        context.arc(0, 0, 10, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.fillStyle = "#91a3b0";
        context.arc(5, 1, 5, 0, 2 * Math.PI);
        context.arc(-3, -3, 4, 0, 2 * Math.PI);
        context.fill();
    }

    var earthX = 0;
    var earthY = -260;
    var earthdX = 0;
    var earthdY = 1;
    var earthRot = 0;
    function animateEarth() {
        if (earthY > -128) {
            earthdY *= -1;
        }
        earthX += earthdX;
        earthdY += .15;
        earthY += earthdY;
        drawEarth(earthX, earthY);
    }

    function drawEarth(x, y) {
        context.translate(x, y);
        earthRot += Math.PI / 32;
        context.rotate(earthRot % (2 * Math.PI));

        context.beginPath();
        context.fillStyle = "#6b93d6";
        context.arc(0, 0, 25, 0, 2 * Math.PI);
        context.fill(); 
        context.beginPath();
        context.fillStyle = "#9fc164";
        context.arc(-2, -10, 10, 0, 2 * Math.PI);
        context.fill();
    }

    var marsX = 0;
    var marsY = -300;
    var marsdX = 0;
    var marsdY = 1;
    var marsRot = 0;
    function animateMars() {
        if (marsY > -115) {
            marsdY *= -1;
        }
        marsX += marsdX;
        marsdY += .13;
        marsY += marsdY;
        drawMars(marsX, marsY);
    }

    function drawMars(x, y) {
        context.translate(x, y);
        marsRot += Math.PI / 32;
        context.rotate(marsRot % (2 * Math.PI));

        context.beginPath();
        context.fillStyle = "#c1440e";
        context.arc(0, 0, 20, 0, 2 * Math.PI);
        context.fill(); 
        context.beginPath();
        context.fillStyle = "#451804";
        context.arc(-2, -10, 10, 0, 2 * Math.PI);
        context.fill();
    }

    var jupiterX = 0;
    var jupiterY = -470;
    var jupiterdX = 0;
    var jupiterdY = 1;
    var jupiterRot = 0;
    function animateJupiter() {
        if (jupiterY > -160) {
            jupiterdY *= -1;
        }
        jupiterX += jupiterdX;
        jupiterdY += .09;
        jupiterY += jupiterdY;
        drawJupiter(jupiterX, jupiterY);
    }

    function drawJupiter(x, y) {
        context.translate(x, y);
        jupiterRot += Math.PI / 256;
        context.rotate(jupiterRot % (2 * Math.PI));

        context.beginPath();
        context.fillStyle = "#e3dccb";
        context.arc(0, 0, 60, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.fillStyle = "#ebf3f6";
        context.ellipse(0, 20, 50, 5, 0, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.fillStyle = "#D39C7E";
        context.ellipse(0, -7, 60, 5, 0, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.fillStyle = "#ebf3f6";
        context.ellipse(0, -20, 50, 5, 0, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.fillStyle = "#c99039";
        context.ellipse(-10, 20, 20, 10, 0, 0, 2 * Math.PI);
        context.fill();
    }

    var jMoonX = 0;
    var jMoonY = -120;
    var jMoondX = 0;
    var jMoondY = 1;
    function animateJMoon() {
        if (jMoonY > -65) {
            jMoondY *= -1;
        }
        jMoonX += jMoondX;
        jMoondY += .02;
        jMoonY += jMoondY;
        drawJMoon(jMoonX, jMoonY);
    }

    function drawJMoon(x, y) {
        context.translate(x, y);
        context.beginPath();
        context.fillStyle = "#c9c9c9";
        context.arc(0, 0, 15, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.fillStyle = "#91a3b0";
        context.arc(5, 1, 5, 0, 2 * Math.PI);
        context.arc(-3, -3, 4, 0, 2 * Math.PI);
        context.fill();
    }

    var saturnX = 0;
    var saturnY = -550;
    var saturndX = 0;
    var saturndY = 1;
    var saturnRot = 0;
    function animateSaturn() {
        if (saturnY > -130) {
            saturndY *= -1;
        }
        saturnX += saturndX;
        saturndY += .09;
        saturnY += saturndY;
        drawSaturn(saturnX, saturnY);
    }

    function drawSaturn(x, y) {
        context.translate(x, y);
        saturnRot += Math.PI / 256;
        context.rotate(saturnRot % (2 * Math.PI));

        context.beginPath();
        context.fillStyle = "#e3e0c0";
        context.arc(0, 0, 40, 0, 2 * Math.PI);
        context.fill(); 
        context.beginPath();
        context.fillStyle = "#ceb8b8";
        context.ellipse(0, 0, 70, 5, 0, 0, 2 * Math.PI);
        context.fill();
    }

    var titanX = 0;
    var titanY = -120;
    var titandX = 0;
    var titandY = 1;
    function animateTitan() {
        if (titanY > -60) {
            titandY *= -1;
        }
        titanX += titandX;
        titandY += .1;
        titanY += titandY;
        drawTitan(titanX, titanY);
    }

    function drawTitan(x, y) {
        context.translate(x, y);
        context.beginPath();
        context.fillStyle = "#dc8407";
        context.arc(0, 0, 17, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
    }

    var uranusX = 0;
    var uranusY = -600;
    var uranusdX = 0;
    var uranusdY = 1;
    function animateUranus() {
        if (uranusY > -130) {
            uranusdY *= -1;
        }
        uranusX += uranusdX;
        uranusdY += .08;
        uranusY += uranusdY;
        drawUranus(uranusX, uranusY);
    }

    function drawUranus(x, y) {
        context.translate(x, y);

        context.beginPath();
        context.fillStyle = "#d1e7e7";
        context.arc(0, 0, 35, 0, 2 * Math.PI);
        context.fill();
    }

    var neptuneX = 0;
    var neptuneY = -550;
    var neptunedX = 0;
    var neptunedY = 1;
    function animateNeptune() {
        if (neptuneY > -135) {
            neptunedY *= -1;
        }
        neptuneX += neptunedX;
        neptunedY += .08;
        neptuneY += neptunedY;
        drawNeptune(neptuneX, neptuneY);
    }

    function drawNeptune(x, y) {
        context.translate(x, y);

        context.beginPath();
        context.fillStyle = "#5b5ddf";
        context.arc(0, 0, 40, 0, 2 * Math.PI);
        context.fill(); 
    }

    var tritonX = 0;
    var tritonY = -120;
    var tritondX = 0;
    var tritondY = 1;
    function animateTriton() {
        if (tritonY > -57) {
            tritondY *= -1;
        }
        tritonX += tritondX;
        tritondY += .1;
        tritonY += tritondY;
        drawTriton(tritonX, tritonY);
    }

    function drawTriton(x, y) {
        context.translate(x, y);
        context.beginPath();
        context.fillStyle = "#b3ded9";
        context.arc(0, 0, 15, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
    }

    var sunRot = 0;
    function drawSun() {
        sunRot += Math.PI / 256;
        context.rotate(sunRot % (2 * Math.PI));

        context.beginPath();
        context.fillStyle = "#FDB813";
        context.arc(0, 0, 100, 0, 2 * Math.PI);
        context.fill(); 
    }

    function animate() {
        context.save(); // save translate to middle
        context.clearRect(-canvas.width, -canvas.height, 2 * canvas.width, 2 * canvas.height);
        drawSun();

        context.save();
        context.rotate(2 * Math.PI / 3)
        animateMercury();
        context.restore(); // back to sun coords

        context.save();
        context.rotate(Math.PI / 3)
        animateVenus();
        context.restore();

        context.save();
        animateEarth();
        context.save();
        animateMoon();
        context.restore(); // back to earth coords
        context.restore(); // back to sun coords

        context.save();
        context.rotate(Math.PI);
        animateMars();
        context.restore();

        context.save();
        context.rotate(3 * Math.PI / 2);
        animateJupiter();
        context.save();
        context.rotate(Math.PI / 4);
        animateJMoon();
        context.restore(); // back to jupiter
        context.save();
        context.rotate(Math.PI / 4 + Math.PI / 3);
        animateJMoon();
        context.restore();
        context.save();
        context.rotate(Math.PI + Math.PI /6);
        animateJMoon();
        context.restore();
        context.save();
        context.rotate(-Math.PI / 3);
        animateJMoon();
        context.restore();
        context.restore(); // back to sun

        context.save();
        context.rotate(Math.PI / 4 + Math.PI);
        animateSaturn();
        context.save();
        animateTitan();
        context.restore(); // back to saturn
        context.restore(); // back to sun

        context.save();
        context.rotate(Math.PI / 6 * 5);
        animateUranus();
        context.restore();

        context.save();
        context.rotate(Math.PI / 3 * 4/3);
        animateNeptune();
        context.save();
        animateTriton();
        context.restore(); // back to neptune
        context.restore(); // back to sun

        context.restore(); // back to middle

        // slow to stop
        if ((Date.now() - start) >= 12500) {
            mercurydY *= .92;
            venusdY *= .95;
            moondY *= .97;
            earthdY *= .95;
            marsdY *= .97;
            jupiterdY *= .98;
            saturndY *= .98;
            uranusdY *= .98;
            neptunedY *= .98;
            if ((Date.now() - start) >= 16000) {
                clearInterval(intervalID);
                context.restore(); // back to original coords
            }
        }
    }

    context.save();
    context.translate(500, 450);
    context.scale(.5, .5);
    const intervalID = setInterval(animate, 20);
}

window.onload = setup;