// Reflections and ripples in lake
const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('resetButton').addEventListener('click', () => Camera.reset());
});

const Utils = (() => {
    const resizeCanvas = (canvas, gl) => {
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener('resize', resize);
        resize();
    };
    const compileShader = (source, type) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    };
    const createShaderProgram = (vsSource, fsSource) => {
        const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);
        if (!vertexShader || !fragmentShader) return null;
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        return program;
    };
    const createBuffer = (target, data, usage = gl.STATIC_DRAW) => {
        const buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, data, usage);
        return buffer;
    };
    const loadTexture = (url, gl, options = {}) => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = options.internalFormat || gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = options.srcFormat || gl.RGBA;
        const srcType = options.srcType || gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([255, 255, 255, 255]);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        };
        image.src = url;

        return texture;
    };
    const isPowerOf2 = (value) => (value & (value - 1)) === 0;
    const createTexCoords = (positions, options) => {
        const { type, size, divisions, radius } = options;
        const texCoords = [];

        switch (type) {
            case 'grid':
                const repeats = 10;
                positions.forEach((_, index) => {
                    if (index % 3 === 0) {
                        const x = positions[index];
                        const u = ((x + size / 2) / size * repeats) % 1;
                        texCoords.push(u);
                    } else if (index % 3 === 2) {
                        const z = positions[index];
                        const v = ((z + size / 2) / size * repeats) % 1;
                        texCoords.push(v);
                    }
                });
                break;

            case 'circle':
                positions.forEach((_, index) => {
                    if (index % 3 === 0) {
                        const x = positions[index];
                        texCoords.push((x / radius + 1) / 2);
                    } else if (index % 3 === 2) {
                        const z = positions[index];
                        texCoords.push((z / radius + 1) / 2);
                    }
                });
                break;

            case 'sphere':
                for (let i = 0; i < positions.length; i += 3) {
                    const x = positions[i];
                    const y = positions[i + 1];
                    const z = positions[i + 2];
                    const u = 0.5 + (Math.atan2(z, x) / (2 * Math.PI));
                    const v = 0.5 - (Math.asin(y / Math.sqrt(x * x + y * y + z * z)) / Math.PI);
                    texCoords.push(u, v);
                }
                break;
        }

        return texCoords;
    };
    const createGeometry = (type, params = {}) => {
        switch (type) {
            case 'sphere': {
                const { radius = 1, latBands = 30, lonBands = 30 } = params;
                const positions = [], normals = [], indices = [];
                for (let lat = 0; lat <= latBands; lat++) {
                    const theta = lat * Math.PI / latBands, sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);
                    for (let lon = 0; lon <= lonBands; lon++) {
                        const phi = lon * 2 * Math.PI / lonBands, sinPhi = Math.sin(phi), cosPhi = Math.cos(phi);
                        const x = cosPhi * sinTheta, y = cosTheta, z = sinPhi * sinTheta;
                        normals.push(x, y, z);
                        positions.push(radius * x, radius * y, radius * z);
                    }
                }
                for (let lat = 0; lat < latBands; lat++) {
                    for (let lon = 0; lon < lonBands; lon++) {
                        const first = lat * (lonBands + 1) + lon, second = first + lonBands + 1;
                        indices.push(first, second, first + 1, second, second + 1, first + 1);
                    }
                }
                return { positions, normals, indices };
            }
            case 'line': {
                const start = params.start || [0, 0, 0], end = params.end || [0, 1, 0];
                return {
                    positions: [start[0], start[1], start[2], end[0], end[1], end[2]],
                    normals: [0, 0, 0, 0, 0, 0],
                    indices: [0, 1],
                };
            }
            case 'duck': {
                const { size = 1 } = params;
                const bodyWidth = size * 0.7, bodyHeight = size * 0.5, headSize = size * 0.45, beakSize = size * 0.15;
                const bodyGeometry = Utils.createGeometry('sphere', { radius: bodyWidth / 2, latBands: 16, lonBands: 16 });
                const headGeometry = Utils.createGeometry('sphere', { radius: headSize / 2, latBands: 8, lonBands: 8 });
                let beakGeometry = Utils.createGeometry('cone', { radius: beakSize, height: beakSize * 1.5, segments: 8 });
                const rotationMatrix = mat4.create(); mat4.rotateX(rotationMatrix, rotationMatrix, Math.PI / 2);
                const rotatedBeakPositions = [];
                for (let i = 0; i < beakGeometry.positions.length; i += 3) {
                    const v = vec3.fromValues(beakGeometry.positions[i], beakGeometry.positions[i + 1], beakGeometry.positions[i + 2]);
                    vec3.transformMat4(v, v, rotationMatrix);
                    rotatedBeakPositions.push(...v);
                }
                beakGeometry.positions = rotatedBeakPositions;
                beakGeometry.positions = beakGeometry.positions.map((p, idx) => {
                    if (idx % 3 === 0) return p;
                    else if (idx % 3 === 1) return p + bodyHeight / 2 + (headSize / 2);
                    return p + (headSize / 2) - 1;
                });
                const positions = [
                    ...bodyGeometry.positions,
                    ...headGeometry.positions.map((pos, idx) => (idx % 3 === 1 ? pos + bodyHeight : pos)),
                    ...beakGeometry.positions
                ];
                const normals = [...bodyGeometry.normals, ...headGeometry.normals, ...beakGeometry.normals];
                const bodyCount = bodyGeometry.positions.length / 3, headCount = headGeometry.positions.length / 3, beakCount = beakGeometry.positions.length / 3;
                const indices = [
                    ...bodyGeometry.indices,
                    ...headGeometry.indices.map(i => i + bodyCount),
                    ...beakGeometry.indices.map(i => i + bodyCount + headCount)
                ];
                return { positions, normals, indices, counts: { body: bodyCount, head: headCount, beak: beakCount } };
            }
            case 'cylinder': {
                const { radius = 1, height = 2, segments = 16 } = params;
                const positions = [], normals = [], indices = [];
                for (let i = 0; i <= segments; i++) {
                    const theta = i * 2 * Math.PI / segments, x = radius * Math.cos(theta), z = radius * Math.sin(theta);
                    positions.push(x, 0, z, x, height, z);
                    normals.push(Math.cos(theta), 0, Math.sin(theta), Math.cos(theta), 0, Math.sin(theta));
                }
                for (let i = 0; i < segments * 2; i += 2) {
                    indices.push(i, i + 1, (i + 2) % (segments * 2), i + 1, (i + 3) % (segments * 2), (i + 2) % (segments * 2));
                }
                return { positions, normals, indices };
            }
            case 'cone': {
                const { radius = 1, height = 2, segments = 16 } = params;
                const positions = [0, height, 0], normals = [0, 1, 0], indices = [];
                for (let i = 0; i <= segments; i++) {
                    const theta = i * 2 * Math.PI / segments, x = radius * Math.cos(theta), z = radius * Math.sin(theta);
                    positions.push(x, 0, z);
                    const normal = vec3.normalize([], [x, radius / height, z]);
                    normals.push(...normal);
                }
                for (let i = 1; i <= segments; i++) indices.push(0, i, i + 1);
                return { positions, normals, indices };
            }
            case 'circle': {
                const { radius = 1, segments = 32, height = 10 } = params;
                const positions = [0, height, 0], normals = [0, 1, 0], indices = [], colors = [0.0, 0.5, 1.0, 1.0];
                for (let i = 0; i <= segments; i++) {
                    const angle = i * 2 * Math.PI / segments, x = radius * Math.cos(angle), z = radius * Math.sin(angle);
                    positions.push(x, height, z);
                    normals.push(0, 1, 0);
                    colors.push(0.0, 0.5, 1.0, 1.0);
                }
                for (let i = 1; i <= segments; i++) indices.push(0, i, i + 1);
                return { positions, normals, indices };
            }
            case 'grid': {
                const { size = 500, divisions = 100, maxHeight = 50 } = params;
                const positions = [], normals = [], indices = [], colors = [];
                const halfSize = size / 2, step = size / divisions, simplex = new SimplexNoise();
                for (let i = 0; i <= divisions; i++) {
                    for (let j = 0; j <= divisions; j++) {
                        const x = -halfSize + j * step, z = -halfSize + i * step;
                        const y = simplex.noise2D(j / divisions * 5, i / divisions * 5) * maxHeight * 2;
                        positions.push(x, y, z);
                        normals.push(0, 1, 0);
                        colors.push(0.13, 0.55, 0.13, 1.0);
                    }
                }
                for (let i = 0; i < divisions; i++) {
                    for (let j = 0; j < divisions; j++) {
                        const topLeft = i * (divisions + 1) + j, bottomLeft = (i + 1) * (divisions + 1) + j;
                        indices.push(topLeft, bottomLeft, topLeft + 1, bottomLeft, bottomLeft + 1, topLeft + 1);
                    }
                }
                const calculateNormals = () => {
                    const tempNormals = Array(positions.length).fill(0);
                    for (let i = 0; i < indices.length; i += 3) {
                        const idx0 = indices[i] * 3, idx1 = indices[i + 1] * 3, idx2 = indices[i + 2] * 3;
                        const v0 = vec3.fromValues(positions[idx0], positions[idx0 + 1], positions[idx0 + 2]);
                        const v1 = vec3.fromValues(positions[idx1], positions[idx1 + 1], positions[idx1 + 2]);
                        const v2 = vec3.fromValues(positions[idx2], positions[idx2 + 1], positions[idx2 + 2]);
                        const edge1 = vec3.create(), edge2 = vec3.create();
                        vec3.subtract(edge1, v1, v0); vec3.subtract(edge2, v2, v0);
                        const normal = vec3.create();
                        vec3.cross(normal, edge1, edge2); vec3.normalize(normal, normal);
                        [idx0, idx1, idx2].forEach(ind => {
                            tempNormals[ind] += normal[0]; tempNormals[ind + 1] += normal[1]; tempNormals[ind + 2] += normal[2];
                        });
                    }
                    for (let i = 0; i < normals.length; i += 3) {
                        const n = vec3.fromValues(tempNormals[i], tempNormals[i + 1], tempNormals[i + 2]);
                        vec3.normalize(n, n);
                        normals[i] = n[0]; normals[i + 1] = n[1]; normals[i + 2] = n[2];
                    }
                };
                calculateNormals();
                return { positions, normals, indices, colors };
            }
        }
    };
    const createModel = ({ positions, normals, indices, colors, texCoords, texture, radius, normalMap, specularMap, occlusionMap }) => ({
        positions,
        position: createBuffer(gl.ARRAY_BUFFER, new Float32Array(positions)),
        normal: createBuffer(gl.ARRAY_BUFFER, new Float32Array(normals)),
        texCoord: texCoords ? createBuffer(gl.ARRAY_BUFFER, new Float32Array(texCoords)) : null,
        colors: colors ? createBuffer(gl.ARRAY_BUFFER, new Float32Array(colors)) : null,
        indices: createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)),
        vertexCount: indices.length,
        modelMatrix: mat4.create(),
        texture: texture || null,
        normalMap: normalMap || null,
        specularMap: specularMap || null,
        occlusionMap: occlusionMap || null,
        radius: radius || null
    });
    const createInstances = (baseModel, positionsArray, transforms = []) => {
        return positionsArray.map(pos => {
            const instance = { ...baseModel, modelMatrix: mat4.clone(baseModel.modelMatrix) };
            mat4.translate(instance.modelMatrix, instance.modelMatrix, pos);
            transforms.forEach(t => t(instance.modelMatrix));
            return instance;
        });
    };
    const getTerrainHeight = (x, z, terrain) => {
        const size = terrain.radius * 2, divisions = 200, step = size / divisions;
        const halfSize = size / 2;
        const gridX = ((x + halfSize) / size) * divisions, gridZ = ((z + halfSize) / size) * divisions;
        let x0 = Math.floor(gridX), z0 = Math.floor(gridZ);
        x0 = Math.max(0, Math.min(x0, divisions - 1));
        z0 = Math.max(0, Math.min(z0, divisions - 1));
        const x1 = Math.min(x0 + 1, divisions), z1 = Math.min(z0 + 1, divisions);
        const s = gridX - x0, t = gridZ - z0;
        const getY = (i, j) => terrain.positions[(i * (divisions + 1) + j) * 3 + 1];
        const y00 = getY(z0, x0), y10 = getY(z0, x1), y01 = getY(z1, x0), y11 = getY(z1, x1);
        const y0 = y00 * (1 - s) + y10 * s, y1 = y01 * (1 - s) + y11 * s, y = y0 * (1 - t) + y1 * t;
        return y;
    };
    const quadVertices = new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        1, 1,
    ]);
    const quadBuffer = createBuffer(gl.ARRAY_BUFFER, quadVertices);


    return { resizeCanvas, createShaderProgram, loadTexture, createTexCoords, createGeometry, createModel, createInstances, getTerrainHeight, quadBuffer };
})();
Utils.resizeCanvas(canvas, gl);

