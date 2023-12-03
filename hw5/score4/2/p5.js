class Transform{
    transformStack = [mat4.create()];

    moveTo(x,y,z){
        let res = vec3.create();
        vec3.transformMat4(res, [x,y,z], this.transformStack[0]);
        ctx.moveTo(res[0], res[1]);
    }
    
    lineTo(x,y,z){
        let res = vec3.create();
        vec3.transformMat4(res, [x,y,z], this.transformStack[0]);
        ctx.lineTo(res[0], res[1]);
    }
    translate(dx,dy,dz){
        let translationMatrix = mat4.create();
        mat4.fromTranslation(translationMatrix, [dx,dy,dz]);
        mat4.multiply(this.transformStack[0], this.transformStack[0], translationMatrix);
    }
    scale(scaleX, scaleY, scaleZ){
        let scaleMatrix = mat4.create();
        mat4.fromScaling(scaleMatrix, [scaleX, scaleY, scaleZ]);
        mat4.multiply(this.transformStack[0], this.transformStack[0], scaleMatrix);
    }
    rotate(theta, axis){
        let rotationMatrix = mat4.create();
        mat4.fromRotation(rotationMatrix, theta, axis);
        mat4.multiply(this.transformStack[0], this.transformStack[0], rotationMatrix);
    }
    rotateX(theta){
        let rotationMatrix = mat4.create();
        mat4.fromXRotation(rotationMatrix, theta);
        mat4.multiply(this.transformStack[0], this.transformStack[0], rotationMatrix);
    }
    rotateY(theta){
        let rotationMatrix = mat4.create();
        mat4.fromYRotation(rotationMatrix, theta);
        mat4.multiply(this.transformStack[0], this.transformStack[0], rotationMatrix);
    }
    rotateZ(theta){
        let rotationMatrix = mat4.create();
        mat4.fromZRotation(rotationMatrix, theta);
        mat4.multiply(this.transformStack[0], this.transformStack[0], rotationMatrix);
    }

    lookAt(eye, target, up){
        let lookAtMatrix= mat4.create();
        mat4.lookAt(lookAtMatrix, eye, target, up);
        mat4.multiply(transform.transformStack[0],transform.transformStack[0],lookAtMatrix);
    }
    perspective(fovy, aspect, near, far){
        let perspectiveMatrix = mat4.create();
        mat4.perspective(perspectiveMatrix, fovy, aspect, near, far);
        mat4.multiply(transform.transformStack[0],transform.transformStack[0],perspectiveMatrix);
    }
    ortho(left, right, bottom, top, near, far){
        let orthoMatrix = mat4.create();
        mat4.ortho(orthoMatrix, left, right, bottom, top, near, far);
        mat4.multiply(transform.transformStack[0],transform.transformStack[0],orthoMatrix);
    }

    save(){
        this.transformStack.unshift(mat4.clone(this.transformStack[0]));
    }
    restore(){
        this.transformStack.shift();
    }

}
const z = 0.3;
class CardinalCurve{
    t_begin = 0;
    t_end = 1;
    intervals = 250;
    color = "black";
    constructor(controlPoints){
        this.controlPoints = controlPoints;
    }
    draw(){
        transform.save();        
        ctx.strokeStyle=this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        let start = this.getPoint(this.t_begin)
        transform.moveTo(start[0],start[1], start[2]);
        for(let i=1;i<=this.intervals;i++){
            let t=((this.intervals-i)/this.intervals)*this.t_begin+(i/this.intervals)*this.t_end;
            let loc = this.getPoint(t);

            transform.lineTo(loc[0],loc[1], loc[2]);
            transform.lineTo(loc[0]+0.45,loc[1],loc[2]);
            transform.lineTo(loc[0]+0.45,loc[1],loc[2]+0.45);
            transform.lineTo(loc[0],loc[1],loc[2]+0.45);
            transform.lineTo(loc[0],loc[1], loc[2]);
        }
        ctx.stroke();
        
        transform.restore();
    }
    getPoint(t){
        let b = this.cardinal(t);
	    let result=vec3.create();
	    vec3.scale(result,this.controlPoints[0].point,b[0]);
	    vec3.scaleAndAdd(result,result,this.controlPoints[1].point,b[1]);
	    vec3.scaleAndAdd(result,result,this.controlPoints[2].point,b[2]);
	    vec3.scaleAndAdd(result,result,this.controlPoints[3].point,b[3]);
	    return result;
    }
    cardinal(t){
        return [
            -z*t + 2*z*t*t - z*t*t*t,
            1 + (z-3)*t*t + (2-z)*t*t*t,
            z*t + (3-2*z)*t*t + (z-2)*t*t*t,
            -z*t*t + z*t*t*t
        ];
    }
    getDerivative(t){
        let b = this.cardinalDerivative(t);
	    let result=vec3.create();
	    vec3.scale(result,this.controlPoints[0].point,b[0]);
	    vec3.scaleAndAdd(result,result,this.controlPoints[1].point,b[1]);
	    vec3.scaleAndAdd(result,result,this.controlPoints[2].point,b[2]);
	    vec3.scaleAndAdd(result,result,this.controlPoints[3].point,b[3]);
	    return result;
    }
    cardinalDerivative(t){
        return [
            -z + 4*z*t - 3*z*t*t,
            (z-3) * 2 * t + (2-z) * 3 * t * t,
            z + (3-2*z) * 2 * t + (z-2) * 3 * t *t,
            -z * 2 * t + z * 3 * t*t
        ];
    }
}

