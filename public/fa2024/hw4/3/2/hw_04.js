function setup() {"use strict";
    var animated_canvas = document.getElementById('AnimatedCanvas');

    var slider_x_0_scale = document.getElementById('x_0_scale_input');
    slider_x_0_scale.value = 300;
    var slider_y_0_scale = document.getElementById('y_0_scale_input');
    slider_y_0_scale.value = 200;
    var slider_x_0_1_scale = document.getElementById('x_0_1_scale_input');
    slider_x_0_1_scale.value = 45;
    var slider_y_0_1_scale = document.getElementById('y_0_1_scale_input');
    slider_y_0_1_scale.value = 50;

    var clock_init_frac = 0.0;
    var clock_step = 0.001;
    var prop_rot_angle = 0.0;
    var prop_rot_step_size = 0.05 * Math.PI;

    function moveToTx(stack, context, x,y){
        var res = vec2.create();
        vec2.transformMat3(res, [x, y], stack[stack.length - 1]);
        context.moveTo(res[0], res[1]);
    }

    function lineToTx(stack, context, x,y){
        var res = vec2.create();
        vec2.transformMat3(res, [x, y], stack[stack.length - 1]);
        context.lineTo(res[0], res[1]);
    }

    function arcTx(stack, context, x, y, r, angle_start, angle_end){
        var res = vec2.create();
        vec2.transformMat3(res, [x, y], stack[stack.length - 1]);
        context.arc(res[0], res[1], r * Math.sqrt(mat3.determinant(stack[stack.length - 1])), angle_start, angle_end);
    }

    function restoreTx(stack){
        stack.pop();
    }

    function saveTx(stack){
        var res = mat3.create();
        mat3.copy(res, stack[stack.length - 1]);
        stack.push(res);
    }

    function rotateTx(stack, angle){
        var res = mat3.create();
        mat3.fromRotation(res, angle);
        mat3.multiply(stack[stack.length - 1], stack[stack.length - 1], res);
    }

    function scaleTx(stack, sx, sy){
        var res = mat3.create();
        mat3.fromScaling(res, [sx, sy]);
        mat3.multiply(stack[stack.length - 1], stack[stack.length - 1], res);
    }

    function translateTx(stack, sx, sy){
        var res = mat3.create();
        mat3.fromTranslation(res, [sx, sy]);
        mat3.multiply(stack[stack.length - 1], stack[stack.length - 1], res);
    }

    function drawCurveStoke(stack, context, func, num_interval, start_time, end_time){
        var res = func(start_time);
        var t = start_time;
        context.beginPath();
        moveToTx(stack, context, res[0], res[1]);
        for (let i = 0; i < num_interval; i++) {
            t = start_time + (end_time - start_time) * (i + 1) / num_interval;
            res = func(t);
            lineToTx(stack, context, res[0], res[1]);
          }
        context.closePath();
        context.stroke();
    }

    function drawCurveOpenStoke(stack, context, func, num_interval, start_time, end_time){
        var res = func(start_time);
        var t = start_time;
        context.beginPath();
        moveToTx(stack, context, res[0], res[1]);
        for (let i = 0; i < num_interval; i++) {
            t = start_time + (end_time - start_time) * (i + 1) / num_interval;
            res = func(t);
            lineToTx(stack, context, res[0], res[1]);
          }
        context.stroke();
    }

    function drawCurveFill(stack, context, func, num_interval, start_time, end_time){
        var res = func(start_time);
        var t = start_time;
        context.beginPath();
        moveToTx(stack, context, res[0], res[1]);
        for (let i = 0; i < num_interval; i++) {
            t = start_time + (end_time - start_time) * (i + 1) / num_interval;
            res = func(t);
            lineToTx(stack, context, res[0], res[1]);
          }
        context.closePath();
        context.fill();
    }

    function Cubic(basis, P, t){
        var b = basis(t);
        var res = vec2.create();
        vec2.scale(res, P[0], b[0]);
        vec2.scaleAndAdd(res, res, P[1], b[1]);
        vec2.scaleAndAdd(res, res, P[2], b[2]);
        vec2.scaleAndAdd(res, res, P[3], b[3]);
        return res;
    }

    function getAngleFromTangent(dx, dy){
        var dydx = dy / dx;
        if (dydx == NaN){
            if (dy > 0) return (0.5 * Math.PI);
            else if (dy < 0) return -(0.5 * Math.PI);
            else return 0;
        } else{
            var at = Math.atan(dydx);
            if (dx >= 0) return at;
            else return (at + Math.PI);
        }
    }

    var BezierCurve = function(t){
        return [1 - 3 * t + 3 * t * t - t * t * t,
            3 * t - 6 * t * t + 3 * t * t * t,
            3 * t * t - 3 * t * t * t,
            t * t * t];
    }

    var BezierGrad = function(t){
        return [-3 + 6 * t - 3 * t * t,
            3 - 12 * t + 9 * t * t,
            6 * t - 9 * t * t,
            3 * t * t];
    }

    var HermiteCurve = function(t){
        return [2 * t * t * t - 3 * t * t + 1,
            t * t * t - 2 * t * t + t,
            -2 * t * t * t + 3 * t * t,
            t * t * t - t * t];
    }

    var HermiteGrad = function(t){
        return [6 * t * t - 6 * t,
            3 * t * t - 4 * t + 1,
            -6 * t * t + 6 * t,
            3 * t * t - 2 * t];
    }

    var BSplieCurve = function(t){
        return [(- t * t * t + 3 * t * t - 3 * t + 1) / 6,
            (3 * t * t * t - 6 * t * t + 4) / 6,
            (-3 * t * t * t + 3 * t * t + 3 * t + 1) / 6,
            (t * t * t) / 6];
    }

    var BSplineGrad = function(t){
        return [(- t * t + 2 * t - 1) / 2,
            (3 * t * t - 4 * t) / 2,
            (-3 * t * t + 2 * t + 1) / 2,
            (t * t) / 2];
    }

    function curveEllipseQuarter(t, l, x_scale, y_scale){
        //var t_s = t * Math.PI / 2;
        //return [l * x_scale * Math.cos(t * Math.PI / 2), l * y_scale * Math.sin(t * Math.PI / 2)];
        var t_s = t * 2 * Math.PI;
        return [l * x_scale * Math.cos(t_s), l * y_scale * Math.sin(t_s)];
    }

    function gradEllipseQuarter(t, l, x_scale, y_scale){
        //var t_s = t * Math.PI / 2;
        //return [-l * x_scale * Math.sin(t * Math.PI / 2) * Math.PI / 2, l * y_scale * Math.cos(t * Math.PI / 2) * Math.PI / 2];
        var t_s = t * 2 * Math.PI;
        return [-l * x_scale * Math.sin(t_s), l * y_scale * Math.cos(t_s)];
    }

    
    function drawChinookHelicopter(stack, context, theta_heli, theta_prop , linecolor, fillcolor, bladecolor){
        function drawPropeller3blade(context, bladecolor){
            function drawBlade(context){ // Draw a blade at (0,0) pointing downward
                const l = 100;
                saveTx(stack);
                context.beginPath();
                moveToTx(stack, context, 0,0);
                lineToTx(stack, context, 0, l);
                lineToTx(stack, context, 0.125 * l, 0.875 * l);
                lineToTx(stack, context, l / 8, l / 8);
                lineToTx(stack, context, l / 16, l / 16);
                lineToTx(stack, context, l / 16, 0);
                context.closePath();
                context.fill();
                restoreTx(stack);
            }
            context.linewidth = 0;
            context.fillStyle = bladecolor;
            saveTx(stack);
            drawBlade(context);
            rotateTx(stack, 2 * Math.PI / 3);
            drawBlade(context);
            rotateTx(stack, 2 * Math.PI / 3);
            drawBlade(context);
            restoreTx(stack);
        }
        const r = 100;
        saveTx(stack);
        context.linewidth = 1;
        context.strokeStyle = linecolor;
        context.fillStyle = fillcolor;
        rotateTx(stack, theta_heli);
        context.beginPath();
        moveToTx(stack, context, -r / 4, 3 * r / 4);
        lineToTx(stack, context, -r / 8, r);
        lineToTx(stack, context, r / 8, r);
        lineToTx(stack, context, r / 4, 3 * r / 4);
        lineToTx(stack, context, r / 4, -r);
        lineToTx(stack, context, -r / 4, -r);
        context.closePath();
        context.fill();
        saveTx(stack);
        translateTx(stack, 0, 3 * r / 4);
        rotateTx(stack, theta_prop);
        drawPropeller3blade(context, bladecolor);
        restoreTx(stack);
        saveTx(stack);
        translateTx(stack, 0, - 3 * r / 4);
        rotateTx(stack, theta_prop);
        drawPropeller3blade(context, bladecolor);
        restoreTx(stack);
        restoreTx(stack);
    }

    function CurveTrackRaw(t, l, x_0_scale, y_0_scale, x_1_0_scale, y_1_0_scale){ // x_1_0_scale and y_1_0_scale <= 0.8
        t = t - Math.floor(t);
        t = (t >= 1.0) ? 1.0 : ((t <= 0.0) ? 0.0 : t);
        var x_1_scale = x_0_scale * x_1_0_scale;
        var y_1_scale = y_0_scale * y_1_0_scale;
        if (t <= (1.0 / 6)) {
            var u = t / (1.0 / 6);
            u = (u >= 1.0) ? 1.0 : ((u <= 0.0) ? 0.0 : u);
            u = u * 0.25;
            var ret_pos = curveEllipseQuarter(u, l, x_0_scale, y_0_scale);
            var ret_tgt = gradEllipseQuarter(u, l, x_0_scale, y_0_scale);
            return [ret_pos, getAngleFromTangent(ret_tgt[0], ret_tgt[1])];
        } else if (t <= (2.0 / 6)) {
            var u = (t - (1.0 / 6)) / (1.0 / 6);
            u = (u >= 1.0) ? 1.0 : ((u <= 0.0) ? 0.0 : u);
            var p_0 = [0, y_0_scale * l];
            var b_0 = [- x_0_scale * l, 0];
            var p_1 = [-x_0_scale * l, 0];
            var b_1 = [0, -y_0_scale * l];
            var P_inp = [p_0, b_0, p_1, b_1];
            var ret_pos = Cubic(HermiteCurve, P_inp, u);
            var ret_tgt = Cubic(HermiteGrad, P_inp, u);
            return [ret_pos, getAngleFromTangent(ret_tgt[0], ret_tgt[1])];
        } else if (t <= (3.0 / 6)) {
            var u = (t - (2.0 / 6)) / (1.0 / 6);
            u = (u >= 1.0) ? 1.0 : ((u <= 0.0) ? 0.0 : u);
            u = u * 0.25 + 0.5;
            var ret_pos = curveEllipseQuarter(u, l, (1 - x_1_0_scale) * x_0_scale, y_0_scale);
            var ret_tgt = gradEllipseQuarter(u, l, (1 - x_1_0_scale) * x_0_scale, y_0_scale);
            return [[ret_pos[0] - (l * x_1_scale), ret_pos[1]], getAngleFromTangent(ret_tgt[0], ret_tgt[1])];
        } else if (t <= (4.0 / 6)) {
            var u = (t - (3.0 / 6)) / (1.0 / 6);
            u = (u >= 1.0) ? 1.0 : ((u <= 0.0) ? 0.0 : u);
            var p_0 = [-x_1_scale * l, -y_0_scale * l];
            var b_0 = [x_1_scale * l, 0];
            var p_1 = [0, -y_1_scale * l];
            var b_1 = [x_1_scale * l, 0];
            var P_inp = [p_0, b_0, p_1, b_1];
            var ret_pos = Cubic(HermiteCurve, P_inp, u);
            var ret_tgt = Cubic(HermiteGrad, P_inp, u);
            return [ret_pos, getAngleFromTangent(ret_tgt[0], ret_tgt[1])];
        } else if (t <= (5.0 / 6)) {
            var u = (t - (4.0 / 6)) / (1.0 / 6);
            u = (u >= 1.0) ? 1.0 : ((u <= 0.0) ? 0.0 : u);
            var p_0 = [0, -y_1_scale * l];
            var b_0 = [x_1_scale * l, 0];
            var p_1 = [x_1_scale * l, -y_0_scale * l];
            var b_1 = [x_1_scale * l, 0];
            var P_inp = [p_0, b_0, p_1, b_1];
            var ret_pos = Cubic(HermiteCurve, P_inp, u);
            var ret_tgt = Cubic(HermiteGrad, P_inp, u);
            return [ret_pos, getAngleFromTangent(ret_tgt[0], ret_tgt[1])];
        } else {
            var u = (t - (5.0 / 6)) / (1.0 / 6);
            u = (u >= 1.0) ? 1.0 : ((u <= 0.0) ? 0.0 : u);
            u = u * 0.25 + 0.75;
            var ret_pos = curveEllipseQuarter(u, l, (1 - x_1_0_scale) * x_0_scale, y_0_scale);
            var ret_tgt = gradEllipseQuarter(u, l, (1 - x_1_0_scale) * x_0_scale, y_0_scale);
            return [[ret_pos[0] + (l * x_1_scale), ret_pos[1]], getAngleFromTangent(ret_tgt[0], ret_tgt[1])];
        }
    }

    function drawTrack(stack, context, l, x_0_scale, y_0_scale, x_1_0_scale, y_1_0_scale, rail_width_scale, track_width){
        var CurveTrackLeft = function(t){
            var res = CurveTrackRaw(t, l, x_0_scale, y_0_scale, x_1_0_scale, y_1_0_scale);
            return [res[0][0] - l * rail_width_scale * Math.sin(res[1]), res[0][1] + l * rail_width_scale * Math.cos(res[1])];
        }
        var CurveTrackRight = function(t){
            var res = CurveTrackRaw(t, l, x_0_scale, y_0_scale, x_1_0_scale, y_1_0_scale);
            return [res[0][0] + l * rail_width_scale * Math.sin(res[1]), res[0][1] - l * rail_width_scale * Math.cos(res[1])];
        }
        var CurveTrack = function(t){
            var res = CurveTrackRaw(t, l, x_0_scale, y_0_scale, x_1_0_scale, y_1_0_scale);
            return res[0];
        }
        context.lineWidth = 1;
        context.strokeStyle = "purple";
        drawCurveOpenStoke(stack, context, CurveTrackLeft, 1024, 0.0, 1.0);
        drawCurveOpenStoke(stack, context, CurveTrackRight, 1024, 0.0, 1.0);
        context.lineWidth = track_width;
        context.strokeStyle = "cyan";
        drawCurveOpenStoke(stack, context, CurveTrack, 1024, 0.0, 1.0);
        return;
    }

    function drawGraph(stack, context, t, l, x_0_scale, y_0_scale, x_1_0_scale, y_1_0_scale, rail_width_scale, track_width){
        function drawChinookTime(t, linecolor, fillcolor, bladecolor){
            t = t - Math.floor(t);
            t = (t >= 1.0) ? 1.0 : ((t <= 0.0) ? 0.0 : t);
            var res = CurveTrackRaw(t, l, x_0_scale, y_0_scale, x_1_0_scale, y_1_0_scale);
            saveTx(stack);
            translateTx(stack, res[0][0], res[0][1]);
            scaleTx(stack, 0.3, 0.3);
            drawChinookHelicopter(stack, context, res[1] - 0.5 * Math.PI, prop_rot_angle , linecolor, fillcolor, bladecolor);
            restoreTx(stack);
        }
        drawTrack(stack, context, l, x_0_scale, y_0_scale, x_1_0_scale, y_1_0_scale, rail_width_scale, track_width);
        var t_1 = t;
        var t_2 = 8 * (t - t * t);
        var t_3 = t >= 0.5 ? (1 - t) * (1 - t) * (1 - t) * 8 : t * t * t * 8;
        var t_4 = 3 * (t - t * t * t / 3);
        drawChinookTime(t_1, "black", "green", "blue");
        drawChinookTime(t_2, "black", "blue", "green");
        drawChinookTime(t_3, "black", "yellow", "grey");
        drawChinookTime(t_4, "black", "grey", "yellow");
        return;
    }

    



    function draw_animated() {
        var stack = [mat3.create()];

        var context = animated_canvas.getContext('2d');

        var x_0_scale = Number(slider_x_0_scale.value) * 0.01;
        var y_0_scale = Number(slider_y_0_scale.value) * 0.01;
        var x_0_1_scale = Number(slider_x_0_1_scale.value) * 0.01;
        var y_0_1_scale = Number(slider_y_0_1_scale.value) * 0.01;

        animated_canvas.width = animated_canvas.width;

        clock_init_frac = clock_init_frac + clock_step;
        clock_init_frac = clock_init_frac >= 1 ? 0.0 : clock_init_frac;
        prop_rot_angle = prop_rot_angle + prop_rot_step_size;
        prop_rot_angle = prop_rot_angle >= 2 * Math.PI ? 0 : prop_rot_angle;

        saveTx(stack);
        translateTx(stack, 400,300);
        //console.log(hour);
        //console.log(minute);
        
        //var curveTest = function(t){
        //    var res = CurveTrackRaw(t, 100, 2, 3, 0.5, 0.5);
        //    console.log(res[0]);
        //    return res[0];
        //}
        //drawCurveOpenStoke(stack, context, curveTest, 600, 0.0, 1.0);
        drawGraph(stack, context, clock_init_frac, 100, x_0_scale, y_0_scale, x_0_1_scale, y_0_1_scale, 0.3, 10);
        restoreTx(stack);
        window.requestAnimationFrame(draw_animated);
    }

    //slider_hour.addEventListener("input",draw_animated);
    //slider_minute.addEventListener("input",draw_animated);
    draw_animated();
    window.requestAnimationFrame(draw_animated);
}
window.onload = setup;
