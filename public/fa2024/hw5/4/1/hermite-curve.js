//////////////////////////////////////////////////////
// Holds defining information and behaviors for a   //
// Hermite curve, including the ability to retrieve //
// the position or tangent at a given time          //
//////////////////////////////////////////////////////

let HermiteCurve = class HermiteCurve {
    // pass in null for previousCurve if this is the first curve in the series
    constructor(previousCurve, nextCurve) {
        let width = 450;
        let height = 300;
        let depth = 300;

        this.P = [];
        /* Create random points and random tangents */
        // if there exists a previous curve, use those points to 
        // ensure C1 continuity, otherwise randomly generate
        if (previousCurve) {
            this.P.push(previousCurve.getEndPoint());
            this.P.push(previousCurve.getEndTangent());
        } else {
            // random point 1
            const randomXPos1 = Math.round(Math.random() * width/2  - width/4);
            const randomYPos1 = Math.round(Math.random() * height/2 - height/4);
            const randomZPos1 = Math.round(Math.random() * depth/2 - depth/4);
            this.P.push([randomXPos1, randomYPos1, randomZPos1]); // Push the first point [x, y, z] into the array

            // random tangent 1
            const randomXTan1 = Math.round(Math.random() * width/2  - width/4);
            const randomYTan1 = Math.round(Math.random() * height/2 - height/4);
            const randomZTan1 = Math.round(Math.random() * depth/2 - depth/4);
            this.P.push([randomXTan1, randomYTan1, randomZTan1]); // Push the first tangent [x, y, z] into the array
        }
        
        // if this curve should have any specific ending conditions, note those here
        if (nextCurve) {
            this.P.push(nextCurve.getStartPoint());
            this.P.push(nextCurve.getStartTangent());
        } else {
            // random point 1
            const randomXPos2 =  Math.round(Math.random() * width/2  - width/4);
            const randomYPos2 = Math.round(Math.random() * height/2 - height/4);
            const randomZPos2 = Math.round(Math.random() * depth/2 - depth/4);
            this.P.push([randomXPos2, randomYPos2, randomZPos2]); // Push the second point [x, y, z] into the array

            // random tangent 1
            const randomXTan2 = Math.round(Math.random() * width/2  - width/4);
            const randomYTan2 = Math.round(Math.random() * height/2 - height/4);
            const randomZTan2 = Math.round(Math.random() * depth/2 - depth/4);
            this.P.push([randomXTan2, randomYTan2, randomZTan2]); // Push the second tangent [x, y, z] into the array
        }
    }

    // gets the starting position vector
    getStartPoint() {
        return this.P[0];
    }

    // gets the starting tangent vector
    getStartTangent() {
        return this.P[1];
    }

    // gets the ending position vector
    getEndPoint() {
        return this.P[2];
    }

    // gets the ending tangent vector
    getEndTangent() {
        return this.P[3];
    }

    // Returns the basis function evaluated at t; that is, it returns a 1x4 matrix
    hermiteBasisFunction(t) {
	    return [
            2*t*t*t - 3*t*t + 1,
            t*t*t - 2*t*t + t,
            -2*t*t*t + 3*t*t,
            t*t*t - t*t
	    ];
	}

    // Returns the basis function's tangent evaluated at t; that is, it returns a 1x4 matrix
	hermiteDerivativeBasisFunction(t) {
        return [
            6*t*t - 6*t,
            3*t*t - 4*t + 1,
            -6*t*t + 6*t,
            3*t*t - 2*t
        ];
	}

    // Returns the location along this curve at time t; that is, 
    // it returns a 1x3 matrix representing [x, y, z] position vector
    getLocation(t) {
	    let result = vec3.create();
	    vec3.scale      (result, this.P[0], this.hermiteBasisFunction(t)[0]);
	    vec3.scaleAndAdd(result, result, this.P[1], this.hermiteBasisFunction(t)[1]);
	    vec3.scaleAndAdd(result, result, this.P[2], this.hermiteBasisFunction(t)[2]);
	    vec3.scaleAndAdd(result, result, this.P[3], this.hermiteBasisFunction(t)[3]);
	    return result;
    }

    // Returns the tangent to this curve at time t; that is, 
    // it returns a 1x3 matrix representing [x, y, z] tangent vector
    getTangent(t) {
	    let result = vec3.create();
	    vec3.scale      (result, this.P[0], this.hermiteDerivativeBasisFunction(t)[0]);
	    vec3.scaleAndAdd(result, result, this.P[1], this.hermiteDerivativeBasisFunction(t)[1]);
	    vec3.scaleAndAdd(result, result, this.P[2], this.hermiteDerivativeBasisFunction(t)[2]);
	    vec3.scaleAndAdd(result, result, this.P[3], this.hermiteDerivativeBasisFunction(t)[3]);
	    return result;
    }

    // Return a string representation of this curve
    toString() {
        return `p0:[${this.P[0][0]},${this.P[0][1]},${this.P[0][2]}] \td0:[${this.P[1][0]},${this.P[1][1]},${this.P[1][2]}] \tp1:[${this.P[2][0]},${this.P[2][1]},${this.P[2][2]}] \td1:[${this.P[3][0]},${this.P[3][1]},${this.P[3][2]}]`;
    }
}