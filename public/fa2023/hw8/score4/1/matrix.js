
class Matrix4x4 {
    /** 
     * @param {vec3} translation 
     * @param {quat} rotation 
     * @param {vec3} scale 
     */
    static TRS(translation, rotation, scale) {
        let m = mat4.create();
        mat4.fromTranslation(m, translation);
        mat4.mul(m, m, mat4.fromQuat(mat4.create(), rotation));
        mat4.scale(m, m, scale);
        return m;
    }
}

/**
 * 
 * @param {vec3} a 
 * @param {vec3} b 
 * @param {vec3} c 
 */
function GetNormal(a, b, c, result) {
    const abx = b[0] - a[0];
    const aby = b[1] - a[1];
    const abz = b[2] - a[2];
    const acx = c[0] - a[0];
    const acy = c[1] - a[1];
    const acz = c[2] - a[2];

    result = result ? result : vec3.create();
    result[0] = aby * acz - abz * acy;
    result[1] = abz * acx - abx * acz;
    result[2] = abx * acy - aby * acx;
    return result;

}