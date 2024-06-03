<script lang="ts">
	let selectedTarget = $state(null);
	const overlays = $state([
		{ x: 120, y: 100, width: 50, height: 50 },
		{ x: 10, y: 350, width: 80, height: 150 }
	]);
	let mainImageSrc = $state('/colonne.jpg');

	let canvas: HTMLCanvasElement;
	let targetCanvas: HTMLCanvasElement;

	$effect(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		let mainImage = new Image();
		mainImage.src = mainImageSrc;

		mainImage.onload = () => {
			drawImage();
			window.addEventListener('resize', drawImage); // Redraw on window resize
		};

		function drawImage() {
			if (!ctx) return;
			const aspectRatio = mainImage.width / mainImage.height;
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.width / aspectRatio;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(mainImage, 0, 0, canvas.width, canvas.height);
			drawOutlines();
		}

		function drawOutlines() {
			if (!ctx) return;
			ctx.strokeStyle = 'red'; // Outline color
			ctx.lineWidth = 2; // Outline thickness

			overlays.forEach((overlay) => {
				ctx.strokeRect(overlay.x, overlay.y, overlay.width, overlay.height);
			});
		}

		canvas.addEventListener('click', (e) => {
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const clickedOverlay = overlays.find(
				(overlay) =>
					x >= overlay.x &&
					x <= overlay.x + overlay.width &&
					y >= overlay.y &&
					y <= overlay.y + overlay.height
			);

			if (clickedOverlay) {
				displayImageData(clickedOverlay);
			}
		});

		function displayImageData(clickedOverlay: { x: any; y: any; width: any; height: any }) {
			const scaleX = mainImage.width / canvas.width;
			const scaleY = mainImage.height / canvas.height;
			const offset = 10;

			const originalX = (clickedOverlay.x - offset) * scaleX;
			const originalY = (clickedOverlay.y - offset) * scaleY;
			const originalWidth = (clickedOverlay.width + 2 * offset) * scaleX;
			const originalHeight = (clickedOverlay.height + 2 * offset) * scaleY;

			targetCanvas.width = canvas.width;
			targetCanvas.height = canvas.height;
			const newCtx = targetCanvas.getContext('2d');

			if (newCtx) {
				newCtx.drawImage(
					mainImage,
					originalX,
					originalY,
					originalWidth,
					originalHeight, // Source rectangle
					0,
					0,
					targetCanvas.width,
					targetCanvas.height // Destination rectangle
				);
			}
			console.log(targetCanvas.width);

			const imageContainer = document.getElementById('target-image');
			if (!imageContainer) return;

			imageContainer.style.position = 'relative';
			imageContainer.style.width = `${canvas.width}px`;
			imageContainer.style.height = `${canvas.height}px`;
		}
	});
</script>

<div class="target-details panel">
	<canvas bind:this={canvas}></canvas>
	<div class="stats">
		<div class="stat">
			<p>Elevation</p>
			<p>2M</p>
		</div>
	</div>
	<div id="target-image">
		<canvas bind:this={targetCanvas}></canvas>
	</div>
</div>

<style>
	.target-details {
		display: flex;
		gap: 1rem;
	}
	canvas,
	#target-image {
		/* width: 33.33%;  */
	}

	#target-image {
		position: relative;
		overflow: hidden;
	}
</style>
