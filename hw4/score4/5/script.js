/*
* CS 559 Assignment 4
* Draws a scene with autumn leaves falling from trees.
* Cubic beziers are used to draw the leaves.
* They are also used to define the path that the leaves fall in.
*/


function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');

  // Defines Color palette:
  function leaf_color(t){
    const r = Math.cos(6.28*(0.5*t - 0.25))*0.8+0.3;
    const g = Math.cos(6.28*(0.5*t + 0))*0.4+0.4;
    const b = 0;
    return `rgb(${r*255},${g*255},${b*255})`
  }

  // Used a vector graphics editor to make the shape
  // Then copy and pasted from svg the absolute coords
  const leaf_shape_raw = [
    -17.45043,-0.63914606,
  -9.3130282,-0.98302676,-13.103042,-3.6651637,-12.233588,-5.6853091,-9.7308532,-5.9437711,-11.140523,-8.7484691,-7.8882122,-14.862751,-3.5709612,-5.2184053,-0.29185866,-10.489394,4.633735,-15.705192,6.2348489,-13.668973,8.0238792,-13.452766,14.664813,-14.34876,12.144969,-11.450664,12.60428,-11.362739,13.278619,-10.53676,6.2373477,-6.3471231,6.5065981,-3.4874852,17.371931,-6.4489241,17.128518,-4.501847,18.184485,-4.1768506,23.922459,-1.2764347,18.647155,-0.56343526,18.242616,0.04703814,19.778045,3.2761123,7.7410601,-0.16060956,4.9285028,3.3303498,14.053971,6.2820025,13.767232,8.200583,14.806481,9.984887,17.623208,11.22785,12.108282,12.132968,7.0338356,9.2421663,5.8321981,13.076136,-3.2643202,3.8184634,-3.7870622,9.1002256,-6.9186782,12.229882,-8.6437352,11.166193,-8.5244082,4.1050301,-10.970384,3.3541862,-10.915985,1.8595776,-10.150012,0.08147214,-8.9933442,-0.38503486,-11.404917,-0.26722906,-17.296527,0.01625084,-17.296527,0.01625084
  ]
  var leaf_shape = []
  for (let i = 0; i < leaf_shape_raw.length; i+=2){
    leaf_shape.push([leaf_shape_raw[i], leaf_shape_raw[i+1]])
  }

  const leaf_path_raw = [
    0,-400,
    43.073734,-341.30891,82.485948,-351.31945,119.02622,-368.18345,155.56649,-385.04744,147.77299,-365.83865,114.57178,-334.28685,81.370567,-302.73504,-129.49828,-306.40627,-160.85728,-316.74162,-192.21628,-327.07698,-162.52042,-385.47258,-143.81408,-330.65401,-125.10774,-275.83544,18.027756,-265.80984,69.524678,-275.88461,121.0216,-285.95938,179.01406,-294.22176,126.82803,-277.0744,74.642011,-259.92704,-53.898703,-235.3507,-97.794031,-231.85157,-141.68936,-228.35243,-187.23634,-277.68913,-161.77627,-245.62005,-136.3162,-213.55097,36.096821,-199.02876,96.641816,-150.6637,157.18681,-102.29864,145.27861,-188.08388,124.31072,-137.32252,103.34283,-86.56116,-49.077781,-97.5566,-86.824618,-92.14157,-124.57145,-86.72655,-194.23491,-125.64021,-157.371,-95.12342,-120.50709,-64.60664,-86.831769,-28.43982,-62.650612,-14.99982,-38.469456,-1.55983,-33.32915,-4.28209,-22.753301,-2.11085,-12.177452,0.0604,0,0,0,0,0,0,0,0,0,0
  ]

  var leaf_path = []
  for (let i = 0; i < leaf_path_raw.length; i+=2){
    leaf_path.push([leaf_path_raw[i], leaf_path_raw[i+1]])
  }


  // Store the data for the leaves
  // for each leaf [x,y,t,color,reverse]
  // x,y : the final x and y positions of the leaf (leaf_path ends at 0,0)
  // t : the parameter for the path, ranges from 0 to the number of steps of the path
  // reverse: +-1, in order to have leaves facing left and right
  var leaves = [];
  for (let i = 0; i < 400; i++){
    const x = Math.random()*canvas.width;
    const y = Math.random()*canvas.height/3+canvas.height*2/3;
    const t = 0;
    const color = leaf_color(Math.random());
    const reverse = Math.floor(Math.random()*2)*2-1;
    leaves.push([x,y,t,color,reverse]);
  }
  var num_falling = 0;
  var trees = [];
  for (let i = 0; i < 50; i++){
    trees.push([Math.random(), Math.random()])
  }


  // --------------------- Draw -----------------------------------
  function draw() {
    var context = canvas.getContext('2d');
    canvas.width = canvas.width;

    // Draw background
    context.fillStyle = 'rgb(255,220,160)';
    context.fillRect(0,0,canvas.width,canvas.height);
    context.fillStyle = 'rgb(130,80,0)';
    context.fillRect(0,canvas.height/3,canvas.width,canvas.height*2/3);

    // Cubic bezier
    var bezier = function(t) {
      return [
        (1-t)*(1-t)*(1-t),
        3*(1-t)*(1-t)*t,
        3*(1-t)*t*t,
        t*t*t
      ];
    }
  
    var bezier_derivative = function(t) {
      return [
        -3*(1-t)*(1-t),
        3*(1-t)*(1-t) - 6*(1-t)*t,
        6*(1-t)*t - 3*t*t,
        3*t*t
      ];
    }

    function cubic(basis,P,t){
      const b = basis(t);
	    var result=vec2.create();
	    vec2.scale(result,P[0],b[0]);
	    vec2.scaleAndAdd(result,result,P[1],b[1]);
	    vec2.scaleAndAdd(result,result,P[2],b[2]);
	    vec2.scaleAndAdd(result,result,P[3],b[3]);
	    return result;
	}

    // Composite curve
    function comp_cubic(basis, points, t, unit_scale=false){
      if (unit_scale == true){
        t *= points.length-1;
      }
      var i = Math.trunc(t)*3;
      if (i > points.length-4){
        const end = points[points.length-1];
        return vec2.fromValues(end[0],end[1]);
      }
      const P = [points[i], points[i+1], points[i+2], points[i+3]]
      return cubic(basis,P,t%1);
    }

    // Draws the falling leaf animation
    function falling_leaf(end_x,end_y,t,color,reverse){
      var p = vec2.create();
      var v = vec2.fromValues(1,0);
      if (Math.trunc(t)*3 < leaf_path.length-4){// if animation still going
        p = comp_cubic(bezier,leaf_path,t);
        v = comp_cubic(bezier_derivative,leaf_path,t);
      }
      vec2.add(p,p,[end_x,end_y])
      context.save();
      context.translate(p[0],p[1]);
      context.scale(reverse,1);
      context.rotate(Math.atan2(v[1],v[0]));
      context.beginPath();
      for (let t = 0; t < 1; t+=0.007){
        var draw_p = comp_cubic(bezier,leaf_shape, t, true);
        context.lineTo(draw_p[0],draw_p[1]);
      }
      context.closePath();
      context.fillStyle = color;
      context.fill();
      context.restore();
    }

    // Draw trees
    for (let i = 0; i < 50; i++){
      const x = trees[i][0];
      const y = trees[i][1];
      const y2 = y*canvas.height/3 + canvas.height/3;
      context.fillStyle = `rgb(${20*y+10},${30},${30*(1-y)})`;
      context.fillRect(x*canvas.width,0,y*20+4,y2);
      context.save();
    }

    // Choose when to drop leaves
    if (Math.random() < 0.02){
      num_falling += 1;
    }

    // Update leaf data
    for (let i = 0; i < leaves.length; i ++){
      var leaf = leaves[i];
      falling_leaf(leaf[0],leaf[1],leaf[2],leaf[3],leaf[4]);
      if (i < num_falling){
        leaf[2] += 1/60;
      }
    }
    
    window.requestAnimationFrame(draw);
  }
  // --------------------- End Draw ----------------------

  window.requestAnimationFrame(draw);
}
// --------------------- End Setup ----------------------
window.onload = setup;
    