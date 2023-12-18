let lightShaderProgram;
let nolightShaderProgram;
let holoShaderPrograme;

let stoneTexture;// = createTexture(stone_text);
let grassTexture;
let grassSideTexture;// = createTexture(grass_side_text);
let grassTopTexture;
let dirtTexture;
let cobblestoneTexture;
let bedrockTexture;
let oakPlankTexture;
let sandTexture;
let observerTexture;
let logTexture;
let logIconTexture;
let redMushroomTexture;

/** @type {HTMLElement} */
let slider1;
/** @type {HTMLElement} */
let slider2;
/** @type {HTMLElement} */
let slider3;

let blockShape;

let isDragging = false;
let dragOffsetX, dragOffsetY;

let keysPressed = {}
/** @type {HTMLAudioElement} */
let audio;
/** @type {CanvasRenderingContext2D } */
let UIContext;

let bar;
/** @type {Box} */
let selection;

/** @type {Block[]} */
let blocks = []
let blocksImg = []
let onHandIndex = 0;

const board_size = 10;

window.onload = () => {
    init();
    initInputs();

    let vertexSource = document.getElementById("vertexShader").text;
    let fragmentSource = document.getElementById("fragmentShader").text;
    let fragmentSourceNoLight = document.getElementById("fragmentShader-nolight").text;
    let holoVertexSource = document.getElementById("vertexShader2").text;
    let holoFragmentSource = document.getElementById("fragmentShader2").text;

    lightShaderProgram = getShader(vertexSource, fragmentSource);
    nolightShaderProgram = getShader(vertexSource, fragmentSourceNoLight);
    holoShaderPrograme = getShader(holoVertexSource, holoFragmentSource);

    stoneTexture = createTexture(stone_text);
    grassTexture = createTexture(grass_text);
    grassSideTexture = createTexture(grass_side_text);
    grassTopTexture = createTexture(grass_top_text);
    dirtTexture = createTexture(dirt_text);
    cobblestoneTexture = createTexture(cobblestone_text);
    bedrockTexture = createTexture(bedrock_text);
    oakPlankTexture = createTexture(oak_plank_text);
    sandTexture = createTexture(sand_text);
    observerTexture = createTexture(observer_text);
    logTexture = createTexture(log_text);
    logIconTexture = createTexture(log_icon_text);
    redMushroomTexture = createTexture(red_mushroom_text);


    let cloud = createTexture(cloud_text);

    let sky = new Rectangle([0, 1000, 0]);
    sky.setRepeatSize(1);
    sky.shaderProgram = nolightShaderProgram;
    sky.texture = cloud.texture;
    sky.scale = [100, 100, 100];
    sky.rotation = quat.fromEuler(sky.rotation, 90, 0, 0);

    audio = document.getElementById("audio");
    blocks = [
        new Stone([0, 0, 0], blockShape.value),
        new GrassBlock([0, 0, 0], blockShape.value),
        new Dirt([0, 0, 0], blockShape.value),
        new Cobblestone([0, 0, 0], blockShape.value),
        new OakPlank([0, 0, 0], blockShape.value),
        new Bedrock([0, 0, 0], blockShape.value),
        new Sand([0, 0, 0], true, blockShape.value),
        new Observer([0, 0, 0], blockShape.value),
        new OakLog([0, 0, 0], blockShape.value),
        new RedMushroomBlock([0, 0, 0], blockShape.value)
    ]
    blocksImg = [
        stone_text,
        grass_side_text,
        dirt_text,
        cobblestone_text,
        oak_plank_text,
        bedrock_text,
        sand_text,
        observer_face_text,
        log_icon_text,
        red_mushroom_text
    ]

    blocks.forEach(b => b.active = false);
    for (let x = -board_size / 2; x < board_size / 2; x++) {
        for (let z = -board_size / 2; z < board_size / 2; z++) {
            new Bedrock([x, 0, z], blockShape.value);
            new Stone([x, 1, z], blockShape.value);
            new Stone([x, 2, z], blockShape.value);
            new Dirt([x, 3, z], blockShape.value);
            new GrassBlock([x, 4, z], blockShape.value);
        }
    }

    for (let index = 5; index < 12; index++) {
        let log = new OakLog([-2, index, 2], blockShape.value);
        quat.fromEuler(log.rotation, 90, 0, 0);
    }
    new OakLog([-2, 9, 1], blockShape.value);
    new OakLog([-2, 9, 0], blockShape.value);
    new OakLog([-2, 9, -1], blockShape.value);

    new Observer([-2, 10, 0], blockShape.value);
    new RedMushroomBlock([4, 5, -1], blockShape.value);
    new Cobblestone([4, 5, -2], blockShape.value);
    new Sand([4, 5, -3], false, blockShape.value);
    new OakPlank([4, 5, 0], blockShape.value);

    selection = new Box([0, 0, 0]);
    selection.shaderProgram = holoShaderPrograme;
    selection.scale = uniformScale(0.52);


    requestAnimationFrame(update);

    setTimeout(() => {
        blockShape.value = BlockShape.Sphere;
        changeShape(BlockShape.Sphere);
    }, 1000);
}

