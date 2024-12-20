function setup() {
    var canvas = document.getElementById('myCanvas');
    var slider = document.getElementById('slider');
    slider.value = 0.01;

    var context = canvas.getContext('2d');

    var wheelSpeed = parseFloat(slider.value);
    var wheelAngle = 0;

    var cartSpeed = parseFloat(slider.value) * 100;
    var cartAngle = 0;
    var cartDirection = 1;

    var armAngle = 0
    var armDirection = 1;

    function draw() {
        canvas.width = canvas.width;

        function DrawFerrisWheel() {
            context.clearRect(-200, -200, canvas.width, canvas.height);

            // Outer circle
            context.beginPath();
            context.arc(0, 0, 150, 0, 2*Math.PI);
            context.strokeStyle = "gray";
            context.lineWidth = 10;
            context.stroke();

            // Stand
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(-60, 200);
            context.moveTo(0, 0);
            context.lineTo(60, 200);
            context.stroke();

            var numSpokes = 8;
            for (var i = 0; i < numSpokes; i++) {
                var spokeAngle = wheelAngle + (Math.PI * 2 * i) / numSpokes;
                // Calculate spoke endpoint to translate to
                var x = Math.cos(spokeAngle) * 150;
                var y = Math.sin(spokeAngle) * 150;

                // Spoke
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(x, y);
                context.lineWidth = 5;
                context.stroke();

                // Lines holding cart
                context.save();
                context.translate(x, y);
                context.rotate(cartAngle * Math.PI / 180);
                context.beginPath();
                context.moveTo(0,0);
                context.lineTo(-10, 20);
                context.moveTo(0,0);
                context.lineTo(10, 20);
                context.strokeStyle = "Black";
                context.lineWidth = 2;
                context.stroke();

                // Cart
                context.beginPath();
                context.moveTo(-20, 20);
                context.lineTo(20, 20);
                context.lineTo(15, 35);
                context.lineTo(-15, 35);
                context.closePath();
                context.fillStyle = "DarkRed";
                context.fill();

                // Person inside cart
                context.save();
                context.translate(0, 15);
                context.beginPath();
                context.arc(0, 0, 5, 0, 2*Math.PI);
                context.closePath();
                context.fillStyle = "Tan";
                context.fill();

                // Moving arms of person
                context.translate(5, 5);
                context.rotate(armAngle * Math.PI / 180);
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(15, 0);
                context.strokeStyle = "Tan";
                context.lineWidth = 3;
                context.stroke();
                context.restore();

                context.restore(); // Back to center of Ferris wheel
            }

            wheelAngle += wheelSpeed;
            cartAngle += cartSpeed * cartDirection;
            if (cartAngle > 30 || cartAngle < -30) {
                cartDirection *= -1;
            }
            
            // If at stop, keep swinging carts until neutral position reached
            if (cartSpeed == 0 && cartAngle != 0) {
                cartAngle *= 0.95;
                if (Math.abs(cartAngle) < 0.1) {
                    cartAngle = 0;
                }
            }

            armAngle += 3 * armDirection * (cartSpeed != 0);
            if (armAngle < -90 || armAngle > 0) {
                armDirection *= -1;
            }
            
            // Also keep swinging arms until at resting position
            if (cartSpeed == 0 && armAngle != 0) {
                armAngle *= 0.9;
                if (Math.abs(armAngle) < 0.1) {
                    armAngle = 0;
                }
            }

            requestAnimationFrame(DrawFerrisWheel);
        }
 
        context.translate(200, 200);
        context.save();
        DrawFerrisWheel();
        context.restore();
    }

    slider.addEventListener("input", function () {
        wheelSpeed = parseFloat(slider.value);
        cartSpeed = parseFloat(slider.value) * 100;
    });

    draw();
}

window.onload = setup;