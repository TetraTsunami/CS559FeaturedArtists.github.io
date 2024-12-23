let mat4 = glMatrix.mat4;
let vec3 = glMatrix.vec3;

// Compute B*P, where B is 4x4 and P is 4x3
// Result is row-major 4x3 matrix
function getBP(B, P) {
    return [
        B[0]*P[0] + B[1]*P[3] + B[2]*P[6] + B[3]*P[9],
        B[0]*P[1] + B[1]*P[4] + B[2]*P[7] + B[3]*P[10],
        B[0]*P[2] + B[1]*P[5] + B[2]*P[8] + B[3]*P[11],

        B[4]*P[0] + B[5]*P[3] + B[6]*P[6] + B[7]*P[9],
        B[4]*P[1] + B[5]*P[4] + B[6]*P[7] + B[7]*P[10],
        B[4]*P[2] + B[5]*P[5] + B[6]*P[8] + B[7]*P[11],

        B[8]*P[0] + B[9]*P[3] + B[10]*P[6] + B[11]*P[9],
        B[8]*P[1] + B[9]*P[4] + B[10]*P[7] + B[11]*P[10],
        B[8]*P[2] + B[9]*P[5] + B[10]*P[8] + B[11]*P[11],

        B[12]*P[0] + B[13]*P[3] + B[14]*P[6] + B[15]*P[9],
        B[12]*P[1] + B[13]*P[4] + B[14]*P[7] + B[15]*P[10],
        B[12]*P[2] + B[13]*P[5] + B[14]*P[8] + B[15]*P[11],
    ]
}

function getTBP(out, t, BP) {
    out[0] = BP[0] + t*BP[3] + (t**2)*BP[6] + (t**3)*BP[9];
    out[1] = BP[1] + t*BP[4] + (t**2)*BP[7] + (t**3)*BP[10];
    out[2] = BP[2] + t*BP[5] + (t**2)*BP[8] + (t**3)*BP[11];
    
    return out;
}

// Gets tangent in Z axis
function getTan(t, BP) {
    return Math.atan2((BP[4] + (2*t)*BP[7] + 3*(t**2)*BP[10]), (BP[3] + (2*t)*BP[6] + 3*(t**2)*BP[9])) - Math.PI/2;
}

// Vector from polar, on XY plane
function vecFromPolar(mag, theta) {
    return glMatrix.vec3.fromValues(
        mag*Math.cos(theta),
        mag*Math.sin(theta),
        0
    )
}

// Set magnitude and angle on XY plane
function setFromPolar(vec, mag, theta) {
    vec[0] = mag*Math.cos(theta)
    vec[1] = mag*Math.sin(theta)

    return vec
}

function Hermite(p0, p1, d0, d1) {

    this.start = 0;
    this.end = 1;

    this.p0 = p0;
    this.p1 = p1;
    this.d0 = d0;
    this.d1 = d1;

    // Hermite basis
    const B = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        -3, -2, 3, -1,
        2, 1, -2, 1
    ]

    let P;
    let BP;

    let pos = glMatrix.vec3.create();   
    
    this.recalculate = () => {
        P = [
            this.p0[0], this.p0[1], this.p0[2],
            this.d0[0], this.d0[1], this.d0[2],
            this.p1[0], this.p1[1], this.p1[2],
            this.d1[0], this.d1[1], this.d1[2]
        ]
    
        BP = getBP(B, P);
    }

    this.recalculate()

    this.get = (t) => {
        return getTBP(pos, t, BP);
    }

    this.getTan = (t) => {
        return getTan(t, BP);
    }
}

/**
 * 
 * @param {*} points N points
 * @param {*} tangents N tangents
 */
function HermiteChain(points, tangents, closed) {

    this.start = 0;
    this.end = points.length - (closed ? 0 : 1);

    this.points = points;
    this.tangents = tangents;
    this.hermites = []

    if(points.length != tangents.length) {
        console.error("Points length and tangents length must be equal.")
    }
    
    for(let i = 0; i < points.length - 1; i++) {
        this.hermites.push(new Hermite(
            this.points[i],
            this.points[i + 1],
            this.tangents[i],
            this.tangents[i + 1]
        ))
    }

    if(closed) {
        this.hermites.push(new Hermite(
            this.points[points.length - 1],
            this.points[0],
            this.tangents[points.length - 1],
            this.tangents[0]
        ))
    }

    this.recalculate = () => {
        this.hermites.forEach(h => h.recalculate())
    }

    this.getChainIndex = (t) => {
        return t >= this.hermites.length ? Math.floor(t-0.001) : Math.floor(t);
    }

    this.get = (t) => {
        let hermiteIndex = this.getChainIndex(t);
        return this.hermites[hermiteIndex].get(t - hermiteIndex)
    }

    this.getTan = (t) => {
        let hermiteIndex = this.getChainIndex(t);
        return this.hermites[hermiteIndex].getTan(t - hermiteIndex)
    }
}

function Spiral(center, r_start, r_slope) {

    this.start = 0;
    this.end = 1;

    this.center = center;
    this.r_start = r_start;
    this.r_slope = r_slope;

    let pos = glMatrix.vec2.create();

    this.get = (t) => {
        let r = this.r_start + (this.r_slope * t)

        glMatrix.vec2.set(pos,
            r * Math.cos(2*Math.PI*t),
            r * Math.sin(2*Math.PI*t));

        glMatrix.vec2.add(pos, pos, center);

        return pos;
    }
}