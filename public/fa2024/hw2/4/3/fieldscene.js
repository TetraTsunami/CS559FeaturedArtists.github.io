function setup() {
  var canvas = document.getElementById("canvas");
  var slider1 = document.getElementById("slider1");
  var cbox1 = document.getElementById("cbox");
  slider1.value = 1;
  cbox1.checked = false;
  let wm_theta = 0;
  let pan_x = 0;
  let pan_dx = 0.1 * slider1.value;
  let sheep_wobble = 1;

  function updatePanDx() {
    pan_dx = 0.1 * slider1.value;
  }

  function draw() {
    cxt = canvas.getContext("2d");
    cxt.reset();
    const time = new Date();

    function sky() {
      // Sky
      const sky_grad = cxt.createLinearGradient(250, 0, 250, 200);
      sky_grad.addColorStop(0, "#3af");
      sky_grad.addColorStop(1, "#def");
      cxt.fillStyle = sky_grad;
      cxt.fillRect(0, 0, 850, 325);
    }

    function water() {
      cxt.fillStyle = '#258';
      cxt.fillRect(0, 270, 850, 100);
    }

    function hills() {
      cxt.translate(0, 300);
      cxt.rotate(Math.PI);
      cxt.save()

      cxt.translate(pan_x * 0.1, 0);
      cxt.fillStyle = "#485";
      cxt.beginPath();
      cxt.moveTo(0, 0);
      cxt.lineTo(-1000, 0);
      cxt.lineTo(-1000, 100);
      cxt.lineTo(-500, 120);
      cxt.lineTo(-450, 110);
      cxt.lineTo(-350, 130);
      cxt.lineTo(0, 115);
      cxt.closePath();
      cxt.fill();

      cxt.translate(pan_x * 0.3, 0);
      cxt.fillStyle = "#597";
      cxt.beginPath();
      cxt.moveTo(0, 0);
      cxt.lineTo(-1000, 0);
      cxt.lineTo(-1000, 100);
      cxt.lineTo(-500, 110);
      cxt.lineTo(-400, 100);
      cxt.lineTo(-200, 120);
      cxt.lineTo(-150, 110);
      cxt.lineTo(0, 105);
      cxt.closePath();
      cxt.fill();

      cxt.restore();
      cxt.translate(pan_x * 0.5, 0);
      cxt.fillStyle = "#596";
      cxt.beginPath();
      cxt.moveTo(0, 0);
      cxt.lineTo(-1000, 0);
      cxt.lineTo(-1000, 105);
      cxt.lineTo(-750, 100);
      cxt.lineTo(-600, 110);
      cxt.lineTo(-550, 115);
      cxt.lineTo(-300, 100);
      cxt.lineTo(-100, 110);
      cxt.lineTo(0, 90);
      cxt.closePath();
      cxt.fill();

      cxt.restore();
      cxt.translate(pan_x * 0.7, 0);
      cxt.fillStyle = "#6a7";
      cxt.beginPath();
      cxt.moveTo(0, 0);
      cxt.lineTo(-1000, 0);
      cxt.lineTo(-1000, 90);
      cxt.lineTo(-600, 105);
      cxt.lineTo(-400, 95);
      cxt.lineTo(-250, 105);
      cxt.lineTo(-200, 90);
      cxt.lineTo(0, 80);
      cxt.closePath();
      cxt.fill();

      cxt.resetTransform();
      
    }

    function wmBase() {
      // Base
      cxt.fillStyle = "#721";
      cxt.beginPath();
      cxt.moveTo(0, 0);
      cxt.lineTo(20, 90);
      cxt.lineTo(60, 90);
      cxt.lineTo(80, 0);
      cxt.closePath();
      cxt.fill();

      // Roof
      cxt.fillStyle = '#543';
      cxt.beginPath();
      cxt.moveTo(10, 90);
      cxt.lineTo(20, 120);
      cxt.lineTo(40, 130);
      cxt.lineTo(60, 120);
      cxt.lineTo(70, 90);
      cxt.closePath();
      cxt.fill();

    }

    function wmArm() {
      // Sail
      cxt.fillStyle = '#eee';
      cxt.beginPath();
      cxt.moveTo(0, 30);
      cxt.lineTo(-15, 30);
      cxt.lineTo(-15, 90);
      cxt.lineTo(0, 90);
      cxt.closePath();
      cxt.fill();

      // Arm
      cxt.fillStyle = '#c96';
      cxt.beginPath();
      cxt.moveTo(0, 0);
      cxt.lineTo(5, 0);
      cxt.lineTo(5, 90);
      cxt.lineTo(0, 90);
      cxt.closePath();
      cxt.fill();
    }

    function wmKnob() {
      cxt.fillStyle = '#432';
      cxt.beginPath();
      cxt.ellipse(0, 0, 8, 8, 0, 0, 2 * Math.PI);
      cxt.fill();
    }

    function sheep() {
      cxt.fillStyle = '#122';
      cxt.beginPath();
      cxt.moveTo(0, -2);
      cxt.lineTo(2, 0);
      cxt.lineTo(10, 0);
      cxt.lineTo(10, -7);
      cxt.lineTo(5, -7);
      cxt.closePath();
      cxt.fill();

      cxt.fillStyle = '#ddd';
      cxt.beginPath();
      cxt.moveTo(7, -7);
      cxt.lineTo(10, 3);
      cxt.lineTo(18, 5);
      cxt.lineTo(32, 5);
      cxt.lineTo(37, 0);
      cxt.lineTo(31, -12);
      cxt.lineTo(14, -12);
      cxt.closePath();
      cxt.fill();
    }

    function sun() {
      cxt.fillStyle = "rgba(247, 232, 168,0.5)";
      cxt.beginPath();
      cxt.moveTo(25, 60);
      cxt.lineTo(45, 55);
      cxt.lineTo(60, 35);
      cxt.lineTo(55, 20);
      cxt.lineTo(30, 10);
      cxt.lineTo(10, 30);
      cxt.closePath();
      cxt.fill();

      cxt.fillStyle = "#fea";
      cxt.beginPath();
      cxt.moveTo(35, 50);
      cxt.lineTo(50, 40);
      cxt.lineTo(45, 25);
      cxt.lineTo(25, 20);
      cxt.lineTo(20, 40);
      cxt.closePath();
      cxt.fill();
    }

    // Update pan
    if (pan_x > 250 || pan_x < 0) {
      pan_dx *= -1;
    }
    pan_x += pan_dx;

    sky();
    hills();
    water();

    cxt.translate(20, 20);
    sun();
    cxt.save();
    
    // Draw windmill
    cxt.resetTransform();
    cxt.translate(350-pan_x, 240);
    cxt.rotate(Math.PI); 
    wmBase();
    cxt.save();

    // Windmill arms
    cxt.translate(40, 100);
    wm_theta -= 0.01;
    for (let i = 0; i < 4; i++) {
      cxt.rotate((Math.PI / 2) + wm_theta);
      wmArm();
      if (cbox1.checked == false) {
        cxt.rotate(-wm_theta);
      }
    }

    wmKnob();

    // Sheep
    sheep_wobble += 0.15;

    cxt.resetTransform();
    cxt.translate(500-pan_x, 200+Math.sin(sheep_wobble+1.5));
    cxt.scale(0.5, 0.5);
    sheep();

    cxt.resetTransform();
    cxt.translate(600-pan_x, 230+Math.sin(sheep_wobble));
    cxt.scale(0.8, 0.8);
    sheep();

    cxt.resetTransform();
    cxt.translate(630-pan_x, 220+Math.sin(sheep_wobble+1));
    cxt.scale(0.7, 0.7);
    sheep();

    window.requestAnimationFrame(draw);
  }

  draw();
  slider1.addEventListener("input", updatePanDx);
}
window.onload = setup;