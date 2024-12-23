const pi = Math.PI;
const g = 9.8;

var prevHorizontal = slider1.value;
var newHorizontal = slider1.value;
var prevVertical = slider2.value;
var newVertical = slider2.value;
var dx = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var rotate = 0;
function setup() {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var slider1 = document.getElementById('slider1');
    slider1.value = 0;
    var slider2 = document.getElementById('slider2');
    slider2.value = 0;

    function draw() {
        var theta = slider1.value*0.005*Math.PI;
        var phi = slider2.value*0.005*Math.PI;
        var ropephi = phi;

        const time = new Date();
        var tParam = (time % 20000 * 0.0001) ;
		var wParam = 5-(time % 20000 * 0.0003) ;
        if(time % 5 == 0) {
            if(slider2.value != prevVertical) {
                dx[0] += (prevVertical - ropephi) * 0.3;
            }
            for(var i =1; i < dx.length; i++) {
                dx[i] = dx[i-1];
            }
            if(slider1.value != prevHorizontal) {
                newHorizontal = slider1.value;
                dx[0] += prevHorizontal - newHorizontal;
            }
            else {
                if(dx[0] > 0) {
                    dx[0] -= 0.3;
                }
                else {
                    dx[0] += 0.3;
                }
            }
        }
        prevHorizontal = slider1.value;
        prevVertical = slider2.value;
        window.requestAnimationFrame(draw);
        canvas.width = canvas.width;
       

        var stack = [ mat3.create() ]; // Initialize stack with identity on top
        
        function moveToTx(x,y)  
        {;var res=vec2.create(); vec2.transformMat3(res,[x,y],stack[0]); context.moveTo(res[0],res[1]);}

        function lineToTx(x,y)
        {var res=vec2.create(); vec2.transformMat3(res,[x,y],stack[0]); context.lineTo(res[0],res[1]);}
        
        function moveToTx0(loc,Tx)
        {var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.moveTo(res[0],res[1]);}
    
        function lineToTx1(loc,Tx)
        {var res=vec2.create(); vec2.transformMat3(res,loc,Tx); context.lineTo(res[0],res[1]);}
        
		function arcToTx(loc, radius, startAngle, angle, Tx)
		{var res=vec2.create(); vec2.transformMat3(res, loc,Tx); context.arc(res[0], res[1], radius, startAngle, angle)};
        function drawBird(Tx) {
            context.beginPath();
			context.strokeStyle = "black";
			context.fillStyle = "black";
			arcToTx([0,0], 3, 0, Math.PI*2, Tx);
			context.fill();
			moveToTx([0,0], Tx);
			stack.unshift(mat3.clone(stack[0]));
			stack.shift();
			stack.shift();
			
			var Twing_to_canvas = mat3.create();
			mat3.rotate(Twing_to_canvas, Twing_to_canvas, angle);
			mat3.multiply(Twing_to_canvas, Tx, Twing_to_canvas);
			moveToTx0([0,10], Twing_to_canvas);
			lineToTx1([0,0], Twing_to_canvas);
			context.stroke();

			var TotherWing_to_canvas = mat3.create();
			mat3.rotate(TotherWing_to_canvas, TotherWing_to_canvas, -angle);
			mat3.multiply(TotherWing_to_canvas, Tx, TotherWing_to_canvas);
			moveToTx0([0,0], TotherWing_to_canvas);
			lineToTx1([0, -10], TotherWing_to_canvas);
			context.stroke();
        }

		function drawWind(Tx, i) {
            context.beginPath();
			context.strokeStyle = 'rgba(' + [255,255,255, 1-i/10] + ')';
			arcToTx([0,0], 1, 0, Math.PI*2, Tx);
			context.stroke();
        }

        var Rstart = 50.0;
	var Rslope = 25.0;
	var Cspiral = function(t) {
	    var R = Rslope * t + Rstart;
	    var x = R * Math.cos(2.0 * Math.PI * t);
	    var y = R * Math.sin(2.0 * Math.PI * t);
	    return [x,y];
	}

	var Cspiral_tangent = function(t) {
	    var R = Rslope * t + Rstart;
	    var Rprime = Rslope;
	    var x = Rprime * Math.cos(2.0 * Math.PI * t)
                - R * 2.0 * Math.PI * Math.sin(2.0 * Math.PI * t);
	    var y = Rprime * Math.sin(2.0 * Math.PI * t)
                + R * 2.0 * Math.PI * Math.cos(2.0 * Math.PI * t);
	    return [x,y];
	}


	function drawTrajectory(t_begin,t_end,intervals,C,Tx,color) {
	    context.strokeStyle=color;
	    context.beginPath();
        moveToTx0(C(t_begin),Tx);
        for(var i=1;i<=intervals;i++){
            var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
            lineToTx1(C(t),Tx);
        }
        context.stroke();
	}

        function rope() {
            context.beginPath();
            context.strokeStyle="black";
            context.lineWidth = 2;
            moveToTx(0,0);
            lineToTx(0, 10);
            context.stroke();
        }
        
        function axes(color) {
            context.strokeStyle=color;
            context.beginPath();
            // Axes
            moveToTx(50,0);lineToTx(0,0);lineToTx(0,50);
            // Arrowheads
            moveToTx(110,5);lineToTx(120,0);lineToTx(110,-5);
            moveToTx(5,110);lineToTx(0,120);lineToTx(-5,110);
            // X-label
            moveToTx(130,-5);lineToTx(140,5);
            moveToTx(130,5);lineToTx(140,-5);
            // Y-label
            moveToTx(-5,130);lineToTx(0,135);lineToTx(5,130);
            moveToTx(0,135);lineToTx(0,142);
            context.stroke();
        }

        function drawAxes(color,Tx) {
            context.strokeStyle=color;
            context.beginPath();
            // Axes
            moveToTx0([120,0],Tx);lineToTx1([0,0],Tx);lineToTx1([0,120],Tx);
            // Arrowheads
            moveToTx0([110,5],Tx);lineToTx1([120,0],Tx);lineToTx1([110,-5],Tx);
            moveToTx0([5,110],Tx);lineToTx1([0,120],Tx);lineToTx1([-5,110],Tx);
            // X-label
            moveToTx0([130,0],Tx);lineToTx1([140,10],Tx);
            moveToTx0([130,10],Tx);lineToTx1([140,0],Tx);
            context.stroke();
        }

        function craneSide() {
            context.beginPath();
            context.strokeStyle = "#22404b";
            context.lineWidth = 2;
            moveToTx(-30, 0); lineToTx(170, 0); lineToTx(170, 15); 
            context.stroke();
            context.lineWidth = 4;
            lineToTx(-30, 15); lineToTx(-30, 0);
            context.stroke();
            context.lineWidth = 1;
            for(var i = -30; i < 170; i+=5) {
                if(i % 2 == 0) {
                    lineToTx(i, 15);
                }
                else {
                    lineToTx(i, 0);
                }
            }
            context.stroke();
        }

        function draw3DPoints() {
            rotateXMatrix = [
                1, 0, 0,
                0, Math.cos(phi), (-1 * Math.sin(phi)),
                0, Math.sin(phi), Math.cos(phi)
            ];
            rotateYMatrix = [
                Math.cos(theta), 0,  Math.sin(theta),
                0, 1, 0,
                -Math.sin(theta), 0, Math.cos(theta)
            ];
            rotateZMatrix = [
                Math.cos(phi),  -Math.sin(phi), 0,
                Math.sin(phi), Math.cos(phi), 0,
                0, 0, 1,
            ];
            var Tblack_to_canvas = mat3.create();  
            mat3.multiply(stack[0],stack[0],Tblack_to_canvas);
            mat3.multiply(rotateYMatrix, stack[0], rotateYMatrix);
            mat3.multiply(stack[0], stack[0], rotateYMatrix);
            mat3.multiply(stack[0], stack[0], rotateZMatrix);
    
            craneSide();
            stack.unshift(mat3.clone(stack[0]));  
            stack.shift();  

        }

        function drawBackground() {
            // Create gradient
            const grd = context.createLinearGradient(0, 0, 0, 500);
            grd.addColorStop(0, "#487990");
            grd.addColorStop(0.5, "#7da1aa");
            grd.addColorStop(1, "#a2bdc0");

            // Fill with gradient
            context.fillStyle = grd;
            context.fillRect(0, 0, 500, 500);
        }
        function drawCrane() {
            context.beginPath();
            context.strokeStyle = "#22404b";
            context.lineWidth = 5;
            context.moveTo(243, 500);
            context.lineTo(243, 100);
            context.lineTo(257, 100);
            context.lineTo(257, 500);
            context.stroke();

            context.lineWidth = 1;
            for(var i = 0; i < 80; i++) {
                var vertical = 500 - (5 * i); 
                if(i%2 == 0) {
                    context.lineTo(243, vertical);
                }
                else {
                    context.lineTo(257, vertical);
                }
            }
            context.stroke();
            for(var i = 0; i < 80; i++) {
                var vertical = 100 + (5 * i); 
                if(i%2 == 0) {
                    context.lineTo(257, vertical);
                }
                else {
                    context.lineTo(243, vertical);
                }
            }
            context.stroke();
        }
        function ironBar() {
            context.beginPath();
            context.strokeStyle = "#ad5a4c";
            context.fillStyle = "#ad5a4c";
            moveToTx(-20,0);
            lineToTx(20,0);
            lineToTx(20, 10);
            lineToTx(-20, 10);
            lineToTx(-20,0);
            context.fill();
            context.stroke();
        }
        function drawBuildings() {
            context.scale(4, 4);
            //context.translate(20, 30);
            // #layer1
	
// #rect7
	context.beginPath();
	context.fillStyle = 'rgb(186, 175, 154)';
	context.lineWidth = 0.175948;
	context.rect(53.543270, 71.678894, 15.544821, 27.059502);
	context.fill();
	
// #rect5
	context.beginPath();
	context.fillStyle = 'rgb(186, 175, 154)';
	context.lineWidth = 0.175948;
	context.rect(90.678123, 49.800999, 22.453630, 45.195126);
	context.fill();
	
// #rect1
	context.beginPath();
	context.fillStyle = 'rgb(184, 173, 171)';
	context.lineWidth = 0.175948;
	context.rect(51.528202, 85.784378, 68.800224, 47.498062);
	context.fill();
	
// #rect3
	context.beginPath();
	context.fillStyle = 'rgb(254, 238, 224)';
	context.lineWidth = 0.179124;
	context.rect(-23.317230, 69.722870, 61.315681, 63.847439);
	context.fill();
	
// #rect2
	context.beginPath();
	context.fillStyle = 'rgb(220, 192, 158)';
	context.lineWidth = 0.175948;
	context.rect(15.832687, 55.846207, 39.725651, 77.148369);
	context.fill();
	
// #rect10
	context.beginPath();
	context.fillStyle = 'rgb(173, 90, 76)';
	context.lineWidth = 0.175948;
	context.rect(93.268921, 91.253853, 10.938948, 44.043655);
	context.fill();
	
// #rect40
	context.beginPath();
	context.fillStyle = 'rgb(105, 130, 131)';
	context.lineWidth = 0.175948;
	context.rect(95.239029, 94.217155, 7.357522, 3.270010);
	context.fill();
	
// #rect39
	context.beginPath();
	context.fillStyle = 'rgb(105, 130, 131)';
	context.lineWidth = 0.175948;
	context.rect(95.443405, 99.735298, 7.357522, 3.270010);
	context.fill();
	
// #rect4
	context.beginPath();
	context.fillStyle = 'rgb(206, 179, 170)';
	context.lineWidth = 0.176259;
	context.rect(101.988430, 80.027031, 58.065655, 53.831139);
	context.fill();
	
// #rect8
	context.beginPath();
	context.fillStyle = 'rgb(173, 90, 76)';
	context.lineWidth = 0.175948;
	context.rect(60.452080, 91.253853, 10.938948, 44.043655);
	context.fill();
	
// #rect9
	context.beginPath();
	context.fillStyle = 'rgb(173, 90, 76)';
	context.lineWidth = 0.175948;
	context.rect(76.572632, 91.253853, 10.938948, 44.043655);
	context.fill();
	
// #rect11
	context.beginPath();
	context.fillStyle = 'rgb(190, 159, 133)';
	context.lineWidth = 0.175948;
	context.rect(2.015069, 108.525880, 111.980280, 29.938173);
	context.fill();
	
// #rect13
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(17.272022, 129.540180, 6.333075, 10.651081);
	context.fill();
	
// #rect14
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(27.059502, 129.540180, 6.333075, 10.651081);
	context.fill();
	
// #rect15
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(37.134850, 129.252300, 6.333075, 10.651081);
	context.fill();
	
// #rect48
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(13.830331, 72.728455, 2.384540, 7.630528);
	context.fill();
	
// #rect50
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(-0.953816, 81.392288, 2.384540, 7.630528);
	context.fill();
	
// #rect51
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(2.622994, 81.471771, 2.384540, 7.630528);
	context.fill();
	
// #rect52
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(6.358773, 81.471771, 2.384540, 7.630528);
	context.fill();
	
// #rect53
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(9.935583, 81.551254, 2.384540, 7.630528);
	context.fill();
	
// #rect54
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(13.671362, 81.551254, 2.384540, 7.630528);
	context.fill();
	
// #rect56
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(-1.033300, 90.533020, 2.384540, 7.630528);
	context.fill();
	
// #rect57
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(2.543509, 90.612503, 2.384540, 7.630528);
	context.fill();
	
// #rect58
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(6.279288, 90.612503, 2.384540, 7.630528);
	context.fill();
	
// #rect59
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(9.856098, 90.691986, 2.384540, 7.630528);
	context.fill();
	
// #rect60
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(13.591877, 90.691986, 2.384540, 7.630528);
	context.fill();
	
// #rect62
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(-1.033300, 99.912209, 2.384540, 7.630528);
	context.fill();
	
// #rect63
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(2.543509, 99.991692, 2.384540, 7.630528);
	context.fill();
	
// #rect64
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(6.279288, 99.991692, 2.384540, 7.630528);
	context.fill();
	
// #rect65
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(9.856098, 100.071170, 2.384540, 7.630528);
	context.fill();
	
// #rect66
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(13.591877, 100.071170, 2.384540, 7.630528);
	context.fill();
	
// #rect16
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(46.346596, 129.252300, 6.333075, 10.651081);
	context.fill();
	
// #rect17
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(72.254631, 129.252300, 6.333075, 10.651081);
	context.fill();
	
// #rect18
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(80.602776, 129.252300, 6.333075, 10.651081);
	context.fill();
	
// #path13
	context.beginPath();
	context.fillStyle = 'rgb(176, 124, 88)';
	context.lineWidth = 0.167144;
	context.moveTo(1.151596, 106.798740);
	context.lineTo(-6.620814, 123.494790);
	context.lineTo(121.767760, 123.494790);
	context.lineTo(113.131750, 106.510870);
	context.closePath();
	context.fill();
	
// #rect19
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(89.238785, 129.252300, 6.333075, 10.651081);
	context.fill();
	
// #rect20
	context.beginPath();
	context.fillStyle = 'rgb(230, 213, 194)';
	context.lineWidth = 0.175948;
	context.rect(21.302162, 62.467148, 6.908809, 4.030138);
	context.fill();
	
// #rect21
	context.beginPath();
	context.fillStyle = 'rgb(230, 213, 194)';
	context.lineWidth = 0.175948;
	context.rect(28.210972, 66.497284, 0.000000, 0.000000);
	context.fill();
	
// #rect22
	context.beginPath();
	context.fillStyle = 'rgb(230, 213, 194)';
	context.lineWidth = 0.175948;
	context.rect(30.226040, 68.800224, 6.908809, 4.030138);
	context.fill();
	
// #rect23
	context.beginPath();
	context.fillStyle = 'rgb(230, 213, 194)';
	context.lineWidth = 0.175948;
	context.rect(40.589252, 68.899406, 6.908809, 4.030138);
	context.fill();
	
// #rect24
	context.beginPath();
	context.fillStyle = 'rgb(230, 213, 194)';
	context.lineWidth = 0.175948;
	context.rect(40.589252, 74.736580, 6.908809, 4.030138);
	context.fill();
	
// #rect25
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(30.376032, 80.493919, 6.908809, 4.030138);
	context.fill();
	
// #rect26
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(30.286524, 74.746246, 6.908809, 4.030138);
	context.fill();
	
// #rect27
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(31.735535, 75.808212, 1.439335, 0.287867);
	context.fill();
	
// #rect28
	context.beginPath();
	context.fillStyle = 'rgb(230, 213, 194)';
	context.lineWidth = 0.175948;
	context.rect(21.302162, 80.133751, 6.908809, 4.030138);
	context.fill();
	
// #rect29
	context.beginPath();
	context.fillStyle = 'rgb(230, 213, 194)';
	context.lineWidth = 0.175948;
	context.rect(30.226040, 86.466827, 6.908809, 4.030138);
	context.fill();
	
// #rect30
	context.beginPath();
	context.fillStyle = 'rgb(230, 213, 194)';
	context.lineWidth = 0.175948;
	context.rect(40.589252, 86.566010, 6.908809, 4.030138);
	context.fill();
	
// #rect31
	context.beginPath();
	context.fillStyle = 'rgb(230, 213, 194)';
	context.lineWidth = 0.175948;
	context.rect(40.589252, 92.403183, 6.908809, 4.030138);
	context.fill();
	
// #rect32
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(30.376032, 98.160522, 6.908809, 4.030138);
	context.fill();
	
// #rect33
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(30.286524, 92.412849, 6.908809, 4.030138);
	context.fill();
	
// #rect34
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(40.721340, 80.493919, 6.908809, 4.030138);
	context.fill();
	
// #rect35
	context.beginPath();
	context.fillStyle = 'rgb(35, 66, 80)';
	context.lineWidth = 0.175948;
	context.rect(40.880497, 62.349838, 6.908809, 4.030138);
	context.fill();
	
// #rect36
	context.beginPath();
	context.fillStyle = 'rgb(230, 213, 194)';
	context.lineWidth = 0.175948;
	context.rect(21.490221, 97.973732, 6.908809, 4.030138);
	context.fill();
	
// #rect37
	context.beginPath();
	context.fillStyle = 'rgb(105, 130, 131)';
	context.lineWidth = 0.175948;
	context.rect(62.334557, 94.012779, 7.357522, 3.270010);
	context.fill();
	
// #rect38
	context.beginPath();
	context.fillStyle = 'rgb(105, 130, 131)';
	context.lineWidth = 0.175948;
	context.rect(78.480232, 94.217155, 7.357522, 3.270010);
	context.fill();
	
// #rect42
	context.beginPath();
	context.fillStyle = 'rgb(105, 130, 131)';
	context.lineWidth = 0.175948;
	context.rect(78.684601, 99.530922, 7.357522, 3.270010);
	context.fill();
	
// #rect43
	context.beginPath();
	context.fillStyle = 'rgb(105, 130, 131)';
	context.lineWidth = 0.175948;
	context.rect(62.334553, 99.530922, 7.357522, 3.270010);
	context.fill();
	
// #rect44
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(-0.794847, 72.569489, 2.384540, 7.630528);
	context.fill();
	
// #rect45
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(2.781963, 72.648972, 2.384540, 7.630528);
	context.fill();
	
// #rect46
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(6.517742, 72.648972, 2.384540, 7.630528);
	context.fill();
	
// #rect47
	context.beginPath();
	context.fillStyle = 'rgb(190, 195, 189)';
	context.lineWidth = 0.175948;
	context.rect(10.094552, 72.728455, 2.384540, 7.630528);
	context.fill();
	
// #rect67
	context.beginPath();
	context.fillStyle = 'rgb(72, 121, 143)';
	context.lineWidth = 0.175948;
	context.rect(106.436400, 84.523033, 10.174067, 4.500069);
	context.fill();
	
// #rect68
	context.beginPath();
	context.fillStyle = 'rgb(72, 121, 143)';
	context.lineWidth = 0.175948;
	context.rect(119.349640, 84.327377, 10.174067, 4.500069);
	context.fill();
	
// #rect69
	context.beginPath();
	context.fillStyle = 'rgb(72, 121, 143)';
	context.lineWidth = 0.175948;
	context.rect(106.436400, 84.523033, 10.174067, 4.500069);
	context.fill();
	
// #rect70
	context.beginPath();
	context.fillStyle = 'rgb(72, 121, 143)';
	context.lineWidth = 0.175948;
	context.rect(119.349640, 84.327377, 10.174067, 4.500069);
	context.fill();
	
// #rect71
	context.beginPath();
	context.fillStyle = 'rgb(72, 121, 143)';
	context.lineWidth = 0.175948;
	context.rect(106.436400, 90.979652, 10.174067, 4.500069);
	context.fill();
	
// #rect72
	context.beginPath();
	context.fillStyle = 'rgb(72, 121, 143)';
	context.lineWidth = 0.175948;
	context.rect(119.349640, 90.783997, 10.174067, 4.500069);
	context.fill();
	
// #rect73
	context.beginPath();
	context.fillStyle = 'rgb(72, 121, 143)';
	context.lineWidth = 0.175948;
	context.rect(106.436400, 97.631927, 10.174067, 4.500069);
	context.fill();
	
// #rect74
	context.beginPath();
	context.fillStyle = 'rgb(72, 121, 143)';
	context.lineWidth = 0.175948;
	context.rect(119.349640, 97.436272, 10.174067, 4.500069);
	context.fill();
	
// #rect75
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(93.039017, 52.414230, 3.679509, 5.106257);
	context.fill();
	
// #rect76
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(93.039017, 52.414230, 3.679509, 5.106257);
	context.fill();
	
// #rect77
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(97.619629, 52.414230, 3.679509, 5.106257);
	context.fill();
	
// #rect78
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(102.200240, 52.339138, 3.679509, 5.106257);
	context.fill();
	
// #rect79
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(106.780850, 52.339138, 3.679509, 5.106257);
	context.fill();
	
// #rect80
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(93.114105, 58.646870, 3.679509, 5.106257);
	context.fill();
	
// #rect81
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(97.694717, 58.646870, 3.679509, 5.106257);
	context.fill();
	
// #rect82
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(102.275330, 58.571777, 3.679509, 5.106257);
	context.fill();
	
// #rect83
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(106.855940, 58.571777, 3.679509, 5.106257);
	context.fill();
	
// #rect84
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(93.114105, 64.879509, 3.679509, 5.106257);
	context.fill();
	
// #rect85
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(97.694717, 64.879509, 3.679509, 5.106257);
	context.fill();
	
// #rect86
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(102.275330, 64.804413, 3.679509, 5.106257);
	context.fill();
	
// #rect87
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(106.855940, 64.804413, 3.679509, 5.106257);
	context.fill();
	
// #rect88
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(93.189194, 71.112144, 3.679509, 5.106257);
	context.fill();
	
// #rect89
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(97.769806, 71.112144, 3.679509, 5.106257);
	context.fill();
	
// #rect90
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(102.350420, 71.037056, 3.679509, 5.106257);
	context.fill();
	
// #rect91
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(106.931030, 71.037056, 3.679509, 5.106257);
	context.fill();
	
// #rect92
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(93.264282, 77.419876, 3.679509, 5.106257);
	context.fill();
	
// #rect93
	context.beginPath();
	context.fillStyle = 'rgb(159, 158, 136)';
	context.lineWidth = 0.175948;
	context.rect(97.844894, 77.419876, 3.679509, 5.106257);
	context.fill();
	
// #path93
	context.beginPath();
	context.fillStyle = 'rgb(220, 192, 158)';
	context.lineWidth = 0.175948;
	context.moveTo(15.839695, 55.841637);
	context.bezierCurveTo(15.839695, 55.841637, 24.609696, 31.679390, 55.483677, 56.020615);
	context.closePath();
	context.fill();
	
// #rect94
	context.beginPath();
	context.fillStyle = 'rgb(184, 173, 171)';
	context.lineWidth = 0.175948;
	context.rect(15.075021, 55.428272, 40.996700, 1.838417);
	context.fill();

    context.scale(0.25, 0.25);
        }
        drawBackground();
        drawCrane();
        drawBuildings();
        context.translate(canvas.width/2, 130);


        // make sure you understand these 
        draw3DPoints();   

        var Tblue_to_canvas = mat3.create();
        mat3.fromTranslation(Tblue_to_canvas, [150, 15]);
        mat3.rotate(Tblue_to_canvas,Tblue_to_canvas,ropephi);
        angle1 = dx[0]/700 * Math.cos(4.43 * time/1000);
        mat3.rotate(Tblue_to_canvas,Tblue_to_canvas,angle1);
        mat3.multiply(stack[0],stack[0],Tblue_to_canvas);
        rope();

        for(var i = 0; i < dx.length-1; i++) {
            stack.unshift(mat3.clone(stack[0])); // "save" (note: you *need* to clone)
            var Tgreen_to_blue = mat3.create();
            mat3.fromTranslation(Tgreen_to_blue,[0,10]);
            angle = dx[i]/700 * Math.cos(4.43 * time/1000);
            mat3.rotate(Tgreen_to_blue,Tgreen_to_blue,angle);
            mat3.multiply(stack[0],stack[0],Tgreen_to_blue);
            rope();
        }

        stack.unshift(mat3.clone(stack[0]));
        ironBar();

        var Tblue_to_canvas = mat3.create();
        mat3.scale(Tblue_to_canvas,Tblue_to_canvas,[1,-1]); // Flip the Y-axis
		for(var i = 3; i < 9; i++) {
		phi = Math.PI /i;
		rotateXMatrix = [
			1, 0, 0,
			0, Math.cos(phi), (-1 * Math.sin(phi)),
			0, Math.sin(phi), Math.cos(phi)
		];
		var ph = 5
		rotateZMatrix = [
			Math.cos(ph),  -Math.sin(ph), 0,
			Math.sin(ph), Math.cos(ph), 0,
			0, 0, 1,
		];
		mat3.multiply(rotateXMatrix, Tblue_to_canvas, rotateXMatrix);
		mat3.multiply(Tblue_to_canvas, Tblue_to_canvas, rotateXMatrix);
		mat3.multiply(Tblue_to_canvas, Tblue_to_canvas, rotateZMatrix);
    
        var Tgreen_to_blue = mat3.create();
        mat3.fromTranslation(Tgreen_to_blue,Cspiral(tParam + 0.02 * i));
		var tangent = Cspiral_tangent(tParam + 0.02 * i);
		var angle = Math.atan2(tangent[1],tangent[0]);
		mat3.rotate(Tgreen_to_blue,Tgreen_to_blue,angle);
		var Tgreen_to_canvas = mat3.create();
		mat3.multiply(Tgreen_to_canvas, Tblue_to_canvas, Tgreen_to_blue);
        mat3.multiply(Tgreen_to_canvas, Tblue_to_canvas, Tgreen_to_blue);
        
		drawBird(Tgreen_to_canvas);
	}

	var Tblue_to_canvas = mat3.create();
		mat3.fromTranslation(Tblue_to_canvas,[-150,-20]);
		mat3.scale(Tblue_to_canvas,Tblue_to_canvas,[-0.9,-0.5]); // Flip the Y-axis
		//drawTrajectory(0.0,2.0,100,Cspiral,Tblue_to_canvas,"brown");
	for(var i = 0; i < 10; i++) {
		var Tgreen_to_blue = mat3.create();
		mat3.fromTranslation(Tgreen_to_blue,Cspiral(wParam + i * 0.04));
		var tangent = Cspiral_tangent(wParam);
		var angle = Math.atan2(tangent[1],tangent[0]);
		mat3.rotate(Tgreen_to_blue,Tgreen_to_blue,angle);
		var Tgreen_to_canvas = mat3.create();
		mat3.multiply(Tgreen_to_canvas, Tblue_to_canvas, Tgreen_to_blue);
		//drawAxes("green",Tgreen_to_canvas); // Un-comment this to view axes

		drawWind(Tgreen_to_canvas, i);
	}

	var Tblue_to_canvas = mat3.create();
		mat3.fromTranslation(Tblue_to_canvas,[40,-50]);
		mat3.scale(Tblue_to_canvas,Tblue_to_canvas,[-0.9,-0.5]); // Flip the Y-axis
		//drawTrajectory(0.0,2.0,100,Cspiral,Tblue_to_canvas,"brown");
	for(var i = 0; i < 10; i++) {
		var Tgreen_to_blue = mat3.create();
		mat3.fromTranslation(Tgreen_to_blue,Cspiral(wParam + i * 0.04 -3));
		var tangent = Cspiral_tangent(wParam);
		var angle = Math.atan2(tangent[1],tangent[0]);
		mat3.rotate(Tgreen_to_blue,Tgreen_to_blue,angle);
		var Tgreen_to_canvas = mat3.create();
		mat3.multiply(Tgreen_to_canvas, Tblue_to_canvas, Tgreen_to_blue);
		//drawAxes("green",Tgreen_to_canvas); // Un-comment this to view axes

		drawWind(Tgreen_to_canvas, i);
	}

	var Tblue_to_canvas = mat3.create();
		mat3.fromTranslation(Tblue_to_canvas,[0,100]);// Flip the Y-axis
		for(var i = 0; i < 10; i++) {
			var Tgreen_to_blue = mat3.create();
			mat3.fromTranslation(Tgreen_to_blue,Cspiral(wParam + i * 0.02 +5));
			var tangent = Cspiral_tangent(wParam);
			var angle = Math.atan2(tangent[1],tangent[0]);
			mat3.rotate(Tgreen_to_blue,Tgreen_to_blue,angle);
			var Tgreen_to_canvas = mat3.create();
			mat3.multiply(Tgreen_to_canvas, Tblue_to_canvas, Tgreen_to_blue);
			drawWind(Tgreen_to_canvas, i);
		}
    }
    slider1.addEventListener("input",draw());
    slider2.addEventListener("input",draw());
    draw();
}
window.onload = setup;

