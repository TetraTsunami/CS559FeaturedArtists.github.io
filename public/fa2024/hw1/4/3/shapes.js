
function pillar(context,xs,ys){
    context.beginPath();
    context.rect(xs,ys,pillar_width,HEIGHT-ys);
    context.fillStyle = "#228B22";
    context.fill();

    context.beginPath();
    context.rect(xs-2,ys-2,pillar_width+4,stand_height);
    context.fillStyle = "#008000";
    context.fill();
}

function inverted_pillar(context,xs,ys){
    context.beginPath();
    context.rect(xs,0,pillar_width,ys);
    context.fillStyle = "#228B22";
    context.fill();

    context.beginPath();
    context.rect(xs-2,ys-stand_height-2,pillar_width+4,stand_height+4);
    context.fillStyle = "#008000";
    context.fill();
}

function flappy_bird(context,x,y){
    // Body
    context.beginPath();
    context.arc(x,y,bird_radius,0,2*Math.PI);
    context.fillStyle = "#F4D03F";
    context.fill();
    // Wings
    var y_pos = y-5;
    var rad = (bird_radius+8)/2;
    context.beginPath();
    context.moveTo(x,y_pos);
    context.lineTo(x-rad*2,y_pos);
    context.arc(x-rad,y_pos,rad,0,Math.PI)
    context.fillStyle = "#FCF3CF";
    context.strokeStyle = "#F4D03F";
    context.fill();
    context.stroke();
    // Beak
    context.beginPath();
    context.rect(x+5,y,bird_radius,5);
    context.fillStyle = "#BA4A00";
    context.fill();
    // Eye
    context.beginPath();
    context.arc(x+0.4*bird_radius,y-0.5*bird_radius,6,0,2*Math.PI);
    context.fillStyle = "#FFF";
    context.fill();
    // Pupil
    context.beginPath();
    context.arc(x+0.5*bird_radius,y-0.5*bird_radius,3,0,2*Math.PI);
    context.fillStyle = "#000";
    context.fill();
}

function cloud(context,x,y){
    context.beginPath();
    context.moveTo(x,y);
    context.lineTo(x+100,y);
    context.arc(100+x,y-40,40,0.5*Math.PI,1.5*Math.PI,true);
    context.arc(50+x,y-80,50,0*Math.PI,1*Math.PI,true);
    context.arc(x,y-40,40,1.5*Math.PI,0.5*Math.PI,true);
    context.strokeStyle = "#D6EAF8";
    context.lineWidth = 5;
    context.stroke();
}