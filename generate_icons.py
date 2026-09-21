from PIL import Image, ImageDraw, ImageFont
import math
import os

def create_cineboard_icon(size=512):
    # Create image with RGB (no transparency, solid luxury Red Orange background)
    img = Image.new('RGB', (size, size), color=(247, 28, 37))
    draw = ImageDraw.Draw(img)

    # Draw vertical/radial gradient from vivid Red-Orange #F71C25 to deep cinematic red #BD1119
    top_color = (255, 60, 68)      # Light Red-Orange
    bottom_color = (195, 14, 22)   # Deep Crimson
    
    for y in range(size):
        # Linear interpolation ratio
        ratio = y / size
        r = int(top_color[0] + (bottom_color[0] - top_color[0]) * ratio)
        g = int(top_color[1] + (bottom_color[1] - top_color[1]) * ratio)
        b = int(top_color[2] + (bottom_color[2] - top_color[2]) * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b))

    # Subtle radial highlight at top center
    center_x, center_y = size * 0.5, size * 0.25
    max_radius = size * 0.6
    for radius in range(int(max_radius), 0, -4):
        alpha = int((1.0 - (radius / max_radius)) * 25)
        r = min(255, int(255))
        g = min(255, int(80 + alpha))
        b = min(255, int(88 + alpha))
        # subtle glow
        # draw concentric circles with very soft glow
    
    # Inner border (subtle 2px luxury border)
    border_margin = int(size * 0.04)
    draw.rectangle(
        [border_margin, border_margin, size - border_margin, size - border_margin],
        outline=(255, 140, 145, 100),
        width=max(2, int(size * 0.008))
    )

    # Clapperboard Geometry in the center
    # Scale variables
    s = size / 512.0

    # Base clapperboard body (Dark warm stone #1C1917)
    body_x0 = int(106 * s)
    body_y0 = int(220 * s)
    body_x1 = int(406 * s)
    body_y1 = int(410 * s)
    body_radius = int(24 * s)

    # Draw rounded rectangle for lower slate body
    draw.rounded_rectangle(
        [body_x0, body_y0, body_x1, body_y1],
        radius=body_radius,
        fill=(28, 25, 23),      # Warm Stone #1C1917
        outline=(251, 239, 197), # Beeswax #FBEFC5 outline
        width=int(4 * s)
    )

    # Center Film / Star Emblem on lower slate body
    center_slate_x = (body_x0 + body_x1) // 2
    center_slate_y = (body_y0 + body_y1) // 2 + int(10 * s)
    
    # Film frame inner box in slate body
    inner_box_w = int(180 * s)
    inner_box_h = int(64 * s)
    draw.rounded_rectangle(
        [
            center_slate_x - inner_box_w // 2,
            center_slate_y - inner_box_h // 2,
            center_slate_x + inner_box_w // 2,
            center_slate_y + inner_box_h // 2
        ],
        radius=int(12 * s),
        fill=(41, 37, 36),       # Stone-800
        outline=(251, 239, 197),  # Beeswax
        width=int(2 * s)
    )

    # Clapperboard Top Stick (slanted or horizontal clapper bar)
    stick_x0 = int(106 * s)
    stick_y0 = int(130 * s)
    stick_x1 = int(406 * s)
    stick_y1 = int(205 * s)
    stick_radius = int(16 * s)

    draw.rounded_rectangle(
        [stick_x0, stick_y0, stick_x1, stick_y1],
        radius=stick_radius,
        fill=(28, 25, 23),
        outline=(251, 239, 197),
        width=int(4 * s)
    )

    # Draw iconic diagonal zebra stripes across the top clapper stick in Beeswax #FBEFC5 & White
    stripe_w = int(28 * s)
    gap = int(46 * s)
    stripe_y_top = stick_y0 + int(4 * s)
    stripe_y_bot = stick_y1 - int(4 * s)

    for i in range(5):
        sx = stick_x0 + int(24 * s) + i * gap
        # Slanted polygon stripe
        pts = [
            (sx, stripe_y_bot),
            (sx + int(22 * s), stripe_y_top),
            (sx + int(22 * s) + stripe_w, stripe_y_top),
            (sx + stripe_w, stripe_y_bot)
        ]
        # Alternate between Beeswax and Clean White
        color = (251, 239, 197) if i % 2 == 0 else (255, 255, 255)
        draw.polygon(pts, fill=color)

    # Draw "CB" (CineBoard) or Film Clapper text
    # Let's draw stylized geometric "CB" in the center box
    # Or clean geometric circle + play triangle
    poly_pts = [
        (center_slate_x - int(12 * s), center_slate_y - int(18 * s)),
        (center_slate_x + int(18 * s), center_slate_y),
        (center_slate_x - int(12 * s), center_slate_y + int(18 * s))
    ]
    draw.polygon(poly_pts, fill=(247, 28, 37)) # Red Orange play symbol

    # Small gold stars / dots around
    dot_r = int(5 * s)
    draw.ellipse([center_slate_x - int(55 * s) - dot_r, center_slate_y - dot_r, center_slate_x - int(55 * s) + dot_r, center_slate_y + dot_r], fill=(251, 239, 197))
    draw.ellipse([center_slate_x + int(55 * s) - dot_r, center_slate_y - dot_r, center_slate_x + int(55 * s) + dot_r, center_slate_y + dot_r], fill=(251, 239, 197))

    return img

def main():
    public_dir = os.path.join(os.path.dirname(__file__), 'client', 'public')
    os.makedirs(public_dir, exist_ok=True)

    # Generate master 512x512 icon
    master_512 = create_cineboard_icon(512)
    master_512.save(os.path.join(public_dir, 'icon-512.png'), 'PNG')
    print("[OK] Saved icon-512.png")

    # Generate 192x192 icon for PWA
    icon_192 = master_512.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(os.path.join(public_dir, 'icon-192.png'), 'PNG')
    print("[OK] Saved icon-192.png")

    # Generate 180x180 Apple Touch Icon (Primary iPhone icon)
    apple_180 = master_512.resize((180, 180), Image.Resampling.LANCZOS)
    apple_180.save(os.path.join(public_dir, 'apple-touch-icon.png'), 'PNG')
    apple_180.save(os.path.join(public_dir, 'apple-touch-icon-180x180.png'), 'PNG')
    print("[OK] Saved apple-touch-icon.png (180x180)")

    # Generate 152x152 and 120x120 for various iPads / older iPhones
    apple_152 = master_512.resize((152, 152), Image.Resampling.LANCZOS)
    apple_152.save(os.path.join(public_dir, 'apple-touch-icon-152x152.png'), 'PNG')
    
    apple_120 = master_512.resize((120, 120), Image.Resampling.LANCZOS)
    apple_120.save(os.path.join(public_dir, 'apple-touch-icon-120x120.png'), 'PNG')

    # Generate 64x64 and 32x32 Favicon PNG
    fav_32 = master_512.resize((32, 32), Image.Resampling.LANCZOS)
    fav_32.save(os.path.join(public_dir, 'favicon-32x32.png'), 'PNG')
    
    fav_16 = master_512.resize((16, 16), Image.Resampling.LANCZOS)
    fav_16.save(os.path.join(public_dir, 'favicon-16x16.png'), 'PNG')
    print("[OK] Saved all iPhone and Web icons successfully!")

if __name__ == '__main__':
    main()
