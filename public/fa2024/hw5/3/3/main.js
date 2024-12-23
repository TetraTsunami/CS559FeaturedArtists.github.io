function setup() {
    "use strict";
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    
    var vec3 = glMatrix.vec3;
    var mat4 = glMatrix.mat4;
    
    var animationCycle = 0;
    var cameraAngle = 0;
    
    var t = 0;
    
    function Hermite(t) {
        return [
            2*t*t*t-3*t*t+1,
            t*t*t-2*t*t+t,
            -2*t*t*t+3*t*t,
            t*t*t-t*t
        ];
    }

    function HermiteDerivative(t) {
        return [
            6*t*t-6*t,
            3*t*t-4*t+1,
            -6*t*t+6*t,
            3*t*t-2*t
        ];
    }

    // control points
    var p0 = [0, 0, 0];
    var d0 = [100, 100, 100];
    var p1 = [200, 200, -100];
    var d1 = [-100, 100, 200];
    
    function Cubic(basis, P, t) {
        var b = basis(t);
        var result = vec3.create();
        vec3.scale(result, P[0], b[0]);
        vec3.scaleAndAdd(result, result, P[1], b[1]);
        vec3.scaleAndAdd(result, result, P[2], b[2]);
        vec3.scaleAndAdd(result, result, P[3], b[3]);
        return result;
    }

    var P0 = [p0, d0, p1, d1];
    var C0 = function(t_) { return Cubic(Hermite, P0, t_); };
    var C0prime = function(t_) { return Cubic(HermiteDerivative, P0, t_); };
    
    function moveToTx(loc, Tx) {
        var res = vec3.create();
        vec3.transformMat4(res, loc, Tx);
        context.moveTo(res[0], res[1]);
    }

    function lineToTx(loc, Tx) {
        var res = vec3.create();
        vec3.transformMat4(res, loc, Tx);
        context.lineTo(res[0], res[1]);
    }
    
    function drawPyramid(color, TxU, scale) {
        var Tx = mat4.clone(TxU);
        mat4.scale(Tx, Tx, [scale, scale, scale]);
        
        context.beginPath();
        moveToTx([-0.866, -0.5, -0.5], Tx);
        lineToTx([0.866, -0.5, -0.5], Tx);
        lineToTx([0, -0.5, 0.5], Tx);
        context.closePath();
        context.fillStyle = color;
        context.fill();
        context.strokeStyle = '#404040';
        context.stroke();
        
        context.beginPath();
        moveToTx([-0.866, -0.5, -0.5], Tx);
        lineToTx([0, 1, 0], Tx);
        lineToTx([0.866, -0.5, -0.5], Tx);
        context.stroke();
        
        context.beginPath();
        moveToTx([0, -0.5, 0.5], Tx);
        lineToTx([0, 1, 0], Tx);
        context.stroke();
    }
    
    function drawEye(TxU, scale) {
        var Tx = mat4.clone(TxU);
        mat4.scale(Tx, Tx, [scale, scale, scale]);
        
        var center = vec3.create();
        vec3.transformMat4(center, [0, 0, 0], Tx);
        
        var radiusPoint = vec3.create();
        vec3.transformMat4(radiusPoint, [0.3, 0, 0], Tx);
        var radius = Math.abs(radiusPoint[0] - center[0]);
        
        context.beginPath();
        context.fillStyle = '#f4f4f4';
        context.arc(center[0], center[1], radius, 0, Math.PI * 2);
        context.fill();
        
        context.beginPath();
        context.fillStyle = '#000000';
        context.arc(center[0], center[1], radius * 0.5, 0, Math.PI * 2);
        context.fill();
    }
    
    function drawRays(TxU, scale) {
        var Tx = mat4.clone(TxU);
        mat4.scale(Tx, Tx, [scale, scale, scale]);
        
        context.beginPath();
        context.strokeStyle = '#FFD700';
        
        for(let i = 0; i < 12; i++) {
            let angle = (i / 12) * Math.PI * 2;
            moveToTx([Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, 0], Tx);
            lineToTx([Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0.2], Tx);
        }
        context.stroke();
    }
    
    function drawTrajectory(Tx) {
        context.beginPath();
        context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        
        for(let i = 0; i <= 100; i++) {
            let t = i / 100;
            let point = C0(t);
            if(i === 0) {
                moveToTx(point, Tx);
            } else {
                lineToTx(point, Tx);
            }
        }
        context.stroke();
    }
    
    function draw() {
        canvas.width = canvas.width;
        
        cameraAngle += 0.01;
        
        var eye = vec3.fromValues(
            400 * Math.cos(cameraAngle),
            200 + 100 * Math.sin(cameraAngle * 0.5),
            400 * Math.sin(cameraAngle)
        );
        var center = vec3.fromValues(0, 0, 0);
        var up = vec3.fromValues(0, 1, 0);
        
        var viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, eye, center, up);
        
        var projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, Math.PI/4, canvas.width/canvas.height, 1, 1000);

        var viewportMatrix = mat4.create();
        mat4.fromTranslation(viewportMatrix, [canvas.width/2, canvas.height/2, 0]);
        mat4.scale(viewportMatrix, viewportMatrix, [100, -100, 1]);
        
        var Tcamera = mat4.create();
        mat4.multiply(Tcamera, viewportMatrix, projectionMatrix);
        mat4.multiply(Tcamera, Tcamera, viewMatrix);
        
        drawTrajectory(Tcamera);
        
        var position = C0(t);
        var tangent = C0prime(t);
        
        var Tmodel = mat4.create();
        mat4.fromTranslation(Tmodel, position);
        
        // rotation for angle
        var angle = Math.atan2(tangent[1], tangent[0]);
        mat4.rotateY(Tmodel, Tmodel, angle);
        
        var Tall = mat4.create();
        mat4.multiply(Tall, Tcamera, Tmodel);
        
        drawPyramid('#c9b037', Tall, 50);
        
        var Teye = mat4.clone(Tall);
        mat4.translate(Teye, Teye, [0, 0.5, 0]);
        drawEye(Teye, 50);
        
        var Trays = mat4.clone(Teye);
        mat4.rotateY(Trays, Trays, animationCycle);
        drawRays(Trays, 50);
        
        t = (t + 0.005) % 1;
        animationCycle += 0.02;
        
        requestAnimationFrame(draw);
    }
    
    draw();
}

if (window.glMatrix) {
    setup();
} else {
    window.addEventListener('load', setup);
}