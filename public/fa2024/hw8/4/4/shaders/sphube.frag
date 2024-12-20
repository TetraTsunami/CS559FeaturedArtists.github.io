precision highp float;

uniform vec3 uLookVector;
varying vec4 fColor;
varying vec2 fTexCoord;
varying vec3 fNormal;
varying vec3 fWorldPos;
uniform sampler2D uTextureSampler;

void main() {
    gl_FragColor = texture2D(uTextureSampler, fTexCoord) * fColor;
}
