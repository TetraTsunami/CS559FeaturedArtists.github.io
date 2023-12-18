/**
 * A rectangle, draw it any angle
 */
class Rectangle extends WebGLDrawer {


    // vertex positions
    vertexPos = new Float32Array(
        [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0]);

    //  vertex normals
    vertexNormals = new Float32Array(
        [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);

    // vertex colors
    vertexColors = new Float32Array(
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

    // element index array
    triangleIndices = new Uint8Array(
        [0, 1, 2, 0, 2, 3]);


    // vertex texture coordinates
    vertexTextureCoords = new Float32Array(
        [1, 1, 0, 1, 0, 0, 1, 0]);

    texture;

    setRepeatSize(size) {
        this.vertexTextureCoords = new Float32Array([size, size, 0, size, 0, 0, size, 0]);
        if (this.texture instanceof WebGLTexture) {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            // Set the wrapping mode for both S (horizontal) and T (vertical) coordinates to REPEAT
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
        }
    };
}

class Circle extends GameObject {

    path;

    constructor(position, radius, color, step = 30) {
        super(position);
        this.radius = radius;
        this.fillStyle = color;
        this.step = step;
        this.createPath();
    }

    createPath() {
        this.path = [];

        const inc = Math.PI * 2 / this.step;
        const tau = Math.PI * 2;
        this.path.push([this.radius, 0, 0]);
        for (let rad = inc; rad <= tau; rad += inc) {
            this.path.push([this.radius * Math.cos(rad), this.radius * Math.sin(rad), 0]);
        }
    }

    draw() {
    }
}

class Box extends WebGLDrawer {

    // vertex positions
    vertexPos = new Float32Array(
        [1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1,
            1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1,
            1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1,
            -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1,
            -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
            1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1]);

    //  vertex normals
    vertexNormals = new Float32Array(
        [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]);

    // vertex colors
    vertexColors = new Float32Array(
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

    // element index array
    triangleIndices = new Uint8Array(
        [0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // right
            8, 9, 10, 8, 10, 11,    // top
            12, 13, 14, 12, 14, 15,    // left
            16, 17, 18, 16, 18, 19,    // bottom
            20, 21, 22, 20, 22, 23]); // back


    // vertex texture coordinates
    vertexTextureCoords = new Float32Array(
        [0, 0, 1, 0, 1, 1, 0, 1,
            1, 0, 1, 1, 0, 1, 0, 0,
            0, 1, 0, 0, 1, 0, 1, 1,
            0, 0, 1, 0, 1, 1, 0, 1,
            1, 1, 0, 1, 0, 0, 1, 0,
            1, 1, 0, 1, 0, 0, 1, 0]);

}

class Cone extends WebGLDrawer {
    side = 30;
    height;

    constructor(position, radius, height, side = 30) {
        super(position);
        this.fillStyle = "#ffffff";
        this.radius = radius;
        this.height = height;
        this.setSide(side);
    }

    setSide(side) {
        this.side = side;
        this.createShape();
    }

    createShape() {
        this.vertexPos = [];
        this.vertexColors = [];
        this.vertexTextureCoords = [];
        this.vertexNormals = [];

        this.triangleIndices = [];

        const baseRadius = this.radius;  // Radius of the cone's base
        const height = this.height;      // Height of the cone
        const sides = this.side;        // Number of sides (subdivisions)


        // Vertices for the base
        const y = -height / 2;
        for (let i = 0; i < sides; i++) {
            const theta = (i / sides) * 2 * Math.PI;
            const x = baseRadius * Math.cos(theta);
            const z = baseRadius * Math.sin(theta);

            const u = 0;
            const v = i / sides;

            this.vertexPos.push(x, y, z);
            this.vertexNormals.push(-x, y, z);
            this.vertexColors.push(1, 1, 1);
            this.vertexTextureCoords.push(u, v);
        }

        // Vertex for the apex (tip)
        this.vertexPos.push(0, height / 2, 0);
        this.vertexNormals.push(0, 1, 0);
        this.vertexColors.push(1, 1, 1);
        this.vertexTextureCoords.push(1, 1);

        // Indices for the triangles
        for (let i = 0; i < sides; i++) {
            this.triangleIndices.push(i, sides, (i + 1) % sides);
        }


        // Indices for the triangles
        for (let i = 0; i < sides; i++) {
            this.triangleIndices.push(i, i + 1, 0);
        }


        this.vertexPos = new Float32Array(this.vertexPos);
        this.triangleIndices = new Uint8Array(this.triangleIndices);
        this.vertexNormals = new Float32Array(this.vertexNormals);
        this.vertexColors = new Float32Array(this.vertexColors);
        this.vertexTextureCoords = new Float32Array(this.vertexTextureCoords);
    }
}

class Sphere extends WebGLDrawer {
    bands = 30;

    constructor(position, bands = 30) {
        super(position);
        this.fillStyle = "#ffffff";
        this.strokeStyle = "#eeeeee";
        this.setBand(bands);
    }
    setBand(bands) {
        this.bands = bands;
        this.createShape();
    }

    createShape() {
        this.vertexPos = [];
        this.vertexNormals = [];
        this.triangleIndices = [];
        this.vertexColors = [];
        this.vertexTextureCoords = [];

        const latitudeBands = this.bands;
        const longitudeBands = this.bands;
        const radius = this.radius;

        for (let lat = 0; lat <= latitudeBands; lat++) {
            const theta = (lat * Math.PI) / latitudeBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= longitudeBands; lon++) {
                const phi = (lon * 2 * Math.PI) / longitudeBands;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                const nx = x;
                const ny = y;
                const nz = z;

                const u = 1 - lon / longitudeBands;
                const v = lat / latitudeBands;

                this.vertexPos.push(radius * x, radius * y, radius * z);
                this.vertexNormals.push(nx, ny, nz);
                this.vertexColors.push(1, 1, 1);
                this.vertexTextureCoords.push(u, v);

                if (lat < latitudeBands && lon < longitudeBands) {
                    const first = lat * (longitudeBands + 1) + lon;
                    const second = first + longitudeBands + 1;

                    this.triangleIndices.push(first, first + 1, second);
                    this.triangleIndices.push(second, first + 1, second + 1);
                }
            }
        }


        // console.log(this.triangleIndices, new Uint8Array(this.triangleIndices), new Uint16Array(this.triangleIndices), new Uint32Array(this.triangleIndices));
        this.vertexPos = new Float32Array(this.vertexPos);
        this.triangleIndices = new Uint8Array(this.triangleIndices);
        this.vertexNormals = new Float32Array(this.vertexNormals);
        this.vertexColors = new Float32Array(this.vertexColors);
        this.vertexTextureCoords = new Float32Array(this.vertexTextureCoords);
        // console.log(this.vertexPos, this.vertexNormals, this.vertexColors, this.triangleIndices);
        // console.log(this.vertexPos.length, this.vertexNormals.length, this.vertexColors.length, this.triangleIndices.length);
    }
}
