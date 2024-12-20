function enableShader(gl, shader) {
    gl.useProgram(shader.program)

    // Enable attributes (same for all shaders)
    enableShaderAttribute(gl, shader.program, "position")
    enableShaderAttribute(gl, shader.program, "normal")
    enableShaderAttribute(gl, shader.program, "vTexCoord")

    // Enable uniforms
    shader.enableUniforms(gl, shader.program)
}

function loadShaders(gl, shaderCode) {
    let shaders = {}

    try {
        Object.keys(shaderCode).forEach(key => {
            shaders[key] = {
                program: loadShaderProgram(gl, shaderCode[key]),
                enableUniforms: shaderCode[key].enableUniforms,
                setUniforms: shaderCode[key].setUniforms
            }
        })
    } catch(error) {
        console.error("Could not load shader programs!")
        console.error(error)
    }
    
    return shaders
}

function loadShaderProgram(gl, source) {
    let vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, source["vertex"])
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(vertexShader))
    }

    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, source["fragment"])
    gl.compileShader(fragmentShader)

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(fragmentShader))
    }

    let shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error("Could not initialize shaders")
    }

    return shaderProgram
}

function enableShaderAttribute(gl, shader, attribute) {
    if(!shader.hasOwnProperty("attributePointers"))
        shader.attributePointers = {}

    shader.attributePointers[attribute] = gl.getAttribLocation(shader, attribute)
    if(shader.attributePointers[attribute] != -1)
        gl.enableVertexAttribArray(shader.attributePointers[attribute])
}

function enableShaderUniform(gl, shader, uniform) {
    if(!shader.hasOwnProperty("uniformPointers"))
        shader.uniformPointers = {}

    shader.uniformPointers[uniform] = gl.getUniformLocation(shader, uniform)
    if(shader.uniformPointers[uniform] == -1)
        console.error("Could not locate uniform '{}'!".format(uniform))
}