const skyboxVertexSource = document.getElementById("vertexShaderSkybox").text;
const skyboxFragmentSource = document.getElementById("fragmentShaderSkybox").text;
const skyboxProgram = Utils.createShaderProgram(skyboxVertexSource, skyboxFragmentSource);
const skyboxInfo = {
    attribLocations: { position: gl.getAttribLocation(skyboxProgram, 'aPosition') },
    uniformLocations: {
        uMVPMatrix: gl.getUniformLocation(skyboxProgram, 'uMVPMatrix'),
        uSunDirection: gl.getUniformLocation(skyboxProgram, 'uSunDirection'),
    },
};

const skyColors = { sunrise: [1.0, 0.5, 0.0, 1.0], noon: [0.53, 0.81, 0.92, 1.0], sunset: [1.0, 0.27, 0.0, 1.0], evening: [0.0, 0.0, 0.5, 1.0], night: [0.0, 0.0, 0.1, 1.0] };
const vertexSource = document.getElementById("vertexShader").text;
const fragmentSource = document.getElementById("fragmentShader").text;
const shaderProgram = Utils.createShaderProgram(vertexSource, fragmentSource);
const shaderInfo = {
    attribLocations: {
        position: gl.getAttribLocation(shaderProgram, 'aPosition'),
        normal: gl.getAttribLocation(shaderProgram, 'aNormal'),
        color: gl.getAttribLocation(shaderProgram, 'aColor'),
        texCoord: gl.getAttribLocation(shaderProgram, 'aTexCoord'),
    },
    uniformLocations: {
        uModelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
        uMVMatrix: gl.getUniformLocation(shaderProgram, 'uMVMatrix'),
        uMVPMatrix: gl.getUniformLocation(shaderProgram, 'uMVPMatrix'),
        uSunriseColor: gl.getUniformLocation(shaderProgram, 'uSunriseColor'),
        uNoonColor: gl.getUniformLocation(shaderProgram, 'uNoonColor'),
        uSunsetColor: gl.getUniformLocation(shaderProgram, 'uSunsetColor'),
        uEveningColor: gl.getUniformLocation(shaderProgram, 'uEveningColor'),
        uNightColor: gl.getUniformLocation(shaderProgram, 'uNightColor'),
        uSunDirection: gl.getUniformLocation(shaderProgram, 'uSunDirection'),
        uNormalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
        uUseTexture: gl.getUniformLocation(shaderProgram, 'uUseTexture'),
        uTexture: gl.getUniformLocation(shaderProgram, 'uTexture'),
        uLightPosition: gl.getUniformLocation(shaderProgram, 'uLightPosition'),
        uViewPosition: gl.getUniformLocation(shaderProgram, 'uViewPosition'),
        uShadowMapEnabled: gl.getUniformLocation(shaderProgram, 'uShadowMapEnabled'),
        uShadowMap: gl.getUniformLocation(shaderProgram, 'uShadowMap'),
        uLightMVPMatrix: gl.getUniformLocation(shaderProgram, 'uLightMVPMatrix'),
    },
}

