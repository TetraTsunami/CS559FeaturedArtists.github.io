function Camera(position, lookAt, fov, canvas) {
    this.position = position
    this.lookAt = lookAt

    this.fov = fov
    this.aspect = canvas.width/canvas.height

    this.near = 0.1
    this.far = 1000

    this.getCameraTransform = () => {
        let cameraTransform = glMatrix.mat4.create()
        glMatrix.mat4.lookAt(
            cameraTransform,
            this.position,  // Eye
            this.lookAt,    // Target
            [0, 1, 0]       // Up
        )
        return cameraTransform
    }

    this.getProjectionTransform = () => {
        let projectionTransform = glMatrix.mat4.create();
        glMatrix.mat4.perspective(
            projectionTransform,
            this.fov,
            this.aspect,
            this.near,
            this.far
        )
        return projectionTransform
    }
}