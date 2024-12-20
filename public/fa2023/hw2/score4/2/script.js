class Complex {
  /**
   * Complex number
   * @param {Number} real
   * @param {Number} imagine
   */
  constructor(real, imagine) {
    this.r = real;
    this.i = imagine;
  }
  get x() {
    return this.r;
  }
  get y() {
    return this.i;
  }
  static fromCoord(x, y) {
    return new Complex(x, y);
  }
  /**
   * euler formula: \(e^{i\theta} = \cos\theta + i\sin\theta\)
   * @param {number} theta
   * @returns {Complex}
   */
  static euler(theta) {
    return new Complex(Math.cos(theta), Math.sin(theta));
  }
  /**
   * Complex multiplication
   * @param {Complex} that
   * @returns {Complex}
   */
  multiply(that) {
    return new Complex(
        this.r * that.r - this.i * that.i, this.r * that.i + that.r * this.i);
  }
  /**
   * Complex addtion
   * @param {Complex} that
   * @returns {Complex}
   */
  plus(that) {
    return new Complex(this.r + that.r, this.i + that.i);
  }
  /**
   * Complex subtraction
   * @param {Complex} that
   * @returns {Complex}
   */
  minus(that) {
    return new Complex(this.r - that.r, this.i - that.i);
  }
  /**
   *
   * @param {Number} factor
   * @returns {Complex}
   */
  scale(factor) {
    return new Complex(this.r * factor, this.i * factor);
  }
  /**
   * The L2 norm
   * @returns {Number}
   */
  norm2() {
    return Math.sqrt(this.i * this.i + this.r * this.r);
  }
  sq2() {
    return this.i * this.i + this.r * this.r;
  }
}

class PictureData {
  /**
   * Class to store the data.
   */
  constructor() {
    this.raw_data = new Array;
    this.transformed = new Array;
    this.start_time = undefined;
    this.need_clear = false;
  }
  load_data(data) {
    this.raw_data = data.map(b => b.map(e => new Complex(e.r, e.i)));
  }
  static create() {
    let data = new PictureData();
    data.fourierTransform();
    return data;
  }
  /**
   * DFT
   * \[kw = \sum_{j = 0}^{N - 1} p[j]e^{-ijk\frac{2\pi}{N}}\]
   */
  fourierTransform() {
    let data_flatten =
        this.raw_data.reduce((base, val) => base.concat(val), []);
    let n = data_flatten.length;
    console.log(n);
    this.transformed = new Array(n);
    this.transformed[0] = new Complex(0, 0);
    // Calculate the average value
    for (let i = 0; i < n; i++) {
      this.transformed[0] = this.transformed[0].plus(data_flatten[i]);
    }
    for (let i = 1; i < n; i++) {
      let k = undefined;
      if (i % 2 === 0) {
        k = n - i / 2;
      } else {
        k = (i + 1) / 2;
      }
      this.transformed[i] = new Complex(0, 0);
      for (let j = 0; j < n; j++) {
        this.transformed[i] = this.transformed[i].plus(
            Complex.euler(-j * k * 2 * Math.PI / n).multiply(data_flatten[j]));
      }
    }
    for (let i = 0; i < n; i++) {
      this.transformed[i] = this.transformed[i].scale(1 / n);
    }
    console.log('transform finished');
    this.start_time = 0;
    this.need_clear = true;
  }
  redo() {
    this.raw_data.pop();
    this.fourierTransform();
  }
}

