var canvas = document.getElementById('simpleMaze');
var context = canvas.getContext('2d');

var slider1 = document.getElementById('slider1');
slider1.value = 20;
var slider2 = document.getElementById('slider2');
slider2.value = 470;
var slider3 = document.getElementById('slider3');
slider3.value = 0;
var slider4 = document.getElementById('slider4');
slider4.value = 0;
var slider5 = document.getElementById('slider5');
slider5.value = 0;

var x = parseInt(slider1.value);
var y = parseInt(slider2.value);
var old_x = 0;
var old_y = 0;
var speed = 0;

var path_x = [0, 520, 250, 250, 330, 420, 50, 50, 140, 620, 700];
var path_y = [450, 150, 150, 150, 240, 320, 340, 40, 40, 130, 250];
var path_width = [600, 80, 270, 80, 170, 80, 450, 90, 560, 80, 100];
var path_height = [100, 300, 70, 170, 80, 80, 70, 300, 90, 120, 100];
var size = 60;

var out = false;
var end;
var frame = 0;
var frame2 = 0;

var bubble_x = [];
var bubble_y = [];
var bubble_size = [];
var bubble_g = [];
var bubble_frame = [];

function lava() {
    if(Math.random() < 0.21) {
        bubble_size[bubble_size.length] = Math.floor(Math.random()*41)+80;
        bubble_x[bubble_x.length] = Math.floor(Math.random()*(800-bubble_size[bubble_x.length]));
        bubble_y[bubble_y.length] = Math.floor(Math.random()*(600-bubble_size[bubble_y.length]));
        bubble_g[bubble_g.length] = 255;
        bubble_frame[bubble_frame.length] = 0;
    }

    var frame3 = 0;
    context.lineWidth = 2;
    var center_x = 0;
    var center_y = 0;
    var bubble = 0;
    var radius = 0;

    for(i=0; i<bubble_x.length; i++) {
        frame3 = bubble_frame[i]/4.2;
        center_x = bubble_x[i] + bubble_size[i]/2;
        center_y = bubble_y[i] + bubble_size[i]/2;
        bubble = bubble_size[i];
        if(frame3 < bubble) {
            bubble = frame3;
        }
        radius = 0;

        for(j=0; j<bubble; j++) {
            radius = frame3+j-bubble_size[i]/4;
            if(frame3 < bubble_size[i]/4) {
                radius = j;
            }

            context.strokeStyle = "rgb(255,"+(bubble_g[i]-4.2*j)+",0)";
            if(frame3+j < bubble_size[i]/2) {
                context.beginPath();
                context.arc(center_x, center_y, radius, 0, 2*Math.PI);
                context.stroke();
            }
        }

        if(frame3 < bubble_size[i]/2) {
            bubble_frame[i]++;
        } else {
            bubble_x.splice(i, 1);
            bubble_y.splice(i, 1);
            bubble_size.splice(i, 1);
            bubble_g.splice(i, 1);
            bubble_frame.splice(i, 1);
            i--;
        }
    }
}

function map() {
    context.lineWidth = 5;
    context.fillStyle = "#FF7203";

    context.beginPath();
    context.rect(0, 0, 800, 600);
    context.fill();

    lava();

    context.fillStyle = "#502E08";
    for(i=0; i<path_x.length; i++) {
        context.beginPath();
        context.rect(path_x[i], path_y[i], path_width[i], path_height[i]);
        context.fill();
    }

    context.beginPath();
    context.moveTo(path_x[9]+path_width[9], path_y[9]+path_height[9]);
    context.lineTo(path_x[10], path_y[10]);
    context.lineTo(path_x[10], path_y[10]+path_height[10]);
    context.lineTo(path_x[9], path_y[9]+path_height[9]+100);
    context.lineTo(path_x[9], path_y[9]+path_height[9]);
    context.closePath();
    context.fill();

    context.fillStyle = "green";
    context.beginPath();
    context.rect(0, 450, 100, 100);
    context.fill();
    context.fillStyle = "lightgreen";
    context.beginPath();
    context.rect(path_x[10], path_y[10], path_width[10], path_height[10]);
    context.fill();

    context.fillStyle = "#6F00CF";
    context.font = "30px Arial";
    context.fillText("START", 3, 449);
    context.fillText("END", path_x[10]+18, path_y[10]-1);

    if(!out && !end && frame2 < 170) {
        if(frame2 < 42) {
            context.globalAlpha = 1.5*frame2/42;
        } else if(frame2 > 127) {
            context.globalAlpha = 1 - (frame2-127)/42;
        }

        context.fillStyle = "black";
        context.strokeStyle = "#FFEF00";
        context.lineWidth = 10;

        context.beginPath();
        context.rect(190, 265, 420, 70);
        context.fill();

        context.beginPath();
        context.rect(185, 260, 430, 80);
        context.stroke();

        context.beginPath();
        context.moveTo(185, 260);
        context.lineTo(235, 340);
        context.moveTo(235, 260);
        context.lineTo(185, 340);
        context.stroke();

        context.beginPath();
        context.moveTo(615, 260);
        context.lineTo(565, 340);
        context.moveTo(565, 260);
        context.lineTo(615, 340);
        context.stroke();

        context.fillStyle = "#FFEF00";
        context.font = "25px Arial";
        context.fillText("DON'T TOUCH THE LAVA", 255, 309);

        context.globalAlpha = 1;
        frame2++;
    }
}

