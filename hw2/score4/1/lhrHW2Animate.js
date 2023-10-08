function setup() {
	var canvas = document.getElementById('myCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');

    function Branch(initBranchAngle, initWidthBranchBase, initLeaf1Angle, initLeaf2Angle, dTheta, dThetaLeaf, dThetaLeaf2, startX, branchColor, leaf1Color, leaf2Color) {
    	this.initBranchAngle = initBranchAngle
    	this.initWidthBranchBase = initWidthBranchBase
    	this.initLeaf1Angle = initLeaf1Angle
    	this.initLeaf2Angle = initLeaf2Angle
    	this.startX = startX 
    	this.startY = canvas.height +20
    	this.dy = canvas.height/4
    	this.dTheta = dTheta // bend of branch
    	this.dThetaLeaf = dThetaLeaf
    	this.dThetaLeaf2 = dThetaLeaf2
    	this.directionB1 = 1
    	this.directionB2 = 1
    	this.revertedB2 = 1
    	this.directionLeaf1 = 1
    	this.directionLeaf2 = 1
    	this.branchColor = branchColor
    	this.leaf1Color = leaf1Color
    	this.leaf2Color = leaf2Color

    	// not to self I do think I need params in order to recur

    	this.drawBranch = function(startx, starty, dy, angle, width, split) {
    		ctx.beginPath();
			ctx.save(); //saving before we translate, rotate, etc to preserve a previous state in stack 
			ctx.lineWidth = width;
			ctx.strokeStyle = this.branchColor
			ctx.translate(startx,starty); //move origin to starting point of drawing
			ctx.rotate(angle *Math.PI/180); // this way the angle passed in can be in degrees rather than radians which I find easier to remember
			ctx.moveTo(0,0);
			ctx.bezierCurveTo(-20, -dy/2, 10, -dy/2, 0, -dy);
			ctx.stroke();
			if ( width < 15 && width >2 && split>0) {
				split = -split;
				this.drawBranch(0,-dy,dy*.75, this.dTheta, width*.6, split)
				ctx.restore();
				return;
			} //end if
			if (width < 2 && split < 0) {
				//axes("green",2)
				split=-split
				this.drawLeaves(-dy,this.initLeaf1Angle,this.dThetaLeaf,this.leaf1Color);
				ctx.save();
				ctx.scale(.75,.75);
				this.drawLeaves(-dy,this.initLeaf2Angle,this.dThetaLeaf2,this.leaf2Color);
				ctx.restore();
				ctx.restore();
				return;
			} //end if num 2
			this.drawBranch(0,-dy,dy*.75,angle+8, width*.6,split)
			this.drawBranch(0,-dy,dy*.75,angle-12, width*.6,split)
			this.drawBranch(0,-dy,dy*.75,angle+20, width*.6,split)
			//this.drawBranch(0,-dy,dy*.75,angle-22, width*.6,split)
			ctx.restore(); 
    	} // end draw branch

    	this.drawLeaves = function(dy,initAngle,angleLeaf,color) {
    		ctx.strokeStyle = this.branchColor;
    		ctx.fillStyle = color
			ctx.lineWidth= 2;
			ctx.save();
			ctx.translate(0,dy)
			ctx.save();
			ctx.rotate(initAngle)
			ctx.rotate(angleLeaf);
			ctx.beginPath();
			ctx.roundRect(0, 0, 20, 10, [1, 4]);
			ctx.stroke();
			ctx.fill();
			ctx.restore();
			ctx.restore();
    	} //end drawLeaves

    	this.updateBranch = function() {
    		if (this.initBranchAngle >= 8) {
    			this.initBranchAngle = 7.9999
    			 this.directionB1 = -this.directionB1; 
    		}
    		if (this.initBranchAngle <= -12) {
    			this.initBranchAngle = -11.99999;
    			this.directionB1 = -this.directionB1;
    		}

       		if (this.directionB1 > 0) {
    			this.initBranchAngle += .008;
    		} else {
    			this.initBranchAngle -= 0.008
    		} //will sway initial base of  
    		
    		if (this.dTheta >= 25 ) {
    			this.dTheta = 24.9999
    			this.directionB2 = -this.directionB2
    		}
    		if (this.dTheta <= -20) {
    			this.dTheta = -19.9999;
    			this.directionB2 = -this.directionB2
    		}
    		if (this.directionB2 > 0) {
    			this.dTheta += 0.07;
    		} else {this.dTheta -= 0.07; } // should sway the thinner set of branches
    		
    		if (this.dThetaLeaf >= 3){
    			this.dThetaLeaf = 2.999;
    			this.directionLeaf1 = -this.directionLeaf1;
    		}
    		if (this.dThetaLeaf <= -3){
    			this.dThetaLeaf = -2.999;
    			this.directionLeaf1 = -this.directionLeaf1;
    		}
       		if (this.directionLeaf1 > 0) {
    			this.dThetaLeaf += .01;
    		} else {
    			this.dThetaLeaf -= .01
    		} 

    		if (this.dThetaLeaf2 >= 5){
    			this.dThetaLeaf2 = 4.999;
    			this.directionLeaf2 = -this.directionLeaf2;
    		}
    		if (this.dThetaLeaf2 <= 0){
    			this.dThetaLeaf2 = 0.0001;
    			this.directionLeaf2 = -this.directionLeaf2;
    		}
       		if (this.directionLeaf2 > 0) {
    			this.dThetaLeaf2 += .02;
    		} else {
    			this.dThetaLeaf2 -= .02
    		} 

    			; // should rotate a set of leaves*/
    		this.drawBranch(this.startX, this.startY,this.dy,this.initBranchAngle, this.initWidthBranchBase,1);
    	} // end updateBranch


    } //end object Branch
    var treeBark = ["#B58A55","#755937","#DBA767","#63391E","#2E2003","#635B48","#916539","#824C16","#523920","#EDE8CC","#6E6B5E"]
    var leafCol = ["#DBC532","#73DB12","#58A80E","#A87A3D","#215C2D","#275E2F","#024A38","#783835","#3FFF61","#68BD78","#68E07C"]

    var branchAry = []

    for (let i= 0; i <6; i++) {
    	const initBAng = (Math.random()-.5)*180
    	const initBWidth = 20 + Math.random()*50
    	const initLAngle1 =Math.random()*90
    	const initLAngle2 = Math.random()*90
    	const startX = canvas.width/2 + ((Math.random()-.5)*canvas.width/2)
    	const branchColor = treeBark[Math.round(Math.random()*10)]
    	const leaf1Color = leafCol[Math.round(Math.random()*10)]
    	const leaf2Color = leafCol[Math.round(Math.random()*10)]
    	branchAry.push(new Branch(initBAng,initBWidth, initLAngle1, initLAngle2, 0, 0, 10, startX, branchColor, leaf1Color, leaf2Color))
    }
    console.log(branchAry)

		//ctx.clearRect(0,0,canvas.width,canvas.height);
	
	function animate () {
		requestAnimationFrame(animate);
		canvas.width = canvas.width
		for (let j = 0; j < branchAry.length; j++) {
			branchAry[j].updateBranch();
		}
	}
	animate();

} // end of setup
	window.onload = setup;