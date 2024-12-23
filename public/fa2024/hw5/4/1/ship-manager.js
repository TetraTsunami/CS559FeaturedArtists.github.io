// manages a group of ships
let ShipManager = class ShipManager {
    constructor(canvas, context, camera, sliderNumShips, selectShipColor) {
        this.sliderNumShips = sliderNumShips;
        this.ships = [];
        for(let i = 0; i < 6; i++) {
            this.ships.push(new Ship(canvas, context, camera, selectShipColor));
        }
    }

    // update the inner times of each ship being managed
    updateTimes(dt) {
        this.ships.forEach(ship => ship.updateTime(dt));
    }

    // draw all ships
    drawShips() {
        for(let i = 0; i < this.sliderNumShips.value; i++) {
            this.ships[i].drawShip();
        }
    }

}