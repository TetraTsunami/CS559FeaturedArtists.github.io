// Loads neccesary program elements.
const canvas = document.getElementById('myCanvas');
const canvasContainer = document.getElementById('canvasContainer');
const slider = document.getElementById('heightSlider');
const button = document.getElementById('toggleImages');
const context = canvas.getContext('2d');

// Loads images.
const cowImage = loadImage('https://upload.wikimedia.org/wikipedia/commons/b/b4/Cow_from_above.png'),
    horseImage = loadImage('https://upload.wikimedia.org/wikipedia/commons/1/14/Horse_from_above.png'),
    hatImage = loadImage('https://png.pngtree.com/png-vector/20230922/ourmid/pngtree-cowboy-hat-top-view-country-png-image_10094935.png'),
    skinImage = loadImage('https://www.textures4photoshop.com/tex/thumbs/seamless-face-skin-texture-thumb26.jpg'),
    backgroundImage = "url('https://media.istockphoto.com/id/1160552245/photo/aerial-green-grass-texture-background-top-view-from-drone.jpg?s=612x612&w=0&k=20&c=3WtPfIQZm5i_P5GrJdU2t762UD2Mat8LDKoyrpq57PY=')";

// Helper function to streamline loading images.
function loadImage(source) {
    var image = new Image();
    image.src = source;
    return image;
}

