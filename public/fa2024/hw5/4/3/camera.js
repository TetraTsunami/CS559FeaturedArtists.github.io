class Camera {
    #radius
    #t
    #dt
    
    #Tviewport
    #fovY = Math.PI/4
    #aspectRatio = 1/1
    #nearFrustum = 10
    #farFrustum = 1000
    
    height
    pos
    center

    /**
     * Creates a Camera controller.
     * @param {num} radius Distance the camera keeps from center.
     * @param {Array} center Center point the camera looks at
     * @param {mat4} Tviewport Viewport transform
     * @param {num} speed Speed the camera moves at, with 2*PI being 1 rotation
     */
    constructor(radius, center, Tviewport, speed) {
        this.#radius = radius
        this.height = 0
        this.center = center
        this.#Tviewport = Tviewport
        this.#t = 0
        this.#dt = speed
        this.update()
    }

    /**
     * Updates the position of the camera
     */
    update() {
        this.pos = circleX(this.#radius, this.#t)
        this.pos[1] += this.height

        this.#t += this.#dt
    }

    /**
     * Returns World-to-Viewport transform with perspective projection
     * @returns {mat4}
     */
    transform() {
        // Camera transform
        let TlookAt = mat4.create()
        let eye = vec3.fromValues(this.pos[0], this.pos[1], this.pos[2])
        let target = vec3.fromValues(this.center[0], this.center[1], this.center[2])
        let up = vec3.fromValues(0, 1, 0)
        mat4.lookAt(TlookAt, eye, target, up)

        // Projection transform
        let Tprojection = mat4.create()
        mat4.perspective(Tprojection, this.#fovY, this.#aspectRatio, this.#nearFrustum, this.#farFrustum)

        let TcameraProjected = mat4.create()
        mat4.multiply(TcameraProjected, this.#Tviewport, Tprojection)
        mat4.multiply(TcameraProjected, TcameraProjected, TlookAt)

        return TcameraProjected
    }

    /**
     * Given a normal vector and its origin point, returns positive if the
     * vector is facing the camera.
     * @param {Array<number>} norm Normal vector in world coords
     * @param {Array<number>} pos Position the normal vector originates from
     * @returns {number} dot product of normal vector and camera vector
     */
    normal(norm, pos=[0, 0, 0]) {
        let x, y, z;
        [x, y, z] = norm;

        let cameraVector = vec3.fromValues(this.pos[0]-pos[0], this.pos[1]-pos[1], this.pos[2]-pos[2])
        vec3.normalize(cameraVector, cameraVector)
        let inVector = vec3.fromValues(x, y, z)
        vec3.normalize(inVector, inVector)

        return vec3.dot(cameraVector, inVector)
    }

    /**
     * Given a position in world space, returns the distance to the camera.
     * @param {Array<number>} pos 
     */
    dist(pos=[0, 0, 0]) {
        let posVec = vec3.create()
        vec3.subtract(posVec, this.pos, pos)
        return vec3.length(posVec)
    }
}