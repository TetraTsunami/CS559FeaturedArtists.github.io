//https://stackoverflow.com/questions/4416505/how-to-take-keyboard-input-in-javascript

// Manage keyboard input
function KouchInputManager(element) {

    // https://stackoverflow.com/a/30082847
    let BB = element.getBoundingClientRect();

    // Dictionary of keys currently pressed down
    this.keys = {};
    this.keydownCallback = undefined;

    // dragCallback(initialPosition, currentPosition, right, start, done)
    this.dragCallback = undefined;

    // mouseDownCallback(position, right)
    this.mouseDownCallback = undefined;

    // scrollCallback(deltaY)
    this.scrollCallback = undefined;

    this.currentMousePosition = glMatrix.vec2.create();

    element.addEventListener("keydown", (e) => {
        if(e.defaultPrevented)
            return;

        if(this.keydownCallback) {
            this.keydownCallback(e);
        }

        this.keys[e.key] = true;

        e.preventDefault();
    });

    element.addEventListener("keyup", (e) => {
        if(e.defaultPrevented)
            return;

        delete this.keys[e.key];

        e.preventDefault();
    });

    let dragging = false;
    let rightClickDragging = false;
    let initialDragPosition;
    let currentDragPosition;

    // Prevent right-click from opening the context menu
    element.oncontextmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    element.addEventListener("mousedown", (e) => {
        if(e.defaultPrevented)
            return;

        let rightClick = e.button == 2;

        if(this.mouseDownCallback) {
            this.mouseDownCallback(
                glMatrix.vec2.fromValues(e.clientX - BB.left, e.clientY - BB.top),
                rightClick
            )
        }

        // Handle dragging
        if(dragging == false) {
            dragging = true;
            initialDragPosition = glMatrix.vec2.fromValues(e.clientX - BB.left, e.clientY - BB.top);
            currentDragPosition = glMatrix.vec2.clone(initialDragPosition);
            rightClickDragging = rightClick;
            if(this.dragCallback) {
                this.dragCallback(
                    initialDragPosition,
                    currentDragPosition,
                    rightClickDragging,
                    true,
                    false
                )
            }
        }

        glMatrix.vec2.set(this.currentMousePosition, e.clientX - BB.left, e.clientY - BB.top);

        e.preventDefault();
    })

    element.addEventListener("mousemove", (e) => {
        if(e.defaultPrevented)
            return;

        if(dragging == true) {
            glMatrix.vec2.set(currentDragPosition, e.clientX - BB.left, e.clientY - BB.top)
            if(this.dragCallback) {
                this.dragCallback(
                    initialDragPosition,
                    currentDragPosition,
                    rightClickDragging,
                    false,
                    false
                )
            }
        }

        glMatrix.vec2.set(this.currentMousePosition, e.clientX - BB.left, e.clientY - BB.top);

        e.preventDefault()
    });

    element.addEventListener("mouseup", (e) => {
        if(e.defaultPrevented)
            return;

        if(dragging == true) {
            dragging = false;
            glMatrix.vec2.set(currentDragPosition, e.clientX - BB.left, e.clientY - BB.top)
            if(this.dragCallback) {
                this.dragCallback(
                    initialDragPosition,
                    currentDragPosition,
                    rightClickDragging,
                    false,
                    true
                )
            }
        }

        glMatrix.vec2.set(this.currentMousePosition, e.clientX - BB.left, e.clientY - BB.top);

        e.preventDefault();
    })

    element.addEventListener("wheel", (e) => {
        if(e.defaultPrevented)
            return;

        if(this.scrollCallback) {
            this.scrollCallback(e.wheelDeltaY, this.currentMousePosition)
        }

        e.preventDefault()
    })

}
