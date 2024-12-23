const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');
let viewAngle = 0;
let cameraSlider = document.getElementById('slider1');
let fidelitySlider = document.getElementById('fidelity');
let shadows = document.getElementById('shadows');
let fps = document.getElementById('fps');
let polygons = document.getElementById('polygons');
let starbitTrajectory = document.getElementById('starbitTraj');
let timeDelta = 0
let timeLast = 0;
let light = null;

let t = 0;
let parsedData = "";
let starbitParsed = "";
let materials = [];
let starbitMaterials = [];
let textures = {};
let camera = null;
let mouseX = 0;
let mouseY = 0;
let polygonsRendered = 0;
fidelitySlider.slider = 1;
shadows.checked = true;
starbitTrajectory.checked = false;

function moveToTx(loc,Tx)
{var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.moveTo(res[0],res[1]);}

function lineToTx(loc,Tx)
{var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.lineTo(res[0],res[1]);}

// Function to parse the OBJ file
function parseOBJ(objText, mtlData) {
  const vertices = [];
  const textureCoords = [];
  const faces = [];
  const materialNames = [];
  const materialIndices = [];

  let currentMaterial = null;

  const lines = objText.split('\n');
  lines.forEach((line) => {
    const elements = line.trim().split(' ');
    switch (elements[0]) {
      case 'v':
        vertices.push({
          x: parseFloat(elements[1]),
          y: parseFloat(elements[2]),
          z: parseFloat(elements[3]),
        });
        break;
      case 'vt':
        textureCoords.push({
          u: parseFloat(elements[1]),
          v: parseFloat(elements[2]),
        });
        break;
      case 'f':
        const faceVertices = elements.slice(1).map((vertex) => {
          const [vertexIndex, textureIndex, normalIndex] = vertex.split('/').map(index => parseInt(index) - 1);
          return { vertexIndex, textureIndex, normalIndex, materialIndex: materialNames.indexOf(currentMaterial) };
        });
        faces.push(faceVertices);
        materialIndices.push(materialNames.indexOf(currentMaterial)); // Assign material index to faces
        break;
      case 'usemtl':
        currentMaterial = elements[1];
        materialNames.push(currentMaterial);
        break;
      default:
        // Other cases can be handled based on the OBJ file format
        break;
    }
  });

  const materialToTextureMap = {};
  mtlData = mtlData.split('\n');
  if (mtlData) {
    let currentMtl = null;
    mtlData.forEach((line) => {
      const elements = line.trim().split(' ');
      switch (elements[0]) {
        case 'newmtl':
          currentMtl = elements[1];
          break;
        case 'map_Kd': // Use 'map_Kd' command for the diffuse color texture mapping
          const textureFileName = elements.slice(1).join(' ');
          materialToTextureMap[currentMtl] = textures[textureFileName]; // Assign Image object reference
          break;
        default:
          break;
      }
    });
  }

  return { vertices, textureCoords, faces, materialNames, materialIndices, materialToTextureMap };
}

  function parseMTL(data) {
    const materials = [];
    let currentMaterial = null;

    // Split the file content into lines
    const lines = data.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('newmtl ')) {
            // New material definition
            const materialName = line.substring(7);
            currentMaterial = { name: materialName };
            materials.push(currentMaterial);
        } else if (currentMaterial) {
            // Parse material properties
            if (line.startsWith('map_Kd ')) {
                // Texture file reference
                currentMaterial.textureFile = line.substring(7).trim();
            } else if (line.startsWith('Ka ')) {
                // Ambient color
                const ambient = line.substring(3).trim().split(' ').map(parseFloat);
                currentMaterial.ambient = ambient;
            } else if (line.startsWith('Kd ')) {
                // Diffuse color
                const diffuse = line.substring(3).trim().split(' ').map(parseFloat);
                currentMaterial.diffuse = diffuse;
            } else if (line.startsWith('Ks ')) {
                // Specular color
                const specular = line.substring(3).trim().split(' ').map(parseFloat);
                currentMaterial.specular = specular;
            } else if (line.startsWith('Ns ')) {
                // Shininess
                currentMaterial.shininess = parseFloat(line.substring(3).trim());
            } else if (line.startsWith('d ')) {
                // Transparency (d)
                currentMaterial.transparency = parseFloat(line.substring(2).trim());
            } else if (line.startsWith('Tr ')) {
                // Transparency (Tr)
                currentMaterial.transparency = 1.0 - parseFloat(line.substring(3).trim());
            } else if (line.startsWith('illum ')) {
                // Illumination model
                currentMaterial.illumination = parseInt(line.substring(6).trim(), 10);
            }
        }
    }

    return materials;
}

function loadTextures(){
  materials.forEach(material => {
      if (material.textureFile) {
          const img = new Image();
          img.src = 'textures/' + material.textureFile; // Adjust the path to your texture directory
          textures[material.textureFile] = img;
      }
  });
  textures["skybox"] = new Image();
  textures["skybox"].src = "skybox.jpeg";
}

