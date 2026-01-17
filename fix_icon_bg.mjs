import { Jimp } from 'jimp';

const INPUT_PATH = '/Users/hayashiryosuke/.gemini/antigravity/brain/f164e883-6a3b-4c5a-82c6-4ecd9ef18bd4/vertebra_icon_with_checkerboard.png';
const OUTPUT_PATH = '/Users/hayashiryosuke/.gemini/antigravity/brain/f164e883-6a3b-4c5a-82c6-4ecd9ef18bd4/vertebra_icon.png';

async function main() {
    console.log('Reading image...');
    const image = await Jimp.read(INPUT_PATH);

    // Resize to standard 1024x1024 if not already
    // (To simplify masking logic)
    image.resize({ w: 1024, h: 1024 });
    const width = 1024;
    const height = 1024;

    const cx = width / 2;
    const cy = height / 2;

    // Squircle parameters
    // The visual icon seems to have a radius around 400-420px (out of 512px half-width)
    // Let's protect the central 80% and mask strictly outside.
    // Standard macOS icon shape (squircle)
    // We can approximate it or use a simple rounded rect.
    // The current image HAS a rounded rect shape. We just need to cut OUTSIDE of it.

    // Let's create a dynamic threshold based on pixel brightness/color?
    // No, geometric is safer.

    // Let's crop to a rounded rectangle.
    // Visual inspection of the uploaded image suggests the icon body is a dark square with rounded corners.
    // It seems to occupy about 800x800 in the center.

    const rectSize = 820; // 820x820 square
    const cornerRadius = 180; // Radius for corners

    const left = (width - rectSize) / 2;
    const top = (height - rectSize) / 2;
    const right = left + rectSize;
    const bottom = top + rectSize;

    image.scan(0, 0, width, height, function (x, y, idx) {
        // Check if point is inside the rounded rectangle
        let inside = false;

        if (x >= left && x <= right && y >= top && y <= bottom) {
            // It's inside the bounding box. Now check corners.

            // Top-Left corner
            if (x < left + cornerRadius && y < top + cornerRadius) {
                const dx = x - (left + cornerRadius);
                const dy = y - (top + cornerRadius);
                if (dx * dx + dy * dy <= cornerRadius * cornerRadius) inside = true;
            }
            // Top-Right corner
            else if (x > right - cornerRadius && y < top + cornerRadius) {
                const dx = x - (right - cornerRadius);
                const dy = y - (top + cornerRadius);
                if (dx * dx + dy * dy <= cornerRadius * cornerRadius) inside = true;
            }
            // Bottom-Left corner
            else if (x < left + cornerRadius && y > bottom - cornerRadius) {
                const dx = x - (left + cornerRadius);
                const dy = y - (bottom - cornerRadius);
                if (dx * dx + dy * dy <= cornerRadius * cornerRadius) inside = true;
            }
            // Bottom-Right corner
            else if (x > right - cornerRadius && y > bottom - cornerRadius) {
                const dx = x - (right - cornerRadius);
                const dy = y - (bottom - cornerRadius);
                if (dx * dx + dy * dy <= cornerRadius * cornerRadius) inside = true;
            }
            // Not in corner area (central cross)
            else {
                inside = true;
            }
        }

        if (!inside) {
            this.bitmap.data[idx + 3] = 0; // Transparent
        }
    });

    console.log('Saving...');
    if (image.writeAsync) {
        await image.writeAsync(OUTPUT_PATH);
    } else {
        await image.write(OUTPUT_PATH);
    }
    console.log('Done!');
}

main().catch(err => console.error(err));
