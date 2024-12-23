function clamp(min, max, num) {
    return Math.max(Math.min(max, num), min);
}

//calling convention: callee saves & restores stack

class CFPSCounter {
    constructor(smoothing) {
        this.m_flFPS = 0;
        this.m_iSmoothing = smoothing;
    }

    onDraw(context, deltaTime) {
        let flFPS = (1000 / deltaTime);
        this.m_flFPS = (this.m_flFPS * this.m_iSmoothing + flFPS) / (this.m_iSmoothing + 1)

        context.fillText(this.m_flFPS.toFixed(0) + " FPS", 0, 10);
    }
}

class CTPSCounter {
    constructor(smoothing) {
        this.m_flTPS = 0;
        this.m_iSmoothing = smoothing;
    }

    onDraw(context, deltaTime) {
        context.fillText("Tickrate: " + this.m_flTPS.toFixed(0), 0, 10);
    }

    onSimulate(deltaTime) {
        let flTPS = (1000 / deltaTime);
        this.m_flTPS = (this.m_flTPS * this.m_iSmoothing + flTPS) / (this.m_iSmoothing + 1)
    }
}

class CBackground {
    constructor(color) {
        this.m_strColor = color;
        this.m_FPSCounter = new CFPSCounter(30);
        this.m_TPSCounter = new CTPSCounter(15);
        this.m_CameraState = [0, 0, 0, 0, 0, 0];
    }

    onDraw(context, deltaTime) {
        context.save();
        context.fillStyle = this.m_strColor;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        context.fillStyle = "white";

        context.save();
        this.m_FPSCounter.onDraw(context, deltaTime);
        context.translate(0, 12);
        this.m_TPSCounter.onDraw(context, deltaTime);
        context.translate(0, 12);
        context.fillText(`Resolution: ${context.canvas.width}x${context.canvas.height}`, 0, 10);
        context.translate(0, 12);
        context.fillText(`Camera Position: (${this.m_CameraState[0]},${this.m_CameraState[1]},${this.m_CameraState[2]})`, 0, 10);
        context.translate(0, 12);
        context.fillText(`Viewangle: (${this.m_CameraState[3]},${this.m_CameraState[4]},${this.m_CameraState[5]})`, 0, 10);
        context.translate(0, 12);
        context.fillText(`Fov: 90`, 0, 10);
        context.restore();

        context.translate(context.canvas.width, context.canvas.height);
        context.translate(-300, -50);
        context.font = '20px Arial';
        context.fillText(`Move Camera: WASD`, 0, 10);
        context.translate(0, -30);
        context.fillText(`Rotate Camera: Mouse`, 0, 10);
        context.translate(0, -30);
        context.fillText(`Move Up: Space`, 0, 10);
        context.translate(0, -30);
        context.fillText(`Move Down: Ctrl`, 0, 10);
        //context.translate(-300, -30);
        //context.fillText(`I did not implement clipping so don't get close to the objects lol`, 0, 10);
        context.restore();
    }

    onSimulate(deltaTime) {
        this.m_TPSCounter.onSimulate(deltaTime);
    }
}

//orbit function should return x, y, z (pos), pitch yaw roll (angle)
class CCelestialBody{
    constructor(camera, size, color, orbitFunction){
        this.m_Camera = camera;
        this.m_nSize = size;
        this.m_strColor = color;
        this.m_fnOrbit = orbitFunction;
        this.m_nT=0;
        this.m_WireFrame=false;
    }

    onDraw(context, deltaTime) {
        this.m_Camera.save()

        let position = this.m_fnOrbit(this.m_nT)

        this.m_Camera.translate3D(position.x,position.y,position.z)
        this.m_Camera.rotate3D(position.pitch,'x')
        this.m_Camera.rotate3D(position.yaw,'y')
        this.m_Camera.rotate3D(position.roll,'z')
        this.m_Camera.drawSphere( this.m_nSize, 16, this.m_WireFrame, this.m_strColor);
        
        this.m_Camera.restore()
    }

