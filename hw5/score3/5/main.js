// Note:    Use of translate(), scale(), rotate(), save(), and
//          restore() is in KouchEngine's recursivelyDrawObject
//          function.

let e; // Engine
let input; // Input manager

const pointRadius = 5;
const tangentSquareSize = 5;
const tangentSquareDist = 100;

const tangentSquareDistFactor = 0.25;

let path;

window.onload = () => {
    camera = new KouchCamera(
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 0, 0)
    )
    e = new KouchEngine("canvas", false, camera);
    e.backgroundColor = "black"

    input = new KouchInputManager(e.canvasElement);

    path = new Path(e.getCenterPos())
    e.addObjectTo(path, null)

    e.addObjectTo(new Bug(4, path), null);
    e.addObjectTo(new Axes(vec3.fromValues(0, 0, 0), 400), null);
    

    e.start()
};

function Axes(pos, scale) {
    this.pos = pos;
    this.scale = vec3.fromValues(scale, scale, scale);
    this.angle = 0;

    this.draw = (ktx) => {
        ktx.setLineWidth(0.01);
        ktx.beginPath();
        
        // Axes
        ktx.setStrokeStyle("red");
        ktx.moveTo(1.2, 0, 0);
        ktx.lineTo(0, 0, 0);
        ktx.stroke();
        ktx.setStrokeStyle("green");
        ktx.beginPath()
        ktx.moveTo(0, 0, 0)
        ktx.lineTo(0, 1.2, 0);
        ktx.moveTo(0, 0, 0);
        ktx.stroke()
        ktx.beginPath()
        ktx.moveTo(0, 0, 0);
        ktx.setStrokeStyle("blue");
        ktx.lineTo(0, 0, 1.2);
        ktx.stroke();

        ktx.setStrokeStyle("white");

        // Arrowheads
        ktx.setStrokeStyle("red");
        ktx.beginPath()
        ktx.moveTo(1.1, .05, 0);
        ktx.lineTo(1.2, 0, 0);
        ktx.lineTo(1.1, -.05, 0);
        ktx.stroke()

        ktx.setStrokeStyle("green");
        ktx.beginPath()
        ktx.moveTo(.05, 1.1, 0);
        ktx.lineTo(0, 1.2, 0);
        ktx.lineTo(-.05, 1.1, 0);
        ktx.stroke()

        ktx.setStrokeStyle("blue");
        ktx.beginPath()
        ktx.moveTo(.05, 0, 1.1);
        ktx.lineTo(0, 0, 1.2);
        ktx.lineTo(-.05, 0, 1.1);
        ktx.stroke()
    }
}

function Bug(scale, path) {
    this.pos = vec3.create();
    this.angle = 0;
    this.scale = vec3.fromValues(scale, scale, 1);
    this.path = path;

    const size = 15;
    const speed = 0.5;
    const flappingFrequency = 5;
    const maxWingspan = size*(4/5)

    this.getWingspan = () => {
        return Math.abs(Math.sin(flappingFrequency * (Date.now()/1000))*maxWingspan);
    }

    this.draw = (ktx) => {
        // Draw wings
        ktx.setLineWidth(size)
        let wingspan = this.getWingspan()

        let brightness = (20 + (235 * (wingspan/maxWingspan)));

        let wingR = brightness * 0.25;
        let wingG = brightness * 0.5;
        let wingB = brightness;

        ktx.setStrokeStyle(`rgb(${wingR}, ${wingG}, ${wingB})`)
        ktx.drawLine(-wingspan/2, 0, 0, wingspan/2, 0, 0);

        // Draw body
        ktx.setStrokeStyle("lightgreen")
        ktx.setLineWidth(size/2);
        ktx.drawLine(0, -size/2, 0, 0, size/2, 0);

        // Draw head
        ktx.setStrokeStyle("green")
        ktx.setLineWidth(size*(3/4));
        ktx.drawLine(0, (size/2), 0, 0, (size/2) + (size/8), 0);

        // Draw antennas
        ktx.setStrokeStyle("white")
        ktx.setLineWidth(size*(1/8))
        ktx.drawLine(-(size/8), (size/2) + (size/4), 0, -(size/4), (size/2) + (size/8) + (size/2), 0);
        ktx.drawLine((size/8), (size/2) + (size/4), 0, (size/4), (size/2) + (size/8) + (size/2), 0);
    }

    this.update = (dt) => {
        let linearChainPos = (speed * (Date.now()/1000)) % (this.path.chain.end - this.path.chain.start)
        let pathPoint = this.path.chain.get(linearChainPos);

        vec3.copy(this.pos, pathPoint);

        this.angle = this.path.chain.getTan(linearChainPos)
    }
}

function Path(z) {

    this.pos = vec3.fromValues(0, 0, 0);
    this.angle = 0;
    this.scale = vec3.fromValues(1, 1, 1);

    let vec2 = glMatrix.vec2;

    let points = [
        vec3.fromValues(637, 388, -400),
        vec3.fromValues(-391, 285, 0),
        vec3.fromValues(120, 450, 300),
        vec3.fromValues(87, 98, 500),
        vec3.fromValues(668, 96, -100),
    ]

    let tangents = [
        vecFromPolar(353, Math.PI*0.8298),
        vecFromPolar(581, Math.PI*0.978),
        vecFromPolar(547, Math.PI*0.915),
        vecFromPolar(481, Math.PI*0.264),
        vecFromPolar(827, Math.PI*0.7816),
    ]

    this.chain = new HermiteChain(points, tangents, true);

    this.draw = (ktx) => {
        ktx.setLineWidth(5)
        ktx.setStrokeStyle("white")
        this.chain.hermites.forEach(h => {
            ktx.drawParametric(h, 100, this.pos[2]);
        })
    }
}