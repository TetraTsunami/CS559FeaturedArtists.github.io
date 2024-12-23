function KouchCamera(pos, target) {
    this.pos = pos;
    this.target = target;
    this.up = vec3.fromValues(0, 1, 0);
    this.fov = Math.PI * 2 * (120/360);

    let time = 0;

    this.update = (dt) => {
        time += dt*1000;

        this.pos[1] = -10;
        this.pos[0] = ((Math.cos(time/1000)+0.5) * 20) + 20;
        this.pos[2] = ((Math.sin(time/1000)+0.5) * 20) + 40;

        console.log(this.pos[0], this.pos[2])
    }
}