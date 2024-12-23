let obs;

class Objects {
    #cubes

    constructor() {
        this.#cubes = []
    }

    /**
     * Renders all cubes added to the object renderer buffer, then clears it.
     */
    render() {
        saveTx()

        // Sort cubes by distance to camera, descending
        this.#cubes.sort((a, b) => {
            let aPos = vec3.create()
            let bPos = vec3.create()

            mat4.getTranslation(aPos, a.Tx)
            mat4.getTranslation(bPos, b.Tx)

            return camera.dist(bPos) - camera.dist(aPos)
        })
        
        // Render all cubes
        for (let i = 0; i < this.#cubes.length; i++) {
            setTx(this.#cubes[i].Tx);
            setRotationTx(this.#cubes[i].Tr);
            if (this.#cubes[i].color) {
                drawCube(this.#cubes[i].color);
            } else {
                drawCube();
            }
        }
        
        restoreTx()

        // Clear cube buffer
        this.#cubes = []
    }

    /**
     * Adds a cube with the current world transform to the object renderer buffer.
     * @param {color} cubeColor 
     */
    addCube(cubeColor = null) {
        this.#cubes.push({Tx: getTx(), Tr: getRotationTx(), color: cubeColor})
    }
}

function addSkyscraper() {
    saveTx();

    // Layer 1
    saveTx();
    scaleTx(2, 0.5, 4);
    translateTx(0, 1, 0);
    obs.addCube([144, 150, 127]);
    restoreTx();

    // Layer 2
    translateTx(0, 1, 0);
    saveTx();
    scaleTx(1.5, 1.5, 2);
    translateTx(0, 1, 0);
    obs.addCube([173, 181, 155]);
    restoreTx();

    // Layer 3
    translateTx(0, 3, 0);
    saveTx();
    scaleTx(1.25, 5, 1.75);
    translateTx(0, 1, 0);
    obs.addCube([187, 196, 165]);
    restoreTx();

    // Layer 4
    translateTx(0, 10, 0);
    saveTx();
    scaleTx(1, 0.75, 1.5);
    translateTx(0, 1, 0);
    obs.addCube([197, 207, 175]);
    restoreTx();

    // Layer 5
    translateTx(0, 1.5, 0);
    saveTx();
    scaleTx(0.75, 0.5, 1.25);
    translateTx(0, 1, 0);
    obs.addCube([206, 214, 185]);
    restoreTx();

    // Layer 6 (Tower base)
    translateTx(0, 1, 0);
    saveTx();
    scaleTx(0.5, 0.4, 0.75);
    translateTx(0, 1, 0);
    obs.addCube([188, 194, 172]);
    restoreTx();

    // Layer 7 (Tower)
    translateTx(0, 0.8, 0);
    saveTx();
    scaleTx(0.25, 1.25, 0.25);
    translateTx(0, 1, 0);
    obs.addCube([211, 219, 192]);
    restoreTx();

    // Layer 8 (Tower)
    translateTx(0, 2.5, 0);
    saveTx();
    scaleTx(0.2, 0.25, 0.2);
    translateTx(0, 1, 0);
    obs.addCube([217, 224, 197]);
    restoreTx();

    // Layer 9 (Spike)
    translateTx(0, 0.5, 0);
    saveTx();
    scaleTx(0.05, 1, 0.05);
    translateTx(0, 1, 0);
    obs.addCube([234, 237, 231]);
    restoreTx();

    restoreTx();
}

/**
 * Draws a cube from [-1, 1]^3
 */
function drawCube(color = [225, 225, 225]) {
    function drawFace() {
        let normal = vec3.fromValues(0, 0, 1)
        vec3.transformMat4(normal, normal, getRotationTx());
        let position = vec3.create();
        mat4.getTranslation(position, getTx());
        let cameraNorm = camera.normal(normal, position);
        if (cameraNorm < 0) return;
        cameraNorm = (cameraNorm+3)/4;
        
        context.save();
        context.fillStyle=`rgb(${color[0] * cameraNorm}, ${color[1] * cameraNorm}, ${color[2] * cameraNorm})`;
        context.strokeStyle=`rgb(${color[0] * cameraNorm}, ${color[1] * cameraNorm}, ${color[2] * cameraNorm})`;
        context.lineWidth = 1;
        context.beginPath();
        moveToTx(-1, -1, 0);
        lineToTx(-1, 1, 0);
        lineToTx(1, 1, 0);
        lineToTx(1, -1, 0);
        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
    }

    saveTx();
    translateTx(0, 0, -1);
    rotateTx(Math.PI, [0, 1, 0])
    drawFace();
    restoreTx();

    saveTx();
    translateTx(0, 0, 1);
    drawFace();
    restoreTx();

    saveTx();
    translateTx(1, 0, 0);
    rotateTx(Math.PI/2, [0, 1, 0])
    drawFace();
    restoreTx();

    saveTx();
    translateTx(-1, 0, 0);
    rotateTx(-Math.PI/2, [0, 1, 0])
    drawFace();
    restoreTx();

    saveTx();
    translateTx(0, -1, 0);
    rotateTx(Math.PI/2, [1, 0, 0])
    drawFace();
    restoreTx();

    saveTx();
    translateTx(0, 1, 0);
    rotateTx(-Math.PI/2, [1, 0, 0])
    drawFace();
    restoreTx();
}

/**
 * Draws a 200x200 ground plane at the center of the world coordinate system.
 */
function drawGround() {
    let color = [93, 110, 105];
    let cameraNorm = camera.normal(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 0));
    cameraNorm = (cameraNorm+3)/4;

    context.save();
    context.fillStyle = `rgb(${color[0] * cameraNorm}, ${color[1] * cameraNorm}, ${color[2] * cameraNorm})`;
    context.beginPath();
    moveToTx(-100, -1, -100);
    lineToTx(100, -1, -100);
    lineToTx(100, -1, 100);
    lineToTx(-100, -1, 100);
    context.closePath();
    context.fill();
    context.restore();
}