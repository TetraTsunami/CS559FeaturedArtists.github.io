function start () 
{
    var canvas = document.getElementById("my-canvas");
    var gl = canvas.getContext("webgl");

    var slider1 = document.getElementById('slider1');
    slider1.value = 0;

    var slider2 = document.getElementById('slider2');
    slider2.value = 0;

    //get shader sources
    var vertexSource = document.getElementById("vertexShader").text;
    var fragmentSource = document.getElementById("fragmentShader").text;

    let rotationAngle = 0;
    var scaleFactor = 1;

    //compile vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);//(shader, og source) sets source code of a webglShader
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
    {
        alert(gl.getShaderInfoLog(vertexShader));
        return null;
    }
    //compile fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
    {
        alert(gl.getShaderInfoLog(fragmentShader));
        return null;
    }
    // attach shaders and links
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
    {
        alert("Could not initialize shaders");
    }
    gl.useProgram(shaderProgram);

    // must pass the vertex shader positions as an attribute
    shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition"); // position is vPosition, but i can't rename it
    gl.enableVertexAttribArray(shaderProgram.PositionAttribute);

    shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
    gl.enableVertexAttribArray(shaderProgram.NormalAttribute);

    shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "vColor");
    gl.enableVertexAttribArray(shaderProgram.ColorAttribute);

    
 
        //accesses to the matrix uniform
        shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram,"uMV");
        shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram,"uMVn");
        shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram,"uMVP");


    /* TODO: 
    // Attach samplers to texture units
    shaderProgram.texSampler1 = gl.getUniformLocation(shaderProgram, "texSampler1");
    gl.uniform1i(shaderProgram.texSampler1, 0);
    shaderProgram.texSampler2 = gl.getUniformLocation(shaderProgram, "texSampler2");
    gl.uniform1i(shaderProgram.texSampler2, 1);
    */
    

        // vertex positions
        var vertexPos = new Float32Array(
            [  1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,
               1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,
               1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,
              -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,
              -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,
               1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1 ]);

            // vertex normals
    var vertexNormals = new Float32Array(
        [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1, 
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
           0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1 ]);

        // element index array
        var triangleIndices = new Uint8Array(
            [  0, 1, 2,   0, 2, 3,    // front
               4, 5, 6,   4, 6, 7,    // right
               8, 9,10,   8,10,11,    // top
              12,13,14,  12,14,15,    // left
              16,17,18,  16,18,19,    // bottom
              20,21,22,  20,22,23 ]); // back

    // put the vertices into a buffer so we can
    // block transfer them to the graphics hardware
    var trianglePosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
    trianglePosBuffer.itemSize = 3;
    trianglePosBuffer.numItems = 24;

    //normal buffer
    var triangleNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
    triangleNormalBuffer.itemSize = 3;
    triangleNormalBuffer.numItems = 24;

     // colors buffer
     var colorBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
     gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
     colorBuffer.itemSize = 3;
     colorBuffer.numItems = 24;

     //indices buffer
     var indexBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);


     function draw() {
        //angles in the [-pi,pi] interval
       var angle1 = slider1.value*0.01*Math.PI;
       var angle2 = slider2.value*0.01*Math.PI;

        // Circle around the y-axis
        var eye = [400*Math.sin(angle1),150.0,400.0*Math.cos(angle1)];
        var target = [0,0,0];
        var up = [0,1,0];

        var tModel = mat4.create();
        mat4.fromScaling(tModel,[70 * scaleFactor, 100 * scaleFactor, 100 * scaleFactor]);
        mat4.rotate(tModel,tModel,angle2,[0,0,1]);
        

        var tCamera = mat4.create();
        mat4.lookAt(tCamera, eye, target, up);      

        var tProjection = mat4.create();
        mat4.perspective(tProjection,Math.PI/4,1,10,1000);
      
        var tMV = mat4.create();
        var tMVn = mat3.create();
        var tMVP = mat4.create();

        mat4.multiply(tMV,tCamera,tModel); // "modelView" matrix
        mat3.normalFromMat4(tMVn,tMV);
        mat4.multiply(tMVP,tProjection,tMV);
      
         gl.clearColor(0.0, 0.0, 0.0, 1.0);
         gl.enable(gl.DEPTH_TEST); // z-buffer
         gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
     
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
         gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize,
           gl.FLOAT,false, 0, 0);
         
 
         // Do the drawing
         gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);
 
         var tModel2 = mat4.create();
         mat4.fromScaling(tModel2, [70 * scaleFactor, 100 * scaleFactor, 100 * scaleFactor]);
         mat4.rotate(tModel2, tModel2, angle2 + Math.PI / 4, [0, 0, 1]);
         
         mat4.multiply(tMV, tCamera, tModel2);
         mat3.normalFromMat4(tMVn, tMV);
         mat4.multiply(tMVP, tProjection, tMV);
         
         // Set up uniforms & attributes for the second cube
         gl.uniformMatrix4fv(shaderProgram.MVmatrix, false, tMV);
         gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix, false, tMVn);
         gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);
     
         // Draw the second cube
         gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);

         // draw third
         var tModel3 = mat4.create();
         mat4.fromScaling(tModel3, [70 * scaleFactor, 100 * scaleFactor, 100 * scaleFactor]);
         mat4.rotate(tModel3, tModel3, angle2 + Math.PI / 8, [0, 0, 1]);
         
         mat4.multiply(tMV, tCamera, tModel3);
         mat3.normalFromMat4(tMVn, tMV);
         mat4.multiply(tMVP, tProjection, tMV);
         
         // Set up uniforms & attributes for the second cube
         gl.uniformMatrix4fv(shaderProgram.MVmatrix, false, tMV);
         gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix, false, tMVn);
         gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);
     
         // Draw the second cube
         gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);


         var tModel4 = mat4.create();
         mat4.fromScaling(tModel4, [70 * scaleFactor, 100 * scaleFactor, 100 * scaleFactor]);
         mat4.rotate(tModel4, tModel4, angle2 - Math.PI/8, [0, 0, 1]);
         
         mat4.multiply(tMV, tCamera, tModel4);
         mat3.normalFromMat4(tMVn, tMV);
         mat4.multiply(tMVP, tProjection, tMV);
         
         // Set up uniforms & attributes for the second cube
         gl.uniformMatrix4fv(shaderProgram.MVmatrix, false, tMV);
         gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix, false, tMVn);
         gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);
     
         // Draw the second cube
         gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);
         
     }

        let scaleTime = 0;
        function animate() {
        rotationAngle += 0.01; // Increment rotation angle
        slider1.value = (Math.sin(rotationAngle) * 150 + 50); 

        scaleTime += 0.01;
        scaleFactor = Math.abs(Math.sin(scaleTime)) + 0.5;
        draw();
        requestAnimationFrame(animate);

        
        }

     slider1.addEventListener("input", draw);
     slider2.addEventListener("input", draw);
     //draw();
     animate();
     
}
window.onload = start;