function setup() {
	var canvas = document.getElementById('myCanvas');
	var context = canvas.getContext('2d');
	document.body.style.background = "#051427";
	var start = Date.now();

	var mercuryX = 0;
	var mercuryY = -200;
	var mercurydX = 0;
	var mercurydY = 1;
	function animateMercury(Tbase_to_canvas) {
		if (mercuryY > -110) {
			mercurydY *= -1;
		}
		mercuryX += mercurydX;
		mercurydY += .17;
		mercuryY += mercurydY;
		drawMercury(mercuryX, mercuryY, Tbase_to_canvas);
	}

	function drawMercury(x, y, Tbase_to_canvas) {
		var Tmercury_to_base = glMatrix.mat3.create();
		glMatrix.mat3.fromTranslation(Tmercury_to_base, [x,y]);
		var Tmercury_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.multiply(Tmercury_to_canvas, Tbase_to_canvas, Tmercury_to_base);
		context.beginPath();
		context.fillStyle = "#8c8c94";
		arcTx(0, 0, 12, 0, 2 * Math.PI, Tmercury_to_canvas);
		context.fill();
	}

	var venusX = 0;
	var venusY = -220;
	var venusdX = 0;
	var venusdY = 1;
	function animateVenus(Tbase_to_canvas) {
		if (venusY > -110) {
			venusdY *= -1;
		}
		venusX += venusdX;
		venusdY += .16;
		venusY += venusdY;
		drawVenus(venusX, venusY, Tbase_to_canvas);
	}

	function drawVenus(x, y, Tbase_to_canvas) {
		var Tvenus_to_base = glMatrix.mat3.create();
		glMatrix.mat3.fromTranslation(Tvenus_to_base, [x,y]);
		var Tvenus_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.multiply(Tvenus_to_canvas, Tbase_to_canvas, Tvenus_to_base);
		context.beginPath();
		context.fillStyle = "#a57c1b";
		arcTx(0, 0, 16, 0, 2 * Math.PI, Tvenus_to_canvas);
		context.fill();
	}

	var moonX = 0;
	var moonY = -70;
	var moondX = 0;
	var moondY = 1;
	function animateMoon(Tearth_to_canvas) {
		if (moonY > -35) {
			moondY *= -1;
		}
		moonX += moondX;
		moondY += .09;
		moonY += moondY;
		drawMoon(moonX, moonY, Tearth_to_canvas);
	}

	function drawMoon(x, y, Tearth_to_canvas) {
		var Tmoon_to_earth = glMatrix.mat3.create();
		glMatrix.mat3.fromTranslation(Tmoon_to_earth, [x,y]);
		var Tmoon_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.multiply(Tmoon_to_canvas, Tearth_to_canvas, Tmoon_to_earth);

		context.beginPath();
		context.fillStyle = "#c9c9c9";
		arcTx(0, 0, 10, 0, 2 * Math.PI, Tmoon_to_canvas);
		context.fill();
		context.beginPath();
		context.fillStyle = "#91a3b0";
		arcTx(5, 1, 5, 0, 2 * Math.PI, Tmoon_to_canvas);
		arcTx(-3, -3, 4, 0, 2 * Math.PI, Tmoon_to_canvas);
		context.fill();
	}

	var earthX = 0;
	var earthY = -260;
	var earthdX = 0;
	var earthdY = 1;
	var earthRot = 0;
	function animateEarth(Tbase_to_canvas) {
		if (earthY > -128) {
			earthdY *= -1;
		}
		earthX += earthdX;
		earthdY += .15;
		earthY += earthdY;
		drawEarth(earthX, earthY, Tbase_to_canvas);
	}

	function drawEarth(x, y, Tbase_to_canvas) {
		var Tearth_to_base = glMatrix.mat3.create();
		glMatrix.mat3.fromTranslation(Tearth_to_base, [x,y]);
		earthRot += Math.PI / 32;
		glMatrix.mat3.rotate(Tearth_to_base, Tearth_to_base, earthRot % (2 * Math.PI));
		var Tearth_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.multiply(Tearth_to_canvas, Tbase_to_canvas, Tearth_to_base);

		context.beginPath();
		context.fillStyle = "#6b93d6";
		arcTx(0, 0, 25, 0, 2 * Math.PI, Tearth_to_canvas);
		context.fill(); 
		context.beginPath();
		context.fillStyle = "#9fc164";
		arcTx(-2, -10, 10, 0, 2 * Math.PI, Tearth_to_canvas);
		context.fill();

		/* Moon */
		animateMoon(Tearth_to_canvas);
	}

	var marsX = 0;
	var marsY = -300;
	var marsdX = 0;
	var marsdY = 1;
	var marsRot = 0;
	function animateMars(Tbase_to_canvas) {
		if (marsY > -115) {
			marsdY *= -1;
		}
		marsX += marsdX;
		marsdY += .13;
		marsY += marsdY;
		drawMars(marsX, marsY, Tbase_to_canvas);
	}

	function drawMars(x, y, Tbase_to_canvas) {
		var Tmars_to_base = glMatrix.mat3.create();
		glMatrix.mat3.fromTranslation(Tmars_to_base, [x,y]);
		marsRot += Math.PI / 32;
		glMatrix.mat3.rotate(Tmars_to_base, Tmars_to_base, marsRot % (2 * Math.PI));
		var Tmars_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.multiply(Tmars_to_canvas, Tbase_to_canvas, Tmars_to_base)

		context.beginPath();
		context.fillStyle = "#c1440e";
		arcTx(0, 0, 20, 0, 2 * Math.PI, Tmars_to_canvas);
		context.fill(); 
		context.beginPath();
		context.fillStyle = "#451804";
		arcTx(-2, -10, 10, 0, 2 * Math.PI, Tmars_to_canvas);
		context.fill();
	}

	var jupiterX = 0;
	var jupiterY = -470;
	var jupiterdX = 0;
	var jupiterdY = 1;
	var jupiterRot = 0;
	function animateJupiter(Tbase_to_canvas) {
		if (jupiterY > -160) {
			jupiterdY *= -1;
		}
		jupiterX += jupiterdX;
		jupiterdY += .09;
		jupiterY += jupiterdY;
		drawJupiter(jupiterX, jupiterY, Tbase_to_canvas);
	}

	function drawJupiter(x, y, Tbase_to_canvas) {
		var Tjupiter_to_base = glMatrix.mat3.create();
		glMatrix.mat3.fromTranslation(Tjupiter_to_base, [x,y]);
		jupiterRot += Math.PI / 256;
		var Tjupiter_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.multiply(Tjupiter_to_canvas, Tbase_to_canvas, Tjupiter_to_base);
		var Trot_jupiter_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.rotate(Tjupiter_to_base, Tjupiter_to_base, jupiterRot % (2 * Math.PI)); 
		glMatrix.mat3.multiply(Trot_jupiter_to_canvas, Tbase_to_canvas, Tjupiter_to_base);

		context.beginPath();
		context.fillStyle = "#e3dccb";
		arcTx(0, 0, 60, 0, 2 * Math.PI, Tjupiter_to_canvas);
		context.fill();

		context.beginPath();
		context.fillStyle = "#ebf3f6";
		ellipseTx(20, 0, 50, 5, jupiterRot % (2 * Math.PI), 0, 2 * Math.PI, Tjupiter_to_canvas);
		context.fill();
		context.beginPath();
		context.fillStyle = "#D39C7E";
		ellipseTx(-7, 0, 60, 5, jupiterRot % (2 * Math.PI), 0, 2 * Math.PI, Tjupiter_to_canvas);
		context.fill();
		context.beginPath();
		context.fillStyle = "#ebf3f6";
		ellipseTx(-20, 0, 50, 5, jupiterRot % (2 * Math.PI), 0, 2 * Math.PI, Tjupiter_to_canvas);
		context.fill();
		context.beginPath();
		context.fillStyle = "#c99039";
		ellipseTx(20, -10, 20, 10, jupiterRot % (2 * Math.PI), 0, 2 * Math.PI, Tjupiter_to_canvas);
		context.fill();

		/* 4 Moons */
		var Trot_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.rotate(Trot_to_canvas, Trot_jupiter_to_canvas, Math.PI / 4);
		animateJMoon(Trot_to_canvas);
		glMatrix.mat3.rotate(Trot_to_canvas, Trot_jupiter_to_canvas, Math.PI / 4 + Math.PI / 3);
		animateJMoon(Trot_to_canvas);
		glMatrix.mat3.rotate(Trot_to_canvas, Trot_jupiter_to_canvas, Math.PI + Math.PI / 6);
		animateJMoon(Trot_to_canvas);
		glMatrix.mat3.rotate(Trot_to_canvas, Trot_jupiter_to_canvas, -Math.PI / 3);
		animateJMoon(Trot_to_canvas);
	}

	var jMoonX = 0;
	var jMoonY = -120;
	var jMoondX = 0;
	var jMoondY = 1;
	function animateJMoon(Tjupiter_to_canvas) {
		if (jMoonY > -65) {
			jMoondY *= -1;
		}
		jMoonX += jMoondX;
		jMoondY += .02;
		jMoonY += jMoondY;
		drawJMoon(jMoonX, jMoonY, Tjupiter_to_canvas);
	}

	function drawJMoon(x, y, Tjupiter_to_canvas) {
		var Tmoon_to_jupiter = glMatrix.mat3.create();
		glMatrix.mat3.fromTranslation(Tmoon_to_jupiter, [x,y]);
		var Tmoon_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.multiply(Tmoon_to_canvas, Tjupiter_to_canvas, Tmoon_to_jupiter);

		context.beginPath();
		context.fillStyle = "#c9c9c9";
		arcTx(0, 0, 15, 0, 2 * Math.PI, Tmoon_to_canvas);
		context.fill();
		context.beginPath();
		context.fillStyle = "#91a3b0";
		arcTx(5, 1, 5, 0, 2 * Math.PI, Tmoon_to_canvas);
		arcTx(-3, -3, 4, 0, 2 * Math.PI, Tmoon_to_canvas);
		context.fill();
	}

	var saturnX = 0;
	var saturnY = -550;
	var saturndX = 0;
	var saturndY = 1;
	var saturnRot = 0;
	function animateSaturn(Tbase_to_canvas) {
		if (saturnY > -130) {
			saturndY *= -1;
		}
		saturnX += saturndX;
		saturndY += .09;
		saturnY += saturndY;
		drawSaturn(saturnX, saturnY, Tbase_to_canvas);
	}

	function drawSaturn(x, y, Tbase_to_canvas) {
		var Tsaturn_to_base = glMatrix.mat3.create();
		glMatrix.mat3.fromTranslation(Tsaturn_to_base, [x,y]);
		saturnRot += Math.PI / 256;
		glMatrix.mat3.rotate(Tsaturn_to_base, Tsaturn_to_base, saturnRot % (2 * Math.PI));
		var Tsaturn_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.multiply(Tsaturn_to_canvas, Tbase_to_canvas, Tsaturn_to_base);

		context.beginPath();
		context.fillStyle = "#e3e0c0";
		arcTx(0, 0, 40, 0, 2 * Math.PI, Tsaturn_to_canvas);
		context.fill(); 
		context.beginPath();
		context.fillStyle = "#ceb8b8";
		ellipseTx(0, 0, 70, 5, -saturnRot % (2 * Math.PI), 0, 2 * Math.PI, Tsaturn_to_canvas);
		context.fill();

		animateTitan(Tsaturn_to_canvas);
	}

	var titanX = 0;
	var titanY = -120;
	var titandX = 0;
	var titandY = 1;
	function animateTitan(Tsaturn_to_canvas) {
		if (titanY > -60) {
			titandY *= -1;
		}
		titanX += titandX;
		titandY += .1;
		titanY += titandY;
		drawTitan(titanX, titanY, Tsaturn_to_canvas);
	}

	function drawTitan(x, y, Tsaturn_to_canvas) {
		var Tmoon_to_saturn = glMatrix.mat3.create();
		glMatrix.mat3.fromTranslation(Tmoon_to_saturn, [x,y]);
		var Tmoon_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.multiply(Tmoon_to_canvas, Tsaturn_to_canvas, Tmoon_to_saturn);

		context.beginPath();
		context.fillStyle = "#dc8407";
		arcTx(0, 0, 17, 0, 2 * Math.PI, Tmoon_to_canvas);
		context.fill();
		context.beginPath();
	}

	var uranusX = 0;
	var uranusY = -600;
	var uranusdX = 0;
	var uranusdY = 1;
	function animateUranus(Tbase_to_canvas) {
		if (uranusY > -130) {
			uranusdY *= -1;
		}
		uranusX += uranusdX;
		uranusdY += .08;
		uranusY += uranusdY;
		drawUranus(uranusX, uranusY, Tbase_to_canvas);
	}

	function drawUranus(x, y, Tbase_to_canvas) {
		var Tplanet_to_base = glMatrix.mat3.create();
		glMatrix.mat3.fromTranslation(Tplanet_to_base, [x,y]);
		var Tplanet_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.multiply(Tplanet_to_canvas, Tbase_to_canvas, Tplanet_to_base);

		context.beginPath();
		context.fillStyle = "#d1e7e7";
		arcTx(0, 0, 35, 0, 2 * Math.PI, Tplanet_to_canvas);
		context.fill();
	}

	var neptuneX = 0;
	var neptuneY = -550;
	var neptunedX = 0;
	var neptunedY = 1;
	function animateNeptune(Tbase_to_canvas) {
		if (neptuneY > -135) {
			neptunedY *= -1;
		}
		neptuneX += neptunedX;
		neptunedY += .08;
		neptuneY += neptunedY;
		drawNeptune(neptuneX, neptuneY, Tbase_to_canvas);
	}

	function drawNeptune(x, y, Tbase_to_canvas) {
		var Tplanet_to_base = glMatrix.mat3.create();
		glMatrix.mat3.fromTranslation(Tplanet_to_base, [x,y]);
		var Tplanet_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.multiply(Tplanet_to_canvas, Tbase_to_canvas, Tplanet_to_base);

		context.beginPath();
		context.fillStyle = "#5b5ddf";
		arcTx(0, 0, 40, 0, 2 * Math.PI, Tplanet_to_canvas);
		context.fill(); 
	}

	var tritonX = 0;
	var tritonY = -120;
	var tritondX = 0;
	var tritondY = 1;
	function animateTriton(Tneptune_to_canvas) {
		if (tritonY > -57) {
			tritondY *= -1;
		}
		tritonX += tritondX;
		tritondY += .1;
		tritonY += tritondY;
		drawTriton(tritonX, tritonY, Tneptune_to_canvas);
	}

	function drawTriton(x, y, Tneptune_to_canvas) {
		var Tmoon_to_nepturn = glMatrix.mat3.create();
		glMatrix.mat3.fromTranslation(Tmoon_to_neptune, [x,y]);
		var Tmoon_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.multiply(Tmoon_to_canvas, Tneptune_to_canvas, Tmoon_to_neptune);

		context.beginPath();
		context.fillStyle = "#b3ded9";
		context.arc(0, 0, 15, 0, 2 * Math.PI);
		context.fill();
		context.beginPath();
	}

	var sunRot = 0;
	function drawSun(Tsun_to_canvas) {
		context.beginPath();
		context.fillStyle = "#FDB813";
		sunRot += Math.PI / 256;

		arcTx(0, 0, 100, 0, 2 * Math.PI, Tsun_to_canvas);

		context.fill(); 
	}

	function arcTx(x, y, radius, start_angle, end_angle, Tx) {
		var res = glMatrix.vec2.create();
		glMatrix.vec2.transformMat3(res, [x,y], Tx);
		// hard code 0.5
		context.arc(res[0], res[1], radius * 0.5, start_angle, end_angle);
	}

	function ellipseTx(x, y, radiusX, radiusY, rotation, start_angle, end_angle, Tx) {
		var res = glMatrix.vec2.create();
		glMatrix.vec2.transformMat3(res, [x,y], Tx);
		// hard code 0.5
		context.ellipse(res[0], res[1], radiusX * 0.5, radiusY * 0.5, rotation, start_angle, end_angle);
	}

	function animate() {
		/* Sun */
		context.clearRect(-canvas.width, -canvas.height, 2 * canvas.width, 2 * canvas.height);
		var Trot_sun_to_canvas = glMatrix.mat3.create(); // create rotational snapshot of sun
		glMatrix.mat3.rotate(Trot_sun_to_canvas, Tsun_to_canvas, sunRot % (2 * Math.PI));
		drawSun(Trot_sun_to_canvas);

		/* Mercury */
		var Tmercury_base_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.rotate(Tmercury_base_to_canvas, Trot_sun_to_canvas, 2 * Math.PI / 3);
		animateMercury(Tmercury_base_to_canvas);

		/* Venus */
		var Tvenus_base_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.rotate(Tvenus_base_to_canvas, Trot_sun_to_canvas, Math.PI / 3);
		animateVenus(Tvenus_base_to_canvas);

		/* Earth and Moon */
		var Tearth_base_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.rotate(Tearth_base_to_canvas, Trot_sun_to_canvas, 0);
		animateEarth(Tearth_base_to_canvas);

		/* Mars */
		var Tmars_base_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.rotate(Tmars_base_to_canvas, Trot_sun_to_canvas, Math.PI);
		animateMars(Tmars_base_to_canvas);

		/* Jupiter and its moons */
		var Tjupiter_base_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.rotate(Tjupiter_base_to_canvas, Trot_sun_to_canvas, 3 * Math.PI / 2);
		animateJupiter(Tjupiter_base_to_canvas);
		
		/* Saturn and Titan */
		var Tsaturn_base_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.rotate(Tsaturn_base_to_canvas, Trot_sun_to_canvas, 5 * Math.PI / 4);
		animateSaturn(Tsaturn_base_to_canvas);

		/* Uranus */
		var Turanus_base_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.rotate(Turanus_base_to_canvas, Trot_sun_to_canvas, 5 * Math.PI / 6);
		animateUranus(Turanus_base_to_canvas);

		/* Neptune and Triton */
		var Tneptune_base_to_canvas = glMatrix.mat3.create();
		glMatrix.mat3.rotate(Tneptune_base_to_canvas, Trot_sun_to_canvas, 4 * Math.PI / 9);
		animateNeptune(Tneptune_base_to_canvas);

		// slow to stop
		if ((Date.now() - start) >= 12500) {
			mercurydY *= .92;
			venusdY *= .95;
			moondY *= .97;
			earthdY *= .95;
			marsdY *= .97;
			jupiterdY *= .98;
			saturndY *= .98;
			uranusdY *= .98;
			neptunedY *= .98;
			if ((Date.now() - start) >= 16000) {
				clearInterval(intervalID);
			}
		}
	}

	/* Move axis to middle */
	var Tsun_to_canvas = glMatrix.mat3.create();
	glMatrix.mat3.fromTranslation(Tsun_to_canvas,[500, 400]);
	glMatrix.mat3.scale(Tsun_to_canvas, Tsun_to_canvas, [0.5, 0.5]);
	const intervalID = setInterval(animate, 20);
}

window.onload = setup;
