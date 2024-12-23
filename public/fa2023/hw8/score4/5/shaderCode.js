let shaderCode = {
    spooky: {
      vertex: `
#define PI 3.14159
#define SURFACE_OFFSET 0.03

precision highp float;
attribute vec3 position;
attribute vec3 normal;
uniform mat3 normalMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec3 fNormal;
varying vec3 fPosition;

uniform float time;
varying float normalOffset;

void main()
{
  normalOffset = cos(atan(position.x, position.y)
                    *cos(time*7.0+PI/1.0)*10.0) *
                  sin(atan(position.x, position.z)
                    *sin(time*7.0+PI/1.0)*10.0) *
                  SURFACE_OFFSET;
                  
  fNormal = normalize(normalMatrix * normal);
  vec4 pos = modelViewMatrix *
             vec4(position + (normal*normalOffset), 1.0);

  fPosition = pos.xyz;
  gl_Position = projectionMatrix * pos;
}
      `,
      fragment: `
precision highp float;
uniform float time;
varying vec3 fPosition;
varying vec3 fNormal;
uniform mat3 normalMatrix;

const float diffuse_amt = 0.2;
const float spooky_amt = 0.5;
const float specular_amt = 0.3;

const float speed = 100.0;
const float pi = 3.14159;

void main()
{ 
  vec3 dir = vec3(sin(time*speed), 0.0, cos(time*speed));
  vec3 color = vec3(0.5, 0, 0.5);
  
  // Diffuse effect
  vec3 diffuse = (0.5 + dot(fNormal,dir)) * color;
  
  // Specular effect
  vec3 n = normalize(vec3(0, 0, 1));
  vec3 h = normalize (normalize(-fPosition)+normalize(dir));
  vec3 specular = pow(max(0.0, dot(n,h)), 128.0) * color;
  
  // Custom spooky-looking effect
  vec3 spooky = vec3(0, (fPosition.y+1.0)/(fNormal.z*2.0), 0.1);
  
  vec3 total = (diffuse * diffuse_amt) + (spooky * spooky_amt) + (specular * specular_amt);
  
  gl_FragColor = vec4(total, 1);
}
      `,
      enableUniforms: (gl, shader) => {
        enableShaderUniform(gl, shader, "normalMatrix")
        enableShaderUniform(gl, shader, "modelViewMatrix")
        enableShaderUniform(gl, shader, "projectionMatrix")
        enableShaderUniform(gl, shader, "time")
      },
      setUniforms: (gl, shader, uniforms) => {
        gl.uniformMatrix4fv(shader.program.uniformPointers.modelViewMatrix, false, uniforms.modelViewMatrix)
        gl.uniformMatrix3fv(shader.program.uniformPointers.normalMatrix, false, uniforms.normalMatrix)
        gl.uniformMatrix4fv(shader.program.uniformPointers.projectionMatrix, false, uniforms.projectionMatrix)

        gl.uniform1f(shader.program.uniformPointers.time, [uniforms.time])
      }
    },
    simple: {
      vertex: `
precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 vTexCoord;
uniform mat3 normalMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec3 fNormal;
varying vec3 fPosition;
varying vec2 fTexCoord;
uniform sampler2D displacementTexSampler;
uniform float displacement_amt;


void main()
{
  fNormal = normalize(normalMatrix * normal);
  float displacement = (texture2D(displacementTexSampler, fTexCoord).x)*1.0 - 0.5;
  vec4 pos = modelViewMatrix * vec4(position + ((displacement * displacement_amt)/5.0)*normal, 1.0);

  fTexCoord = vTexCoord;

  fPosition = pos.xyz;
  gl_Position = projectionMatrix * pos;
}
      `,
      fragment: `
precision highp float;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec2 fTexCoord;
uniform mat3 normalMatrix;

uniform vec3 color;
uniform vec3 dir;
uniform float diffuse_amt;
uniform float specular_amt;
uniform sampler2D colorTexSampler;
uniform sampler2D normalTexSampler;
uniform sampler2D specularityTexSampler;
uniform sampler2D displacementTexSampler;

const float speed = 100.0;
const float pi = 3.14159;

void main()
{   
  vec3 texColor = texture2D(colorTexSampler, fTexCoord).xyz;
  
  float displacement = (texture2D(displacementTexSampler, fTexCoord).x)*1.0 - 0.5;
  float texSpec = texture2D(specularityTexSampler, fTexCoord).x;

  // Diffuse effect
  vec3 diffuse = (0.5 + dot(fNormal,dir)) * texColor;

  if(texColor[0] == 0.0 && texColor[1] == 0.0 && texColor[2] == 0.0) {
    discard;
  }
  
  // Specular effect
  vec3 normalMapping = texture2D(normalTexSampler, fTexCoord).xyz;
  vec3 n = normalize(fNormal * (normalMapping * 5.0) - 2.5);
  vec3 h = normalize (normalize(-fPosition)+normalize(dir));
  vec3 specular = pow(max(0.0, dot(n,h)), 256.0) * texColor;
  
  vec3 total = ((diffuse + (displacement/4.0)) * diffuse_amt) + (texSpec * specular * specular_amt);
  
  gl_FragColor = vec4(total, 1);
}
      `,
      enableUniforms: (gl, shader) => {
        enableShaderUniform(gl, shader, "normalMatrix")
        enableShaderUniform(gl, shader, "modelViewMatrix")
        enableShaderUniform(gl, shader, "projectionMatrix")
        enableShaderUniform(gl, shader, "color")
        enableShaderUniform(gl, shader, "dir")
        enableShaderUniform(gl, shader, "diffuse_amt")
        enableShaderUniform(gl, shader, "specular_amt")
        enableShaderUniform(gl, shader, "colorTexSampler")
        enableShaderUniform(gl, shader, "normalTexSampler")
        enableShaderUniform(gl, shader, "displacementTexSampler")
        enableShaderUniform(gl, shader, "specularityTexSampler")
        enableShaderUniform(gl, shader, "displacement_amt")
      },
      setUniforms: (gl, shader, uniforms) => {
        gl.uniformMatrix4fv(shader.program.uniformPointers.modelViewMatrix, false, uniforms.modelViewMatrix)
        gl.uniformMatrix3fv(shader.program.uniformPointers.normalMatrix, false, uniforms.normalMatrix)
        gl.uniformMatrix4fv(shader.program.uniformPointers.projectionMatrix, false, uniforms.projectionMatrix)

        gl.uniform3f(shader.program.uniformPointers.color, ...uniforms.color)
        gl.uniform3f(shader.program.uniformPointers.dir, ...uniforms.dir)
        gl.uniform1f(shader.program.uniformPointers.diffuse_amt, [uniforms.diffuse_amt])
        gl.uniform1f(shader.program.uniformPointers.specular_amt, [uniforms.specular_amt])
        gl.uniform1i(shader.program.uniformPointers.colorTexSampler, 0);
        gl.uniform1i(shader.program.uniformPointers.normalTexSampler, 1);
        gl.uniform1i(shader.program.uniformPointers.displacementTexSampler, 2);
        gl.uniform1i(shader.program.uniformPointers.specularityTexSampler, 3);
        gl.uniform1f(shader.program.uniformPointers.displacement_amt, [uniforms.displacement_amt])
      }
    }
}
