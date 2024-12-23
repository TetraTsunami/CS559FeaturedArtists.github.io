//This is inspired by that demo http://jsbin.com/zewesapifa/1/edit?html,js,output
//my high score is 77

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

function brightColor(){ //from "How to generate random pastel (or brighter) color in Javascript?"
    var rand1 = Math.floor(Math.random() * 100);
    var rand2 = Math.floor(Math.random() * 100);
    var rand3 = Math.floor(Math.random() * 100);
    var r = (255 - rand1);
    var g = (255 - rand2);
    var b = (255 - rand3);
    color = `rgb(${r}, ${g}, ${b})`;
    return color;
}

function setup() {
    var score = 0;
    var blockY = 0;
    var blockX = Math.floor(Math.random() * 450);
    var blockSpeed = 1;
    var canvas = document.getElementById('myCanvas');
    var blockColor = brightColor();
    var playing = true;
    
    function drawRobot(){ //width = 100 centered at slider position (left at x+50)
        var slider = document.getElementById('slider1');
        var robotX = parseFloat(slider.value);
        context.beginPath();
        //circle head
        context.fillStyle = "#FFD700";
        context.arc(robotX, canvas.height-140, 15, 0, 2 * Math.PI, false);
        context.fill();
        //body
        context.fillStyle = "#8B8000";
        context.fillRect(robotX-20, canvas.height-125, 40, 70);
        //arms
        context.fillRect(robotX-50, canvas.height-110, 100, 15);
        //legs
        context.fillRect(robotX-20, canvas.height-70, 10, 40);
        context.fillRect(robotX+10, canvas.height-70, 10, 40);   
    }

    function drawBlock(x, y, color){
        context.beginPath();
        context.rect(x,y,50,50);
        context.fillStyle = color;
        context.fill();
    }
    
    function draw() {
        //clear
        canvas.width = canvas.width;
        //draw
        drawRobot();
        drawBlock(blockX, blockY, blockColor);
        
        //check robot collision
        if (blockY >= canvas.height - 150){
            var slider = document.getElementById('slider1');
            var robotX = parseFloat(slider.value);
            if ((blockX+50 >= robotX-50) && (blockX <= robotX+50)){ //collide success
                blockColor = brightColor();
                blockX = Math.floor(Math.random() * 450);
                blockSpeed += 0.15;
                blockY = 0;
                var scoreText = document.getElementById('score');
                score += 1;
                scoreText.innerHTML = `Score: ${score}`;
            }
            else{ //lose
                var scoreText = document.getElementById('score');
                scoreText.innerHTML = `Thanks for playing! Score: ${score}`;
                playing = false;
            }
        }
        
        if (playing){
            blockY = blockY + blockSpeed;
            window.requestAnimationFrame(draw);
        }
    };
    window.requestAnimationFrame(draw);
};

window.onload = setup;