class Road{
    components = [];
    cars = [];
    houses = [];
    constructor(controlPoints){
        
        for(let i = 3; i < controlPoints.length; i++){
            let component = new CardinalCurve([
                controlPoints[i-3],
                controlPoints[i-2],
                controlPoints[i-1],
                controlPoints[i]
            ]);
            this.components.push(component);
        }
        for(let i = 0; i < 3; i++){
            this.cars.push(new Car(Math.random()*2,Math.random(), 0.002, this));
        }
        for(let i = 0; i < 12; i++){
            this.houses.push(new House(i/6, this));
        }
    }
    drawRoad(){
        transform.save();
        for(let i = 0; i < this.components.length; i++){
            this.components[i].draw();
        }
        
        transform.restore();
    }
    drawCars(){
        transform.save();
        for(let i = 0; i < this.cars.length; i++){
            this.cars[i].update();
        }
        
        transform.restore();
    }
    drawHouses(){
        transform.save();
        for(let i = 0; i < this.houses.length; i++){
            this.houses[i].draw();
        }
        
        transform.restore();
    }
    Ccomp(t) {
        t = t % this.components.length;
        for(let i = 0; i < this.components.length; i++){
            if(Math.floor(t) == i){
                let u = t - i;
                return this.components[i].getPoint(u);
            }
        }
         
    }
    Ccomp_tangent(t) {
        t = t % this.components.length;
        for(let i = 0; i < this.components.length; i++){
            if(Math.floor(t) == i){
                let u = t - i;
                return this.components[i].getDerivative(u);
            }
        }         
    }
    /**
    generateControlPoints(n){
        let controlPoints = [
            [2,0,world.size],
            [1,0,world.size],
            [5,0,world.size/2],
            [2,0,0],
            [3,0,0]
        ];
    
        let controlPointObjects = [];
        for(let i = 0; i < controlPoints.length; i++){
            controlPointObjects.push(new ControlPoint(controlPoints[i][0],controlPoints[i][1],controlPoints[i][2]));
        }
        return controlPointObjects;
    }
    */
}
class ControlPoint{
    constructor(x,y,z){
        this.point = [x,y,z];
    }
}

class Car{
    constructor(t,direction, speed, road){
        this.t = t;
        this.speed = speed;
        this.angle = 0;
        this.road = road;
        if(direction <0.5){
            this.direction = -1;
        }
        else{
            this.direction = 1;
        }
    }
    draw(){
        transform.save();
        let point = this.road.Ccomp(this.t);
        transform.translate(point[0], point[1], point[2]);
        if(this.direction == 1){
            transform.translate(0.2,0,0);
        }else{
            transform.translate(-0,0,0);
        }
        
        transform.rotateY(this.angle);
        transform.scale(0.5,0.5,0.5);
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle="silver";
        transform.lineTo(0,0, 0);
        transform.lineTo(-0.25,0, 0);
        transform.lineTo(-0.25,0, 1);
        transform.lineTo(0,0, 1);
        transform.lineTo(0,0, 0);
         
        transform.lineTo(0,0.3,0);
        transform.moveTo(-0.25,0,0);
        transform.lineTo(-0.25,0.3,0);
        transform.moveTo(-0.25,0, 1);
        transform.lineTo(-0.25,0.3, 1);
        transform.moveTo(0,0, 1);
        transform.lineTo(0,0.3, 1);
        transform.lineTo(0,0.3, 0);
        transform.lineTo(-0.25,0.3, 0);
        transform.lineTo(-0.25,0.3, 1);
        transform.lineTo(0,0.3, 1);
        transform.lineTo(0,0.3, 0);
        
        ctx.stroke();
        transform.restore();
    }

