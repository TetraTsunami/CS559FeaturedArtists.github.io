class BufferInfo {
    constructor(gl, size, type, normalize, stride, offset) {
        this.buffer = gl.createBuffer();
        this.size = size;
        this.type = type;
        this.normalize = normalize;
        this.stride = stride;
        this.offset = offset;
    }
}

class Texture {
    constructor(gl, image) {
        this.image = image;
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);      
    }
}

// class for a drawable 3d object
class Element {
    constructor(gl, model, program) {
        this.model = model
        this.program = program;
        this.buffers = this.makeBuffers(gl);

        // this section is from https://github.com/elbrandt/ObjToJs, sample.js
        this.triangleIndexSize = gl.UNSIGNED_INT;
        switch (this.model.triangleIndices.BYTES_PER_ELEMENT) {
          case 1:
            this.triangleIndexSize = gl.UNSIGNED_BYTE;
            break;
          case 2:
            this.triangleIndexSize = gl.UNSIGNED_SHORT;
            break;
          case 4:
            // for uint32, we have to enable the extension that allows uint32 as triangle indices
            gl.getExtension('OES_element_index_uint');
            this.triangleIndexSize = gl.UNSIGNED_INT;
            break;
          default:
            throw new Error('unknown triangle index element size');
        }
    }
    
    
    // set transforms to draw this object w/
    setTransforms(tModel, tCamera, tProjection) {
        this.tModel = tModel;        
        
        // model view matrix
        this.tMV = mat4.create();
        mat4.multiply(this.tMV, tCamera, tModel);
        
        // model view normal matrix
        this.tMVn = mat3.create();
        mat3.normalFromMat4(this.tMVn, this.tMV);
        
        // model view projection matrix
        this.tMVP = mat4.create();
        mat4.multiply(this.tMVP, tCamera, tModel);
        mat4.multiply(this.tMVP, tProjection, this.tMVP);
    }

    makeBuffers(gl) {
        var buffers = new Object();
        // we need to put the vertices into a buffer so we can
        // block transfer them to the graphics hardware
        buffers.position = new BufferInfo(gl, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.model.vertexPos, gl.STATIC_DRAW);
    
        // // a buffer for colors
        // buffers.colors = new BufferInfo(gl, 3, gl.FLOAT, false, 0, 0);
        // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colors.buffer);
        // gl.bufferData(gl.ARRAY_BUFFER, this.model.vertexColors, gl.STATIC_DRAW);
    
        // a buffer for indices
        buffers.indices = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.model.triangleIndices, gl.STATIC_DRAW);
    
        // a buffer for vertex normals
        buffers.normals = new BufferInfo(gl, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.model.vertexNormals, gl.STATIC_DRAW);

        // a buffer for texture coords
        buffers.texCoord = new BufferInfo(gl, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.model.vertexTextureCoords, gl.STATIC_DRAW);

        return buffers
    }


    setArrayBufferAttribute(gl, attributeLocation, bufferInfo) {
        gl.enableVertexAttribArray(attributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);
        gl.vertexAttribPointer(
            attributeLocation,
            bufferInfo.size,
            bufferInfo.type,
            bufferInfo.normalize,
            bufferInfo.stride,
            bufferInfo.offset
        );
    }

    setAttributesUniforms(gl) {
        // setup position buffer
        this.setArrayBufferAttribute(gl, this.program.positionAttribute, this.buffers.position);
        // // setup color buffer
        // this.setArrayBufferAttribute(gl, this.program.colorAttribute, this.buffers.colors);
        // setup normals buffer
        this.setArrayBufferAttribute(gl, this.program.normalAttribute, this.buffers.normals);
        // setup texCoords buffer
        this.setArrayBufferAttribute(gl, this.program.texCoordAttribute, this.buffers.texCoord);
    
        // setup uniforms
        gl.uniformMatrix4fv(this.program.MVPmatrix, false, this.tMVP);
        gl.uniformMatrix4fv(this.program.MVmatrix, false, this.tMV);
        gl.uniformMatrix3fv(this.program.MVNormalmatrix, false, this.tMVn)
        gl.uniform1i(this.program.textureUniform, 0);

    }

    draw(gl) {
        gl.useProgram(this.program);
        this.setAttributesUniforms(gl, this.program, this.model);
        gl.drawElements(gl.TRIANGLES, this.model.triangleIndices.length, this.triangleIndexSize, 0);

    }
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(source);
        console.error(gl.getShaderInfoLog(shader)); return null;
    }
    return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
    var shaderProgram = gl.createProgram();
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialize shaders");
        console.log(gl.getProgramInfoLog(program));
        return null;
    }

    initVertexPointers(gl, shaderProgram);
    return shaderProgram;
}

function initVertexPointers(gl, shaderProgram) {
    // with the vertex shader, we need to pass it positions
    // as an attribute - so set up that communication
    shaderProgram.positionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
    // shaderProgram.colorAttribute = gl.getAttribLocation(shaderProgram, "vColor");
    shaderProgram.normalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
    shaderProgram.texCoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");

    // this gives us access to the matrix uniform
    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram, "uMVP");
    shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram, "uMV");
    shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram, "uMVn");
    shaderProgram.textureUniform = gl.getUniformLocation(shaderProgram, "uTexture");
}