class PictureCanvas {
  /**
   * Class for rendering.
   * @param {HTMLCanvasElement} drawing_panel
   * @param {HTMLCanvasElement} fourier_drawing
   * @param {HTMLCanvasElement} fourier_showing
   */
  constructor(drawing_panel, fourier_drawing, fourier_showing) {
    this.drawing_panel = drawing_panel;
    this.drawing_panel_context = drawing_panel.getContext('2d');
    this.fourier_drawing = fourier_drawing;
    this.fourier_drawing_context = fourier_drawing.getContext('2d');
    this.fourier_showing = fourier_showing;
    this.fourier_showing_context = fourier_showing.getContext('2d');
    this.fourier_showing_context.strokeStyle = '#008080';
    this.fourier_drawing_context.strokeStyle = '#ff7f7f';
    this.order = 128;
    this.speed = 0.02;
    this.circled = true;
    this.trailing = false;
  }
  /**
   * Update when use draw
   * @param {PictureData} picture_data
   */
  updateDrawingPanel(picture_data) {
    const ctx = this.drawing_panel_context;
    ctx.clearRect(0, 0, 500, 500);
    console.log('initial:', picture_data.raw_data);
    if (picture_data.raw_data.length === 0) return;
    console.log('first draw');
    ctx.save();
    ctx.translate(250, 250);
    let last_point = picture_data.raw_data.slice(-1)[0].slice(-1)[0];
    console.log(last_point);
    ctx.beginPath();
    for (let i = 0; i < picture_data.raw_data.length; i++) {
      const batch = picture_data.raw_data[i];
      ctx.moveTo(last_point.x, last_point.y);
      ctx.lineTo(batch[0].x, batch[0].y);
      ctx.strokeStyle = 'grey';
      ctx.stroke();
      ctx.beginPath();
      console.log('batch size', batch.length);
      for (let j = 0; j < batch.length; j++) {
        ctx.lineTo(batch[j].x, batch[j].y);
      }
      ctx.strokeStyle = 'black';
      ctx.stroke();
      ctx.beginPath();
      last_point = batch.slice(-1)[0];
    }
    ctx.beginPath();
    ctx.lineTo(picture_data.raw_data[0][0].x, picture_data.raw_data[0][0].y);
    ctx.strokeStyle = 'grey';
    ctx.stroke();

    let data = [];
    for (let batch of picture_data.raw_data)
      for (let point of batch) {
        data.push([point.x, point.y]);
      }
    ctx.restore();
    // console.log(data);
  }
  /**
   *
   * @param {HTMLCanvasElement} drawing_panel
   * @param {HTMLCanvasElement} fourier_drawing
   * @param {HTMLCanvasElement} fourier_showing
   * @returns {PictureCanvas}
   */
  static create(drawing_panel, fourier_drawing, fourier_showing) {
    return new PictureCanvas(drawing_panel, fourier_drawing, fourier_showing);
  }
  /**
   *
   * @param {PictureData} picture_data
   * @param {Number} time
   */
  updateFourierCanvas(picture_data, time) {
    // Initialization

    // console.log('start drawing');
    if (picture_data.start_time === undefined) picture_data.start_time = time;
    const showing_ctx = this.fourier_showing_context;
    const drawing_ctx = this.fourier_drawing_context;
    const n = picture_data.transformed.length;
    const order = Math.min(this.order, n - 1);
    this.speed = n / 5000;
    // Fourier circles
    let passed_time = time - picture_data.start_time;
    showing_ctx.clearRect(0, 0, 500, 500);
    if (picture_data.need_clear) {
      picture_data.need_clear = false;
      this.last_final_point = undefined;
      drawing_ctx.clearRect(0, 0, 500, 500);
    }
    if (picture_data.raw_data.length === 0 ||
        picture_data.transformed.length === 0)
      return;
    // Start drawing
    showing_ctx.save();
    showing_ctx.translate(250, 250);
    showing_ctx.save();
    // At the center of the picture.
    let start_point = picture_data.transformed[0];
    showing_ctx.translate(start_point.x, start_point.y);
    let final_point = new Complex(start_point.x, start_point.y);
    for (let i = 1; i <= order; i++) {
      let point = picture_data.transformed[i];
      let delta_rad =
          2 * Math.PI / n * Math.floor((i + 1) / 2) * passed_time * this.speed;
      if (i % 2 === 0) delta_rad = -delta_rad;
      let radius = point.norm2();
      // start drawing
      showing_ctx.save();
      showing_ctx.rotate(delta_rad);
      showing_ctx.beginPath();
      showing_ctx.moveTo(0, 0);
      showing_ctx.lineTo(Math.floor(point.x), Math.floor(point.y));
      showing_ctx.stroke();
      if (this.circled) {
        showing_ctx.beginPath();
        showing_ctx.arc(
            Math.floor(point.x), Math.floor(point.y), radius, 0, 2 * Math.PI);
        showing_ctx.stroke();
      }

      showing_ctx.translate(point.x, point.y);
      // restore rotation
      showing_ctx.rotate(-delta_rad);
      // final point

      final_point = final_point.plus(point.multiply(Complex.euler(delta_rad)));
    }

    for (let i = 0; i <= order; i++) showing_ctx.restore();
    showing_ctx.restore();

    // Update fourier draw
    if (this.trailing) {
      drawing_ctx.fillStyle = 'rgba(255,255,255, 0.01)';
      drawing_ctx.fillRect(0, 0, 500, 500);
    }
    drawing_ctx.beginPath();
    if (this.last_final_point !== undefined)
      drawing_ctx.moveTo(
          this.last_final_point.x + 250, this.last_final_point.y + 250);
    drawing_ctx.lineTo(final_point.x + 250, final_point.y + 250);
    drawing_ctx.stroke();
    this.last_final_point = final_point;
  }
}


