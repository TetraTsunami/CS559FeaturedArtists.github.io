function start() {
    // Get canvas, WebGL context
    var canvas = document.getElementById("mycanvas");

    // debugging code via 
    // https://www.khronos.org/webgl/wiki/Debugging#Programmatically_Debugging_WebGL_applications
    var gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl"));
    function logGLCall(functionName, args) {
        console.log("gl." + functionName + "(" +
            WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
    }
    gl = WebGLDebugUtils.makeDebugContext(gl, undefined, logGLCall);



    // Sliders at center
    var slider1 = document.getElementById('slider1');
    slider1.value = 0;
    var slider2 = document.getElementById('slider2');
    slider2.value = 400;

    var tick = 0;


    // Read shader source
    var vertexSource = document.getElementById("vertexShader").text;
    var fragmentSource = document.getElementById("fragmentShader").text;
    var shaderProgram = createProgram(gl, vertexSource, fragmentSource);

    var checkerboard_tex = new Texture(gl, checkerboard_img);

    var sphere1 = new Element(gl, sphere, shaderProgram);

    

    // Scene (re-)draw routine
    function draw() {

        tick = (tick + 1) % 200
        var theta = 2 * Math.PI * (slider1.value / 200);

        var CameraCurve = function (theta) {
            var distance = slider2.value;
            var eye = vec3.create();
            eye[0] = distance * Math.sin(theta);
            eye[1] = 50 * slider2.value / 120;
            eye[2] = distance * Math.cos(theta);
            return [eye[0], eye[1], eye[2]];
        }

        var eye = CameraCurve(theta);
        var target = [0, 0, 0];
        var up = [0, 1, 0];

        var tModelSphere = mat4.create();
        mat4.fromScaling(tModelSphere, [40,40,40]);

        var tCamera = mat4.create();
        mat4.lookAt(tCamera, eye, target, up);

        var tProjection = mat4.create();
        mat4.perspective(tProjection, Math.PI / 4, 1, 10, 1000);

        sphere1.setTransforms(tModelSphere, tCamera, tProjection);

        // Clear screen, prepare for rendering
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        sphere1.draw(gl);

        window.requestAnimationFrame(draw);

    }
    draw();
}

window.onload = start;