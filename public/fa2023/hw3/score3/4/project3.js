function createPlanetGradient(context, c1, c2, c3) {
    var gradient = context.createRadialGradient(0, 0, 0, 0, 0, 50);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(0.5, c2); 
    gradient.addColorStop(1, c3);
    return gradient;
}

function infoString(name, yearsInRotation, AU, avgTemp, mass){
    var planetInfo = name + ":<br>Number of earth years to travel around the sun: " + 
    yearsInRotation + "<br>Distance from the sun: " + AU + "<br>"
    + "The average temp is: " + avgTemp + " degrees F<br>Total Mass of planet: " + mass; 

    return planetInfo;
}

function setup() { 

    var canvas = document.getElementById('theCanvas');
    var context = canvas.getContext('2d');

    var slider1 = document.getElementById('slider1');
    slider1.value = 0;
    var slider2 = document.getElementById('slider2');
    slider2.value = 0;
    var slider3 = document.getElementById('slider3');
    slider3.value = 0.5;
    var planetSelect = document.getElementById('planetSelect'); 
    var rotationModifier = 1;
    var textContainer = document.getElementById("text-container");
    textContainer.innerHTML = infoString("Earth", "1", "1 AU", "59 degrees F", "5.97 x 10^24 kg");

    // Add an event listener to the dropdown to handle changes
    planetSelect.addEventListener('change', function () {
        // Get the selected option's value
        var selectedPlanet = planetSelect.value;

        switch (selectedPlanet) {
            case 'earth':
                rotationModifier = 1;
                textContainer.innerHTML = infoString("Earth", "1", "1 AU", "59 degrees F", "5.97 x 10^24 kg");
                break;
            case 'mercury':
                rotationModifier = 0.241;
                textContainer.innerHTML = infoString("Mercury", "0.24", "0.39 AU", "800", "3.3 x 10^23 kg");
                break;
            case 'venus':
                rotationModifier = 0.587;
                textContainer.innerHTML = infoString("Venus", "0.62", "0.72 AU", "900", "4.87 x 10^24 kg");
                break;
            case 'mars':
                rotationModifier = 1.887;
                textContainer.innerHTML = infoString("Mars", "1.88", "1.52 AU", "-80", "6.42 x 10^23 kg");
                break;
            case 'jupiter':
                rotationModifier = 11.905;
                textContainer.innerHTML = infoString("Jupiter", "11.86", "5.20 AU", "-145", "1.90 x 10^27 kg");
                break;
            case 'saturn':
                rotationModifier = 29.41;
                textContainer.innerHTML = infoString("Saturn", "29.46", "9.58 AU", "-290", "5.68 x 10^26 kg");
                break;
            case 'uranus':
                rotationModifier = 83.33;
                textContainer.innerHTML = infoString("Uranus", "84.02", "19.22 AU", "-320", "8.68 x 10^25 kg");
                break;
            case 'neptune':
                rotationModifier = 166.67; 
                textContainer.innerHTML = infoString("Neptune", "164.79", "30.07 AU", "-353","102.4 septillion kilograms");
                break; 
            default:
                rotationModifier = 1; 
                textContainer.innerHTML = infoString("Neptune", "164.79", "30.07 AU", "-353","102.4 septillion kilograms");
    }
    slider1.value = 0; 
    draw(); 
  });

    var stars = [];

    // Function to draw a star
    function drawStar(x, y) {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(x, y, 1, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    }

    // Function to initialize and draw stars
    function initStars() {
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 1000;
            const y = Math.random() * 1000;
            stars.push({ x, y });
        }
        stars.forEach(star => {
            drawStar(star.x, star.y);
        });
    }
    
    initStars(); 

    function redrawStars() {
        stars.forEach(star => {
            drawStar(star.x, star.y);
        });
    }

    function draw() {

        canvas.width = canvas.width;

        var earthRotate = slider1.value * 0.01 * Math.PI * rotationModifier; // Earth
        var mercuryRotate = slider1.value * 0.0415 * Math.PI * rotationModifier; // Mercury
        var venusRotate = slider1.value * 0.017 * Math.PI * rotationModifier; // Venus
        var marsRotate = slider1.value * 0.0053 * Math.PI * rotationModifier; // Mars
        var jupiterRotate = slider1.value * 0.00084 * Math.PI * rotationModifier; // Jupiter
        var saturnRotate = slider1.value * 0.00034 * Math.PI * rotationModifier; // Saturn
        var uranusRotate = slider1.value * 0.00012 * Math.PI * rotationModifier; // Uranus
        var neptuneRotate = slider1.value * 0.00006 * Math.PI * rotationModifier; // Neptune
        var moonRotate = slider2.value*0.01*Math.PI;
        var zoomScale = slider3.value;

        var stack = [ mat3.create() ]; 

        function moveToTx(x,y)  // Took off of class example 
	    {var res=vec2.create(); vec2.transformMat3(res,[x,y],stack[0]); context.moveTo(res[0],res[1]);}

	    function lineToTx(x,y) // Took off of class example 
	    {var res=vec2.create(); vec2.transformMat3(res,[x,y],stack[0]); context.lineTo(res[0],res[1]);}

        function arcTx(x, y, radius)
	    {var res=vec2.create(); vec2.transformMat3(res,[x,y],stack[0]); context.arc(res[0],res[1], radius, 0, 2 * Math.PI);}


        function planet(color, planetRotation) {

            context.beginPath();
            context.fillStyle = color;

            var currentMatrix = stack[0]; // Get the current transformation matrix
            var xScale = currentMatrix[0]; // Retrieve the x-axis scale from the matrix
            
            if (planetRotation == -1) { // Input for the sun
                arcTx(0,0,50 * zoomScale);
            } else if (planetRotation == -2) { // input for the moon 
                arcTx(0, 0, 5 * zoomScale)
            } 
            else {
                // Keeps the size of the planet the same with the change in scale from both the 
                // mat3.scale and mat3.rotate functions 
                arcTx(0, 0,50 * (xScale / Math.cos(planetRotation)));
            }
            context.closePath();
            context.fill();

        }

        function drawRings() {

            context.strokeStyle = 'white'; 
            context.lineWidth = 1; 

            context.beginPath();
            moveToTx(0, 0);
            lineToTx(60, 0);
            lineToTx(-60, 0) 
            context.closePath();
            context.stroke(); 

        }        
        function orbitPath(distance) {

            context.strokeStyle = 'white'; 
            context.lineWidth = 1; 

            context.beginPath(); 
            arcTx(0, 0, (distance) * zoomScale);
            context.closePath();
            context.stroke(); 

        }

        redrawStars(); 
        // create sun at center of canvas
        var Tsun_to_canvas = mat3.create(); 
        mat3.fromTranslation(Tsun_to_canvas,[500,500]);  
        mat3.scale(Tsun_to_canvas, Tsun_to_canvas, [zoomScale, zoomScale]); // Zoom adjusts the x translation of mercury??    
        mat3.multiply(stack[0], stack[0], Tsun_to_canvas);
        planet("#FFA500", -1); 

        stack.unshift(mat3.clone(stack[0])); 

        // Create Mercury Rotation
        var mercury_rotation = mat3.create(); 
        mat3.rotate(mercury_rotation, mercury_rotation, mercuryRotate);
        mat3.multiply(stack[0], stack[0], mercury_rotation);
        // Create mercury 
        var mercury_to_sun = mat3.create();
        mat3.fromTranslation(mercury_to_sun, [75,0]); 
        orbitPath(75); 
        mat3.scale(mercury_to_sun, mercury_to_sun, [0.2, 0.2]); 
        mat3.multiply(stack[0], stack[0], mercury_to_sun); 
        planet('grey', mercuryRotate); 

        stack.shift();
        stack.unshift(mat3.clone(stack[0])); 
        // Create venus rotation
        var venus_rotation = mat3.create(); 
        mat3.rotate(venus_rotation, venus_rotation, venusRotate);
        mat3.multiply(stack[0], stack[0], venus_rotation);
        // create venus 
        var venus_to_sun = mat3.create();
        mat3.fromTranslation(venus_to_sun, [125, 0]); 
        orbitPath(125); 
        mat3.scale(venus_to_sun, venus_to_sun, [0.3, 0.3]); 
        mat3.multiply(stack[0], stack[0], venus_to_sun); 
        planet(createPlanetGradient(context, '#FF6347', '#FF6347', 'orange'), venusRotate); 

        stack.shift(); 
        stack.unshift(mat3.clone(stack[0])); 
        // create earth rotation 
        var earth_rotation = mat3.create(); 
        mat3.rotate(earth_rotation, earth_rotation, earthRotate);
        mat3.multiply(stack[0], stack[0], earth_rotation);
        // create earth 
        var earth_to_sun = mat3.create();
        mat3.fromTranslation(earth_to_sun, [175, 0]);
        orbitPath(175); 
        mat3.scale(earth_to_sun, earth_to_sun, [0.3, 0.3]);
        mat3.multiply(stack[0], stack[0], earth_to_sun); 
        planet(createPlanetGradient(context, '#007FFF', '#40E0D0', '#228B22'), earthRotate);
        // create moon rotation
        var moon_rotation = mat3.create(); 
        mat3.rotate(moon_rotation, moon_rotation, moonRotate);
        mat3.multiply(stack[0], stack[0], moon_rotation);
        // create moon
        var moon_to_earth = mat3.create(); 
        mat3.fromTranslation(moon_to_earth, [75, 0]);
        mat3.scale(moon_to_earth, moon_to_earth, [0.3, 0.3]);
        orbitPath(25); 
        mat3.multiply(stack[0], stack[0], moon_to_earth); 
        planet('grey', -2);

        stack.shift(); 
        stack.unshift(mat3.clone(stack[0]));
        // create mars rotation
        var mars_rotation = mat3.create();
        mat3.rotate(mars_rotation, mars_rotation, marsRotate);
        mat3.multiply(stack[0], stack[0], mars_rotation);
        // create mars
        var mars_to_sun = mat3.create();
        mat3.fromTranslation(mars_to_sun, [225, 0]);
        orbitPath(225); 
        mat3.scale(mars_to_sun, mars_to_sun, [0.2, 0.2]);
        mat3.multiply(stack[0], stack[0], mars_to_sun); 
        planet(createPlanetGradient(context, '#FF4500', '#DC143C', '#8B0000'), marsRotate);

        stack.shift(); 
        stack.unshift(mat3.clone(stack[0])); 
        // create jupiter rotation
        var jupiter_rotation = mat3.create(); 
        mat3.rotate(jupiter_rotation, jupiter_rotation, jupiterRotate);
        mat3.multiply(stack[0], stack[0], jupiter_rotation);
        // create jupiter 
        var jupiter_to_sun = mat3.create();
        mat3.fromTranslation(jupiter_to_sun, [300, 0]);
        orbitPath(300); 
        mat3.scale(jupiter_to_sun, jupiter_to_sun, [0.5, 0.5]);
        mat3.multiply(stack[0], stack[0], jupiter_to_sun); 
        planet(createPlanetGradient(context, 'orange', 'orange', 'brown'), jupiterRotate);

        stack.shift(); 
        stack.unshift(mat3.clone(stack[0])); 
        // create saturn rotation
        var saturn_rotation = mat3.create(); 
        mat3.rotate(saturn_rotation, saturn_rotation, saturnRotate);
        mat3.multiply(stack[0], stack[0], saturn_rotation);
        // create saturn 
        var saturn_to_sun = mat3.create();
        mat3.fromTranslation(saturn_to_sun, [350, 0]);
        orbitPath(350); 
        mat3.scale(saturn_to_sun, saturn_to_sun, [0.4, 0.4]);
        mat3.multiply(stack[0], stack[0], saturn_to_sun); 
        planet('saddlebrown', saturnRotate);
        drawRings(); 

        stack.shift(); 
        stack.unshift(mat3.clone(stack[0])); 
        // create uranus rotation
        var uranus_rotation = mat3.create(); 
        mat3.rotate(uranus_rotation, uranus_rotation, uranusRotate);
        mat3.multiply(stack[0], stack[0], uranus_rotation);
        // create uranus 
        var uranus_to_sun = mat3.create();
        mat3.fromTranslation(uranus_to_sun, [400, 0]);
        orbitPath(400); 
        mat3.scale(uranus_to_sun, uranus_to_sun, [0.4, 0.4]);
        mat3.multiply(stack[0], stack[0], uranus_to_sun); 
        planet('lightseagreen', uranusRotate);

        stack.shift(); 
        stack.unshift(mat3.clone(stack[0])); 
        // create neptune rotation
        var neptune_rotation = mat3.create(); 
        mat3.rotate(neptune_rotation, neptune_rotation, neptuneRotate);
        mat3.multiply(stack[0], stack[0], neptune_rotation);
        // create neptune
        var neptune_to_sun = mat3.create();
        mat3.fromTranslation(neptune_to_sun, [450, 0]);
        orbitPath(450); 
        mat3.scale(neptune_to_sun, neptune_to_sun, [0.4, 0.4]);
        mat3.multiply(stack[0], stack[0], neptune_to_sun); 
        planet('blue', neptuneRotate);

    }

    slider1.addEventListener("input",draw);
    slider2.addEventListener("input",draw);
    slider3.addEventListener("input",draw);
    draw();
  }

  window.onload = setup;