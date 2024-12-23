import { ShaderEffect, type State } from './state'
import { makeSphube } from './geometry' 
import {vec3, vec4, mat4, mat3, quat} from 'gl-matrix'
import obj_frag from './shaders/obj.frag'
import obj_vertex from './shaders/obj.vertex'
import obj_sin_frag from './shaders/obj_sin.frag'
import obj_scroll_frag from './shaders/obj_scroll.frag'
import obj_censored_frag from './shaders/obj_censored.frag'
import ryan_data_url from "./assets/ryan/ryan_cube_inline.txt"
import sphube_frag from './shaders/sphube.frag'
import sphube_vert from './shaders/sphube.vert'

const TAU: number = Math.PI * 2;
const MAX_PITCH: number = Math.PI / 3;
const DEG_COEFF: number = 180 / Math.PI;

export class Camera { 
    #yaw: number;
    #pitch: number;
    #position: vec3;
    proj: mat4;
    needsRebake: boolean = false;
    theMat: mat4;
    rotQuat: quat = quat.create();
    viewMatrix: mat4;
    look: vec3;

    set yaw(value: number) {
	this.#yaw = value % TAU
	this.needsRebake = true;
    }

    get yaw() {
	return this.#yaw;
    } 

    get pitch() {
	return this.#pitch;
    } 

    set pitch(value: number) {
	this.#pitch = Math.max(Math.min(value, MAX_PITCH), -MAX_PITCH)
	this.needsRebake = true;
    }

    set position(value: vec3) {
	this.#position = vec3.negate(value, value);
	this.needsRebake = true;
    }

    get position() { return this.#position }


    constructor() {
	this.#yaw = 0.0;
	this.#pitch = 0.0;
	this.#position = vec3.create();
	this.proj = mat4.create();
	this.look = vec3.fromValues(0.0, 0.0, -1.0);
	this.theMat = mat4.create();
	mat4.perspective(this.proj, Math.PI / 3, canvas.width / canvas.height, 1, 1000);
	this.viewMatrix = mat4.create();
    }

    get matrix() {
	if (this.needsRebake) {
	    mat4.fromXRotation(this.viewMatrix, this.pitch);
	    mat4.rotateY(this.viewMatrix, this.viewMatrix, this.yaw);
	    vec3.transformMat4(this.look, vec3.fromValues(0, 0, -1), this.viewMatrix);
	    mat4.translate(this.viewMatrix, this.viewMatrix, this.position);
	    mat4.scale(this.theMat, this.viewMatrix, [10, 10, 10]);
	    mat4.mul(this.theMat, this.proj, this.theMat);
	    this.needsRebake = false;
	}
	return this.theMat;
    }
};

const canvas = document.querySelector('canvas')!;
const gl = canvas.getContext('webgl')!;

class Program {
    program: WebGLProgram;
    uniforms: {[key: string]: WebGLUniformLocation} = {};
    attributes: {[key: string]: GLint} = {};
    activator?: (gl: WebGLRenderingContext, state: State, ...rest: any[]) => void;

    static inheritingNames(original: Program, vertexSource: string, fragSource: string): Program {
	let p = new Program(vertexSource, fragSource);
	for (let attribName in original.attributes)
	    p.registerAttribute(attribName);
	for (let uniformName in original.uniforms)
	    p.registerUniform(uniformName);
	return p;
    }

    constructor(vertexSource: string, fragSource: string) {
	this.program = programFromSources(vertexSource, fragSource);
    }

    registerAttribute(name: string) {
	this.attributes[name] = gl.getAttribLocation(this.program, name);
    }

    registerUniform(name: string) {
	this.uniforms[name] = gl.getUniformLocation(this.program, name)!;
    }
}

function programFromSources(vertexSource: string, fragSource: string): WebGLProgram {
    let vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vertexSource);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
	throw new Error(`Failed to compile vertex shader: ${gl.getShaderInfoLog(vs)}`)
    let fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fragSource);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
	throw new Error(`Failed to compile fragment shader: ${gl.getShaderInfoLog(fs)}`)
    let prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
	throw new Error(`Failed to link program: ${gl.getProgramInfoLog(prog)}`);
    return prog;
}