    onSimulate(deltaTime){
        this.m_nT+=deltaTime;
        this.m_WireFrame=this.m_nT % 1000 < 500;
    }
}

class CPlanet extends CCelestialBody {
    constructor(camera, size, color, orbitFunction) {
        super(camera, size, color, orbitFunction);
    }

    onDraw(context, deltaTime) {
        this.m_Camera.save();

        // Draw the trail by calculating positions at intervals
        const trailSegments = 10;
        const trailLength = 200 * this.m_nSize * 2; // How far back in time the trail goes

        for (let i = 0; i < trailSegments; i++) {
            const t = this.m_nT - (i * trailLength / trailSegments); // Calculate t for each segment
            const startPosition = this.m_fnOrbit(t);
            const endPosition = this.m_fnOrbit(t - trailLength / trailSegments);

            // Draw each segment of the trail
            this.m_Camera.drawLine(
                [startPosition.x, startPosition.y, startPosition.z],
                [endPosition.x, endPosition.y, endPosition.z],
                `rgba(255, 255, 255, ${1 - i / trailSegments})` // Fade effect for the trail
            );
        }

        // Draw the planet at its current position
        const currentPosition = this.m_fnOrbit(this.m_nT);
        this.m_Camera.translate3D(currentPosition.x, currentPosition.y, currentPosition.z);
        this.m_Camera.rotate3D(currentPosition.pitch,'x')
        this.m_Camera.rotate3D(currentPosition.yaw,'y')
        this.m_Camera.rotate3D(currentPosition.roll,'z')
        this.m_Camera.drawSphere(this.m_nSize, 16, this.m_WireFrame, this.m_strColor);

        this.m_Camera.restore();
    }

    onSimulate(deltaTime) {
        super.onSimulate(deltaTime);
    }
}

class CSun extends CCelestialBody {
    constructor(camera, size, color) {
        super(camera, size, color, (t) => ({
            x: 0,
            y: 0,
            z: 0,
            pitch: 0,
            roll: 0,
            yaw: t * -0.01
        }));
    }
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

class CPlanetSystem {
    constructor(camera) {
        this.planets = [
            new CPlanet(camera, 0.383, "grey", t => this.getOrbit(t, 0.39, toRadians(7.0), 88)),   // Mercury
            new CPlanet(camera, 0.949, "orange", t => this.getOrbit(t, 0.72, toRadians(3.4), 225)), // Venus
            new CPlanet(camera, 1.0, "blue", t => this.getOrbit(t, 1.0, toRadians(0.0), 365)),      // Earth
            new CPlanet(camera, 0.532, "red", t => this.getOrbit(t, 1.52, toRadians(1.9), 687)),    // Mars
            new CPlanet(camera, 11.21, "orange", t => this.getOrbit(t, 5.2, toRadians(1.3), 4333)), // Jupiter
            new CPlanet(camera, 9.45, "yellow", t => this.getOrbit(t, 9.58, toRadians(2.5), 10759)),// Saturn
            new CPlanet(camera, 4.01, "cyan", t => this.getOrbit(t, 19.2, toRadians(0.8), 30685)),  // Uranus
            new CPlanet(camera, 3.88, "blue", t => this.getOrbit(t, 30.05, toRadians(1.8), 60190))  // Neptune
        ];
    }

    getOrbit(t, distance, incline, period) {
        distance = distance * 10
        period = period * 10
        const angle = (2 * Math.PI * t) / period;
        return {
            x: distance * Math.cos(angle),
            z: distance * Math.sin(angle) * Math.cos(incline),
            y: distance * Math.sin(angle) * Math.sin(incline),
            pitch: 0,
            roll: 0,
            yaw: angle
        };
    }

    onDraw(context, deltaTime) {
        this.planets.forEach(planet => planet.onDraw(context, deltaTime));
    }

    onSimulate(deltaTime) {
        this.planets.forEach(planet => planet.onSimulate(deltaTime));
    }
}



class CDebugBox{
    constructor(camera){
        this.m_Camera = camera;
    }

