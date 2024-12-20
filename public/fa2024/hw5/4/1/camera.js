let Camera = class Camera {
    constructor(sliderCameraDistance, selectViewMode) {
        this.t = 0;
        this.sliderCameraDistance = sliderCameraDistance;
        this.selectViewMode = selectViewMode;
    }

    updateTime(dt) {
        this.t += dt;
    }

    getEyeLocation() {
        let distanceFromWorldCoordinateOrigin = this.sliderCameraDistance.value;
        let verticalMovementDistance = 30;
        let verticalMovementCenter = 75;
        let angle = Math.PI*this.t*0.25;

        let eye = vec3.create();
        eye[0] = distanceFromWorldCoordinateOrigin * Math.cos(angle); // x
        eye[1] = verticalMovementCenter + verticalMovementDistance * Math.sin(angle*4); // y
        eye[2] = distanceFromWorldCoordinateOrigin * Math.sin(angle); // z
        return eye;
    }
    
    getTransformLookAt() {
        let targetLocation = [0, 0, 0];
        let upVector = [0, 1, 0]; // positive y axis of WC is up

        let TLookAtCamera = mat4.create(); // where the tranform will be stored
        mat4.lookAt(TLookAtCamera, this.getEyeLocation(), targetLocation, upVector);
        return TLookAtCamera;
    }

    getTransformViewport() {
        let Tviewport = mat4.create();
        mat4.fromTranslation(Tviewport, [225, 175, 0]);
        mat4.scale(Tviewport, Tviewport, [100, -100, 100]); // flip y axis
        return Tviewport;
    }

    getTransformProjection() {
        let TProjection = mat4.create();
        if(this.selectViewMode.value == 'orthographic')
            mat4.ortho(TProjection, -75, 75, -75, 75, -1, 1);
        else
            mat4.perspective(TProjection,Math.PI/4,1,-1,1);

        return TProjection;
    }

    // Combine viewport, projection, and camera transforms
    getTransformCombined() {
        let TCombined = mat4.create();
        mat4.multiply(TCombined, this.getTransformViewport(), this.getTransformProjection());
        mat4.multiply(TCombined, TCombined, this.getTransformLookAt());
        return TCombined;
    }
}