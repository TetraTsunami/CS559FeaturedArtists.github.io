class GameObject {
    /** @type {GameObject[]} */
    static gameObjects = []

    /** @type {boolean} */
    alive = true;
    /** @type {boolean} */
    active = true;

    /** @type {GameObject} */
    parent;
    /** @type {GameObject[]} */
    children = [];

    /** local position of the game objeect @type {vec3} */
    position;
    /** local scale of the game object @type {vec3} */
    scale;
    /** local rotation of the game object @type {quat} */
    rotation;

    /** render layer of the game object @type {Number} */
    layer

    /** @type {vec3} */
    velocity;
    /** @type {Number} */
    radius;



    /**
     * 
     * @param {vec3} position 
     */
    constructor(position) {
        this.position = vec3.clone(position);
        this.scale = vec3.fromValues(1, 1, 1);
        this.rotation = quat.create();
        this.alive = true;

        this.velocity = vec3.fromValues(0, 0, 0);
        this.radius = 1;
        this.layer = 0;
        RenderQueue.add(this);
        GameObject.gameObjects.push(this);
    }

    /**
     * 
     * @returns {Matrix4x4}
     */
    getLocalTransform() {
        const transform = Matrix4x4.TRS(this.position, this.rotation, this.scale);
        return transform;
    }

    /**
     * 
     * @returns {Matrix4x4}
     */
    getTransform() {
        /**
         * Grandparent * parent * self * point
         */
        const localTransform = this.getLocalTransform();
        if (this.parent instanceof GameObject) {
            let parentTransform = this.parent.getTransform();
            mat4.mul(parentTransform, parentTransform, localTransform);
            return parentTransform;
        }
        return localTransform;
    }

    /**
     * 
     * @returns {vec3}
     */
    getGlobalPosition() {
        let transform = this.getTransform();
        return vec3.transformMat4(vec3.create(), [0, 0, 0], transform);
    }

    /**
     * 
     * @returns {vec3}
     */
    getGlobalScale() {
        if (this.parent instanceof GameObject) {
            let p = this.parent.getGlobalScale();
            return [this.scale[0] * p[0], this.scale[1] * p[1], this.scale[2] * p[2]];
        }
        return vec3.clone(this.scale);
    }

    /**
     * get the global rotation
     * @returns {quat}
     */
    getGlobalRotation() {
        if (this.parent instanceof GameObject) {
            let q = this.parent.getGlobalRotation();
            quat.mul(q, q, this.rotation);
            return q;
        }
        return quat.clone(this.rotation);
    }

    getEulerAngle() {
        return this.rotation.toEulerAngles();
    }

    /**
     * 
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @param {Number[]} vector
     * @returns 
     */
    setEulerAngle() {
        let x, y, z, v3;
        if (arguments.length == 3) {
            x = arguments[0];
            y = arguments[1];
            z = arguments[2];
        }
        else if (arguments.length == 1) {
            v3 = arguments[0];
            if (!v3) return;
            x = v3[0] || 0;
            y = v3[1] || 0;
            z = v3[2] || 0;
        }
        else return;
        quat.fromEuler(this.rotation, x, y, z);
    }

    /**
     * 
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @param {Number[]} vector
     * @returns 
     */
    worldToSelf() {
        let x, y, z, v3;
        if (arguments.length == 3) {
            x = arguments[0];
            y = arguments[1];
            z = arguments[2];
        }
        else if (arguments.length == 1) {
            v3 = arguments[0];
            if (!v3) return;
            x = v3[0] || 0;
            y = v3[1] || 0;
            z = v3[2] || 0;
        }
        else return;
        return this.getTransform().inverse().transform([x, y, z]);
    }

    /**
     * set gameobject's parent
     * @param {GameObject} p 
     */
    setParent(p) {
        if (this.parent != null)
            this.parent.removeChild(this);

        this.parent = p;
        if (p != null)
            p.children.push(this);
    }

    removeChild(c) {
        const idx = this.children.indexOf(c);
        if (idx != -1)
            this.children = this.children.splice(idx, 1);
    }

    isActiveInHeirachy() {
        if (this.parent) return this.active && this.parent.isActiveInHeirachy();
        return this.active;
    }

    /**
     * 
     * @param {GameObject} other 
     * @returns 
     */
    isColliding(other) {
        let selfGlobal = this.getGlobalPosition();
        let otherGlobal = other.getGlobalPosition();
        vec3.sub(selfGlobal, selfGlobal, otherGlobal);
        // console.log(vec3.length(selfGlobal), selfGlobal, this.radius, other.radius);
        return vec3.length(selfGlobal) < this.radius + other.radius;
    }

    move() {
        vec2.add(this.position, this.position, this.velocity);
    }

    draw() { }

    onDestroy() { }

    /**
     * 
     * @param {GameObject} gameObject 
     * @returns 
     */
    static destroy(gameObject) {
        if (!gameObject) return;
        if (!gameObject.alive) return;
 
        for (let index = gameObject.children.length - 1; index >= 0; index--) {
            this.destroy(gameObject.children[index]);
        }

        GameObject.removeFromGlobalList(gameObject);
        RenderQueue.remove(gameObject);

        gameObject.onDestroy();
        gameObject.alive = false;

        // remove from parent
        if (gameObject.parent) {
            gameObject.parent.removeChild(gameObject);
        }
    }

    static physicsUpdate() {
        GameObject.gameObjects.forEach(g => {
            if (g.isActiveInHeirachy())
                g.move();
        });
    }

    static removeFromGlobalList(gameObject) {
        let index = GameObject.gameObjects.indexOf(gameObject);
        if (index != -1) { GameObject.gameObjects.splice(index, 1); return true; }
        return false;
    }
}

