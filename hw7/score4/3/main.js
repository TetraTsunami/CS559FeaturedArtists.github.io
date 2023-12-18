function start() {

    // Get canvas, WebGL context, twgl.m4
    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext("webgl");

    // Setup shaders
    var myShader = new Shader(gl,"vertexShader","fragmentShader")
    myShader.use();

    myShader.addAttribute("PositionAttribute","vPosition");
    myShader.addAttribute("NormalAttribute","vNormal");
    myShader.addAttribute("ColorAttribute","vColor");
    myShader.addAttribute("texcoordAttribute","vTexCoord");
   
    myShader.addUniform("MVmatrix", "uMV");
    myShader.addUniform("MVNormalmatrix", "uMVn");
    myShader.addUniform("MVPmatrix", "uMVP");

    // Setup meshes
    var cubeMesh = new Mesh(gl, cubeVerts, cubeNormals, cubeIndices, cubeColors);
    var terrain = new Terrain();
    var terrainMesh = new Mesh(gl, terrain.verts,terrain.normals, terrain.indices, terrain.colors)
    var planeColors = []
    for (let i = 0; i < plane.vertexPos.length; i++){
        planeColors.push(1);
    }
    var planeMesh = new Mesh(gl, plane.vertexPos, plane.vertexNormals, plane.triangleIndices, planeColors);

    // Set up player position
    playerPos = vec3.create()
    playerLookDir = vec3.fromValues(0,-400,-300);
    vec3.normalize(playerLookDir,playerLookDir);
    playerLookUp = vec3.fromValues(0,0,1);

    // Scene (re-)draw routine
    function draw() {

        var tCamera = mat4.create();
        mat4.lookAt(tCamera, [0,0.0,0], playerLookDir, playerLookUp);      
    
        var playerTransform = vec3.create();
        vec3.scale(playerTransform,playerPos,-1)

        var tProjection = mat4.create();
        mat4.perspective(tProjection,Math.PI/4,1,10,100000);
      
        // Clear screen, prepare for rendering
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        
        var tModelPlane = mat4.create();
        mat4.scale(tModelPlane,tModelPlane,[100,100,100]);
        mat4.translate(tModelPlane,tModelPlane,[0,-7,-6]);
        mat4.rotateX(tModelPlane, tModelPlane, 1.9)
        
        // TODO optimize this, using offset so you don't have to bind each frame
        planeMesh.setupMesh(gl)
        planeMesh.draw(gl, myShader, tModelPlane, tCamera, tProjection);

        var tModelTerrain = mat4.create();
        mat4.fromScaling(tModelTerrain,[100,100,100]);
        mat4.translate(tModelTerrain,tModelTerrain,[-20,-50,-30]);
        mat4.translate(tModelTerrain,tModelTerrain,playerTransform);
        terrainMesh.setupMesh(gl)
        terrainMesh.draw(gl,myShader, tModelTerrain, tCamera, tProjection);
    }

    // UI for moving player and looking
    speed = 0.1
    lookSpeed = 0.02
    document.addEventListener('keydown', (event) => {

      if (event.shiftKey) {
        const down = vec3.create();
        vec3.scale(down,playerLookUp,-speed);
        vec3.add(playerPos,playerPos,down);
      }

      switch (event.key) {
        case 'w':
            const forward = vec3.create();
            vec3.scale(forward,playerLookDir,speed);
            vec3.add(playerPos,playerPos,forward);
            break;
        case 'a':
            const left = vec3.create();
            vec3.cross(left, playerLookUp, playerLookDir);
            vec3.scale(left,left,speed);
            vec3.add(playerPos,playerPos,left);
            break;
        case 's':
            const back = vec3.create();
            vec3.scale(back,playerLookDir,-speed);
            vec3.add(playerPos,playerPos,back);
            break;
        case 'd':
            const right = vec3.create();
            vec3.cross(right, playerLookUp, playerLookDir);
            vec3.scale(right,right,-speed);
            vec3.add(playerPos,playerPos,right);
            break;
        case ' ':
            const down = vec3.create();
            vec3.scale(down,playerLookUp,speed);
            vec3.add(playerPos,playerPos,down);
            break;

        case 'ArrowLeft':
            vec3.rotateZ(playerLookDir, playerLookDir, [0,0,0], lookSpeed)
            vec3.normalize(playerLookDir,playerLookDir);
            break;
        case 'ArrowRight':
            vec3.rotateZ(playerLookDir, playerLookDir, [0,0,0], -lookSpeed)
            vec3.normalize(playerLookDir,playerLookDir);
            break;
      }
      console.log(playerPos)
      draw();
    });

    draw();
}

window.onload=start;
