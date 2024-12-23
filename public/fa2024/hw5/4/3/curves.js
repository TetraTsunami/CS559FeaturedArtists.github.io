// Curve drawing wrappers

function drawCurve(c, numLines, Tx) {
    context.beginPath();
    let start = c(0);
    moveToTx(start[0], start[1], start[2], Tx);
    for (let i = 1; i <= numLines; i++) {
        let t = i/numLines;
        let pos = c(t);
        lineToTx(pos[0], pos[1], pos[2], Tx);
    }
    context.stroke();
}

// Curve functions

function circleX(radius, t) {
    return [
        radius * Math.cos(t),
        0,
        radius * Math.sin(t)
    ]
}

function _piecewise(pieces, t) {
    if (t == 1) return pieces[pieces.length-1](1);
    t *= pieces.length;
    let i = Math.floor(t);
    t -= i;
    let C = pieces[i];
    return C(t);
}


function Cubic(basis, P, t) {
    let b = basis(t);
    let result = vec3.create();
    vec3.scale(result, P[0], b[0]);
    vec3.scaleAndAdd(result, result, P[1], b[1]);
    vec3.scaleAndAdd(result, result, P[2], b[2]);
    vec3.scaleAndAdd(result, result, P[3], b[3]);
    return result;
}

// Basis functions

// Returns the Hermite basis at point t.
function Hermite(t) {
    return [
        2*t*t*t-3*t*t+1,
        t*t*t-2*t*t+t,
        -2*t*t*t+3*t*t,
        t*t*t-t*t
    ];
}

function BSpline(t) {
    return [
        (-t*t*t+3*t*t-3*t+1)/6,
        (3*t*t*t-6*t*t+4)/6,
        (-3*t*t*t+3*t*t+3*t+1)/6,
        (t*t*t)/6
    ];
}

function BSplineT(t) {
    return [
        (-3*t*t+6*t-3)/6,
        (9*t*t-12*t)/6,
        (-9*t*t+6*t+3)/6,
        (3*t*t)/6
    ];
}

// Shorthand functions to create curves

function piecewise(pieces) {
    return function(t) {
        return _piecewise(pieces, t);
    }
}

// Returns a hermite curve function with the given starting/ending points/tangents.
function createHermite(p0, d0, p1, d1) {
    return function(t) {
        return Cubic(Hermite, [p0, d0, p1, d1], t);
    }
}

function createBSpline(p0, p1, p2, p3) {
    return function(t) {
        return Cubic(BSpline, [p0, p1, p2, p3], t);
    }
}

function createBSplines(points, closed) {
    let p = [...points];
    if (closed) {
        if (points.length < 3) {
            throw Exception('Need at least 3 points for a closed B-Spline!');
        }
        p.push(points[0]);
        p.push(points[1]);
        p.push(points[2]);
    }
    let curves = []
    for (let i = 0; i < p.length-3; i++) {
        curves.push(createBSpline(p[i], p[i+1], p[i+2], p[i+3]));
    }
    return curves;
}

function createBSplineTangent(p0, p1, p2, p3) {
    return function(t) {
        return Cubic(BSplineT, [p0, p1, p2, p3], t);
    }
}

function createBSplineTangents(points, closed) {
    let p = [...points];
    if (closed) {
        if (points.length < 3) {
            throw Exception('Need at least 3 points for a closed B-Spline!');
        }
        p.push(points[0]);
        p.push(points[1]);
        p.push(points[2]);
    }
    let curves = []
    for (let i = 0; i < p.length-3; i++) {
        curves.push(createBSplineTangent(p[i], p[i+1], p[i+2], p[i+3]));
    }
    return curves;
}