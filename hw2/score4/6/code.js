/* Written by Aidan Mulvaney
 * Last Modified on 9/29/2023
 * CS 559 Fall 2023
 * 
 * train is based off Charlie the Choo Choo from
 * Stephen King's the Dark Tower series
 */

function setup() {
    var canvas = document.getElementById("canvas");
    var speed_slider = document.getElementById("speed_slider");
    var location_slider = document.getElementById("location_slider");
    speed_slider.value = 2;
    location_slider.value = 190;
    var theta = 0;
    var dx = 0;
    var dx_mountain = 0;
    var dx_tower = 0;
    var dy = 0;

    /* Draws all the planetary bodies on the screen and hierarchically links them together */
    function draw() {
        var context = canvas.getContext("2d");
        canvas.width = canvas.width; // clears the canvas

        // provides movement for rotating objects
        var dtheta = Math.acos(1-Math.pow(speed_slider.value/25, 2)/2);
        theta = theta + dtheta;

        // provides movement for non-rotating objects
        dx = (dx + (speed_slider.value % 11)) % 800;
        dx_mountain = (dx_mountain + (speed_slider.value % 11)) % 16000; // this larger modulo value makes the mountain not appear very often
        dx_tower = (dx_tower + (speed_slider.value % 11)) % 320000; // and the tower even less often
        dy = (dy + 5) % 600;

        // draw the foreground and background elements before drawing the train
        parallax_hills();
        foreground();
        context.save(); // relative to top left
        context.translate(location_slider.value, 350);

        context.save(); // relative to train
        smoke(); // we want the smoke to render behind the smoke stack, so it's drawn before the train body
        train_engine();
        coal_bunker();
        wheels();
        context.restore(); // relative to the train body again

        piston();
        context.restore(); // relative to the top left

        window.requestAnimationFrame(draw);

        /* Helper function to visualize current coordinate system while debugging */
        function axes(color) {
            context.strokeStyle=color;
            context.beginPath();
            // Axes
            context.moveTo(120,0);
            context.lineTo(0,0);
            context.lineTo(0,120);
            // Arrowheads
            context.moveTo(110,5);
            context.lineTo(120,0);
            context.lineTo(110,-5);
            context.moveTo(5,110);
            context.lineTo(0,120);
            context.lineTo(-5,110);
            // X-label
            context.moveTo(130,-5);
            context.lineTo(140,5);
            context.moveTo(130,5);
            context.lineTo(140,-5);
            // Y-label
            context.moveTo(-5,130);
            context.lineTo(0,135);
            context.lineTo(5,130);
            context.moveTo(0,135);
            context.lineTo(0,142);
            
            context.stroke();
        }

        /* Draw the piston shroud to hide the third coupling rod */
        function piston() {
            context.translate(-31, -65);
            context.lineWidth = 5;
            context.beginPath();
            context.fillStyle = "lightslategrey";
            context.roundRect(0, 0, 75, 25, 25);
            context.stroke();
            context.fill();
        }

        /* Draws the smoke coming from the train */
        function smoke() {
            // align the smoke with the smoke stack
            context.save();
            context.translate(8, -200);
            context.scale(0.35, 0.35);
            var gradient = context.createRadialGradient(0, 0, 5, 15, 10, 100);
            gradient.addColorStop(0, "dimgrey");
            gradient.addColorStop(1, "darkgrey");
            context.fillStyle = gradient;

            if (speed_slider.value == 0) {
                // draw the smoke coming out of the smoke stack moving straight up, since the train is not moving
                context.translate(0, -dy);
            } else {
                // draw the smoke coming out of the smoke stack, curving away w.r.t how fast the train is moving
                context.translate(2*dx, (-150/speed_slider.value)*Math.log10(50*dx + 10) - (-150/speed_slider.value));
            }
            cloud();

            context.restore();

            // draws a single smoke cloud
            function cloud() {
                context.beginPath();
                context.arc(0, 0, 50, 0 , 2*Math.PI);
                context.arc(50, -25, 40, 0 , 2*Math.PI);
                context.fill();
                context.arc(10, -30, 50, 0 , 2*Math.PI);
                context.fill();
            }
        }
        
        /* Creates the wheels for the train and coal bunker, along with the coupling rods */
        function wheels() {
            // first, draw the train wheels
            context.save(); // relative to first wheel, most importantly, before scaling
            wheel();
            context.translate(60, 0);
            wheel();
            context.translate(100, -12.5);
            context.scale(1.5, 1.5);
            wheel();

            context.save(); // relative to first big wheel
            context.translate(65, 0);
            wheel();
            context.restore();
            context.scale(0.75,0.667);

            // translate first rod in a circular motion
            context.translate(25*Math.cos(-theta), 25*Math.sin(-theta));
            coupling_rod(0, 0, false);

            // use second rod to connect the circular motion to linear motion
            coupling_rod(-85, -40, true);
            
            // translate third rod in a linear motion (we need to undo the circular motion)
            context.translate(-75+0.5*Math.cos(-theta), -40+25*Math.sin(theta));
            context.scale(0.5, 0.95);
            coupling_rod(-105, 0, false);

            // draw the wheels for the coal bunker
            context.restore();
            context.translate(350, 0);
            wheel();
            context.translate(100, 0);
            wheel();

            /* Draw a train wheel with spokes */
            function wheel() {
                context.save();

                // rotate the wheels slightly, so they are moving
                context.rotate(-theta);

                // create inner and outer circles
                context.beginPath();
                var gradient = context.createLinearGradient(-25, -25, 25, 25);
                gradient.addColorStop(0, "lightslategrey");
                gradient.addColorStop(1, "goldenrod");
                context.fillStyle = gradient;
                context.lineWidth = 5;
                context.arc(0, 0, 25, 0, 2*Math.PI, false);
                context.stroke();
                context.fill();
                context.beginPath();
                context.fillStyle = "black";
                context.arc(0, 0, 5,  0, 2*Math.PI, false);
                context.fill();

                // create wheel spokes
                context.beginPath();
                context.lineWidth = 2.5;
                context.moveTo(25, 0);
                context.lineTo(-25, 0);
                context.moveTo(0, 25);
                context.lineTo(0, -25);
                context.moveTo(12.5*Math.SQRT2, 12.5*Math.SQRT2);
                context.lineTo(-12.5*Math.SQRT2, -12.5*Math.SQRT2);
                context.moveTo(-12.5*Math.SQRT2, 12.5*Math.SQRT2);
                context.lineTo(12.5*Math.SQRT2, -12.5*Math.SQRT2);
                context.stroke();

                // restore the previous context so everything isn't rotated
                context.restore();
            }

            /* Draw a single coupling rod for the wheels at (x,y), changing circular motion to linear motion if circ_to_lin is true */
            function coupling_rod(x, y, circ_to_lin) {
                context.save();
                context.beginPath();
                if (circ_to_lin) {
                    context.strokeStyle = "slategrey";
                    context.lineWidth = 9;
                    context.lineCap = "round";

                    // manipulate sinusoids to change circular motion into linear, horizontal motion
                    context.moveTo(0, 0);
                    context.lineTo(x+0.5*Math.cos(-theta), y+25*Math.sin(theta));
                    context.stroke();
                } else {
                    context.fillStyle = "slategrey";
                    context.roundRect(x, y-5, 90, 10, 10);
                    context.fill();
                }
                context.restore();
            }
        }

        /* Draw the foreground elements, like the tracks and the grass */
        function foreground() {
            // draw the basic foreground
            context.beginPath();
            context.fillStyle = "darkseagreen";
            context.rect(0, 375, 800, 125);
            context.fill();

            // draw the tracks ontop of the foreground
            tracks();

            /* Draw the tracks on the foreground, with the cross beams moving w.r.t the train's speed */
            function tracks() {
                context.save();

                // draw the tracks themselves
                context.beginPath();
                context.lineWidth = 10;
                context.strokeStyle = "dimgrey";
                context.moveTo(0, 380);
                context.lineTo(800, 380);
                context.stroke();

                // now draw the cross beams, moving at the speed of the train
                context.translate(-800, 0);
                context.strokeStyle = "saddlebrown";
                for (var i = 0; i < 40; i++) {
                    context.beginPath();
                    context.moveTo(50*i+12.5+(dx%800), 385);
                    context.lineTo(50*i+37.5+(dx%800), 385);
                    context.stroke();
                }

                context.restore();
            }
        }

        /* The main train body, with the smoke stack and whistle */
        function train_engine() {
            // cattle guard at the front of the train
            context.save();
            context.translate(-30, -30);
            context.lineWidth = 5;
            context.strokeStyle = "black";
            context.fillStyle = "lightslategrey";
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(0, 50);
            context.lineTo(-50, 50);
            context.closePath();
            context.lineTo(-37.5, 50);
            context.moveTo(0, 0);
            context.lineTo(-25, 50);
            context.moveTo(0, 0);
            context.lineTo(-12.5, 50);

            // smoke stack
            context.translate(30, -70);
            context.moveTo(0, 0);
            context.lineTo(25, 0);
            context.lineTo(30, -100);
            context.lineTo(-5, -100);
            context.closePath();

            // whistle
            context.translate(100, -27.5);
            context.rect(0, 0, 10, 50);
            context.rect(-2.5, -25, 15, 25);
            context.moveTo(-2.5, -26);
            context.lineTo(12.5, -26);
            context.lineTo(5, -35);
            context.closePath();
            context.fill();
            context.stroke();

            // steam dome
            context.translate(-40, 5);
            context.beginPath();
            context.arc(0, 0, 15, 0, Math.PI, true);
            context.fill();
            context.stroke();
            context.restore();

            // bogeys of the train
            context.save();
            context.translate(-30, -40);
            context.fillStyle = "black";
            context.beginPath();
            context.rect(0, 0, 300, 50);
            context.fill();
            context.stroke();
            
            // main body of the train
            context.translate(-30, -80);
            context.lineWidth = 5;
            context.strokeStyle = "black";
            var gradient = context.createLinearGradient(0, 120, 0, 0);
            gradient.addColorStop(0, "lightslategrey");
            gradient.addColorStop(1, "rosybrown");
            context.fillStyle = gradient;
            context.beginPath();
            context.roundRect(0, 0, 300, 100, 100);
            context.fill();
            context.stroke();
            context.restore();

            // engineer's cabin
            context.save();
            context.translate(150, -125);
            context.lineWidth = 5;
            context.strokeStyle = "black";
            var gradient = context.createLinearGradient(0, 120, 0, 0);
            gradient.addColorStop(0, "lightslategrey");
            gradient.addColorStop(1, "rosybrown");
            context.fillStyle = gradient;
            context.beginPath();
            context.rect(0, 0, 150, 100);
            context.fill();
            context.lineTo(0, -100);
            context.rect(0, -100, 150, 10);
            context.fill();
            context.moveTo(150, -100);
            context.lineTo(150, 0);
            context.stroke();

            // put the 9 on the cabin
            context.fillStyle = "goldenrod";
            context.font = "80px Courier New";
            context.textAlign = "center";
            context.fillText("9", 70, 75);
            context.restore();
        }

        /* Where the coal is stored, connected behind the main train engine body */
        function coal_bunker() {
            // the main body of the bunker
            context.save();
            context.translate(325, -110);
            context.lineWidth = 5;
            context.strokeStyle = "black";
            var gradient = context.createLinearGradient(0, 120, 0, 0);
            gradient.addColorStop(0, "lightslategrey");
            gradient.addColorStop(1, "rosybrown");
            context.fillStyle = gradient;
            context.beginPath();
            context.rect(0, 0, 150, 100);
            context.fill();
            context.stroke();

            // draw the bogeys underneath, and the coupler to the main train engine
            context.beginPath();
            context.translate(20, 100);
            context.lineWidth = 20;
            context.fillStyle = "black";
            context.rect(0, 0, 100, 10);
            context.moveTo(0, 5);
            context.lineTo(-100, -12);
            context.fill();
            context.stroke();

            // draw the coal peeking out of the bunker
            context.beginPath();
            context.translate(55, 15);
            context.rotate(Math.PI);
            context.lineWidth = 5;
            context.arc(0, 0, 135, Math.PI/3, 2*Math.PI/3, false);
            context.fill();
            context.restore();
        }

        /* Draws the hills moving behind the train relative to how fast the train
           is moving, but also w.r.t how far away they are from the train itself */
        function parallax_hills() {
            context.save();
            
            // we need to draw things in reverse order, so the furthest (slowest)
            // objects are drawn over by the closer (faster) objects.
            // so, we start with the dark tower
            // also, we're pushing it really far left so that it doesn't show
            // up for a while
            context.translate(-800, 400);
            context.fillStyle = "black";
            context.moveTo(0.05*dx_tower, 0);
            context.lineTo(20 + 0.05*dx_tower, -300);
            context.lineTo(40 + 0.05*dx_tower, 0);
            context.closePath();
            context.lineTo(30 + 0.05*dx_tower, -250);
            context.lineTo(40 + 0.05*dx_tower, 0);
            context.closePath();
            context.lineTo(10 + 0.05*dx_tower, -225);
            context.lineTo(20 + 0.05*dx_tower, 0);
            context.fill();

            // and then the mountain
            var gradient = context.createLinearGradient(0, -125, 0, -200);
            gradient.addColorStop(0, "dimgrey");
            gradient.addColorStop(1, "white");
            context.fillStyle = gradient;
            context.beginPath();
            context.translate(800, 0);
            context.moveTo(-200 + 0.25*dx_mountain, 0);
            context.lineTo(-100 + 0.25*dx_mountain, -200);
            context.lineTo(0.25*dx_mountain, 0);
            context.closePath();
            context.fill();

            context.translate(-800, -100);

            // then draw the darker hills
            for (var i = 0; i < 20; i+=2) {
                context.beginPath();
                context.fillStyle = "seagreen";
                context.arc(100*i + 0.5*dx, 100, 120, 0, Math.PI, true);
                context.fill();
            }     

            // and then the closer, lighter hills
            for (var i = 0; i < 20; i+=2) {
                context.beginPath();
                context.fillStyle = "mediumseagreen";
                context.arc(100*i + dx, 120, 120, 0, Math.PI, true);
                context.fill();
            }       

            context.restore();
        }
    }

    window.requestAnimationFrame(draw);
}

window.onload = setup;