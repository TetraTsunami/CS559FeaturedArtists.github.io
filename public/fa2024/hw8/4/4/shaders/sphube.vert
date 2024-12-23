// vim: set ft=glsl
precision highp float;
attribute vec3 vPosition1;
attribute vec3 vPosition2;
attribute vec2 vTexCoord;
attribute vec3 vNormal1;
attribute vec3 vNormal2;

uniform vec3 uObjectLocation;
uniform mat4 uMVP;
uniform mat4 uMV;
uniform mat3 uNormalMatrix;
uniform float uTime;

varying vec4 fColor;
varying vec2 fTexCoord;
varying vec3 fNormal;
varying vec3 fWorldPos;

void main() {
    vec3 lerpedWorldPos = mix(vPosition1, vPosition2, 0.5 + 0.5 * sin(uTime * 2.0)) - uObjectLocation;
    vec4 pos = uMV * vec4(lerpedWorldPos, 1.0);
    vec3 lightPos = vec3(sin(uTime), 1.0, cos(uTime));
    vec3 normal = normalize(uNormalMatrix * mix(vNormal1, vNormal2, 0.5 + 0.5 * sin(uTime * 2.0)));
    float strength = clamp(dot(-lightPos, normal), 0.2, 1.0);
    fColor = vec4(strength, strength, strength, 1.0);
    fTexCoord = vTexCoord;
    fWorldPos = pos.xyz;
    gl_Position = uMVP * vec4(lerpedWorldPos, 1.0);
}