function ending() {
    map();
    
    var center_x = x+size/2;
    var center_y = y+size/2;
    
    if(!out) {
        var inc = 0;
        var red = parseInt(slider3.value);
        if(red > 225) red = 225;
        var redd = (255 - red)/size*2;

        var green = parseInt(slider4.value);
        if(green > 225) green = 225;
        var greenn = (255 - green)/size*2;

        var blue = parseInt(slider5.value);
        if(blue > 225) blue = 225;
        var bluee = (255 - blue)/size*2;

        context.strokeStyle = "black";
        context.fillStyle = "white";
        context.beginPath();
        context.rect(x, y, size, size);
        context.stroke();
        context.fill();

        context.lineWidth = 1;
        for(i=0; i<size/2; i++) {
            context.strokeStyle = "rgb("+(red+redd*i)+","+(green+greenn*i)+","+(blue+bluee*i)+")";

            context.beginPath();
            context.rect(x+i, y+i, size-i*2, size-i*2);
            context.stroke();
        }

        context.lineWidth = 5;
        context.strokeStyle = "black";

        context.fillStyle = "purple";
        context.beginPath();
        context.moveTo(x+size/2, y+2);
        context.lineTo(x+size-2, y+size/2);
        context.lineTo(x+size/2, y+size-2);
        context.lineTo(x+2, y+size/2);
        context.closePath();
        context.stroke();
        context.fill();

        context.lineWidth = 1;
        for(i=0; i<size/2; i++) {
            context.strokeStyle = "rgb("+(230-3*i)+","+(200-6*i)+",255)";

            inc = (frame/2+i)%(size/2);
            context.beginPath();
            context.moveTo(center_x, center_y-inc);
            context.lineTo(center_x+inc, center_y);
            context.lineTo(center_x, center_y+inc);
            context.lineTo(center_x-inc, center_y);
            context.closePath();
            context.stroke();
        }

        frame++;
        //frame = (frame+1)%(4*size);
    } else {

        if(frame < speed) {
            context.strokeStyle = "red"
            context.lineWidth = 1;

            for(i=0; i<7; i++) {
                if(frame+i < speed) {
                    context.beginPath();
                    context.arc(center_x, center_y, i+frame, 0, 2*Math.PI);
                    context.stroke();
                }
            }
        }

        frame+=speed/17;
    }

    if(out) {
        //var alpha = frame/(18*speed/17)*255;
        context.globalAlpha = frame/(18*speed/17);

        context.fillStyle = "black";
        context.strokeStyle = "red";
        context.lineWidth = 20;

        context.beginPath();
        context.rect(250, 250, 300, 100);
        //context.stroke();
        context.fill();

        context.beginPath();
        context.rect(240, 240, 320, 120);
        context.stroke();

        context.fillStyle = "red";
        context.font = "50px Arial";
        context.fillText("YOU DIED", 280, 320);

        //if(frame/(18*speed/17) >= 1) {
        context.fillStyle = "black";
        context.strokeStyle = "#00F3EA";
        context.lineWidth = 10;

        context.beginPath();
        context.rect(190, 420, 420, 70);
        context.fill();

        context.beginPath();
        context.rect(185, 415, 430, 80);
        context.stroke();

        //context.lineWidth = 5;
        context.beginPath();
        context.moveTo(185, 415);
        context.lineTo(235, 495);
        context.moveTo(235, 415);
        context.lineTo(185, 495);
        context.stroke();

        context.beginPath();
        context.moveTo(615, 415);
        context.lineTo(565, 495);
        context.moveTo(565, 415);
        context.lineTo(615, 495);
        context.stroke();

        // context.beginPath();
        // context.moveTo(235, 415);
        // context.lineTo(235, 495);
        // context.moveTo(565, 415);
        // context.lineTo(565, 495);
        // context.stroke();

        context.fillStyle = "#00F3EA";
        context.font = "25px Arial";
        context.fillText("RELOAD TO TRY AGAIN", 257, 464);
        //}

        context.globalAlpha = 1;
    } else if(end) {
        if(frame2 < 42) {
            context.globalAlpha = frame2/42;
            frame2++;
        }

        var middle_x = 400;
        var middle_y = 307;
        var radius1 = 120;
        var radius2 = 300;
        var angle = 0.1*Math.PI;
        var angle_inc = Math.PI/5;
        context.fillStyle = "lightgreen";
        context.beginPath();
        //console.log("("+radius2*Math.cos(angle)+","+radius2*Math.sin(angle)+")")
        context.moveTo(middle_x+radius2*Math.cos(angle), middle_y-radius2*Math.sin(angle));
        angle += angle_inc;
        for(i=0; i<4; i++) {
            context.lineTo(middle_x+radius1*Math.cos(angle), middle_y-radius1*Math.sin(angle));
            angle += angle_inc;
            context.lineTo(middle_x+radius2*Math.cos(angle), middle_y-radius2*Math.sin(angle));
            angle += angle_inc;
        }
        context.lineTo(middle_x+radius1*Math.cos(angle), middle_y-radius1*Math.sin(angle));
        context.closePath();
        context.fill();

        context.fillStyle = "black"
        context.strokeStyle = "green"
        context.lineWidth = 40;

        context.beginPath();
        context.rect(250, 250, 300, 100);
        context.stroke();
        context.fill();

        context.fillStyle = "lightgreen";
        context.font = "50px Arial";
        context.fillText("YOU WON", 280, 320);

        context.globalAlpha = 1;
    }

    if(!out || frame < 18*speed/17) {
        //console.log("running");
        window.requestAnimationFrame(ending);
    }
}

