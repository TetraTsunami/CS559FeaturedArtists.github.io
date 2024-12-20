let mat4 = glMatrix.mat4;
let mat3 = glMatrix.mat3;
let canvas;
let camera;
let gl;

async function getModelObjects(gl, shaders) {
    skull = new ModelObject(gl, skull_model, shaders["simple"], [0, -1.25, 0], [0.1, 0.1, 0.1])
    skull.getUniforms = (cameraTransform, projectionTransform, time) => {
        uniforms = getStandardUniforms(skull, cameraTransform, projectionTransform)
        uniforms.color = [0.9, 0.9, 0.9]
        uniforms.dir = [1, 1, 1]
        uniforms.diffuse_amt = 0.5
        uniforms.specular_amt = 2
        uniforms.displacement_amt = 1
        return uniforms
    }
    // Color
    skull.textures.push(await loadTexture(gl, "https://i.postimg.cc/kn0q9q55/skull.png?dl=1"))

    // Normal Map
    skull.textures.push(await loadTexture(gl, "https://i.postimg.cc/tqFy4w1N/Normal-Map.png?dl=1"))

    // Displacement Map
    skull.textures.push(await loadTexture(gl, "https://i.postimg.cc/BJwJYx9H/Displacement-Map.png?dl=1"))

    // Specular Map
    skull.textures.push(await loadTexture(gl, "https://i.postimg.cc/Ng9BW5BV/Specular-Map.png?dl=1"))
    skull.rotation[0] = -Math.PI/2

    let start = Date.now();
    skull.update = (dt) => {
        skull.rotation[2] = (Date.now() - start)/3000;
    }

    pedestal = new ModelObject(gl, cube_high_res_model, shaders["simple"], [0, -2, 0], [1, 1, 1]);
    pedestal.getUniforms = (cameraTransform, projectionTransform, time) => {
        uniforms = getStandardUniforms(pedestal, cameraTransform, projectionTransform)
        uniforms.color = [1, 1, 1]
        uniforms.dir = [1, 0, 1]
        uniforms.diffuse_amt = 0.5
        uniforms.specular_amt = 5
        uniforms.displacement_amt = 0
        return uniforms
    }
    pedestal.update = (time, dt) => {
        pedestal.rotation[1] = Math.PI/4 + Math.cos(time)/3;
    }
    // Color
    pedestal.textures.push(await loadTexture(gl, "https://i.postimg.cc/VmgftxK7/Cube.png?dl=1"))

    // Normal Map
    pedestal.textures.push(await loadTexture(gl, "https://i.postimg.cc/6tt6yWf2/Cube-None.png?dl=1"))

    // Displacement Map
    pedestal.textures.push(await loadTexture(gl, "https://i.postimg.cc/6tt6yWf2/Cube-None.png?dl=1"))

    // Specular Map
    pedestal.textures.push(await loadTexture(gl, "https://i.postimg.cc/PdqtQScd/Cube-Specularity.png?dl=1"))

    suzanne = new ModelObject(gl, suzanne_model, shaders["spooky"], [0, 0.25, 0.25], [0.5, 0.5, 0.5])
    suzanne.getUniforms = (cameraTransform, projectionTransform, time) => {
        uniforms = getStandardUniforms(suzanne, cameraTransform, projectionTransform)
        uniforms.time = time / 20
        return uniforms
    }
    suzanne.update = (time, dt) => {
        //suzanne.position = [Math.cos(time), Math.sin(time), 0]
        //suzanne.rotation[2] += dt
        suzanne.rotation[1] = skull.rotation[2];
    }

    return [skull, suzanne, pedestal]
}

window.onload = async () => {
    canvas = document.getElementById("canvas")
    gl = canvas.getContext("webgl")
    camera = new Camera([0, 0, 20], [0, 0, 0], Math.PI / 16, canvas);

    let shaders = loadShaders(gl, shaderCode)
    let modelObjects = await getModelObjects(gl, shaders)

    let cameraTransform = camera.getCameraTransform()
    let projectionTransform = camera.getProjectionTransform();

    function update(modelObjects, time, dt) {
        modelObjects.forEach((modelObject) => {
            if(modelObject.hasOwnProperty("update")) {
                modelObject.update(time, dt)
            }
        })
    }

    let currentShader = null;

    function draw(modelObjects, time) {
        // Clear screen, prepare for rendering
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        modelObjects.forEach(modelObject => {
            if(modelObject.shader != currentShader) {
                enableShader(gl, modelObject.shader)
                currentShader = modelObject.shader
            }

            drawModelObject(gl, modelObject, cameraTransform, projectionTransform, time)
        })
    }

  function drawModelObject(gl, model, cameraTransform, projectionTransform, time) {
    // Set uniforms
    model.shader.setUniforms(gl, model.shader, model.getUniforms(cameraTransform, projectionTransform, time))

    // Set attributes

    // Only set texture coordinates for models that have them, and shaders that support them
    if(model.textureBuffer && model.shader.program.attributePointers.vTexCoord != -1) {
        gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
        gl.vertexAttribPointer(model.shader.program.attributePointers.vTexCoord, model.textureBuffer.itemSize,
            gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, model.posBuffer)
    gl.vertexAttribPointer(model.shader.program.attributePointers.position, model.posBuffer.itemSize,
        gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer)
    gl.vertexAttribPointer(model.shader.program.attributePointers.normal, model.normalBuffer.itemSize,
        gl.FLOAT, false, 0, 0)

    for(let i = 0; i < model.textures.length; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, model.textures[i]);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer)

    // Draw
    gl.drawElements(gl.TRIANGLES, model.numTriangles, model.triangleIndexSize, 0)
  }

  // Update and draw loop
  let lastUpdated = Date.now()
  let start = Date.now()
  setInterval(() => {
      let now = Date.now();
      let dt = (now - lastUpdated) / 1000
      lastUpdated = now;

      let time = (Date.now() - start) / 1000

      update(modelObjects, time, dt);
      draw(modelObjects, time);
  }, 10)
}

function getStandardUniforms(modelObject, cameraTransform, projectionTransform) {
    // Model transform
    let modelMatrix = mat4.create()
    mat4.fromTranslation(modelMatrix, modelObject.position)
    mat4.scale(modelMatrix, modelMatrix, modelObject.scale)
    mat4.rotateX(modelMatrix, modelMatrix, modelObject.rotation[0])
    mat4.rotateY(modelMatrix, modelMatrix, modelObject.rotation[1])
    mat4.rotateZ(modelMatrix, modelMatrix, modelObject.rotation[2])

    let modelViewMatrix = mat4.create()
    mat4.multiply(modelViewMatrix, cameraTransform, modelMatrix)

    let normalTransform = mat3.create()
    mat3.normalFromMat4(normalTransform, modelViewMatrix)

    return {
        modelViewMatrix: modelViewMatrix,
        normalMatrix: normalTransform,
        projectionMatrix: projectionTransform
    }
}
