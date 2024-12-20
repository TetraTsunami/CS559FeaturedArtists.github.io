precision highp float;
varying vec4 fColor;
varying vec2 fTexCoord;
uniform sampler2D sampler; 
uniform float uTime;

const float PIXELS = 32.0;
const float PERTURBANCE = 1.0;
const float PIXSIZE = 1.0/PIXELS;

float rem(float a, float b) {
    return a - floor(a/b);
}

vec2 sampleForFragment() {
    float x = fTexCoord.x;
    float y = fTexCoord.y;
    float pixelX = floor((x) * PIXELS)/PIXELS;
    float pixelY = floor(y * PIXELS)/PIXELS;
    return vec2(pixelX, pixelY);
}

void main() {
    gl_FragColor = texture2D(sampler, sampleForFragment() + vec2(sin(10.0 * fTexCoord.y + uTime * 10.0) * PERTURBANCE * PIXSIZE, 0.0));
}
