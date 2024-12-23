let BackgroundManager = class BackgroundManager {
    constructor(canvas, context, camera) {
        this.canvas = canvas;
        this.context = context;
        this.camera = camera;
    }

    // simply draws the background
    drawBackground() {
        this.context.fillStyle = "#EAF0CE";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // draws the axis as a point of reference
    drawAxes() {
        var Tx = mat4.clone(this.camera.getTransformCombined());
        this.context.strokeStyle = 'rgba(10, 10, 10, 0.25)';
        this.context.beginPath();
        moveToTx(this.context, [0, 0, 0], Tx); lineToTx(this.context, [100, 0, 0], Tx); // x axis
        moveToTx(this.context, [0, 0, 0], Tx); lineToTx(this.context, [0, 100, 0], Tx); // y axis
        moveToTx(this.context, [0, 0, 0], Tx); lineToTx(this.context, [0, 0, 100], Tx); // z axis
        this.context.stroke();
     
    }
}