from PIL import Image
import numpy as np

def remove_checkerboard(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Get dimensions
    height, width = data.shape[:2]
    
    # Create a mask for the circular/squircle icon area
    # Center of the image
    cy, cx = height // 2, width // 2
    # Radius (approximate based on the visual, usually icons are centered)
    # The icon seems to take up about 80-90% of the space
    radius = min(cx, cy) * 0.95
    
    # Create coordinate grids
    y, x = np.ogrid[:height, :width]
    
    # Distance from center
    # For a squircle, it's a bit more complex, but let's simply mask out the corners first
    # Or simpler: detects the checkerboard pattern.
    
    # Checkerboard colors from the image provided
    # Typically they are white/light gray or white/transparent gray
    # Let's target the exact pixels in the corners
    
    # Sample top-left 20x20 pixels to determine background colors
    bg_colors = set()
    for i in range(20):
        for j in range(20):
            bg_colors.add(tuple(data[i, j]))
            
    # Process image
    new_data = data.copy()
    
    # Threshold for color matching
    threshold = 30
    
    for r in range(height):
        for c in range(width):
            # If pixel is close to one of the sampled background colors
            pixel = tuple(data[r, c])
            
            # Simple heuristic: if it's outside the central area AND matches checkerboard
            # Distance from center
            dist_sq = (r - cy)**2 + (c - cx)**2
            
            # If it's far from center (likely background)
            if dist_sq > (radius * 0.7)**2:
                is_bg = False
                for bg_c in bg_colors:
                     # Check RGB distance
                     if  abs(pixel[0] - bg_c[0]) < threshold and \
                         abs(pixel[1] - bg_c[1]) < threshold and \
                         abs(pixel[2] - bg_c[2]) < threshold:
                         is_bg = True
                         break
                
                if is_bg:
                    new_data[r, c] = (0, 0, 0, 0) # Make transparent

    # Save
    out_img = Image.fromarray(new_data)
    out_img.save(output_path)
    print(f"Saved to {output_path}")

input_path = "/Users/hayashiryosuke/.gemini/antigravity/brain/f164e883-6a3b-4c5a-82c6-4ecd9ef18bd4/vertebra_icon_transparent_final_1768644483543.png"
output_path = "/Users/hayashiryosuke/.gemini/antigravity/brain/f164e883-6a3b-4c5a-82c6-4ecd9ef18bd4/vertebra_icon_fixed.png"

remove_checkerboard(input_path, output_path)
