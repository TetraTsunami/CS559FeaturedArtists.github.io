const BLOCK_SIZE = 10;

const CAMERA_ROTATE_RADIUS = 100;
const CAMERA_ROTATE_SPEED = 0.001;
const CAMERA_ROTATE_CENTER = BLOCK_SIZE * 3;
const CAMERA_LOOKAT = [CAMERA_ROTATE_CENTER, CAMERA_ROTATE_CENTER, BLOCK_SIZE * 3];

const BLOCK_CORNERS = [
  [0, 0, 0], [0, 0, 1],
  [0, 1, 0], [0, 1, 1],
  [1, 0, 0], [1, 0, 1],
  [1, 1, 0], [1, 1, 1],

  [0, 0, 0], [0, 0, 1],
  [0, 1, 0], [0, 1, 1],
  [1, 0, 0], [1, 0, 1],
  [1, 1, 0], [1, 1, 1],

  [0, 0, 0], [0, 0, 1],
  [0, 1, 0], [0, 1, 1],
  [1, 0, 0], [1, 0, 1],
  [1, 1, 0], [1, 1, 1],
];
const BLOCK_VERTEX_NORMALS = [
  [-1, 0, 0], [-1, 0, 0],
  [-1, 0, 0], [-1, 0, 0],
  [1, 0, 0], [1, 0, 0],
  [1, 0, 0], [1, 0, 0],

  [0, 0, -1], [0, 0, 1],
  [0, 0, -1], [0, 0, 1],
  [0, 0, -1], [0, 0, 1],
  [0, 0, -1], [0, 0, 1],

  [0, -1, 0], [0, -1, 0],
  [0, 1, 0], [0, 1, 0],
  [0, -1, 0], [0, -1, 0],
  [0, 1, 0], [0, 1, 0],
];
const BLOCK_TEXTURE_COORDS = [
  [0, 1], [1, 1],
  [0, 0], [1, 0],
  [1, 1], [0, 1],
  [1, 0], [0, 0],

  [1, 1], [0, 1],
  [1, 0], [0, 0],
  [0, 1], [1, 1],
  [0, 0], [1, 0],

  [0, 0], [1, 0],
  [0, 1], [1, 1],
  [0, 1], [1, 1],
  [0, 0], [1, 0],
]
const BLOCK_TRIANGLE_INDICES = [
  [0, 1, 3], [0, 2, 3],
  [4, 5, 7], [4, 6, 7],
  [8, 12, 14], [8, 10, 14],
  [9, 13, 15], [9, 11, 15],
  [16, 17, 21], [16, 20, 21],
  [18, 19, 23], [18, 22, 23],
];

let num_loaded_images = 0;