    update(){
        let tangent = this.road.Ccomp_tangent(this.t);
        this.angle = Math.atan2(tangent[0],tangent[2]);

        this.t += this.speed*this.direction;
        if(this.t <0){
            this.t = 2;
        }
        this.t = this.t % 100;
        this.draw();
    }
}


class House{
    houseWidth = 2 + Math.random();
    houseDepth = 1;
    houseHeight = 0.5 + Math.random();
    streetSide = Math.random();
    constructor(t, road){
        this.t = t;
        this.road = road;
    }
    draw(){
        transform.save();

        let point = this.road.Ccomp(this.t);
        transform.translate(point[0]-0.5, point[1], point[2]);

        let tangent = this.road.Ccomp_tangent(this.t);
        this.angle = Math.atan2(tangent[0],tangent[2]);
        transform.rotateY(this.angle);
        if(this.streetSide < 0.5){
            transform.translate(-2,0,0);
        }
        transform.scale(0.4,0.4,0.4);
    

        //house foundation
        ctx.strokeStyle = "tan";
        ctx.beginPath();
        transform.moveTo(0.5,0,0.5);
        transform.lineTo(0.5,0, 0.5 + this.houseWidth);
        transform.lineTo(0.5 + this.houseDepth,0, 0.5 + this.houseWidth);
        transform.lineTo(0.5 + this.houseDepth,0, 0.5);
        transform.lineTo(0.5,0,0.5);

        //walls
        transform.lineTo(0.5,this.houseHeight,0.5);
        transform.moveTo(0.5,0,0.5+ this.houseWidth);
        transform.lineTo(0.5,this.houseHeight, 0.5+ this.houseWidth);
        transform.moveTo(0.5 + this.houseDepth,0, 0.5 + this.houseWidth);
        transform.lineTo(0.5 + this.houseDepth,this.houseHeight, 0.5 + this.houseWidth);
        transform.moveTo(0.5 + this.houseDepth,0, 0.5);
        transform.lineTo(0.5 + this.houseDepth,this.houseHeight, 0.5);

        //ceiling
        transform.moveTo(0.5,this.houseHeight,0.5);
        transform.lineTo(0.5,this.houseHeight, 0.5 + this.houseWidth);
        transform.lineTo(0.5 + this.houseDepth,this.houseHeight, 0.5 + this.houseWidth);
        transform.lineTo(0.5 + this.houseDepth,this.houseHeight, 0.5);
        transform.lineTo(0.5,this.houseHeight,0.5);

        //roof
        transform.moveTo(0.5,this.houseHeight,0.5);
        transform.lineTo(0.5+this.houseDepth/2,this.houseHeight+0.35,0.5);
        transform.lineTo(0.5+this.houseDepth, this.houseHeight,0.5 );

        transform.moveTo(0.5,this.houseHeight, 0.5+this.houseWidth);
        transform.lineTo(0.5+this.houseDepth/2,this.houseHeight+0.35,0.5+this.houseWidth);
        transform.lineTo(0.5+this.houseDepth, this.houseHeight,0.5 +this.houseWidth);

        transform.moveTo(0.5+this.houseDepth/2,this.houseHeight+0.35,0.5+this.houseWidth);
        transform.lineTo(0.5+this.houseDepth/2,this.houseHeight+0.35,0.5);


        ctx.stroke();
        transform.restore();
        
    }
}

