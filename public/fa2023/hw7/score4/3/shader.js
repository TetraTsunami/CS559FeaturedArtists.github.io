class Shader{
    gl;
    shaderProgram;

    constructor (gl, vertexId, fragmentId){
        this.gl = gl;

        // Read shader source
        var vertexSource = document.getElementById(vertexId).text;
        var fragmentSource = document.getElementById(fragmentId).text;

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
        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);
        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialize shaders"); }

    }

    use (){
        this.gl.useProgram(this.shaderProgram);
    }

    addAttribute (name, varName){
        this.shaderProgram[name] = this.gl.getAttribLocation(this.shaderProgram, varName);
        this.gl.enableVertexAttribArray(this.shaderProgram[name]);
    }

    addUniform (name, varName){
        this.shaderProgram[name] = this.gl.getUniformLocation(this.shaderProgram,varName);
    }

    setAttribute (name, value){
        
    }


}