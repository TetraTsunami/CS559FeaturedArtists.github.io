// sets things up and runs the main animation loop
class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');

        /* Get inputs from html doc */
        this.selectViewMode = document.getElementById('viewMode');
        this.sliderCameraDistance = document.getElementById('cameraDistance');
        this.sliderNumShips = document.getElementById('shipCount');
        this.selectShipColor = document.getElementById('shipColor');
        this.sliderShipSpeed = document.getElementById('shipSpeed');
        this.sliderCameraSpeed = document.getElementById('cameraSpeed');
        this.checkboxCameraMovement = document.getElementById('cameraMovement');
        this.checkboxShipMovement = document.getElementById('shipMovement');

        /* set default values for inputs */
        this.selectViewMode.value = 'perspective';
        this.sliderCameraDistance.value = 200;
        this.sliderNumShips.value = 5;
        this.selectShipColor.value = 'orange';
        this.sliderShipSpeed.value = 0.005;
        this.sliderCameraSpeed.value = 0.005;
        this.checkboxCameraMovement.checked = true;
        this.checkboxShipMovement.checked = true;

        /* create objects used in this main class */
        this.camera = new Camera(this.sliderCameraDistance, this.selectViewMode);
        this.backgroundManager = new BackgroundManager(this.canvas, this.context, this.camera);
        this.shipManager = new ShipManager(this.canvas, this.context, this.camera, this.sliderNumShips, this.selectShipColor);
    }

    draw() {
        // de facto method to clear canvas
        this.canvas.width = this.canvas.width;
        
        // draw the background
        this.backgroundManager.drawBackground();
        this.backgroundManager.drawAxes();

        // draw the ships and move them if checked
        this.shipManager.drawShips();
        if (this.checkboxShipMovement.checked)
            this.shipManager.updateTimes(Number(this.sliderShipSpeed.value));

        // move the camera
        if (this.checkboxCameraMovement.checked)
            this.camera.updateTime(Number(this.sliderCameraSpeed.value));

        // create animation loop
        window.requestAnimationFrame(() => this.draw());
    }

    run() {
        this.draw(); // start the animation loop
    }
}

window.onload = () => {
    const app = new App();
    app.run();
}