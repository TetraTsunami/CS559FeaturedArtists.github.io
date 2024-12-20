// Basic engine for 3D-ish canvases

/**
    Animated canvas with hierarchy of objects.

    Once start() is called, objects are drawn and updated about every 10ms.

    Objects can have the following functions and properties:
        draw(ktx) {}      
            Called to draw an object. ktx is the kouchContext. Before draw is called, the context is translated,
            rotated, and scaled according to its own properties and those of everything above it in the heierarchy.
            Because of this, implementations of draw should NOT use obj.pos, obj.angle, and obj.scale (as these are
            already accounted for)
        update(dt) {}
            Called to update an object, just before it is drawed. dt is the difference in time (in seconds) since the last
            update. As such, all changes made in update should be scaled by dt.
        reset {}
            Called when the canvas's reset function is called. Reset is called automatically when an object is added.
        
        pos
            A glMatrix.vec3 defining the location of the object
        angle
            A number defining the z rotation of the object
        scale
            A glMatrix.vec3 defining the scale of the object (can scale in x and y direction)
    
    Objects can be added to the base of the canvas with addObjectTo(obj, null), and can be added as a child of a parent with
    addObjectTo(obj, parent). Similar functions exist for removing objects from the base, or from a parent.
 */

/**
 * @param {string} canvasID ID of canvas element
 * @param {boolean} fs Whether the canvas should be made fullscreen
 */
function KouchEngine(canvasID, fs, camera) {
    this.fullscreen = fs;
    this.camera = camera;
    
    this.canvasElement = document.getElementById(canvasID);
    this.canvasCtx = this.canvasElement.getContext('2d');
    this.ktx = new KouchContext(this.canvasCtx);
    this.backgroundColor = "white"

    let updateInterval;

    // Array of objects
    let baseObject = {
        z: 0
    }

    let recursivelyUpdateObject = (obj, dt) => {
        // Update parent first
        if(obj.hasOwnProperty("update")) {
            obj.update(dt)
        }

        // Recursively update children
        if(obj.hasOwnProperty("children")) {
            obj.children.forEach(child => {
                recursivelyUpdateObject(child, dt);
            });
        }
    }

    // Update each object
    this.update = (dt) => {
        // Update objects
        recursivelyUpdateObject(baseObject, dt);

        // Update camera
        if(this.camera != null && this.camera.hasOwnProperty("update")) {
            this.camera.update(dt)
        }
    }

    let recursivelyDrawObject = (obj, ktx) => {
        // Alter coordinate system
        if(!(obj.hasOwnProperty("handlesOwnTransformations") && obj.handlesOwnTransformations)) {
            ktx.pushCurrentTransform()

            if(obj.hasOwnProperty("pos"))
                ktx.translate(obj.pos)
            if(obj.hasOwnProperty("angle"))
                ktx.rotate(obj.angle)
            if(obj.hasOwnProperty("scale"))
                ktx.scale(obj.scale)
        }

        // Recursively draw children first
        if(obj.hasOwnProperty("children")) {
            obj.children.forEach(child => {
                recursivelyDrawObject(child, ktx);
            });
        }

        // Draw parent
        if(obj.hasOwnProperty("draw")) {
            obj.draw(ktx)
        }
        
        if(!(obj.hasOwnProperty("handlesOwnTransformations") && obj.handlesOwnTransformations)) {
            // Restore coordinate system
            ktx.popTransformStack()
        }
    }

    // Draw each object
    this.draw = (ktx) => {
        // Refresh canvas, resizing to meet full window size when requested
        if(this.fullscreen) {
            this.canvasElement.width = window.innerWidth;
            this.canvasElement.height = window.innerHeight;
        } else {
            this.canvasElement.width = this.canvasElement.width;
            this.canvasElement.height = this.canvasElement.height;
        }

        let cWidth = this.canvasElement.width;
        let cHeight = this.canvasElement.height;

        ktx.reset()

        // Draw background
        ktx.setFillStyle(this.backgroundColor)
        ktx.beginPath()
        ktx.moveTo(0, 0, 0);
        ktx.lineTo(0, this.canvasElement.height, 0);
        ktx.lineTo(this.canvasElement.width, this.canvasElement.height, 0);
        ktx.lineTo(this.canvasElement.width, 0, 0);
        ktx.fill()

        // Create camera and perspective transforms here!
        if(this.camera != null) {
            // Create orthogonal projection
            let orthoTransform = mat4.create();
            mat4.ortho(orthoTransform, -0.5, 0.5, -0.5, 0.5, 0.001, 500);

            // Create lookAt transform
            let lookAtTransform = mat4.create();
            mat4.lookAt(lookAtTransform, this.camera.pos, this.camera.target, this.camera.up);

            ktx.applyTransform(lookAtTransform);
            ktx.translate((vec3.fromValues(this.canvasElement.width/4, this.canvasElement.height/3, 0)))

            ktx.applyTransform(orthoTransform);

                        
            ktx.scale(vec3.fromValues(100/this.canvasElement.height, -100/this.canvasElement.height, 100/this.canvasElement.height))

        } else {
            ktx.translate(vec3.fromValues(300, 300, 0))
        }

        recursivelyDrawObject(baseObject, ktx);
    }

    let recursivelyResetObject = (obj) => {
        // Reset object first
        if(obj.hasOwnProperty("reset")) {
            obj.reset()
        }

        // Reset the object's children recursively
        if(obj.hasOwnProperty("children")) {
            obj.children.forEach(child => {
                recursivelyResetObject(child);
            });
        }
    }

    this.reset = (c) => {
        recursivelyResetObject(baseObject);
        this.update(0);
        this.draw(this.ktx);
    }

    // Add object to canvas (if parent == null, add to base)
    this.addObjectTo = (obj, parent) => {
        if(parent == null) {
            parent = baseObject;
        }

        if(!parent.hasOwnProperty("children")) {
            parent.children = [];
        }

        parent.children.push(obj);
        obj.parent = parent;

        if(obj.hasOwnProperty("reset")) {
            obj.reset();
        }

        // If we're not running, update and draw the object
        if(!updateInterval) {
            this.update(0);
            this.draw(this.ktx);
        }

        return true
    }

    // Remove object from canvas
    this.removeObjectFrom = (obj, parent) => {
        if(parent == null) {
            parent = baseObject;
        }

        if(!parent.hasOwnProperty("children"))
            return false

        let idx = parent.children.indexOf(obj)
        if(idx < 0)
            return false

        parent.children.splice(idx, 1)
        obj.parent = undefined

        return true
    }

    this.getbaseObjects = () => baseObject.children;
    
    this.clearChildren = (obj) => {
        obj.children = []
    }

    this.clearObjects = () => {
        this.clearChildren(baseObject)
    }

    // Get canvas size
    this.getCanvasSize = () => glMatrix.vec2.fromValues(this.canvasElement.width, this.canvasElement.height);

    // Get center point of canvas
    this.getCenterPos = () => {
        let center = this.getCanvasSize();
        return glMatrix.vec2.scale(center, center, 0.5);
    }

    this.start = () => {
        if(updateInterval) {
            console.error("Error: Can't start canvas that is already running.")
            return
        }

        let lastUpdate = Date.now()

        // Main loop
        updateInterval = setInterval(() => {
            let now = Date.now();
            let dt = (now - lastUpdate)/1000;
            lastUpdate = now;
    
            this.update(dt);
            this.draw(this.ktx);
        }, 10);
    }

    this.stop = () => {
        clearInterval(updateInterval)
    }

    // Do initial update and draw
    this.reset()
}

