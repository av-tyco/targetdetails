<script lang="ts">

	import { type Target, Scale } from '../index';
	let selectedTarget = $state<Target | null>(null);
	let targets = $state([
		{ x: 190, y: 120, width: 80, height: 100 },
		{ x: 10, y: 1100, width: 450, height: 700 }
	]);
	let mainImageSrc = $state('/colonne.jpg');

	function updateImage() {
		if (mainImageSrc === '/colonne.jpg') {
			mainImageSrc = '/convoy.jpg';

			targets = [
				{ x: 700, y: 550, width: 80, height: 100 },
				{ x: 500, y: 500, width: 80, height: 80 }
			];
		} else {
			mainImageSrc = '/colonne.jpg';

			targets = [
				{ x: 190, y: 120, width: 80, height: 100 },
				{ x: 10, y: 1100, width: 450, height: 700 }
			];
		}
	}

	let canvas: HTMLCanvasElement;
	let targetCanvas: HTMLCanvasElement;
	const FOCUS_IMAGE_SIZE = 400;

	$effect(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		let mainImage = new Image();
		mainImage.src = mainImageSrc;

		mainImage.onload = () => {
			drawImage();
			window.addEventListener('resize', drawImage);
		};
		let scaledDownTargets = $derived(targets.map((target) => scaleTarget(target, canvas, mainImage, Scale.Down)));

		function drawImage() {
			if (!ctx) return;
			const aspectRatio = mainImage.width / mainImage.height;
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.width / aspectRatio;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(mainImage, 0, 0, canvas.width, canvas.height);
			drawOutlines();
		}

		function drawOutlines() {
			if (!ctx) return;
			ctx.lineWidth = 2;

			scaledDownTargets.forEach((target) => {
				if (
					selectedTarget &&
					selectedTarget.x === target.x &&
					selectedTarget.y === target.y &&
					selectedTarget.width === target.width &&
					selectedTarget.height === target.height
				) {
					ctx.strokeStyle = 'blue';
				} else {
					ctx.strokeStyle = 'red';
				}

				ctx.strokeRect(target.x, target.y, target.width, target.height);
			});
		}

		canvas.addEventListener('click', (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const clickedtarget = scaledDownTargets.find(
				(target) =>
					x >= target.x &&
					x <= target.x + target.width &&
					y >= target.y &&
					y <= target.y + target.height
			);

			if (clickedtarget) {
				selectedTarget = clickedtarget;
				drawOutlines();
				displayFocusImage(scaleTarget(clickedtarget, canvas, mainImage, Scale.Up));
			}
		});

		function displayFocusImage(clickedtarget: Target) {
			const newCtx = targetCanvas.getContext('2d');
			if (!newCtx) return;

			let { height, width } = clickedtarget;

			let focusWidth = FOCUS_IMAGE_SIZE;
			let focusHeight = FOCUS_IMAGE_SIZE;

			if (height > width) {
				focusWidth = FOCUS_IMAGE_SIZE * (width / height);
			} else if (width > height) {
				focusHeight = FOCUS_IMAGE_SIZE * (height / width);
			}
			newCtx.clearRect(0, 0, FOCUS_IMAGE_SIZE, FOCUS_IMAGE_SIZE);
			newCtx.drawImage(
				mainImage,
				clickedtarget.x,
				clickedtarget.y,
				clickedtarget.width,
				clickedtarget.height,
				0,
				0,
				focusWidth,
				focusHeight
			);
		}
	});
	function scaleTarget(
		target: Target,
		canvas: HTMLCanvasElement,
		img: HTMLImageElement,
		scale: Scale = Scale.Down
	): Target {
		let scaleX =  canvas.width / img.width;
		let scaleY = canvas.height / img.height;
		if (scale === Scale.Up) {
			scaleX = img.width / canvas.width;
			scaleY = img.height / canvas.height;
		}

		let x = target.x * scaleX;
		let y = target.y * scaleY;
		let width = target.width * scaleX;
		let height = target.height * scaleY;
		return { x, y, width, height };
	}
</script>

<button onclick={updateImage}>Switch</button>
<div class="target-details panel">
	<canvas bind:this={canvas}></canvas>

	<canvas
		id="focus-target"
		width={FOCUS_IMAGE_SIZE}
		height={FOCUS_IMAGE_SIZE}
		bind:this={targetCanvas}
	></canvas>
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
