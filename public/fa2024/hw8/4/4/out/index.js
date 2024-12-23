var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// node_modules/gl-matrix/esm/common.js
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
var RANDOM = Math.random;
var degree = Math.PI / 180;
if (!Math.hypot)
  Math.hypot = function() {
    var y = 0, i = arguments.length;
    while (i--) {
      y += arguments[i] * arguments[i];
    }
    return Math.sqrt(y);
  };

// node_modules/gl-matrix/esm/mat3.js
var exports_mat3 = {};
__export(exports_mat3, {
  transpose: () => transpose,
  translate: () => translate,
  subtract: () => subtract,
  sub: () => sub,
  str: () => str,
  set: () => set,
  scale: () => scale,
  rotate: () => rotate,
  projection: () => projection,
  normalFromMat4: () => normalFromMat4,
  multiplyScalarAndAdd: () => multiplyScalarAndAdd,
  multiplyScalar: () => multiplyScalar,
  multiply: () => multiply,
  mul: () => mul,
  invert: () => invert,
  identity: () => identity,
  fromValues: () => fromValues,
  fromTranslation: () => fromTranslation,
  fromScaling: () => fromScaling,
  fromRotation: () => fromRotation,
  fromQuat: () => fromQuat,
  fromMat4: () => fromMat4,
  fromMat2d: () => fromMat2d,
  frob: () => frob,
  exactEquals: () => exactEquals,
  equals: () => equals,
  determinant: () => determinant,
  create: () => create,
  copy: () => copy,
  clone: () => clone,
  adjoint: () => adjoint,
  add: () => add
});
function create() {
  var out = new ARRAY_TYPE(9);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}
function fromMat4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[4];
  out[4] = a[5];
  out[5] = a[6];
  out[6] = a[8];
  out[7] = a[9];
  out[8] = a[10];
  return out;
}
function clone(a) {
  var out = new ARRAY_TYPE(9);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
function fromValues(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  var out = new ARRAY_TYPE(9);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
function set(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
function transpose(out, a) {
  if (out === a) {
    var a01 = a[1], a02 = a[2], a12 = a[5];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a01;
    out[5] = a[7];
    out[6] = a02;
    out[7] = a12;
  } else {
    out[0] = a[0];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a[1];
    out[4] = a[4];
    out[5] = a[7];
    out[6] = a[2];
    out[7] = a[5];
    out[8] = a[8];
  }
  return out;
}
function invert(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2];
  var a10 = a[3], a11 = a[4], a12 = a[5];
  var a20 = a[6], a21 = a[7], a22 = a[8];
  var b01 = a22 * a11 - a12 * a21;
  var b11 = -a22 * a10 + a12 * a20;
  var b21 = a21 * a10 - a11 * a20;
  var det = a00 * b01 + a01 * b11 + a02 * b21;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;
  return out;
}
function adjoint(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2];
  var a10 = a[3], a11 = a[4], a12 = a[5];
  var a20 = a[6], a21 = a[7], a22 = a[8];
  out[0] = a11 * a22 - a12 * a21;
  out[1] = a02 * a21 - a01 * a22;
  out[2] = a01 * a12 - a02 * a11;
  out[3] = a12 * a20 - a10 * a22;
  out[4] = a00 * a22 - a02 * a20;
  out[5] = a02 * a10 - a00 * a12;
  out[6] = a10 * a21 - a11 * a20;
  out[7] = a01 * a20 - a00 * a21;
  out[8] = a00 * a11 - a01 * a10;
  return out;
}
function determinant(a) {
  var a00 = a[0], a01 = a[1], a02 = a[2];
  var a10 = a[3], a11 = a[4], a12 = a[5];
  var a20 = a[6], a21 = a[7], a22 = a[8];
  return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
}
function multiply(out, a, b) {
  var a00 = a[0], a01 = a[1], a02 = a[2];
  var a10 = a[3], a11 = a[4], a12 = a[5];
  var a20 = a[6], a21 = a[7], a22 = a[8];
  var b00 = b[0], b01 = b[1], b02 = b[2];
  var b10 = b[3], b11 = b[4], b12 = b[5];
  var b20 = b[6], b21 = b[7], b22 = b[8];
  out[0] = b00 * a00 + b01 * a10 + b02 * a20;
  out[1] = b00 * a01 + b01 * a11 + b02 * a21;
  out[2] = b00 * a02 + b01 * a12 + b02 * a22;
  out[3] = b10 * a00 + b11 * a10 + b12 * a20;
  out[4] = b10 * a01 + b11 * a11 + b12 * a21;
  out[5] = b10 * a02 + b11 * a12 + b12 * a22;
  out[6] = b20 * a00 + b21 * a10 + b22 * a20;
  out[7] = b20 * a01 + b21 * a11 + b22 * a21;
  out[8] = b20 * a02 + b21 * a12 + b22 * a22;
  return out;
}
function translate(out, a, v) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], x = v[0], y = v[1];
  out[0] = a00;
  out[1] = a01;
  out[2] = a02;
  out[3] = a10;
  out[4] = a11;
  out[5] = a12;
  out[6] = x * a00 + y * a10 + a20;
  out[7] = x * a01 + y * a11 + a21;
  out[8] = x * a02 + y * a12 + a22;
  return out;
}
function rotate(out, a, rad) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], s = Math.sin(rad), c = Math.cos(rad);
  out[0] = c * a00 + s * a10;
  out[1] = c * a01 + s * a11;
  out[2] = c * a02 + s * a12;
  out[3] = c * a10 - s * a00;
  out[4] = c * a11 - s * a01;
  out[5] = c * a12 - s * a02;
  out[6] = a20;
  out[7] = a21;
  out[8] = a22;
  return out;
}
function scale(out, a, v) {
  var x = v[0], y = v[1];
  out[0] = x * a[0];
  out[1] = x * a[1];
  out[2] = x * a[2];
  out[3] = y * a[3];
  out[4] = y * a[4];
  out[5] = y * a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = v[0];
  out[7] = v[1];
  out[8] = 1;
  return out;
}
function fromRotation(out, rad) {
  var s = Math.sin(rad), c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = -s;
  out[4] = c;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = v[1];
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
function fromMat2d(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = 0;
  out[3] = a[2];
  out[4] = a[3];
  out[5] = 0;
  out[6] = a[4];
  out[7] = a[5];
  out[8] = 1;
  return out;
}
function fromQuat(out, q) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[3] = yx - wz;
  out[6] = zx + wy;
  out[1] = yx + wz;
  out[4] = 1 - xx - zz;
  out[7] = zy - wx;
  out[2] = zx - wy;
  out[5] = zy + wx;
  out[8] = 1 - xx - yy;
  return out;
}
function normalFromMat4(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  return out;
}
function projection(out, width, height) {
  out[0] = 2 / width;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = -2 / height;
  out[5] = 0;
  out[6] = -1;
  out[7] = 1;
  out[8] = 1;
  return out;
}
function str(a) {
  return "mat3(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ")";
}
function frob(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
}
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  return out;
}
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  return out;
}
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  return out;
}
function multiplyScalarAndAdd(out, a, b, scale2) {
  out[0] = a[0] + b[0] * scale2;
  out[1] = a[1] + b[1] * scale2;
  out[2] = a[2] + b[2] * scale2;
  out[3] = a[3] + b[3] * scale2;
  out[4] = a[4] + b[4] * scale2;
  out[5] = a[5] + b[5] * scale2;
  out[6] = a[6] + b[6] * scale2;
  out[7] = a[7] + b[7] * scale2;
  out[8] = a[8] + b[8] * scale2;
  return out;
}
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
}
function equals(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7], a8 = a[8];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1, Math.abs(a8), Math.abs(b8));
}
var mul = multiply;
var sub = subtract;