let objProgram = new Program(obj_vertex, obj_frag);
objProgram.registerUniform('cubeLoc');
objProgram.registerUniform('sampler');
objProgram.registerUniform('MV');
objProgram.registerUniform('MVP');
objProgram.registerUniform('uNormalMatrix');
objProgram.registerAttribute('position');
objProgram.registerAttribute('texCoord');
objProgram.registerAttribute('vNormal')
let objSinProgram = Program.inheritingNames(objProgram, obj_vertex, obj_sin_frag);
objSinProgram.registerUniform('uTime');
let objScrollProgram = Program.inheritingNames(objSinProgram, obj_vertex, obj_scroll_frag);
let objCensoredProgram = Program.inheritingNames(objSinProgram, obj_vertex, obj_censored_frag);

// Shamelessly lifted from lecture slides
// I should probably try to construct faces with proper winding order as an exercise
// EDIT: I did so in geometry.ts
const cuboidVertices = new Float32Array([
    1, 1, 1, -1, 1, 1, -1,-1, 1, 1,-1, 1,
    1, 1, 1, 1,-1, 1, 1,-1,-1, 1, 1,-1,
    1, 1, 1, 1, 1,-1, -1, 1,-1, -1, 1, 1,
    -1, 1, 1, -1, 1,-1, -1,-1,-1, -1,-1, 1,
    -1,-1,-1, 1,-1,-1, 1,-1, 1, -1,-1, 1,
    1,-1,-1, -1,-1,-1, -1, 1,-1, 1, 1,-1
]);

const cuboidTriIndices = new Uint8Array([
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6,  4, 6, 7, // right
    8, 9, 10, 8, 10,11, // top
    12,13,14, 12,14,15, // left
    16,17,18, 16,18,19, // bottom
    20,21,22, 20,22,23 // back
]);

// Code for computing the normals of all of these faces.
// I couldn't get it right by trying to hard-code it, but I knew that
// these triangles all had CW winding order viewed from the outside, so
function vec3at(buf: Float32Array, ix: number): vec3 {
    let i = ix * 3;
    return [buf[i], buf[i+1], buf[i+2]]
}

function normalForTri(i: number): vec3 {
    let i2 = i * 6;
    let indexA = cuboidTriIndices[i2];
    let indexB = cuboidTriIndices[i2 + 1];
    let indexC = cuboidTriIndices[i2 + 2];
    console.log(indexA, indexB, indexC)
    let a = vec3at(cuboidVertices, indexA);
    let b = vec3at(cuboidVertices, indexB);
    let c = vec3at(cuboidVertices, indexC);
    let p = vec3.sub(b, b, a);
    let q = vec3.sub(c, c, a);
    let r = vec3.create();
    vec3.cross(r, p, q);
    return vec3.normalize(r, r);
}

let cuboidNormalsVecs: number[] = [];
for (let i = 0; i < 6; i++) {
    let [x, y, z] = normalForTri(i);
    console.log([x, y, z])
    for (let j = 0; j < 4; j++)
	cuboidNormalsVecs.push(x, y, z);
}

const cuboidNormals_ = new Float32Array([
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 
    0, 0, -1,0, 0, -1,0, 0, -1,0, 0, -1,
    0, -1, 0,0, -1, 0,0, -1, 0,0, -1, 0,
    -1, 0, 0,-1, 0, 0,-1, 0, 0,-1, 0, 0,
]);

const cuboidNormals = new Float32Array(cuboidNormalsVecs);

const cuboidTexCoords = new Float32Array([
    1, 1, 0, 1, 0, 0, 1, 0,  
    0, 1, 0, 0, 1, 0, 1, 1, 
    0, 0, 1, 0, 1, 1, 0, 1,
    1, 1, 0, 1, 0, 0, 1, 0,
    0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1,
]);

var vertexPosBuffer = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cuboidVertices, gl.STATIC_DRAW);

var triangleIndicesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndicesBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cuboidTriIndices, gl.STATIC_DRAW);

var cuboidTexCoordBuffer = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, cuboidTexCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cuboidTexCoords, gl.STATIC_DRAW);

