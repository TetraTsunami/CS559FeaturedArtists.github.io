function start() {

    // Get canvas, WebGL context, twgl.m4
    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext("webgl");

    // Sliders at center
    var slider1 = document.getElementById('slider1');
    slider1.value = 0;
    var slider2 = document.getElementById('slider2');
    slider2.value = 0;
    var slider3 = document.getElementById('slider3');
    slider3.value = 60;
    var slider4 = document.getElementById('slider4');
    slider4.value = 20;
    var slider5 = document.getElementById('slider5');
    slider5.value = 50;

    // Read shader source
    var vertexSource = document.getElementById("vertexShader").text;
    var fragmentSource = document.getElementById("fragmentShader").text;

    // Compile vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader,vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(vertexShader)); return null; }
    
    // Compile fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader,fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(fragmentShader)); return null; }
    
    // Attach the shaders and link
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialize shaders"); }
    gl.useProgram(shaderProgram);	    
    
    // with the vertex shader, we need to pass it positions
    // as an attribute - so set up that communication
    shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.enableVertexAttribArray(shaderProgram.PositionAttribute);
    
    shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
    gl.enableVertexAttribArray(shaderProgram.NormalAttribute);
    
    shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "vColor");
    gl.enableVertexAttribArray(shaderProgram.ColorAttribute);
    
    shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
    gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);
   
    // this gives us access to the matrix uniform
    var time=0;
    shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram,"uMV");
    shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram,"uMVn");
    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram,"uMVP");
    shaderProgram.Time = gl.getUniformLocation(shaderProgram,"time");

   

    // Scene (re-)draw routine
    function draw() {
      var polygonResolution = slider4.value;
      var twist =parseInt( slider3.value)+180/polygonResolution ;
      var topY=1;
      var bottomY=-1;
      var topW=.8;
      var bottomW=1;



          // Data ...
    
          // vertex positions
          var vertexPos = calcVertexPositions();
          //console.log(vertexPos)
           /*vertexPos = new Float32Array(
            [  1, -1, 0,  1, 1, 0,  0,-1, 1,   0, 1, 1,
               1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1
        ]);*/
             // console.log(vertexPos)
        // vertex normals
        var vertexNormals = calcVertexNormals();


        // vertex colors
        var vertexColors = calcColors();
         /*vertexColors =new Float32Array(
          [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
             1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
             0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
             1, 1, 0,   1, 1, 0,   1, 1, 0,   1, 1, 0,
             1, 0, 1,   1, 0, 1,   1, 0, 1,   1, 0, 1,
             0, 1, 1,   0, 1, 1,   0, 1, 1,   0, 1, 1 ]);*/

          // element index array
           var triangleIndices =  calcIndices();
           /*
           console.log(triangleIndices)
         triangleIndices =  new Uint16Array(
          [  0, 1, 2,   1, 2, 3,    // front
             2, 3, 4,   3, 4, 5,    // right
             4, 5,6,   5,6,7,    // top
            6,7,0,  7,0,1    // left
               // bottom
           ]); // back
           console.log(triangleIndices)*/
         //console.log(triangleIndices.length)


        // we need to put the vertices into a buffer so we can
        // block transfer them to the graphics hardware
        var trianglePosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
        trianglePosBuffer.itemSize = 3;
        trianglePosBuffer.numItems = vertexPos.length/3;
  
        // a buffer for normals
        var triangleNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
        triangleNormalBuffer.itemSize = 3;
        triangleNormalBuffer.numItems = vertexNormals.length/3;
  
        // a buffer for colors
        var colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
        colorBuffer.itemSize = 3;
        colorBuffer.numItems = vertexColors.length/3;
        //console.log(vertexColors.length)

        // a buffer for indices
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);    
        //indexBuffer.itemSize=3;
        //indexBuffer.numItems=triangleIndices.length;

        // Translate slider values to angles in the [-pi,pi] interval
        var angle1 = slider1.value*Math.PI/180;
        var angle2 = slider2.value*Math.PI/180;
    
        // Circle around the y-axis
        //var eye = [400*Math.sin(angle1),150.0,400.0*Math.cos(angle1)];
        var eye = [0,150.0 + 150*Math.sin(angle1),400.0*Math.cos(angle1)];
        var target = [0,0,0];
        var up = [0,1,0];
    
        var tModel = mat4.create();
        mat4.fromScaling(tModel,[100,100,100]);
        mat4.rotate(tModel,tModel,angle2,[1,0,1]);
      
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

      
        // Clear screen, prepare for rendering
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        // Set up uniforms & attributes
        gl.uniformMatrix4fv(shaderProgram.MVmatrix,false,tMV);
        gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix,false,tMVn);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix,false,tMVP);
        gl.uniform1f(shaderProgram.Time,time);
                 
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

        function calcVertexPositions()
        {
          positions = new Float32Array(polygonResolution * 2 * 3);
          for(var i =0;i<polygonResolution ;i++)
          {
            var angle = i/polygonResolution * 2*Math.PI;
            positions[i*6] =Math.cos(angle)*bottomW
            positions[i*6+1] = bottomY
            positions[i*6+2] = Math.sin(angle)*bottomW
            angle = angle + twist /180 *Math.PI
            positions[i*6+3] = Math.cos(angle)*topW
            positions[i*6+4] = topY
            positions[i*6+5] = Math.sin(angle)*topW
          }

          //console.log(positions.flat())
          return positions;
        }
    
        function calcVertexNormals()
        {
          var normals = new Float32Array(polygonResolution * 2*3);
          for(var i =0;i<polygonResolution ;i++)
            {
              var angle = i/polygonResolution * 2*Math.PI;
              normals[i*6] =Math.cos(angle)*bottomW
              normals[i*6+1] = twist/230
              normals[i*6+2] = Math.sin(angle)*bottomW
              angle = angle + twist /180 *Math.PI
              normals[i*6+3] = Math.cos(angle)*topW
              normals[i*6+4] = -twist/180
              normals[i*6+5] = Math.sin(angle)*topW
            }

          return normals;
        }
    
        function calcIndices()
        {
          indices = new Uint8Array(polygonResolution * 2*3);
          for(var i =0;i<polygonResolution ;i++)
            {
              indices[i*6] = (i*2)%(vertexPos.length/3);
              indices[i*6+1] = (i*2+1)%(vertexPos.length/3)
              indices[i*6+2] = (i*2+2)%(vertexPos.length/3)
              indices[i*6+3] = (i*2+1)%(vertexPos.length/3)
              indices[i*6+4] =  (i*2+2)%(vertexPos.length/3)
              indices[i*6+5] = (i*2+3)%(vertexPos.length/3);
            }
          //console.log(indices.flat());

          
          return indices;
        }
    
        function calcColors()
        {
          var colors = new Float32Array(polygonResolution * 2*3);
          for(var i =0;i<polygonResolution ;i++)
            {
              colors[i*6] =.8
              colors[i*6+1] = .8
              colors[i*6+2] =.8
              colors[i*6+3] =.2
              colors[i*6+4] =.2
              colors[i*6+5] = .2
            }
          //console.log(colors.flat());
          return colors;
        }
    }


    //slider1.addEventListener("input",draw);
    //slider2.addEventListener("input",draw);
    //slider3.addEventListener("input",draw);
    //slider4.addEventListener("input",draw);
    //draw();
    function update()
    {
      draw();
      requestAnimationFrame(update);
      //console.log(time)
      time+=.001 * slider5.value/50;
    }
    update();
}



window.onload=start;