// node_modules/gl-matrix/esm/mat4.js
var exports_mat4 = {};
__export(exports_mat4, {
  transpose: () => transpose2,
  translate: () => translate2,
  targetTo: () => targetTo,
  subtract: () => subtract2,
  sub: () => sub2,
  str: () => str2,
  set: () => set2,
  scale: () => scale2,
  rotateZ: () => rotateZ,
  rotateY: () => rotateY,
  rotateX: () => rotateX,
  rotate: () => rotate2,
  perspectiveZO: () => perspectiveZO,
  perspectiveNO: () => perspectiveNO,
  perspectiveFromFieldOfView: () => perspectiveFromFieldOfView,
  perspective: () => perspective,
  orthoZO: () => orthoZO,
  orthoNO: () => orthoNO,
  ortho: () => ortho,
  multiplyScalarAndAdd: () => multiplyScalarAndAdd2,
  multiplyScalar: () => multiplyScalar2,
  multiply: () => multiply2,
  mul: () => mul2,
  lookAt: () => lookAt,
  invert: () => invert2,
  identity: () => identity2,
  getTranslation: () => getTranslation,
  getScaling: () => getScaling,
  getRotation: () => getRotation,
  frustum: () => frustum,
  fromZRotation: () => fromZRotation,
  fromYRotation: () => fromYRotation,
  fromXRotation: () => fromXRotation,
  fromValues: () => fromValues2,
  fromTranslation: () => fromTranslation2,
  fromScaling: () => fromScaling2,
  fromRotationTranslationScaleOrigin: () => fromRotationTranslationScaleOrigin,
  fromRotationTranslationScale: () => fromRotationTranslationScale,
  fromRotationTranslation: () => fromRotationTranslation,
  fromRotation: () => fromRotation2,
  fromQuat2: () => fromQuat2,
  fromQuat: () => fromQuat3,
  frob: () => frob2,
  exactEquals: () => exactEquals2,
  equals: () => equals2,
  determinant: () => determinant2,
  create: () => create2,
  copy: () => copy2,
  clone: () => clone2,
  adjoint: () => adjoint2,
  add: () => add2
});
function create2() {
  var out = new ARRAY_TYPE(16);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
function clone2(a) {
  var out = new ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function copy2(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function fromValues2(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
function set2(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
function identity2(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function transpose2(out, a) {
  if (out === a) {
    var a01 = a[1], a02 = a[2], a03 = a[3];
    var a12 = a[6], a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }
  return out;
}
function invert2(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
function adjoint2(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
  out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
  out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
  out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
  out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
  out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
  out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
  out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
  out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
  out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
  out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
  out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
  out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
  out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
  out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
  out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
  return out;
}
function determinant2(a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
function multiply2(out, a, b) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
function translate2(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }
  return out;
}
function scale2(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function rotate2(out, a, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;
  if (len < EPSILON) {
    return null;
  }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11];
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;
  if (a !== out) {
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}
function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
function rotateY(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  if (a !== out) {
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
function fromTranslation2(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromScaling2(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromRotation2(out, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  if (len < EPSILON) {
    return null;
  }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromRotationTranslation(out, q, v) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromQuat2(out, a) {
  var translation = new ARRAY_TYPE(3);
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw;
  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }
  fromRotationTranslation(out, a, translation);
  return out;
}
function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}
function getRotation(out, mat) {
  var scaling = new ARRAY_TYPE(3);
  getScaling(scaling, mat);
  var is1 = 1 / scaling[0];
  var is2 = 1 / scaling[1];
  var is3 = 1 / scaling[2];
  var sm11 = mat[0] * is1;
  var sm12 = mat[1] * is2;
  var sm13 = mat[2] * is3;
  var sm21 = mat[4] * is1;
  var sm22 = mat[5] * is2;
  var sm23 = mat[6] * is3;
  var sm31 = mat[8] * is1;
  var sm32 = mat[9] * is2;
  var sm33 = mat[10] * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }
  return out;
}
function fromRotationTranslationScale(out, q, v, s) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}
function fromQuat3(out, q) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2), nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}
var perspective = perspectiveNO;
function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2), nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -near;
  }
  return out;
}
function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180);
  var xScale = 2 / (leftTan + rightTan);
  var yScale = 2 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = yScale;
  out[6] = 0;
  out[7] = 0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near / (near - far);
  out[15] = 0;
  return out;
}
function orthoNO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
var ortho = orthoNO;
function orthoZO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}
function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];
  if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
    return identity2(out);
  }
  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.hypot(x0, x1, x2);
  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.hypot(y0, y1, y2);
  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }
  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
function targetTo(out, eye, target, up) {
  var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
  var z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
  var len = z0 * z0 + z1 * z1 + z2 * z2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }
  var x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }
  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
