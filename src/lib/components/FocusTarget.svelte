<script lang="ts">
	import type { Target } from '$lib';
	import { getScaledDimensions } from '$lib';

	let { size, imgSrc, target } = $props<{ size: number; imgSrc: string; target: Target }>();

	let canvas: HTMLCanvasElement;

	$effect(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx || !target) return;
		let image = new Image();
		image.src = imgSrc;
		let { width, height } = target;

		let { newWidth, newHeight } = getScaledDimensions(width, height, size);

		ctx.clearRect(0, 0, size, size);
		ctx.drawImage(
			image,
			target.x,
			target.y,
			target.width,
			target.height,
			0,
			0,
			newWidth,
			newHeight
		);
	});
</script>

<canvas id="focus-target" width={size} height={size} bind:this={canvas}></canvas>
