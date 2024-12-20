class Terrain{
    heights;
    verts;
    normals;
    colors;
    indices;

    constructor (){
        const terrain_width = 100 //sqaure
        const max_height=10;
        var terrain_heights = []
        for (let x = 0; x < terrain_width+2; x++){
            terrain_heights[x] = []
            for (let y = 0; y < terrain_width+2; y++){
                const scale1 = Noise2D(x*0.04,y*0.04)*0.4+0.4;
                const scale2 = Noise2D(x*0.08,y*0.08)*0.2+0.2
                const scale3 = Noise2D(x*0.16,y*0.16)*0.1+0.1 
                terrain_heights[x][y] = (scale1 + scale2 + scale3)/0.7 * max_height; 
            }
        }

        this.verts = []
        this.normals = []
        this.colors = []
        this.indices = []
        for (let x = 0; x < terrain_width; x++){
        for (let y = 0; y < terrain_width; y++){
            const height = terrain_heights[x+1][y+1] 

            this.verts.push(x)
            this.verts.push(y)
            this.verts.push(height)

            var right = vec3.fromValues( 1,0,terrain_heights[x+2][y+1]-height)
            var left  = vec3.fromValues(-1,0,terrain_heights[x][y+1]-height)
            var up    = vec3.fromValues(0, 1,terrain_heights[x+1][y+2]-height)
            var down  = vec3.fromValues(0,-1,terrain_heights[x+1][y]-height)

            var normal = vec3.create()
            vec3.cross(normal, down, right)
            var tmp = vec3.create()
            vec3.cross(tmp, right, up)
            vec3.add(normal, normal, tmp)
            vec3.cross(tmp, up, left)
            vec3.add(normal, normal, tmp)
            vec3.cross(tmp, left, down)
            vec3.add(normal, normal, tmp)
            vec3.normalize(normal,normal)

            this.normals.push(normal[0])
            this.normals.push(normal[1])
            this.normals.push(normal[2])

            this.colors.push(0.5*height/max_height)
            this.colors.push(0.0 + height/max_height)
            this.colors.push(0.1)

            if (x < terrain_width-1 && y < terrain_width-1){
                const top_left = y + x*terrain_width;
                const top_right = top_left + 1;
                const bottom_left = top_left + terrain_width;
                const bottom_right = bottom_left + 1;
                this.indices.push(top_left)
                this.indices.push(top_right)
                this.indices.push(bottom_left)

                this.indices.push(bottom_left)
                this.indices.push(top_right)
                this.indices.push(bottom_right)
            }
        }}

    }

}

