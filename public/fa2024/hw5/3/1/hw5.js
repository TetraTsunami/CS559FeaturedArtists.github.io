function setup() {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var slider1 = document.getElementById('slider1');
    slider1.value = 15;
    var slider2 = document.getElementById('slider2');
    slider2.value = 20;
    var slider3 = document.getElementById('slider3');
    slider3.value = 0;

    function draw() {
	canvas.width = canvas.width;

	var viewAngle = slider1.value*0.02*Math.PI;
    var cameraHeight = slider2.value;
	var tParam = slider3.value*Math.PI;
	
	function moveToTx(loc,Tx)
	{var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.moveTo(res[0],res[1]);}

	function lineToTx(loc,Tx)
	{var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.lineTo(res[0],res[1]);}

    function drawWindmill(color,Tx,locCamera) {

        function isVisible(side,negateNormal) {
            //Create vec3s from 3 points on the plane
            var b = vec3.fromValues(side[0][0], side[0][1], side[0][2]);
            var r = vec3.fromValues(side[1][0], side[1][1], side[1][2]);
            var s = vec3.fromValues(side[2][0], side[2][1], side[2][2]);

            //Subtract vectors to get two vectors in the plane
            var br = vec3.create();
            vec3.subtract(br, r, b);
            var bs = vec3.create();
            vec3.subtract(bs, s, b);

            //Normal is the cross product of these vectors
            var normal = vec3.create();
            vec3.cross(normal, br, bs);

            //Top of lighthouse was not displaying correctly, not sure how
            //else to fix so just decided to negate the normal.
            if (negateNormal) {
                vec3.negate(normal, normal);
            }

            //Negative of locCamera is the direction camera is facing
            var lookCamera = vec3.create();
            vec3.negate(lookCamera, locCamera);

            //If the dot product of the normal and the camera are positive, the surface is visible
            return vec3.dot(normal, lookCamera) > 0;
        }

        //Coordinates of base of lighthouse
        var base = [
            [2,0,4.828],
            [4.828,0,2],
            [4.828,0,-2],
            [2,0,-4.828],
            [-2,0,-4.828],
            [-4.828,0,-2],
            [-4.828,0,2],
            [-2,0,4.828]
        ];

        //Coordinates of the top of the lighthouse
        var top = [
            [1,10,2.414],
            [2.414,10,1],
            [2.414,10,-1],
            [1,10,-2.414],
            [-1,10,-2.414],
            [-2.414,10,-1],
            [-2.414,10,1],
            [-1,10,2.414]
        ];

        //Coordinates of the sides of the lighthouse
        var sides = [
            [base[0],top[0],top[1],base[1]], // Side 1
            [base[1],top[1],top[2],base[2]], // Side 2
            [base[2],top[2],top[3],base[3]], // Side 3
            [base[3],top[3],top[4],base[4]], // Side 4
            [base[4],top[4],top[5],base[5]], // Side 5
            [base[5],top[5],top[6],base[6]], // Side 6
            [base[6],top[6],top[7],base[7]], // Side 7
            [base[7],top[7],top[0],base[0]], // Side 8
        ];

        context.strokeStyle = "black";
        context.fillStyle = color;

        //Draw sides
        for (var i = 0; i < 8; i++) {
            if (!isVisible(sides[i], false)) continue;

            context.beginPath();
            moveToTx(sides[i][0],Tx);
            lineToTx(sides[i][1],Tx);
            lineToTx(sides[i][2],Tx);
            lineToTx(sides[i][3],Tx);
            lineToTx(sides[i][0],Tx);
            context.closePath();
            context.stroke();
            context.fill();
        }

        //Draw base
        if (isVisible(base,false)) {
            context.beginPath();
            moveToTx(base[7],Tx);
            for (var i = 0; i < 8; i++) {
                lineToTx(base[i],Tx);
            }
            context.closePath();
            context.stroke();
            context.fill();
        }

        //Draw top
        if (isVisible(top),true) {
            context.beginPath();
            moveToTx(top[7],Tx);
            for (var i = 0; i < 8; i++) {
                lineToTx(top[i],Tx);
            }
            context.closePath();
            context.stroke();
            context.fill();
        }
    }

    function drawProp(color,Tx) {
        context.beginPath();
        context.strokeStyle = "black";
        context.fillStyle = color;
        moveToTx([0.5, 0, 0],Tx);
        lineToTx([-0.5, 0, 0],Tx);
        lineToTx([-1, 5, 0],Tx);
        lineToTx([1, 5, 0],Tx);
        context.closePath();
        context.stroke();
        context.fill();
    }

    var Curve = function(t) {
        return [
            5 * Math.cos(t),
            t / Math.PI,
            5 * Math.sin(t)
        ]
    }

	function drawTrajectory(t_begin,t_end,intervals,C,Tx,color) {
	    context.strokeStyle=color;
	    context.beginPath();
            moveToTx(C(t_begin),Tx);
            for(var i=1;i<=intervals;i++){
		var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
		lineToTx(C(t),Tx);
            }
            context.stroke();
	}

	// Create ViewPort transform
	var Tviewport = mat4.create();
	mat4.fromTranslation(Tviewport,[200,300,0]);  // Move the center of the
        // "lookAt" transform (where
        // the camera points) to the
        // canvas coordinates (200,300)
	mat4.scale(Tviewport,Tviewport,[100,-100,1]); // Flip the Y-axis,
        // scale everything by 100x

	// Create projection transform
	// (orthographic for now)
	var Tprojection = mat4.create();
	// mat4.ortho(Tprojection,-10,10,-10,10,-1,1);
	mat4.perspective(Tprojection,Math.PI/5,1,-1,1);

	// Combined transform for viewport and projection
	var tVP_PROJ = mat4.create();
	mat4.multiply(tVP_PROJ,Tviewport,Tprojection);

	// Create Camera (lookAt) transform
	var locCamera = vec3.create();
	var distCamera = 40.0;
	locCamera[0] = distCamera*Math.sin(viewAngle);
	locCamera[1] = cameraHeight;
	locCamera[2] = distCamera*Math.cos(viewAngle);
	var locTarget = vec3.fromValues(0,0,0); // Aim at the origin of the world coords
	var vecUp = vec3.fromValues(0,1,0);
	var TlookAt = mat4.create();
	mat4.lookAt(TlookAt, locCamera, locTarget, vecUp);
	
	
	// Create transform t_VP_CAM that incorporates
	// Viewport and Camera transformations
	var tVP_PROJ_CAM = mat4.create();
	mat4.multiply(tVP_PROJ_CAM,tVP_PROJ,TlookAt);
    drawWindmill("#C4A484",tVP_PROJ_CAM,locCamera);

    //Props translation
    var Tprops = mat4.create();
    mat4.fromTranslation(Tprops,[0,10,4]);
    mat4.multiply(Tprops, tVP_PROJ_CAM, Tprops);

    //Individual prop translation
    for (var i = 0; i < 4; i++) {
        var Tprop_individual = mat4.create();
        mat4.rotateZ(Tprop_individual, Tprop_individual, (tParam + (90 * i)) * Math.PI / 180);
        mat4.multiply(Tprop_individual, Tprops, Tprop_individual);
        drawProp("#5C4033", Tprop_individual);
    }

    //Curve
    var Tcurve = mat4.create();
    mat4.rotateX(Tcurve, Tcurve, 90 * Math.PI / 180);
    mat4.rotateY(Tcurve, Tcurve, tParam * Math.PI / 180);
    mat4.multiply(Tcurve, Tprops, Tcurve);
    drawTrajectory(0,20,100,Curve,Tcurve,"gold");

    }
    
    slider1.addEventListener("input",draw);
    slider2.addEventListener("input",draw);
    slider3.addEventListener("input",draw);
    draw();
}
window.onload = setup;