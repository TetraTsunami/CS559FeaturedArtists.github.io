import {vec3, vec2} from 'gl-matrix'

type Vector = vec3 | vec2;
type Vertex = Vector[];
type Model = Vertex[];
type Position = [number, number, number];
type Normal = [number, number, number];
type TexCoord = [number, number];
// Transposition of a model.
type BrokenModel = Vertex[];
class DividableFace {
    vertices: Vertex[];
    // a, b, c, d are given in clockwise winding order
    constructor([a, b, c, d]: Vertex[]){
	this.vertices = [a, b, c, d];
    }

    subdivide(): DividableFace[] {
	// p1 p2 p3
	// p4 p5 p6
	// p7 p8 p9
	let [p1, p3, p9, p7] = this.vertices;
	let p2 = averageVertices(p1, p3);
	let p4 = averageVertices(p1, p7);
	let p6 = averageVertices(p3, p9);
	let p8 = averageVertices(p7, p9);
	let p5 = averageVertices(p4, p6);
	return [
	    new DividableFace([p1, p2, p5, p4]),
	    new DividableFace([p2, p3, p6, p5]),
	    new DividableFace([p5, p6, p9, p8]),
	    new DividableFace([p4, p5, p8, p7])
	]
    }

    triangles(): Vertex[] {
	// a b
	// d c
	let [a, b, c, d] = this.vertices;
	return [a, b, c, a, c, d];
    }
}

function averageVertices(v1: Vertex, v2: Vertex): Vertex {
    let outVertex = [];
    for (let i = 0; i < v1.length; i++) {
	if (v1[i].length == 2) {
	    let v1_at2 = v1[i] as vec2;
	    let v2_at2 = v2[i] as vec2;
	    let out = vec2.create();
	    vec2.scaleAndAdd(out, out, v1_at2, 0.5);
	    vec2.scaleAndAdd(out, out, v2_at2, 0.5);
	    outVertex.push(out);
	} else if (v1[i].length == 3) {
	    let v1_at3 = v1[i] as vec3;
	    let v2_at3 = v2[i] as vec3;
	    let out = vec3.create();
	    vec3.scaleAndAdd(out, out, v1_at3, 0.5);
	    vec3.scaleAndAdd(out, out, v2_at3, 0.5);
	    outVertex.push(out);
	}
    }
    return outVertex;
}

const initialCorners = [
    vec3.fromValues(1, 1, -1),
    vec3.fromValues(-1, 1, -1),
    vec3.fromValues(-1, 1, 1),
    vec3.fromValues(1, 1, 1),
    vec3.fromValues(1, -1, -1),
    vec3.fromValues(-1, -1, -1),
    vec3.fromValues(-1, -1, 1),
    vec3.fromValues(1, -1, 1),
]

const initialFaceIndices = [
    [4, 3, 7, 8],
    [2, 1, 5, 6],
    [3, 2, 6, 7],
    [1, 4, 8, 5],
    [1, 2, 3, 4],
    [8, 7, 6, 5]
];

const initialTexCoords = [
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 1),
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 0),
];

export function createSubdividedCube(steps: number): Model {
    let cubeFaces: DividableFace[] = [
    ];
    for (let f = 0; f < 6; f++) {
	let outFaceVertices: Vertex[] = []
	for (let c = 0; c < 4; c++) {
	    outFaceVertices.push([initialCorners[initialFaceIndices[f][c] - 1], initialTexCoords[c]]);
	} 
	cubeFaces.push(new DividableFace(outFaceVertices));
    }
    for (let i = 0; i < steps; i++) {
	let newFaces: DividableFace[][] = [];
	for (let face of cubeFaces) {
	    newFaces.push(face.subdivide());
	}
	cubeFaces = newFaces.flat();
    }
    return cubeFaces.flatMap((face) => face.triangles());
}

// Given a list of vertices with their positions at the first index,
// compute normals based on groups of three points. We're assuming no fancy indexing takes place here.
// Preconditions:  The vertices have three-dimensional coordinates for their position.
export function giveNormals(vertices: Model, index: number) {
    for (let tri = 0; tri < vertices.length; tri += 3) {
	let p = vertices[tri][index] as vec3;
	let q = vertices[tri + 1][index] as vec3;
	let r = vertices[tri + 2][index] as vec3;
	let a = vec3.create();
	let b = vec3.create();
	let cross = vec3.create();
	vec3.subtract(a, r, p);
	vec3.subtract(b, r, q);
	vec3.cross(cross, b, a);
	vec3.normalize(cross, cross);
	vertices[tri].push(cross);
	vertices[tri + 1].push(cross);
	vertices[tri + 2].push(cross);
    }
}

// This function assumes each vertex has the same amount of attributes.
// A logical assumption, but I thought I would note this.
// There's no fancy indexing in the output (i.e., we don't unify numerically identical vertices under a single index).
export function breakOutVectors(vertices: Model): BrokenModel {
    let result = [];
    for (let attribute = 0; attribute < vertices[0].length; attribute++) {
	let attributeResult = [];
	for (let v of vertices) {
	    attributeResult.push(v[attribute]);
	}
	result.push(attributeResult);
    }
    return result
}

export function makeSphube(steps: number): [Position[], Position[], TexCoord[], Normal[], Normal[]] {
    let cube = createSubdividedCube(steps);
    for (let i = 0; i < cube.length; i++) {
	let [pos, ...rest] = cube[i];
	let newVec = vec3.create();
	vec3.normalize(newVec, pos as vec3);
	cube[i] = [pos, newVec, ...rest];
    }
    // Penultimate attribute will be normal in the sphube's cube form
    // Last one will be the normal in the sphube's sphere form
    giveNormals(cube, 0);
    giveNormals(cube, 1);
    // @ts-ignore because I want a helpful type annotation but don't want to fight the compiler
    return breakOutVectors(cube);
}
