

function init_textures_render() {

    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext("webgl");

    // load images, base64 encoded in JSON object
    var IMAGES = {};
    for (var img in TEXTURES) {
        IMAGES[img] = new Image();
        IMAGES[img].src = TEXTURES[img];
    }


    const DELTA = .005; // global angle rate of change

    // 360-deg camera angle configurations
    var cameraRadius = 500;
    var cameraTheta = 1.0; // non-zero or uMV will is a null-space and the program will crash
    var cameraPhi = 1.0;

   
    var scaleFactor = 3.0; // zoom

    var keysPressed = {};
    window.addEventListener('keydown', (event) => {
        if (event.key != "m")
            keysPressed[event.key] = true;
        else 
            keysPressed[event.key] = !keysPressed[event.key];

    });
    window.addEventListener('keyup', (event) => {
        if (event.key != "m")
            keysPressed[event.key] = false;
        
    });

    // adjust camera rotation and zoom upon draw, returns new eye for lookAt transform
    var update_camera = function(){

        // NOTE: for spherical coordinates PHI=[0,2PI], THETA=[0,PI]


        if (keysPressed['w']) { // up
            cameraPhi -= DELTA; 
        }
        if (keysPressed['a']) { // left
            cameraTheta -= DELTA; 
        }
        if (keysPressed['s']) { // down
            cameraPhi += DELTA; 
        }
        if (keysPressed['d']) { // right
            cameraTheta += DELTA;
        }

        // running into null transform because of zero values, set to some value small enough, but non-zero to avoid crashing
        //if (cameraPhi > (2*Math.PI) || cameraPhi == 0.0) cameraPhi = .0001;
        //if (cameraTheta > Math.PI || cameraTheta == 0.0) cameraTheta = .0001;
        if (cameraPhi == 0.0) cameraPhi = .0001;
        if (cameraTheta == 0.0) cameraTheta = .0001;
     
        var rad = cameraRadius;
        var phi = cameraPhi;
        var theta = cameraTheta;
        var eye = [rad * Math.sin(phi) * Math.cos(theta), rad * Math.cos(phi), rad * Math.sin(phi) * Math.sin(theta)];
        eye = vec3.scale(eye, eye, scaleFactor);
        return eye;
    }

    // rotation parameters for object tilt about Z-axis
    var gamma = 0.0;
    var mouseX = 0.0;
    var mouseY = 0.0;

    window.addEventListener("mousemove", (event) => {
        // Get the mouse coordinates relative to the canvas
        var rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left - canvas.width / 2;
        mouseY = mouseY = canvas.height / 2 - (event.clientY - rect.top); // Flip the Y-axis
       
        // Calculate the angle in radians
        gamma  = Math.atan2(mouseX, mouseY);

      });


    // set model (local) transformation, rotation if applicable
    var model_transform = function(viewMatrix){
    
        var tModel = mat4.create();
        mat4.fromScaling(tModel,[10,10,10]);

        if (keysPressed['m'])
            mat4.rotateZ(tModel, tModel, -gamma);
        
        return tModel;   
        
    }


     // scroll-wheel handling for zoom factor on camera eye
     window.addEventListener('wheel', (event) => {
        var scrollAmount = event.deltaY;

        if (scrollAmount > 0) { // away from object
            // Scrolling downward (forward)
            scaleFactor += 0.1;
  
        } else if (scrollAmount < 0) { // toward object
            // Scrolling upward (backward)
            scaleFactor = Math.max(scaleFactor - 0.1, 0.1);
       
        }

        event.preventDefault();

    });




    // CONFIGURE GL, LOAD SHADERS
    var vertexSource = document.getElementById("vertexShader").text;
    var fragmentSource = document.getElementById("fragmentShader").text;

    // Compile vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader));
        return null;
    }

    // Compile fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader));
        return null;
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

  
    
    // vs position
    shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.enableVertexAttribArray(shaderProgram.PositionAttribute);

    // vs normal
    shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
    gl.enableVertexAttribArray(shaderProgram.NormalAttribute);


    // vs texture coordinate
    shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
    gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);


    // this gives us access to the matrix uniform
    shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram, "uMV");
    shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram, "uMVn");
    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram, "uMVP");

    // attah sampling unit for texture
    shaderProgram.texSampler1 = gl.getUniformLocation(shaderProgram, "texSampler1");
    gl.uniform1i(shaderProgram.texSampler1, 0);

    // attach shader parameters for fragment
    shaderProgram.Ns = gl.getUniformLocation(shaderProgram, "specularE");
    shaderProgram.Ka = gl.getUniformLocation(shaderProgram, "ambientC");
    shaderProgram.Ks = gl.getUniformLocation(shaderProgram, "specularC");
    //shaderProgram.lightSource = gl.getUniformLocation(shaderProgram, "lightV");
  
    render_objs();
    // render 3D models, grouped by texture
    function render_objs() {
        
      
        // Clear screen, prepare for rendering
        gl.clearColor(0.17,0.18,0.47, 1.0);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var model = file;
        
        material_file = MODELS[model]['mtllib']; // material file associated with this model, for texturing

        for (var mesh in MODELS[model]['meshes']) {

            // flattened vertex, normal, and texture coordinates from .obj (written into JSON object by my lovely parser)
            var V = new Float32Array(MODELS[model]['meshes'][mesh][0].flat());
            var VN = new Float32Array(MODELS[model]['meshes'][mesh][2].flat());
            var VT =  new Float32Array(MODELS[model]['meshes'][mesh][1].flat());


            var MAT = MATERIALS[material_file][mesh];

            // VERTEX AND NORMAL VBOs
            var POS_BUFFER = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, POS_BUFFER);
            gl.bufferData(gl.ARRAY_BUFFER, V, gl.STATIC_DRAW);
            POS_BUFFER.itemSize = 3;
            POS_BUFFER.numItems = V.length / 3;

            var NORM_BUFFER = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, NORM_BUFFER);
            gl.bufferData(gl.ARRAY_BUFFER, VN, gl.STATIC_DRAW);
            NORM_BUFFER.itemSize = 3;
            NORM_BUFFER.numItems = VN.length / 3;

    
            // TEXTURE VBO
            var TEX_BUFFER = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, TEX_BUFFER);
            gl.bufferData(gl.ARRAY_BUFFER, VT, gl.STATIC_DRAW);
            TEX_BUFFER.itemSize = 2;
            TEX_BUFFER.numItems = VT.length/2;

            // INIT TEXTURE OBJ
            var texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
            // set pre-loaded texture corresponding to the mesh
            var image = IMAGES[MAT['map_Kd']];
    
           
            draw(); // draw protocol once dependencies are set
            function draw() {

            
                // camera parameters, set eye based on zoom/rotation factor
                var eye = update_camera();
                var target = [0,0,0];
                var up = [0,1,0];
                var tCamera = mat4.create();
                mat4.lookAt(tCamera, eye, target, up);   
            
                // scale, rotate model if applicable
                var tModel = model_transform(tCamera);
            
                // perspective projection (NDC)
                var tProjection = mat4.create();
                const aspect = canvas.clientWidth / canvas.clientHeight;
                mat4.perspective(tProjection,Math.PI/4,aspect,10,100000);
                
                // apply transforms
                var tMVP = mat4.create();
                let tMV = mat4.multiply(tMVP,tCamera,tModel); 
                let tMVn = mat3.normalFromMat4(mat3.create(),tMV);
                mat4.multiply(tMVP,tProjection,tMV);
            
                // Set up uniforms & attributes
                gl.uniformMatrix4fv(shaderProgram.MVmatrix, false, tMV);
                gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix, false, tMVn);
                gl.uniformMatrix4fv(shaderProgram.MVPmatrix, false, tMVP);


                // fragment shader uniforms (material file config)
                gl.uniform1f(shaderProgram.Ns, MAT['Ns']);
                gl.uniform1f(shaderProgram.Ka, MAT['Ka'][0]);
                gl.uniform1f(shaderProgram.Ks, MAT['Ks'][0]);
          
            
                // bin, set position and normal in shader program
                gl.bindBuffer(gl.ARRAY_BUFFER, POS_BUFFER);
                gl.vertexAttribPointer(shaderProgram.PositionAttribute, POS_BUFFER.itemSize, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, NORM_BUFFER);
                gl.vertexAttribPointer(shaderProgram.NormalAttribute, NORM_BUFFER.itemSize, gl.FLOAT, false, 0, 0);
            
                // initialize vertex shader texture coordinate with texture buffer 
                gl.bindBuffer(gl.ARRAY_BUFFER, TEX_BUFFER);
                gl.vertexAttribPointer(shaderProgram.texcoordAttribute, TEX_BUFFER.itemSize, gl.FLOAT, false, 0, 0);
            
                // Bind texture
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            
                // mipmap
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            
            
                // draw at triangle granularity
                gl.drawArrays(gl.TRIANGLES, 0, POS_BUFFER.numItems);
            }

        }
        
        window.requestAnimationFrame(render_objs);

    }       
}

var file = 'beachbowl_blender.obj'; // default model

// handler for model swap
function selectModel(f){
    file = f;
}

// load textures and render the models
window.onload = init_textures_render; 