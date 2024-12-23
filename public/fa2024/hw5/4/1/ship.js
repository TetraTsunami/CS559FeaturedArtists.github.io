// represents a single ship and abstracts away details regarding
// this ship's path and drawing details
let Ship = class Ship {
    constructor(canvas, context, camera, selectShipColor) {
        this.canvas = canvas;
        this.context = context;
        this.camera = camera;
        this.selectShipColor = selectShipColor;
        this.curveManager = new CurveManager(this.canvas, this.context);
        this.moveShip = true;
        this.t = 0;
    }

    toggleMoveShip() {
        this.moveShip = !this.moveShip;
    }

    // update the timestamp of this ship
    updateTime(dt) {
        if (this.moveShip) 
            this.t += dt;
    }

    getPosition() {
        return this.curveManager.getPosition(this.t);
    }

    getTangent() {
        return this.curveManager.getTangent(this.t);
    }

    getTranformWC() {
        let TModel = mat4.create();
        mat4.fromTranslation(TModel, this.getPosition());
        let TModelRot = mat4.create();
        let eyePlane = vec3.fromValues(0, 0, 0);
        mat4.lookAt(TModelRot, eyePlane, this.getTangent(), [0,1,0]);
        mat4.invert(TModelRot, TModelRot);
        mat4.multiply(TModel, TModel, TModelRot);
        return TModel;
    }

    getTransformCombined() {
        let TCombined = mat4.create();
        mat4.multiply(TCombined, this.camera.getTransformCombined(), this.getTranformWC());
        return TCombined;
    }

    // draws the ship itself
    drawShip() {
        let Tx = mat4.clone(this.getTransformCombined());
        let size = 1.5;
        mat4.scale(Tx, Tx, [size, size, size])
	    this.context.fillStyle = this.selectShipColor.value;

        // Draw the top of the deck
        this.context.beginPath();
        moveToTx(this.context, [0,0,-20],Tx); lineToTx(this.context, [5,0,-12],Tx); lineToTx(this.context, [5,0,12],Tx); 
        lineToTx(this.context, [0,0,20],Tx);  lineToTx(this.context, [-5,0,12],Tx); lineToTx(this.context, [-5,0,-12],Tx); 
	    this.context.closePath();
	    this.context.fill();

        // Draw the sail
        this.context.beginPath();
        moveToTx(this.context, [0,0,-1],Tx); lineToTx(this.context, [0,10,-1],Tx); lineToTx(this.context, [0,10,-12],Tx); 
        lineToTx(this.context, [0,30,0],Tx);  lineToTx(this.context, [0,10,12],Tx); lineToTx(this.context, [0,10,1],Tx); lineToTx(this.context, [0,0,1],Tx); 
	    this.context.closePath();
	    this.context.fill();

        // Draw the hull of the ship
        this.context.beginPath();
        moveToTx(this.context, [0,0,-20],Tx); lineToTx(this.context, [0,-5,-12],Tx); lineToTx(this.context, [0,-5,12],Tx); lineToTx(this.context, [0,0,20],Tx); 
	    this.context.closePath();
	    this.context.fill();


    }

}