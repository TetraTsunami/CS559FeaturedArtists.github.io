

function ModelObject(gl, model, shader, position, scale) {
    this.position = position;
    this.scale = scale;
    this.shader = shader;
    this.rotation = [0, 0, 0];

    this.textures = []
    
    this.posBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, model.vertexPos, gl.STATIC_DRAW)
    this.posBuffer.itemSize = 3
    this.posBuffer.numItems = model.vertexPos.length/this.posBuffer.itemSize

    this.normalBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, model.vertexNormals, gl.STATIC_DRAW)
    this.normalBuffer.itemSize = 3
    this.normalBuffer.numItems = model.vertexNormals.length/this.normalBuffer.itemSize

    this.indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.triangleIndices, gl.STATIC_DRAW)

    if(model.vertexTextureCoords) {
        this.textureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, model.vertexTextureCoords, gl.STATIC_DRAW)
        this.textureBuffer.itemSize = 2
        this.textureBuffer.numItems = model.vertexTextureCoords.length/this.textureBuffer.itemSize
    }

    this.dimensions = {
        width: model.bboxMax[0] - model.bboxMin[0],
        height: model.bboxMax[1] - model.bboxMin[1],
        depth: model.bboxMax[2] - model.bboxMin[2]
    }

    this.center =  {
        x: (model.bboxMax[0] + model.bboxMin[0]) / 2,
        y: (model.bboxMax[1] + model.bboxMin[1]) / 2,
        z: (model.bboxMax[2] + model.bboxMin[2]) / 2
    }

    this.triangleIndexSize = getTriangleIndexSize(gl, model)
    this.numTriangles = model.triangleIndices.length

    this.getUniforms = (cameraTransform, projectionTransform, time) => {
        console.error("getUniforms undefined")
    }
}

// Code from ObjToJs example
function getTriangleIndexSize(gl, obj_model) {
    var triangleIndexSize = gl.UNSIGNED_INT;
    switch (obj_model.triangleIndices.BYTES_PER_ELEMENT) {
        case 1:
            triangleIndexSize = gl.UNSIGNED_BYTE
            break
        case 2:
            triangleIndexSize = gl.UNSIGNED_SHORT
            break
        case 4:
            // for uint32, we have to enable the extension that allows uint32 as triangle indices
            gl.getExtension('OES_element_index_uint')
            triangleIndexSize = gl.UNSIGNED_INT
            break
        default:
            throw new Error('unknown triangle index element size')
    }
    return triangleIndexSize;
}