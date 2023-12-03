function setup() {
    const m4 = twgl.m4;
    let tParam = 0;
    var canvas = document.getElementById('mycanvas');
    var context = canvas.getContext('2d');
    var slider1 = document.getElementById('slider1');
    slider1.value = 50;
    var button = document.getElementById('myButton');
    
    let current_angle = 0;
    let windmill_angle = 0; 
    var perspective = 0;
    let stack = [mat4.create()];
    let clouds = [];
    for(let i=0; i<5; i++){  
        let cloud_x = (Math.random() - 0.5) * canvas.width ;
        let cloud_y = Math.random() * canvas.height / 2 + 600;
        let cloud_z = (Math.random() - 0.5) * canvas.width ;
        let cloud_parts = [];
        for(let j=0; j<5; j++){  
            let part_y = Math.random() * 20;
            let part_radius = Math.random() * 20 + 20;
            cloud_parts.push({y: part_y, radius: part_radius});
        }
        clouds.push({x: cloud_x, y: cloud_y, parts: cloud_parts});
    }

    function save() {
        stack.unshift(mat4.clone(stack[0])); 
    }

    function restore() { 
        stack.shift(); 
    }

    function multi(T) { 
        return mat4.multiply(stack[0], stack[0], T); 
    }
	
    function moveToTx(loc, Tx) {
        var res=vec3.create(); 
        vec3.transformMat4(res, loc, Tx); 
        context.moveTo(res[0], res[1]);
    }

	function lineToTx(loc, Tx) {
        var res=vec3.create(); 
        vec3.transformMat4(res, loc, Tx); 
        context.lineTo(res[0], res[1]);
    }

    function sphereTx(radius, Tx) {
        for(let lat = 0; lat <= Math.PI; lat += Math.PI / 10) { 
            for(let lon = 0; lon <= 2 * Math.PI; lon += Math.PI / 10) { 
                let x = radius * Math.sin(lat) * Math.cos(lon);
                let y = radius * Math.sin(lat) * Math.sin(lon);
                let z = radius * Math.cos(lat);
                let point = m4.transformPoint(Tx, [x, y, z]);
                context.beginPath();
                context.arc(point[0], point[1], 1, 0, 2 * Math.PI);  
                context.closePath();
                context.fill();
            }
        }
    }

    function EllipseCurve(t){
        var a = 300;  
        var b = 200;  
        var x = a * Math.cos(t);
        var y = 600;  
        var z = b * Math.sin(t); 
        return [x, y, z];
    }

    function EllipseTangent(t){
        var a = 300;  
        var b = 200;  
        var dx_dt = -a * Math.sin(t);
        var dy_dt = 0;
        var dz_dt = b * Math.cos(t);
        return [dx_dt, dy_dt, dz_dt];
    }

    function Curve(t){
        var x = 300 * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
        var y = 400 + 50 * Math.sin(t);  // Assuming the curve lies in the x-y plane
        var z = 200 * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
        return [x, y, z];
    }
    
    function Tangent(t){
        var dx_dt = 300 * -Math.sin(t) / Math.pow(1 + Math.sin(t) * Math.sin(t), 2);
        var dy_dt = 50 * Math.cos(t);  // Assuming the curve lies in the x-y plane
        var dz_dt = 200 * (1 - 2 * Math.sin(t) * Math.sin(t)) / Math.pow(1 + Math.sin(t) * Math.sin(t), 2);
        return [dx_dt, dy_dt, dz_dt];
    }
        
    function draw_curve(Tx) {
        context.beginPath();
        for(let t = 0; t <= 2 * Math.PI; t += 0.01) {
            let point = Curve(t);
            if(t === 0) {
                moveToTx(point, Tx);
            } else {
                lineToTx(point, Tx);
            }
        }
        context.stroke();
    }

    function draw_ellipse_curve(Tx) {
        context.beginPath();
        context.strokeStyle = '#f29bc5';
        for(let t = 0; t <= 2 * Math.PI; t += 0.01) {
            let point = EllipseCurve(t);
            if(t === 0) {
                moveToTx(point, Tx);
            } else {
                lineToTx(point, Tx);
            }
        }
        context.stroke();
        context.closePath();
    }

    function camera_curve_observe(angle) {
        var distance = 120;
        var eye = vec3.create();
        eye[0] = distance * Math.sin(angle);
        eye[1] = 30;
        eye[2] = distance * Math.cos(angle) - 50;
        return eye;
    }

    function draw_blade(blade_length, blade_width, Tx) {
        context.beginPath();
        moveToTx([0, 0, 0], Tx);
        lineToTx([blade_length, 0, 0], Tx);
        lineToTx([blade_length, blade_width, 0], Tx);
        lineToTx([0, blade_width, 0], Tx);
        context.closePath();
        context.fill();
        context.stroke();
        // Draw a smaller blade at the end of the current blade
        let small_blade_length = blade_length;
        let small_blade_width = blade_width;
        let small_blade_Tx = m4.multiply(Tx, m4.translation([blade_length, 0, 0]));
        for (let i = 0; i < 8; i++) {
            small_blade_Tx = m4.multiply(small_blade_Tx, m4.translation([small_blade_length, 0, 0]));
            small_blade_Tx = m4.multiply(small_blade_Tx, m4.rotationY(Math.PI / 2));
            context.beginPath();
            moveToTx([0, 0, 0], small_blade_Tx);
            lineToTx([small_blade_length, 0, 0], small_blade_Tx);
            lineToTx([small_blade_length, small_blade_width, 0], small_blade_Tx);
            lineToTx([0, small_blade_width, 0], small_blade_Tx);
            context.closePath();
            context.fill();
            context.stroke();
            small_blade_length = small_blade_length / 1.1;
            small_blade_width = small_blade_width / 1.1;
        }
    }

    function draw_cylinder(height, radius, segments, Tx, camera_direction, bias, door_segment) {
        let roof_height = height / 2;
        let door_height = height * 0.8;  // Height of the door
        let door_bottom = height * 0.1;  // Distance from the bottom of the cylinder to the bottom of the door

        context.globalAlpha = 1;
        context.strokeStyle = '#A1AAA6'; 
        context.fillStyle = '#6F7C65';
        var view_angle = current_angle * 0.01 * Math.PI;
        view_angle = view_angle % (2 * Math.PI);
        for (let i = 0; i <= segments; i++) {
            let theta = (i / segments) * 2 * Math.PI;
            let nextTheta = ((i + 1) / segments) * 2 * Math.PI;

            // Draw the side
            let x1 = radius * Math.cos(theta) + bias;
            let y1 = radius * Math.sin(theta);
            let x2 = radius * Math.cos(nextTheta) + bias;
            let y2 = radius * Math.sin(nextTheta);

            let x1_wide = 1.2 * radius * Math.cos(theta) + bias;
            let y1_wide = 1.2 * radius * Math.sin(theta);
            let x2_wide = 1.2 * radius * Math.cos(nextTheta) + bias;
            let y2_wide = 1.2 * radius * Math.sin(nextTheta);

            let height_direction = vec3.fromValues(0, height, 0);
            let width_direction = vec3.fromValues(x2 - x1, 0, y2 - y1);
            let normal = vec3.create();
            vec3.cross(normal, height_direction, width_direction);
            if (vec3.dot(camera_direction, normal) <= 0) {

                if (i == door_segment) {

                    // console.log('draw door');
                    context.fillStyle = '#B2846f';
                    context.strokeStyle = '#C29C60'; 
                    context.beginPath();

                    // Draw the door
                    moveToTx([x1, door_bottom, y1], Tx);
                    lineToTx([x2, door_bottom, y2 - 20], Tx);
                    lineToTx([x2, door_bottom + door_height, y2 - 20], Tx);
                    lineToTx([x1, door_bottom + door_height, y1], Tx);
                    lineToTx([x1, door_bottom, y1], Tx);
                    context.fill();
                    context.stroke();
                    // Draw the top of the door
                    context.fillStyle = '#6F7C65';
                    context.strokeStyle = '#A1AAA6'; 

                } else {
                    context.beginPath();    
                    moveToTx([x1, 0, y1], Tx);
                    lineToTx([x2, 0, y2], Tx);
                    lineToTx([x2, height, y2], Tx);
                    lineToTx([x1, height, y1], Tx);
                    context.fill();
                    context.stroke();
                }
                context.beginPath();    
                context.fillStyle = '#6F7C65';  // Color of the chimney
                
                // roof
                moveToTx([bias, height + roof_height, 0], Tx);
                lineToTx([x1_wide, height, y1_wide], Tx);
                lineToTx([x2_wide, height, y2_wide], Tx);
                context.fill();
                context.beginPath();    
                // Draw the windmill
                let windmill_radius = radius / 5;  
                let windmill_height = height / 1.5;
                let windmill_bottom = height;  
                let windmill_x = bias ;
                let windmill_y = 0;

                context.fillStyle = '#8B4513';  // Color of the windmill
                context.beginPath();
                moveToTx([windmill_x, windmill_bottom + windmill_height, windmill_y], Tx);
                for(let i=0; i<=100; i++){
                    let theta = (i / 100) * 2 * Math.PI;
                    let x = windmill_radius * Math.cos(theta) + windmill_x;
                    let y = windmill_radius * Math.sin(theta);
                    lineToTx([x, windmill_bottom + windmill_height - y, windmill_y], Tx);
                } 
                context.fill();

                // Draw the blades of the windmill
                let blade_length = windmill_radius * 2;  // Length of the blades
                context.strokeStyle = '#000000';  // Color of the blades
                for(let i=0; i<8; i++){
                    let theta = ((i / 8) * 2 + windmill_angle) * Math.PI;
                    // let x1 = windmill_radius * Math.cos(theta) + windmill_x;
                    // let y1 = windmill_radius * Math.sin(theta);
                    // let x2 = blade_length * Math.cos(theta) + windmill_x;
                    // let y2 = blade_length * Math.sin(theta);
                    // context.beginPath();
                    // moveToTx([x1, windmill_bottom + windmill_height - y1, windmill_y], Tx);
                    // lineToTx([x2, windmill_bottom + windmill_height - y2, windmill_y], Tx);
                    // context.stroke();
                    let x = windmill_radius * Math.cos(theta) + windmill_x;
                    let y = windmill_radius * Math.sin(theta);
                    let blade_Tx = m4.multiply(Tx, m4.translation([x, windmill_bottom + windmill_height - y, windmill_y]));
                    blade_Tx = m4.multiply(blade_Tx, m4.rotationZ(theta));
                    let blade_width = windmill_radius / 10;
                    draw_blade(blade_length, blade_width, blade_Tx);
                }
                context.fillStyle = '#6F7C65';
                context.strokeStyle = '#A1AAA6'; 

            }
        }
        context.closePath();
        
        context.globalAlpha = 1;
        // context.fill();
    }

	function draw_plane(color,Tx,scale) {
        var Tx = mat4.clone(Tx);
        mat4.scale(Tx,Tx,[scale,scale,scale]);
        context.beginPath();
	    context.fillStyle = color;
        moveToTx([-10,  0, 50],Tx);lineToTx([-10,  0, 10],Tx);lineToTx([-50,  0, 20],Tx);
        lineToTx([-10,  0,-10],Tx);lineToTx([-10,  0,-50],Tx);lineToTx([  0,  0,-60],Tx);
        lineToTx([ 10,  0,-50],Tx);lineToTx([ 10,  0,-10],Tx);lineToTx([ 50,  0, 20],Tx);
        lineToTx([ 10,  0, 10],Tx);lineToTx([ 10,  0, 50],Tx);lineToTx([  0, 20, 50],Tx);
	    context.closePath();
	    context.fill();
	}
    
    // In your draw_cloud function
    function draw_cloud(cloud, Tx) {
        for(let i=0; i<5; i++){  
            let part = cloud.parts[i];
            let circle_x = (i - 1) * 20;
            let circle_y = part.y;  
            let circle_z = part.z;  
            let circle_radius = part.radius;  
            let circle_Tx = m4.multiply(Tx, m4.translation([circle_x, circle_y, 0]));

            context.fillStyle = "#729fd8"; 
            context.beginPath();
            moveToTx([0, 0, 0], circle_Tx);
            sphereTx(circle_radius, circle_Tx);
            context.closePath();
            context.fill();
        }
    }

    function draw_floor(Tx) {
        context.globalAlpha = 0.7;
        context.beginPath();
        context.fillStyle = "#B1BBB8";
        moveToTx([0, 0, 0], Tx);
        for(let i=0; i<=100; i++){
            let theta = (i / 100) * 2 * Math.PI;
            let x = 500 * Math.cos(theta);
            let z = 500 * Math.sin(theta);
            lineToTx([x, 0, z], Tx);
        }
        context.closePath();
        context.fill();
        context.globalAlpha = 1;
    }

    function draw_river(Tx) {
        moveToTx([500 * Math.cos(0), 0, 500 * Math.sin(0)], Tx);
        context.beginPath();
        context.fillStyle = '#ADD8E6'; 
        
        for(let i=0; i<=100; i++){
            let theta = (i / 100) * 2 * Math.PI;
            let x = 500 * Math.cos(theta);
            let z = 500 * Math.sin(theta);
            lineToTx([x, 0, z], Tx);
        }
        
        lineToTx([700 * Math.cos(0), 0, 700 * Math.sin(0)], Tx);
        for(let i=0; i<=100; i++){
            let theta = (i / 100) * 2 * Math.PI;
            let x = 700 * Math.cos(theta); 
            let z = 700 * Math.sin(theta);
            lineToTx([x, 0, z], Tx);
        }
        context.closePath();
        context.fill();

    }

    function draw_fence(Tx) {
        context.globalAlpha = 0.5;
        context.beginPath();
        context.strokeStyle = '#654321';
        let fenceHeight = 50; 
        for(let i=0; i<100; i++){
            let theta1 = (i / 100) * 2 * Math.PI;
            let theta2 = ((i + 1) / 100) * 2 * Math.PI;
            let x1 = 700 * Math.cos(theta1); 
            let z1 = 700 * Math.sin(theta1);
            let x2 = 700 * Math.cos(theta2);
            let z2 = 700 * Math.sin(theta2);
            
            moveToTx([x1, 0, z1], Tx);
            lineToTx([x2, 0, z2], Tx);

            moveToTx([x1, 0, z1], Tx);
            lineToTx([x1, fenceHeight, z1], Tx);
 
            moveToTx([x2, 0, z2], Tx);
            lineToTx([x2, fenceHeight, z2], Tx);

            moveToTx([x1, fenceHeight, z1], Tx);
            lineToTx([x2, fenceHeight, z2], Tx);
        }
        context.stroke();
        context.globalAlpha = 1;
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        var T_viewport = mat4.create();
        mat4.fromTranslation(T_viewport, [400, 400, 0]); 
        mat4.scale(T_viewport, T_viewport, [slider1.value, -slider1.value, 1]); 
        
        // var view_angle = slider1.value * 0.01 * Math.PI;
        var view_angle = current_angle * 0.01 * Math.PI;
        view_angle = view_angle % (2 * Math.PI);
        var camera_loc = camera_curve_observe(view_angle);
        var camera_target = vec3.fromValues(0, 0, 0);
        var camera_up = vec3.fromValues(0, 100, 0);
        var lookAt = mat4.create();
        mat4.lookAt(lookAt, camera_loc, camera_target, camera_up);
        var T_projection_camera = mat4.create();
        mat4.ortho(T_projection_camera, -100, 100, -100, 100, -1, 1);
        var T_viewport_projection_camera = mat4.create();
        mat4.multiply(T_viewport_projection_camera, T_viewport, T_projection_camera);
        mat4.multiply(T_viewport_projection_camera, T_viewport_projection_camera, lookAt);
        draw_river(T_viewport_projection_camera);
        draw_floor(T_viewport_projection_camera);
        draw_fence(T_viewport_projection_camera);
        let camera_direction = vec3.create();
        if (view_angle < Math.PI) {
            draw_cylinder(300, 150, 20, 
                T_viewport_projection_camera, 
                vec3.subtract(camera_direction, camera_target, camera_loc), 
                -400, 15);
            var Tmodel = mat4.create();
            mat4.fromTranslation(Tmodel, Curve(tParam));
            var Tmodel_rot=mat4.create();
            var eyePlane = vec3.fromValues(0,0,0);
            //mat4.lookAt(Tmodel_rot, eyePlane, Tangent(t), upObserver);
            mat4.lookAt(Tmodel_rot, eyePlane, Tangent(tParam), vec3.fromValues(0,1,0));  
            mat4.invert(Tmodel_rot,Tmodel_rot);
            mat4.multiply(Tmodel,Tmodel,Tmodel_rot);
            let airplane_Tx = m4.multiply(T_viewport_projection_camera, Tmodel);
            draw_plane('#c0b69b', airplane_Tx, 1);

            Tmodel = mat4.create();
            mat4.fromTranslation(Tmodel, EllipseCurve(tParam));
            var Tmodel_rot=mat4.create();
            var eyePlane = vec3.fromValues(0,0,0);
            //mat4.lookAt(Tmodel_rot, eyePlane, Tangent(t), upObserver);
            mat4.lookAt(Tmodel_rot, eyePlane, EllipseTangent(tParam), vec3.fromValues(0,1,0));  
            mat4.invert(Tmodel_rot,Tmodel_rot);
            mat4.multiply(Tmodel,Tmodel,Tmodel_rot);
            airplane_Tx = m4.multiply(T_viewport_projection_camera, Tmodel);
            draw_plane('#f29bc5', airplane_Tx, 1);

            if (perspective == 1) { 
                let curve_Tx = m4.multiply(T_viewport_projection_camera, m4.translation([0, 0, 0]));
                draw_curve(curve_Tx);
                draw_ellipse_curve(curve_Tx);
            }
            draw_cylinder(200, 100, 20, 
                T_viewport_projection_camera, 
                vec3.subtract(camera_direction, camera_target, camera_loc), 
                300, 10);
        } else {
            draw_cylinder(200, 100, 20, 
                T_viewport_projection_camera, 
                vec3.subtract(camera_direction, camera_target, camera_loc), 
                300, 10);
            var Tmodel = mat4.create();
            mat4.fromTranslation(Tmodel, Curve(tParam));
            var Tmodel_rot=mat4.create();
            var eyePlane = vec3.fromValues(0,0,0);
            //mat4.lookAt(Tmodel_rot, eyePlane, Tangent(t), upObserver);
            mat4.lookAt(Tmodel_rot, eyePlane, Tangent(tParam), vec3.fromValues(0,1,0));  
            mat4.invert(Tmodel_rot,Tmodel_rot);
            mat4.multiply(Tmodel,Tmodel,Tmodel_rot);
            let airplane_Tx = m4.multiply(T_viewport_projection_camera, Tmodel);
            draw_plane('#c0b69b', airplane_Tx, 1);

            Tmodel = mat4.create();
            mat4.fromTranslation(Tmodel, EllipseCurve(tParam));
            var Tmodel_rot=mat4.create();
            var eyePlane = vec3.fromValues(0,0,0);
            //mat4.lookAt(Tmodel_rot, eyePlane, Tangent(t), upObserver);
            mat4.lookAt(Tmodel_rot, eyePlane, EllipseTangent(tParam), vec3.fromValues(0,1,0));  
            mat4.invert(Tmodel_rot,Tmodel_rot);
            mat4.multiply(Tmodel,Tmodel,Tmodel_rot);
            airplane_Tx = m4.multiply(T_viewport_projection_camera, Tmodel);
            draw_plane('#f29bc5', airplane_Tx, 1);
            if (perspective == 1) { 
                let curve_Tx = m4.multiply(T_viewport_projection_camera, m4.translation([0, 0, 0]));
                draw_curve(curve_Tx);
                draw_ellipse_curve(curve_Tx);
            }
            draw_cylinder(300, 150, 20, 
                T_viewport_projection_camera, 
                vec3.subtract(camera_direction, camera_target, camera_loc), 
                -400, 15);
        }

        // In your draw function
        for(let i=0; i<5; i++){  // Draw 5 clouds
            let cloud = clouds[i];
            let cloud_Tx = m4.multiply(T_viewport_projection_camera, m4.translation([cloud.x, cloud.y, 200]));
            draw_cloud(cloud, cloud_Tx);
        }
        


     }
     slider1.addEventListener("input", draw);
     button.addEventListener('click', function() {
        perspective = 1 - perspective;
        draw();
    });
    setInterval(function() {
        current_angle += 0.4;
        windmill_angle += 0.01;
        for(let i=0; i<5; i++){  // Draw 5 clouds
            let cloud = clouds[i];
            cloud.x += Math.random() * 4 - 2;  
            cloud.y += Math.random() * 4 - 2;
            if(cloud.x > canvas.width) {  // If the cloud has moved off the right edge of the canvas
                cloud.x = -100;  // Move it to the left edge
            }
        }
        tParam += 0.005;
        draw();
    }, 10);
    draw();
}

window.onload = setup;