class World{
    roads = [];
    trees = [];
    constructor(size){
        this.size = size;
        for(let i = 0; i < 100;i++){
            this.trees.push(new Tree(
                20-4*Math.random(),
                20*Math.random(),
                Math.random()
            ));
        }
    }
    drawMap(){
        transform.save();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        transform.moveTo(0,0,0);
        transform.lineTo(0,0,this.size);
        transform.lineTo(this.size,0,this.size);
        transform.lineTo(this.size,0,0);
        transform.lineTo(0,0,0);

        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "rgba(102, 204, 0, 0.5)";;
        for(let i = 0; i < 400; i++){
            transform.lineTo(this.size,0,i/this.size);
            transform.lineTo(0,0,0.1+i/this.size);
        }
        ctx.stroke();

        transform.restore();
    }
    drawRoads(){
        transform.save();
        for(let i = 0; i < this.roads.length;i++){
            this.roads[i].drawRoad();
        }
        //draw cars last so they go over roads
        for(let i = 0; i < this.roads.length;i++){
            this.roads[i].drawCars();
        }
        for(let i = 0; i < this.roads.length;i++){
            this.roads[i].drawHouses();
        }
        
        
        transform.restore();
    }
    drawTrees(){
        transform.save();

        for(let i = 0 ; i < this.trees.length; i++){
            this.trees[i].draw();
        }

        transform.restore();
    }
    update(){
        this.drawMap();
        this.drawRoads();
        this.drawTrees();

    }
}

class Tree{
    constructor(x,z, height){
        this.x = x;
        this.z = z;
        this.height = height;
    }
    draw(){
        transform.save();
        transform.translate(this.x,0,this.z);
        transform.scale(0.75,0.75,0.75);
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle="brown";
        transform.lineTo(0,0, 0);
        transform.lineTo(-0.25,0, 0);
        transform.lineTo(-0.25,0, 0.25);
        transform.lineTo(0,0, 0.25);
        transform.lineTo(0,0, 0);
         
        transform.lineTo(0,this.height,0);
        transform.moveTo(-0.25,0,0);
        transform.lineTo(-0.25,this.height,0);
        transform.moveTo(-0.25,0, 0.25);
        transform.lineTo(-0.25,this.height, 0.25);
        transform.moveTo(0,0, 0.25);
        transform.lineTo(0,this.height, 0.25);
        transform.lineTo(0,this.height, 0);
        transform.lineTo(-0.25,this.height, 0);
        transform.lineTo(-0.25,this.height, 0.25);
        transform.lineTo(0,this.height, 0.25);
        transform.lineTo(0,this.height, 0); 
        ctx.stroke();

        
        transform.translate(0,this.height,0);
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle="green";
        transform.moveTo(0,0,0);
        transform.lineTo(0,this.height,0);
        transform.moveTo(-0.25,0,0);
        transform.lineTo(-0.25,this.height,0);
        transform.moveTo(-0.25,0, 0.25);
        transform.lineTo(-0.25,this.height, 0.25);
        transform.moveTo(0,0, 0.25);
        transform.lineTo(0,this.height, 0.25);
        transform.lineTo(0,this.height, 0);
        transform.lineTo(-0.25,this.height, 0);
        transform.lineTo(-0.25,this.height, 0.25);
        transform.lineTo(0,this.height, 0.25);
        transform.lineTo(0,this.height, 0);
        ctx.stroke();
        transform.restore();
    }
}

class Camera{
    isMoveLeft;
    isMoveRight;
    isMoveForward;
    isMoveBackward;
    isPitchUp;
    isPitchDown;
    isYawLeft;
    isYawRight;

    yawAngle = Math.PI/4;
    pitchAngle = Math.PI/4;

    speed = 0.05;

