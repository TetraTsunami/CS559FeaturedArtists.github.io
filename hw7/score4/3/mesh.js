class Mesh {
    vertices;
    normals;
    indices;
    colors;
    trianglePosBuffer;
    triangleNormalBuffer;
    colorBuffer;
    indexBuffer;

    constructor(gl, vertices, normals, indices, colors){
        this.vertices =  vertices;
        this.normals =  normals;
        this.indices =  indices;
        this.colors =  colors;
        this.setupMesh(gl);
    }


    setupMesh(gl) {
        this.trianglePosBuffer = this.createAndBindBuffer(gl,this.vertices);
        this.triangleNormalBuffer = this.createAndBindBuffer(gl,this.normals);
        this.colorBuffer = this.createAndBindBuffer(gl,this.colors);
        this.indexBuffer = this.createAndBindIndexBuffer(gl,this.indices);
    }

    createAndBindBuffer(gl,data) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      buffer.itemSize = 3;
      return buffer;
  }

  createAndBindIndexBuffer(gl,data) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
      return buffer;
  }


    draw(gl, shader, tModel, tCamera, tProjection){
        var tMV = mat4.create();
        var tMVn = mat3.create();
        var tMVP = mat4.create();
        mat4.multiply(tMV,tCamera,tModel); // "modelView" matrix
        mat3.normalFromMat4(tMVn,tMV);
        mat4.multiply(tMVP,tProjection,tMV);

        var shaderProgram = shader.shaderProgram;

        gl.uniformMatrix4fv(shaderProgram.MVmatrix,false,tMV);
        gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix,false,tMVn);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix,false,tMVP);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.trianglePosBuffer);
        gl.vertexAttribPointer(shaderProgram.PositionAttribute, this.trianglePosBuffer.itemSize,
          gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.NormalAttribute, this.triangleNormalBuffer.itemSize,
          gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(shaderProgram.ColorAttribute, this.colorBuffer.itemSize,
          gl.FLOAT,false, 0, 0);
        
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}