var cuboidNormalBuffer = gl.createBuffer()!;
gl.bindBuffer(gl.ARRAY_BUFFER, cuboidNormalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cuboidNormals, gl.STATIC_DRAW);

function loadTexture(url: string, unit: GLint) {
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
	gl.TEXTURE_2D,
	0,
	gl.RGBA,
	1,
	1,
	0,
	gl.RGBA,
	gl.UNSIGNED_BYTE,
	new Uint8Array([255,0,255,255]),
    );
    const theImage = new Image();
    theImage.addEventListener("load", () => {
	var c = document.createElement('canvas');
	c.width = theImage.naturalWidth;
	c.height = theImage.naturalHeight;
	var ctx = c.getContext('2d')!;
	ctx.drawImage(theImage, 0, 0, c.width, c.height);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(
	    gl.TEXTURE_2D,
	    0,
	    gl.RGBA,
	    gl.RGBA,
	    gl.UNSIGNED_BYTE,
	    theImage
	)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    })
    theImage.onload = function() {
	console.log(theImage.src);
    }
    theImage.src = url;
    return texture;
}

var ryanTexture = loadTexture(ryan_data_url, 0);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

// Loading the sphube and creating the program.
function createSphubeProgram() {
    let [
	sphubeCubePositions, 
	sphubeSpherePositions, 
	sphubeTexCoords,
	sphubeCubeNormals,
	sphubeSphereNormals 
    ] = makeSphube(5).map(x => x.flatMap((v) => [...v.values()]));
    let sphubeIndices = [];
    for (let i = 0; i < sphubeCubePositions.length/3; i++)
	sphubeIndices[i] = i;
    console.log(sphubeCubePositions);
    let sphubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphubeIndexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphubeIndices), gl.STATIC_DRAW);
    let sphubeCPBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphubeCPBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphubeCubePositions), gl.STATIC_DRAW);
    let sphubeSPBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphubeSPBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphubeSpherePositions), gl.STATIC_DRAW);
    let sphubeTCBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphubeTCBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphubeTexCoords), gl.STATIC_DRAW);
    let sphubeCNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphubeCNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphubeCubeNormals), gl.STATIC_DRAW);
    let sphubeSNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphubeSNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphubeSphereNormals), gl.STATIC_DRAW);
    let sphubeProgram = new Program(sphube_vert, sphube_frag);
    sphubeProgram.registerUniform('uObjectLocation');
    sphubeProgram.registerUniform('uMVP');
    sphubeProgram.registerUniform('uMV');
    sphubeProgram.registerUniform('uNormalMatrix');
    sphubeProgram.registerUniform('uTime');
    sphubeProgram.registerUniform('uLookVector');
    sphubeProgram.registerAttribute('vPosition1');
    sphubeProgram.registerAttribute('vPosition2');
    sphubeProgram.registerAttribute('vTexCoord');
    sphubeProgram.registerAttribute('vNormal1');
    sphubeProgram.registerAttribute('vNormal2');
    sphubeProgram.registerUniform('uTextureSampler');
    console.log(sphubeProgram.attributes);
    sphubeProgram.activator = function(gl, state, ryanPos: vec3) {
	let u = this.uniforms;
	let a = this.attributes;
	gl.useProgram(this.program);

	// Vertex work
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphubeIndexBuffer);
	gl.bindBuffer(gl.ARRAY_BUFFER, sphubeCPBuffer);
	gl.vertexAttribPointer(a.vPosition1, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a.vPosition1);
	gl.bindBuffer(gl.ARRAY_BUFFER, sphubeSPBuffer);
	gl.vertexAttribPointer(a.vPosition2, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a.vPosition2);
	gl.bindBuffer(gl.ARRAY_BUFFER, sphubeTCBuffer);
	gl.vertexAttribPointer(a.vTexCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a.vTexCoord);
	gl.bindBuffer(gl.ARRAY_BUFFER, sphubeCNBuffer);
	gl.vertexAttribPointer(a.vNormal1, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a.vNormal1);
	gl.bindBuffer(gl.ARRAY_BUFFER, sphubeSNBuffer);
	gl.vertexAttribPointer(a.vNormal2, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a.vNormal2);

	// Uniform updates
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, ryanTexture);
	gl.uniform3fv(u.uObjectLocation, ryanPos)
	gl.uniform3fv(u.uLookVector, state.camera.look)
	gl.uniformMatrix4fv(u.uMV, false, state.camera.viewMatrix);
	gl.uniformMatrix4fv(u.uMVP, false, state.camera.matrix);
	gl.uniform1f(u.uTime, state.elapsed);
	gl.uniform1i(u.uTextureSampler, 0);
	let normalMatrix = mat3.fromMat4(mat3.create(), state.camera.matrix);
	mat3.invert(normalMatrix, normalMatrix);
	mat3.transpose(normalMatrix, normalMatrix);
	gl.uniformMatrix3fv(u.uNormalMatrix, false, normalMatrix);

	gl.drawElements(gl.TRIANGLES, sphubeIndices.length, gl.UNSIGNED_SHORT, 0);
    }
    return sphubeProgram;
}

