const BlockShape = {
    Blocky: 0,
    Sphere: 1,
    Cone: 2,
}

class Block extends GameObject {

    /** @type {Block[][][]} */
    static world = [];

    shape;

    uniform;
    sphere;


    constructor(position, shape = BlockShape.Blocky, useUniforn = true) {
        super(position);
        Block.record(position, this);
        this.useUniform = useUniforn;
        this.shape = shape;
        if (useUniforn) {
            this.setShape(shape);
        }
    }

    draw() {
        if (this.uniform) {
            this.uniform.active = !this.isCovered();
        }
    }

    isCovered() {
        let pos = vec3.create();
        vec3.add(pos, this.position, [0, 0, 1]);
        if (!Block.get(pos)) {
            return false;
        }

        vec3.add(pos, this.position, [0, 0, -1]);
        if (!Block.get(pos)) {
            return false;
        }

        vec3.add(pos, this.position, [0, 1, 0]);
        if (!Block.get(pos)) {
            return false;
        }

        vec3.add(pos, this.position, [0, -1, 0]);
        if (!Block.get(pos)) {
            return false;
        }

        vec3.add(pos, this.position, [1, 0, 0]);
        if (!Block.get(pos)) {
            return false;
        }

        vec3.add(pos, this.position, [-1, 0, 0]);
        if (!Block.get(pos)) {
            return false;
        }
        return true;
    }

    clone(position) {
        return new Block(vec3.clone(position));
    }

    onPlace() {

    }

    randomTick() {

    }

    setShape(shape) {
        if (!this.useUniform) return;
        this.shape = shape;
        let texture = this.uniform?.texture;
        let oldShape = this.uniform;
        GameObject.destroy(this.uniform);
        if (shape == BlockShape.Blocky)
            this.uniform = new Box([0, 0, 0]);
        if (shape == BlockShape.Sphere)
            this.uniform = new Sphere([0, 0, 0], 10);
        if (shape == BlockShape.Cone) {
            this.uniform = new Cone([0, 0, 0], 1.2, 2, 10);
        }

        this.uniform.setParent(this);
        // if (oldShape) {
        //     this.uniform.shaderProgram = oldShape?.shaderProgram | nolightShaderProgram;
        //     this.uniform.scale = oldShape?.scale | [0.5, 0.5, 0.5];
        //     this.uniform.radius = oldShape?.radius | 1;
        //     this.uniform.texture = oldShape?.texture;
        // }
        // else 
        {
            this.uniform.shaderProgram = nolightShaderProgram;
            this.uniform.scale = [0.5, 0.5, 0.5];
            this.uniform.radius = 1;
            this.uniform.texture = texture;
        }
    }

    setTexture(texture) {
        if (this.uniform)
            this.uniform.texture = texture;
    }


    /**
     * 
     * @param {vec3} position 
     * @param {Block} object 
     */
    static record(position, object) {
        let positionX = Math.round(position[0]);
        let positionY = Math.round(position[1]);
        let positionZ = Math.round(position[2]);

        // Initialize the outer object if it doesn't exist
        if (!this.world[positionX]) {
            this.world[positionX] = {};
        }

        // Initialize the inner object if it doesn't exist
        if (!this.world[positionX][positionY]) {
            this.world[positionX][positionY] = {};
        }

        // Record the object at the specified position
        this.world[positionX][positionY][positionZ] = object;
    }

    // Function to retrieve an object at a specific position
    static get(position) {
        let positionX = Math.round(position[0]);
        let positionY = Math.round(position[1]);
        let positionZ = Math.round(position[2]);
        return this.world[positionX]?.[positionY]?.[positionZ];
    }

