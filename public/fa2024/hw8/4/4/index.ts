import {vec3, vec4, mat4} from 'gl-matrix'
import {update, hookInput} from './game_logic'
import {render, Camera} from './render'
import {State} from './state'

var state: State;

function step(timeMs: number) {
    let time = timeMs / 1000;
    if (state === undefined) {
	state = new State(time, [-5, -5]);
	state.camera.position = [-50, 0, -50];
	state.camera.yaw = 3 * Math.PI / 4;
	// New to Typescript?  The ! operator throws an error if the value is null, and the `as`
	// operator casts a value to another type.
	hookInput(document.getElementById('myCanvas')! as HTMLCanvasElement, state);
    } else {
	state.delta = state.lastFrame - time;
    }
    state.elapsed = time - state.start;
    state.lastFrame = time;
    update(state);
    render(state);
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
