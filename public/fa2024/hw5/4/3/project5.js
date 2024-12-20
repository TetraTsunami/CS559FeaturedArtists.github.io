// Page elements
let canvas;
let context;

// Camera variables
const cameraRadius = 200
const cameraCenter = [0, 0, 0]
let Tviewport
const cameraSpeed = -2*Math.PI/4000

// Helicopter variables
const heliPropellorSpeed = 2*Math.PI/60
const heliNumPropellors = 5
let heliT
const helidT = 1/1200
let heliCurve
let heliTangents

// Scene objects
let camera;
let helicopter;

function draw() {
    // Draw sky background
    context.save();
    context.fillStyle = '#9cdade';
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(canvas.width, 0);
    context.lineTo(canvas.width, canvas.height);
    context.lineTo(0, canvas.height);
    context.fill();
    context.restore();

    setTxCamera(camera.transform());
    drawGround();

    // Place tower
    saveTx();
    scaleTx(5, 5, 5);
    rotateTx(Math.PI/6, [0, 1, 0]);
    addSkyscraper();
    restoreTx();
    
    // Place helicopter
    saveTx();
    let heliPos = heliCurve(heliT);
    let heliTan = heliTangents(heliT);
    let heliLook = vec3.create();
    vec3.add(heliLook, heliPos, heliTan);
    translateTx(heliPos[0], heliPos[1], heliPos[2]);

    let Theli = mat4.create();
    mat4.lookAt(Theli, heliPos, heliLook, [0, 1, 0])
    let Theli_rot_quat = quat.create();
    mat4.getRotation(Theli_rot_quat, Theli);
    quat.conjugate(Theli_rot_quat, Theli_rot_quat);
    let Theli_rot = mat4.create();
    mat4.fromQuat(Theli_rot, Theli_rot_quat);
    multTxWithRot(Theli_rot);
    rotateTx(Math.PI, [0, 1, 0]);

    scaleTx(2, 2, 2);
    helicopter.draw();
    restoreTx();

    // Render all cubes
    obs.render();
}

function update() {
    camera.update();
    helicopter.update();
    heliT = (heliT + helidT) % 1;
}

function setup() {
    // Set up camera
    Tviewport = mat4.create();
    mat4.fromTranslation(Tviewport, [canvas.width/2, canvas.height*2/3, 0])
    mat4.scale(Tviewport, Tviewport, [canvas.width/4, -canvas.height/4, 1])
    camera = new Camera(cameraRadius, cameraCenter, Tviewport, cameraSpeed);

    // Set up object renderer
    obs = new Objects();

    // Set up helicopter
    helicopter = new Helicopter(heliPropellorSpeed, heliNumPropellors);
    heliT = 0;
    heliCurve = piecewise(createBSplines(heliPoints, true));
    heliTangents = piecewise(createBSplineTangents(heliPoints, true));
}


// Setup & Animation functions

window.onload = function() {
    // Initialize HTML elements
    canvas = document.getElementById('window');
    context = canvas.getContext('2d');

    setup();

    slider = document.getElementById('cameraHeight');

    slider.value = 75;
    camera.height = slider.value;
    slider.addEventListener('input', function() {
        camera.height = slider.value;
    });

    // Start animation
    animate();
}

function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    update();
    requestAnimationFrame(animate);
}