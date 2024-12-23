//CS 559 Assignment 1
//Name: ZamZam Haji
//Email: zhaji@wisc.edu
//Sources: Lecture Slides: helped to get syntax of the setup, html file, draw and drawShapes 
//         methods
//         ChatGPT: helped with translate syntax

/**
 * The purpose of this function is to setup the canvas so that the shapes can be drawn in
 */
function setup() {
    var canvas = document.getElementById('myCanvas');
    var slider = document.getElementById('slider');    
    var slider2 = document.getElementById('slider2');
    slider.value = 0;
    slider2.value = 0;
    /**
     * The purpose of this function is to draw various shapes into the html canvas
     *  Sources: Lecture Slides, helped to get syntax of the draw and drawShapes methods
     */
    function draw() {
        var context = canvas.getContext('2d');
        canvas.width = canvas.width;
        var dx = slider.value;
        var dy = slider2.value;

        /**
         * Draws the shapes that aren't being moved
         * @param {*} color , color of some of the filling or outlines of certain shapes
         */
        
        function drawShapes(color) {
            context.beginPath();
            context.rect(50, 50, 75, 75);
            context.lineWidth = 4;
            context.fillStyle = "green";
            context.fill();
            context.strokeStyle = color;
            context.stroke();


            context.beginPath();
            context.rect(200, 50, 100, 50);
            context.fillStyle = "blue";
            context.fill();


            context.beginPath();
            context.moveTo(50, 200);
            context.lineTo(50, 150);
            context.lineTo(150, 150);
            context.closePath();
            context.fillStyle="yellow";
            context.strokeStyle = "purple";
            context.fill();
            context.stroke();
        }
        /**
         * Draws the triangle that is going to be moved in the slide
         * @param {*} color2, the filling color for the triangle 
         */

        function drawTriangle(color2) {
            context.beginPath();
            context.moveTo(205, 180);
            context.lineTo(180, 230);
            context.lineTo(230, 230);
            context.closePath();
            context.fillStyle = color2;
            context.fill();
        }
        context.save();  
        drawShapes("pink");
        //translates the triangle depending on the value of the slider
        context.translate(dx, dy);
        drawTriangle("orange");
        context.restore();

    }
    slider.addEventListener("input",draw);
    slider2.addEventListener("input",draw);
    //displays the shapes
    draw();
}
    window.onload = setup;
