// Perlin noise
// source: https://rtouti.github.io/graphics/perlin-noise-algorithm

function Shuffle(arrayToShuffle) {
	for(let e = arrayToShuffle.length-1; e > 0; e--) {
		const index = Math.round(Math.random()*(e-1));
		const temp = arrayToShuffle[e];
		
		arrayToShuffle[e] = arrayToShuffle[index];
		arrayToShuffle[index] = temp;
	}
}

function MakePermutation() {
	const permutation = [];
	for(let i = 0; i < 256; i++) {
		permutation.push(i);
	}

	Shuffle(permutation);
	
	for(let i = 0; i < 256; i++) {
		permutation.push(permutation[i]);
	}
	
	return permutation;
}
const Permutation = MakePermutation();

function GetConstantVector(v) {
	// v is the value from the permutation table
	const h = v & 3;
	if(h == 0)
		return [1.0, 1.0];
	else if(h == 1)
		return [-1.0, 1.0];
	else if(h == 2)
		return [-1.0, -1.0];
	else
		return [1.0, -1.0];
}

function smootherstep(t) {
	return ((6*t - 15)*t + 10)*t*t*t;
}

function lerp(a,b,t) {
	return a + t*(b-a);
}

function Noise2D(x, y) {
	const X = Math.floor(x) & 255;
	const Y = Math.floor(y) & 255;

	const xf = x-Math.floor(x);
	const yf = y-Math.floor(y);

	const topRight = [xf-1.0, yf-1.0];
	const topLeft = [xf, yf-1.0];
	const bottomRight = [xf-1.0, yf];
	const bottomLeft = [xf, yf];
	
	// Select a value from the permutation array for each of the 4 corners
	const valueTopRight = Permutation[Permutation[X+1]+Y+1];
	const valueTopLeft = Permutation[Permutation[X]+Y+1];
	const valueBottomRight = Permutation[Permutation[X+1]+Y];
	const valueBottomLeft = Permutation[Permutation[X]+Y];
	
	const dotTopRight = vec2.dot(topRight,GetConstantVector(valueTopRight));
	const dotTopLeft = vec2.dot(topLeft,GetConstantVector(valueTopLeft));
	const dotBottomRight = vec2.dot(bottomRight,GetConstantVector(valueBottomRight));
	const dotBottomLeft = vec2.dot(bottomLeft,GetConstantVector(valueBottomLeft));
	
	const u = smootherstep(xf);
	const v = smootherstep(yf);
	
	return lerp(
		lerp(dotBottomLeft, dotTopLeft, v),
		lerp(dotBottomRight, dotTopRight, v),
        u
	);
}