window.onload = function () {
  let canvas = document.getElementById("canvas");
  let gl = canvas.getContext("webgl");

  let heightSlider = document.getElementById("height-slider");
  let moveCameraCheckbox = document.getElementById("move-camera-checkbox");
  let normalSlider = document.getElementById("normal-slider");
  let diffuseLightAngleSlider = document.getElementById("diffuse-light-angle-slider");

  let camera_angle = 0;

  // Compile vertex shader
  let vertex_shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex_shader, VERTEX_SOURCE);
  gl.compileShader(vertex_shader);
  if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertex_shader)); return null;
  }

  // Compile fragment shader
  let frag_shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(frag_shader, FRAG_SOURCE);
  gl.compileShader(frag_shader);
  if (!gl.getShaderParameter(frag_shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(frag_shader)); return null;
  }

  // Attach the shaders and link
  var program = gl.createProgram();
  gl.attachShader(program, vertex_shader);
  gl.attachShader(program, frag_shader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert("Could not initialize shaders"); return null;
  }
  gl.useProgram(program);

  // Store the attribute handles
  let attributes = {};
  attributes.position = gl.getAttribLocation(program, "vPosition");
  gl.enableVertexAttribArray(attributes.position);
  attributes.normal = gl.getAttribLocation(program, "vNormal");
  gl.enableVertexAttribArray(attributes.normal);
  attributes.texture_coords = gl.getAttribLocation(program, "vTextureCoords");
  gl.enableVertexAttribArray(attributes.texture_coords);

  // Store the uniform handles
  let uniforms = {};
  uniforms.normalMatrix = gl.getUniformLocation(program, "normalMatrix");
  uniforms.modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
  uniforms.projectionMatrix = gl.getUniformLocation(program, "projectionMatrix");
  uniforms.textureSampler = gl.getUniformLocation(program, "textureSampler");
  uniforms.normalSampler = gl.getUniformLocation(program, "normalSampler");
  uniforms.normalMapStrength = gl.getUniformLocation(program, "normalMapStrength");
  uniforms.diffuseLightPos = gl.getUniformLocation(program, "diffuseLightPos");
  uniforms.diffuseFactor = gl.getUniformLocation(program, "diffuseFactor");
  uniforms.ambientFactor = gl.getUniformLocation(program, "ambientFactor");

  // Store the data of each shader call
  let texture_slots = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5];
  let unused_texture_slot = 0;
  let shader_calls = [];
  for (let [_, type] of Object.entries(BLOCK_TYPES)) {
    let blocks = BLOCKS.filter((a) => a.type == type);

    let vertices = [];
    let normals = [];
    let texture_coords = [];
    let triangles = [];
    for (let [index, block] of blocks.entries()) {
      vertices.push(...BLOCK_CORNERS.flatMap(p => p.map((c, i) => (c + block.position[i]) * BLOCK_SIZE)));
      normals.push(...BLOCK_VERTEX_NORMALS.flat());
      texture_coords.push(...BLOCK_TEXTURE_COORDS.flat());
      triangles.push(...BLOCK_TRIANGLE_INDICES.flat().map(i => i + 24 * index));
    }
    normals = new Float32Array(normals);
    vertices = new Float32Array(vertices);
    texture_coords = new Float32Array(texture_coords);
    triangles = new Uint16Array(triangles);

    // for (let i = 0; i < triangles.length; i += 3) {
    //   console.log(
    //     vertices[triangles[i]], vertices[triangles[i] + 1], vertices[triangles[i] + 2],
    //     vertices[triangles[i + 1]], vertices[triangles[i + 1] + 1], vertices[triangles[i + 1] + 2],
    //     vertices[triangles[i + 2]], vertices[triangles[i + 2] + 1], vertices[triangles[i + 2] + 2],
    //   );
    // }

    let vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    vertex_buffer.itemSize = 3;
    vertex_buffer.numItems = 24 * blocks.length;

    let normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    normal_buffer.itemSize = 3;
    normal_buffer.numItems = 24 * blocks.length;

    let texture_coord_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texture_coord_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, texture_coords, gl.STATIC_DRAW);
    texture_coord_buffer.itemSize = 2;
    texture_coord_buffer.numItems = 24 * blocks.length;

    var triangle_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangle_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangles, gl.STATIC_DRAW);

    let texture_map = gl.createTexture();
    gl.activeTexture(texture_slots[unused_texture_slot]);
    gl.bindTexture(gl.TEXTURE_2D, texture_map);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    let normal_map = gl.createTexture();
    gl.activeTexture(texture_slots[unused_texture_slot + 1]);
    gl.bindTexture(gl.TEXTURE_2D, normal_map);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    load_texture(type.texture, texture_map);
    load_texture(type.normal, normal_map);

    shader_calls.push({
      vertex_buffer: vertex_buffer,
      normal_buffer: normal_buffer,
      texture_coord_buffer: texture_coord_buffer,
      triangle_buffer: triangle_buffer,
      texture_map: texture_map,
      normal_map: normal_map,
      active_texture: texture_slots[unused_texture_slot],
      active_texture_num: unused_texture_slot,
      active_texture_normal: texture_slots[unused_texture_slot + 1],
      active_texture_normal_num: unused_texture_slot + 1,
      num_triangle_indices: triangles.length
    });

    unused_texture_slot += 2;
  }

  function load_texture(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Option 1 : Use mipmap, select interpolation mode
    gl.generateMipmap(gl.TEXTURE_2D);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  // Get the camera position
  function camera_pos() {
    // return [0, 0, 0];
    return [CAMERA_ROTATE_RADIUS * Math.cos(camera_angle) + CAMERA_ROTATE_CENTER, heightSlider.value, CAMERA_ROTATE_RADIUS * Math.sin(camera_angle) + CAMERA_ROTATE_CENTER];
    // return [CAMERA_ROTATE_RADIUS, heightSlider.value, CAMERA_ROTATE_RADIUS];
  }

  function camera_lookat() {
    return CAMERA_LOOKAT;
    // return [CAMERA_ROTATE_RADIUS * Math.cos(camera_angle + Math.PI), 0, CAMERA_ROTATE_RADIUS * Math.sin(camera_angle + Math.PI)];
  }

  function diffuse_light_pos() {
    let angle = diffuseLightAngleSlider.value * Math.PI / 180;
    return [Math.cos(angle), 10, Math.sin(angle)];
  }

  let prev_time = 0;
  function draw(time) {
    let time_diff = prev_time == 0 ? 0 : time - prev_time;

    if (moveCameraCheckbox.checked)
      camera_angle += time_diff * CAMERA_ROTATE_SPEED;

    let cameraPos = camera_pos();
    let cameraLookAt = camera_lookat();
    let cameraUp = vec3.fromValues(0, 100, 0);
    let tCamera = mat4.create();
    mat4.lookAt(tCamera, cameraPos, cameraLookAt, cameraUp);

    var tModel = mat4.create();
    // mat4.fromScaling(tModel, [1, 1, 1]);
    // mat4.rotate(tModel, tModel, camera_angle, [0, CAMERA_ROTATE_CENTER, 0]);

    var tProjection = mat4.create();
    mat4.perspective(tProjection, Math.PI / 4, 1, 10, 1000);

    var tMV = mat4.create();
    var tMVn = mat3.create();
    var tMVP = mat4.create();
    mat4.multiply(tMV, tCamera, tModel); // "modelView" matrix
    mat3.normalFromMat4(tMVn, tMV);
    mat4.multiply(tMVP, tProjection, tMV);

    // Clear screen, prepare for rendering
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up uniforms
    gl.uniformMatrix3fv(uniforms.normalMatrix, false, tMVn);
    gl.uniformMatrix4fv(uniforms.modelViewMatrix, false, tMV);
    gl.uniformMatrix4fv(uniforms.projectionMatrix, false, tMVP);
    gl.uniform1f(uniforms.normalMapStrength, normalSlider.value);
    gl.uniform3fv(uniforms.diffuseLightPos, diffuse_light_pos());
    gl.uniform1f(uniforms.diffuseFactor, 1);
    gl.uniform1f(uniforms.ambientFactor, 0.1);

    for (let call of shader_calls) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, call.triangle_buffer);

      gl.bindBuffer(gl.ARRAY_BUFFER, call.vertex_buffer);
      gl.vertexAttribPointer(attributes.position, call.vertex_buffer.itemSize,
        gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, call.normal_buffer);
      gl.vertexAttribPointer(attributes.normal, call.normal_buffer.itemSize,
        gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, call.texture_coord_buffer);
      gl.vertexAttribPointer(attributes.texture_coords, call.texture_coord_buffer.itemSize,
        gl.FLOAT, false, 0, 0);

      // Bind texture
      gl.activeTexture(call.active_texture);
      gl.bindTexture(gl.TEXTURE_2D, call.texture_map);
      gl.activeTexture(call.active_texture_normal);
      gl.bindTexture(gl.TEXTURE_2D, call.normal_map);

      // Set texture sampler
      gl.uniform1i(uniforms.textureSampler, call.active_texture_num);
      gl.uniform1i(uniforms.normalSampler, call.active_texture_normal_num);

      gl.drawElements(gl.TRIANGLES, call.num_triangle_indices, gl.UNSIGNED_SHORT, 0);
    }

    prev_time = time;
    window.requestAnimationFrame(draw);
  }

  window.requestAnimationFrame(draw);
};