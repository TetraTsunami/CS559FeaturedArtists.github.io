function start() {
    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext("webgl");
    if (!gl) { alert("WebGL not supported"); return; }
    var ext = gl.getExtension('WEBGL_depth_texture') || gl.getExtension('MOZ_WEBGL_depth_texture') || gl.getExtension('WEBKIT_WEBGL_depth_texture');
    if(!ext) {
      alert("Your browser does not support WEBGL_depth_texture extension");
      return;
    }

    var sliderCam = document.getElementById("sliderCam");
    var sliderX = document.getElementById("sliderX");
    var sliderY = document.getElementById("sliderY");
    var sliderZ = document.getElementById("sliderZ");
    var sliderTX = document.getElementById("sliderTX");
    var sliderTY = document.getElementById("sliderTY");
    var sliderTZ = document.getElementById("sliderTZ");
    var sliderLight = document.getElementById("sliderLight");

    var vertexSource = document.getElementById("vertexShader").text;
    var fragmentSource = document.getElementById("fragmentShader").text;

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader));
        return null;
    }

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader));
        return null;
    }

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram,vertexShader);
    gl.attachShader(shaderProgram,fragmentShader);
    gl.linkProgram(shaderProgram);
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialize shaders");
    }
    gl.useProgram(shaderProgram);

    shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram,"vPosition");
    gl.enableVertexAttribArray(shaderProgram.PositionAttribute);

    shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram,"vNormal");
    gl.enableVertexAttribArray(shaderProgram.NormalAttribute);

    shaderProgram.texCoordAttribute = gl.getAttribLocation(shaderProgram,"vTexCoord");
    gl.enableVertexAttribArray(shaderProgram.texCoordAttribute);

    shaderProgram.TangentAttribute = gl.getAttribLocation(shaderProgram,"vTangent");
    gl.enableVertexAttribArray(shaderProgram.TangentAttribute);

    shaderProgram.ModelMatrix = gl.getUniformLocation(shaderProgram,"uModel");
    shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram, "uMV");
    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram, "uMVP");
    shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram, "uMVn");
    shaderProgram.texSampler = gl.getUniformLocation(shaderProgram, "texSampler");
    shaderProgram.normalMapSampler = gl.getUniformLocation(shaderProgram, "normalMapSampler");
    shaderProgram.decalSampler = gl.getUniformLocation(shaderProgram, "decalSampler");
    gl.uniform1i(shaderProgram.texSampler,0);
    gl.uniform1i(shaderProgram.normalMapSampler,1);
    gl.uniform1i(shaderProgram.decalSampler,2);

    var uShadowPass = gl.getUniformLocation(shaderProgram,"uShadowPass");
    var uLightViewMatrix = gl.getUniformLocation(shaderProgram,"uLightViewMatrix");
    var uLightProjectionMatrix = gl.getUniformLocation(shaderProgram,"uLightProjectionMatrix");
    var uShadowMapSampler = gl.getUniformLocation(shaderProgram,"uShadowMapSampler");
    gl.uniform1i(uShadowMapSampler,3);
    var uLightDir = gl.getUniformLocation(shaderProgram,"uLightDir");
    var uLightColor = gl.getUniformLocation(shaderProgram,"uLightColor");
    gl.uniform3fv(uLightColor, [1.0, 1.0, 1.0]);
    var uUseNormalMap = gl.getUniformLocation(shaderProgram,"uUseNormalMap");
    var uUseDecal = gl.getUniformLocation(shaderProgram,"uUseDecal");
    var uSpecularIntensity = gl.getUniformLocation(shaderProgram,"uSpecularIntensity");
    var uSpecularPower = gl.getUniformLocation(shaderProgram,"uSpecularPower");
    gl.uniform1f(uSpecularIntensity,0.5);
    gl.uniform1f(uSpecularPower,20.0);

    var buffers = initBuffers(gl);
    var shadowMapFBO = createShadowMapFBO(gl,1024,1024);
    var textures = initTextures(gl, function(){
        textures.mirrorFBO = createFBO(gl,512,512);
        drawScene();
    });

    function drawScene() {
        var angleCam = sliderCam.value*0.01*Math.PI;
        var eye = [400*Math.sin(angleCam),200,400*Math.cos(angleCam)];
        var target = [0,50,0];
        var up = [0,1,0];
        var angleLight = sliderLight.value*0.01*Math.PI;
        var lightDir = [Math.sin(angleLight), Math.cos(angleLight), 0.0];
        gl.uniform3fv(uLightDir, lightDir);
        var lightPos = [-lightDir[0]*500, -lightDir[1]*500, -lightDir[2]*500];
        var lightTarget = [0,0,0];
        var lightUp = [0,1,0];
        var tLightView = mat4.create();
        mat4.lookAt(tLightView, lightPos, lightTarget, lightUp);
        var tLightProjection = mat4.create();
        mat4.ortho(tLightProjection, -200,200,-200,200,0.1,2000);

        gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFBO.fbo);
        gl.viewport(0,0,1024,1024);
        gl.clearColor(1.0,1.0,1.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.uniform1i(uShadowPass,true);
        gl.uniformMatrix4fv(uLightViewMatrix,false,tLightView);
        gl.uniformMatrix4fv(uLightProjectionMatrix,false,tLightProjection);
        drawAllObjects(gl,shaderProgram,buffers,textures,tLightView,1024,1024,false);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

        var eyeRef = [5 - eye[0], eye[1], eye[2]];
        var targetRef = [5 - target[0], target[1], target[2]];

        gl.bindFramebuffer(gl.FRAMEBUFFER,textures.mirrorFBO.fbo);
        gl.viewport(0,0,512,512);
        gl.clearColor(0.8,0.9,1.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        var tCameraRef = mat4.create();
        mat4.lookAt(tCameraRef,eyeRef,targetRef,up);
        gl.uniform1i(uShadowPass,false);
        gl.uniformMatrix4fv(uLightViewMatrix,false,tLightView);
        gl.uniformMatrix4fv(uLightProjectionMatrix,false,tLightProjection);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, shadowMapFBO.depthTexture);
        drawAllObjects(gl,shaderProgram,buffers,textures,tCameraRef,textures.mirrorFBO.width,textures.mirrorFBO.height,false);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

        gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);
        gl.clearColor(0.8,0.9,1.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        var tCamera = mat4.create();
        mat4.lookAt(tCamera,eye,target,up);
        gl.uniform1i(uShadowPass,false);
        gl.uniformMatrix4fv(uLightViewMatrix,false,tLightView);
        gl.uniformMatrix4fv(uLightProjectionMatrix,false,tLightProjection);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, shadowMapFBO.depthTexture);
        drawAllObjects(gl,shaderProgram,buffers,textures,tCamera,gl.drawingBufferWidth,gl.drawingBufferHeight,true);
    }

    sliderCam.addEventListener("input",drawScene);
    sliderX.addEventListener("input",drawScene);
    sliderY.addEventListener("input",drawScene);
    sliderZ.addEventListener("input",drawScene);
    sliderTX.addEventListener("input",drawScene);
    sliderTY.addEventListener("input",drawScene);
    sliderTZ.addEventListener("input",drawScene);
    sliderLight.addEventListener("input",drawScene);

    function drawAllObjects(gl,shaderProgram,buffers,textures,tCamera,width,height,finalPass=false) {
        var tModel = mat4.create();
        mat4.fromScaling(tModel,[50,50,50]);
        mat4.translate(tModel,tModel,[sliderTX.value/50, sliderTY.value/50, sliderTZ.value/50]);
        mat4.rotateX(tModel,tModel,sliderX.value*0.01*Math.PI);
        mat4.rotateY(tModel,tModel,sliderY.value*0.01*Math.PI);
        mat4.rotateZ(tModel,tModel,sliderZ.value*0.01*Math.PI);
        var tProjection = mat4.create();
        mat4.perspective(tProjection, Math.PI/4, width/height, 10,2000);
        var tMV = mat4.create();
        var tMVP = mat4.create();
        var tMVn = mat3.create();
        mat4.multiply(tMV,tCamera,tModel);
        mat4.multiply(tMVP,tProjection,tMV);
        mat3.normalFromMat4(tMVn,tMV);
        gl.uniformMatrix4fv(shaderProgram.ModelMatrix, false, tModel);
        gl.uniformMatrix4fv(shaderProgram.MVmatrix,false,tMV);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix,false,tMVP);
        gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix,false,tMVn);
        var uUseNormalMap = gl.getUniformLocation(shaderProgram,"uUseNormalMap");
        var uUseDecal = gl.getUniformLocation(shaderProgram,"uUseDecal");

        gl.uniform1i(uUseNormalMap,0);
        gl.uniform1i(uUseDecal,0);
        drawObject(gl,shaderProgram,buffers.walls,textures.wallTexture,null,null);

        gl.uniform1i(uUseNormalMap,1);
        gl.uniform1i(uUseDecal,0);
        drawObject(gl,shaderProgram,buffers.roof,textures.roofTexture,textures.roofNormalMap,null);

        gl.uniform1i(uUseNormalMap,0);
        gl.uniform1i(uUseDecal,1);
        drawObject(gl,shaderProgram,buffers.billboard,textures.blankWhite,null,textures.decalTexture);

        gl.uniform1i(uUseNormalMap,0);
        gl.uniform1i(uUseDecal,0);
        drawObject(gl,shaderProgram,buffers.newHouseParts.houseBody,textures.wallTexture,null,null);
        drawObject(gl,shaderProgram,buffers.newHouseParts.houseRoof,textures.roofTexture,null,null);
        drawObject(gl,shaderProgram,buffers.newHouseParts.chimney,textures.chimneyTexture,null,null);
        for(var i=0; i<buffers.newHouseParts.windows.length; i++){
            drawObject(gl,shaderProgram,buffers.newHouseParts.windows[i],textures.windowTexture,null,null);
        }
        drawObject(gl,shaderProgram,buffers.newHouseParts.doorFrame,textures.doorFrameTexture,null,null);
        drawObject(gl,shaderProgram,buffers.newHouseParts.balconyPlatform,textures.wallTexture,null,null);
        for(var i=0; i<buffers.newHouseParts.balconyRails.length; i++){
            drawObject(gl,shaderProgram,buffers.newHouseParts.balconyRails[i],textures.wallTexture,null,null);
        }

        gl.uniform1i(uUseNormalMap,0);
        gl.uniform1i(uUseDecal,0);
        var mirrorTexture = finalPass ? textures.mirrorFBO.texture : textures.blankWhite;
        drawObject(gl,shaderProgram,buffers.mirror,mirrorTexture,null,null);

        gl.uniform1i(uUseNormalMap,0);
        gl.uniform1i(uUseDecal,0);
        drawObject(gl,shaderProgram,buffers.treeTrunk,textures.brownTexture,null,null);

        gl.uniform1i(uUseNormalMap,0);
        gl.uniform1i(uUseDecal,0);
        drawObject(gl,shaderProgram,buffers.soccerBall,textures.soccerTexture,null,null);

        gl.uniform1i(uUseNormalMap,0);
        gl.uniform1i(uUseDecal,0);
        drawObject(gl,shaderProgram,buffers.person.head,textures.blankWhite,null,null);
        drawObject(gl,shaderProgram,buffers.person.body,textures.blankWhite,null,null);
        drawObject(gl,shaderProgram,buffers.person.leftArm,textures.blankWhite,null,null);
        drawObject(gl,shaderProgram,buffers.person.rightArm,textures.blankWhite,null,null);
        drawObject(gl,shaderProgram,buffers.person.leftLeg,textures.blankWhite,null,null);
        drawObject(gl,shaderProgram,buffers.person.rightLeg,textures.blankWhite,null,null);

        gl.uniform1i(uUseNormalMap,0);
        gl.uniform1i(uUseDecal,0);
        drawObject(gl,shaderProgram,buffers.ground,textures.groundTexture,null,null);
    }

    function drawObject(gl,shader,object,baseTexture,normalTexture,decalTexture) {
        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBuffer);
        var stride = object.hasTangent ? 11*4 : 8*4;
        gl.vertexAttribPointer(shaderProgram.PositionAttribute,3,gl.FLOAT,false,stride,0);
        gl.vertexAttribPointer(shaderProgram.NormalAttribute,3,gl.FLOAT,false,stride,3*4);
        gl.vertexAttribPointer(shaderProgram.texCoordAttribute,2,gl.FLOAT,false,stride,6*4);
        if(object.hasTangent) {
            gl.enableVertexAttribArray(shaderProgram.TangentAttribute);
            gl.vertexAttribPointer(shaderProgram.TangentAttribute,3,gl.FLOAT,false,stride,8*4);
        } else {
            gl.disableVertexAttribArray(shaderProgram.TangentAttribute);
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, baseTexture);
        if(normalTexture) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, normalTexture);
        }
        if(decalTexture) {
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, decalTexture);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
        gl.drawElements(gl.TRIANGLES,object.numIndices,gl.UNSIGNED_SHORT,0);
    }

    function createShadowMapFBO(gl,width,height) {
        var fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
        var depthTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, depthTex);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT,width,height,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,depthTex,0);
        var colorTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,colorTex);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,colorTex,0);
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if(status!==gl.FRAMEBUFFER_COMPLETE){
            console.error("Shadow Map FBO incomplete, status:"+status.toString());
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);
        return {fbo:fbo, depthTexture: depthTex, width:width, height:height};
    }

    function createObjectBuffer(gl, vertices, indices, hasTangent=false) {
        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
        var iBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
        return {
            vertexBuffer: vBuffer,
            indexBuffer: iBuffer,
            numIndices: indices.length,
            hasTangent: hasTangent
        };
    }

    function createSphere(gl,x,y,z,radius, latBands, longBands, uScale=1,vScale=1) {
        var verts = [];
        var indices = [];
        for(var lat=0; lat<=latBands; lat++){
            var theta = lat*Math.PI/latBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);
            for(var lon=0; lon<=longBands; lon++){
                var phi = lon*(2*Math.PI/longBands);
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);
                var nx = cosPhi*sinTheta;
                var ny = cosTheta;
                var nz = sinPhi*sinTheta;
                var ux = (lon/longBands)*uScale;
                var uy = (lat/latBands)*vScale;
                verts.push(x+radius*nx, y+radius*ny, z+radius*nz, nx,ny,nz, ux,uy);
            }
        }
        for(var lat=0; lat<latBands; lat++){
            for(var lon=0; lon<longBands; lon++){
                var first = lat*(longBands+1)+lon;
                var second = first+longBands+1;
                indices.push(first,second,first+1, second,second+1,first+1);
            }
        }
        return {
            vertices: new Float32Array(verts),
            indices: new Uint16Array(indices)
        };
    }

    function createBox(gl, x,y,z, width,height,depth, uScale=1,vScale=1) {
        var x0=x, x1=x+width;
        var y0=y, y1=y+height;
        var z0=z, z1=z+depth;
        var vertices = new Float32Array([
          x0,y0,z1, 0,0,1, 0,0,
          x1,y0,z1, 0,0,1, uScale,0,
          x1,y1,z1, 0,0,1, uScale,vScale,
          x0,y1,z1, 0,0,1, 0,vScale,
          x1,y0,z1, 1,0,0, 0,0,
          x1,y0,z0, 1,0,0, uScale,0,
          x1,y1,z0, 1,0,0, uScale,vScale,
          x1,y1,z1, 1,0,0, 0,vScale,
          x1,y0,z0, 0,0,-1,0,0,
          x0,y0,z0, 0,0,-1,uScale,0,
          x0,y1,z0, 0,0,-1,uScale,vScale,
          x1,y1,z0, 0,0,-1,0,vScale,
          x0,y0,z0,-1,0,0,0,0,
          x0,y0,z1,-1,0,0,uScale,0,
          x0,y1,z1,-1,0,0,uScale,vScale,
          x0,y1,z0,-1,0,0,0,vScale,
          x0,y0,z0,0,-1,0,0,0,
          x1,y0,z0,0,-1,0,uScale,0,
          x1,y0,z1,0,-1,0,uScale,vScale,
          x0,y0,z1,0,-1,0,0,vScale,
          x0,y1,z0,0,1,0,0,0,
          x1,y1,z0,0,1,0,uScale,0,
          x1,y1,z1,0,1,0,uScale,vScale,
          x0,y1,z1,0,1,0,0,vScale
        ]);
        var indices = new Uint16Array([
          0,1,2,0,2,3,
          4,5,6,4,6,7,
          8,9,10,8,10,11,
          12,13,14,12,14,15,
          16,17,18,16,18,19,
          20,21,22,20,22,23
        ]);
        return {vertices:vertices, indices:indices};
    }

    function createCylinder(gl, x,y,z, radius, height, segments, uScale=1, vScale=1) {
        var verts = [];
        var indices = [];
        var topY = y+height;
        var bottomY = y;
        for(var i=0; i<=segments; i++){
            var theta = i*(2*Math.PI/segments);
            var cos = Math.cos(theta);
            var sin = Math.sin(theta);
            var xPos = x+radius*cos;
            var zPos = z+radius*sin;
            verts.push(xPos,bottomY,zPos,cos,0,sin,(i*uScale/segments),0);
            verts.push(xPos,topY,zPos,cos,0,sin,(i*uScale/segments),vScale);
        }
        for(var i=0; i<segments; i++){
            var base = i*2;
            indices.push(base,base+1,base+2, base+2,base+1,base+3);
        }
        var baseStart = verts.length/8;
        verts.push(x,bottomY,z,0,-1,0,0.5,0.5);
        for(var i=0; i<=segments; i++){
            var theta = -i*(2*Math.PI/segments);
            var cos = Math.cos(theta);
            var sin = Math.sin(theta);
            verts.push(x+radius*cos,bottomY,z+radius*sin,0,-1,0,(cos*0.5+0.5),(sin*0.5+0.5));
        }
        for(var i=1; i<=segments; i++){
            indices.push(baseStart,baseStart+i,baseStart+i+1);
        }
        var topStart = verts.length/8;
        verts.push(x,topY,z,0,1,0,0.5,0.5);
        for(var i=0; i<=segments; i++){
            var theta = i*(2*Math.PI/segments);
            var cos = Math.cos(theta);
            var sin = Math.sin(theta);
            verts.push(x+radius*cos,topY,z+radius*sin,0,1,0,(cos*0.5+0.5),(sin*0.5+0.5));
        }
        for(var i=1; i<=segments; i++){
            indices.push(topStart,topStart+i,topStart+i+1);
        }
        return {
            vertices:new Float32Array(verts),
            indices:new Uint16Array(indices)
        };
    }

    function initBuffers(gl){
        var groundSize = 10.0;
        var groundVertices = new Float32Array([
            -groundSize,-1,-groundSize, 0,1,0,   0.0,0.0,
             groundSize,-1,-groundSize, 0,1,0,   2.0,0.0,
             groundSize,-1, groundSize, 0,1,0,   2.0,2.0,
            -groundSize,-1, groundSize, 0,1,0,   0.0,2.0,
        ]);
        var groundIndices = new Uint16Array([0,1,2,0,2,3]);
        var ground = createObjectBuffer(gl, groundVertices, groundIndices,false);

        var wallVertices = new Float32Array([
        -1,-1, 1, 0,0,1, 0.0,0.0,
         1,-1, 1, 0,0,1, 0.25,0.0,
         1, 1, 1, 0,0,1, 0.25,1.0,
        -1, 1, 1, 0,0,1, 0.0,1.0,
         1,-1, 1, 1,0,0, 0.25,0.0,
         1,-1,-1,1,0,0,  0.5,0.0,
         1, 1,-1,1,0,0,  0.5,1.0,
         1, 1, 1,1,0,0,  0.25,1.0,
         1,-1,-1,0,0,-1,0.5,0.0,
        -1,-1,-1,0,0,-1,0.75,0.0,
        -1, 1,-1,0,0,-1,0.75,1.0,
         1, 1,-1,0,0,-1,0.5,1.0,
        -1,-1,-1,-1,0,0,0.75,0.0,
        -1,-1, 1,-1,0,0,1.0,0.0,
        -1, 1, 1,-1,0,0,1.0,1.0,
        -1, 1,-1,-1,0,0,0.75,1.0,
        -1,-1,-1,0,-1,0,0.0,0.0,
         1,-1,-1,0,-1,0,0.0,0.0,
         1,-1, 1,0,-1,0,0.0,0.0,
        -1,-1, 1,0,-1,0,0.0,0.0,
        -1,1,-1,0,1,0,0.0,0.0,
         1,1,-1,0,1,0,0.0,0.0,
         1,1, 1,0,1,0,0.0,0.0,
        -1,1, 1,0,1,0,0.0,0.0
        ]);
        var wallIndices = new Uint16Array([
            0,1,2, 0,2,3,
            4,5,6, 4,6,7,
            8,9,10,8,10,11,
            12,13,14,12,14,15,
            16,17,18,16,18,19,
            20,21,22,20,22,23
        ]);
        var walls = createObjectBuffer(gl, wallVertices, wallIndices,false);

        var roofVertices = new Float32Array([
        -1,1, 1, 0,1,0, 0.0,0.0, 1,0,0,
         1,1, 1, 0,1,0, 0.33,0.0,1,0,0,
         1,1,-1, 0,1,0, 0.66,0.0,1,0,0,
        -1,1,-1, 0,1,0, 1.0,0.0, 1,0,0,
         0,2,0,  0,1,0, 0.5,1.0, 1,0,0
        ]);
        var roofIndices = new Uint16Array([
          0,1,4,
          1,2,4,
          2,3,4,
          3,0,4
        ]);
        var roof = createObjectBuffer(gl, roofVertices, roofIndices,true);

        var billboardVertices = new Float32Array([
          2,1,0, 0,0,1, 0,0,   1,0,0,
          3,1,0, 0,0,1, 1,0,   1,0,0,
          3,2,0, 0,0,1, 1,1,   1,0,0,
          2,2,0, 0,0,1, 0,1,   1,0,0
        ]);
        var billboardIndices = new Uint16Array([0,1,2,0,2,3]);
        var billboard = createObjectBuffer(gl,billboardVertices,billboardIndices,true);

        var houseBodyData = createBox(gl, -1.5,-1,-1.0001, 3,1.5,2,1,1);
        var houseBody = createObjectBuffer(gl,houseBodyData.vertices,houseBodyData.indices,false);

        var roofHeight = 0.8;
        var roofVertices2 = new Float32Array([
          -1.5,0.5,1,0,1,0,0,0,
           1.5,0.5,1,0,1,0,1,0,
           1.5,0.5,-1,0,1,0,1,1,
          -1.5,0.5,-1,0,1,0,0,1,
           0,0.5+roofHeight,0,0,1,0,0.5,0.5
        ]);
        var roofIndices2 = new Uint16Array([0,1,4,1,2,4,2,3,4,3,0,4]);
        var houseRoof = createObjectBuffer(gl,roofVertices2,roofIndices2,false);

        var chimneyData = createBox(gl,-0.1,1.5,0.2,0.2,0.6,0.2,1,1);
        var chimney = createObjectBuffer(gl,chimneyData.vertices,chimneyData.indices,false);

        var windowFrontData = createBox(gl,-0.5,0,0.81,1,0.5,0.2,1,1);
        var windowFront = createObjectBuffer(gl,windowFrontData.vertices,windowFrontData.indices,false);

        var windowSideData = createBox(gl,1.51,-0.3,-0.3,0.01,0.6,0.6,1,1);
        var windowSide = createObjectBuffer(gl,windowSideData.vertices,windowSideData.indices,false);
        var windows = [windowFront, windowSide];

        var doorData = createBox(gl,-0.3,-1,1.01,0.6,1,0.3,1,1);
        var doorFrame = createObjectBuffer(gl,doorData.vertices,doorData.indices,false);

        var balconyData = createBox(gl,-1.51,0,-0.35,0.3,0.2,0.7,1,1);
        var balconyPlatform = createObjectBuffer(gl,balconyData.vertices,balconyData.indices,false);

        var balconyRails = [];
        for(var rz=-0.3; rz<=0.3; rz+=0.3){
            var railData = createBox(gl,-1.2,0.21,rz,0.05,0.5,0.05,1,1);
            balconyRails.push(createObjectBuffer(gl,railData.vertices,railData.indices,false));
        }

        var newHouseParts = {
            houseBody: houseBody,
            houseRoof: houseRoof,
            chimney: chimney,
            windows: windows,
            doorFrame: doorFrame,
            balconyPlatform: balconyPlatform,
            balconyRails: balconyRails
        };

        var mirrorData = createBox(gl,2.5,-1,-0.4,0.05,1.5,0.8,1,1);
        var mirror = createObjectBuffer(gl,mirrorData.vertices,mirrorData.indices,false);

        var cylinderData = createCylinder(gl, -2,-1,0, 0.2,2, 32,1,1);
        var treeTrunk = createObjectBuffer(gl, cylinderData.vertices, cylinderData.indices,false);

        var sphereData = createSphere(gl,-2,-0.7,1.5,0.3,20,20,1,1);
        var soccerBall = createObjectBuffer(gl,sphereData.vertices,sphereData.indices,false);

        var headData = createSphere(gl,-2,-0.4,2,0.1,10,10,1,1);
        var personHead = createObjectBuffer(gl,headData.vertices,headData.indices,false);
        var bodyData = createCylinder(gl,-2,-1,2,0.05,0.4,10,1,1);
        var personBody = createObjectBuffer(gl,bodyData.vertices,bodyData.indices,false);
        var leftArmData = createCylinder(gl,-2-0.05,-0.7,2,0.02,0.3,10,1,1);
        var personLeftArm = createObjectBuffer(gl,leftArmData.vertices,leftArmData.indices,false);
        var rightArmData = createCylinder(gl,-2+0.05,-0.7,2,0.02,0.3,10,1,1);
        var personRightArm = createObjectBuffer(gl,rightArmData.vertices,rightArmData.indices,false);
        var leftLegData = createCylinder(gl,-2-0.02,-1,2,0.02,0.4,10,1,1);
        var personLeftLeg = createObjectBuffer(gl,leftLegData.vertices,leftLegData.indices,false);
        var rightLegData = createCylinder(gl,-2+0.02,-1,2,0.02,0.4,10,1,1);
        var personRightLeg = createObjectBuffer(gl,rightLegData.vertices,rightLegData.indices,false);
        var person = {
          head: personHead,
          body: personBody,
          leftArm: personLeftArm,
          rightArm: personRightArm,
          leftLeg: personLeftLeg,
          rightLeg: personRightLeg
        };
        return {
          ground: ground,
          walls: walls,
          roof: roof,
          billboard: billboard,
          newHouseParts: newHouseParts,
          mirror: mirror,
          treeTrunk: treeTrunk,
          soccerBall: soccerBall,
          person: person
        };
    }

    function initTextures(gl,callback) {
        var textures = {};
        var loadedCount = 0;
        var urls = [
          "https://i.imgur.com/y2LwEFS.jpeg",
          "https://i.imgur.com/yGIwxKi.png",
          "https://i.imgur.com/PQFEyvV.jpeg",
          "https://i.imgur.com/ubGRiOW.jpeg",
          "https://i.imgur.com/KlaxSAI.jpeg"
        ];
        for(let i=0; i<urls.length; i++){
            (function(idx){
                var img = new Image();
                img.crossOrigin="anonymous";
                img.onload=function(){
                    var tex=gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D,tex);
                    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
                    gl.generateMipmap(gl.TEXTURE_2D);
                    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
                    loadedCount++;
                    if(idx===0) textures.roofTexture=tex;
                    else if(idx===1) textures.roofNormalMap=tex;
                    else if(idx===2) textures.wallTexture=tex;
                    else if(idx===3) textures.groundTexture=tex;
                    else if(idx===4) textures.decalTexture=tex;
                    if(loadedCount===5) {
                        var treeImg = new Image();
                        treeImg.crossOrigin = "anonymous";
                        treeImg.onload = function() {
                            var brownTex = gl.createTexture();
                            gl.bindTexture(gl.TEXTURE_2D,brownTex);
                            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,treeImg);
                            gl.generateMipmap(gl.TEXTURE_2D);
                            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
                            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                            textures.brownTexture = brownTex;
                            var soccerImg = new Image();
                            soccerImg.crossOrigin = "anonymous";
                            soccerImg.onload = function(){
                                var soccerTex = gl.createTexture();
                                gl.bindTexture(gl.TEXTURE_2D,soccerTex);
                                gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,soccerImg);
                                gl.generateMipmap(gl.TEXTURE_2D);
                                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
                                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                                textures.soccerTexture = soccerTex;
                                var whiteTex = gl.createTexture();
                                gl.bindTexture(gl.TEXTURE_2D,whiteTex);
                                gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));
                                textures.blankWhite=whiteTex;
                                var doorImg = new Image();
                                doorImg.crossOrigin = "anonymous";
                                doorImg.onload = function(){
                                    var doorTex = gl.createTexture();
                                    gl.bindTexture(gl.TEXTURE_2D,doorTex);
                                    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,doorImg);
                                    gl.generateMipmap(gl.TEXTURE_2D);
                                    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
                                    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                                    textures.doorFrameTexture = doorTex;
                                    var windowImg = new Image();
                                    windowImg.crossOrigin = "anonymous";
                                    windowImg.onload = function(){
                                        var winTex = gl.createTexture();
                                        gl.bindTexture(gl.TEXTURE_2D,winTex);
                                        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,windowImg);
                                        gl.generateMipmap(gl.TEXTURE_2D);
                                        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
                                        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                                        textures.windowTexture = winTex;
                                        var chimneyImg = new Image();
                                        chimneyImg.crossOrigin = "anonymous";
                                        chimneyImg.onload = function(){
                                            var chimTex = gl.createTexture();
                                            gl.bindTexture(gl.TEXTURE_2D,chimTex);
                                            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,chimneyImg);
                                            gl.generateMipmap(gl.TEXTURE_2D);
                                            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
                                            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                                            textures.chimneyTexture = chimTex;
                                            callback();
                                        }
                                        chimneyImg.src = "https://live.staticflickr.com/65535/50641871583_78566f4fbb_o.jpg";
                                    }
                                    // Edit by course staff: the original image was hotlinked and died
                                    windowImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACVBMVEX7PvkAAAD\/\/\/\/236zQAAAAAWJLR0QCZgt8ZAAAAAd0SU1FB+cDDhAHIubt+CoAAAAWSURBVBjTY2AAglAgYBgkjMHkFiAAAOp5KoGPcwBzAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTAzLTE0VDE2OjA3OjM0KzAwOjAwYNPM/QAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wMy0xNFQxNjowNzozNCswMDowMBGOdEEAAAAASUVORK5CYII=";
                                }
                                doorImg.src = "https://live.staticflickr.com/5564/30725680942_0c6e60a13f_o.jpg";
                            }
                            soccerImg.src = "https://i.imgur.com/QoUeV0x.jpeg";
                        }
                        treeImg.src = "https://live.staticflickr.com/65535/50641871583_78566f4fbb_o.jpg";
                    }
                }
                img.src = urls[idx];
            })(i);
        }
        return textures;
    }

    function createFBO(gl,width,height){
        var fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,tex);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        var rbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER,rbo);
        gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,width,height);
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rbo);
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if(status!==gl.FRAMEBUFFER_COMPLETE){
            console.error("FBO incomplete, status:"+status.toString());
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);
        return {fbo:fbo, texture:tex, width:width, height:height};
    }
}

window.onload = start;