function shadowCalculation(face, vertices){
    let v1_arr = vertices[face[1].vertexIndex];
    let v2_arr = vertices[face[0].vertexIndex];
    let v3_arr = vertices[face[2].vertexIndex];
    
    const v1 = vec3.fromValues(v1_arr.x, v1_arr.y, v1_arr.z);
    const v2 = vec3.fromValues(v2_arr.x, v2_arr.y, v2_arr.z);
    const v3 = vec3.fromValues(v3_arr.x, v3_arr.y, v3_arr.z);
    let edge1 = vec3.create();
    let edge2 = vec3.create();
    let normal = vec3.create();

    vec3.subtract(edge1, v2, v1);
    vec3.subtract(edge2, v3, v1);
    vec3.cross(normal, edge1, edge2);

    // Calculate the center of the triangle
    const center = [
        (v1[0] + v2[0] + v3[0]) / 3,
        (v1[1] + v2[1] + v3[1]) / 3,
        (v1[2] + v2[2] + v3[2]) / 3
    ];

    const lightToCenter = vec3.subtract(vec3.create(), light, center);
    const dotProduct = vec3.dot(normal, lightToCenter);
    const darkness = 1 - (dotProduct / (vec3.length(normal) * vec3.length(lightToCenter)));
    return darkness;
}

function renderStarbitToCanvas(starbitParsed, canvas, transformationMatrix, materials){
  const ctx = canvas.getContext('2d');
  const { vertices, textureCoords, faces, materialNames, materialIndices, materialToTextureMap } = starbitParsed;
  light = vec3.fromValues(camera[0],camera[1],camera[2]);
  let Tx = mat4.clone(transformationMatrix);
  vec3.transformMat4(light,light,Tx);

  faces.forEach((face, faceIndex) => {
    ctx.beginPath();
    face.forEach((vertexData, i) => {
      const vertexIndex = vertexData.vertexIndex;
      const vertex = vertices[vertexIndex];
      let translate = Ccomp(t);
      
      if (i === 0) {
        moveToTx([vertex.x + translate[0], vertex.y + translate[1], vertex.z + translate[2]], Tx);
      } else {
        lineToTx([vertex.x + translate[0], vertex.y + translate[1], vertex.z + translate[2]], Tx);
      }
    });

    const material = materials[face[0].materialIndex];

    // Fetch the associated texture for the material
    ctx.fillStyle = "yellow"
    ctx.fill(); //Draw textures

    if(shadows.checked){
      let darkness = shadowCalculation(face, vertices)
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.3, darkness)})`; // Adjust alpha value to control darkness
      ctx.globalCompositeOperation = 'source-over';
      ctx.fill(); //Apply shadow
    }
    
    polygonsRendered += 1
    ctx.closePath();
  });
}

function renderModelToCanvas(parsedData, canvas, transformationMatrix, materials) {
  const ctx = canvas.getContext('2d');
  const { vertices, textureCoords, faces, materialNames, materialIndices, materialToTextureMap } = parsedData;
  light = vec3.fromValues(camera[0],camera[1],camera[2]);
  let Tx = mat4.clone(transformationMatrix);
  ctx.lineWidth = 0.5;

  vec3.transformMat4(light,light,Tx);

  faces.forEach((face, faceIndex) => {
    const verticesForFace = face.map(vertexData => {
        const vertex = vertices[vertexData.vertexIndex];
        const transformedVertex = vec3.create();
        vec3.transformMat4(transformedVertex, [vertex.x, vertex.y, vertex.z], Tx);
        return transformedVertex;
    });

    const averageZ = verticesForFace.reduce((sum, vertex) => sum + vertex[2], 0) / verticesForFace.length;
    face.averageZ = averageZ; // Store the average Z depth within the face object
    face.faceIndex = faceIndex;
  });

  faces.sort((faceA, faceB) => faceA.averageZ - faceB.averageZ);
  
  faces.forEach((face, faceIndex) => {
    if(faceIndex < faces.length * (1 - fidelitySlider.value)){
      return; //We can do this because 1/2 the faces are obscured.
    }

    ctx.beginPath();
    face.forEach((vertexData, i) => {
      const vertexIndex = vertexData.vertexIndex;
      const vertex = vertices[vertexIndex];
      
      if (i === 0) {
        moveToTx([vertex.x, vertex.y, vertex.z], Tx);
      } else {
        lineToTx([vertex.x, vertex.y, vertex.z], Tx);
      }
    });

    const material = materials[face[0].materialIndex];

    // Fetch the associated texture for the material
    const materialName = material.name;
    const texture = materialToTextureMap[materialName];

    if(!materialName.toLowerCase().includes("water")){
      let pattern = ctx.createPattern(texture, "repeat");
      ctx.fillStyle = pattern
      ctx.fill(); //Draw textures
    }

    if(shadows.checked){
      let darkness = shadowCalculation(face, vertices)
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`; // Adjust alpha value to control darkness
      ctx.globalCompositeOperation = 'source-over';
      ctx.fill(); //Apply shadow
    }

    if(materialName.toLowerCase().includes("water")){
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = `rgba(41, 97, 194, 0.75)`; 
      ctx.globalCompositeOperation = 'source-over';
      ctx.fill();
    }

    polygonsRendered += 1
    ctx.closePath();
  })
}