    // Function to find the last free position in a given direction
    static getLastFreePosition(origin, direction, maxIteration = 200) {
        let current = vec3.clone(origin);
        let hit = vec3.clone(origin);
        let last = vec3.clone(origin);
        let dir = vec3.clone(direction);
        vec3.normalize(dir, dir);
        vec3.scale(dir, dir, 0.1);

        let iter = 0;
        while (iter < maxIteration) {
            if (vec3.length(vec3.sub(vec3.create(), origin, current)) > 6) return undefined;
            let lattice = vec3.clone(current);
            vec3.add(lattice, lattice, [0.5, 0.5, 0.5]);
            floorVec3(lattice);

            // Check if the current position is occupied
            if (this.isObjectAtPosition(lattice)) {
                return { hit: lattice, last: last };
            } else {
                // If the current position is not occupied, update lastFreePosition
                let l = vec3.clone(lattice);
                if (l[0] != last[0] || l[1] != last[1] || l[2] != last[2]) {
                    last = l;
                }
            }

            // Move to the next position in the specified direction
            vec3.add(current, current, dir);

            iter++;
        }
        return undefined;
    }

    // Function to check if an object is present at a specific position
    /**
     * 
     * @param {vec3} position 
     * @returns 
     */
    static isObjectAtPosition(position) {
        const x = Math.round(position[0]), y = Math.round(position[1]), z = Math.round(position[2]);
        return this.world[x]?.[y]?.[z] !== undefined;
    }


    static destroyAt(position) {
        let block = this.get(position);
        if (block) {
            this.destroy(block);
            this.record(position, undefined);
        }
    }
}

class Stone extends Block {
    constructor(position, shape = BlockShape.Blocky) {
        super(position, shape);
        this.setTexture(stoneTexture.texture);
    }

    clone(position) {
        return new Stone(vec3.clone(position), this.shape);
    }

}

class Dirt extends Block {
    constructor(position, shape = BlockShape.Blocky) {
        super(position, shape);
        this.setTexture(dirtTexture.texture);
    }

    clone(position) {
        return new Dirt(vec3.clone(position), this.shape);
    }
}

class Cobblestone extends Block {
    constructor(position, shape = BlockShape.Blocky) {
        super(position, shape);
        this.setTexture(cobblestoneTexture.texture);
    }

    clone(position) {
        return new Cobblestone(vec3.clone(position), this.shape);
    }
}

class Bedrock extends Block {
    constructor(position, shape = BlockShape.Blocky) {
        super(position, shape);
        this.setTexture(bedrockTexture.texture);
    }

    clone(position) {
        return new Bedrock(vec3.clone(position), this.shape);
    }
}

class OakPlank extends Block {
    constructor(position, shape = BlockShape.Blocky) {
        super(position, shape);
        this.setTexture(oakPlankTexture.texture);
    }

    clone(position) {
        return new OakPlank(vec3.clone(position), this.shape);
    }
}

class RedMushroomBlock extends Block {
    constructor(position, shape = BlockShape.Blocky) {
        super(position, shape);
        this.setTexture(redMushroomTexture.texture);
    }

    clone(position) {
        return new RedMushroomBlock(vec3.clone(position), this.shape);
    }
}

class Sand extends Block {
    stay;
    acc;

    constructor(position, stay = false, shape = BlockShape.Blocky) {
        super(position, shape);
        this.setTexture(sandTexture.texture);
        this.acc = [0, -.003, 0];
        this.stay = stay;
    }

    clone(position) {
        return new Sand(vec3.clone(position), this.shape);
    }

    onPlace() {
        this.stay = false;
    }

    move() {
        if (this.stay) return;
        // nothing below
        if (Block.isObjectAtPosition(vec3.sub(vec3.create(), this.position, [0, 1, 0]))) {
            floorVec3(this.position);
            Block.record(this.position, this);
            vec3.copy(this.velocity, [0, 0, 0]);
        }
        else {
            if (Block.get(this.position) == this) {
                Block.record(this.position, undefined);
            }
            vec3.add(this.velocity, this.velocity, this.acc);
            super.move();
        }

        if (this.position[1] < -40) {
            GameObject.destroy(this);
        }
    }
}

class GrassBlock extends Block {
    constructor(position, shape = BlockShape.Blocky) {
        super(position, shape);

        this.setTexture(grassTexture.texture);
    }