    onDraw(context, deltaTime) {
        this.m_Camera.save()
        this.m_Camera.translate3D(-10,-10,-10)
        this.m_Camera.drawBox(1);
        this.m_Camera.save()
        this.m_Camera.translate3D(3,0,0)
        this.m_Camera.rotate3D(Math.PI/10,'z')

        this.m_Camera.save()
        this.m_Camera.scale3D(2,1,1)
        this.m_Camera.drawBox(1,true,"red");
        this.m_Camera.restore()

        this.m_Camera.translate3D(3,0,0)
        this.m_Camera.rotate3D(Math.PI/10,'y')

        this.m_Camera.save()
        this.m_Camera.scale3D(2,2,1)
        this.m_Camera.drawBox(1,true,"green");
        this.m_Camera.restore()

        this.m_Camera.translate3D(3,0,0)
        this.m_Camera.rotate3D(Math.PI/10,'x')

        this.m_Camera.save()
        this.m_Camera.scale3D(2,2,2)
        this.m_Camera.drawBox(1,true,"blue");
        this.m_Camera.restore()

        this.m_Camera.restore()
        this.m_Camera.rotate3D(Math.PI/4,'y')
        this.m_Camera.rotate3D(Math.PI/4,'x')
        this.m_Camera.translate3D(0,0,2)
        this.m_Camera.drawBox(1,false,"red");
        this.m_Camera.translate3D(0,0,2)
        this.m_Camera.drawBox(1,false,"green");
        this.m_Camera.translate3D(0,0,2)
        this.m_Camera.drawBox(1,false,"blue");
        this.m_Camera.restore()
    }
}


class COrigin{
    constructor(camera){
        this.m_Camera = camera;
    }

    onDraw(context, deltaTime) {
        context.save();
        context.fillStyle = "white";
        context.font = "12px Arial";

        context.save();
        this.m_Camera.translate(1.1, 0, 0);
        context.fillText(`X`, 0, 5);
        context.restore();

        context.save();
        this.m_Camera.translate(0, 1.1, 0);
        context.fillText(`Y`, 0, 5);
        context.restore();

        context.save();
        this.m_Camera.translate(0, 0, 1.1);
        context.fillText(`Z`, 0, 5);
        context.restore();

        this.m_Camera.drawLine([0, 0, 0], [1, 0, 0], "red"); // X-axis
        this.m_Camera.drawLine([1, 0, 0], [0.9, 0.1, 0], "red");
        this.m_Camera.drawLine([1, 0, 0], [0.9, 0, 0.1], "red");

        this.m_Camera.drawLine([0, 0, 0], [0, 1, 0], "blue"); // Y-axis
        this.m_Camera.drawLine([0, 1, 0], [0.1, 0.9, 0], "blue");
        this.m_Camera.drawLine([0, 1, 0], [0, 0.9, 0.1], "blue");

        this.m_Camera.drawLine([0, 0, 0], [0, 0, 1], "green"); // Z-axis
        this.m_Camera.drawLine([0, 0, 1], [0.1, 0, 0.9], "green");
        this.m_Camera.drawLine([0, 0, 1], [0, 0.1, 0.9], "green");

        context.restore();
    }
}

class CCamera {
    constructor(fov, location, pitch, yaw, roll, width, height) {
        this.m_flFov = (fov * Math.PI) / 180;
        this.m_vec3Location = location;
        this.m_flPitch = (pitch * Math.PI) / 180;
        this.m_flYaw = (yaw * Math.PI) / 180;
        this.m_flRoll = (roll * Math.PI) / 180;
        this.m_Context = null;
        this.m_iWidth = width;
        this.m_iHeight = height;

        this.m_ProjectionMatrix = mat4.create();
        this.m_ViewMatrix = mat4.create();

        this.drawingBuffer = [];

        this.m_TransformMatrix = mat4.create();
        this.m_TransformMatrixStack = [];

        this.updateProjectionMatrix();
        this.updateViewMatrix();

        this.m_flMovementSpeed = 0.01;
        this.m_flRotationSpeed = 0.002;
    }