function initInputs() {

    blockShape = document.getElementById("shape");
    blockShape.addEventListener("input", (e) => {
        console.log(Number(e.target.value));
        changeShape(e.target.value);
    })

    // Add keydown event listener to detect when a key is pressed
    document.addEventListener('keydown', (event) => {
        keysPressed[event.key.toLowerCase()] = true;
        playAudio();
    });
    document.addEventListener('keyup', (event) => {
        delete keysPressed[event.key.toLowerCase()];
    });
    // Add keyup event listener to detect when a key is released
    document.addEventListener('keypress', (event) => {
        playAudio();
    });

    // Add keyup event listener to detect when a key is released
    canvas.addEventListener('keypress', (event) => {
        playAudio();
    });

    canvas.addEventListener('click', function (e) {
        isDragging = true;
        document.body.requestPointerLock();
        dragOffsetX = e.clientX;
        dragOffsetY = e.clientY;

    });
    // Listen for mouse button events
    canvas.addEventListener('mousedown', (event) => {
        document.body.requestPointerLock();
    });

    // Listen for mouse button events
    document.addEventListener('mousedown', (event) => {
        // Access event.button to determine which mouse button was pressed
        console.log(`Mouse button ${event.button} pressed`);
        playerClick(event);
    });

    document.addEventListener('mousemove', function (e) {
        // if (isDragging) {
        const dx = e.movementX || e.mozMovementX || 0;
        const dy = e.movementY || e.mozMovementY || 0;

        rotateCamera(dx, dy);
        dragOffsetX = e.clientX;
        dragOffsetY = e.clientY;
        // }
        window.moveTo(canvas.width / 2, canvas.height / 2);
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
    });

    // Listen for mouse scroll events
    document.addEventListener('wheel', (event) => {
        // Access event.deltaY to determine the scroll direction and distance
        // console.log(`Mouse scrolled: ${event.deltaY}`);
        if (event.deltaY > 0) {
            onHandIndex++;
        }
        if (event.deltaY < 0) {
            onHandIndex--;
        }
        onHandIndex += blocks.length;
        onHandIndex %= blocks.length;
    });
}

// Function to rotate the camera based on dx and dy
function rotateCamera(dx, dy) {
    if (!document.pointerLockElement) return;
    // Adjust these values based on your sensitivity preferences
    const sensitivityX = 0.001;
    const sensitivityY = 0.001;

    // Update camera rotation angles
    const yaw = -dx * sensitivityX;
    const pitch = -dy * sensitivityY;

    const forward = vec3.sub(vec3.create(), mainCamera.target, mainCamera.position);
    // if (1 - forward[1] <= 0.001) return;

    // Apply yaw rotation
    const yawMatrix = mat4.create();
    mat4.rotate(yawMatrix, yawMatrix, yaw, mainCamera.up);
    vec3.transformMat4(forward, forward, yawMatrix);

    // Apply pitch rotation
    const pitchMatrix = mat4.create();
    mat4.rotate(pitchMatrix, pitchMatrix, pitch, vec3.cross(vec3.create(), forward, mainCamera.up));
    vec3.transformMat4(forward, forward, pitchMatrix);

    const t = vec3.add(vec3.create(), mainCamera.position, forward);
    mainCamera.setTarget(t);
}


function playAudio() {
    if (document.visibilityState == "visible" && audio.paused) {
        audio.play();
    }
}

function inputRadius() {
    return slider3.value / 10;
}

function update() {
    playerInput();
    setHandBlock();
    RenderQueue.render();

    GameObject.physicsUpdate();


    projection();
    randomTick();
    requestAnimationFrame(update);

    // console.log(blockShape.value);
}

/**
 * Handles movement
 */
