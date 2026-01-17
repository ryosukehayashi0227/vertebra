const Jimp = require('jimp');
const path = require('path');

const INPUT_PATH = '/Users/hayashiryosuke/.gemini/antigravity/brain/f164e883-6a3b-4c5a-82c6-4ecd9ef18bd4/vertebra_icon_with_checkerboard.png';
const OUTPUT_PATH = '/Users/hayashiryosuke/.gemini/antigravity/brain/f164e883-6a3b-4c5a-82c6-4ecd9ef18bd4/vertebra_icon_fixed.png';

async function main() {
    console.log('Reading image...');
    const image = await Jimp.read(INPUT_PATH);

    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const cx = width / 2;
    const cy = height / 2;
    // Icon radius (approximate squircle radius from center)
    // The icon takes up most of the 1024x1024 space. Let's say 480px radius is safe zone for content.
    // However, corners are outside.
    const safeRadius = Math.min(width, height) * 0.45; // 45% of size is safe (center) using conservative estimate

    console.log('Processing pixels...');

    // Sample top-left corner to get checkerboard colors
    const colors = new Set();
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            colors.add(image.getPixelColor(x, y));
        }
    }

    const bgColorList = Array.from(colors).map(c => Jimp.intToRGBA(c));
    console.log('Background colors found:', bgColorList.length);

    image.scan(0, 0, width, height, function (x, y, idx) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

        // If we are far from center (corners)
        if (dist > safeRadius) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            // alpha is idx + 3

            // Check if this pixel matches any of the sampled background colors
            let isBg = false;
            for (const bg of bgColorList) {
                // Approximate match (tolerance 30)
                if (Math.abs(r - bg.r) < 30 &&
                    Math.abs(g - bg.g) < 30 &&
                    Math.abs(b - bg.b) < 30) {
                    isBg = true;
                    break;
                }
            }

            if (isBg) {
                this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (Transparent)
            }
        }
    });

    console.log('Saving...');
    await image.writeAsync(OUTPUT_PATH);
    console.log('Done!');
}

main().catch(err => console.error(err));