    bufferPolygon(vertices, wireframe = true, color = "white") {
        const transformMatrixClone = mat4.clone(this.m_TransformMatrix);
        const viewMatrixClone = mat4.clone(this.m_ViewMatrix);

        const transformedVertices = vertices.map(vertex => {
            const transformedVertex = vec3.create();
            vec3.transformMat4(transformedVertex, vertex, transformMatrixClone);
            vec3.transformMat4(transformedVertex, transformedVertex, viewMatrixClone);
            return transformedVertex;
        });

        const avgZ = transformedVertices.reduce((sum, v) => sum + v[2], 0) / transformedVertices.length;

        this.drawingBuffer.push({
            zIndex: avgZ,
            draw: () => {
                this.m_Context.beginPath();
                vertices.forEach((vertex, index) => {
                    const screenPos = this.worldToScreen(vertex, transformMatrixClone, viewMatrixClone);
                    if (screenPos) {
                        index === 0 ? this.m_Context.moveTo(screenPos.x, screenPos.y) : this.m_Context.lineTo(screenPos.x, screenPos.y);
                    }
                });
                this.m_Context.closePath();
                this.m_Context[wireframe ? 'strokeStyle' : 'fillStyle'] = color;
                this.m_Context[wireframe ? 'stroke' : 'fill']();
            }
        });
    }

    bufferLine(start, end, color = "white") {
        const transformMatrixClone = mat4.clone(this.m_TransformMatrix);
        const viewMatrixClone = mat4.clone(this.m_ViewMatrix);

        const transformedStart = vec3.create();
        vec3.transformMat4(transformedStart, start, transformMatrixClone);
        vec3.transformMat4(transformedStart, transformedStart, viewMatrixClone);

        const transformedEnd = vec3.create();
        vec3.transformMat4(transformedEnd, end, transformMatrixClone);
        vec3.transformMat4(transformedEnd, transformedEnd, viewMatrixClone);

        const avgZ = (transformedStart[2] + transformedEnd[2]) / 2;

        this.drawingBuffer.push({
            zIndex: avgZ,
            draw: () => {
                const startPos = this.worldToScreen(start, transformMatrixClone, viewMatrixClone);
                const endPos = this.worldToScreen(end, transformMatrixClone, viewMatrixClone);
                if (startPos && endPos) {
                    this.m_Context.beginPath();
                    this.m_Context.moveTo(startPos.x, startPos.y);
                    this.m_Context.lineTo(endPos.x, endPos.y);
                    this.m_Context.strokeStyle = color;
                    this.m_Context.stroke();
                }
            }
        });
    }

    drawBufferedObjects() {
        // Sort by Z-index, with higher Z values (closer) rendered last
        this.drawingBuffer.sort((a, b) => b.zIndex - a.zIndex);

        // Draw each buffered object
        this.drawingBuffer.forEach(obj => obj.draw());
        this.drawingBuffer = []; // Clear buffer after drawing
    }

    drawBox(size = 1, wireframe = true, color = "white") {
        const halfSize = size / 2;
        const boxVertices = [
            [halfSize, halfSize, halfSize], [-halfSize, halfSize, halfSize],
            [-halfSize, -halfSize, halfSize], [halfSize, -halfSize, halfSize],
            [halfSize, halfSize, -halfSize], [-halfSize, halfSize, -halfSize],
            [-halfSize, -halfSize, -halfSize], [halfSize, -halfSize, -halfSize]
        ];
        const faces = [
            [boxVertices[0], boxVertices[1], boxVertices[2], boxVertices[3]], // Front
            [boxVertices[4], boxVertices[5], boxVertices[6], boxVertices[7]], // Back
            [boxVertices[0], boxVertices[3], boxVertices[7], boxVertices[4]], // Left
            [boxVertices[1], boxVertices[2], boxVertices[6], boxVertices[5]], // Right
            [boxVertices[3], boxVertices[2], boxVertices[6], boxVertices[7]], // Top
            [boxVertices[0], boxVertices[1], boxVertices[5], boxVertices[4]]  // Bottom
        ];
        faces.forEach(face => this.bufferPolygon(face, wireframe, color));
    }

