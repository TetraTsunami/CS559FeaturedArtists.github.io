function setup()
{

    function Character(context)
    {
        // these are it's properties
        this.speed = .2 * speedSlider * 0.01;
        // this is its state - it gets over-ridden if there is a path
        this.posX = 400;
        this.posY = 200;
        this.pathU = 0;
        this.handAngle = 0;
        this.feetAngle = 0;

        this.handDirection = 1;
        this.context = context;
    }
    Character.prototype.drawArm = function (Tx)
    {

        this.context.beginPath();
        drawRectangle(Tx, -30, -30, 100, 20);
        mat3.rotate(Tx, Tx, 290 * (Math.PI / 180));
        this.context.closePath();
        this.context.fillStyle = "#A0C0A0";
        this.context.strokeStyle = "#003300";

        this.context.stroke();
        this.context.fill();

        this.context.beginPath();
        drawRectangle(Tx, -30, 50, 80, 20);

        this.context.stroke();
        this.context.fill();
        this.context.closePath();


    };
    Character.prototype.drawLegs = function (Tx)
    {
        this.context.beginPath();
        drawCircle(Tx, 0, 100, 70, 0, Math.PI * 2, false);
        this.context.stroke();
        this.context.closePath();
        this.context.beginPath();

        drawCircle(Tx, 0, 100, 50, 0, Math.PI * 2, false);
        this.context.stroke();
        this.context.closePath();

    };
    Character.prototype.drawFeet = function (Tx)
    {
        this.context.beginPath();

        drawEllipse(Tx, 0, 50, 20, 30, Math.PI / 2);
        drawEllipse(Tx, 0, -50, 20, 30, Math.PI / 2);

        context.fillStyle = "#c99e38";
        context.fill();
        this.context.closePath();

    };
    Character.prototype.drawHead = function (Tx)
    {
        this.context.beginPath();
        drawCircle(Tx, 0, -120, 30, 0, Math.PI * 2, false);
        this.context.closePath();
        this.context.fill();
        this.context.stroke();

        this.context.beginPath();
        drawEllipse(Tx, -10, -125, 9, 13, Math.PI * 2, false);
        this.context.fillStyle = "white"
        this.context.fill();
        this.context.stroke();
        this.context.closePath();

        this.context.beginPath();
        drawEllipse(Tx, -13, -125, 6, 3, Math.PI / 2, false);
        this.context.fillStyle = "black"
        this.context.fill();
        this.context.stroke();
        this.context.closePath();


    };
    Character.prototype.drawBody = function (Tx)
    {
        this.context.beginPath();
        drawEllipse(Tx, 0, 0, 85, 35, Math.PI / 2);

        this.context.fill();
        this.context.stroke();
        this.context.closePath();

    };
    Character.prototype.draw = function (Tx)
    {
        mat3.translate(Tx, Tx, [this.posX, this.posY]);
        this.context.fillStyle = "#A0C0A0";
        this.context.strokeStyle = "#003300";
        this.drawBody(Tx);
        this.drawHead(Tx);
        this.drawLegs(Tx);
        mat3.translate(Tx, Tx, [0, -40])
        mat3.rotate(Tx, Tx, this.handAngle);
        mat3.translate(Tx, Tx, [20, 20]);
        this.drawArm(Tx);
        mat3.rotate(Tx, Tx, this.handAngle);
        var feetBase = mat3.create();
        mat3.translate(feetBase, feetBase, [this.posX, this.posY + 100])
        mat3.rotate(feetBase, feetBase, -1 * this.feetAngle);
        this.drawFeet(feetBase)

    }
    Character.prototype.update = function ()
    {
        this.posX = posSlider.value;

        this.speed = 0.2 * speedSlider.value;
        this.handAngle += (0.015 * this.handDirection * this.speed);
        if ((this.handDirection == 1 && this.handAngle >= 3) || (this.handDirection == -1 && this.handAngle <= 0))
        {
            this.handDirection *= -1;
        }
        this.feetAngle += 0.15 * this.speed;

    }
    function drawCircle(Tx, x, y, radius, startAngle, endAngle, counterClockwise)
    {
        var res = vec2.create();
        vec2.transformMat3(res, [x, y], Tx);
        context.arc(res[0], res[1], radius, startAngle, endAngle, counterClockwise);

    }
    function drawRectangle(Tx, x, y, length, breadth)
    {
        moveToTx(x, y, Tx);
        lineToTx([x + length, y], Tx);
        lineToTx([x + length, y + breadth], Tx);
        lineToTx([x, y + breadth], Tx);
        lineToTx([x, y], Tx);

    }
    function drawEllipse(Tx, x, y, radiusX, radiusY, rotation)
    {
        var res = vec2.create();
        vec2.transformMat3(res, [x, y], Tx);
        context.ellipse(res[0], res[1], radiusX, radiusY, rotation, 0, 2 * Math.PI);
    }
    function mountain(Tx)
    {
        context.beginPath();
        moveToTx([0, 270], Tx);
        lineToTx([150, 35], Tx);
        lineToTx([350, 270], Tx);
        moveToTx([100, 270], Tx);
        lineToTx([310, 105], Tx);
        lineToTx([650, 270], Tx);
        moveToTx([300, 270], Tx);
        lineToTx([650, 0], Tx);
        lineToTx([800, 270], Tx);

        moveToTx([700 + 0, 270], Tx);
        lineToTx([700 + 150, 35], Tx);
        lineToTx([700 + 350, 270], Tx);
        moveToTx([700 + 100, 270], Tx);
        lineToTx([700 + 310, 105], Tx);
        lineToTx([700 + 650, 270], Tx);
        moveToTx([700 + 300, 270], Tx);
        lineToTx([700 + 650, 0], Tx);
        lineToTx([700 + 800, 270], Tx);

        moveToTx([1400 + 0, 270], Tx);
        lineToTx([1400 + 150, 35], Tx);
        lineToTx([1400 + 350, 270], Tx);
        moveToTx([1400 + 100, 270], Tx);
        lineToTx([1400 + 310, 105], Tx);
        lineToTx([1400 + 650, 270], Tx);
        moveToTx([1400 + 300, 270], Tx);
        lineToTx([1400 + 650, 0], Tx);
        lineToTx([1400 + 800, 270], Tx);

        moveToTx([2100 + 0, 270], Tx);
        lineToTx([2100 + 150, 35], Tx);
        lineToTx([2100 + 350, 270], Tx);
        moveToTx([2100 + 100, 270], Tx);
        lineToTx([2100 + 310, 105], Tx);
        lineToTx([2100 + 650, 270], Tx);
        moveToTx([2100 + 300, 270], Tx);
        lineToTx([2100 + 650, 0], Tx);
        lineToTx([2100 + 800, 270], Tx);


        //lineToTx([650, 270], Tx);
        //lineToTx([650, 270], Tx);

        context.closePath();
        context.fillStyle = "#01ba07";
        context.fill();

        //road
        context.beginPath();
        moveToTx([0, 270], Tx);
        lineToTx([3000, 270], Tx);
        lineToTx([3000, canvas.height], Tx);
        lineToTx([0, canvas.height], Tx);
        context.closePath();
        context.fillStyle = "#884c25";
        context.fill();
    }
    function sun(Tx)
    {
        var color = (Math.sin(timekeep * 0.1) + 1) * 100

        context.beginPath();

        //sun
        drawCircle(Tx, 0, 0, 130, 0, Math.PI * 2, false);
        context.closePath();
        context.fillStyle = "rgb(252 " + (146 - color) + " 17)";
        context.fill();
    }

    function backGround(Tx)
    {
        var color = ((Math.sin(timekeep * 0.1) + 1) * 100)
        //sky
        context.beginPath();
        moveToTx([0, 0], Tx);
        lineToTx([canvas.width, 0], Tx);
        lineToTx([canvas.width, 270], Tx);
        lineToTx([0, 270], Tx);
        context.closePath();
        context.fillStyle = "rgb(57 " + (215 - color) + " 250)"
        context.fill();

        context.beginPath();

        //stars
        for (let i = 0; i < 60; i++)
        {
            context.beginPath();
            drawCircle(Tx, listData[i][0], listData[i][1], 3, 1, false);
            context.fillStyle = "rgb( " + (Math.max(56, color)) + " " + (Math.max(215, color)) + " 250)"
            context.fill();
        }



    }
    function moveToTx(loc, Tx)
    {
        var res = vec2.create();
        vec2.transformMat3(res, loc, Tx);
        context.moveTo(res[0], res[1]);
    }

    function lineToTx(loc, Tx)
    {
        var res = vec2.create();
        vec2.transformMat3(res, loc, Tx);
        context.lineTo(res[0], res[1]);
    }

    function draw()
    {
        canvas.width = canvas.width;
        var characterFrame = mat3.create();
        var bgFrame = mat3.create();
        var mountainFrame = mat3.create();
        var sunFrame = mat3.create();
        mat3.translate(sunFrame, sunFrame, [500, 500]);
        mat3.rotate(sunFrame, sunFrame, (timekeep * Math.PI * 0.1 * 0.4) - Math.PI * 0.7);
        mat3.translate(sunFrame, sunFrame, [400, 200]);

        mat3.translate(mountainFrame, mountainFrame, [-2900 + canvas.width * 1.5 + timekeep * 14, 0])

        backGround(bgFrame);
        sun(sunFrame);
        character.update();

        mountain(mountainFrame);
        character.draw(characterFrame);
        context.restore();
        window.requestAnimationFrame(draw);
        timekeep += 0.1;
        if (timekeep >= 100)
        {
            reset = true;
            timekeep = 0;
        }
        if (reset && timekeep >= 9
        )
        {
            reset = false;
            listData = []
            for (let i = 0; i < 60; i++)
            {
                var x = Math.random() * canvas.width;
                var y = Math.random() * 270;
                listData.push([x, y])
            }
        }
    }
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var character = new Character(context);
    var speedSlider = document.getElementById('speed');
    speedSlider.value = 5;
    var posSlider = document.getElementById('position');
    posSlider.value = canvas.width / 2;
    var timekeep = 0;
    var listData = []
    var reset = false;

    for (let i = 0; i < 60; i++)
    {
        var x = Math.random() * canvas.width;
        var y = Math.random() * 270;
        listData.push([x, y])
    }

    draw();


};
window.onload = setup;