function drawPath(transformationMatrix){
  drawTrajectory(0.0,1.0,100,C0,transformationMatrix,"red");
  drawTrajectory(0.0,1.0,100,C1,transformationMatrix,"blue");
}


function setup(){ 
    materials = parseMTL(materialSrc);
    starbitMaterials = parseMTL(starbit_mat);
    loadTextures();
    parsedData = parseOBJ(gateway, materialSrc);
    starbitParsed = parseOBJ(starbit, starbit_mat)
    
    requestAnimationFrame(draw);
}

function createCamera(){
  viewAngle = cameraSlider.value*0.02*Math.PI;
  let eyeCamera = CameraCurve(viewAngle);
  let targetCamera = vec3.fromValues(0, 0, 0);
  let upCamera = vec3.fromValues(0, 1, 0);
  let TlookAtCamera = mat4.create();
  mat4.lookAt(TlookAtCamera, eyeCamera, targetCamera, upCamera);
  
  let Tviewport = mat4.create();
	mat4.fromTranslation(Tviewport,[canvas.width/2,canvas.height/2,0]);
  mat4.scale(Tviewport,Tviewport,[100,100,1]);

  let TprojectionCamera = mat4.create();
  mat4.perspective(TprojectionCamera,Math.PI/4,1,-1,1);

  let tVP_PROJ_VIEW_Camera = mat4.create();
  mat4.multiply(tVP_PROJ_VIEW_Camera,Tviewport,TprojectionCamera);
  mat4.multiply(tVP_PROJ_VIEW_Camera,tVP_PROJ_VIEW_Camera,TlookAtCamera);

  return tVP_PROJ_VIEW_Camera;
}

function draw(elapsedTime) {
  canvas.width = canvas.width;
  timeDelta = elapsedTime - timeLast;
  timeLast = elapsedTime;

  //Draw background
  context.drawImage(textures["skybox"], 0, 0, canvas.width, canvas.height);

  // Create camera!
  camera = createCamera();
  
  if(starbitTrajectory.checked)
    drawPath(camera);
  renderStarbitToCanvas(starbitParsed, canvas, camera, starbitMaterials)
  renderModelToCanvas(parsedData, canvas, camera, materials);
  
  fps.textContent = `FPS: ${Math.round(1000/timeDelta)}`;
  polygons.textContent = `Polygons Rendered: ${polygonsRendered}`;
  polygonsRendered = 0;
  t += 0.01
  t = t > 2 ? 0 : t;
  requestAnimationFrame(draw);
}

// Moves the camera along a circle on the xz plane.
var CameraCurve = function(angle) {
  var distance = 3300.0;
  var eye = vec3.create();
  eye[0] = distance*Math.sin(angle);
  eye[1] = 100;
  eye[2] = distance*Math.cos(angle);  
  return [eye[0],eye[1],eye[2]];
}

//Copied from https://stackoverflow.com/questions/7790725/javascript-track-mouse-position
function track(e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
}

var Hermite = function(t) {
  return [
    2*t*t*t-3*t*t+1,
    t*t*t-2*t*t+t,
    -2*t*t*t+3*t*t,
    t*t*t-t*t
  ];
}

var HermiteDerivative = function(t) {
    return [
    6*t*t-6*t,
    3*t*t-4*t+1,
    -6*t*t+6*t,
    3*t*t-2*t
    ];
}

function Cubic(basis,P,t){
  var b = basis(t);
  var result=vec3.create();
  vec3.scale(result,P[0],b[0]);
  vec3.scaleAndAdd(result,result,P[1],b[1]);
  vec3.scaleAndAdd(result,result,P[2],b[2]);
  vec3.scaleAndAdd(result,result,P[3],b[3]);
  return result;
}

var p0=[3000*Math.sin(viewAngle),500,3000*Math.cos(viewAngle)];
var d0=[300,300,300];
var p1=[3000,-500,800];
var d1=[0,300,300];
var p2=[3000*Math.sin(viewAngle),500,3000*Math.cos(viewAngle)];
var d2=[0,300,0];

var P0 = [p0,d0,p1,d1]; // First two points and tangents
var P1 = [p1,d1,p2,d2]; // Last two points and tangents

var C0 = function(t_) {return Cubic(Hermite,P0,t_);};
var C1 = function(t_) {return Cubic(Hermite,P1,t_);};

var C0prime = function(t_) {return Cubic(HermiteDerivative,P0,t_);};
var C1prime = function(t_) {return Cubic(HermiteDerivative,P1,t_);};

var Ccomp = function(t) {
  if (t<1){
      var u = t;
      return C0(u);
  } else {
      var u = t-1.0;
      return C1(u);
  }          
}

function drawTrajectory(t_begin,t_end,intervals,C,Tx,color) {
  context.strokeStyle=color;
  context.beginPath();
    moveToTx(C(t_begin),Tx);
    for(var i=1;i<=intervals;i++){
        var t=((intervals-i)/intervals)*t_begin+(i/intervals)*t_end;
        lineToTx(C(t),Tx);
    }
    context.stroke();
}

addEventListener("mousemove", track, false);
window.onload = setup;
