
"use strict";

     function setup() {
        var canvas = document.getElementById('myCanvas');
        var slider = document.getElementById('slider');
        var speed = document.getElementById('speed');
        var context = canvas.getContext('2d');
        slider.value = 200;
        speed.value = 45;
        var x = 50;

        function draw(){
            canvas.width = canvas.width;

            cloud(context,80,120);
            cloud(context,470,230);
            cloud(context,180,380);

            pillar(context,200,250);
            pillar(context,300,200);
            pillar(context,400,150);
            pillar(context,500,200);

            inverted_pillar(context,200,150);
            inverted_pillar(context,300,100);
            inverted_pillar(context,400,50);
            inverted_pillar(context,500,100);

            var y = slider.value;
            var dx = speed.value;
            flappy_bird(context,x,y);
            x = (x + dx/100) % WIDTH;

            var r = bird_radius/2;
            if((x > 200 - r && x < 200 + pillar_width + r && (y < 150+r || y > 250-r)) ||
            (x > 300 - r && x < 300 + pillar_width + r && (y < 100+r || y > 200-r)) ||
            (x > 400 - r && x < 400 + pillar_width + r && (y < 50+r || y > 150-r)) ||
            (x > 500 - r && x < 500 + pillar_width + r && (y < 100+r || y > 200-r)))
            {x = 0;}

            window.requestAnimationFrame(draw);
        }

        window.requestAnimationFrame(draw);  
        };
 
        window.onload = setup;