function str2(a) {
  return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
}
function frob2(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
}
function add2(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
function subtract2(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
function multiplyScalar2(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
function multiplyScalarAndAdd2(out, a, b, scale3) {
  out[0] = a[0] + b[0] * scale3;
  out[1] = a[1] + b[1] * scale3;
  out[2] = a[2] + b[2] * scale3;
  out[3] = a[3] + b[3] * scale3;
  out[4] = a[4] + b[4] * scale3;
  out[5] = a[5] + b[5] * scale3;
  out[6] = a[6] + b[6] * scale3;
  out[7] = a[7] + b[7] * scale3;
  out[8] = a[8] + b[8] * scale3;
  out[9] = a[9] + b[9] * scale3;
  out[10] = a[10] + b[10] * scale3;
  out[11] = a[11] + b[11] * scale3;
  out[12] = a[12] + b[12] * scale3;
  out[13] = a[13] + b[13] * scale3;
  out[14] = a[14] + b[14] * scale3;
  out[15] = a[15] + b[15] * scale3;
  return out;
}
function exactEquals2(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
function equals2(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
  var a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11];
  var a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  var b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
  var b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
  var b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1, Math.abs(a15), Math.abs(b15));
}
var mul2 = multiply2;
var sub2 = subtract2;

// node_modules/gl-matrix/esm/quat.js
var exports_quat = {};
__export(exports_quat, {
  str: () => str4,
  squaredLength: () => squaredLength3,
  sqrLen: () => sqrLen2,
  sqlerp: () => sqlerp,
  slerp: () => slerp,
  setAxisAngle: () => setAxisAngle,
  setAxes: () => setAxes,
  set: () => set5,
  scale: () => scale5,
  rotationTo: () => rotationTo,
  rotateZ: () => rotateZ3,
  rotateY: () => rotateY3,
  rotateX: () => rotateX3,
  random: () => random2,
  pow: () => pow,
  normalize: () => normalize3,
  multiply: () => multiply4,
  mul: () => mul4,
  ln: () => ln,
  lerp: () => lerp3,
  length: () => length3,
  len: () => len2,
  invert: () => invert3,
  identity: () => identity3,
  getAxisAngle: () => getAxisAngle,
  getAngle: () => getAngle,
  fromValues: () => fromValues5,
  fromMat3: () => fromMat3,
  fromEuler: () => fromEuler,
  exp: () => exp,
  exactEquals: () => exactEquals5,
  equals: () => equals5,
  dot: () => dot3,
  create: () => create5,
  copy: () => copy5,
  conjugate: () => conjugate,
  clone: () => clone5,
  calculateW: () => calculateW,
  add: () => add5
});

// node_modules/gl-matrix/esm/vec3.js
var exports_vec3 = {};
__export(exports_vec3, {
  zero: () => zero,
  transformQuat: () => transformQuat,
  transformMat4: () => transformMat4,
  transformMat3: () => transformMat3,
  subtract: () => subtract3,
  sub: () => sub3,
  str: () => str3,
  squaredLength: () => squaredLength,
  squaredDistance: () => squaredDistance,
  sqrLen: () => sqrLen,
  sqrDist: () => sqrDist,
  set: () => set3,
  scaleAndAdd: () => scaleAndAdd,
  scale: () => scale3,
  round: () => round,
  rotateZ: () => rotateZ2,
  rotateY: () => rotateY2,
  rotateX: () => rotateX2,
  random: () => random,
  normalize: () => normalize,
  negate: () => negate,
  multiply: () => multiply3,
  mul: () => mul3,
  min: () => min,
  max: () => max,
  lerp: () => lerp,
  length: () => length,
  len: () => len,
  inverse: () => inverse,
  hermite: () => hermite,
  fromValues: () => fromValues3,
  forEach: () => forEach,
  floor: () => floor,
  exactEquals: () => exactEquals3,
  equals: () => equals3,
  dot: () => dot,
  divide: () => divide,
  div: () => div,
  distance: () => distance,
  dist: () => dist,
  cross: () => cross,
  create: () => create3,
  copy: () => copy3,
  clone: () => clone3,
  ceil: () => ceil,
  bezier: () => bezier,
  angle: () => angle,
  add: () => add3
});
function create3() {
  var out = new ARRAY_TYPE(3);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}
function clone3(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
function fromValues3(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function copy3(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function set3(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function add3(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
function subtract3(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
function multiply3(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}
function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}
function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}
function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  return out;
}
function scale3(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
function scaleAndAdd(out, a, b, scale4) {
  out[0] = a[0] + b[0] * scale4;
  out[1] = a[1] + b[1] * scale4;
  out[2] = a[2] + b[2] * scale4;
  return out;
}
function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.hypot(x, y, z);
}
function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}
function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
function inverse(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  out[2] = 1 / a[2];
  return out;
}
function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(out, a, b) {
  var ax = a[0], ay = a[1], az = a[2];
  var bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
function lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
function random(out, scale4) {
  scale4 = scale4 || 1;
  var r = RANDOM() * 2 * Math.PI;
  var z = RANDOM() * 2 - 1;
  var zScale = Math.sqrt(1 - z * z) * scale4;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale4;
  return out;
}
function transformMat4(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
function transformMat3(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
function transformQuat(out, a, q) {
  var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  var x = a[0], y = a[1], z = a[2];
  var uvx = qy * z - qz * y, uvy = qz * x - qx * z, uvz = qx * y - qy * x;
  var uuvx = qy * uvz - qz * uvy, uuvy = qz * uvx - qx * uvz, uuvz = qx * uvy - qy * uvx;
  var w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2;
  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2;
  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}
function rotateX2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function rotateY2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function rotateZ2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2];
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function angle(a, b) {
  var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2], mag1 = Math.sqrt(ax * ax + ay * ay + az * az), mag2 = Math.sqrt(bx * bx + by * by + bz * bz), mag = mag1 * mag2, cosine = mag && dot(a, b) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
function zero(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  return out;
}
function str3(a) {
  return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
}
function exactEquals3(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
function equals3(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2];
  var b0 = b[0], b1 = b[1], b2 = b[2];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2));
}
var sub3 = subtract3;
var mul3 = multiply3;
var div = divide;
var dist = distance;
var sqrDist = squaredDistance;
var len = length;
var sqrLen = squaredLength;
var forEach = function() {
  var vec = create3();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 3;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset;i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }
    return a;
  };
}();

// node_modules/gl-matrix/esm/vec4.js
function create4() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }
  return out;
}
function clone4(a) {
  var out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function fromValues4(x, y, z, w) {
  var out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function copy4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function set4(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function add4(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
function scale4(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
function length2(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.hypot(x, y, z, w);
}
function squaredLength2(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}
function normalize2(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len2 = x * x + y * y + z * z + w * w;
  if (len2 > 0) {
    len2 = 1 / Math.sqrt(len2);
  }
  out[0] = x * len2;
  out[1] = y * len2;
  out[2] = z * len2;
  out[3] = w * len2;
  return out;
}
function dot2(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
function lerp2(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  out[3] = aw + t * (b[3] - aw);
  return out;
}
function exactEquals4(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
function equals4(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3));
}
var forEach2 = function() {
  var vec = create4();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 4;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset;i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }
    return a;
  };
}();

// node_modules/gl-matrix/esm/quat.js
function create5() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  out[3] = 1;
  return out;
}
function identity3(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
function getAxisAngle(out_axis, q) {
  var rad = Math.acos(q[3]) * 2;
  var s = Math.sin(rad / 2);
  if (s > EPSILON) {
    out_axis[0] = q[0] / s;
    out_axis[1] = q[1] / s;
    out_axis[2] = q[2] / s;
  } else {
    out_axis[0] = 1;
    out_axis[1] = 0;
    out_axis[2] = 0;
  }
  return rad;
}
function getAngle(a, b) {
  var dotproduct = dot3(a, b);
  return Math.acos(2 * dotproduct * dotproduct - 1);
}
function multiply4(out, a, b) {
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = b[0], by = b[1], bz = b[2], bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
function rotateX3(out, a, rad) {
  rad *= 0.5;
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
function rotateY3(out, a, rad) {
  rad *= 0.5;
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var by = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
function rotateZ3(out, a, rad) {
  rad *= 0.5;
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bz = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}
function calculateW(out, a) {
  var x = a[0], y = a[1], z = a[2];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = Math.sqrt(Math.abs(1 - x * x - y * y - z * z));
  return out;
}
function exp(out, a) {
  var x = a[0], y = a[1], z = a[2], w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var et = Math.exp(w);
  var s = r > 0 ? et * Math.sin(r) / r : 0;
  out[0] = x * s;
  out[1] = y * s;
  out[2] = z * s;
  out[3] = et * Math.cos(r);
  return out;
}
function ln(out, a) {
  var x = a[0], y = a[1], z = a[2], w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var t = r > 0 ? Math.atan2(r, w) / r : 0;
  out[0] = x * t;
  out[1] = y * t;
  out[2] = z * t;
  out[3] = 0.5 * Math.log(x * x + y * y + z * z + w * w);
  return out;
}
function pow(out, a, b) {
  ln(out, a);
  scale5(out, out, b);
  exp(out, out);
  return out;
}
function slerp(out, a, b, t) {
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = b[0], by = b[1], bz = b[2], bw = b[3];
  var omega, cosom, sinom, scale0, scale1;
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if (cosom < 0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if (1 - cosom > EPSILON) {
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
function random2(out) {
  var u1 = RANDOM();
  var u2 = RANDOM();
  var u3 = RANDOM();
  var sqrt1MinusU1 = Math.sqrt(1 - u1);
  var sqrtU1 = Math.sqrt(u1);
  out[0] = sqrt1MinusU1 * Math.sin(2 * Math.PI * u2);
  out[1] = sqrt1MinusU1 * Math.cos(2 * Math.PI * u2);
  out[2] = sqrtU1 * Math.sin(2 * Math.PI * u3);
  out[3] = sqrtU1 * Math.cos(2 * Math.PI * u3);
  return out;
}
function invert3(out, a) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var dot3 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  var invDot = dot3 ? 1 / dot3 : 0;
  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}
function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}
function fromMat3(out, m) {
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;
  if (fTrace > 0) {
    fRoot = Math.sqrt(fTrace + 1);
    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    var i = 0;
    if (m[4] > m[0])
      i = 1;
    if (m[8] > m[i * 3 + i])
      i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }
  return out;
}
function fromEuler(out, x, y, z) {
  var halfToRad = 0.5 * Math.PI / 180;
  x *= halfToRad;
  y *= halfToRad;
  z *= halfToRad;
  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);
  out[0] = sx * cy * cz - cx * sy * sz;
  out[1] = cx * sy * cz + sx * cy * sz;
  out[2] = cx * cy * sz - sx * sy * cz;
  out[3] = cx * cy * cz + sx * sy * sz;
  return out;
}
function str4(a) {
  return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
var clone5 = clone4;
var fromValues5 = fromValues4;
var copy5 = copy4;
var set5 = set4;
var add5 = add4;
var mul4 = multiply4;
var scale5 = scale4;
var dot3 = dot2;
var lerp3 = lerp2;
var length3 = length2;
var len2 = length3;
var squaredLength3 = squaredLength2;
var sqrLen2 = squaredLength3;
var normalize3 = normalize2;
var exactEquals5 = exactEquals4;
var equals5 = equals4;
var rotationTo = function() {
  var tmpvec3 = create3();
  var xUnitVec3 = fromValues3(1, 0, 0);
  var yUnitVec3 = fromValues3(0, 1, 0);
  return function(out, a, b) {
    var dot4 = dot(a, b);
    if (dot4 < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 0.000001)
        cross(tmpvec3, yUnitVec3, a);
      normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot4 > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot4;
      return normalize3(out, out);
    }
  };
}();
var sqlerp = function() {
  var temp1 = create5();
  var temp2 = create5();
  return function(out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
var setAxes = function() {
  var matr = create();
  return function(out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize3(out, fromMat3(out, matr));
  };
}();

// node_modules/gl-matrix/esm/vec2.js
var exports_vec2 = {};
__export(exports_vec2, {
  zero: () => zero2,
  transformMat4: () => transformMat42,
  transformMat3: () => transformMat32,
  transformMat2d: () => transformMat2d,
  transformMat2: () => transformMat2,
  subtract: () => subtract4,
  sub: () => sub4,
  str: () => str5,
  squaredLength: () => squaredLength4,
  squaredDistance: () => squaredDistance2,
  sqrLen: () => sqrLen3,
  sqrDist: () => sqrDist2,
  set: () => set6,
  scaleAndAdd: () => scaleAndAdd2,
  scale: () => scale6,
  round: () => round2,
  rotate: () => rotate3,
  random: () => random3,
  normalize: () => normalize4,
  negate: () => negate2,
  multiply: () => multiply5,
  mul: () => mul5,
  min: () => min2,
  max: () => max2,
  lerp: () => lerp4,
  length: () => length4,
  len: () => len3,
  inverse: () => inverse2,
  fromValues: () => fromValues6,
  forEach: () => forEach3,
  floor: () => floor2,
  exactEquals: () => exactEquals6,
  equals: () => equals6,
  dot: () => dot4,
  divide: () => divide2,
  div: () => div2,
  distance: () => distance2,
  dist: () => dist2,
  cross: () => cross2,
  create: () => create6,
  copy: () => copy6,
  clone: () => clone6,
  ceil: () => ceil2,
  angle: () => angle2,
  add: () => add6
});
function create6() {
  var out = new ARRAY_TYPE(2);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }
  return out;
}
function clone6(a) {
  var out = new ARRAY_TYPE(2);
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
function fromValues6(x, y) {
  var out = new ARRAY_TYPE(2);
  out[0] = x;
  out[1] = y;
  return out;
}
function copy6(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
function set6(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}
function add6(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}
function subtract4(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}
function multiply5(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}
function divide2(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}
function ceil2(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  return out;
}
function floor2(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  return out;
}
function min2(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  return out;
}
function max2(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  return out;
}
function round2(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  return out;
}
function scale6(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}
function scaleAndAdd2(out, a, b, scale7) {
  out[0] = a[0] + b[0] * scale7;
  out[1] = a[1] + b[1] * scale7;
  return out;
}
function distance2(a, b) {
  var x = b[0] - a[0], y = b[1] - a[1];
  return Math.hypot(x, y);
}
function squaredDistance2(a, b) {
  var x = b[0] - a[0], y = b[1] - a[1];
  return x * x + y * y;
}
function length4(a) {
  var x = a[0], y = a[1];
  return Math.hypot(x, y);
}
function squaredLength4(a) {
  var x = a[0], y = a[1];
  return x * x + y * y;
}
function negate2(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}
function inverse2(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  return out;
}
function normalize4(out, a) {
  var x = a[0], y = a[1];
  var len3 = x * x + y * y;
  if (len3 > 0) {
    len3 = 1 / Math.sqrt(len3);
  }
  out[0] = a[0] * len3;
  out[1] = a[1] * len3;
  return out;
}
function dot4(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
function cross2(out, a, b) {
  var z = a[0] * b[1] - a[1] * b[0];
  out[0] = out[1] = 0;
  out[2] = z;
  return out;
}
function lerp4(out, a, b, t) {
  var ax = a[0], ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}
function random3(out, scale7) {
  scale7 = scale7 || 1;
  var r = RANDOM() * 2 * Math.PI;
  out[0] = Math.cos(r) * scale7;
  out[1] = Math.sin(r) * scale7;
  return out;
}
function transformMat2(out, a, m) {
  var x = a[0], y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  return out;
}
function transformMat2d(out, a, m) {
  var x = a[0], y = a[1];
  out[0] = m[0] * x + m[2] * y + m[4];
  out[1] = m[1] * x + m[3] * y + m[5];
  return out;
}
function transformMat32(out, a, m) {
  var x = a[0], y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}
function transformMat42(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}
function rotate3(out, a, b, rad) {
  var p0 = a[0] - b[0], p1 = a[1] - b[1], sinC = Math.sin(rad), cosC = Math.cos(rad);
  out[0] = p0 * cosC - p1 * sinC + b[0];
  out[1] = p0 * sinC + p1 * cosC + b[1];
  return out;
}
function angle2(a, b) {
  var x1 = a[0], y1 = a[1], x2 = b[0], y2 = b[1], mag = Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2), cosine = mag && (x1 * x2 + y1 * y2) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
function zero2(out) {
  out[0] = 0;
  out[1] = 0;
  return out;
}
function str5(a) {
  return "vec2(" + a[0] + ", " + a[1] + ")";
}
function exactEquals6(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}
function equals6(a, b) {
  var a0 = a[0], a1 = a[1];
  var b0 = b[0], b1 = b[1];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1));
}
var len3 = length4;
var sub4 = subtract4;
var mul5 = multiply5;
var div2 = divide2;
var dist2 = distance2;
var sqrDist2 = squaredDistance2;
var sqrLen3 = squaredLength4;
var forEach3 = function() {
  var vec = create6();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 2;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset;i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }
    return a;
  };
}();

// game_logic.ts
var inputActionMap = {
  w: "w" /* Forward */,
  a: "s" /* Left */,
  s: "a" /* Backward */,
  d: "d" /* Right */,
  " ": " " /* Space */
};
var qwertyActionMap = inputActionMap;
var dvorakActionMap = {
  ",": "w" /* Forward */,
  a: "s" /* Left */,
  o: "a" /* Backward */,
  e: "d" /* Right */,
  " ": " " /* Space */
};
var inputsHeld = {};
var WALK_SPEED = 2.5;
var AGITATION_SPEED = 0.5;
function walkDirection() {
  let walkDir = exports_vec2.create();
  if (inputsHeld["s" /* Left */])
    exports_vec2.add(walkDir, walkDir, [1, 0]);
  if (inputsHeld["d" /* Right */])
    exports_vec2.add(walkDir, walkDir, [-1, 0]);
  if (inputsHeld["w" /* Forward */])
    exports_vec2.add(walkDir, walkDir, [0, 1]);
  if (inputsHeld["a" /* Backward */])
    exports_vec2.add(walkDir, walkDir, [0, -1]);
  exports_vec2.normalize(walkDir, walkDir);
  return walkDir;
}
function clamp(x, min3, max3) {
  return Math.max(Math.min(x, max3), min3);
}
function update(state) {
  let delta = state.delta;
  let yaw = state.camera.yaw;
  let realWalk = walkDirection();
  if (!inputsHeld[" " /* Space */])
    state.agitation = clamp(state.agitation + delta * AGITATION_SPEED, 0, 1);
  else
    state.agitation = clamp(state.agitation - delta * AGITATION_SPEED * 2, 0, 1);
  exports_vec2.rotate(realWalk, realWalk, [0, 0], yaw);
  let oldPos = state.position;
  state.position = exports_vec2.scaleAndAdd(oldPos, oldPos, realWalk, delta * WALK_SPEED);
}
function hookInput(canvas, state) {
  let width = canvas.width;
  let height = canvas.height;
  canvas.addEventListener("click", async () => {
    await canvas.requestPointerLock({
      unadjustedMovement: true
    });
  });
  function mouseMove(event) {
    let x = event.movementX;
    let y = event.movementY;
    state.camera.pitch += y / height;
    state.camera.yaw += x / height;
  }
  document.addEventListener("pointerlockchange", (_) => {
    if (document.pointerLockElement === canvas) {
      document.addEventListener("mousemove", mouseMove);
    } else {
      document.removeEventListener("mousemove", mouseMove);
    }
  });
  document.getElementById("kblform").reset();
  document.getElementById("kblchoice1").addEventListener("click", () => {
    console.log("Selected QWERTY");
    inputActionMap = qwertyActionMap;
  });
  document.getElementById("kblchoice2").addEventListener("click", () => {
    console.log("Selected Dvorak");
    inputActionMap = dvorakActionMap;
  });
  document.addEventListener("keydown", (e) => {
    let theAction = inputActionMap[e.key];
    if (theAction) {
      inputsHeld[theAction] = true;
      e.preventDefault();
    }
  });
  document.addEventListener("keyup", (e) => {
    let theAction = inputActionMap[e.key];
    if (theAction) {
      delete inputsHeld[theAction];
      e.preventDefault();
    }
  });
}

// state.ts
class State {
  #position;
  start;
  lastFrame;
  elapsed;
  delta;
  camera;
  agitation;
  wallObjects = [
    { position: [0, 0, 0], shaderEffect: 6 /* Sphubic */ },
    { position: [3, 0, 3], shaderEffect: 4 /* Scrolling */ },
    { position: [-3, 0, 3], shaderEffect: 5 /* Censored */ }
  ];
  constructor(start, position) {
    this.start = start;
    this.lastFrame = start;
    this.delta = 1 / 60;
    this.elapsed = 0;
    this.camera = new Camera;
    this.#position = position;
    this.agitation = 0;
  }
  get position() {
    return this.#position;
  }
  set position([x, z]) {
    this.#position = [x, z];
    this.camera.position = [x * 10, 0, z * 10];
  }
}

// geometry.ts
class DividableFace {
  vertices;
  constructor([a, b, c, d]) {
    this.vertices = [a, b, c, d];
  }
  subdivide() {
    let [p1, p3, p9, p7] = this.vertices;
    let p2 = averageVertices(p1, p3);
    let p4 = averageVertices(p1, p7);
    let p6 = averageVertices(p3, p9);
    let p8 = averageVertices(p7, p9);
    let p5 = averageVertices(p4, p6);
    return [
      new DividableFace([p1, p2, p5, p4]),
      new DividableFace([p2, p3, p6, p5]),
      new DividableFace([p5, p6, p9, p8]),
      new DividableFace([p4, p5, p8, p7])
    ];
  }
  triangles() {
    let [a, b, c, d] = this.vertices;
    return [a, b, c, a, c, d];
  }
}
function averageVertices(v1, v2) {
  let outVertex = [];
  for (let i = 0;i < v1.length; i++) {
    if (v1[i].length == 2) {
      let v1_at2 = v1[i];
      let v2_at2 = v2[i];
      let out = exports_vec2.create();
      exports_vec2.scaleAndAdd(out, out, v1_at2, 0.5);
      exports_vec2.scaleAndAdd(out, out, v2_at2, 0.5);
      outVertex.push(out);
    } else if (v1[i].length == 3) {
      let v1_at3 = v1[i];
      let v2_at3 = v2[i];
      let out = exports_vec3.create();
      exports_vec3.scaleAndAdd(out, out, v1_at3, 0.5);
      exports_vec3.scaleAndAdd(out, out, v2_at3, 0.5);
      outVertex.push(out);
    }
  }
  return outVertex;
}
var initialCorners = [
  exports_vec3.fromValues(1, 1, -1),
  exports_vec3.fromValues(-1, 1, -1),
  exports_vec3.fromValues(-1, 1, 1),
  exports_vec3.fromValues(1, 1, 1),
  exports_vec3.fromValues(1, -1, -1),
  exports_vec3.fromValues(-1, -1, -1),
  exports_vec3.fromValues(-1, -1, 1),
  exports_vec3.fromValues(1, -1, 1)
];
var initialFaceIndices = [
  [4, 3, 7, 8],
  [2, 1, 5, 6],
  [3, 2, 6, 7],
  [1, 4, 8, 5],
  [1, 2, 3, 4],
  [8, 7, 6, 5]
];
var initialTexCoords = [
  exports_vec2.fromValues(1, 1),
  exports_vec2.fromValues(0, 1),
  exports_vec2.fromValues(0, 0),
  exports_vec2.fromValues(1, 0)
];
function createSubdividedCube(steps) {
  let cubeFaces = [];
  for (let f = 0;f < 6; f++) {
    let outFaceVertices = [];
    for (let c = 0;c < 4; c++) {
      outFaceVertices.push([initialCorners[initialFaceIndices[f][c] - 1], initialTexCoords[c]]);
    }
    cubeFaces.push(new DividableFace(outFaceVertices));
  }
  for (let i = 0;i < steps; i++) {
    let newFaces = [];
    for (let face of cubeFaces) {
      newFaces.push(face.subdivide());
    }
    cubeFaces = newFaces.flat();
  }
  return cubeFaces.flatMap((face) => face.triangles());
}
function giveNormals(vertices, index) {
  for (let tri = 0;tri < vertices.length; tri += 3) {
    let p = vertices[tri][index];
    let q = vertices[tri + 1][index];
    let r = vertices[tri + 2][index];
    let a = exports_vec3.create();
    let b = exports_vec3.create();
    let cross3 = exports_vec3.create();
    exports_vec3.subtract(a, r, p);
    exports_vec3.subtract(b, r, q);
    exports_vec3.cross(cross3, b, a);
    exports_vec3.normalize(cross3, cross3);
    vertices[tri].push(cross3);
    vertices[tri + 1].push(cross3);
    vertices[tri + 2].push(cross3);
  }
}
function breakOutVectors(vertices) {
  let result = [];
  for (let attribute = 0;attribute < vertices[0].length; attribute++) {
    let attributeResult = [];
    for (let v of vertices) {
      attributeResult.push(v[attribute]);
    }
    result.push(attributeResult);
  }
  return result;
}
function makeSphube(steps) {
  let cube = createSubdividedCube(steps);
  for (let i = 0;i < cube.length; i++) {
    let [pos, ...rest] = cube[i];
    let newVec = exports_vec3.create();
    exports_vec3.normalize(newVec, pos);
    cube[i] = [pos, newVec, ...rest];
  }
  giveNormals(cube, 0);
  giveNormals(cube, 1);
  return breakOutVectors(cube);
}

// shaders/obj.frag
var obj_default = `precision highp float;
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
`;

// shaders/obj.vertex
var obj_default2 = `// vim: set ft=glsl:
precision highp float;
attribute vec3 position;
attribute vec2 texCoord;
attribute vec3 vNormal; 

uniform vec3 cubeLoc;
uniform mat4 MVP;
uniform mat4 MV;
uniform mat3 uNormalMatrix;

varying vec4 fColor;
varying vec2 fTexCoord;
varying vec3 fNormal;
varying vec3 fWorldPos;

// Assuming the light source emanates from the player

void main() {
    vec4 pos = MVP * vec4(position + cubeLoc, 1.0);
    gl_Position = pos;
    vec3 theNormal = normalize(uNormalMatrix * vNormal);
    vec3 lightDir = normalize(-pos.xyz);
    float lightDist = length(pos.xyz) / 50.0;
    float stremf = clamp(1.0 / (lightDist * lightDist), 0.5, 1.0);
    fWorldPos = (MV * vec4(position + cubeLoc, 1.0)).xyz;
    fNormal = theNormal;
    fColor = vec4(vec3(1.0, 1.0, 1.0) * dot(lightDir, theNormal), 1.0);
    fTexCoord = texCoord;
}
`;

// shaders/obj_sin.frag
var obj_sin_default = `precision highp float;
varying vec4 fColor;
varying vec2 fTexCoord;
uniform sampler2D sampler; 
uniform float uTime;

void main() {
    gl_FragColor = texture2D(sampler, fTexCoord + vec2(0, 0.05 * sin(uTime * 5.0 + fTexCoord.x))) * fColor;
}
`;

// shaders/obj_scroll.frag
var obj_scroll_default = `precision highp float;
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
`;

// shaders/obj_censored.frag
var obj_censored_default = `precision highp float;
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
`;

// assets/ryan/ryan_cube_inline.txt
var ryan_cube_inline_default = "data:image/png;base64,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GW1JpehSKq+p4Elor5fWARwQTJUTHtYcyAG7q19vNwScnCBJkXyqATCn6GraGkPcGY1mzLSUMlS9NcnZHYc64Sy6GUBrVSJgQmKMMERk4rtaHBAi1FxRg1CYkTE83PU3AyeJADcDBCIMextR3rum+O2sMmci4j76VImY3meeMadZBO4eRAiEga13kgREYT5GswgWQaChamat7q3uL6+vQPzx/HC9bX/52y+1931vz9fr6fToxN9eLtUViL+9XLdb/fDuXTPftF/3re778+ultrqsejwdASgMwny71WEWaLXVQA63UXcSOebFWtv2fc2llCIIqr2PEYE5LaWUKT/U0S3UdADyYc3g0WqPuyZmEr+JibyPRESUtrGbDjkefWhOYIGu1sZII7HwHGsxESLIRD5zkuPxuO/750+fTe3jx4+P57O7fvr0y75vy7qsh+Xyen196QBQivSuczbETCQc5urgDuFuAUSOQJzSUAeI7q2ZEqDbQIDuaSlyPK/mXiMACdRpb8+3vfdeiKYoUQo2XdqwLHzIJSchj8O6ns4n7drJAQBHN4gsMhOtWtM23GE9LHWo6oiwNN0pHIgcwM0JIHT4ui6Abmp3daszRExNsanNSWwwekyJ+qxZNabALXyo45yLRkR4ePBU9PrU//hvYE5BnJROZ+YZCCEmFjV7fwoiYVEzZHKE2oeOMWKACLrtbb+L/fq43eplr1XH6972Vq+tvl6323V/uV5+/frKnA3BhfdRvzw/h+PBon17fn59NfdUEkqhQAPZmqpa4uwBo/fR+0AbrZEkQDe3JRUOX3OWcELMFKqdQbkQAUN4eGMpFB6jLgi8rpyEwLV3IOfpAZNyEE5jld6HI0hmodDeAo655N6GZF7OZbteXy+vD49nszC1QQAAkktCQntzGpq3/V73peSUaL81HZ2YjscDeARCG73pQAwkiLtqGwBp+m0gg5uqQyK2CHe3ZiS8b93DM2HJOdRdTMLVvG+3zIOR0uvWazus62FZvLacUnb59nqVhGsua0qP5zMjHNoYcU+TRCSCm/ZElJElANQISSQ5onoYADE5xDQqYKaUsrkiYl6Smk53miRCTA44uiWZqow7jA9Ipg7gJPJGi7PvWKYIB1DYd2mHftd4uNvsgb4bH8zD+p0hpTpUR9yJAoCA3QwCDbDV1kafIwEdo+9926v7dCWhTe3a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";

// shaders/sphube.frag
var sphube_default = `precision highp float;

uniform vec3 uLookVector;
varying vec4 fColor;
varying vec2 fTexCoord;
varying vec3 fNormal;
varying vec3 fWorldPos;
uniform sampler2D uTextureSampler;

void main() {
    gl_FragColor = texture2D(uTextureSampler, fTexCoord) * fColor;
}
`;

// shaders/sphube.vert
var sphube_default2 = `// vim: set ft=glsl
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
uniform float uTime;

varying vec4 fColor;
varying vec2 fTexCoord;
varying vec3 fNormal;
varying vec3 fWorldPos;

void main() {
    vec3 lerpedWorldPos = mix(vPosition1, vPosition2, 0.5 + 0.5 * sin(uTime * 2.0)) - uObjectLocation;
    vec4 pos = uMV * vec4(lerpedWorldPos, 1.0);
    vec3 lightPos = vec3(sin(uTime), 1.0, cos(uTime));
    vec3 normal = normalize(uNormalMatrix * mix(vNormal1, vNormal2, 0.5 + 0.5 * sin(uTime * 2.0)));
    float strength = clamp(dot(-lightPos, normal), 0.2, 1.0);
    fColor = vec4(strength, strength, strength, 1.0);
    fTexCoord = vTexCoord;
    fWorldPos = pos.xyz;
    gl_Position = uMVP * vec4(lerpedWorldPos, 1.0);
}
`;

// render.ts
var TAU = Math.PI * 2;
var MAX_PITCH = Math.PI / 3;
var DEG_COEFF = 180 / Math.PI;

class Camera {
  #yaw;
  #pitch;
  #position;
  proj;
  needsRebake = false;
  theMat;
  rotQuat = exports_quat.create();
  viewMatrix;
  look;
  set yaw(value) {
    this.#yaw = value % TAU;
    this.needsRebake = true;
  }
  get yaw() {
    return this.#yaw;
  }
  get pitch() {
    return this.#pitch;
  }
  set pitch(value) {
    this.#pitch = Math.max(Math.min(value, MAX_PITCH), -MAX_PITCH);
    this.needsRebake = true;
  }
  set position(value) {
    this.#position = exports_vec3.negate(value, value);
    this.needsRebake = true;
  }
  get position() {
    return this.#position;
  }
  constructor() {
    this.#yaw = 0;
    this.#pitch = 0;
    this.#position = exports_vec3.create();
    this.proj = exports_mat4.create();
    this.look = exports_vec3.fromValues(0, 0, -1);
    this.theMat = exports_mat4.create();
    exports_mat4.perspective(this.proj, Math.PI / 3, canvas.width / canvas.height, 1, 1000);
    this.viewMatrix = exports_mat4.create();
  }
  get matrix() {
    if (this.needsRebake) {
      exports_mat4.fromXRotation(this.viewMatrix, this.pitch);
      exports_mat4.rotateY(this.viewMatrix, this.viewMatrix, this.yaw);
      exports_vec3.transformMat4(this.look, exports_vec3.fromValues(0, 0, -1), this.viewMatrix);
      exports_mat4.translate(this.viewMatrix, this.viewMatrix, this.position);
      exports_mat4.scale(this.theMat, this.viewMatrix, [10, 10, 10]);
      exports_mat4.mul(this.theMat, this.proj, this.theMat);
      this.needsRebake = false;
    }
    return this.theMat;
  }
}
var canvas = document.querySelector("canvas");
var gl = canvas.getContext("webgl");

class Program {
  program;
  uniforms = {};
  attributes = {};
  activator;
  static inheritingNames(original, vertexSource, fragSource) {
    let p = new Program(vertexSource, fragSource);
    for (let attribName in original.attributes)
      p.registerAttribute(attribName);
    for (let uniformName in original.uniforms)
      p.registerUniform(uniformName);
    return p;
  }
  constructor(vertexSource, fragSource) {
    this.program = programFromSources(vertexSource, fragSource);
  }
  registerAttribute(name) {
    this.attributes[name] = gl.getAttribLocation(this.program, name);
  }
  registerUniform(name) {
    this.uniforms[name] = gl.getUniformLocation(this.program, name);
  }
}
function programFromSources(vertexSource, fragSource) {
  let vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vertexSource);
  gl.compileShader(vs);
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
    throw new Error(`Failed to compile vertex shader: ${gl.getShaderInfoLog(vs)}`);
  let fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fragSource);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
    throw new Error(`Failed to compile fragment shader: ${gl.getShaderInfoLog(fs)}`);
  let prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    throw new Error(`Failed to link program: ${gl.getProgramInfoLog(prog)}`);
  return prog;
}
var objProgram = new Program(obj_default2, obj_default);
objProgram.registerUniform("cubeLoc");
objProgram.registerUniform("sampler");
objProgram.registerUniform("MV");
objProgram.registerUniform("MVP");
objProgram.registerUniform("uNormalMatrix");
objProgram.registerAttribute("position");
objProgram.registerAttribute("texCoord");
objProgram.registerAttribute("vNormal");
var objSinProgram = Program.inheritingNames(objProgram, obj_default2, obj_sin_default);
objSinProgram.registerUniform("uTime");
var objScrollProgram = Program.inheritingNames(objSinProgram, obj_default2, obj_scroll_default);
var objCensoredProgram = Program.inheritingNames(objSinProgram, obj_default2, obj_censored_default);
var cuboidVertices = new Float32Array([
  1,
  1,
  1,
  -1,
  1,
  1,
  -1,
  -1,
  1,
  1,
  -1,
  1,
  1,
  1,
  1,
  1,
  -1,
  1,
  1,
  -1,
  -1,
  1,
  1,
  -1,
  1,
  1,
  1,
  1,
  1,
  -1,
  -1,
  1,
  -1,
  -1,
  1,
  1,
  -1,
  1,
  1,
  -1,
  1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  1,
  -1,
  -1,
  -1,
  1,
  -1,
  -1,
  1,
  -1,
  1,
  -1,
  -1,
  1,
  1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  1,
  -1,
  1,
  1,
  -1
]);
var cuboidTriIndices = new Uint8Array([
  0,
  1,
  2,
  0,
  2,
  3,
  4,
  5,
  6,
  4,
  6,
  7,
  8,
  9,
  10,
  8,
  10,
  11,
  12,
  13,
  14,
  12,
  14,
  15,
  16,
  17,
  18,
  16,
  18,
  19,
  20,
  21,
  22,
  20,
  22,
  23
]);
function vec3at(buf, ix) {
  let i = ix * 3;
  return [buf[i], buf[i + 1], buf[i + 2]];
}
function normalForTri(i) {
  let i2 = i * 6;
  let indexA = cuboidTriIndices[i2];
  let indexB = cuboidTriIndices[i2 + 1];
  let indexC = cuboidTriIndices[i2 + 2];
  console.log(indexA, indexB, indexC);
  let a = vec3at(cuboidVertices, indexA);
  let b = vec3at(cuboidVertices, indexB);
  let c = vec3at(cuboidVertices, indexC);
  let p = exports_vec3.sub(b, b, a);
  let q = exports_vec3.sub(c, c, a);
  let r = exports_vec3.create();
  exports_vec3.cross(r, p, q);
  return exports_vec3.normalize(r, r);
}
var cuboidNormalsVecs = [];
for (let i = 0;i < 6; i++) {
  let [x, y, z] = normalForTri(i);
  console.log([x, y, z]);
  for (let j = 0;j < 4; j++)
    cuboidNormalsVecs.push(x, y, z);
}
var cuboidNormals_ = new Float32Array([
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  -1,
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  -1,
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  0
]);
var cuboidNormals = new Float32Array(cuboidNormalsVecs);
var cuboidTexCoords = new Float32Array([
  1,
  1,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  1,
  1,
  0,
  0,
  1,
  0,
  1,
  1,
  0,
  1,
  1,
  1,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  0,
  1,
  0,
  1,
  1,
  0,
  1,
  0,
  0,
  1,
  0,
  1,
  1,
  0,
  1
]);
var vertexPosBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cuboidVertices, gl.STATIC_DRAW);
var triangleIndicesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndicesBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cuboidTriIndices, gl.STATIC_DRAW);
var cuboidTexCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cuboidTexCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cuboidTexCoords, gl.STATIC_DRAW);
var cuboidNormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cuboidNormalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cuboidNormals, gl.STATIC_DRAW);
function loadTexture(url, unit) {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
  const theImage = new Image;
  theImage.addEventListener("load", () => {
    var c = document.createElement("canvas");
    c.width = theImage.naturalWidth;
    c.height = theImage.naturalHeight;
    var ctx = c.getContext("2d");
    ctx.drawImage(theImage, 0, 0, c.width, c.height);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, theImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  });
  theImage.onload = function() {
    console.log(theImage.src);
  };
  theImage.src = url;
  return texture;
}
var ryanTexture = loadTexture(ryan_cube_inline_default, 0);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
function createSphubeProgram() {
  let [
    sphubeCubePositions,
    sphubeSpherePositions,
    sphubeTexCoords,
    sphubeCubeNormals,
    sphubeSphereNormals
  ] = makeSphube(5).map((x) => x.flatMap((v) => [...v.values()]));
  let sphubeIndices = [];
  for (let i = 0;i < sphubeCubePositions.length / 3; i++)
    sphubeIndices[i] = i;
  console.log(sphubeCubePositions);
  let sphubeIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphubeIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphubeIndices), gl.STATIC_DRAW);
  let sphubeCPBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphubeCPBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphubeCubePositions), gl.STATIC_DRAW);
  let sphubeSPBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphubeSPBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphubeSpherePositions), gl.STATIC_DRAW);
  let sphubeTCBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphubeTCBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphubeTexCoords), gl.STATIC_DRAW);
  let sphubeCNBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphubeCNBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphubeCubeNormals), gl.STATIC_DRAW);
  let sphubeSNBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphubeSNBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphubeSphereNormals), gl.STATIC_DRAW);
  let sphubeProgram = new Program(sphube_default2, sphube_default);
  sphubeProgram.registerUniform("uObjectLocation");
  sphubeProgram.registerUniform("uMVP");
  sphubeProgram.registerUniform("uMV");
  sphubeProgram.registerUniform("uNormalMatrix");
  sphubeProgram.registerUniform("uTime");
  sphubeProgram.registerUniform("uLookVector");
  sphubeProgram.registerAttribute("vPosition1");
  sphubeProgram.registerAttribute("vPosition2");
  sphubeProgram.registerAttribute("vTexCoord");
  sphubeProgram.registerAttribute("vNormal1");
  sphubeProgram.registerAttribute("vNormal2");
  sphubeProgram.registerUniform("uTextureSampler");
  console.log(sphubeProgram.attributes);
  sphubeProgram.activator = function(gl2, state, ryanPos) {
    let u = this.uniforms;
    let a = this.attributes;
    gl2.useProgram(this.program);
    gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, sphubeIndexBuffer);
    gl2.bindBuffer(gl2.ARRAY_BUFFER, sphubeCPBuffer);
    gl2.vertexAttribPointer(a.vPosition1, 3, gl2.FLOAT, false, 0, 0);
    gl2.enableVertexAttribArray(a.vPosition1);
    gl2.bindBuffer(gl2.ARRAY_BUFFER, sphubeSPBuffer);
    gl2.vertexAttribPointer(a.vPosition2, 3, gl2.FLOAT, false, 0, 0);
    gl2.enableVertexAttribArray(a.vPosition2);
    gl2.bindBuffer(gl2.ARRAY_BUFFER, sphubeTCBuffer);
    gl2.vertexAttribPointer(a.vTexCoord, 2, gl2.FLOAT, false, 0, 0);
    gl2.enableVertexAttribArray(a.vTexCoord);
    gl2.bindBuffer(gl2.ARRAY_BUFFER, sphubeCNBuffer);
    gl2.vertexAttribPointer(a.vNormal1, 3, gl2.FLOAT, false, 0, 0);
    gl2.enableVertexAttribArray(a.vNormal1);
    gl2.bindBuffer(gl2.ARRAY_BUFFER, sphubeSNBuffer);
    gl2.vertexAttribPointer(a.vNormal2, 3, gl2.FLOAT, false, 0, 0);
    gl2.enableVertexAttribArray(a.vNormal2);
    gl2.activeTexture(gl2.TEXTURE0);
    gl2.bindTexture(gl2.TEXTURE_2D, ryanTexture);
    gl2.uniform3fv(u.uObjectLocation, ryanPos);
    gl2.uniform3fv(u.uLookVector, state.camera.look);
    gl2.uniformMatrix4fv(u.uMV, false, state.camera.viewMatrix);
    gl2.uniformMatrix4fv(u.uMVP, false, state.camera.matrix);
    gl2.uniform1f(u.uTime, state.elapsed);
    gl2.uniform1i(u.uTextureSampler, 0);
    let normalMatrix = exports_mat3.fromMat4(exports_mat3.create(), state.camera.matrix);
    exports_mat3.invert(normalMatrix, normalMatrix);
    exports_mat3.transpose(normalMatrix, normalMatrix);
    gl2.uniformMatrix3fv(u.uNormalMatrix, false, normalMatrix);
    gl2.drawElements(gl2.TRIANGLES, sphubeIndices.length, gl2.UNSIGNED_SHORT, 0);
  };
  return sphubeProgram;
}
var sphubeProg = createSphubeProgram();
function render(state) {
  let cam = state.camera;
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  for (let wallObjIx in state.wallObjects) {
    let wallObj = state.wallObjects[wallObjIx];
    gl.activeTexture(gl.TEXTURE0);
    let p;
    if (wallObj.shaderEffect == 6 /* Sphubic */) {
      sphubeProg.activator(gl, state, wallObj.position);
      continue;
    }
    switch (wallObj.shaderEffect) {
      case 3 /* SineTrip */: {
        p = objSinProgram;
        gl.useProgram(p.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, ryanTexture);
        gl.uniform1f(p.uniforms.uTime, state.elapsed);
        break;
      }
      case 4 /* Scrolling */: {
        p = objScrollProgram;
        gl.useProgram(p.program);
        gl.uniform1f(p.uniforms.uTime, state.elapsed);
        break;
      }
      case 0 /* Default */: {
        p = objProgram;
        gl.useProgram(p.program);
        break;
      }
      case 5 /* Censored */: {
        p = objCensoredProgram;
        gl.useProgram(p.program);
        gl.uniform1f(p.uniforms.uTime, state.elapsed);
        break;
      }
      default:
        p = objProgram;
        gl.useProgram(p.program);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndicesBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.vertexAttribPointer(p.attributes.location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(p.attributes.location);
    if (p.attributes.vNormal != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, cuboidNormalBuffer);
      gl.vertexAttribPointer(p.attributes.vNormal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(p.attributes.vNormal);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboidTexCoordBuffer);
    gl.vertexAttribPointer(p.attributes.texCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(p.attributes.texCoord);
    gl.uniformMatrix4fv(p.uniforms.MVP, false, cam.matrix);
    gl.uniformMatrix4fv(p.uniforms.MV, false, cam.viewMatrix);
    let normalMatrix = exports_mat3.fromMat4(exports_mat3.create(), cam.matrix);
    exports_mat3.invert(normalMatrix, normalMatrix);
    exports_mat3.transpose(normalMatrix, normalMatrix);
    gl.uniformMatrix3fv(p.uniforms.uNormalMatrix, false, normalMatrix);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ryanTexture);
    gl.uniform1i(p.uniforms.samplerUniform, 0);
    let agitationOffset = [
      2 * Math.random() - 1,
      2 * Math.random() - 1,
      2 * Math.random() - 1
    ];
    exports_vec3.scale(agitationOffset, agitationOffset, state.agitation / 3);
    exports_vec3.add(agitationOffset, agitationOffset, wallObj.position);
    gl.uniform3fv(p.uniforms.cubeLoc, agitationOffset);
    gl.drawElements(gl.TRIANGLES, cuboidTriIndices.length, gl.UNSIGNED_BYTE, 0);
  }
  gl.finish();
}

// index.ts
var state;
function step(timeMs) {
  let time = timeMs / 1000;
  if (state === undefined) {
    state = new State(time, [-5, -5]);
    state.camera.position = [-50, 0, -50];
    state.camera.yaw = 3 * Math.PI / 4;
    hookInput(document.getElementById("myCanvas"), state);
  } else {
    state.delta = state.lastFrame - time;
  }
  state.elapsed = time - state.start;
  state.lastFrame = time;
  update(state);
  render(state);
  window.requestAnimationFrame(step);
}
window.requestAnimationFrame(step);
