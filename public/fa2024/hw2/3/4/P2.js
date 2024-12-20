//Tanvin Thiagarajan
//CS 559
//09/27/24

function run() { "use strict";
    var canvas = document.getElementById("canvas");
    var slider1 = document.getElementById("slider1");
    var slider2 = document.getElementById("slider2");
    slider1.value = 0;
    slider2.value = 0;

    //define functions to draw objects
    class Round {
        constructor(x, y, dx, dy) {
            this.x = x;
            this.y = y;
            this.dx = dx;
            this.dy = dy;
            this.r = 5;
        }

        //returns true if on screen, false otherwise
        is_valid() {
            if (this.x - this.r > canvas.width || this.x + this.r < 0) {
                return false;
            }
            else if (this.y + this.r > canvas.height || this.y + this.r < 0) {
                return false;
            }
            //default return
            return true;
        }

        draw(context) {
            //draw at current postion
            context.save(); //need to save previous stack before draw

            context.translate(this.x, this.y); //make canvas (0,0) at x and y of object
            context.beginPath();
            context.moveTo(0, 0);
            context.fillStyle = "red";
            context.arc(0, 0, this.r, 0, 2*Math.PI);
            context.fill();

            context.restore();  //restore canvas to state before 
            
            //update to next position
            this.x += this.dx;
            this.y += this.dy;
            this.r += 1;
        }
    }
    //tank class
    class Tank {
        constructor() {
            this.rounds = [];
        }

        draw(tank_pos, gun_angle, context) {
            context.save(); //save context original
            //draw tank
            context.translate(tank_pos, canvas.height);
            context.fillStyle = "grey";
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(0, -40);
            context.lineTo(50, -40);
            context.lineTo(50, -60);
            context.lineTo(100, -60);
            context.lineTo(100, -40);
            context.lineTo(150, -40);
            context.lineTo(150, 0);
            context.lineTo(0, 0);
            context.fill();

            //draw gun
            context.save(); //save previous context

            //assume that tank has been drawn
            context.translate(75, -60); //move draw point to top middle of tank
            context.rotate(gun_angle);
            context.fillStyle = "black";
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(0, 5);
            context.lineTo(-40, 5);
            context.lineTo(-40, -5);
            context.lineTo(0, -5);
            context.lineTo(0, 0);
            context.fill();

            context.restore(); //restore previous context

            context.restore(); //restore original context

            //add new round to rounds array
            var x, y, dx, dy;
            x = tank_pos - Math.floor(40*Math.cos(gun_angle));
            x += 75; //this breaks the code if in same line for some reason... I hate this awful coding language
            y = canvas.height - Math.floor(40*Math.sin(gun_angle));
            y -= 60; //C++ is so much better...
            dx = Math.floor(-10*Math.cos(gun_angle));
            dy = Math.floor(-10*Math.sin(gun_angle));
            this.rounds.push(new Round(x, y, dx, dy));

            var temp  = [];
            //cull rounds out of bounds
            for (let i = 0; i < this.rounds.length; i++)
            {
                if (this.rounds[i].is_valid()) {
                    temp.push(this.rounds[i]);
                }
            }
            //draw rounds
            for (let i = 0; i < temp.length; i++)
            {
                temp[i].draw(context);
            }
            this.rounds = temp;
        }
    }

    const tank = new Tank();
    function update() {
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        var tank_pos = slider1.value;
        var gun_angle = (slider2.value / 100.0) * Math.PI;
        tank.draw(tank_pos, gun_angle, context);
    }

    //draw loop
    update();
    setInterval(update, 50); //update every 50 milliseconds
}

//start on window run
window.onload = run;