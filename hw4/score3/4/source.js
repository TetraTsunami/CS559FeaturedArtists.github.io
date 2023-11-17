function moveToTx(loc,Tx)
	{var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.moveTo(res[0],res[1]);}

	function lineToTx(loc,Tx)
	{var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.lineTo(res[0],res[1]);}

var moveHelo = 125;
var rotorSpin = 1;
var time = 0;
var fighterTime = 0;
function setup(){
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext('2d');

    function draw(){
        //taken from lecture demo
        function moveToTx(loc,Tx)
        {var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.moveTo(res[0],res[1]);}
        //taken from lecture demo
        function lineToTx(loc,Tx)
        {var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.lineTo(res[0],res[1]);}
        
        var Hermite = function(t) {
            return [
            2*t*t*t-3*t*t+1,
            t*t*t-2*t*t+t,
            -2*t*t*t+3*t*t,
            t*t*t-t*t
            ];
        }

        var HermiteDerivative = function(t) {
            return [
            6*t*t-6*t,
            3*t*t-4*t+1,
            -6*t*t+6*t,
            3*t*t-2*t
            ];
        }
    
        function Cubic(basis,P,t){
            var b = basis(t);
            var result=vec2.create();
            vec2.scale(result,P[0],b[0]);
            vec2.scaleAndAdd(result,result,P[1],b[1]);
            vec2.scaleAndAdd(result,result,P[2],b[2]);
            vec2.scaleAndAdd(result,result,P[3],b[3]);
            return result;
        }
        
        var p0=[0.5,0];
	    var d0=[-.5,1];
	    var p1=[0.5,1];
	    var d1=[-.5,2];
	    var p2=[0.5,2];
	    var d2=[-0.5,2];
        
        var P0 = [p0,d0,p1,d1]; // First two points and tangents
        var P1 = [p1,d1,p2,d2]; // Last two points and tangents
        var P2 = [[0, 0], [0, 1], [1.55, 0], [0, -1]];
    
        var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
        var C1 = function(t_) {return Cubic(Hermite,P1,t_);};
        var C2 = function(t_) {return Cubic(Hermite,P2,t_);};
        var C2prime = function(t_) {return Cubic(HermiteDerivative,P2,t_);};
        
        var f0 = [[0, 0], [0,-1], [0, -.5], [0, -1]];
        var f1 = [[0, -.5], [0,-1], [-1, 0], [-1, -1]];
        var f2 = [[-1, 0], [-1, -1], [-1.55, -.6], [0, -1]];

        var F0 = function(t_) {return Cubic(Hermite,f0,t_);};
        var F1 = function(t_) {return Cubic(Hermite,f1,t_);};
        var F2 = function(t_) {return Cubic(Hermite,f2,t_);};
        
        var F0prime = function(t_) {return Cubic(HermiteDerivative,f0,t_);};
        var F1prime = function(t_) {return Cubic(HermiteDerivative,f1,t_);};
        var F2prime = function(t_) {return Cubic(HermiteDerivative,f2,t_);};

        var Fcomp = function(t) {
            
        if (t<1){
                var u = t;
                drawTrajectory(0.0, u, 100, F0, anchorToCanvas, "red");
                return F0(u);
            } 
            else if(t>=1 && t<2){
                var u = t - 1.0;
                console.log(t, u);
                drawTrajectory(0.0, 1.0, 100, F0, anchorToCanvas, "red");
                drawTrajectory(0.0, u, 100, F1, anchorToCanvas, "blue");
                return F1(u);
            }
            else if(t>=2 && t<3) {
                console.log("we out here bois");
                var u = t-2.0;
                drawTrajectory(0.0, 1.0, 100, F0, anchorToCanvas, "red");
                drawTrajectory(0.0, 1.0, 100, F1, anchorToCanvas, "blue");
                drawTrajectory(0.0, u, 100, F2, anchorToCanvas, "green");
                return F2(u);
            }   
            else{
                drawTrajectory(0.0, 1.0, 100, F0, anchorToCanvas, "red");
                drawTrajectory(0.0, 1.0, 100, F1, anchorToCanvas, "blue");
                drawTrajectory(0.0, 1.0, 100, F2, anchorToCanvas, "green");
                return F2(1);
            }       
        }
        var Fcomp_tangent = function(t) {
            if(t < 1){
                var u = t;
                return F0prime(u);
            }
            else if(t>=1 && t<2){
                var u = t-1.0;
                return F1prime(u);
            }
            else if(t>=2 && t<3){
                var u = t-2.0;
                return F2prime(u);
            }
            else{
                return F2prime(1);
            }
        }

        var Ccomp = function(t) {
            if (t<1){
                var u = t;
                return C0(u);
            } 
            else {
                var u = t-1.0;
                return C1(u);
            }          
        }

        var carrierComp = function(t) {
            if (t<1){
                var u = t;
                return F0(u);
            } 
            else {
                
                return F0(1);
            }          
        }

        var Hcomp_tangent = function(t) {
            if(t <= 1){
                var u = t;
                return C2prime(u);
            }
            else{
                return C2prime(1);
            }
        }

        var Hcomp = function(t) {
            if(t <= 1){
                var u = t;
                return C2(u);
            }
            else{
                return C2(1);
            }
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

        function drawBeach(Tx){
            context.beginPath();
            context.fillStyle = "blanchedalmond";
            moveToTx([0, 0], Tx);
            lineToTx([0, 600], Tx);
            lineToTx([1000, 600], Tx);
            lineToTx([1000, 0], Tx);
            context.closePath();
            context.fill();

            context.beginPath();
            context.fillStyle = "gray";
            moveToTx([50, 100], Tx);
            lineToTx([200, 100], Tx);
            lineToTx([200, 250], Tx);
            lineToTx([50, 250], Tx);
            context.closePath();
            context.fill();

            context.beginPath();
            context.strokeStyle = "yellow";
            context.lineWidth = "3"
            moveToTx([125, 100], Tx);
            lineToTx([125, 250], Tx);
            context.stroke();

            

        }

        function drawSea(Tx){

            function drawSeaTrajectory(t_begin,t_end,intervals,C,Tx,color) {
                context.strokeStyle=color;
                moveToTx(C(t_begin),Tx);
                for(var i=1;i<=intervals;i++){
                    var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
                    lineToTx(C(t),Tx);
                }
            }
            context.beginPath();
            context.fillStyle = "aqua";
            drawSeaTrajectory(0.0, 1.0, 100, C0, canvas_base, "aqua");
            drawSeaTrajectory(0.0, 1.0, 100, C1, canvas_base, "aqua");
            lineToTx([2,2], Tx);
            lineToTx([2,0], Tx);
            lineToTx([0.5, 0], Tx);
           
            context.closePath();
            context.fill();

        }

        function drawCarrier(Tx){
            context.beginPath();
            context.strokeStyle = "gray";
            context.fillStyle = "gray";
            context.lineWidth = '2';
            moveToTx([-.1, .15], Tx);
            lineToTx([.1, .15], Tx);
            lineToTx([.12, .1], Tx);
            lineToTx([.12, -.3], Tx);
            lineToTx([.05, -.4], Tx);
            lineToTx([-.05, -.4], Tx);
            lineToTx([-.12, -.3], Tx);
            lineToTx([-.12, .1], Tx)
            
            context.closePath();
            context.fill();

            
            context.beginPath();
            context.fillStyle = "black";
            context.strokeStyle = "black";
            moveToTx([.10, .1], Tx);
            lineToTx([.10, -.2], Tx);
            lineToTx([.085, -.2], Tx);
            lineToTx([.085, .1], Tx);
            context.closePath();
            
            context.fill();
            
        }

        function drawHeloBody(Tx){
            context.beginPath();
            context.fillStyle = "burlywood";
            moveToTx([-.1, -.03], Tx);
            lineToTx([-.12, -.02], Tx);
            lineToTx([-.12, .02], Tx);
            lineToTx([-.1, .03], Tx);
            lineToTx([.1, .03], Tx);
            lineToTx([.12, .02], Tx);
            lineToTx([.12, -.02], Tx);
            lineToTx([.1, -.03], Tx);
            context.closePath();
            context.fill();

        }

        function drawRotor(Tx){
            mat3.rotate(Tx, Tx, rotorSpin * (Math.PI / 180));
            context.beginPath();
            context.strokeStyle = "black";
            context.lineWidth = "2";
            moveToTx([0, .04], Tx);
            lineToTx([0, -.04], Tx);
            context.stroke();
            
            context.beginPath();
            moveToTx([.04, 0], Tx);
            lineToTx([-.04, 0], Tx);
            context.stroke();
            
            if(rotorSpin < 360){
                rotorSpin += 1;
            }
            else{
                rotorSpin = 1;
            }
           
        }

        function drawFighter(Tx){
            context.beginPath();
            context.fillStyle = "black";
            moveToTx([-.09, .05], Tx);
            lineToTx([-.05, .03], Tx);
            lineToTx([-.04, .03], Tx);
            lineToTx([-.04, .08], Tx);
            lineToTx([-.02, .08], Tx);
            lineToTx([.02, .01], Tx);
            lineToTx([.07, .008], Tx);
            lineToTx([.08, 0], Tx);
            lineToTx([.07, -.008], Tx);
            lineToTx([.02, -.01], Tx);
            lineToTx([-.02, -.08], Tx);
            lineToTx([-.04, -.08], Tx);
            lineToTx([-.04, -.03], Tx);
            lineToTx([-.05, -.03], Tx);
            lineToTx([-.09, -.05], Tx);
            lineToTx([-.09, -.03], Tx);
            lineToTx([-.06, -.02], Tx);
            lineToTx([-.075, -.01], Tx);
            lineToTx([-.075, .01], Tx);
            lineToTx([-.06, .02], Tx);
            lineToTx([-.09, .03], Tx);
            context.closePath();
            context.fill();

            context.beginPath();
            context.fillStyle = "orange";
            moveToTx([-.075,-.01],Tx);
            lineToTx([-.075, .01],Tx);
            lineToTx([-.09, 0],Tx);
            context.closePath();
            context.fill();

        }
        
        
        ///////////////Drawing action///////////////////////
        //beach and sea
        var canvas_base = mat3.create();
        drawBeach(canvas_base);
        mat3.scale(canvas_base, canvas_base, [500, 300]);
        drawSea(canvas_base);
        //boat
        var anchorToCanvas = mat3.create();
        mat3.fromTranslation(anchorToCanvas, [900, 500]);
        mat3.scale(anchorToCanvas, anchorToCanvas, [500, 500]);
        
        var carrierToAnchor = mat3.create();
        mat3.fromTranslation(carrierToAnchor, carrierComp(time));
        
        var carrierToCanvas = mat3.create();
        mat3.multiply(carrierToCanvas, anchorToCanvas,carrierToAnchor);
        drawCarrier(carrierToCanvas); 
        
        var fighterToAnchor = mat3.create();
        mat3.fromTranslation(fighterToAnchor, Fcomp(fighterTime));
        
        var fTangent = Fcomp_tangent(fighterTime);
        var fAngle = Math.atan2(fTangent[1],fTangent[0]);
        mat3.rotate(fighterToAnchor, fighterToAnchor, fAngle);
        
        var fighterToCanvas = mat3.create();
        mat3.multiply(fighterToCanvas, anchorToCanvas, fighterToAnchor);

        drawFighter(fighterToCanvas);

        
//new try
        var helipadToCanvas = mat3.create();
        mat3.fromTranslation(helipadToCanvas, [125, 175]);
        mat3.scale(helipadToCanvas, helipadToCanvas, [500,500]);

        var helipadToPath = mat3.create();
        mat3.fromTranslation(helipadToPath, Hcomp(time));
        var tangent = Hcomp_tangent(time);
        var angle = Math.atan2(tangent[1],tangent[0]);
        mat3.rotate(helipadToPath, helipadToPath, angle);
        
        var heloToCanvas = mat3.create();
        mat3.multiply(heloToCanvas, helipadToCanvas, helipadToPath);
        
        drawHeloBody(heloToCanvas);
        
        var rotorOneToHelo = mat3.create();
        mat3.fromTranslation(rotorOneToHelo, [-25/500, 0]);
        var rotorOneToCanvas = mat3.create();
        mat3.multiply(rotorOneToCanvas, heloToCanvas, rotorOneToHelo);
        
        drawRotor(rotorOneToCanvas);

        var rotorTwoToHelo = mat3.create();
        mat3.fromTranslation(rotorTwoToHelo, [25/500, 0]);
        var rotorTwoToCanvas = mat3.create();
        mat3.multiply(rotorTwoToCanvas, heloToCanvas, rotorTwoToHelo);
        
        drawRotor(rotorTwoToCanvas);
       
        if (time < 1.05){
            time += .001;
        }
        else{
            time = 0;
        }

        if(fighterTime < 3.68){
            fighterTime += .0035;
        }
        else{
            fighterTime = 0;
        }
        
        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}
window.onload = setup;