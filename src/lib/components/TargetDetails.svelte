<script lang="ts">
	let selectedTarget = $state({ x: 120, y: 100, width: 50, height: 50 });
	const targets = $state([
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
			
			ctx.lineWidth = 2; // Outline thickness

			targets.forEach((target) => {
                if (
					selectedTarget &&
					selectedTarget.x === target.x &&
					selectedTarget.y === target.y &&
					selectedTarget.width === target.width &&
					selectedTarget.height === target.height
				) {
					ctx.strokeStyle = 'blue'; // Blue outline for selected target
				} else {
					ctx.strokeStyle = 'red'; // Red outline for others
				}
				ctx.strokeRect(target.x, target.y, target.width, target.height);
			});
		}

		canvas.addEventListener('click', (e) => {
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const clickedtarget = targets.find(
				(target) =>
					x >= target.x &&
					x <= target.x + target.width &&
					y >= target.y &&
					y <= target.y + target.height
			);

			if (clickedtarget) {
                selectedTarget = clickedtarget;
                drawImage()
				displayImageData(clickedtarget);
			}
		});

		function displayImageData(clickedtarget: { x: any; y: any; width: any; height: any }) {
			const scaleX = mainImage.width / canvas.width;
			const scaleY = mainImage.height / canvas.height;
			const offset = 10;

			const originalX = (clickedtarget.x - offset) * scaleX;
			const originalY = (clickedtarget.y - offset) * scaleY;
			const originalWidth = (clickedtarget.width + 2 * offset) * scaleX;
			const originalHeight = (clickedtarget.height + 2 * offset) * scaleY;

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
			

			const imageContainer = document.getElementById('target-image');
			if (!imageContainer) return;
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
	

	#target-image {
		position: relative;
		overflow: hidden;
	}
</style>