    drawLine(start, end, color = "white") {
        this.bufferLine(start, end, color);
    }

    drawSphere(radius, quality, wireframe = true, color = "rgba(255, 255, 255, 0.6)") {
        const vertices = [];
        for (let i = 0; i <= quality; i++) {
            const theta = (i * Math.PI) / quality;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let j = 0; j <= quality; j++) {
                const phi = (j * 2 * Math.PI) / quality;
                vertices.push([radius * Math.cos(phi) * sinTheta, radius * cosTheta, radius * Math.sin(phi) * sinTheta]);
            }
        }

        for (let i = 0; i < quality; i++) {
            for (let j = 0; j < quality; j++) {
                const p1 = i * (quality + 1) + j;
                const p2 = p1 + quality + 1;
                this.bufferPolygon([vertices[p1], vertices[p1 + 1], vertices[p2 + 1], vertices[p2]], wireframe, color);
            }
        }
    }

    save() {
        const currentMatrix = mat4.clone(this.m_TransformMatrix);
        this.m_TransformMatrixStack.push(currentMatrix);
    }

    restore() {
        if (this.m_TransformMatrixStack.length > 0) {
            this.m_TransformMatrix = this.m_TransformMatrixStack.pop();
        } else {
            console.warn("Transform restore called with an empty stack.");
        }
    }

    useContext(context) {
        this.m_Context = context;
        this.m_TransformMatrixStack = [];
        this.m_TransformMatrix = mat4.create();
        if (this.m_Context.canvas.width !== this.m_iWidth || this.m_Context.canvas.height !== this.m_iHeight) {
            this.m_iWidth = this.m_Context.canvas.width;
            this.m_iHeight = this.m_Context.canvas.height;
            this.updateProjectionMatrix();
        }
        this.updateViewMatrix();
    }

    translate3D(x, y, z) {
        const translationMatrix = mat4.create();
        mat4.translate(translationMatrix, translationMatrix, [x, y, z]);
        mat4.multiply(this.m_TransformMatrix, this.m_TransformMatrix, translationMatrix);
    }

    scale3D(sx, sy, sz) {
        const scaleMatrix = mat4.create();
        mat4.scale(scaleMatrix, scaleMatrix, [sx, sy, sz]);
        mat4.multiply(this.m_TransformMatrix, this.m_TransformMatrix, scaleMatrix);
    }

    rotate3D(angle, axis) {
        const rotationMatrix = mat4.create();

        if (axis === 'x') {
            mat4.rotateX(rotationMatrix, rotationMatrix, angle);
        } else if (axis === 'y') {
            mat4.rotateY(rotationMatrix, rotationMatrix, angle);
        } else if (axis === 'z') {
            mat4.rotateZ(rotationMatrix, rotationMatrix, angle);
        } else {
            console.warn('Invalid axis for rotation. Use "x", "y", or "z".');
            return;
        }

        mat4.multiply(this.m_TransformMatrix, this.m_TransformMatrix, rotationMatrix);
    }

    setPosition(x, y, z) {
        this.m_vec3Location = [x, y, z];
        this.updateViewMatrix();
    }

    moveForward(distance) {
        const forward = [
            Math.cos(this.m_flPitch) * Math.sin(this.m_flYaw),
            Math.sin(this.m_flPitch),
            Math.cos(this.m_flPitch) * Math.cos(this.m_flYaw)
        ];
        this.m_vec3Location[0] -= distance * forward[0];
        this.m_vec3Location[1] -= distance * forward[1];
        this.m_vec3Location[2] -= distance * forward[2];
        this.updateViewMatrix();
    }

    moveRight(distance) {
        const forward = [
            Math.cos(this.m_flPitch) * Math.sin(this.m_flYaw),
            Math.sin(this.m_flPitch),
            Math.cos(this.m_flPitch) * Math.cos(this.m_flYaw)
        ];
        const up = [0, 1, 0];
        const right = vec3.create();
        vec3.cross(right, forward, up);
        vec3.normalize(right, right);
        this.m_vec3Location[0] -= distance * right[0];
        this.m_vec3Location[1] -= distance * right[1];
        this.m_vec3Location[2] -= distance * right[2];
        this.updateViewMatrix();
    }