const depthVertexSource = document.getElementById("depthVertexShader").text;
const depthFragmentSource = document.getElementById("depthFragmentShader").text;
const depthProgram = Utils.createShaderProgram(depthVertexSource, depthFragmentSource);
const depthInfo = {
    attribLocations: {
        position: gl.getAttribLocation(depthProgram, 'aPosition'),
    },
    uniformLocations: {
        uLightMVPMatrix: gl.getUniformLocation(depthProgram, 'uLightMVPMatrix'),
    },
};

const rainVertexSource = document.getElementById("rainVertexShader").text;
const rainFragmentSource = document.getElementById("rainFragmentShader").text;
const rainProgram = Utils.createShaderProgram(rainVertexSource, rainFragmentSource);
const rainInfo = {
    attribLocations: {
        position: gl.getAttribLocation(rainProgram, 'aPosition'),
    },
    uniformLocations: {
        uMVMatrix: gl.getUniformLocation(rainProgram, 'uMVMatrix'),
        uMVPMatrix: gl.getUniformLocation(rainProgram, 'uMVPMatrix'),
        uColor: gl.getUniformLocation(rainProgram, 'uColor'),
    },
};

const textures = {
    moon: Utils.loadTexture(moon.src, gl),
    grass: Utils.loadTexture(grass.src, gl),
    water: Utils.loadTexture(water.src, gl),
    rock: Utils.loadTexture(rock.src, gl),
    trunk: Utils.loadTexture(trunk.src, gl),
    foliage: Utils.loadTexture(foliage.src, gl),
    cloud: Utils.loadTexture(cloud.src, gl),
};

