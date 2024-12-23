precision highp float;
varying vec4 fColor;
varying vec3 fNormal;
varying vec2 fTexCoord;
varying vec3 fWorldPos;
uniform sampler2D sampler; 

void main() {
    vec3 lightDir = normalize(-fWorldPos);
    float lightDist = length(fWorldPos) / 5.0;
    // Inverse square law
    gl_FragColor = texture2D(sampler, fTexCoord) * fColor;
}