    moveUp(distance) {
        this.m_vec3Location[1] += distance;
        this.updateViewMatrix();
    }

    updateProjectionMatrix() {
        const aspectRatio = this.m_iWidth / this.m_iHeight;
        mat4.perspective(this.m_ProjectionMatrix, this.m_flFov, aspectRatio, 0.1, 1000);
    }

    updateViewMatrix() {
        const forward = [
            Math.cos(this.m_flPitch) * Math.sin(this.m_flYaw),
            Math.sin(this.m_flPitch),
            Math.cos(this.m_flPitch) * Math.cos(this.m_flYaw)
        ];
        const target = [
            this.m_vec3Location[0] + forward[0],
            this.m_vec3Location[1] + forward[1],
            this.m_vec3Location[2] + forward[2]
        ];
        const up = [0, 1, 0]; // we basically do not use roll (no camera tilt lol)
        mat4.lookAt(this.m_ViewMatrix, this.m_vec3Location, target, up);
    }

    updateViewMatrixDeprecated() {
        let viewRotation = mat4.create();
        mat4.rotateY(viewRotation, viewRotation, this.m_flYaw);
        mat4.rotateX(viewRotation, viewRotation, this.m_flPitch);
        mat4.rotateZ(viewRotation, viewRotation, this.m_flRoll);

        let translation = mat4.create();
        mat4.translate(translation, translation, [-this.m_vec3Location[0], -this.m_vec3Location[1], -this.m_vec3Location[2]]);

        mat4.multiply(this.m_ViewMatrix, viewRotation, translation);
    }

    worldToScreen(point, transformMatrix = this.m_TransformMatrix, viewMatrix = this.m_ViewMatrix) {
        const transformedPoint = vec3.create();
        vec3.transformMat4(transformedPoint, point, transformMatrix);
        vec3.transformMat4(transformedPoint, transformedPoint, viewMatrix);

        if (transformedPoint[2] < 0.1 || transformedPoint[2] > 1000) {
            return null;
        }

        const projected = vec3.create();
        vec3.transformMat4(projected, transformedPoint, this.m_ProjectionMatrix);

        const x = (projected[0] / projected[2]) * this.m_iWidth / 2 + this.m_iWidth / 2;
        const y = (projected[1] / projected[2]) * this.m_iHeight / 2 + this.m_iHeight / 2;

        return { x, y };
    }

    translate(x, y, z) {
        if (!this.m_Context) return;
        const screenPos = this.worldToScreen([x, y, z]);
        if (screenPos) {
            this.m_Context.translate(screenPos.x, screenPos.y);
        }
    }

    moveTo(x, y, z) {
        if (!this.m_Context) return;
        const screenPos = this.worldToScreen([x, y, z]);
        if (screenPos) {
            this.m_Context.moveTo(screenPos.x, screenPos.y);
        }
    }

    lineTo(x, y, z) {
        if (!this.m_Context) return;
        const screenPos = this.worldToScreen([x, y, z]);
        if (screenPos) {
            this.m_Context.lineTo(screenPos.x, screenPos.y);
        }
    }
}