    distance = 1;
    constructor(eye, target, up){
        this.eye = eye;
        this.target = target;
        this.up = up;
    }
    draw(){
        
        transform.lookAt(this.eye, this.target, this.up);
             
        transform.save();
        transform.moveTo(this.target[0], this.target[1], this.target[2]);
        ctx.strokeStyle = "green";
        ctx.lineWidth = 1;
        ctx.beginPath();
        transform.lineTo(this.target[0], this.target[1], this.target[2]);
        transform.lineTo(this.target[0]+1, this.target[1], this.target[2]);
        transform.moveTo(this.target[0], this.target[1], this.target[2]);
        transform.lineTo(this.target[0], this.target[1]+1, this.target[2]);
        transform.moveTo(this.target[0], this.target[1], this.target[2]);
        transform.lineTo(this.target[0], this.target[1], this.target[2]+1);

        ctx.stroke();
        transform.restore();
        transform.ortho(-1,1,-1,1,-1,1) ; 
        //transform.perspective(Math.PI/4,1,-1,1) ;
    }
    update(){

        this.eye[0] = this.target[0] + (this.distance*Math.sin(this.yawAngle));
        this.eye[1] = this.distance * Math.tan(this.pitchAngle);
        this.eye[2] = this.target[2] + (this.distance*Math.cos(this.yawAngle));
        if(this.isMoveLeft){
            this.eye[0] += -this.speed;
            this.target[0] += -this.speed;
        }
        if(this.isMoveRight){
            this.eye[0] += this.speed;
            this.target[0] += this.speed;
        }
        if(this.isPitchUp){
            if(this.pitchAngle <= (Math.PI/2) - 0.01){
                this.pitchAngle += 0.005;
            }
        }
        if(this.isPitchDown){
            if(this.pitchAngle > 0   ){
                this.pitchAngle += -0.005;
            }
        }
        if(this.isMoveForward){
            this.eye[2] += -this.speed;
            this.target[2] += -this.speed;
        }
        if(this.isMoveBackward){
            this.eye[2] += this.speed;
            this.target[2] += this.speed;
        }
        if(this.isYawLeft){
            this.yawAngle += 0.01;
            
        }
        if(this.isYawRight){
            this.yawAngle -= 0.01;
        }
        this.draw();
    }
}

function keyDownHandler(event) {
    if (event.keyCode == 40) {
        camera.isMoveBackward = true;
    } 
    else if (event.keyCode == 39) {
      camera.isMoveRight = true;
    } 
    else if(event.keyCode == 38){
        camera.isMoveForward = true;
    }
    else if (event.keyCode == 37) {
      camera.isMoveLeft = true;
    }
    else if(event.keyCode == 87){
        camera.isPitchUp = true;
    }
    else if(event.keyCode == 83){
        camera.isPitchDown = true;
    }
    else if(event.keyCode == 65){
        camera.isYawLeft = true;
    }
    else if(event.keyCode == 68){
        camera.isYawRight = true;
    }

}

function keyUpHandler(event) {
    if (event.keyCode == 40) {
        camera.isMoveBackward = false;
    } 
    else if (event.keyCode == 39) {
      camera.isMoveRight = false;
    } 
    else if(event.keyCode == 38){
        camera.isMoveForward = false;
    }
    else if (event.keyCode == 37) {
      camera.isMoveLeft = false;
    }
    else if(event.keyCode == 87){
        camera.isPitchUp = false;
    }
    else if(event.keyCode == 83){
        camera.isPitchDown = false;
    }
    else if(event.keyCode == 65){
        camera.isYawLeft = false;
    }
    else if(event.keyCode == 68){
        camera.isYawRight = false;
    }
}

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const transform = new Transform();
const camera = new Camera([0.5,0.5,0.5],[0,0,0],[0,1,0]);
const world = new World(20);

const road = new Road(
     [
        new ControlPoint(2,0,world.size),
        new ControlPoint(1,0,world.size),
        new ControlPoint(5,0,world.size/2),
        new ControlPoint(2,0,0),
        new ControlPoint(3,0,0)
    ]
);
const road1 = new Road(
    [
       new ControlPoint(10,0,world.size),
       new ControlPoint(10,0,world.size),
       new ControlPoint(8,0,world.size/2),
       new ControlPoint(10,0,0),
       new ControlPoint(3,0,0)
   ]
);
const road2 = new Road(
    [
       new ControlPoint(15,0,world.size),
       new ControlPoint(15,0,world.size),
       new ControlPoint(12,0,world.size/2),
       new ControlPoint(13,0,0),
       new ControlPoint(15,0,0)
   ]
);

world.roads.push(road);
world.roads.push(road1);
world.roads.push(road2);



canvas.addEventListener("keydown", keyDownHandler, false);
canvas.addEventListener("keyup", keyUpHandler, false);

function animate(){
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    transform.save();
    //scale world and flip y axis;
    transform.scale(100,-100,100);
    transform.translate(4,-4,0);

    camera.update();


    world.update();
    transform.restore();
    
}
animate();
