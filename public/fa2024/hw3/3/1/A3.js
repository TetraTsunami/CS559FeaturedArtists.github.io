//<p>The swaying fishing rope is achieved by implementing XPBD to simulate physical movement, see This involves basic physics simulation of Verelet Integration and a bit of XPDB, see https://mmacklin.com/xpbd.pdf for more detail</p>

function setup() {

    function moveToTx(x, y, Tx) {
        var res = glMatrix.vec2.create(); 
        glMatrix.vec2.transformMat3(res, [x, y], Tx); 
        context.moveTo(res[0], res[1]);
    }

    function lineToTx(x, y, Tx) {
        var res = glMatrix.vec2.create();
        glMatrix.vec2.transformMat3(res, [x, y], Tx);
        context.lineTo(res[0], res[1]);
    }	
    function arcTx(x, y, radius, start, end, Tx) {
        var res = glMatrix.vec2.create();
        glMatrix.vec2.transformMat3(res, [x, y], Tx);
        context.arc(res[0], res[1], radius, start, end);
    }
    
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext('2d');
    var sliderX = document.getElementById("x");
    sliderX.value = 1;
    var sliderTheta = document.getElementById("theta");
    sliderTheta.value = 0;
    var sliderdx = document.getElementById('dx');
    sliderdx.value = 0;
    var sliderdy = document.getElementById('dy');
    sliderdy.value = 0;
    var img = document.getElementById("background");

    canvas.width = canvas.width;

    var gravity = 0.98;
    var windForce = sliderX.value; // Simulated wind force
    //var damping = 0.995; // Reduced damping for greater motion
    var iterations = 50; // XPBD iterations for constraint solving
    //var relaxation = 1;  // Relaxation parameter for XPBD
    var frame = 1/60;
    var lenthBet = 20;
    var dampingCoefficient = 0.90;
    //from 0 - 1
    var stiffness = 0.90;
    var initXpos = 0;
    var numPoints = 10;

    let prePosX = [];
    let prePosY = [];
    let nowPosX = [];
    let nowPosY = [];
    let velocityX = [];
    let velocityY = [];
    let forceX = [];
    let forceY = [];
    let invmass = [];

    
    function init(k){
        if(k == 0){
            for(var i = 0 ; i < numPoints; ++i){
                nowPosX.push(initXpos);
                nowPosY.push(lenthBet * i);
                velocityX.push(0);
                velocityY.push(0);
                forceY.push(gravity);
                forceX.push(windForce);
                if(i == 0){
                    invmass.push(0);
                } else if(i == numPoints-1){
                    invmass.push(1/100);
                } else{
                    invmass.push(1);
                }
            }
        } if(k == 1){
            for(var i = 0 ; i < numPoints; ++i){
                forceY[i] = sliderX.value;
            }
        }
    }
    
    function animate() {
        // const currentTime = performance.now();
        // const deltaTime = (currentTime - lastTime) / 1000; 
        // lastTime = currentTime;
        init(1);
        const deltaTime = frame;
        updateSimulation(deltaTime); 
        draw();
        requestAnimationFrame(animate);
    }

    function updateSimulation(deltaTimePrime) {
        var deltaTime = deltaTimePrime / iterations;
        var itera = 0;
        while(itera < iterations){
        //for all particles i
        for(i = 0; i < numPoints; ++i){
            //predict position x = x^n + delta_t*v^n+ delta_t^2*M^-1*fext(x^n)
            velocityX[i] += deltaTime * forceX[i] * invmass[i];
            velocityY[i] += deltaTime * forceY[i] * invmass[i];
            prePosX[i] = nowPosX[i];
            prePosY[i] = nowPosY[i];
            nowPosX[i] += deltaTime * velocityX[i];
            nowPosY[i] += deltaTime * velocityY[i];
        }
        //for all constraints 
        for(i = 0; i < numPoints; ++i){
            var lambda = 0;
            for(var j = 0; j < 2; j++){
                var index0 = i;
                var index1 = i;
                if(j == 0){
                    index1 = i - 1;
                } else{
                    index1 = i + 1;
                }
                if(index1 < 0 || index1 >= numPoints){
                    continue;
                }

                var w0 = invmass[index0];
                var w1 = invmass[index1];
                var sumW = w0 + w1;
                
                if (sumW == 0){
                    continue;
                }
                var dx = nowPosX[index0]-nowPosX[index1];
                var dy = nowPosY[index0]-nowPosY[index1];
                //|x0-x1|
                var distance = Math.sqrt(dx*dx+dy*dy);
                //gradC = (x0-x1) / |x0-x1| 
                var gradCX = dx/distance;
                var gradCY = dy/distance;
                var gradCMag = gradCX * gradCX + gradCY * gradCY;

                var C = distance - lenthBet;
                var alpha = 1/stiffness;
                var belta = dampingCoefficient;
                var alphaHat = alpha/(deltaTime*deltaTime);
                var beltaHat = deltaTime*deltaTime * belta;
                var gamma = alphaHat * beltaHat / deltaTime;
                var xixnX = nowPosX[index0] - prePosX[index0];
                var xixnY = nowPosY[index0] - prePosY[index0];
                var gradCxixn = gradCX * xixnX + xixnY * gradCY;
                // d_lambda = (-C - lambda*alphahat - gamma * gradC(xi-xn)) / ((i+gamma) * gradC * w_T * gradC_T + alphahat)
                var lambda = lambda + (-1 * C - lambda * alphaHat - gamma * gradCxixn)/((1 + gamma) * sumW * gradCMag + alphaHat); 
                
                //x = x + deltaX where deltaX = gradC * w_T(i) * lambda
                var delX = lambda * gradCX;
                var delY = lambda * gradCY;

                nowPosX[index0] += w0 * delX; 
                nowPosY[index0] += w0 * delY; 
                nowPosX[index1] -= w1 * delX; 
                nowPosY[index1] -= w1 * delY; 
            }
        }
        for(i = 0; i < numPoints; ++i){
        velocityX[i] = (nowPosX[i] - prePosX[i]) / deltaTime;
        velocityY[i] = (nowPosY[i] - prePosY[i]) / deltaTime;
        }
        itera = itera + 1;
        }
    }

    function draw() {
        var dx = parseFloat(sliderdx.value);
        var dy = parseFloat(sliderdy.value);
        var hook_theta = sliderTheta.value * 0.005 * Math.PI;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        //background
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
    
        // Stick transformation
        var stick_mat = glMatrix.mat3.create();
        glMatrix.mat3.fromTranslation(stick_mat, [dx, dy]);
        context.strokeStyle = 'brown';
        context.beginPath();
        moveToTx(0, 0, stick_mat);
        lineToTx(150, 100, stick_mat);
        context.lineWidth = 15;
        context.stroke();
    
        // Rope transformation
        var rope_mat = glMatrix.mat3.create();
        glMatrix.mat3.fromTranslation(rope_mat, [150 + dx, 100 + dy]);
        context.beginPath();
        moveToTx(nowPosX[0], nowPosY[0], rope_mat);
        for (var i = 0; i < numPoints; ++i) {
            lineToTx(nowPosX[i], nowPosY[i], rope_mat);
        }
        context.strokeStyle = 'black';
        context.lineWidth = 3;
        context.stroke();
        context.closePath();
    
        // Hook transformation
        var hook_mat = glMatrix.mat3.create();
        glMatrix.mat3.fromTranslation(hook_mat, [150 + dx + nowPosX[numPoints - 1], 100 + dy + nowPosY[numPoints - 1]]);
        glMatrix.mat3.rotate(hook_mat, hook_mat, hook_theta);
        context.beginPath();
        moveToTx(0, 0, hook_mat); 
        lineToTx(0, 100, hook_mat); 
        lineToTx(50,150, hook_mat);
        lineToTx(-25, 200, hook_mat);
        lineToTx(-80, 130, hook_mat);
        moveToTx(10, 0, hook_mat); 
        arcTx(0, 0, 10, 0, 2 * Math.PI, hook_mat);  
        context.strokeStyle = 'black'; 
        context.lineWidth = 5;
        context.stroke();
        context.closePath();
    }
    
    init(0);
    animate();  
}
window.onload = setup();
