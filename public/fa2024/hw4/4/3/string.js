//==============================================================================
// Globals.
//==============================================================================

// General animation.
var interval = 1 / 60;
var meteor_t = 0;
var meteor_speed = 1;
var num_points = 20;

//==============================================================================
// Helper functions.
//==============================================================================

function update(path, vels, width, height, d_time) {
  for (let i = 0; i < path.length; i++) {
    // X coord.
    path[i][0] += vels[i][0] * d_time;
    if (path[i][0] < 0 || path[i][0] > width)
      vels[i][0] *= -1;

    // Y coord.
    path[i][1] += vels[i][1] * d_time;
    if (path[i][1] < 0 || path[i][1] > height)
      vels[i][1] *= -1;
  }
}

// From Week 6 Demo 2.
function bspline_basis(t) {
  return [
    (1/6) * (-t*t*t + 3*t*t - 3*t + 1),
    (1/6) * (3*t*t*t - 6*t*t + 4),
    (1/6) * (-3*t*t*t + 3*t*t + 3*t + 1),
    (1/6) * t*t*t
  ];
}

// From Week 6 Demo 2.
/**
 * Takes in an array of 4 points and a time t between 0 and 1.
 * Returns a point on the spline created by those 4 points.
 */
function cubic(path, t) {
  var b = bspline_basis(t);
  var point = vec2.create();

  vec2.scale(point, path[0], b[0]);
  vec2.scaleAndAdd(point, point, path[1], b[1]);
  vec2.scaleAndAdd(point, point, path[2], b[2]);
  vec2.scaleAndAdd(point, point, path[3], b[3]);

  return point;
}

// From Week 6 Demo 2.
function draw_cubic_segment(path, context, resolution) {
  context.beginPath();
  context.strokeStyle = "#444444";

  let start_point = cubic(path, 0);
  context.moveTo(start_point[0], start_point[1]);
  for (let i = 0; i <= resolution; i++) {
    let t = i / resolution;
    let point = cubic(path, t);
    context.lineTo(point[0], point[1]);
  }

  context.stroke();
}

//==============================================================================
// Setup and draw.
//==============================================================================

function draw_points(path, context) {
  context.fillStyle = "#FFFFFF44";
  for (let point of path) {
    context.beginPath();
    context.arc(point[0], point[1], 4, 0, 2 * Math.PI);
    context.fill();
  }
}

/**
 * Given a list of points, draw a closed loop. This function assumes there are
 * at least 4 points.
 */
function draw_path(path, context, resolution) {
  for (let i = 0; i < path.length; i++) {
    let sub_path = [
      path[i],
      path[(i + 1) % path.length],
      path[(i + 2) % path.length],
      path[(i + 3) % path.length]
    ];
    draw_cubic_segment(sub_path, context, resolution);
  }
}

/**
 * Draws a meteor along the path.
 */
function draw_meteor(path, context, meteor_t) {
  let index = Math.floor(meteor_t);
  let t = meteor_t - index;
  let sub_path = [
    path[index],
    path[(index + 1) % path.length],
    path[(index + 2) % path.length],
    path[(index + 3) % path.length]
  ];

  let point = cubic(sub_path, t);
  context.moveTo(point[0], point[1]);

  context.fillStyle = "#FF6666";
  context.beginPath();
  context.arc(point[0], point[1], 10, 0, 2 * Math.PI);
  context.fill();
}

function setup() {
  var canvas = document.getElementById('canvas');
  canvas.width = screen.width * 0.9;
  canvas.height = screen.height * 0.6;

  var path = new Array();
  var vels = new Array();

  // Init control points.
  for (let i = 0; i < num_points; i++) {
    path.push([Math.random() * canvas.width,
               Math.random() * canvas.height]);
    vels.push([(Math.random() - 0.5) * 200,
               (Math.random() - 0.5) * 200]);
  }

  function frame() {
    var context = canvas.getContext('2d');
    canvas.width = canvas.width;

    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Base transform.
    const scale = 1;
    context.scale(scale, scale);

    context.lineWidth = 2;

    /* Update points and draw. */

    meteor_t += meteor_speed * interval;
    meteor_t %= path.length;

    update(path, vels, canvas.width, canvas.height, interval);

    draw_points(path, context);
    draw_path(path, context, 50);
    draw_meteor(path, context, meteor_t);
  }

  setInterval(frame, interval * 1000);
}

//==============================================================================
// Anything else.
//==============================================================================

window.onload = setup();

