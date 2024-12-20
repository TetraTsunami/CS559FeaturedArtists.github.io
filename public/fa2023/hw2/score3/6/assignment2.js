var canvas = document.getElementById('myCanvas');
var dx = 0;

function draw() {
    var ctx = canvas.getContext('2d');
    var time = new Date(); // set time
    dx = moveCar(dx); // set moving
    canvas.width = canvas.width;
    ctx.fillStyle = '#191970'; // set background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw windmill
    function DrawWindmill() {
        ctx.beginPath();
        ctx.strokeStyle = '#708090';
        ctx.moveTo(460, 500);
        ctx.lineTo(480, 295);
        ctx.moveTo(520, 295);
        ctx.lineTo(540, 500);
        ctx.moveTo(535, 430);
        ctx.lineTo(466, 430);
        ctx.moveTo(530, 390);
        ctx.lineTo(470, 390);
        ctx.moveTo(475, 350);
        ctx.lineTo(525, 350);
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(500, 250, 50, 0, 2 * Math.PI, false);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#708090';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(500, 250, 20, 0, 2 * Math.PI, false);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#708090';
        ctx.stroke();
    }
    
    // Draw the fans on the windmill
    function DrawFan() {
        ctx.beginPath();
        ctx.fillStyle = '#F0F8FF';
        ctx.moveTo(0,0);
        ctx.lineTo(10, 60);
        ctx.lineTo(25, 56);
        ctx.lineTo(0,0);
        ctx.fill();
    }
    
    // Draw the car
    function DrawCar() {
        ctx.beginPath();
        ctx.strokeStyle = '#D2B48C';
        ctx.fillStyle = '#FDF5E6';
        ctx.moveTo(23, 440);
        ctx.lineTo(23, 410);
        ctx.lineTo(35, 410);
        ctx.lineTo(50, 440);
        ctx.moveTo(70, 470);
        ctx.lineTo(130, 470);
        ctx.lineTo(130, 435);
        ctx.moveTo(140, 470);
        ctx.lineTo(140, 435);
        ctx.lineTo(75, 435);
        ctx.lineTo(70, 445);
        ctx.lineTo(70, 470);
        ctx.moveTo(140, 435);
        ctx.lineTo(135, 420);
        ctx.lineTo(75, 420);
        ctx.lineTo(75, 435);
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    // Set car moving
    function moveCar(dx) {
        if (dx > 1500) {
            dx = -600;
        } else {
            dx = dx + 1;
        }
        return dx;
    }
    
    // Draw the tires
    function DrawTire(x, y, radius, width, color, num) {
        var x = x;
        var y = y;
        var radius = radius;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.lineWidth = width;
        ctx.fillStyle = color;
        ctx.fill();
        
        if (num == 0) {
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 33);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -33);
            ctx.moveTo(0, 0);
            ctx.lineTo(33, 0);
            ctx.moveTo(0, 0);
            ctx.lineTo(-33, 0);
            ctx.moveTo(0, 0);
            ctx.lineTo(23, 23);
            ctx.moveTo(0, 0);
            ctx.lineTo(-23, -23);
            ctx.moveTo(0, 0);
            ctx.lineTo(-23, 23);
            ctx.moveTo(0, 0);
            ctx.lineTo(23, -23);
        } else {
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 10);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -10);
            ctx.moveTo(0, 0);
            ctx.lineTo(10, 0);
            ctx.moveTo(0, 0);
            ctx.lineTo(-10, 0);
            ctx.moveTo(0, 0);
            ctx.lineTo(10, 10);
            ctx.moveTo(0, 0);
            ctx.lineTo(-10, -10);
            ctx.moveTo(0, 0);
            ctx.lineTo(-10, 10);
            ctx.moveTo(0, 0);
            ctx.lineTo(10, -10);
        }
        ctx.stroke();
    }

    DrawWindmill();
    ctx.fillStyle='#F5DEB3';
    ctx.fillRect(0, 490, canvas.width, 30);
    ctx.save();
    ctx.translate(dx, 0);
    ctx.save();
    DrawCar();
    ctx.save();
    // Draw the moving tires
    ctx.translate(42, 460)
    ctx.rotate(((2 * Math.PI) / 6) * time.getSeconds() + ((2 * Math.PI) / 6000) * time.getMilliseconds());
    DrawTire(0, 0, 23, 15, '#FDF5E6', 0);
    ctx.restore();
    ctx.translate(135, 473)
    ctx.rotate(((2 * Math.PI) / 6) * time.getSeconds() + ((2 * Math.PI) / 6000) * time.getMilliseconds());
    DrawTire(0, 0, 19, 8, '#FDF5E6', 1);
    ctx.restore();
    ctx.restore();
    ctx.translate(500, 250);
    ctx.save();
    // Draw the rotating fans
    ctx.scale(1.5, 1.5);
    ctx.rotate(((2 * Math.PI) / 6) * time.getSeconds() + ((2 * Math.PI) / 6000) * time.getMilliseconds());
    for (i = 0; i <= 7; i++) {
        ctx.rotate(45 * Math.PI / 180);
        DrawFan();
    }
    ctx.restore();
    window.requestAnimationFrame(draw);
}
window.requestAnimationFrame(draw);