    setShape(shape) {
        super.setShape(shape);
        if (shape == BlockShape.Blocky) {
            // vertex texture coordinates
            this.uniform.vertexTextureCoords = new Float32Array(
                [
                    0.5, 0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 0.5,
                    0.25, 0.25, 0.25, 0.5, 0, 0.5, 0, 0.25,
                    0.5, 0.25, 0.5, 0, 0.25, 0, 0.25, 0.25,
                    0.5, 0.25, 0.75, 0.25, 0.75, 0.5, 0.5, 0.5,
                    0.25, 0.75, 0.5, 0.75, 0.5, 0.5, 0.25, 0.5,
                    0.75, 0.5, 1, 0.5, 1, 0.25, 0.75, 0.25
                ]);
        }
    }

    randomTick() {
        if (Block.get(vec3.add(vec3.create(), this.position, [0, 1, 0]))) {
            Block.destroyAt(this.position);
            new Dirt(this.position, this.shape);
            return;
        }
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                for (let z = -1; z < 2; z++) {
                    let p = vec3.add(vec3.create(), this.position, [x, y, z]);
                    let b = Block.get(p);
                    if (b && b instanceof Dirt && !Block.get(vec3.add(vec3.create(), this.position, [x, y + 1, z]))) {
                        Block.destroyAt(p);
                        new GrassBlock(p, this.shape);
                        return;
                    }
                }
            }
        }
    }

    clone(position) {
        return new GrassBlock(vec3.clone(position), this.shape);
    }
}

class Observer extends Block {
    constructor(position, shape = BlockShape.Blocky) {
        super(position, shape);

        this.setTexture(observerTexture.texture);
        // vertex texture coordinates
        this.uniform.vertexTextureCoords = new Float32Array(
            [
                0.5, 0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 0.5,
                0.25, 0.25, 0.25, 0.5, 0, 0.5, 0, 0.25,
                0.5, 0.25, 0.5, 0, 0.25, 0, 0.25, 0.25,
                0.5, 0.25, 0.75, 0.25, 0.75, 0.5, 0.5, 0.5,
                0.25, 0.75, 0.5, 0.75, 0.5, 0.5, 0.25, 0.5,
                0.75, 0.5, 1, 0.5, 1, 0.25, 0.75, 0.25
            ]);
        // 0,0,0,0,0,0,0,0,
    }

    setShape(shape) {
        super.setShape(shape);
        if (shape == BlockShape.Blocky) {
            // vertex texture coordinates
            this.uniform.vertexTextureCoords = new Float32Array(
                [
                    0.5, 0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 0.5,
                    0.25, 0.25, 0.25, 0.5, 0, 0.5, 0, 0.25,
                    0.5, 0.25, 0.5, 0, 0.25, 0, 0.25, 0.25,
                    0.5, 0.25, 0.75, 0.25, 0.75, 0.5, 0.5, 0.5,
                    0.25, 0.75, 0.5, 0.75, 0.5, 0.5, 0.25, 0.5,
                    0.75, 0.5, 1, 0.5, 1, 0.25, 0.75, 0.25
                ]);
        }
    }


    onPlace() {
        // Assume you have the facing direction of the camera
        const cameraFacingDirection = vec3.normalize(vec3.create(), mainCamera.forward);

        // Find the principal axis (the axis with the largest absolute value)
        const principalAxis = vec3.fromValues(Math.sign(cameraFacingDirection[0]), 0, 0); // Assuming initially X-axis
        let maxAbsValue = Math.abs(cameraFacingDirection[0]);
        for (let i = 1; i < 3; i++) {
            const absValue = Math.abs(cameraFacingDirection[i]);
            if (absValue > maxAbsValue) {
                // console.log("a", i);
                maxAbsValue = absValue;
                principalAxis[0] = 0;
                principalAxis[1] = (i == 1) ? Math.sign(cameraFacingDirection[1]) : 0;
                principalAxis[2] = (i == 2) ? Math.sign(cameraFacingDirection[2]) : 0;
            }
        }

        // console.log("Principal Axis:", cameraFacingDirection);
        console.log("Principal Axis:", principalAxis);

        // Assuming the object is currently facing the positive Z-axis [0, 0, 1]
        const currentFacingDirection = vec3.fromValues(0, 0, 1);

        // Specify the new axis that you want the object to face
        const newFacingAxis = principalAxis;

        // Calculate the rotation axis and angle
        const rotationAxis = vec3.cross(vec3.create(), currentFacingDirection, newFacingAxis);
        const rotationAngle = Math.acos(vec3.dot(currentFacingDirection, newFacingAxis));

        // Create a quaternion from the axis and angle
        const rotationQuaternion = quat.setAxisAngle(quat.create(), rotationAxis, rotationAngle);

        console.log("Rotation Axis:", rotationAxis);
        console.log("Rotation Angle:", rotationAngle);
        console.log("Rotation Quaternion:", rotationQuaternion);

        this.rotation = rotationQuaternion;
    }

