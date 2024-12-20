
function KouchContext(canvasContext) {
    let mat4 = glMatrix.mat4;
    let vec3 = glMatrix.vec3;

    let canvasCtx = canvasContext;

    let t = mat4.create();
    let tStack;

    let lineWidth;
    let strokeStyle;
    let fillStyle;
    let lineCapStyle;
    let lineDash;
    let penPos = vec3.create()

    this.reset = () => {
        mat4.identity(t)
        tStack = []
        lineWidth = 1
        strokeStyle = "black"
        fillStyle = "black"
        lineCapStyle = "round"
        lineDash = []
        vec3.zero(penPos)
    }

    this.reset()

    this.applyTransform = (transform) => {
        mat4.mul(t, transform, t);
    }

    this.translate = (v3) => {
        mat4.translate(t, t, v3)
    }

    this.rotate = (theta) => {
        mat4.rotateZ(t, t, theta)
     }

    this.scale = (v3) => {
        mat4.scale(t, t, v3)
    }

    this.pushCurrentTransform = () => {
        tStack.push(mat4.clone(t))
    }

    this.popTransformStack = () => {
        if(tStack.length > 0) {
            t = tStack.pop()
        } else {
            console.error("Error: Tried to pop from empty t stack")
        }
    }

    this.getTransform = () => t;
    this.setTransform = (transform) => { t = transform; }

    // Style functions

    this.setLineWidth = (width) => {
        lineWidth = width;
    }

    this.setStrokeStyle = (style) => {
        strokeStyle = style;
    }

    this.setFillStyle = (style) => {
        fillStyle = style;
    }

    this.setLineCapStyle = (style) => {
        lineCapStyle = style;
    }

    this.setLineDash = (style) => {
        lineDash = style;
    }

    // Path functions

    this.beginPath = () => {
        canvasContext.beginPath()
    }

    this.moveTo = (x, y, z) => {
        let pT = vec3.fromValues(x, y, z)
        vec3.transformMat4(pT, pT, t)
        canvasCtx.moveTo(pT[0], pT[1]);
    }

    this.lineTo = (x, y, z) => {
        let pT = glMatrix.vec3.fromValues(x, y, z)
        vec3.transformMat4(pT, pT, t)
        canvasCtx.lineTo(pT[0], pT[1]);
    }

    this.stroke = () => {
        // TODO: Determine appropriate line width based on transformation
        // Used the following SO answer to determine appropriate line width
        // https://math.stackexchange.com/a/1463487

        let scale = Math.sqrt(t[0]**2 + t[4]**2 + t[1]**2 + t[5]**2 /*+ t[2]**2 + t[6]**2*/);

        canvasContext.lineCap = lineCapStyle;
        canvasContext.strokeStyle = strokeStyle;
        canvasContext.setLineDash(lineDash);
        canvasContext.lineWidth = lineWidth * scale * (1/Math.sqrt(2));
        canvasContext.stroke()
    }

    this.drawLine = (x1, y1, z1, x2, y2, z2) => {
        this.beginPath();
        this.moveTo(x1, y1, z1);
        this.lineTo(x2, y2, z2);
        this.stroke();
    }

    this.fill = () => {
        canvasContext.fillStyle = fillStyle;
        canvasContext.fill()
    }

    this.circle = (x, y, z, radius) => {
        let pT = vec3.fromValues(x, y, z)
        vec3.transformMat4(pT, pT, t)

        canvasContext.arc(pT[0], pT[1], radius, 0, 2 * Math.PI);
    }

    this.drawParametric = (para, intervals, z) => {
        let length = para.end - para.start
        let dt = length/intervals
        let point = para.get(0);

        this.beginPath();
        this.moveTo(point[0], point[1], point[2]);
        for(let i = 1; i <= intervals; i++) {
            let point = para.get(dt*i);
            console.log(point)
            this.lineTo(point[0], point[1], point[2]);
            
        }
        this.stroke()
        
    }

}