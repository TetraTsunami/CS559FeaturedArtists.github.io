const setup = () => {
  const canvas = document.getElementById("canvas1");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const resetBtn = document.getElementById("resetBtn");
  // canvas.width = window.innerWidth;
  // canvas.height = window.innerWidth / 2.312;
  canvas.width = 1492;
  canvas.height = 645;
  const context = canvas.getContext("2d");
  console.log("Setup ?");
  console.log(canvas.width);
  console.log(canvas.height);

  let carsRunning = true;

  const trackImg = new Image();
  trackImg.src = "Circuit_de_Barcelona-Catalunya.jpg";

  const car1Img = new Image();
  car1Img.src = "car1.png";

  const car2Img = new Image();
  car2Img.src = "car2.png";

  const car3Img = new Image();
  car3Img.src = "car3.png";

  const cars = [
    { tParam: 0, speed: 0.0005, img: car1Img },
    { tParam: 0, speed: 0.002, img: car2Img },
    { tParam: 0, speed: 0.001, img: car3Img },
  ];

  let imgsReady = 0;
  const totalImgs = 4;

  const checkImgsReady = () => {
    imgsReady++;
    if (imgsReady === totalImgs) draw();
  };

  trackImg.onload = checkImgsReady;
  car1Img.onload = checkImgsReady;
  car2Img.onload = checkImgsReady;
  car3Img.onload = checkImgsReady;

  const hermite = (t) => {
    return [
      2 * t * t * t - 3 * t * t + 1,
      t * t * t - 2 * t * t + t,
      -2 * t * t * t + 3 * t * t,
      t * t * t - t * t,
    ];
  };

  const draw = () => {
    const moveToTx = (loc, tX) => {
      let res = vec2.create();
      vec2.transformMat3(res, loc, tX);
      context.moveTo(res[0], res[1]);
    };

    const lineToTx = (loc, tX) => {
      let res = vec2.create();
      vec2.transformMat3(res, loc, tX);
      context.lineTo(res[0], res[1]);
    };

    const drawTx = (img, x, y, sx, sy, tX) => {
      let res = vec2.create();
      vec2.transformMat3(res, [x, y], tX);
      context.drawImage(img, res[0], res[1], sx * tX[0], sy * tX[4]);
    };

    const drawTrackImg = (tX) => {
      if (trackImg.complete) {
        drawTx(trackImg, 0, 0, canvas.width, canvas.height, tX);
      }
    };

    const drawCarImg = (tX, oneCar) => {
      if (oneCar.img.complete) {
        drawTx(oneCar.img, 0, 0, 2, 1.12, tX);
      }
    };

    const cubic = (basis, p, t) => {
      const b = basis(t);
      const result = vec2.create();
      vec2.scale(result, p[0], b[0]);
      vec2.scaleAndAdd(result, result, p[1], b[1]);
      vec2.scaleAndAdd(result, result, p[2], b[2]);
      vec2.scaleAndAdd(result, result, p[3], b[3]);
      return result;
    };

    const createCurvePoints = () => {
      const curvePoints = [];
      for (let i = 0; i < points.length - 1; i++) {
        curvePoints.push([
          points[i],
          tangents[i],
          points[i + 1],
          tangents[i + 1],
        ]);
      }
      return curvePoints;
    };

    const curvePoints = createCurvePoints();

    const drawTrajectory = (t_begin, t_end, intervals, c, tX, color) => {
      context.strokeStyle = color;
      context.beginPath();
      moveToTx(c(t_begin), tX);
      for (let i = 1; i <= intervals; i++) {
        let t =
          ((intervals - 1) / intervals) * t_begin + (i / intervals) * t_end;
        lineToTx(c(t), tX);
      }
      context.stroke();
    };

    const cComp = (t) => {
      const numCurves = curvePoints.length;
      const segLength = 1 / numCurves;
      for (let i = 0; i < numCurves; i++) {
        const tMin = i * segLength;
        const tMax = (i + 1) * segLength;

        if (t >= tMin && t < tMax) {
          const normT = (t - tMin) / segLength;
          return cubic(hermite, curvePoints[i], normT);
        }
      }
      return cubic(hermite, curvePoints[numCurves - 1], 1);
    };

    drawTrackImg(mat3.create());
    const tTrackToCanvas = mat3.create();
    mat3.fromTranslation(tTrackToCanvas, [72, 550]);
    mat3.scale(tTrackToCanvas, tTrackToCanvas, [28.5, -28.5]);
    for (let i = 0; i < curvePoints.length; i++) {
      drawTrajectory(
        0,
        1,
        100,
        (t) => cubic(hermite, curvePoints[i], t),
        tTrackToCanvas,
        "green",
      );
    }

    cars.forEach((oneCar) => {
      const tCarToTrack = mat3.create();
      mat3.fromTranslation(tCarToTrack, cComp(oneCar.tParam));
      const tCarToCanvas = mat3.create();
      mat3.multiply(tCarToCanvas, tTrackToCanvas, tCarToTrack);
      drawCarImg(tCarToCanvas, oneCar);

      if (carsRunning) {
        oneCar.tParam += oneCar.speed;
        if (oneCar.tParam > 1) {
          oneCar.tParam = 0;
        }
      }
    });
    if (carsRunning) {
      window.requestAnimationFrame(draw);
    }
  };

  startBtn.addEventListener("click", () => {
    if (!carsRunning) {
      carsRunning = true;
      // window.requestAnimationFrame(draw);
      draw();
    }
  });

  stopBtn.addEventListener("click", () => {
    carsRunning = false;
  });

  resetBtn.addEventListener("click", () => {
    carsRunning = false;
    cars.forEach((oneCar) => {
      oneCar.tParam = 0;
      oneCar.speed = (Math.random() + 1) * 5 * 0.0005;
    });
    draw();
  });
};

window.onload = setup;