let sphubeProg = createSphubeProgram();

export function render(state: State) {
    let cam = state.camera;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    for (let wallObjIx in state.wallObjects) {
	let wallObj = state.wallObjects[wallObjIx];
	gl.activeTexture(gl.TEXTURE0)
	let p;

	if (wallObj.shaderEffect == ShaderEffect.Sphubic) {
	    sphubeProg.activator!(gl, state, wallObj.position);
	    continue;
	}
	switch(wallObj.shaderEffect) {
	    case ShaderEffect.SineTrip: {
		p = objSinProgram;
		gl.useProgram(p.program);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, ryanTexture);
		gl.uniform1f(p.uniforms.uTime, state.elapsed);
		break;
	    }
	    case ShaderEffect.Scrolling: {
		p = objScrollProgram;
		gl.useProgram(p.program);
		gl.uniform1f(p.uniforms.uTime, state.elapsed);
		break;
	    }
	    case ShaderEffect.Default: {
		p = objProgram;
		gl.useProgram(p.program);
		break;
	    }
	    case ShaderEffect.Censored: {
		p = objCensoredProgram;
		gl.useProgram(p.program);
		gl.uniform1f(p.uniforms.uTime, state.elapsed);
		break;
	    }
	    default:
		p = objProgram;
		gl.useProgram(p.program);
	}
	// Set index buffer
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndicesBuffer);

	// Set location attribute buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
	gl.vertexAttribPointer(p.attributes.location, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(p.attributes.location)
	// Set normal attribute buffer
	// Load the uniforms
	if (p.attributes.vNormal != -1) {
	    gl.bindBuffer(gl.ARRAY_BUFFER, cuboidNormalBuffer);
	    gl.vertexAttribPointer(p.attributes.vNormal, 3, gl.FLOAT, false, 0, 0);
	    gl.enableVertexAttribArray(p.attributes.vNormal);
	}
	// Set tex coord attribute buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, cuboidTexCoordBuffer);
	gl.vertexAttribPointer(p.attributes.texCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(p.attributes.texCoord);
	gl.uniformMatrix4fv(p.uniforms.MVP, false, cam.matrix);
	gl.uniformMatrix4fv(p.uniforms.MV, false, cam.viewMatrix);
	let normalMatrix = mat3.fromMat4(mat3.create(), cam.matrix);
	mat3.invert(normalMatrix, normalMatrix);
	mat3.transpose(normalMatrix, normalMatrix);
	gl.uniformMatrix3fv(p.uniforms.uNormalMatrix, false, normalMatrix);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, ryanTexture);
	gl.uniform1i(p.uniforms.samplerUniform, 0);
	let agitationOffset: vec3 = [
	    2 * Math.random() - 1,
	    2 * Math.random() - 1,
	    2 * Math.random() - 1
	];
	vec3.scale(agitationOffset, agitationOffset, state.agitation / 3);
	vec3.add(agitationOffset, agitationOffset, wallObj.position);
	gl.uniform3fv(p.uniforms.cubeLoc, agitationOffset);
	gl.drawElements(gl.TRIANGLES, cuboidTriIndices.length, gl.UNSIGNED_BYTE, 0);
    }
    gl.finish();
}

export default { render }