// Holds stampede animation. All actors under heirarchy of lead cow. Tails relative to cows. 
// Horse with tail, and two-part lasso relative to cowboy, which is relative to lead cow.
function draw() {
    var useImages = false;
    var targetHeight = 300;
    var leadCowY = targetHeight,
        secondCowY = targetHeight,
        thirdCowY = targetHeight,
        cowboyY = targetHeight;
    var leadCowX = 0;
    var lassoAngle = 0,
        tailAngle = 0;

    // Draws the cowboys's horse, body, hat, and lasso.
    function drawCowboy(x, y) {
      	// All coordinates calculated relative to cowboy coordinates, which is itself relative to lead cow.
        const COWBOY_SIZE = 27,
            LASSO_LENGTH = 50,
            LASSO_OFFSET = 20;

        // Checking whether to wrap around. Checking here as cowboy's horse last drawing to pass border.
        if (x - 150 > canvas.width) {
            leadCowX = 0;
        }

        // Draws the cowboys horse first.
        if (useImages) {
            customDrawImage(horseImage, x, y, 300, 200, (145 * Math.PI) / 180);
        } else {
            // Draws the horse's body
            context.save();
            context.translate(x - 30, y);
            context.fillStyle = 'brown';
            context.beginPath();
            context.ellipse(0, 0, 60, 20, 0, 0, Math.PI * 2);
            context.fill();

            // Draws the horse's head
            context.translate(65, 0);
            context.beginPath();
            context.ellipse(0, 0, 40, 15, 0, 0, Math.PI * 2);
            context.arc(0, 0, 10, 0, Math.PI * 2);
            context.fill();
            context.restore();

            // Draws the horse's tail
            drawTail(x - 90, y, tailAngle - ((135 * Math.PI) / 180));
        }

        context.save();
        context.translate(x, y + 3);

        // Draws the cowboy
        if (useImages) {
            customDrawImage(skinImage, 0, 0, COWBOY_SIZE, COWBOY_SIZE);
            customDrawImage(hatImage, 0, 0, COWBOY_SIZE, COWBOY_SIZE, Math.PI);
        } else {
            context.fillStyle = '#ffdbac';
            context.fillRect(-COWBOY_SIZE / 2, -COWBOY_SIZE / 2, COWBOY_SIZE, COWBOY_SIZE);
        }

        // Draws the lasso line. This is relative to the cowboy.
        context.lineWidth = 2;
        context.strokeStyle = '#b6733f';
        context.rotate(lassoAngle);
        context.beginPath();
        context.moveTo(0, -COWBOY_SIZE / 2 - 2);
        context.lineTo(LASSO_LENGTH, -COWBOY_SIZE / 2 - LASSO_OFFSET);
        context.stroke();

        // Draws the lasso arc. This is relative to the main lasso.
        context.beginPath();
        context.arc(
            LASSO_LENGTH - 10 * Math.cos(-lassoAngle),
            -COWBOY_SIZE / 2 - LASSO_OFFSET + 10 * Math.sin(-lassoAngle),
            10, 0, Math.PI * 2
        );
        context.stroke();

        // Draws the lasso line outline, a lslightly larger border. 
        context.lineWidth = 1;
        context.strokeStyle = '#9e4913';
        context.beginPath();
        context.moveTo(0, -COWBOY_SIZE / 2);
        context.lineTo(LASSO_LENGTH, -COWBOY_SIZE / 2 - LASSO_OFFSET);
        context.stroke();

        // Draws the lasso arc outline, a lslightly larger border.
        context.beginPath();
        context.arc(
            LASSO_LENGTH - 10 * Math.cos(-lassoAngle),
            -COWBOY_SIZE / 2 - LASSO_OFFSET + 10 * Math.sin(-lassoAngle),
            11, 0, Math.PI * 2
        );
        context.stroke();
        context.restore();
    }

    // Draws the stampede. The followers are relative to the lead cow.
    function drawCows() {
        const COW_SPACING = 100;

        context.clearRect(0, 0, canvas.width, canvas.height);
        drawCow(leadCowX, leadCowY);
        drawCow(leadCowX - COW_SPACING, secondCowY);
        drawCow(leadCowX - 2 * COW_SPACING, thirdCowY);

        // Helper function to draw a cow.
        function drawCow(x, y) {
            if (useImages) {
                customDrawImage(cowImage, x, y, 150, 100, Math.PI / 2);
            } else {
                // Draw the cow's body
                context.save();
                context.translate(x, y);
                context.fillStyle = 'white';
                context.beginPath();
                context.ellipse(0, 0, 30, 15, 0, 0, Math.PI * 2);
                context.fill();

                // Draw the cow's head
                context.translate(35, 0);
                context.beginPath();
                context.arc(0, 0, 10, 0, Math.PI * 2);
                context.fill();
                context.restore();

                // Draw the cow's tail & spots
                drawTail(x - 30, y, tailAngle - ((135 * Math.PI) / 180));
                drawCowSpots(x, y);
            }
        }

        // Helper function to draw spots on cow
        function drawCowSpots(x, y) {
            // Draws body spots
            context.fillStyle = 'black';
            context.save();
            context.translate(x, y);
            drawSpots(
                [
                    [-15, -5, 10],
                    [15, -10, 12],
                    [-5, 5, 8]
                ],
                () => context.ellipse(0, 0, 30, 15, 0, 0, Math.PI * 2)
            );
            context.restore();

            // Draws head spot
            context.save();
            context.translate(x + 35, y);
            drawSpots(
                [
                    [0, 5, 10]
                ],
                () => context.arc(0, 0, 10, 0, Math.PI * 2)
            );
            context.restore();
        }

        // Helper function to draw spots
        function drawSpots(spotArray, clipPath) {
            // Clipping
            context.save();
            context.beginPath();
            clipPath();
            context.clip();

            // Draw spots using x, y, radius
            spotArray.forEach(spot => {
                context.beginPath();
                context.arc(spot[0], spot[1], spot[2], 0, Math.PI * 2);
                context.fill();
            });
            context.restore();
        }

    }

    // Helper function to draw tails, relative to body of animal given.
    function drawTail(x, y, angle) {
        const TAIL_LENGTH = 10,
            TAIL_WIDTH = 2;

        context.save();
        context.translate(x, y);
        context.rotate(angle);
        context.lineWidth = TAIL_WIDTH;
        context.strokeStyle = 'black';
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(TAIL_LENGTH, -10);
        context.stroke();
        context.restore();
    }

    // Helper function to streamline drawing images
    function customDrawImage(img, x, y, width, height, rotation = 0) {
        context.save();
        context.translate(x, y);
        context.rotate(rotation);
        context.drawImage(img, -width / 2, -height / 2, width, height);
        context.restore();
    }

    // Updates positions and draws everything
    function update() {
        const COWBOY_X_OFFSET = 400,
            VERTICAL_FOLLOW_DELAY = 0.03,
            TAIL_SWING_SPEED = 0.05,
            TAIL_SWING_AMPLITUDE = Math.PI / 4;

        // Updates movement
        leadCowX += 2;
        lassoAngle -= 0.02;
        tailAngle = TAIL_SWING_AMPLITUDE * Math.sin(TAIL_SWING_SPEED * leadCowX);

        // Adjusts lead cow's vertical position using ternary operator
        leadCowY += (leadCowY < targetHeight ? 1 : -1);

        // All subsequents objects are relative to the lead cow.
        secondCowY += (leadCowY - secondCowY) * VERTICAL_FOLLOW_DELAY;
        thirdCowY += (secondCowY - thirdCowY) * VERTICAL_FOLLOW_DELAY;
        cowboyY += (thirdCowY - cowboyY) * VERTICAL_FOLLOW_DELAY;

        // Draws all objects
        drawCows();
        drawCowboy(leadCowX - COWBOY_X_OFFSET, cowboyY);

        // Calls the next update, to keep the cycle going.
        requestAnimationFrame(update);
    }

    // Starts the animation
    requestAnimationFrame(update);

    // Update the target height based on slider input
    slider.addEventListener("input", (event) => {
        targetHeight = slider.value
    });
    button.addEventListener("click", (event) => {
        useImages = !useImages
        if (useImages) {
            canvasContainer.style.backgroundImage = backgroundImage;
        } else {
            canvasContainer.style.backgroundImage = '';
        }
    });
}

draw();