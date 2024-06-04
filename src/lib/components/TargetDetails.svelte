<script lang="ts">
	import { type Target } from '../index';
	import { getScaledDimensions } from '../index';
	import FocusTarget from './FocusTarget.svelte';
	let selectedTargetId = $state(-1);
	let sourceTargets = $state([
		{ id: 0, x: 190, y: 120, width: 80, height: 100 },
		{ id: 1, x: 10, y: 1100, width: 450, height: 700 }
	]);

	const SOURCE_IMAGE_SIZE = 400;
	const FOCUS_IMAGE_SIZE = 400;
	let mainImageSrc = $state('/colonne.jpg');

	let sourceCanvas: HTMLCanvasElement;

	$effect(() => {
		const ctx = sourceCanvas.getContext('2d');
		if (!ctx) return;
		let mainImage = new Image();
		mainImage.src = mainImageSrc;
		mainImage.onload = () => {
			drawSourceImage();
			let scaledTargets = sourceTargets.map((target) => scaleTarget(target, mainImage));
			drawOutlines(scaledTargets);
			// window.addEventListener('resize', drawSourceImage);
			sourceCanvas.addEventListener('click', (e: MouseEvent) =>
				handleMouseEvent(e, scaledTargets, 'click')
			);
			sourceCanvas.addEventListener('mousemove', (e: MouseEvent) =>
				handleMouseEvent(e, scaledTargets, 'mousemove')
			);
		};

		function drawSourceImage() {
			const ctx = sourceCanvas.getContext('2d');
			if (!ctx) return;

			let sourceWidth = SOURCE_IMAGE_SIZE;
			let sourceHeight = SOURCE_IMAGE_SIZE;

			if (mainImage.height > mainImage.width) {
				sourceWidth = FOCUS_IMAGE_SIZE * (mainImage.width / mainImage.height);
			} else if (mainImage.width > mainImage.height) {
				sourceHeight = FOCUS_IMAGE_SIZE * (mainImage.height / mainImage.width);
			}
			ctx.clearRect(0, 0, FOCUS_IMAGE_SIZE, FOCUS_IMAGE_SIZE);
			ctx.drawImage(
				mainImage,
				0,
				0,
				mainImage.width,
				mainImage.height,
				0,
				0,
				sourceWidth,
				sourceHeight
			);
		}
	});
	function handleMouseEvent(e: MouseEvent, targets: Target[], eventType: 'click' | 'mousemove') {
		const rect = sourceCanvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const target = targets.find(
			(target) =>
				x >= target.x &&
				x <= target.x + target.width &&
				y >= target.y &&
				y <= target.y + target.height
		);
		if (target) {
			sourceCanvas.style.cursor = 'pointer';

			if (eventType === 'click') {
				selectedTargetId = target.id;
				drawOutlines(targets);
			}
		} else {
			sourceCanvas.style.cursor = 'default';
		}
	}
	function drawOutlines(targets: Target[]) {
		const ctx = sourceCanvas.getContext('2d');
		if (!ctx) return;
		ctx.lineWidth = 2;

		targets.forEach((target) => {
			ctx.strokeStyle = target.id === selectedTargetId ? 'blue' : 'red';
			ctx.strokeRect(target.x, target.y, target.width, target.height);
		});
	}
	function updateImage() {
		selectedTargetId = -1;
		if (mainImageSrc === '/colonne.jpg') {
			mainImageSrc = '/convoy.jpg';

			sourceTargets = [
				{ id: 0, x: 700, y: 550, width: 80, height: 100 },
				{ id: 1, x: 500, y: 500, width: 80, height: 80 }
			];
		} else {
			mainImageSrc = '/colonne.jpg';

			sourceTargets = [
				{ id: 0, x: 190, y: 120, width: 80, height: 100 },
				{ id: 1, x: 10, y: 1100, width: 450, height: 700 }
			];
		}
	}

	function scale(value: number, max: number, newMax: number): number {
		return (value / max) * newMax;
	}

	function scaleTarget(target: Target, img: HTMLImageElement): Target {
		let { newWidth, newHeight } = getScaledDimensions(img.width, img.height, SOURCE_IMAGE_SIZE);

		let x = scale(target.x, img.width, newWidth);
		let y = scale(target.y, img.height, newHeight);
		let width = scale(target.width, img.width, newWidth);
		let height = scale(target.height, img.height, newHeight);
		return { id: target.id, x, y, width, height };
	}
</script>

<button onclick={updateImage}>Switch</button>
<div class="target-details panel">
	<canvas
		id="source-image"
		width={SOURCE_IMAGE_SIZE}
		height={SOURCE_IMAGE_SIZE}
		bind:this={sourceCanvas}
	></canvas>
	{#if selectedTargetId !== -1}
		<FocusTarget
			size={FOCUS_IMAGE_SIZE}
			imgSrc={mainImageSrc}
			target={sourceTargets[selectedTargetId]}
		></FocusTarget>
	{/if}
</div>

<style>
	.target-details {
		display: flex;
		gap: 1rem;
		bottom: 0;
		left: 0;
		align-items: baseline;
	}
</style>
