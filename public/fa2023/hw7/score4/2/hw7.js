function start() {
    const bricks = {
        'I': [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        'T': [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        'S': [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ],
        'Z': [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ],
        'J': [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        'L': [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ],
        'O': [
            [1, 1],
            [1, 1],
        ]
    };

    function repeatColor(color, times = 40) {
        var result = [];
        for (var i = 0; i < times; i++) {
            for (var j = 0; j < color.length; j++) {
                result.push(color[j]);
            }
        }
        return new Float32Array(result);
    }

    const vertColors = {
        'I': repeatColor([0, 1, 1]),
        'O': repeatColor([1, 1, 0]),
        'T': repeatColor([1, 0, 1]),
        'S': repeatColor([0, 1, 0]),
        'Z': repeatColor([1, 0, 0]),
        'J': repeatColor([0, 0, 1]),
        'L': repeatColor([1, 0.5, 0]),
        'boundry': repeatColor([1,1,1])
    }



    // Get canvas, WebGL context
    var canvas = document.getElementById("mycanvas");
    
    var gl = canvas.getContext("webgl");

    // Sliders at center
    var slider1 = document.getElementById('slider1');
    slider1.value = 0;
    var checkbox = document.getElementById('challenge');

    // Read shader source
    var vertexSource = document.getElementById("vertexShader").text;
    var fragmentSource = document.getElementById("fragmentShader").text;

    // Compile vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader)); return null;
    }

    // Compile fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader)); return null;
    }

    // Attach the shaders and link
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialize shaders");
    }
    gl.useProgram(shaderProgram);

    // with the vertex shader, we need to pass it positions
    // as an attribute - so set up that communication
    shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.enableVertexAttribArray(shaderProgram.PositionAttribute);
    
    shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
    gl.enableVertexAttribArray(shaderProgram.NormalAttribute);
    
    shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "vColor");
    gl.enableVertexAttribArray(shaderProgram.ColorAttribute);
   
    // this gives us access to the matrix uniform
    shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram,"uMV");
    shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram,"uMVn");
    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram,"uMVP");

    var vertexPos = new Float32Array(
        [  
            1, 1, 1,  -1, 1, 1,  -0.8, 0.8, 1.2,  0.8, 0.8, 1.2,
            1, 1, 1,   0.8, 0.8, 1.2,   0.8, -0.8, 1.2,   1, -1, 1,
            1, -1, 1,  0.8, -0.8, 1.2,  -0.8, -0.8, 1.2, -1, -1, 1,
            -1, -1, 1, -0.8, -0.8, 1.2,  -0.8, 0.8, 1.2,  -1, 1, 1,
            0.8, 0.8, 1.2,  -0.8, 0.8, 1.2,  -0.8, -0.8, 1.2,  0.8, -0.8, 1.2,

            1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,
            1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,
            -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,
            -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,
            1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1 
        ]);

    // vertex normals
    var vertexNormals = new Float32Array(
        [  
            0, 1, 1,   0, 1, 1,0, 1, 1, 0, 1, 1,
            1, 0, 1,   1, 0, 1,1, 0, 1,1, 0, 1,
            0, -1, 1,   0, -1, 1,0, -1, 1,0, -1, 1,
            -1, 0, 1,   -1, 0, 1,-1, 0, 1,-1, 0, 1,
            0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1, 
            
           1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0, 
           0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0, 
          -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0, 
           0,-1, 0,   0,-1, 0,   0,-1, 0,   0,-1, 0, 
           0, 0,-1,   0, 0,-1,   0, 0,-1,   0, 0,-1  ]);

    // vertex colors
    var vertexColors = new Float32Array(
        [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
            0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
            0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
            0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
            0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,

           1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
           0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
           1, 1, 0,   1, 1, 0,   1, 1, 0,   1, 1, 0,
           1, 0, 1,   1, 0, 1,   1, 0, 1,   1, 0, 1,
           0, 1, 1,   0, 1, 1,   0, 1, 1,   0, 1, 1 ]);

    // element index array
    var triangleIndices = new Uint8Array(
        [  0, 1, 2,   0, 2, 3,    // front
           4, 5, 6,   4, 6, 7,    // right
           8, 9,10,   8,10,11,    // top
           12,13,14,  12,14,15,    // left
           16,17,18,  16,18,19,    // bottom

	   20,21,22,  20,22,23,
              24,25,26,  24,26,27,
                28,29,30,  28,30,31,
                32,33,34,  32,34,35,
                36,37,38,  36,38,39,
     ]); // back


    // we need to put the vertices into a buffer so we can
    // block transfer them to the graphics hardware
    var trianglePosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
    trianglePosBuffer.itemSize = 3;
    trianglePosBuffer.numItems = 40;
    
    // a buffer for normals
    var triangleNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
    triangleNormalBuffer.itemSize = 3;
    triangleNormalBuffer.numItems = 40;
    
    // a buffer for colors
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
    colorBuffer.itemSize = 3;
    colorBuffer.numItems = 40;

    // a buffer for indices
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);    



    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// Bricks Init  //////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    function brick(offsets) {
        this.cubes = [];
        this.rotate = function () {
            for (var i = 0; i < this.cubes.length; i++) {
                var cube = this.cubes[i];
                var x = cube.position[0];
                var y = cube.position[1];
                cube.position[0] = -y;
                cube.position[1] = x;
                this.cubes[i] = cube;
            }
        }
        this.getCubes = function () {
            return this.cubes;
        }
        this.moveDown = function () {
            for (var i = 0; i < this.cubes.length; i++) {
                var cube = this.cubes[i];
                cube.position[1] -= 2;
                this.cubes[i] = cube;
            }
        }
        this.moveLeft = function () {
            for (var i = 0; i < this.cubes.length; i++) {
                var cube = this.cubes[i];
                cube.position[0] -= 2;
                this.cubes[i] = cube;
            }
        }
        this.moveRight = function () {
            for (var i = 0; i < this.cubes.length; i++) {
                var cube = this.cubes[i];
                cube.position[0] += 2;
                this.cubes[i] = cube;
            }
        }


        for (var i = 0; i < offsets.length; i++) {
            var cube = {
                position: [offsets[i][0] * 2, offsets[i][1] * 2, 0]
            };
            this.cubes.push(cube);
        }
    }

    function pool() {
        this.bricksPos = [
            [[0, 0], [1, 0], [0, 1], [1, 1]],
            [[0, 0], [0, 1], [0, 2], [0, 3]],
            [[0, 0], [1, 0], [2, 0], [0, 1]],
            [[0, 0], [1, 0], [2, 0], [2, 1]],
            [[0, 0], [1, 0], [1, 1], [2, 1]],
            [[0, 1], [1, 1], [1, 0], [2, 0]],
            [[0, 1], [1, 1], [1, 0], [1, 2]]
        ];
        this.getRandomBrick = function () {
            var index = Math.floor(Math.random() * this.bricksPos.length);
            return new brick(this.bricksPos[index]);
        }
    }

    var pool = new pool();

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// Game Logic //////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    var board = [];

    for (var i = -2; i < 20; i++) {
        board[i] = new Array(10).fill(0);
    }

    var gameOver = false;

    var brickOrder = [];

    var activeBrick = getNextBrick();

    var bricksOnBoard = [activeBrick];

    function getNextBrick() {
        if (brickOrder.length == 0) {
            var sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

            while (sequence.length) {
                var index = Math.floor(Math.random() * sequence.length);
                var name = sequence.splice(index, 1)[0];
                brickOrder.push(name);
            }
        }

        var name = brickOrder.pop();
        var m = bricks[name];

        var col = board[0].length / 2 - Math.ceil(m[0].length / 2);
        var row = name == 'I' ? -1 : -2;

        return {
            name: name,
            m: m,
            row: row,
            col: col
        };
    }

    function isValidMove(m, r, c) {
        for (let row = 0; row < m.length; row++) {
            for (let col = 0; col < m[row].length; col++) {
                if (m[row][col] && (c + col < 0 || c + col >= board[0].length || r + row >= board.length || board[r + row][c + col]))
                    return false;
            }
        }

        return true;
    }

    function placeBrick() {
        for (let row = 0; row < activeBrick.m.length; row++) {
            for (let col = 0; col < activeBrick.m[row].length; col++) {
                if (activeBrick.m[row][col]) {
                    if (activeBrick.row + row < 0) {
                        return StopGame();
                    }

                    board[activeBrick.row + row][activeBrick.col + col] = activeBrick.name;
                }
            }
        }

        // check for line clears starting from the bottom and working our way up
        for (let row = board.length - 1; row >= 0;) {
            if (board[row].every(cell => !!cell)) {

                // drop every row above this one
                for (let r = row; r >= 0; r--) {
                    for (let c = 0; c < board[r].length; c++) {
                        board[r][c] = board[r - 1][c];
                    }
                }
            }
            else {
                row--;
            }
        }

        activeBrick = getNextBrick();
    }


    function rotateBrick(matrix) {
        var rotated = [];

        for (var row = 0; row < matrix.length; row++) {
            rotated[row] = [];
            for (var col = 0; col < matrix[row].length; col++) {
                rotated[row][col] = matrix[col][matrix.length - row - 1];
            }
        }

        return rotated;
    }

    function StopGame() {
        gameOver = true;
        alert('Game Over');
    }




    var timeCount = 0;
    var challengeMode = false;

    // Scene (re-)draw routine
    function draw() {
        // Clear screen, prepare for rendering
        gl.clearColor(0.1, 0.1, 0.3, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (timeCount++ % 30 == 0) {
            activeBrick.row++;

            if (!isValidMove(activeBrick.m, activeBrick.row, activeBrick.col)) {
                activeBrick.row--;
                placeBrick();
            }
        }

        // Translate slider values to angles in the [-pi,pi] interval
        var angle1 = slider1.value * 0.01 * Math.PI;

        // Circle around the y-axis
        var eye = [400 * Math.sin(angle1), 100.0, 400.0 * Math.cos(angle1)];
        var target = [50, 0, 0];
        var up = [0, 1, 0];

        var cubes = [];
        // for (var i = 0; i < bricksOnBoard.length; i++) {
        //     var brick = bricksOnBoard[i];
        //     var brickCubes = brick.getCubes();
        //     for (var j = 0; j < brickCubes.length; j++) {
        //         cubes.push(brickCubes[j]);
        //     }
        // }

        // draw boundries
        for (let row = 0; row < board.length + 1; row++) {
            cubes.push({
                position: [-2, row * 2, 0],
                name: 'boundry'
            });
            cubes.push({
                position: [board[0].length * 2, row * 2, 0],
                name: 'boundry'
            });
            if (row == board.length) {
                for (let col = 0; col < board[0].length; col++) {
                    cubes.push({
                        position: [col * 2, row * 2, 0],
                        name: 'boundry'
                    });
                }
            }
        }



        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                if (board[row][col]) {
                    cubes.push({
                        position: [col * 2, row * 2, 0],
                        name: board[row][col]
                    });
                }
            }
        }

        //draw active brick
        for (let row = 0; row < activeBrick.m.length; row++) {
            for (let col = 0; col < activeBrick.m[row].length; col++) {
                if (activeBrick.m[row][col]) {
                    cubes.push({
                        position: [(activeBrick.col + col) * 2, (activeBrick.row + row) * 2, 0],
                        name: activeBrick.name
                    });
                }
            }
        }


        for (var i = 0; i < cubes.length; i++) {
            var cube = cubes[i];
            var tModel = mat4.create();
            var scale = 7;
            mat4.fromScaling(tModel, [scale, -scale, scale]);
            mat4.translate(tModel, tModel, cube.position);
            if (checkbox.checked) {
                var rotAngle = ( timeCount % 200 ) * 0.01 * Math.PI;
                mat4.rotate(tModel, tModel,  rotAngle, [-1, 1, 1]);
            }

            var tCamera = mat4.create();
            mat4.lookAt(tCamera, eye, target, up);
            mat4.translate(tCamera, tCamera, [0, 120, 0]);

            var tProjection = mat4.create();
            mat4.perspective(tProjection, Math.PI / 4, 1, 10, 1000);

            var tMV = mat4.create();
            var tMVn = mat3.create();
            var tMVP = mat4.create();
            mat4.multiply(tMV,tCamera,tModel); // "modelView" matrix
            mat3.normalFromMat4(tMVn,tMV);
            mat4.multiply(tMVP,tProjection,tMV);


            var black = new Float32Array([0.0, 0.0, 0.0]);

            // // Set up uniforms & attributes
            // gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);

            // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            // gl.bufferData(gl.ARRAY_BUFFER, vertColors[cube.name], gl.STATIC_DRAW);


            // gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize,
            //     gl.FLOAT, false, 0, 0);
            // gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
            // gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
            //     gl.FLOAT, false, 0, 0);

            // // gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
            // // Do the drawing
            // gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);

        // Set up uniforms & attributes
        gl.uniformMatrix4fv(shaderProgram.MVmatrix,false,tMV);
        gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix,false,tMVn);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix,false,tMVP);
                 
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
        gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
          gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.NormalAttribute, triangleNormalBuffer.itemSize,
          gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        
        gl.bufferData(gl.ARRAY_BUFFER, vertColors[cube.name], gl.STATIC_DRAW);
        gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize,
          gl.FLOAT,false, 0, 0);

        // Do the drawing
        gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);






            gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);

            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, black, gl.STATIC_DRAW); // Change color to black
            gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

            // Draw the cube with black color (outlines)
            gl.drawElements(gl.LINE_LOOP, triangleIndices.length, gl.UNSIGNED_BYTE, 0);

            // Restore original color for the next iteration
            gl.bufferData(gl.ARRAY_BUFFER, vertColors[cube.name], gl.STATIC_DRAW);
        }
    }



    document.addEventListener('keydown', event => {
        if (gameOver) return;

        if (event.code === 'ArrowUp') {
            var matrix = rotateBrick(activeBrick.m);
            if (isValidMove(matrix, activeBrick.row, activeBrick.col)) {
                activeBrick.m = matrix;
            }
        }
        else if (event.code === 'ArrowDown') {
            var row = activeBrick.row + 1;

            if (!isValidMove(activeBrick.m, row, activeBrick.col)) {
                activeBrick.row = row - 1;
                placeBrick();
                return;
            }

            activeBrick.row = row;
        }
        else if (event.code === 'ArrowLeft') {
            var col = activeBrick.col - 1;

            if (isValidMove(activeBrick.m, activeBrick.row, col)) {
                activeBrick.col = col;
            }
        }
        else if (event.code === 'ArrowRight') {
            var col = activeBrick.col + 1;

            if (isValidMove(activeBrick.m, activeBrick.row, col)) {
                activeBrick.col = col;
            }
        }
    });

    // slider1.addEventListener("input",draw);
    // slider2.addEventListener("input",draw);

    function animate() {
        // canvas.width = canvas.width;
        draw();
        if (gameOver) {
            return;
        }
        setTimeout(() => {
            requestAnimationFrame(animate);
        }, 1000 / 60);
    }
    animate();
}

window.onload = start;



