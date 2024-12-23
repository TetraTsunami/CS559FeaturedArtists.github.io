class Helicopter {
    #s
    #ds
    #numPropellors

    constructor(propellorSpeed, numPropellors) {
        this.#s = 0
        this.#ds = propellorSpeed
        this.#numPropellors = numPropellors
    }

    update() {
        this.#s += this.#ds
    }

    draw() {
        this.#drawBody([98, 109, 125], [63, 215, 255])
        this.#drawLegs([70, 70, 70])
        this.#drawTail([98, 109, 125], [190, 210, 215])
        
        // Propellor and its base
        saveTx()
        translateTx(0, 1, -0.33)
        
        saveTx()
        scaleTx(0.5, 0.15, 0.5)
        translateTx(0, 1, 0)
        obs.addCube([98, 109, 125])
        restoreTx()

        saveTx()
        translateTx(0, 0.3, 0)
        this.#drawPropellor([98, 109, 125], [190, 210, 215])
        restoreTx()
        
        restoreTx()
    }

    #drawPropellor(colorBody, colorPropellor) {
        saveTx()
        rotateTx(this.#s, [0, 1, 0])

        saveTx()
        scaleTx(0.2, 0.1, 0.2)
        translateTx(0, 1, 0)
        obs.addCube(colorBody)
        restoreTx()
        
        for (let i = 0; i < this.#numPropellors; i++) {
            saveTx()
            rotateTx(i * (Math.PI*2/this.#numPropellors), [0, 1, 0])
            translateTx(2.2, 0, 0)
            scaleTx(2, 0.05, 0.2)
            translateTx(0, 1, 0)
            obs.addCube(colorPropellor)
            restoreTx()
        }

        restoreTx()
    }

    #drawBody(colorBody, colorNose) {
        // Main
        saveTx()
        scaleTx(1, 1, 2)
        obs.addCube(colorBody)
        restoreTx()

        // Nose
        saveTx()
        translateTx(0, 0, 2)
        scaleTx(1, 0.6, 0.25)
        translateTx(0, 0, 1)
        obs.addCube(colorNose)
        restoreTx()
    }

    #drawTail(colorBody, colorPropellor) {
        saveTx()

        saveTx()
        translateTx(0, 0.33, -2)
        scaleTx(0.5, 0.5, 0.5)
        translateTx(0, 0, -1)
        obs.addCube(colorBody)
        restoreTx()

        saveTx()
        translateTx(0, 0.33, -3)
        scaleTx(0.2, 0.2, 1.5)
        translateTx(0, 0, -1)
        obs.addCube(colorBody)
        restoreTx()

        // Propellor
        saveTx()
        translateTx(0, 0.33, -5.75)

        saveTx()
        translateTx(0.2, 0, 0)
        rotateTx(-Math.PI/2, [0, 0, 1])
        scaleTx(0.2, 1, 0.2)
        this.#drawPropellor(colorBody, colorPropellor)
        restoreTx()

        restoreTx()

        restoreTx()
    }

    #drawLegs(colorLegs) {
        saveTx()
        translateTx(0, -1, 0)

        // Left
        saveTx()
        translateTx(1, 0, 0)
        scaleTx(0.15, 0.15, 0.15)
        translateTx(0, -1, 0)
        saveTx() // Front
        translateTx(0, 0, 7)
        obs.addCube(colorLegs)
        restoreTx()
        saveTx() // Back
        translateTx(0, 0, -7)
        obs.addCube(colorLegs)
        restoreTx()
        restoreTx()

        // Right
        saveTx()
        translateTx(-1, 0, 0)
        scaleTx(0.15, 0.15, 0.15)
        translateTx(0, -1, 0)
        saveTx() // Front
        translateTx(0, 0, 7)
        obs.addCube(colorLegs)
        restoreTx()
        saveTx() // Back
        translateTx(0, 0, -7)
        obs.addCube(colorLegs)
        restoreTx()
        restoreTx()

        restoreTx()
    }
}

let heliPoints = [
    [50, 50, 50],
    [45, 40, 10],
    [50, 30, -50],
    [-50, 100, -80],
    [-75, 65, -15],
    [-50, 30, 50],
    [-25, 70, 80]
]