function player() {
    map();

    context.lineWidth = 3;
    context.strokeStyle = "black";
    context.fillStyle = "white";
    
    x = parseInt(slider1.value);
    y = parseInt(slider2.value);
    speed = Math.abs((x-old_x)+(y-old_y));

    var x_vertices = [x, x+size, x+size, x, x+size/2, x+size, x+size/2, x];
    var y_vertices = [y, y, y+size, y+size, y, y+size/2, y+size, y+size/2];
    end = true;
    for(i=0; i<x_vertices.length; i++) {
        var imageData = context.getImageData(x_vertices[i], y_vertices[i], 1, 1).data;
        var csum = imageData[0]+imageData[1]+imageData[2];
        
        //console.log("vertex"+i+" - rgb("+imageData[0]+","+imageData[1]+","+imageData[2]+")");
        if(csum != 134 && csum != 526 && csum != 128 && csum != 0 && csum != 494) {
            out = true;
        } else {
            end = end && imageData[0]+imageData[1]+imageData[2] == 526;
        }
    }

    if(!out) {
        var center_x = x+size/2;
        var center_y = y+size/2;
        var inc = 0;

        var red = parseInt(slider3.value);
        if(red > 225) red = 225;
        var redd = (255 - red)/size*2;

        var green = parseInt(slider4.value);
        if(green > 225) green = 225;
        var greenn = (255 - green)/size*2;

        var blue = parseInt(slider5.value);
        if(blue > 225) blue = 225;
        var bluee = (255 - blue)/size*2;

        context.strokeStyle = "black";
        context.fillStyle = "white";
        context.beginPath();
        context.rect(x, y, size, size);
        context.stroke();
        context.fill();

        context.lineWidth = 1;
        for(i=0; i<size/2; i++) {
            context.strokeStyle = "rgb("+(red+redd*i)+","+(green+greenn*i)+","+(blue+bluee*i)+")";

            context.beginPath();
            context.rect(x+i, y+i, size-i*2, size-i*2);
            context.stroke();
        }

        context.lineWidth = 5;
        context.strokeStyle = "black";

        context.fillStyle = "purple";
        context.beginPath();
        context.moveTo(x+size/2, y+2);
        context.lineTo(x+size-2, y+size/2);
        context.lineTo(x+size/2, y+size-2);
        context.lineTo(x+2, y+size/2);
        context.closePath();
        context.stroke();
        context.fill();

        context.lineWidth = 1;
        for(i=0; i<size/2; i++) {
            context.strokeStyle = "rgb("+(230-3*i)+","+(200-6*i)+",255)";

            inc = (frame/2+i)%(size/2);
            context.beginPath();
            context.moveTo(center_x, center_y-inc);
            context.lineTo(center_x+inc, center_y);
            context.lineTo(center_x, center_y+inc);
            context.lineTo(center_x-inc, center_y);
            context.closePath();
            context.stroke();
        }

        frame++;
        //frame = (frame+1)%(4*size);
    } else {
        frame = 0;
    }

    old_x = x;
    old_y = y;

    if(!out && !end) {
        window.requestAnimationFrame(player);
    } else {
        if(speed < 45) {
            speed = 45;
        }
        frame2 = 0;

        ending();
    }
}

window.onload = map;
window.requestAnimationFrame(player);