    clone(position) {
        return new Observer(vec3.clone(position), this.shape);
    }
}



class OakLog extends Block {
    constructor(position, shape = BlockShape.Blocky) {
        super(position, shape);

        this.setTexture(logTexture.texture);
        // vertex texture coordinates
        this.uniform.vertexTextureCoords = new Float32Array(
            [
                0.5, 0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 0.5,
                0.25, 0.25, 0.25, 0.5, 0, 0.5, 0, 0.25,
                0.5, 0.25, 0.5, 0, 0.25, 0, 0.25, 0.25,
                0.5, 0.25, 0.75, 0.25, 0.75, 0.5, 0.5, 0.5,
                0.25, 0.75, 0.5, 0.75, 0.5, 0.5, 0.25, 0.5,
                0.75, 0.5, 1, 0.5, 1, 0.25, 0.75, 0.25
            ]);
        // 0,0,0,0,0,0,0,0,
    }

    setShape(shape) {
        super.setShape(shape);
        if (shape == BlockShape.Blocky) {
            // vertex texture coordinates
            this.uniform.vertexTextureCoords = new Float32Array(
                [
                    0.5, 0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 0.5,
                    0.25, 0.25, 0.25, 0.5, 0, 0.5, 0, 0.25,
                    0.5, 0.25, 0.5, 0, 0.25, 0, 0.25, 0.25,
                    0.5, 0.25, 0.75, 0.25, 0.75, 0.5, 0.5, 0.5,
                    0.25, 0.75, 0.5, 0.75, 0.5, 0.5, 0.25, 0.5,
                    0.75, 0.5, 1, 0.5, 1, 0.25, 0.75, 0.25
                ]);
        }
    }


    onPlace() {
        // Assume you have the facing direction of the camera
        const cameraFacingDirection = vec3.normalize(vec3.create(), mainCamera.forward);

        // Find the principal axis (the axis with the largest absolute value)
        const principalAxis = vec3.fromValues(Math.sign(cameraFacingDirection[0]), 0, 0); // Assuming initially X-axis
        let maxAbsValue = Math.abs(cameraFacingDirection[0]);
        for (let i = 1; i < 3; i++) {
            const absValue = Math.abs(cameraFacingDirection[i]);
            if (absValue > maxAbsValue) {
                // console.log("a", i);
                maxAbsValue = absValue;
                principalAxis[0] = 0;
                principalAxis[1] = (i == 1) ? Math.sign(cameraFacingDirection[1]) : 0;
                principalAxis[2] = (i == 2) ? Math.sign(cameraFacingDirection[2]) : 0;
            }
        }

        // console.log("Principal Axis:", cameraFacingDirection);
        console.log("Principal Axis:", principalAxis);

        // Assuming the object is currently facing the positive Z-axis [0, 0, 1]
        const currentFacingDirection = vec3.fromValues(0, 0, 1);

        // Specify the new axis that you want the object to face
        const newFacingAxis = principalAxis;

        // Calculate the rotation axis and angle
        const rotationAxis = vec3.cross(vec3.create(), currentFacingDirection, newFacingAxis);
        const rotationAngle = Math.acos(vec3.dot(currentFacingDirection, newFacingAxis));

        // Create a quaternion from the axis and angle
        const rotationQuaternion = quat.setAxisAngle(quat.create(), rotationAxis, rotationAngle);

        console.log("Rotation Axis:", rotationAxis);
        console.log("Rotation Angle:", rotationAngle);
        console.log("Rotation Quaternion:", rotationQuaternion);

        this.rotation = rotationQuaternion;
    }

    clone(position) {
        return new OakLog(vec3.clone(position), this.shape);
    }
}
