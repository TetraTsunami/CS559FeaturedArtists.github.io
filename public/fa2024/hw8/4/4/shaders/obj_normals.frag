// Normal mapping (Eventually, I didn't do it for this week's project)
precision highp float;
varying vec4 fColor;
varying vec3 fNormal;
varying vec2 fTexCoord;
uniform sampler2D sampler; 
uniform sampler2D normalMap;

void main() {
    gl_FragColor = vec4(abs(fNormal.x), abs(fNormal.y), abs(fNormal.z), 1.0);
}