function main() {
  // initialize element
  let drawing_pad = document.getElementById('drawing-pad');
  let fourier_drawing = document.getElementById('fourier-drawing');
  let fourier_showing = document.getElementById('fourier-showing');
  let slider = document.getElementById('slider');
  let redo = document.getElementById('redo-button');
  let circles = document.getElementById('check-circle');
  let trailing = document.getElementById('check-trailing');
  let load_exmple = document.getElementById('load-example');
  // Initialize data
  let picture = PictureData.create();
  let picture_canvas =
      PictureCanvas.create(drawing_pad, fourier_drawing, fourier_showing);
  // Event listeners
  drawing_pad.addEventListener('mousedown', (e) => draw(e, picture));
  drawing_pad.addEventListener('mouseup', (_) => picture.fourierTransform());
  redo.addEventListener('click', () => {
    picture.redo();
    picture_canvas.updateDrawingPanel(picture);
  });
  circles.addEventListener(
      'input', (e) => picture_canvas.circled = e.target.checked);
  trailing.addEventListener(
      'input', (e) => picture_canvas.trailing = e.target.checked);
  load_exmple.addEventListener('click', () => {
    picture.load_data(initial_data);
    picture_canvas.last_final_point = undefined;
    picture.fourierTransform();
    picture_canvas.updateDrawingPanel(picture);
  });
  slider.value = picture_canvas.order;

  slider.addEventListener('input', (e) => {
    picture_canvas.order = Number(e.target.value);
    picture.need_clear = true;
  });
  /**
   *
   * @param {MouseEvent} event mousedown event
   * @param {PictureData} picture_data
   * @returns
   */
  function draw(event, picture_data) {
    // If is not the main button
    if (event.button != 0) return;
    const bounding = drawing_pad.getBoundingClientRect();
    let index = picture_data.raw_data.length;
    let move = (event) => {
      if (event.buttons == 0) {
        // mouse up, remove event
        picture_canvas.drawing_panel.removeEventListener('mousemove', move);
        console.log(picture_data.raw_data);
      } else {
        let x = Math.floor(event.clientX - bounding.left - 250);
        let y = Math.floor(event.clientY - bounding.top - 250);
        if (picture_data.raw_data[index] === undefined)
          picture_data.raw_data.push([]);
        picture_data.raw_data[index].push(Complex.fromCoord(x, y))
        picture_canvas.updateDrawingPanel(picture_data);
      }
    };
    picture_canvas.drawing_panel.addEventListener('mousemove', move);
  }

  function frame(time) {
    picture_canvas.updateFourierCanvas(picture, time)
    requestAnimationFrame(frame);
  }
  // Start
  requestAnimationFrame(frame);
  picture_canvas.updateDrawingPanel(picture);
}
window.onload = main;