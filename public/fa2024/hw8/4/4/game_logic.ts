import { vec2 } from 'gl-matrix';
import type {State} from './state'

enum LogicalButton {
    Forward = 'w',
    Backward = 'a',
    Left = 's',
    Right = 'd',
    Space = ' ',
}

var inputActionMap: {[key: string]: LogicalButton} = {
    w: LogicalButton.Forward,
    a: LogicalButton.Left,
    s: LogicalButton.Backward,
    d: LogicalButton.Right,
    ' ': LogicalButton.Space
};

const qwertyActionMap = inputActionMap;

const dvorakActionMap = {
    ",": LogicalButton.Forward,
    "a": LogicalButton.Left,
    "o": LogicalButton.Backward,
    "e": LogicalButton.Right,
    " ": LogicalButton.Space
}

var inputsHeld: {[key in LogicalButton]?: boolean} = {}; 

const WALK_SPEED = 2.5;
const AGITATION_SPEED = 0.5;

function walkDirection() {
    let walkDir = vec2.create();
    if (inputsHeld[LogicalButton.Left])
	vec2.add(walkDir, walkDir, [1, 0]);
    if (inputsHeld[LogicalButton.Right])
	vec2.add(walkDir, walkDir, [-1, 0]);
    if (inputsHeld[LogicalButton.Forward])
	vec2.add(walkDir, walkDir, [0, 1]);
    if (inputsHeld[LogicalButton.Backward])
	vec2.add(walkDir, walkDir, [0, -1]);
    vec2.normalize(walkDir, walkDir);
    return walkDir;
}

function clamp(x: number, min: number, max: number) {
    return Math.max(Math.min(x, max), min);
}

export function update(state: State) {
    let delta = state.delta;
    let yaw = state.camera.yaw;
    let realWalk = walkDirection();
    if (!inputsHeld[LogicalButton.Space])
	state.agitation = clamp(state.agitation + delta * AGITATION_SPEED, 0, 1);
    else
	state.agitation = clamp(state.agitation - delta * AGITATION_SPEED * 2, 0, 1);
    vec2.rotate(realWalk, realWalk, [0, 0], yaw);
    let oldPos = state.position;
    state.position = vec2.scaleAndAdd(oldPos, oldPos, realWalk, delta * WALK_SPEED);
}

export function hookInput(canvas: HTMLCanvasElement, state: State) {
    let width = canvas.width;
    let height = canvas.height;
    canvas.addEventListener('click', async () => {
	await canvas.requestPointerLock({
	    unadjustedMovement: true
	})
    });
    function mouseMove(event: MouseEvent) {
	let x = event.movementX;
	let y = event.movementY;
	state.camera.pitch += y / height;
	state.camera.yaw += x / height;
    }
    document.addEventListener('pointerlockchange', (_) => {
	if (document.pointerLockElement === canvas) {
	    document.addEventListener('mousemove', mouseMove);
	} else {
	    document.removeEventListener('mousemove', mouseMove);
	}
    });

    (document.getElementById("kblform") as HTMLFormElement).reset();
    
    // Keyboard layout selection code
    document.getElementById("kblchoice1")!.addEventListener("click", () => {
	console.log("Selected QWERTY");
	inputActionMap = qwertyActionMap;
    }) ;

    document.getElementById("kblchoice2")!.addEventListener("click", () => {
	console.log("Selected Dvorak");
	inputActionMap = dvorakActionMap;
    });

    // Keyboard input handlers
    document.addEventListener('keydown', (e) => {
	let theAction = inputActionMap[e.key];
	if (theAction) {
	    inputsHeld[theAction] = true;
	    e.preventDefault();
	}
    });

    document.addEventListener('keyup', (e) => {
	let theAction = inputActionMap[e.key];
	if (theAction) {
	    // We could set this to false, but since we don't have them initialized
	    // to false, it doesn't feel right
	    delete inputsHeld[theAction];
	    e.preventDefault();
	}
    });
}
