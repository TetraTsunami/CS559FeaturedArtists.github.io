const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

class boid {
  constructor() {
    this.position = new vec2(
      Math.random() * canvas.width,
      Math.random() * canvas.height
    );
    this.velocity = new vec2(Math.random() * 2 - 1, Math.random() * 2 - 1);
    this.velocity.setMagnitude(2);
    this.acceleration = new vec2(0, 0);
    this.maxForce = 0.2;
    this.maxSpeed = 4;

    this.wingAngle = 0;
    this.wingSpeed = 0.1 + Math.random() * 0.1;
  }

  edges() {
    if (this.position.x > canvas.width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = canvas.width;
    if (this.position.y > canvas.height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = canvas.height;
  }

  attraction(boids) {
    let perceptionRadius = 50;
    let steering = new vec2(0, 0);
    let total = 0;
    for (let other of boids) {
      let d = this.position.dist(other.position);
      if (other != this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMagnitude(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flocking(boids) {
    let perceptionRadius = 50;
    let steering = new vec2(0, 0);
    let total = 0;
    for (let other of boids) {
      let d = this.position.dist(other.position);
      if (other != this && d < perceptionRadius) {
        steering.add(other.position);
        total += 1;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMagnitude(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  avoidance(boids) {
    let perceptionRadius = 50;
    let steering = new vec2(0, 0);
    let total = 0;
    for (let other of boids) {
      let d = this.position.dist(other.position);
      if (other != this && d < perceptionRadius) {
        let diff = vec2.sub(this.position, other.position);
        diff.div(d * d);
        steering.add(diff);
        total += 1;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMagnitude(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(boids) {
    let alignment = this.attraction(boids);
    let cohesion = this.flocking(boids);
    let separation = this.avoidance(boids);

    alignment.mult(1);
    cohesion.mult(1);
    separation.mult(1.5);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);

    this.wingAngle += this.wingSpeed;
    if (this.wingAngle > Math.PI / 4 || this.wingAngle < -Math.PI / 4) {
      this.wingSpeed *= -1;
    }
  }

  show() {
    const transform = new mat3()
      .translate(this.position.x, this.position.y)
      .rotate(Math.atan2(this.velocity.y, this.velocity.x));

    this.drawBody(transform);
    this.drawWing(transform, 1);
    this.drawWing(transform, -1);
    this.drawHead(transform);

    this.wingAngle += this.wingSpeed;
    if (this.wingAngle > Math.PI / 4 || this.wingAngle < -Math.PI / 4) {
      this.wingSpeed *= -1;
    }
  }

  drawBody(transform) {
    ctx.fillStyle = "skyblue";
    ctx.beginPath();
    this.drawEllipse(transform, 0, 0, 8, 4);
    ctx.fill();
  }

  drawWing(parentTransform, side) {
    const wingTransform = parentTransform.multiply(
      new mat3().rotate(this.wingAngle * side)
    );
    ctx.fillStyle = "white";
    ctx.beginPath();
    this.drawPath(wingTransform, [
      { x: 0, y: 0 },
      { x: -8, y: 6 * side },
      { x: -4, y: 0 },
    ]);
    ctx.fill();
  }

  drawHead(transform) {
    ctx.fillStyle = "gray";
    ctx.beginPath();
    this.drawEllipse(transform, 6, 0, 3, 3);
    ctx.fill();
  }

  drawPath(transform, points) {
    const transformedPoints = points.map((p) =>
      transform.transformPoint(p.x, p.y)
    );
    ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
    for (let i = 1; i < transformedPoints.length; i++) {
      ctx.lineTo(transformedPoints[i].x, transformedPoints[i].y);
    }
    ctx.closePath();
  }

  drawEllipse(transform, cx, cy, rx, ry) {
    const steps = 20;
    const points = [];
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      points.push({
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry,
      });
    }
    this.drawPath(transform, points);
  }
}

class vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
  }

  mult(n) {
    this.x *= n;
    this.y *= n;
  }

  div(n) {
    this.x /= n;
    this.y /= n;
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  setMagnitude(n) {
    this.normalize();
    this.mult(n);
  }

  normalize() {
    let m = this.mag();
    if (m != 0) this.div(m);
  }

  limit(max) {
    if (this.mag() > max) {
      this.normalize();
      this.mult(max);
    }
  }

  dist(v) {
    let dx = this.x - v.x;
    let dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static sub(v1, v2) {
    return new vec2(v1.x - v2.x, v1.y - v2.y);
  }
}

class mat3 {
  constructor() {
    this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1]; // triangular matrix
  }

  multiply(matrix) {
    const a = this.elements;
    const b = matrix.elements;
    const result = new mat3();

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let sum = 0;
        for (let k = 0; k < 3; k++) {
          sum += a[i * 3 + k] * b[k * 3 + j];
        }
        result.elements[i * 3 + j] = sum;
      }
    }

    return result;
  }

  translate(x, y) {
    return this.multiply(new mat3().setTranslation(x, y));
  }

  rotate(angle) {
    return this.multiply(new mat3().setRotation(angle));
  }

  scale(x, y) {
    return this.multiply(new mat3().setScale(x, y));
  }

  setTranslation(x, y) {
    this.elements[2] = x;
    this.elements[5] = y;
    return this;
  }

  setRotation(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    this.elements[0] = c;
    this.elements[1] = -s;
    this.elements[3] = s;
    this.elements[4] = c;
    return this;
  }

  setScale(x, y) {
    this.elements[0] = x;
    this.elements[4] = y;
    return this;
  }

  transformPoint(x, y) {
    const e = this.elements;
    return {
      x: x * e[0] + y * e[1] + e[2],
      y: x * e[3] + y * e[4] + e[5],
    };
  }
}

let flock = [];
function init() {
  flock = [];
  const size = Number.parseInt(document.getElementById("size").value);

  for (let i = 0; i < size; i++) {
    flock.push(new boid());
  }
}

function animate() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let boid of flock) {
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show();
  }

  requestAnimationFrame(animate);
}

function update(id) {
  const val = document.getElementById(id).value;

  switch (id) {
    case "size":
      init();
      break;
    case "maxSpeed":
      for (let boid of flock) {
        boid.maxSpeed = Number.parseFloat(val);
      }
      break;
    case "maxForce":
      for (let boid of flock) {
        boid.maxForce = Number.parseFloat(val);
      }
      break;
  }

  updateLabel(id, val);
}

function updateLabel(id, val) {
  if (typeof val == "undefined") val = document.getElementById(id).value;

  document.getElementById(id + "Label").innerHTML = `<pre>${val.padStart(
    4,
    " "
  )}</pre>`;
}

updateLabel("size");
updateLabel("maxSpeed");
updateLabel("maxForce");

init();
animate();