const geometries = {
    terrain: (() => {
        ground = Utils.createGeometry('grid', { size: 3000, divisions: 200, maxHeight: 75 });
        texCoords = Utils.createTexCoords(ground.positions, { type: 'grid', size: 5000, divisions: 20 });
        return Utils.createModel({ positions: ground.positions, normals: ground.normals, indices: ground.indices, colors: ground.colors, texCoords: texCoords, texture: textures.grass, radius: 1500 });
    })(),
    skybox: Utils.createModel({
        positions: [
            -1000, -1000, 1000, 1000, -1000, 1000, 1000, 1000, 1000, -1000, 1000, 1000,
            -1000, -1000, -1000, -1000, 1000, -1000, 1000, 1000, -1000, 1000, -1000, -1000,
            -1000, 1000, -1000, -1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, -1000,
            -1000, -1000, -1000, 1000, -1000, -1000, 1000, -1000, 1000, -1000, -1000, 1000,
            1000, -1000, -1000, 1000, 1000, -1000, 1000, 1000, 1000, 1000, -1000, 1000,
            -1000, -1000, -1000, -1000, -1000, 1000, -1000, 1000, 1000, -1000, 1000, -1000,
        ],
        normals: Array(6 * 4).fill().flatMap((_, i) => {
            const fn = [[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]];
            return fn[Math.floor(i / 4)];
        }),
        indices: [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
        colors: Array(24).fill([0.529, 0.808, 0.922, 1.0]).flat(),
        texCoords: null,
        texture: null,
    }),
    lake: (() => {
        const { positions, normals, indices } = Utils.createGeometry('circle', { radius: 300, segments: 32, height: 1 });
        const texCoords = Utils.createTexCoords(positions, { type: 'circle', radius: 300 });
        const colors = [0.0, 0.5, 1.0, 1.0, ...Array(32).fill([0.0, 0.5, 1.0, 0.5]).flat()];
        return Utils.createModel({ positions, normals, indices, colors, texCoords, texture: textures.water, radius: 300 });
    })(),
    sun: (() => {
        const { positions, normals, indices } = Utils.createGeometry('sphere', { radius: 20 });
        const c = Array(positions.length / 3).fill([1.0, 1.0, 0.0, 1.0]).flat();
        return Utils.createModel({ positions, normals, indices, colors: c, texture: null, radius: 20 });
    })(),
    moon: (() => {
        const { positions, normals, indices } = Utils.createGeometry('sphere', { radius: 15 });
        const texCoords = Utils.createTexCoords(positions, { type: 'sphere' });
        const c = Array(positions.length / 3).fill([0.8, 0.8, 0.8, 1.0]).flat();
        return Utils.createModel({ positions, normals, indices, colors: c, texCoords, texture: textures.moon, radius: 15 });
    })(),
};

const createRocks = (amt, lakeR, ground) => {
    const arr = [], gs = ground.radius;
    while (arr.length < amt) {
        const x = Math.random() * gs * 2 - gs, z = Math.random() * gs * 2 - gs, d = Math.sqrt(x * x + z * z);
        if (d > lakeR + 10) {
            const y = Utils.getTerrainHeight(x, z, ground);
            arr.push([x, y, z]);
        }
    }
    const baseGeo = Utils.createGeometry('cone', { radius: 5, height: 10, segments: 16 });
    const baseTexCoords = [];
    baseGeo.positions.forEach((_, index) => {
        if (index % 3 === 0) {
            const x = baseGeo.positions[index];
            const y = baseGeo.positions[index + 1];
            const z = baseGeo.positions[index + 2];

            const u = 0.5 + (Math.atan2(z, x) / (2 * Math.PI)), v = y / 30;

            const repeats = 2;
            const wrappedU = ((u * repeats) % 1 + 1) % 1, wrappedV = Math.max(0, Math.min(1, v * repeats));

            baseTexCoords.push(wrappedU, wrappedV);
        }
    });
    const colors = Array(baseGeo.positions.length / 3).fill([0.5, 0.5, 0.5, 1.0]).flat()
    const base = Utils.createModel({ ...baseGeo, colors, texCoords: baseTexCoords, texture: textures.rock });
    return Utils.createInstances(base, arr);
};

const createTrees = (amt, lakeR, ground) => {
    const arr = [], gs = ground.radius;
    while (arr.length < amt) {
        const x = Math.random() * gs * 2 - gs, z = Math.random() * gs * 2 - gs, d = Math.sqrt(x * x + z * z);
        if (d > lakeR + 10) {
            const y = Utils.getTerrainHeight(x, z, ground);
            arr.push([x, y, z]);
        }
    }
    const trunkGeo = Utils.createGeometry('cylinder', { radius: 5, height: 30, segments: 16 });
    const trunkTexCoords = [];
    for (let i = 0; i <= 16; i++) { trunkTexCoords.push(i / 16, 0, i / 16, 1); }
    const trunkColors = Array(trunkGeo.positions.length / 3).fill([0.55, 0.27, 0.07, 1.0]).flat();
    const trunkModel = Utils.createModel({ ...trunkGeo, colors: trunkColors, texCoords: trunkTexCoords, texture: textures.trunk });
    const foliageGeo = Utils.createGeometry('cone', { radius: 15, height: 30, segments: 16 });
    const foliageTexCoords = [];
    foliageGeo.positions.forEach((_, index) => {
        if (index % 3 === 0) {
            const x = foliageGeo.positions[index];
            const y = foliageGeo.positions[index + 1];
            const z = foliageGeo.positions[index + 2];

            const u = 0.5 + (Math.atan2(z, x) / (2 * Math.PI)), v = y / 30;

            const repeats = 2;
            const wrappedU = ((u * repeats) % 1 + 1) % 1, wrappedV = Math.max(0, Math.min(1, v * repeats));

            foliageTexCoords.push(wrappedU, wrappedV);
        }
    });
    const foliageColors = Array(foliageGeo.positions.length / 3).fill([0.0, 0.5, 0.0, 1.0]).flat();
    const foliageModel = Utils.createModel({ ...foliageGeo, colors: foliageColors, texCoords: foliageTexCoords, texture: textures.foliage });
    return arr.map(pos => {
        const trunk = { ...trunkModel, modelMatrix: mat4.clone(trunkModel.modelMatrix) };
        mat4.translate(trunk.modelMatrix, trunk.modelMatrix, pos);
        const foliage = { ...foliageModel, modelMatrix: mat4.clone(trunk.modelMatrix) };
        mat4.translate(foliage.modelMatrix, foliage.modelMatrix, [0, 30, 0]);
        return { trunk, foliage };
    });
};

const createClouds = (amt) => {
    const cArr = [];
    for (let i = 0; i < amt; i++) {
        const sArr = [];
        for (let j = 0; j < 10; j++) {
            const { positions, normals, indices } = Utils.createGeometry('sphere', { radius: 20, latBands: 16, lonBands: 16 });
            const c = Array(positions.length / 3).fill([1.0, 1.0, 1.0, 0.75]).flat();
            const s = Utils.createModel({ positions, normals, indices, colors: c, texture: textures.cloud });
            mat4.translate(s.modelMatrix, s.modelMatrix, [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 30]);
            sArr.push(s);
        }
        const pos = [Math.random() * 2000 - 1000, Math.random() * 300 + 100, Math.random() * 2000 - 1000];
        sArr.forEach(sp => mat4.translate(sp.modelMatrix, sp.modelMatrix, pos));
        cArr.push({ spheres: sArr, speed: Math.random() * 10 + 5, position: pos });
    }
    return cArr;
};

const createRain = (amt, ground) => {
    const arr = [], pos = [], indices = [], gs = ground.radius;
    for (let i = 0; i < amt; i++) {
        const x = Math.random() * gs * 2 - gs, z = Math.random() * gs * 2 - gs;
        const y = Math.random() * 400;
        const start = [x, y, z], end = [x, y - 5, z];
        const speed = Math.random() * 200 + 200;
        arr.push({ position: start, speed: speed });
        pos.push(...start, ...end);
        indices.push(i * 2, i * 2 + 1);
    }
    const rainGeo = { positions: pos, normals: [], indices };
    const rain = Utils.createModel({ ...rainGeo, texCoords: null, texture: null });
    return arr.map(p => ({
        model: { ...rain, modelMatrix: mat4.clone(rain.modelMatrix) },
        position: p.position,
        speed: p.speed,
    }));
};

const createDucks = (amt, lakeR, ground) => {
    const ducks = [];
    for (let i = 0; i < amt; i++) {
        const duckGeometry = Utils.createGeometry('duck', { size: 20 });
        const { body, head, beak } = duckGeometry.counts;
        const bodyColor = [1, 1, 0, 1], headColor = [1, 1, 0, 1], beakColor = [1, 0.5, 0, 1];
        const colors = [...new Array(body).fill(bodyColor).flat(), ...new Array(head).fill(headColor).flat(), ...new Array(beak).fill(beakColor).flat()];
        const duck = Utils.createModel({ ...duckGeometry, colors});
        let x, z, y, d;
        do {
            const angle = Math.random() * 2 * Math.PI, r = Math.random() * (lakeR - 10);
            x = r * Math.cos(angle); z = r * Math.sin(angle);
            d = Math.sqrt(x * x + z * z);
            y = d <= lakeR ? 1 : Utils.getTerrainHeight(x, z, ground);
        } while (d > lakeR - 10);
        mat4.identity(duck.modelMatrix);
        mat4.translate(duck.modelMatrix, duck.modelMatrix, [x, y, z]);
        const tAngle = Math.random() * 2 * Math.PI, tRad = Math.random() * (lakeR - 10), tX = tRad * Math.cos(tAngle), tZ = tRad * Math.sin(tAngle);
        const wanderTarget = getRandomWanderTarget(lakeR, ground, [x, y, z]);
        const wanderTimer = Math.random() * 5 + 5;
        ducks.push({ model: duck, targetPosition: [tX, y, tZ], speed: 50 + Math.random() * 50, wanderTarget: wanderTarget, wanderTimer: wanderTimer });
    }
    return ducks;
};

const getRandomWanderTarget = (lakeR, ground, currentPos) => {
    let tx, tz, ty, d;
    do {
        const angle = Math.random() * 2 * Math.PI, r = Math.random() * (lakeR - 10);
        tx = r * Math.cos(angle), tz = r * Math.sin(angle);
        d = Math.sqrt(tx * tx + tz * tz);
        ty = d <= lakeR ? 1 : Utils.getTerrainHeight(tx, tz, ground);
    } while (d > lakeR - 10);
    return [tx, ty, tz];
};

const scene = {
    ground: geometries.terrain,
    skybox: geometries.skybox,
    lake: geometries.lake,
    sun: geometries.sun,
    moon: geometries.moon,
    rocks: createRocks(500, geometries.lake.radius, geometries.terrain),
    trees: createTrees(1500, geometries.lake.radius, geometries.terrain),
    clouds: createClouds(25),
    rain: createRain(500, geometries.terrain),
    ducks: createDucks(50, geometries.lake.radius, geometries.terrain),
};

let globalTargetPosition = null;
const getMouseWorldPosition = (e, camera, projection, canvas) => {
    const rect = canvas.getBoundingClientRect(), mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
    const ndcX = (mouseX / canvas.width) * 2 - 1, ndcY = 1 - (mouseY / canvas.height) * 2;
    const invProjection = mat4.create(); mat4.invert(invProjection, projection);
    const invView = mat4.create(); mat4.invert(invView, camera.viewMatrix);
    const clipCoords = [ndcX, ndcY, -1, 1];
    let eyeCoords = vec4.transformMat4([], clipCoords, invProjection);
    eyeCoords = [eyeCoords[0], eyeCoords[1], -1, 0];
    let rayWorld = vec4.transformMat4([], eyeCoords, invView);
    let rayDirection = vec3.fromValues(rayWorld[0], rayWorld[1], rayWorld[2]);
    vec3.normalize(rayDirection, rayDirection);
    const rayOrigin = vec3.fromValues(camera.position[0], camera.position[1], camera.position[2]);
    const t = -rayOrigin[1] / rayDirection[1];
    if (t > 0) {
        const intersection = vec3.create();
        vec3.scaleAndAdd(intersection, rayOrigin, rayDirection, t);
        const lakeRadius = scene.lake.radius || 300;
        const distance = Math.sqrt(intersection[0] * intersection[0] + intersection[2] * intersection[2]);
        if (distance > lakeRadius - 10) {
            const scale = (lakeRadius - 10) / distance;
            intersection[0] *= scale; intersection[2] *= scale;
        }
        return [intersection[0], intersection[1], intersection[2]];
    }
    return null;
};

const Camera = (() => {
    let theta = 0, phi = Math.PI / 4, radius = 300;
    let target = [0, 0, 0];
    let isDragging = false, isPanning = false;
    let lastX = 0, lastY = 0;
    let viewMatrix = mat4.create();
    const getPosition = () => [
        radius * Math.sin(phi) * Math.sin(theta) + target[0],
        radius * Math.cos(phi) + target[1],
        radius * Math.sin(phi) * Math.cos(theta) + target[2],
    ];
    const handleMouseDown = e => {
        if (e.button === 0) {
            isPanning = e.shiftKey; isDragging = !e.shiftKey;
            [lastX, lastY] = [e.clientX, e.clientY];
        }
    };
    const handleMouseMove = e => {
        const deltaX = e.clientX - lastX, deltaY = e.clientY - lastY;
        [lastX, lastY] = [e.clientX, e.clientY];
        if (isDragging) {
            theta -= deltaX * 0.005;
            phi = Math.min(Math.max(phi - deltaY * 0.005, 0.01), Math.PI - 0.01);
        }
        if (isPanning) {
            const s = 0.005 * radius;
            const forward = vec3.normalize([], vec3.subtract([], getPosition(), target));
            const right = vec3.normalize([], vec3.cross([], forward, [0, 1, 0]));
            const up = [0, 1, 0];
            vec3.scaleAndAdd(target, target, right, -deltaX * s);
            vec3.scaleAndAdd(target, target, up, deltaY * s);
        }
    };
    const handleMouseUp = e => { if (e.button === 0) { isDragging = false; isPanning = false; } };
    const handleWheel = e => {
        e.preventDefault();
        radius += e.deltaY;
        radius = Math.max(50, Math.min(1000, radius));
    };
    const attachEvents = canvas => {
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', () => { isDragging = false; isPanning = false; });
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('click', (e) => {
            const projectionMatrix = mat4.create();
            mat4.perspective(projectionMatrix, 45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 2000.0);
            Camera.updateViewMatrix();
            const tW = getMouseWorldPosition(e, { position: getPosition(), viewMatrix }, projectionMatrix, canvas);
            if (tW) {
                globalTargetPosition = tW; assignIndividualDuckTargets(globalTargetPosition);
            }
        });
    };
    const assignIndividualDuckTargets = (centerPos) => {
        scene.ducks.forEach(d => {
            const angle = Math.random() * 2 * Math.PI, r = Math.random() * 50 + 10;
            const offX = r * Math.cos(angle), offZ = r * Math.sin(angle);
            const nx = centerPos[0] + offX, nz = centerPos[2] + offZ;
            const dist = Math.sqrt(nx * nx + nz * nz), lakeR = scene.lake.radius || 300;
            if (dist > lakeR - 10) {
                const scale = (lakeR - 10) / dist;
                d.targetPosition = [nx * scale, centerPos[1], nz * scale];
            } else d.targetPosition = [nx, centerPos[1], nz];
            d.isFollowingGlobalTarget = true;
        });

        setTimeout(() => {
            globalTargetPosition = null;
            scene.ducks.forEach(d => d.isFollowingGlobalTarget = false);
        }, 10000);
    };
    const reset = () => { theta = 0; phi = Math.PI / 4; radius = 300; target = [0, 0, 0]; };
    const updateViewMatrix = () => { mat4.lookAt(viewMatrix, getPosition(), target, [0, 1, 0]); };
    return { getPosition, target, attachEvents, reset, updateViewMatrix, viewMatrix };
})();
Camera.attachEvents(canvas);

const ShadowMap = (() => {
    const createDepthTexture = (gl, width, height) => {
        const ext = gl.getExtension("WEBGL_depth_texture");
        const depthTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, depthTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0,
            gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return depthTexture;
    };
    const createFramebuffer = (gl, depthTexture) => {
        const buffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return buffer;
    };
    const depthTexture = createDepthTexture(gl, canvas.width, canvas.height);
    const framebuffer = createFramebuffer(gl, depthTexture);
    return { depthTexture, framebuffer };
})();

const Renderer = (() => {
    let then = 0;
    const lightProjection = mat4.create();
    const lightView = mat4.create();
    const lightMVP = mat4.create();

    const DAY_THRESHOLD = Math.PI / 2;

    const updateScene = dt => {
        scene.clouds.forEach(c => {
            const dx = c.speed * dt;
            c.spheres.forEach(s => mat4.translate(s.modelMatrix, s.modelMatrix, [dx, 0, 0]));
            c.position[0] += dx;
            if (c.position[0] > 1500) {
                c.spheres.forEach(s => mat4.translate(s.modelMatrix, s.modelMatrix, [-3000, 0, 0]));
                c.position[0] -= 3000;
            }
        });
        scene.ducks.forEach(d => {
            const cp = vec3.fromValues(d.model.modelMatrix[12], d.model.modelMatrix[13], d.model.modelMatrix[14]);
            let tp;
            if (d.isFollowingGlobalTarget && globalTargetPosition) {
                tp = vec3.fromValues(d.targetPosition[0], d.targetPosition[1], d.targetPosition[2]);
            } else {
                tp = vec3.fromValues(d.wanderTarget[0], d.wanderTarget[1], d.wanderTarget[2]);
                d.wanderTimer -= dt;
                if (d.wanderTimer <= 0) {
                    d.wanderTarget = getRandomWanderTarget(scene.lake.radius, scene.ground, cp);
                    d.wanderTimer = Math.random() * 5 + 5;
                }
            }
            const dir = vec3.create(); vec3.subtract(dir, tp, cp);
            const dist = vec3.length(dir);
            if (dist > 1) {
                vec3.normalize(dir, dir);
                const moveDist = d.speed * dt;
                vec3.scaleAndAdd(cp, cp, dir, Math.min(moveDist, dist));
                mat4.identity(d.model.modelMatrix);
                mat4.translate(d.model.modelMatrix, d.model.modelMatrix, cp);
                const angleFacing = Math.atan2(dir[0], dir[2]);
                mat4.rotateY(d.model.modelMatrix, d.model.modelMatrix, angleFacing);
                if (moveDist >= dist) {
                    if (d.isFollowingGlobalTarget) {
                        d.isFollowingGlobalTarget = false;
                    } else {
                        d.wanderTarget = getRandomWanderTarget(scene.lake.radius, scene.ground, cp);
                        d.wanderTimer = Math.random() * 5 + 5;
                    }
                }
            }
        });

        scene.rain.forEach(r => {
            r.position[1] -= r.speed * dt;
            if (r.position[1] < Utils.getTerrainHeight(r.position[0], r.position[2], scene.ground)) {
                r.position[1] = Math.random() * 400;
                r.position[0] = Math.random() * scene.ground.radius * 2 - scene.ground.radius;
                r.position[2] = Math.random() * scene.ground.radius * 2 - scene.ground.radius;
            }
            mat4.identity(r.model.modelMatrix);
            mat4.translate(r.model.modelMatrix, r.model.modelMatrix, r.position);
        });
    };
    const renderShadowMap = (lightPos) => { 
        gl.bindFramebuffer(gl.FRAMEBUFFER, ShadowMap.framebuffer);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1.0, 1.0);

        gl.cullFace(gl.FRONT);
        gl.useProgram(depthProgram);

        gl.cullFace(gl.BACK);
        const shadowSize = 1000;
        const lightDir = vec3.normalize([], lightPos);
        const actualLightPos = vec3.scale([], lightDir, shadowSize);

        mat4.ortho(
            lightProjection,
            -shadowSize / 2, shadowSize / 2,
            -shadowSize / 2, shadowSize / 2,
            0.1, shadowSize * 2
        );

        mat4.lookAt(lightView, actualLightPos, [0, 0, 0], [0, 1, 0]);
        mat4.multiply(lightMVP, lightProjection, lightView);

        const renderObjectDepth = (obj) => {
            const objectLightMVP = mat4.create();
            mat4.multiply(objectLightMVP, lightMVP, obj.modelMatrix);
            gl.uniformMatrix4fv(depthInfo.uniformLocations.uLightMVPMatrix, false, objectLightMVP);
            renderDepth(obj);
        };

        renderObjectDepth(scene.ground);
        renderObjectDepth(scene.lake);
        scene.trees.forEach(t => {
            renderObjectDepth(t.trunk);
            renderObjectDepth(t.foliage);
        });
        scene.rocks.forEach(r => renderObjectDepth(r));
        scene.ducks.forEach(duck => renderObjectDepth(duck.model));

        gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.cullFace(gl.BACK);
        gl.disable(gl.CULL_FACE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    const renderDepth = (obj) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.position);
        gl.enableVertexAttribArray(depthInfo.attribLocations.position);
        gl.vertexAttribPointer(depthInfo.attribLocations.position, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);
        gl.drawElements(gl.TRIANGLES, obj.vertexCount, gl.UNSIGNED_SHORT, 0);
    };
    const drawSkybox = (p, v, prog, info, sunPos) => {
        gl.depthFunc(gl.LEQUAL);
        gl.useProgram(prog);
        const skyboxView = mat4.clone(v);
        skyboxView[12] = 0; skyboxView[13] = 0; skyboxView[14] = 0;
        const skyboxMVP = mat4.create(); mat4.multiply(skyboxMVP, p, skyboxView);
        gl.uniformMatrix4fv(info.uniformLocations.uMVPMatrix, false, skyboxMVP);
        const sunDir = vec3.normalize([], sunPos);
        gl.uniform3fv(info.uniformLocations.uSunDirection, sunDir);
        gl.bindBuffer(gl.ARRAY_BUFFER, scene.skybox.position);
        gl.enableVertexAttribArray(info.attribLocations.position);
        gl.vertexAttribPointer(info.attribLocations.position, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scene.skybox.indices);
        gl.drawElements(gl.TRIANGLES, scene.skybox.vertexCount, gl.UNSIGNED_SHORT, 0);
    };
    const drawObject = (o, p, v, prog, info, sunPos, shadowMapEnabled = false, lightMVPMatrix = null) => {
        const mv = mat4.create();
        mat4.multiply(mv, v, o.modelMatrix);
        const mvp = mat4.create();
        mat4.multiply(mvp, p, mv);
        const nm = mat3.create();
        mat3.normalFromMat4(nm, mv);

        gl.useProgram(prog);
        gl.uniformMatrix4fv(info.uniformLocations.uModelMatrix, false, o.modelMatrix);
        gl.uniformMatrix4fv(info.uniformLocations.uMVMatrix, false, mv);
        gl.uniformMatrix4fv(info.uniformLocations.uMVPMatrix, false, mvp);
        gl.uniformMatrix3fv(info.uniformLocations.uNormalMatrix, false, nm);

        if (shadowMapEnabled && lightMVPMatrix) {
            const objectLightMVP = mat4.create();
            mat4.multiply(objectLightMVP, lightMVPMatrix, o.modelMatrix);
            gl.uniformMatrix4fv(info.uniformLocations.uLightMVPMatrix, false, objectLightMVP);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, ShadowMap.depthTexture);
            gl.uniform1i(info.uniformLocations.uShadowMap, 1);
            gl.uniform1i(info.uniformLocations.uShadowMapEnabled, true);
        } else {
            gl.uniform1i(info.uniformLocations.uShadowMapEnabled, false);
        }

        gl.uniform3fv(info.uniformLocations.uLightPosition, sunPos);
        gl.uniform3fv(info.uniformLocations.uViewPosition, Camera.getPosition());

        if (o.texCoord && o.texture) {
            gl.uniform1i(info.uniformLocations.uUseTexture, true);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, o.texture);
            gl.uniform1i(info.uniformLocations.uTexture, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, o.texCoord);
            gl.enableVertexAttribArray(info.attribLocations.texCoord);
            gl.disableVertexAttribArray(info.attribLocations.color);
            gl.vertexAttribPointer(info.attribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
        } else {
            gl.uniform1i(info.uniformLocations.uUseTexture, false);
            gl.disableVertexAttribArray(info.attribLocations.texCoord);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, o.colors);
        gl.enableVertexAttribArray(info.attribLocations.color);
        gl.vertexAttribPointer(info.attribLocations.color, 4, gl.FLOAT, false, 0, 0);

        ['position', 'normal'].forEach(attr => {
            gl.bindBuffer(gl.ARRAY_BUFFER, o[attr]);
            gl.enableVertexAttribArray(info.attribLocations[attr]);
            gl.vertexAttribPointer(info.attribLocations[attr], 3, gl.FLOAT, false, 0, 0);
        });
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indices);
        gl.drawElements(gl.TRIANGLES, o.vertexCount, gl.UNSIGNED_SHORT, 0);
    };
    const drawRain = (o, p, v, prog, info) => {
        const mv = mat4.create(); mat4.multiply(mv, v, o.modelMatrix);
        const mvp = mat4.create(); mat4.multiply(mvp, p, mv);
        const nm = mat3.create(); mat3.normalFromMat4(nm, mv);
        gl.useProgram(prog);
        gl.uniformMatrix4fv(info.uniformLocations.uMVMatrix, false, mv);
        gl.uniformMatrix4fv(info.uniformLocations.uMVPMatrix, false, mvp);
        gl.bindBuffer(gl.ARRAY_BUFFER, o.position);
        gl.enableVertexAttribArray(info.attribLocations.position);
        gl.vertexAttribPointer(info.attribLocations.position, 3, gl.FLOAT, false, 0, 0);

        gl.uniform4fv(info.uniformLocations.uColor, [0.5, 0.5, 0.5, 0.2]);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indices);
        gl.drawElements(gl.LINES, o.vertexCount, gl.UNSIGNED_SHORT, 0);
    };
    const drawScene = () => {
        gl.clearColor(0.53, 0.81, 0.92, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        const time = then, orbitSpeed = 0.05;
        const sunPos = [500 * Math.cos(time * orbitSpeed), 500 * Math.sin(time * orbitSpeed), 0];
        const moonPos = [500 * Math.cos(time * orbitSpeed + Math.PI), 500 * Math.sin(time * orbitSpeed + Math.PI), 0];
        const isDay = sunPos[1] > 0;

        const p = mat4.create();
        mat4.perspective(p, 45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 2000.0);
        const v = mat4.create();
        mat4.lookAt(v, Camera.getPosition(), Camera.target, [0, 1, 0]);

        const activeLightPos = isDay ? sunPos : moonPos;

        renderShadowMap(activeLightPos);

        gl.depthMask(false);
        drawSkybox(p, v, skyboxProgram, skyboxInfo, sunPos);
        gl.depthMask(true);

        gl.useProgram(shaderProgram);
        gl.uniform3fv(shaderInfo.uniformLocations.uLightPosition, sunPos);
        gl.uniform3fv(shaderInfo.uniformLocations.uViewPosition, Camera.getPosition());
        gl.uniform4fv(shaderInfo.uniformLocations.uSunriseColor, skyColors.sunrise);
        gl.uniform4fv(shaderInfo.uniformLocations.uNoonColor, skyColors.noon);
        gl.uniform4fv(shaderInfo.uniformLocations.uSunsetColor, skyColors.sunset);
        gl.uniform4fv(shaderInfo.uniformLocations.uEveningColor, skyColors.evening);
        gl.uniform4fv(shaderInfo.uniformLocations.uNightColor, skyColors.night);
        gl.uniform1i(shaderInfo.uniformLocations.uShadowMapEnabled, true);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.uLightMVPMatrix, false, lightMVP);

        drawObject(scene.ground, p, v, shaderProgram, shaderInfo, sunPos, true, lightMVP);
        scene.trees.forEach(t => { [t.trunk, t.foliage].forEach(part => drawObject(part, p, v, shaderProgram, shaderInfo, sunPos, true, lightMVP)); });
        scene.rocks.forEach(r => drawObject(r, p, v, shaderProgram, shaderInfo, sunPos, true, lightMVP));
        [{ obj: scene.sun, pos: sunPos }, { obj: scene.moon, pos: moonPos }].forEach(({ obj, pos }) => {
            mat4.identity(obj.modelMatrix);
            mat4.translate(obj.modelMatrix, obj.modelMatrix, pos);
            drawObject(obj, p, v, shaderProgram, shaderInfo, sunPos, true, lightMVP);
        });

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        drawObject(scene.lake, p, v, shaderProgram, shaderInfo, sunPos, true, lightMVP);
        const sortedClouds = [...scene.clouds].sort((a, b) => {
            const aDist = vec3.distance(Camera.getPosition(), a.position);
            const bDist = vec3.distance(Camera.getPosition(), b.position);
            return bDist - aDist;
        });
        sortedClouds.forEach(c => c.spheres.forEach(s => drawObject(s, p, v, shaderProgram, shaderInfo, sunPos, true, lightMVP)));
        scene.rain.forEach(r => drawRain(r.model, p, v, rainProgram, rainInfo))
        gl.disable(gl.BLEND);
        scene.ducks.forEach(d => drawObject(d.model, p, v, shaderProgram, shaderInfo, sunPos, true, lightMVP));
    };
    const render = now => {
        now *= 0.001;
        const dt = now - then; then = now;
        updateScene(dt);
        drawScene();
        requestAnimationFrame(render);
    };
    return { render };
})();
requestAnimationFrame(Renderer.render);