function playerInput() {
    if (!document.pointerLockElement) return;

    const forward = vec3.sub(vec3.create(), mainCamera.target, mainCamera.position);
    const right = vec3.cross(vec3.create(), forward, mainCamera.up);
    const up = mainCamera.up;
    forward[1] = 0;
    right[1] = 0;

    const speed = .2;
    const moving = [0, 0, 0];
    if (keysPressed["w"]) {
        vec3.add(moving, moving, forward);
    }
    if (keysPressed["s"]) {
        vec3.sub(moving, moving, forward);
    }
    if (keysPressed["a"]) {
        vec3.sub(moving, moving, right);
    }
    if (keysPressed["d"]) {
        vec3.add(moving, moving, right);
    }
    if (keysPressed[" "]) {
        vec3.add(moving, moving, up);
    }
    if (keysPressed["shift"]) {
        vec3.sub(moving, moving, up);
    }
    // vec3.rotateY(moving, moving, [0, 0, 0], angle);
    if (moving[0] || moving[1] || moving[2]) {
        vec3.normalize(moving, moving);
        vec3.scale(moving, moving, speed);
        vec3.add(mainCamera.position, mainCamera.position, moving);
        vec3.add(mainCamera.target, mainCamera.target, moving);
    }
}

function setHandBlock() {
    blocks.forEach(b => b.active = false);
    let block = blocks[onHandIndex];
    block.active = true;
    block.position = vec3.add(block.position, mainCamera.position, mainCamera.forward);
    block.scale = uniformScale(0.1);

    /** @type {HTMLImageElement} */
    let icon = document.getElementById("icon");
    icon.src = blocksImg[onHandIndex];
}

function projection() {
    let result = Block.getLastFreePosition(mainCamera.position, mainCamera.forward);
    if (result == undefined) {
        selection.active = false;
        return;
    }
    selection.active = true;
    selection.position = result.hit;
    selection.last = result.last;
}

function playerClick(event) {
    if (event.button == 0) {
        if (selection.active)
            Block.destroyAt(selection.position);
    }
    if (event.button == 1) {
        let block;
        block = Block.get(selection.position);
        if (block) {
            for (let i = 0; i < blocks.length; i++) {
                const element = blocks[i];
                if (element.constructor === block.constructor) {
                    onHandIndex = i;
                }
            }
        }
    }
    if (event.button == 2) {
        if (!selection.active) return;
        let dir = getFace(selection.position);
        let placing = vec3.sub(vec3.create(), selection.position, dir);
        console.log(selection.position, placing);
        if (Block.get(placing)) return;

        let block = blocks[onHandIndex];
        let clone = block.clone(placing);
        clone.onPlace();
        clone.setShape(blockShape.value);
    }
}

/**
 * 
 * @param {vec3} position 
 * @returns  {vec3}
 */
function getFace(position) {
    if (!selection.isActiveInHeirachy()) return undefined;

    // Assume you have the position of the cube and the camera's position and target
    const cubePosition = position;
    const cameraPosition = mainCamera.position;
    const cameraTarget = mainCamera.target;

    // Define the normal vectors of each cube face
    /** @type {vec3[]} */
    const faceNormals = [
        vec3.fromValues(0, -1, 0), // Bottom face
        vec3.fromValues(-1, 0, 0), // Left face
        vec3.fromValues(0, 0, -1),  // Back face
        vec3.fromValues(1, 0, 0),  // Right face
        vec3.fromValues(0, 0, 1),  // Front face
        vec3.fromValues(0, 1, 0),  // Top face
    ];


    // Calculate the normalized direction vector from the camera position to the cube center // Calculate the normalized direction vector from the camera position to the cube center
    const directionToCube = vec3.subtract(vec3.create(), cubePosition, cameraPosition);
    vec3.normalize(directionToCube, directionToCube);

    // Calculate the normalized view direction (vector from camera position to target)
    const viewDirection = vec3.subtract(vec3.create(), cameraTarget, cameraPosition);
    vec3.normalize(viewDirection, viewDirection);

    // Calculate the dot products between the view direction and each face normal
    const dotProducts = faceNormals.map(normal => vec3.dot(viewDirection, normal));

    // Find the face with the highest dot product (aligned most closely with the viewing direction)
    const pointingAtFaceIndex = dotProducts.indexOf(Math.max(...dotProducts));

    // console.log("Pointing at face index:", pointingAtFaceIndex);
    return faceNormals[pointingAtFaceIndex];
}

function changeShape(status) {
    GameObject.gameObjects.forEach(g => {
        if (g instanceof Block) {
            g.setShape(status);
        }
    });
}



function randomTick() {
    if (rr() < 0.2) return;
    for (let index = 0; index < 1; index++) {
        let obj = GameObject.gameObjects[rri(GameObject.gameObjects.length)];
        if (obj instanceof Block) {
            obj.randomTick();
        }
    }
}