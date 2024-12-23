precision highp float;
varying vec4 fColor;
varying vec2 fTexCoord;
uniform sampler2D sampler; 
uniform float uTime;

void main() {
    gl_FragColor = texture2D(sampler, fTexCoord + vec2(0, 0.05 * sin(uTime * 5.0 + fTexCoord.x))) * fColor;
}
