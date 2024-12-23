
function setup(){

    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var bike_location = 0;
    var angle = 0;

    var slider1 = document.getElementById("slider1");
    var slider2 = document.getElementById("slider2");
    slider1.value = 0;
    slider2.value = 0;

    function draw() {

        function drawAxes(color,Tx) {
            context.strokeStyle=color;
            context.beginPath();
            // Axes
            moveToTx([120,0,0],Tx);lineToTx([0,0,0],Tx);lineToTx([0,120,0],Tx);moveToTx([0,0,0], Tx);lineToTx([0,0,120], Tx);
            // Arrowheads
            moveToTx([110,5,0],Tx);lineToTx([120,0,0],Tx);lineToTx([110,-5,0],Tx);
            moveToTx([5,110,0],Tx);lineToTx([0,120,0],Tx);lineToTx([-5,110,0],Tx);
            moveToTx([5,0,110],Tx);lineToTx([0,0,120],Tx);lineToTx([-5,0,110],Tx);
            // X-label
            moveToTx([130,0,0],Tx);lineToTx([140,10,0],Tx);
            moveToTx([130,10,0],Tx);lineToTx([140,0,0],Tx);
            context.stroke();
        }        

        function moveToTx(loc,Tx) {
            var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.moveTo(res[0],res[1]);
        }

        function lineToTx(loc,Tx) {
            var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.lineTo(res[0],res[1]);
        }

        function wheel(color, Tx) {
            var m = mat4.create();
            mat4.rotate(m, Tx, (-angle * Math.PI) / 6, [0,0,1]);

            function spokes(color, Tx) {
                var theta = Math.PI / 3;
                context.fillStyle = color;
                context.strokeStyle = color;
                context.beginPath(); moveToTx([0,0,0], m); lineToTx([40,0,0], m); context.stroke();

                for (var i = 0; i < 6; i++) {
                    mat4.rotate(m, Tx, theta, [0,0,1]);
                    context.beginPath(); moveToTx([0,0,0], m); lineToTx([40,0,0], m); context.stroke();
                }
            }

            context.beginPath();
            context.fillStyle = color;
            context.strokeStyle = color;
            moveToTx([0,0,0], m);
            for (var i = 0; i < 2 * Math.PI; i+=0.05) {
                lineToTx([40 * Math.cos(i),40 * Math.sin(i),0], m);
            }
            context.stroke();

            spokes(color, m);
            
        }

        function brace(color, Tx) {
            context.fillStyle = color;
            context.beginPath(); moveToTx([0,0,0], Tx); lineToTx([60,0,0], Tx); lineToTx([60,5,0], Tx); lineToTx([0,5,0], Tx); context.closePath; context.fill();
        }

        function bike(color, Tx) {
            context.fillStyle = color;
            context.strokeStyle = color;

            wheel(`${color}`, Tx);
            brace(`${color}`, Tx);

            var purple = mat4.create();
            mat4.rotate(purple, Tx, Math.PI / 4, [0,0,1]);
            brace(`${color}`, purple);

            mat4.translate(purple, purple, [56,2,0]);
            mat4.rotate(purple, purple, -Math.PI / 4, [0,0,1]);
            brace(`${color}`, purple);

            mat4.rotate(purple, purple, -Math.PI / 3, [0,0,1]);
            brace(`${color}`, purple);

            var yellow = mat4.create();
            mat4.translate(yellow, Tx, [60,0,0]);
            mat4.rotate(yellow, yellow, Math.PI / 4, [0,0,1]);
            brace(`${color}`, yellow);

            mat4.translate(yellow, yellow, [56,2,0]);
            
            context.beginPath(); moveToTx([0,0,-40], yellow); lineToTx([0,0,40], yellow); context.closePath; context.stroke();

            mat4.rotate(yellow, yellow, -Math.PI / 2, [0,0,1]);
            brace(`${color}`, yellow);

            var blue = mat4.create();
            mat4.translate(blue, Tx, [140,0,0]);
            wheel(`${color}`, blue);

        }


        function animate() {
            // "ground rectangle"
            canvas.width = canvas.width;
            
            // lookAt
            var viewAngle = slider1.value*0.02*Math.PI;
            var locCamera = vec3.create();
            var distCamera = 40;
            locCamera[0] = distCamera*Math.sin(viewAngle);
            locCamera[1] = 30;
            locCamera[2] = distCamera*Math.cos(viewAngle);
            var TlookAt = mat4.create();
            mat4.lookAt(TlookAt, locCamera, [0,0,0], [0,1,0]);

            // ortho projection
            var ortho = mat4.create();
            var left = -800; var right = 800; var bottom = -600; var top = 600; var near = 1; var far = 10;
            mat4.ortho(ortho, left, right, bottom, top, near, far);

            // world
            var world = mat4.create();
            mat4.translate(world, world, [400,300,1]);

            // camera
            var world_camera = mat4.create();
            mat4.multiply(world_camera, world, TlookAt);

            // NDC
            var world_camera_ortho = mat4.create();
            mat4.multiply(world_camera_ortho, world_camera, ortho);

            // Viewport?
            var result = mat4.create();
            mat4.scale(result, world_camera_ortho, [400,-300,1])
            
            context.beginPath(); moveToTx([0,0,0], result), lineToTx([600,0,0], result); lineToTx([600,21,0], result), lineToTx([0,21,0], result); context.closePath(); context.fillStyle = "green"; context.fill();

            drawAxes("grey", result);
            mat4.translate(result, result, [50,61,0]);

            if (bike_location + 2 > 400) {
                bike_location = 0;
            } else {
                bike_location += 2;
            }

            mat4.translate(result, result, [bike_location,0,slider2.value]);
            bike("red", result);

            if (angle >= 12) {
                angle = 0;
            } else {
                angle += .15;
            }

            requestAnimationFrame(animate);
        }
        animate();
    }
    draw();
}
setup();