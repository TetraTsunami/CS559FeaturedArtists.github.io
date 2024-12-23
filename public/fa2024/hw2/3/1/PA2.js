window.onload = function load() {"use strict";

    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var sunRadius = 40;

    // declare all the attributes for the planets
    // Some are randomly set
    var planetCount = 6;  
    var planetSizes = []; 
    var orbitSpeeds = []; 
    var orbitRadii = [120, 160, 200, 240, 280, 320];  
    var angles = [0, 0, 0, 0, 0, 0]; 
    var stars = []; 
    var colorFill = ['blue', 'green', 'red', 'orange', 'lightblue', 'purple'];

    // create a random function to assign
    // attribute values to planet size and orbit speed
    function randomValue(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Fill the list with all the sizes of planets and orbit speeds
    for (var i = 0; i < planetCount; i++) {
        planetSizes.push(randomValue(8, 30));  
        orbitSpeeds.push(randomValue(0.005, 0.02));  
    }

    // Generate 50 random white stars positios for the canvas
    function generateStars(count) {
        for (var i = 0; i < count; i++) {
            var x = Math.random() * canvas.width;
            var y = Math.random() * canvas.height;
            stars.push({ x: x, y: y });
        }
    }
    
    // Drawing 50 stars at random (x, y) co-ordinates
    function drawStars() {
        context.fillStyle = 'white';
        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            context.beginPath();
            context.arc(star.x, star.y, 2, 0, Math.PI * 2);
            context.fill();
        }
        
    }

    // Drawing the solar system
    function drawSolarSystem() {
        // clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // drawing the stars and saving the context
        drawStars();
        context.save();
       
        // Using centre of the canvas to draw the sun.
        context.translate(canvas.width / 2, canvas.height / 2);
        context.beginPath();
        context.arc(0, 0, sunRadius, 0, Math.PI * 2);
        context.fillStyle = 'yellow';
        context.fill();

        // drawing each planet
        for (var i = 0; i < planetCount; i++) {
            context.save(); // Save the current transformation state
            
            // drawing the orbit path of the planets
            context.beginPath();
            context.arc(0, 0, orbitRadii[i], 0, Math.PI * 2);
            context.strokeStyle = 'white';
            context.lineWidth = 1;
            context.stroke();
            
            // Adding rotation to the plants
            context.rotate(angles[i]);
            
            // Moving the planet's location to a set distance from the sun
            context.translate(orbitRadii[i], 0);

            // Drawing the planets
            context.beginPath();
            context.arc(0, 0, planetSizes[i], 0, Math.PI * 2);
            context.fillStyle = colorFill[i];
            context.fill();

            // Restore the transformation state before drawing the next planet
            context.restore(); 
        }
        // Restore transformation state
        context.restore();

        // Adjusting rotation angle based on speed for each planet
        for (var i = 0; i < planetCount; i++) {
            angles[i] += orbitSpeeds[i]; 
        }

        // Next frame of animation
        requestAnimationFrame(drawSolarSystem);
    }

    // call drawing methods
    generateStars(50); 
    drawSolarSystem(); 
};
