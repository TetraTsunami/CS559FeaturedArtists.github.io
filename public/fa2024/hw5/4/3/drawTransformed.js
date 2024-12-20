// Transform stack functionality
let cameraTransform = mat4.create();
let transforms = [mat4.create()];
let rotationTransforms = [mat4.create()];

/**
 * Saves the current transformtion matrix by pushing it down the transforms
 * stack.
 */
function saveTx() {
    transforms.push(mat4.clone(getTx()));
    rotationTransforms.push(mat4.clone(getRotationTx()));
}

/**
 * Restores the last saved transformation matrix by popping the current
 * transformation from the transforms stack.
 */
function restoreTx() {
    transforms.pop();
    rotationTransforms.pop();
}

// Drawing functions

/**
 * Performs a context.moveTo() operation in the chosen coordinate system.
 * @param {number} x X-coordinate in the chosen coordinate system.
 * @param {number} y Y-coordinate in the chosen coordinate system.
 * @param {number} z Z-coordinate in the chosen coordinate system.
 * @param {mat4} Tx Transformation matrix to draw in.  Defaults to the current
 * transformation in the transforms stack.
 */
function moveToTx(x, y, z, Tx = getTxCamera()) {
    let pos = coordinateTx(x, y, z, Tx);
    context.moveTo(pos[0], pos[1]);
}

/**
 * Performs a context.lineTo() operation in the chosen coordinate system.
 * @param {number} x X-coordinate in the chosen coordinate system.
 * @param {number} y Y-coordinate in the chosen coordinate system.
 * @param {number} z Z-coordinate in the chosen coordinate system.
 * @param {mat4} Tx Transformation matrix to draw in.  Defaults to the current
 * transformation in the transforms stack.
 */
function lineToTx(x, y, z, Tx = getTxCamera()) {
    let pos = coordinateTx(x, y, z, Tx);
    context.lineTo(pos[0], pos[1]);
}

// Transformation functions

/**
 * Performs a transformation on the given coordinates using the given transformation matrix.
 * @param {number} x The X-coordinate.
 * @param {number} y The Y-coordinate.
 * @param {number} z The Z-coordinate.
 * @param {mat4} Tx The transformation matrix to use.
 * @returns 
 */
function coordinateTx(x, y, z, Tx = getTxCamera()) {
    let pos = vec3.create();
    vec3.transformMat4(pos, [x, y, z], Tx);
    return pos;
}

/**
 * Gets the current transformation in the transforms stack.
 * @returns {mat4} The current transformation matrix.
 */
function getTx() {
    return transforms[transforms.length - 1];
}

/**
 * Gets the current composite of rotation transforms.  Used for object hiding.
 * @returns {mat4} The current rotation transform matrix.
 */
function getRotationTx() {
    let out = mat4.create();
    return rotationTransforms[rotationTransforms.length - 1];
}

/**
 * Gets the current transformation in the transforms stack projected to the camera coordinate system.
 * @returns {mat4} The current transformation matrix multiplied by the camera matrix.
 */
function getTxCamera() {
    let out = mat4.create();
    mat4.multiply(out, cameraTransform, getTx());
    return out;
}

/**
 * Updates the current transformation in the transforms stack.
 * @param {mat4} Tx The chosen transformation matrix.
 */
function setTx(Tx) {
    transforms[transforms.length - 1] = Tx;
}

/**
 * Updates the current rotation transformation in the rotation transforms stack.
 * @param {mat4} Tx The chosen transformation matrix.
 */
function setRotationTx(Tx) {
    rotationTransforms[rotationTransforms.length - 1] = Tx;
}

/**
 * Updates the current camera transform.
 * @param {mat4} Tx The camera tranformation matrix.
 */
function setTxCamera(Tx) {
    cameraTransform = Tx;
}

/**
 * Performs a translation transform on the currently active transformation matrix.
 * @param {number} x The X-translation amount.
 * @param {number} y The Y-translation amount.
 * @param {number} z The Z-translation amount.
 */
function translateTx(x, y, z) {
    let Tx = mat4.create();
    mat4.fromTranslation(Tx, [x, y, z]);
    mat4.multiply(getTx(), getTx(), Tx);
}

/**
 * Performs a scale transform on the currently active transformation matrix.
 * @param {*} x The X-scale amount.
 * @param {*} y The Y-scale amount.
 * @param {*} z The Z-scale amount.
 */
function scaleTx(x, y, z) {
    let Tx = mat4.create();
    mat4.fromScaling(Tx, [x, y, z]);
    mat4.multiply(getTx(), getTx(), Tx);
}

/**
 * Performs a rotation transform on the currently active transformation matrix.
 * @param {number} theta The angle to rotate by.
 * @param {vec3} axis The axis to rotate on.
 */
function rotateTx(theta, axis) {
    let Tx = mat4.create();
    mat4.fromRotation(Tx, theta, axis);
    mat4.multiply(getTx(), getTx(), Tx);
    mat4.multiply(getRotationTx(), getRotationTx(), Tx);
}

function multTx(Tx) {
    mat4.multiply(getTx(), getTx(), Tx);
}

function multTxWithRot(Tx) {
    mat4.multiply(getTx(), getTx(), Tx);
    mat4.multiply(getRotationTx(), getRotationTx(), Tx);
}