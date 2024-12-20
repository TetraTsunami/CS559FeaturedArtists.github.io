function setup() {
    const canvas = document.getElementById("Canvas");
    const context = canvas.getContext("2d");
    const carSpeedControl = document.getElementById("carSpeedControl");
    const trackCurveControl = document.getElementById("trackCurveControl");
    const carSizeControl = document.getElementById("carSizeControl");

    let car1Pos = 0;
    let car2Pos = 0;
    let car3Pos = 0;
    let carSpeed = parseFloat(carSpeedControl.value);
    let carSize = parseFloat(carSizeControl.value);


    function moveToTx(loc, Tx) {
        const res = vec2.create();
        vec2.transformMat3(res, loc, Tx);
        context.moveTo(res[0], res[1]);
    }

    function lineToTx(loc, Tx) {
        const res = vec2.create();
        vec2.transformMat3(res, loc, Tx);
        context.lineTo(res[0], res[1]);
    }

    // hermite curve function
    function hermiteCurve(t, p0, p1, t0, t1) {
        const h00 = 2 * t * t * t - 3 * t * t + 1;
        const h10 = t * t * t - 2 * t * t + t;
        const h01 = -2 * t * t * t + 3 * t * t;
        const h11 = t * t * t - t * t;

        const result = vec2.create();
        vec2.scale(result, p0, h00);
        vec2.add(result, result, vec2.scale(vec2.create(), t0, h10));
        vec2.add(result, result, vec2.scale(vec2.create(), p1, h01));
        vec2.add(result, result, vec2.scale(vec2.create(), t1, h11));

        return result;
    }

    // tangent calculation for hermite curve
    function hermiteTangent(t, p0, p1, t0, t1) {
        const h00 = 6 * t * t - 6 * t;
        const h10 = 3 * t * t - 4 * t + 1;
        const h01 = -6 * t * t + 6 * t;
        const h11 = 3 * t * t - 2 * t;

        const result = vec2.create();
        vec2.scale(result, p0, h00);
        vec2.add(result, result, vec2.scale(vec2.create(), t0, h10));
        vec2.add(result, result, vec2.scale(vec2.create(), p1, h01));
        vec2.add(result, result, vec2.scale(vec2.create(), t1, h11));

        return result;
    }

    // center the track within the canvas
    let p0 = vec2.fromValues(-100, -100); // topleft
    let p1 = vec2.fromValues(100, -100);  // topright
    let p2 = vec2.fromValues(100, 100);   // bottomright
    let p3 = vec2.fromValues(-100, 100);  // bottomleft

    let t0 = vec2.fromValues(100, 0);
    let t1 = vec2.fromValues(100, 0);
    let t2 = vec2.fromValues(-100, 0);
    let t3 = vec2.fromValues(-100, 0);

    // piecewise hermite curve function for track with G1 continuity
    function raceTrackCurve(t) {
        if (t < 1) {
            return hermiteCurve(t, p0, p1, t0, t1);
        } else if (t < 2) {
            return hermiteCurve(t - 1, p1, p2, t1, t2);
        } else if (t < 3) {
            return hermiteCurve(t - 2, p2, p3, t2, t3);
        } else {
            return hermiteCurve(t - 3, p3, p0, t3, t0);
        }
    }

    // tangent for race track
    function raceTrackTangent(t) {
        if (t < 1) {
            return hermiteTangent(t, p0, p1, t0, t1);
        } else if (t < 2) {
            return hermiteTangent(t - 1, p1, p2, t1, t2);
        } else if (t < 3) {
            return hermiteTangent(t - 2, p2, p3, t2, t3);
        } else {
            return hermiteTangent(t - 3, p3, p0, t3, t0);
        }
    }

    // draw track trajectory
    function drawTrajectory(t_begin, t_end, intervals, Tx, color) {
        context.strokeStyle = color;
        context.beginPath();
        let start = raceTrackCurve(t_begin);
        moveToTx(start, Tx);

        for (let i = 1; i <= intervals; i++) {
            const t = ((intervals - i) / intervals) * t_begin + (i / intervals) * t_end;
            const pos = raceTrackCurve(t);
            lineToTx(pos, Tx);
        }
        context.stroke();
    }

    // draw car using transformations
    function drawCar(color, position, Tx) {
        const pos = raceTrackCurve(position);
        const tangent = raceTrackTangent(position);
        const angle = Math.atan2(tangent[1], tangent[0]);

        context.save();
        const Tcar = mat3.create();
        mat3.fromTranslation(Tcar, pos);  // translate car to its position
        mat3.rotate(Tcar, Tcar, angle);  // rotate car based on tangent
        mat3.multiply(Tcar, Tx, Tcar);  // applying transformation

        // draw car
        context.fillStyle = color;
        context.beginPath();
        moveToTx([-carSize, -carSize / 2], Tcar);
        lineToTx([-carSize, carSize / 2], Tcar);
        lineToTx([carSize, carSize / 2], Tcar);
        lineToTx([carSize, -carSize / 2], Tcar);
        context.closePath();
        context.fill();
        context.restore();
    }

    function draw() {
        canvas.width = canvas.width;

        // transformation matrix for canvas
        const Tx_canvas = mat3.create();
        mat3.fromTranslation(Tx_canvas, [canvas.width / 2, canvas.height / 2]);  //center the track

        //draw track trajectory
        drawTrajectory(0, 4, 100, Tx_canvas, "black");

        //draw cars
        drawCar("red", car1Pos, Tx_canvas);
        drawCar("blue", car2Pos, Tx_canvas);
        drawCar("green", car3Pos, Tx_canvas);

        // update car positions
        car1Pos += carSpeed;
        car2Pos += carSpeed * 0.8;
        car3Pos += carSpeed * 0.5;

        // keeps car within the track
        car1Pos = car1Pos % 4;
        car2Pos = car2Pos % 4;
        car3Pos = car3Pos % 4;

        requestAnimationFrame(draw);
    }

    carSpeedControl.addEventListener("input", () => {
        carSpeed = parseFloat(carSpeedControl.value);
    });

    carSizeControl.addEventListener("input", () => {
        carSize = parseFloat(carSizeControl.value);
    });

    trackCurveControl.addEventListener("input", () => {
        // scale down curveFactor to stop from going off canavs
        let curveFactor = parseFloat(trackCurveControl.value) * 0.3; 

        // adjusted tangents based on slider within a range
        t0 = vec2.fromValues(100 * curveFactor, 50 * curveFactor);
        t1 = vec2.fromValues(100 * curveFactor, -50 * curveFactor);
        t2 = vec2.fromValues(-100 * curveFactor, 50 * curveFactor);
        t3 = vec2.fromValues(-100 * curveFactor, -50 * curveFactor);
    });

    draw();
}

window.onload = setup;
