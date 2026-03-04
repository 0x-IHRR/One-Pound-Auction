#!/usr/bin/env python3
"""
Bold Unity - Powerful Logo with True Negative Space
Transparent background, using negative space for design.
"""

from PIL import Image, ImageDraw, ImageFont
import math

def create_bold_logo():
    # Canvas with transparent background
    size = 2000
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img, 'RGBA')

    cx, cy = size // 2, size // 2

    # Bold, powerful colors with gradient
    gradient_start = (9, 200, 164, 255)   # #09C8A4
    gradient_end = (1, 164, 168, 255)     # #01A4A8
    accent_orange = (255, 120, 40, 255)
    accent_yellow = (255, 180, 80, 255)

    # === CONCEPT: Ring segments with true gap (negative space) ===

    outer_radius = 380
    inner_radius = 280
    thickness = outer_radius - inner_radius  # 100

    # Draw ring as arcs using pie slices
    # Gap on the right side: from -30° to 30° (60° gap)
    gap_start = -30
    gap_end = 30

    # Function to draw arc segment with gradient color
    def draw_arc_segment(start_angle, end_angle, progress_start, progress_end):
        # Convert angles to radians
        start_rad = math.radians(start_angle)
        end_rad = math.radians(end_angle)

        # Draw multiple pie slices to create the arc
        steps = 60  # More steps = smoother
        angle_step = (end_rad - start_rad) / steps
        progress_step = (progress_end - progress_start) / steps

        for i in range(steps):
            a1 = start_rad + i * angle_step
            a2 = start_rad + (i + 1) * angle_step

            # Calculate gradient color for this slice
            progress = progress_start + i * progress_step
            r = int(gradient_start[0] + (gradient_end[0] - gradient_start[0]) * progress)
            g = int(gradient_start[1] + (gradient_end[1] - gradient_start[1]) * progress)
            b = int(gradient_start[2] + (gradient_end[2] - gradient_start[2]) * progress)
            color = (r, g, b, 255)

            # Calculate points
            x1_outer = cx + outer_radius * math.cos(a1)
            y1_outer = cy + outer_radius * math.sin(a1)
            x2_outer = cx + outer_radius * math.cos(a2)
            y2_outer = cy + outer_radius * math.sin(a2)

            x1_inner = cx + inner_radius * math.cos(a2)
            y1_inner = cy + inner_radius * math.sin(a2)
            x2_inner = cx + inner_radius * math.cos(a1)
            y2_inner = cy + inner_radius * math.sin(a1)

            # Draw the segment
            draw.polygon([
                (x1_outer, y1_outer),
                (x2_outer, y2_outer),
                (x1_inner, y1_inner),
                (x2_inner, y2_inner)
            ], fill=color)

    # Draw the ring with a symmetrical gap on right side
    # Gap from -35° to 35° (70° total - balanced opening for the flame)
    # Ring goes from 35° to 325° (290° total) with gradient

    # Calculate total span for gradient mapping
    total_span = 290  # from 35° to 325°

    # Draw continuous arc from 35° (after gap) clockwise to 325° (which equals -35°)
    # Each segment gets a progress range for the gradient

    draw_arc_segment(35, 100, 0.0, 0.22)           # 0-22% of gradient
    draw_arc_segment(100, 160, 0.22, 0.42)         # 22-42%
    draw_arc_segment(160, 220, 0.42, 0.62)         # 42-62%
    draw_arc_segment(220, 280, 0.62, 0.82)         # 62-82%
    draw_arc_segment(280, 325, 0.82, 1.0)          # 82-100%

    # === THE "1": Upside down Arabic numeral shape ===

    one_height = 320
    one_thick = 45

    # Use bright cyan from the gradient for the "1"
    one_color = (9, 220, 180, 255)  # Bright cyan, matches the gradient

    # Main vertical stroke
    draw.rectangle(
        [(cx - one_thick//2, cy - one_height//2),
         (cx + one_thick//2, cy + one_height//2)],
        fill=one_color
    )

    # Bottom horizontal serif (upside down - at bottom)
    bottom_serif_width = 50
    bottom_serif_height = 18
    draw.polygon([
        (cx - bottom_serif_width, cy + one_height//2 - bottom_serif_height),
        (cx + bottom_serif_width, cy + one_height//2 - bottom_serif_height),
        (cx + bottom_serif_width, cy + one_height//2),
        (cx - bottom_serif_width, cy + one_height//2)
    ], fill=one_color)

    # Top serif - diagonal stroke going up-left (mirrored)
    top_length = 50
    top_angle = 25  # degrees
    top_rad = math.radians(top_angle)

    # Calculate diagonal serif position - going up-left from top-left
    top_x_start = cx - one_thick//2
    top_y_start = cy - one_height//2
    top_x_end = top_x_start - top_length
    top_y_end = top_y_start - top_length * math.tan(top_rad)

    draw.polygon([
        (cx - one_thick//2, cy - one_height//2),           # 竖线左上
        (cx + one_thick//2, cy - one_height//2),          # 竖线右上
        (top_x_end + 12, top_y_end),                       # 右端点
        (top_x_end, top_y_end - 10)                        # 左端点延伸
    ], fill=one_color)

    # === FLAME: Centered in the gap ===

    # Position flame in the center of the gap
    # Gap is at 0° (right side), center is between inner and outer radius
    gap_center_x = cx + (inner_radius + outer_radius) / 2  # cx + 330
    flame_x = gap_center_x
    flame_base = 55  # Increased from 38
    flame_height = 100  # Increased from 70

    # Main flame
    draw.polygon([
        (flame_x - flame_base//2, cy + flame_base//2),
        (flame_x, cy + flame_base//2 + 8),
        (flame_x + flame_base//2 + 8, cy + flame_base//3),
        (flame_x + 20, cy),
        (flame_x, cy - flame_height),
        (flame_x - 15, cy),
        (flame_x - flame_base//2 - 8, cy + flame_base//3),
    ], fill=accent_orange)

    # Inner flame highlight
    draw.polygon([
        (flame_x - flame_base//4, cy + flame_base//3),
        (flame_x + 12, cy + flame_base//4),
        (flame_x + 8, cy - flame_height//2.5),
        (flame_x - 8, cy),
    ], fill=accent_yellow)

    # Save versions
    base_path = '/Users/ihrr/Code/python/MVP/One-Pound Auction/web-demo/logo'

    # Transparent version
    img.save(f'{base_path}/logo.png', 'PNG')
    print(f"Logo saved as {base_path}/logo.png")

    # White background version (for reference)
    img_white = Image.new('RGB', (size, size), (255, 255, 255))
    img_white.paste(img.convert('RGB'), (0, 0), img.convert('RGBA'))
    img_white.save(f'{base_path}/logo_white_bg.png', 'PNG')
    print(f"Logo with white background saved")

    # Dark background version
    img_dark = Image.new('RGB', (size, size), (20, 30, 45))
    img_dark.paste(img, (0, 0), img.convert('RGBA'))
    img_dark.save(f'{base_path}/logo_dark_bg.png', 'PNG')
    print(f"Logo with dark background saved")

    # Compact version
    img_compact = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_compact.save(f'{base_path}/logo_compact.png', 'PNG')
    print(f"Compact logo saved")

    return img

if __name__ == "__main__":
    create_bold_logo()
