function setup() {
    var canvas = document.getElementById('myCanvas');
    var gear1rotation = 0;
    var gear2offset = 0;
    var gear2rotation = (2*Math.PI)/16;
    var gear4rotation = (2*Math.PI)/16;;
    var gear4offset = 0;
    
    function draw() {
        var context = canvas.getContext('2d');
        canvas.width = canvas.width;
        function draw_gear(color) {
            context.beginPath();
            context.lineWidth = 15;
            context.strokeStyle = color;
            context.fillStyle = color;
            context.arc(0, 0, 70, 0, 2 * Math.PI, false);
            context.stroke();
            context.save();
            for (var i = 0; i < 25; i++) {
                context.save();
                context.translate(0,-73);
                context.beginPath();
                context.moveTo(0,0);
                context.lineTo(0,-18);
                context.lineTo(10,-18);
                context.lineTo(10,0);
                context.fill();
                context.restore();
                context.rotate( (2/25) * Math.PI);
            }
            context.restore();
        }
        //gear 1
        context.save();
        context.translate(300,300);
        context.rotate(gear1rotation);
        draw_gear('grey');
        //gear 2
        context.save();
        context.rotate(gear2offset);
        context.translate(0, -173);
        context.rotate(gear2rotation);
        draw_gear('grey');
        //gear 3
        context.save();
        context.scale(0.5,0.5);
        draw_gear('black');
        //gear 4
        context.save();
        context.rotate(gear4offset);
        context.translate(0,-173);
        context.rotate(gear4rotation);
        draw_gear('black');
        context.restore();
        //gear 5
        context.save();
        context.rotate(gear4offset+(2*(2*Math.PI) / 10));
        context.translate(0,173);
        context.rotate(gear4rotation);
        draw_gear('black');
        context.restore();

        context.restore();

        context.restore();


        context.restore();
        gear2offset = gear2offset + (2*Math.PI)/1000;
        gear2rotation = gear2rotation + (2*Math.PI)/1000;

        gear1rotation = gear1rotation - (2*Math.PI) / 8000;

        gear4offset = gear4offset - (2*Math.PI)/300;
        gear4rotation = gear4rotation - (2*Math.PI)/300;
    }
    draw();
    window.setInterval(draw,10);
}
window.onload = setup;