// creates a set of curves connected with C1 continuity
let CurveManager = class CurveManager {
    constructor() {
        this.numCurves = 10;
        
        // An array of interconnected curves
        this.curves = [];
        // initialize with starting one...
        this.curves.push(new HermiteCurve(null));

        // ... then fill up with enough to cover the entire lifetime
        for(let i = 1; i < this.numCurves - 1; i++) {
            this.curves.push(new HermiteCurve(this.curves[i-1], null))
        }

        // ... then make the last curve connect to the first one
        this.curves.push(new HermiteCurve(this.curves[this.numCurves - 2], this.curves[0]));
    }

    // determines the current curve index to use based on the current time
    currentCurveIndex(currentTime) {
        return Math.trunc(currentTime % this.numCurves);
    }

    // returns the position in space for the given curve at whatever the current time is
    getPosition(currentTime) {
        // all curves are defined with interval [0, 1], so we must do a change of variables to account for that
        return this.curves[this.currentCurveIndex(currentTime)].getLocation(currentTime - Math.trunc(currentTime));
    }

    // returns the tangent in space for the given curve at whatever the current time is
    getTangent(currentTime) {
        // all curves are defined with interval [0, 1], so we must do a change of variables to account for that
        return this.curves[this.currentCurveIndex(currentTime)].getTangent(currentTime - Math.trunc(currentTime));
    }

    // Return a string representation of this curve manager object
    toString() {
        return "curves:\n" + this.curves.map(curve => `${curve.toString()}\n`).join('');
    }
    
}