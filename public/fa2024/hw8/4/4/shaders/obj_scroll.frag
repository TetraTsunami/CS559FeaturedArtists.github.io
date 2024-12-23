precision highp float;
varying vec4 fColor;
varying vec2 fTexCoord;
uniform sampler2D sampler; 
uniform float uTime;

float rem(float a, float b) {
    return a - floor(a/b);
}

void main() {
    gl_FragColor = texture2D(sampler, vec2(rem(fTexCoord.x + uTime, 1.0), rem(fTexCoord.y, 1.0))) * fColor;
}
