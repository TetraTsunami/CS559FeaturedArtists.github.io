let VERTEX_SOURCE = `
precision highp float;
attribute vec3 vPosition;
attribute vec3 vNormal;
attribute vec2 vTextureCoords;
uniform mat3 normalMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec3 fNormal;
varying vec3 fPosition;
varying vec3 worldPos;
varying vec2 fTextureCoords;

void main()
{
  fTextureCoords = vTextureCoords;
  fNormal = vNormal;
  worldPos = vPosition;
  fPosition = (modelViewMatrix * vec4(vPosition, 1.0)).xyz;

  gl_Position = projectionMatrix * vec4(vPosition, 1.0);
}
`;

let FRAG_SOURCE = `
precision highp float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D textureSampler;
uniform sampler2D normalSampler;
varying vec3 fPosition;
varying vec3 worldPos;
varying vec3 fNormal;
varying vec2 fTextureCoords;

uniform float normalMapStrength;

uniform vec3 diffuseLightPos;
uniform float diffuseFactor;

uniform float ambientFactor;

void main()
{
  vec3 textureColor = texture2D(textureSampler, fTextureCoords).xyz;

  vec3 normalMap = texture2D(normalSampler, fTextureCoords).xyz;
  vec3 normal = normalize(normalMap * normalMapStrength + fNormal);

  float diffuseBrightness = diffuseFactor * dot(normalize(diffuseLightPos), normal);
  diffuseBrightness = max(diffuseBrightness, 0.0);
  vec3 diffuseColor = (diffuseBrightness + ambientFactor) * textureColor;

  vec3 color = diffuseColor;
  gl_FragColor = vec4(color, 1.0);
}
`;