function setup() {
    let canvas = document.getElementById('deez');
    let lastFrameTime = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);

    let g_Background = new CBackground("black");
    let g_Camera = new CCamera(90, [20, 20, 20], 45, 45, 0, window.innerWidth, window.innerHeight);
    let g_Origin = new COrigin(g_Camera);
    let g_DebugBox = new CDebugBox(g_Camera)
    let g_Sun = new CSun(g_Camera, 1.5, "yellow");
    let g_PlanetSystem = new CPlanetSystem(g_Camera);

    const keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false
    };


    window.addEventListener('keydown', (event) => {
        if (event.code === 'KeyW') keys.forward = true;
        if (event.code === 'KeyS') keys.backward = true;
        if (event.code === 'KeyA') keys.left = true;
        if (event.code === 'KeyD') keys.right = true;
        if (event.code === 'Space') keys.up = true;
        if (event.code === 'ControlLeft') keys.down = true;
    });


    window.addEventListener('keyup', (event) => {
        if (event.code === 'KeyW') keys.forward = false;
        if (event.code === 'KeyS') keys.backward = false;
        if (event.code === 'KeyA') keys.left = false;
        if (event.code === 'KeyD') keys.right = false;
        if (event.code === 'Space') keys.up = false;
        if (event.code === 'ControlLeft') keys.down = false;
    });

    let bIsPointerLocked = false;

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        bIsPointerLocked = document.pointerLockElement === canvas;
    });

    function normalizeYaw(yaw) {
        // Normalize yaw to be within -π to π
        while (yaw > Math.PI) yaw -= 2 * Math.PI;
        while (yaw < -Math.PI) yaw += 2 * Math.PI;
        return yaw;
    }

    document.addEventListener('mousemove', (event) => {
        if (!bIsPointerLocked) return;

        const deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const deltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        g_Camera.m_flYaw -= deltaX * g_Camera.m_flRotationSpeed;
        g_Camera.m_flPitch += deltaY * g_Camera.m_flRotationSpeed;
        g_Camera.m_flPitch = clamp(-Math.PI / 2.01, Math.PI / 2.01, g_Camera.m_flPitch); //2.01 so that pitch cannot be 90 degrees

        g_Camera.m_flYaw = normalizeYaw(g_Camera.m_flYaw);

        g_Camera.updateViewMatrix();
    });

    function draw(frametime) {
        const deltaTime = frametime - lastFrameTime;
        lastFrameTime = frametime;
        const context = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        g_Background.onDraw(context, deltaTime);
        g_Camera.useContext(context)


        g_Camera.save()
        g_Camera.scale3D(5,5,5)
        g_Origin.onDraw(context, deltaTime);
        g_Camera.restore()
        g_DebugBox.onDraw(context, deltaTime);

        g_Camera.translate3D(10,10,10)
        g_Sun.onDraw(context, deltaTime);
        g_PlanetSystem.onDraw(context, deltaTime);

        g_Camera.drawBufferedObjects()

        window.requestAnimationFrame(draw);
    }


    let lastCallTime = performance.now();

    let t = 0;

    function simulate() {
        const currentTime = performance.now();
        const deltaTime = lastCallTime ? currentTime - lastCallTime : 0;

        g_Background.onSimulate(deltaTime);
        g_Sun.onSimulate(deltaTime);
        g_PlanetSystem.onSimulate(deltaTime);

        if (keys.forward) g_Camera.moveForward(g_Camera.m_flMovementSpeed * deltaTime);
        if (keys.backward) g_Camera.moveForward(-g_Camera.m_flMovementSpeed * deltaTime);
        if (keys.left) g_Camera.moveRight(-g_Camera.m_flMovementSpeed * deltaTime);
        if (keys.right) g_Camera.moveRight(g_Camera.m_flMovementSpeed * deltaTime);
        if (keys.up) g_Camera.moveUp(g_Camera.m_flMovementSpeed * deltaTime);      // Added
        if (keys.down) g_Camera.moveUp(-g_Camera.m_flMovementSpeed * deltaTime);

        g_Background.m_CameraState = [g_Camera.m_vec3Location[0].toFixed(1), g_Camera.m_vec3Location[1].toFixed(1), g_Camera.m_vec3Location[2].toFixed(1), (g_Camera.m_flPitch * (180 / Math.PI)).toFixed(1), (g_Camera.m_flYaw * (180 / Math.PI)).toFixed(1), (g_Camera.m_flRoll * (180 / Math.PI)).toFixed(1)]

        lastCallTime = currentTime;
        setTimeout(simulate, 1000 / 128);
    }

    window.requestAnimationFrame(draw);
    setTimeout(simulate, 1000 / 128);
}

window.onload = setup;