// // Can be added to the engine as a base object
// // which allows for zooming with the scroll wheel
// // and moving through clicking and dragging
// function ZoomAndMoveObject(kouchInputManager) {
//     this.pos = glMatrix.vec2.create()
//     this.scale = glMatrix.vec2.fromValues(1, 1)

//     // Handle dragging canvas to move around
//     let currentDragOffset = glMatrix.vec2.create()
//     let totalDragOffset = glMatrix.vec2.create()
//     kouchInputManager.dragCallback = (initialPosition, currentPosition, right, start, done) => {
//         glMatrix.vec2.sub(currentDragOffset, currentPosition, initialPosition);

//         if(done) {
//             glMatrix.vec2.add(totalDragOffset, totalDragOffset, currentDragOffset)
//             glMatrix.vec2.zero(currentDragOffset)
//         }
//     }

//     // Handle scrolling to zoom
//     const scrollSpeed = 0.0001;
//     let scrollDiff = 0;
//     kouchInputManager.scrollCallback = (deltaY, mousePosition) => {
//         scrollDiff += deltaY * scrollSpeed;
//     }

//     let scrollOffset = glMatrix.vec2.create();
//     let totalScrollOffset = glMatrix.vec2.create();

//     this.update = (dt) => {
//         glMatrix.vec2.copy(this.pos, totalDragOffset)
//         glMatrix.vec2.add(this.pos, this.pos, currentDragOffset)

//         // There's no good glMatrix way of doing this
//         // without creating another object
//         this.scale[0] += scrollDiff;
//         this.scale[1] += scrollDiff;

//         /**
//          * Zooms are essentially translating to the mouse
//          * position, scaling there, and translating back.
//          * 
//          * While I could do this by adding to a list of 
//          * coordinate space transformations, since scrolls
//          * are so granular, the number of transformations could
//          * potentially be tremendous, which would slow down
//          * the page. As such, I'm *manually* calculating the scroll
//          * offset, such that zooming can be performed with
//          * a single transform() and scale()
//          */

//         glMatrix.vec2.copy(scrollOffset, kouchInputManager.currentMousePosition)
//         glMatrix.vec2.scaleAndAdd(scrollOffset, scrollOffset, this.pos, -1)        
//         glMatrix.vec2.scale(scrollOffset, scrollOffset, -1 * scrollDiff)
//         scrollDiff = 0;

//         glMatrix.vec2.add(totalScrollOffset, totalScrollOffset, scrollOffset)
//         glMatrix.vec2.add(this.pos, this.pos, totalScrollOffset)
//     }
// }