import { Camera } from './render'
import type { vec2, vec3 } from 'gl-matrix'

export class State {
    #position: vec2;
    start: number;
    lastFrame: number;
    elapsed: number;
    delta: number;
    camera: Camera;
    agitation: number;
    wallObjects: WallObject[] = [
	{position: [0, 0, 0], shaderEffect: ShaderEffect.Sphubic},
	{position: [3, 0, 3], shaderEffect: ShaderEffect.Scrolling},
	{position: [-3, 0, 3], shaderEffect: ShaderEffect.Censored},
    ];
    
    constructor(start: number, position: vec2) {
	this.start = start;
	this.lastFrame = start;
	this.delta = 1/60;
	this.elapsed = 0;
	this.camera = new Camera();
	this.#position = position;
	this.agitation = 0;
    }

    get position() { return this.#position }
    set position([x, z]: vec2) { 
	this.#position = [x, z]; 
	this.camera.position = [x * 10, 0, z * 10];
    }
}

export type WallObject = {
    position: vec3,
    shaderEffect: ShaderEffect,
}

export const enum ShaderEffect {
    Default,
    Inverted,
    Sobel,
    SineTrip,
    Scrolling,
    Censored,
    Sphubic,
}
