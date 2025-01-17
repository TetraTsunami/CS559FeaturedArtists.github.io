function start() {

    // Get canvas, WebGL context, twgl.m4
    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext("webgl");

    // Sliders at center
    var slider1 = document.getElementById('slider1');
    slider1.value = 0;
    var slider2 = document.getElementById('slider2');
    slider2.value = 0;

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
    shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram,"uMV");
    shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram,"uMVn");
    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram,"uMVP");

    // Attach samplers to texture units
    shaderProgram.texSampler1 = gl.getUniformLocation(shaderProgram, "texSampler1");
    gl.uniform1i(shaderProgram.texSampler1, 0);
    shaderProgram.texSampler2 = gl.getUniformLocation(shaderProgram, "texSampler2");
    gl.uniform1i(shaderProgram.texSampler2, 1);

    // Data ...
    
    // vertex positions
    // Vertex Positions
	var vertexPos = new Float32Array([
		// First Pyramid (Base up, apex down)
		-1, -1, -1.5,  // Base Vertex 0
		 1, -1, -1.5,  // Base Vertex 1
		 1,  1, -1.5,  // Base Vertex 2
		-1,  1, -1.5,  // Base Vertex 3
		 0,  0, -4.5,  // Apex Vertex 4

		// Second Pyramid (Base down, apex up)
		-1, -1, 1.5,   // Base Vertex 5
		 1, -1, 1.5,   // Base Vertex 6
		 1,  1, 1.5,   // Base Vertex 7
		-1,  1, 1.5,   // Base Vertex 8
		 0,  0, 4.5,   // Apex Vertex 9

		// Octahedron
		// Top
		0, 1, 0,     // Vertex 0

		// Bottom vertex
		0, -1, 0,     // Vertex 1

		// Four midpoints of the octahedron (forming a square base)
		1, 0, 0,     // Vertex 2
		-1, 0, 0,     // Vertex 3
		0, 0, 1,     // Vertex 4
		0, 0, -1      // Vertex 5
	]);

	var vertexNormals = new Float32Array([
		// First Pyramid Normals
		0, 0, 1,  // Base
		0, 0, 1,
		0, 0, 1,
		0, 0, 1,
		0, -1, 0,  // Apex faces (pointing towards the base)
		-1, 0, -1,
		1, 0, -1,
		0, 1, -1,

		// Second Pyramid Normals
		0, 0, -1, // Base
		0, 0, -1,
		0, 0, -1,
		0, 0, -1,
		0, 1, 0,  // Apex faces (pointing towards the base)
		-1, 0, 1,
		1, 0, 1,
		0, -1, 1,

		// Octahedron Normals
		// Top
		0, 1, 0,

		// Bottom vertex
		0, -1, 0,

		// Midpoints
		1, 0, 0,
		-1, 0, 0,
		0, 0, 1,
		0, 0, -1
	]);

	// vertex colors (no changes needed)
	var vertexColors = new Float32Array([
		// First Pyramid (e.g., red)
		1, 0, 0,  
		1, 0, 0,  
		1, 0, 0,  
		1, 0, 0,  
		1, 0, 0,  

		// Second Pyramid (e.g., blue)
		0, 0, 1,  
		0, 0, 1,  
		0, 0, 1,  
		0, 0, 1,  
		0, 0, 1,  

		// Octahedron (e.g., green)
		// Top vertex
		1, 0, 0,   // Red

		// Bottom vertex
		0, 1, 0,   // Green

		// Midpoints
		0, 0, 1,   // Blue
		1, 1, 0,   // Yellow
		1, 0, 1,   // Magenta
		0, 1, 1    // Cyan  
	]);

	// element index array (no changes needed)
	var triangleIndices = new Uint8Array([
		// First Pyramid
		0, 1, 4,    1, 2, 4,    2, 3, 4,    3, 0, 4,    
		0, 1, 2,    0, 2, 3,    // Base

		// Second Pyramid
		5, 6, 9,    6, 7, 9,    7, 8, 9,    8, 5, 9,    
		5, 6, 7,    5, 7, 8,    // Base

		// Octahedron
		// Top half (top vertex with four triangles)
		10, 12, 14,   // Top - front-right
		10, 14, 13,   // Top - front-left
		10, 13, 15,   // Top - back-left
		10, 15, 12,   // Top - back-right

		// Bottom half (bottom vertex with four triangles)
		11, 14, 12,   // Bottom - front-right
		11, 13, 14,   // Bottom - front-left
		11, 15, 13,   // Bottom - back-left
		11, 12, 15    // Bottom - back-right
	]);


		
	var vertexTextureCoords = new Float32Array([
		// First Pyramid
		0, 0,   1, 0,   1, 0.5,   0, 0.5,   2/3, 1/3, 
		// Second Pyramid
		0, 0,   1, 0,   1, 0.5,   0, 0.5,   2/3, 1/3,  
		
		// Octahedron
		0.5, .5, 
		0.5, 1, 
		0.25, 0.75, 
		0.75, 0.75, 
		1, 0.75, 
		0, 0.75
	]);




    // we need to put the vertices into a buffer so we can
    // block transfer them to the graphics hardware
    // Vertex Position Buffer
	var trianglePosBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
	trianglePosBuffer.itemSize = 3;
	trianglePosBuffer.numItems = 6; // 6 vertices for an octahedron

	// Normal Buffer
	var triangleNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
	triangleNormalBuffer.itemSize = 3;
	triangleNormalBuffer.numItems = 6;

	// Color Buffer
	var colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
	colorBuffer.itemSize = 3;
	colorBuffer.numItems = 6;

	// Texture Coordinate Buffer
	var textureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexTextureCoords, gl.STATIC_DRAW);
	textureBuffer.itemSize = 2;
	textureBuffer.numItems = 6;

	// Element Index Buffer
	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);
   

    // Set up texture
    var texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var image1 = new Image();

    var texture2 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var image2 = new Image();

    function initTextureThenDraw()
    {
      image1.onload = function() { loadTexture(image1,texture1); };
      image1.crossOrigin = "anonymous";
	  image1.src = "https://farm6.staticflickr.com/65535/54195653334_860d4abc69_o.png"
	  //image1.src = "https://farm6.staticflickr.com/65535/54182157200_93ac543ee1_o.png"
      //image1.src = "https://farm6.staticflickr.com/5564/30725680942_e3bfe50e5e_b.jpg";

      image2.onload = function() { loadTexture(image2,texture2); };
      image2.crossOrigin = "anonymous";
      image2.src = "https://farm6.staticflickr.com/5726/30206830053_87e9530b48_b.jpg";

      window.setTimeout(draw,200);
    }

    function loadTexture(image, texture) {
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Load the texture image
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

		// Generate mipmaps for the texture
		gl.generateMipmap(gl.TEXTURE_2D);

		// Set filtering modes for mipmapping
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		// Set wrapping modes to wrap around the image
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	}    
    // Scene (re-)draw routine
    function draw() {
    
        // Translate slider values to angles in the [-pi,pi] interval
		
		// Translate slider values to angles
		var angle1 = slider1.value * 0.01 * Math.PI + Math.PI/2;
		var angle2 = slider2.value; // Directly use slider value (0 to 1)

		// Camera setup
		var eye = [600 * Math.sin(angle1), 600 * Math.sin(angle1), 600.0 * Math.cos(angle1)];
		var target = [0, 0, 0];
		var up = [0, 1, 0];
		
		var tModel = mat4.create();
        mat4.fromScaling(tModel,[100,100,100]);
        mat4.rotate(tModel,tModel,angle2,[0,0,1]);

		var tCamera = mat4.create();
		mat4.lookAt(tCamera, eye, target, up);

		var tProjection = mat4.create();
		mat4.perspective(tProjection, Math.PI / 4, 1, 10, 1000);

		// Clear screen, prepare for rendering
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
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
                 
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
        gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
          gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.NormalAttribute, triangleNormalBuffer.itemSize,
          gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize,
          gl.FLOAT,false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.vertexAttribPointer(shaderProgram.texcoordAttribute, textureBuffer.itemSize,
          gl.FLOAT, false, 0, 0);

	    // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture2);

        // Do the drawing
        gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);

    }

    slider1.addEventListener("input",draw);
    slider2.addEventListener("input",draw);
    initTextureThenDraw();
}

window.onload=start;



