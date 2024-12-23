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
uniform float uModelTheta;

varying vec4 fColor;
varying vec2 fTexCoord;
varying vec3 fNormal;
varying vec3 fWorldPos;

void main() {
    vec3 lerpedWorldPos = mix(vPosition1, vPosition2, uModelTheta);
    vec4 pos = MV * vec4(lerpedWorldPos, 1.0);
    vec3 normal = normalize(uNormalMatrix * mix(vNormal1, vNormal2, uModelTheta));
    vec3 lightDir = normalize(-pos.xyz);
    float lightDist = length(pos.xyz) / 10;
    float obliquity = dot(lightDir, theNormal);
    float strength = clamp((1.0 / (lightDist * lightDist)) * obliquity, 0.2, 1.0);
    fColor = vec4(vec3(1.0, 1.0, 1.0) * strength, 1.0);
    fTexCoord = vTexCoord;
    gl_Position = MVP * pos;
}