class ParticleSystem extends GameObject {
    /** @type {Particle[]} */
    particles = [];

    move() {
        this.particles.forEach(p => p.move());
    }

    draw() {  // game object rendering
        const layers = [];
        this.particles.forEach(g => {
            if (!layers.includes(g.layer)) {
                layers.push(Number(g.layer));
            }
        });
        layers.sort((a, b) => a - b);
        for (let index = 0; index < layers.length; index++) {
            const layer = layers[index];
            this.particles.forEach(g => {
                if (g.layer != layer) return;
                // Canvas.save();
                // Canvas.setTransform(g.getTransform());
                g.draw();
                // Canvas.restore();
            });
        }
    }

    onDestroy() {
        this.particles.forEach(p => p.onDestroy());
    }

    /**
     * 
     * @param {Particle} particle 
     */
    addParticle(particle) {
        this.particles.push(particle);
        RenderQueue.remove(particle);
        particle.setParent(this);
    }

    destroyParticle(particle) {
        const i = this.particles.indexOf(particle);
        this.particles.splice(i, 1);
        GameObject.destroy(particle);
    }

    getParticleCount() {
        return this.particles.length;
    }
}

class Particle extends GameObject {
    /** @type {Number} */
    alpha;
    /** @type {string} */
    color;

    constructor(position) {
        super(position);
        this.alpha = 1;
        this.layer = Math.floor(rr(3));
    }
}

class WebGLDrawer extends GameObject {

    /** vertex positions @type {Float32Array} */
    vertexPos;
    /** vertex normals @type {Float32Array} */
    vertexNormals;
    /**  vertex colors @type {Float32Array} */
    vertexColors;
    /** element index array @type {Uint8Array} */
    triangleIndices;
    /** vertex texture coordinates @type {Float32Array} */
    vertexTextureCoords;

    /** @type {WebGLProgram} */
    shaderProgram;

    draw() {
        var tModel = this.getTransform();
        var { tMV, tMVn, tMVP } = mainCamera.toView(tModel);

        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexPos, gl.STATIC_DRAW);
        trianglePosBuffer.numItems = this.vertexPos.length / trianglePosBuffer.itemSize;

        // a buffer for normals 
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexNormals, gl.STATIC_DRAW);
        triangleNormalBuffer.numItems = this.vertexNormals.length / triangleNormalBuffer.itemSize;

        // a buffer for colors 
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexColors, gl.STATIC_DRAW);
        colorBuffer.numItems = this.vertexColors.length / colorBuffer.itemSize;

        // a buffer for indices 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndices, gl.STATIC_DRAW);
        indexBuffer.numItems = this.triangleIndices.length / indexBuffer.itemSize;

        // a buffer for textures
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexTextureCoords, gl.STATIC_DRAW);

        // console.log(this.vertexPos.length, this.vertexNormals.length, this.vertexColors.length, this.triangleIndices.length);

        var shaderProgram = this.shaderProgram;
        gl.useProgram(shaderProgram);

        // Set up uniforms & attributes
        gl.uniform1f(shaderProgram.time, getTime());
        gl.uniformMatrix4fv(shaderProgram.MVmatrix, false, tMV);
        gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix, false, tMVn);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);
        gl.uniform1i(shaderProgram.texSampler, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
        gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.NormalAttribute, triangleNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.vertexAttribPointer(shaderProgram.texcoordAttribute, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // Bind texture 
        if (this.texture instanceof WebGLTexture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }

        // Do the drawing
        gl.drawElements(gl.TRIANGLES, this.triangleIndices.length, gl.UNSIGNED_BYTE, 0);
    }

    setVertexColor(color) {
        let vCount = this.vertexPos.length / 3;

        const r = (color >> 16) / 255;  // Red
        const g = ((color >> 8) & 0xFF) / 255; // Green
        const b = (color & 0xFF) / 255;  // Blue

        this.vertexColors = [];
        for (let index = 0; index < vCount; index++) {
            this.vertexColors.push(r, g, b);
        }

        this.vertexColors = new Float32Array(this.vertexColors);
    }
} 
