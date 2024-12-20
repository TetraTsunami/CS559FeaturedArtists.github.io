// Bun shader loader

import './index'

await Bun.build({
    entrypoints: ['./index.ts'],
    outdir: './out',
    loader: {
	".frag": "file",
	".vertex": "file"
    },
})
